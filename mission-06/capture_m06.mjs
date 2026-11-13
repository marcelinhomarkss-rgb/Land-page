import { spawn } from 'node:child_process';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const OUT = path.join(HERE, 'evidence');
mkdirSync(OUT, { recursive: true });

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTTP_PORT = 5406;
const CDP_PORT = 9236;
const BASE = `http://127.0.0.1:${HTTP_PORT}/mission-06`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let fp = path.join(ROOT, urlPath);
      if (existsSync(fp) && statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
      if (!existsSync(fp) || !statSync(fp).isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      createReadStream(fp).pipe(res);
    });
    srv.listen(HTTP_PORT, '127.0.0.1', () => resolve(srv));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, l) =>
  Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + l)), ms)),
  ]);

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result || {});
        return;
      }
      if (m.method) {
        (this.listeners.get(m.method) || []).forEach((fn) => fn(m.params || {}, m.sessionId));
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await withTimeout(
      new Promise((res, rej) => {
        ws.addEventListener('open', res, { once: true });
        ws.addEventListener('error', rej, { once: true });
      }),
      10000,
      'ws'
    );
    return new CDP(ws);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    this.ws.send(JSON.stringify(msg));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('CDP timeout ' + method));
        }
      }, 30000);
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const l = this.listeners.get(method) || [];
      l.push((p) => resolve(p));
      this.listeners.set(method, l);
    });
  }
}

async function session(browser) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  return {
    send: (m, p = {}) => browser.send(m, p, sessionId),
    once: (m) => browser.once(m),
    listeners: browser.listeners,
    targetId,
  };
}

async function close(browser, s) {
  try {
    await browser.send('Target.closeTarget', { targetId: s.targetId });
  } catch {}
}

async function nav(page, url, waitMs = 1850) {
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  const loaded = page.once('Page.loadEventFired');
  await page.send('Page.navigate', { url });
  await withTimeout(loaded, 20000, url);
  await sleep(waitMs);
}

async function evaljs(page, expression) {
  const r = await page.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}

const METRICS_EXPR = `(() => {
  const de = document.documentElement;
  const q = (s) => document.querySelector(s);
  const ed = q('.editorial'), plate = q('.plate'), cta = q('.primary'), bridge = q('.orbit-bridge');
  const er = ed.getBoundingClientRect(), pr = plate.getBoundingClientRect(), cr = cta.getBoundingClientRect(), br = bridge.getBoundingClientRect();
  const overlapEdPlate = Math.max(0, Math.min(er.right, pr.right) - Math.max(er.left, pr.left)) * Math.max(0, Math.min(er.bottom, pr.bottom) - Math.max(er.top, pr.top));
  const overlapBridgePlate = Math.max(0, Math.min(br.right, pr.right) - Math.max(br.left, pr.left)) * Math.max(0, Math.min(br.bottom, pr.bottom) - Math.max(br.top, pr.top));
  const words = [...document.querySelectorAll('.w')].map((w) => ({
    text: w.textContent,
    color: getComputedStyle(w).color,
    bg: getComputedStyle(w).backgroundColor,
    rect: (() => { const r = w.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), right: +r.right.toFixed(1) }; })(),
    clipped: w.scrollWidth > w.clientWidth + 2 || w.getBoundingClientRect().right > innerWidth - 4
  }));
  const rows = [...document.querySelectorAll('.row')].map((r) => {
    const wr = r.querySelector('.w').getBoundingClientRect();
    const tr = r.querySelector('.tag').getBoundingClientRect();
    return { wordY: +wr.top.toFixed(1), tagY: +tr.top.toFixed(1), sameLine: Math.abs(wr.bottom - tr.bottom) < 40 };
  });
  const trackItems = [...document.querySelectorAll('.track li')].map((li) => ({
    text: li.textContent,
    h: +li.getBoundingClientRect().height.toFixed(1),
    wrapped: li.getBoundingClientRect().height > 38
  }));
  const headingEls = [...document.querySelectorAll('h1, .w, .tag, h2, h3, .brand, summary')];
  const pureBW = headingEls.filter((el) => {
    const c = getComputedStyle(el).color;
    return c === 'rgb(255, 255, 255)' || c === 'rgb(0, 0, 0)';
  }).map((el) => el.tagName + '.' + el.className);

  return {
    theme: de.dataset.theme,
    reduced: de.classList.contains('reduced'),
    playing: document.body.classList.contains('playing'),
    status: q('.scene-status')?.textContent || '',
    overflow: de.scrollWidth > de.clientWidth + 1,
    collision: overlapEdPlate > 4 || overlapBridgePlate > 4,
    wordClipped: words.some((w) => w.clipped),
    trackWrapped: trackItems.some((t) => t.wrapped),
    pureBWHeadings: pureBW,
    ctaAboveFold: cr.bottom <= innerHeight,
    cta: { x: +cr.x.toFixed(1), y: +cr.y.toFixed(1), w: +cr.width.toFixed(1), h: +cr.height.toFixed(1), top: +cr.top.toFixed(1), bottom: +cr.bottom.toFixed(1) },
    panel: { x: +pr.x.toFixed(1), y: +pr.y.toFixed(1), w: +pr.width.toFixed(1), h: +pr.height.toFixed(1), top: +pr.top.toFixed(1), bottom: +pr.bottom.toFixed(1) },
    rows,
    words,
    trackItems,
    performance: q('#qa-evidence')?.textContent ? JSON.parse(q('#qa-evidence').textContent) : null,
    viewport: [innerWidth, innerHeight]
  };
})()`;

const A11Y_AUDIT_EXPR = `(() => {
  function parseRgb(str) {
    const m = str.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    if (!m) return [0, 0, 0, 1];
    return [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1];
  }
  function effectiveBg(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const bg = getComputedStyle(cur).backgroundColor;
      const [r, g, b, a] = parseRgb(bg);
      if (a >= 0.85) return [r, g, b];
      cur = cur.parentElement;
    }
    const rootBg = getComputedStyle(document.body).backgroundColor;
    return parseRgb(rootBg).slice(0, 3);
  }
  function lum([r, g, b]) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  function ratio(fg, bg) {
    const l1 = lum(fg), l2 = lum(bg);
    return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
  }
  const selectors = [
    ['.r1 .w', 3.0],
    ['.r2 .w', 3.0],
    ['.r3 .w', 3.0],
    ['.r1 .tag', 4.5],
    ['.r2 .tag', 4.5],
    ['.r3 .tag', 4.5],
    ['.lead', 4.5],
    ['.primary', 4.5],
    ['.secondary', 4.5],
    ['.orbit-caption', 4.5],
    ['.p-bar strong', 4.5],
    ['.sim', 4.5],
    ['.track [aria-current="step"]', 4.5],
    ['.opp h2', 3.0],
    ['.chips span:first-child', 4.5],
    ['.chips .pending', 4.5],
    ['.ia h3', 4.5],
    ['.ia p', 4.5],
    ['.replay', 4.5],
  ];
  const contrasts = selectors.map(([sel, min]) => {
    const el = document.querySelector(sel);
    const fg = parseRgb(getComputedStyle(el).color).slice(0, 3);
    const bg = effectiveBg(el);
    const r = ratio(fg, bg);
    return { selector: sel, ratio: r, required: min, pass: r >= min, fg: getComputedStyle(el).color, bg: 'rgb(' + bg.join(', ') + ')' };
  });
  const interactive = ['.brand', '.theme', '.primary', '.secondary', '.replay', '#modules summary', '.motion'].map((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    return { selector: sel, w: +r.width.toFixed(1), h: +r.height.toFixed(1), pass44: r.height >= 44 && r.width >= 44 };
  });
  return {
    theme: document.documentElement.dataset.theme,
    contrasts,
    allContrastPass: contrasts.every((c) => c.pass),
    interactive,
    allTouchTargetsPass: interactive.every((i) => i.pass44),
    landmarks: {
      header: !!document.querySelector('header'),
      nav: !!document.querySelector('nav[aria-label]'),
      main: !!document.querySelector('main#content'),
      heroSection: !!document.querySelector('section.hero[aria-labelledby="headline"]'),
      footer: !!document.querySelector('footer'),
      skipLink: !!document.querySelector('a.skip[href="#content"]')
    },
    headings: [...document.querySelectorAll('h1, h2, h3')].map((h) => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 50) }))
  };
})()`;

const INTERACT_EXPR = `(() => {
  const out = {}, de = document.documentElement;
  const t = document.querySelector('.theme');
  const before = de.dataset.theme;
  t.click();
  out.themeToggle = { before, after: de.dataset.theme, changed: de.dataset.theme !== before, ariaPressed: t.getAttribute('aria-pressed') };
  t.click();

  const cta = document.querySelector('.primary');
  cta.focus();
  out.focusCTA = { activeElement: document.activeElement === cta, outlineStyle: getComputedStyle(cta).outlineStyle, outlineWidth: getComputedStyle(cta).outlineWidth };

  const sum = document.querySelector('#modules summary');
  sum.click();
  out.modulesExpand = {
    open: document.querySelector('#modules').open,
    count: [...document.querySelectorAll('#modules .p-rail li')].filter((li) => li.querySelector('code')).length
  };
  sum.click();

  const r = document.querySelector('.replay');
  r.click();
  out.replaySequence = {
    playing: document.body.classList.contains('playing'),
    status: document.querySelector('.scene-status').textContent,
    activeAnimations: document.getAnimations ? document.getAnimations().length : 0
  };

  const m = document.querySelector('.motion');
  m.click();
  out.reducedMotion = {
    reducedClass: de.classList.contains('reduced'),
    ariaPressed: m.getAttribute('aria-pressed'),
    activeAnimations: document.getAnimations ? document.getAnimations().length : 0,
    status: document.querySelector('.scene-status').textContent
  };
  m.click();
  return out;
})()`;

async function waitDebugger() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(150);
  }
  throw new Error('no debugger');
}

const server = await startServer();
const profile = path.join(tmpdir(), 'birthub-m06-chrome-' + Date.now());
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const sizes = {
  desktop: [1440, 900, false],
  tablet: [768, 1024, false],
  mobile: [390, 844, true],
  mobile360: [360, 780, true],
};

const results = {
  metrics: [],
  a11y: [],
  interactions: null,
  lightModeComparison: [],
  motion: null,
};

try {
  const version = await waitDebugger();
  const browser = await CDP.connect(version.webSocketDebuggerUrl);

  // 1. Capture Light Mode Alternatives A and B (Desktop & Mobile)
  for (const alt of ['a', 'b']) {
    for (const [sizeName, [w, h, mobile]] of [
      ['desktop', [1440, 900, false]],
      ['mobile', [390, 844, true]],
    ]) {
      const page = await session(browser);
      await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
      if (mobile) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
      await nav(page, `${BASE}/light-alt-${alt}/index.html?theme=light`);
      const m = await evaljs(page, METRICS_EXPR);
      const a11y = await evaljs(page, A11Y_AUDIT_EXPR);
      const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
      writeFileSync(path.join(OUT, `light-alt-${alt}-${sizeName}.jpg`), Buffer.from(shot.data, 'base64'));
      results.lightModeComparison.push({
        alternative: `Alt ${alt.toUpperCase()}`,
        size: sizeName,
        collision: m.collision,
        overflow: m.overflow,
        ctaAboveFold: m.ctaAboveFold,
        allContrastPass: a11y.allContrastPass,
        words: m.words,
      });
      await close(browser, page);
    }
  }

  // 2. Capture and validate N1 Final Candidate across all viewports and themes
  for (const theme of ['dark', 'light']) {
    for (const [size, [w, h, mobile]] of Object.entries(sizes)) {
      const page = await session(browser);
      await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
      if (mobile) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
      await nav(page, `${BASE}/n1-final/index.html?theme=${theme}`);
      const metrics = await evaljs(page, METRICS_EXPR);
      const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
      writeFileSync(path.join(OUT, `n1-final-${size}-${theme}.jpg`), Buffer.from(shot.data, 'base64'));
      results.metrics.push({ theme, size, ...metrics });
      console.log(
        `[n1-final] ${size} ${theme}: collision=${metrics.collision} overflow=${metrics.overflow} wordClip=${metrics.wordClipped} trackWrap=${metrics.trackWrapped} ctaBottom=${metrics.cta.bottom}/${h}`
      );

      if (size === 'desktop') {
        const a11y = await evaljs(page, A11Y_AUDIT_EXPR);
        results.a11y.push(a11y);
      }

      if (size === 'mobile') {
        await evaljs(page, `document.querySelector('.stagewrap').scrollIntoView({block:'start'});scrollBy(0,-12);'ok'`);
        await sleep(400);
        const ps = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 88 });
        writeFileSync(path.join(OUT, `n1-final-mobile-product-${theme}.jpg`), Buffer.from(ps.data, 'base64'));
      }
      await close(browser, page);
    }
  }

  // 3. Test Interactions (Desktop Dark)
  {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await nav(page, `${BASE}/n1-final/index.html?theme=dark`);
    results.interactions = await evaljs(page, INTERACT_EXPR);
    console.log('[interactions]', JSON.stringify(results.interactions));
    await close(browser, page);
  }

  // 4. Motion Screencast & Filmstrip (Desktop Dark)
  {
    const dir = path.join(OUT, 'motion-n1-final');
    mkdirSync(dir, { recursive: true });
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const frames = [];
    page.listeners.set('Page.screencastFrame', [
      ...(page.listeners.get('Page.screencastFrame') || []),
      (params) => {
        frames.push(params);
        page.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
      },
    ]);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    await page.send('Page.startScreencast', { format: 'jpeg', quality: 78, everyNthFrame: 1 });
    const mloaded = page.once('Page.loadEventFired');
    await page.send('Page.navigate', { url: `${BASE}/n1-final/index.html?theme=dark` });
    await withTimeout(mloaded, 20000, 'motion nav');
    await sleep(2200);
    // Also trigger replay during screencast to capture replay in action
    await evaljs(page, `document.querySelector('.replay').click();'replayed'`);
    await sleep(1900);
    await page.send('Page.stopScreencast').catch(() => {});

    for (let i = 0; i < frames.length; i++) {
      writeFileSync(path.join(dir, `frame-${String(i).padStart(3, '0')}.jpg`), Buffer.from(frames[i].data, 'base64'));
    }

    // Select up to 12 evenly spaced key frames for a clean filmstrip
    const count = Math.min(12, frames.length);
    const picked = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i * (frames.length - 1)) / Math.max(1, count - 1));
      picked.push(idx);
    }
    const cols = 4,
      rows = Math.ceil(picked.length / cols) || 1,
      cellW = 360,
      cellH = 250;
    const html = `<!doctype html><html lang="pt-BR"><head><!-- impeccable-disable overused-font --><meta charset="utf-8"><title>Filmstrip Motion N1 Final</title><style>body{margin:0;background:#0D0D0D;color:#E2E8FF}div{display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:10px;padding:12px;background:#0D0D0D}figure{margin:0;background:#141724;border:1px solid #2E344E;border-radius:8px;overflow:hidden}img{width:${cellW}px;height:${cellH - 28}px;object-fit:cover;display:block}figcaption{background:#141724;color:#E2E8FF;font:500 12px monospace;padding:6px 10px}</style></head><body><div>${picked
      .map(
        (idx, k) =>
          `<figure><img src="frame-${String(idx).padStart(3, '0')}.jpg" alt="Frame ${idx}"><figcaption>Frame #${String(idx).padStart(2, '0')} · Etapa ${k + 1}/${picked.length}</figcaption></figure>`
      )
      .join('')}</div></body></html>`;
    writeFileSync(path.join(dir, 'filmstrip.html'), html);
    await close(browser, page);

    const sheet = await session(browser);
    await sheet.send('Page.enable');
    await sheet.send('Emulation.setDeviceMetricsOverride', {
      width: cols * cellW + 56,
      height: rows * cellH + 40,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const loaded = sheet.once('Page.loadEventFired');
    await sheet.send('Page.navigate', { url: `${BASE}/evidence/motion-n1-final/filmstrip.html` });
    await withTimeout(loaded, 15000, 'filmstrip');
    await sleep(500);
    const fs = await sheet.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, 'motion-n1-final-filmstrip.png'), Buffer.from(fs.data, 'base64'));
    await close(browser, sheet);
    results.motion = { totalFramesCaptured: frames.length, filmstripFrames: picked };
    console.log(`[motion] captured ${frames.length} frames`);
  }

  // 5. Capture Compare Page Screenshot
  {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1850, deviceScaleFactor: 1, mobile: false });
    await nav(page, `${BASE}/compare.html`, 1000);
    const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 86 });
    writeFileSync(path.join(OUT, 'compare-overview.jpg'), Buffer.from(shot.data, 'base64'));
    await close(browser, page);
  }

  await browser.send('Browser.close').catch(() => {});
} finally {
  try {
    chrome.kill('SIGKILL');
  } catch {}
  server.close();
}

writeFileSync(path.join(OUT, 'browser-metrics.json'), JSON.stringify(results.metrics, null, 2));
writeFileSync(path.join(OUT, 'accessibility-audit.json'), JSON.stringify(results.a11y, null, 2));
writeFileSync(path.join(OUT, 'interactions.json'), JSON.stringify(results.interactions, null, 2));
writeFileSync(path.join(OUT, 'light-mode-comparison.json'), JSON.stringify(results.lightModeComparison, null, 2));
writeFileSync(path.join(OUT, 'motion-results.json'), JSON.stringify(results.motion, null, 2));
console.log('ALL CAPTURES AND AUDITS COMPLETED');
