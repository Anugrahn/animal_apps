/* ============================================================
   art.js — real 3D characters
   ------------------------------------------------------------
   v1 faked 3D with SVG gradients. v2 builds every character from
   actual geometry (three.js, bundled in vendor/) with a soft clay
   material and studio lighting, then SNAPSHOTS it to an image.

   Why snapshots: a phone will not give a page a dozen WebGL
   contexts. So one hidden renderer draws each character + pose
   once, the result is cached as a PNG, and every screen just shows
   an <img>. Only the character maker runs a live, spinnable view.

   A character is plain data, so the child can build anything:
     { name, species, colour, hat, wear, item, voice }

   If WebGL is missing the app still works: characters fall back
   to a flat coloured badge.
   ============================================================ */
(function (AF) {
  'use strict';

  const T = window.THREE;

  /* ---------- the menu the child chooses from ---------- */

  const SPECIES = {
    dino:    { label: 'Dino',    emoji: '🦖', colour: '#86D24C', cheer: 'Roar!' },
    bear:    { label: 'Bear',    emoji: '🐻', colour: '#C98A55', cheer: 'Lovely!' },
    rabbit:  { label: 'Rabbit',  emoji: '🐰', colour: '#F4EEE6', cheer: 'Yay!' },
    cat:     { label: 'Cat',     emoji: '🐱', colour: '#FFB45E', cheer: 'Purr-fect!' },
    puppy:   { label: 'Puppy',   emoji: '🐶', colour: '#E9C79A', cheer: 'Woof woof!' },
    panda:   { label: 'Panda',   emoji: '🐼', colour: '#FFFFFF', cheer: 'Hooray!' },
    fox:     { label: 'Fox',     emoji: '🦊', colour: '#FF8A4C', cheer: 'Fantastic!' },
    lion:    { label: 'Lion',    emoji: '🦁', colour: '#FFC75A', cheer: 'Roar!' },
    frog:    { label: 'Frog',    emoji: '🐸', colour: '#8EDB5A', cheer: 'Ribbit!' },
    penguin: { label: 'Penguin', emoji: '🐧', colour: '#4A5A86', cheer: 'Cool!' },
    chick:   { label: 'Chick',   emoji: '🐥', colour: '#FFD84A', cheer: 'Cheep cheep!' }
  };

  const COLOURS = [
    '#7FD08A', '#8EDB5A', '#36D6B5', '#4CC3FF', '#4A5A86', '#9B7BFF',
    '#FF7AB6', '#FF6B6B', '#FF8A4C', '#FFC75A', '#FFD84A', '#C98A55',
    '#8E5A2A', '#F4EEE6', '#FFFFFF', '#9AA3B5'
  ];

  /* Hats, things to wear and things to hold: each one is a painted
     picture in art/wear/ that is laid over the friend (see PAINTED below). */
  const HATS = [
    { id: 'none', emoji: '🚫', label: 'No hat' },
    { id: 'crown', emoji: '👑', label: 'Crown' },
    { id: 'cap', emoji: '🧢', label: 'Cap' },
    { id: 'tophat', emoji: '🎩', label: 'Top hat' },
    { id: 'bow', emoji: '🎀', label: 'Bow' },
    { id: 'explorer', emoji: '🧭', label: 'Explorer hat' }
  ];
  const WEARS = [
    { id: 'none', emoji: '🚫', label: 'Nothing' },
    { id: 'glasses', emoji: '👓', label: 'Glasses' },
    { id: 'sunglasses', emoji: '🕶️', label: 'Sunglasses' },
    { id: 'heartglasses', emoji: '💗', label: 'Heart glasses' },
    { id: 'scarf', emoji: '🧣', label: 'Scarf' },
    { id: 'bandana', emoji: '🔴', label: 'Bandana' },
    { id: 'bowtie', emoji: '🎀', label: 'Bow tie' }
  ];
  const ITEMS = [
    { id: 'none', emoji: '👋', label: 'Wave' },
    { id: 'heart', emoji: '💗', label: 'Heart' },
    { id: 'star', emoji: '⭐', label: 'Star' },
    { id: 'balloon', emoji: '🎈', label: 'Balloon' },
    { id: 'apple', emoji: '🍎', label: 'Apple' },
    { id: 'book', emoji: '📖', label: 'Book' },
    { id: 'wand', emoji: '🪄', label: 'Wand' },
    { id: 'gamepad', emoji: '🎮', label: 'Game' },
    { id: 'backpack', emoji: '🎒', label: 'Backpack' }
  ];
  const VOICES = [
    { id: 'low', emoji: '🐻', label: 'Deep', pitch: 0.72, rate: 0.82 },
    { id: 'mid', emoji: '🙂', label: 'Middle', pitch: 1.0, rate: 0.85 },
    { id: 'high', emoji: '🐭', label: 'Squeaky', pitch: 1.3, rate: 0.95 }
  ];

  /* Ready-made friends. The first three are the v1 cast. */
  const PRESETS = [
    { name: 'Rex',     species: 'dino',    tag: 'The Little Dino',     voice: 'low' },
    { name: 'Mochi',   species: 'bear',    tag: 'Your Huggable Bear',  voice: 'mid' },
    { name: 'Pip',     species: 'rabbit',  tag: 'Your Playful Rabbit', voice: 'high' },
    { name: 'Luna',    species: 'cat',     tag: 'The Curious Cat',     voice: 'high' },
    { name: 'Bao',     species: 'panda',   tag: 'The Gentle Panda',    voice: 'mid' },
    { name: 'Finn',    species: 'fox',     tag: 'The Clever Fox',      voice: 'mid' },
    { name: 'Biscuit', species: 'puppy',   tag: 'The Happy Puppy',     voice: 'mid' },
    { name: 'Leo',     species: 'lion',    tag: 'The Brave Lion',      voice: 'low' },
    { name: 'Hop',     species: 'frog',    tag: 'The Jumpy Frog',      voice: 'high' },
    { name: 'Waddle',  species: 'penguin', tag: 'The Cool Penguin',    voice: 'mid' },
    { name: 'Sunny',   species: 'chick',   tag: 'The Sunny Chick',     voice: 'high' }
  ];

  const V1 = { dino: 0, bear: 1, rabbit: 2 };      // v1 saved a bare id

  function normalise(spec) {
    if (typeof spec === 'string') spec = PRESETS[V1[spec] || 0];
    spec = spec || PRESETS[2];
    const sp = SPECIES[spec.species] ? spec.species : 'rabbit';
    return {
      name: (spec.name || SPECIES[sp].label).slice(0, 12),
      species: sp,
      colour: spec.colour || SPECIES[sp].colour,
      // a saved choice that no longer exists falls back to none
      hat: HATS.some(h => h.id === spec.hat) ? spec.hat : 'none',
      wear: WEARS.some(h => h.id === spec.wear) ? spec.wear : 'none',
      item: ITEMS.some(h => h.id === spec.item) ? spec.item : 'none',
      voice: spec.voice || 'mid',
      tag: spec.tag || ''
    };
  }

  /* ---------- colour helpers ---------- */

  function rgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    const A = rgb(a), B = rgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function luma(hex) { const c = rgb(hex); return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 255000; }

  /* ============================================================
     3D
     ============================================================ */

  const HR = 0.58;                 // head radius
  const HEAD_Y = 1.36;
  let G = null;                    // shared geometries
  const MATS = {};
  let webglOK = !!T;

  function geos() {
    if (G) return G;
    const heart = new T.Shape();
    heart.moveTo(0, -0.5);
    heart.bezierCurveTo(-0.95, 0.1, -0.5, 0.78, 0, 0.3);
    heart.bezierCurveTo(0.5, 0.78, 0.95, 0.1, 0, -0.5);
    const star = new T.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.26 : 0.56, a = Math.PI / 2 + i * Math.PI / 5;
      star[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r);
    }
    star.closePath();
    const puff = { depth: 0.12, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6, curveSegments: 18 };
    G = {
      ball: new T.SphereGeometry(1, 40, 28),
      cone: new T.ConeGeometry(1, 1, 28),
      cyl: new T.CylinderGeometry(1, 1, 1, 32),
      heart: new T.ExtrudeGeometry(heart, puff).center(),
      star: new T.ExtrudeGeometry(star, puff).center()
    };
    return G;
  }

  function mat(colour, opacity) {
    const key = colour + '|' + (opacity || 1);
    if (!MATS[key]) {
      MATS[key] = new T.MeshStandardMaterial({
        color: new T.Color(colour).convertSRGBToLinear(), roughness: 0.6, metalness: 0,
        transparent: opacity != null && opacity < 1, opacity: opacity == null ? 1 : opacity
      });
    }
    return MATS[key];
  }

  /* z of an ellipsoid surface at (x, y) — used to sit eyes, noses
     and smiles ON a face instead of floating in front of it. */
  function surfZ(x, y, s) {
    const u = (x - s.c[0]) / s.r[0], v = (y - s.c[1]) / s.r[1];
    return s.c[2] + s.r[2] * Math.sqrt(Math.max(0.02, 1 - u * u - v * v));
  }

  /** Builds one character as a THREE.Group. Feet rest on y = 0. */
  function build(spec, pose) {
    geos();
    spec = normalise(spec);
    const kind = spec.species;
    const base = spec.colour;
    const pale = luma(base) > 0.82;
    const C = {
      base: base,
      light: pale ? mix(base, '#ffffff', 0.5) : mix(base, '#ffffff', 0.62),
      dark: mix(base, '#2B1B5E', pale ? 0.16 : 0.34),
      foot: mix(base, '#2B1B5E', pale ? 0.07 : 0.12),
      pink: '#FF9DB5', ink: '#2A2440', white: '#FFFFFF', orange: '#FFA53C', gold: '#FFC93C'
    };
    const cheer = pose === 'cheer';
    const root = new T.Group();
    const head = new T.Group();
    head.position.set(0, HEAD_Y, 0.03);
    root.add(head);

    const V = (a) => new T.Vector3(a[0], a[1], a[2]);
    function add(geo, colour, p, s, parent, opacity) {
      const m = new T.Mesh(geo, mat(colour, opacity));
      m.position.set(p[0], p[1], p[2]);
      if (typeof s === 'number') m.scale.setScalar(s); else m.scale.set(s[0], s[1], s[2]);
      m.castShadow = opacity == null;
      m.receiveShadow = true;
      (parent || root).add(m);
      return m;
    }
    const ball = (colour, p, s, parent, op) => add(G.ball, colour, p, s, parent, op);
    const cone = (colour, p, s, parent) => add(G.cone, colour, p, s, parent);
    const cyl = (colour, p, s, parent) => add(G.cyl, colour, p, s, parent);
    /* Points a cone/cylinder (which grow along +y) in a direction. */
    function aim(m, dir) {
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), V(dir).normalize());
      return m;
    }
    /* Turns a flat thing (facing +z) to lie on a face surface. */
    function face(m, x, y, s) {
      const n = new T.Vector3((x - s.c[0]) / (s.r[0] * s.r[0]), (y - s.c[1]) / (s.r[1] * s.r[1]),
        (surfZ(x, y, s) - s.c[2]) / (s.r[2] * s.r[2])).normalize();
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), n);
      return m;
    }
    function tube(colour, pts, r, parent) {
      const curve = new T.CatmullRomCurve3(pts.map(V));
      const m = new T.Mesh(new T.TubeGeometry(curve, 24, r, 10, false), mat(colour));
      m.castShadow = true;
      (parent || root).add(m);
      ball(colour, pts[0], r, parent);
      ball(colour, pts[pts.length - 1], r, parent);
      return m;
    }

    /* ---- per-species look. Each returns what the shared face
       code needs: where the eyes and mouth sit. ---- */
    const headSurf = { c: [0, 0, 0], r: [HR, HR, HR] };
    const look = {
      eyes: [0.21, 0.07], eyeSurf: headSurf, eyeSize: 1,
      mouth: [-0.17, 0.085], mouthSurf: headSurf, smile: true,
      arm: C.base, foot: C.foot, belly: C.light, armScale: [0.125, 0.25, 0.125], tailDone: false
    };

    function roundEars(colour, inner) {
      [-1, 1].forEach(s => {
        ball(colour, [s * 0.41, 0.43, -0.02], 0.19, head);
        ball(inner, [s * 0.41, 0.43, 0.1], [0.11, 0.11, 0.07], head);
      });
    }
    function pointEars(colour, size) {
      [-1, 1].forEach(s => {
        const g = new T.Group();
        g.position.set(s * 0.34, 0.4, 0);
        g.rotation.z = -s * 0.42;
        head.add(g);
        cone(colour, [0, 0.16, 0], [0.2 * size, 0.38 * size, 0.14 * size], g);
        cone(C.pink, [0, 0.13, 0.05], [0.12 * size, 0.25 * size, 0.08 * size], g);
      });
    }
    function muzzle(colour, w, h, d, y) {
      const s = { c: [0, y, 0.44], r: [w, h, d] };
      ball(colour, s.c, s.r, head);
      look.mouthSurf = s;
      look.mouth = [y - h * 0.42, w * 0.38];
      return s;
    }
    function nose(colour, y, s, size) {
      face(ball(colour, [0, y, surfZ(0, y, s) + 0.012], [0.07 * size, 0.05 * size, 0.035 * size], head), 0, y, s);
    }
    function ballTail(colours, sizes, pts) {
      pts.forEach((p, i) => ball(colours[i] || colours[0], p, sizes[i]));
    }

    const SP = {
      bear() {
        roundEars(C.base, C.pink);
        const m = muzzle(C.light, 0.22, 0.16, 0.16, -0.15);
        nose(C.ink, -0.08, m, 1);
        ball(C.base, [0, 0.36, -0.46], 0.1);
      },
      panda() {
        roundEars(C.ink, '#4A4466');
        [-1, 1].forEach(s => {
          const p = ball(C.ink, [s * 0.215, 0.05, surfZ(s * 0.215, 0.05, headSurf) - 0.012], [0.13, 0.165, 0.03], head);
          face(p, s * 0.215, 0.05, headSurf).rotateZ(s * 0.35);
        });
        const m = muzzle(C.white, 0.2, 0.15, 0.15, -0.16);
        nose(C.ink, -0.09, m, 0.9);
        look.arm = C.ink; look.foot = C.ink; look.belly = C.base;
        ball(C.ink, [0, 0.36, -0.46], 0.1);
      },
      rabbit() {
        [-1, 1].forEach(s => {
          const g = new T.Group();
          g.position.set(s * 0.2, 0.46, 0);
          g.rotation.z = -s * 0.15;
          head.add(g);
          ball(C.base, [0, 0.38, 0], [0.115, 0.4, 0.075], g);
          ball(C.pink, [0, 0.38, 0.045], [0.064, 0.31, 0.04], g);
        });
        const m = muzzle(C.light, 0.19, 0.13, 0.14, -0.14);
        nose(C.pink, -0.07, m, 0.7);
        ball(C.white, [0, -0.245, surfZ(0, -0.245, m) - 0.005], [0.04, 0.045, 0.02], head);
        ball(C.white, [0, 0.4, -0.5], 0.14);
        look.mouth = [-0.19, 0.06];
      },
      cat() {
        pointEars(C.base, 1);
        const s = { c: [0, -0.15, 0.45], r: [0.2, 0.12, 0.14] };
        [-1, 1].forEach(k => ball(C.light, [k * 0.075, -0.15, 0.47], [0.105, 0.09, 0.1], head));
        look.mouthSurf = s; look.smile = false;
        nose(C.pink, -0.085, s, 0.65);
        [-1, 1].forEach(k => [0.12, -0.12].forEach(t => {
          const w = cyl(C.ink, [k * 0.33, -0.15 + t * 0.25, 0.46], [0.006, 0.26, 0.006], head);
          w.rotation.z = Math.PI / 2 + k * t * 1.2;
          w.castShadow = false;
        }));
        tube(C.base, [[0.2, 0.22, -0.4], [0.62, 0.26, -0.36], [0.8, 0.62, -0.26], [0.68, 0.98, -0.2]], 0.07);
      },
      fox() {
        pointEars(C.base, 1.18);
        [-1, 1].forEach(k => ball(C.white, [k * 0.36, -0.2, 0.26], [0.2, 0.16, 0.15], head));
        const m = muzzle(C.white, 0.24, 0.17, 0.2, -0.16);
        nose(C.ink, -0.07, m, 0.95);
        look.belly = C.white;
        ballTail([C.base, C.base, C.base, C.white], [0.16, 0.2, 0.18, 0.13],
          [[0.48, 0.28, -0.36], [0.72, 0.48, -0.3], [0.84, 0.76, -0.25], [0.86, 1.0, -0.22]]);
      },
      puppy() {
        [-1, 1].forEach(s => {
          const e = ball(C.dark, [s * 0.57, 0.04, 0.02], [0.14, 0.33, 0.13], head);
          e.rotation.z = s * 0.2;
        });
        const p = ball(C.dark, [0.215, 0.07, surfZ(0.215, 0.07, headSurf) - 0.014], [0.14, 0.16, 0.03], head);
        face(p, 0.215, 0.07, headSurf);
        const m = muzzle(C.light, 0.23, 0.17, 0.18, -0.15);
        nose(C.ink, -0.07, m, 1.05);
        ball('#FF7F9B', [0, -0.3, surfZ(0, -0.3, m) + 0.02], [0.05, 0.07, 0.025], head);
        ballTail([C.dark], [0.09, 0.08, 0.07], [[0.4, 0.4, -0.38], [0.54, 0.56, -0.36], [0.6, 0.74, -0.34]]);
      },
      lion() {
        const mane = mix(base, '#8A4B12', 0.6);
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          ball(mane, [Math.cos(a) * 0.56, Math.sin(a) * 0.56, -0.12], 0.21, head);
        }
        roundEars(C.base, C.pink);
        const m = muzzle(C.light, 0.23, 0.16, 0.17, -0.15);
        nose('#7A4630', -0.08, m, 1);
        tube(C.base, [[0.2, 0.25, -0.4], [0.6, 0.3, -0.36], [0.78, 0.66, -0.28]], 0.045);
        ball(mane, [0.8, 0.76, -0.26], 0.12);
      },
      dino() {
        const s = { c: [0, -0.13, 0.33], r: [0.41, 0.28, 0.37] };
        ball(C.base, s.c, s.r, head);
        look.mouthSurf = s; look.mouth = [-0.22, 0.2];
        look.eyes = [0.2, 0.2]; look.eyeSize = 1.08;
        [-1, 1].forEach(k => ball(C.dark, [k * 0.09, 0.0, surfZ(k * 0.09, 0.0, s) - 0.004], 0.02, head));
        // a crest of soft orange spikes over the head and down the back
        const spike = '#FF8A2E';
        [-0.25, 0.2, 0.62, 1.04, 1.46].forEach((a, i) => {
          const d = [0, Math.cos(a), -Math.sin(a)];
          aim(cone(spike, [0, d[1] * (HR + 0.07), d[2] * (HR + 0.07)], [0.18 - i * 0.01, 0.38, 0.12], head), d);
        });
        [0.98, 0.72, 0.46].forEach(y => aim(cone(spike, [0, y, -0.46], [0.12, 0.24, 0.09]), [0, 0.3, -1]));
        aim(cone(C.base, [0.3, 0.3, -0.52], [0.25, 0.9, 0.23]), [0.75, 0.12, -0.7]);
        aim(cone(spike, [0.56, 0.36, -0.9], [0.09, 0.2, 0.07]), [0.6, 0.6, -0.5]);
        // friendly brows and an open, happy mouth
        [-1, 1].forEach(k => {
          const x = k * 0.2, y = 0.36;
          face(cyl(C.dark, [x, y, surfZ(x, y, headSurf) + 0.004], [0.02, 0.06, 0.012], head), x, y, headSurf).rotateZ(Math.PI / 2 + k * 0.3);
        });
        look.open = true;
        look.armScale = [0.12, 0.21, 0.12];
      },
      frog() {
        [-1, 1].forEach(k => {
          ball(C.base, [k * 0.27, 0.46, 0.1], 0.2, head);
          ball(C.white, [k * 0.27, 0.49, 0.2], [0.14, 0.14, 0.12], head);
        });
        look.eyes = [0.27, 0.49];
        look.eyeSurf = { c: [0.27, 0.49, 0.2], r: [0.14, 0.14, 0.12], perEye: true };
        look.mouth = [-0.1, 0.27];
        [-1, 1].forEach(k => ball(C.dark, [k * 0.06, 0.1, surfZ(k * 0.06, 0.1, headSurf) - 0.004], 0.016, head));
      },
      penguin() {
        const s = { c: [0, -0.05, 0.12], r: [0.47, 0.45, 0.5] };
        ball(C.white, s.c, s.r, head);
        look.eyeSurf = s; look.mouthSurf = s; look.smile = false;
        aim(cone(C.orange, [0, -0.1, surfZ(0, -0.1, s) + 0.04], [0.1, 0.19, 0.075], head), [0, -0.15, 1]);
        look.belly = C.white; look.foot = C.orange;
        look.armScale = [0.085, 0.29, 0.15];
      },
      chick() {
        look.smile = false;
        aim(cone(C.orange, [0, -0.08, surfZ(0, -0.08, headSurf) + 0.035], [0.075, 0.15, 0.06], head), [0, -0.1, 1]);
        [[0, 1, 0], [-0.5, 1, 0], [0.5, 1, 0]].forEach(d => {
          const n = V(d).normalize();
          aim(cone(C.orange, [n.x * (HR + 0.05), n.y * (HR + 0.05), 0], [0.05, 0.2, 0.05], head), d);
        });
        look.foot = C.orange;
        look.armScale = [0.08, 0.24, 0.15];
        ball(C.base, [0, 0.42, -0.45], [0.12, 0.1, 0.16]);
      }
    };
    SP[kind]();

    /* ---- body ---- */
    ball(C.base, [0, 0.62, 0], [0.5, 0.5, 0.45]);
    ball(look.belly, [0, 0.58, 0.16], [0.36, 0.38, 0.33]);
    [-1, 1].forEach(s => ball(look.foot, [s * 0.25, 0.1, 0.14], [0.19, 0.11, 0.26]));

    /* ---- head + face ---- */
    ball(C.base, [0, 0, 0], HR, head);
    const eyeAt = [];
    [-1, 1].forEach(s => {
      const x = s * look.eyes[0], y = look.eyes[1];
      const surf = look.eyeSurf.perEye
        ? { c: [s * look.eyeSurf.c[0], look.eyeSurf.c[1], look.eyeSurf.c[2]], r: look.eyeSurf.r }
        : look.eyeSurf;
      const z = surfZ(x, y, surf);
      const g = new T.Group();
      g.position.set(x, y, z - 0.012);
      face(g, x, y, surf);
      head.add(g);
      const k = look.eyeSize;
      ball(C.ink, [0, 0, 0], [0.074 * k, 0.086 * k, 0.045], g).castShadow = false;
      ball(C.white, [-0.022 * k, 0.03 * k, 0.036], 0.024 * k, g).castShadow = false;
      ball(C.white, [0.024 * k, -0.026 * k, 0.038], 0.011 * k, g).castShadow = false;
      eyeAt.push({ x: x, y: y, z: z, surf: surf });
      // cheeks
      const cx = s * 0.37, cy = -0.15;
      face(ball('#FF8E9E', [cx, cy, surfZ(cx, cy, headSurf) - 0.008], [0.1, 0.07, 0.022], head, 0.72), cx, cy, headSurf);
    });

    const mY = look.mouth[0], mW = look.mouth[1], mS = look.mouthSurf;
    if (cheer || look.open) {
      const z = surfZ(0, mY, mS);
      ball('#7A2E3A', [0, mY - 0.02, z - 0.02], [Math.min(mW, 0.12), 0.1, 0.05], head).castShadow = false;
      ball('#FF7F9B', [0, mY - 0.07, z + 0.005], [Math.min(mW, 0.12) * 0.6, 0.04, 0.03], head).castShadow = false;
    } else if (look.smile) {
      const pts = [];
      for (let i = -4; i <= 4; i++) {
        const t = i / 4, x = mW * t, y = mY + mW * 0.38 * (t * t) - 0.01;
        pts.push([x, y, surfZ(x, y, mS) + 0.006]);
      }
      tube(mix(C.dark, C.ink, 0.6), pts, 0.016, head).castShadow = false;
    }

    /* ---- arms ---- */
    const holding = spec.item !== 'none' && spec.item !== 'balloon';
    [-1, 1].forEach(s => {
      const g = new T.Group();
      g.position.set(s * 0.43, 0.92, 0.05);
      root.add(g);
      const arm = ball(look.arm, [0, -0.2, 0], look.armScale, g);
      if (cheer) { g.rotation.z = s * 2.12; g.position.x = s * 0.47; arm.scale.y *= 1.2; arm.position.y = -0.26; }
      else if (holding) { g.rotation.x = -1.05; g.rotation.z = -s * 0.55; }
      else if (s === 1 && spec.item === 'balloon') g.rotation.z = 1.9;
      else if (s === 1 && spec.item === 'none') g.rotation.z = 2.35;       // a friendly wave
      else g.rotation.z = s * 0.42;
    });

    /* ---- things to hold ---- */
    const at = cheer ? [0, 2.28, 0.1] : [0, 0.74, 0.5];
    const ITEM = {
      heart() { add(G.heart, '#FF8FA8', at, 0.36); },
      star() { add(G.star, C.gold, at, 0.36); },
      ball() {
        ball('#4CC3FF', at, 0.2);
        const r = new T.Mesh(new T.TorusGeometry(0.2, 0.03, 10, 32), mat(C.white));
        r.position.set(at[0], at[1], at[2]); r.rotation.set(1.2, 0.4, 0);
        root.add(r);
      },
      carrot() {
        const g = new T.Group();
        g.position.set(at[0] + 0.03, at[1] + 0.02, at[2]);
        g.rotation.z = -0.75;
        root.add(g);
        const c = cone(C.orange, [0, 0, 0], [0.1, 0.46, 0.1], g);
        c.rotation.z = Math.PI;
        [[-0.07, 0.3, 0], [0.07, 0.3, 0], [0, 0.34, 0]].forEach(p => ball('#58C94B', p, [0.045, 0.11, 0.04], g));
      },
      flower() {
        const g = new T.Group();
        g.position.set(at[0], at[1] + 0.12, at[2] + 0.02);
        root.add(g);
        cyl('#58C94B', [0, -0.16, -0.02], [0.02, 0.36, 0.02], g);
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          ball(C.white, [Math.cos(a) * 0.11, 0.08 + Math.sin(a) * 0.11, 0], [0.075, 0.075, 0.04], g);
        }
        ball(C.gold, [0, 0.08, 0.03], 0.07, g);
      },
      balloon() {
        const hx = cheer ? 0.72 : 0.78, hy = cheer ? 1.3 : 1.12;
        const s = cyl(C.white, [hx + 0.03, hy + 0.5, 0.05], [0.006, 0.9, 0.006]);
        s.castShadow = false;
        ball('#FF6B6B', [hx + 0.04, hy + 1.16, 0.05], [0.24, 0.28, 0.24]);
        cone('#FF6B6B', [hx + 0.04, hy + 0.87, 0.05], [0.04, 0.05, 0.04]);
      }
    };
    if (ITEM[spec.item]) ITEM[spec.item]();

    /* ---- hats ---- */
    const hat = new T.Group();
    head.add(hat);
    const HAT = {
      party() {
        hat.rotation.z = -0.24;
        cone('#FF7AB6', [0, HR + 0.2, 0], [0.2, 0.46, 0.2], hat);
        ball(C.gold, [0, HR + 0.44, 0], 0.065, hat);
        [0.1, 0.25].forEach((y, i) => {
          const r = new T.Mesh(new T.TorusGeometry(0.155 - i * 0.065, 0.016, 8, 28), mat(C.white));
          r.position.y = HR + y; r.rotation.x = Math.PI / 2;
          hat.add(r);
        });
      },
      crown() {
        cyl(C.gold, [0, HR + 0.03, 0], [0.25, 0.14, 0.25], hat);
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3 + Math.PI / 2;
          cone(C.gold, [Math.cos(a) * 0.2, HR + 0.17, Math.sin(a) * 0.2], [0.065, 0.16, 0.065], hat);
          ball(i % 2 ? '#FF6B6B' : '#4CC3FF', [Math.cos(a) * 0.2, HR + 0.26, Math.sin(a) * 0.2], 0.033, hat);
        }
      },
      cap() {
        ball('#4CC3FF', [0, 0.3, 0], [0.57, 0.37, 0.57], hat);
        ball('#2E9AD6', [0, 0.33, 0.52], [0.3, 0.04, 0.26], hat);
        ball(C.white, [0, 0.67, 0], 0.05, hat);
      },
      tophat() {
        hat.rotation.z = -0.12;
        cyl(C.ink, [0, HR - 0.02, 0], [0.37, 0.04, 0.37], hat);
        cyl(C.ink, [0, HR + 0.2, 0], [0.24, 0.42, 0.24], hat);
        cyl('#FF6B6B', [0, HR + 0.05, 0], [0.245, 0.08, 0.245], hat);
      },
      bow() {
        const g = new T.Group();
        g.position.set(0.27, 0.5, 0.14); g.rotation.z = -0.5;
        hat.add(g);
        [-1, 1].forEach(s => {
          const c = cone('#FF7AB6', [s * 0.11, 0, 0], [0.11, 0.2, 0.07], g);
          c.rotation.z = s * Math.PI / 2;
        });
        ball('#FF5B9E', [0, 0, 0.02], 0.055, g);
      },
      flower() {
        const g = new T.Group();
        g.position.set(0.3, 0.47, 0.2); g.rotation.set(-0.5, 0.5, 0);
        hat.add(g);
        for (let i = 0; i < 5; i++) {
          const a = i * Math.PI * 2 / 5;
          ball('#FF9DCB', [Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0], [0.07, 0.07, 0.035], g);
        }
        ball(C.gold, [0, 0, 0.03], 0.055, g);
      }
    };
    /* The cap the friend wears on every level map: they are the explorer. */
    HAT.explorer = function () {
      ball('#C9A46A', [0, 0.3, 0], [0.57, 0.37, 0.57], hat);
      ball('#8A6A3A', [0, 0.35, 0], [0.578, 0.055, 0.578], hat);
      ball('#A8824B', [0, 0.33, 0.5], [0.34, 0.045, 0.3], hat);
      ball('#8A6A3A', [0, 0.67, 0], 0.045, hat);
    };
    if (HAT[spec.hat]) HAT[spec.hat]();

    /* ---- things to wear ---- */
    const WEAR = {
      glasses() {
        const frame = '#E0457B';
        eyeAt.forEach(e => {
          const r = new T.Mesh(new T.TorusGeometry(0.125, 0.02, 10, 30), mat(frame));
          r.position.set(e.x, e.y, e.z + 0.05);
          face(r, e.x, e.y, e.surf);
          head.add(r);
        });
        const b = cyl(frame, [0, eyeAt[0].y, eyeAt[0].z + 0.085], [0.016, Math.max(0.04, eyeAt[1].x * 2 - 0.25), 0.016], head);
        b.rotation.z = Math.PI / 2;
      },
      scarf() {
        const r = new T.Mesh(new T.TorusGeometry(0.37, 0.095, 12, 36), mat('#FF6B6B'));
        r.position.set(0, 0.98, 0.03); r.rotation.x = Math.PI / 2; r.castShadow = true;
        root.add(r);
        const t = ball('#FF6B6B', [0.22, 0.78, 0.4], [0.085, 0.2, 0.05]);
        t.rotation.z = 0.2;
      },
      bowtie() {
        [-1, 1].forEach(s => {
          const c = cone('#FF6B6B', [s * 0.1, 0.94, 0.43], [0.09, 0.18, 0.06]);
          c.rotation.z = s * Math.PI / 2;
        });
        ball('#D94B4B', [0, 0.94, 0.45], 0.05);
      }
    };
    if (WEAR[spec.wear]) WEAR[spec.wear]();

    if (cheer) root.position.y = 0.1;
    return root;
  }

  /* ---------- a lit stage ---------- */

  function makeStage(canvas, size, withGround) {
    const renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size, false);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;

    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xffffff, 0xb8a6ff, 0.78));
    const key = new T.DirectionalLight(0xfff3e2, 0.95);
    key.position.set(-2.6, 4.6, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -2.4; key.shadow.camera.right = 2.4;
    key.shadow.camera.top = 3.4; key.shadow.camera.bottom = -1;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 14;
    key.shadow.radius = 6; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.035;
    scene.add(key);
    const fill = new T.DirectionalLight(0xd5dcff, 0.3);
    fill.position.set(3, 1.5, 3);
    scene.add(fill);
    const rim = new T.DirectionalLight(0xffffff, 0.5);
    rim.position.set(2.2, 3, -4);
    scene.add(rim);

    if (withGround) {
      const ground = new T.Mesh(new T.PlaneGeometry(8, 8), new T.ShadowMaterial({ opacity: 0.2 }));
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
    }

    const camera = new T.PerspectiveCamera(29, 1, 0.1, 50);
    camera.position.set(0, 1.7, 5.75);
    camera.lookAt(0, 1.3, 0);
    return { renderer: renderer, scene: scene, camera: camera, model: null };
  }

  function setModel(st, group) {
    if (st.model) {
      st.scene.remove(st.model);
      st.model.traverse(o => {            // shared geometries stay; one-off tubes/rings go
        if (o.geometry && !Object.keys(G).some(k => G[k] === o.geometry)) o.geometry.dispose();
      });
    }
    st.model = group;
    st.scene.add(group);
  }

  /* ---------- snapshots ---------- */

  let snap = null;
  const CACHE = {};
  const SNAP = 420;

  function keyOf(spec, pose) {
    return [spec.species, spec.colour, spec.hat, spec.wear, spec.item, pose].join('|');
  }

  function url(spec, pose) {
    spec = normalise(spec);
    pose = pose || 'idle';
    const k = keyOf(spec, pose);
    if (CACHE[k]) return CACHE[k];
    if (!webglOK) return null;
    try {
      if (!snap) snap = makeStage(document.createElement('canvas'), SNAP, false);
      const model = build(spec, pose);
      // A three-quarter view, like the mock-ups: the friend turns a little
      // towards the viewer's right, so ears, crests and tails show.
      model.rotation.y = -0.38;
      setModel(snap, model);
      snap.renderer.render(snap.scene, snap.camera);
      CACHE[k] = snap.renderer.domElement.toDataURL('image/png');
      return CACHE[k];
    } catch (e) {
      webglOK = false;
      return null;
    }
  }

  /* ============================================================
     PAINTED friends (art/char/): the look of the mock-ups.
     Each animal is one painted picture; the dino also has poses.
     Hats, glasses, scarves and things to hold are separate painted
     pictures laid on top at points measured on each animal (ANCHOR,
     in percent of a square box). A colour other than the animal's
     own is a hue shift of the same picture, so it stays painted.
     The 3D builder above is only a fallback if a picture is missing.
     ============================================================ */

  const ART = 'art/';
  /* Every animal has the same eight painted poses (art/char/<animal>-<pose>). */
  const POSES = { idle: 'idle', cheer: 'cheer', happy: 'cheer', hmm: 'think', think: 'think', talk: 'wave',
    wave: 'wave', walk: 'walk', point: 'point', sit: 'sit', explorer: 'explorer' };
  //           hat: [x, bottom y, width]  eyes: [x, y, width]  neck: [x, y, width]  hand: [x, y]
  const ANCHOR = {         // measured on each animal's standing (idle) pose
    dino:    { hat: [46, 18, 50], eyes: [45, 36, 48], neck: [44, 58, 40], hand: [74, 70] },
    bear:    { hat: [50, 18, 52], eyes: [50, 33, 42], neck: [50, 51, 40], hand: [22, 72] },
    rabbit:  { hat: [45, 32, 40], eyes: [45, 45, 32], neck: [45, 58, 28], hand: [26, 78] },
    cat:     { hat: [52, 20, 46], eyes: [52, 33, 40], neck: [52, 55, 34], hand: [29, 75] },
    puppy:   { hat: [50, 16, 46], eyes: [50, 33, 40], neck: [50, 55, 36], hand: [24, 75] },
    panda:   { hat: [50, 17, 50], eyes: [50, 33, 48], neck: [50, 53, 40], hand: [25, 73] },
    fox:     { hat: [50, 20, 42], eyes: [50, 34, 36], neck: [50, 51, 34], hand: [31, 76] },
    lion:    { hat: [51, 16, 44], eyes: [51, 36, 34], neck: [51, 56, 36], hand: [34, 74] },
    frog:    { hat: [47, 9, 46], eyes: [47, 14, 58], neck: [47, 48, 44], hand: [22, 73] },
    penguin: { hat: [50, 13, 46], eyes: [50, 34, 40], neck: [50, 57, 44], hand: [20, 74] },
    chick:   { hat: [51, 22, 44], eyes: [51, 37, 40], neck: [51, 57, 40], hand: [25, 67] }
  };

  const WEAR_ART = {
    hat: { crown: 'wear/crown', cap: 'wear/cap', tophat: 'wear/tophat', bow: 'wear/bow', explorer: 'wear/explorer' },
    wear: { glasses: 'wear/glasses', sunglasses: 'wear/sunglasses', heartglasses: 'wear/heart-glasses',
      scarf: 'wear/scarf', bandana: 'wear/bandana', bowtie: 'wear/bowtie' },
    item: { heart: 'wear/heart', star: 'ui/star', balloon: 'wear/balloon', apple: 'wear/apple', book: 'wear/book',
      wand: 'wear/wand', gamepad: 'wear/gamepad', backpack: 'wear/backpack' }
  };
  const EYES = { glasses: 1, sunglasses: 1, heartglasses: 1 };

  function hsl(hex) {
    const [r, g, b] = rgb(hex).map(v => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (!d) return [0, 0, l];
    const s = d / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, s, l];
  }
  /** A CSS filter that turns the animal's own colour into `colour`. */
  function tint(species, colour) {
    const base = SPECIES[species].colour;
    if (!colour || colour.toLowerCase() === base.toLowerCase()) return '';
    const a = hsl(base), b = hsl(colour);
    if (b[1] < 0.12) return `grayscale(1) brightness(${(0.75 + b[2] * 0.6).toFixed(2)})`;
    const sat = Math.max(0.3, Math.min(2.2, b[1] / Math.max(0.15, a[1])));
    const lit = Math.max(0.55, Math.min(1.5, 0.55 + b[2] * (0.45 / Math.max(0.2, a[2])) + 0.2));
    return `hue-rotate(${Math.round(b[0] - a[0])}deg) saturate(${sat.toFixed(2)}) brightness(${lit.toFixed(2)})`;
  }
  const plain = (spec) => spec.hat === 'none' && spec.wear === 'none' && spec.item === 'none';

  /** Which picture to show. A friend with nothing on changes pose; one
      wearing things stays in the standing pose so they fit; the explorer
      hat on its own is the painted explorer pose (with its backpack). */
  function sprite(spec, pose) {
    const sp = spec.species;
    if (spec.hat === 'explorer' && spec.wear === 'none' && spec.item === 'none') return sp + '-explorer';
    return sp + '-' + (plain(spec) ? POSES[pose] || 'idle' : 'idle');
  }

  function paintedHTML(spec, pose) {
    const a = ANCHOR[spec.species];
    const img = (src, cls, st) => `<img class="${cls}" src="${ART}${src}.webp" alt="" draggable="false" style="${st}">`;
    const box = (x, y, w, ty) => `left:${x}%;top:${y}%;width:${w}%;translate:-50% ${ty}`;
    let over = '';
    if (spec.wear !== 'none' && !EYES[spec.wear]) over += img(WEAR_ART.wear[spec.wear], 'acc', box(a.neck[0], a.neck[1], a.neck[2], '-50%'));
    if (spec.item !== 'none') {
      const big = spec.item === 'balloon' || spec.item === 'backpack';
      over += img(WEAR_ART.item[spec.item], 'acc acc-item', box(a.hand[0], a.hand[1], big ? 34 : 28, spec.item === 'balloon' ? '-88%' : '-55%'));
    }
    if (EYES[spec.wear]) over += img(WEAR_ART.wear[spec.wear], 'acc', box(a.eyes[0], a.eyes[1], a.eyes[2], '-50%'));
    if (spec.hat !== 'none' && !/-explorer$/.test(sprite(spec, pose))) over += img(WEAR_ART.hat[spec.hat], 'acc acc-hat', box(a.hat[0], a.hat[1], a.hat[2], '-92%'));
    const f = tint(spec.species, spec.colour);
    const main = img('char/' + sprite(spec, pose), 'ch-img', f ? 'filter:' + f : '')
      .replace('<img ', `<img onerror="this.outerHTML='<span class=&quot;ch-e&quot;>${SPECIES[spec.species].emoji}</span>'" `);
    return `<span class="ch ch-paint"><span class="ch-body">${main}${over}</span></span>`;
  }

  /* How a painted friend moves. Every reaction has an anticipation
     squash, a stretch on the way up, a squash on landing and a small
     overshoot back to rest — the classic animation principles that
     make a still picture feel alive. transform-origin is the feet. */
  const MOVES = {
    happy: { d: 720, k: [
      { transform: 'none' },
      { transform: 'translateY(0) scale(1.14, .84)', offset: .16, easing: 'cubic-bezier(.3, 0, .4, 1)' },
      { transform: 'translateY(-24%) scale(.9, 1.12)', offset: .46, easing: 'cubic-bezier(.5, 0, .8, .4)' },
      { transform: 'translateY(0) scale(1.14, .86)', offset: .72, easing: 'cubic-bezier(.2, .6, .4, 1)' },
      { transform: 'translateY(0) scale(.96, 1.04)', offset: .87 },
      { transform: 'none' }] },
    cheer: { d: 1400, k: [
      { transform: 'none' },
      { transform: 'scale(1.16, .82)', offset: .08 },
      { transform: 'translateY(-32%) scale(.88, 1.14) rotate(-6deg)', offset: .26, easing: 'cubic-bezier(.5, 0, .8, .4)' },
      { transform: 'scale(1.16, .84)', offset: .42 },
      { transform: 'translateY(-28%) scale(.9, 1.12) rotate(6deg)', offset: .62, easing: 'cubic-bezier(.5, 0, .8, .4)' },
      { transform: 'scale(1.14, .86)', offset: .8 },
      { transform: 'scale(.97, 1.03)', offset: .91 },
      { transform: 'none' }] },
    hmm: { d: 900, k: [
      { transform: 'none' },
      { transform: 'rotate(-10deg) translateX(-4%) scale(1.03, .97)', offset: .3, easing: 'cubic-bezier(.3, 0, .3, 1)' },
      { transform: 'rotate(7deg) translateX(3%)', offset: .62, easing: 'cubic-bezier(.3, 0, .3, 1)' },
      { transform: 'rotate(-2deg)', offset: .85 },
      { transform: 'none' }] },
    talk: { d: 760, k: [
      { transform: 'none' },
      { transform: 'scale(1.06, .94)', offset: .2 },
      { transform: 'scale(.96, 1.05) rotate(-2deg)', offset: .45 },
      { transform: 'scale(1.04, .96) rotate(2deg)', offset: .7 },
      { transform: 'none' }] }
  };
  const SHADOW = {
    happy: [{ transform: 'none' }, { transform: 'scale(1.1)', offset: .16 }, { transform: 'scale(.55)', opacity: .5, offset: .46 }, { transform: 'scale(1.1)', offset: .72 }, { transform: 'none' }],
    cheer: [{ transform: 'none' }, { transform: 'scale(.5)', opacity: .5, offset: .26 }, { transform: 'scale(1.1)', offset: .42 }, { transform: 'scale(.55)', opacity: .5, offset: .62 }, { transform: 'scale(1.1)', offset: .8 }, { transform: 'none' }]
  };

  function reactPainted(el, ch, kind) {
    const spec = el._spec, img = ch.querySelector('.ch-img');
    if (spec && plain(spec) && POSES[kind] && img) {
      img.src = ART + 'char/' + sprite(spec, kind) + '.webp';
      clearTimeout(el._rt);
      el._rt = setTimeout(() => { if (img.isConnected) img.src = ART + 'char/' + sprite(spec, el._pose) + '.webp'; }, kind === 'cheer' ? 1500 : 1100);
    }
    const m = MOVES[kind];
    if (!m || !ch.animate || (AF.FX && !AF.FX.motionOK())) return;
    const body = ch.querySelector('.ch-body');
    body.getAnimations().forEach(a => { if (a.id === 'react') a.cancel(); });
    body.animate(m.k, { duration: m.d, easing: 'linear' }).id = 'react';
    if (SHADOW[kind]) ch.animate(SHADOW[kind], { duration: m.d, pseudoElement: '::before' });
  }

  /* ---------- public API ---------- */

  const Art = {
    SPECIES, COLOURS, HATS, WEARS, ITEMS, VOICES, PRESETS,
    normalise, mix,

    get has3D() { return webglOK; },

    /** Voice + cheer settings for a character. */
    skin(spec) {
      spec = normalise(spec);
      const v = VOICES.filter(x => x.id === spec.voice)[0] || VOICES[1];
      return {
        name: spec.name, species: SPECIES[spec.species].label, colour: spec.colour,
        pitch: v.pitch, rate: v.rate, cheer: SPECIES[spec.species].cheer
      };
    },

    url: url,

    /** Paints a character into a host element. `spec` defaults
        to the child's own friend. */
    paint(el, spec, pose) {
      if (!el) return;
      spec = normalise(spec || AF.Profile.character);
      if (ANCHOR[spec.species]) {
        el.style.setProperty('--c', spec.colour);
        el._spec = spec; el._pose = pose || 'idle';
        el.innerHTML = paintedHTML(spec, el._pose);
        return;
      }
      const src = url(spec, pose);
      const tint = luma(spec.colour) > 0.8 ? '#CDBDF5' : spec.colour;
      el.style.setProperty('--c', tint);
      el._spec = spec;
      el.innerHTML = src
        ? `<span class="ch"><img class="ch-img" src="${src}" alt="" draggable="false"></span>`
        : `<span class="ch ch-flat"><span>${SPECIES[spec.species].emoji}</span></span>`;
    },

    /** One-shot reaction: 'happy' | 'hmm' | 'talk' | 'cheer'. */
    /** Holds a pose (walk while moving, sit, point...) until told otherwise. */
    pose(el, pose) {
      const img = el && el.querySelector('.ch-paint .ch-img');
      if (!img || !el._spec || !plain(el._spec)) return;
      el._pose = pose || 'idle';
      const src = ART + 'char/' + sprite(el._spec, el._pose) + '.webp';
      if (!img.src.endsWith(src)) img.src = src;
    },

    /** The friend's painted face, for the round avatar. */
    face(el, spec) {
      if (!el) return;
      spec = normalise(spec || AF.Profile.character);
      const f = tint(spec.species, spec.colour);
      el.innerHTML = `<img class="face-img" src="${ART}char/${spec.species}-face.webp" alt="" draggable="false" style="${f ? 'filter:' + f : ''}">`;
    },

    /** Picture of a hat, a thing to wear or hold, or an animal's face (maker tray). */
    pic(kind, id) {
      if (kind === 'species') return `${ART}char/${id}-face.webp`;
      const src = (WEAR_ART[kind] || {})[id];
      return src ? `${ART}${src}.webp` : '';
    },

    react(el, kind) {
      if (!el) return;
      const ch = el.querySelector('.ch');
      if (!ch) return;
      if (ch.classList.contains('ch-paint')) { reactPainted(el, ch, kind); return; }
      ch.classList.remove('is-happy', 'is-hmm', 'is-talk', 'is-cheer');
      void ch.offsetWidth;                        // restart the animation
      ch.classList.add('is-' + kind);
      const img = ch.querySelector('.ch-img');
      const up = (kind === 'happy' || kind === 'cheer') && img && el._spec;
      if (up) { const u = url(el._spec, 'cheer'); if (u) img.src = u; }
      clearTimeout(el._rt);
      el._rt = setTimeout(() => {
        ch.classList.remove('is-' + kind);
        if (up && img.isConnected) { const u = url(el._spec, 'idle'); if (u) img.src = u; }
      }, kind === 'cheer' ? 1500 : 1100);
    },

    /**
     * A live, spinnable 3D view for the character maker.
     * Returns { set(spec), cheer(), stop() }.
     */
    live(host, spec) {
      if (ANCHOR[normalise(spec).species]) {
        // painted: the friend breathes and sways (CSS) and hops when changed
        Art.paint(host, spec);
        const tap = () => Art.react(host, 'happy');
        host.addEventListener('pointerdown', tap);
        return {
          set(s) { Art.paint(host, s); Art.react(host, 'happy'); },
          cheer() { Art.react(host, 'cheer'); },
          stop() { host.removeEventListener('pointerdown', tap); }
        };
      }
      if (!webglOK) { Art.paint(host, spec); return { set(s) { Art.paint(host, s); }, cheer() {}, stop() {} }; }
      let st;
      const canvas = document.createElement('canvas');
      canvas.className = 'ch-live';
      try { st = makeStage(canvas, 640, true); }
      catch (e) { webglOK = false; return Art.live(host, spec); }
      host.innerHTML = '';
      host.appendChild(canvas);

      let yaw = 0, drag = null, raf = 0, hopAt = 0, pose = 'idle', cur = normalise(spec);
      const t0 = performance.now();
      setModel(st, build(cur, pose));

      const down = e => { drag = { x: e.clientX, yaw: yaw }; canvas.setPointerCapture(e.pointerId); };
      const move = e => { if (drag) yaw = drag.yaw + (e.clientX - drag.x) * 0.012; };
      const up = () => { drag = null; };
      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointercancel', up);

      function frame(now) {
        raf = requestAnimationFrame(frame);
        const t = (now - t0) / 1000;
        const m = st.model;
        m.rotation.y = yaw + (drag ? 0 : Math.sin(t * 0.55) * 0.62);   // a slow turn, side to side
        const h = Math.max(0, 1 - (now - hopAt) / 600);
        m.position.y = Math.sin(h * Math.PI) * 0.34 + (pose === 'cheer' ? 0.1 : 0);
        m.scale.y = 1 + Math.sin(t * 2.1) * 0.012;
        if (pose === 'cheer' && now - hopAt > 1100) { pose = 'idle'; setModel(st, build(cur, pose)); }
        st.renderer.render(st.scene, st.camera);
      }
      raf = requestAnimationFrame(frame);

      return {
        set(s) { cur = normalise(s); setModel(st, build(cur, pose)); hopAt = performance.now(); },
        cheer() { pose = 'cheer'; setModel(st, build(cur, pose)); hopAt = performance.now(); },
        stop() {
          cancelAnimationFrame(raf);
          setModel(st, new T.Group());
          st.renderer.dispose();
          const ext = st.renderer.getContext().getExtension('WEBGL_lose_context');
          if (ext) ext.loseContext();
        }
      };
    }
  };

  AF.Art = Art;
})(window.AF = window.AF || {});
