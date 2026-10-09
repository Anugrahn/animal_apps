/* ============================================================
   art.js — Character artwork
   ------------------------------------------------------------
   Fake-3D SVG: every character is built from the same recipe so
   they feel like one family.

     1. a cast shadow that shrinks when the character jumps
     2. a radial gradient lit from the upper-left
     3. a gloss highlight over the top of the head
     4. a rim light along the lower-right edge
     5. squash-and-stretch animation (see ui.css)

   Gradient ids are namespaced per instance, otherwise two
   characters on the same screen would share the first one's fill.
   ============================================================ */
(function (AF) {
  'use strict';

  let uid = 0;

  /* Every character declares its palette here. Light -> base -> dark
     feeds the body gradient; accent is for inner ears, pads, tongue. */
  const SKINS = {
    dino: {
      name: 'Rex',
      species: 'Dino',
      light: '#A8F07C', base: '#5FCB3C', dark: '#2F8E20',
      belly: '#E8FFD4', accent: '#FF8FA8', spike: '#FFC93C',
      colour: '#5FCB3C',
      /* personality drives voice + motion, see audio.js / profile.js */
      pitch: 0.72, rate: 0.82, cheer: 'Roar!'
    },
    bear: {
      name: 'Mochi',
      species: 'Bear',
      light: '#F0C98A', base: '#C98C4E', dark: '#8E5A2A',
      belly: '#FFF0D6', accent: '#FF9FB0', spike: '#8E5A2A',
      colour: '#C98C4E',
      pitch: 0.92, rate: 0.78, cheer: 'Lovely!'
    },
    rabbit: {
      name: 'Pip',
      species: 'Rabbit',
      light: '#FFFFFF', base: '#EFE6FF', dark: '#BBA8E8',
      belly: '#FFFFFF', accent: '#FF8FB4', spike: '#BBA8E8',
      colour: '#CDBDF5',
      pitch: 1.25, rate: 1.0, cheer: 'Yay!'
    }
  };

  /* Shared <defs>. Same gradient geometry for all three, so the
     light always falls from the same place. */
  function defs(p, s) {
    return `
    <defs>
      <radialGradient id="${p}-body" cx="34%" cy="26%" r="80%">
        <stop offset="0"    stop-color="${s.light}"/>
        <stop offset="52%"  stop-color="${s.base}"/>
        <stop offset="100%" stop-color="${s.dark}"/>
      </radialGradient>
      <radialGradient id="${p}-belly" cx="50%" cy="34%" r="70%">
        <stop offset="0"    stop-color="#fff"/>
        <stop offset="100%" stop-color="${s.belly}"/>
      </radialGradient>
      <radialGradient id="${p}-gloss" cx="38%" cy="20%" r="52%">
        <stop offset="0"   stop-color="#fff" stop-opacity=".72"/>
        <stop offset="70%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0"    stop-color="#fff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#fff" stop-opacity=".55"/>
      </linearGradient>
    </defs>`;
  }

  /* Eyes are identical across characters — that is what makes a
     cast look related. Only the spacing changes. */
  function eyes(cx1, cx2, cy, r) {
    return `
    <g class="ch-eyes">
      <ellipse cx="${cx1}" cy="${cy}" rx="${r}" ry="${r * 1.12}" fill="#fff"/>
      <ellipse cx="${cx2}" cy="${cy}" rx="${r}" ry="${r * 1.12}" fill="#fff"/>
      <circle cx="${cx1 + 1}" cy="${cy + 1}" r="${r * .56}" fill="#2B1B5E"/>
      <circle cx="${cx2 + 1}" cy="${cy + 1}" r="${r * .56}" fill="#2B1B5E"/>
      <circle cx="${cx1 - 1}" cy="${cy - 3}" r="${r * .22}" fill="#fff"/>
      <circle cx="${cx2 - 1}" cy="${cy - 3}" r="${r * .22}" fill="#fff"/>
    </g>`;
  }

  function blush(cx1, cx2, cy, accent) {
    return `
    <ellipse cx="${cx1}" cy="${cy}" rx="9" ry="6" fill="${accent}" opacity=".45"/>
    <ellipse cx="${cx2}" cy="${cy}" rx="9" ry="6" fill="${accent}" opacity=".45"/>`;
  }

  /* ---------- the three characters ---------- */

  function dino(p, s) {
    return `
    ${defs(p, s)}
    <ellipse class="ch-shadow" cx="100" cy="186" rx="50" ry="11"/>
    <g class="ch-body">
      <!-- tail -->
      <path d="M62 150 Q30 152 16 170 Q34 176 50 170 Q58 162 68 158 Z" fill="url(#${p}-body)"/>
      <!-- back spikes -->
      <g fill="${s.spike}">
        <path d="M74 44 L82 26 L90 46 Z"/>
        <path d="M58 70 L62 50 L74 66 Z"/>
        <path d="M54 102 L50 84 L64 96 Z"/>
      </g>
      <!-- body -->
      <ellipse cx="100" cy="142" rx="40" ry="36" fill="url(#${p}-body)"/>
      <ellipse cx="100" cy="150" rx="25" ry="25" fill="url(#${p}-belly)"/>
      <!-- feet -->
      <ellipse cx="76" cy="174" rx="19" ry="11" fill="${s.dark}"/>
      <ellipse cx="124" cy="174" rx="19" ry="11" fill="${s.dark}"/>
      <!-- arms -->
      <ellipse cx="62" cy="134" rx="11" ry="14" fill="url(#${p}-body)" transform="rotate(-18 62 134)"/>
      <ellipse cx="138" cy="134" rx="11" ry="14" fill="url(#${p}-body)" transform="rotate(18 138 134)"/>
      <!-- head -->
      <circle cx="100" cy="78" r="45" fill="url(#${p}-body)"/>
      <path class="ch-rim" d="M138 100 A45 45 0 0 1 72 118" fill="none" stroke="url(#${p}-rim)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="78" r="45" fill="url(#${p}-gloss)"/>
      <!-- muzzle -->
      <ellipse cx="100" cy="97" rx="27" ry="19" fill="url(#${p}-belly)"/>
      <ellipse cx="91" cy="90" rx="3" ry="2.4" fill="${s.dark}"/>
      <ellipse cx="109" cy="90" rx="3" ry="2.4" fill="${s.dark}"/>
      <path class="ch-mouth" d="M88 102 Q100 112 112 102" fill="none" stroke="${s.dark}" stroke-width="3.4" stroke-linecap="round"/>
      ${blush(68, 132, 95, s.accent)}
      ${eyes(84, 116, 68, 12)}
    </g>`;
  }

  function bear(p, s) {
    return `
    ${defs(p, s)}
    <ellipse class="ch-shadow" cx="100" cy="186" rx="50" ry="11"/>
    <g class="ch-body">
      <!-- ears -->
      <circle cx="66" cy="44" r="19" fill="url(#${p}-body)"/>
      <circle cx="134" cy="44" r="19" fill="url(#${p}-body)"/>
      <circle cx="66" cy="45" r="10" fill="${s.accent}" opacity=".7"/>
      <circle cx="134" cy="45" r="10" fill="${s.accent}" opacity=".7"/>
      <!-- body -->
      <ellipse cx="100" cy="142" rx="41" ry="36" fill="url(#${p}-body)"/>
      <ellipse cx="100" cy="149" rx="26" ry="26" fill="url(#${p}-belly)"/>
      <!-- feet with pads -->
      <ellipse cx="76" cy="173" rx="19" ry="12" fill="${s.dark}"/>
      <ellipse cx="124" cy="173" rx="19" ry="12" fill="${s.dark}"/>
      <ellipse cx="76" cy="174" rx="9" ry="6" fill="${s.belly}" opacity=".8"/>
      <ellipse cx="124" cy="174" rx="9" ry="6" fill="${s.belly}" opacity=".8"/>
      <!-- arms -->
      <ellipse cx="61" cy="136" rx="12" ry="16" fill="url(#${p}-body)" transform="rotate(-16 61 136)"/>
      <ellipse cx="139" cy="136" rx="12" ry="16" fill="url(#${p}-body)" transform="rotate(16 139 136)"/>
      <!-- head -->
      <circle cx="100" cy="80" r="45" fill="url(#${p}-body)"/>
      <path class="ch-rim" d="M140 102 A45 45 0 0 1 74 120" fill="none" stroke="url(#${p}-rim)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="80" r="45" fill="url(#${p}-gloss)"/>
      <!-- muzzle -->
      <ellipse cx="100" cy="100" rx="25" ry="18" fill="url(#${p}-belly)"/>
      <path d="M93 92 Q100 87 107 92 Q104 99 100 99 Q96 99 93 92 Z" fill="#2B1B5E"/>
      <path class="ch-mouth" d="M100 99 L100 104 M100 104 Q93 110 87 104 M100 104 Q107 110 113 104"
            fill="none" stroke="#2B1B5E" stroke-width="3.2" stroke-linecap="round"/>
      ${blush(69, 131, 98, s.accent)}
      ${eyes(85, 115, 72, 11.5)}
    </g>`;
  }

  function rabbit(p, s) {
    return `
    ${defs(p, s)}
    <ellipse class="ch-shadow" cx="100" cy="186" rx="48" ry="11"/>
    <g class="ch-body">
      <!-- ears -->
      <g transform="rotate(-11 84 50)">
        <ellipse cx="84" cy="34" rx="14" ry="38" fill="url(#${p}-body)"/>
        <ellipse cx="84" cy="36" rx="7" ry="28" fill="${s.accent}" opacity=".6"/>
      </g>
      <g transform="rotate(11 116 50)">
        <ellipse cx="116" cy="34" rx="14" ry="38" fill="url(#${p}-body)"/>
        <ellipse cx="116" cy="36" rx="7" ry="28" fill="${s.accent}" opacity=".6"/>
      </g>
      <!-- fluffy tail -->
      <circle cx="46" cy="150" r="15" fill="#fff"/>
      <!-- body -->
      <ellipse cx="100" cy="144" rx="38" ry="34" fill="url(#${p}-body)"/>
      <ellipse cx="100" cy="151" rx="24" ry="23" fill="url(#${p}-belly)"/>
      <!-- big back feet -->
      <ellipse cx="74" cy="174" rx="21" ry="11" fill="${s.dark}"/>
      <ellipse cx="126" cy="174" rx="21" ry="11" fill="${s.dark}"/>
      <ellipse cx="74" cy="174" rx="10" ry="5" fill="${s.accent}" opacity=".6"/>
      <ellipse cx="126" cy="174" rx="10" ry="5" fill="${s.accent}" opacity=".6"/>
      <!-- arms -->
      <ellipse cx="64" cy="138" rx="10" ry="14" fill="url(#${p}-body)" transform="rotate(-18 64 138)"/>
      <ellipse cx="136" cy="138" rx="10" ry="14" fill="url(#${p}-body)" transform="rotate(18 136 138)"/>
      <!-- head -->
      <circle cx="100" cy="84" r="43" fill="url(#${p}-body)"/>
      <path class="ch-rim" d="M138 106 A43 43 0 0 1 74 122" fill="none" stroke="url(#${p}-rim)" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="84" r="43" fill="url(#${p}-gloss)"/>
      <!-- nose, mouth, buck teeth -->
      <path d="M94 96 Q100 92 106 96 Q103 102 100 102 Q97 102 94 96 Z" fill="${s.accent}"/>
      <path class="ch-mouth" d="M100 102 L100 106 M100 106 Q94 111 89 106 M100 106 Q106 111 111 106"
            fill="none" stroke="#9A86C7" stroke-width="3" stroke-linecap="round"/>
      <rect x="95" y="109" width="10" height="9" rx="2.5" fill="#fff" stroke="#D9CCF5" stroke-width="1.4"/>
      <line x1="100" y1="110" x2="100" y2="117" stroke="#D9CCF5" stroke-width="1.4"/>
      ${blush(70, 130, 100, s.accent)}
      ${eyes(85, 115, 76, 11.5)}
    </g>`;
  }

  const DRAW = { dino, bear, rabbit };

  /* ---------- public API ---------- */

  const Art = {
    SKINS,

    list() { return Object.keys(SKINS); },

    skin(id) { return SKINS[id] || SKINS.rabbit; },

    /** Returns an <svg> string for a character. */
    svg(id, extraClass) {
      const s = Art.skin(id);
      const p = 'c' + (++uid);
      const draw = DRAW[id] || DRAW.rabbit;
      return `<svg class="ch ${extraClass || ''}" viewBox="0 0 200 200"
                   xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                ${draw(p, s)}
              </svg>`;
    },

    /** Paints a character into a host element. */
    paint(el, id, extraClass) {
      if (!el) return;
      el.innerHTML = Art.svg(id, extraClass);
      el.style.setProperty('--c', Art.skin(id).colour);
    },

    /** One-shot reaction: 'happy' | 'hmm' | 'talk' | 'cheer'. */
    react(el, kind) {
      if (!el) return;
      const svg = el.querySelector('.ch') || el;
      svg.classList.remove('is-happy', 'is-hmm', 'is-talk', 'is-cheer');
      void svg.offsetWidth;                       // restart the animation
      svg.classList.add('is-' + kind);
      setTimeout(() => svg.classList.remove('is-' + kind), 1200);
    }
  };

  AF.Art = Art;
})(window.AF = window.AF || {});
