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
  /* Every glyph the app CAN paint, plus the three kinds it never can and so
     always leaves to the device's own font: a geometric shape (⬤), a keycap
     (5️⃣) and a flag (🇮🇩). */
  const GLYPH = /(?:\p{Extended_Pictographic}|[\u2B24\u25CF])(?:\uFE0F|\u200D\p{Extended_Pictographic}\uFE0F?|\p{Emoji_Modifier})*|[0-9#*]\uFE0F?\u20E3|[\u{1F1E6}-\u{1F1FF}]{2}/gu;
  const seeE = (s) => {
    const t = String(s == null ? '' : s).trim();
    if (!t) return;
    GLYPH.lastIndex = 0;
    const hits = [];
    let m;
    while ((m = GLYPH.exec(t))) hits.push([m[0], m.index]);
    // glyphs written side by side are one run: a run with a painting of its
    // own is one scene picture ("🎉🎂"), otherwise each glyph stands alone
    let run = '', end = -1;
    const flush = () => {
      if (!run) return;
      if (AF.Icon.looksLike(run)) emojis.add(run);
      else { GLYPH.lastIndex = 0; (run.match(GLYPH) || []).forEach(x => emojis.add(x)); }
      run = '';
    };
    hits.forEach(([g, i]) => { if (i !== end) flush(); run += g; end = i + g.length; });
    flush();
  };
  /* a face of a match/memory card, as a child reads it */
  const faceKey = (f) => !f ? '' : f.e ? 'e:' + (AF.Icon.looksLike(f.e) || f.e) : f.shadow ? 's:' + (AF.Icon.looksLike(f.shadow) || f.shadow)
    : f.t != null ? 't:' + f.t : f.html ? 'h:' + f.html : '';
  let seats = null;           // where the right card sat, round after round
  /* Which seat the right card takes. Read a few times: a round that deals its
     cards afresh on every read (content/play.js `deal`) answers differently
     and is reported as -1, "it moves". */
  const seatOf = (r) => {
    const s = [];
    for (let i = 0; i < 6; i++) s.push(r.options.findIndex(o => String(o.key) === String(r.answer)));
    return s.every(x => x === s[0]) ? s[0] : -1;
  };
  const checkRound = (where, r) => {
    if (!r || !r.say) { bad.push(where + ': round without say'); return; }
    if (seats && Array.isArray(r.options) && r.options.length > 1) seats.push(seatOf(r));
    hear(r.say); hear(r.praise);
    // a line built from a hole in a word list ("Find undefined")
    const said = [r.say, r.text, r.praise].map(x => typeof x === 'string' ? x : '').join(' ');
    if (/undefined|NaN|\[object Object\]/.test(said)) bad.push(where + `: says "${said.slice(0, 70)}"`);
    if (r.answer === undefined || r.answer === null) bad.push(where + ': no answer');
    if (!Array.isArray(r.options) || r.options.length < 2) bad.push(where + ': fewer than 2 options');
    else {
      const keys = r.options.map(o => String(o.key));
      if (new Set(keys).size !== keys.length) bad.push(where + ': duplicate option keys ' + keys.join(','));
      // a card with nothing on it
      r.options.forEach(o => { if (o.emoji == null && o.glyph == null && o.html == null && o.label == null) bad.push(where + `: card ${o.key} has nothing to show`); });
      // two cards a child reads as the same picture (the leg painted as a foot)
      const seen = new Map();
      r.options.forEach(o => {
        if (!o.emoji) return;
        const k = AF.Icon.looksLike(o.emoji) || o.emoji;
        if (seen.has(k)) bad.push(where + `: ${seen.get(k)} and ${o.key} show the same picture ${k}`);
        else seen.set(k, o.key);
      });
      if (!r.options.some(o => o.key === r.answer)) bad.push(where + `: answer ${r.answer} not among options ${keys.join(',')}`);
      r.options.forEach(o => seeE(o.emoji));
      /* The question's own picture handed back as the answer card: the child
         matches two pictures and never thinks about the question. `same: true`
         says this game IS picture matching (content/math.js M.same). */
      if (!r.same && typeof r.show === 'string') {
        GLYPH.lastIndex = 0;
        const shown = (r.show.match(GLYPH) || []).map(e => AF.Icon.looksLike(e) || e);
        const same = r.options.filter(o => o.emoji && shown.indexOf(AF.Icon.looksLike(o.emoji) || o.emoji) >= 0);
        if (shown.length === 1 && same.length === 1 && String(same[0].key) === String(r.answer))
          bad.push(where + `: the question shows ${shown[0]} and so does the answer card — "${String(r.say).slice(0, 50)}"`);
      }
    }
    if (r.show) seeE(r.show);
  };
  /* A line the friend says in English that tools/voice never recorded: the
     warm voice drops to the device's robot one for that one line, mid-lesson.
     (Indonesian is always the device's own voice, so it is not counted.) */
  const V = AF.VOICE || { clips: {}, named: {} };
  const who = AF.Profile.character && AF.Profile.character.name;
  const recorded = (t) => {
    const n = String(t).replace(/\s+/g, ' ').trim();
    if (V.clips[n]) return true;
    const byName = who && n.indexOf(who) >= 0 && V.named[n.split(who).join('{name}')];
    return !!(byName && byName[who]);
  };
  const noClip = new Set(), englishLines = new Set();
  let english = false;
  const hear = (t) => {
    if (!english || typeof t !== 'string' || !t || /\{name\}|\{me\}/.test(t)) return;
    englishLines.add(t);
    if (!recorded(t)) noClip.add(t);
  };
  for (const id of ids) {
    const m = AF.module(id);
    if (!m) { bad.push(id + ': not registered'); continue; }
    const seen = new Set();
    if (m.stages && m.stages.length < AF.Levels.tierCount(m.levels)) bad.push(id + ': fewer stage names than stages');
    m.levels.forEach(l => {
      const W = `${id}/${l.id}`;
      english = (l.lang || m.lang || 'en') !== 'id';
      if (english && AF.Engines.linesOf) AF.Engines.linesOf(l).forEach(hear);
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
        /* Play the generator the way the engine does: ctx.last is the answer it
           just gave, so the "never the same twice" filters really run and a
           filter that empties out is caught. */
        seats = [];
        if (st.gen) {
          let last = null;
          for (let i = 0; i < 200; i++) {
            let r;
            try { r = st.gen({ round: i % 8, last: last, stretch: i % 3 === 0 }); }
            catch (e) { bad.push(S + `: gen threw ${e.message} (after last=${JSON.stringify(last)})`); break; }
            const was = bad.length;
            checkRound(S + ` gen#${i}`, r);
            if (bad.length > was) break;                 // one report per generator, not two hundred
            last = r.answer;
          }
        }
        (st.fixed || []).forEach((r, i) => checkRound(S + ` fixed#${i}`, r));
        (st.quiz || []).forEach((r, i) => checkRound(S + ` quiz#${i}`, r));
        /* The right card in the same seat every time: a child learns "tap the
           first one" and never looks at the question. */
        if (seats.length >= 3 && seats.every(x => x === seats[0]) && seats[0] >= 0)
          bad.push(S + `: the right card is always card ${seats[0] + 1} (${seats.length} rounds) — shuffle the options`);
        seats = null;
        if (st.type === 'intro') (st.cards || []).forEach((c, i) => {
          if (!c.say) bad.push(S + ` card#${i}: no say`);
          if (!c.pic && !c.show && !c.big && !c.html) bad.push(S + ` card#${i}: nothing to look at`);
          seeE(c.pic); seeE(c.show);
        });
        if (st.type === 'intro' && !(st.cards || []).length) bad.push(S + ': no cards');
        /* A pool that cannot fill the rounds asked of it. Every engine clamps
           to what it has, so nothing breaks — the lesson simply runs shorter
           than it was written to, which is how a level ends up feeling over
           before it began (docs/research/level-pacing.md). */
        const pool = { trace: st.set, build: st.words, sort: st.items, order: st.sets, choose: st.fixed, pop: st.fixed };
        const have = pool[st.type] && pool[st.type].length, want = st.pick || st.rounds;
        if (have != null && want && want > have) bad.push(S + `: asks for ${want} rounds from a pool of ${have} — it will stop at ${have}`);
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
          /* Two pairs that look the same on one board: the child turns over two
             identical pictures, is told they do not match, and is right to be
             cross. */
          const face = new Map();
          (st.pairs || []).forEach(pr => {
            [pr.a || { e: pr.e }, pr.b || (st.words ? { t: pr.w } : { e: pr.e })].forEach(f => {
              const k = faceKey(f);
              if (!k || k.charAt(0) === 'h') return;
              if (face.has(k) && face.get(k) !== pr.w) bad.push(S + `: "${face.get(k)}" and "${pr.w}" put the same card on the board (${k.slice(0, 40)})`);
              else face.set(k, pr.w);
            });
            seeE((pr.a && pr.a.e) || pr.e); seeE(pr.b && pr.b.e);
          });
        }
        if (st.type === 'sort') {
          (st.items || []).forEach(it => { if (!st.bins.some(bn => String(bn.key) === String(it.bin))) bad.push(S + ': item without bin ' + it.w); seeE(it.e); });
          if (typeof st.ask !== 'function') bad.push(S + ': sort without ask()');
          (st.bins || []).forEach(bn => {
            seeE(bn.emoji || bn.e);
            if (!(st.items || []).some(it => String(it.bin) === String(bn.key))) bad.push(S + `: nothing ever goes in the ${bn.key} basket`);
          });
        }
        if (st.type === 'order') (st.sets || []).forEach(set => { if (!set.say) bad.push(S + ': order set without say'); (set.steps || []).forEach(x => seeE(x.e)); });
        if (st.type === 'pop' && !st.gen) bad.push(S + ': pop without gen');
        if ((st.type === 'choose' || st.type === 'pop') && !st.gen && !st.fixed) bad.push(S + ': choose without gen/fixed');
      });
    });
    info.push(`${id}: ${m.levels.length} levels in ${AF.Levels.tierCount(m.levels)} stages`);
  }
  if (englishLines.size) {
    info.push(`voice: ${englishLines.size} English lines, ${noClip.size} with no recording in voice/${noClip.size ? ' (the friend drops to the device voice for those)' : ''}`);
    [...noClip].slice(0, 12).forEach(t => info.push(`        no clip: "${t}"`));
    if (noClip.size > 12) info.push(`        ...and ${noClip.size - 12} more`);
  }
  const unpainted = [...emojis].filter(e => !painted(e));
  info.push(`emoji: ${emojis.size} used, ${unpainted.length} not painted: ${unpainted.join(' ')}`);
  if (unpainted.length) info.push('        (a picture with no painting falls back to the device\'s own flat emoji — docs/art/ASSET_NEEDS_learning-pictures.md)');
  return { bad, info };
}, ids);
out.bad.forEach(x => console.log('PROBLEM ' + x));
out.info.forEach(x => console.log('info    ' + x));
errs.forEach(x => console.log('ERROR   ' + x));
console.log(out.bad.length || errs.length ? `${out.bad.length} problems, ${errs.length} page errors` : 'OK');
await b.close();
