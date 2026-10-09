/* ============================================================
   profile.js — who is playing, and how far they have got
   ------------------------------------------------------------
   Single profile for now (multiplayer deliberately deferred).
   Everything lives in localStorage so the app works offline.

   Shape:
     {
       v: 1,
       character: 'dino' | 'bear' | 'rabbit',
       stars:    { moduleId: { levelId: 0..3 } },
       attempts: { moduleId: { levelId: n } },   // for adaptive help
       settings: { sound, music, motion },
       createdAt, lastPlayed
     }
   ============================================================ */
(function (AF) {
  'use strict';

  const KEY = 'af.profile.v1';

  const BLANK = {
    v: 1,
    character: null,
    stars: {},
    attempts: {},
    settings: { sound: true, music: false, motion: true },
    createdAt: null,
    lastPlayed: null
  };

  let state = null;
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign({}, BLANK, JSON.parse(raw)) : Object.assign({}, BLANK);
    } catch (e) {
      // Private mode, blocked storage, corrupted JSON — play anyway.
      state = Object.assign({}, BLANK);
    }
    if (!state.stars) state.stars = {};
    if (!state.attempts) state.attempts = {};
    if (!state.settings) state.settings = Object.assign({}, BLANK.settings);
    return state;
  }

  function save() {
    state.lastPlayed = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* no-op */ }
    listeners.forEach(fn => { try { fn(state); } catch (e) {} });
  }

  const Profile = {
    get() { return state || load(); },

    onChange(fn) { listeners.push(fn); },

    /* ---------- character ---------- */

    get character() { return Profile.get().character; },

    chooseCharacter(id) {
      const p = Profile.get();
      p.character = id;
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

    /* ---------- attempts (drives adaptive help) ---------- */

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

    /* ---------- settings ---------- */

    setting(key) { return Profile.get().settings[key]; },

    setSetting(key, value) {
      Profile.get().settings[key] = value;
      save();
    },

    /* ---------- grown-up tools ---------- */

    reset() {
      state = Object.assign({}, BLANK, { stars: {}, attempts: {}, settings: Object.assign({}, BLANK.settings) });
      save();
    }
  };

  load();
  AF.Profile = Profile;
})(window.AF = window.AF || {});
