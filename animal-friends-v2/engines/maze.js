/* ============================================================
   engines/maze.js — walk the child's friend through a maze
   ------------------------------------------------------------
   level: { w, h, say, text, cap?, theme?, targets?: [{ e | glyph, label }],
            decoys?: [...], want?: 'apples', ordered?: true }

   The maze is a wooden board with soft clay hedges on it and a
   little house to reach. A fresh maze is made every time, so a
   replay is a new puzzle. Five ways to move, all of which a
   small child can manage:
     * tap a big coloured arrow: one step that way
     * hold an arrow down: keep walking that way
     * hold a finger on the board and lead the friend along
     * swipe on the board
     * arrow keys / WASD on a desktop

   One tap is one step, so the friend goes exactly where it is
   told. It never has to finish a walk before it will listen: an
   arrow pressed while it is still moving is remembered and taken
   at the very next square, so turning a corner is one smooth move.

   Mistakes are only ever "picked up the wrong thing". Bumping a
   wall, wandering and asking for a hint all cost nothing. Wrong
   things are only placed in dead ends, so the child is never
   forced to step on one to get through.

   With `ordered`, the things must be picked up in the order given
   (1 2 3, or c-a-t to spell a word). Reaching for a later one too
   soon just gets a reminder.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;
  const DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
  const BACK = { n: 's', s: 'n', e: 'w', w: 'e' };
  const COUNT = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
  const STEP = 150;        // ms per square

  /* What the hedges are made of. */
  const THEMES = {
    forest: ['#58B368', '#3C8C4E', '#8AD694'],
    beach:  ['#F2A65A', '#C97A30', '#FFD09A'],
    snow:   ['#7CC4F0', '#4C96CC', '#C2E8FF'],
    candy:  ['#F08AB4', '#C55C8A', '#FFC0DA'],
    night:  ['#8674E0', '#5A49B0', '#B4A6F6']
  };

  const HOUSE = '<img class="house-art" src="art/world/house.webp" alt="" draggable="false">';

  E.HOUSE = HOUSE;

  /** Depth-first maze: open[y][x] = { n, e, s, w } (true = no wall). */
  function carve(W, H) {
    const open = [], seen = [];
    for (let y = 0; y < H; y++) {
      open.push([]); seen.push([]);
      for (let x = 0; x < W; x++) { open[y].push({}); seen[y].push(false); }
    }
    const stack = [[0, 0]];
    seen[0][0] = true;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const ways = U.shuffle(Object.keys(DIRS)).filter(d => {
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        return nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx];
      });
      if (!ways.length) { stack.pop(); continue; }
      const d = ways[0], nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      open[y][x][d] = true;
      open[ny][nx][BACK[d]] = true;
      seen[ny][nx] = true;
      stack.push([nx, ny]);
    }
    return open;
  }

  E.maze = function (S) {
    const lv = S.level;
    const W = lv.w, H = lv.h;
    const open = carve(W, H);
    const exits = (x, y) => Object.keys(DIRS).filter(d => open[y][x][d]);
    const key = (x, y) => x + ',' + y;
    const goal = [W - 1, H - 1];
    const theme = THEMES[lv.theme] || THEMES.forest;

    /* ---- place things: wrong ones only in dead ends ---- */
    const items = {};
    const free = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if ((x === 0 && y === 0) || (x === goal[0] && y === goal[1])) continue;
      free.push([x, y]);
    }
    const deadEnds = U.shuffle(free.filter(c => exits(c[0], c[1]).length === 1));
    (lv.decoys || []).slice(0, Math.max(0, deadEnds.length - 1)).forEach((d, i) => {
      const c = deadEnds[i];
      items[key(c[0], c[1])] = Object.assign({ target: false }, d);
    });
    const spots = U.shuffle(free.filter(c => !items[key(c[0], c[1])] && c[0] + c[1] > 1));
    const targets = (lv.targets || []).slice(0, spots.length);
    targets.forEach((t, i) => {
      items[key(spots[i][0], spots[i][1])] = Object.assign({ target: true, n: i }, t);
    });
    const need = targets.length;

    let px = 0, py = 0, got = 0, moving = false, won = false, lastMove = Date.now();
    let lead = null;                 // the square under a finger held on the board
    let held = null;                 // the arrow (or key) being held down
    let queued = null;               // an arrow pressed while still mid-step

    /* ---- the hedges: one soft, thick line per wall ---- */
    const Q = 20;                    // drawing units per square
    let d = '';
    const seg = (x1, y1, x2, y2) => { d += `M${x1 * Q} ${y1 * Q}L${x2 * Q} ${y2 * Q}`; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = open[y][x];
      if (!o.n) seg(x, y, x + 1, y);
      if (!o.w) seg(x, y, x, y + 1);
      if (y === H - 1) seg(x, H, x + 1, H);
      if (x === W - 1) seg(W, y, W, y + 1);
    }

    /* ---- draw ---- */
    const stage = E.frame(S, { text: lv.text || U.esc(lv.say), cls: 'stage-maze' });
    const face = (it) => it.e ? it.e : `<b>${U.esc(it.glyph)}</b>`;
    let cells = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const it = items[key(x, y)];
      const inner = (x === goal[0] && y === goal[1]) ? `<span class="mz-item mz-goal">${HOUSE}</span>`
        : it ? `<span class="mz-item${it.glyph ? ' mz-tile' : ''}" style="--i:${(x + y) % 5}">${face(it)}</span>` : '';
      cells += `<div class="mz" data-k="${key(x, y)}">${inner}</div>`;
    }
    stage.innerHTML = `
      ${need ? `<div class="maze-hud">${targets.map((t, i) => `<span data-hud="${i}">${face(t)}</span>`).join('')}<span class="hud-go" data-ic="right"></span><span class="hud-house">${HOUSE}</span></div>` : ''}
      <div class="tray-wrap maze-wrap">
        <div class="tray" style="--w:${W};--h:${H};--wall:${theme[0]};--wall-d:${theme[1]};--wall-l:${theme[2]}">
          <div class="maze">
            <svg class="mz-walls" viewBox="0 0 ${W * Q} ${H * Q}" aria-hidden="true">
              <path class="wd" d="${d}"/><path class="wm" d="${d}"/><path class="wf" d="${d}"/><path class="wl" d="${d}"/><path class="wfl" d="${d}"/>
            </svg>
            ${cells}
            <div class="maze-me"><div data-me></div></div>
          </div>
        </div>
      </div>
      <div class="dpad">
        <button class="pad" data-d="n" data-ic="up" aria-label="Up"></button>
        <button class="pad" data-d="w" data-ic="back" aria-label="Left"></button>
        <button class="pad-hint" data-hint data-ic="hint" aria-label="Show me the way"></button>
        <button class="pad" data-d="e" data-ic="right" aria-label="Right"></button>
        <button class="pad" data-d="s" data-ic="down" aria-label="Down"></button>
      </div>
      <div class="stage-cap">${U.esc(lv.cap || (need ? 'Then find the house!' : 'Find the house!'))}</div>`;

    const board = stage.querySelector('.maze');
    const me = stage.querySelector('.maze-me');
    const meArt = stage.querySelector('[data-me]');
    const cellEl = (x, y) => board.querySelector(`[data-k="${key(x, y)}"]`);
    AF.Art.paint(meArt);
    me.style.transitionDuration = STEP + 'ms';       // one glide per square, no gap between squares

    function place() { me.style.transform = `translate(${px * 100}%, ${py * 100}%)`; }
    place();

    S.replay = () => E.talk(S, lv.say);
    S.later(() => { S.replay(); S.mark(); }, 320);

    function stop() {
      moving = false;
      me.classList.remove('walking');
      AF.Art.pose(meArt, 'idle');
      me.classList.add('landed');
      S.later(() => me.classList.remove('landed'), 260);
    }

    /* ---- what happens on a cell. Returns true to stop walking. ---- */
    function arrive() {
      const it = items[key(px, py)];
      if (it && !it.taken) {
        const el = cellEl(px, py).querySelector('.mz-item');
        const wobble = () => { if (el) { el.classList.add('shake'); S.later(() => el.classList.remove('shake'), 500); } };
        if (it.target && lv.ordered && it.n !== got) {
          // Too soon: a reminder, never a mistake.
          wobble();
          AF.Audio.SFX.bump();
          AF.Audio.say(`Find ${targets[got].say || targets[got].label} first.`);
          const hud = stage.querySelector(`[data-hud="${got}"]`);
          if (hud) { hud.classList.add('shake'); S.later(() => hud.classList.remove('shake'), 500); }
        } else if (it.target) {
          it.taken = true;
          got++;
          const hud = stage.querySelector(`[data-hud="${lv.ordered ? it.n : got - 1}"]`);
          if (el) {
            AF.FX.sparkleAt(el, 12);
            // it hops up into the row of things to find
            if (hud) AF.FX.send(el, hud, () => { el.remove(); hud.classList.add('got'); }, 420);
            else el.remove();
          }
          AF.Audio.SFX.right();
          AF.Art.react(meArt, 'happy');
          AF.Audio.say(lv.ordered ? `${it.label}!` : need > 1 ? `${COUNT[got] || got}!` : `${it.label}!`);
          if (got === need) S.after(() => { if (!won) AF.Audio.say(lv.done || 'Now go home!'); }, 1100);
        } else {
          if (!it.hit) { it.hit = true; S.miss(); }
          AF.Audio.SFX.wrong();
          AF.Art.react(S.charEl, 'hmm');
          wobble();
          AF.Audio.say(`That is ${it.say || U.a(it.label)}. ${lv.want ? 'Find the ' + lv.want + '.' : 'Not that one.'}`);
        }
        return true;
      }
      if (px === goal[0] && py === goal[1]) {
        if (got < need) {
          AF.Audio.say(lv.want ? `Find the ${lv.want} first!` : 'Find them all first!');
          const hud = stage.querySelector('.maze-hud');
          if (hud) { hud.classList.add('shake'); S.later(() => hud.classList.remove('shake'), 500); }
          return true;
        }
        won = true;
        lead = null; held = null; queued = null;
        S.lap();
        AF.Audio.SFX.win();
        me.classList.add('home');
        AF.Art.react(meArt, 'cheer');
        AF.FX.sparkleAt(me, 20);
        const house = stage.querySelector('.mz-goal');
        if (house) house.classList.add('won');
        S.later(() => S.done(), 1500);
        return true;
      }
      return false;
    }

    /* One square. When it lands, the friend takes whatever was asked
       for meanwhile — a queued arrow first, then an arrow still held
       down, then a finger on the board — without stopping in between. */
    function step(dir) {
      px += DIRS[dir][0]; py += DIRS[dir][1];
      lastMove = Date.now();
      if (dir === 'w') me.classList.add('face-w'); else if (dir === 'e') me.classList.remove('face-w');
      me.classList.add('walking');
      AF.Art.pose(meArt, 'walk');
      const r = me.getBoundingClientRect();
      AF.FX.puff(r.left + r.width / 2, r.bottom - r.height * 0.12);
      place();
      AF.Audio.SFX.step();
      S.later(() => {
        const want = queued;
        queued = null;
        if (arrive()) { stop(); return; }
        const next = (want && open[py][px][want]) ? want
          : (held && open[py][px][held]) ? held
          : towards();
        if (next) step(next); else stop();
      }, STEP);
    }

    function go(dir, quiet) {
      if (won) return;
      if (moving) { queued = dir; return; }       // remembered for the next square
      clearTrail();
      if (!open[py][px][dir]) {
        if (quiet) return;
        AF.Audio.SFX.bump();
        me.classList.remove('bump-n', 'bump-e', 'bump-s', 'bump-w');
        void me.offsetWidth;
        me.classList.add('bump-' + dir);
        return;
      }
      moving = true;
      step(dir);
    }

    /** The way towards a finger held on the board, if there is one open. */
    function towards() {
      if (!lead) return null;
      const dx = lead.x - px, dy = lead.y - py;
      if (!dx && !dy) return null;
      const hor = dx > 0 ? 'e' : 'w', ver = dy > 0 ? 's' : 'n';
      const order = Math.abs(dx) >= Math.abs(dy) ? [dx ? hor : null, dy ? ver : null] : [dy ? ver : null, dx ? hor : null];
      // Following a finger never walks onto a wrong thing by itself: only
      // a finger on that very square (or an arrow) goes there.
      const wrongAt = (d) => {
        const x = px + DIRS[d][0], y = py + DIRS[d][1], it = items[key(x, y)];
        return !!(it && !it.target && !it.taken && !it.hit) && !(lead.x === x && lead.y === y);
      };
      return order.filter(x => x && open[py][px][x] && !wrongAt(x))[0] || null;
    }

    function chase() {
      if (moving || won) return;
      const dir = towards();
      if (dir) go(dir, true);
    }

    /* ---- show me the way (free — a hint is help, not a mistake) ---- */
    function clearTrail() { board.querySelectorAll('.trail').forEach(c => c.classList.remove('trail')); }

    function hint() {
      if (won) return;
      const wanted = (x, y) => {
        const it = items[key(x, y)];
        if (got < need) return !!(it && it.target && !it.taken && (!lv.ordered || it.n === got));
        return x === goal[0] && y === goal[1];
      };
      // A thing that may not be picked up yet is a wall for now.
      const blocked = (x, y) => {
        const it = items[key(x, y)];
        return !!(lv.ordered && it && it.target && !it.taken && it.n !== got);
      };
      const from = {}, queue = [[px, py]];
      from[key(px, py)] = null;
      let end = null;
      const search = (strict) => {
        while (queue.length && !end) {
          const [x, y] = queue.shift();
          if (wanted(x, y)) { end = [x, y]; break; }
          exits(x, y).forEach(dir => {
            const nx = x + DIRS[dir][0], ny = y + DIRS[dir][1];
            if (key(nx, ny) in from || (strict && blocked(nx, ny))) return;
            from[key(nx, ny)] = [x, y];
            queue.push([nx, ny]);
          });
        }
      };
      search(true);
      if (!end) {                                   // the only way is past a later one
        Object.keys(from).forEach(k => delete from[k]);
        from[key(px, py)] = null; queue.length = 0; queue.push([px, py]);
        search(false);
      }
      if (!end) return;
      const path = [];
      for (let c = end; c; c = from[key(c[0], c[1])]) path.unshift(c);
      clearTrail();
      path.slice(1, 6).forEach((c, i) => {
        const el = cellEl(c[0], c[1]);
        el.style.setProperty('--i', i);
        el.classList.add('trail');
      });
      clearTimeout(trailTimer);                     // a newer hint keeps its full time
      trailTimer = S.later(clearTrail, 3200);
    }
    let trailTimer = 0;

    /* ---- input ---- */
    /* An arrow: press = one step now; keep it down = keep walking. */
    stage.querySelectorAll('[data-d]').forEach(b => {
      let pressed = false;
      const up = () => { if (held === b.dataset.d) held = null; };
      b.addEventListener('pointerdown', () => { pressed = true; held = b.dataset.d; go(b.dataset.d); });
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('pointerleave', up);
      // (a click with no press before it comes from a keyboard or a switch)
      b.addEventListener('click', () => { if (pressed) { pressed = false; return; } go(b.dataset.d); });
    });
    stage.querySelector('[data-hint]').addEventListener('click', () => { AF.Audio.SFX.tap(); lastMove = Date.now(); hint(); });

    S.on(document, 'keydown', (e) => {
      const map = { ArrowUp: 'n', ArrowDown: 's', ArrowLeft: 'w', ArrowRight: 'e', w: 'n', s: 's', a: 'w', d: 'e' };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      held = dir;
      if (!e.repeat) go(dir);
    });
    S.on(document, 'keyup', (e) => {
      const map = { ArrowUp: 'n', ArrowDown: 's', ArrowLeft: 'w', ArrowRight: 'e', w: 'n', s: 's', a: 'w', d: 'e' };
      if (map[e.key] === held) held = null;
    });

    const square = (e) => {
      const r = board.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(W - 1, Math.floor((e.clientX - r.left) / (r.width / W)))),
        y: Math.max(0, Math.min(H - 1, Math.floor((e.clientY - r.top) / (r.height / H))))
      };
    };
    let down = null;
    // Only the first finger leads; a resting palm or second finger is ignored.
    board.addEventListener('pointerdown', (e) => {
      if (down) return;
      down = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      lead = square(e);
      chase();
    });
    board.addEventListener('pointermove', (e) => {
      if (!down || e.pointerId !== down.id) return;
      lead = square(e);
      chase();
    });
    const lift = (e) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y, quick = Date.now() - down.t < 350;
      down = null;
      lead = null;
      // A quick flick is a swipe: one move that way.
      if (quick && e.type === 'pointerup' && (Math.abs(dx) > 24 || Math.abs(dy) > 24))
        go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'e' : 'w') : (dy > 0 ? 's' : 'n'));
    };
    board.addEventListener('pointerup', lift);
    board.addEventListener('pointercancel', lift);
    board.addEventListener('lostpointercapture', lift);

    /* Adaptive help: on a level the child keeps retrying, the way
       lights up by itself after a pause. */
    (function idle() {
      S.later(() => {
        if (S.api.help >= 1 && !won && Date.now() - lastMove > 9000) { lastMove = Date.now(); hint(); }
        idle();
      }, 3000);
    })();
  };
})(window.AF = window.AF || {});
