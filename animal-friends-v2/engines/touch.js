/* ============================================================
   engines/touch.js — four games for busy fingers
   ------------------------------------------------------------
     sort   carry each thing to the basket it belongs in
     match  join each thing to its partner (its shadow, its word,
            its number...)
     trace  follow a letter, a number or a line with a finger
     pop    pop the bubbles that carry the right answer

   They are the "hands-on" half of the app. Research on apps for
   under-fives keeps finding the same thing: tap and drag-and-drop
   are the two gestures small children manage reliably, and games
   built on them (sorting, matching to a shadow, tracing, popping)
   are the ones they come back to. Each of these still works with
   taps alone, and none of them has a clock.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;

  /* ============================================================
     SORT
     level: { rounds, items: [{ e, w, bin }], bins: [{ key, emoji, label, c }],
              ask(item) -> spoken question, tell?(item, bin) -> praise }
     ============================================================ */
  /* painted baskets (art/ui) for the land / water / sky sorts */
  const BASKET = { land: 'basket-land', water: 'basket-water', sky: 'basket-sky' };

  E.sort = function (S) {
    const lv = S.level;
    const total = Math.min(lv.rounds, lv.items.length);
    const queue = U.shuffle(lv.items).slice(0, total);
    const counts = {};
    let item, wrong, locked;

    const stage = E.frame(S, { text: '', rounds: total, cls: 'stage-sort' });
    stage.innerHTML = `
      <div class="sort-top"><div class="sort-spot"></div></div>
      <div class="bins" style="--n:${lv.bins.length}">
        ${lv.bins.map((b, i) => BASKET[b.key] ? `
          <button class="bin basket" data-k="${U.esc(b.key)}" style="--c:${b.c || '#FFC93C'};--i:${i}">
            <img class="bin-e bin-pic" src="art/ui/${BASKET[b.key]}.webp" alt="" draggable="false">
            <span class="bin-label">${U.esc(b.label)}</span>
            <span class="bin-n" hidden>0</span>
          </button>` : `
          <button class="bin" data-k="${U.esc(b.key)}" style="--c:${b.c || '#FFC93C'};--i:${i}">
            <span class="bin-back"></span>
            <span class="bin-e">${b.emoji}</span>
            <span class="bin-front"><span class="bin-label">${U.esc(b.label)}</span></span>
            <span class="bin-n" hidden>0</span>
          </button>`).join('')}
      </div>`;
    const spot = stage.querySelector('.sort-spot');
    const bins = Array.from(stage.querySelectorAll('.bin'));

    function next() {
      item = queue[S.round];
      wrong = 0; locked = false;
      E.frame.dots(S, total);
      E.bubble(S, U.esc(lv.ask(item)));
      bins.forEach(b => b.classList.remove('hint', 'dimmed'));
      spot.innerHTML = `<button class="sort-item" aria-label="${U.esc(item.w)}"><span class="sort-e">${item.e}</span><span class="sort-w">${U.esc(item.w)}</span></button>`;
      const el = spot.firstChild;
      S.replay = () => E.talk(S, lv.ask(item));
      el.addEventListener('click', () => { AF.Audio.SFX.tap(); S.replay(); });
      AF.Drag.on(S, el, {
        can: () => !locked,
        targets: () => bins,
        drop: (t) => choose(t, el)
      });
      S.later(() => { S.replay(); S.mark(); }, 380);
    }

    function choose(bin, el) {
      if (locked) return false;
      el = el || spot.firstChild;
      if (bin.dataset.k !== String(item.bin)) {
        if (bin.classList.contains('shake')) { AF.Drag.home(el); return false; }   // the same slip, tapped twice
        wrong++;
        S.miss();
        AF.Audio.SFX.wrong();
        AF.Art.react(S.charEl, 'hmm');
        bin.classList.add('shake');
        S.later(() => bin.classList.remove('shake'), 480);
        AF.Drag.home(el);
        // No dead ends: after two misses the right basket glows.
        if (wrong >= 2) bins.forEach(b => b.classList.toggle('hint', b.dataset.k === String(item.bin)));
        return false;
      }
      locked = true;
      S.lap();
      const def = lv.bins.filter(b => String(b.key) === String(item.bin))[0];
      AF.Audio.SFX.pop();
      AF.FX.send(el, bin.querySelector('.bin-e'), () => {
        if (!S.alive) return;
        el.remove();
        bin.classList.remove('gulp'); void bin.offsetWidth; bin.classList.add('gulp');
        AF.FX.sparkleAt(bin, 10);
        AF.Audio.SFX.right();
        AF.Art.react(S.charEl, 'happy');
        counts[item.bin] = (counts[item.bin] || 0) + 1;
        const n = bin.querySelector('.bin-n');
        n.hidden = false;
        n.textContent = counts[item.bin];
        AF.Audio.say(lv.tell ? lv.tell(item, def) : def.label, { rate: 0.8 });
      });
      S.after(() => {
        S.round++;
        if (S.round >= total) S.done(); else next();
      }, 1900);
      return true;
    }

    bins.forEach(b => b.addEventListener('click', () => choose(b)));
    next();
  };

  /** Redraws just the progress dots (for engines that keep one stage). */
  E.frame.dots = function (S, total) {
    const d = S.host.querySelector('.play-dots');
    if (!d) return;
    d.hidden = total < 2;
    d.innerHTML = Array.from({ length: total }, (_, i) =>
      `<i class="${i < S.round ? 'done' : ''}${i === S.round ? ' now' : ''}"></i>`).join('');
  };

  /* ============================================================
     MATCH
     level: { rounds, n, pairs: [{ w, a: face, b: face, say? }], say, text }
     face = { e } | { t } | { html } | { shadow: e }
     Each round shows n things and n partners. Carry a thing to
     its partner — or tap the thing, then tap the partner.
     ============================================================ */
  const mface = (f) => f.html ? f.html
    : f.shadow ? `<span class="mt-e mt-shadow">${f.shadow}</span>`
    : f.e ? `<span class="mt-e">${f.e}</span>`
    : `<span class="mt-t" style="--len:${String(f.t).length}">${U.esc(f.t)}</span>`;

  E.match = function (S) {
    const lv = S.level;
    const rounds = lv.rounds || 2;
    const per = Math.min(lv.n || 3, lv.pairs.length);
    let bag = [], set, left, picked, wrong, locked;

    function next() {
      // Go through all the pairs before any comes round again.
      if (bag.length < per) bag = bag.concat(U.shuffle(lv.pairs.filter(p => bag.indexOf(p) < 0)));
      set = bag.splice(0, per);
      left = per; picked = null; wrong = 0; locked = false;
      const order = U.shuffle(set.map((p, i) => i));

      const stage = E.frame(S, { text: lv.text || U.esc(lv.say), rounds: rounds, cls: 'stage-match' });
      stage.innerHTML = `
        <div class="mt-row mt-slots" style="--n:${per}">
          ${order.map(i => `<button class="mt-slot" data-i="${i}" aria-label="${U.esc(set[i].w)}"><span class="mt-face">${mface(set[i].b)}</span></button>`).join('')}
        </div>
        <div class="mt-row mt-items" style="--n:${per}">
          ${set.map((p, i) => `<button class="mt-item" data-i="${i}" style="--i:${i}" aria-label="${U.esc(p.w)}"><span class="mt-face">${mface(p.a)}</span></button>`).join('')}
        </div>`;
      S.replay = () => E.talk(S, lv.say);

      const slots = Array.from(stage.querySelectorAll('.mt-slot'));
      const items = Array.from(stage.querySelectorAll('.mt-item'));
      const free = (el) => !locked && !el.classList.contains('used') && !el.classList.contains('flying');
      const pick = (el) => {
        items.forEach(x => x.classList.toggle('picked', x === el));
        picked = el;
      };

      items.forEach(el => {
        el.addEventListener('click', () => {
          if (!free(el)) return;
          AF.Audio.SFX.tap();
          AF.Audio.say(set[el.dataset.i].sayA || set[el.dataset.i].w);
          pick(picked === el ? null : el);
        });
        AF.Drag.on(S, el, {
          can: () => free(el),
          targets: () => slots.filter(s => !s.classList.contains('filled')),
          drop: (t) => join(el, t)
        });
      });
      slots.forEach(sl => sl.addEventListener('click', () => {
        if (locked || sl.classList.contains('filled')) return;
        if (!picked) {                               // nothing in hand yet: show what to do
          const first = items.filter(free)[0];
          if (first) { first.classList.remove('nudge'); void first.offsetWidth; first.classList.add('nudge'); }
          AF.Audio.SFX.tap();
          return;
        }
        join(picked, sl);
      }));

      function join(el, sl) {
        if (el.dataset.i !== sl.dataset.i) {
          if (sl.classList.contains('shake')) { AF.Drag.home(el); return false; }   // the same slip, tapped twice
          wrong++;
          S.miss();
          AF.Audio.SFX.wrong();
          AF.Art.react(S.charEl, 'hmm');
          sl.classList.add('shake');
          S.later(() => sl.classList.remove('shake'), 480);
          AF.Drag.home(el);
          if (wrong >= 2) slots.forEach(x => x.classList.toggle('hint', x.dataset.i === el.dataset.i && !x.classList.contains('filled')));
          return false;
        }
        const p = set[el.dataset.i];
        wrong = 0;
        pick(null);
        slots.forEach(x => x.classList.remove('hint'));
        left--;
        AF.Audio.SFX.pop();
        AF.FX.send(el, sl, () => {
          if (!S.alive) return;
          el.classList.add('used');
          sl.classList.add('filled');
          AF.FX.sparkleAt(sl, 10);
          AF.Audio.SFX.right();
          AF.Audio.say(p.say || p.w, { rate: 0.8 });
        });
        if (left === 0) {
          locked = true;
          S.lap();
          AF.Art.react(S.charEl, 'happy');
          S.after(() => {
            S.round++;
            if (S.round >= rounds) S.done(); else E.swap(S, next);
          }, 1900);
        }
        return true;
      }

      S.later(() => { S.replay(); S.mark(); }, 320);
    }

    next();
  };

  /* ============================================================
     TRACE
     level: { kind: 'letter' | 'number' | 'line' | 'word', set: [...], rounds }
     Follow the dotted line from the green dot. The ink only moves
     forward, along the line, however wobbly the finger is — so it
     cannot be done "wrong", and it always earns three stars.
     (Space or Enter moves the ink along too, for a keyboard.)
     ============================================================ */

  /* One path per pen stroke, in a 100 x 124 box.
     Letters sit on a line at y = 90; tall ones start at y = 16. */
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

  E.trace = function (S) {
    const lv = S.level;
    const pool = lv.ordered ? lv.set.slice() : U.shuffle(lv.set);
    const rounds = Math.min(lv.rounds || pool.length, pool.length);
    const NS = 'http://www.w3.org/2000/svg';
    const TOL = 17, STEP = 2;

    /* What one round asks for: a list of glyphs to trace in turn. */
    function job(x) {
      if (lv.kind === 'word') return { glyphs: x.w.split(''), say: `Write the word, ${x.w}.`, text: `Write <b>${U.esc(x.w)}</b>`, pic: x.e, word: x.w, praise: x.w };
      if (lv.kind === 'number') {
        const n = +x;
        return { glyphs: String(x).split(''), say: `Trace number ${AF.NUM[n]}.`, text: `Trace number <b>${x}</b>`,
          pic: AF.Gen.row('⭐', n), praise: AF.NUM[n] };
      }
      if (lv.kind === 'line') return { glyphs: [x], say: `Draw ${LINE_NAMES[x]}.`, text: `Draw <b>${LINE_NAMES[x]}</b>`, pic: '', praise: 'Lovely!' };
      const ph = AF.PHONICS[x];
      return { glyphs: [x], say: 'Trace the letter that says', sound: ph.say, text: `Trace <b>${x}</b>`,
        pic: `<span class="big-e">${ph.e}</span>`, praise: `${ph.say} … ${ph.word}` };
    }

    function next() {
      const j = job(pool[S.round]);
      let g = 0;                                     // which glyph of the word
      const stage = E.frame(S, { text: j.text, rounds: rounds, cls: 'stage-trace' });
      stage.innerHTML = `
        <div class="tr-cue">${j.word ? j.glyphs.map((c, i) => `<i data-l="${i}">${c}</i>`).join('') + `<span class="tr-pic">${j.pic}</span>` : j.pic}</div>
        <div class="tray-wrap"><div class="tray tr-tray"><svg class="tr-svg" viewBox="0 0 100 124" aria-label="Trace here"></svg></div></div>
        <div class="stage-cap">Start at the green dot</div>`;
      const svg = stage.querySelector('.tr-svg');
      S.replay = () => E.talk(S, j.say, j.sound ? { onEnd: () => { if (S.alive) AF.Audio.sound(j.sound); } } : null);

      let strokes, cur, idx, pts, ink, pen, guide, done = false, down = false;

      const el = (name, attrs) => {
        const n = document.createElementNS(NS, name);
        Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
        svg.appendChild(n);
        return n;
      };

      function glyph() {
        svg.innerHTML = '<path class="tr-base" d="M-80 90 H180"/>';
        strokes = STROKES[j.glyphs[g]].map(d => {
          el('path', { class: 'tr-bed', d: d });
          return { d: d };
        });
        strokes.forEach(s => { el('path', { class: 'tr-dots', d: s.d }); });
        strokes.forEach(s => {
          s.ink = el('path', { class: 'tr-ink', d: s.d });
          s.len = s.ink.getTotalLength();
          s.ink.style.strokeDasharray = s.len + 1;
          s.ink.style.strokeDashoffset = s.len + 1;
        });
        // Zoom in so the letter fills the paper, whatever its size.
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        strokes.forEach(s => {
          const bb = s.ink.getBBox();
          x0 = Math.min(x0, bb.x); y0 = Math.min(y0, bb.y); x1 = Math.max(x1, bb.x + bb.width); y1 = Math.max(y1, bb.y + bb.height);
        });
        const vw = Math.max(x1 - x0 + 40, (y1 - y0 + 40) / 1.24), vh = vw * 1.24;
        svg.setAttribute('viewBox', `${((x0 + x1 - vw) / 2).toFixed(1)} ${((y0 + y1 - vh) / 2).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
        guide = el('circle', { class: 'tr-guide', r: 3.4 });
        pen = el('g', { class: 'tr-pen' });
        pen.innerHTML = '<circle r="8.500"/><path d="M0 -5.200l1.500 3.300 3.600.400-2.700 2.400.800 3.500L0 2.600-3.200 4.400l.800-3.500-2.700-2.400 3.600-.400z"/>';
        cur = -1;
        stroke();
        if (j.word) stage.querySelectorAll('.tr-cue i').forEach((x, i) => x.classList.toggle('now', i === g));
      }

      function stroke() {
        cur++;
        const s = strokes[cur];
        ink = s.ink;
        pts = [];
        const n = Math.max(1, Math.ceil(s.len / STEP));
        for (let i = 0; i <= n; i++) { const p = ink.getPointAtLength(s.len * i / n); pts.push([p.x, p.y]); }
        idx = 0;
        // a dot runs along the line to show which way to go
        guide.innerHTML = `<animateMotion dur="${Math.max(1.1, s.len / 55).toFixed(2)}s" repeatCount="indefinite" path="${s.d}"/>`;
        guide.style.display = '';
        draw();
      }

      function draw() {
        const s = strokes[cur], p = pts[idx];
        ink.style.strokeDashoffset = (s.len + 1) * (1 - idx / (pts.length - 1));
        pen.setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
        pen.classList.toggle('go', idx > 0);
      }

      function advance(to) {
        if (done || to <= idx) return;
        idx = Math.min(pts.length - 1, to);
        guide.style.display = 'none';
        draw();
        if (idx < pts.length - 1) return;
        AF.Audio.SFX.pop();
        if (cur < strokes.length - 1) { stroke(); return; }
        // the whole letter is drawn
        done = true;
        svg.classList.add('done');
        pen.style.display = 'none';
        AF.FX.sparkleAt(svg, 16);
        AF.Audio.SFX.right();
        AF.Art.react(S.charEl, 'happy');
        if (g < j.glyphs.length - 1) {
          const l = stage.querySelector(`[data-l="${g}"]`);
          if (l) l.classList.add('got');
          S.later(() => { g++; done = false; svg.classList.remove('done'); glyph(); }, 900);
          return;
        }
        stage.querySelectorAll('.tr-cue i').forEach(x => { x.classList.add('got'); x.classList.remove('now'); });
        S.lap();
        AF.Audio.say(j.praise, { rate: 0.75 });
        S.after(() => {
          S.round++;
          if (S.round >= rounds) S.done(); else E.swap(S, next);
        }, 2000);
      }

      function follow(e) {
        const m = svg.getScreenCTM();
        if (!m) return;
        const x = (e.clientX - m.e) / m.a, y = (e.clientY - m.f) / m.d;
        // the furthest point a little way ahead that the finger is near
        let to = idx;
        for (let k = idx; k <= Math.min(pts.length - 1, idx + 9); k++)
          if (Math.hypot(pts[k][0] - x, pts[k][1] - y) < TOL) to = k;
        if (to === idx && idx === 0 && Math.hypot(pts[0][0] - x, pts[0][1] - y) < TOL) to = pts.length < 4 ? pts.length - 1 : 1;
        advance(to);
      }

      // Only the first finger draws; a resting palm or second finger is ignored.
      svg.addEventListener('pointerdown', (e) => {
        if (down !== false) return;
        down = e.pointerId;
        try { svg.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
        follow(e);
      });
      svg.addEventListener('pointermove', (e) => { if (e.pointerId === down) follow(e); });
      svg.addEventListener('pointerup', (e) => { if (e.pointerId === down) down = false; });
      svg.addEventListener('pointercancel', (e) => { if (e.pointerId === down) down = false; });
      svg.addEventListener('lostpointercapture', (e) => { if (e.pointerId === down) down = false; });
      stage._key = () => advance(idx + 14);

      glyph();
      S.later(() => { S.replay(); S.mark(); }, 320);
    }

    S.on(document, 'keydown', (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const st = S.host.querySelector('.stage-trace');
      if (st && st._key) { e.preventDefault(); st._key(); }
    });

    next();
  };

  /* ============================================================
     POP
     level: { rounds, need?, gen(ctx) -> round }   (the same rounds
     the choose engine uses, so every word list is also a pop game)
     Bubbles drift up carrying the choices. Pop `need` of the right
     ones. There is no hurry: they keep coming for as long as it takes.
     ============================================================ */
  E.pop = function (S) {
    const lv = S.level;
    const total = lv.rounds;
    const need = lv.need || 3;
    const LANES = 5;
    let cur = null, last = null, count = 0, wrong = 0, locked = true, serial = 0, lane = 0, turn = 0;

    const stage = E.frame(S, { text: '', rounds: total, cls: 'stage-pop' });
    stage.innerHTML = `
      <div class="pop-need">${Array.from({ length: need }, (_, i) => `<i data-n="${i}" data-ic="star"></i>`).join('')}</div>
      <div class="pop-sky"></div>`;
    const sky = stage.querySelector('.pop-sky');
    const live = () => Array.from(sky.querySelectorAll('.pop-b:not(.gone)'));

    function prompt() {
      E.talk(S, cur.say, cur.sound ? { onEnd: () => { if (S.alive) AF.Audio.sound(cur.sound); } } : null);
    }

    function next() {
      cur = lv.gen({ round: S.round, last: last, stretch: S.api.stretch });
      last = cur.answer;
      count = 0; wrong = 0; locked = false; turn++;
      E.frame.dots(S, total);
      E.bubble(S, (cur.text || U.esc(cur.say)).replace(/^Find /, 'Pop ').replace(/^Which /, 'Pop the '));
      stage.querySelectorAll('.pop-need i').forEach(x => x.classList.remove('on'));
      S.replay = prompt;
      S.later(() => { prompt(); S.mark(); }, 320);
    }

    function spawn() {
      if (locked || live().length >= 6) return;
      const have = live().some(b => b.dataset.ok === '1');
      const right = cur.options.filter(o => o.key === cur.answer)[0];
      const others = cur.options.filter(o => o.key !== cur.answer);
      const o = (!have || Math.random() < 0.42 || !others.length) ? right : U.one(others);
      const b = document.createElement('button');
      const dur = 6200 + U.rand(2600);
      lane = (lane + 1 + U.rand(LANES - 2)) % LANES;
      b.className = 'pop-b' + (wrong >= 2 && o !== right ? ' pale' : '');
      b.dataset.ok = o === right ? '1' : '0';
      b.dataset.turn = turn;
      b.style.cssText = `--x:${16 + lane * 68 / (LANES - 1)}%;--d:${dur}ms;--sway:${(lane === 0 ? 1 : lane === LANES - 1 ? -1 : U.rand(2) ? 1 : -1) * (12 + U.rand(16))}%;--tint:${['#7FD4FF', '#FFB3D1', '#B8F0C0', '#FFE27A', '#CDB6FF'][serial++ % 5]}`;
      b.innerHTML = E.face(o);
      b.addEventListener('click', () => tap(b));
      sky.appendChild(b);
      S.later(() => b.remove(), dur + 60);
    }

    function burst(b) {
      b.classList.add('gone', 'popped');
      S.later(() => b.remove(), 260);
    }

    function tap(b) {
      if (locked || b.classList.contains('gone') || +b.dataset.turn !== turn) return;
      if (b.dataset.ok !== '1') {
        wrong++;
        S.miss();
        AF.Audio.SFX.wrong();
        AF.Art.react(S.charEl, 'hmm');
        b.classList.add('gone', 'fizz');
        S.later(() => b.remove(), 520);
        // After two misses the wrong bubbles turn pale.
        if (wrong >= 2) live().forEach(x => { if (x.dataset.ok !== '1') x.classList.add('pale'); });
        if (wrong === 2) S.later(prompt, 400);
        return;
      }
      const r = b.getBoundingClientRect();
      AF.FX.sparkle(r.left + r.width / 2, r.top + r.height / 2, 12);
      AF.Audio.SFX.pop();
      burst(b);
      const star = stage.querySelector(`.pop-need [data-n="${count}"]`);
      if (star) star.classList.add('on');
      count++;
      if (count === 1 && cur.praise) AF.Audio.say(cur.praise, { rate: 0.8 });
      if (count < need) return;

      locked = true;
      S.lap();
      AF.Audio.SFX.right();
      AF.Art.react(S.charEl, 'happy');
      live().forEach((x, i) => S.later(() => burst(x), 80 + i * 70));
      S.after(() => {
        S.round++;
        if (S.round >= total) S.done(); else next();
      }, 1500);
    }

    (function loop() {
      S.later(() => { spawn(); loop(); }, 780);
    })();

    next();
  };
})(window.AF = window.AF || {});
