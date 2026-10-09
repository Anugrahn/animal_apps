// Which lines to voice first: writes priority.json { line: order }.
// Lines every subject uses come first, then each subject's Basic levels,
// then Intermediate, then Advanced, taking the subjects in turn so every
// island gets the new voice early.   node priority.mjs [app url]
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
  // used everywhere: the friend's cheers, results, locks
  Object.values(AF.Art.SPECIES).forEach(s => { put(s.cheer, -1, 0); put(s.cheer + ' Three stars!', -1, 0); });
  ['Well done!', 'Good try!', 'Great!', 'Hi! I am {name}. Let\'s play!', 'Hello! I am {name}.', 'Finish the one before first.'].forEach(t => put(t, -1, 0));
  AF.registry.forEach((m, mi) => m.levels.forEach((lv, li) => {
    const stage = lv.tier || 0, turn = li * 20 + mi;      // level 1 of every subject, then level 2...
    const take = (r) => { if (!r) return; put(r.say, stage, turn); put(r.praise, stage, turn); put(r.sound, stage, turn); };
    if (lv.gen) for (let i = 0; i < 300; i++) { try { take(lv.gen({ round: i % 10, last: null, stretch: i % 2 === 1 })); } catch (e) { break; } }
    (lv.fixed || []).forEach(take);
    if (lv.items && lv.ask) lv.items.forEach(it => { put(lv.ask(it), stage, turn); const bin = (lv.bins || []).filter(x => String(x.key) === String(it.bin))[0]; if (bin) put(lv.tell ? lv.tell(it, bin) : bin.label, stage, turn); });
    if (lv.pairs && lv.say) { put(lv.say, stage, turn); lv.pairs.forEach(pr => { put(pr.sayA || pr.w, stage, turn); put(pr.say || pr.w, stage, turn); }); }
    (lv.sets || []).forEach(s => { put(s.say, stage, turn); put(s.praise, stage, turn); (s.steps || []).forEach(st => put(st.say || st.label, stage, turn)); });
    (lv.pages || []).forEach(pg => put(pg.text, stage, turn));
    (lv.quiz || lv.questions || []).forEach(take);
  }));
  // one number per line: stage first, then turn
  const out = {};
  Object.entries(lines).forEach(([t, [s, turn]]) => { out[t] = (s + 1) * 100000 + turn; });
  return out;
});
await b.close();
fs.writeFileSync(new URL('./priority.json', import.meta.url), JSON.stringify(order));
console.log(Object.keys(order).length, 'lines ranked');
