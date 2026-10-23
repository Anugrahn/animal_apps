/* ============================================================
   engines/base.js — registry + what every game engine shares
   ------------------------------------------------------------
   v1 had one module with its own game code. v2 splits that in two:

     ENGINES  know HOW to play   (choose, order, build, memory,
                                  maze, speak, story, song, breathe,
                                  and lesson / intro: a lesson is a
                                  few of the others in a row)
     CONTENT  knows WHAT to teach (content/*.js — plain data)

   A level is data: { id, title, icon, type: 'choose', ...config }.
   The registry looks up the engine by `type`, so adding a level —
   or a whole subject — never means writing game code again.

   Every engine run gets a SESSION. Timers go through S.later(),
   so when the child leaves a level every pending callback dies
   with it. (In v1 a stray timer could fire into the next level.)
   ============================================================ */
(function (AF) {
  'use strict';

  AF.registry = AF.registry || [];
  AF.Engines = AF.Engines || {};

  let session = null;

  /* The four areas of the curriculum, in home-screen order.
     Since v4 the curriculum follows Danbi Education's Wink: four core
     subjects taught as short lessons (Phonics, English and Bahasa
     Indonesia on ABC Island, Math on STEM Island), and the "Fun & Joy"
     extras (habits, feelings, science, games, stories, songs). */
  AF.AREAS = [
    { id: 'literacy', title: 'Phonics, English & Bahasa', island: 'ABC Island',   colour: '#F28A2E', glyph: 'literacy', icon: '📚' },
    { id: 'stem',     title: 'Math & Discover',           island: 'STEM Island',  colour: '#F2B618', glyph: 'stem',     icon: '🔬' },
    { id: 'life',     title: 'Good Habits & Feelings',    island: 'Heart Island', colour: '#E5535A', glyph: 'life',     icon: '💛' },
    { id: 'play',     title: 'Games, Stories & Songs',    island: 'Play Island',  colour: '#3E9BF0', glyph: 'playtime', icon: '🎈' }
  ];

  /** Modules call this to join the home screen. */
  AF.register = function (mod) {
    if (!mod.play) {
      mod.play = function (host, level, api) { AF.Engines.run(host, level, api); };
      mod.stop = function () { AF.Engines.stop(); };
    }
    AF.registry.push(mod);
    return mod;
  };

  /* Every subject has stages. Content files write
       levels: AF.tiers([stage 1...], [stage 2...], ...)
     and get back one flat list with a `tier` on each level, so
     saved stars, the daily picks and the progress screen all keep
     working on a plain list. A subject names its own stages
     (`stages: ['Step 1', ...]`); the rest use these three. */
  AF.TIERS = ['Basic', 'Intermediate', 'Advanced'];
  AF.stageNames = (mod) => mod.stages || AF.TIERS;
  AF.tiers = function () {
    const out = [];
    Array.prototype.forEach.call(arguments, (list, t) => list.forEach(lv => { lv.tier = t; out.push(lv); }));
    return out;
  };

  AF.module = function (id) {
    return AF.registry.filter(m => m.id === id)[0];
  };

  /* ---------- little helpers engines and content share ---------- */

  const U = AF.U = {
    rand(n) { return Math.floor(Math.random() * n); },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = U.rand(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** n random items, never including anything in `not`. */
    pick(arr, n, not) {
      not = not || [];
      return U.shuffle(arr.filter(x => not.indexOf(x) < 0)).slice(0, n);
    },
    one(arr, not) { return U.pick(arr, 1, not == null ? [] : [not])[0] || arr[0]; },
    esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
    /** "a" / "an" for a spoken prompt. */
    a(word) { return (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word; }
  };

  /* ---------- the words the games say themselves ----------
     Content brings its own questions in its own language. These are
     the few lines an engine says on its own ("Find the pairs!"), in
     English and in Bahasa Indonesia; a level with lang: 'id' gets the
     Indonesian ones. */
  AF.STR = {
    en: {
      build: (w) => `Build the word, ${w}.`, buildText: (w) => `Build the word <b>${U.esc(w)}</b>`,
      write: (w) => `Write the word, ${w}.`, writeText: (w) => `Write <b>${U.esc(w)}</b>`,
      traceNum: (n) => `Trace number ${AF.NUM[n] || n}.`, traceNumText: (n) => `Trace number <b>${n}</b>`,
      traceLetter: 'Trace the letter that says', start: 'Start at the green dot',
      pairs: 'Find the pairs!', pairsText: 'Find the <b>pairs</b>!', pairsCap: 'Match the pairs!',
      questions: 'Questions', theEnd: 'The end',
      look: 'Look and listen', lookText: 'Look and <b>listen</b>',
      stepOf: (i, n) => `Step ${i} of ${n}`
    },
    id: {
      build: (w) => `Susun kata, ${w}.`, buildText: (w) => `Susun kata <b>${U.esc(w)}</b>`,
      write: (w) => `Tebalkan, ${w}.`, writeText: (w) => `Tebalkan <b>${U.esc(w)}</b>`,
      traceNum: (n) => `Tebalkan angka ${n}.`, traceNumText: (n) => `Tebalkan angka <b>${n}</b>`,
      traceLetter: 'Tebalkan hurufnya', start: 'Mulai dari titik hijau',
      pairs: 'Cari pasangannya!', pairsText: 'Cari <b>pasangannya</b>!', pairsCap: 'Cocokkan pasangannya!',
      questions: 'Pertanyaan', theEnd: 'Selesai',
      look: 'Lihat dan dengarkan', lookText: 'Lihat dan <b>dengarkan</b>',
      stepOf: (i, n) => `Langkah ${i} dari ${n}`
    }
  };
  /** A line in the level's language: E.t(S, 'build', 'cat'). */
  AF.Engines.t = function (S, key) {
    const lang = (S && S.level && S.level.lang) || 'en';
    const v = (AF.STR[lang] && AF.STR[lang][key]) != null ? AF.STR[lang][key] : AF.STR.en[key];
    return typeof v === 'function' ? v.apply(null, Array.prototype.slice.call(arguments, 2)) : v;
  };

  /* ---------- running a level ---------- */

  AF.Engines.run = function (host, level, api) {
    AF.Engines.stop();
    session = makeSession(host, level, api);
    start(session);
  };

  function start(S) {
    const engine = AF.Engines[S.level.type];
    if (!engine) {
      S.host.innerHTML = '<p class="empty">This game is not ready yet.</p>';
      return;
    }
    engine(S);
  }

  /**
   * A game inside a game: one step of a lesson. It gets its own timers
   * and listeners, which all die when the step ends (or the lesson is
   * left), and reports back through onFinish(mistakes, avgMs) instead of
   * ending the level.
   */
  AF.Engines.child = function (S, level, onFinish) {
    const api = Object.assign({}, S.api, { finish: onFinish });
    const C = makeSession(S.host, level, api);
    S.cleanup.push(() => C.end());
    start(C);
    return C;
  };

  function makeSession(host, level, api) {
    const timers = [];
    const S = {
      host: host, level: level, api: api, alive: true,
      mistakes: 0, round: 0, times: [], t0: 0,
      cleanup: [],

      /** setTimeout that dies with the level. */
      later(fn, ms) {
        const id = setTimeout(() => { if (S.alive) fn(); }, ms);
        timers.push(id);
        return id;
      },
      /** Like later(), but also lets the friend finish talking first (up to
          8 s more), so a slow, clear line is never cut off by what comes next. */
      after(fn, ms) {
        let waited = 0;
        const go = () => {
          if (AF.Audio.busy() && waited < 8000) { waited += 150; S.later(go, 150); }
          else fn();
        };
        return S.later(go, ms);
      },
      /** Start timing how long the child thinks about a round. */
      mark() { S.t0 = Date.now(); },
      /** Stop timing (call on the correct answer). */
      lap() { if (S.t0) { S.times.push(Math.min(Date.now() - S.t0, 30000)); S.t0 = 0; } },
      miss() { S.mistakes++; },
      /** addEventListener that is removed when the level ends. */
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        S.cleanup.push(() => target.removeEventListener(type, fn, opts));
      },
      done() {
        if (!S.alive) return;
        const avg = S.times.length ? S.times.reduce((a, b) => a + b, 0) / S.times.length : 0;
        api.finish(S.mistakes, avg);
      },
      end() {
        if (!S.alive) return;
        S.alive = false;
        timers.forEach(clearTimeout);
        S.cleanup.forEach(fn => { try { fn(); } catch (e) {} });
      }
    };
    return S;
  }

  AF.Engines.stop = function () {
    if (session) { session.end(); session = null; }
    AF.Audio.stop();
    if (AF.Speech) AF.Speech.cancel();
  };

  /**
   * The top of every play screen: the child's friend, a speech
   * bubble that repeats the prompt when tapped, and progress dots.
   * Returns the empty stage element underneath for the engine.
   */
  AF.Engines.frame = function (S, o) {
    const total = o.rounds || 0;
    const dots = total > 1 ? Array.from({ length: total }, (_, i) =>
      `<i class="${i < S.round ? 'done' : ''}${i === S.round ? ' now' : ''}"></i>`).join('') : '';

    /* The friend and the bubble stay put from one question to the
       next; only the words, the dots and the stage change. A screen
       that rebuilt itself every round is what made v2 feel stiff. */
    const top = S.host.querySelector('.play-top');
    if (top) {
      const text = top.querySelector('.speech-text');
      if (text.innerHTML !== (o.text || '')) {
        text.innerHTML = o.text || '';
        const sp = top.querySelector('.speech');
        sp.classList.remove('re'); void sp.offsetWidth; sp.classList.add('re');
      }
      const d = top.querySelector('.play-dots');
      d.hidden = !dots;
      d.innerHTML = dots;
      S.host.querySelectorAll('.stage').forEach(el => el.remove());
      // (a lesson's next step reuses the frame: it now answers to that step)
      S.charEl = top.querySelector('[data-char]');
      top.querySelector('[data-replay]').onclick = () => { AF.Audio.SFX.tap(); if (S.replay) S.replay(); };
    } else {
      S.host.innerHTML = `
        <div class="play-top">
          <div class="play-guide">
            <div class="play-friend"><div class="play-char" data-char></div></div>
            <div class="prompt-col">
              <button class="speech prompt" data-replay>
                <span class="vh">Say it again: </span><span class="speech-text">${o.text || ''}</span><span class="prompt-ic" data-ic="sound"></span>
              </button>
            </div>
          </div>
        </div>`;
      S.host.querySelector('.prompt-col').insertAdjacentHTML('beforeend',
        `<div class="play-dots" aria-label="Progress" ${dots ? '' : 'hidden'}>${dots}</div>`);
      S.charEl = S.host.querySelector('[data-char]');
      AF.Art.paint(S.charEl);
      S.host.querySelector('[data-replay]').onclick = () => {
        AF.Audio.SFX.tap();
        if (S.replay) S.replay();
      };
    }
    const stage = document.createElement('div');
    stage.className = 'stage ' + (o.cls || '');
    S.host.appendChild(stage);
    return stage;
  };

  /** Lets what is on the stage tumble away before `fn` builds the
      next round, so one question flows into the next. */
  AF.Engines.swap = function (S, fn) {
    const stage = S.host.querySelector('.stage');
    if (!stage || !AF.FX.motionOK()) { fn(); return; }
    stage.classList.add('leaving');
    S.later(fn, 230);
  };

  /** Changes the words in the speech bubble. */
  AF.Engines.bubble = function (S, html) {
    const el = S.host.querySelector('.speech-text');
    if (el) el.innerHTML = html;
  };

  /** Talk + a little "talking" wobble from the character. */
  AF.Engines.talk = function (S, text, opts) {
    AF.Art.react(S.charEl, 'talk');
    AF.Audio.say(text, Object.assign({ question: true }, opts));
  };
})(window.AF = window.AF || {});
