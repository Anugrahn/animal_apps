/* ============================================================
   fx.js — confetti, sparkles, celebration
   ------------------------------------------------------------
   Everything is injected into #fx and cleans itself up. All of it
   checks the "motion" setting so a sensitive child can turn the
   noise down without losing the game.
   ============================================================ */
(function (AF) {
  'use strict';

  const COLOURS = ['#FFC93C', '#36D6B5', '#FF7AB6', '#4CC3FF', '#B388EB', '#FF8A4C'];
  let layer = null;

  function host() {
    if (!layer) layer = document.getElementById('fx');
    return layer;
  }

  function motionOK() {
    if (!AF.Profile.setting('motion')) return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  const FX = {
    motionOK: motionOK,

    /** Sparkle burst at a point on screen. */
    sparkle(x, y, count) {
      const el = host();
      if (!el || !motionOK()) return;
      const n = count || 12;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        const angle = (Math.PI * 2 * i) / n + rand(-0.3, 0.3);
        const dist = rand(50, 130);
        s.className = 'spark' + (i % 3 === 0 ? ' star' : '');
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--s', rand(8, 18).toFixed(0) + 'px');
        s.style.setProperty('--col', COLOURS[i % COLOURS.length]);
        s.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(0) + 'px');
        s.style.setProperty('--dy', (Math.sin(angle) * dist).toFixed(0) + 'px');
        s.style.setProperty('--rot', rand(-220, 220).toFixed(0) + 'deg');
        el.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }
    },

    /** Sparkle centred on an element. */
    sparkleAt(target, count) {
      if (!target) return;
      const r = target.getBoundingClientRect();
      FX.sparkle(r.left + r.width / 2, r.top + r.height / 2, count);
    },

    confetti(count) {
      const el = host();
      if (!el || !motionOK()) return;
      const n = count || 60;
      for (let i = 0; i < n; i++) {
        const c = document.createElement('span');
        c.className = 'confetti';
        c.style.setProperty('--x', rand(0, 100).toFixed(1) + 'vw');
        c.style.setProperty('--w', rand(8, 16).toFixed(0) + 'px');
        c.style.setProperty('--col', COLOURS[i % COLOURS.length]);
        c.style.setProperty('--dur', rand(2.2, 4).toFixed(2) + 's');
        c.style.setProperty('--delay', rand(0, 0.9).toFixed(2) + 's');
        c.style.setProperty('--drift', rand(-14, 14).toFixed(0) + 'vw');
        c.style.setProperty('--rot', rand(-720, 720).toFixed(0) + 'deg');
        el.appendChild(c);
        setTimeout(() => c.remove(), 5200);
      }
    },

    /** A soft ring where a finger lands: the screen answers every touch. */
    ripple(x, y) {
      const el = host();
      if (!el || !motionOK()) return;
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      el.appendChild(r);
      setTimeout(() => r.remove(), 520);
    },

    /** A little puff of dust (footsteps, landings). */
    puff(x, y) {
      const el = host();
      if (!el || !motionOK()) return;
      for (let i = 0; i < 3; i++) {
        const s = document.createElement('span');
        s.className = 'puff';
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--dx', rand(-16, 16).toFixed(0) + 'px');
        s.style.setProperty('--s', rand(8, 15).toFixed(0) + 'px');
        el.appendChild(s);
        setTimeout(() => s.remove(), 520);
      }
    },

    /**
     * Sends an element gliding to the middle of another one, in a
     * little arc, shrinking to fit. It carries on from wherever a
     * drag left it. `done` always fires (straight away with motion off).
     */
    send(el, target, done, ms) {
      const a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
      const at = el._at || { x: 0, y: 0 };
      const x = at.x + (b.left + b.width / 2) - (a.left + a.width / 2);
      const y = at.y + (b.top + b.height / 2) - (a.top + a.height / 2);
      const k = Math.min(1, b.width / (el.offsetWidth || a.width), b.height / (el.offsetHeight || a.height));
      const end = `translate(${x}px, ${y}px) scale(${k.toFixed(3)})`;
      const dist = Math.hypot(x - at.x, y - at.y);
      const dur = ms || Math.max(160, Math.min(460, dist * 1.5));
      el.classList.remove('dragging');
      el.classList.add('flying');
      el.style.transition = 'none';
      if (!motionOK() || !el.animate) { el.style.transform = end; if (done) done(); return; }
      const lift = Math.min(70, dist * 0.28);
      el.animate([
        { transform: `translate(${at.x}px, ${at.y}px) scale(1.1)` },
        { transform: `translate(${(at.x + x) / 2}px, ${(at.y + y) / 2 - lift}px) scale(${((1.1 + k) / 2).toFixed(3)})`, offset: 0.55 },
        { transform: end }
      ], { duration: dur, easing: 'cubic-bezier(.4,0,.3,1)' });
      el.style.transform = end;
      el._at = { x: x, y: y };
      setTimeout(() => { if (done) done(); }, dur);
    },

    /** Full-screen "well done" moment. onDone fires exactly once,
        whether the child taps it away or it times out. */
    party(text, sub, onDone, pic) {
      const p = document.getElementById('party');
      if (!p) { if (onDone) onDone(); return; }
      const t = p.querySelector('.party-text');
      t.textContent = t.dataset.t = text || 'Hooray!';
      p.querySelector('.party-pic').src = 'art/' + (pic || 'ui/trophy') + '.webp';
      const subEl = p.querySelector('.party-sub');
      subEl.textContent = sub || '';
      subEl.hidden = !sub;

      AF.Art.paint(p.querySelector('.party-char'), null, 'cheer');
      p.classList.add('is-on');   // (not 'show': the question strip uses that class)
      FX.confetti(80);
      AF.Audio.SFX.win();

      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timer);
        p.classList.remove('is-on');
        p.removeEventListener('click', close);
        if (onDone) onDone();
      };
      p.addEventListener('click', close);
      const timer = setTimeout(close, 3200);
    }
  };

  AF.FX = FX;
})(window.AF = window.AF || {});
