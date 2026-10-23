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
       seenTutorial, extra: { date, min },
       today:    { date, picks, done, cheered },   lastPlan: the day before's
       curriculum: 2,  legacyStars: n,  legacy: { moduleId: { stars, attempts, log } }
     }

   Curriculum 2 (v4, October 2026) follows Danbi Education's Wink.
   The subjects it replaced (Letters, My Words, Say It!, Numbers,
   Shapes) are kept aside in `legacy`, and their stars still count
   in the child's total, so nobody's star count ever goes down.
   ============================================================ */
(function (AF) {
  'use strict';

  const KEY = 'af.profile.v2';
  const KEY_V1 = 'af.profile.v1';
  const RETIRED = ['letters', 'words', 'sayit', 'numbers', 'shapes'];

  function blank() {
    return {
      v: 2,
      curriculum: 2, legacyStars: 0, legacy: {},
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

  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);

  function load() {
    state = blank();
    const saved = read(KEY);
    if (isObj(saved)) {
      // Saved progress is used only in the shape this file writes it.
      Object.assign(state, saved);
      state.curriculum = saved.curriculum || 1;          // (saved before v4: the first curriculum)
      state.settings = Object.assign(blank().settings, isObj(saved.settings) ? saved.settings : {});
      state.character = saved.character ? AF.Art.normalise(saved.character) : null;
    } else {
      // Carry a v1 child's friend and stars across.
      const old = read(KEY_V1);
      if (old && old.character) {
        state.character = AF.Art.normalise(old.character);
        state.stars = old.stars || {};
        state.attempts = old.attempts || {};
        state.createdAt = old.createdAt || null;
        state.curriculum = 1;
      }
    }
    ['stars', 'attempts', 'log', 'days', 'legacy'].forEach(k => { if (!isObj(state[k])) state[k] = {}; });
    if ((state.curriculum || 1) < 2) retire();
    return state;
  }

  /* From the first curriculum to the Wink one: the subjects that were
     replaced move aside, their stars kept in the total. */
  function retire() {
    let kept = 0;
    RETIRED.forEach(m => {
      const s = state.stars[m];
      if (!s && !state.attempts[m] && !state.log[m]) return;
      state.legacy[m] = { stars: s || {}, attempts: state.attempts[m] || {}, log: state.log[m] || {} };
      Object.keys(s || {}).forEach(k => { kept += s[k] || 0; });
      delete state.stars[m]; delete state.attempts[m]; delete state.log[m];
    });
    state.legacyStars = (state.legacyStars || 0) + kept;
    if (RETIRED.indexOf(state.lastModule) >= 0) state.lastModule = null;
    state.today = null;                     // today's picks were made from the old subjects
    state.curriculum = 2;
    save();
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

    /** Every star the child has, the retired subjects' too. */
    allStars() {
      const p = Profile.get(), all = p.stars;
      return Object.keys(all).reduce((sum, mid) => sum + Profile.totalStars(mid), 0) + (p.legacyStars || 0);
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

    /** { date, picks: [{ m, l, kind }], done: ['module:level'], cheered } — a new one each
        morning; the day before's is kept as `lastPlan`, so what was not done can carry over. */
    today() {
      const p = Profile.get(), k = dayKey();
      if (!p.today || p.today.date !== k) {
        if (p.today && p.today.picks) p.lastPlan = p.today;
        p.today = { date: k, picks: null, done: [], cheered: false };
      }
      return p.today;
    },

    /** Minutes played on each of the last `n` days, oldest first: [{ key, day, min }]. */
    week(n) {
      const days = Profile.get().days, out = [];
      for (let i = (n || 7) - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const k = dayKey(d);
        out.push({ key: k, day: d.getDay(), min: Math.round((days[k] || 0) / 60000) });
      }
      return out;
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
