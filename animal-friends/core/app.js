/* ============================================================
   app.js — screen router and boot
   ------------------------------------------------------------
   Four screens: pick -> home -> map -> play.
   Modules never touch the router; they only ever receive a host
   element and an api object. That is what keeps them swappable.
   ============================================================ */
(function (AF) {
  'use strict';

  /* ---- modules that exist but are not ported into the new
     structure yet. Shown honestly rather than hidden. ---- */
  AF.placeholder('numbers', 'Numbers', '🔢', '#36D6B5', 'Count & add', 'Phase 2');
  AF.placeholder('maze',    'Maze',    '💌', '#4CC3FF', 'Find the way', 'Port from v1');
  AF.placeholder('explore', 'Animals', '🐾', '#FF7AB6', 'Learn & find', 'Port from v1');
  AF.placeholder('snack',   'Snack',   '🍎', '#B388EB', 'Feed & home',  'Port from v1');

  let current = { module: null, level: null, index: -1 };

  /* ---------- screen router ---------- */

  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
    const sc = document.getElementById(id);
    if (sc) sc.scrollTop = 0;
  }

  /* ---------- 1. character picker ---------- */

  function renderPick() {
    const host = document.getElementById('pick-row');
    host.innerHTML = '';

    AF.Art.list().forEach((id, i) => {
      const skin = AF.Art.skin(id);
      const btn = document.createElement('button');
      btn.className = 'pick-card';
      btn.style.setProperty('--c', skin.colour);
      btn.style.setProperty('--i', i);
      btn.innerHTML = `
        <span class="pick-art" data-art></span>
        <span class="pick-name">${skin.name}</span>
        <span class="pick-species">${skin.species}</span>`;
      AF.Art.paint(btn.querySelector('[data-art]'), id);

      btn.addEventListener('click', () => {
        AF.Audio.unlock();
        AF.Audio.SFX.pop();
        host.querySelectorAll('.pick-card').forEach(c => c.classList.remove('chosen'));
        btn.classList.add('chosen');
        AF.Art.react(btn.querySelector('[data-art]'), 'happy');

        AF.Profile.chooseCharacter(id);
        AF.Audio.say(`Hi! I am ${skin.name}. Let's play!`);
        AF.FX.sparkleAt(btn, 16);

        setTimeout(() => { renderHome(); show('home'); }, 1250);
      });

      host.appendChild(btn);
    });
  }

  /* ---------- 2. home ---------- */

  function renderHome() {
    const skin = AF.Profile.skin();
    AF.Art.paint(document.getElementById('home-char'), AF.Profile.character);
    document.getElementById('home-hello').innerHTML =
      `Hi, I'm <b>${skin.name}</b>.<br>What shall we play?`;
    document.getElementById('home-stars').textContent = AF.Profile.allStars();

    const grid = document.getElementById('home-grid');
    grid.innerHTML = '';

    AF.registry.forEach((mod, i) => {
      const done = mod.soon ? 0 : AF.Profile.clearedCount(mod.id);
      const total = mod.levels.filter(l => !l.soon).length;

      const card = document.createElement('button');
      card.className = 'tile' + (mod.soon ? ' is-soon' : '');
      card.style.setProperty('--c', mod.colour);
      card.style.setProperty('--i', i);
      card.innerHTML = `
        <span class="tile-ico">${mod.icon}</span>
        <span class="tile-title">${mod.title}</span>
        <span class="tile-blurb">${mod.blurb}</span>
        ${mod.soon
          ? `<span class="tile-tag">${mod.note || 'Soon'}</span>`
          : `<span class="tile-bar"><i style="width:${total ? (done / total) * 100 : 0}%"></i></span>
             <span class="tile-count">${done} / ${total}</span>`}`;

      card.addEventListener('click', () => {
        AF.Audio.unlock();
        if (mod.soon) {
          AF.Audio.SFX.wrong();
          card.classList.add('shake');
          setTimeout(() => card.classList.remove('shake'), 500);
          AF.Audio.say('Coming soon!');
          return;
        }
        AF.Audio.SFX.tap();
        openMap(mod);
      });

      grid.appendChild(card);
    });
  }

  /* ---------- 3. level map ---------- */

  function openMap(mod) {
    current.module = mod;
    document.getElementById('map-title').textContent = mod.title;
    document.getElementById('map-note').textContent = mod.note || '';
    document.getElementById('map-stars').textContent = AF.Profile.totalStars(mod.id);
    AF.Art.paint(document.getElementById('map-char'), AF.Profile.character);

    AF.Levels.renderMap(document.getElementById('map-path'), mod, (level, index) => {
      startLevel(mod, level, index);
    });

    show('map');
  }

  /* ---------- 4. play ---------- */

  function startLevel(mod, level, index) {
    current.module = mod;
    current.level = level;
    current.index = index;

    AF.Profile.noteAttempt(mod.id, level.id);

    document.getElementById('play-title').textContent = level.title;
    const host = document.getElementById('play-host');
    host.innerHTML = '';

    const api = {
      character: AF.Profile.character,
      help: AF.Levels.helpLevel(mod.id, level.id),
      say: (t) => AF.Audio.say(t),
      exit: () => backToMap(),
      finish: (mistakes) => finishLevel(mistakes)
    };

    show('play');
    mod.play(host, level, api);
  }

  function finishLevel(mistakes) {
    const mod = current.module, level = current.level;
    const stars = AF.Levels.starsFor(mistakes || 0);
    const res = AF.Profile.setStars(mod.id, level.id, stars);

    const nextIdx = current.index + 1;
    const nextLv = mod.levels[nextIdx];
    const hasNext = !!(nextLv && !nextLv.soon);

    let title = 'Nice work!';
    if (stars === 3) title = 'Perfect!';
    else if (res.improved && !res.first) title = 'Even better!';

    if (mod.stop) mod.stop();

    // Finishing the last open level in a module earns a big moment.
    const playable = mod.levels.filter(l => !l.soon);
    const allDone = playable.every(l => AF.Profile.stars(mod.id, l.id) > 0);
    const celebrate = allDone && res.first;

    AF.Levels.showResult({
      title: title,
      stars: stars,
      hasNext: hasNext,
      spoken: stars === 3 ? AF.Profile.skin().cheer + ' Three stars!' : 'Well done!',
      onRetry: () => startLevel(mod, level, current.index),
      onNext:  () => startLevel(mod, nextLv, nextIdx),
      onMap:   () => {
        if (celebrate) {
          AF.FX.party('All done!', `You finished ${mod.title}`, backToMap);
        } else {
          backToMap();
        }
      }
    });
  }

  function backToMap() {
    const mod = current.module;
    if (mod && mod.stop) mod.stop();
    AF.Audio.stop();
    if (mod) openMap(mod);
    else { renderHome(); show('home'); }
  }

  function goHome() {
    const mod = current.module;
    if (mod && mod.stop) mod.stop();
    AF.Audio.stop();
    current = { module: null, level: null, index: -1 };
    renderHome();
    show('home');
  }

  /* ---------- grown-up sheet ---------- */

  function renderSettings() {
    const sheet = document.getElementById('grown');
    sheet.hidden = false;

    const rows = sheet.querySelectorAll('[data-toggle]');
    rows.forEach(btn => {
      const key = btn.getAttribute('data-toggle');
      const on = AF.Profile.setting(key);
      btn.classList.toggle('on', !!on);
      btn.querySelector('.sw-state').textContent = on ? 'On' : 'Off';
      btn.onclick = () => {
        AF.Profile.setSetting(key, !AF.Profile.setting(key));
        AF.Audio.SFX.tap();
        renderSettings();
      };
    });

    sheet.querySelector('#voice-name').textContent =
      AF.Audio.hasVoice() ? AF.Audio.voiceName() : 'No English voice found on this device';

    sheet.querySelector('#stat-stars').textContent = AF.Profile.allStars();
    sheet.querySelector('#stat-char').textContent = AF.Profile.skin().name;
  }

  /* ---------- wiring ---------- */

  function boot() {
    // Any first touch unlocks audio on iOS.
    const unlockOnce = () => AF.Audio.unlock();
    document.addEventListener('pointerdown', unlockOnce, { once: true });

    document.querySelectorAll('[data-home]').forEach(b =>
      b.addEventListener('click', () => { AF.Audio.SFX.tap(); goHome(); }));

    document.getElementById('play-back')
      .addEventListener('click', () => { AF.Audio.SFX.tap(); backToMap(); });

    document.getElementById('btn-grown')
      .addEventListener('click', () => { AF.Audio.unlock(); AF.Audio.SFX.tap(); renderSettings(); });

    document.getElementById('grown-close')
      .addEventListener('click', () => { AF.Audio.SFX.tap(); document.getElementById('grown').hidden = true; });

    document.getElementById('btn-swap')
      .addEventListener('click', () => {
        AF.Audio.SFX.tap();
        document.getElementById('grown').hidden = true;
        renderPick();
        show('pick');
      });

    document.getElementById('btn-reset')
      .addEventListener('click', function () {
        if (this.dataset.armed) {
          AF.Profile.reset();
          this.removeAttribute('data-armed');
          this.textContent = 'Start over';
          document.getElementById('grown').hidden = true;
          renderPick();
          show('pick');
        } else {
          this.dataset.armed = '1';
          this.textContent = 'Tap again to confirm';
          setTimeout(() => {
            this.removeAttribute('data-armed');
            this.textContent = 'Start over';
          }, 4000);
        }
      });

    renderPick();
    if (AF.Profile.character) { renderHome(); show('home'); }
    else show('pick');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.AF = window.AF || {});
