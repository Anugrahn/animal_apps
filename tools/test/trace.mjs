// Tries the tracing game like a child would: a wobbly finger along the
// line, a finger that jumps straight to the end, a lifted finger.
//   node trace.mjs [out-dir]      (app served on :8765)
import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = process.argv[2];
if (OUT) fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });   // motion on: the demo runs
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/index.html?go=home&friend=0');
await p.waitForTimeout(900);

async function start(level) {
  await p.evaluate((lv) => {
    document.getElementById('result').hidden = true;      // (the last level's result sheet)
    const mod = AF.module('phonics');
    AF.App.startLevel(mod, Object.assign({ id: 'tr' + Math.random(), title: 'Trace', tier: 0 }, lv), 0);
  }, level);
}
/* screen points along stroke k of the glyph on the board, with some wobble */
async function strokePoints(k, wobble, every) {
  return p.evaluate(([k, wobble, every]) => {
    const svg = document.querySelector('.tr-svg');
    const beds = svg.querySelectorAll('.tr-bed');
    const path = beds[k], len = path.getTotalLength(), m = svg.getScreenCTM(), out = [];
    for (let L = 0; L <= len; L += every) {
      const q = path.getPointAtLength(L), pt = svg.createSVGPoint();
      pt.x = q.x + (Math.random() - 0.5) * wobble; pt.y = q.y + (Math.random() - 0.5) * wobble;
      const s = pt.matrixTransform(m);
      out.push([s.x, s.y]);
    }
    const e = path.getPointAtLength(len), pe = svg.createSVGPoint(); pe.x = e.x; pe.y = e.y;
    const se = pe.matrixTransform(m); out.push([se.x, se.y]);
    return out;
  }, [k, wobble, every]);
}
const state = () => p.evaluate(() => {
  const svg = document.querySelector('.tr-svg');
  return { cls: svg ? svg.getAttribute('class') : 'none', strokes: svg ? svg.querySelectorAll('.tr-bed').length : 0,
    full: svg ? svg.querySelectorAll('.tr-ink.full').length : 0, round: document.querySelectorAll('.play-dots i.done').length,
    cap: (document.querySelector('.tr-cap') || {}).textContent };
});
async function draw(k, wobble, every, delay) {
  const pts = await strokePoints(k, wobble, every);
  await p.mouse.move(pts[0][0], pts[0][1]);
  await p.mouse.down();
  for (const q of pts) { await p.mouse.move(q[0], q[1], { steps: 2 }); await p.waitForTimeout(delay); }
  await p.waitForTimeout(250);
  await p.mouse.up();
}

// 1. letter a: the demo, then a wobbly finger along both strokes
await start({ type: 'trace', kind: 'letter', set: ['a', 's'], ordered: true, rounds: 2 });
await p.waitForTimeout(2600);                             // (after the ready card)
if (OUT) await p.screenshot({ path: `${OUT}/1-demo.png` });
console.log('during the demo:', JSON.stringify(await state()));
await p.waitForTimeout(3500);
if (OUT) await p.screenshot({ path: `${OUT}/2-ready.png` });
console.log('after the demo:', JSON.stringify(await state()));

// 2. a finger that jumps to the end of stroke 1 must not finish it
{
  const pts = await strokePoints(0, 0, 4);
  const end = pts[pts.length - 1];
  await p.mouse.move(end[0], end[1]); await p.mouse.down(); await p.mouse.move(end[0] + 2, end[1] + 2, { steps: 3 }); await p.mouse.up();
  await p.waitForTimeout(400);
  console.log('jumped to the end:', JSON.stringify(await state()));
}
// 3. half of stroke 1, lift, then the rest
{
  const pts = await strokePoints(0, 6, 3);
  const half = Math.floor(pts.length / 2);
  await p.mouse.move(pts[0][0], pts[0][1]); await p.mouse.down();
  for (const q of pts.slice(0, half)) { await p.mouse.move(q[0], q[1], { steps: 2 }); await p.waitForTimeout(12); }
  await p.mouse.up();
  await p.waitForTimeout(300);
  if (OUT) await p.screenshot({ path: `${OUT}/3-half.png` });
  console.log('half drawn, lifted:', JSON.stringify(await state()));
  await p.mouse.move(pts[half - 1][0], pts[half - 1][1]); await p.mouse.down();
  for (const q of pts.slice(half)) { await p.mouse.move(q[0], q[1], { steps: 2 }); await p.waitForTimeout(12); }
  await p.waitForTimeout(400); await p.mouse.up();
  console.log('stroke 1 finished:', JSON.stringify(await state()));
}
await draw(1, 6, 3, 12);
await p.waitForTimeout(300);
if (OUT) await p.screenshot({ path: `${OUT}/4-done.png` });
console.log('letter a done:', JSON.stringify(await state()));
await p.waitForTimeout(4500);
console.log('next round:', JSON.stringify(await state()));
// 4. letter s after its demo, quickly
await p.waitForTimeout(3000);
await draw(0, 8, 3, 6);
await p.waitForTimeout(800);
console.log('letter s done:', JSON.stringify(await state()));

// 5. a word (Bahasa: "ba"), and a 3-stroke m, with a fast finger
await start({ type: 'trace', kind: 'word', lang: 'id', set: [{ w: 'mu', e: '', say: 'Tebalkan mu.', praise: 'Mu!' }], rounds: 1 });
await p.waitForTimeout(600);
await p.waitForTimeout(1200);                             // (the game opens after its ready card, and the board grows in)
{ const bb = await p.locator('.tr-svg').boundingBox(); await p.mouse.click(bb.x + 12, bb.y + 12); }   // a tap on the board skips the demo
await p.waitForTimeout(700);
for (let k = 0; k < 3; k++) { await draw(k, 5, 4, 4); await p.waitForTimeout(150); }
await p.waitForTimeout(1500);
console.log('m done, u next:', JSON.stringify(await state()));
await p.waitForTimeout(3500);
for (let k = 0; k < 2; k++) { await draw(k, 5, 4, 4); await p.waitForTimeout(150); }
await p.waitForTimeout(600);
console.log('word done:', JSON.stringify(await state()));
console.log(errs.join('\n') || 'no errors');
await b.close();
