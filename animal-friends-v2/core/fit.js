/* ============================================================
   fit.js — which way round the screen should be (v4.2)
   ------------------------------------------------------------
   A tablet plays sideways, everywhere in the app. A phone turns
   sideways only for the games laid out for it: the maze and coding,
   where the board gets the full height and the arrows sit under the
   right thumb (screens.css, engines.css). Memory stays as it is held:
   on a phone its cards come out bigger upright.

   Browsers let a page lock the screen only in fullscreen or as an
   installed app (the manifest asks for fullscreen), and iOS Safari
   never does, so every lock is a polite try and a refusal is
   swallowed: the layout works both ways round anyway. Nothing ever
   blocks the child; a tablet held upright that cannot be turned
   for it gets one small tip, which a tap puts away for good.

   It only watches: body[data-screen] (set by core/app.js) and the
   game on the stage (#play-host). No other file calls it.
   ============================================================ */
(function (AF) {
  'use strict';

  const SIDEWAYS_GAMES = '.stage-maze, .stage-code';
  const HINT_KEY = 'af-turn-tip';
  const so = window.screen && screen.orientation;
  const portrait = window.matchMedia('(orientation: portrait)');
  const coarse = window.matchMedia('(pointer: coarse)');

  // The device, not the window: a tablet is a touch screen whose shorter side is 600 CSS px or more.
  const touch = () => coarse.matches || navigator.maxTouchPoints > 0;
  const shortSide = () => Math.min(screen.width || innerWidth, screen.height || innerHeight);
  const kind = () => !touch() ? 'desktop' : shortSide() >= 600 ? 'tablet' : 'phone';

  let want = null;      // 'landscape' or null (free)
  let locked = null;    // what the browser actually agreed to
  let turn = 0;         // so a late answer to an old request is ignored

  function wanted() {
    const k = kind();
    if (k === 'tablet') return 'landscape';
    if (k !== 'phone' || document.body.dataset.screen !== 'game') return null;
    const host = document.getElementById('play-host');
    return host && host.querySelector(SIDEWAYS_GAMES) ? 'landscape' : null;
  }

  function lock(w) {
    const mine = ++turn;
    try {
      Promise.resolve(so.lock(w)).then(() => {
        if (mine === turn) { locked = w; hint(); return; }
        // the answer came after the child had moved on: let the screen go again
        if (want !== w) { try { so.unlock(); } catch (e) { /* nothing to undo */ } }
      }, () => { if (mine === turn) { locked = null; hint(); } });
    } catch (e) { locked = null; hint(); }
  }

  function unlock() {
    turn++;
    if (locked) { try { so.unlock(); } catch (e) { /* nothing to undo */ } }
    locked = null;
  }

  /** Asks again whenever where the child is (or fullscreen) changes. */
  function apply(again) {
    const w = wanted();
    if (!again && w === want) { hint(); return; }
    want = w;
    if (so && typeof so.lock === 'function') { if (w) lock(w); else unlock(); }
    hint();
  }

  /* ---------- the tip: a tablet held upright that could not be turned ---------- */
  let tip = null, tipShown = false, tipTimer = 0;
  const tipOff = () => { try { return localStorage.getItem(HINT_KEY) === 'off'; } catch (e) { return false; } };

  function hideTip(forGood) {
    clearTimeout(tipTimer);
    if (tip) tip.classList.remove('on');
    if (forGood) { try { localStorage.setItem(HINT_KEY, 'off'); } catch (e) { /* private window: just this time */ } }
  }

  const tipWanted = () => kind() === 'tablet' && portrait.matches && locked !== 'landscape'
    && document.body.dataset.screen === 'home' && !tipOff();

  function hint() {
    // it goes (or never comes) once the tablet is turned, the lock works, or the child moves on from Home
    if (!tipWanted()) { hideTip(false); return; }
    if (tipShown) return;
    tipShown = true;                                   // (once a visit, and never once put away)
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'fit-hint';
      tip.setAttribute('role', 'status');
      tip.innerHTML = `
        <svg class="fit-hint-ic" viewBox="0 0 48 48" aria-hidden="true">
          <rect x="15" y="6" width="18" height="28" rx="4" class="a"/><rect x="8" y="22" width="32" height="20" rx="4"/>
          <path d="M38 8a12 12 0 0 1 4 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M39 18l3.5 0.5 1-3.6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Turn sideways for bigger games</span>
        <button class="fit-hint-x" aria-label="Hide this tip">×</button>`;
      tip.addEventListener('click', () => hideTip(true));
      document.body.appendChild(tip);
    }
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      if (!tipWanted()) return;
      tip.classList.add('on');
      tipTimer = setTimeout(() => hideTip(false), 8000);
    }, 1200);
  }

  /* ---------- watching ---------- */
  let queued = false;
  const soon = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; apply(false); }); } };

  function start() {
    new MutationObserver(soon).observe(document.body, { attributes: true, attributeFilter: ['data-screen'] });
    const host = document.getElementById('play-host');
    if (host) new MutationObserver(soon).observe(host, { childList: true });
    // fullscreen or an installed app may allow what a tab did not
    document.addEventListener('fullscreenchange', () => apply(true));
    document.addEventListener('webkitfullscreenchange', () => apply(true));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(true); });
    const onTurn = () => { if (!portrait.matches) hideTip(false); soon(); };
    if (portrait.addEventListener) portrait.addEventListener('change', onTurn); else portrait.addListener(onTurn);
    apply(true);
  }

  AF.Fit = { kind: kind, wanted: wanted, state: () => ({ kind: kind(), want: want, locked: locked }) };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window.AF = window.AF || {});
