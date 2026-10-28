/* Finds the `say -r` rate whose clips land nearest 125 words a minute
   AFTER post.py has paced them.
     node calibrate.mjs <id_lines.json> <work dir> <rate> [rate ...]          */
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';

/* post.py, the Python it needs and the MP3 encoder all live beside this
   file, found the way gen.mjs finds them, so the toolchain works from
   whichever checkout it is run in. */
const HERE = new URL('./', import.meta.url).pathname;
const PY = new URL('./.venv/bin/python', import.meta.url).pathname;
const POST_PY = new URL('./post.py', import.meta.url).pathname;
const [lines_f, work, ...rates] = process.argv.slice(2);
const all = JSON.parse(fs.readFileSync(lines_f, 'utf8')).lines;
const words = (t) => t.trim().split(/\s+/).length;

// a stratified sample: the short lines matter as much as the long ones
const by = (f) => all.filter(f);
const take = (list, n) => { const out = []; for (let i = 0; i < n && i < list.length; i++) out.push(list[Math.floor(i * list.length / n)]); return out; };
const SAMPLE = [].concat(
  take(by(t => t.length === 1), 5),
  take(by(t => words(t) === 1 && t.length > 1 && t.length <= 4), 6),
  take(by(t => words(t) === 1 && t.length > 4), 5),
  take(by(t => words(t) === 2), 5),
  take(by(t => words(t) >= 3 && words(t) <= 5), 10),
  take(by(t => words(t) >= 6 && words(t) <= 9), 8),
  take(by(t => words(t) >= 10), 6)
);
console.log(`${SAMPLE.length} lines sampled from ${all.length}`);

function wavSecs(p) {
  const b = fs.readFileSync(p);
  let i = 12, rate = 24000, n = 0;
  while (i < b.length - 8) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === 'fmt ') rate = b.readUInt32LE(i + 12);
    if (id === 'data') { n = size >> 1; break; }
    i += 8 + size + (size & 1);
  }
  return n / rate;
}
const median = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

const results = [];
for (const r of rates) {
  const raw = `${work}/cal-${r}/raw`, out = `${work}/cal-${r}/out`;
  fs.mkdirSync(raw, { recursive: true }); fs.mkdirSync(out, { recursive: true });
  const jobs = [];
  const t0 = Date.now();
  for (const text of SAMPLE) {
    const f = crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
    const inp = `${raw}/${f}.wav`;
    if (!fs.existsSync(inp)) {
      const s = spawnSync('say', ['-v', 'Damayanti', '-r', String(r), '--file-format=WAVE', '--data-format=LEI16@24000', '-o', inp, text]);
      if (s.status !== 0) { console.error(`say failed on "${text}"`, String(s.stderr)); process.exit(1); }
    }
    jobs.push({ in: inp, out: `${out}/${f}.wav`, text, kind: 'say' });
  }
  const sayS = (Date.now() - t0) / 1000;
  const listF = `${work}/cal-${r}/post.json`;
  fs.writeFileSync(listF, JSON.stringify(jobs));
  const p = spawnSync(PY, [POST_PY, listF], { encoding: 'utf8' });
  if (p.status !== 0) { console.error('post.py failed:', p.stderr); process.exit(1); }
  const rawW = [], outW = [];
  for (const j of jobs) {
    const w = words(j.text);
    if (w < 3) continue;                               // post.py only rates 3 words and up
    rawW.push(w / wavSecs(j.in) * 60);
    outW.push(w / wavSecs(j.out) * 60);
  }
  const m = median(outW);
  results.push({ rate: +r, rawMedian: median(rawW), outMedian: m, sayS });
  console.log(`-r ${String(r).padStart(3)}  raw median ${median(rawW).toFixed(0).padStart(3)} wpm  ->  after post.py ${m.toFixed(1).padStart(5)} wpm   (${(sayS / SAMPLE.length).toFixed(2)} s a line)`);
  console.log('           ' + (p.stdout || '').trim());
}
const best = results.slice().sort((a, b) => Math.abs(a.outMedian - 125) - Math.abs(b.outMedian - 125))[0];
console.log(`\nclosest to 125 wpm: -r ${best.rate} (median ${best.outMedian.toFixed(1)} wpm)`);
fs.writeFileSync(`${work}/calibration.json`, JSON.stringify({ sample: SAMPLE.length, results, best }, null, 1));
