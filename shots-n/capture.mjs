import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'shots-n');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5400';
const DEBUG_PORT = 9223;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout: ${label}`)), ms)),
  ]);
}

async function waitForDebugger(port, tries = 80) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(150);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result || {});
        return;
      }
      if (msg.method) {
        const list = this.listeners.get(msg.method) || [];
        list.forEach((fn) => fn(msg.params || {}, msg.sessionId));
      }
    });
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await withTimeout(new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    }), 10000, 'WebSocket connect');
    return new CDP(ws);
  }
  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    this.ws.send(JSON.stringify(message));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const list = this.listeners.get(method) || [];
      list.push((params) => resolve(params));
      this.listeners.set(method, list);
    });
  }
}

async function newSession(browser, url = 'about:blank') {
  const { targetId } = await browser.send('Target.createTarget', { url });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const client = Object.create(CDP.prototype);
  client.ws = browser.ws;
  client.nextId = browser.nextId;
  client.pending = browser.pending;
  client.listeners = browser.listeners;
  const proxy = {
    send: (method, params = {}) => browser.send(method, params, sessionId),
    once: (method) => browser.once(method),
    listeners: browser.listeners,
    sessionId,
    targetId,
  };
  return proxy;
}

async function closeSession(browser, session) {
  try { await browser.send('Target.closeTarget', { targetId: session.targetId }); } catch {}
}

const METRICS_JS = `(() => {
  const de = document.documentElement;
  const q = (s) => document.querySelector(s);
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), top: +r.top.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1) };
  };
  const cta = [...document.querySelectorAll('a,button')].find((el) => /Agendar demonstração/i.test(el.textContent || ''));
  const secondary = [...document.querySelectorAll('a,button')].find((el) => /Conhecer os 11 módulos/i.test(el.textContent || ''));
  return {
    title: document.title,
    theme: de.getAttribute('data-theme'),
    rm: de.classList.contains('rm'),
    viewport: { w: innerWidth, h: innerHeight },
    scroll: { w: de.scrollWidth, h: de.scrollHeight, clientW: de.clientWidth, clientH: de.clientHeight },
    overflowX: de.scrollWidth > de.clientWidth + 1,
    h1: q('h1')?.textContent?.trim() || '',
    cta: { ...box(cta), text: cta?.textContent?.trim() || '' },
    secondary: { ...box(secondary), text: secondary?.textContent?.trim() || '' },
    fonts: [...document.fonts].map((f) => ({ family: f.family, status: f.status })).slice(0, 12),
  };
})()`;

async function setupPage(browser, spec) {
  const page = await newSession(browser);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: spec.width,
    height: spec.height,
    deviceScaleFactor: 1,
    mobile: spec.width < 700,
  });
  if (spec.width < 700) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const loaded = page.once('Page.loadEventFired');
  await page.send('Page.navigate', { url: spec.url });
  await withTimeout(loaded, 20000, `load ${spec.url}`);
  await sleep(spec.settle || 1400);
  return page;
}

async function captureShot(browser, spec) {
  const page = await setupPage(browser, spec);
  const metrics = await page.send('Runtime.evaluate', { expression: METRICS_JS, returnByValue: true });
  const shot = await page.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUT, `${spec.name}.png`), Buffer.from(shot.data, 'base64'));
  await closeSession(browser, page);
  return metrics.result?.value || null;
}

async function captureMotion(browser, spec) {
  const dir = path.join(OUT, spec.name);
  mkdirSync(dir, { recursive: true });
  const page = await setupPage(browser, { ...spec, settle: 700 });
  const frames = [];
  page.listeners.set('Page.screencastFrame', [...(page.listeners.get('Page.screencastFrame') || []), (params) => {
    frames.push(params);
    page.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
  }]);
  await page.send('Page.startScreencast', { format: 'jpeg', quality: 72, everyNthFrame: 1 });
  await sleep(spec.duration || 5200);
  await page.send('Page.stopScreencast').catch(() => {});
  for (let i = 0; i < frames.length; i++) {
    writeFileSync(path.join(dir, `frame-${String(i).padStart(3, '0')}.jpg`), Buffer.from(frames[i].data, 'base64'));
  }
  const cols = 4;
  const rows = Math.ceil(frames.length / cols) || 1;
  const cellW = Math.round(spec.width / 4);
  const cellH = Math.round((spec.height * cellW) / spec.width + 34);
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#0b0b10;color:#eee;font:12px monospace}.g{display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:8px;padding:8px}figure{margin:0}img{width:${cellW}px;height:${cellH - 34}px;object-fit:cover;display:block;background:#111}figcaption{padding:5px 2px;color:#9aa}</style><div class="g">${frames.map((_, i) => `<figure><img src="frame-${String(i).padStart(3, '0')}.jpg"><figcaption>${String(i).padStart(3, '0')}</figcaption></figure>`).join('')}</div>`;
  writeFileSync(path.join(dir, 'filmstrip.html'), html);
  await closeSession(browser, page);

  const sheetW = cols * cellW + (cols + 1) * 8;
  const sheetH = rows * cellH + (rows + 1) * 8;
  const sheet = await setupPage(browser, { name: `${spec.name}-filmstrip`, url: `${BASE}/shots-n/${spec.name}/filmstrip.html`, width: sheetW, height: sheetH, settle: 900 });
  const shot = await sheet.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUT, `${spec.name}-filmstrip.png`), Buffer.from(shot.data, 'base64'));
  await closeSession(browser, sheet);
  return { frames: frames.length, dir: path.relative(ROOT, dir) };
}

const shots = [
  { name: 'n1-desktop-dark', url: `${BASE}/concept-n1/index.html?theme=dark&static=1`, width: 1440, height: 900 },
  { name: 'n1-desktop-light', url: `${BASE}/concept-n1/index.html?theme=light&static=1`, width: 1440, height: 900 },
  { name: 'n1-mobile-dark', url: `${BASE}/concept-n1/index.html?theme=dark&static=1`, width: 390, height: 844 },
  { name: 'n1-mobile-light', url: `${BASE}/concept-n1/index.html?theme=light&static=1`, width: 390, height: 844 },
  { name: 'n2-desktop-dark', url: `${BASE}/concept-n2/index.html?theme=dark&static=1`, width: 1440, height: 900 },
  { name: 'n2-desktop-light', url: `${BASE}/concept-n2/index.html?theme=light&static=1`, width: 1440, height: 900 },
  { name: 'n2-mobile-dark', url: `${BASE}/concept-n2/index.html?theme=dark&static=1`, width: 390, height: 844 },
  { name: 'n2-mobile-light', url: `${BASE}/concept-n2/index.html?theme=light&static=1`, width: 390, height: 844 },
  { name: 'n3-desktop-dark', url: `${BASE}/concept-n3/index.html?theme=dark&static=1`, width: 1440, height: 900 },
  { name: 'n3-desktop-light', url: `${BASE}/concept-n3/index.html?theme=light&static=1`, width: 1440, height: 900 },
  { name: 'n3-mobile-dark', url: `${BASE}/concept-n3/index.html?theme=dark&static=1`, width: 390, height: 844 },
  { name: 'n3-mobile-light', url: `${BASE}/concept-n3/index.html?theme=light&static=1`, width: 390, height: 844 },
  { name: 'n1-tablet-dark', url: `${BASE}/concept-n1/index.html?theme=dark&static=1`, width: 768, height: 1024 },
  { name: 'n2-tablet-dark', url: `${BASE}/concept-n2/index.html?theme=dark&static=1`, width: 768, height: 1024 },
  { name: 'n3-tablet-dark', url: `${BASE}/concept-n3/index.html?theme=dark&static=1`, width: 768, height: 1024 },
];

const motion = [
  { name: 'n1-motion-desktop-dark', url: `${BASE}/concept-n1/index.html?theme=dark`, width: 1440, height: 900, duration: 5200 },
  { name: 'n2-motion-desktop-dark', url: `${BASE}/concept-n2/index.html?theme=dark`, width: 1440, height: 900, duration: 5600 },
  { name: 'n3-motion-desktop-dark', url: `${BASE}/concept-n3/index.html?theme=dark`, width: 1440, height: 900, duration: 5600 },
  { name: 'n1-motion-mobile-dark', url: `${BASE}/concept-n1/index.html?theme=dark`, width: 390, height: 844, duration: 5200 },
  { name: 'n2-motion-mobile-dark', url: `${BASE}/concept-n2/index.html?theme=dark`, width: 390, height: 844, duration: 5200 },
  { name: 'n3-motion-mobile-dark', url: `${BASE}/concept-n3/index.html?theme=dark`, width: 390, height: 844, duration: 5200 },
];

mkdirSync(OUT, { recursive: true });
const profile = path.join(tmpdir(), 'birthhub-hero-lab-chrome');
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--remote-debugging-port=${DEBUG_PORT}`,
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: 'ignore' });

try {
  const version = await waitForDebugger(DEBUG_PORT);
  const browser = await CDP.connect(version.webSocketDebuggerUrl);
  const metrics = [];
  for (const spec of shots) {
    process.stdout.write(`shot ${spec.name}\n`);
    metrics.push({ spec, metrics: await captureShot(browser, spec) });
  }
  const motionResults = [];
  for (const spec of motion) {
    process.stdout.write(`motion ${spec.name}\n`);
    motionResults.push({ spec, result: await captureMotion(browser, spec) });
  }
  writeFileSync(path.join(OUT, 'metrics.json'), JSON.stringify({ shots: metrics, motion: motionResults }, null, 2));
  await browser.send('Browser.close').catch(() => {});
} finally {
  try { chrome.kill('SIGKILL'); } catch {}
}
