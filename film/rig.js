// rig: one blocky avatar rig for the whole cast + faces + hand-held props.
(function () {
  const G = window.G;
  const { box, circle, rr, shape, starPath, hash, clamp, ease } = G;
  const O = G.OUT;
  const HIP_Y = -170, BODY_TOP = -314, SH_Y = -288, SH_X = 100, HEAD_CY = -404;

  const LOOKS = {
    kid: { skin: '#ffcf9e', skinS: '#e9a874', shirt: '#ffc934', shirtS: '#e9a514', pants: '#3f66cf', pantsS: '#2f4ea6', shoe: '#ff5165', shoeS: '#d63a50', sleeve: 52 },
    mom: { skin: '#f6c6a0', skinS: '#dda07a', shirt: '#2bb3a3', shirtS: '#1f8c80', pants: '#6b3fa0', pantsS: '#53307d', shoe: '#3d2459', shoeS: '#2c1842', sleeve: 132 },
    teacher: { skin: '#c98f65', skinS: '#a87048', shirt: '#57b85a', shirtS: '#3f9443', pants: '#8a5a3c', pantsS: '#6e4529', shoe: '#3a2a2a', shoeS: '#241818', sleeve: 132 },
  };

  // figure transform helpers ---------------------------------------------------
  function frame(p) {
    const sq = p.sq == null ? 1 : p.sq;
    const sx = (p.s || 1) * (1 + (1 - sq) * 0.6) * (p.flip || 1), sy = (p.s || 1) * sq;
    return { sx, sy, rot: p.rot || 0 };
  }
  function toWorld(p, lx, ly) {
    const f = frame(p), x = lx * f.sx, y = ly * f.sy, c = Math.cos(f.rot), s = Math.sin(f.rot);
    return { x: p.x + x * c - y * s, y: p.y + x * s + y * c };
  }
  const armRot = (p, sd) => -sd * (sd < 0 ? (p.armL ?? 0.15) : (p.armR ?? 0.15));
  // hand position + angle (same maths as the arm drawing)
  function handPos(p, side) {
    const sd = side === 'L' ? -1 : 1, r = armRot(p, sd);
    const lx = sd * SH_X - 127 * Math.sin(r), ly = SH_Y + 127 * Math.cos(r);
    const w = toWorld(p, lx, ly);
    return { x: w.x, y: w.y, ang: (p.rot || 0) + r * Math.sign(p.flip || 1), s: (p.s || 1) };
  }
  const headPos = p => toWorld(p, 0, HEAD_CY);

  // face -------------------------------------------------------------------------
  function blinkOn(p) {
    if (p.noBlink) return false;
    const ph = hash((p.seed || 1) * 3.7) * 1.6;
    return ((p.t || 0) + ph) % 1.6 < 0.1;
  }
  function eye(ctx, ex, ey, kind, p, side) {
    const lk = p.look || [0, 0], t = p.t || 0;
    ctx.lineCap = 'round';
    if (kind === 'normal' || kind === 'huge' || kind === 'narrow') {
      const rx = kind === 'huge' ? 34 : 23, ry = kind === 'huge' ? 40 : kind === 'narrow' ? 9 : 28;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip();
      const pr = kind === 'huge' ? 11 : kind === 'narrow' ? 9 : 14;
      ctx.beginPath(); ctx.arc(ex + lk[0] * (rx - pr - 2), ey + lk[1] * Math.max(0, ry - pr - 2), pr, 0, Math.PI * 2);
      ctx.fillStyle = O; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + lk[0] * (rx - pr - 2) + pr * 0.35, ey + lk[1] * Math.max(0, ry - pr - 2) - pr * 0.4, pr * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI * 2);
      ctx.lineWidth = 6; ctx.strokeStyle = O; ctx.stroke();
    } else if (kind === 'happy') {
      ctx.beginPath(); ctx.arc(ex, ey + 10, 19, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 10; ctx.strokeStyle = O; ctx.stroke();
    } else if (kind === 'closed') {
      ctx.beginPath(); ctx.arc(ex, ey - 8, 18, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = 9; ctx.strokeStyle = O; ctx.stroke();
    } else if (kind === 'star') {
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(Math.sin(t * 6 + side) * 0.25); ctx.scale(1 + Math.sin(t * 14) * 0.08, 1 + Math.sin(t * 14) * 0.08);
      starPath(ctx, 0, 0, 34, 15);
      ctx.fillStyle = '#ffd23f'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = O; ctx.stroke();
      ctx.restore();
    } else if (kind === 'spiral') {
      ctx.save(); ctx.translate(ex, ey);
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = O; ctx.stroke();
      ctx.rotate(t * 9 * side);
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.2) { const r = 2 + a * 1.4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.lineWidth = 5; ctx.stroke();
      ctx.restore();
    }
  }
  function brow(ctx, ex, kind, sd) {
    // sd: -1 left eye, +1 right eye; inner end is toward x=0
    let inner = -42, outer = -42;
    if (kind === 'up') { inner = outer = -60; }
    if (kind === 'worry') { inner = -60; outer = -40; }
    if (kind === 'angry') { inner = -30; outer = -54; }
    const xi = ex - sd * 22, xo = ex + sd * 22;
    ctx.beginPath(); ctx.moveTo(xo, outer);
    if (kind === 'up') ctx.quadraticCurveTo(ex, outer - 14, xi, inner); else ctx.lineTo(xi, inner);
    ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.strokeStyle = O; ctx.stroke();
  }
  function mouth(ctx, kind, p) {
    const t = p.t || 0, my = 56;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = O; ctx.lineWidth = 8;
    const dark = '#5a1630', tongue = '#ff7a8a';
    const fillOut = () => { ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); };
    if (kind === 'talk') {
      const o = 0.5 + 0.5 * Math.sin(t * 24) * Math.sin(t * 7.3 + 1);
      kind = o > 0.55 ? 'wide' : o > 0.25 ? 'o' : 'grin';
    }
    switch (kind) {
      case 'smile': ctx.beginPath(); ctx.arc(0, my - 22, 32, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke(); break;
      case 'grin':
        ctx.beginPath(); ctx.moveTo(-44, my - 6); ctx.lineTo(44, my - 6); ctx.quadraticCurveTo(40, my + 40, 0, my + 40); ctx.quadraticCurveTo(-40, my + 40, -44, my - 6); ctx.closePath();
        fillOut();
        ctx.save(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(-46, my - 8, 92, 14); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-44, my - 6); ctx.lineTo(44, my - 6); ctx.quadraticCurveTo(40, my + 40, 0, my + 40); ctx.quadraticCurveTo(-40, my + 40, -44, my - 6); ctx.closePath(); ctx.stroke();
        break;
      case 'o': ctx.beginPath(); ctx.ellipse(0, my + 8, 15, 19, 0, 0, Math.PI * 2); fillOut(); break;
      case 'scream':
        ctx.beginPath(); ctx.ellipse(0, my + 12, 34, 40, 0, 0, Math.PI * 2); fillOut();
        ctx.save(); ctx.clip(); ctx.beginPath(); ctx.ellipse(0, my + 46, 24, 16, 0, 0, Math.PI * 2); ctx.fillStyle = tongue; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.ellipse(0, my + 12, 34, 40, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      case 'wavy':
        ctx.beginPath();
        for (let x = -34; x <= 34; x += 2) ctx.lineTo(x, my + 6 + Math.sin(x * 0.28 + t * 10) * 6);
        ctx.stroke(); break;
      case 'flat': ctx.beginPath(); ctx.moveTo(-26, my + 6); ctx.lineTo(26, my + 6); ctx.stroke(); break;
      case 'smirk': ctx.beginPath(); ctx.moveTo(-26, my + 8); ctx.quadraticCurveTo(10, my + 16, 34, my - 8); ctx.stroke(); break;
      case 'tongue':
        ctx.beginPath(); ctx.arc(0, my - 22, 32, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
        ctx.beginPath(); rr(ctx, 4, my + 4, 24, 26, 12); ctx.fillStyle = tongue; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); break;
      case 'chew': { const k = 0.5 + 0.5 * Math.sin(t * 18); ctx.beginPath(); ctx.ellipse(Math.sin(t * 9) * 6, my + 6, 18 - k * 4, 6 + k * 8, 0, 0, Math.PI * 2); fillOut(); break; }
      case 'wide':
        ctx.beginPath(); rr(ctx, -46, my - 6, 92, 54, 22); fillOut();
        ctx.save(); rr(ctx, -46, my - 6, 92, 54, 22); ctx.clip();
        ctx.fillStyle = '#fff'; ctx.fillRect(-46, my - 8, 92, 14);
        ctx.beginPath(); ctx.ellipse(0, my + 50, 30, 16, 0, 0, Math.PI * 2); ctx.fillStyle = tongue; ctx.fill(); ctx.restore();
        ctx.beginPath(); rr(ctx, -46, my - 6, 92, 54, 22); ctx.stroke();
        break;
    }
  }
  function sweatDrop(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(14, -2, 16, 10, 0, 16); ctx.bezierCurveTo(-16, 10, -14, -2, 0, -22);
    ctx.fillStyle = '#7debff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = O; ctx.stroke();
    ctx.beginPath(); ctx.arc(-4, 4, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  function shades(ctx, k, t) {
    // sunglasses dropping in from above (k 0..1)
    const y = -300 * (1 - ease.back(clamp(k)));
    ctx.save(); ctx.translate(0, y);
    ctx.fillStyle = '#16101f'; ctx.strokeStyle = O; ctx.lineWidth = 6;
    for (const sd of [-1, 1]) { ctx.beginPath(); rr(ctx, sd * 48 - 40, -22, 80, 46, 14); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(10, -12); ctx.lineWidth = 10; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-88, -12); ctx.lineTo(-108, -18); ctx.moveTo(88, -12); ctx.lineTo(108, -18); ctx.lineWidth = 8; ctx.stroke();
    // glint sweeping across
    const g = ((t * 0.9) % 1.6) / 1.6;
    ctx.save(); for (const sd of [-1, 1]) { ctx.beginPath(); rr(ctx, sd * 48 - 40, -22, 80, 46, 14); } ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 12;
    const gx = -140 + g * 280; ctx.beginPath(); ctx.moveTo(gx, 30); ctx.lineTo(gx + 40, -30); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  // head -------------------------------------------------------------------------
  function head(ctx, p, L) {
    const who = p.who;
    // things behind the head
    if (who === 'kid') { // backwards cap brim sticking up behind
      ctx.save(); ctx.translate(46, -108); ctx.rotate(-0.42); box(ctx, -8, -26, 100, 50, 24, '#2e88ee', '#1f69c2', 7, 'bottom', 0.4); ctx.restore();
    }
    if (who === 'mom') { // ponytail swinging
      const sw = Math.sin((p.t || 0) * 3.2) * 0.12 + (p.tail || 0);
      ctx.save(); ctx.translate(104, -78); ctx.rotate(-0.25 + sw);
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-10, -16); ctx.bezierCurveTo(70, -20, 100, 80, 60, 170); ctx.bezierCurveTo(40, 110, 10, 60, -10, 22); ctx.closePath(); },
        { x: -10, y: -20, w: 110, h: 190 }, '#a3412b', '#7f2f1f', 7);
      circle(ctx, 4, 2, 15, '#ffd23f', '#e0a91f', 6);
      ctx.restore();
    }
    if (who === 'teacher') circle(ctx, 0, -110, 46, '#b9bfd0', '#8f96aa', 7);
    // the head
    box(ctx, -108, -100, 216, 200, 56, L.skin, L.skinS, 8);
    if (who === 'kid') {
      // side hair tufts, cap dome, strap opening with hair
      for (const sd of [-1, 1]) {
        shape(ctx, () => { ctx.beginPath(); ctx.moveTo(sd * 104, -56); ctx.lineTo(sd * 124, -36); ctx.lineTo(sd * 106, -30); ctx.lineTo(sd * 118, -10); ctx.lineTo(sd * 100, -10); ctx.closePath(); },
          { x: -124, y: -56, w: 248, h: 46 }, '#f27b2c', null, 6);
      }
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-114, -36); ctx.lineTo(-114, -60); ctx.quadraticCurveTo(-112, -124, 0, -126); ctx.quadraticCurveTo(112, -124, 114, -60); ctx.lineTo(114, -36); ctx.closePath(); },
        { x: -114, y: -126, w: 228, h: 90 }, '#2e88ee', '#1f69c2', 8);
      box(ctx, -36, -70, 72, 34, 14, '#f27b2c', '#d65f16', 6);
      ctx.beginPath(); ctx.moveTo(-40, -58); ctx.lineTo(40, -58); ctx.lineWidth = 7; ctx.strokeStyle = O; ctx.stroke();
    } else if (who === 'mom') {
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-116, 10); ctx.lineTo(-116, -50); ctx.quadraticCurveTo(-112, -116, 0, -118); ctx.quadraticCurveTo(112, -116, 116, -50); ctx.lineTo(116, -10); ctx.quadraticCurveTo(60, -30, 20, -72); ctx.quadraticCurveTo(-30, -26, -96, -36); ctx.lineTo(-96, 10); ctx.closePath(); },
        { x: -116, y: -118, w: 232, h: 128 }, '#a3412b', '#7f2f1f', 8);
    } else if (who === 'teacher') {
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-114, -6); ctx.lineTo(-114, -50); ctx.quadraticCurveTo(-110, -112, 0, -114); ctx.quadraticCurveTo(110, -112, 114, -50); ctx.lineTo(114, -6); ctx.lineTo(96, -6); ctx.quadraticCurveTo(60, -60, 0, -64); ctx.quadraticCurveTo(-60, -60, -96, -6); ctx.closePath(); },
        { x: -114, y: -114, w: 228, h: 108 }, '#b9bfd0', '#8f96aa', 8);
    }
    // face
    let eyes = p.eyes || 'normal';
    if ((eyes === 'normal' || eyes === 'huge') && blinkOn(p)) eyes = 'closed';
    eye(ctx, -48, 4, eyes, p, -1); eye(ctx, 48, 4, eyes, p, 1);
    if (p.brows) { brow(ctx, -48, p.brows, -1); brow(ctx, 48, p.brows, 1); }
    if (who === 'mom') {
      ctx.lineWidth = 6; ctx.strokeStyle = O;
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 48, 4, 36, 0, Math.PI * 2); ctx.fillStyle = 'rgba(160,230,255,0.18)'; ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * 112, 56, 16, 0, Math.PI * 2); ctx.lineWidth = 7; ctx.strokeStyle = '#ffc93c'; ctx.stroke(); }
    }
    if (who === 'teacher') {
      ctx.lineWidth = 6; ctx.strokeStyle = '#ff5165';
      for (const sd of [-1, 1]) { ctx.beginPath(); rr(ctx, sd * 48 - 34, -22, 68, 50, 12); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(14, -4); ctx.stroke();
    }
    if (p.blush) { ctx.save(); ctx.globalAlpha = 0.55 * p.blush; ctx.fillStyle = '#ff7ad9'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 72, 42, 20, 11, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    mouth(ctx, p.mouth || 'smile', p);
    if (p.sweat) { const k = ((p.t || 0) * 0.8) % 1; sweatDrop(ctx, 100, -46 + k * 30, p.sweat); if (p.sweat > 0.9) sweatDrop(ctx, -104, -20 + ((k + 0.5) % 1) * 30, 0.8); }
    if (p.shades) shades(ctx, p.shades, p.t || 0);
  }

  // limbs --------------------------------------------------------------------------
  function arm(ctx, p, L, sd) {
    ctx.save(); ctx.translate(sd * SH_X, SH_Y); ctx.rotate(armRot(p, sd));
    if (L.sleeve >= 132) box(ctx, -31, -20, 62, 132, 26, L.shirt, L.shirtS, 8);
    else {
      box(ctx, -31, -20, 62, 132, 26, L.skin, L.skinS, 8);
      box(ctx, -31, -20, 62, L.sleeve + 20, 26, L.shirt, L.shirtS, 8);
    }
    box(ctx, -28, 104, 56, 46, 20, L.skin, L.skinS, 7);
    ctx.restore();
  }
  function leg(ctx, p, L, sd) {
    const a = sd < 0 ? (p.legL || 0) : (p.legR || 0);
    ctx.save(); ctx.translate(sd * 38, HIP_Y); ctx.rotate(-sd * a);
    box(ctx, -36, -6, 72, 142, 20, L.pants, L.pantsS, 8);
    box(ctx, -42 + sd * 6, 126, 84, 42, 18, L.shoe, L.shoeS, 8, 'bottom', 0.35);
    ctx.restore();
  }

  // full figure ----------------------------------------------------------------------
  function draw(ctx, p) {
    const L = LOOKS[p.who];
    const f = frame(p);
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(f.rot); ctx.scale(f.sx, f.sy);
    if (p.shadow !== false) { ctx.save(); ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.ellipse(0, 4 + (p.lift || 0) / (p.s || 1), 120, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#1c1030'; ctx.fill(); ctx.restore(); }
    leg(ctx, p, L, -1); leg(ctx, p, L, 1);
    box(ctx, -76, BODY_TOP, 152, 154, 30, L.shirt, L.shirtS, 8);
    if (p.who === 'kid') { // pixel heart
      const H = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
      ctx.fillStyle = '#ff5165';
      H.forEach((row, j) => [...row].forEach((c, i) => { if (c === '1') ctx.fillRect(-28 + i * 8, BODY_TOP + 44 + j * 8, 8, 8); }));
    }
    if (p.who === 'mom') {
      box(ctx, -30, BODY_TOP + 4, 60, 146, 10, '#ff8fb1', '#ec6f96', 6);
      for (const y of [40, 80, 120]) circle(ctx, -40, BODY_TOP + y, 6, '#ffd23f', null, 4);
    }
    if (p.who === 'teacher') {
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-40, BODY_TOP); ctx.lineTo(0, BODY_TOP + 40); ctx.lineTo(40, BODY_TOP); ctx.closePath(); }, { x: -40, y: BODY_TOP, w: 80, h: 40 }, '#fff', null, 6);
    }
    const frontArms = p.armsFront;
    if (!frontArms) { arm(ctx, p, L, -1); arm(ctx, p, L, 1); }
    ctx.save(); ctx.translate(0, BODY_TOP); ctx.rotate(p.tilt || 0); ctx.translate(0, HEAD_CY - BODY_TOP);
    head(ctx, p, L);
    ctx.restore();
    if (frontArms) { arm(ctx, p, L, -1); arm(ctx, p, L, 1); }
    ctx.restore();
    if (p.prop) {
      const h = handPos(p, p.prop.side || 'R');
      const k = p.prop.s || 1;
      PROPS[p.prop.kind](ctx, h.x, h.y, (p.s || 1) * k, h.ang + (p.prop.rot || 0), p.t || 0);
    }
  }

  // props (origin = grip point) --------------------------------------------------------
  const PROPS = {
    chinelo(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
      box(ctx, -38, -30, 76, 156, 38, '#ff7ad9', '#e055b8', 8);
      ctx.strokeStyle = O; ctx.lineCap = 'round';
      for (const [w, c] of [[20, O], [11, '#2e88ee']]) {
        ctx.lineWidth = w; ctx.strokeStyle = c;
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-30, 46); ctx.moveTo(0, -4); ctx.lineTo(30, 46); ctx.stroke();
      }
      circle(ctx, 0, -4, 8, '#2e88ee', null, 5);
      ctx.restore();
    },
    phone(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
      box(ctx, -36, -96, 72, 128, 14, '#2a1b3d', null, 6);
      box(ctx, -28, -86, 56, 104, 8, '#7debff', '#5bc8e6', 0);
      ctx.restore();
    },
    bag(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a * 0.3); ctx.scale(s, s);
      circle(ctx, 0, 96, 86, '#5dbb63', '#43994a', 8);
      box(ctx, -30, -6, 60, 30, 12, '#43994a', null, 7);
      G.circle(ctx, 0, 100, 40, '#ffd23f', '#e9a514', 6);
      G.text(ctx, 'R$', 0, 102, 40, '#a8650a');
      ctx.restore();
    },
    plug(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.bezierCurveTo(-60, -120, 80, -200, -40, -340);
      ctx.lineWidth = 30; ctx.strokeStyle = O; ctx.stroke(); ctx.lineWidth = 18; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
      box(ctx, -34, -10, 68, 70, 12, '#e8e8f0', '#c3c3d3', 7);
      box(ctx, -22, 56, 14, 34, 4, '#ffd23f', null, 5); box(ctx, 8, 56, 14, 34, 4, '#ffd23f', null, 5);
      ctx.restore();
    },
    pencil(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + 2.6); ctx.scale(s, s);
      box(ctx, -10, -70, 20, 110, 6, '#ffd23f', '#e9a514', 6);
      ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(0, 66); ctx.lineTo(10, 40); ctx.closePath(); ctx.fillStyle = '#f6c6a0'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = O; ctx.stroke();
      box(ctx, -10, -80, 20, 16, 4, '#ff7ad9', null, 5);
      ctx.restore();
    },
    stamp(ctx, x, y, s, a) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI); ctx.scale(s, s);
      circle(ctx, 0, -20, 26, '#ff5165', '#d63a50', 7);
      box(ctx, -12, -4, 24, 50, 8, '#8a5a3c', null, 6);
      box(ctx, -50, 44, 100, 34, 10, '#ff5165', '#d63a50', 7);
      ctx.restore();
    },
  };

  G.rig = { draw, handPos, headPos, toWorld, PROPS, LOOKS, sweatDrop, HEIGHT: 520 };
})();
