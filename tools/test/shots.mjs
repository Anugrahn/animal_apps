// Screenshots of screens at a size: node shots.mjs <w>x<h> <outdir> <name>=<url-or-script> ...
// A spec is "go:<deep link>" or "js:<code run after home loads>", optional "@<ms>" wait.
import { chromium } from 'playwright';
import fs from 'node:fs';
const [size, out, ...specs] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--mute-audio'] });
for (const spec of specs) {
  const [name, rest] = [spec.slice(0, spec.indexOf('=')), spec.slice(spec.indexOf('=') + 1)];
  let [what, wait] = rest.split('@');
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', serviceWorkers: 'block', deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  if (what.startsWith('go:')) await p.goto(`http://localhost:8765/index.html?go=${what.slice(3)}&friend=0`);
  else {
    await p.goto('http://localhost:8765/index.html?go=home&friend=0');
    await p.waitForTimeout(700);
    await p.evaluate(what.slice(3));
  }
  await p.waitForTimeout(+(wait || 1500));
  await p.screenshot({ path: `${out}/${name}.png` });
  if (errs.length) console.log(name, 'ERR', errs.join(' | '));
  await ctx.close();
}
await b.close();
console.log('ok');
