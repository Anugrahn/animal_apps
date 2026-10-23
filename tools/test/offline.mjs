// Loads the app once with the service worker on, waits for it to store
// everything, then goes offline and opens new lessons from the cache.
//   node offline.mjs        (app served on :8765)
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/index.html?go=home&friend=0');
// wait until the worker controls the page and the cache holds the new files
const t0 = Date.now();
let stored = 0;
while (Date.now() - t0 < 240000) {
  stored = await p.evaluate(async () => {
    const keys = await caches.keys();
    const v = keys.filter(k => k.startsWith('af-'))[0];
    if (!v || !navigator.serviceWorker.controller) return 0;
    const c = await caches.open(v);
    const need = ['engines/lesson.js', 'content/phonics.js', 'content/math.js', 'content/english.js', 'content/bahasa.js'];
    const have = await Promise.all(need.map(f => c.match(f)));
    return have.every(Boolean) ? (await c.keys()).length : 0;
  }).catch(() => 0);
  if (stored) break;
  if (Date.now() - t0 > 3000 && !(await p.evaluate(() => !!navigator.serviceWorker.controller))) await p.reload();
  await p.waitForTimeout(2000);
}
console.log(stored ? `cached ${stored} files in ${Math.round((Date.now() - t0) / 1000)}s` : 'NOT CACHED');
await ctx.setOffline(true);
for (const link of ['play:phonics:ph1-1', 'play:math:m3-5', 'play:bahasa:bi2-1', 'play:english:en1-1', 'map:math:2']) {
  await p.goto(`http://localhost:8765/index.html?go=${link}&friend=0`).catch(e => errs.push('goto ' + e.message));
  await p.waitForTimeout(1800);
  const ok = await p.evaluate(() => !!(window.AF && AF.registry && AF.registry.length >= 13 && document.querySelector('.screen.active'))).catch(() => false);
  console.log(`${ok ? 'ok  ' : 'FAIL'} offline ${link}`);
}
console.log(errs.join('\n') || 'no errors');
await b.close();
