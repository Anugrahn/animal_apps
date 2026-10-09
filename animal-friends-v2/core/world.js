/* ============================================================
   world.js — the drawn world: islands, map props, treasure
   ------------------------------------------------------------
   Everything scenic that is not a character or an icon. All of
   it is inline SVG, so there are still no picture files.

     AF.World.island(areaId, colour)   the four home-screen islands,
                                       each with props that say what
                                       lives there
     AF.World.prop(areaId, n)          a small thing to stand on a
                                       level map (tree, flower, …)
     AF.World.chest(open)              the treasure at the end of a
                                       level path
   ============================================================ */
(function (AF) {
  'use strict';

  const F = "font-family=\"Fredoka, 'Arial Rounded MT Bold', sans-serif\" font-weight=\"700\" text-anchor=\"middle\"";

  /* ---------- home-screen islands (300 × 230) ---------- */

  function block(x, y, s, colour, letter) {
    return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="7" fill="${colour}"/>
      <rect x="${x + 4}" y="${y + 4}" width="${s - 8}" height="${s - 8}" rx="5" fill="#fff" opacity=".28"/>
      <text x="${x + s / 2}" y="${y + s * 0.74}" font-size="${s * 0.66}" fill="#fff" ${F}>${letter}</text>`;
  }
  function face(x, y, r, colour, sad) {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${colour}"/>
      <circle cx="${x - r * 0.36}" cy="${y - r * 0.16}" r="${r * 0.11}" fill="#7A4A12"/><circle cx="${x + r * 0.36}" cy="${y - r * 0.16}" r="${r * 0.11}" fill="#7A4A12"/>
      <path d="M${x - r * 0.4} ${y + r * (sad ? 0.5 : 0.22)} q${r * 0.4} ${r * (sad ? -0.42 : 0.42)} ${r * 0.8} 0" fill="none" stroke="#7A4A12" stroke-width="${r * 0.14}" stroke-linecap="round"/>`;
  }
  function pad(x, y, n) {
    return `<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="#58C46A"/><ellipse cx="${x}" cy="${y - 1.5}" rx="12" ry="6.5" fill="#7BD98A"/>
      <text x="${x}" y="${y + 3.5}" font-size="11" fill="#FFF3A8" ${F}>${n}</text>`;
  }

  const PROPS = {
    literacy: `
      <ellipse cx="62" cy="96" rx="26" ry="12" fill="#57B86A"/><ellipse cx="236" cy="104" rx="18" ry="9" fill="#57B86A"/>
      ${block(64, 58, 44, '#4F9BEA', 'B')}${block(110, 62, 40, '#EF5D5D', 'C')}${block(86, 18, 42, '#F5A534', 'A')}
      <path d="M204 92 q-30 -16 -58 -6 v30 q28 -10 58 6z" fill="#FFFDF4" stroke="#E7D7B4" stroke-width="2"/>
      <path d="M204 92 q30 -16 58 -6 v30 q-28 -10 -58 6z" fill="#FFFDF4" stroke="#E7D7B4" stroke-width="2"/>
      <path d="M204 92 v30" stroke="#D9C39A" stroke-width="2.5"/>
      <g stroke-width="4" stroke-linecap="round" fill="none"><path d="M158 98 q14 -5 34 0" stroke="#F5A534"/><path d="M158 108 q14 -5 30 0" stroke="#58C46A"/>
        <path d="M216 98 q18 -5 34 0" stroke="#4F9BEA"/><path d="M216 108 q16 -5 30 0" stroke="#EF5D5D"/></g>
      <path transform="translate(244 62) scale(.42)" d="M24 5l5.600 12.200 13.400 1.500-10 9 2.800 13.100L24 34.200 12.200 40.800 15 27.700l-10-9 13.400-1.500z" fill="#FFC93C"/>`,
    stem: `
      <ellipse cx="126" cy="100" rx="100" ry="30" fill="#49B9E6"/><ellipse cx="126" cy="97" rx="92" ry="25" fill="#6FD0F2"/>
      ${pad(70, 98, 5)}${pad(108, 110, 3)}${pad(132, 90, 4)}${pad(160, 108, 2)}${pad(190, 94, 1)}
      <circle cx="92" cy="84" r="6" fill="#FF8FC7"/><circle cx="92" cy="84" r="2.500" fill="#FFE27A"/>
      <path d="M196 96 L226 34 L252 34 L286 96Z" fill="#9A6A45"/><path d="M196 96 L226 34 L238 34 L226 96Z" fill="#B58258"/>
      <path d="M222 40 q16 -14 34 0 l5 18 q-8 -8 -13 2 q-6 -10 -13 0 q-6 -8 -13 0z" fill="#FF8A3D"/>
      <circle cx="236" cy="22" r="5" fill="#FFB36B"/><circle cx="248" cy="10" r="3.500" fill="#FFD1A0"/><circle cx="228" cy="8" r="2.500" fill="#FFD1A0"/>`,
    life: `
      <path transform="translate(140 96) scale(2.700 1.300)" d="M0 24 C-36 4 -32 -22 -13 -22 C-5 -22 0 -16 0 -11 C0 -16 5 -22 13 -22 C32 -22 36 4 0 24Z" fill="#D9434C"/>
      <path transform="translate(140 88) scale(2.700 1.300)" d="M0 24 C-36 4 -32 -22 -13 -22 C-5 -22 0 -16 0 -11 C0 -16 5 -22 13 -22 C32 -22 36 4 0 24Z" fill="#F4737A"/>
      ${face(214, 40, 19, '#FFD24A', false)}${face(250, 58, 16, '#FFC23A', true)}
      <circle cx="74" cy="38" r="23" fill="#DDF6FF" opacity=".75" stroke="#fff" stroke-width="2.500"/>${face(74, 38, 15, '#BFEFFF', false)}`,
    play: `
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#2E8C4A" stroke-width="15"><path d="M40 108 C36 70 100 56 152 60 C204 62 232 80 224 106 C218 122 190 128 170 126"/><path d="M84 106 C84 88 120 82 150 84 C176 86 190 94 184 104"/><path d="M128 110 q16 6 30 -2"/></g>
        <g stroke="#58BE6E" stroke-width="11" transform="translate(0 -4)"><path d="M40 108 C36 70 100 56 152 60 C204 62 232 80 224 106 C218 122 190 128 170 126"/><path d="M84 106 C84 88 120 82 150 84 C176 86 190 94 184 104"/><path d="M128 110 q16 6 30 -2"/></g>
      </g>
      <g transform="rotate(12 244 46)"><rect x="220" y="12" width="48" height="66" rx="9" fill="#7B4FD6"/><rect x="225" y="17" width="38" height="56" rx="6" fill="#A77BF2"/>
        <rect x="234" y="33" width="20" height="24" rx="6" fill="#62E0F2"/><rect x="238" y="37" width="12" height="9" rx="3" fill="#C9F8FF"/></g>`
  };

  /* Each island has its own outline, so they differ in shape and not
     only in colour: round (ABC), a wide lagoon (STEM), a heart
     (Heart), a square playground (Play). */
  const GRASS = {
    literacy: 'M8 106 C8 68 74 52 150 52 S292 68 292 106 C292 124 278 136 260 133 C252 148 232 147 226 138 C202 149 178 142 170 151 C152 158 136 147 124 149 C104 154 84 141 66 143 C46 148 30 139 26 130 C14 126 8 118 8 106Z',
    stem: 'M6 104 C6 74 64 60 150 60 S294 74 294 104 C294 130 244 142 150 142 S6 130 6 104Z',
    life: 'M150 148 C108 140 12 118 12 82 C12 54 44 44 80 48 C114 52 138 64 150 78 C162 64 186 52 220 48 C256 44 288 54 288 82 C288 118 192 140 150 148Z',
    play: 'M18 72 Q18 52 40 52 H260 Q282 52 282 72 V124 Q282 144 260 144 H40 Q18 144 18 124Z'
  };

  /** A home-screen island: the painted one from art/world/ (the
      drawn version above is kept as a fallback if it is missing). */
  function island(areaId, colour) {
    return `<img class="isl-art" src="art/world/island-${areaId}.webp" alt="" draggable="false" onerror="this.outerHTML=AF.World.drawnIsland('${areaId}','${colour}')">`;
  }
  function drawnIsland(areaId, colour) {
    return `<svg class="isl-art" viewBox="0 0 300 230" aria-hidden="true">
      <ellipse cx="150" cy="220" rx="98" ry="8" fill="rgba(10,60,50,.2)"/>
      <path d="M24 116 C40 176 96 212 150 214 C204 212 260 176 276 116Z" fill="#9A6A45"/>
      <path d="M58 150 C90 192 130 208 150 208 C124 192 92 174 58 150Z M240 150 C226 170 206 186 184 198 C214 190 232 170 240 150Z" fill="#7A5133" opacity=".65"/>
      <path d="${GRASS[areaId] || GRASS.literacy}" fill="${colour}"/>
      <ellipse cx="150" cy="100" rx="132" ry="42" fill="#fff" opacity=".22"/>
      ${PROPS[areaId] || ''}
    </svg>`;
  }

  /* ---------- things that stand on a level map (60 × 70) ---------- */

  const TREE = `<rect x="26" y="44" width="8" height="20" rx="3" fill="#8A5A3B"/><circle cx="30" cy="30" r="22" fill="#2E9B62"/><circle cx="24" cy="24" r="11" fill="#45B67A"/>`;
  const PINE = `<rect x="26" y="50" width="8" height="16" rx="3" fill="#8A5A3B"/><path d="M30 4 L52 54 H8Z" fill="#2A9368" stroke="#2A9368" stroke-width="6" stroke-linejoin="round"/><path d="M30 12 L40 36 H20Z" fill="#48B587"/>`;
  const FLOWER = (c) => `<g transform="translate(30 46)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-9" rx="6" ry="8" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="5.500" fill="#FFD84A"/></g>`;
  const BUSH = `<ellipse cx="30" cy="52" rx="24" ry="14" fill="#2E9B62"/><circle cx="20" cy="44" r="12" fill="#3FAE74"/><circle cx="38" cy="42" r="13" fill="#45B67A"/>`;
  const HEDGE = `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 58 V26 H52 V58 H22 V40 H38" stroke="#23804A" stroke-width="12"/><path d="M8 54 V22 H52 V54 H22 V36 H38" stroke="#46B56A" stroke-width="9"/></g>`;
  const ABC = (l, c) => `<rect x="12" y="24" width="36" height="36" rx="7" fill="${c}"/><rect x="16" y="28" width="28" height="28" rx="5" fill="#fff" opacity=".28"/><text x="30" y="52" font-size="26" fill="#fff" ${F}>${l}</text>`;
  const LILY = `<ellipse cx="30" cy="50" rx="27" ry="14" fill="#55C3EE"/><ellipse cx="30" cy="50" rx="17" ry="9" fill="#58C46A"/><ellipse cx="30" cy="48" rx="13" ry="6" fill="#7BD98A"/><circle cx="30" cy="42" r="6" fill="#FF8FC7"/><circle cx="30" cy="42" r="2.500" fill="#FFE27A"/>`;
  const HEART = `<path transform="translate(30 42) scale(1.050)" d="M0 22 C-34 2 -24 -22 -11 -22 C-4 -22 0 -16 0 -12 C0 -16 4 -22 11 -22 C24 -22 34 2 0 22Z" fill="#F4737A"/><path transform="translate(24 32)" d="M0 0 q4 -6 9 -3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  const BOOK = `<path d="M30 34 q-14 -8 -26 -2 v24 q12 -6 26 2z M30 34 q14 -8 26 -2 v24 q-12 -6 -26 2z" fill="#FFFDF4" stroke="#E0CDA4" stroke-width="2"/><path d="M9 40 q8 -3 16 0 M35 40 q8 -3 16 0" stroke="#F5A534" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  const FLASK = `<path d="M24 18h12M26 18v14L14 56a4 4 0 0 0 4 6h24a4 4 0 0 0 4-6L34 32V18z" fill="#DFF6FF" stroke="#7CB8D6" stroke-width="2.500" stroke-linejoin="round"/><path d="M19 50h22l3 6a2 2 0 0 1-2 3H18a2 2 0 0 1-2-3z" fill="#7BD98A"/>`;

  const SETS = {
    literacy: [TREE, ABC('A', '#F5A534'), FLOWER('#FF9DCB'), BOOK, PINE, ABC('B', '#4F9BEA'), BUSH, ABC('C', '#EF5D5D'), FLOWER('#fff')],
    stem:     [PINE, LILY, FLOWER('#fff'), FLASK, TREE, LILY, BUSH, FLOWER('#FFD0E8'), PINE],
    life:     [TREE, HEART, FLOWER('#FF9DCB'), BUSH, FLOWER('#fff'), HEART, PINE, FLOWER('#FFE27A'), TREE],
    play:     [TREE, HEDGE, FLOWER('#fff'), PINE, HEDGE, BUSH, TREE, FLOWER('#FFD0E8'), HEDGE]
  };

  function prop(areaId, n) {
    const set = SETS[areaId] || SETS.play;
    return `<svg viewBox="0 0 60 70" aria-hidden="true">${set[n % set.length]}</svg>`;
  }

  function chest(open) {
    return `<img class="chest-art" src="art/world/chest${open ? '-open' : ''}.webp" alt="" draggable="false">`;
  }


  /* ---------- an island's subjects: landmarks along a sandy path ----------
     items = [{ mod, done, of, rec, started }]. The path starts at a
     little house at the bottom; each subject stands on its own islet,
     with its stages finished shown as stars and a chest when all are. */

  /* The islets painted in art/bg-island.jpg, in percent of the
     picture, in the order a child meets them walking up from the beach. */
  const ISLETS = [[49, 70], [76, 51], [25, 43], [49, 28], [82, 36]];

  function areaPath(host, area, items, onPick) {
    // On a narrow phone the picture is wider than the screen; keep every
    // landmark inside the part that shows.
    const vis = Math.min(1, window.innerWidth / Math.max(window.innerWidth, window.innerHeight * 2 / 3));
    const lo = 50 - vis * 50 + 13, hi = 50 + vis * 50 - 13;
    const at = (p) => `left:${Math.max(lo, Math.min(hi, p[0]))}%;top:${p[1]}%`;
    host.className = 'board board-isles';
    host.innerHTML = items.map((it, i) => {
      const m = it.mod, all = it.done >= it.of, p = ISLETS[i % ISLETS.length];
      return `<button class="lm${it.rec ? ' is-rec' : ''}${all ? ' is-done' : ''}" data-i="${i}" style="${at(p)};--c:${m.colour};--i:${i}"
          aria-label="${m.title}, ${it.done} of ${it.of} stages done">
        ${AF.Icon.jelly(m.id, m.colour, 'lm-ic', m.icon)}
        <span class="lm-name">${m.title}</span>
        ${it.started || it.done ? AF.UI.stars(it.done, 'lm-stars') : ''}
        ${all ? `<span class="lm-chest">${chest(true)}</span>` : ''}
      </button>`;
    }).join('') + '<span class="lm-me"></span>';
    host.querySelectorAll('.lm').forEach(b => b.addEventListener('click', () => onPick(items[+b.dataset.i].mod)));
    const rec = Math.max(0, items.findIndex(x => x.rec));
    const p = ISLETS[rec % ISLETS.length];
    const me = host.querySelector('.lm-me');
    me.style.cssText = at(p) + (p[0] > 50 ? ';--side:-1' : '');   // on the side with room
    AF.Art.paint(me, null, 'idle');
  }

  AF.World = { island: island, drawnIsland: drawnIsland, prop: prop, chest: chest, areaPath: areaPath };
})(window.AF = window.AF || {});
