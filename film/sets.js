// sets: flat, saturated places with thick outlines. World coords ~ the 1080x1920 frame, drawn with margin.
(function () {
  const G = window.G;
  const { box, circle, rr, shape, text, hash } = G;
  const O = G.OUT;
  const X0 = -400, X1 = 1480, Y0 = -400, Y1 = 2320;
  const fill = (ctx, c, y0 = Y0, y1 = Y1) => { ctx.fillStyle = c; ctx.fillRect(X0, y0, X1 - X0, y1 - y0); };
  const line = (ctx, x0, y0, x1, y1, w = 8, c = O) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineCap = 'round'; ctx.stroke(); };

  function cloud(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const path = () => { ctx.beginPath(); ctx.arc(-60, 10, 44, 0, Math.PI * 2); ctx.arc(0, -16, 60, 0, Math.PI * 2); ctx.arc(64, 8, 46, 0, Math.PI * 2); ctx.rect(-60, 10, 124, 44); };
    ctx.lineWidth = 16; ctx.strokeStyle = O; path(); ctx.stroke();
    ctx.fillStyle = '#fff'; path(); ctx.fill();
    ctx.fillStyle = '#dff4ff'; ctx.fillRect(-100, 30, 210, 24);
    ctx.restore();
  }
  function sky(ctx, top = '#4fb8ff', bot = '#b8ecff', y0 = Y0, y1 = 1300) {
    const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(X0, y0, X1 - X0, y1 - y0);
  }

  // window with sky (and an optional bus driving away)
  function windowFrame(ctx, x, y, w, h, t, o = {}) {
    box(ctx, x - 22, y - 22, w + 44, h + 44, 18, '#fff', '#e3dcf5', 9);
    ctx.save(); rr(ctx, x, y, w, h, 8); ctx.clip();
    sky(ctx, '#3fb0ff', '#bff0ff', y, y + h);
    cloud(ctx, x + 90 + ((t * 18) % 80), y + 90, 0.55);
    cloud(ctx, x + w - 60, y + 170, 0.4);
    ctx.fillStyle = '#5dd35d'; ctx.fillRect(x, y + h - 90, w, 90);
    ctx.fillStyle = '#5b5470'; ctx.fillRect(x, y + h - 60, w, 60);
    if (o.busX != null) bus(ctx, x + o.busX, y + h - 40, 0.32, t);
    ctx.restore();
    ctx.lineWidth = 9; ctx.strokeStyle = O; rr(ctx, x, y, w, h, 8); ctx.stroke();
    line(ctx, x + w / 2, y, x + w / 2, y + h, 12, '#fff'); line(ctx, x, y + h / 2, x + w, y + h / 2, 12, '#fff');
  }

  function bus(ctx, x, y, s, t) {
    // x,y = bottom-centre of wheels
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    box(ctx, -400, -380, 800, 320, 40, '#ffc934', '#e9a514', 10, 'bottom', 0.3);
    box(ctx, 330, -300, 90, 220, 26, '#ffc934', '#e9a514', 10);
    for (let i = 0; i < 5; i++) box(ctx, -360 + i * 130, -350, 110, 110, 18, '#7debff', '#5bc8e6', 8);
    box(ctx, 300, -350, 90, 200, 14, '#7debff', '#5bc8e6', 8);
    ctx.fillStyle = O; ctx.fillRect(-400, -200, 800, 22);
    text(ctx, 'ESCOLA', -60, -150, 64, '#2a1b3d');
    for (const wx of [-250, 250]) {
      circle(ctx, wx, -50, 62, '#2a1b3d', null, 8);
      circle(ctx, wx, -50, 26, '#c3c3d3', null, 6);
    }
    box(ctx, 400, -170, 40, 40, 10, '#ff5165', null, 7);
    ctx.restore();
  }

  function bedroom(ctx, t, o = {}) {
    fill(ctx, '#b48cff');
    ctx.fillStyle = '#c4a3ff';
    for (let x = X0; x < X1; x += 120) ctx.fillRect(x, Y0, 56, 1850 - Y0);
    // window + poster
    windowFrame(ctx, 600, 330, 380, 420, t, o);
    box(ctx, 90, 380, 260, 320, 16, '#ffd23f', '#e9b520', 9);
    box(ctx, 130, 470, 180, 120, 50, '#ff5165', '#d63a50', 8); // gamepad poster
    circle(ctx, 180, 530, 16, '#fff', null, 5); circle(ctx, 262, 512, 12, '#2a1b3d', null, 0); circle(ctx, 262, 548, 12, '#2a1b3d', null, 0);
    G.starPath(ctx, 220, 430, 30, 13); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = O; ctx.stroke();
    // floor
    ctx.fillStyle = '#7a4bd1'; ctx.fillRect(X0, 1440, X1 - X0, 36);
    fill(ctx, '#ff9f43', 1476, Y1);
    ctx.fillStyle = '#e8852a';
    for (let y = 1560; y < Y1; y += 110) ctx.fillRect(X0, y, X1 - X0, 10);
    for (let i = 0; i < 30; i++) ctx.fillRect(X0 + (i * 233) % (X1 - X0), 1476 + Math.floor(i / 6) * 110, 10, 100);
    line(ctx, X0, 1440, X1, 1440, 9); line(ctx, X0, 1476, X1, 1476, 9);
    // rug
    shape(ctx, () => { ctx.beginPath(); ctx.ellipse(560, 1720, 360, 90, 0, 0, Math.PI * 2); }, { x: 200, y: 1630, w: 720, h: 180 }, '#5dff8f', '#3fd870', 9, 'bottom', 0.35);
    // bed
    box(ctx, 40, 1080, 70, 420, 24, '#ff7ad9', '#e055b8', 9);
    box(ctx, 60, 1300, 680, 120, 30, '#fff', '#dcd6f0', 9, 'bottom', 0.3);
    box(ctx, 90, 1250, 200, 90, 40, '#fff', '#e8e2f8', 8);
    box(ctx, 250, 1270, 500, 170, 34, '#2e88ee', '#1f69c2', 9, 'bottom', 0.3);
    for (let i = 0; i < 4; i++) box(ctx, 300 + i * 110, 1300, 50, 50, 10, '#ffd23f', null, 6);
    box(ctx, 70, 1420, 40, 90, 10, '#ff7ad9', null, 8); box(ctx, 690, 1420, 40, 90, 10, '#ff7ad9', null, 8);
    if (o.spawn) spawnPad(ctx, 420, 1290, o.spawn, t);
    // nightstand + lamp
    box(ctx, 840, 1260, 200, 220, 20, '#2bb3a3', '#1f8c80', 9);
    box(ctx, 870, 1320, 140, 50, 12, '#1f8c80', null, 6);
    box(ctx, 920, 1130, 40, 130, 10, '#fff', null, 7);
    shape(ctx, () => { ctx.beginPath(); ctx.moveTo(880, 1140); ctx.lineTo(1000, 1140); ctx.lineTo(970, 1040); ctx.lineTo(910, 1040); ctx.closePath(); }, { x: 880, y: 1040, w: 120, h: 100 }, '#ffd23f', '#e9b520', 8);
  }

  function spawnPad(ctx, x, y, k, t) {
    // glowing checkpoint pad on top of something (k = 0..1 strength)
    ctx.save(); ctx.translate(x, y);
    ctx.globalAlpha = 0.45 * k;
    for (let i = 0; i < 3; i++) {
      const r = 1 + ((t * 0.9 + i / 3) % 1) * 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, 200 * r, 46 * r, 0, 0, Math.PI * 2); ctx.lineWidth = 10; ctx.strokeStyle = '#7debff'; ctx.stroke();
    }
    ctx.globalAlpha = k;
    const g = ctx.createLinearGradient(0, -420, 0, 0); g.addColorStop(0, 'rgba(125,235,255,0)'); g.addColorStop(1, 'rgba(125,235,255,0.55)');
    ctx.fillStyle = g; ctx.fillRect(-170, -420, 340, 420);
    shape(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0, 190, 44, 0, 0, Math.PI * 2); }, { x: -190, y: -44, w: 380, h: 88 }, '#7debff', '#3fc7ea', 8, 'bottom', 0.4);
    shape(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -6, 120, 24, 0, 0, Math.PI * 2); }, { x: -120, y: -30, w: 240, h: 48 }, '#e9fbff', null, 6);
    ctx.restore();
  }

  function street(ctx, t, o = {}) {
    sky(ctx);
    circle(ctx, 880, 220, 110, '#ffd23f', '#f5b81c', 10);
    cloud(ctx, 160 + ((t * 25) % 300), 300, 0.9); cloud(ctx, 700 - ((t * 15) % 200), 520, 0.7);
    // houses
    const H = [[-260, '#ff7ad9'], [80, '#7debff'], [420, '#ffa53d'], [760, '#c49bff'], [1100, '#5dff8f']];
    for (const [x, c] of H) {
      box(ctx, x, 860, 300, 420, 10, c, 'rgba(0,0,0,0.12)', 9);
      shape(ctx, () => { ctx.beginPath(); ctx.moveTo(x - 30, 870); ctx.lineTo(x + 150, 700); ctx.lineTo(x + 330, 870); ctx.closePath(); }, { x: x - 30, y: 700, w: 360, h: 170 }, '#ff5165', '#d63a50', 9);
      box(ctx, x + 40, 950, 90, 90, 10, '#fff8c4', null, 7); box(ctx, x + 170, 950, 90, 90, 10, '#fff8c4', null, 7);
      box(ctx, x + 105, 1120, 90, 160, 12, '#8a5a3c', null, 7);
    }
    // sidewalk + road
    fill(ctx, '#e3dcf5', 1280, 1420);
    ctx.fillStyle = '#cfc5ea'; for (let x = X0; x < X1; x += 160) ctx.fillRect(x, 1280, 10, 140);
    line(ctx, X0, 1280, X1, 1280, 9);
    fill(ctx, '#b8b0cc', 1420, 1450); line(ctx, X0, 1450, X1, 1450, 9);
    fill(ctx, '#5b5470', 1450, Y1);
    ctx.fillStyle = '#ffd23f'; for (let x = X0 - ((o.roadScroll || 0) % 260); x < X1; x += 260) { ctx.beginPath(); rr(ctx, x, 1760, 150, 26, 12); ctx.fill(); }
    if (o.busX != null) bus(ctx, o.busX, 1700, 1, t);
  }

  function classroom(ctx, t, o = {}) {
    fill(ctx, '#ffb86b'); fill(ctx, '#ff9f43', 1180, 1460);
    line(ctx, X0, 1180, X1, 1180, 9);
    // chalkboard
    box(ctx, 60, 300, 960, 560, 22, '#8a5a3c', '#6e4529', 10);
    box(ctx, 90, 330, 900, 500, 12, '#2f7d5b', '#276b4d', 8);
    ctx.save(); ctx.globalAlpha = 0.92;
    text(ctx, '2 + 2 = ?', 380, 470, 120, '#f4fff6');
    text(ctx, '10 x 0 = ?', 380, 650, 96, '#f4fff6');
    ctx.restore();
    G.starPath(ctx, 820, 470, 70, 30); ctx.lineWidth = 8; ctx.strokeStyle = '#fff8c4'; ctx.stroke();
    ctx.beginPath(); ctx.arc(820, 680, 70, 0.2, Math.PI * 1.6); ctx.lineWidth = 8; ctx.strokeStyle = '#ffb3e0'; ctx.stroke();
    box(ctx, 60, 852, 960, 24, 8, '#a26b45', null, 7);
    // wall clock
    // floor
    fill(ctx, '#c9b6ff', 1460, Y1);
    ctx.fillStyle = '#b39cf5';
    for (let y = 1460, r = 0; y < Y1; y += 140, r++) for (let x = X0 + (r % 2) * 140; x < X1; x += 280) ctx.fillRect(x, y, 140, 140);
    line(ctx, X0, 1460, X1, 1460, 9);
  }
  function desk(ctx, x, y, w = 620) {
    box(ctx, x - w / 2, y, w, 60, 18, '#d38b4e', '#b06e36', 9, 'bottom', 0.4);
    box(ctx, x - w / 2 + 40, y + 50, 50, 340, 12, '#8a5a3c', null, 8);
    box(ctx, x + w / 2 - 90, y + 50, 50, 340, 12, '#8a5a3c', null, 8);
  }

  function kitchen(ctx, t, o = {}) {
    fill(ctx, '#ffe3f4');
    ctx.strokeStyle = '#ffc2e6'; ctx.lineWidth = 6;
    for (let x = X0; x < X1; x += 90) { ctx.beginPath(); ctx.moveTo(x, Y0); ctx.lineTo(x, 1500); ctx.stroke(); }
    for (let y = Y0; y < 1500; y += 90) { ctx.beginPath(); ctx.moveTo(X0, y); ctx.lineTo(X1, y); ctx.stroke(); }
    // upper cabinets + window
    for (const x of [-120, 120]) box(ctx, x, 200, 220, 300, 18, '#2bb3a3', '#1f8c80', 9);
    windowFrame(ctx, 420, 220, 300, 330, t);
    box(ctx, 780, 200, 260, 300, 18, '#2bb3a3', '#1f8c80', 9);
    // fridge
    box(ctx, 880, 620, 300, 880, 30, '#e8e8f0', '#c9c9da', 10);
    line(ctx, 880, 960, 1180, 960, 9); box(ctx, 900, 760, 24, 140, 10, '#c3c3d3', null, 6); box(ctx, 900, 1010, 24, 160, 10, '#c3c3d3', null, 6);
    // counter
    box(ctx, -200, 1060, 1060, 440, 16, '#ffa53d', '#e38a24', 10);
    box(ctx, -220, 1020, 1100, 60, 16, '#ffd23f', '#e9b520', 9, 'bottom', 0.4);
    for (const x of [-140, 160, 460]) { box(ctx, x, 1120, 240, 330, 14, '#ffb86b', null, 7); circle(ctx, x + 200, 1280, 12, '#8a5a3c', null, 5); }
    // floor checker
    fill(ctx, '#ff7ad9', 1500, Y1);
    ctx.fillStyle = '#ffa8e6';
    for (let y = 1500, r = 0; y < Y1; y += 120, r++) for (let x = X0 + (r % 2) * 120; x < X1; x += 240) ctx.fillRect(x, y, 120, 120);
    line(ctx, X0, 1500, X1, 1500, 9);
  }

  // game world: sky, floating blocks, perspective checkered baseplate
  function cube(ctx, x, y, s, c, cs) {
    const d = s * 0.28;
    shape(ctx, () => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s, y); ctx.closePath(); }, { x, y: y - d, w: s + d, h: d }, '#ffffff', null, 7);
    ctx.save(); ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.restore();
    shape(ctx, () => { ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s + d, y + s - d); ctx.lineTo(x + s, y + s); ctx.closePath(); }, { x: x + s, y: y - d, w: d, h: s }, cs, null, 7);
    box(ctx, x, y, s, s, 6, c, cs, 7, 'bottom', 0.18);
  }
  const BLOCKS = [[60, 520, 150, '#ff5165', '#d63a50'], [820, 380, 120, '#ffd23f', '#e9b520'], [420, 700, 110, '#5dff8f', '#3fd870'], [940, 820, 170, '#c49bff', '#9f74e6'],
    [-120, 900, 130, '#7debff', '#3fc7ea'], [640, 220, 90, '#ffa53d', '#e38a24'], [240, 300, 80, '#ff7ad9', '#e055b8'], [1200, 560, 140, '#5dff8f', '#3fd870']];
  function game(ctx, t, o = {}) {
    const sc = o.scroll || 0, HZ = o.horizon || 1150;
    sky(ctx, '#3aa8ff', '#c9f3ff', Y0, HZ);
    cloud(ctx, ((300 - sc * 0.1) % 1800 + 1800) % 1800 - 300, 260, 0.8);
    cloud(ctx, ((1100 - sc * 0.1) % 1800 + 1800) % 1800 - 300, 640, 0.6);
    // distant obby tower silhouettes
    for (let i = 0; i < 6; i++) {
      const x = ((i * 380 - sc * 0.25) % 2280 + 2280) % 2280 - 600, h = 220 + hash(i) * 260;
      box(ctx, x, HZ - h, 140, h + 20, 12, '#8fc9ff', '#77b3ef', 7);
    }
    // floating blocks with bob
    BLOCKS.forEach(([bx, by, s, c, cs], i) => {
      const x = ((bx - sc * (0.5 + 0.1 * (i % 3))) % 1900 + 1900) % 1900 - 400;
      cube(ctx, x, by + Math.sin(t * 2 + i) * 18, s, c, cs);
    });
    // baseplate
    ctx.fillStyle = '#4ab84a'; ctx.fillRect(X0, HZ, X1 - X0, Y1 - HZ);
    const vx = 540, rows = 14;
    ctx.save(); ctx.beginPath(); ctx.rect(X0, HZ, X1 - X0, Y1 - HZ); ctx.clip();
    for (let r = 0; r < rows; r++) {
      const z0 = r, z1 = r + 1;
      const yA = HZ + (Y1 - HZ) * Math.pow(z0 / rows, 1.8), yB = HZ + (Y1 - HZ) * Math.pow(z1 / rows, 1.8);
      const wA = 0.12 + z0 / rows * 1.6, wB = 0.12 + z1 / rows * 1.6;
      const off = (sc * 0.004) % 2;
      for (let c = -14; c < 14; c++) {
        if ((r + c + Math.floor(off)) % 2 === 0) continue;
        const fr = off % 1, c0 = c - fr, c1 = c + 1 - fr;
        ctx.beginPath();
        ctx.moveTo(vx + c0 * 160 * wA, yA); ctx.lineTo(vx + c1 * 160 * wA, yA); ctx.lineTo(vx + c1 * 160 * wB, yB); ctx.lineTo(vx + c0 * 160 * wB, yB);
        ctx.closePath(); ctx.fillStyle = '#5dd35d'; ctx.fill();
      }
    }
    ctx.restore();
    line(ctx, X0, HZ, X1, HZ, 9);
  }

  function burst(ctx, t, c1, c2, cx = 540, cy = 900) {
    fill(ctx, c1);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6);
    ctx.fillStyle = c2;
    for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 2600, a, a + Math.PI / 22); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700); g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  }

  // VIP throne / gaming chair seen from the back (k: 1 = back, -1 = front open), used for the reveal
  function chairBack(ctx, x, y, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, 1);
    box(ctx, -230, -780, 460, 700, 90, '#6b3fa0', '#53307d', 10);
    box(ctx, -150, -700, 300, 120, 40, '#ffd23f', '#e9b520', 8);
    text(ctx, 'VIP', 0, -638, 96, '#6b3fa0');
    ctx.restore();
  }
  function chairSeat(ctx, x, y) {
    box(ctx, -40 + x, y - 80, 80, 160, 14, '#2a1b3d', null, 8);
    box(ctx, x - 160, y + 60, 320, 40, 16, '#2a1b3d', null, 8);
  }

  G.sets = { bedroom, street, classroom, kitchen, game, burst, bus, desk, spawnPad, cloud, cube, chairBack, chairSeat, windowFrame };
})();
