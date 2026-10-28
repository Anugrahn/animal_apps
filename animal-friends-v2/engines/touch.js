/* ============================================================
   engines/touch.js — four games for busy fingers
   ------------------------------------------------------------
     sort   carry each thing to the basket it belongs in
     match  join each thing to its partner (its shadow, its word,
            its number...)
     pop    pop the bubbles that carry the right answer
   (trace, following a letter with a finger, has its own file since
   v4.1: engines/trace.js)

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
        if (wrong === 2) S.soon(() => S.replay(), 500, () => !locked);
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
          if (wrong === 2) S.soon(() => S.replay(), 500, () => !locked);
          return false;
        }
        const p = set[el.dataset.i];
        wrong = 0;
        pick(null);
        slots.forEach(x => x.classList.remove('hint'));
        left--;
        AF.Audio.stop();             // the picked card's name: the praise says it again, after the chime
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
      E.talk(S, cur.say, { sound: cur.sound });
    }

    function next() {
      cur = lv.gen({ round: S.round, last: last, stretch: S.api.stretch });
      last = cur.answer;
      count = 0; wrong = 0; locked = false; turn++;
      E.frame.dots(S, total);
      E.bubble(S, cur.text || U.esc(cur.say));
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
      // a bubble is moving, so it pops the moment it is pressed (a click needs
      // the finger to come up on it too); a keyboard still clicks
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(b); });
      b.addEventListener('click', (e) => { if (e.detail === 0) tap(b); });
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
        if (wrong === 2) S.soon(prompt, 400, () => !locked);
        return;
      }
      const r = b.getBoundingClientRect();
      AF.FX.sparkle(r.left + r.width / 2, r.top + r.height / 2, 12);
      AF.Audio.SFX.pop();
      burst(b);
      const star = stage.querySelector(`.pop-need [data-n="${count}"]`);
      if (star) star.classList.add('on');
      count++;
      if (count < need) return;

      locked = true;
      S.lap();
      AF.Audio.SFX.right();
      // The praise comes once the round is won, after the chime: said at the
      // first pop, the next pops and the chime sounded over it.
      if (cur.praise) AF.Audio.say(cur.praise, { rate: 0.8 });
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
