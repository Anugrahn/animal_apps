/* ============================================================
   levels.js — the level system
   ------------------------------------------------------------
   Rules that come straight from the brainstorm:

   * Stars measure MISTAKES, never time. No countdowns anywhere.
         0 mistakes  -> 3 stars
         1-2         -> 2 stars
         3+          -> 1 star
     A lesson (four short games in a row) asks four times as much, so
     it allows a little more: 0-1 -> 3, 2-4 -> 2, 5+ -> 1.
     Finishing always earns at least one star. There is no fail state.

   * A level unlocks when the one before it has any star at all.
     The child is never blocked by a perfect-score requirement.

   * Adaptive help: the more attempts a level takes, the more the
     game helps. After 2 tries it dims wrong answers; after 4 it
     also replays the prompt automatically. Difficulty bends to the
     child instead of the child bending to a fixed age band.

   * Guided stretch: once a level has been finished with 3 stars,
     replaying it quietly adds a little more challenge.
   ============================================================ */
(function (AF) {
  'use strict';

  const Levels = {

    starsFor(mistakes, level) {
      const lesson = level && level.type === 'lesson';
      if (mistakes <= (lesson ? 1 : 0)) return 3;
      if (mistakes <= (lesson ? 4 : 2)) return 2;
      return 1;
    },

    isUnlocked(moduleId, levels, index) {
      if (index <= 0 || AF.Profile.setting('open')) return true;
      // a level already won stays open (levels added before it later,
      // or played while "Open every level" was on, must not lock it)
      if (AF.Profile.stars(moduleId, levels[index].id) > 0) return true;
      // "soon" levels cannot be won, so they are stepped over
      let prev = index - 1;
      while (prev > 0 && levels[prev].soon) prev--;
      return levels[prev].soon || AF.Profile.stars(moduleId, levels[prev].id) > 0;
    },

    /** Index of the level the child should play next. */
    nextIndex(moduleId, levels) {
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].soon) continue;
        if (AF.Profile.stars(moduleId, levels[i].id) === 0 &&
            Levels.isUnlocked(moduleId, levels, i)) return i;
      }
      return 0;
    },

    /** How many stages (Basic, Intermediate, Advanced) a subject has. */
    tierCount(levels) {
      return levels.reduce((n, l) => Math.max(n, (l.tier || 0) + 1), 1);
    },

    /** A stage opens when the last level of the stage before it has a star. */
    tierOpen(moduleId, levels, tier) {
      const first = levels.findIndex(l => (l.tier || 0) === tier);
      return first >= 0 && Levels.isUnlocked(moduleId, levels, first);
    },

    /** The painted icon for the kind of game a level is (a path under art/). */
    kindIcon(lv, mod) {
      const T = { trace: 'trace', pop: 'pop', code: 'code', speak: 'speak', story: 'story', memory: 'memory', maze: 'maze',
        match: 'match', sort: 'sort', song: 'song', build: 'puzzle', order: 'path', breathe: 'treasure', intro: 'story' };
      // a review lesson is the treasure hunt before the chest
      if (lv.type === 'lesson' && lv.review) return 'game/treasure';
      if (T[lv.type]) return 'game/' + T[lv.type];
      // a lesson and a question game wear their subject's own icon (a heart for Feelings, a flask for Discover...)
      const own = AF.Icon.painted(mod.id);
      return own ? own.replace(/^art\/|\.webp$/g, '') : 'game/coin';
    },

    /** What a subject calls its stages ("Step 1", "Level 1", "Tahap 1"...). */
    stageName(mod, t) { return AF.stageNames(mod)[t] || ''; },

    /** 0 = none, 1 = dim wrong answers, 2 = also replay the prompt. */
    helpLevel(moduleId, levelId) {
      // a mastered level is replayed for the "stretch", not for help
      if (Levels.stretch(moduleId, levelId)) return 0;
      const tries = AF.Profile.attempts(moduleId, levelId);
      if (tries >= 4) return 2;
      if (tries >= 2) return 1;
      return 0;
    },

    /** True when the child has already mastered this level. */
    stretch(moduleId, levelId) {
      return AF.Profile.stars(moduleId, levelId) === 3;
    },

    /* ---------- the level map: an island with a winding path ---------- */

    /**
     * Draws a module's levels as numbered stones along a path that
     * snakes up an island, from the bottom-left to a treasure chest.
     * The child's friend stands beside the next level to play.
     * onPick(levelDef, index) fires for unlocked, non-"soon" levels.
     *
     * The path is laid out on a grid of 100-unit steps and the whole
     * island is then scaled to fit the screen, so nothing scrolls.
     */
    renderMap(host, moduleDef, onPick, tier, onChest, from) {
      const all = moduleDef.levels;
      const levels = all.filter(l => (l.tier || 0) === (tier || 0));
      const mid = moduleDef.id;
      const n = levels.length;
      /* The stones sit on the dirt path painted in art/bg-map.jpg. These
         points follow its middle, from the bottom of the picture to the
         top, in percent of the picture; the stones are spread evenly
         along it and the chest waits at the last bend. */
      const PATH = [[52, 90], [36, 84], [29, 76], [42, 70], [62, 63], [78, 57], [66, 51], [45, 47],
        [27, 42], [24, 38], [35, 33], [55, 29], [70, 25]];
      const seg = [], cum = [0];
      for (let i = 1; i < PATH.length; i++) {
        const a = PATH[i - 1], b = PATH[i], l = Math.hypot((b[0] - a[0]) * 2 / 3, b[1] - a[1]);
        seg.push(l); cum.push(cum[i - 1] + l);
      }
      const along = (t) => {                          // a point t (0–1) of the way along
        const L = t * cum[cum.length - 1];
        let k = 1;
        while (k < cum.length - 1 && cum[k] < L) k++;
        const a = PATH[k - 1], b = PATH[k], f = seg[k - 1] ? (L - cum[k - 1]) / seg[k - 1] : 0;
        return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f };
      };
      // The first stone starts a little way up the path, so its name fits
      // above the bottom edge; the chest waits near the top (lower on a
      // short screen, see the end of this function).
      const START = 0.06, END = 0.97;
      const spread = (end) => Array.from({ length: n + 1 }, (_, i) => along(START + (end - START) * (n ? i / n : 0)));
      const pos = spread(END);
      const pct = (p) => `left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%`;

      host.className = 'board board-map';
      host.style.setProperty('--c', moduleDef.colour || '#36D6B5');
      host.innerHTML = '';

      const nextAll = Levels.nextIndex(mid, all);
      const next = Math.max(0, levels.indexOf(all[nextAll]));
      const playable = levels.filter(l => !l.soon);
      const allDone = playable.length > 0 && playable.every(l => AF.Profile.stars(mid, l.id) > 0);

      levels.forEach((lv, i) => {
        const stars = AF.Profile.stars(mid, lv.id);
        const index = all.indexOf(lv);
        const unlocked = !lv.soon && Levels.isUnlocked(mid, all, index);
        const isNext = index === nextAll && unlocked && stars === 0;

        const node = document.createElement('button');
        node.className = 'lv-node';
        node.style.cssText = pct(pos[i]) + ';--i:' + i;
        // done (gold, with its stars) · next (biggest, glowing) · open · locked
        node.classList.add(lv.soon ? 'is-soon' : !unlocked ? 'is-locked' : stars > 0 ? 'is-done' : isNext ? 'is-next' : 'is-open');

        node.innerHTML = `
          <span class="lv-disc"><img class="lv-stone" src="art/ui/stone-${!unlocked || lv.soon ? 'lock' : stars > 0 ? 'gold' : 'blue'}.webp" alt="" draggable="false">${unlocked && !lv.soon ? `<b>${i + 1}</b>` : ''}</span>
          ${unlocked && !lv.soon && (!stars || lv.review) ? `<img class="lv-kind${isNext ? '' : ' small'}" src="art/${Levels.kindIcon(lv, moduleDef)}.webp" alt="" draggable="false">` : ''}
          ${stars > 0 ? AF.UI.stars(stars, 'lv-stars') : ''}
          <span class="lv-name">${lv.title}</span>`;

        node.setAttribute('aria-label',
          `Level ${i + 1}, ${lv.title}. ${lv.soon ? 'Coming soon' : unlocked ? stars + ' of 3 stars' : 'Locked'}`);

        node.addEventListener('click', () => {
          if (lv.soon) { AF.Audio.SFX.wrong(); AF.Audio.say('Coming soon!'); return; }
          if (!unlocked) {
            AF.Audio.SFX.wrong();
            node.classList.add('shake');
            setTimeout(() => node.classList.remove('shake'), 500);
            AF.Audio.say('Finish the one before first.');
            return;
          }
          AF.Audio.SFX.tap();
          onPick(lv, index);
        });

        host.appendChild(node);
      });

      // The treasure at the end opens once every level has a star.
      const chest = document.createElement('button');
      chest.className = 'lv-chest' + (allDone ? ' open' : '');
      chest.setAttribute('aria-label', allDone ? 'Treasure chest' : 'Treasure chest: opens when every level has a star');
      if (!allDone) chest.setAttribute('aria-disabled', 'true');
      chest.style.cssText = pct(pos[n]);
      chest.innerHTML = AF.World.chest(allDone);
      chest.addEventListener('click', () => { if (allDone && onChest) onChest(); });
      host.appendChild(chest);

      // The child's friend waits by the next level (or by the treasure).
      const me = document.createElement('div');
      me.className = 'lv-me';
      const to = allDone ? n : next;
      // Coming back from a level, the friend starts at the stone just
      // played and walks along to the next one.
      const back = levels.findIndex(l => l.id === from);
      const start = back >= 0 && back !== to && AF.FX.motionOK() ? back : to;
      // the friend stands on whichever side of the stone has more room
      const side = (p) => p.x < 50 ? ';--side:1' : ';--side:-1';
      const stand = (i) => { me.style.cssText = pct(pos[i]) + side(pos[i]); };
      stand(start);
      host.appendChild(me);
      if (start !== to) setTimeout(() => stand(to), 650);
      AF.Art.paint(me, Object.assign({}, AF.Art.normalise(AF.Profile.character), { hat: 'explorer' }), allDone ? 'cheer' : 'idle');

      // On a short screen the top of the picture is under the title and the
      // stage tabs: then the stones spread over less of the path, so the
      // chest stays in view below the tabs. (Measured once the map shows.)
      // (The screen may still be growing in, so distances are measured from
      // the map and divided by how far it has grown.)
      const clear = () => {
        const screen = host.closest('.screen'), tabs = screen && screen.querySelector('.tabs:not([hidden])');
        const H = host.offsetHeight, box = host.getBoundingClientRect();
        if (!tabs || !H || !box.height || !host.isConnected) return;
        const t = tabs.getBoundingClientRect(), c = chest.getBoundingClientRect();
        if (t.right < c.left || t.left > c.right) return;       // (a phone on its side: the tabs are beside the map)
        const grown = box.height / H;
        const lid = chest.offsetHeight * 0.34;                  // (.lv-chest is drawn 34% above its point)
        const want = ((t.bottom - box.top) / grown + 6 + lid) / H * 100;
        if (pos[n].y >= want) return;
        let end = END;
        while (end > 0.5 && along(end).y < want) end -= 0.005;
        pos.splice(0, pos.length, ...spread(end));
        host.querySelectorAll('.lv-node').forEach((node, i) => { node.style.left = pos[i].x.toFixed(2) + '%'; node.style.top = pos[i].y.toFixed(2) + '%'; });
        chest.style.left = pos[n].x.toFixed(2) + '%'; chest.style.top = pos[n].y.toFixed(2) + '%';
        stand(start);
      };
      // and again whenever the tabs or the chest change size (lettering and
      // pictures load late: a chest whose painting has not come yet is 0px
      // tall, and its lid would then be left under the tabs)
      const tabsEl = host.closest('.screen') && host.closest('.screen').querySelector('.tabs');
      if (host._watch) host._watch.disconnect();
      if (tabsEl && window.ResizeObserver) {
        host._watch = new ResizeObserver(() => requestAnimationFrame(clear));
        host._watch.observe(tabsEl);
        host._watch.observe(chest);
      }
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(clear));
    },

    /* ---------- the end-of-level sheet ---------- */

    /**
     * Shows the result card. Handlers: { onRetry, onNext, onMap }
     */
    showResult(opts) {
      const sheet = document.getElementById('result');
      const card = sheet.querySelector('.result-card');

      // 1 celebration · 2 stars land · 3 the friend reacts · 4 Next / Play again
      // a trophy for three stars, a medal for two, a thumbs up for one
      let badge = card.querySelector('.result-badge');
      if (!badge) { badge = document.createElement('img'); badge.className = 'result-badge'; badge.alt = ''; card.querySelector('.result-hero').appendChild(badge); }
      badge.src = 'art/ui/' + (opts.stars >= 3 ? 'trophy' : opts.stars === 2 ? 'medal' : 'thumbs') + '.webp';
      const title = card.querySelector('.result-title');
      title.textContent = title.dataset.t = opts.title || 'Well done!';
      const who = card.querySelector('.result-char');
      AF.Art.paint(who, null, 'idle');
      const btns = card.querySelector('.result-btns');
      btns.classList.remove('ready');
      const tip = card.querySelector('.result-tip');
      // (folded into a small chip: it is for the grown-up; the child's eyes go to Next)
      tip.hidden = !opts.tip;
      tip.open = false;
      tip.querySelector('p').innerHTML = opts.tip || '';

      const starEls = card.querySelectorAll('.result-stars i');
      starEls.forEach(el => el.classList.remove('on'));

      const nextBtn = card.querySelector('[data-act="next"]');
      nextBtn.hidden = !opts.hasNext;
      // back to Today's Study, when the game came from there
      const mapBtn = card.querySelector('[data-act="map"]');
      mapBtn.dataset.ic = opts.from === 'journey' ? 'journey' : 'map';
      mapBtn.setAttribute('aria-label', opts.from === 'journey' ? 'Back to today’s study' : 'Back to the map');
      // a lesson's road, every step ticked
      let road = card.querySelector('.result-road');
      if (!road) { road = document.createElement('ol'); road.className = 'steps result-road'; card.querySelector('.result-title').after(road); }
      road.hidden = !opts.steps;
      road.innerHTML = opts.steps ? AF.UI.steps(opts.steps, opts.steps.length) : '';

      sheet.hidden = false;
      AF.FX.confetti(opts.stars === 3 ? 60 : 30);

      // Stars land one at a time, each with its own chime.
      const turn = (Levels._turn = (Levels._turn || 0) + 1);
      for (let n = 0; n < opts.stars; n++) {
        setTimeout(() => {
          if (turn !== Levels._turn || sheet.hidden) return;
          starEls[n].classList.add('on');
          AF.Audio.SFX.star(n);
          AF.FX.sparkleAt(starEls[n], 8);
        }, 320 + n * 420);
      }

      setTimeout(() => {
        if (turn !== Levels._turn || sheet.hidden) return;
        AF.Art.react(who, 'cheer');
        AF.Audio.say(opts.spoken || AF.Profile.skin().cheer);
      }, 320 + opts.stars * 420);
      setTimeout(() => { if (turn === Levels._turn) btns.classList.add('ready'); }, 520 + opts.stars * 420);

      const close = () => { sheet.hidden = true; };
      card.querySelectorAll('[data-act]').forEach(btn => {
        btn.onclick = () => {
          AF.Audio.SFX.tap();
          close();
          const act = btn.getAttribute('data-act');
          if (act === 'retry' && opts.onRetry) opts.onRetry();
          if (act === 'next' && opts.onNext) opts.onNext();
          if (act === 'map' && opts.onMap) opts.onMap();
        };
      });
    }
  };

  AF.Levels = Levels;
})(window.AF = window.AF || {});
