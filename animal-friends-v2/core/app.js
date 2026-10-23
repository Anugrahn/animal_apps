/* ============================================================
   app.js — screen router and boot
   ------------------------------------------------------------
   Screens: pick (-> maker) -> home (islands) -> area -> map -> play.
   Modules never touch the router; they only ever receive a host
   element and an api object. That is what keeps them swappable.

   On top of v1 this adds what makes it feel like a learning
   platform rather than one game:
     * a character maker
     * an island world for a home screen, one island per area
     * the Daily Journey — three picks across the curriculum
     * a grown-up area: progress, time limit, speech settings
     * a how-to-play walkthrough
   ============================================================ */
(function (AF) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const P = AF.Profile, Art = AF.Art, Audio = AF.Audio;

  let current = { module: null, level: null, index: -1, area: null };
  let liveView = null;

  /* ---------- screen router ---------- */

  /* A screen change that waits for a little animation first. Only one
     can wait at a time, and going anywhere else cancels it, so a late
     timer never pulls the child back to a screen they have left. */
  let pending = 0;
  function showSoon(fn, ms) {
    clearTimeout(pending);
    pending = setTimeout(() => { pending = 0; fn(); }, ms);
  }

  function show(id) {
    clearTimeout(pending);
    // The screen being left lingers for a moment and fades back, while
    // the new one grows out of the spot that was touched (motion.css).
    document.querySelectorAll('.screen').forEach(s => {
      const was = s.classList.contains('active');
      s.classList.toggle('active', s.id === id);
      s.classList.remove('leaving');
      if (was && s.id !== id && AF.FX.motionOK()) {
        s.classList.add('leaving');
        setTimeout(() => s.classList.remove('leaving'), 250);
      }
    });
    const sc = $(id);
    if (sc) sc.querySelectorAll('.scroll').forEach(s => { s.scrollTop = 0; });
    fitSigns();
    if (id !== 'maker' && liveView) { liveView.stop(); liveView = null; }

    // The world outside changes with where you are: the open meadow
    // at home, each island's own sky inside it, an island out at sea
    // for a level map, a soft-focus meadow for the maker. Bird song stops
    // inside a game so it never competes with the voice or the mic.
    const area = current.module ? current.module.area : current.area;
    document.body.dataset.area = area || '';
    document.body.dataset.scene = { home: 'home', journey: 'home', pick: 'calm', maker: 'maker', map: 'map', area: 'isles' }[id] || area || 'calm';
    // data-scene colours the world; data-screen lays the screen out.
    document.body.dataset.screen = { map: 'subject-map', play: 'game' }[id] || id;
    // each island brings its own painted things into the corners
    const PROPS = {
      literacy: ['abc-books', 'abc-train', 'abc-pencil'], stem: ['stem-microscope', 'stem-rocket', 'stem-telescope'],
      life: ['heart-bush', 'heart-swing', 'heart-butterfly'], play: ['play-xylophone', 'play-drum', 'play-note']
    };
    const set = (id === 'area' || id === 'map' || id === 'play') && PROPS[area];
    const host = $('props');
    if (host.dataset.k !== String(set && area)) {
      host.dataset.k = String(set && area);
      host.innerHTML = set ? set.map(n => `<img src="art/prop/${n}.webp" alt="" draggable="false">`).join('') : '';
      host.onclick = (e) => {
        const img = e.target.closest('img');
        if (!img) return;
        img.classList.remove('wiggle'); void img.offsetWidth; img.classList.add('wiggle');
        Audio.SFX.pop();
      };
    }
    Audio.ambience(id === 'home' || id === 'journey' || id === 'area' || id === 'map' || id === 'pick');
  }

  /* Sheets are dialogs: while one is open, everything behind it is out
     of reach (inert), focus moves into it and comes back to where it was
     when it closes, and Escape closes it if it has a way out ([data-esc]). */
  const openSheets = [];                      // [{ el, back }], newest last
  let lastBack = null;                        // where focus came from, for a sheet that opens as another closes
  function sheet(id, open) {
    const el = $(id);
    if (open === !el.hidden) return;
    el.hidden = !open;
    if (open) {
      const title = el.querySelector('h2');
      if (title) { title.id = title.id || id + '-title'; el.setAttribute('aria-labelledby', title.id); }
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      const from = document.activeElement;
      openSheets.push({ el, back: from && from !== document.body && !from.closest('.sheet[hidden]') ? from : lastBack });
    }
    const i = open ? -1 : openSheets.findIndex(s => s.el === el);
    const gone = i >= 0 ? openSheets.splice(i, 1)[0] : null;
    const top = openSheets.length ? openSheets[openSheets.length - 1].el : null;
    document.querySelectorAll('.screen, .sheet').forEach(x => { x.inert = !!top && x !== top; });
    // Focus goes back where it was, or to the same button if the screen was drawn again meanwhile.
    if (gone) lastBack = gone.back;
    if (gone && gone.back) setTimeout(() => {
      const b = gone.back, act = b.dataset && b.dataset.act;
      const again = document.contains(b) ? b : b.id ? $(b.id) : act ? document.querySelector(`.screen.active [data-act="${act}"]`) : null;
      if (again && (!top || top.contains(again))) again.focus({ preventScroll: true });
    }, 0);
    // (after the caller has filled the sheet in)
    if (open) setTimeout(() => {
      if (el.hidden || el.contains(document.activeElement)) return;
      const first = el.querySelector('button:not([disabled]), [href], summary, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus({ preventScroll: true });
    }, 0);
  }
  document.addEventListener('keydown', (e) => {
    const top = openSheets.length && openSheets[openSheets.length - 1].el;
    const out = top && top.querySelector('[data-esc]');
    if (e.key === 'Escape' && out) { e.preventDefault(); out.click(); }
  });

  /* ============================================================
     1. character picker
     ============================================================ */

  function renderPick() {
    const host = $('pick-row');
    host.innerHTML = '';

    const make = document.createElement('button');
    make.className = 'pick-card pick-make';
    make.style.setProperty('--c', '#FFC93C');
    make.style.setProperty('--i', 0);
    make.innerHTML = `
      <span class="pick-art pick-plus"><span>✨</span></span>
      <span class="pick-name">Make my own</span>
      <span class="pick-species">Choose everything!</span>`;
    make.addEventListener('click', () => { Audio.unlock(); Audio.SFX.pop(); openMaker(null); });
    host.appendChild(make);

    Art.PRESETS.forEach((preset, i) => {
      const spec = Art.normalise(preset);
      // The card picks the friend; the pencil beside it (its own button,
      // on top of the card's corner) changes the friend first.
      const slot = document.createElement('div');
      slot.className = 'pick-slot';
      slot.style.setProperty('--i', i + 1);
      const btn = document.createElement('button');
      btn.className = 'pick-card';
      btn.innerHTML = `
        <span class="pick-art" data-art></span>
        <span class="pick-name">${spec.name}</span>
        <span class="pick-species">${spec.tag}</span>`;
      const edit = document.createElement('button');
      edit.className = 'pick-edit jelly';
      edit.dataset.ic = 'edit';
      edit.setAttribute('aria-label', `Change ${spec.name}`);
      edit.addEventListener('click', () => { Audio.unlock(); Audio.SFX.pop(); openMaker(spec); });
      const art = btn.querySelector('[data-art]');
      Art.paint(art, spec);
      slot.style.setProperty('--c', art.style.getPropertyValue('--c'));

      btn.addEventListener('click', () => {
        Audio.unlock();
        if (host.dataset.busy) return;
        host.dataset.busy = '1';
        Audio.SFX.pop();
        host.querySelectorAll('.pick-card').forEach(c => c.classList.remove('chosen'));
        btn.classList.add('chosen');
        Art.react(art, 'cheer');
        AF.FX.sparkleAt(btn, 16);
        meet(spec, 1300);
      });

      slot.append(btn, edit);
      host.appendChild(slot);
    });
    delete host.dataset.busy;
  }

  /** The chosen friend says hello, then we go home. */
  function meet(spec, wait) {
    P.chooseCharacter(spec);
    Audio.say(`Hi! I am ${spec.name}. Let's play!`);
    showSoon(() => {
      renderHome();
      show('home');
      if (!P.seenTutorial) openTutorial();
    }, wait);
  }

  /* ============================================================
     1b. character maker
     ============================================================ */

  const NAMES = ['Coco', 'Milo', 'Bubbles', 'Nori', 'Peanut', 'Zuzu', 'Tofu', 'Momo', 'Poppy', 'Ziggy',
    'Pudding', 'Kiki', 'Noodle', 'Pebble', 'Sunny', 'Lulu', 'Bean', 'Rolo', 'Maple', 'Dot'];

  /* One jelly bean per thing the child can change. */
  const TABS = [
    { key: 'species', label: 'Animal', tab: 'animal', hue: '#3E9BF0' },
    { key: 'colour',  label: 'Colour', tab: 'colour', hue: '#F2617A' },
    { key: 'hat',     label: 'Hat',    tab: 'hat', hue: '#F5B81C' },
    { key: 'wear',    label: 'Wear',   tab: 'wear', hue: '#1FB8A6' },
    { key: 'item',    label: 'Hold',   tab: 'hold', hue: '#EF5350' },
    { key: 'voice',   label: 'Voice',  tab: 'voice', hue: '#A45CE0' }
  ];

  function openMaker(from) {
    // A brand-new friend starts as a plain white bear: a blank page to make your own.
    const spec = Art.normalise(from || { species: 'bear', colour: '#F4EEE6', name: AF.U.one(NAMES) });
    spec.tag = '';
    let tab = 'species';

    show('maker');
    if (!from) Audio.say('Let’s make your friend! Tap an animal.');
    $('maker').querySelector('.hud-maker').innerHTML = AF.UI.pills();
    liveView = Art.live($('maker-live'), spec);
    const nameEl = $('maker-name');
    nameEl.value = from ? spec.name : '';
    if (!from) spec.name = AF.U.one(NAMES);

    /* What each choice looks like in the tray. Wherever it can, the
       choice is shown ON the child's own friend, so "top hat" is a
       picture of their friend in a top hat, not a word to read. */
    function chip(o) {
      const on = spec[tab] === o.id ? ' on' : '';
      let inner;
      if (tab === 'colour') inner = `<i style="background:${o.id}"></i>`;
      else if (tab === 'voice') inner = `<em>${o.emoji}</em><span>${o.label}</span>`;
      else {
        // the painted face of each animal, or the painted hat / glasses / thing itself
        const src = Art.pic(tab, o.id);
        inner = src ? `<img src="${src}" alt="" draggable="false">` : `<span class="mk-none">${AF.Icon.svg('close')}</span>`;
      }
      return `<button class="mk-chip${on}" data-id="${o.id}" aria-label="${o.label}">${inner}</button>`;
    }

    function list() {
      if (tab === 'species') return Object.keys(Art.SPECIES).map(id => ({ id: id, emoji: Art.SPECIES[id].emoji, label: Art.SPECIES[id].label }));
      if (tab === 'colour') return Art.COLOURS.map(c => ({ id: c, label: c }));
      return { hat: Art.HATS, wear: Art.WEARS, item: Art.ITEMS, voice: Art.VOICES }[tab];
    }

    function renderTabs() {
      $('maker-tabs').innerHTML = TABS.map(t => `
        <button class="bean painted${t.key === tab ? ' on' : ''}" data-tab="${t.key}" style="--h:${t.hue}" role="tab" aria-selected="${t.key === tab}">
          <img class="pic" src="art/ui/tab-${t.tab}.webp" alt="" draggable="false"><span>${t.label}</span>
        </button>`).join('');
      $('maker-tabs').querySelectorAll('.bean').forEach(b => b.onclick = () => {
        Audio.SFX.tap();
        tab = b.dataset.tab;
        renderTabs();
      });
      $('maker-opts').innerHTML = list().map(chip).join('');
      $('maker-opts').querySelectorAll('.mk-chip').forEach(b => b.onclick = () => choose(b.dataset.id));
      const on = $('maker-opts').querySelector('.on');
      if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    function choose(id) {
      Audio.SFX.pop();
      if (tab === 'species') {
        // Keep a colour the child picked; swap a default for the new animal's default.
        if (spec.colour === Art.SPECIES[spec.species].colour) spec.colour = Art.SPECIES[id].colour;
      }
      spec[tab] = id;
      if (tab === 'voice') {
        const v = Art.VOICES.filter(x => x.id === id)[0];
        Audio.say(`Hello! I am ${spec.name}.`, { pitch: v.pitch, rate: v.rate });
      } else {
        liveView.set(spec);
      }
      renderTabs();
    }

    nameEl.oninput = () => { spec.name = nameEl.value.trim() || 'Friend'; };
    $('maker-dice').onclick = () => {
      Audio.SFX.pop();
      spec.name = AF.U.one(NAMES, spec.name);
      nameEl.value = spec.name;
    };
    // Back: home if there is already a friend, otherwise the ready-made friends.
    $('maker-back').onclick = () => {
      Audio.SFX.tap();
      if (P.character) { renderHome(); show('home'); }
      else { renderPick(); show('pick'); }
    };
    $('maker-done').onclick = () => {
      Audio.unlock();
      Audio.SFX.right();
      liveView.cheer();
      AF.FX.confetti(40);
      meet(spec, 1500);
    };

    renderTabs();
  }

  /* ============================================================
     2. home
     ============================================================ */

  /** The level a child should play next in a module. */
  function nextIn(mod) {
    if (mod.soon) return null;
    const i = AF.Levels.nextIndex(mod.id, mod.levels);
    const lv = mod.levels[i];
    return lv && !lv.soon ? { mod: mod, level: lv, index: i } : null;
  }

  /* Today's Study, the way Wink plans a child's day (Danbi FAQ):
       * Monday to Friday, two of the four core subjects each day, in
         turn, so every subject comes round every other day;
       * a lesson left over from the day before comes back first, up
         to four lessons in all;
       * at the weekend nothing new: two lessons already played come
         back for review, the least sure first;
       * and one game from the extras (habits, feelings, science,
         games, stories, songs) to finish, a different area each day.
     Fixed for the day once made. */
  function todayPicks() {
    const t = P.today();
    if (!t.picks) {
      // counted in local days, like the day itself
      const d = new Date();
      const day = Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      // (`core` is each subject's place in the rotation: Phonics and Math one day, English and Bahasa the next)
      const core = AF.registry.filter(m => m.core && !m.soon).sort((a, b) => a.core - b.core);
      const picks = [];
      const has = (m) => picks.some(p => p.m === m.id);
      const add = (n, kind) => { if (n && !has(n.mod)) picks.push({ m: n.mod.id, l: n.level.id, kind: kind }); };

      if (!weekend) {
        // yesterday's lesson not done yet comes first (still the next one in its subject)
        const last = P.get().lastPlan;
        ((last && last.picks) || []).forEach(p => {
          const mod = AF.module(p.m);
          if (mod && mod.core && p.kind !== 'review' && P.stars(p.m, p.l) === 0 && picks.length < 2) add(nextIn(mod), 'new');
        });
        // two subjects a day, in turn
        const pair = day % 2;
        const order = core.slice(pair * 2).concat(core.slice(0, pair * 2));
        // (a subject carried over that is also today's counts as today's)
        let fresh = 0;
        for (const m of order) {
          if (fresh >= 2 || picks.length >= 4) break;
          if (has(m)) { fresh++; continue; }
          const n = nextIn(m);
          if (n) { add(n, 'new'); fresh++; }
        }
      } else {
        // the weekend: review what is least sure (fewest stars, then most slips)
        const played = [];
        core.forEach(m => m.levels.forEach((l, i) => {
          const s = P.stars(m.id, l.id);
          const r = P.result(m.id, l.id);
          if (s > 0 && !l.review) played.push({ mod: m, level: l, index: i, s: s, miss: r && r.n ? r.mistakes / r.n : 0 });
        }));
        played.sort((a, b) => a.s - b.s || b.miss - a.miss);
        played.forEach(x => { if (picks.length < 2 && !has(x.mod)) add(x, 'review'); });
        // nothing played yet: the first lessons, so the weekend is not empty
        core.forEach(m => { if (picks.length < 2) add(nextIn(m), 'new'); });
      }

      // one extra, from a different area each day
      const extras = AF.registry.filter(m => !m.core && !m.soon);
      for (let k = 0; k < extras.length; k++) {
        const n = nextIn(extras[(day + k) % extras.length]);
        if (n) { add(n, 'fun'); break; }
      }
      t.picks = picks;
      P.save();
    }
    return t.picks.map(p => {
      const mod = AF.module(p.m);
      const index = mod ? mod.levels.findIndex(l => l.id === p.l) : -1;
      return index < 0 ? null : { mod: mod, level: mod.levels[index], index: index, key: p.m + ':' + p.l, kind: p.kind || 'new' };
    }).filter(Boolean);
  }

  /** The shared frame (AF.UI.hud) on a menu screen. */
  function renderHud(screen, o) {
    AF.UI.hud($(screen).querySelector('.hud'), o);
    fitSigns();
  }

  /** Long titles shrink to fit their sign (once the screen is showing,
      and again when the game's picture in the sign has loaded). */
  function fitSigns() {
    requestAnimationFrame(() => document.querySelectorAll('.screen.active .sign').forEach(s => {
      AF.UI.fit(s, 14);
      s.querySelectorAll('img').forEach(i => { if (!i.complete) i.addEventListener('load', () => AF.UI.fit(s, 14), { once: true }); });
    }));
  }

  function hudAction(act) {
    Audio.unlock();
    Audio.SFX.tap();
    if (act === 'grown') gate(renderGrown);
    else if (act === 'help') openTutorial();
    else if (act === 'back') { if ($('map').classList.contains('active')) openArea(current.area); else goHome(); }
    else if (act === 'me') {
      const who = $('home').classList.contains('active') ? $('home-char') : document.querySelector('.screen.active .me-face');
      Art.react(who, 'cheer');
      Audio.say(P.skin().cheer);
      AF.FX.sparkleAt(who, 10);
    }
  }

  /** The area a child should be steered towards: where they last
      played, or the first of today's games still to do. */
  function recommendedArea() {
    const last = AF.module(P.get().lastModule);
    if (last) return last.area;
    const t = P.today(), open = todayPicks().filter(p => t.done.indexOf(p.key) < 0)[0];
    return open ? open.mod.area : AF.AREAS[0].id;
  }

  let lastGreet = 0;
  function renderHome() {
    const skin = P.skin();
    Art.paint($('home-char'));
    renderHud('home', { left: 'settings', help: true, logo: true });
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning!' : hour < 18 ? 'Hello!' : 'Good evening!';
    $('home-hello').innerHTML = `${hello} I’m <b>${AF.U.esc(skin.name)}</b>.<br>Where shall we go?`;
    // said too: most of the children here cannot read yet (not every time home is drawn)
    if (Date.now() - lastGreet > 60000) { lastGreet = Date.now(); Audio.say(`${hello} Where shall we go?`); }

    /* ---- Today's Study: one pill that opens today's plan; its stars
       show how many of today's lessons are done ---- */
    const t = P.today();
    const picks = todayPicks();
    const isDone = (p) => t.done.indexOf(p.key) >= 0;
    const done = picks.filter(isDone).length;
    const next = picks.filter(p => !isDone(p))[0];
    const pill = $('jr-open');
    pill.hidden = !picks.length;
    $('today-row').innerHTML = picks.map(p => `<span class="${isDone(p) ? 'on' : ''}" data-ic="star"></span>`).join('');
    pill.classList.toggle('all-done', picks.length > 0 && !next);
    pill.querySelector('.jr-play').dataset.ic = next ? 'play' : 'check';
    pill.setAttribute('aria-label', `Today’s Study: ${done} of ${picks.length} done` + (next ? `. Next: ${next.mod.title}, ${next.level.title}` : ''));
    pill.onclick = () => { Audio.unlock(); Audio.SFX.pop(); openJourney(); };

    /* ---- one floating island per area of the curriculum ---- */
    const world = $('world');
    world.querySelectorAll('.isl-cell').forEach(c => c.remove());
    const rec = recommendedArea();
    AF.AREAS.forEach((area, i) => {
      const mods = AF.registry.filter(m => m.area === area.id && !m.soon);
      if (!mods.length) return;
      const stars = mods.reduce((n, m) => n + P.totalStars(m.id), 0);
      const cell = document.createElement('div');
      cell.className = 'isl-cell p' + (i + 1);
      cell.innerHTML = `
        <button class="island${area.id === rec ? ' is-rec' : ''}" style="--c:${area.colour};--i:${i}" aria-label="${area.island}: ${area.title}">
          ${AF.World.island(area.id, area.colour)}
          <span class="isl-label">${area.island}</span>
          ${stars ? `<span class="isl-stars"><i data-ic="star"></i>${stars}</span>` : ''}
          ${area.id === rec ? '<span class="isl-marker" data-ic="down" aria-hidden="true"></span>' : ''}
        </button>`;
      cell.querySelector('.island').addEventListener('click', () => { Audio.unlock(); Audio.SFX.pop(); openArea(area.id); });
      world.insertBefore(cell, $('hero'));
    });
  }

  /* ============================================================
     2b. Daily Journey: today's three games
     ============================================================ */

  function openJourney(back) {
    current = { module: null, level: null, index: -1, area: null };
    const d = new Date(), weekend = d.getDay() === 0 || d.getDay() === 6;
    renderHud('journey', { title: 'Today’s Study', crumb: weekend ? 'Review day' : ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][d.getDay()] });
    const t = P.today();
    const picks = todayPicks();
    const firstOpen = picks.findIndex(p => t.done.indexOf(p.key) < 0);
    const list = $('journey-list');
    list.innerHTML = '';
    const TAG = { review: 'Review', fun: 'Fun & Joy' };
    picks.forEach((p, i) => {
      const isDone = t.done.indexOf(p.key) >= 0;
      const b = document.createElement('button');
      b.className = 'card jy-card' + (isDone ? ' is-done' : '') + (i === firstOpen ? ' is-next' : '') + (p.kind === 'fun' ? ' is-fun' : '');
      b.style.setProperty('--i', i);
      const stage = p.mod.core ? AF.Levels.stageName(p.mod, p.level.tier || 0) : '';
      b.setAttribute('aria-label', `${p.mod.title}, ${p.level.title}${stage ? ', ' + stage : ''}${isDone ? ', done' : ''}`);
      // a numbered stop on the day's road; only the next one has a big play button
      b.innerHTML = `
        <span class="jy-stop">${AF.Icon.jelly(p.mod.id, p.mod.colour, '', p.mod.icon)}<i class="jy-num">${i + 1}</i></span>
        <span class="jy-text"><b>${AF.U.esc(p.mod.title)}${TAG[p.kind] ? `<em class="jy-tag">${TAG[p.kind]}</em>` : ''}</b><small>${stage ? AF.U.esc(stage) + ' · ' : ''}${AF.U.esc(p.level.title)}</small></span>
        ${isDone ? '<span class="jy-end" data-ic="check"></span>' : i === firstOpen ? '<span class="jy-end jy-go" data-ic="play"></span>' : ''}`;
      b.addEventListener('click', () => { Audio.unlock(); Audio.SFX.tap(); startLevel(p.mod, p.level, p.index, 'journey'); });
      list.appendChild(b);
    });
    const all = picks.length > 0 && firstOpen < 0;
    Art.paint($('journey-char'), null, all ? 'cheer' : 'idle');
    $('journey-chest').innerHTML = AF.World.chest(all);
    show('journey');
    // (said on the way in, not each time a lesson comes back here)
    if (!back || all) Audio.say(all ? 'You did it all today! Well done!' : weekend ? 'It is review day! Let’s play what we learned.' : 'Here is today’s study. Let’s start!');
  }

  /* ============================================================
     2c. one island: its subjects as landmarks along a path
     ============================================================ */

  /** Stages finished in a subject (0–3): its stars on the island. */
  function stagesDone(mod) {
    const L = AF.Levels;
    let n = 0;
    for (let t = 0; t < L.tierCount(mod.levels); t++) {
      const mine = mod.levels.filter(l => (l.tier || 0) === t && !l.soon);
      if (mine.length && mine.every(l => P.stars(mod.id, l.id) > 0)) n++;
    }
    return n;
  }

  function openArea(id) {
    const area = AF.AREAS.filter(a => a.id === id)[0] || AF.AREAS[0];
    current = { module: null, level: null, index: -1, area: area.id };
    const mods = AF.registry.filter(m => m.area === area.id && !m.soon);
    renderHud('area', { title: area.island });
    Audio.say(`${area.island}!`);

    // The friend waits by the subject last played here, else the first not finished.
    const last = AF.module(P.get().lastModule);
    const rec = last && last.area === area.id ? last.id
      : (mods.filter(m => stagesDone(m) < AF.Levels.tierCount(m.levels))[0] || mods[0]).id;

    AF.World.areaPath($('area-path'), area, mods.map(m => ({
      mod: m, done: stagesDone(m), of: AF.Levels.tierCount(m.levels), rec: m.id === rec,
      started: m.levels.some(l => P.stars(m.id, l.id) > 0)
    })), (mod) => { Audio.unlock(); Audio.SFX.pop(); openMap(mod); Audio.say(`${mod.title}! Let’s go!`); });
    show('area');
  }

  /* ============================================================
     3. level map
     ============================================================ */

  /* A subject has three stages — Basic, Intermediate, Advanced —
     each with its own island and its own treasure. The map opens on
     the stage the child has reached; the pills above it switch. */
  function openMap(mod, tier) {
    const L = AF.Levels, levels = mod.levels;
    const count = L.tierCount(levels);
    if (tier == null) {
      tier = current.module === mod && current.tier != null ? current.tier
        : (levels[L.nextIndex(mod.id, levels)].tier || 0);
    }
    tier = Math.max(0, Math.min(count - 1, tier));
    current.module = mod;
    current.area = mod.area;
    current.tier = tier;
    const area = AF.AREAS.filter(a => a.id === mod.area)[0];
    renderHud('map', { title: mod.title, crumb: mod.stageCrumbs ? mod.stageCrumbs[tier] : area ? area.island : '' });

    const tabs = $('map-tiers');
    const names = AF.stageNames(mod);
    tabs.hidden = count < 2;
    tabs.classList.toggle('many', count > 3);
    tabs.innerHTML = AF.UI.tabs(names.slice(0, count), tier, Array.from({ length: count }, (_, t) => {
      const mine = levels.filter(l => (l.tier || 0) === t && !l.soon);
      return { open: L.tierOpen(mod.id, levels, t), total: mine.length, done: mine.filter(l => P.stars(mod.id, l.id) > 0).length };
    }));
    tabs.querySelectorAll('.tab').forEach(b => b.onclick = () => {
      const t = +b.dataset.t;
      if (b.classList.contains('locked')) {
        Audio.SFX.wrong();
        b.classList.add('shake');
        setTimeout(() => b.classList.remove('shake'), 500);
        Audio.say(`Finish ${names[t - 1]} first.`);
        return;
      }
      Audio.SFX.pop();
      if (t !== current.tier) openMap(mod, t);
    });

    // Back from a level: the friend walks on from the stone just played.
    const from = current.justPlayed;
    current.justPlayed = null;
    L.renderMap($('map-path'), mod, (level, index) => startLevel(mod, level, index), tier, () => {
      // The open treasure chest is the door to the next stage.
      Audio.SFX.win();
      AF.FX.sparkleAt($('map-path').querySelector('.lv-chest'), 18);
      if (tier < count - 1) { Audio.say('Treasure! Off we go to the next one!'); showSoon(() => openMap(mod, tier + 1), 1200); }
      else Audio.say('You found all the treasure!');
    }, from);
    show('map');
  }

  /* ============================================================
     4. play
     ============================================================ */

  /** A speaking game, or a lesson with a speaking step in it. */
  const speaks = (level) => level.type === 'speak' || (level.steps || []).some(s => s.type === 'speak');

  function startLevel(mod, level, index, from) {
    if (P.overLimit()) { openLimit(); return; }
    // The first speaking game stops to let a grown-up choose how it listens.
    if (speaks(level) && P.setting('speech') === 'ask') {
      askSpeech(() => startLevel(mod, level, index, from));
      return;
    }
    // "Play again" and "Next" keep coming back to the same place
    if (from == null && current.level && current.from) from = current.from;

    current = { module: mod, level: level, index: index, area: mod.area, tier: level.tier || 0, from: from || 'map' };
    P.noteAttempt(mod.id, level.id);
    P.get().lastModule = mod.id;
    // a Bahasa Indonesia lesson is spoken in Indonesian
    Audio.setLang(level.lang || mod.lang);

    // the game's own painted icon beside its name, and a short "ready"
    // card so every game opens the same way (tap it, or it goes by itself);
    // a lesson opens on the road of its steps instead (engines/lesson.js)
    const kind = AF.Levels.kindIcon(level, mod);
    $('play-title').innerHTML = `<img class="sign-ic" src="art/${kind}.webp" alt="" draggable="false">${AF.U.esc(level.title)}`;
    const host = $('play-host');
    host.innerHTML = '';
    drawSteps(null);

    const api = {
      character: P.character,
      help: AF.Levels.helpLevel(mod.id, level.id),
      stretch: AF.Levels.stretch(mod.id, level.id),
      say: (t) => Audio.say(t),
      exit: () => backToMap(),
      steps: drawSteps,
      finish: (mistakes, avgMs) => finishLevel(mistakes, avgMs)
    };

    show('play');
    // the game starts once its "ready" card has gone, so the first question,
    // or the memory cards' first look, is never hidden under it
    const go = () => { if (current.level === level && $('play').classList.contains('active')) mod.play(host, level, api); };
    if (level.type === 'lesson') go(); else readyCard(mod, level, kind, go);
  }

  /* A lesson's steps above the game, the one being played lit up. */
  function drawSteps(list, at) {
    const el = $('play-steps');
    el.hidden = !list;
    el.innerHTML = list ? AF.UI.steps(list, at) : '';
  }

  function finishLevel(mistakes, avgMs) {
    const mod = current.module, level = current.level, index = current.index;
    Audio.setLang('en');
    drawSteps(null);
    const stars = AF.Levels.starsFor(mistakes || 0, level);
    const res = P.setStars(mod.id, level.id, stars);
    P.noteResult(mod.id, level.id, mistakes || 0, avgMs || 0);
    if (mod.stop) mod.stop();

    // Today's adventure
    const t = P.today();
    const key = mod.id + ':' + level.id;
    const picks = todayPicks();
    if (picks.some(p => p.key === key) && t.done.indexOf(key) < 0) { t.done.push(key); P.save(); }
    const dayDone = picks.length > 0 && picks.every(p => t.done.indexOf(p.key) >= 0) && !t.cheered;

    let nextIdx = index + 1;
    while (mod.levels[nextIdx] && mod.levels[nextIdx].soon) nextIdx++;
    const nextLv = mod.levels[nextIdx];
    const fromJourney = current.from === 'journey';
    const nextPick = fromJourney ? picks.filter(p => t.done.indexOf(p.key) < 0)[0] : null;

    let title = 'Well done!';
    if (stars === 3) title = 'Perfect!';
    else if (res.improved && !res.first) title = 'Even better!';

    // Finishing the last open level in a module earns a big moment.
    const playable = mod.levels.filter(l => !l.soon);
    const moduleDone = res.first && playable.every(l => P.stars(mod.id, l.id) > 0);

    // ...and so does finishing a stage: the next one opens.
    const tier = level.tier || 0;
    const tierDone = res.first && !moduleDone &&
      playable.filter(l => (l.tier || 0) === tier).every(l => P.stars(mod.id, l.id) > 0);

    const names = AF.stageNames(mod);
    const leave = (then) => {
      if (dayDone) {
        t.cheered = true; P.save();
        AF.FX.party('Today’s study done!', 'You finished everything for today', then, 'ui/medal', 'You did all of today’s study! Hooray!');
      } else if (moduleDone) {
        AF.FX.party('All done!', `You finished ${mod.title}`, then, 'ui/trophy', 'You finished it all! You are a star!');
      } else if (tierDone) {
        AF.FX.party(`${names[tier]} done!`, `${names[tier + 1] || 'The next stage'} is open`, then, 'world/chest-open', 'You opened the treasure! The next one is open!');
      } else then();
    };

    AF.Levels.showResult({
      title: title,
      stars: stars,
      hasNext: fromJourney ? !!nextPick : !!nextLv,
      from: current.from,
      // a lesson ends on its whole road, every step ticked
      steps: level.steps ? level.steps.map(st => AF.Engines.stepInfo(st, level.lang)) : null,
      // A real-life idea for the grown-up, the first time a level is finished.
      tip: res.first && mod.tip ? mod.tip : '',
      spoken: stars === 3 ? P.skin().cheer + ' Three stars!' : 'Well done!',
      onRetry: () => startLevel(mod, level, index),
      onNext:  () => leave(() => fromJourney ? startLevel(nextPick.mod, nextPick.level, nextPick.index, 'journey') : startLevel(mod, nextLv, nextIdx)),
      onMap:   () => leave(() => {
        // a stage just finished: the map opens on the new stage
        if (tierDone && current.from !== 'journey') { current.justPlayed = null; Audio.stop(); openMap(mod, tier + 1); }
        else backToMap();
      })
    });
  }

  /** Back from a game: to the Daily Journey if it was started there,
      otherwise to the subject's map, where the friend walks on. */
  function backToMap() {
    const mod = current.module;
    current.justPlayed = current.level ? current.level.id : null;
    if (mod && mod.stop) mod.stop();
    Audio.stop();
    Audio.setLang('en');
    if (current.from === 'journey') { openJourney(true); return; }
    if (mod) openMap(mod, current.level ? current.level.tier || 0 : null);
    else goHome();
  }

  /* The "ready" card: what kind of game this is and its name, for a
     moment, over the game while it sets up. */
  const KIND_NAME = { trace: 'Trace', pop: 'Pop!', code: 'Coding', speak: 'Say it', story: 'Story', memory: 'Memory',
    maze: 'Maze', match: 'Match', sort: 'Sort', song: 'Sing', puzzle: 'Build', path: 'In order', treasure: 'Breathe',
    numbers: 'Numbers', shapes: 'Shapes', coin: 'Quiz', intro: 'Listen' };
  let readyTurn = 0;
  function readyCard(mod, level, kind, then) {
    const old = $('ready'); if (old) old.remove();
    const turn = ++readyTurn;                 // (an older card's timer must not start this game again)
    if (!AF.FX.motionOK()) { then(); return; }
    const el = document.createElement('button');
    el.id = 'ready';
    el.className = 'ready-card';  // (not 'ready': the result buttons use that)
    el.style.setProperty('--c', mod.colour || '#3D8BF2');
    el.innerHTML = `<img src="art/${kind}.webp" alt="" draggable="false"><span class="ready-kind">${KIND_NAME[kind.split('/')[1]] || mod.title}</span><b>${AF.U.esc(level.title)}</b>`;
    let gone = false;
    const close = () => {
      if (gone) return;
      gone = true;
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
      setTimeout(() => { if (turn === readyTurn) then(); }, 220);
    };
    el.onclick = close;
    $('play').appendChild(el);
    setTimeout(close, 1200);
  }

  function goHome() {
    const mod = current.module;
    if (mod && mod.stop) mod.stop();
    Audio.stop();
    Audio.setLang('en');
    current = { module: null, level: null, index: -1, area: null };
    renderHome();
    show('home');
  }

  /* ============================================================
     how to play
     ============================================================ */

  /* One idea per slide, one sentence each (UI_REDESIGN_SPEC.md, Level 0),
     and only four: a child who can't read yet follows the pictures and the
     friend's voice, so each slide is a big picture and one spoken line.
     (Grown-ups find everything else behind the cog.) */
  const SLIDES = [
    { pose: 'cheer', logo: true, demo: [], text: 'Meet your animal friend and play!',
      say: 'Hello! Welcome to Animal Friends. Let’s play and learn together!' },
    { pose: 'idle', title: 'Pick an island', demo: [['literacy', '#F28A2E', 'ABC', 'world/island-literacy'], ['stem', '#F2B618', 'Math', 'world/island-stem'], ['life', '#E5535A', 'Habits', 'world/island-life'], ['playtime', '#3E9BF0', 'Play', 'world/island-play']],
      text: 'Tap an island to play.', say: 'Tap an island to play.' },
    { pose: 'point', title: 'Little steps', demo: [['sound', '#3E9BF0', 'Listen', 'ui/sound'], ['edit', '#F28A2E', 'Trace', 'game/trace'], ['playtime', '#A45CE0', 'Play', 'game/puzzle'], ['star', '#FFC93C', 'Quiz', 'game/coin']],
      text: 'Every lesson has little steps.', say: 'Every lesson has little steps. Listen, trace, play, and then a quiz!' },
    { pose: 'idle', title: 'Listen, then tap', demo: [['sound', '#3E9BF0', 'Listen'], ['check', '#3CCB7F', 'Tap'], ['hint', '#FFC93C', 'Help']],
      text: 'Listen to me, then tap the answer.', say: 'Listen to me, then tap the answer. I will help you!' },
    { pose: 'cheer', title: 'Win stars', demo: [['star', '#FFC93C', ''], ['star', '#FFC93C', ''], ['star', '#FFC93C', '']],
      text: 'Every game gives you stars!', say: 'Every game gives you stars. Can you get three?' }
  ];

  function openTutorial() {
    let i = 0;
    sheet('tutor', true);

    function draw() {
      const s = SLIDES[i];
      Art.paint($('tutor-char'), null, s.pose);
      $('tutor-demo').innerHTML = s.demo.map((d, k) =>
        `<span class="demo" style="--i:${k}">${d[3] ? `<img class="demo-pic" src="art/${d[3]}.webp" alt="" draggable="false">` : AF.Icon.jelly(d[0], d[1])}${d[2] ? `<span class="pill">${d[2]}</span>` : ''}</span>`).join('');
      $('tutor-title').innerHTML = s.logo ? '<span class="tutor-welcome">Welcome to</span>' + AF.UI.logo() : AF.U.esc(s.title);
      $('tutor-text').textContent = s.text;
      $('tutor-dots').innerHTML = SLIDES.map((x, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('');
      $('tutor-next').innerHTML = i === SLIDES.length - 1 ? 'Start playing' : 'Next <i data-ic="right"></i>';
      Art.react($('tutor-char'), 'talk');
      Audio.say(s.say);
    }
    function close() {
      Audio.stop();
      P.markTutorial();
      sheet('tutor', false);
    }
    $('tutor-next').onclick = () => {
      Audio.unlock(); Audio.SFX.tap();
      if (++i >= SLIDES.length) close(); else draw();
    };
    $('tutor-skip').onclick = () => { Audio.SFX.tap(); close(); };
    draw();
  }

  /* ============================================================
     grown-up gate, speech choice, break time
     ============================================================ */

  /** A sum a small child cannot do, typed on a number pad: tapping at
      random gets it right about once in a hundred tries (three answers to
      pick from let one in three through). A wrong answer just closes it. */
  function gate(then) {
    const a = 3 + AF.U.rand(6), b = 3 + AF.U.rand(6), answer = a * b;
    let typed = '';
    $('gate-q').textContent = `What is ${a} × ${b}?`;
    $('gate-opts').innerHTML = '<output class="gate-typed" aria-live="polite">?</output>' +
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map(k => k === 'del'
        ? '<button class="btn gate-key" data-k="del" data-ic="back" aria-label="Delete"></button>'
        : `<button class="btn gate-key${k === 'ok' ? ' go' : ''}" data-k="${k}">${k === 'ok' ? 'OK' : k}</button>`).join('');
    const shown = $('gate-opts').querySelector('.gate-typed');
    $('gate-opts').querySelectorAll('button').forEach(btn => btn.onclick = () => {
      const k = btn.dataset.k;
      if (k === 'ok') {
        sheet('gate', false);
        if (+typed === answer) { Audio.SFX.tap(); then(); }
        else Audio.SFX.wrong();
        return;
      }
      typed = k === 'del' ? typed.slice(0, -1) : (typed + k).slice(0, 2);
      shown.textContent = typed || '?';
      Audio.SFX.tap();
    });
    $('gate-close').onclick = () => sheet('gate', false);
    sheet('gate', true);
  }

  function askSpeech(then) {
    sheet('ask', true);
    // the friend asks for a grown-up, out loud: the child cannot read the choices
    const card = $('ask').querySelector('.sheet-card');
    let who = card.querySelector('.ask-friend');
    if (!who) { who = document.createElement('div'); who.className = 'ask-friend'; card.prepend(who); }
    Art.paint(who, null, 'wave');
    Audio.say('Let’s ask a grown-up!');
    $('ask').querySelectorAll('[data-speech]').forEach(btn => {
      const mode = btn.dataset.speech;
      btn.disabled = (mode === 'check' && !AF.Speech.canCheck) || (mode === 'echo' && !AF.Speech.canEcho);
      btn.onclick = () => {
        const set = () => { P.setSetting('speech', mode); sheet('ask', false); then(); };
        // Only the option that sends audio off the device needs a grown-up.
        if (mode === 'check') gate(set); else set();
      };
    });
  }

  function openLimit() {
    Art.paint($('limit-char'));
    sheet('limit', true);
    Audio.say('Time for a break! See you tomorrow.');
    $('limit-ok').onclick = () => { sheet('limit', false); goHome(); };
    $('limit-more').onclick = () => gate(() => { P.extend(10); sheet('limit', false); });
  }

  /* ============================================================
     grown-up area
     ============================================================ */

  function renderGrown() {
    const g = $('grown');
    sheet('grown', true);
    Art.paint($('grown-char'), null, 'idle');

    /* ---- headline numbers ---- */
    const core = AF.registry.filter(m => m.core && !m.soon).sort((a, b) => a.core - b.core);
    let total = 0, cleared = 0;
    core.forEach(m => m.levels.forEach(l => {
      if (l.soon) return;
      total++;
      if (P.stars(m.id, l.id) > 0) cleared++;
    }));
    const limit = P.setting('limit');
    $('grown-stats').innerHTML = [
      ['⭐', P.allStars(), 'stars'],
      ['✅', `${cleared}/${total}`, 'lessons'],
      ['🔥', P.streak(), 'day streak'],
      ['⏱️', P.minutesToday() + (limit ? '/' + limit : ''), 'min today']
    ].map(s => `<div class="stat"><em>${s[0]}</em><b>${s[1]}</b><span>${s[2]}</span></div>`).join('');

    /* ---- this week: minutes a day (Wink suggests 10 to 20) ---- */
    const week = P.week(7), most = Math.max(20, ...week.map(d => d.min));
    const DAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    $('grown-week').innerHTML = week.map((d, i) => `
      <span class="wk-day${i === 6 ? ' today' : ''}" aria-label="${DAY[d.day]}: ${d.min} minutes">
        <span class="wk-bar"><i style="height:${Math.round(d.min / most * 100)}%"></i></span><b>${d.min || ''}</b><small>${DAY[d.day]}</small>
      </span>`).join('') + `<span class="wk-goal" style="--g:${(15 / most).toFixed(3)}" title="15 minutes"></span>`;

    /* ---- the four core subjects: where the child is, stage by stage,
       and (in Math, Phonics...) which topics are sure and which need practice ---- */
    const practise = [];
    $('grown-core').innerHTML = '<p class="topic-key"><span class="topic sure">sure</span><span class="topic going">learning</span><span class="topic help">needs practice</span><span class="topic not">not yet</span></p>' + core.map(m => {
      const L = AF.Levels, names = AF.stageNames(m), count = L.tierCount(m.levels);
      const nextLv = m.levels[L.nextIndex(m.id, m.levels)];
      const lv = m.levels.filter(l => !l.soon);
      const done = lv.filter(l => P.stars(m.id, l.id) > 0).length;
      const now = done === lv.length ? 'All done!' : `Now: ${names[nextLv.tier || 0]}${m.stageCrumbs ? ' · ' + m.stageCrumbs[nextLv.tier || 0] : ''} · ${nextLv.title}`;
      const segs = Array.from({ length: count }, (_, t) => {
        const mine = lv.filter(l => (l.tier || 0) === t), got = mine.filter(l => P.stars(m.id, l.id) > 0).length;
        return `<span class="seg-bar" title="${names[t]}: ${got}/${mine.length}"><i style="width:${mine.length ? got / mine.length * 100 : 0}%"></i><small>${t + 1}</small></span>`;
      }).join('');
      let topics = '';
      if (m.topics) {
        topics = '<div class="topics">' + Object.keys(m.topics).map(k => {
          const mine = lv.filter(l => l.topic === k && !l.review);
          if (!mine.length) return '';
          const st = mine.map(l => P.stars(m.id, l.id));
          const played = st.filter(s => s > 0);
          const cls = !played.length ? 'not' : played.length === st.length && played.every(s => s === 3) ? 'sure' : played.some(s => s < 2) ? 'help' : 'going';
          if (cls === 'help') practise.push(m.topics[k]);
          return `<span class="topic ${cls}">${AF.U.esc(m.topics[k])}</span>`;
        }).join('') + '</div>';
      }
      return `<div class="core-row" style="--c:${m.colour}">
        <div class="core-head">${AF.Icon.jelly(m.id, m.colour, 'core-ic', m.icon)}<b>${AF.U.esc(m.title)}</b><span class="prog-num">${done}/${lv.length}</span></div>
        <div class="core-now">${AF.U.esc(now)}</div>
        <div class="core-segs">${segs}</div>${topics}
      </div>`;
    }).join('');

    /* ---- what a busy grown-up wants first: the week, what is next, what to practise ---- */
    const played = week.filter(d => d.min > 0).length, minutes = week.reduce((a, d) => a + d.min, 0);
    const t = P.today(), next = todayPicks().find(p => t.done.indexOf(p.key) < 0);
    const esc = AF.U.esc;
    $('grown-sum').innerHTML = `
      <p><b>This week</b>${minutes} min on ${played} ${played === 1 ? 'day' : 'days'} <small>(10–20 minutes a day is plenty)</small></p>
      <p><b>Next</b>${next ? `${esc(next.mod.title)}${next.mod.core ? ' · ' + esc(AF.Levels.stageName(next.mod, next.level.tier || 0)) : ''} · ${esc(next.level.title)}` : 'Today’s Study is all done'}</p>
      ${practise.length ? `<p><b>Practise</b>${practise.slice(0, 3).map(esc).join(', ')}</p>` : ''}`;

    /* ---- how a lesson goes, from the lessons themselves (the road most of a subject's lessons take) ---- */
    g.querySelectorAll('[data-how]').forEach(el => {
      const m = AF.module(el.dataset.how), seen = {};
      let road = [];
      (m ? m.levels : []).filter(l => l.steps && !l.review).forEach(l => {
        const r = l.steps.map(st => AF.Engines.stepInfo(st, l.lang || m.lang)), k = r.map(x => x.name).join('>');
        seen[k] = (seen[k] || 0) + 1;
        if (!road.length || seen[k] > seen[road.map(x => x.name).join('>')]) road = r;
      });
      el.innerHTML = road.map(s => `<span class="how-step"><img src="art/${s.pic}.webp" alt="" draggable="false">${esc(s.name)}</span>`).join('<i class="how-arrow">→</i>');
    });

    /* ---- the extras: one bar per subject ---- */
    $('grown-progress').innerHTML = AF.AREAS.map(area => {
      const mods = AF.registry.filter(m => m.area === area.id && !m.soon && !m.core);
      if (!mods.length) return '';
      return `<div class="prog-area"><div class="prog-head">${area.icon} ${area.island}</div>${mods.map(m => {
        const lv = m.levels.filter(l => !l.soon);
        const done = lv.filter(l => P.stars(m.id, l.id) > 0).length;
        return `<div class="prog-row">
          <span class="prog-name">${AF.Icon.jelly(m.id, m.colour, 'prog-ic', m.icon)}<span>${m.title}<small>${m.skill || ''}</small></span></span>
          <span class="prog-bar" style="--c:${m.colour}"><i style="width:${lv.length ? done / lv.length * 100 : 0}%"></i></span>
          <span class="prog-num">${done}/${lv.length}</span>
        </div>`;
      }).join('')}</div>`;
    }).join('');

    /* ---- levels that took several tries ---- */
    const hard = [];
    AF.registry.forEach(m => m.levels.forEach(l => {
      const tries = P.attempts(m.id, l.id), stars = P.stars(m.id, l.id), r = P.result(m.id, l.id);
      const avgMiss = r && r.n ? r.mistakes / r.n : 0;
      if (!l.soon && tries && stars < 3 && (tries >= 3 || avgMiss >= 3)) hard.push({ m: m, l: l, tries: tries, stars: stars, miss: avgMiss });
    }));
    hard.sort((a, b) => b.tries - a.tries);
    $('grown-practice').innerHTML = hard.length
      ? hard.slice(0, 4).map(h => `<div class="prac">${h.m.icon} <b>${h.m.title}</b> · ${h.l.title}
          <span>${h.tries} tries ${AF.UI.stars(h.stars, 'prac-stars')}</span></div>`).join('')
      : '<p class="grown-none">Nothing is proving tricky yet. Levels that take several tries will show up here.</p>';

    /* ---- a real-life idea, from what was played last ---- */
    const last = AF.module(P.get().lastModule) || AF.registry[new Date().getDate() % AF.registry.length];
    $('grown-tip').innerHTML = `<b>${last.icon} ${last.title}</b> ${last.tip || ''}`;

    /* ---- settings ---- */
    g.querySelectorAll('[data-toggle]').forEach(btn => {
      const key = btn.getAttribute('data-toggle');
      const on = P.setting(key);
      btn.classList.toggle('on', !!on);
      btn.setAttribute('role', 'switch');
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      btn.querySelector('.sw-state').textContent = on ? 'On' : 'Off';
      btn.onclick = () => { P.setSetting(key, !P.setting(key)); Audio.SFX.tap(); applyWorld(); renderGrown(); };
    });
    g.querySelectorAll('[data-seg]').forEach(seg => {
      const key = seg.getAttribute('data-seg');
      let value = String(P.setting(key));
      if (key === 'speech' && value === 'ask') value = '';
      seg.querySelectorAll('button').forEach(b => {
        b.classList.toggle('on', b.dataset.v === value);
        b.setAttribute('aria-pressed', b.dataset.v === value ? 'true' : 'false');
        if (key === 'speech') b.disabled = (b.dataset.v === 'check' && !AF.Speech.canCheck) || (b.dataset.v === 'echo' && !AF.Speech.canEcho);
        b.onclick = () => {
          P.setSetting(key, key === 'limit' ? +b.dataset.v : b.dataset.v);
          Audio.SFX.tap();
          renderGrown();
        };
      });
    });
    $('speech-note').textContent = {
      check: 'The browser checks the word. The audio is sent to the browser’s maker to be recognised (Google in Chrome, Apple in Safari, Microsoft in Edge).',
      echo: 'Records a moment and plays it back. Nothing leaves this device.',
      tap: 'No microphone is used.'
    }[P.setting('speech')] || 'Not chosen yet — you will be asked the first time Say It! is played.';

    $('voice-name').textContent = Audio.hasVoice() ? Audio.voiceName() : 'No English voice found on this device';
    $('voice-id').textContent = Audio.hasVoice('id') ? Audio.voiceName('id')
      : 'None found. Add the Indonesian voice in the device’s text-to-speech settings for Bahasa Indonesia.';
    $('stat-char').textContent = P.skin().name + ' the ' + P.skin().species;
    $('stat-3d').textContent = Art.has3D ? 'On' : 'Not supported here — using flat pictures';
    $('stat-offline').textContent = navigator.serviceWorker && navigator.serviceWorker.controller ? 'Yes'
      : location.protocol === 'file:' ? 'Yes (opened from a file)' : 'After the next visit';
  }

  /** Motion off (here, or "reduce motion" on the device) stills the
      bubbles and clouds; sound off stops the birds. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyWorld() {
    document.body.classList.toggle('still', !P.setting('motion') || reduceMotion.matches);
    Audio.ambience(false);
    Audio.ambience(!$('play').classList.contains('active'));
  }

  /* ============================================================
     wiring
     ============================================================ */

  /* If a script file failed to arrive (a flaky connection, a server
     hiccup), parts of the app would be silently missing. Check that
     everything is here; reload once if not, and say so if it still is not. */
  function allLoaded() {
    const E = AF.Engines || {};
    return !!(AF.Icon && AF.World && AF.Art && AF.Profile && AF.Audio && AF.Speech && AF.FX && AF.Levels && AF.Gen &&
      E.choose && E.order && E.build && E.memory && E.maze && E.speak && E.story && E.song && E.breathe &&
      E.sort && E.match && E.trace && E.pop && E.code && E.lesson && E.intro && AF.Drag &&
      ['phonics', 'english', 'bahasa', 'math'].every(id => AF.module(id)) && AF.registry && AF.registry.length >= 13);
  }

  function boot() {
    if (!allLoaded()) {
      let tried = false;
      try { tried = sessionStorage.getItem('af.reload') === '1'; sessionStorage.setItem('af.reload', '1'); } catch (e) { tried = true; }
      if (!tried) { location.reload(); return; }
      document.body.insertAdjacentHTML('beforeend',
        '<div class="sheet"><div class="sheet-card"><h2>Something did not load</h2><p class="sheet-sub">Please check the connection, then close and open Animal Friends again.</p></div></div>');
      return;
    }
    try { sessionStorage.removeItem('af.reload'); } catch (e) { /* no-op */ }

    // Any first touch unlocks audio on phones.
    document.addEventListener('pointerdown', () => Audio.unlock(), { once: true });
    // Every touch gets an answer: a ring where the finger lands, and
    // the next screen opens out from that spot.
    document.addEventListener('pointerdown', (e) => {
      const root = document.documentElement;
      root.style.setProperty('--ox', (e.clientX / window.innerWidth * 100).toFixed(1) + '%');
      root.style.setProperty('--oy', (e.clientY / window.innerHeight * 100).toFixed(1) + '%');
      if (!e.target.closest('input')) AF.FX.ripple(e.clientX, e.clientY);
    }, true);

    document.querySelectorAll('[data-home]').forEach(b =>
      b.addEventListener('click', () => { Audio.SFX.tap(); goHome(); }));
    $('play-back').addEventListener('click', () => { Audio.SFX.tap(); backToMap(); });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.hud [data-act]');
      if (b) hudAction(b.dataset.act);
    });

    $('home-char').addEventListener('click', () => {
      Audio.unlock();
      Art.react($('home-char'), 'cheer');
      Audio.say(P.skin().cheer);
      AF.FX.sparkleAt($('home-char'), 10);
    });
    $('grown-close').addEventListener('click', () => {
      Audio.SFX.tap();
      sheet('grown', false);
      const on = (document.querySelector('.screen.active') || {}).id;      // settings may have changed what shows
      if (on === 'home') renderHome();
    });

    $('btn-tutor').addEventListener('click', () => { sheet('grown', false); openTutorial(); });
    $('btn-swap').addEventListener('click', () => {
      Audio.SFX.tap();
      sheet('grown', false);
      openMaker(P.character);
    });
    $('btn-reset').addEventListener('click', function () {
      if (this.dataset.armed) {
        P.reset();
        applyWorld();                      // the settings are back to their defaults
        this.removeAttribute('data-armed');
        this.textContent = 'Start over';
        sheet('grown', false);
        openMaker(null);
      } else {
        this.dataset.armed = '1';
        this.textContent = 'Tap again to erase everything';
        setTimeout(() => {
          this.removeAttribute('data-armed');
          this.textContent = 'Start over';
        }, 4000);
      }
    });

    // Count time played, a quarter-minute at a time, only while on screen.
    setInterval(() => {
      if (document.visibilityState !== 'visible' || !P.character) return;
      if ($('pick').classList.contains('active') || $('maker').classList.contains('active')) return;
      if (!$('grown').hidden) return;
      P.addPlay(15000);
    }, 15000);

    // Leaving the app mid-level must not leave the microphone or the voice running.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { Audio.stop(); AF.Speech.cancel(); }
    });

    // Offline support. Needs http(s); from a file:// it simply is not used.
    // Registered only once the page has finished loading, so storing the
    // app for offline use never competes with loading it.
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      const reg = () => navigator.serviceWorker.register('sw.js').catch(() => {});
      if (document.readyState === 'complete') reg(); else window.addEventListener('load', reg);
    }

    applyWorld();
    reduceMotion.addEventListener('change', applyWorld);
    // The level map is laid out for the screen's shape, so redraw it if that changes.
    let turning = 0;
    if (document.fonts) document.fonts.ready.then(fitSigns);
    window.addEventListener('resize', () => {
      fitSigns();
      clearTimeout(turning);
      turning = setTimeout(() => {
        if ($('map').classList.contains('active') && current.module) openMap(current.module, current.tier);
        else if ($('area').classList.contains('active')) openArea(current.area);
      }, 250);
    });

    // First time: straight into the character creator.
    if (P.character) { renderHome(); show('home'); }
    else openMaker(null);

    deepLink();
  }

  /* A way to jump straight to a screen, for testing and demos:
       ?go=home | maker | parents | tutorial | journey | area:stem | map:math | map:math:4 | play:phonics:ph1-1 | play:maze:m3
     Add &friend=4 to start as the fifth ready-made friend (only before a friend is made).
     A link can't get past the grown-up check: ?go=parents and &speech=check still ask the sum. */
  function deepLink() {
    const q = new URLSearchParams(location.search);
    const go = q.get('go');
    if (!go) return;
    if (!P.character) P.chooseCharacter(Art.PRESETS[+q.get('friend') || 0]);
    P.markTutorial();
    const part = go.split(':');
    const mod = AF.module(part[1]);
    renderHome();
    show('home');
    if (part[0] === 'pick') { renderPick(); show('pick'); }
    else if (part[0] === 'maker') openMaker(P.character);
    else if (part[0] === 'parents') gate(renderGrown);
    else if (part[0] === 'tutorial') openTutorial();
    else if (part[0] === 'area') openArea(part[1]);
    else if (part[0] === 'journey') openJourney();
    else if (part[0] === 'map' && mod) {
      const stage = parseInt(part[2], 10);
      openMap(mod, Number.isFinite(stage) ? stage : null);
    }
    else if (part[0] === 'play' && mod) {
      const i = Math.max(0, mod.levels.findIndex(l => l.id === part[2]));
      const play = () => startLevel(mod, mod.levels[i], i);
      const speech = ['check', 'echo', 'tap'].indexOf(q.get('speech')) >= 0 ? q.get('speech') : 'tap';
      if (P.setting('speech') !== 'ask') play();
      // Sending audio off the device needs a grown-up, as it does in the Say It! question.
      else if (speech === 'check') gate(() => { P.setSetting('speech', speech); play(); });
      else { P.setSetting('speech', speech); play(); }
    }
  }

  AF.App = { goHome: goHome, openArea: openArea, openMap: openMap, startLevel: startLevel, openMaker: openMaker,
    finishLevel: finishLevel };   // (finishLevel: for testing a level's ending)

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.AF = window.AF || {});
