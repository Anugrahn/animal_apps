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
     tabs(...)     the Basic / Intermediate / Advanced selector
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

    sign(text, crumb) {
      return `<div class="sign-wrap"><h2 class="sign">${esc(text)}</h2>${crumb ? `<span class="crumb">${esc(crumb)}</span>` : ''}</div>`;
    },

    /** Gold star counter and orange day streak. */
    pills() {
      const P = AF.Profile, stars = P.allStars(), streak = P.streak();
      return `
        <span class="pill pill-star" aria-label="${stars} stars"><i data-ic="star"></i>${stars}</span>
        <span class="pill pill-streak" aria-label="${streak} day streak"><i data-ic="flame"></i>${streak}</span>`;
    },

    stars(n, cls) {
      return `<span class="stars-row ${cls || ''}" aria-label="${n} of 3 stars">${[1, 2, 3].map(k =>
        `<i class="${k <= n ? 'on' : ''}" data-ic="star"></i>`).join('')}</span>`;
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

    /** Basic / Intermediate / Advanced. states[t] = { open, done, total } */
    tabs(names, current, states) {
      return names.map((name, t) => {
        const st = states[t];
        return `<button class="tab${t === current ? ' on' : ''}${st.open ? '' : ' locked'}" data-t="${t}" role="tab"
            aria-selected="${t === current}" aria-label="${name}${st.open ? `, ${st.done} of ${st.total} done` : ', locked'}">
          <span class="tab-name">${name}</span>
          <span class="tab-stars">${'<i data-ic="star"></i>'.repeat(t + 1)}${st.open ? '' : '<i class="tab-lock" data-ic="lock"></i>'}</span>
        </button>`;
      }).join('');
    }
  };

  AF.UI = UI;
})(window.AF = window.AF || {});
