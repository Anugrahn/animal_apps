/* Puts the recorded Bahasa Indonesia clips into the app, additively: the
   English entries already in voice/index.js and voice/files.js are left
   exactly as they are, so the change is a clean add on either branch.
     node publish_id.mjs <id_clips.json> <app dir> [--party]
   Without --party the five content/party.js lines are left out (they mean
   nothing on `main`, which has no party edition); with it they are added.  */
import fs from 'node:fs';

const [clipsF, APP, ...flags] = process.argv.slice(2);
const WITH_PARTY = flags.includes('--party');
const m = JSON.parse(fs.readFileSync(clipsF, 'utf8'));
const add = Object.assign({}, m.clips, WITH_PARTY ? m.party : {});

const idxF = `${APP}/voice/index.js`, filesF = `${APP}/voice/files.js`;

/* ---- voice/index.js: line -> clip, the one map the app looks a line up in ---- */
const idx = fs.readFileSync(idxF, 'utf8');
const mm = idx.match(/\.VOICE = (\{[\s\S]*\});\s*$/);
if (!mm) { console.error('voice/index.js is not in the shape this expects'); process.exit(1); }
const V = JSON.parse(mm[1]);
const before = Object.keys(V.clips).length;
/* A clip is looked up by the line's own text, with no language attached, so
   a text that is BOTH an English line and an Indonesian one can only have
   one recording. Five do: "a", "bat", "bus", "do" and "to" (English words,
   and in Indonesian the letter a and the syllables of o-bat, bus, ka-do,
   to-pi). The English recording is kept: English is the subject played
   every day, and repointing it would make an English lesson say those
   words in an Indonesian voice. Those five Indonesian lines therefore fall
   back to the English clip, exactly as they did before this pass fell back
   to the device. They are listed, not hidden. */
let added = 0;
const clash = [];
for (const [line, o] of Object.entries(add)) {
  if (V.clips[line] === o) continue;
  if (V.clips[line]) { clash.push(`${JSON.stringify(line)} keeps its English clip ${V.clips[line]} (Damayanti take ${o} unused)`); continue; }
  V.clips[line] = o;
  added++;
}
const skipped = new Set(clash.map(c => JSON.parse(c.split(' keeps')[0])));
// which voice said what, so a later pass can tell the two apart
V.voiceId = m.voice;
const head = `/* Made by tools/voice/gen.mjs (voice ${V.voice}); the Bahasa Indonesia\n   lines by tools/voice/record_id.mjs (voice ${m.voice}). Do not edit by hand. */\n`;
fs.writeFileSync(idxF, head + `(window.AF = window.AF || {}).VOICE = ${JSON.stringify(V)};\n`);
console.log(`voice/index.js: ${before} lines -> ${Object.keys(V.clips).length} (${added} added)`);
if (clash.length) { console.log(`${clash.length} line(s) a recording already existed for, left alone:`); clash.forEach(c => console.log('  ' + c)); }

/* ---- voice/files.js: what sw.js stores for offline use ---- */
const fl = fs.readFileSync(filesF, 'utf8');
const fm = fl.match(/self\.VOICE_FILES = (\[[\s\S]*?\]);/);
if (!fm) { console.error('voice/files.js is not in the shape this expects'); process.exit(1); }
const list = JSON.parse(fm[1]);
const have = new Set(list);
let newFiles = 0;
for (const [line, o] of Object.entries(add)) {
  if (skipped.has(line)) continue;
  const p = `voice/${o}.mp3`;
  if (!have.has(p)) { list.push(p); have.add(p); newFiles++; }
}
fs.writeFileSync(filesF, head + `self.VOICE_FILES = ${JSON.stringify(list)};\n`);

let bytes = 0, missing = 0;
for (const p of list) { try { bytes += fs.statSync(`${APP}/${p}`).size; } catch (e) { missing++; } }
console.log(`voice/files.js: ${list.length} entries (${newFiles} added), ${(bytes / 1e6).toFixed(1)} MB stored for offline use, ${missing} missing`);
