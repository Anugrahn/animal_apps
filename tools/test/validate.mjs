// Checks a subject's lessons for mistakes a child would hit.
//   node validate.mjs <subjectId> [<subjectId> ...]      (app served on :8765)
// Prints one line per problem, then a summary.
import { chromium } from 'playwright';
const ids = process.argv.slice(2);
const b = await chromium.launch({ args: ['--mute-audio'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto('http://localhost:8765/index.html?go=home&friend=0');
await p.waitForTimeout(1200);
const out = await p.evaluate((ids) => {
  const bad = [], info = [];
  const KINDS = ['listen', 'story', 'words', 'life', 'trace', 'say', 'play', 'master', 'song', 'quiz', 'review'];
  const painted = (e) => { const d = document.createElement('span'); d.className = 'big-e'; d.textContent = e; document.body.appendChild(d); AF.Icon.hydrate(d); const ok = !!d.querySelector('img'); d.remove(); return ok; };
  const emojis = new Set();
  const seeE = (e) => { if (e && /\p{Extended_Pictographic}/u.test(e)) emojis.add(e); };
  const checkRound = (where, r) => {
    if (!r || !r.say) { bad.push(where + ': round without say'); return; }
    if (!Array.isArray(r.options) || r.options.length < 2) bad.push(where + ': fewer than 2 options');
    else {
      const keys = r.options.map(o => String(o.key));
      if (new Set(keys).size !== keys.length) bad.push(where + ': duplicate option keys ' + keys.join(','));
      if (!r.options.some(o => o.key === r.answer)) bad.push(where + `: answer ${r.answer} not among options ${keys.join(',')}`);
      r.options.forEach(o => seeE(o.emoji));
    }
    if (r.show) (r.show.match(/\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*/gu) || []).forEach(seeE);
  };
  for (const id of ids) {
    const m = AF.module(id);
    if (!m) { bad.push(id + ': not registered'); continue; }
    const seen = new Set();
    if (m.stages && m.stages.length < AF.Levels.tierCount(m.levels)) bad.push(id + ': fewer stage names than stages');
    m.levels.forEach(l => {
      const W = `${id}/${l.id}`;
      if (seen.has(l.id)) bad.push(W + ': duplicate id'); seen.add(l.id);
      if (String(l.title).length > 20) info.push(W + `: long title "${l.title}"`);
      if (m.topics && !l.review && l.topic && !m.topics[l.topic]) bad.push(W + ': unknown topic ' + l.topic);
      const steps = l.type === 'lesson' ? l.steps : [l];
      if (l.type === 'lesson' && (!steps || !steps.length)) bad.push(W + ': lesson without steps');
      (steps || []).forEach((st, si) => {
        const S = `${W}#${si}(${st.step || st.type})`;
        if (l.type === 'lesson' && KINDS.indexOf(st.step) < 0) bad.push(S + ': unknown step kind ' + st.step);
        if (!AF.Engines[st.type]) bad.push(S + ': no engine ' + st.type);
        if ((l.lang || m.lang) === 'id' && st.type === 'speak') bad.push(S + ': speak step in Indonesian');
        if (st.gen) for (let i = 0; i < 80; i++) { try { checkRound(S + ` gen#${i}`, st.gen({ round: i % 8, last: null, stretch: i % 2 === 1 })); } catch (e) { bad.push(S + ': gen threw ' + e.message); break; } }
        (st.fixed || []).forEach((r, i) => checkRound(S + ` fixed#${i}`, r));
        (st.quiz || []).forEach((r, i) => checkRound(S + ` quiz#${i}`, r));
        if (st.type === 'intro') (st.cards || []).forEach((c, i) => { if (!c.say) bad.push(S + ` card#${i}: no say`); seeE(c.pic); });
        if (st.type === 'intro' && !(st.cards || []).length) bad.push(S + ': no cards');
        if (st.type === 'trace') (st.set || []).forEach(x => {
          const w = st.kind === 'word' ? x.w : String(x);
          if (st.kind === 'line') return;
          (st.kind === 'word' ? w.split('') : st.kind === 'number' ? String(x).split('') : [w]).forEach(g => { if (!AF.STROKES[g]) bad.push(S + `: cannot trace "${g}" in "${w}"`); });
          if (st.kind === 'letter' && !AF.PHONICS[w]) bad.push(S + `: no phonics for ${w}`);
        });
        if (st.type === 'build') (st.words || []).forEach(x => {
          if (x.parts && x.parts.join('') !== x.w) bad.push(S + `: parts ${x.parts.join('+')} do not make ${x.w}`);
          seeE(x.e);
          if (!st.rounds || st.rounds > st.words.length) info.push(S + ': rounds > words');
        });
        if (st.type === 'story') (st.pages || []).forEach((pg, i) => { if (!pg.text) bad.push(S + ` page#${i}: no text`); String(pg.art || '').split(' ').forEach(seeE); });
        if (st.type === 'speak') (st.words || []).forEach(x => seeE(x.e));
        if (st.type === 'match' || st.type === 'memory') {
          if (st.type === 'match' && !st.say) bad.push(S + ': match without say');
          if (st.pairs && st.pairs.length < (st.n || 3)) bad.push(S + `: ${st.pairs.length} pairs < n ${st.n}`);
        }
        if (st.type === 'sort') {
          (st.items || []).forEach(it => { if (!st.bins.some(bn => String(bn.key) === String(it.bin))) bad.push(S + ': item without bin ' + it.w); seeE(it.e); });
          if (typeof st.ask !== 'function') bad.push(S + ': sort without ask()');
        }
        if (st.type === 'order') (st.sets || []).forEach(set => { if (!set.say) bad.push(S + ': order set without say'); (set.steps || []).forEach(x => seeE(x.e)); });
        if (st.type === 'pop' && !st.gen) bad.push(S + ': pop without gen');
        if ((st.type === 'choose' || st.type === 'pop') && !st.gen && !st.fixed) bad.push(S + ': choose without gen/fixed');
      });
    });
    info.push(`${id}: ${m.levels.length} levels in ${AF.Levels.tierCount(m.levels)} stages`);
  }
  const unpainted = [...emojis].filter(e => !painted(e));
  info.push(`emoji: ${emojis.size} used, ${unpainted.length} not painted: ${unpainted.join(' ')}`);
  return { bad, info };
}, ids);
out.bad.forEach(x => console.log('PROBLEM ' + x));
out.info.forEach(x => console.log('info    ' + x));
errs.forEach(x => console.log('ERROR   ' + x));
console.log(out.bad.length || errs.length ? `${out.bad.length} problems, ${errs.length} page errors` : 'OK');
await b.close();
