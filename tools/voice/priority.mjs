// Which lines to voice first: writes priority.json { line: order }.
// Lines every subject uses come first (the friend's cheers, the menus, the
// result and the celebrations, a lesson's step names), then each subject's
// first stage, then the second, and so on, taking the subjects in turn so
// every island gets the new voice early.   node priority.mjs [app url]
// (v4: a lesson's steps are walked like levels of their own, the way
// harvest.mjs collects them; Bahasa Indonesia is left out, the device's
// Indonesian voice says it.) Lines only the harvest bot finds come last.
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8765/';
const b = await chromium.launch({ args: ['--mute-audio'] });
const p = await (await b.newContext({ serviceWorkers: 'block' })).newPage();
await p.goto(BASE + 'index.html?go=home&friend=0');
await p.waitForTimeout(800);
const order = await p.evaluate(() => {
  const name = AF.Profile.character.name;
  const tpl = (t) => String(t || '').split(name).join('{name}').replace(/\s+/g, ' ').trim();
  const lines = {};                 // line -> [stage, turn]
  const put = (t, stage, turn) => { t = tpl(t); if (!t) return; const o = lines[t]; if (!o || stage < o[0] || (stage === o[0] && turn < o[1])) lines[t] = [stage, turn]; };
  const EVERY = (t) => put(t, -1, 0);

  // used everywhere: the friend's cheers, results, menus, celebrations, the games' own words
  Object.values(AF.Art.SPECIES).forEach(s => { EVERY(s.cheer); EVERY(s.cheer + ' Three stars!'); });
  ['Well done!', 'Good try!', 'Great!', 'Yay! Well done!', 'Hi! I am {name}. Let\'s play!', 'Hello! I am {name}.', 'Finish the one before first.',
    'Good morning! Where shall we go?', 'Hello! Where shall we go?', 'Good evening! Where shall we go?',
    'Let’s make your friend! Tap an animal.', 'Let’s ask a grown-up!', 'Treasure! Off we go to the next one!',
    'You did all of today’s study! Hooray!', 'You finished it all! You are a star!', 'You opened the treasure! The next one is open!',
    'You did it all today! Well done!', 'It is review day! Let’s play what we learned.', 'Here is today’s study. Let’s start!'].forEach(EVERY);
  AF.AREAS.forEach(a => EVERY(`${a.island}!`));
  AF.registry.forEach(m => { EVERY(`${m.title}! Let’s go!`); AF.stageNames(m).forEach(n => EVERY(`Finish ${n} first.`)); });
  Object.keys(AF.STR.en).forEach(k => { const v = AF.STR.en[k]; if (typeof v === 'string' && /[.!?]$/.test(v)) EVERY(v); });

  // each level, or each step of a lesson: stage first, then its place in the subject
  AF.registry.forEach((m, mi) => m.levels.forEach((top, li) => {
    if ((top.lang || m.lang) === 'id') return;
    const stage = top.tier || 0, turn = li * 20 + mi;      // level 1 of every subject, then level 2...
    const P = (t) => put(t, stage, turn);
    const each = [];
    if (top.type === 'lesson') { P(top.say); top.steps.forEach(st => { EVERY(AF.Engines.stepInfo(st, 'en').go); each.push(st); }); }
    else each.push(top);
    for (const lv of each) {
      const take = (r) => { if (!r) return; P(r.say); P(r.praise); P(r.sound); };
      if (lv.gen) for (let i = 0; i < 300; i++) { try { take(lv.gen({ round: i % 10, last: null, stretch: i % 2 === 1 })); } catch (e) { break; } }
      (lv.fixed || []).forEach(take);
      if (lv.items && lv.ask) lv.items.forEach(it => { P(lv.ask(it)); const bin = (lv.bins || []).filter(x => String(x.key) === String(it.bin))[0]; if (bin) P(lv.tell ? lv.tell(it, bin) : bin.label); });
      if (lv.pairs && lv.say) { P(lv.say); lv.pairs.forEach(pr => { P(pr.sayA || pr.w); P(pr.say || pr.w); }); }
      (lv.sets || []).forEach(s => { P(s.say); P(s.praise); (s.steps || []).forEach(st => P(st.say || st.label)); });
      if (lv.type === 'build') (lv.words || []).forEach(x => { P(AF.blend(x.w)); P(x.w); P(`Build the word, ${x.w}.`); });
      if (lv.type === 'speak') (lv.words || []).forEach(x => { P(`Say, ${x.w}.`); P(x.w); });
      if (lv.type === 'trace') (lv.set || []).forEach(x => {
        if (lv.kind === 'word') { P(`Write the word, ${x.w}.`); P(x.w); }
        else if (lv.kind === 'number') { P(`Trace number ${AF.NUM[+x]}.`); P(AF.NUM[+x]); }
        else if (AF.PHONICS[x]) { P('Trace the letter that says'); P(AF.PHONICS[x].say); P(`${AF.PHONICS[x].say} … ${AF.PHONICS[x].word}`); }
      });
      if (lv.type === 'memory' && lv.pairs) lv.pairs.forEach(pr => { P(pr.sayA || pr.w); P(pr.sayB || pr.w); });
      (lv.pages || []).forEach(pg => { P(pg.text); String(pg.text).split(/\s+/).forEach(w => { w = w.replace(/[^A-Za-z']/g, ''); if (w && w !== 'name') P(w); }); });
      (lv.quiz || lv.questions || []).forEach(take);
      (lv.cards || []).forEach(c => { P(c.say); P(c.sound); });
    }
  }));
  // one number per line: stage first, then turn
  const out = {};
  Object.entries(lines).forEach(([t, [s, turn]]) => { out[t] = (s + 1) * 100000 + turn; });
  return out;
});
await b.close();
fs.writeFileSync(new URL('./priority.json', import.meta.url), JSON.stringify(order));
const phrases = JSON.parse(fs.readFileSync(new URL('./phrases.json', import.meta.url), 'utf8'));
const missing = Object.keys(phrases).filter(l => !(l in order)).length;
console.log(Object.keys(order).length, 'lines ranked;', missing, 'of', Object.keys(phrases).length, 'harvested lines come last');
