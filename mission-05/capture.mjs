import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'evidence');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5400/mission-05';
const PORT = 9225;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, l) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout ' + l)), ms))]);

class CDP {
  constructor(ws) { this.ws = ws; this.nextId = 0; this.pending = new Map(); this.listeners = new Map();
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result || {}); return; }
      if (m.method) (this.listeners.get(m.method) || []).forEach((fn) => fn(m.params || {}, m.sessionId)); }); }
  static async connect(url) { const ws = new WebSocket(url); await withTimeout(new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); }), 10000, 'ws'); return new CDP(ws); }
  send(method, params = {}, sessionId) { const id = ++this.nextId; const msg = { id, method, params }; if (sessionId) msg.sessionId = sessionId; this.ws.send(JSON.stringify(msg));
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error('CDP timeout ' + method)); } }, 30000); }); }
  once(method) { return new Promise((resolve) => { const l = this.listeners.get(method) || []; l.push((p) => resolve(p)); this.listeners.set(method, l); }); }
}
async function session(browser) { const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' }); const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true }); return { send: (m, p = {}) => browser.send(m, p, sessionId), once: (m) => browser.once(m), listeners: browser.listeners, targetId }; }
async function close(browser, s) { try { await browser.send('Target.closeTarget', { targetId: s.targetId }); } catch {} }
async function nav(page, url) { await page.send('Page.enable'); await page.send('Runtime.enable'); const loaded = page.once('Page.loadEventFired'); await page.send('Page.navigate', { url }); await withTimeout(loaded, 20000, url); await sleep(1600); }
async function evaljs(page, expression) { const r = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }
const box = `((el)=>{if(!el)return null;const r=el.getBoundingClientRect();return{x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),top:+r.top.toFixed(1),right:+r.right.toFixed(1),bottom:+r.bottom.toFixed(1)}})`;

const METRICS = `(() => {
  const de=document.documentElement, q=(s)=>document.querySelector(s);
  const ed=q('.editorial'), plate=q('.plate'), cta=q('.primary');
  const er=ed.getBoundingClientRect(), pr=plate.getBoundingClientRect(), cr=cta.getBoundingClientRect();
  const overlap=Math.max(0,Math.min(er.right,pr.right)-Math.max(er.left,pr.left))*Math.max(0,Math.min(er.bottom,pr.bottom)-Math.max(er.top,pr.top));
  const words=[...document.querySelectorAll('.w')].map(w=>getComputedStyle(w).color);
  return {
    theme:de.dataset.theme, reduced:de.classList.contains('reduced'), playing:document.body.classList.contains('playing'),
    animations:document.getAnimations?document.getAnimations().length:null,
    status:q('.scene-status')?.textContent||'',
    overflow:de.scrollWidth>de.clientWidth+1,
    collision:overlap>4,
    cta:{x:+cr.x.toFixed(1),y:+cr.y.toFixed(1),w:+cr.width.toFixed(1),h:+cr.height.toFixed(1),top:+cr.top.toFixed(1),bottom:+cr.bottom.toFixed(1)},
    headingColors:words,
    panel:{x:+pr.x.toFixed(1),y:+pr.y.toFixed(1),w:+pr.width.toFixed(1),h:+pr.height.toFixed(1),top:+pr.top.toFixed(1),bottom:+pr.bottom.toFixed(1)},
    performance:q('#qa-evidence')?.textContent||'',
    viewport:[innerWidth,innerHeight],
  };
})()`;

const INTERACT = `(() => {
  const out={},de=document.documentElement;
  const t=document.querySelector('.theme'); const before=de.dataset.theme; t.click(); out.theme={before,after:de.dataset.theme,changed:de.dataset.theme!==before}; t.click();
  const cta=document.querySelector('.primary'); cta.focus();
  out.focusVisible=getComputedStyle(cta).outlineStyle;
  const sum=document.querySelector('#modules summary'); sum.click(); out.modules={open:document.querySelector('#modules').open,count:[...document.querySelectorAll('#modules .p-rail li')].filter(li=>li.querySelector('code')).length};
  const r=document.querySelector('.replay'); r.click(); out.replay={playing:document.body.classList.contains('playing'),status:document.querySelector('.scene-status').textContent};
  const m=document.querySelector('.motion'); m.click(); out.reduced={cls:de.classList.contains('reduced'),animations:document.getAnimations?document.getAnimations().length:null,status:document.querySelector('.scene-status').textContent}; m.click();
  return out;
})()`;

async function waitDebugger() { for (let i = 0; i < 80; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return await r.json(); } catch {} await sleep(150); } throw new Error('no debugger'); }

const sizes = { desktop: [1440, 900, false], tablet: [768, 1024, false], mobile: [390, 844, true] };
const results = { metrics: [], interactions: [], motion: [] };
const profile = path.join(tmpdir(), 'birthub-m05-chrome');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
try {
  const version = await waitDebugger();
  const browser = await CDP.connect(version.webSocketDebuggerUrl);
  for (const n of [1, 2, 3]) for (const theme of ['dark', 'light']) for (const [size, [w, h, mobile]] of Object.entries(sizes)) {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
    if (mobile) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await nav(page, `${BASE}/n${n}/index.html?theme=${theme}`);
    const metrics = await evaljs(page, METRICS);
    const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    writeFileSync(path.join(OUT, `n${n}-${size}-${theme}.jpg`), Buffer.from(shot.data, 'base64'));
    results.metrics.push({ n, theme, size, ...metrics });
    console.log(`shot n${n} ${size} ${theme} collision=${metrics.collision} overflow=${metrics.overflow}`);
    if (size === 'mobile' && theme === 'light') {
      await evaljs(page, `document.querySelector('.plate').scrollIntoView({block:'start'});scrollBy(0,-70);'ok'`);
      await sleep(500);
      const ps = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
      writeFileSync(path.join(OUT, `n${n}-mobile-product-light.jpg`), Buffer.from(ps.data, 'base64'));
    }
    await close(browser, page);
  }
  // product section on mobile dark too (extra evidence)
  for (const n of [1, 2, 3]) {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await page.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await nav(page, `${BASE}/n${n}/index.html?theme=dark`);
    await evaljs(page, `document.querySelector('.plate').scrollIntoView({block:'start'});scrollBy(0,-70);'ok'`);
    await sleep(500);
    const ps = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    writeFileSync(path.join(OUT, `n${n}-mobile-product-dark.jpg`), Buffer.from(ps.data, 'base64'));
    await close(browser, page);
  }
  // interactions (desktop dark)
  for (const n of [1, 2, 3]) {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await nav(page, `${BASE}/n${n}/index.html?theme=dark`);
    const inter = await evaljs(page, INTERACT);
    results.interactions.push({ n, ...inter });
    console.log(`interactions n${n}`, JSON.stringify({ theme: inter.theme?.changed, modules: inter.modules?.count, replay: inter.replay?.playing, reduced: inter.reduced?.cls }));
    await close(browser, page);
  }
  // motion screencast: entrance of each proposal, desktop dark
  for (const n of [1, 2, 3]) {
    const dir = path.join(OUT, `motion-n${n}`);
    mkdirSync(dir, { recursive: true });
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const frames = [];
    page.listeners.set('Page.screencastFrame', [...(page.listeners.get('Page.screencastFrame') || []), (params) => { frames.push(params); page.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {}); }]);
    await page.send('Page.enable'); await page.send('Runtime.enable');
    const mloaded = page.once('Page.loadEventFired');
    await page.send('Page.navigate', { url: `${BASE}/n${n}/index.html?theme=dark` });
    await withTimeout(mloaded, 20000, 'motion nav');
    await page.send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 });
    await sleep(3600);
    await page.send('Page.stopScreencast').catch(() => {});
    for (let i = 0; i < frames.length; i++) writeFileSync(path.join(dir, `frame-${String(i).padStart(3, '0')}.jpg`), Buffer.from(frames[i].data, 'base64'));
    const cols = 4, rows = Math.ceil(frames.length / cols) || 1, cellW = 360, cellH = 264;
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#0b0b10}div{display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:8px;padding:8px}figure{margin:0}img{width:${cellW}px;height:${cellH}px;object-fit:cover;display:block}figcaption{color:#9aa;font:11px monospace;padding:4px 2px}</style><div>${frames.map((_, i) => `<figure><img src="frame-${String(i).padStart(3, '0')}.jpg"><figcaption>${i}</figcaption></figure>`).join('')}</div>`;
    writeFileSync(path.join(dir, 'filmstrip.html'), html);
    await close(browser, page);
    const sheet = await session(browser);
    await sheet.send('Page.enable');
    await sheet.send('Emulation.setDeviceMetricsOverride', { width: cols * cellW + 40, height: rows * (cellH + 26) + 16, deviceScaleFactor: 1, mobile: false });
    const loaded = sheet.once('Page.loadEventFired');
    await sheet.send('Page.navigate', { url: `http://localhost:5400/mission-05/evidence/motion-n${n}/filmstrip.html` });
    await withTimeout(loaded, 15000, 'filmstrip');
    await sleep(600);
    const fs = await sheet.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, `motion-n${n}-filmstrip.png`), Buffer.from(fs.data, 'base64'));
    await close(browser, sheet);
    results.motion.push({ n, frames: frames.length });
    console.log(`motion n${n}: ${frames.length} frames`);
  }
  await browser.send('Browser.close').catch(() => {});
} finally { try { chrome.kill('SIGKILL'); } catch {} }
writeFileSync(path.join(OUT, 'browser-metrics.json'), JSON.stringify(results.metrics, null, 1));
writeFileSync(path.join(OUT, 'interactions.json'), JSON.stringify(results.interactions.flatMap(x => [
  { n: x.n, test: 'theme click', theme: x.theme?.after, changed: x.theme?.changed },
  { n: x.n, test: 'focus CTA', outline: x.focusVisible },
  { n: x.n, test: 'modules keyboard', open: x.modules?.open, count: x.modules?.count },
  { n: x.n, test: 'replay sequence', playing: x.replay?.playing, status: x.replay?.status },
  { n: x.n, test: 'reduced motion interaction', state: x.reduced?.status, animation: x.reduced?.cls ? 'none' : 'running', animations: x.reduced?.animations },
]), null, 1));
writeFileSync(path.join(OUT, 'motion-results.json'), JSON.stringify(results.motion, null, 1));
console.log('DONE');
