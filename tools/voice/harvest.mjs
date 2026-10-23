// Collects every line Animal Friends speaks, so it can be voiced ahead of time.
//   node harvest.mjs [http://localhost:8765/]   (with the app being served)
// Writes phrases.json: { "text": "say" | "sound" }. The friend's name is
// written as {name}, so a line is voiced once for every ready-made name.
// Three sources: each level's question generator sampled many times, the
// data of sort / match / order levels, and a muted bot that plays every
// level, the tutorial and the maker while recording what is said.
// A lesson (v4) is several levels in a row: each of its steps is sampled.
// Bahasa Indonesia is left out: the device's Indonesian voice says it
// (the recorded voice is English).
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8765/';
const WORKERS = 8, LEVEL_MS = 75000, LESSON_MS = 200000;
const found = {};          // text -> 'say' | 'sound'

function add(list) {
  for (const [text, kind] of list) {
    const t = String(text || '').replace(/\s+/g, ' ').trim();
    if (t && !(t in found && found[t] === 'sound')) found[t] = found[t] === 'say' && kind === 'sound' ? 'say' : kind;
  }
}

// Recording what is said, with the friend's name turned into {name}.
const SPY = () => {
  window.__said = [];
  const name = () => (AF.Profile.character && AF.Profile.character.name) || '\u0000';
  const tpl = (t) => String(t).split(name()).join('{name}');
  const say = AF.Audio.say, sound = AF.Audio.sound;
  let inSound = false;
  const foreign = (o) => ((o && o.lang) || AF.Audio.lang) !== 'en';
  AF.Audio.sound = function (p, o) { if (!foreign(o)) window.__said.push([tpl(p), 'sound']); inSound = true; try { return sound.apply(this, arguments); } finally { inSound = false; } };
  AF.Audio.say = function (t, o) { if (!inSound && !foreign(o)) window.__said.push([tpl(t), 'say']); return say.apply(this, arguments); };
};

async function page(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.goto(BASE + 'index.html?go=home&friend=0');
  await p.waitForTimeout(800);
  await p.evaluate(SPY);
  await p.evaluate(() => AF.Profile.setSetting('speech', 'tap'));
  return { ctx, p };
}
const drain = async (p) => add(await p.evaluate(() => window.__said.splice(0)));

const browser = await chromium.launch({ args: ['--mute-audio'] });

// 1. generators and level data, sampled in the page
{
  const { ctx, p } = await page(browser);
  add(await p.evaluate(() => {
    const out = [];
    const S = (t, k) => out.push([t, k || 'say']);
    const name = AF.Profile.character.name;
    const tpl = (t) => String(t).split(name).join('{name}');
    // a lesson's steps are levels of their own; Indonesian ones are skipped
    const each = [];
    for (const m of AF.registry) for (const top of m.levels) {
      if ((top.lang || m.lang) === 'id') continue;
      if (top.type !== 'lesson') { each.push(top); continue; }
      if (top.say) S(top.say);
      top.steps.forEach(st => {
        const info = AF.Engines.stepInfo(st, 'en');
        S(info.go);
        each.push(Object.assign({ tier: top.tier }, st));
      });
    }
    for (const lv of each) {
      const take = (r) => { if (!r) return; S(tpl(r.say)); if (r.praise) S(tpl(r.praise)); if (r.sound) S(r.sound, 'sound'); };
      if (lv.gen) for (let i = 0; i < 600; i++) { try { take(lv.gen({ round: i % 10, last: null, stretch: i % 2 === 1 })); } catch (e) { break; } }
      (lv.fixed || []).forEach(take);
      if (lv.items && lv.ask) lv.items.forEach(it => {
        S(lv.ask(it));
        const bin = (lv.bins || []).filter(b => String(b.key) === String(it.bin))[0];
        if (bin) { S(lv.tell ? lv.tell(it, bin) : bin.label); }
      });
      if (lv.pairs && lv.say) { S(lv.say); lv.pairs.forEach(pr => { S(pr.sayA || pr.w); S(pr.say || pr.w); }); }
      (lv.sets || []).forEach(s => { S(s.say); if (s.praise) S(s.praise); (s.steps || []).forEach(st => S(st.say || st.label)); });
      // Build a word: the blend of its sounds, then the word itself
      if (lv.type === 'build') (lv.words || []).forEach(x => { S(AF.blend(x.w), 'sound'); S(x.w); S(`Build the word, ${x.w}.`); });
      // Lines the games build from a level's data, so none depends on the bot
      // happening to reach it (engines/voice.js, touch.js, quiz.js, media.js).
      if (lv.type === 'speak') { (lv.words || []).forEach(x => { S(`Say, ${x.w}.`); S(x.w); }); ['Great!', 'Good try!', 'Well done!'].forEach(t => S(t)); }
      if (lv.type === 'trace') {
        const LINE = { across: 'a line across', down: 'a line down', slide: 'a slide', zigzag: 'a zig zag', wave: 'a wave',
          hill: 'a hill', circle: 'a circle', square: 'a square', triangle: 'a triangle', loop: 'a loop' };
        (lv.set || []).forEach(x => {
          if (lv.kind === 'word') { S(`Write the word, ${x.w}.`); S(x.w); }
          else if (lv.kind === 'number') { S(`Trace number ${AF.NUM[+x]}.`); S(AF.NUM[+x]); }
          else if (lv.kind === 'line') { S(`Draw ${LINE[x]}.`); S('Lovely!'); }
          else if (AF.PHONICS[x]) { S('Trace the letter that says'); S(AF.PHONICS[x].say, 'sound'); S(`${AF.PHONICS[x].say} … ${AF.PHONICS[x].word}`); }
        });
      }
      if (lv.type === 'memory' && lv.pairs) lv.pairs.forEach(p => { S(p.sayA || p.w); S(p.sayB || p.w); });
      // a story: each page, every word a child can tap, and its questions
      (lv.pages || []).forEach(pg => { S(pg.text); String(pg.text).split(/\s+/).forEach(w => { w = w.replace(/[^A-Za-z']/g, ''); if (w && w !== 'name') S(w); }); });
      (lv.quiz || []).forEach(q => { S(q.say); if (q.praise) S(q.praise); });
      // the cards that open a lesson ("a … aaah … apple")
      (lv.cards || []).forEach(c => { S(tpl(c.say)); if (c.sound) S(c.sound, 'sound'); });
    }
    // what each subject calls its stages: "Finish Step 1 first."
    AF.registry.forEach(m => AF.stageNames(m).forEach(n => S(`Finish ${n} first.`)));
    // the friend's own words, for every kind of animal
    Object.keys(AF.Art.SPECIES || {}).forEach(k => { S(AF.Art.SPECIES[k].cheer); S(AF.Art.SPECIES[k].cheer + ' Three stars!'); });
    // fixed lines in core/app.js and core/levels.js
    ['Hi! I am {name}. Let\'s play!', 'Hello! I am {name}.', 'Coming soon!', 'Finish the one before first.',
      'Finish Basic first.', 'Finish Intermediate first.', 'You found all the treasure!',
      'Time for a break! See you tomorrow.', 'Well done!',
      'You did it all today! Well done!', 'It is review day! Let’s play what we learned.', 'Here is today’s study. Let’s start!'].forEach(t => S(t));
    return out;
  }));
  await ctx.close();
}

// 2. app screens: tutorial, maker voices, greetings, result lines
{
  const { ctx, p } = await page(browser);
  await p.evaluate(() => { const b = document.getElementById('btn-tutor'); if (b) b.click(); });
  for (let i = 0; i < 12; i++) { await p.click('#tutor-next').catch(() => {}); await p.waitForTimeout(250); }
  await p.evaluate(() => AF.App.openMaker(AF.Profile.character));
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('#maker [data-tab]').forEach(b => { if (/voice/i.test(b.dataset.tab)) b.click(); }));
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelectorAll('#maker .mk-tray button, #maker [data-v]').forEach(b => b.click()));
  await drain(p);
  await ctx.close();
}

// 3. play every level, recording what is said
{
  const { ctx: c0, p: p0 } = await page(browser);
  const jobs = await p0.evaluate(() => AF.registry.flatMap(m => m.levels.map((l, i) => ({ m: m.id, i, soon: !!l.soon || (l.lang || m.lang) === 'id', lesson: l.type === 'lesson' })))).then(j => j.filter(x => !x.soon));
  await c0.close();
  let next = 0, done = 0;
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    let { ctx, p } = await page(browser);
    while (next < jobs.length) {
      const j = jobs[next++];
      try {
        await p.evaluate(([m, i]) => { window.__res = 0; const o = AF.Levels.showResult; if (!o.__spy) { AF.Levels.showResult = function () { window.__res++; return o.apply(this, arguments); }; AF.Levels.showResult.__spy = 1; }
          document.getElementById('result').hidden = true; const mod = AF.module(m); AF.App.startLevel(mod, mod.levels[i], i); }, [j.m, j.i]);
        const t0 = Date.now();
        while (Date.now() - t0 < (j.lesson ? LESSON_MS : LEVEL_MS)) {
          if (await p.evaluate(() => window.__res > 0)) break;
          const r = Math.random();
          const intro = await p.evaluate(() => { const g = document.querySelector('#play-host .intro-go, #play-host .step-card, #play-host .story [data-next]'); return !!g; });
          if (intro && r < 0.5) { await p.evaluate(() => { const g = document.querySelector('#play-host .step-card, #play-host .intro-go, #play-host .story [data-next]'); if (g) g.click(); }); await p.waitForTimeout(300); continue; }
          if (r < 0.12) await p.keyboard.press('Space');
          else if (r < 0.24) await p.keyboard.press(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'][Math.floor(Math.random() * 4)]);
          else {
            const pt = await p.evaluate(() => {
              const els = [...document.querySelectorAll('#play-host *, #ready')].filter(e => {
                const b = e.getBoundingClientRect(); if (b.width < 8 || b.height < 8 || b.top > innerHeight) return false;
                const cs = getComputedStyle(e); return cs.pointerEvents !== 'none' && cs.visibility !== 'hidden' && (e.tagName === 'BUTTON' || cs.cursor === 'pointer');
              });
              if (!els.length) return null; const b = els[Math.floor(Math.random() * els.length)].getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2];
            });
            if (pt) await p.mouse.click(pt[0], pt[1]); else await p.mouse.click(60 + Math.random() * 270, 200 + Math.random() * 550);
          }
          await p.waitForTimeout(140);
        }
        await p.waitForTimeout(2200);       // the result line
        await drain(p);
      } catch (e) { await ctx.close().catch(() => {}); ({ ctx, p } = await page(browser)); }
      done++; if (done % 16 === 0) process.stdout.write(`${done}/${jobs.length} levels, ${Object.keys(found).length} lines\n`);
    }
    await ctx.close();
  }));
}

await browser.close();
// stale lines from before the spy, or empty
delete found['{name}'];
fs.writeFileSync(new URL('./phrases.json', import.meta.url), JSON.stringify(found, null, 1));
const n = Object.keys(found).length, named = Object.keys(found).filter(t => t.includes('{name}')).length;
console.log(`${n} lines (${named} with {name}, ${Object.values(found).filter(k => k === 'sound').length} letter sounds)`);
