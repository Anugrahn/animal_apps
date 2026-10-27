/* ============================================================
   content/math.js — Math (Wink curriculum, five levels)
   ------------------------------------------------------------
   Danbi Education's Wink Math has five levels, and every level
   covers the same six areas, a little further each time:
     Level 1  the most basic concepts of the six areas   (3–4)
     Level 2  wider concepts, ready for school            (4–5)
     Level 3  formal sums and Grade 1–2 problem solving   (5–6)
     Level 4  each area further, solving problems         (6–7)
     Level 5  harder sums, ready for the upper grades     (7+)
   The six areas (Danbi does not name them; these are the areas of
   the Korean primary curriculum, with number and calculation apart):
     number · calc · shape · measure · pattern · data

   Every lesson walks Wink's road for maths (engines/lesson.js):
     Story      the idea, told with pictures, one card at a time
     Real life  the idea in everyday things
     Play       a game with it
     Quiz       four quick questions
   Concrete -> pictorial -> symbolic: a child counts real pictures
   long before a bare "3 + 2" appears (Level 3).
   ============================================================ */
(function (AF) {
  'use strict';

  const G = AF.Gen, PR = AF.Pairs, L = AF.lesson, U = AF.U;
  const NUM = AF.NUM, W = AF.numWord;
  const row = G.row, opts = G.options;
  const mix = (...gens) => (ctx) => gens[ctx.round % gens.length](ctx);
  const num = (list) => list.map(n => ({ glyph: String(n), label: W(n) }));
  const it = (e, word, bin) => ({ e: e, w: word, bin: bin });
  const step = (e, label) => ({ e: e, label: label });
  const COUNT = AF.COUNTABLE;
  const NAMES = ['Mia', 'Ben', 'Sam', 'Ana', 'Leo', 'Zara', 'Omar', 'Lily'];

  /* ---------- drawings: all inline SVG, so they look the same everywhere ---------- */

  const svg = (body, vb, cls) => `<svg class="${cls || 'opt-svg'}" viewBox="${vb || '0 0 100 100'}" aria-hidden="true">${body}</svg>`;
  const COL = ['#F24B4B', '#3D8BFF', '#FFC93C', '#3DBE5B', '#9B5DE5', '#FF8CC6', '#FF9130'];

  /** a ribbon `len` long (0–100), lying down; or a tower, standing up */
  const ribbon = (len, c) => svg(`<rect x="${(100 - len) / 2}" y="38" width="${len}" height="24" rx="12" fill="${c}"/><rect x="${(100 - len) / 2 + 6}" y="43" width="${Math.max(0, len - 12)}" height="6" rx="3" fill="#fff" opacity=".45"/>`, '0 26 100 48');
  const tower = (h, c) => svg(`<rect x="34" y="${96 - h}" width="32" height="${h}" rx="8" fill="${c}"/><rect x="40" y="${100 - h}" width="8" height="${Math.max(0, h - 10)}" rx="4" fill="#fff" opacity=".4"/>`);
  /** a glass, `level` full (0–1) */
  const glass = (level) => svg(`<defs><clipPath id="gl${Math.round(level * 100)}"><path d="M28 14 H72 L66 90 H34 Z"/></clipPath></defs>
    <rect x="20" y="${90 - 76 * level}" width="60" height="${76 * level}" fill="#5AB8F5" clip-path="url(#gl${Math.round(level * 100)})"/>
    <path d="M28 14 H72 L66 90 H34 Z" fill="none" stroke="#6B8FA8" stroke-width="4" stroke-linejoin="round"/>`);

  /* Drawn, not written: the wavy-line character this card used to show (〰️)
     has no painting and is missing from many phone fonts, so it came out as
     the device's own flat emoji or an empty box. The child traces a zig zag
     in the very next step. */
  const zig = svg('<path d="M6 46 L22 12 L38 46 L54 12 L70 46 L86 12 L102 46" fill="none" stroke="#3D8BFF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>', '0 4 108 50', 'opt-svg wide-svg');
  /** a bar chart with the number written on top of each bar */
  const barChart = svg([4, 2, 6].map((v, i) =>
    `<rect x="${18 + i * 30}" y="${82 - v * 11}" width="22" height="${v * 11}" rx="4" fill="${['#3D8BFF', '#FFC93C', '#3DBE5B'][i]}"/>` +
    `<text x="${29 + i * 30}" y="${77 - v * 11}" font-size="13" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="#3A2410">${v}</text>`).join('') +
    '<line x1="12" y1="82" x2="108" y2="82" stroke="#6B5A3E" stroke-width="2"/>', '0 0 112 90', 'opt-svg graph-svg');

  /** a clock face showing h:m (m = 0 or 30) */
  function clock(h, m, cls) {
    const hr = ((h % 12) + m / 60) * 30, mn = m * 6;
    const nums = [12, 3, 6, 9].map((n, i) => {
      const a = i * Math.PI / 2;
      return `<text x="${50 + Math.sin(a) * 31}" y="${50 - Math.cos(a) * 31 + 6}" font-size="16" font-weight="700" text-anchor="middle" fill="#3A2410" font-family="Fredoka, sans-serif">${n}</text>`;
    }).join('');
    const ticks = Array.from({ length: 12 }, (_, i) => i % 3 ? `<circle cx="${50 + Math.sin(i * Math.PI / 6) * 36}" cy="${50 - Math.cos(i * Math.PI / 6) * 36}" r="2.2" fill="#B9A37C"/>` : '').join('');
    return svg(`<circle cx="50" cy="50" r="46" fill="#fff" stroke="#F2A03D" stroke-width="6"/>${ticks}${nums}
      <line x1="50" y1="50" x2="${50 + Math.sin(hr * Math.PI / 180) * 20}" y2="${50 - Math.cos(hr * Math.PI / 180) * 20}" stroke="#E0611B" stroke-width="7" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="${50 + Math.sin(mn * Math.PI / 180) * 32}" y2="${50 - Math.cos(mn * Math.PI / 180) * 32}" stroke="#2462C4" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="5" fill="#3A2410"/>`, '0 0 100 100', cls || 'opt-svg clock-svg');
  }
  const hourWord = (h) => NUM[h];
  const timeSay = (h, m) => m ? `half past ${hourWord(h)}` : `${hourWord(h)} o’clock`;

  /* solid shapes, drawn with a little shading */
  const SOLID = {
    cube: '<path d="M50 14 L84 30 L84 70 L50 86 L16 70 L16 30 Z" fill="#3D8BFF"/><path d="M50 14 L84 30 L50 46 L16 30 Z" fill="#7FB2FF"/><path d="M50 46 L84 30 L84 70 L50 86 Z" fill="#2462C4"/>',
    sphere: '<circle cx="50" cy="50" r="38" fill="#F24B4B"/><ellipse cx="50" cy="50" rx="38" ry="12" fill="none" stroke="#B02E2E" stroke-width="2" opacity=".5"/><circle cx="38" cy="36" r="10" fill="#fff" opacity=".45"/>',
    cone: '<path d="M50 10 L80 78 A30 10 0 0 1 20 78 Z" fill="#FFC93C"/><ellipse cx="50" cy="78" rx="30" ry="10" fill="#E0A21B"/><path d="M50 10 L36 76" stroke="#fff" stroke-width="5" opacity=".4" stroke-linecap="round"/>',
    cylinder: '<rect x="24" y="22" width="52" height="58" fill="#3DBE5B"/><ellipse cx="50" cy="80" rx="26" ry="9" fill="#2E9447"/><ellipse cx="50" cy="22" rx="26" ry="9" fill="#7BD98A"/><rect x="31" y="30" width="7" height="44" rx="3" fill="#fff" opacity=".35"/>'
  };
  const solid = (k) => svg(SOLID[k]);

  /** a shape cut into `parts` equal pieces (2 or 4), `shaded` of them coloured */
  function fraction(shape, parts, shaded, c) {
    c = c || '#FF9130';
    if (shape === 'circle') {
      const wedge = (i) => {
        const a0 = i / parts * 2 * Math.PI - Math.PI / 2, a1 = (i + 1) / parts * 2 * Math.PI - Math.PI / 2;
        return `<path d="M50 50 L${50 + 40 * Math.cos(a0)} ${50 + 40 * Math.sin(a0)} A40 40 0 ${parts === 1 ? 1 : 0} 1 ${50 + 40 * Math.cos(a1)} ${50 + 40 * Math.sin(a1)} Z" fill="${i < shaded ? c : '#fff'}" stroke="#6B5A3E" stroke-width="3" stroke-linejoin="round"/>`;
      };
      return svg(parts === 1 ? `<circle cx="50" cy="50" r="40" fill="${shaded ? c : '#fff'}" stroke="#6B5A3E" stroke-width="3"/>` : Array.from({ length: parts }, (_, i) => wedge(i)).join(''));
    }
    // a square: halves side by side, quarters in a grid
    const cells = parts === 4 ? [[12, 12], [50, 12], [50, 50], [12, 50]] : parts === 2 ? [[12, 12], [50, 12]] : [[12, 12]];
    const w = parts === 1 ? 76 : 38, h = parts === 4 ? 38 : 76;
    return svg(cells.map((p, i) => `<rect x="${p[0]}" y="${p[1]}" width="${w}" height="${h}" fill="${i < shaded ? c : '#fff'}" stroke="#6B5A3E" stroke-width="3"/>`).join(''));
  }

  /** tens as rods of ten, ones as single cubes */
  function blocks(n) {
    const tens = Math.floor(n / 10), ones = n % 10;
    let x = 4, out = '';
    for (let t = 0; t < tens; t++, x += 13) {
      for (let k = 0; k < 10; k++) out += `<rect x="${x}" y="${4 + k * 9}" width="10" height="8" rx="2" fill="#3D8BFF" stroke="#2462C4" stroke-width="1"/>`;
    }
    x += 4;
    for (let k = 0; k < ones; k++) out += `<rect x="${x + (k % 2) * 12}" y="${58 + Math.floor(k / 2) * 10 - (ones > 4 ? 40 : 0)}" width="10" height="8" rx="2" fill="#FFC93C" stroke="#D99412" stroke-width="1"/>`;
    const wide = Math.max(60, x + 28);
    return svg(out, `0 0 ${wide} 96`, 'opt-svg blocks-svg');
  }

  /** tally marks: bundles of five */
  function tally(n) {
    let out = '', x = 6;
    for (let g = 0; g < Math.ceil(n / 5); g++) {
      const k = Math.min(5, n - g * 5);
      for (let i = 0; i < Math.min(4, k); i++) out += `<line x1="${x + i * 9}" y1="14" x2="${x + i * 9}" y2="70" stroke="#3A2410" stroke-width="5" stroke-linecap="round"/>`;
      if (k === 5) out += `<line x1="${x - 5}" y1="62" x2="${x + 32}" y2="22" stroke="#E0611B" stroke-width="5" stroke-linecap="round"/>`;
      x += 46;
    }
    return svg(out, `0 0 ${Math.max(60, x)} 84`, 'opt-svg tally-svg');
  }

  /** a sum in big numerals: 3 + 2 = ? */
  const sum = (...parts) => `<span class="pattern">${parts.map(p => p === '+' || p === '−' || p === '=' || p === '×' ? `<span class="op">${p}</span>` : p === '?' ? '<i class="q">?</i>' : `<i class="num">${p}</i>`).join('')}</span>`;

  /* ---------- question makers (each returns gen(ctx) -> a choose round) ---------- */

  const M = {
    /** "Two apples and one more. How many?" */
    oneMore(max) {
      return (ctx) => {
        let a;
        do { a = 1 + U.rand(max - 1); } while (a + 1 === ctx.last && max > 2);
        const t = U.one(COUNT);
        return {
          say: `${NUM[a]} ${a === 1 ? t[0] : t[1]}, and one more. How many now?`, text: `<b>${a}</b> and <b>one more</b>. How many?`,
          show: row(t[2], a) + '<span class="op">+</span>' + row(t[2], 1),
          options: opts(a + 1, 3, 1, max + 1), answer: a + 1, praise: `${NUM[a]} and one more make ${NUM[a + 1]}`
        };
      };
    },

    /** "3 + 2 = ?" with numerals only (from Level 3) */
    plus(max, n, min) {
      return (ctx) => {
        let a, b;
        do { a = (min || 1) + U.rand(Math.max(1, max - (min || 1))); b = 1 + U.rand(Math.max(1, max - a)); } while ((a + b > max || a + b === ctx.last) && max > 3);
        return {
          say: `${W(a)} plus ${W(b)}. What does it make?`, text: `What is <b>${a} + ${b}</b>?`,
          show: sum(a, '+', b, '=', '?'), options: opts(a + b, n, 1, max + 2), answer: a + b, praise: `${W(a)} plus ${W(b)} is ${W(a + b)}`
        };
      };
    },
    /** "7 − 3 = ?" */
    minus(max, n) {
      return (ctx) => {
        let a, b;
        do { a = 2 + U.rand(max - 1); b = 1 + U.rand(a - 1); } while (a - b === ctx.last && max > 3);
        return {
          say: `${W(a)} take away ${W(b)}. What is left?`, text: `What is <b>${a} − ${b}</b>?`,
          show: sum(a, '−', b, '=', '?'), options: opts(a - b, n, 0, max), answer: a - b, praise: `${W(a)} take away ${W(b)} is ${W(a - b)}`
        };
      };
    },
    /** "20 + 30 = ?" and "70 − 20 = ?" — whole tens */
    tens(n) {
      return (ctx) => {
        const add = Math.random() < 0.55;
        let a, b;
        do {
          a = 10 * (1 + U.rand(add ? 8 : 9));
          b = add ? 10 * (1 + U.rand((100 - a) / 10)) : 10 * (1 + U.rand(a / 10 - 1 || 1));
        } while ((add ? a + b > 100 : b >= a) || (add ? a + b : a - b) === ctx.last);
        const ans = add ? a + b : a - b;
        const near = U.shuffle([ans - 10, ans + 10, ans + 20, ans - 20].filter(v => v >= 0 && v <= 100 && v !== ans)).slice(0, n - 1);
        return {
          say: add ? `${W(a)} plus ${W(b)}. What does it make?` : `${W(a)} take away ${W(b)}. What is left?`,
          text: `What is <b>${a} ${add ? '+' : '−'} ${b}</b>?`, show: sum(a, add ? '+' : '−', b, '=', '?'),
          options: near.concat([ans]).sort((x, y) => x - y).map(v => ({ key: v, glyph: String(v) })), answer: ans,
          praise: `${W(a)} ${add ? 'plus' : 'take away'} ${W(b)} is ${W(ans)}`
        };
      };
    },

    /** "3 groups of 2. How many altogether?" */
    groups(sizes, most) {
      return (ctx) => {
        let g, s;
        do { g = 2 + U.rand(most - 1); s = U.one(sizes); } while (g * s === ctx.last);
        const t = U.one(COUNT);
        return {
          say: `${NUM[g]} groups of ${NUM[s]}. How many altogether?`, text: `<b>${g}</b> groups of <b>${s}</b>. How many?`,
          show: Array.from({ length: g }, () => `<span class="grp">${row(t[2], s)}</span>`).join(''),
          options: opts(g * s, 3, 1, g * s + s), answer: g * s, praise: `${NUM[g]} groups of ${NUM[s]} make ${W(g * s)}`
        };
      };
    },
    /** "Share six biscuits between two friends. How many each?" */
    share() {
      return (ctx) => {
        let k, each;
        do { k = 2 + U.rand(3); each = 1 + U.rand(4); } while (k * each === ctx.last || k * each > 12);
        const total = k * each;
        return {
          say: `Share ${W(total)} biscuits between ${NUM[k]} friends. How many does each friend get?`,
          text: `Share <b>${total}</b> between <b>${k}</b> friends`,
          show: row('🍪', total) + '<span class="op">→</span>' + row('🧒', k),
          options: opts(each, 3, 1, 8), answer: each, praise: `${NUM[each]} each. Fair sharing!`
        };
      };
    },

    /** tens and ones: "How many cubes?" */
    place(lo, hi) {
      return (ctx) => {
        let n;
        do { n = lo + U.rand(hi - lo + 1); } while (n === ctx.last || n % 10 === 0 && Math.random() < 0.6);
        const tens = Math.floor(n / 10), ones = n % 10;
        return {
          say: `${NUM[tens]} ${tens === 1 ? 'ten' : 'tens'} and ${NUM[ones]} ${ones === 1 ? 'one' : 'ones'}. What number is it?`,
          text: `<b>${tens}</b> ${tens === 1 ? 'ten' : 'tens'} and <b>${ones}</b> ${ones === 1 ? 'one' : 'ones'}`,
          show: blocks(n), options: U.shuffle([n, ones * 10 + tens, n + 10 <= 99 ? n + 10 : n - 10].filter((v, i, a) => a.indexOf(v) === i && v > 0)).sort((a, b) => a - b).map(v => ({ key: v, glyph: String(v) })),
          answer: n, praise: W(n)
        };
      };
    },

    /** "Find three o'clock." — the answers are clocks */
    clock(half) {
      return (ctx) => {
        let h;
        do { h = 1 + U.rand(12); } while (h === ctx.last);
        const m = half && Math.random() < 0.7 ? 30 : 0;
        const others = U.pick(Array.from({ length: 12 }, (_, i) => i + 1), 2, [h]).map(o => ({ h: o, m: half ? U.one([0, 30]) : 0 }));
        if (half) others[0] = { h: h, m: m ? 0 : 30 };        // the same hour, the other half
        return {
          say: `Find ${timeSay(h, m)}.`, text: `Find <b>${m ? 'half past ' + h : h + ' o’clock'}</b>`,
          options: U.shuffle([{ h: h, m: m }].concat(others)).map(o => ({ key: o.h * 100 + o.m, html: clock(o.h, o.m) })),
          answer: h * 100 + m, praise: `It is ${timeSay(h, m)}`
        };
      };
    },

    /** "Which one is longer?" ribbons, or "Which is taller?" towers */
    length(tall) {
      return () => {
        const want = Math.random() < 0.55;          // longest / tallest, or shortest
        const lens = U.shuffle(tall ? [30, 55, 88] : [32, 58, 90]);
        const cols = U.shuffle(COL);
        const pick = want ? Math.max(...lens) : Math.min(...lens);
        const word = tall ? (want ? 'tallest' : 'shortest') : (want ? 'longest' : 'shortest');
        return {
          say: `Which one is the ${word}?`, text: `Which one is the <b>${word}</b>?`,
          options: lens.map((l, i) => ({ key: l, html: tall ? tower(l, cols[i]) : ribbon(l, cols[i]) })),
          answer: pick, praise: `That one is the ${word}`
        };
      };
    },
    /** "Which glass is full?" */
    full(withHalf) {
      return () => {
        const ask = U.one(withHalf ? ['full', 'empty', 'half full'] : ['full', 'empty']);
        const levels = withHalf ? [1, 0, 0.5] : [0.95, 0, 0.45];
        const key = { full: levels[0], empty: levels[1], 'half full': levels[2] }[ask];
        return {
          say: `Which glass is ${ask}?`, text: `Which glass is <b>${ask}</b>?`,
          options: U.shuffle(levels).map(l => ({ key: l, html: glass(l) })), answer: key, praise: `That glass is ${ask}`
        };
      };
    },
    /** "How many blocks long is the pencil?" */
    measure(most) {
      return (ctx) => {
        let n;
        do { n = 2 + U.rand(most - 1); } while (n === ctx.last);
        const u = 100 / (most + 1);
        const body = `<rect x="2" y="10" width="${n * u}" height="16" rx="4" fill="#FFC93C"/><path d="M${2 + n * u} 10 l12 8 -12 8z" fill="#F2A03D"/>` +
          Array.from({ length: most + 1 }, (_, i) => `<rect x="${2 + i * u}" y="36" width="${u - 2}" height="${u - 2}" rx="3" fill="${i < n ? '#3D8BFF' : '#D7E3F2'}"/>`).join('');
        return {
          say: 'How many blocks long is the pencil?', text: 'How many <b>blocks</b> long is the pencil?',
          show: svg(body, `0 0 ${104 + u} ${44 + u}`, 'opt-svg wide-svg'), options: opts(n, 3, 1, most), answer: n, praise: `${NUM[n]} blocks long`
        };
      };
    },

    /** "Find the cat on the box." */
    position() {
      const PLACE = {
        on: (a, b) => `<span class="pos v">${a}${b}</span>`,
        under: (a, b) => `<span class="pos v">${b}${a}</span>`,
        'next to': (a, b) => `<span class="pos h">${b}${a}</span>`
      };
      const PAIRS = [['🐱', '📦', 'cat', 'box'], ['🐶', '🛏️', 'dog', 'bed'], ['⚽', '🪑', 'ball', 'chair'], ['🐦', '🌳', 'bird', 'tree']];
      return (ctx) => {
        const pr = U.one(PAIRS), where = U.one(Object.keys(PLACE).filter(k => k !== ctx.last));
        const a = `<i>${pr[0]}</i>`, b = `<i>${pr[1]}</i>`;
        return {
          say: `Find the ${pr[2]} ${where} the ${pr[3]}.`, text: `Find the ${pr[2]} <b>${where}</b> the ${pr[3]}`,
          options: U.shuffle(Object.keys(PLACE)).map(k => ({ key: k, html: PLACE[k](a, b) })),
          answer: where, praise: `The ${pr[2]} is ${where} the ${pr[3]}`
        };
      };
    },

    /** "Find the same one." */
    same() {
      const SETS = [['🍎', '🍌', '🍇', '🍊'], ['🐶', '🐱', '🐰', '🐸'], ['🚗', '🚌', '🚲', '✈️'], ['⭐', '🌙', '☀️', '☁️']];
      return () => {
        const set = U.shuffle(U.one(SETS));
        return {
          // `same`: this is the one game where the picture in the question is
          // MEANT to be on a card too. Everywhere else that gives the answer
          // away, and validate.mjs says so.
          same: true,
          say: 'Find the one that is the same.', text: 'Find the <b>same</b> one',
          show: `<span class="big-e">${set[0]}</span>`,
          options: U.shuffle(set.slice(0, 3)).map(e => ({ key: e, emoji: e })), answer: set[0], praise: 'The same!'
        };
      };
    },

    /** a picture graph: rows of fruit. ask: 'most' | 'least' | 'count' | 'more' */
    graph(asks, bars) {
      const KINDS = [['🍎', 'apples'], ['🍌', 'bananas'], ['🍇', 'grapes'], ['🍓', 'strawberries'], ['🍊', 'oranges']];
      return () => {
        const kinds = U.pick(KINDS, 3);
        const counts = U.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3);
        const chart = bars
          ? svg(kinds.map((k, i) => `<rect x="${20 + i * 28}" y="${82 - counts[i] * 11}" width="20" height="${counts[i] * 11}" rx="4" fill="${COL[i + 1]}"/>` +
              `<text x="${30 + i * 28}" y="${78 - counts[i] * 11}" font-size="10" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" fill="#3A2410">${counts[i]}</text>` +
              `<text x="${30 + i * 28}" y="100" font-size="15" text-anchor="middle">${k[0]}</text>`).join('') +
              '<line x1="14" y1="82" x2="104" y2="82" stroke="#6B5A3E" stroke-width="2"/>', '0 0 110 106', 'opt-svg graph-svg')
          : `<span class="pgraph">${kinds.map((k, i) => `<span class="pg-row"><b>${k[0]}</b>${row('🔵', counts[i], 'pg-dots')}</span>`).join('')}</span>`;
        const ask = U.one(asks);
        const most = counts.indexOf(Math.max(...counts)), least = counts.indexOf(Math.min(...counts));
        if (ask === 'most' || ask === 'least') {
          const i = ask === 'most' ? most : least;
          return {
            say: `Which fruit has the ${ask}?`, text: `Which fruit has the <b>${ask}</b>?`, show: chart,
            options: kinds.map(k => ({ key: k[1], emoji: k[0] })), answer: kinds[i][1], praise: `The ${kinds[i][1]} have the ${ask}`
          };
        }
        if (ask === 'count') {
          const i = U.rand(3);
          return {
            say: `How many ${kinds[i][1]}?`, text: `How many <b>${kinds[i][1]}</b>?`, show: chart,
            options: opts(counts[i], 3, 1, 7), answer: counts[i], praise: `${NUM[counts[i]]} ${kinds[i][1]}`
          };
        }
        const d = counts[most] - counts[least];
        return {
          say: `How many more ${kinds[most][1]} than ${kinds[least][1]}?`, text: `How many more <b>${kinds[most][0]}</b> than <b>${kinds[least][0]}</b>?`,
          show: chart, options: opts(d, 3, 1, 6), answer: d, praise: `${NUM[d]} more`
        };
      };
    },

    /** "How many marks?" — tally bundles of five */
    tally(lo, hi) {
      return (ctx) => {
        let n;
        do { n = lo + U.rand(hi - lo + 1); } while (n === ctx.last);
        return {
          say: 'Count the tally marks. Every bundle is five. How many?', text: 'How many <b>tally marks</b>?',
          show: tally(n), options: opts(n, 3, 1, hi + 2), answer: n, praise: W(n)
        };
      };
    },

    /** "2, 4, ?, 8" — the missing number in a counting pattern */
    gap(steps, top, down) {
      return () => {
        const s = U.one(steps), len = 5;
        const back = down && Math.random() < 0.4;
        let start = s * (1 + U.rand(Math.max(1, Math.floor(top / s) - len)));
        const seq = Array.from({ length: len }, (_, i) => start + i * s);
        if (back) seq.reverse();
        const at = 1 + U.rand(len - 2), ans = seq[at];
        const near = [ans + s, ans - s, ans + 1, ans - 1, ans + 2].filter((v, i, all) => v >= 0 && v !== ans && all.indexOf(v) === i);
        const choices = U.shuffle(near).slice(0, 2).concat([ans]).sort((a, b) => a - b);
        return {
          say: back ? 'Counting back. Which number is missing?' : 'Which number is missing?', text: 'Which number is <b>missing</b>?',
          show: `<span class="pattern">${seq.map((v, i) => i === at ? '<i class="q">?</i>' : `<i class="num">${v}</i>`).join('')}</span>`,
          options: choices.map(v => ({ key: v, glyph: String(v) })), answer: ans, praise: seq.join(', ')
        };
      };
    },

    /** Story sums: "Mia has 3 apples. She gets 2 more. How many now?"
        kind: 'add' | 'take' | 'more' (how many more) | 'two' (two steps) */
    story(kinds, max) {
      return (ctx) => {
        const kind = U.one(kinds), name = U.one(NAMES), t = U.one(COUNT.filter(c => c[0] !== 'fish'));
        const she = ['Mia', 'Ana', 'Zara', 'Lily'].indexOf(name) >= 0 ? 'She' : 'He';
        let a, b, c, ans, say, show;
        if (kind === 'add') {
          do { a = 1 + U.rand(max - 1); b = 1 + U.rand(max - a); } while (a + b === ctx.last);
          ans = a + b; say = `${name} has ${W(a)} ${t[1]}. ${she} gets ${W(b)} more. How many ${t[1]} now?`;
          show = max <= 10 ? row(t[2], a) + '<span class="op">+</span>' + row(t[2], b) : sum(a, '+', b, '=', '?');
        } else if (kind === 'take') {
          do { a = 2 + U.rand(max - 1); b = 1 + U.rand(a - 1); } while (a - b === ctx.last);
          ans = a - b; say = `${name} has ${W(a)} ${t[1]}. ${she} gives ${W(b)} away. How many are left?`;
          show = max <= 10 ? row(t[2], ans) + row(t[2], b, 'gone') : sum(a, '−', b, '=', '?');
        } else if (kind === 'more') {
          do { a = 1 + U.rand(max - 1); b = a + 1 + U.rand(Math.max(1, max - a - 1)); } while (b - a === ctx.last || b > max);
          const other = U.one(NAMES.filter(n => n !== name));
          ans = b - a; say = `${name} has ${W(a)} ${t[1]}. ${other} has ${W(b)}. How many more does ${other} have?`;
          show = row(t[2], a) + '<span class="op">·</span>' + row(t[2], b);
        } else {
          do { a = 3 + U.rand(max - 4); b = 1 + U.rand(5); c = 1 + U.rand(a + b - 1); } while (a + b > max || a + b - c === ctx.last);
          ans = a + b - c; say = `${name} has ${W(a)} ${t[1]}. ${she} gets ${W(b)} more, then gives ${W(c)} away. How many now?`;
          show = sum(a, '+', b, '−', c, '=', '?');
        }
        return { say: say, text: U.esc(say), show: show, options: opts(ans, 3, 0, max + 2), answer: ans, praise: `${W(ans)} ${ans === 1 ? t[0] : t[1]}` };
      };
    },

    /** "What shape is it?" — the solid shapes */
    solids(real) {
      const NAMES3 = { cube: 'cube', sphere: 'sphere', cone: 'cone', cylinder: 'cylinder' };
      const REAL = [['🎲', 'dice', 'cube'], ['🎁', 'present', 'cube'], ['⚽', 'ball', 'sphere'], ['🍊', 'orange', 'sphere'], ['🌍', 'globe', 'sphere'],
        ['🍦', 'ice cream cone', 'cone'], ['🥫', 'tin', 'cylinder'], ['🥁', 'drum', 'cylinder']];
      let prev = null;
      return () => {
        if (real) {
          const t = U.one(REAL.filter(x => x[1] !== prev)); prev = t[1];
          return {
            say: `A ${t[1]}. What shape is it?`, text: `What shape is the <b>${t[1]}</b>?`, show: `<span class="big-e">${t[0]}</span>`,
            options: U.shuffle([t[2]].concat(U.pick(Object.keys(SOLID), 2, [t[2]]))).map(k => ({ key: k, html: solid(k), label: NAMES3[k] })),
            answer: t[2], praise: `A ${t[1]} is a ${t[2]}`
          };
        }
        const k = U.one(Object.keys(SOLID).filter(x => x !== prev)); prev = k;
        return {
          say: `Find the ${k}.`, text: `Find the <b>${k}</b>`,
          options: U.shuffle([k].concat(U.pick(Object.keys(SOLID), 2, [k]))).map(o => ({ key: o, html: solid(o) })), answer: k, praise: `A ${k}!`
        };
      };
    },

    /** "Find a half." */
    part(kinds) {
      const WORD = { 2: 'a half', 4: 'a quarter', 1: 'the whole' };
      return (ctx) => {
        const want = U.one(kinds.filter(k => WORD[k] !== ctx.last));
        const shape = U.one(['circle', 'square']);
        const all = U.shuffle([2, 4, 1].filter(k => kinds.indexOf(k) >= 0 || k === 1)).slice(0, 3);
        if (all.indexOf(want) < 0) all[0] = want;
        return {
          say: `Find ${WORD[want]}. The coloured part is ${WORD[want]}.`, text: `Find <b>${WORD[want]}</b>`,
          options: all.map(k => ({ key: WORD[k], html: fraction(shape, k, 1) })), answer: WORD[want],
          praise: want === 1 ? 'The whole thing!' : `One of ${NUM[want]} equal parts is ${WORD[want]}`
        };
      };
    },

    /** "What time do we have breakfast?"
        Nothing in T may carry the same picture as its own answer card in O: a
        child would match the two pictures and never think about the time of
        day. That is why waking up is a clock and not a sunrise, and why
        "see the sun go down" and "see the moon" are not here at all —
        the only honest picture for either IS the answer card. */
    when() {
      const T = [['🥣', 'eat breakfast', 'morning'], ['⏰', 'wake up', 'morning'], ['🏫', 'go to school', 'morning'],
        ['🥪', 'eat lunch', 'midday'], ['🏖️', 'play in the hot sun', 'midday'], ['🛁', 'have a bath', 'evening'],
        ['😴', 'go to sleep', 'night']];
      const O = { morning: ['🌅', 'morning'], midday: ['☀️', 'midday'], evening: ['🌇', 'evening'], night: ['🌙', 'night'] };
      let prev = null;
      return () => {
        const t = U.one(T.filter(x => x[1] !== prev)); prev = t[1];
        const others = U.pick(Object.keys(O), 2, [t[2]]);
        return {
          say: `When do we ${t[1]}?`, text: `When do we <b>${t[1]}</b>?`, show: `<span class="big-e">${t[0]}</span>`,
          options: U.shuffle([t[2]].concat(others)).map(k => ({ key: k, emoji: O[k][0], label: O[k][1] })),
          answer: t[2], praise: `We ${t[1]} in the ${t[2] === 'midday' ? 'middle of the day' : t[2]}`.replace('in the night', 'at night')
        };
      };
    }
  };

  /* things that are heavy or light, everyday knowledge */
  const HEAVY = [['🐘', 'elephant', '🐭', 'mouse'], ['🍉', 'watermelon', '🍒', 'cherry'], ['🚗', 'car', '🚲', 'bike'],
    ['🪨', 'rock', '🍃', 'leaf'], ['🐻', 'bear', '🐦', 'bird'], ['🎒', 'full school bag', '✏️', 'pencil']];
  const heavy = HEAVY.map(h => ({ say: `Which one is heavier, the ${h[1]} or the ${h[3]}?`, text: 'Which one is <b>heavier</b>?',
    options: [{ key: h[1], emoji: h[0], label: h[1] }, { key: h[3], emoji: h[2], label: h[3] }], answer: h[1], praise: `The ${h[1]} is heavier` }))
    .concat(HEAVY.slice(0, 4).map(h => ({ say: `Which one is lighter, the ${h[1]} or the ${h[3]}?`, text: 'Which one is <b>lighter</b>?',
      options: [{ key: h[1], emoji: h[0], label: h[1] }, { key: h[3], emoji: h[2], label: h[3] }], answer: h[3], praise: `The ${h[3]} is lighter` })));
  const BIG = [['🐘', 'elephant', '🐭', 'mouse'], ['🌳', 'tree', '🌸', 'flower'], ['🚌', 'bus', '🚗', 'car'], ['🐳', 'whale', '🐟', 'fish'], ['🏠', 'house', '🐶', 'dog']];
  const bigSmall = BIG.map(b => {
    const big = Math.random() < 0.5;
    return { say: big ? `Which one is big?` : `Which one is small?`, text: `Which one is <b>${big ? 'big' : 'small'}</b>?`,
      options: [{ key: b[1], emoji: b[0], label: b[1] }, { key: b[3], emoji: b[2], label: b[3] }], answer: big ? b[1] : b[3],
      praise: big ? `The ${b[1]} is big` : `The ${b[3]} is small` };
  });

  /* shapes in the real world (from the old Shapes subject) */
  const HUNT = [
    ['circle', [['ball', '⚽'], ['clock', '🕒'], ['biscuit', '🍪'], ['coin', '🪙']]],
    ['triangle', [['pizza slice', '🍕'], ['tent', '⛺'], ['mountain', '⛰️']]],
    ['rectangle', [['door', '🚪'], ['phone', '📱'], ['book', '📕'], ['bus', '🚌']]],
    ['square', [['present', '🎁'], ['picture', '🖼️'], ['dice', '🎲']]]
  ];
  function hunt(shapes) {
    const list = [];
    HUNT.filter(h => shapes.indexOf(h[0]) >= 0).forEach((h, i, all) => h[1].forEach(thing => {
      // a square IS a rectangle, so never offer one as the wrong answer for the other
      const boxy = (n) => n === 'square' || n === 'rectangle';
      const others = U.shuffle(HUNT.filter(x => x[0] !== h[0] && !(boxy(h[0]) && boxy(x[0])))).map(x => U.one(x[1]));
      list.push({
        say: `Which one is shaped like a ${h[0]}?`, text: `Which one is shaped like a <b>${h[0]}</b>?`, show: G.shape(h[0], '#FFC93C'),
        options: [{ key: thing[0], emoji: thing[1] }].concat(others.slice(0, 2).map(o => ({ key: o[0], emoji: o[1] }))),
        answer: thing[0], praise: `The ${thing[0]} is a ${h[0]}`
      });
    }));
    return G.ask(list);
  }

  /* ---------- a lesson: Story -> Real life -> Play -> Quiz ---------- */

  /* A step's questions are a fixed bank, picked once from its question
     maker with a fixed seed: plenty for a lesson and its replays, the
     same on every device, and few enough that every line can be
     recorded with the natural voice (random sums and story problems
     made thousands of different sentences). */
  let seed = 7;
  function bank(gen, size) {
    const real = Math.random;
    let st = (seed = (seed * 48271) % 2147483647);
    Math.random = () => { st = (st * 16807) % 2147483647; return (st - 1) / 2147483646; };
    try {
      const out = [], seen = {};
      for (let i = 0; i < size * 25 && out.length < size; i++) {
        const r = gen({ round: i, last: out.length ? out[out.length - 1].answer : null, stretch: false });
        const k = r.say + '|' + (r.praise || '');
        if (!seen[k]) { seen[k] = 1; out.push(r); }
      }
      return G.ask(out);
    } finally { Math.random = real; }
  }

  const ch = (gen, rounds) => ({ type: 'choose', rounds: rounds || 3, gen: bank(gen, 10) });
  function lesson(id, title, topic, story, life, play, quiz) {
    return L(id, title, [
      { step: 'story', type: 'intro', cards: story },
      Object.assign({ step: 'life' }, life),
      Object.assign({ step: 'play' }, play),
      Object.assign({ step: 'quiz' }, quiz, { rounds: 4 })
    ], { topic: topic });
  }
  function review(id, quiz, play) {
    return L(id, 'Review', [
      { step: 'review', type: 'choose', rounds: 6, gen: bank(quiz, 14) },
      Object.assign({ step: 'play' }, play)
    ], { review: true });
  }
  /* a card that shows n things and their numeral */
  const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
  const countCard = (n, t) => ({ big: String(n), show: row(t[2], n), say: `${cap(W(n))}. ${cap(W(n))} ${n === 1 ? t[0] : t[1]}.` });
  const card = (say, show, big) => ({ say: say, show: show, big: big });
  const orderSets = (lists, say) => lists.map(l => ({ say: say || 'Put the numbers in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: num(l), praise: l.map(W).join(', ') + '!' }));
  const sumPairs = (list, op) => list.map(([a, b]) => {
    const v = op === '+' ? a + b : a - b;
    return { w: String(v), a: { t: `${a} ${op} ${b}` }, b: { t: String(v) }, sayA: `${W(a)} ${op === '+' ? 'plus' : 'take away'} ${W(b)}`, sayB: W(v),
      say: `${W(a)} ${op === '+' ? 'plus' : 'take away'} ${W(b)} is ${W(v)}` };
  });
  const S = (e, label) => step(e, label);

  /* ---------------- Level 1: first ideas in all six areas (about 3–4) ---------------- */

  const APPLE = COUNT[0], DUCK = COUNT[2], STAR = COUNT[1], FISH = COUNT[4], BEE = COUNT[7];

  const level1 = [
    lesson('m1-1', 'One, two, three', 'number',
      [countCard(1, APPLE), countCard(2, DUCK), countCard(3, STAR)],
      ch(G.count(1, 3, 3)),
      { type: 'trace', kind: 'number', set: [1, 2, 3], ordered: true },
      ch(G.numeral(1, 3, 3))),
    lesson('m1-2', 'Circle, square…', 'shape',
      [card('This is a circle. It is round, like a ball.', G.shape('circle', '#F24B4B'), ''),
        card('This is a square. It has four sides, all the same.', G.shape('square', '#3D8BFF'), ''),
        card('This is a triangle. It has three sides and three corners.', G.shape('triangle', '#FFC93C'), '')],
      ch(hunt(['circle', 'triangle', 'square'])),
      { type: 'match', rounds: 1, n: 3, pairs: PR.shape(['circle', 'square', 'triangle']), say: 'Put each shape in its place.', text: 'Put each <b>shape</b> in its place' },
      ch(G.shapes(['circle', 'square', 'triangle'], 3))),
    lesson('m1-3', 'Big and small', 'measure',
      [card('The elephant is big.', '<span class="sized" style="--k:1">🐘</span>'), card('The mouse is small.', '<span class="sized" style="--k:.5">🐭</span>'),
        card('Big, bigger, biggest!', '<span class="sized" style="--k:.45">🎈</span><span class="sized" style="--k:.72">🎈</span><span class="sized" style="--k:1">🎈</span>')],
      ch(G.ask(bigSmall)),
      { type: 'order', sets: [
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: [S('🐜', 'ant'), S('🐭', 'mouse'), S('🐘', 'elephant')], praise: 'Small, bigger, biggest!' },
        { say: 'Put them in order. Start with the smallest.', text: 'Smallest <b>first</b>', steps: [S('🍒', 'cherry'), S('🍎', 'apple'), S('🍉', 'watermelon')], praise: 'From small to big!' }] },
      ch(G.size())),
    lesson('m1-4', 'Four and five', 'number',
      [countCard(4, FISH), countCard(5, BEE), card('One, two, three, four, five. Five fingers on my hand!', '<span class="big-e">✋</span>', '5')],
      ch(G.count(1, 5, 3)),
      { type: 'match', rounds: 2, n: 3, pairs: PR.count(1, 5), say: 'Match each number to the stars.', text: 'Match each <b>number</b> to the stars' },
      ch(G.numeral(1, 5, 3))),
    lesson('m1-5', 'Patterns', 'pattern',
      [card('Red, blue, red, blue. This is a pattern!', '<span class="pattern"><i>🔴</i><i>🔵</i><i>🔴</i><i>🔵</i></span>'),
        card('A pattern goes again and again. What comes next? Red!', '<span class="pattern"><i>🔴</i><i>🔵</i><i>🔴</i><i>🔵</i><i>🔴</i></span>'),
        card('Lines can make patterns too. Zig, zag, zig, zag!', zig)],
      ch(G.pattern(['AB'])),
      { type: 'trace', kind: 'line', set: ['zigzag', 'wave'], ordered: true },
      ch(G.pattern(['AB']))),
    lesson('m1-6', 'Same and different', 'data',
      [card('These two are the same. Two apples!', '<span class="pattern"><i>🍎</i><i>🍎</i></span>'),
        card('This one is different. A banana!', '<span class="pattern"><i>🍎</i><i>🍎</i><i>🍌</i></span>'),
        card('We can put things that are the same together.', '<span class="pattern"><i>🔴</i><i>🔴</i></span><span class="pattern"><i>🟡</i><i>🟡</i></span>')],
      ch(M.same()),
      { type: 'sort', rounds: 6,
        items: [it('🍎', 'apple', 'red'), it('🍓', 'strawberry', 'red'), it('🚒', 'fire engine', 'red'), it('🍌', 'banana', 'yellow'), it('🐥', 'chick', 'yellow'), it('🍋', 'lemon', 'yellow')],
        bins: [{ key: 'red', emoji: '🔴', label: 'Red', c: '#EE5B5B' }, { key: 'yellow', emoji: '🟡', label: 'Yellow', c: '#F2B618' }],
        ask: i => `What colour is the ${i.w}?`, tell: (i, b) => `The ${i.w} is ${b.key}` },
      ch(G.odd([AF.WORDS.animals, AF.WORDS.food, AF.WORDS.go]))),
    lesson('m1-7', 'One more', 'calc',
      [card('Two apples.', row('🍎', 2), '2'), card('One more apple comes. Now there are three!', row('🍎', 2) + '<span class="op">+</span>' + row('🍎', 1), '3'),
        card('One more makes the next number.', '<span class="pattern"><i class="num">3</i><i class="num">4</i></span>')],
      ch(M.oneMore(4)),
      { type: 'pop', rounds: 3, gen: G.numeral(1, 5, 3) },
      ch(G.compare(5))),
    lesson('m1-8', 'On, under, next to', 'shape',
      [card('The cat is on the box.', '<span class="pos v"><i>🐱</i><i>📦</i></span>'), card('Now the cat is under the box!', '<span class="pos v"><i>📦</i><i>🐱</i></span>'),
        card('The cat is next to the box.', '<span class="pos h"><i>📦</i><i>🐱</i></span>')],
      ch(M.position()),
      { type: 'maze', w: 4, h: 4, theme: 'forest', say: 'Help me find my way home!', text: 'Help me get <b>home</b>' },
      ch(M.position())),
    review('m1-r', mix(G.count(1, 5, 3), G.shapes(['circle', 'square', 'triangle'], 3), G.size(), G.pattern(['AB']), M.position()),
      { type: 'memory', n: 4, peek: true, pairs: PR.count(1, 5) })
  ];

  /* ---------------- Level 2: wider ideas, ready for school (about 4–5) ---------------- */

  const level2 = [
    lesson('m2-1', 'Count to ten', 'number',
      [countCard(6, APPLE), countCard(8, STAR), countCard(10, DUCK), card('Ten fingers. Five and five make ten!', '<span class="big-e">✋✋</span>', '10')],
      ch(G.count(5, 10, 4)),
      { type: 'trace', kind: 'number', set: [6, 7, 8, 9], ordered: true, rounds: 3 },
      ch(G.numeral(1, 10, 4))),
    lesson('m2-2', 'More and fewer', 'number',
      [card('Five cars and two cars. Five is more!', row('🚗', 5) + '<span class="op">·</span>' + row('🚗', 2)),
        card('Two is fewer. Fewer means not as many.', row('🚗', 2)),
        card('Three and three are the same!', row('⭐', 3) + '<span class="op">=</span>' + row('⭐', 3))],
      ch(G.compare(8)),
      { type: 'match', rounds: 2, n: 4, pairs: PR.count(3, 10, '🔵'), say: 'Match each number to the dots.', text: 'Match each <b>number</b> to the dots' },
      ch(G.compare(10))),
    lesson('m2-3', 'Shapes around us', 'shape',
      [card('A rectangle has two long sides and two short sides. Like a door!', G.shape('rectangle', '#3DBE5B') + '<span class="big-e">🚪</span>'),
        card('An oval is like a stretched circle. Like an egg!', G.shape('oval', '#9B5DE5') + '<span class="big-e">🥚</span>'),
        card('A star has five points.', G.shape('star', '#FFC93C')), card('A heart! We draw it for love.', G.shape('heart', '#FF8CC6'))],
      ch(hunt(['circle', 'triangle', 'rectangle', 'square'])),
      { type: 'match', rounds: 2, n: 4, pairs: PR.shape(AF.SHAPES), say: 'Put each shape in its place.', text: 'Put each <b>shape</b> in its place' },
      ch(G.shapes(AF.SHAPES, 4))),
    lesson('m2-4', 'Long, tall, heavy', 'measure',
      [card('This ribbon is long. That one is short.', ribbon(88, '#F24B4B') + ribbon(36, '#3D8BFF')),
        card('This tower is tall. That one is short.', tower(88, '#3DBE5B') + tower(34, '#FFC93C')),
        card('An elephant is heavy. A feather is light.', '<span class="big-e">🐘</span><span class="big-e">🪶</span>'),
        card('This glass is full. That one is empty.', glass(0.95) + glass(0))],
      ch(G.ask(heavy)),
      { type: 'order', sets: [0, 1].map(() => ({ say: 'Put the ribbons in order. Start with the shortest.', text: 'Shortest <b>first</b>',
        steps: [24, 46, 68, 90].map((l, i) => ({ e: ribbon(l, COL[i]), label: '' })), praise: 'Short, long, longer, longest!' })) },
      ch(mix(M.length(false), M.length(true), M.full(false)))),
    lesson('m2-5', 'Tricky patterns', 'pattern',
      [card('Apple, apple, banana. Apple, apple, banana.', '<span class="pattern"><i>🍎</i><i>🍎</i><i>🍌</i><i>🍎</i><i>🍎</i><i>🍌</i></span>'),
        card('Dog, cat, frog. Dog, cat, frog. Three things this time!', '<span class="pattern"><i>🐶</i><i>🐱</i><i>🐸</i><i>🐶</i><i>🐱</i><i>🐸</i></span>'),
        card('Find the part that goes again, and you know what comes next.', '<span class="pattern"><i>⭐</i><i>🌙</i><i>🌙</i><i class="q">?</i></span>')],
      ch(G.pattern(['AAB', 'ABB'])),
      ch(G.pattern(['ABC', 'AAB'])),
      ch(G.pattern(['ABB', 'ABC', 'AAB']))),
    lesson('m2-6', 'Sort and count', 'data',
      [card('Sorting means putting things that go together in groups.', '<span class="pattern"><i>🐶</i><i>🐱</i></span><span class="pattern"><i>🐟</i><i>🐳</i></span>'),
        card('Then we count each group. Which group has more?', '<span class="pgraph"><span class="pg-row"><b>🐶</b>' + row('🔵', 3, 'pg-dots') + '</span><span class="pg-row"><b>🐟</b>' + row('🔵', 2, 'pg-dots') + '</span></span>')],
      ch(M.graph(['most', 'count'])),
      { type: 'sort', rounds: 6,
        items: [it('🐮', 'cow', 'land'), it('🐴', 'horse', 'land'), it('🐶', 'dog', 'land'), it('🐟', 'fish', 'water'), it('🐳', 'whale', 'water'), it('🐬', 'dolphin', 'water'), it('🐦', 'bird', 'sky'), it('🦋', 'butterfly', 'sky')],
        bins: [{ key: 'land', emoji: '🌳', label: 'Land', c: '#7BD389' }, { key: 'water', emoji: '🌊', label: 'Water', c: '#4CC3FF' }, { key: 'sky', emoji: '☁️', label: 'Sky', c: '#B9C8FF' }],
        ask: i => `Where does the ${i.w} live?`, tell: (i, b) => `The ${i.w} ${b.key === 'sky' ? 'flies in the sky' : 'lives ' + (b.key === 'land' ? 'on land' : 'in water')}` },
      ch(M.graph(['most', 'least', 'count']))),
    lesson('m2-7', 'Before and after', 'number',
      [card('Four comes after three.', '<span class="pattern"><i class="num">3</i><i class="num">4</i></span>'),
        card('Two comes before three.', '<span class="pattern"><i class="num">2</i><i class="num">3</i></span>'),
        card('Numbers go in order, like steps. One, two, three, four, five!', '<span class="pattern">' + [1, 2, 3, 4, 5].map(n => `<i class="num">${n}</i>`).join('') + '</span>')],
      ch(G.neighbour(2, 9, 3)),
      { type: 'order', pick: 2, sets: orderSets([[1, 2, 3, 4], [3, 4, 5, 6], [5, 6, 7, 8], [6, 7, 8, 9, 10]]) },
      ch(G.neighbour(1, 10, 3))),
    lesson('m2-8', 'Take away', 'calc',
      [card('Five birds sit in a tree.', row('🐦', 5), '5'), card('Two fly away. How many are left?', row('🐦', 3) + row('🐦', 2, 'gone')),
        card('Three are left! Five take away two is three.', row('🐦', 3), '3')],
      ch(G.takeAway(5, 3)),
      { type: 'maze', w: 6, h: 6, theme: 'beach', ordered: true,
        say: 'Pick up one, then two, then three. In order! Then go home.', text: 'Pick up <b>1, 2, 3</b> in order',
        targets: [{ glyph: '1', label: 'one' }, { glyph: '2', label: 'two' }, { glyph: '3', label: 'three' }] },
      ch(G.takeAway(6, 3))),
    review('m2-r', mix(G.count(5, 10, 4), G.compare(10), hunt(['circle', 'triangle', 'rectangle']), G.pattern(['AAB', 'ABB', 'ABC']), M.graph(['most', 'count']), G.takeAway(6, 3)),
      { type: 'memory', n: 4, pairs: PR.count(4, 10) })
  ];

  /* ---------------- Level 3: sums with numbers, Grade 1–2 problems (about 5–6) ---------------- */

  const level3 = [
    lesson('m3-1', 'Adding to 10', 'calc',
      [card('Three apples and two apples.', row('🍎', 3) + '<span class="op">+</span>' + row('🍎', 2)),
        card('We can write it with numbers. Three plus two equals five.', sum(3, '+', 2, '=', 5)),
        card('Plus means put together. Equals means makes.', sum('+', '='))],
      ch(G.add(10, 4)),
      { type: 'match', rounds: 2, n: 3, pairs: sumPairs([[1, 1], [2, 1], [2, 2], [3, 2], [4, 2], [3, 4], [5, 3], [6, 3], [5, 5]], '+'),
        say: 'Match each sum to its answer.', text: 'Match each <b>sum</b> to its answer' },
      ch(M.plus(10, 4))),
    lesson('m3-2', 'Taking away to 10', 'calc',
      [card('Six balloons. Two pop!', row('🎈', 4) + row('🎈', 2, 'gone')),
        card('Six take away two equals four.', sum(6, '−', 2, '=', 4)), card('Take away makes a number smaller.', sum('−'))],
      ch(G.takeAway(10, 4)),
      { type: 'match', rounds: 2, n: 3, pairs: sumPairs([[3, 1], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [10, 8], [9, 8]], '−'),
        say: 'Match each sum to its answer.', text: 'Match each <b>sum</b> to its answer' },
      ch(M.minus(10, 4))),
    lesson('m3-3', 'Make ten', 'calc',
      [card('Seven and three make ten.', row('⭐', 7) + '<span class="op">+</span>' + row('⭐', 3)),
        card('Six and four make ten too!', sum(6, '+', 4, '=', 10)), card('Ten friends: one and nine, two and eight, five and five.', sum(5, '+', 5, '=', 10))],
      ch(G.missing(10, 4)),
      { type: 'match', rounds: 2, n: 3, pairs: [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]].map(([a, b]) => ({ w: `${a} and ${b}`, a: { t: String(a) }, b: { t: String(b) }, say: `${W(a)} and ${W(b)} make ten` })),
        say: 'Match the numbers that make ten.', text: 'Match the numbers that make <b>ten</b>' },
      ch(G.missing(10, 4))),
    lesson('m3-4', 'Numbers to 20', 'number',
      [card('Ten and three make thirteen.', blocks(13), '13'), card('Ten and seven make seventeen.', blocks(17), '17'),
        card('Twenty is two tens.', blocks(20), '20')],
      ch(M.place(11, 20)),
      { type: 'order', pick: 2, sets: orderSets([[11, 12, 13, 14], [13, 15, 17, 19], [12, 14, 16, 18, 20], [10, 11, 15, 20]]) },
      ch(G.bigger(10, 20))),
    lesson('m3-5', 'Telling the time', 'measure',
      [card('A clock has a short hand and a long hand.', clock(3, 0, 'clock-svg')),
        card('When the long hand points up to twelve, it is something o’clock. This is three o’clock.', clock(3, 0, 'clock-svg'), '3:00'),
        card('The short hand points to the hour. This is seven o’clock.', clock(7, 0, 'clock-svg'), '7:00')],
      ch(M.when()),
      { type: 'match', rounds: 2, n: 3, pairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => ({ w: timeSay(h, 0), a: { html: clock(h, 0) }, b: { t: `${h}:00` } })),
        say: 'Match each clock to its time.', text: 'Match each <b>clock</b> to its time' },
      ch(M.clock(false))),
    lesson('m3-6', 'Solid shapes', 'shape',
      [card('A sphere is round all over, like a ball.', solid('sphere') + '<span class="big-e">⚽</span>'),
        card('A cube has six square faces, like a dice.', solid('cube') + '<span class="big-e">🎲</span>'),
        card('A cylinder is like a tin.', solid('cylinder') + '<span class="big-e">🥫</span>'),
        card('A cone has a point on top, like an ice cream cone.', solid('cone') + '<span class="big-e">🍦</span>')],
      ch(M.solids(true)),
      { type: 'sort', rounds: 6,
        items: [it('⚽', 'ball', 'sphere'), it('🍊', 'orange', 'sphere'), it('🎲', 'dice', 'cube'), it('🎁', 'present', 'cube'), it('🥫', 'tin', 'cylinder'), it('🥁', 'drum', 'cylinder')],
        bins: [{ key: 'sphere', emoji: solid('sphere'), label: 'Sphere', c: '#EE5B5B' }, { key: 'cube', emoji: solid('cube'), label: 'Cube', c: '#4D9DE0' }, { key: 'cylinder', emoji: solid('cylinder'), label: 'Cylinder', c: '#58B368' }],
        ask: i => `The ${i.w}. Which shape is it?`, tell: (i, b) => `The ${i.w} is a ${b.key}` },
      ch(M.solids(false))),
    lesson('m3-7', 'Story sums', 'calc',
      [card('Mia has three apples.', row('🍎', 3)), card('She gets two more. Now she has five.', row('🍎', 3) + '<span class="op">+</span>' + row('🍎', 2)),
        card('Listen to the story, then find the sum!', sum(3, '+', 2, '=', '?'))],
      ch(M.story(['add'], 10)),
      ch(M.story(['take'], 10)),
      ch(M.story(['add', 'take'], 10))),
    lesson('m3-8', 'Picture graphs', 'data',
      [card('A picture graph shows how many. Each dot is one fruit.', '<span class="pgraph"><span class="pg-row"><b>🍎</b>' + row('🔵', 4, 'pg-dots') + '</span><span class="pg-row"><b>🍌</b>' + row('🔵', 2, 'pg-dots') + '</span></span>'),
        card('The longest row has the most. Apples have the most!', '<span class="pgraph"><span class="pg-row"><b>🍎</b>' + row('🔵', 4, 'pg-dots') + '</span></span>')],
      ch(M.graph(['most', 'least'])),
      ch(M.graph(['count'])),
      ch(M.graph(['most', 'least', 'count', 'more']))),
    lesson('m3-9', 'Number patterns', 'pattern',
      [card('Two, four, six, eight. We jump two each time!', '<span class="pattern">' + [2, 4, 6, 8].map(n => `<i class="num">${n}</i>`).join('') + '</span>'),
        card('Ten, twenty, thirty. We jump ten each time!', '<span class="pattern">' + [10, 20, 30].map(n => `<i class="num">${n}</i>`).join('') + '</span>')],
      ch(G.skip([2], 20)),
      { type: 'maze', w: 7, h: 7, theme: 'snow', ordered: true,
        say: 'Pick up two, four, six, eight. In order! Then go home.', text: 'Pick up <b>2, 4, 6, 8</b> in order',
        targets: [2, 4, 6, 8].map(n => ({ glyph: String(n), label: W(n) })) },
      ch(M.gap([1, 2], 20))),
    review('m3-r', mix(M.plus(10, 4), M.minus(10, 4), G.missing(10, 4), M.place(11, 20), M.clock(false), M.solids(false), M.story(['add', 'take'], 10)),
      { type: 'memory', n: 4, pairs: sumPairs([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]], '+') })
  ];

  /* ---------------- Level 4: each area further, solving problems (about 6–7) ---------------- */

  const level4 = [
    lesson('m4-1', 'Adding to 20', 'calc',
      [card('Eight plus five. Make ten first: eight and two make ten, and three more make thirteen.', sum(8, '+', 5, '=', 13)),
        card('Ten plus anything is easy. Ten plus four is fourteen.', sum(10, '+', 4, '=', 14))],
      ch(M.plus(20, 4, 5)),
      { type: 'match', rounds: 2, n: 3, pairs: sumPairs([[9, 3], [8, 5], [7, 7], [10, 5], [9, 7], [8, 9], [10, 10], [6, 5]], '+'),
        say: 'Match each sum to its answer.', text: 'Match each <b>sum</b> to its answer' },
      ch(M.plus(20, 4, 4))),
    lesson('m4-2', 'Taking away to 20', 'calc',
      [card('Fifteen take away five is ten.', sum(15, '−', 5, '=', 10)), card('Count back to take away. Twelve, eleven, ten, nine.', '<span class="pattern">' + [12, 11, 10, 9].map(n => `<i class="num">${n}</i>`).join('') + '</span>')],
      ch(M.minus(20, 4)),
      { type: 'match', rounds: 2, n: 3, pairs: sumPairs([[15, 5], [12, 3], [18, 9], [14, 7], [20, 10], [16, 8], [13, 4], [11, 9]], '−'),
        say: 'Match each sum to its answer.', text: 'Match each <b>sum</b> to its answer' },
      ch(M.minus(20, 4))),
    lesson('m4-3', 'Count in 2s, 5s, 10s', 'pattern',
      [card('Count in twos: two, four, six, eight, ten.', '<span class="pattern">' + [2, 4, 6, 8, 10].map(n => `<i class="num">${n}</i>`).join('') + '</span>'),
        card('Count in fives: five, ten, fifteen, twenty.', '<span class="pattern">' + [5, 10, 15, 20].map(n => `<i class="num">${n}</i>`).join('') + '</span>'),
        card('Count in tens: ten, twenty, thirty, forty, fifty.', '<span class="pattern">' + [10, 20, 30, 40, 50].map(n => `<i class="num">${n}</i>`).join('') + '</span>')],
      ch(G.skip([2, 5], 30)),
      { type: 'order', pick: 2, sets: orderSets([[5, 10, 15, 20], [10, 20, 30, 40, 50], [2, 4, 6, 8, 10]], 'Put them in order. Count up!') },
      ch(M.gap([2, 5, 10], 60))),
    lesson('m4-4', 'Tens and ones', 'number',
      [card('Thirty four is three tens and four ones.', blocks(34), '34'), card('Fifty two is five tens and two ones.', blocks(52), '52'),
        card('The first digit tells the tens. The second tells the ones.', '<span class="pattern"><i class="num">5</i><i class="num">2</i></span>')],
      ch(M.place(21, 59)),
      { type: 'match', rounds: 2, n: 3, pairs: [23, 35, 41, 58, 62, 74, 86, 97].map(n => ({ w: String(n), a: { t: `${Math.floor(n / 10)} tens ${n % 10} ones` }, b: { t: String(n) }, say: W(n) })),
        say: 'Match the tens and ones to the number.', text: 'Match <b>tens and ones</b> to the number' },
      ch(M.place(21, 99))),
    lesson('m4-5', 'Measuring', 'measure',
      [card('We can measure with blocks. This pencil is four blocks long.', svg('<rect x="2" y="10" width="64" height="16" rx="4" fill="#FFC93C"/><path d="M66 10 l12 8 -12 8z" fill="#F2A03D"/>' + [0, 1, 2, 3].map(i => `<rect x="${2 + i * 16}" y="36" width="14" height="14" rx="3" fill="#3D8BFF"/>`).join(''), '0 0 100 56', 'opt-svg wide-svg')),
        card('Start at the end, and count every block.', '<span class="big-e">📏</span>')],
      ch(M.measure(6)),
      { type: 'order', sets: [0, 1].map(() => ({ say: 'Put the ribbons in order. Start with the shortest.', text: 'Shortest <b>first</b>',
        steps: [20, 40, 60, 80, 96].map((l, i) => ({ e: ribbon(l, COL[i]), label: '' })), praise: 'From shortest to longest!' })) },
      ch(mix(M.measure(8), M.length(true)))),
    lesson('m4-6', 'Half past', 'measure',
      [card('When the long hand points down to six, it is half past.', clock(4, 30, 'clock-svg'), '4:30'),
        card('Half past four. Half an hour after four o’clock.', clock(4, 30, 'clock-svg')), card('Half past nine.', clock(9, 30, 'clock-svg'), '9:30')],
      ch(M.clock(true)),
      { type: 'match', rounds: 2, n: 3, pairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => ({ w: timeSay(h, 30), a: { html: clock(h, 30) }, b: { t: `${h}:30` } })),
        say: 'Match each clock to its time.', text: 'Match each <b>clock</b> to its time' },
      ch(M.clock(true))),
    lesson('m4-7', 'Bar charts', 'data',
      [card('A bar chart shows how many with bars. A taller bar means more.', svg('<rect x="20" y="40" width="20" height="48" rx="4" fill="#3D8BFF"/><rect x="50" y="64" width="20" height="24" rx="4" fill="#FFC93C"/><rect x="80" y="20" width="20" height="68" rx="4" fill="#3DBE5B"/><line x1="12" y1="88" x2="108" y2="88" stroke="#6B5A3E" stroke-width="2"/>', '0 0 112 92', 'opt-svg graph-svg')),
        card('Read the number at the top of each bar.', barChart)],
      ch(M.graph(['most', 'least'], true)),
      ch(M.graph(['count'], true)),
      ch(M.graph(['most', 'count', 'more'], true))),
    lesson('m4-8', 'Problem solving', 'calc',
      [card('Read the story. Is something added, or taken away?', '<span class="big-e">🤔</span>'),
        card('How many more? Find the difference. Five and eight: three more.', row('⭐', 5) + '<span class="op">·</span>' + row('⭐', 8))],
      ch(M.story(['add', 'take'], 20)),
      ch(M.story(['more'], 10)),
      ch(M.story(['add', 'take', 'more'], 20))),
    review('m4-r', mix(M.plus(20, 4, 4), M.minus(20, 4), M.gap([2, 5, 10], 60), M.place(21, 99), M.clock(true), M.graph(['most', 'count'], true), M.measure(8)),
      { type: 'memory', n: 4, pairs: [1, 2, 3, 4, 5, 6].map(h => ({ w: timeSay(h, 0), a: { html: clock(h, 0) }, b: { t: `${h}:00` } })) })
  ];

  /* ---------------- Level 5: harder sums, ready for the upper grades (about 7+) ---------------- */

  const level5 = [
    lesson('m5-1', 'Tens to 100', 'calc',
      [card('Twenty plus thirty. Two tens and three tens make five tens: fifty.', blocks(20) + '<span class="op">+</span>' + blocks(30)),
        card('Seventy take away twenty is fifty.', sum(70, '−', 20, '=', 50))],
      ch(M.tens(3)),
      { type: 'match', rounds: 2, n: 3, pairs: sumPairs([[10, 20], [20, 30], [40, 40], [50, 30], [60, 30], [30, 70]], '+'),
        say: 'Match each sum to its answer.', text: 'Match each <b>sum</b> to its answer' },
      ch(M.tens(3))),
    lesson('m5-2', 'Equal groups', 'calc',
      [card('Three groups of two.', `<span class="grp">${row('🍎', 2)}</span><span class="grp">${row('🍎', 2)}</span><span class="grp">${row('🍎', 2)}</span>`),
        card('Two, four, six. Three groups of two make six.', sum(3, '×', 2, '=', 6)), card('Times means groups of.', sum('×'))],
      ch(M.groups([2, 5, 10], 4)),
      { type: 'maze', w: 8, h: 7, theme: 'night', ordered: true,
        say: 'Pick up five, ten, fifteen, twenty. In order! Then go home.', text: 'Pick up <b>5, 10, 15, 20</b> in order',
        targets: [5, 10, 15, 20].map(n => ({ glyph: String(n), label: W(n) })) },
      ch(M.groups([2, 3, 5], 4))),
    lesson('m5-3', 'Sharing equally', 'calc',
      [card('Six biscuits, two friends.', row('🍪', 6) + '<span class="op">→</span>' + row('🧒', 2)),
        card('Give one each, again and again. Each friend gets three!', `<span class="grp">${row('🍪', 3)}</span><span class="grp">${row('🍪', 3)}</span>`),
        card('Sharing equally means everyone gets the same.', '<span class="big-e">🤝</span>')],
      ch(M.share()),
      ch(M.groups([2, 3], 3)),
      ch(M.share())),
    lesson('m5-4', 'Halves and quarters', 'shape',
      [card('Cut a shape into two equal parts. Each part is a half.', fraction('circle', 2, 1)),
        card('Cut it into four equal parts. Each part is a quarter.', fraction('circle', 4, 1)), card('Two quarters make a half!', fraction('square', 4, 2))],
      ch(M.part([2, 4])),
      { type: 'match', rounds: 1, n: 3, pairs: [['a half', 2, 'circle'], ['a quarter', 4, 'circle'], ['the whole', 1, 'circle'], ['half a square', 2, 'square'], ['a quarter square', 4, 'square']]
        .map(([w, k, s]) => ({ w: w, a: { html: fraction(s, k, 1) }, b: { html: fraction(s, k, 1, '#3D8BFF') }, say: w })),
        say: 'Find the shapes that are the same.', text: 'Find the <b>same</b> parts' },
      ch(M.part([2, 4, 1]))),
    lesson('m5-5', 'Bigger numbers', 'number',
      [card('Which is bigger, sixty two or twenty six? Look at the tens first!', '<span class="pattern"><i class="num">62</i><i class="num">26</i></span>'),
        card('Sixty two has six tens. It is bigger.', blocks(62))],
      ch(G.bigger(20, 100)),
      { type: 'order', pick: 2, sets: orderSets([[12, 25, 47, 83], [19, 31, 56, 90], [8, 18, 80, 88], [33, 43, 53, 63, 73]]) },
      ch(mix(G.bigger(20, 100), M.place(40, 99)))),
    lesson('m5-6', 'Two-step problems', 'calc',
      [card('Some stories have two steps. First add, then take away.', sum(5, '+', 3, '−', 2, '=', '?')),
        card('Five and three make eight. Eight take away two is six.', sum(8, '−', 2, '=', 6))],
      ch(M.story(['two'], 15)),
      ch(M.story(['more'], 20)),
      ch(M.story(['two', 'add', 'take'], 20))),
    lesson('m5-7', 'Number puzzles', 'pattern',
      [card('Counting back in twos: ten, eight, six, four.', '<span class="pattern">' + [10, 8, 6, 4].map(n => `<i class="num">${n}</i>`).join('') + '</span>'),
        card('Find the jump, then find the missing number.', '<span class="pattern"><i class="num">5</i><i class="num">10</i><i class="q">?</i><i class="num">20</i></span>')],
      ch(M.gap([2, 3, 5], 40, true)),
      { type: 'order', pick: 2, sets: orderSets([[3, 6, 9, 12], [4, 8, 12, 16], [10, 15, 20, 25, 30]], 'Put them in order. Count up!') },
      ch(M.gap([2, 3, 5, 10], 80, true))),
    lesson('m5-8', 'Tally marks', 'data',
      [card('A tally mark is one line for each thing.', tally(3)), card('The fifth line goes across. Every bundle is five!', tally(5)),
        card('Two bundles and two more: twelve.', tally(12))],
      ch(M.tally(3, 12)),
      ch(M.graph(['more'], true)),
      ch(mix(M.tally(6, 18), M.graph(['most', 'more'], true)))),
    review('m5-r', mix(M.tens(3), M.groups([2, 5, 10], 4), M.share(), M.part([2, 4]), G.bigger(20, 100), M.story(['two'], 15), M.gap([2, 5, 10], 60, true), M.tally(4, 15)),
      { type: 'memory', n: 4, pairs: sumPairs([[10, 10], [20, 20], [30, 30], [40, 10], [25, 25]], '+') })
  ];

  AF.register({
    id: 'math', area: 'stem', core: 2,
    title: 'Math', icon: '🔢', colour: '#36D6B5',
    blurb: 'Six areas, five levels',
    note: 'Story, real life, play, quiz',
    skill: 'Numbers, calculation, shapes, measuring, patterns and data',
    tip: 'Count real things together: stairs, spoons, socks. Ask “how many more?” at the table.',
    stages: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    stageCrumbs: ['First ideas (3–4)', 'Ready for school (4–5)', 'Sums with numbers (5–6)', 'Solving problems (6–7)', 'Bigger sums (7+)'],
    topics: { number: 'Numbers', calc: 'Calculation', shape: 'Shapes & space', measure: 'Measuring & time', pattern: 'Patterns', data: 'Sorting & data' },
    levels: AF.tiers(level1, level2, level3, level4, level5)
  });
})(window.AF = window.AF || {});
