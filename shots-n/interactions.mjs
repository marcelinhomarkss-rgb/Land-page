import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'interactions.json');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5400';
const PORT = 9224;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${label}`)), ms))]);

class CDP {
  constructor(ws) { this.ws = ws; this.nextId = 0; this.pending = new Map(); this.listeners = new Map();
    ws.addEventListener('message', (e) => { const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result || {}); return; }
      if (m.method) (this.listeners.get(m.method) || []).forEach((fn) => fn(m.params || {}, m.sessionId)); }); }
  static async connect(url) { const ws = new WebSocket(url); await withTimeout(new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); }), 10000, 'ws'); return new CDP(ws); }
  send(method, params = {}, sessionId) { const id = ++this.nextId; const msg = { id, method, params }; if (sessionId) msg.sessionId = sessionId; this.ws.send(JSON.stringify(msg));
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); setTimeout(() => { if (this.pending.has(id)) { this.pending.delete(id); reject(new Error(`CDP timeout ${method}`)); } }, 30000); }); }
  once(method) { return new Promise((resolve) => { const l = this.listeners.get(method) || []; l.push((p) => resolve(p)); this.listeners.set(method, l); }); }
}
async function session(browser, url = 'about:blank') {
  const { targetId } = await browser.send('Target.createTarget', { url });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  return { send: (m, p = {}) => browser.send(m, p, sessionId), once: (m) => browser.once(m), targetId };
}
async function close(browser, s) { try { await browser.send('Target.closeTarget', { targetId: s.targetId }); } catch {} }
async function nav(page, url) { await page.send('Page.enable'); await page.send('Runtime.enable'); const loaded = page.once('Page.loadEventFired'); await page.send('Page.navigate', { url }); await withTimeout(loaded, 20000, url); await sleep(1500); }
async function evaljs(page, expression) { const r = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }

const INTERACT = `(async () => {
  const de=document.documentElement, out={};
  out.initialTheme=de.getAttribute('data-theme'); out.rmStatic=de.classList.contains('rm');
  const cta=document.querySelector('[data-demo-cta]'); if(cta){cta.click(); const t=document.querySelector('.toast'); out.toast={on:t.classList.contains('on'), text:t.textContent};} else out.toast=null;
  const tog=document.querySelector('[data-theme-toggle]'); if(tog){const before=de.getAttribute('data-theme'); tog.click(); out.themeAfterClick=de.getAttribute('data-theme'); out.themeChanged=de.getAttribute('data-theme')!==before; tog.click(); out.themeRestored=de.getAttribute('data-theme')===before;} else out.theme=null;
  const btn=document.querySelector('.btn'); if(btn){btn.focus(); out.focused=document.activeElement===btn; const cs=getComputedStyle(btn); out.focusStyle={outlineStyle:cs.outlineStyle, outlineWidth:cs.outlineWidth, boxShadow:cs.boxShadow.slice(0,80)};} else out.focused=false;
  out.animations=document.getAnimations?document.getAnimations().length:null;
  out.overflowX=de.scrollWidth>de.clientWidth+1;
  const plate=document.querySelector('.plate-in')||document.querySelector('.plate')||document.querySelector('figure');
  if(plate){const r=plate.getBoundingClientRect(); out.plate={top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1),left:+r.left.toFixed(1),right:+r.right.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1)};} else out.plate=null;
  const hero=document.querySelector('.hero'); if(hero){const r=hero.getBoundingClientRect(); out.hero={top:+r.top.toFixed(1),bottom:+r.bottom.toFixed(1)};} else out.hero=null;
  const p=document.querySelector('.page')||de, before=getComputedStyle(p);
  const px0=before.getPropertyValue('--px'), sp0=before.getPropertyValue('--sp');
  window.dispatchEvent(new PointerEvent('pointermove',{clientX:innerWidth*.82,clientY:innerHeight*.18,bubbles:true}));
  scrollTo(0,Math.min(360,Math.max(0,de.scrollHeight-innerHeight)));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const after=getComputedStyle(p);
  out.parallax={pxBefore:px0,pxAfter:after.getPropertyValue('--px'),spBefore:sp0,spAfter:after.getPropertyValue('--sp'),scrolled:scrollY>0,pointerFine:matchMedia('(pointer:fine)').matches};
  scrollTo(0,0);
  return out;
})()`;

const RM = `(() => ({rm:document.documentElement.classList.contains('rm'), animations:document.getAnimations?document.getAnimations().length:null, theme:document.documentElement.getAttribute('data-theme')}))()`;

async function waitDebugger() { for (let i = 0; i < 80; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return await r.json(); } catch {} await sleep(150); } throw new Error('no debugger'); }
const profile = path.join(tmpdir(), 'birthhub-interactions-chrome');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const results = [];
try {
  const version = await waitDebugger();
  const browser = await CDP.connect(version.webSocketDebuggerUrl);
  for (const name of ['n1', 'n2', 'n3']) {
    const page = await session(browser);
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await nav(page, `${BASE}/concept-${name}/index.html?theme=dark`);
    const interact = await evaljs(page, INTERACT);
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await nav(page, `${BASE}/concept-${name}/index.html?theme=dark`);
    const reduced = await evaljs(page, RM);
    await close(browser, page);
    results.push({ name, interact, reducedMotion: reduced });
    console.log(name, JSON.stringify({ toast: interact.toast?.on, themeChanged: interact.themeChanged, focused: interact.focused, overflowX: interact.overflowX, rmReduced: reduced.rm }));
  }
  await browser.send('Browser.close').catch(() => {});
} finally { try { chrome.kill('SIGKILL'); } catch {} }
writeFileSync(OUT, JSON.stringify(results, null, 2));
