/* ============================================================
   engines/voice.js — "Say it!" pronunciation practice
   ------------------------------------------------------------
   level: { words: [{ w, e }], rounds }

   One word at a time: the friend says it, the child says it back.
   How the child's voice is handled depends on what the grown-up
   chose (see core/speech.js):

     check  the browser tells us what it heard
     echo   record, then play the child's own voice back
     tap    no microphone: listen, say it, tap the thumbs-up

   A machine mishearing a four-year-old is the machine's problem.
   So after two tries the word is accepted with a "good try", the
   level always finishes, and if the microphone or the connection
   lets us down the level quietly drops to the next mode.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;

  const BADGE = {
    check: 'Voice check',
    echo: 'Echo — hear yourself',
    tap: 'Listen and say'
  };

  E.speak = function (S) {
    const lv = S.level;
    const words = (lv.ordered ? lv.words : U.shuffle(lv.words)).slice(0, lv.rounds + (S.api.stretch ? 1 : 0));
    let mode = AF.Speech.mode();
    let word, tries, busy, locked, stage;

    const model = (slow) => AF.Audio.say(word.w, { rate: slow ? 0.6 : 0.8 });

    function next() {
      word = words[S.round];
      tries = 0; busy = false; locked = false;

      stage = E.frame(S, { text: `Say <b>${U.esc(word.w)}</b>`, rounds: words.length, cls: 'stage-speak' });
      stage.innerHTML = `
        <div class="say-card">
          <span class="say-pic">${word.e}</span>
          <span class="say-word">${U.esc(word.w)}</span>
        </div>
        <div class="say-status" aria-live="polite"></div>
        <div class="say-btns">
          <button class="round-btn say-hear" data-hear data-ic="sound" aria-label="Hear it"></button>
          <button class="mic" data-mic data-ic="mic" aria-label="Say it now"></button>
          <button class="round-btn say-ok" data-ok data-ic="check" aria-label="I said it"></button>
        </div>
        <div class="say-wave" aria-hidden="true">${'<i></i>'.repeat(13)}</div>
        <div class="say-mode"></div>`;

      S.replay = () => { E.talk(S, `Say, ${word.w}.`); };
      stage.querySelector('[data-hear]').onclick = () => { if (!busy) { AF.Art.react(S.charEl, 'talk'); model(true); } };
      stage.querySelector('[data-mic]').onclick = mic;
      stage.querySelector('[data-ok]').onclick = () => { if (!busy && !locked) win('Well done!'); };
      controls();
      S.later(() => { S.replay(); S.mark(); }, 320);
    }

    /* Which buttons show depends on the mode in use right now. */
    function controls(heardOnce) {
      stage.querySelector('[data-mic]').hidden = mode === 'tap';
      // The thumbs-up is how echo and tap modes move on; in check
      // mode the recogniser decides, so it stays hidden.
      stage.querySelector('[data-ok]').hidden = mode === 'check' || (mode === 'echo' && !heardOnce);
      stage.querySelector('.say-mode').textContent = BADGE[mode];
    }

    function status(html, cls) {
      const el = stage.querySelector('.say-status');
      el.className = 'say-status ' + (cls || '');
      el.innerHTML = html;
    }

    function listening(on) {
      busy = on;
      stage.querySelector('[data-mic]').classList.toggle('live', on);
    }

    /* The mic or the network failed: step down a mode and carry on. */
    function stepDown(why) {
      mode = (mode === 'check' && AF.Speech.canEcho && why !== 'denied') ? 'echo' : 'tap';
      controls(false);
      status(why === 'denied' ? 'No microphone — just say it out loud, then tap the green tick'
        : mode === 'echo' ? 'Let’s use echo. Tap the microphone and say it!' : 'Say it out loud, then tap the green tick');
    }

    function mic() {
      if (busy || locked) return;
      const r = S.round;
      const mine = () => S.alive && S.round === r && !locked;
      AF.Audio.stop();
      AF.Audio.SFX.mic();

      if (mode === 'check') {
        listening(true);
        status('Listening… say <b>' + U.esc(word.w) + '</b>', 'live');
        AF.Speech.listen(word.w, (res) => {
          if (!mine()) return;
          listening(false);
          if (res.ok) { win('Great!'); return; }
          if (res.error === 'cancelled') { status(''); return; }
          if (res.error && res.error !== 'silent') { stepDown(res.error); return; }
          tries++;
          // two goes is always enough, and a mishearing is the machine's
          // problem, not the child's: no mistake is counted
          if (tries >= 2) { win('Good try!'); return; }
          AF.Art.react(S.charEl, 'hmm');
          status(res.heard ? `I heard “${U.esc(res.heard)}”. Let’s try again!` : 'I could not hear you. Try again!');
          S.later(() => { if (mine()) model(true); }, 500);
        });
        return;
      }

      // echo
      listening(true);
      status('Say it now!', 'live');
      AF.Speech.echo(2600, (res) => {
        if (!mine()) return;
        listening(false);
        if (res.error === 'cancelled') { status(''); return; }
        if (!res.ok) { stepDown(res.error); return; }
        status('Now listen to me…');
        model(true);
        controls(true);
        S.later(() => { if (mine()) status('Sound the same? Tap the tick — or the microphone to try again'); }, 1500);
      }, () => { if (mine()) status('That’s you!'); });
    }

    function win(cheer) {
      locked = true;
      S.lap();
      const card = stage.querySelector('.say-card');
      card.classList.add('yes');
      AF.Audio.SFX.right();
      AF.Art.react(S.charEl, 'happy');
      AF.FX.sparkleAt(card, 16);
      status(cheer, 'good');
      S.later(() => AF.Audio.say(cheer), 350);
      S.after(() => {
        S.round++;
        if (S.round >= words.length) S.done(); else next();
      }, 1900);
    }

    next();
  };
})(window.AF = window.AF || {});
