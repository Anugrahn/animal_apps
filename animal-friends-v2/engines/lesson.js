/* ============================================================
   engines/lesson.js — a lesson, and the cards that open one
   ------------------------------------------------------------
     lesson  a few short games in a fixed order, one lesson
     intro   meet something new: one big card at a time

   The core subjects follow Danbi Education's Wink: every lesson
   walks the same road, "concept -> practice -> problem-solving ->
   review", in about five minutes. Each subject names the road its
   own way (content/*.js picks the steps):

     Phonics   Listen  -> Trace     -> Play   -> Quiz
     English   Story   -> Words     -> Say it -> Quiz
     Math      Story   -> Real life -> Play   -> Quiz
     Bahasa    Kenal   -> Tebalkan  -> Kuasai

   A step is any other level ({ step: 'trace', type: 'trace', ... }).
   It runs as a child session (engines/base.js), so its timers die
   with it, and its mistakes add up to the lesson's stars.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;

  /* What each kind of step is called, its picture (under art/), and
     what the friend says as it begins. */
  const STEPS = {
    listen: { pic: 'ui/sound',            en: 'Listen',    id: 'Kenal',       go: 'Let’s listen!',              goId: 'Ayo kenalan!' },
    story:  { pic: 'game/story',          en: 'Story',     id: 'Cerita',      go: 'Story time!',                goId: 'Ayo dengarkan ceritanya!' },
    words:  { pic: 'subj/words',          en: 'Words',     id: 'Kata',        go: 'Here are the new words!',    goId: 'Ini kata-kata barunya!' },
    life:   { pic: 'prop/stem-magnifier', en: 'Real life', id: 'Sehari-hari', go: 'Let’s find it around us!',   goId: 'Ayo cari di sekitar kita!' },
    trace:  { pic: 'game/trace',          en: 'Trace',     id: 'Tebalkan',    go: 'Let’s trace!',               goId: 'Ayo menebalkan!' },
    say:    { pic: 'game/speak',          en: 'Say it',    id: 'Ucapkan',     go: 'Now you say it!',            goId: 'Sekarang kamu ucapkan!' },
    play:   { pic: 'game/puzzle',         en: 'Play',      id: 'Main',        go: 'Let’s play!',                goId: 'Ayo bermain!' },
    master: { pic: 'game/match',          en: 'Try it',    id: 'Kuasai',      go: 'Now you try!',               goId: 'Sekarang kamu coba!' },
    song:   { pic: 'game/song',           en: 'Sing',      id: 'Bernyanyi',   go: 'Let’s sing!',                goId: 'Ayo bernyanyi!' },
    quiz:   { pic: 'game/coin',           en: 'Quiz',      id: 'Kuis',        go: 'Quiz time!',                 goId: 'Waktunya kuis!' },
    review: { pic: 'game/treasure',       en: 'Review',    id: 'Ulang',       go: 'Let’s remember!',            goId: 'Ayo kita ingat lagi!' }
  };
  const info = (st, lang) => {
    const s = STEPS[st.step] || STEPS.play;
    return { key: st.step, pic: s.pic, name: lang === 'id' ? s.id : s.en, go: lang === 'id' ? s.goId : s.go };
  };
  E.stepInfo = info;

  /** The lines a level (or each step of a lesson) is about to say, first
      ones first, so AF.Audio.preload can have them ready: a line said the
      moment a card turns or an answer is tapped then has no gap before it.
      Only data is read; a question generator is never called (that would
      change the questions), but a bank of questions shows its list (.all). */
  E.linesOf = function (level) {
    const name = AF.Profile.character && AF.Profile.character.name;
    const out = [], add = (t) => {
      if (typeof t !== 'string' || !t) return;
      if (name) t = t.split('{name}').join(name);          // (as engines/media.js says it)
      if (out.indexOf(t) < 0) out.push(t);
    };
    const take = (r) => { if (r) { add(r.say); add(r.praise); add(r.sound); } };
    (level.steps ? level.steps : [level]).forEach(lv => {
      if (level.steps) add(info(lv, 'en').go);
      add(lv.say);
      (lv.cards || []).forEach(c => { add(c.say); add(c.sound); });
      if (lv.gen && lv.gen.all) lv.gen.all.forEach(take);
      (lv.fixed || []).forEach(take);
      (lv.quiz || lv.questions || []).forEach(take);
      (lv.pages || []).forEach(pg => add(pg.text));
      (lv.pairs || []).forEach(pr => { add(pr.sayA || pr.w); add(pr.say || pr.sayB || pr.w); });
      if (lv.items && typeof lv.ask === 'function') lv.items.forEach(it => { try { add(lv.ask(it)); } catch (e) { /* a level that needs more than its item */ } });
    });
    return out;
  };

  /* ============================================================
     LESSON
     level: { steps: [{ step, type, ...that game's own config }], lang? }
     ============================================================ */
  E.lesson = function (S) {
    const lv = S.level, steps = lv.steps;
    const list = steps.map(st => info(st, lv.lang));
    let i = -1, child = null, mistakes = 0;
    const times = [];

    function next() {
      if (child) { child.end(); child = null; }
      i++;
      if (S.api.steps) S.api.steps(list, i);
      if (i >= steps.length) {
        S.mistakes = mistakes;
        S.times = times;
        S.done();
        return;
      }
      const st = Object.assign({ lang: lv.lang, tier: lv.tier }, steps[i]);
      S.host.innerHTML = '';
      card(i, () => {
        child = E.child(S, st, (m, avg) => {
          mistakes += m || 0;
          if (avg) times.push(avg);
          S.after(next, 700);
        });
      });
    }

    /* The road of the lesson, with this step lit up, for a moment
       (a tap goes straight on). The first one also shows its name. */
    function card(at, go) {
      const el = document.createElement('button');
      el.className = 'step-card';
      el.setAttribute('aria-label', list[at].name);
      el.innerHTML = `
        <b class="step-title">${U.esc(lv.title)}</b>
        <span class="step-road">${list.map((s, k) => `
          <span class="step-chip${k < at ? ' done' : k === at ? ' now' : ''}" style="--i:${k}">
            <img src="art/${s.pic}.webp" alt="" draggable="false"><i>${U.esc(s.name)}</i>
          </span>`).join('<span class="step-link"></span>')}
        </span>
        <span class="step-go">${U.esc(list[at].name)}</span>`;
      S.host.appendChild(el);
      let gone = false;
      const off = () => {
        if (gone || !S.alive) return;
        gone = true;
        el.classList.add('out');
        S.later(() => { el.remove(); go(); }, AF.FX.motionOK() ? 260 : 0);
      };
      el.onclick = () => { AF.Audio.SFX.tap(); AF.Audio.stop(); off(); };
      AF.Audio.say(at === 0 && lv.say ? lv.say : list[at].go);
      S.after(off, 1300);
    }

    next();
  };

  /* ============================================================
     INTRO
     level: { cards: [{ big?, pic?, show?, word?, say, sound?, text? }], text? }
       big   a letter, a number or a syllable, in big type
       pic   a picture (an emoji, painted where there is a painting)
       show  anything else, as html (a row of apples, a shape, a clock)
       word  the word under it
       say   what the friend says; `sound` is a letter sound said after
     Nothing can go wrong here: the friend says each card, a tap on the
     card says it again, and the green arrow goes on.
     ============================================================ */
  E.intro = function (S) {
    const lv = S.level, cards = lv.cards;

    function speak(c, onEnd) {
      E.talk(S, c.say, {
        onEnd: () => {
          if (!S.alive) return;
          if (c.sound) AF.Audio.sound(c.sound, { onEnd: onEnd });
          else if (onEnd) onEnd();
        }
      });
    }

    function next() {
      const c = cards[S.round];
      const r = S.round;
      const stage = E.frame(S, { text: c.text || lv.text || E.t(S, 'lookText'), rounds: cards.length, cls: 'stage-intro' });
      stage.innerHTML = `
        <button class="intro-card" aria-label="${U.esc(c.word || c.big || 'Hear it again')}">
          ${c.big != null ? `<span class="intro-big" style="--len:${String(c.big).length}">${U.esc(c.big)}</span>` : ''}
          ${c.pic ? `<span class="intro-pic big-e">${c.pic}</span>` : ''}
          ${c.show ? `<span class="intro-show">${c.show}</span>` : ''}
          ${c.word ? `<span class="intro-word">${U.esc(c.word)}</span>` : ''}
        </button>
        <div class="intro-foot"><button class="big-round intro-go" data-ic="next" style="--h:#3CC46A" aria-label="Next"></button></div>`;
      const cardEl = stage.querySelector('.intro-card');
      const goEl = stage.querySelector('.intro-go');
      // the arrow wakes up once the card has been said
      const nudge = () => { if (S.alive && S.round === r) goEl.classList.add('wake'); };
      // (a quick tap on the arrow can move on before a line starts: each line is its own card's)
      S.replay = () => { if (S.round === r) speak(c, nudge); };
      cardEl.onclick = () => {
        AF.Audio.SFX.tap();
        cardEl.classList.remove('hop'); void cardEl.offsetWidth; cardEl.classList.add('hop');
        S.replay();
      };
      let went = false;
      goEl.onclick = () => {
        if (went) return;
        went = true;
        AF.Audio.SFX.pop();
        AF.Audio.stop();
        S.lap();
        S.round++;
        if (S.round >= cards.length) S.done(); else E.swap(S, next);
      };
      S.later(() => { S.mark(); S.replay(); }, 320);
      S.later(nudge, 6000);
    }

    next();
  };
})(window.AF = window.AF || {});
