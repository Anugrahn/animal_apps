/* ============================================================
   audio.js — one clear voice, plus sound effects
   ------------------------------------------------------------
   Decisions baked in here:

   * ONE voice, chosen automatically. No male/female picker.
     We score the device's English voices and keep the best one.
   * Local voices win over network ones, so the app keeps talking
     with no connection. Compact/low-quality voices are penalised.
   * iOS will not play any audio until the user has touched the
     screen, so unlock() is called on the very first tap.
   * Sound effects are synthesised with WebAudio — no asset files,
     nothing to download, works offline from file://.
   ============================================================ */
(function (AF) {
  'use strict';

  let voice = null;
  let unlocked = false;
  let ctx = null;

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

    if (v.localService) s += 25;                        // works offline
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

    let best = null, bestScore = -1;
    all.forEach(v => {
      const s = scoreVoice(v);
      if (s > bestScore) { bestScore = s; best = v; }
    });
    voice = bestScore > 0 ? best : null;
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

  const SFX = {
    tap:   () => tone(520, 0.09, 'sine', 0.13),
    right: () => { tone(660, 0.14, 'sine', 0.2); tone(880, 0.18, 'sine', 0.18, 0.1); tone(1180, 0.26, 'sine', 0.14, 0.2); },
    /* Deliberately soft and low — never a harsh buzzer. A child
       should hear "not that one", not "you failed". */
    wrong: () => { tone(300, 0.16, 'triangle', 0.12); tone(250, 0.2, 'triangle', 0.1, 0.1); },
    pop:   () => tone(760, 0.08, 'triangle', 0.16),
    star:  (i) => tone(700 + (i || 0) * 180, 0.3, 'sine', 0.17, (i || 0) * 0.16),
    win:   () => [0, 1, 2, 3].forEach(i => tone([523, 659, 784, 1047][i], 0.36, 'sine', 0.17, i * 0.13)),
    unlock:() => { tone(440, 0.12, 'sine', 0.15); tone(660, 0.22, 'sine', 0.15, 0.1); }
  };

  const Audio = {
    SFX,

    /** Must run inside a real user gesture (first tap). */
    unlock() {
      if (unlocked) return;
      unlocked = true;
      audioCtx();
      if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(' ');
          u.volume = 0;
          window.speechSynthesis.speak(u);
        } catch (e) { /* no-op */ }
        if (!voice) pickVoice();
      }
    },

    hasVoice() { return !!voice; },
    voiceName() { return voice ? voice.name : 'none'; },

    /** Speaks text in the chosen character's pitch and pace.
        opts: { pitch, rate, onEnd } */
    say(text, opts) {
      opts = opts || {};
      if (!AF.Profile.setting('sound') || !('speechSynthesis' in window)) {
        if (opts.onEnd) setTimeout(opts.onEnd, 300);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const skin = AF.Profile.skin();
        if (voice) u.voice = voice;
        u.lang = (voice && voice.lang) || 'en-US';
        u.pitch = opts.pitch != null ? opts.pitch : (skin.pitch || 1);
        u.rate = opts.rate != null ? opts.rate : (skin.rate || 0.85);
        u.volume = 1;
        if (opts.onEnd) u.onend = opts.onEnd;
        window.speechSynthesis.speak(u);
      } catch (e) {
        if (opts.onEnd) setTimeout(opts.onEnd, 300);
      }
    },

    /** Speaks a single letter sound, e.g. /s/ — stretched so the
        child hears the phoneme, not the letter name. */
    sound(phoneme) {
      Audio.say(phoneme, { rate: 0.55, pitch: (AF.Profile.skin().pitch || 1) * 0.98 });
    },

    stop() {
      if ('speechSynthesis' in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    }
  };

  AF.Audio = Audio;
})(window.AF = window.AF || {});
