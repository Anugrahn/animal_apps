/* ============================================================
   ui.js — the shared pieces every screen is built from
   ------------------------------------------------------------
   One implementation per control, so the same thing looks and
   behaves the same everywhere (UI_REDESIGN_SPEC.md §10):

     hud(el, o)    the frame on every menu screen
     pills()       the friend's star and day-streak counters
     logo()        the "Animal Friends" title
     sign(text)    a wooden sign: the name of the screen
     stars(n)      a row of three stars, n of them gold
     tabs(...)     the stage selector (Basic... or Step 1, Level 1...)
     steps(...)    a lesson's steps, above the game
     stump         the tree stump the friend stands on

   These only return markup or fill an element; what a tap does
   stays in core/app.js.
   ============================================================ */
(function (AF) {
  'use strict';

  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const UI = {
    stump: '<img class="stump" src="art/world/stump.webp" alt="" aria-hidden="true" draggable="false">',

    logo() {
      return '<h1 class="logo sign" aria-label="Animal Friends"><span data-t="Animal">Animal</span><span data-t="Friends">Friends</span></h1>';
    },

    /** Shrinks a sign's lettering (down to `min` px) until all of it fits,
        rather than cutting the end off ("Three st…"). */
    fit(el, min) {
      if (!el || !el.offsetWidth) return;
      el.style.fontSize = '';
      // where the words end (not the leaves drawn past each end) against
      // where the room inside the sign ends; the screen may still be
      // growing in, so the padding is scaled the same way
      const words = document.createRange();
      const over = () => {
        const box = el.getBoundingClientRect(), scale = box.width / el.offsetWidth || 1;
        words.selectNodeContents(el);
        return words.getBoundingClientRect().right > box.right - parseFloat(getComputedStyle(el).paddingRight) * scale + 1;
      };
      let size = parseFloat(getComputedStyle(el).fontSize);
      while (over() && size > (min || 16)) el.style.fontSize = --size + 'px';
    },

    sign(text, crumb) {
      return `<div class="sign-wrap"><h2 class="sign">${esc(text)}</h2>${crumb ? `<span class="crumb">${esc(crumb)}</span>` : ''}</div>`;
    },

    /** Gold star counter and orange day streak. */
    pills() {
      const P = AF.Profile, stars = P.allStars(), streak = P.streak();
      return `
        <span class="pill pill-star" aria-label="${stars} stars"><i data-ic="star"></i>${stars}</span>
        ${streak ? `<span class="pill pill-streak" aria-label="${streak} day streak"><i data-ic="flame"></i>${streak}</span>` : ''}`;
    },

    /** `of` stars in a row (3 unless a subject has more stages), n of them gold. */
    stars(n, cls, of) {
      of = of || 3;
      return `<span class="stars-row ${cls || ''}" aria-label="${n} of ${of} stars">${Array.from({ length: of }, (_, i) =>
        `<i class="${i < n ? 'on' : ''}" data-ic="star"></i>`).join('')}</span>`;
    },

    /**
     * The frame: Back (or Settings at Home) top-left, the screen's
     * name in the middle, the friend's face with stars and streak
     * top-right. o = { left: 'settings' | 'back', help, logo, title, crumb, face }
     */
    hud(el, o) {
      o = o || {};
      el.innerHTML = `
        <div class="hud-left">
          ${o.left === 'settings'
            ? '<button class="round-btn" data-act="grown" data-ic="settings" aria-label="For grown-ups"></button>'
            : '<button class="round-btn" data-act="back" data-ic="back" aria-label="Back"></button>'}
          ${o.help ? '<button class="round-btn small" data-act="help" data-ic="help" aria-label="How to play"></button>' : ''}
        </div>
        <div class="hud-right">
          ${o.face === false ? '' : '<button class="me-face" data-act="me" aria-label="Your friend"><span class="me-clip"></span></button>'}
          <div class="hud-pills">${UI.pills()}</div>
        </div>
        <div class="hud-mid">${o.logo ? UI.logo() : o.title ? UI.sign(o.title, o.crumb) : ''}</div>`;
      const face = el.querySelector('.me-face');
      if (face) AF.Art.face(face.firstElementChild);
    },

    /** The stages of a subject: Basic / Intermediate / Advanced, or
        "Step 1" ... "Level 5". A stage finished shows a gold star, a
        locked one a padlock. states[t] = { open, done, total }
        (With more than three, the tabs show the stage's number big:
        "Level 4" is drawn as a small "Level" over a big 4.) */
    tabs(names, current, states) {
      const many = names.length > 3;
      return names.map((name, t) => {
        const st = states[t];
        const m = many && /^(.*\S)\s+(\d+)$/.exec(name);
        const full = st.open && st.total > 0 && st.done >= st.total;
        return `<button class="tab${t === current ? ' on' : ''}${st.open ? '' : ' locked'}${full ? ' full' : ''}" data-t="${t}" role="tab"
            aria-selected="${t === current}" aria-label="${esc(name)}${st.open ? `, ${st.done} of ${st.total} done` : ', locked'}">
          <span class="tab-name">${m ? `<small>${esc(m[1])}</small><b>${m[2]}</b>` : esc(name)}</span>
          <span class="tab-stars">${many ? (full ? '<i data-ic="star"></i>' : '') : '<i data-ic="star"></i>'.repeat(t + 1)}${st.open ? '' : '<i class="tab-lock" data-ic="lock"></i>'}</span>
        </button>`;
      }).join('');
    },

    /** A lesson's steps in a row: done ones ticked, the one being
        played lit up. list = [{ name, pic }] (engines/lesson.js) */
    steps(list, at) {
      return list.map((s, i) => `
        <li class="step${i < at ? ' done' : i === at ? ' now' : ''}" aria-current="${i === at ? 'step' : 'false'}">
          <img src="art/${s.pic}.webp" alt="" draggable="false"><span>${esc(s.name)}</span>
        </li>`).join('');
    }
  };

  AF.UI = UI;
})(window.AF = window.AF || {});
