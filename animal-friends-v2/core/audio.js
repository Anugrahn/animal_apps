/* ============================================================
   audio.js — one clear voice, plus sound effects and notes
   ------------------------------------------------------------
   Decisions baked in here:

   * ONE voice, chosen automatically. We score the device's
     English voices and keep the best one. The child's character
     only changes pitch and pace.
   * A voice on the device always wins over a network one, so the app
     keeps talking with no connection and sends nothing anywhere.
     Compact/low-quality voices are penalised.
   * iOS/Android will not play audio until the user has touched
     the screen, so unlock() is called on the very first tap.
   * Sound effects and song melodies are synthesised with WebAudio
     — no asset files, nothing to download, works offline.
   ============================================================ */
(function (AF) {
  'use strict';

  let voice = null;
  let unlocked = false;
  let ctx = null;
  let saying = 0;           // counts utterances, so a cut-off one knows it was
  let talking = 0;          // the utterance still being said (0 = quiet)
  let quietAt = 0;          // when the last "right!" chime has finished (performance.now())

  /* Voices known to be clear and well-articulated for children.
     Higher score wins. Anything not listed still competes on the
     generic rules below. */
  const PREFERRED = [
    { match: /google us english/i,        score: 100 },
    { match: /google uk english female/i, score: 96 },
    { match: /samantha/i,                 score: 94 },   // macOS / iOS
    { match: /^ava/i,                     score: 92 },
    { match: /aria|jenny|michelle/i,      score: 90 },   // Microsoft natural
    { match: /karen|moira|tessa/i,        score: 84 },
    { match: /zira|david/i,               score: 70 },
    { match: /daniel|alex/i,              score: 68 }
  ];

  function scoreVoice(v) {
    const lang = (v.lang || '').toLowerCase();
    if (lang.indexOf('en') !== 0) return -1;            // English only

    let s = 40;
    PREFERRED.forEach(p => { if (p.match.test(v.name)) s = Math.max(s, p.score); });

    if (/en[-_]us/i.test(lang)) s += 10;
    else if (/en[-_]gb/i.test(lang)) s += 8;
    if (/compact|eloquence|novelty|whisper|bells|cellos/i.test(v.name)) s -= 50;
    if (v.default) s += 4;

    return s;
  }

  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const all = window.speechSynthesis.getVoices() || [];
    if (!all.length) return null;

    // A voice on the device always beats one on the network, however well
    // the network one scores: a network voice sends what it reads (the
    // name the child typed, too) to Google or Microsoft. It is used only
    // when the device has no English voice of its own.
    const best = (list) => {
      let top = null, topScore = 0;
      list.forEach(v => { const s = scoreVoice(v); if (s > topScore) { topScore = s; top = v; } });
      return top;
    };
    voice = best(all.filter(v => v.localService)) || best(all);
    return voice;
  }

  if ('speechSynthesis' in window) {
    pickVoice();
    // Chrome loads the list asynchronously; it fires once ready.
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }

  function audioCtx() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) ctx = new C();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /** A short synthesised tone. */
  function tone(freq, dur, type, vol, delay) {
    if (!unlocked) return;                    // browsers block sound before the first tap
    const c = audioCtx();
    if (!c || !AF.Profile.setting('sound')) return;
    const t0 = c.currentTime + (delay || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol == null ? 0.18 : vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /* How long the "right!" chime rings. Speech that starts while a chime
     rings waits for it: a small child can't pick words out from under one. */
  const RIGHT_MS = 460, WRONG_MS = 300, WIN_MS = 760;
  const hush = (ms) => { if (unlocked && AF.Profile.setting('sound')) quietAt = Math.max(quietAt, performance.now() + ms); };

  const SFX = {
    tap:   () => tone(520, 0.09, 'sine', 0.13),
    right: () => {
      tone(660, 0.14, 'sine', 0.2); tone(880, 0.18, 'sine', 0.18, 0.1); tone(1180, 0.26, 'sine', 0.14, 0.2);
      hush(RIGHT_MS);
    },
    /* Deliberately soft and low — never a harsh buzzer. A child
       should hear "not that one", not "you failed". */
    wrong: () => { tone(300, 0.16, 'triangle', 0.12); tone(250, 0.2, 'triangle', 0.1, 0.1); hush(WRONG_MS); },
    pop:   () => tone(760, 0.08, 'triangle', 0.16),
    flip:  () => tone(420, 0.07, 'triangle', 0.12),
    step:  () => tone(360, 0.05, 'sine', 0.07),
    bump:  () => tone(150, 0.1, 'triangle', 0.1),
    drum:  () => { tone(140, 0.18, 'sine', 0.3); tone(90, 0.22, 'triangle', 0.2, 0.01); },
    star:  (i) => tone(700 + (i || 0) * 180, 0.3, 'sine', 0.17, (i || 0) * 0.16),
    win:   () => { [0, 1, 2, 3].forEach(i => tone([523, 659, 784, 1047][i], 0.36, 'sine', 0.17, i * 0.13)); hush(WIN_MS); },
    mic:   () => { tone(660, 0.1, 'sine', 0.14); tone(990, 0.14, 'sine', 0.12, 0.09); }
  };

  /* ---------- ambience ----------
     A few soft bird chirps now and then on the map screens, so the
     outdoor world sounds like one. Synthesised like everything
     else. Off inside a game (it must never compete with the voice
     or the microphone) and off when "Nature sounds" is switched off. */
  let ambOn = false, ambTimer = 0;

  function chirp() {
    const c = audioCtx();
    if (!c) return;
    const notes = 2 + Math.floor(Math.random() * 3);
    const base = 2300 + Math.random() * 1500;
    for (let i = 0; i < notes; i++) {
      const t0 = c.currentTime + i * 0.13;
      const osc = c.createOscillator(), gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(base * (1 + i * 0.06), t0);
      osc.frequency.exponentialRampToValueAtTime(base * (1.28 + i * 0.06), t0 + 0.07);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.028, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + 0.12);
    }
  }

  function ambLoop() {
    ambTimer = setTimeout(() => {
      if (!ambOn) return;
      if (unlocked && document.visibilityState === 'visible' && !talking) chirp();   // never over the friend's voice
      ambLoop();
    }, 5000 + Math.random() * 9000);
  }

  /* ---------- the recorded voice ----------
     voice/index.js (made by tools/voice) lists a warm, natural voice
     recording for nearly every line the app says: AF.VOICE.clips maps a
     line to its file, and AF.VOICE.named does the same for lines with
     the friend's name in them, once per ready-made name. A line with no
     recording (a name the child typed, say) uses the device's voice. */
  let clip = null;                            // the one player, reused
  const norm = (t) => String(t).replace(/\s+/g, ' ').trim();

  function clipFor(text) {
    const V = AF.VOICE;
    if (!V) return null;
    const t = norm(text);
    if (V.clips[t]) return V.clips[t];
    const name = AF.Profile.character && AF.Profile.character.name;
    if (name && t.indexOf(name) >= 0) {
      const byName = V.named[t.split(name).join('{name}')];
      if (byName && byName[name]) return byName[name];
    }
    return null;
  }

  /* The friend's voice (deep, middle, squeaky) is the same recording
     played a little lower and slower, or higher and quicker. Only a
     little: the recordings are paced for three-year-olds, and a squeaky
     friend must not undo that by talking fast. */
  const clipRate = (pitch) => Math.max(0.93, Math.min(1.03, 1 + ((pitch || 1) - 1) * 0.2));

  /* Each play of the one player is a turn. A line whose turn is over (a
     newer line took the player) must not stop the newer one when its own
     loading fails or is cut short: that newer line would then fall back to
     the device's voice. */
  let turn = 0;
  function stopClip() {
    turn++;
    if (clip) { clip.onended = clip.onerror = null; try { clip.pause(); } catch (e) {} }
  }

  /** Plays a recorded line. Returns false if it cannot, so the caller
      can speak it instead. */
  function playClip(file, pitch, end, fallback) {
    if (!unlocked) return false;               // phones block it before the first tap
    if (!clip) clip = new window.Audio();
    stopClip();
    clip.src = 'voice/' + file + '.mp3';
    clip.preservesPitch = clip.mozPreservesPitch = clip.webkitPreservesPitch = false;
    clip.playbackRate = clipRate(pitch);
    const mine = turn;
    const failed = () => { if (mine !== turn) return; stopClip(); fallback(); };
    clip.onended = end;
    clip.onerror = failed;
    const p = clip.play();
    if (p && p.catch) p.catch(failed);
    return true;
  }

  /* Note names for the song player. */
  const NOTES = { C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.0, A: 440.0, B: 493.88, c: 523.25, d: 587.33, e: 659.25 };

  const Audio = {
    SFX,

    /** Must run inside a real user gesture (first tap). */
    unlock() {
      if (unlocked) return;
      unlocked = true;
      audioCtx();
      // iPhones only let a player that has played once inside a tap play
      // again later (from a timer): a moment of silence does that.
      if (AF.VOICE) {
        try { clip = new window.Audio('voice/silence.mp3'); const p = clip.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* no-op */ }
      }
      if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(' ');
          u.volume = 0;
          window.speechSynthesis.speak(u);
        } catch (e) { /* no-op */ }
        if (!voice) pickVoice();
      }
    },

    /** Turn the outdoor ambience on or off for the current screen. */
    ambience(want) {
      const on = !!want && !!AF.Profile.setting('sound') && AF.Profile.setting('nature') !== false;
      if (on === ambOn) return;
      ambOn = on;
      clearTimeout(ambTimer);
      if (on) ambLoop();
    },

    hasVoice() { return !!voice; },
    voiceName() { return voice ? voice.name : 'none'; },

    /** Speaks text in the chosen character's pitch and pace.
        opts: { pitch, rate, onEnd }
        onEnd fires once when the text has been spoken, even on devices
        whose speech engine never reports that it finished. It does not
        fire if newer speech, or stop(), cut this text off: whatever
        was meant to follow it would talk over the newer speech. */
    say(text, opts) {
      opts = opts || {};
      const mine = talking = ++saying;
      let ended = false, timer = 0;
      const end = () => {
        if (ended) return;
        ended = true;
        clearTimeout(timer);
        if (talking === mine) talking = 0;
        if (opts.onEnd && mine === saying) opts.onEnd();
      };
      if (!AF.Profile.setting('sound')) { timer = setTimeout(end, 300); return; }
      const skin = AF.Profile.skin();
      const pitch = opts.pitch != null ? opts.pitch : (skin.pitch || 1);

      // The device's own voice: for a line with no recording.
      const speak = () => {
        if (mine !== saying) return;           // newer speech has taken over
        if (!('speechSynthesis' in window)) { timer = setTimeout(end, 300); return; }
        try {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          if (voice) u.voice = voice;
          u.lang = (voice && voice.lang) || 'en-US';
          u.pitch = pitch;
          u.rate = opts.rate != null ? opts.rate : (skin.rate || 0.85);
          u.volume = 1;
          u.onend = end;
          u.onerror = end;
          window.speechSynthesis.speak(u);
          clearTimeout(timer); timer = setTimeout(end, 1200 + text.length * 110);
        } catch (e) {
          timer = setTimeout(end, 300);
        }
      };

      const start = () => {
        if (mine !== saying) return;           // newer speech has taken over
        const file = clipFor(text);
        if (file && playClip(file, pitch, end, speak)) {
          // (a safety net in case the player never reports the end)
          timer = setTimeout(end, 2500 + text.length * 120);
          return;
        }
        speak();
      };

      stopClip();
      if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
      const wait = quietAt - performance.now();
      if (wait > 20) timer = setTimeout(start, wait);
      else start();
    },

    /** True while the friend is still saying something. */
    busy() { return talking !== 0; },

    /** Speaks a single letter sound, e.g. /s/ — stretched so the
        child hears the phoneme, not the letter name. */
    sound(phoneme, opts) {
      Audio.say(phoneme, Object.assign({ rate: 0.55, pitch: (AF.Profile.skin().pitch || 1) * 0.98 }, opts || {}));
    },

    /** One melody note, e.g. note('G', 0.4). */
    note(name, dur, delay) {
      const f = NOTES[name];
      if (!f) return;
      tone(f, dur * 0.95, 'triangle', 0.2, delay);
      tone(f * 2, dur * 0.6, 'sine', 0.05, delay);
    },

    stop() {
      saying++;
      talking = 0;
      stopClip();
      if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    }
  };

  AF.Audio = Audio;
})(window.AF = window.AF || {});
