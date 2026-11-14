// core: math, easing, keyed values, drawing helpers. Everything hangs off window.G.
(function () {
  const G = (window.G = window.G || {});
  G.W = 1080; G.H = 1920; G.OUT = '#2a1b3d'; G.FONT = '"Lilita One", sans-serif';

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = {
    lin: k => k,
    inOut: k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
    out: k => 1 - Math.pow(1 - k, 3),
    in: k => k * k * k,
    inQ: k => k * k,
    back: k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    backBig: k => { const c1 = 3.2, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
    elastic: k => (k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  };
  // keyed value: keys [[t, v], ...] (v number or array), easing between keys
  function key(t, keys, e = ease.inOut) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
      if (t <= t1) {
        const k = e(clamp((t - t0) / (t1 - t0)));
        return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], k)) : lerp(v0, v1, k);
      }
    }
    return keys[keys.length - 1][1];
  }
  // squash arrival: scaleY 0.72 -> 1.12 -> 0.95 -> 1 over 0.3 s. Returns [sx, sy, visibleScale]
  function squash(t, t0) {
    const d = t - t0;
    if (d < 0) return 0;
    if (d >= 0.3) return 1;
    return key(d, [[0, 0.72], [0.1, 1.12], [0.2, 0.95], [0.3, 1]], ease.inOut);
  }
  // pop-in scale with overshoot (0 before t0)
  const popIn = (t, t0, dur = 0.3) => (t < t0 ? 0 : ease.back(clamp((t - t0) / dur)));
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  // shapes -------------------------------------------------------------
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  // filled shape with one darker flat shade on the right (or 'left'/'bottom') side and a thick outline
  function shape(ctx, pathFn, box, fill, shade, lw = 8, side = 'right', frac = 0.26) {
    pathFn();
    ctx.fillStyle = fill; ctx.fill();
    if (shade) {
      ctx.save(); pathFn(); ctx.clip();
      ctx.fillStyle = shade;
      if (side === 'right') ctx.fillRect(box.x + box.w * (1 - frac), box.y - 2, box.w * frac + 4, box.h + 4);
      else if (side === 'left') ctx.fillRect(box.x - 2, box.y - 2, box.w * frac + 2, box.h + 4);
      else ctx.fillRect(box.x - 2, box.y + box.h * (1 - frac), box.w + 4, box.h * frac + 4);
      ctx.restore();
    }
    if (lw > 0) { pathFn(); ctx.lineWidth = lw; ctx.strokeStyle = G.OUT; ctx.lineJoin = 'round'; ctx.stroke(); }
  }
  const box = (ctx, x, y, w, h, r, fill, shade, lw = 8, side, frac) =>
    shape(ctx, () => rr(ctx, x, y, w, h, r), { x, y, w, h }, fill, shade, lw, side, frac);
  const circle = (ctx, x, y, r, fill, shade, lw = 8) =>
    shape(ctx, () => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }, { x: x - r, y: y - r, w: 2 * r, h: 2 * r }, fill, shade, lw);
  function starPath(ctx, x, y, r1, r2, n = 5, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  }
  // outlined text (Lilita)
  function text(ctx, s, x, y, size, fill, opt = {}) {
    ctx.save();
    ctx.font = `${size}px ${G.FONT}`;
    ctx.textAlign = opt.align || 'center';
    ctx.textBaseline = 'middle';
    if (opt.maxW) { const w = ctx.measureText(s).width; if (w > opt.maxW) { const k = opt.maxW / w; ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y); } }
    if (opt.shadow) { ctx.shadowColor = 'rgba(20,8,40,0.55)'; ctx.shadowBlur = opt.shadow; ctx.shadowOffsetY = opt.shadow * 0.45; }
    if (opt.lw) { ctx.lineWidth = opt.lw; ctx.strokeStyle = opt.stroke || '#1c1030'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
    ctx.restore();
  }

  Object.assign(G, { clamp, lerp, ease, key, squash, popIn, hash, rr, shape, box, circle, starPath, text });
})();
