// A sound effect must never ring over the friend's voice, and stopping a
// line must not leave a click. Asks a letter-sound question in the choose,
// pop and trace games and answers it part way through the letter — when a
// child who knows the answer taps — then looks at what came out.
//   node chime.mjs            (app served on :8765)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:8765/';
const LETTERS = ['s', 'm', 't', 'p'];
const bad = [];

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
const p = await ctx.newPage();
p.on('pageerror', e => bad.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') bad.push('console: ' + m.text()); });

// everything the app plays is teed into a recorder, so the samples can be read
await p.addInitScript(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  window.__pcm = [];
  class Rec extends AC {
    constructor(...a) {
      super(...a);
      window.__ctx = this;
      this.__tee = this.createGain();
      const sp = this.createScriptProcessor(2048, 2, 2);
      sp.onaudioprocess = (e) => {
        const l = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < l.length; i++) window.__pcm.push(l[i]);
        e.outputBuffer.getChannelData(0).fill(0);
        e.outputBuffer.getChannelData(1).fill(0);
      };
      this.__tee.connect(sp); sp.connect(super.destination);
      Object.defineProperty(this, 'destination', { get: () => this.__tee });
    }
  }
  window.AudioContext = Rec; window.webkitAudioContext = Rec;
});

await p.goto(BASE + 'index.html?go=home&friend=0');
await p.waitForTimeout(900);
await p.evaluate(() => { AF.Profile.setSetting('speech', 'tap'); AF.Profile.setSetting('open', true); AF.Profile.setSetting('sound', true); });

// 1. a sound effect over the voice, in every game that asks a letter
for (const type of ['choose', 'pop', 'trace']) {
  for (const into of [40, 400]) {
    const out = await p.evaluate(async ([type, into, letters]) => {
      const A = AF.Audio;
      A.unlock();
      if (!A.__spy) {
        A.__spy = 1;
        const say0 = A.say.bind(A);
        A.say = function (text, o) {
          o = Object.assign({}, o || {});
          const prev = o.onEnd;
          const rec = { text: String(text), at: performance.now() };
          window.__said.push(rec);
          window.__now = rec;
          o.onEnd = () => { if (window.__now === rec) window.__now = null; if (prev) prev(); };
          return say0(text, o);
        };
        const stop0 = A.stop.bind(A);
        A.stop = function () { window.__now = null; return stop0(); };
        // Only the "right" and "win" chimes: the little touch ticks (pop, step,
        // tap) answer the finger, and the soft "wrong" tone is meant not to cut
        // a question off. A chime asks the voice to stop first, so what matters
        // is whether the friend is still talking once it has.
        ['right', 'win'].forEach(k => {
          const f = A.SFX[k];
          A.SFX[k] = function () {
            const was = window.__now;
            const r = f.apply(this, arguments);
            if (A.busy() && was) window.__over.push({ sfx: k, over: was.text });
            return r;
          };
        });
      }
      window.__said = []; window.__over = []; window.__now = null;

      const lines = ['Which letter says', AF.Engines.t({ level: {} }, 'traceLetter')]
        .concat(letters.map(l => AF.PHONICS[l].say))
        .concat(letters.map(l => `${l} … ${AF.PHONICS[l].say} … ${AF.PHONICS[l].word}`));
      A.preload(lines);
      for (let i = 0; i < 80 && !lines.every(l => A.ready(l)); i++) await new Promise(r => setTimeout(r, 100));

      const mod = AF.module('phonics');
      const lv = type === 'trace'
        ? { id: '__chime', title: 'probe', type: 'trace', kind: 'letter', rounds: 1, set: letters.slice(0, 2) }
        : { id: '__chime', title: 'probe', type: type, rounds: 1, need: 1,
            gen: (c) => (window.__round = AF.Gen.letterSound(letters, 3, [letters[0]])(c)) };
      mod.levels.push(lv);
      document.getElementById('result').hidden = true;
      AF.App.startLevel(mod, lv, mod.levels.length - 1);

      // wait until the friend is saying the letter itself, then answer into it
      const isLetter = (t) => letters.some(l => AF.PHONICS[l].say === t);
      for (let i = 0; i < 150; i++) {
        if (window.__now && isLetter(window.__now.text)) break;
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => setTimeout(r, into));
      if (type === 'trace') {
        const st = document.querySelector('#play-host .stage-trace');
        for (let k = 0; k < 8 && st && st._key; k++) { st._key(); await new Promise(r => setTimeout(r, 20)); }
      } else {
        const r = window.__round;
        const sel = type === 'pop' ? '#play-host .pop-b' : '#play-host .opt';
        for (let i = 0; i < 60; i++) {
          const btns = [...document.querySelectorAll(sel)];
          const hit = type === 'pop' ? btns.find(b => b.dataset.ok === '1')
                                     : btns[r.options.findIndex(o => o.key === r.answer)];
          if (hit) { hit.click(); break; }
          await new Promise(r2 => setTimeout(r2, 50));
        }
      }
      await new Promise(r => setTimeout(r, 900));
      AF.Audio.stop();
      mod.levels.pop();
      return { over: window.__over, said: window.__said.map(s => s.text) };
    }, [type, into, LETTERS]);
    out.over.forEach(o => bad.push(`${type}, answered ${into}ms into the letter: the "${o.sfx}" sound rang over ${JSON.stringify(o.over)}`));
  }
}

// 2. a line stopped in its tracks must fade, not step straight to silence
const cuts = await p.evaluate(async ([letters]) => {
  const A = AF.Audio;
  const lines = letters.map(l => AF.PHONICS[l].say);
  A.preload(lines);
  for (let i = 0; i < 80 && !lines.every(l => A.ready(l)); i++) await new Promise(r => setTimeout(r, 100));
  const out = [];
  for (const line of lines) {
    window.__pcm.length = 0;
    A.say(line);
    await new Promise(r => setTimeout(r, 350));
    A.stop();                                   // exactly what answering does
    await new Promise(r => setTimeout(r, 400));
    const a = window.__pcm;
    let end = a.length - 1;
    while (end > 0 && a[end] === 0) end--;
    out.push({ line, last: Math.abs(a[end] || 0), ready: A.ready(line) });
  }
  return out;
}, [LETTERS]);
cuts.forEach(c => {
  if (!c.ready) { console.log(`info    ${c.line}: not played from memory, the click cannot be checked`); return; }
  if (c.last > 0.02) bad.push(`stopping ${JSON.stringify(c.line)} steps from ${c.last.toFixed(3)} straight to silence: a click`);
  else console.log(`info    ${c.line}: fades to ${c.last.toFixed(4)} before silence`);
});

bad.forEach(x => console.log('PROBLEM ' + x));
console.log(bad.length ? `${bad.length} problems` : 'OK');
await browser.close();
process.exit(bad.length ? 1 : 0);
