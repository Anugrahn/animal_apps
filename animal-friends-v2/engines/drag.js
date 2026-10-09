/* ============================================================
   engines/drag.js — pick a thing up and put it somewhere
   ------------------------------------------------------------
   v2 was tap-only. A tap is still all anyone ever NEEDS — every
   game that uses this file also works by tapping — but a child
   who wants to pick the apple up and carry it to the basket now
   can, and the apple follows the finger.

     AF.Drag.on(S, el, {
       targets: () => [elements it may be dropped on],
       drop: (target, el) => true | false,   // false: it springs back
       can:  () => true | false              // may it be picked up now?
     })

   A drag that ends on nothing springs back and costs nothing.
   After a real drag the browser's follow-up "click" is swallowed,
   so the engine's tap handler does not fire as well.
   ============================================================ */
(function (AF) {
  'use strict';

  const SLOP = 9;          // px a finger may wander and still be a tap
  const REACH = 26;        // px of forgiveness around a target

  function hit(targets, x, y) {
    let best = null, bestD = Infinity;
    targets.forEach(t => {
      const r = t.getBoundingClientRect();
      if (x < r.left - REACH || x > r.right + REACH || y < r.top - REACH || y > r.bottom + REACH) return;
      const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
      if (d < bestD) { bestD = d; best = t; }
    });
    return best;
  }

  AF.Drag = {
    on(S, el, o) {
      let st = null, over = null;
      el.classList.add('draggable');

      const hover = (t) => {
        if (t === over) return;
        if (over) over.classList.remove('drop-over');
        over = t;
        if (over) over.classList.add('drop-over');
      };

      el.addEventListener('pointerdown', (e) => {
        if (st || (o.can && !o.can())) return;
        st = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
      });

      el.addEventListener('pointermove', (e) => {
        if (!st || e.pointerId !== st.id) return;
        const dx = e.clientX - st.x, dy = e.clientY - st.y;
        if (!st.moved) {
          if (Math.hypot(dx, dy) < SLOP) return;
          st.moved = true;
          el.classList.add('dragging');
          el.style.transition = 'none';
          AF.Audio.SFX.flip();
        }
        el._at = { x: dx, y: dy };
        // it leans the way it is being pulled
        const lean = Math.max(-10, Math.min(10, dx / 9));
        el.style.transform = `translate(${dx}px, ${dy}px) scale(1.12) rotate(${lean.toFixed(1)}deg)`;
        hover(hit(o.targets(), e.clientX, e.clientY));
      });

      const end = (e) => {
        if (!st || e.pointerId !== st.id) return;
        const was = st;
        st = null;
        if (!was.moved) return;                      // a tap: the click handler has it
        el._dragged = Date.now();
        const t = e.type === 'pointercancel' ? null : hit(o.targets(), e.clientX, e.clientY);
        hover(null);
        if (t && S.alive && o.drop(t, el) !== false) return;
        AF.Drag.home(el);
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);

      // Swallow the click that follows a drag.
      el.addEventListener('click', (e) => {
        if (el._dragged && Date.now() - el._dragged < 400) { e.stopImmediatePropagation(); e.preventDefault(); }
      }, true);
    },

    /** Springs an element back to where it lives. */
    home(el) {
      el.classList.remove('dragging', 'flying');
      el.style.transition = '';
      el.style.transform = '';
      el._at = null;
    }
  };
})(window.AF = window.AF || {});
