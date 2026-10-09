/* ============================================================
   levels.js — the level system
   ------------------------------------------------------------
   Rules that come straight from the brainstorm:

   * Stars measure MISTAKES, never time. No countdowns anywhere.
         0 mistakes  -> 3 stars
         1-2         -> 2 stars
         3+          -> 1 star
     Finishing always earns at least one star. There is no fail state.

   * A level unlocks when the one before it has any star at all.
     The child is never blocked by a perfect-score requirement.

   * Adaptive help: the more attempts a level takes, the more the
     game helps. After 2 tries it dims wrong answers; after 4 it
     also replays the prompt automatically. Difficulty bends to the
     child instead of the child bending to a fixed age band.
   ============================================================ */
(function (AF) {
  'use strict';

  const Levels = {

    starsFor(mistakes) {
      if (mistakes <= 0) return 3;
      if (mistakes <= 2) return 2;
      return 1;
    },

    isUnlocked(moduleId, levels, index) {
      if (index <= 0) return true;
      const prev = levels[index - 1];
      return AF.Profile.stars(moduleId, prev.id) > 0;
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

    /** 0 = none, 1 = dim wrong answers, 2 = also replay the prompt. */
    helpLevel(moduleId, levelId) {
      const tries = AF.Profile.attempts(moduleId, levelId);
      if (tries >= 4) return 2;
      if (tries >= 2) return 1;
      return 0;
    },

    /* ---------- the winding level map ---------- */

    /**
     * Draws a path of level nodes into `host`.
     * onPick(levelDef, index) fires for unlocked, non-"soon" levels.
     */
    renderMap(host, moduleDef, onPick) {
      const levels = moduleDef.levels;
      const mid = moduleDef.id;
      const STEP = 112;                      // vertical gap between nodes
      const LANES = [22, 50, 78, 50];        // winding pattern, in %

      host.innerHTML = '';
      host.style.height = (levels.length * STEP + 80) + 'px';

      const pos = levels.map((lv, i) => ({
        x: LANES[i % LANES.length],
        y: 56 + i * STEP
      }));

      // The dotted trail, drawn behind the nodes.
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'map-trail');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('viewBox', `0 0 100 ${levels.length * STEP + 80}`);
      let d = '';
      pos.forEach((p, i) => {
        if (i === 0) { d += `M ${p.x} ${p.y}`; return; }
        const prev = pos[i - 1];
        const my = (prev.y + p.y) / 2;
        d += ` C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`;
      });
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'map-line');
      svg.appendChild(path);
      host.appendChild(svg);

      const next = Levels.nextIndex(mid, levels);

      levels.forEach((lv, i) => {
        const stars = AF.Profile.stars(mid, lv.id);
        const unlocked = !lv.soon && Levels.isUnlocked(mid, levels, i);

        const node = document.createElement('button');
        node.className = 'map-node';
        node.style.left = pos[i].x + '%';
        node.style.top = pos[i].y + 'px';
        node.style.setProperty('--i', i);
        if (!unlocked) node.classList.add('is-locked');
        if (stars > 0) node.classList.add('is-done');
        if (i === next && unlocked && stars === 0) node.classList.add('is-next');
        if (lv.soon) node.classList.add('is-soon');

        node.innerHTML = `
          <span class="node-disc">
            <span class="node-ico">${lv.soon ? '🔒' : (unlocked ? (lv.icon || (i + 1)) : '🔒')}</span>
          </span>
          <span class="node-stars" aria-hidden="true">
            ${[1, 2, 3].map(n => `<i class="${n <= stars ? 'on' : ''}">★</i>`).join('')}
          </span>
          <span class="node-name">${lv.title}</span>`;

        node.setAttribute('aria-label',
          `${lv.title}. ${lv.soon ? 'Coming soon' : unlocked ? stars + ' of 3 stars' : 'Locked'}`);

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
          onPick(lv, i);
        });

        host.appendChild(node);
      });

      // Bring the next level into view without yanking the page.
      const target = host.querySelector('.is-next') || host.querySelector('.map-node');
      if (target) {
        setTimeout(() => {
          const scroller = host.parentElement;
          if (scroller) scroller.scrollTop = Math.max(0, target.offsetTop - scroller.clientHeight / 2);
        }, 60);
      }
    },

    /* ---------- the end-of-level sheet ---------- */

    /**
     * Shows the result card. Handlers: { onRetry, onNext, onMap }
     */
    showResult(opts) {
      const sheet = document.getElementById('result');
      const card = sheet.querySelector('.result-card');

      card.querySelector('.result-title').textContent = opts.title || 'Level complete!';
      AF.Art.paint(card.querySelector('.result-char'), AF.Profile.character);

      const starEls = card.querySelectorAll('.result-stars i');
      starEls.forEach(el => el.classList.remove('on'));

      const nextBtn = card.querySelector('[data-act="next"]');
      nextBtn.hidden = !opts.hasNext;

      sheet.hidden = false;

      // Stars land one at a time, each with its own chime.
      for (let n = 0; n < opts.stars; n++) {
        setTimeout(() => {
          starEls[n].classList.add('on');
          AF.Audio.SFX.star(n);
          AF.FX.sparkleAt(starEls[n], 8);
        }, 320 + n * 420);
      }

      setTimeout(() => {
        if (opts.stars === 3) AF.FX.confetti(50);
        AF.Audio.say(opts.spoken || AF.Profile.skin().cheer);
      }, 320 + opts.stars * 420);

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
