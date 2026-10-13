/* ============================================================
   engines/code.js — first coding: plan the walk, then press Go
   ------------------------------------------------------------
   level: { grid: ['S..', '.#.', '..G'], say, text, preview? }
     S start   G the house   # a rock   * a star to collect   . grass

   The child lines up arrows — a little program — and only then
   presses Go to watch the friend follow it. Thinking the whole
   way through before acting is the heart of coding, and it needs
   no reading at all.

   A program that walks into a rock or stops short is not a
   failure: the friend comes back, the arrows stay, and the child
   mends the plan. That is debugging. Each run that does not get
   home counts as one "mistake" for the stars; hints are free.

   With `preview` (the first few levels) footprints show where
   the plan leads while it is being built.
   ============================================================ */
(function (AF) {
  'use strict';

  const U = AF.U;
  const E = AF.Engines;
  const DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
  const ICON = { n: 'up', e: 'right', s: 'down', w: 'back' };
  const WORD = { n: 'up', e: 'right', s: 'down', w: 'left' };
  const HUE = { n: '#3E9BF0', w: '#58B368', s: '#EE5B5B', e: '#F5B81C' };
  const STEP = 420;

  E.code = function (S) {
    const lv = S.level;
    const rows = lv.grid, H = rows.length, W = rows[0].length;
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? '#' : rows[y][x];
    const key = (x, y) => x + ',' + y;
    let start = [0, 0], goal = [0, 0];
    const stars = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (rows[y][x] === 'S') start = [x, y];
      if (rows[y][x] === 'G') goal = [x, y];
      if (rows[y][x] === '*') stars.push(key(x, y));
    }
    const ALL = (1 << stars.length) - 1;

    /** Shortest list of moves from a state to the house with every star. */
    function solve(x0, y0, mask0) {
      const id = (x, y, m) => x + ',' + y + ',' + m;
      const seen = {}, queue = [[x0, y0, mask0, []]];
      seen[id(x0, y0, mask0)] = true;
      while (queue.length) {
        const [x, y, m, path] = queue.shift();
        if (x === goal[0] && y === goal[1] && m === ALL) return path;
        for (const d of Object.keys(DIRS)) {
          const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
          if (at(nx, ny) === '#') continue;
          const si = stars.indexOf(key(nx, ny));
          const nm = si >= 0 ? m | (1 << si) : m;
          if (seen[id(nx, ny, nm)]) continue;
          seen[id(nx, ny, nm)] = true;
          queue.push([nx, ny, nm, path.concat(d)]);
        }
      }
      return [];
    }
    const best = solve(start[0], start[1], 0);
    const MAX = Math.max(best.length, Math.min(18, best.length + 3));

    let prog = [], running = false, won = false, fails = 0;

    /** Where a program leads: { x, y, mask, crash: index | -1, trail } */
    function walk(list) {
      let x = start[0], y = start[1], mask = 0;
      const trail = [];
      for (let i = 0; i < list.length; i++) {
        const nx = x + DIRS[list[i]][0], ny = y + DIRS[list[i]][1];
        if (at(nx, ny) === '#') return { x: x, y: y, mask: mask, crash: i, trail: trail };
        x = nx; y = ny;
        const si = stars.indexOf(key(x, y));
        if (si >= 0) mask |= 1 << si;
        trail.push([x, y]);
      }
      return { x: x, y: y, mask: mask, crash: -1, trail: trail };
    }

    const stage = E.frame(S, { text: lv.text || U.esc(lv.say), cls: 'stage-code' });
    let cells = '';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = rows[y][x];
      cells += `<div class="cd${c === '#' ? ' rock' : ''}" data-k="${key(x, y)}" style="--i:${(x * 3 + y * 5) % 4}">${
        c === 'G' ? `<span class="cd-goal">${E.HOUSE}</span>` : c === '*' ? '<span class="cd-star" data-ic="star"></span>' : ''}</div>`;
    }
    stage.innerHTML = `
      <div class="tray-wrap">
        <div class="tray" style="--w:${W};--h:${H}">
          <div class="code-grid">${cells}<div class="code-me"><div data-me></div></div></div>
        </div>
      </div>
      <div class="code-strip">
        <div class="code-prog" aria-label="Your plan"></div>
        <button class="code-go" data-go aria-label="Go"><i data-ic="play"></i><span>Go</span></button>
      </div>
      <div class="code-pad">
        <button class="pad" data-d="w" data-ic="back" aria-label="Left"></button>
        <button class="pad" data-d="n" data-ic="up" aria-label="Up"></button>
        <button class="pad" data-d="s" data-ic="down" aria-label="Down"></button>
        <button class="pad" data-d="e" data-ic="right" aria-label="Right"></button>
        <button class="pad pad-undo" data-undo data-ic="retry" aria-label="Take one away"></button>
        <button class="pad-hint" data-hint data-ic="hint" aria-label="Help me"></button>
      </div>`;

    const grid = stage.querySelector('.code-grid');
    const me = stage.querySelector('.code-me');
    const meArt = stage.querySelector('[data-me]');
    const progEl = stage.querySelector('.code-prog');
    const cell = (x, y) => grid.querySelector(`[data-k="${key(x, y)}"]`);
    AF.Art.paint(meArt);
    const put = (x, y) => { me.style.transform = `translate(${x * 100}%, ${y * 100}%)`; };
    put(start[0], start[1]);

    S.replay = () => E.talk(S, lv.say);
    S.later(() => { S.replay(); S.mark(); }, 320);

    const unhint = () => stage.querySelectorAll('.hintme').forEach(x => x.classList.remove('hintme'));

    function render(fresh) {
      progEl.innerHTML = Array.from({ length: MAX }, (_, i) => prog[i]
        ? `<span class="chip${fresh && i === prog.length - 1 ? ' new' : ''}" data-n="${i}" style="--h:${HUE[prog[i]]}" role="img" aria-label="Step ${i + 1}: ${WORD[prog[i]]}">${AF.Icon.svg(ICON[prog[i]])}</span>`
        : `<span class="chip empty${i === prog.length ? ' next' : ''}"></span>`).join('');
      grid.querySelectorAll('.cd.foot').forEach(c => c.classList.remove('foot'));
      if (lv.preview) walk(prog).trail.forEach(p => cell(p[0], p[1]).classList.add('foot'));
    }

    function add(d) {
      if (running || won) return;
      unhint();
      if (prog.length >= MAX) {
        AF.Audio.SFX.bump();
        progEl.classList.add('shake');
        S.later(() => progEl.classList.remove('shake'), 480);
        return;
      }
      prog.push(d);
      AF.Audio.SFX.pop();
      render(true);
    }

    function undo() {
      if (running || won || !prog.length) return;
      unhint();
      prog.pop();
      AF.Audio.SFX.flip();
      render();
    }

    function hint() {
      if (running || won) return;
      unhint();
      const w = walk(prog);
      let el;
      if (w.crash >= 0) el = stage.querySelector('[data-undo]');
      else {
        const path = solve(w.x, w.y, w.mask);
        if (path.length && prog.length >= MAX) el = stage.querySelector('[data-undo]');
        else el = path.length ? stage.querySelector(`.code-pad [data-d="${path[0]}"]`) : stage.querySelector('[data-go]');
      }
      el.classList.add('hintme');
    }

    function run() {
      if (running || won) return;
      unhint();
      if (!prog.length) { hint(); AF.Audio.SFX.tap(); return; }
      running = true;
      stage.classList.add('running');
      grid.querySelectorAll('.cd.foot').forEach(c => c.classList.remove('foot'));
      AF.Audio.SFX.tap();
      let x = start[0], y = start[1], mask = 0, i = 0;

      const fail = (why) => {
        fails++;
        S.miss();
        AF.Audio.SFX.wrong();
        AF.Art.react(S.charEl, 'hmm');
        AF.Audio.say(why);
        S.later(() => {
          put(start[0], start[1]);
          me.classList.remove('face-w');
          grid.querySelectorAll('.cd-star').forEach(s => s.classList.remove('got'));
          progEl.querySelectorAll('.chip').forEach(c => c.classList.remove('on', 'bad'));
          stage.classList.remove('running');
          running = false;
          if (fails >= 2 || S.api.help >= 1) hint();   // a nudge after a couple of tries
          render();
        }, 1300);
      };

      (function tick() {
        const chips = progEl.querySelectorAll('.chip');
        chips.forEach((c, n) => c.classList.toggle('on', n === i));
        if (i >= prog.length) {
          if (x === goal[0] && y === goal[1] && mask === ALL) {
            won = true;
            S.lap();
            AF.Audio.SFX.win();
            me.classList.add('home');
            AF.Art.react(meArt, 'cheer');
            AF.FX.sparkleAt(me, 20);
            const house = grid.querySelector('.cd-goal');
            if (house) house.classList.add('won');
            S.later(() => S.done(), 1500);
          } else if (x === goal[0] && y === goal[1]) fail('Get the stars on the way!');
          else fail('Not home yet. Add more arrows!');
          return;
        }
        const d = prog[i];
        const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
        if (d === 'w') me.classList.add('face-w'); else if (d === 'e') me.classList.remove('face-w');
        if (at(nx, ny) === '#') {
          me.classList.remove('bump-n', 'bump-e', 'bump-s', 'bump-w');
          void me.offsetWidth;
          me.classList.add('bump-' + d);
          if (chips[i]) chips[i].classList.add('bad');
          AF.Audio.SFX.bump();
          fail(nx < 0 || ny < 0 || nx >= W || ny >= H ? 'Oops! That is the edge.' : 'Oops! A rock is in the way.');
          return;
        }
        x = nx; y = ny;
        put(x, y);
        me.classList.add('walking');
        AF.Art.pose(meArt, 'walk');
        AF.Audio.SFX.step();
        const si = stars.indexOf(key(x, y));
        S.later(() => {
          me.classList.remove('walking');
          AF.Art.pose(meArt, 'idle');
          if (si >= 0 && !(mask & (1 << si))) {
            mask |= 1 << si;
            const st = cell(x, y).querySelector('.cd-star');
            if (st) { st.classList.add('got'); AF.FX.sparkleAt(st, 8); }
            AF.Audio.SFX.star(0);
          }
          i++;
          tick();
        }, STEP);
      })();
    }

    stage.querySelectorAll('.code-pad [data-d]').forEach(b => b.addEventListener('click', () => add(b.dataset.d)));
    stage.querySelector('[data-undo]').addEventListener('click', undo);
    stage.querySelector('[data-hint]').addEventListener('click', () => { AF.Audio.SFX.tap(); hint(); });
    stage.querySelector('[data-go]').addEventListener('click', run);
    // The plan itself is only to look at: its arrows are too small to tap
    // safely, and one slip used to wipe the plan. The undo pad takes
    // arrows away, one at a time.
    S.on(document, 'keydown', (e) => {
      const map = { ArrowUp: 'n', ArrowDown: 's', ArrowLeft: 'w', ArrowRight: 'e' };
      if (map[e.key]) { e.preventDefault(); add(map[e.key]); }
      else if (e.key === 'Backspace') { e.preventDefault(); undo(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(); }
    });

    render();
  };
})(window.AF = window.AF || {});
