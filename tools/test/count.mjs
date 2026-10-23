// Do the things to count fit? Opens every Math choose / intro step at four
// screen sizes and reports a picture whose things are cut off or off screen,
// and the median size of a thing next to an answer card.
//   node count.mjs [--only m5-6,m5-2] [--out dir]      (screenshots of the bad ones go to --out)
import { chromium } from 'playwright';
import fs from 'node:fs';

const arg = (k) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : null; };
const ONLY = arg('only') ? arg('only').split(',') : null, OUT = arg('out');
const BASE = process.env.BASE || 'http://localhost:8765/';
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--mute-audio'] });
const rows = [];
for (const [w, h] of [[390, 844], [844, 390], [1024, 768], [360, 640]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', serviceWorkers: 'block' })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + 'index.html?go=home&friend=0');
  await p.waitForTimeout(800);
  const steps = await p.evaluate((only) => AF.module('math').levels.filter(l => l.steps && (!only || only.includes(l.id)))
    .flatMap(l => l.steps.map((s, k) => ['choose', 'intro'].includes(s.type) ? [l.id, k, s.type] : null)).filter(Boolean), ONLY);
  for (const [id, k, type] of steps) {
    await p.evaluate(([id, k]) => {
      document.getElementById('result').hidden = true;
      const mod = AF.module('math'), lv = mod.levels.find(l => l.id === id);
      AF.App.startLevel(mod, Object.assign({ id: 't' + id + k + Math.random(), title: lv.title, tier: lv.tier }, lv.steps[k]), 0);
    }, [id, k]);
    await p.waitForTimeout(type === 'intro' ? 600 : 450);
    await p.evaluate(() => { const r = document.getElementById('ready'); if (r && !r.hidden) r.click(); });
    await p.waitForTimeout(700);
    for (let card = 0; card < (type === 'intro' ? 4 : 1); card++) {
      const m = await p.evaluate(() => {
        const vis = e => e && e.getClientRects().length;
        const show = [...document.querySelectorAll('.screen.active .show, .screen.active .intro-show')].find(vis);
        if (!show || !show.querySelector('.group')) return null;
        const r = show.getBoundingClientRect(), its = [...show.querySelectorAll('.group > i')].map(i => i.getBoundingClientRect());
        const face = [...document.querySelectorAll('.screen.active .opt-face')].find(vis);
        return { n: its.length, item: Math.round(its[0] ? its[0].height : 0), face: face ? Math.round(face.getBoundingClientRect().height) : 0,
          cut: its.some(q => q.bottom > r.bottom + 1 || q.top < r.top - 1 || q.right > r.right + 1 || q.left < r.left - 1) || r.bottom > innerHeight || r.right > innerWidth };
      });
      if (m) {
        rows.push(Object.assign({ size: `${w}x${h}`, id, k, card }, m));
        if (m.cut && OUT) await p.screenshot({ path: `${OUT}/${w}x${h}-${id}-${k}-${card}.png` });
      }
      if (type !== 'intro') break;
      const go = await p.evaluate(() => { const g = [...document.querySelectorAll('.screen.active .intro-go')].find(e => e.getClientRects().length); if (g) g.click(); return !!g; });
      if (!go) break;
      await p.waitForTimeout(500);
    }
  }
  if (errs.length) console.log(`${w}x${h} page errors:`, [...new Set(errs)].join(' | '));
  await p.context().close();
}
await b.close();
const bad = rows.filter(r => r.cut);
for (const r of bad) console.log(`cut  ${r.size} ${r.id} step ${r.k}${r.card ? ' card ' + r.card : ''}: ${r.n} things, ${r.item}px each`);
const md = (a) => a.sort((x, y) => x - y)[a.length >> 1];
for (const s of [...new Set(rows.map(r => r.size))]) {
  const mine = rows.filter(r => r.size === s);
  console.log(`${s}: a thing ${md(mine.map(r => r.item))}px, an answer card ${md(mine.filter(r => r.face).map(r => r.face))}px`);
}
console.log(`${rows.length} pictures, ${bad.length} cut off`);
