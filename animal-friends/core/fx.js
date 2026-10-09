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

    /** Full-screen "well done" moment. */
    party(text, sub, onDone) {
      const p = document.getElementById('party');
      if (!p) { if (onDone) onDone(); return; }
      p.querySelector('.party-text').textContent = text || 'Hooray!';
      const subEl = p.querySelector('.party-sub');
      subEl.textContent = sub || '';
      subEl.hidden = !sub;

      AF.Art.paint(p.querySelector('.party-char'), AF.Profile.character);
      p.classList.add('show');
      FX.confetti(80);
      AF.Audio.SFX.win();

      const close = () => {
        p.classList.remove('show');
        p.removeEventListener('click', close);
        if (onDone) onDone();
      };
      p.addEventListener('click', close);
      setTimeout(close, 2600);
    }
  };

  AF.FX = FX;
})(window.AF = window.AF || {});
