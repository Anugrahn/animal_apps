/* ============================================================
   content/party.js — the Birthday Quest (party edition)
   ------------------------------------------------------------
   Naura's birthday party edition. A guest (3–5, Bahasa Indonesia,
   on a parent's phone, who has never seen this app and may not
   read) picks a friend and then walks ONE short road of six stops.
   Finishing it opens the whole app.

   This file is DATA only, like every other content file: the road
   is six references to levels that already exist, by their own
   ids. No new level, no new curriculum, no new stars: the stops
   keep their own ids, so a stop's stars are the level's stars and
   nothing in core/profile.js has to learn a new key.

   Why these six (easiest tier, one module each, as little language
   as possible — a party guest cannot be taught to read first):

     1 maze/m1     4x4, walk home        — tap an arrow, nothing to know
     2 memory/g1   three pairs, with a peek first
     3 bahasa/bi1-1 a i u e o            — Indonesian voice, tracing
     4 math/m1-1   one, two, three       — counting, tracing numbers
     5 coding/c1   three steps           — tap arrows, footprints shown
     6 planet/pm1  animal shadows        — matching, pure pictures

   None of them is a speaking (`speak`) game, so the party never
   stops a guest to ask a grown-up about the microphone, and the
   Bahasa stop is spoken by the device's Indonesian voice (its
   module carries lang: 'id').

   Screens and routing live in core/app.js; saved progress lives
   in core/profile.js. Nothing here touches either.
   ============================================================ */
(function (AF) {
  'use strict';

  AF.PARTY = {

    /* whose party it is (the certificate says so) */
    host: 'Naura',
    age: 4,

    /* The road. `m` is a module id, `l` a level id that module already
       has; `label` is what the stop is called on the quest screen (its
       own short Indonesian name, so a parent can read it out). */
    stops: [
      { m: 'maze',    l: 'm1',    label: 'Antar pulang' },
      { m: 'memory',  l: 'g1',    label: 'Cari pasangan' },
      { m: 'bahasa',  l: 'bi1-1', label: 'Huruf a i u e o' },
      { m: 'math',    l: 'm1-1',  label: 'Satu, dua, tiga' },
      { m: 'coding',  l: 'c1',    label: 'Tiga langkah' },
      { m: 'planet',  l: 'pm1',   label: 'Bayangan hewan' }
    ],

    /* A guest plays once, so a stop is shorter than the same level in
       the ordinary app: at most this many questions in a game (or in
       each step of a lesson) and this many pairs on a memory table.
       AF.Levels.shorten() applies these to a copy of the level, for
       the quest only — the level's own data, and its stars, are
       untouched. */
    caps: { rounds: 2, pairs: 3, cycles: 2 },

    /* art/party/ (painted for this edition) */
    art: {
      cake: 'party/party-cake', star: 'party/party-star', gift: 'party/party-gift',
      thanks: 'party/party-thanks', wand: 'party/party-wand'
    },

    /* Everything a guest sees or hears on the quest, in Bahasa
       Indonesia. Spoken with { lang: 'id' } (the device's Indonesian
       voice), never by the English one. */
    text: {
      title: 'Petualangan Pesta',
      crumb: 'Ulang tahun Naura ke-4',
      lead: 'Enam permainan, lalu ada kue!',
      stopsLeft: (n) => n === 1 ? 'Satu lagi!' : `Tinggal ${n} lagi`,
      allStops: 'Semua selesai!',
      seeCake: 'Lihat kue!',
      cakeTitle: 'Selamat!',
      cakeSub: 'Enam permainan selesai!',
      certTitle: 'Piagam Teman Pesta',
      certFor: 'Terima kasih sudah datang ke pesta ulang tahun',
      certDid: 'menyelesaikan Petualangan Pesta',
      certStars: 'bintang',
      certGo: 'Ayo main yang lain!',
      certAgain: 'Piagam',
      certBy: 'Naura’s Wonderf4ur World'
    },

    /* What the friend says out loud (a guest cannot read). */
    say: {
      start: 'Ayo main enam permainan di pesta ulang tahun Naura!',
      back: 'Bagus! Pilih permainan berikutnya.',
      done: 'Hebat! Semuanya selesai! Ayo lihat kuenya!',
      cake: 'Selamat ulang tahun, Naura! Ayo tiup lilinnya!',
      cert: 'Ini piagammu! Terima kasih sudah bermain!'
    }
  };

})(window.AF = window.AF || {});
