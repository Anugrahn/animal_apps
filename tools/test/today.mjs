import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--mute-audio'] });
async function day(iso, setup) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date(iso) });
  await p.goto('http://localhost:8765/index.html?go=home&friend=0');
  await p.clock.runFor(1500);
  const r = await p.evaluate((setup) => {
    if (setup) (new Function(setup))();
    AF.App.goHome();
    const t = AF.Profile.get().today;
    return t.date + ' ' + ['Su','Mo','Tu','We','Th','Fr','Sa'][new Date().getDay()] + ': ' + t.picks.map(x => `${x.m}:${x.l}(${x.kind})`).join(', ');
  }, setup);
  console.log(r);
  await ctx.close();
}
await day('2026-10-26T09:00:00');                       // Monday, new child
await day('2026-10-27T09:00:00');                       // Tuesday
// Wednesday, yesterday's (Tuesday) phonics + math were not done: they carry over
await day('2026-10-28T09:00:00', `const P = AF.Profile.get(); P.today = { date: '2026-10-27', picks: [{ m: 'phonics', l: 'ph1-1', kind: 'new' }, { m: 'math', l: 'm1-1', kind: 'new' }, { m: 'maze', l: 'm1', kind: 'fun' }], done: [], cheered: false };`);
// Saturday with some lessons played: review the least sure
await day('2026-10-31T09:00:00', `const P = AF.Profile.get(); P.stars = { phonics: { 'ph1-1': 3, 'ph1-2': 1 }, math: { 'm1-1': 2 } }; P.today = null;`);
// Sunday, nothing played: the first lessons
await day('2026-11-01T09:00:00');
await b.close();
