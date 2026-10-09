/* ============================================================
   letters/letters.js — Letter Sounds (Phase 0 demo)
   ------------------------------------------------------------
   One playable module so the plumbing is provable end to end:
   character -> voice -> level -> stars -> progress.

   Teaching order is s a t p i n, not A B C. Those six letters
   already build real words (sat, pin, tap, nap, sit), so the
   child reads something true in the first week instead of
   reciting the alphabet for six months.

   The spellings below are shaped for a speech synthesiser, not
   for a linguist: "ssss" makes the device hold the /s/ sound,
   where "s" would make it say the letter name "ess".
   ============================================================ */
(function (AF) {
  'use strict';

  const LETTERS = {
    s: { say: 'ssss',  word: 'sun',   emoji: '☀️' },
    a: { say: 'aaah',  word: 'apple', emoji: '🍎' },
    t: { say: 'tuh',   word: 'tree',  emoji: '🌳' },
    p: { say: 'puh',   word: 'pig',   emoji: '🐷' },
    i: { say: 'ih',    word: 'igloo', emoji: '🧊' },
    n: { say: 'nnnn',  word: 'nest',  emoji: '🪹' }
  };

  const LEVELS = [
    { id: 'l1', title: 'S and A',    icon: 's', pool: ['s', 'a'],                     choices: 2, rounds: 5 },
    { id: 'l2', title: 'Add T',      icon: 't', pool: ['s', 'a', 't'],                choices: 3, rounds: 5 },
    { id: 'l3', title: 'Add P',      icon: 'p', pool: ['s', 'a', 't', 'p'],           choices: 3, rounds: 6 },
    { id: 'l4', title: 'Add I',      icon: 'i', pool: ['s', 'a', 't', 'p', 'i'],      choices: 4, rounds: 6 },
    { id: 'l5', title: 'All six',    icon: 'n', pool: ['s', 'a', 't', 'p', 'i', 'n'], choices: 4, rounds: 8 },
    { id: 'l6', title: 'Build a word', icon: '🧩', soon: true },
    { id: 'l7', title: 'Trace it',     icon: '✏️', soon: true },
    { id: 'l8', title: 'Listen & copy', icon: '🎤', soon: true }
  ];

  let state = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildRound() {
    const lv = state.level;
    // Avoid asking for the same letter twice in a row.
    let target;
    do { target = lv.pool[Math.floor(Math.random() * lv.pool.length)]; }
    while (lv.pool.length > 1 && target === state.lastTarget);
    state.lastTarget = target;

    const others = shuffle(lv.pool.filter(k => k !== target)).slice(0, lv.choices - 1);
    state.target = target;
    state.options = shuffle([target].concat(others));
    state.roundWrong = 0;
  }

  function speakPrompt() {
    const info = LETTERS[state.target];
    AF.Art.react(state.host.querySelector('.play-char'), 'talk');
    AF.Audio.say('Which letter says', {
      onEnd: () => AF.Audio.sound(info.say)
    });
  }

  function render() {
    const lv = state.level;
    const info = LETTERS[state.target];

    state.host.innerHTML = `
      <div class="play-top">
        <div class="play-guide">
          <div class="play-char" data-char></div>
          <button class="speech" id="lt-replay" aria-label="Say it again">
            Which letter says <b>/${info.say.replace(/(.)\1+/g, '$1')}/</b>? <span class="speech-ico">🔊</span>
          </button>
        </div>
        <div class="play-dots" aria-label="Progress">
          ${Array.from({ length: lv.rounds }, (_, i) =>
            `<i class="${i < state.round ? 'done' : ''}${i === state.round ? ' now' : ''}"></i>`).join('')}
        </div>
      </div>
      <div class="letter-grid" style="--n:${state.options.length}">
        ${state.options.map(k => `
          <button class="lcard" data-key="${k}">
            <span class="lcard-face">
              <span class="lcard-glyph">${k}</span>
              <span class="lcard-hint">${LETTERS[k].emoji}</span>
            </span>
          </button>`).join('')}
      </div>`;

    AF.Art.paint(state.host.querySelector('.play-char'), state.api.character);
    state.host.querySelector('#lt-replay').onclick = () => { AF.Audio.SFX.tap(); speakPrompt(); };

    state.host.querySelectorAll('.lcard').forEach(btn => {
      btn.addEventListener('click', () => choose(btn));
    });

    // Adaptive help kicks in only after repeated attempts.
    if (state.api.help >= 1 && state.options.length > 2) {
      setTimeout(() => {
        const wrong = Array.from(state.host.querySelectorAll('.lcard'))
          .filter(b => b.dataset.key !== state.target);
        if (wrong.length) wrong[0].classList.add('dimmed');
      }, 2600);
    }

    setTimeout(speakPrompt, 320);
  }

  function choose(btn) {
    if (state.locked) return;
    const key = btn.dataset.key;
    const charEl = state.host.querySelector('.play-char');

    if (key !== state.target) {
      state.mistakes++;
      state.roundWrong++;
      AF.Audio.SFX.wrong();
      AF.Art.react(charEl, 'hmm');
      btn.classList.add('nope');
      setTimeout(() => btn.classList.remove('nope'), 420);

      // No dead ends: after two misses the wrong cards fade out
      // so the child can always find a way forward.
      if (state.roundWrong >= 2) {
        state.host.querySelectorAll('.lcard').forEach(b => {
          if (b.dataset.key !== state.target) b.classList.add('dimmed');
        });
        setTimeout(() => AF.Audio.sound(LETTERS[state.target].say), 500);
      }
      return;
    }

    state.locked = true;
    btn.classList.add('yes');
    AF.Audio.SFX.right();
    AF.Art.react(charEl, 'happy');
    AF.FX.sparkleAt(btn, 14);

    const info = LETTERS[state.target];
    AF.Audio.say(`${state.target} … ${info.say} … ${info.word}`, { rate: 0.7 });

    setTimeout(() => {
      state.locked = false;
      state.round++;
      if (state.round >= state.level.rounds) {
        state.api.finish(state.mistakes);
      } else {
        buildRound();
        render();
      }
    }, 1500);
  }

  AF.register({
    id: 'letters',
    title: 'Letters',
    icon: '🔤',
    colour: '#FFC93C',
    blurb: 'Letter sounds',
    note: 'Phonics order: s a t p i n',
    levels: LEVELS,

    play(host, level, api) {
      state = {
        host: host, level: level, api: api,
        round: 0, mistakes: 0, locked: false,
        lastTarget: null, roundWrong: 0
      };
      buildRound();
      render();
    },

    stop() {
      AF.Audio.stop();
      state = null;
    }
  });
})(window.AF = window.AF || {});
