/* Records every harvested Bahasa Indonesia line with the macOS voice
   Damayanti, paces it the way the app's English clips are paced (post.py,
   about 125 words a minute) and writes the app's own 64 kbps mono MP3.
     node record_id.mjs <id_lines.json> <rate> <work dir> <app dir>
   Naming follows tools/voice/gen.mjs exactly, so nothing at playback has
   to know a clip is Indonesian:
     f = sha1("<voice>|<speed>|<text>")[:12]     the take
     o = sha1("<f>|kids-125-v3")[:12]            voice/<o>.mp3, what the app plays
   Writes <work dir>/id_clips.json: { voice, rate, clips: {line: o}, party: [...] }  */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

/* post.py, the Python it needs and the MP3 encoder all live beside this
   file, found the way gen.mjs finds them, so the toolchain works from
   whichever checkout it is run in. */
const HERE = new URL('./', import.meta.url).pathname;
const PY = new URL('./.venv/bin/python', import.meta.url).pathname;
const POST_PY = new URL('./post.py', import.meta.url).pathname;
const { toMp3 } = await import(new URL('./mp3.mjs', import.meta.url));
const { readWav } = await import(new URL('./wav.mjs', import.meta.url));

const [linesF, rateArg, work, APP] = process.argv.slice(2);
if (!APP) { console.error('usage: node record_id.mjs <id_lines.json> <rate> <work dir> <app dir>'); process.exit(1); }
const RATE = +rateArg;
const data = JSON.parse(fs.readFileSync(linesF, 'utf8'));
const LINES = data.lines, PARTY = new Set(data.party);

const VOICE = `say-damayanti-r${RATE}`;
const POST = 'kids-125-v3';                 // the same pacing gen.mjs names its clips after
const SPEED = 1;
const id = (text) => crypto.createHash('sha1').update(`${VOICE}|${SPEED}|${text}`).digest('hex').slice(0, 12);
const outId = (f) => crypto.createHash('sha1').update(`${f}|${POST}`).digest('hex').slice(0, 12);

const RAW = `${work}/raw-r${RATE}`, FINAL = `${work}/final-r${RATE}`;
const OUT = `${APP}/voice`;
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(FINAL, { recursive: true });

const jobs = LINES.map(text => { const f = id(text); return { text, f, o: outId(f), raw: `${RAW}/${f}.wav`, fin: `${FINAL}/${outId(f)}.wav`, mp3: `${OUT}/${outId(f)}.mp3` }; });

/* A new clip must never land on a name an English clip already uses, and two
   lines must never land on the same name. 12 hex characters make that very
   unlikely; it is checked rather than assumed. */
const existing = new Set(fs.readdirSync(OUT).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));
const seen = new Map(), clashes = [];
for (const j of jobs) {
  if (seen.has(j.o)) clashes.push(`${j.o}: "${seen.get(j.o)}" and "${j.text}"`);
  seen.set(j.o, j.text);
  if (existing.has(j.o)) clashes.push(`${j.o} is already an English clip ("${j.text}")`);
}
if (clashes.length) { console.error('NAME CLASH — nothing written:\n' + clashes.join('\n')); process.exit(1); }
console.log(`${jobs.length} lines, voice ${VOICE}, no name clash with the ${existing.size} clips already there`);

/* ---- 1. say ---- */
let said = 0, t0 = Date.now();
for (const j of jobs) {
  if (fs.existsSync(j.raw) && fs.statSync(j.raw).size > 1000) continue;
  const s = spawnSync('say', ['-v', 'Damayanti', '-r', String(RATE), '--file-format=WAVE', '--data-format=LEI16@24000', '-o', j.raw, j.text]);
  if (s.status !== 0 || !fs.existsSync(j.raw)) { console.error(`say failed: "${j.text}"\n${s.stderr}`); process.exit(1); }
  if (++said % 100 === 0) console.log(`  said ${said}  ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
}
console.log(`said ${said} new takes (${jobs.length - said} already recorded), ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);

/* ---- 2. post.py, in batches so progress shows ---- */
const todo = jobs.filter(j => !fs.existsSync(j.mp3));
const BATCH = 120;
t0 = Date.now();
for (let i = 0; i < todo.length; i += BATCH) {
  const part = todo.slice(i, i + BATCH).filter(j => !fs.existsSync(j.fin));
  if (part.length) {
    const listF = `${work}/post-r${RATE}.json`;
    fs.writeFileSync(listF, JSON.stringify(part.map(j => ({ in: j.raw, out: j.fin, text: j.text, kind: 'say' }))));
    const p = spawnSync(PY, [POST_PY, listF], { encoding: 'utf8' });
    if (p.status !== 0) { console.error('post.py failed:', p.stderr); process.exit(1); }
    process.stdout.write(`  ${Math.min(i + BATCH, todo.length)}/${todo.length}  ${(p.stdout || '').trim()}  ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min\n`);
  }
  /* ---- 3. the app's MP3 ---- */
  for (const j of todo.slice(i, i + BATCH)) {
    const w = readWav(j.fin);
    fs.writeFileSync(j.mp3, toMp3(w.samples, w.rate, 64));
  }
}

/* ---- 4. what the app needs to know ---- */
const clips = {}, party = {};
for (const j of jobs) (PARTY.has(j.text) ? party : clips)[j.text] = j.o;
fs.writeFileSync(`${work}/id_clips.json`, JSON.stringify({ voice: VOICE, rate: RATE, post: POST, clips, party }, null, 1));

const rates = JSON.parse(fs.readFileSync(`${FINAL}/rates.json`, 'utf8'));
const vals = Object.values(rates).sort((a, b) => a - b);
const med = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
let bytes = 0; for (const j of jobs) bytes += fs.statSync(j.mp3).size;
console.log(`\n${jobs.length} clips (${Object.keys(clips).length} app lines + ${Object.keys(party).length} party lines), ${(bytes / 1e6).toFixed(1)} MB`);
console.log(`median ${med} words a minute over the ${vals.length} lines post.py rates (3 words and up)`);
