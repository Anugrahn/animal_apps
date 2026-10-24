/* ============================================================
   engines/trace.js — write a letter, a number, a word or a line
   ------------------------------------------------------------
   level: { kind: 'letter' | 'number' | 'line' | 'word', set: [...], rounds, ordered? }
   A word's item may bring its own lines (Bahasa Indonesia does):
     { w, e, say, text, praise, sound }

   Written again in v4.1 to feel smooth (the first one jumped ahead
   of the finger and hurried on):

     * Watch me. The friend's pencil writes the glyph first, calmly,
       one stroke at a time. A tap skips it.
     * The ink glides. The finger is matched to the line a little way
       ahead of the ink, and the ink eases towards that point frame by
       frame, so a jerky finger still draws one smooth line.
     * Forgiving, but no shortcuts. The finger has to stay near the
       line (a share of the glyph's size, so a small letter is no
       harder) and cannot leap ahead; a lifted finger carries on from
       the end of the ink.
     * Where and which way. Each stroke starts at a numbered green
       dot, little arrows show the way, the next strokes wait as grey
       numbers, and a finished stroke stays drawn.
     * Time to enjoy it. A finished letter glows and is named, and
       the next one waits until the friend has finished talking.

   Tracing cannot be done "wrong" and never costs a star.
   (Space or Enter moves the ink along too, for a keyboard.)
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;
  const NS = 'http://www.w3.org/2000/svg';

  /* One path per pen stroke, in a 100 x 124 box, in the order and the
     direction a child is taught to write them. Letters sit on a line
     at y = 90; tall ones start at y = 16. */
  const STROKES = {
    s: ['M66 54 C58 42 36 43 36 56 C36 70 66 64 66 79 C66 93 42 94 34 82'],
    a: ['M64 57 C56 42 34 44 34 67 C34 90 58 94 64 76', 'M64 46 L64 90'],
    t: ['M50 18 L50 78 C50 89 58 92 66 87', 'M35 46 L66 46'],
    p: ['M38 46 L38 118', 'M38 58 C46 42 68 44 68 67 C68 90 46 92 38 78'],
    i: ['M50 48 L50 90', 'M50 26 L50 31'],
    n: ['M38 46 L38 90', 'M38 60 C46 42 66 42 66 62 L66 90'],
    m: ['M26 46 L26 90', 'M26 60 C32 42 50 42 50 62 L50 90', 'M50 60 C56 42 74 42 74 62 L74 90'],
    d: ['M64 58 C56 42 34 44 34 67 C34 90 56 94 64 78', 'M64 16 L64 90'],
    g: ['M64 58 C56 42 34 44 34 67 C34 90 56 92 64 76', 'M64 46 L64 104 C64 120 42 120 36 108'],
    o: ['M50 46 C29 46 29 90 50 90 C71 90 71 46 50 46'],
    c: ['M66 56 C58 42 34 44 34 68 C34 92 58 94 66 80'],
    k: ['M38 16 L38 90', 'M66 48 L38 70', 'M46 64 L68 90'],
    e: ['M36 68 L66 68 C66 42 34 42 34 68 C34 94 58 94 66 82'],
    u: ['M36 46 L36 72 C36 94 64 94 64 72', 'M64 46 L64 90'],
    r: ['M40 46 L40 90', 'M40 62 C46 46 58 44 66 50'],
    h: ['M38 16 L38 90', 'M38 62 C46 42 66 42 66 62 L66 90'],
    b: ['M38 16 L38 90', 'M38 58 C46 42 68 44 68 67 C68 90 46 92 38 78'],
    f: ['M66 22 C56 12 46 18 46 32 L46 90', 'M34 46 L62 46'],
    l: ['M50 16 L50 90'],
    j: ['M56 48 L56 104 C56 120 36 120 30 108', 'M56 26 L56 31'],
    q: ['M64 58 C56 42 34 44 34 67 C34 90 56 92 64 76', 'M64 46 L64 118'],
    v: ['M32 46 L50 90 L68 46'],
    w: ['M20 46 L33 90 L50 56 L67 90 L80 46'],
    x: ['M34 46 L66 90', 'M66 46 L34 90'],
    y: ['M34 46 L51 86', 'M67 46 L42 118'],
    z: ['M34 46 L66 46 L34 90 L68 90'],
    0: ['M50 16 C25 16 25 90 50 90 C75 90 75 16 50 16'],
    1: ['M36 32 L52 16 L52 90'],
    2: ['M32 34 C34 10 70 12 68 36 C66 52 44 66 32 90 L70 90'],
    3: ['M32 24 C44 10 68 16 66 34 C64 48 50 50 46 50 C58 50 70 58 68 72 C66 92 40 94 30 80'],
    4: ['M58 16 L28 66 L74 66', 'M58 16 L58 90'],
    5: ['M66 16 L38 16 L34 48 C46 40 70 44 68 66 C66 92 40 94 30 80'],
    6: ['M62 18 C40 26 30 50 32 70 C34 94 68 94 68 70 C68 50 40 48 33 66'],
    7: ['M30 16 L70 16 L44 90'],
    8: ['M50 51 C30 45 34 16 50 16 C66 16 70 45 50 51 C28 59 30 90 50 90 C70 90 72 59 50 51'],
    9: ['M68 42 C66 14 32 14 32 40 C32 62 62 60 68 40 L64 90'],
    across: ['M16 62 L84 62'],
    down: ['M50 18 L50 106'],
    slide: ['M20 28 L80 100'],
    zigzag: ['M14 88 L32 40 L50 88 L68 40 L86 88'],
    wave: ['M12 62 C22 28 38 28 50 62 C62 96 78 96 88 62'],
    hill: ['M16 96 C16 20 84 20 84 96'],
    circle: ['M50 22 C18 22 18 102 50 102 C82 102 82 22 50 22'],
    square: ['M24 30 L76 30 L76 96 L24 96 L24 30'],
    triangle: ['M50 22 L84 98 L16 98 L50 22'],
    loop: ['M14 84 C40 84 66 60 56 40 C48 24 30 34 38 52 C48 76 72 84 88 84']
  };
  AF.STROKES = STROKES;
  const LINE_NAMES = { across: 'a line across', down: 'a line down', slide: 'a slide', zigzag: 'a zig zag', wave: 'a wave',
    hill: 'a hill', circle: 'a circle', square: 'a square', triangle: 'a triangle', loop: 'a loop' };

  /* How it feels, in shares of the visible board (about 70–110 units
     wide, so a small letter is as easy as a big one). */
  const NEAR = 0.15;          // the finger must be this close to the line
  const AHEAD = 0.17;         // and at most this far ahead of the ink
  const GRAB = 1.5;           // a fresh touch starts this many NEARs from the end of the ink
  const END = 0.05;           // this close to the end of a stroke finishes it
  const EASE = 0.28;          // the share of the way to the finger the ink goes each frame
  const DEMO = 70;            // the friend writes this many units a second
  const TICK = 16;            // a soft tick every this many units drawn

  E.trace = function (S) {
    const lv = S.level;
    const pool = lv.ordered ? lv.set.slice() : U.shuffle(lv.set);
    const rounds = Math.min(lv.rounds || pool.length, pool.length);
    let saidTurn = false, saidStart = false;

    /* What one round asks for: a list of glyphs to trace in turn. */
    function job(x) {
      if (lv.kind === 'word') {
        const glyphs = x.w.replace(/\s+/g, '').split('');
        return { glyphs: glyphs, say: x.say || E.t(S, 'write', x.w), text: x.text || E.t(S, 'writeText', x.w),
          pic: x.e || '', word: glyphs.length > 1 ? x.w : '', praise: x.praise || x.w, sound: x.sound };
      }
      if (lv.kind === 'number') {
        const n = +x;
        return { glyphs: String(x).split(''), say: E.t(S, 'traceNum', n), text: E.t(S, 'traceNumText', x),
          pic: n <= 10 ? AF.Gen.row('⭐', n) : '', praise: lv.lang === 'id' ? String(n) : (AF.NUM[n] || String(n)) };
      }
      if (lv.kind === 'line') return { glyphs: [x], say: `Draw ${LINE_NAMES[x]}.`, text: `Draw <b>${LINE_NAMES[x]}</b>`, pic: '', praise: 'Lovely!' };
      const ph = AF.PHONICS[x];
      return { glyphs: [x], say: E.t(S, 'traceLetter'), sound: ph.say, text: `Trace <b>${x}</b>`,
        pic: `<span class="big-e">${ph.e}</span>`, praise: `${ph.say} … ${ph.word}` };
    }

    function next() {
      saidTurn = false;                                    // ("Your turn!" once a round)
      const j = job(pool[S.round]);
      const r = S.round;
      let g = 0;
      const stage = E.frame(S, { text: j.text, rounds: rounds, cls: 'stage-trace' });
      stage.innerHTML = `
        <div class="tr-cue">${j.word ? j.glyphs.map((c, i) => `<i data-l="${i}">${c}</i>`).join('') + `<span class="tr-pic">${j.pic}</span>`
          : !j.pic || /^</.test(j.pic) ? j.pic : `<span class="big-e">${j.pic}</span>`}</div>
        <div class="tray-wrap"><div class="tray tr-tray"><svg class="tr-svg" viewBox="0 0 100 124" aria-label="Trace here"></svg></div></div>
        <div class="stage-cap tr-cap" aria-live="polite"></div>`;
      const svg = stage.querySelector('.tr-svg');
      const capEl = stage.querySelector('.tr-cap');
      const mine = () => S.alive && S.round === r && svg.isConnected;
      // (an empty caption keeps its words, unseen: the board must never move under a finger)
      const caption = (t) => { if (t) capEl.textContent = t; capEl.classList.toggle('off', !t); };

      /* ---- the board for one glyph ---- */
      let strokes, cur, target, ink, state, grab, view, pen, lastTick, demoTurn = 0;

      const el = (name, attrs, parent) => {
        const n = document.createElementNS(NS, name);
        Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
        (parent || svg).appendChild(n);
        return n;
      };
      const width = (node, w) => { node.style.strokeWidth = (w * view.k).toFixed(2); };

      /* a point `len` along a stroke, and the way it is heading */
      function at(s, len) {
        const f = Math.max(0, Math.min(s.pts.length - 1, len / s.step));
        const i = Math.floor(f), t = f - i, a = s.pts[i], b = s.pts[Math.min(s.pts.length - 1, i + 1)];
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
      function heading(s, len) {
        const a = at(s, Math.max(0, len - 2)), b = at(s, Math.min(s.len, len + 2));
        return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      }

      function glyph() {
        svg.innerHTML = '';
        svg.classList.remove('done');
        const base = el('path', { class: 'tr-base', d: 'M-80 90 H180' });
        strokes = STROKES[j.glyphs[g]].map(d => ({ d: d }));
        strokes.forEach(s => { s.bed = el('path', { class: 'tr-bed', d: s.d }); });
        // the points along each stroke, a unit apart
        strokes.forEach(s => {
          s.len = s.bed.getTotalLength();
          const n = Math.max(2, Math.ceil(s.len));
          s.step = s.len / n;
          s.pts = [];
          for (let i = 0; i <= n; i++) { const p = s.bed.getPointAtLength(s.step * i); s.pts.push([p.x, p.y]); }
        });
        // zoom in so the glyph fills the board, whatever its size
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        strokes.forEach(s => {
          const bb = s.bed.getBBox();
          x0 = Math.min(x0, bb.x); y0 = Math.min(y0, bb.y); x1 = Math.max(x1, bb.x + bb.width); y1 = Math.max(y1, bb.y + bb.height);
        });
        const vw = Math.max(x1 - x0 + 40, (y1 - y0 + 40) / 1.24), vh = vw * 1.24;
        svg.setAttribute('viewBox', `${((x0 + x1 - vw) / 2).toFixed(1)} ${((y0 + y1 - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
        view = { w: vw, k: vw / 90 };
        width(base, 1.2);
        strokes.forEach(s => width(s.bed, 16));
        strokes.forEach(s => { s.dots = el('path', { class: 'tr-dots', d: s.d }); width(s.dots, 1.8); s.dots.style.strokeDasharray = `0.1 ${(5.5 * view.k).toFixed(2)}`; });
        // little arrows along the way
        strokes.forEach(s => {
          s.arrows = el('g', { class: 'tr-arrows' });
          for (let L = 16 * view.k; L < s.len - 8 * view.k; L += 24 * view.k) {
            const p = at(s, L), z = 2.6 * view.k;
            el('path', { d: `M${-z} ${-z} L${z * 0.6} 0 L${-z} ${z}`, transform: `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${heading(s, L).toFixed(0)})` }, s.arrows);
          }
          width(s.arrows, 1.6);
        });
        strokes.forEach(s => {
          s.ink = el('path', { class: 'tr-ink', d: s.d });
          width(s.ink, 12);
          s.ink.style.strokeDasharray = `${s.len + 1} ${s.len + 1}`;
          s.ink.style.strokeDashoffset = s.len + 1;
        });
        // where each stroke starts: the next one green, the others waiting in grey
        strokes.forEach((s, i) => {
          const p = s.pts[0];
          s.start = el('g', { class: 'tr-start', transform: `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})` });
          el('circle', { r: (6.5 * view.k).toFixed(2) }, s.start);
          if (strokes.length > 1) {
            const t = el('text', { y: (2.9 * view.k).toFixed(2), 'font-size': (8 * view.k).toFixed(2), 'text-anchor': 'middle' }, s.start);
            t.textContent = i + 1;
          }
        });
        pen = el('g', { class: 'tr-pen' });
        el('circle', { r: (8 * view.k).toFixed(2) }, pen);
        el('path', { d: 'M0 -5.200l1.500 3.300 3.600.400-2.700 2.400.800 3.500L0 2.600-3.200 4.400l.800-3.500-2.700-2.400 3.600-.400z', transform: `scale(${(view.k).toFixed(2)})` }, pen);
        if (j.word) stage.querySelectorAll('.tr-cue i').forEach((x, i) => x.classList.toggle('now', i === g));
        begin(0);
        // the friend writes it first, then it is the child's turn
        demo(() => ready());
      }

      /* stroke i is next: its dot glows, the pen waits on it */
      function begin(i) {
        cur = i; target = 0; ink = 0; lastTick = 0; grab = true;
        strokes.forEach((s, k) => {
          s.start.classList.toggle('now', k === i);
          s.start.classList.toggle('later', k > i);
          s.start.classList.toggle('gone', k < i);
          s.arrows.classList.toggle('now', k === i);
        });
        // the child's pencil waits out of sight until the finger finds the dot
        if (state !== 'demo') pen.classList.remove('go');
        placePen();
      }

      function placePen() {
        const s = strokes[cur], p = at(s, ink);
        pen.setAttribute('transform', `translate(${p[0].toFixed(2)} ${p[1].toFixed(2)})`);
      }
      function paint(s, len) { s.ink.style.strokeDashoffset = (s.len + 1 - len).toFixed(2); }

      /* ---- Watch me: the friend writes the glyph, stroke by stroke ---- */
      function demo(then) {
        if (!AF.FX.motionOK()) { then(); return; }
        state = 'demo';
        const turn = ++demoTurn;
        svg.classList.add('demo');
        caption(E.t(S, 'watch'));
        let k = 0;
        const stroke = () => {
          if (turn !== demoTurn || !mine()) return;
          if (k >= strokes.length) {
            S.later(() => {
              if (turn !== demoTurn || !mine()) return;
              svg.classList.add('wipe');                    // the friend's ink fades, the board is the child's
              S.later(() => { if (turn !== demoTurn || !mine()) return; endDemo(); then(); }, 380);
            }, 500);
            return;
          }
          const s = strokes[k];
          begin(k);
          const dur = Math.max(700, s.len / DEMO * 1000), t0 = performance.now();
          const frame = (now) => {
            if (turn !== demoTurn || !mine()) return;
            const f = Math.min(1, (now - t0) / dur);
            const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;   // gently in, gently out
            ink = s.len * e;
            paint(s, ink);
            placePen();
            if (f < 1) requestAnimationFrame(frame);
            else { k++; S.later(stroke, 240); }
          };
          requestAnimationFrame(frame);
        };
        S.later(stroke, 350);
      }
      function endDemo() {
        demoTurn++;
        svg.classList.remove('demo', 'wipe');
        strokes.forEach(s => paint(s, 0));
        begin(0);
      }
      function ready() {
        state = 'ready';
        caption(E.t(S, 'start'));
        pen.classList.remove('go');
        // "Your turn!" once a round, after whatever is being said
        if (!saidTurn && g === 0) { saidTurn = true; S.after(() => { if (mine() && state === 'ready') AF.Audio.say(E.t(S, 'yourTurn')); }, 0); }
      }

      /* ---- the child draws ---- */
      function toBoard(e) {
        const m = svg.getScreenCTM();
        if (!m) return null;
        const p = svg.createSVGPoint();
        p.x = e.clientX; p.y = e.clientY;
        const q = p.matrixTransform(m.inverse());
        return [q.x, q.y];
      }

      function touch(e, fresh) {
        if (state === 'done' || state === 'demo') return;
        const pt = toBoard(e);
        if (!pt) return;
        const s = strokes[cur], near = NEAR * view.w;
        if (grab) {
          // a fresh touch picks the line up where the ink ends (the green dot at first)
          const head = at(s, ink);
          if (Math.hypot(pt[0] - head[0], pt[1] - head[1]) > near * GRAB) {
            if (fresh) nudge();
            return;
          }
          grab = false;
          state = 'draw';
          caption('');
          pen.classList.add('go');
          s.start.classList.remove('now');
          if (!S.t0) S.mark();
        }
        // the nearest point of the line, from just behind the ink to a little ahead of it
        const from = Math.max(0, Math.floor(target / s.step) - 3);
        const to = Math.min(s.pts.length - 1, Math.ceil((target + AHEAD * view.w) / s.step));
        let best = -1, bd = Infinity;
        for (let k = from; k <= to; k++) {
          const d = Math.hypot(s.pts[k][0] - pt[0], s.pts[k][1] - pt[1]);
          if (d < bd) { bd = d; best = k; }
        }
        if (bd > near) return;                            // off the line: the ink waits
        target = Math.max(target, best * s.step);
      }

      /* touched far from where to start: the dot asks to be found */
      function nudge() {
        const s = strokes[cur];
        s.start.classList.remove('nudge'); void s.start.getBoundingClientRect(); s.start.classList.add('nudge');
        pen.classList.remove('nudge'); void pen.getBoundingClientRect(); pen.classList.add('nudge');
        if (!saidStart) { saidStart = true; AF.Audio.say(E.t(S, 'startSay')); }
      }

      /* every frame: the ink glides towards the finger */
      function frame() {
        if (!mine()) return;
        if (state === 'draw') {
          const s = strokes[cur];
          if (ink < target) {
            ink = Math.min(target, ink + Math.max(0.5 * view.k, (target - ink) * EASE));
            paint(s, ink);
            placePen();
            if (ink - lastTick > TICK * view.k) { lastTick = ink; AF.Audio.SFX.step(); }
          }
          if (target >= s.len - END * view.w && ink >= target - 0.5) {
            target = ink = s.len;
            paint(s, ink);
            strokeDone();
          }
        }
        requestAnimationFrame(frame);
      }

      /* the finger has reached the end: finish now, without waiting for the
         ink's glide (on a slow phone it can lag behind a quick finger) */
      function settle() {
        if (state !== 'draw') return;
        const s = strokes[cur];
        if (target < s.len - END * view.w) return;
        target = ink = s.len;
        paint(s, ink);
        placePen();
        strokeDone();
      }

      function strokeDone() {
        const s = strokes[cur];
        s.ink.classList.add('full');
        s.arrows.classList.remove('now');
        AF.Audio.SFX.pop();
        if (cur < strokes.length - 1) {
          begin(cur + 1);
          // still touching, and already at the next start? carry on
          return;
        }
        glyphDone();
      }

      function glyphDone() {
        state = 'done';
        caption('');
        svg.classList.add('done');
        pen.classList.remove('go');
        pen.style.display = 'none';
        AF.FX.sparkleAt(svg, 16);
        AF.Audio.SFX.right();
        AF.Art.react(S.charEl, 'happy');
        if (g < j.glyphs.length - 1) {
          const l = stage.querySelector(`[data-l="${g}"]`);
          if (l) l.classList.add('got');
          // the letter is said, then the next one
          if (lv.lang === 'id' || !AF.PHONICS[j.glyphs[g]]) AF.Audio.say(j.glyphs[g], { rate: 0.8 });
          else AF.Audio.sound(AF.phonic(j.glyphs[g]));
          S.after(() => { if (!mine()) return; g++; glyph(); }, 1100);
          return;
        }
        stage.querySelectorAll('.tr-cue i').forEach(x => { x.classList.add('got'); x.classList.remove('now'); });
        S.lap();
        S.later(() => { if (mine()) AF.Audio.say(j.praise, { rate: 0.75 }); }, 350);
        S.after(() => {
          S.round++;
          if (S.round >= rounds) S.done(); else E.swap(S, next);
        }, 1700);
      }

      /* ---- input: the first finger draws; a resting palm or a second finger is ignored ---- */
      let down = false;
      svg.addEventListener('pointerdown', (e) => {
        if (down !== false) return;
        down = e.pointerId;
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
        if (state === 'demo') { endDemo(); ready(); }     // a tap skips the friend's turn
        settle();
        grab = true;
        touch(e, true);
      });
      svg.addEventListener('pointermove', (e) => {
        if (e.pointerId !== down) return;
        // the in-between points of a fast finger first, then where it is now
        const all = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
        all.forEach(ev => touch(ev, false));
        touch(e, false);
      });
      const up = (e) => { if (e.pointerId === down) { down = false; grab = true; settle(); } };
      svg.addEventListener('pointerup', up);
      svg.addEventListener('pointercancel', up);
      svg.addEventListener('lostpointercapture', up);
      stage._key = () => {
        if (state === 'demo') { endDemo(); ready(); return; }
        if (state === 'done') return;
        if (state === 'ready' || grab) { grab = false; state = 'draw'; caption(''); pen.classList.add('go'); strokes[cur].start.classList.remove('now'); }
        target = Math.min(strokes[cur].len, target + AHEAD * view.w);
      };

      S.replay = () => {
        E.talk(S, j.say, j.sound ? { onEnd: () => { if (S.alive) AF.Audio.sound(j.sound); } } : null);
        // hearing it again before starting shows it again too
        if (state === 'ready' && ink === 0 && cur === 0) demo(() => ready());
      };

      glyph();
      requestAnimationFrame(frame);
      S.later(() => { E.talk(S, j.say, j.sound ? { onEnd: () => { if (S.alive) AF.Audio.sound(j.sound); } } : null); }, 320);
    }

    S.on(document, 'keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const st = S.host.querySelector('.stage-trace');
      if (st && st._key) { e.preventDefault(); st._key(); }
    });

    next();
  };
})(window.AF = window.AF || {});
