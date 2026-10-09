// A page of voice samples to choose from:  node samples.mjs <out dir>
import { KokoroTTS } from 'kokoro-js';
import fs from 'node:fs';
import { toMp3 } from './mp3.mjs';

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const VOICES = ['af_heart', 'af_bella', 'af_nicole', 'bf_emma'];
const LINES = [
  'Hooray! You found the apple! Well done!',
  'Which letter says sss?',
  'Rex found a tiny seed. What will it grow into?',
  'Pick up three apples, only apples! Then find the house!',
  'Good try! Let’s do it together.'
];
const SOUNDS = ['sss', 'tuh', 'ah', 'puh'];
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu' });
const rows = [];
for (const v of VOICES) {
  const cells = [];
  for (const [i, t] of LINES.concat(SOUNDS).entries()) {
    const a = await tts.generate(t, { voice: v, speed: i < LINES.length ? 1.0 : 0.8 });
    const f = `${v}-${i}.mp3`;
    fs.writeFileSync(`${OUT}/${f}`, toMp3(a.audio, a.sampling_rate));
    cells.push({ f, t });
  }
  rows.push({ v, cells });
  console.log('done', v);
}
const html = `<!doctype html><meta charset="utf-8"><title>Voice samples</title>
<style>body{font:16px system-ui;margin:24px;background:#FFFBF1;color:#3A2A18}h1{font-size:22px}table{border-collapse:collapse}td,th{padding:8px 10px;border-bottom:1px solid #EBDDC4;text-align:left;vertical-align:top}
button{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid #D9C6A2;background:#fff;cursor:pointer;margin:2px}small{color:#8A7556}</style>
<h1>Animal Friends — pick a voice</h1>
<p>Click to play. "Squeaky" is the same voice played a little higher and faster (the app's squeaky-voice friends). Letter sounds are on the right.</p>
<table><tr><th>Voice</th>${LINES.map(t => `<th><small>${t}</small></th>`).join('')}<th>Letter sounds</th></tr>
${rows.map(r => `<tr><th>${r.v}</th>${r.cells.slice(0, LINES.length).map(c => `<td><button onclick="p('${c.f}',1)">▶ normal</button><button onclick="p('${c.f}',1.15)">▶ squeaky</button></td>`).join('')}
<td>${r.cells.slice(LINES.length).map(c => `<button onclick="p('${c.f}',1)">/${c.t}/</button>`).join('')}</td></tr>`).join('')}
</table>
<script>let a;function p(f,r){if(a)a.pause();a=new Audio(f);a.preservesPitch=false;a.playbackRate=r;a.play();}</script>`;
fs.writeFileSync(`${OUT}/index.html`, html);
console.log('wrote', OUT + '/index.html');
