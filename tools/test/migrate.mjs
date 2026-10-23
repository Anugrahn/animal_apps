import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const old = { v: 2, character: { name: 'Coco', species: 'bear', colour: '#F4EEE6', hat: 'none', wear: 'none', item: 'none', voice: 'mid' },
  stars: { letters: { l1: 3, l2: 2 }, numbers: { n1: 3 }, stories: { st1: 2 }, maze: { m1: 1 } },
  attempts: { letters: { l1: 2 }, stories: { st1: 1 } }, log: { letters: { l1: { n: 1, mistakes: 0, ms: 2000 } } },
  days: { '2026-10-20': 600000, '2026-10-21': 300000 }, settings: { sound: true, motion: true, open: false, speech: 'tap', limit: 0 },
  seenTutorial: true, lastModule: 'letters', today: { date: '2026-10-21', picks: [{ m: 'letters', l: 'l3' }], done: [], cheered: false } };
await ctx.addInitScript((o) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('af.profile.v2', JSON.stringify(o)); sessionStorage.setItem('seeded', '1'); } }, old);
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/index.html');
await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const s = AF.Profile.get();
  return JSON.stringify({ curriculum: s.curriculum, legacyStars: s.legacyStars, allStars: AF.Profile.allStars(), stars: s.stars, legacy: Object.keys(s.legacy),
    lastModule: s.lastModule, screen: document.body.dataset.screen, pill: document.getElementById('jr-open').getAttribute('aria-label'),
    saved: JSON.parse(localStorage.getItem('af.profile.v2')).curriculum });
}));
// a second load must not count the legacy stars twice
await p.reload(); await p.waitForTimeout(1200);
console.log(await p.evaluate(() => JSON.stringify({ legacyStars: AF.Profile.get().legacyStars, allStars: AF.Profile.allStars() })));
console.log(errs.join('\n') || 'no errors');
await b.close();
