// Plays every level of the given subjects to its result screen, like a child
// who taps everything: page errors and levels that never finish are reported.
//   node play.mjs phonics math [--workers 6] [--ms 240000] [--only m3-5,m4-6]
import { chromium } from 'playwright';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const WORKERS = +opt('--workers', 6), LEVEL_MS = +opt('--ms', 240000), ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
const subjects = args;
const BASE = process.env.BASE || 'http://localhost:8765/';

async function page(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: false, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => p.errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console: ' + m.text()); });
  await p.goto(BASE + 'index.html?go=home&friend=0');
  await p.waitForTimeout(900);
  await p.evaluate(() => { AF.Profile.setSetting('speech', 'tap'); AF.Profile.setSetting('open', true); });
  return { ctx, p };
}

const browser = await chromium.launch({ args: ['--mute-audio'] });
const { ctx: c0, p: p0 } = await page(browser);
let jobs = await p0.evaluate((subs) => AF.registry.filter(m => !subs.length || subs.indexOf(m.id) >= 0)
  .flatMap(m => m.levels.map((l, i) => ({ m: m.id, i, id: l.id, soon: !!l.soon }))), subjects);
jobs = jobs.filter(j => !j.soon && (!ONLY.length || ONLY.indexOf(j.id) >= 0));
await c0.close();
console.log(`${jobs.length} levels`);

const results = [];
let next = 0;
await Promise.all(Array.from({ length: WORKERS }, async () => {
  let { ctx, p } = await page(browser);
  while (next < jobs.length) {
    const j = jobs[next++];
    const t0 = Date.now();
    p.errs.length = 0;
    let res = null, taps = 0;
    try {
      await p.evaluate(([m, i]) => {
        window.__res = null;
        const o = AF.App.finishLevel;
        const L = AF.Levels;
        if (!L.__spy) { const show = L.showResult; L.showResult = function (opts) { window.__res = opts.stars; return show.apply(this, arguments); }; L.__spy = 1; }
        document.getElementById('result').hidden = true;
        const mod = AF.module(m); AF.App.startLevel(mod, mod.levels[i], i);
      }, [j.m, j.i]);
      while (Date.now() - t0 < LEVEL_MS) {
        res = await p.evaluate(() => window.__res);
        if (res != null) break;
        // what is on the screen decides what a child would do
        const what = await p.evaluate(() => {
          const q = (s) => document.querySelector(s);
          const vis = (el) => el && el.getBoundingClientRect().width > 4 && !el.hidden && getComputedStyle(el).visibility !== 'hidden';
          const at = (el) => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
          const card = q('#play-host .step-card'); if (vis(card)) return { tap: at(card) };
          const ready = q('#ready'); if (vis(ready)) return { tap: at(ready) };
          if (q('#play-host .stage-trace')) return { key: 'Space' };
          const go = q('#play-host .intro-go'); if (vis(go)) return { tap: at(go), wait: 250 };
          const nextPage = q('#play-host .story [data-next]'); if (vis(nextPage)) return { tap: at(nextPage), wait: 300 };
          const done = q('#play-host [data-done]'); if (vis(done)) return { tap: at(done) };
          const ok = q('#play-host [data-ok]'); if (vis(ok)) return { tap: at(ok) };
          // in a maze, ask for the way and take one step along it (a child who uses the hint)
          if (q('#play-host .stage-maze')) {
            const h = q('#play-host [data-hint]'); if (h) h.click();
            const me = q('#play-host .maze-me');
            const trail = [...document.querySelectorAll('#play-host .trail')].sort((x, y) => +x.style.getPropertyValue('--i') - +y.style.getPropertyValue('--i'));
            if (me && trail.length) {
              const a = at(me), t = at(trail[0]), dx = t[0] - a[0], dy = t[1] - a[1];
              return { key: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'), wait: 260 };
            }
          }
          // in the coding game, ask for help and press what lights up
          if (q('#play-host .stage-code')) {
            const h = q('#play-host [data-hint]'); if (h) h.click();
            const lit = q('#play-host .hintme');
            if (lit) return { tap: at(lit), wait: 450 };
          }
          if (q('#play-host .stage-maze') || q('#play-host .stage-code')) {
            const pads = [...document.querySelectorAll('#play-host .pad, #play-host .pad-hint, #play-host .code-go, #play-host [data-go], #play-host .code-btn')].filter(vis);
            if (pads.length) return { tap: at(pads[Math.floor(Math.random() * pads.length)]), key: Math.random() < 0.5 ? ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(Math.random() * 4)] : null };
          }
          const els = [...document.querySelectorAll('#play-host button, #play-host .pop-b')].filter(e => vis(e) && !e.disabled && !e.classList.contains('used') && !e.classList.contains('dimmed') && !e.hasAttribute('data-prev') && !e.hasAttribute('data-say') && !e.hasAttribute('data-hear') && !e.hasAttribute('data-replay'));
          if (!els.length) return { idle: true };
          return { tap: at(els[Math.floor(Math.random() * els.length)]) };
        });
        if (what.key) { for (let k = 0; k < (what.key === 'Space' ? 4 : 1); k++) await p.keyboard.press(what.key); }
        if (what.tap) { await p.mouse.click(what.tap[0], what.tap[1]); taps++; }
        await p.waitForTimeout(what.wait || (what.idle ? 400 : 160));
      }
    } catch (e) { p.errs.push('bot: ' + e.message); }
    const r = { level: `${j.m}/${j.id}`, stars: res, s: Math.round((Date.now() - t0) / 1000), taps, errs: p.errs.slice() };
    results.push(r);
    console.log(`${r.stars == null ? 'STUCK' : 'done '} ${r.level.padEnd(18)} ${String(r.stars ?? '-')}★ ${r.s}s ${r.taps} taps${r.errs.length ? '  ERR ' + r.errs.join(' | ') : ''}`);
    if (r.stars == null || r.errs.length) { await ctx.close().catch(() => {}); ({ ctx, p } = await page(browser)); }
  }
  await ctx.close();
}));
await browser.close();
const stuck = results.filter(r => r.stars == null), bad = results.filter(r => r.errs.length);
console.log(`\n${results.length} played, ${stuck.length} stuck, ${bad.length} with errors`);
stuck.forEach(r => console.log('  stuck: ' + r.level));
bad.forEach(r => console.log('  errors: ' + r.level + ' ' + r.errs.join(' | ')));
