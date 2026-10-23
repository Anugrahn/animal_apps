/* ============================================================
   engines/media.js — stories, songs and a calm-down breath
   ------------------------------------------------------------
     story    a read-aloud picture book, then a few questions
     song     a sing-along with a bouncing lyric and a drum
     breathe  a slow breathing exercise

   These are the "lean back" formats. Stories and songs cannot be
   got wrong: a story's stars come from its questions, and a song
   or a breath always earns three.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;

  /* ============================================================
     STORY
     level: { pages: [{ art, text, bg? }], quiz?: [round, ...] }
     "{name}" becomes the name of the child's friend and "{me}" in
     the art becomes the friend's picture — so every child gets a
     story about their own character.
     ============================================================ */
  E.story = function (S) {
    const lv = S.level;
    const name = AF.Profile.skin().name;
    const fill = (s) => String(s).replace(/\{name\}/g, name);
    let page = 0, turned = 0, reading = 0;

    function read() {
      const el = S.host.querySelector('.story-text');
      if (el) { el.classList.remove('reading'); void el.offsetWidth; el.classList.add('reading'); }
      const mine = ++reading, at = page;
      const wake = () => {
        if (mine !== reading || at !== page || !S.alive) return;
        const go = S.host.querySelector('.story [data-next]');
        if (go) go.classList.add('wake');
      };
      AF.Audio.say(fill(lv.pages[page].text), { rate: 0.8, onEnd: wake });
      S.later(wake, 2500 + lv.pages[page].text.length * 90);
    }

    function show() {
      const p = lv.pages[page];
      const last = page === lv.pages.length - 1;
      const art = p.art.split(' ').map(t =>
        t === '{me}' ? '<span class="story-me" data-me></span>' : `<span class="story-e">${t}</span>`).join('');
      const words = fill(p.text).split(' ').map(w =>
        `<button class="story-w" data-w="${U.esc(w.replace(/[^A-Za-z']/g, ''))}">${U.esc(w)}</button>`).join(' ');

      S.host.innerHTML = `
        <div class="story${/^#[23]/.test(p.bg || '') ? ' night' : ''}" style="--bg:${p.bg || '#FFF6D9'}">
          <div class="story-art">${art}</div>
          <p class="story-text">${words}</p>
          <div class="story-nav">
            <button class="round-btn" data-prev data-ic="back" aria-label="Back" ${page === 0 ? 'disabled' : ''}></button>
            <button class="round-btn" data-say data-ic="sound" aria-label="Read it again"></button>
            <span class="story-page">${page + 1} / ${lv.pages.length}</span>
            ${last ? `<button class="pill-go story-end" data-next>${E.t(S, lv.quiz ? 'questions' : 'theEnd')} <i data-ic="right"></i></button>`
              : '<button class="round-btn story-go" data-next data-ic="right" aria-label="Next page"></button>'}
          </div>
        </div>`;

      S.host.querySelectorAll('[data-me]').forEach(el => AF.Art.paint(el));
      S.host.querySelector('[data-say]').onclick = read;
      // one turn per tap: a quick second tap must not skip a page
      const turn = () => { const now = Date.now(); if (now - turned < 450) return false; turned = now; return true; };
      S.host.querySelector('[data-prev]').onclick = () => { if (page > 0 && turn()) { AF.Audio.SFX.tap(); page--; show(); } };
      S.host.querySelector('[data-next]').onclick = () => {
        if (!turn()) return;
        AF.Audio.SFX.tap();
        if (!last) { page++; show(); return; }
        AF.Audio.stop();
        if (!lv.quiz) { S.done(); return; }
        // Hand over to the choose engine for the questions.
        S.level = { type: 'choose', lang: lv.lang, fixed: lv.quiz.map(q => Object.assign({}, q, {
          say: fill(q.say), text: q.text ? fill(q.text) : null, praise: q.praise ? fill(q.praise) : null
        })) };
        S.round = 0;
        E.choose(S);
      };
      // Tap any word to hear just that word.
      S.host.querySelectorAll('.story-w').forEach(b => b.addEventListener('click', () => {
        if (!b.dataset.w) return;
        b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
        AF.Audio.say(b.dataset.w, { rate: 0.7 });
      }));

      S.later(read, 450);
    }

    show();
  };

  /* ============================================================
     SONG
     level: { tempo, lines: [{ words: [...], notes: 'C C G G', beats: [1, 1, 1, 1] }] }
     One note per word. The melody is synthesised; the grown-up
     and the child do the singing.
     ============================================================ */
  E.song = function (S) {
    const lv = S.level;
    const beat = lv.tempo || 0.45;
    let playing = false;

    const stage = E.frame(S, { text: 'Sing with me! Tap the <b>drum</b>', cls: 'stage-song' });
    stage.innerHTML = `
      <div class="lyrics">
        ${lv.lines.map((l, i) => `<p class="lyric" data-line="${i}">${l.words.map((w, j) =>
          `<span data-n="${i}-${j}">${U.esc(w)}</span>`).join(' ')}</p>`).join('')}
      </div>
      <div class="song-btns">
        <button class="btn" data-again hidden><i data-ic="retry"></i> Again</button>
        <button class="drum" data-drum data-ic="drum" aria-label="Drum"></button>
        <button class="big-round song-done" data-done data-ic="check" style="--h:#3CC46A" aria-label="Done" hidden></button>
      </div>`;

    const drum = stage.querySelector('[data-drum]');
    drum.addEventListener('click', () => {
      AF.Audio.SFX.drum();
      drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit');
      AF.FX.sparkleAt(drum, 6);
    });
    stage.querySelector('[data-again]').onclick = () => { AF.Audio.SFX.tap(); play(); };
    stage.querySelector('[data-done]').onclick = () => { AF.Audio.SFX.tap(); S.done(); };
    S.replay = () => { if (!playing) play(); };

    function play() {
      if (playing) return;
      playing = true;
      stage.querySelector('[data-again]').hidden = true;
      stage.querySelector('[data-done]').hidden = true;
      stage.querySelectorAll('.lyric span').forEach(s => s.classList.remove('on', 'sung'));

      let t = 0.5;
      lv.lines.forEach((line, i) => {
        const notes = line.notes.split(' ');
        S.later(() => {
          stage.querySelectorAll('.lyric').forEach(p => p.classList.toggle('now', +p.dataset.line === i));
          const p = stage.querySelector(`[data-line="${i}"]`);
          if (p && p.scrollIntoView) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          AF.Art.react(S.charEl, 'talk');
        }, t * 1000);
        notes.forEach((n, j) => {
          const dur = (line.beats ? line.beats[j] : 1) * beat;
          S.later(() => {
            AF.Audio.note(n, dur);
            const prev = stage.querySelector('.lyric span.on');
            if (prev) { prev.classList.remove('on'); prev.classList.add('sung'); }
            const el = stage.querySelector(`[data-n="${i}-${j}"]`);
            if (el) el.classList.add('on');
          }, t * 1000);
          t += dur;
        });
        t += beat * 0.5;
      });

      S.later(() => {
        playing = false;
        stage.querySelectorAll('.lyric').forEach(p => p.classList.remove('now'));
        stage.querySelector('[data-again]').hidden = false;
        stage.querySelector('[data-done]').hidden = false;
        AF.Art.react(S.charEl, 'cheer');
        AF.Audio.say('Yay! Well done!');
      }, t * 1000 + 300);
    }

    S.later(play, 700);
  };

  /* ============================================================
     BREATHE
     level: { cycles }
     ============================================================ */
  E.breathe = function (S) {
    const lv = S.level;
    const cycles = lv.cycles || 3;
    const IN = 4000, OUT = 4500;

    const stage = E.frame(S, { text: 'Breathe <b>slowly</b> with me', rounds: cycles, cls: 'stage-breathe' });
    stage.innerHTML = `
      <div class="breath"><span class="breath-ring"></span><span class="breath-e">🌸</span></div>
      <div class="breath-say">Get ready…</div>`;
    const ring = stage.querySelector('.breath');
    const label = stage.querySelector('.breath-say');
    const pic = stage.querySelector('.breath-e');
    const dots = () => Array.from(S.host.querySelectorAll('.play-dots i'));

    S.replay = () => E.talk(S, 'Breathe slowly with me.');
    E.talk(S, 'When we feel big feelings, we can breathe slowly.');

    function cycle(n) {
      if (n >= cycles) {
        label.textContent = 'I feel calm.';
        pic.textContent = '😌';
        AF.Audio.say('I feel calm. Well done.');
        AF.Art.react(S.charEl, 'happy');
        S.after(() => S.done(), 1200);
        return;
      }
      dots().forEach((d, i) => { d.className = i < n ? 'done' : (i === n ? 'now' : ''); });
      label.textContent = 'Breathe in… smell the flower';
      pic.textContent = '🌸';
      ring.classList.add('in');
      AF.Audio.say('Breathe in.', { rate: 0.7 });
      S.later(() => {
        label.textContent = 'Breathe out… blow the candle';
        pic.textContent = '🕯️';
        ring.classList.remove('in');
        AF.Audio.say('Breathe out.', { rate: 0.7 });
      }, IN);
      S.later(() => cycle(n + 1), IN + OUT);
    }

    S.after(() => cycle(0), 3600);           // (after the opening line, however long it takes)
  };
})(window.AF = window.AF || {});
