// Voices every line in phrases.json (runs on this computer, nothing is
// sent anywhere) into animal-friends-v2/voice/.
//   node gen.mjs [--engine chatterbox] [--style lively]      natural, expressive (default)
//   node gen.mjs --engine kokoro [--voice af_heart] [--speed 1]   quicker to make, flatter
// Chatterbox needs the Python set-up in .venv (see README.md here).
// Writes voice/<id>.mp3, voice/index.js (line -> file, for the app) and
// voice/files.js (the list sw.js stores for offline use). Only new lines
// are voiced, so running it again after a content change is quick.
// After running it, bump VERSION in sw.js.
import { KokoroTTS } from 'kokoro-js';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { toMp3 } from './mp3.mjs';
import { readWav } from './wav.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ENGINE = arg('engine', 'chatterbox');
// Chatterbox styles: exaggeration (how lively) and cfg_weight (lower = slower, more relaxed pacing)
const STYLES = { calm: [0.5, 0.5], lively: [0.8, 0.3], bubbly: [1.1, 0.25] };
const STYLE = arg('style', 'lively');
const VOICE = ENGINE === 'kokoro' ? arg('voice', 'af_heart') : `chatterbox-${STYLE}`;
const SPEED = +arg('speed', '1');
const SOUND_SPEED = 0.75;                  // letter sounds: slower, so the sound is heard
const WAVS = new URL('./.wav-cache/', import.meta.url);   // Chatterbox takes, kept so a re-run is quick
const APP = new URL('../../animal-friends-v2/', import.meta.url);
const OUT = new URL('voice/', APP);
fs.mkdirSync(OUT, { recursive: true });

// The names a friend can have without typing: the ready-made friends
// (core/art.js PRESETS) and the maker's suggestions (core/app.js NAMES).
const art = fs.readFileSync(new URL('core/art.js', APP), 'utf8');
const app = fs.readFileSync(new URL('core/app.js', APP), 'utf8');
const presets = (art.match(/const PRESETS = \[([\s\S]*?)\];/) || [])[1] || '';
const NAMES = [...new Set([...presets.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1])
  .concat(((app.match(/const NAMES = \[([\s\S]*?)\];/) || [])[1] || '').match(/'([^']+)'/g).map(s => s.slice(1, -1))))];

const phrases = JSON.parse(fs.readFileSync(new URL('./phrases.json', import.meta.url), 'utf8'));
const bad = /undefined|NaN|\[object|null/;
// What the voice reads: no HTML, curly quotes made plain.
const spoken = (t) => t.replace(/<[^>]+>/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const id = (text, speed) => crypto.createHash('sha1').update(`${VOICE}|${speed}|${text}`).digest('hex').slice(0, 12);
// The app's file for a take after post.py has made it slower and clearer.
// (A new name whenever that changes, so phones never keep an old copy.)
const POST = 'kids-140-v2';
const outId = (f) => crypto.createHash('sha1').update(`${f}|${POST}`).digest('hex').slice(0, 12);
const FINAL = new URL('./.wav-final/', import.meta.url);

const presetNames = new Set([...presets.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]));
// What to voice first (priority.mjs): lines every subject uses, then each
// subject's Basic levels in turn, and so on. Lines the games make up as they
// go (maze, tracing, stories) come straight after the Basic levels.
const prioFile = new URL('./priority.json', import.meta.url);
const prio = fs.existsSync(prioFile) ? JSON.parse(fs.readFileSync(prioFile, 'utf8')) : {};
const LATE = 150000, OTHER_NAMES = 900000;
const jobs = [];                           // { text, speed, f, rank }: lower rank is made first
const allClips = {}, allNamed = {};
for (const [line, kind] of Object.entries(phrases)) {
  if (bad.test(line)) continue;
  const speed = kind === 'sound' ? SOUND_SPEED : SPEED;
  const rank = line in prio ? prio[line] : LATE;
  if (line.includes('{name}')) {
    allNamed[line] = {};
    for (const n of NAMES) {
      const text = line.split('{name}').join(n), f = id(text, speed), o = outId(f);
      allNamed[line][n] = o; jobs.push({ text, speed, f, o, rank: presetNames.has(n) ? rank + 1 : OTHER_NAMES + rank });
    }
  } else {
    const f = id(line, speed), o = outId(f); allClips[line] = o; jobs.push({ text: line, speed, f, o, rank });
  }
}
jobs.sort((a, b) => a.rank - b.rank);

const have = (f) => fs.existsSync(new URL(f + '.mp3', OUT));
const todo = jobs.filter(j => !have(j.o));
const ONLY_CONVERT = process.argv.includes('--convert-only');   // take what Chatterbox has made so far
console.log(`${jobs.length} clips (${Object.keys(allClips).length} lines + ${Object.keys(allNamed).length} name lines × ${NAMES.length} names), ${todo.length} to make, voice ${VOICE}`);

/* Puts every finished recording into the app: converts new takes to MP3
   and rewrites voice/index.js and voice/files.js. Run now and then while
   recording, so the app gets the new voice bit by bit (reload to hear it). */
function publish(quiet) {
  // new takes: slower and clearer (post.py), then a 64 kbps MP3 so consonants stay crisp
  const ready = todo.filter(j => !have(j.o) && fs.existsSync(new URL(j.f + '.wav', WAVS)));
  if (ready.length) {
    fs.mkdirSync(FINAL, { recursive: true });
    const list = new URL('./.post.json', import.meta.url);
    fs.writeFileSync(list, JSON.stringify(ready.map(j => ({ in: new URL(j.f + '.wav', WAVS).pathname, out: new URL(j.o + '.wav', FINAL).pathname,
      words: j.text.split(/\s+/).filter(Boolean).length, sound: j.speed === SOUND_SPEED }))));
    const r = spawnSync(new URL('./.venv/bin/python', import.meta.url).pathname, [new URL('./post.py', import.meta.url).pathname, list.pathname], { stdio: ['ignore', 'inherit', 'inherit'] });
    if (r.status !== 0) { console.error('post.py failed'); process.exit(1); }
    for (const j of ready) { const w = readWav(new URL(j.o + '.wav', FINAL).pathname); fs.writeFileSync(new URL(j.o + '.mp3', OUT), toMp3(w.samples, w.rate, 64)); }
  }
  // Only lines with a recording go in the list; the rest use the device's voice.
  const clips = {}, named = {};
  for (const [k, f] of Object.entries(allClips)) if (have(f)) clips[k] = f;
  for (const [k, m] of Object.entries(allNamed)) {
    const got = Object.fromEntries(Object.entries(m).filter(([, f]) => have(f)));
    if (Object.keys(got).length) named[k] = got;
  }
  // a moment of silence, played on the first tap so phones allow the voice later
  const s = new Float32Array(2400); s[1200] = 0.02;
  fs.writeFileSync(new URL('silence.mp3', OUT), toMp3(s, 24000, 32));
  // drop recordings no line uses any more
  const keep = new Set(jobs.map(j => j.o + '.mp3').concat(['silence.mp3', 'index.js', 'files.js']));
  for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) fs.unlinkSync(new URL(f, OUT));

  const head = `/* Made by tools/voice/gen.mjs (voice ${VOICE}). Do not edit by hand. */\n`;
  fs.writeFileSync(new URL('index.js', OUT), head +
    `(window.AF = window.AF || {}).VOICE = ${JSON.stringify({ voice: VOICE, clips, named })};\n`);
  // Stored for offline use: every line, and the name lines for the
  // ready-made friends. The rest are stored the first time they are played.
  const offline = Object.values(clips).concat(...Object.values(named).map(m => Object.entries(m).filter(([n]) => presetNames.has(n)).map(([, f]) => f)));
  fs.writeFileSync(new URL('files.js', OUT), head +
    `self.VOICE_FILES = ${JSON.stringify(['voice/index.js', 'voice/silence.mp3'].concat([...new Set(offline)].map(f => 'voice/' + f + '.mp3')))};\n`);
  let bytes = 0; for (const f of fs.readdirSync(OUT)) bytes += fs.statSync(new URL(f, OUT)).size;
  if (!quiet) console.log(`voice/ is ${(bytes / 1e6).toFixed(1)} MB; ${Object.keys(clips).length} of ${Object.keys(allClips).length} lines and ${Object.keys(named).length} name lines recorded; ${offline.length} clips stored for offline use`);
}

if (todo.length && ENGINE === 'chatterbox' && !ONLY_CONVERT) {
  const [ex, cfg] = STYLES[STYLE];
  const list = new URL('./.todo.json', import.meta.url);
  // letter sounds are said calmly, so the sound itself is clear
  fs.writeFileSync(list, JSON.stringify(todo.map(j => ({ text: spoken(j.text), f: j.f, ex: j.speed === SOUND_SPEED ? 0.5 : ex, cfg }))));
  const py = spawn(new URL('./.venv/bin/python', import.meta.url).pathname, [new URL('./gen_cb.py', import.meta.url).pathname, list.pathname, WAVS.pathname],
    { stdio: ['ignore', 'pipe', 'inherit'], env: Object.assign({}, process.env, { PYTORCH_ENABLE_MPS_FALLBACK: '1' }) });
  py.stdout.on('data', (d) => {
    process.stdout.write(d);
    const m = String(d).match(/^(\d+)\//m);
    if (m && +m[1] % 50 === 0) publish();
  });
  const code = await new Promise(r => py.on('close', r));
  if (code !== 0) { publish(); process.exit(code || 1); }
} else if (todo.length && ENGINE === 'kokoro') {
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
  const t0 = Date.now();
  for (const [i, j] of todo.entries()) {
    const a = await tts.generate(spoken(j.text), { voice: VOICE, speed: j.speed });
    fs.mkdirSync(WAVS, { recursive: true });
    await a.save(new URL(j.f + '.wav', WAVS).pathname);
    if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/${todo.length}  ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min`);
  }
}
publish();
