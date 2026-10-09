/* ============================================================
   profile.js — who is playing, and how far they have got
   ------------------------------------------------------------
   Single profile (multiplayer still deferred). Everything lives
   in localStorage so the app works offline and nothing about the
   child ever leaves the device.

   Shape:
     {
       v: 2,
       character: { name, species, colour, hat, wear, item, voice },
       stars:    { moduleId: { levelId: 0..3 } },
       attempts: { moduleId: { levelId: n } },        // drives adaptive help
       log:      { moduleId: { levelId: { n, mistakes, ms } } },   // for the parent report
       days:     { 'YYYY-MM-DD': msPlayed },
       settings: { sound, motion, speech, limit },
       seenTutorial, extra: { date, min }
     }
   ============================================================ */
(function (AF) {
  'use strict';

  const KEY = 'af.profile.v2';
  const KEY_V1 = 'af.profile.v1';

  function blank() {
    return {
      v: 2,
      character: null,
      stars: {}, attempts: {}, log: {}, days: {},
      /* speech: 'ask' until a grown-up chooses 'check' (uses the
         browser's speech service) or 'echo' (stays on the device). */
      settings: { sound: true, nature: true, motion: true, open: false, speech: 'ask', limit: 0 },
      seenTutorial: false,
      extra: null,
      createdAt: null, lastPlayed: null
    };
  }

  let state = null;

  function read(key) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }              // private mode, blocked storage, bad JSON
  }

  function load() {
    state = blank();
    const saved = read(KEY);
    if (saved) {
      Object.assign(state, saved);
      state.settings = Object.assign(blank().settings, saved.settings || {});
    } else {
      // Carry a v1 child's friend and stars across.
      const old = read(KEY_V1);
      if (old && old.character) {
        state.character = AF.Art.normalise(old.character);
        state.stars = old.stars || {};
        state.attempts = old.attempts || {};
        state.createdAt = old.createdAt || null;
      }
    }
    ['stars', 'attempts', 'log', 'days'].forEach(k => { if (!state[k]) state[k] = {}; });
    return state;
  }

  function save() {
    state.lastPlayed = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* play anyway */ }
  }

  // Another copy of the app open at once (a browser tab and the installed
  // app) saved: take its copy, so the next save here does not erase it.
  window.addEventListener('storage', (e) => { if (e.key === KEY && e.newValue && state) load(); });

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  const Profile = {
    get() { return state || load(); },
    dayKey: dayKey,

    /* ---------- character ---------- */

    get character() { return Profile.get().character; },

    chooseCharacter(spec) {
      const p = Profile.get();
      p.character = AF.Art.normalise(spec);
      if (!p.createdAt) p.createdAt = Date.now();
      save();
    },

    skin() { return AF.Art.skin(Profile.character); },

    /* ---------- stars ---------- */

    /** Stars earned on one level (0 = not played). */
    stars(moduleId, levelId) {
      const m = Profile.get().stars[moduleId];
      return (m && m[levelId]) || 0;
    },

    /** Records a result. Stars never go down — a bad replay
        cannot take away what the child already earned. */
    setStars(moduleId, levelId, n) {
      const p = Profile.get();
      p.stars[moduleId] = p.stars[moduleId] || {};
      const prev = p.stars[moduleId][levelId] || 0;
      const best = Math.max(prev, n);
      p.stars[moduleId][levelId] = best;
      save();
      return { best: best, improved: best > prev, first: prev === 0 };
    },

    totalStars(moduleId) {
      const m = Profile.get().stars[moduleId] || {};
      return Object.keys(m).reduce((sum, k) => sum + (m[k] || 0), 0);
    },

    allStars() {
      const all = Profile.get().stars;
      return Object.keys(all).reduce((sum, mid) => sum + Profile.totalStars(mid), 0);
    },

    clearedCount(moduleId) {
      const m = Profile.get().stars[moduleId] || {};
      return Object.keys(m).filter(k => m[k] > 0).length;
    },

    /* ---------- attempts + results (adaptive help, parent report) ---------- */

    noteAttempt(moduleId, levelId) {
      const p = Profile.get();
      p.attempts[moduleId] = p.attempts[moduleId] || {};
      p.attempts[moduleId][levelId] = (p.attempts[moduleId][levelId] || 0) + 1;
      save();
      return p.attempts[moduleId][levelId];
    },

    attempts(moduleId, levelId) {
      const m = Profile.get().attempts[moduleId];
      return (m && m[levelId]) || 0;
    },

    /** One finished level: mistakes made and average thinking time. */
    noteResult(moduleId, levelId, mistakes, avgMs) {
      const p = Profile.get();
      p.log[moduleId] = p.log[moduleId] || {};
      const r = p.log[moduleId][levelId] || { n: 0, mistakes: 0, ms: 0 };
      r.n++; r.mistakes += mistakes || 0;
      if (avgMs) r.ms = r.ms ? Math.round(r.ms * 0.6 + avgMs * 0.4) : Math.round(avgMs);
      p.log[moduleId][levelId] = r;
      save();
    },

    result(moduleId, levelId) {
      const m = Profile.get().log[moduleId];
      return (m && m[levelId]) || null;
    },

    /* ---------- time played ---------- */

    addPlay(ms) {
      const p = Profile.get(), k = dayKey();
      p.days[k] = (p.days[k] || 0) + ms;
      save();
    },

    minutesToday() { return Math.floor((Profile.get().days[dayKey()] || 0) / 60000); },

    daysPlayed() { return Object.keys(Profile.get().days).length; },

    /** Days in a row with any play, counting back from today
        (or from yesterday, so a streak is not "lost" at breakfast). */
    streak() {
      const days = Profile.get().days;
      const d = new Date();
      if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
      let n = 0;
      while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
      return n;
    },

    /** True once today's play has reached the grown-up's limit. */
    overLimit() {
      const p = Profile.get(), limit = p.settings.limit;
      if (!limit) return false;
      const bonus = p.extra && p.extra.date === dayKey() ? p.extra.min : 0;
      return Profile.minutesToday() >= limit + bonus;
    },

    /** `min` more minutes from now, even if the limit was lowered
        below what has already been played today. */
    extend(min) {
      const p = Profile.get(), k = dayKey();
      const had = p.extra && p.extra.date === k ? p.extra.min : 0;
      const over = Math.max(0, Profile.minutesToday() - (p.settings.limit || 0));
      p.extra = { date: k, min: Math.max(had, over) + min };
      save();
    },

    /* ---------- settings ---------- */

    setting(key) { return Profile.get().settings[key]; },

    setSetting(key, value) {
      Profile.get().settings[key] = value;
      save();
    },

    /* ---------- today's adventure ---------- */

    /** { date, picks: [{ m, l }], done: ['module:level'], cheered } — reset each morning. */
    today() {
      const p = Profile.get(), k = dayKey();
      if (!p.today || p.today.date !== k) p.today = { date: k, picks: null, done: [], cheered: false };
      return p.today;
    },

    save: save,

    get seenTutorial() { return Profile.get().seenTutorial; },
    markTutorial() { Profile.get().seenTutorial = true; save(); },

    /* ---------- grown-up tools ---------- */

    reset() {
      state = blank();
      save();
    }
  };

  load();
  AF.Profile = Profile;
})(window.AF = window.AF || {});
