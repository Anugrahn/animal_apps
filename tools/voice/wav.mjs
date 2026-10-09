// Reads a 16-bit PCM mono WAV (as Chatterbox writes them) into floats.
import fs from 'node:fs';

export function readWav(path) {
  const b = fs.readFileSync(path);
  let i = 12, rate = 24000, data = null;
  while (i < b.length) {
    const id = b.toString('ascii', i, i + 4), size = b.readUInt32LE(i + 4);
    if (id === 'fmt ') rate = b.readUInt32LE(i + 12);
    if (id === 'data') { data = b.subarray(i + 8, i + 8 + size); break; }
    i += 8 + size + (size & 1);
  }
  const n = data.length >> 1, out = new Float32Array(n);
  for (let k = 0; k < n; k++) out[k] = data.readInt16LE(k * 2) / 32768;
  return { samples: out, rate };
}
