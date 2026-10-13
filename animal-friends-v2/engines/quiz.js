/* ============================================================
   engines/quiz.js — the four tap-to-answer engines
   ------------------------------------------------------------
     choose  hear a question, tap the right card
     order   tap the cards in the right order
     build   tap letters to build a word
     memory  flip cards to find pairs

   Every one of them can be played with taps alone: children under
   five manage a tap long before they manage a drag. Where there is
   somewhere to put a thing (order, build), it can also be picked
   up and carried there, and a tapped card glides to its place.

   Shared rules (see core/levels.js):
     * no timers the child can see, ever
     * two misses on one question and the game shows the way
     * finishing always earns at least one star
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;

  /** What is drawn on a card: a picture, a letter, a word, a shape. */
  function face(o) {
    return `
        <span class="opt-face" ${o.c ? `style="--c:${o.c}"` : ''}>
          ${o.html || ''}
          ${o.glyph != null ? `<span class="opt-glyph" style="--len:${String(o.glyph).length}">${U.esc(o.glyph)}</span>` : ''}
          ${o.emoji ? `<span class="opt-emoji">${o.emoji}</span>` : ''}
          ${o.label ? `<span class="opt-label">${U.esc(o.label)}</span>` : ''}
        </span>`;
  }
  E.face = face;

  function optHTML(o, i) {
    return `<button class="opt" data-i="${i}" style="--i:${i}">${face(o)}</button>`;
  }

  /* A second tap on a card that is still shaking is the same slip,
     not a new one (a quick double tap must not cost two stars). */
  const shaking = (el) => el.classList.contains('nope') || el.classList.contains('shake');

  function nope(S, btn) {
    S.miss();
    AF.Audio.SFX.wrong();
    AF.Art.react(S.charEl, 'hmm');
    btn.classList.add('nope');
    S.later(() => btn.classList.remove('nope'), 420);
  }

  function yes(S, btn) {
    btn.classList.add('yes');
    AF.Audio.SFX.right();
    AF.Art.react(S.charEl, 'happy');
    AF.FX.sparkleAt(btn, 14);
  }

  /* ============================================================
     CHOOSE
     level: { rounds, gen(ctx) -> round }   or   { fixed: [round, ...] }
     round: { say, text?, sound?, show?, options: [{ key, glyph?, emoji?, label?, html?, c? }],
              answer, praise?, keep? }
     ============================================================ */
  E.choose = function (S) {
    const lv = S.level, api = S.api;
    const total = lv.fixed ? lv.fixed.length : lv.rounds;
    let cur = null, locked = false, wrong = 0, last = null;

    function prompt() {
      E.talk(S, cur.say, cur.sound ? { onEnd: () => { if (S.alive) AF.Audio.sound(cur.sound); } } : null);
    }

    function next() {
      cur = lv.fixed ? lv.fixed[S.round] : lv.gen({ round: S.round, last: last, stretch: api.stretch });
      last = cur.answer;
      wrong = 0;
      locked = false;

      const stage = E.frame(S, { text: cur.text || U.esc(cur.say), rounds: total, cls: 'stage-choose' });
      stage.innerHTML =
        (cur.show ? `<div class="show">${cur.show}</div>` : '') +
        `<div class="opt-grid" style="--n:${cur.options.length}">${cur.options.map(optHTML).join('')}</div>`;
      S.replay = prompt;

      const btns = Array.from(stage.querySelectorAll('.opt'));
      btns.forEach(b => b.addEventListener('click', () => pick(b, btns)));

      // Adaptive help kicks in only after repeated attempts at this level.
      const r = S.round;
      const still = () => S.round === r && !locked;
      if (api.help >= 1 && btns.length > 2) {
        S.later(() => {
          if (!still()) return;
          const w = btns.filter(b => cur.options[b.dataset.i].key !== cur.answer && !b.classList.contains('dimmed'));
          if (w.length) w[0].classList.add('dimmed');
        }, 3200);
      }
      if (api.help >= 2) S.later(() => { if (still()) prompt(); }, 8000);

      S.later(() => { prompt(); S.mark(); }, 320);
    }

    function pick(btn, btns) {
      if (locked) return;
      const opt = cur.options[btn.dataset.i];

      if (opt.key !== cur.answer) {
        if (shaking(btn)) return;
        wrong++;
        nope(S, btn);
        // No dead ends: after two misses the wrong cards fade out.
        if (wrong >= 2) {
          btns.forEach(b => { if (cur.options[b.dataset.i].key !== cur.answer) b.classList.add('dimmed'); });
          S.later(prompt, 500);
        }
        return;
      }

      locked = true;
      S.lap();
      yes(S, btn);
      if (cur.praise) AF.Audio.say(cur.praise, { rate: 0.75 });
      S.after(() => {
        S.round++;
        if (S.round >= total) S.done(); else E.swap(S, next);
      }, cur.praise ? 1700 : 1100);
    }

    next();
  };

  /* ============================================================
     ORDER
     level: { sets: [{ say, text?, steps: [{ e, label }], praise? }], pick? }
     ============================================================ */
  E.order = function (S) {
    const lv = S.level;
    const sets = lv.pick ? U.shuffle(lv.sets).slice(0, lv.pick) : lv.sets;
    let set, filled, wrong, locked;

    const firstEmpty = () => { let i = 0; while (filled[i]) i++; return i; };

    function next() {
      set = sets[S.round];
      filled = []; wrong = 0; locked = false;

      let mixed = U.shuffle(set.steps.map((s, i) => i));
      if (mixed.every((v, i) => v === i)) mixed.reverse();

      const stage = E.frame(S, { text: set.text || U.esc(set.say), rounds: sets.length, cls: 'stage-order' });
      stage.innerHTML = `
        <div class="slots" style="--n:${set.steps.length}">
          ${set.steps.map((s, i) => `<div class="slot" data-slot="${i}"><b>${i + 1}</b></div>`).join('')}
        </div>
        <div class="opt-grid small" style="--n:${set.steps.length}">
          ${mixed.map(i => optHTML({ emoji: set.steps[i].e, glyph: set.steps[i].glyph, label: set.steps[i].label }, i)).join('')}
        </div>`;
      S.replay = () => E.talk(S, set.say);

      const btns = Array.from(stage.querySelectorAll('.opt'));
      const slot = (i) => stage.querySelector(`[data-slot="${i}"]`);
      const free = (btn) => !locked && !btn.classList.contains('used') && !btn.classList.contains('flying');

      btns.forEach(b => {
        // A tap sends the card to the next empty place...
        b.addEventListener('click', () => { if (free(b)) place(b, firstEmpty(), btns, slot); });
        // ...and a drag lets the child choose the place.
        AF.Drag.on(S, b, {
          can: () => free(b),
          targets: () => set.steps.map((x, i) => slot(i)).filter((el, i) => !filled[i]),
          drop: (t) => place(b, +t.dataset.slot, btns, slot)
        });
      });
      S.later(() => { S.replay(); S.mark(); }, 320);
    }

    /* Card `btn` is offered for place `at`. Returns false if it is wrong. */
    function place(btn, at, btns, slot) {
      const i = +btn.dataset.i;
      if (i !== at) {
        if (shaking(btn)) { AF.Drag.home(btn); return false; }
        wrong++;
        nope(S, btn);
        AF.Drag.home(btn);
        if (wrong >= 2) btns.filter(b => +b.dataset.i === firstEmpty())[0].classList.add('hint');
        return false;
      }

      const step = set.steps[i];
      wrong = 0;
      filled[i] = true;
      btn.classList.remove('hint');
      AF.Audio.SFX.pop();
      AF.Audio.say(step.say || step.label);
      AF.FX.send(btn, slot(i), () => {
        if (!S.alive) return;
        btn.classList.add('used');
        slot(i).classList.add('filled');
        slot(i).innerHTML = `<b>${i + 1}</b><span class="slot-e">${step.e || U.esc(step.glyph)}</span>`;
        AF.FX.sparkleAt(slot(i), 8);
      });

      if (set.steps.every((x, k) => filled[k])) {
        locked = true;
        S.lap();
        AF.Art.react(S.charEl, 'happy');
        S.later(() => {
          AF.Audio.SFX.right();
          if (set.praise) AF.Audio.say(set.praise);
          const row = S.host.querySelector('.slots');
          if (row) row.classList.add('done');
        }, 900);
        S.after(() => {
          S.round++;
          if (S.round >= sets.length) S.done(); else E.swap(S, next);
        }, set.praise ? 3300 : 2000);
      }
      return true;
    }

    next();
  };

  /* ============================================================
     BUILD
     level: { words: [{ w, e }], rounds, extra: n, pool: 'satpin' }
     ============================================================ */
  E.build = function (S) {
    const lv = S.level;
    const words = U.shuffle(lv.words).slice(0, lv.rounds);
    let word, pos, wrong, locked;


    function next() {
      word = words[S.round];
      pos = 0; wrong = 0; locked = false;

      const letters = word.w.split('');
      // c and k make the same sound, so a word with one never offers the other
      const avoid = /[ck]/.test(word.w) ? letters.concat(['c', 'k']) : letters;
      const spare = U.pick((lv.pool || 'satpinmdgock').split(''), lv.extra + (S.api.stretch ? 1 : 0), avoid);
      const tiles = U.shuffle(letters.concat(spare));

      const stage = E.frame(S, {
        text: `Build the word <b>${U.esc(word.w)}</b>`, rounds: words.length, cls: 'stage-build'
      });
      stage.innerHTML = `
        <div class="build-top">
          <div class="build-pic">${word.e}</div>
          <div class="build-slots">${letters.map((c, i) => `<span class="bslot" data-b="${i}"></span>`).join('')}</div>
        </div>
        <div class="tiles">${tiles.map(c => `<button class="tile-l" data-c="${c}">${c}</button>`).join('')}</div>`;

      S.replay = () => E.talk(S, `Build the word, ${word.w}.`, {
        onEnd: () => { if (S.alive && !locked) AF.Audio.sound(AF.phonic(word.w[pos])); }
      });

      const btns = Array.from(stage.querySelectorAll('.tile-l'));
      const free = (b) => !locked && !b.classList.contains('used') && !b.classList.contains('flying');
      btns.forEach(b => {
        b.addEventListener('click', () => { if (free(b)) tap(b, btns, stage); });
        // The letter can also be carried to the glowing space.
        AF.Drag.on(S, b, {
          can: () => free(b),
          targets: () => [stage.querySelector(`[data-b="${pos}"]`)].filter(Boolean),
          drop: () => tap(b, btns, stage)
        });
      });
      stage.querySelector('[data-b="0"]').classList.add('want');
      S.later(() => { S.replay(); S.mark(); }, 320);
    }

    function tap(btn, btns, stage) {
      if (btn.dataset.c !== word.w[pos]) {
        if (shaking(btn)) { AF.Drag.home(btn); return false; }
        wrong++;
        nope(S, btn);
        AF.Drag.home(btn);
        if (wrong >= 2) {
          const hint = btns.filter(b => b.dataset.c === word.w[pos] && !b.classList.contains('used'))[0];
          if (hint) hint.classList.add('hint');
          S.later(() => AF.Audio.sound(AF.phonic(word.w[pos])), 450);
        }
        return false;
      }

      wrong = 0;
      btn.classList.remove('hint');
      const slot = stage.querySelector(`[data-b="${pos}"]`);
      const ch = word.w[pos];
      slot.classList.remove('want');
      AF.FX.send(btn, slot, () => {
        if (!S.alive) return;
        btn.classList.add('used');
        slot.textContent = ch;
        slot.classList.add('filled');
      });
      AF.Audio.SFX.pop();
      pos++;
      const nextSlot = stage.querySelector(`[data-b="${pos}"]`);
      if (nextSlot) nextSlot.classList.add('want');

      if (pos < word.w.length) { AF.Audio.sound(AF.phonic(btn.dataset.c)); return true; }

      locked = true;
      S.lap();
      AF.Art.react(S.charEl, 'happy');
      AF.FX.sparkleAt(stage.querySelector('.build-slots'), 16);
      stage.querySelector('.build-slots').classList.add('done');
      AF.Audio.SFX.right();
      // Blend it: the sounds run together, a breath, then the whole word.
      let moved = false;
      const move = () => {
        if (moved) return;
        moved = true;
        S.round++;
        if (S.round >= words.length) S.done(); else E.swap(S, next);
      };
      AF.Audio.sound(AF.blend(word.w), {
        onEnd: () => S.later(() => AF.Audio.say(word.w, { onEnd: () => S.later(move, 900) }), 600)
      });
      S.later(move, 12000);         // in case something cut the blend off
      return true;
    }

    next();
  };

  /* ============================================================
     MEMORY
     level: { n, pairs: [{ w, e }], words?, clay?, peek? }
        or  pairs: [{ w, a: face, b: face }]   face = { e | t | html }
     With `words`, one card of each pair shows the written word.
     With `clay`, the cards are the soft shapes from the toy box.
     With `peek` (and on every Basic level), every card is shown for
     a moment first.

     The cards are chunky clay tiles in a wooden tray: they tip up
     when touched, hop when they match and settle back when they
     do not.
     ============================================================ */

  /* White shapes pressed into coloured clay. */
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const CLAY = [
    ['star', '#F6C453', '<path d="M24 5l5.600 12.300 13.400 1.500-10 9.100 2.800 13.200L24 34.400 12.200 41.100 15 27.900 5 18.800l13.400-1.500z"/>'],
    ['moon', '#EE6B6E', '<path d="M31 6a18.500 18.500 0 1 0 11.500 30.500A15.500 15.500 0 0 1 31 6z"/>'],
    ['sun', '#6CC27A', dot(24, 24, 9.500) + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<rect x="21.800" y="4" width="4.400" height="7.500" rx="2.200" transform="rotate(${a} 24 24)"/>`).join('')],
    ['heart', '#A98BE0', '<path d="M24 41C9.500 30.500 5 20.500 11 13.500c4.500-5 11-3 13 2.500 2-5.500 8.500-7.500 13-2.500 6 7 1.500 17-13 27.500z"/>'],
    ['fish', '#4D9DE0', '<path d="M5 24c6-9.500 19-12 28-4.500l9-7v23l-9-7C24 36 11 33.500 5 24z"/>'],
    ['leaf', '#55B985', '<path d="M7 41C7 20 19 8 42 7c0 23-12 35-35 34z"/>'],
    ['flower', '#F2A03D', [0, 72, 144, 216, 288].map(a => `<circle cx="24" cy="12.500" r="7.500" transform="rotate(${a} 24 24)"/>`).join('') + dot(24, 24, 6)],
    ['cloud', '#5FB6D9', '<path d="M13 37a8.500 8.500 0 0 1-1-17 11.500 11.500 0 0 1 22-2.500A9.800 9.800 0 0 1 36 37z"/>'],
    ['drop', '#EC7FA9', '<path d="M24 5c8.500 11 13 18 13 24a13 13 0 0 1-26 0c0-6 4.500-13 13-24z"/>'],
    ['tree', '#8C7AE6', '<path d="M24 4l13 17h-6.500l9 12H28v9h-8v-9H8.500l9-12H11z"/>']
  ];
  const clay = (c) => ({ html: `<span class="clay" style="--h:${c[1]}"><svg viewBox="0 0 48 48" fill="#fff">${c[2]}</svg></span>` });
  /* painted card backs (art/ui/mem-*), in the same order as their colours */
  const MEMBACK = ['paw', 'star', 'heart', 'moon', 'flower', 'leaf', 'fish', 'sun'];
  const BACKS = ['#F6C453', '#EE6B6E', '#6CC27A', '#A98BE0', '#4D9DE0', '#55B985', '#F2A03D', '#8C7AE6'];

  E.memory = function (S) {
    const lv = S.level;
    const source = lv.clay ? CLAY.map(c => ({ w: c[0], a: clay(c), b: clay(c) })) : lv.pairs;
    const n = Math.min(source.length, lv.n + (S.api.stretch ? 1 : 0));
    const pairs = U.shuffle(source).slice(0, n);
    const cards = U.shuffle(pairs.reduce((all, p, i) => all.concat([
      { id: i, w: p.w, say: p.sayA || p.w, face: p.a || { e: p.e } },
      { id: i, w: p.w, say: p.sayB || p.w, face: p.b || (lv.words ? { t: p.w } : { e: p.e }) }
    ]), []));

    let open = [], busy = false, found = 0, misses = 0;

    const face = (f) => f.html ? f.html
      : f.e ? `<span class="mem-e">${f.e}</span>`
      : `<span class="mem-w" style="--len:${String(f.t).length}">${U.esc(f.t)}</span>`;

    // pairs found show as the progress dots every game has
    const stage = E.frame(S, { text: 'Find the <b>pairs</b>!', cls: 'stage-memory', rounds: n });
    const total = cards.length;
    // upright phone: as few columns as keep the cards big (2 for six cards, 3 for up to twelve)
    const cols = total <= 6 ? 2 : total <= 12 ? 3 : 4;
    // on a wide screen: the fewest rows that leave no gap and no more than eight across
    const lrows = [2, 3, 4].filter(r => total % r === 0 && total / r <= 8)[0] || 3;
    stage.innerHTML = `
      <span class="vh" aria-live="polite" data-found></span>
      <div class="tray-wrap">
        <div class="tray mem-tray" style="--pc:${cols};--pr:${Math.ceil(total / cols)};--lc:${Math.ceil(total / lrows)};--lr:${lrows}">
          ${cards.map((c, i) => `
            <button class="mem" data-i="${i}" style="--i:${i};--h:${BACKS[(i + Math.floor(i / cols)) % BACKS.length]};--back:url(${new URL('art/ui/mem-' + MEMBACK[(i + Math.floor(i / cols)) % MEMBACK.length] + '.webp', location.href).href})" aria-label="Card ${i + 1}">
              <span class="mem-in">
                <span class="mem-back">${AF.Icon.svg('paw')}</span>
                <span class="mem-front">${face(c.face)}</span>
              </span>
            </button>`).join('')}
        </div>
      </div>
      <div class="stage-cap">Match the pairs!</div>`;

    const btns = Array.from(stage.querySelectorAll('.mem'));
    // A card is called by its number while face down, by what is on it once seen.
    const name = (b) => b.setAttribute('aria-label', b.classList.contains('up') || b.classList.contains('matched')
      ? cards[b.dataset.i].w + (b.classList.contains('matched') ? ', found' : '') : `Card ${+b.dataset.i + 1}`);
    S.replay = () => E.talk(S, 'Find the pairs!');
    S.later(() => { S.replay(); S.mark(); }, 320);

    /* A first look: the cards lie face up for a moment, then turn
       over one after another like a wave. */
    if (lv.peek || (lv.tier || 0) === 0 || S.api.help >= 2) {   // every Basic level gets a first look
      busy = true;
      S.later(() => btns.forEach(b => b.classList.add('up')), 500);
      btns.forEach((b, i) => S.later(() => { b.classList.remove('up'); AF.Audio.SFX.flip(); }, 2600 + i * 90));
      S.later(() => btns.forEach(name), 500);
      S.later(() => btns.forEach(name), 2700 + btns.length * 90);
      S.later(() => { busy = false; }, 2700 + btns.length * 90);
    }

    btns.forEach(btn => btn.addEventListener('click', () => {
      if (busy || btn.classList.contains('up')) return;
      const card = cards[btn.dataset.i];
      btn.classList.add('up');
      name(btn);
      AF.Audio.SFX.flip();
      AF.Audio.say(card.say);
      open.push({ btn: btn, card: card });
      if (open.length < 2) return;

      const a = open[0], b = open[1];
      open = [];
      if (a.card.id === b.card.id) {
        found++;
        S.later(() => {
          [a, b].forEach(x => { x.btn.classList.add('matched'); name(x.btn); AF.FX.sparkleAt(x.btn, 8); });
          AF.Audio.SFX.right();
          AF.Art.react(S.charEl, 'happy');
          stage.querySelector('[data-found]').textContent = `${found} of ${n} pairs found`;
          const d = S.host.querySelector('.play-dots');
          if (d) d.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < found ? 'done' : ''}${i === found ? ' now' : ''}"></i>`).join('');
        }, 380);
        if (found === n) {
          S.lap();
          // Roughly one miss per pair is just exploring, not a mistake.
          S.mistakes = Math.max(0, Math.ceil((misses - n) / 2));
          S.later(() => { stage.querySelector('.tray').classList.add('won'); AF.Audio.SFX.win(); }, 800);
          S.later(() => S.done(), 2000);
        }
      } else {
        misses++;
        busy = true;
        S.later(() => { a.btn.classList.add('no'); b.btn.classList.add('no'); }, 600);
        S.later(() => {
          [a, b].forEach(x => { x.btn.classList.remove('up', 'no'); name(x.btn); });
          busy = false;
        }, 1150);
      }
    }));
  };
})(window.AF = window.AF || {});
