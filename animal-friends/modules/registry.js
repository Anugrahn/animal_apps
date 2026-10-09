/* ============================================================
   registry.js — the list of modules
   ------------------------------------------------------------
   The home screen is built from this array. Adding a fourth or
   fifth activity means pushing one entry here; no screen code
   needs to change. That is the whole point of Phase 0.

   A module must provide:
     id, title, icon, colour, blurb
     levels: [{ id, title, icon, soon?, ...own config }]
     play(host, level, api)   — runs ONE level
     stop()                   — tear down (timers, listeners)

   api = {
     finish(mistakes)   report the result, app.js awards stars
     exit()             bail out to the level map
     help               0 | 1 | 2  (see levels.js)
     say(text)          speak in the character's voice
     character          'dino' | 'bear' | 'rabbit'
   }
   ============================================================ */
(function (AF) {
  'use strict';

  AF.registry = AF.registry || [];

  /** Modules call this to join the home screen. */
  AF.register = function (mod) {
    AF.registry.push(mod);
    return mod;
  };

  /** Placeholder tiles for work that is planned but not ported yet.
      They are honest about being unfinished rather than hidden, so
      the shape of the finished app is visible from day one. */
  AF.placeholder = function (id, title, icon, colour, blurb, note) {
    return AF.register({
      id: id, title: title, icon: icon, colour: colour,
      blurb: blurb, note: note, soon: true, levels: [],
      play: function () {}, stop: function () {}
    });
  };

  AF.module = function (id) {
    return AF.registry.filter(m => m.id === id)[0];
  };
})(window.AF = window.AF || {});
