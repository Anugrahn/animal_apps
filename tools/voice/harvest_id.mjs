/* Harvests every Bahasa Indonesia line the app speaks, in Node (no browser).
   Loads engines/base.js, content/bank.js, engines/lesson.js, content/bahasa.js
   and content/party.js into a stub `window`, walks every level whose lang is
   'id', samples each question generator many times, and adds the lines the
   engines say themselves (step cards, tracing, building a word).
     node harvest_id.mjs <app dir> <out.json> [samples]
   Writes { "<line>": "say" } — every line is a `say`; Indonesian never uses
   AF.Audio.sound (that is the English phonics path).                        */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const APP = process.argv[2];
const OUT = process.argv[3];
const N = +(process.argv[4] || 4000);
if (!APP || !OUT) { console.error('usage: node harvest_id.mjs <app dir> <out.json> [samples]'); process.exit(1); }

/* ---------- a window just real enough for the content files ---------- */
const el = () => new Proxy(function () {}, {
  get: (t, k) => k === 'style' || k === 'dataset' || k === 'classList' ? el()
    : k === 'children' || k === 'childNodes' ? []
    : k === Symbol.toPrimitive || k === 'toString' ? () => '' : el(),
  set: () => true, apply: () => el(), has: () => true
});
const sandbox = {
  console, Math, Date, JSON, setTimeout, clearTimeout, setInterval, clearInterval,
  performance: { now: () => 0 },
  navigator: { userAgent: 'node', platform: 'node', maxTouchPoints: 0, language: 'id' },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  document: { createElement: el, createElementNS: el, body: el(), documentElement: el(),
              querySelector: () => el(), querySelectorAll: () => [], addEventListener: () => {},
              getElementById: () => el() },
  speechSynthesis: undefined
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;
const ctx = vm.createContext(sandbox);

for (const f of ['engines/base.js', 'content/bank.js', 'engines/lesson.js', 'content/bahasa.js', 'content/party.js']) {
  const p = path.join(APP, f);
  if (!fs.existsSync(p)) { console.error(`(skipped, not on this branch: ${f})`); continue; }
  vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const AF = sandbox.AF;
// core/icon.js is not loaded: content/bank.js's oneEach() asks it which
// pictures look alike. Saying "nothing looks alike" only widens the
// distractors a round may offer, never what is said.
AF.Icon = AF.Icon || { looksLike: () => null, svg: () => '', has: () => false };
// A profile is only read for the friend's name; Indonesian lines never carry one.
AF.Profile = AF.Profile || { character: null, skin: () => ({}), setting: () => true };

const found = new Map();                 // normalised line -> how it was found
const norm = (t) => String(t).replace(/\s+/g, ' ').trim();
const BAD = /undefined|NaN|\[object|null/;
const dropped = { html: new Set(), bad: new Set() };
function add(t, why) {
  if (typeof t !== 'string') return;
  const s = norm(t);
  if (!s) return;
  if (BAD.test(s)) { dropped.bad.add(s); return; }
  // HTML belongs to the on-screen text, never to what is spoken
  if (/<[^>]+>/.test(s)) { dropped.html.add(s); return; }
  if (!found.has(s)) found.set(s, why);
}

const threw = new Map();
const S_ID = { level: { lang: 'id' } };
const T = (k, ...a) => AF.Engines.t(S_ID, k, ...a);

/* ---------- the lines an engine says on its own, in Indonesian ---------- */
// engines/trace.js: "Mulai dari titik hijau, ya." (339), "Sekarang giliranmu!" (290)
add(T('startSay'), 'engine trace');
add(T('yourTurn'), 'engine trace');
add(T('watch'), 'engine trace');
// engines/quiz.js memory / touch.js
add(T('pairs'), 'engine memory');

/* ---------- every spoken field of a level, however deeply it sits ----------
   A level is plain data. Everything the engines read out sits under one of
   these keys (say, praise, sayA/sayB on a memory pair, sound), at any depth:
   a lesson step's `set`, an order level's `sets` -> `steps`, a story's
   `pages`. Walking for the keys instead of for the shapes means a new kind
   of level cannot quietly go unrecorded.                                   */
const SPOKEN = ['say', 'praise', 'sayA', 'sayB', 'sound'];
function scan(o, why, depth) {
  if (!o || typeof o !== 'object' || (depth || 0) > 8) return;
  if (Array.isArray(o)) { o.forEach(x => scan(x, why, (depth || 0) + 1)); return; }
  for (const k of SPOKEN) if (typeof o[k] === 'string') add(o[k], why + ' .' + k);
  // a story page is read out as `text` (engines/media.js:40)
  if (Array.isArray(o.pages)) o.pages.forEach(pg => add(pg && pg.text, why + ' page'));
  for (const [k, v] of Object.entries(o)) {
    if (SPOKEN.indexOf(k) >= 0 || k === 'pages') continue;
    // `text` elsewhere is what is shown on screen, never spoken; `options`
    // and `bins` are tapped, not read out
    if (k === 'text' || k === 'options' || k === 'show' || k === 'pic' || k === 'art') continue;
    if (v && typeof v === 'object') scan(v, why + ' ' + k, (depth || 0) + 1);
  }
}

function walkLevel(lv, why) {
  scan(lv, why, 0);
  // engines/quiz.js:449 and engines/touch.js:178/225 — a memory or match
  // card with no sayA/sayB/say of its own is called by its word
  (lv.pairs || []).forEach(pr => {
    add(pr.sayA || pr.w, why + ' pair A');
    add(pr.sayB || pr.w, why + ' pair B');
    add(pr.say || pr.w, why + ' pair matched');
  });
  if (lv.items && typeof lv.ask === 'function') lv.items.forEach(it => {
    try { add(lv.ask(it), why + ' ask'); } catch (e) { /* needs more than its item */ }
    const bin = (lv.bins || []).filter(b => String(b.key) === String(it.bin))[0];
    if (bin) { try { add(lv.tell ? lv.tell(it, bin) : bin.label, why + ' tell'); } catch (e) {} }
  });

  // engines/trace.js:400 — for an Indonesian level the letter being traced
  // is said on its own, one character at a time
  if (lv.type === 'trace') (lv.set || []).forEach(j => {
    String(j.w == null ? '' : j.w).split('').forEach(ch => { if (/[^\s]/.test(ch)) add(ch, 'engine trace glyph'); });
  });

  // engines/quiz.js BUILD (225-330): each syllable as its tile is tapped,
  // then the syllables run together, then the whole word
  if (lv.type === 'build') (lv.words || []).forEach(w => {
    const parts = w.parts || String(w.w).split('');
    add(T('build', w.w), 'engine build prompt');
    parts.forEach(p => add(p, 'engine build part'));
    add(parts.join(' \u2026 '), 'engine build blend');
    add(w.w, 'engine build word');
  });

  // the question generator, sampled
  if (typeof lv.gen === 'function') {
    if (lv.gen.all) scan(lv.gen.all, why + ' gen.all', 0);
    let last = null;
    for (let i = 0; i < N; i++) {
      try {
        const r = lv.gen({ round: i, last: last, stretch: i % 2 === 1 });
        scan(r, why + ' gen', 0);
        last = r && (r.answer != null ? r.answer : null);
      } catch (e) { threw.set(why, (e && e.message) || String(e)); break; }
    }
  }
}

let levels = 0;
for (const m of AF.registry) {
  for (const top of m.levels || []) {
    const lang = top.lang || m.lang;
    if (lang !== 'id') continue;
    levels++;
    if (top.type !== 'lesson') { walkLevel(top, m.id); continue; }
    add(top.say, m.id + ' lesson');
    (top.steps || []).forEach(st => {
      add(AF.Engines.stepInfo(st, 'id').go, m.id + ' step card');
      walkLevel(Object.assign({ lang: 'id', tier: top.tier }, st), m.id + ' ' + st.step);
    });
  }
}

/* ---------- the party quest's spoken lines (core/app.js partySay) ---------- */
const party = [];
if (AF.PARTY && AF.PARTY.say) for (const [k, v] of Object.entries(AF.PARTY.say)) {
  const s = norm(v);
  party.push(s);
  add(v, 'party say.' + k);
}

const lines = [...found.keys()].sort();
const words = (t) => t.split(/\s+/).length;
const multi = lines.filter(t => words(t) > 1);
const one = lines.filter(t => words(t) === 1);
const letters = one.filter(t => t.length === 1);
const syll = one.filter(t => t.length > 1 && /^[bcdfghjklmnpqrstvwxyz]*[aeiou]+(ng|ny|[nts])?$/i.test(t) && t.length <= 4);
const whole = one.filter(t => !letters.includes(t) && !syll.includes(t));

fs.writeFileSync(OUT, JSON.stringify({
  lines, party, by: Object.fromEntries(found),
  counts: { total: lines.length, multi: multi.length, whole: whole.length, syllables: syll.length, letters: letters.length }
}, null, 1));
console.log(`${levels} Indonesian levels`);
console.log(`${lines.length} lines: ${multi.length} multi-word, ${whole.length} whole words, ${syll.length} syllables, ${letters.length} single letters`);
console.log(`party lines: ${party.length}`);
console.log(`dropped: ${dropped.html.size} with HTML in them, ${dropped.bad.size} with undefined/NaN`);
[...dropped.html].slice(0, 12).forEach(x => console.log('   html: ' + x));
[...dropped.bad].slice(0, 12).forEach(x => console.log('   bad:  ' + x));
if (threw.size) { console.log('GENERATORS THAT THREW (lines lost):'); for (const [k, v] of threw) console.log('  ' + k + ': ' + v); }
else console.log('every generator ran to the end');
console.log(`letters: ${letters.join(' ')}`);
