// Float samples from Kokoro -> a small mono MP3 (for phones: 48 kbps).
import { Mp3Encoder } from '@breezystack/lamejs';

export function toMp3(samples, rate, kbps = 48) {
  // trim near-silence at both ends, keep a short tail so words do not clip
  const thr = 0.008, pad = Math.round(rate * 0.04);
  let a = 0, b = samples.length - 1;
  while (a < b && Math.abs(samples[a]) < thr) a++;
  while (b > a && Math.abs(samples[b]) < thr) b--;
  const s = samples.subarray(Math.max(0, a - pad), Math.min(samples.length, b + pad * 3));
  const pcm = new Int16Array(s.length);
  for (let i = 0; i < s.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(s[i] * 32767)));
  const enc = new Mp3Encoder(1, rate, kbps), out = [];
  for (let i = 0; i < pcm.length; i += 1152) { const buf = enc.encodeBuffer(pcm.subarray(i, i + 1152)); if (buf.length) out.push(Buffer.from(buf)); }
  const end = enc.flush(); if (end.length) out.push(Buffer.from(end));
  return Buffer.concat(out);
}
