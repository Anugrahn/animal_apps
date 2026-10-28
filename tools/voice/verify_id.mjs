/* Checks the recorded Indonesian clips before anything is claimed about them.
     node verify_id.mjs <id_clips.json> <final wav dir> <app dir>
   * every clip exists, is a real MP3 and is not tiny
   * how long they are (from the 64 kbps CBR size, as docs/research does)
   * the 26 single letters in particular: peak and RMS of the paced WAV, so
     a silent or near-silent letter cannot pass as a recording
   * the line -> clip map in voice/index.js points at a file that is there  */
import fs from 'node:fs';

const [clipsF, FINAL, APP] = process.argv.slice(2);
const m = JSON.parse(fs.readFileSync(clipsF, 'utf8'));
const OUT = `${APP}/voice`;
/* What the app will really play for each line: voice/index.js is the
   authority, not the recording run — five Indonesian lines keep an English
   clip because their text is an English line too. */
const IDX = JSON.parse(fs.readFileSync(`${APP}/voice/index.js`, 'utf8').match(/\.VOICE = (\{[\s\S]*\});\s*$/)[1]);
const recorded = Object.assign({}, m.clips, m.party);
const all = {}, englishFallback = {};
for (const [line, o] of Object.entries(recorded)) {
  const playing = IDX.clips[line];
  if (playing === o) all[line] = o; else englishFallback[line] = playing;
}

function wav(p) {
  const b = fs.readFileSync(p);
  let i = 12, rate = 24000, off = 0, size = 0;
  while (i < b.length - 8) {
    const id = b.toString('ascii', i, i + 4), sz = b.readUInt32LE(i + 4);
    if (id === 'fmt ') rate = b.readUInt32LE(i + 12);
    if (id === 'data') { off = i + 8; size = sz; break; }
    i += 8 + sz + (sz & 1);
  }
  const n = size >> 1;
  let peak = 0, sum = 0;
  for (let k = 0; k < n; k++) { const v = b.readInt16LE(off + k * 2) / 32768; const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; }
  return { secs: n / rate, peak, rms: Math.sqrt(sum / Math.max(1, n)) };
}

console.log(`${Object.keys(recorded).length} lines recorded; ${Object.keys(all).length} play their Damayanti clip, ${Object.keys(englishFallback).length} play the English clip for the same text:`);
for (const [l, o] of Object.entries(englishFallback)) console.log(`   ${JSON.stringify(l)} -> ${o} (English)`);
let missing = 0, tiny = 0, notMp3 = 0, bytes = 0;
const secs = [];
for (const [line, o] of Object.entries(all)) {
  const p = `${OUT}/${o}.mp3`;
  if (!fs.existsSync(p)) { missing++; console.log(`MISSING ${o}.mp3  "${line}"`); continue; }
  const st = fs.statSync(p);
  bytes += st.size;
  if (st.size < 900) { tiny++; console.log(`TINY ${st.size} B  ${o}.mp3  "${line}"`); }
  const h = fs.readFileSync(p, { start: 0, end: 3 });
  // an MP3 frame starts FF Ex/Fx, or the file starts with an ID3 tag
  if (!((h[0] === 0xFF && (h[1] & 0xE0) === 0xE0) || h.toString('ascii', 0, 3) === 'ID3')) { notMp3++; console.log(`NOT MP3  ${o}.mp3  "${line}"`); }
  secs.push(st.size * 8 / 64000);
}
const q = (a, f) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * f))]; };
console.log(`\n${Object.keys(all).length} clips: ${missing} missing, ${tiny} under 900 B, ${notMp3} not an MP3`);
console.log(`length: min ${q(secs, 0).toFixed(2)} s, p10 ${q(secs, .1).toFixed(2)}, median ${q(secs, .5).toFixed(2)}, p90 ${q(secs, .9).toFixed(2)}, max ${q(secs, 1).toFixed(2)} s`);
console.log(`total ${(bytes / 1e6).toFixed(1)} MB`);

// the 26 single letters: real audio, not silence
console.log('\nthe 26 single letters (peak and RMS of the paced WAV):');
const letters = Object.entries(recorded).filter(([l]) => l.length === 1).sort();
let silent = 0;
for (const [l, o] of letters) {
  if (englishFallback[l]) {
    const e = fs.statSync(`${OUT}/${englishFallback[l]}.mp3`).size;
    console.log(`  ${l}  plays the ENGLISH clip ${englishFallback[l]} (${e} B) — its text is an English line too`);
    continue;
  }
  const w = wav(`${FINAL}/${o}.wav`);
  const mp3 = fs.statSync(`${OUT}/${o}.mp3`).size;
  const bad = w.peak < 0.02 || w.rms < 0.002;
  if (bad) silent++;
  console.log(`  ${l}  ${w.secs.toFixed(2)}s  peak ${w.peak.toFixed(3)}  rms ${w.rms.toFixed(4)}  ${String(mp3).padStart(6)} B  ${bad ? 'SILENT?' : 'ok'}`);
}
console.log(`${letters.length} letters, ${silent} suspiciously quiet`);

// the map the app actually reads
const idx = fs.readFileSync(`${APP}/voice/index.js`, 'utf8');
const V = JSON.parse(idx.match(/\.VOICE = (\{[\s\S]*\});\s*$/)[1]);
let unmapped = 0, dangling = 0;
for (const [line, o] of Object.entries(all)) if (V.clips[line] !== o) { unmapped++; if (unmapped < 6) console.log(`NOT IN index.js: "${line}"`); }
for (const [line, o] of Object.entries(V.clips)) if (!fs.existsSync(`${OUT}/${o}.mp3`)) { dangling++; if (dangling < 6) console.log(`index.js points at a missing clip: "${line}" -> ${o}`); }
console.log(`\nindex.js: ${Object.keys(V.clips).length} lines; ${unmapped} of the Indonesian lines not mapped, ${dangling} lines point at a clip that is not there`);
const files = JSON.parse(fs.readFileSync(`${APP}/voice/files.js`, 'utf8').match(/self\.VOICE_FILES = (\[[\s\S]*?\]);/)[1]);
const inFiles = new Set(files);
const notCached = Object.values(all).filter(o => !inFiles.has(`voice/${o}.mp3`)).length;
console.log(`files.js: ${files.length} entries; ${notCached} Indonesian clips not in the offline list`);
let total = 0; for (const f of fs.readdirSync(OUT)) total += fs.statSync(`${OUT}/${f}`).size;
console.log(`voice/ is now ${fs.readdirSync(OUT).length} files, ${(total / 1e6).toFixed(1)} MB`);
