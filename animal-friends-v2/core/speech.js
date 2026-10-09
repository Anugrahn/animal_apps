/* ============================================================
   speech.js — listening to the child
   ------------------------------------------------------------
   Two ways to practise saying a word, chosen by a grown-up:

   * CHECK — the browser's speech recogniser (Chrome, Edge, Safari)
     tells us what it heard. In Chrome the audio is sent to
     Google's servers to be recognised, so this is never switched
     on without a grown-up saying yes. It also needs a connection.

   * ECHO — the microphone records a couple of seconds and plays
     it straight back, so the child hears themselves next to the
     model voice. Nothing leaves the device and nothing is kept.

   General-purpose recognisers are much less accurate on small
   children's voices than on adults', so matching is forgiving and
   the game never fails a child because a machine misheard them.
   ============================================================ */
(function (AF) {
  'use strict';

  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* Things a recogniser commonly returns for a correct answer. */
  const SOUNDS_LIKE = {
    one: ['1', 'won'], two: ['2', 'to', 'too'], three: ['3', 'tree', 'free'], four: ['4', 'for', 'fore'],
    five: ['5'], six: ['6', 'sick', 'sex'], seven: ['7'], eight: ['8', 'ate'], nine: ['9'], ten: ['10', 'tan'],
    red: ['read', 'bread'], blue: ['blew', 'boo'], bee: ['be', 'b'], sun: ['son'], bear: ['bare', 'beer'],
    pear: ['pair', 'bear'], eye: ['i', 'aye'], nose: ['knows', 'no'], sea: ['see', 'c'], hi: ['high', 'hey'],
    bye: ['by', 'buy', 'bye-bye'], hello: ['hallo', 'hullo', 'yellow'], cat: ['cut', 'kat', 'hat'],
    dog: ['doug', 'dock'], pig: ['big', 'pick'], hen: ['hand', 'han'], cow: ['how', 'cal'], duck: ['dark', 'dock'],
    green: ['grin', 'queen'], pink: ['think', 'ping'], bus: ['boss', 'but'], car: ['cur', 'call'],
    egg: ['ag', 'ack'], milk: ['mill', 'meek'], hand: ['and', 'han'], ear: ['year', 'here'], please: ['peas', 'pleas']
  };

  function clean(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function distance(a, b) {
    const d = [];
    for (let i = 0; i <= a.length; i++) d[i] = [i];
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  /** Was `target` (a word or short phrase) said in any of `heard`? */
  function matches(target, heard) {
    const want = clean(target);
    const wantWords = want.split(' ');
    return heard.some(h => {
      h = clean(h);
      if (!h) return false;
      if (h === want || (' ' + h + ' ').indexOf(' ' + want + ' ') >= 0) return true;
      const got = h.split(' ');
      // every wanted word must be heard, each allowed to be a near miss
      return wantWords.every(w => got.some(g => {
        if (g === w) return true;
        if ((SOUNDS_LIKE[w] || []).indexOf(g) >= 0) return true;
        if (g + 's' === w || w + 's' === g) return true;
        return w.length >= 4 && distance(g, w) <= (w.length >= 7 ? 2 : 1);
      }));
    });
  }

  let active = null;        // the recogniser or recorder in use
  let stream = null;

  const Speech = {
    matches: matches,

    get canCheck() { return !!Rec && navigator.onLine !== false; },
    get canEcho() { return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); },

    /** The mode a level should use right now: 'check' | 'echo' | 'tap'. */
    mode() {
      const want = AF.Profile.setting('speech');
      if (want === 'check' && Speech.canCheck) return 'check';
      if (want !== 'tap' && Speech.canEcho) return 'echo';
      return 'tap';
    },

    /**
     * Listens for one word. cb({ ok, heard, error })
     *   ok    true if the target was heard
     *   heard best guess at what was said ('' if nothing)
     *   error 'denied' | 'offline' | 'silent' | 'failed' when it could not listen
     */
    listen(target, cb) {
      Speech.cancel();
      if (!Rec) { cb({ ok: false, heard: '', error: 'failed' }); return; }
      let done = false, heard = [];
      const finish = (r) => { if (done) return; done = true; clearTimeout(timer); active = null; cb(r); };
      let r;
      try {
        r = new Rec();
        r.lang = 'en-US';
        r.interimResults = false;
        r.maxAlternatives = 6;
        r.continuous = false;
      } catch (e) { finish({ ok: false, heard: '', error: 'failed' }); return; }

      r.onresult = (e) => {
        for (let i = 0; i < e.results.length; i++)
          for (let j = 0; j < e.results[i].length; j++) heard.push(e.results[i][j].transcript);
      };
      r.onerror = (e) => {
        const map = { 'not-allowed': 'denied', 'service-not-allowed': 'denied', network: 'offline', 'no-speech': 'silent' };
        finish({ ok: false, heard: '', error: map[e.error] || 'failed' });
      };
      r.onend = () => {
        if (!heard.length) finish({ ok: false, heard: '', error: 'silent' });
        else finish({ ok: matches(target, heard), heard: clean(heard[0]) });
      };
      const timer = setTimeout(() => { try { r.stop(); } catch (e) {} }, 6000);
      active = { stop() { try { r.abort(); } catch (e) {} } };
      try { r.start(); } catch (e) { finish({ ok: false, heard: '', error: 'failed' }); }
    },

    /**
     * Records `ms` of sound and plays it straight back.
     * cb({ ok, error }) fires when playback has finished.
     */
    echo(ms, cb, onRecorded) {
      Speech.cancel();
      if (!Speech.canEcho) { cb({ ok: false, error: 'failed' }); return; }
      let done = false;
      const finish = (r) => { if (done) return; done = true; active = null; cb(r); };

      navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {
        if (done) { s.getTracks().forEach(t => t.stop()); return; }
        stream = s;
        const chunks = [];
        let rec;
        try { rec = new MediaRecorder(s); } catch (e) { Speech.release(); finish({ ok: false, error: 'failed' }); return; }
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          Speech.release();
          if (done) return;
          if (onRecorded) onRecorded();
          const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
          const a = new window.Audio(url);
          const over = () => { URL.revokeObjectURL(url); finish({ ok: true }); };
          a.onended = over; a.onerror = over;
          active = { stop() { try { a.pause(); } catch (e) {} URL.revokeObjectURL(url); } };
          const p = a.play();
          if (p && p.catch) p.catch(over);
          setTimeout(over, ms + 2500);
        };
        const t = setTimeout(() => { try { rec.stop(); } catch (e) {} }, ms);
        active = { stop() { clearTimeout(t); try { rec.stop(); } catch (e) {} } };
        rec.start();
      }).catch(e => {
        finish({ ok: false, error: e && /NotAllowed|Permission|Security/i.test(e.name) ? 'denied' : 'failed' });
      });
    },

    release() {
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    },

    cancel() {
      if (active) { const a = active; active = null; a.stop(); }
      Speech.release();
    }
  };

  AF.Speech = Speech;
})(window.AF = window.AF || {});
