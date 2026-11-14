// ui: captions, DAY cards, HUD counter, toasts, [SYSTEM] chat, chips, subscribe button, cursor,
// poof, confetti, speed lines, loading spinner, glitch, impact, rewind overlay.
(function () {
  const G = window.G;
  const { box, circle, rr, text, clamp, ease, key, hash, popIn, squash } = G;
  const O = G.OUT;

  // ---------------------------------------------------------------- captions
  const KEY = {
    lag: '#ff5165', vida: '#7debff', travando: '#ff5165', 'nããão': '#ff5165', spawn: '#7debff', 'ônibus': '#ffd23f', trava: '#ff5165',
    prova: '#ffa53d', servidor: '#7debff', apaga: '#ff5165', 'três': '#ffa53d', vezes: '#ffa53d', zero: '#ff5165',
    chinelo: '#ff7ad9', chinelos: '#ff5165', dez: '#ff5165', inscreve: '#ff5165', ping: '#5dff8f', cansa: '#ffa53d',
    robux: '#5dff8f', vip: '#c49bff', roteador: '#7debff', 'milhão': '#ffd23f', fps: '#ffd23f', 'rápido': '#5dff8f',
    ganhei: '#5dff8f', 'mãe': '#ff7ad9', 'quê': '#ffd23f', pera: '#ffd23f',
  };
  const SHORT = new Set(['a', 'o', 'e', 'de', 'do', 'da', 'pro', 'no', 'na', 'um', 'uma', 'seu', 'sua', 'suas', 'tem', 'se']);
  const SPLIT = { 1: [2, 2, 2], 11: [2, 2, 3], 21: [1, 2] }; // hand-picked caption breaks
  const SKIP_LINES = new Set([3, 6, 9]); // DAY lines are told by the card
  let CHUNKS = null;
  function buildChunks() {
    CHUNKS = [];
    const lines = G.TL.lines;
    lines.forEach((L, li) => {
      if (SKIP_LINES.has(L.id)) return;
      const nextStart = li + 1 < lines.length ? lines[li + 1].start : L.end + 1;
      const ws = L.words.map(w => {
        const raw = w.w.replace(/\.\.\.|…/g, '').replace(/[.,]/g, '');
        const bare = raw.replace(/[!?]/g, '').toLowerCase();
        const col = KEY[bare];
        return { txt: col ? raw.toUpperCase() : raw, col: col || '#ffffff', s: w.s, end: /[,!?.…]$/.test(w.w) || /\.\.\.$/.test(w.w) };
      });
      let cur = [];
      const flush = () => { if (cur.length) CHUNKS.push({ words: cur, s: cur[0].s }); cur = []; };
      if (SPLIT[L.id]) { let i = 0; for (const n of SPLIT[L.id]) { cur = ws.slice(i, i + n); i += n; flush(); } ws.length = 0; }
      ws.forEach((w, i) => {
        cur.push(w);
        const chars = cur.reduce((a, x) => a + x.txt.length + 1, 0);
        const nxt = ws[i + 1];
        if (cur.length >= 3 || w.end || chars > 13 || (nxt && chars + nxt.txt.length > 15)) {
          let carry = null;
          if (!w.end && nxt && cur.length > 1 && SHORT.has(w.txt.toLowerCase())) carry = cur.pop();
          flush();
          if (carry) cur.push(carry);
        }
      });
      flush();
      // chunk end times
      const mine = CHUNKS.filter(c => c.line === undefined);
      mine.forEach((c, i) => { c.line = L.id; c.e = i + 1 < mine.length ? mine[i + 1].s : Math.min(L.end + 0.35, nextStart - 0.03); });
    });
  }
  function captions(ctx, t) {
    if (!CHUNKS) buildChunks();
    const c = CHUNKS.find(c => t >= c.s && t < c.e);
    if (!c) return;
    const k = clamp((t - c.s) / 0.16);
    const sc = 0.55 + 0.45 * ease.back(k);
    ctx.save();
    ctx.font = `124px ${G.FONT}`;
    const gap = 30;
    const widths = c.words.map(w => ctx.measureText(w.txt).width);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (c.words.length - 1);
    const fit = Math.min(1, 980 / total);
    ctx.translate(540, 1290); ctx.scale(sc * fit, sc * fit);
    let x = -total / 2;
    c.words.forEach((w, i) => {
      text(ctx, w.txt, x + widths[i] / 2, 0, 124, w.col, { lw: 24, stroke: '#1c1030', shadow: 18 });
      x += widths[i] + gap;
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- DAY card
  function dayCard(ctx, t, label, t0) {
    const d = t - t0;
    if (d < 0 || d > 1.05) return;
    let s, rot;
    if (d < 0.22) { s = ease.back(d / 0.22); rot = -0.35 + 0.25 * ease.out(d / 0.22); }
    else if (d < 0.9) { s = 1 + Math.sin((d - 0.22) * 9) * 0.025; rot = -0.105 + Math.sin(d * 7) * 0.012; }
    else { const k = (d - 0.9) / 0.15; s = 1 + 0.15 * k - 1.15 * ease.in(k); rot = -0.105 - 0.2 * k; }
    ctx.save(); ctx.translate(540, 430); ctx.rotate(rot); ctx.scale(Math.max(0, s), Math.max(0, s));
    text(ctx, label, 0, 0, 230, '#ffd23f', { lw: 38, stroke: '#1c1030', shadow: 26 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- HUD counter pill
  const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function hud(ctx, t, st) {
    // st: {t0, label, value, icon:'lag'|'fps', color, plus:[[t, '+1', color]]}
    if (!st || t < st.t0) return;
    const s = popIn(t, st.t0, 0.32) * (st.bump ? 1 + 0.12 * Math.max(0, 1 - (t - st.bump) / 0.18) : 1);
    const val = fmt(st.value);
    ctx.save(); ctx.translate(540, 196); ctx.scale(s, s);
    ctx.font = `60px ${G.FONT}`;
    const w = Math.max(236, ctx.measureText(val).width + 130);
    box(ctx, -w / 2, -46, w, 92, 46, 'rgba(28,16,48,0.82)', null, 6);
    const ix = -w / 2 + 48;
    if (st.icon === 'fps') { circle(ctx, ix, 0, 30, '#5dff8f', '#3fd870', 5); G.starPath(ctx, ix, 0, 18, 8, 5); ctx.fillStyle = '#fff'; ctx.fill(); }
    else spinner(ctx, ix, 0, 26, t, '#ff5165');
    text(ctx, val, ix + 44 + (w - 96) / 2 - 22, 4, 60, st.color || '#fff', { lw: 10, stroke: '#1c1030' });
    box(ctx, -86, -76, 172, 40, 20, st.labelBg || '#ff5165', null, 5);
    text(ctx, st.label, 0, -55, 30, '#fff', { lw: 6, stroke: '#1c1030' });
    ctx.restore();
    for (const [pt, ptxt, pc] of st.plus || []) {
      const d = t - pt;
      if (d < 0 || d > 0.8) continue;
      const k = d / 0.8;
      ctx.save(); ctx.globalAlpha = 1 - ease.in(k);
      const ps = popIn(t, pt, 0.18);
      ctx.translate(540 + w / 2 * s + 30, 196 - 70 * ease.out(k)); ctx.scale(ps, ps);
      text(ctx, ptxt, 0, 0, 64, pc || '#5dff8f', { lw: 12, stroke: '#1c1030' });
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- toast pill (y 330)
  function toast(ctx, t, t0, dur, msg, color = '#ff5165', icon = '!') {
    const d = t - t0;
    if (d < 0 || d > dur) return;
    let s = d < 0.3 ? squash(t, t0) * ease.back(clamp(d / 0.2)) : 1;
    if (d > dur - 0.15) s = ease.in(1 - (d - (dur - 0.15)) / 0.15) * 1.05;
    ctx.save(); ctx.font = `46px ${G.FONT}`;
    const w = Math.min(980, ctx.measureText(msg).width + 150);
    ctx.translate(540, 330); ctx.scale(s, s);
    box(ctx, -w / 2, -44, w, 88, 44, '#ffffff', '#ece6fb', 7, 'bottom', 0.3);
    circle(ctx, -w / 2 + 50, 0, 30, color, null, 6);
    text(ctx, icon, -w / 2 + 50, 3, 44, '#fff', { lw: 6, stroke: '#1c1030' });
    text(ctx, msg, -w / 2 + 92 + (w - 120) / 2, 3, 46, color, { lw: 9, stroke: '#1c1030', maxW: w - 120 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- [SYSTEM] chat (top-left)
  function chat(ctx, t, lines) {
    const vis = lines.filter(([t0]) => t >= t0 && t < t0 + 3.4).slice(-3);
    if (!vis.length) return;
    ctx.save();
    box(ctx, 28, 142, 352, 24 + vis.length * 42, 20, 'rgba(20,10,40,0.5)', null, 0);
    vis.forEach(([t0, msg], i) => {
      const k = ease.back(clamp((t - t0) / 0.25));
      const y = 176 + i * 42, x = 44 - 300 * (1 - k);
      ctx.font = `30px ${G.FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const full = ctx.measureText('[SYSTEM] ' + msg).width, fk = Math.min(1, 318 / full);
      ctx.save(); ctx.translate(x, y); ctx.scale(fk, 1); ctx.translate(-x, -y);
      ctx.lineWidth = 7; ctx.strokeStyle = '#1c1030';
      ctx.strokeText('[SYSTEM]', x, y); ctx.fillStyle = '#ffd23f'; ctx.fillText('[SYSTEM]', x, y);
      const sx = x + ctx.measureText('[SYSTEM] ').width;
      ctx.strokeText(msg, sx, y); ctx.fillStyle = '#fff'; ctx.fillText(msg, sx, y);
      ctx.restore();
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- chips
  function miniHead(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    box(ctx, -40, -36, 80, 74, 22, '#ffcf9e', '#e9a874', 6);
    G.shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-42, -14); ctx.quadraticCurveTo(-40, -48, 0, -48); ctx.quadraticCurveTo(40, -48, 42, -14); ctx.closePath(); }, { x: -42, y: -48, w: 84, h: 34 }, '#2e88ee', '#1f69c2', 6);
    circle(ctx, -15, 4, 6, '#2a1b3d', null, 0); circle(ctx, 15, 4, 6, '#2a1b3d', null, 0);
    ctx.beginPath(); ctx.arc(0, 8, 14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.lineWidth = 5; ctx.strokeStyle = O; ctx.stroke();
    ctx.restore();
  }
  function chips(ctx, t, clock, t0 = 0) {
    const s = popIn(t, t0, 0.3);
    if (s <= 0) return;
    ctx.save(); ctx.translate(30, 46); ctx.scale(s, s);
    box(ctx, 0, 0, 268, 76, 38, 'rgba(28,16,48,0.82)', null, 5);
    miniHead(ctx, 40, 40, 0.7);
    text(ctx, 'Você', 150, 40, 42, '#fff', { lw: 8 });
    circle(ctx, 236, 38, 14, '#5dff8f', null, 4);
    ctx.restore();
    ctx.save(); ctx.translate(1050, 46); ctx.scale(s, s);
    box(ctx, -230, 0, 230, 76, 38, 'rgba(28,16,48,0.82)', null, 5);
    circle(ctx, -190, 38, 24, '#fff', null, 5);
    ctx.beginPath(); ctx.moveTo(-190, 38); ctx.lineTo(-190, 24); ctx.moveTo(-190, 38); ctx.lineTo(-180, 44); ctx.lineWidth = 5; ctx.strokeStyle = O; ctx.lineCap = 'round'; ctx.stroke();
    text(ctx, clock, -96, 41, 46, '#fff', { lw: 8 });
    ctx.restore();
  }

  // ---------------------------------------------------------------- subscribe button + cursor
  function cursorHand(ctx, x, y, s, press) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - 0.12 * press), s * (1 - 0.12 * press)); ctx.rotate(-0.25);
    const p = () => {
      ctx.beginPath();
      ctx.moveTo(-14, -60); ctx.quadraticCurveTo(-14, -78, 0, -78); ctx.quadraticCurveTo(14, -78, 14, -60);
      ctx.lineTo(14, -18); ctx.lineTo(40, -14); ctx.quadraticCurveTo(58, -10, 56, 10); ctx.lineTo(50, 50); ctx.quadraticCurveTo(46, 70, 26, 70);
      ctx.lineTo(-18, 70); ctx.quadraticCurveTo(-30, 70, -36, 58); ctx.lineTo(-58, 12); ctx.quadraticCurveTo(-62, 0, -50, -4); ctx.quadraticCurveTo(-38, -6, -32, 6); ctx.lineTo(-14, 26); ctx.closePath();
    };
    G.shape(ctx, p, { x: -62, y: -78, w: 120, h: 148 }, '#ffffff', '#dcd6f0', 7);
    ctx.restore();
  }
  function subscribe(ctx, t, t0, tPress, cx = 540, cy = 980) {
    if (t < t0) return;
    const s = ease.back(clamp((t - t0) / 0.3)) * (t > tPress && t < tPress + 0.15 ? 0.92 : 1);
    const pressed = t >= tPress;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    box(ctx, -300, -82, 600, 164, 82, pressed ? '#5a5470' : '#ff2d3d', pressed ? '#47425a' : '#d81f30', 9, 'bottom', 0.3);
    text(ctx, pressed ? 'INSCRITO' : 'INSCREVER-SE', pressed ? -10 : 0, 6, 74, '#fff', { lw: 10, stroke: '#1c1030' });
    if (pressed) { // bell pops
      const b = ease.backBig(clamp((t - tPress - 0.1) / 0.3));
      ctx.save(); ctx.translate(230, -6); ctx.scale(b, b); ctx.rotate(Math.sin((t - tPress) * 22) * 0.3 * Math.max(0, 1 - (t - tPress)));
      G.shape(ctx, () => { ctx.beginPath(); ctx.moveTo(-26, 18); ctx.quadraticCurveTo(-26, -30, 0, -32); ctx.quadraticCurveTo(26, -30, 26, 18); ctx.closePath(); }, { x: -26, y: -32, w: 52, h: 50 }, '#ffd23f', '#e9b520', 6);
      circle(ctx, 0, 24, 8, '#ffd23f', null, 5);
      ctx.restore();
      // ripple
      const r = clamp((t - tPress) / 0.45);
      if (r < 1) { ctx.beginPath(); rr(ctx, -300 - r * 60, -82 - r * 60, 600 + r * 120, 164 + r * 120, 82 + r * 60); ctx.lineWidth = 10 * (1 - r); ctx.strokeStyle = '#fff'; ctx.stroke(); }
    }
    ctx.restore();
    // cursor travels in, presses, leaves
    const hx = key(t, [[t0, 980], [tPress - 0.05, cx + 120], [tPress + 0.5, cx + 140], [tPress + 1.2, 1200]], ease.inOut);
    const hy = key(t, [[t0, 1500], [tPress - 0.05, cy + 70], [tPress + 0.5, cy + 80], [tPress + 1.2, 1600]], ease.inOut);
    const press = clamp(1 - Math.abs(t - tPress) / 0.12);
    cursorHand(ctx, hx, hy, 1.3, press);
  }

  // ---------------------------------------------------------------- effects
  function poof(ctx, x, y, s, t0, t, dur = 0.5) {
    const d = (t - t0) / dur;
    if (d < 0 || d > 1) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + hash(i) * 0.5, dist = 40 + 130 * ease.out(d);
      const r = (46 + hash(i + 9) * 30) * (d < 0.35 ? ease.back(d / 0.35) : 1 - ease.in((d - 0.35) / 0.65));
      if (r <= 0) continue;
      circle(ctx, Math.cos(a) * dist, Math.sin(a) * dist * 0.75, r, '#ffffff', '#e6e0f5', 7);
    }
    const c = 90 * (d < 0.3 ? ease.back(d / 0.3) : 1 - ease.in((d - 0.3) / 0.7));
    if (c > 0) circle(ctx, 0, 0, c, '#ffffff', '#e6e0f5', 7);
    ctx.restore();
  }
  const CONF = ['#ff5165', '#5dff8f', '#ffd23f', '#ff7ad9', '#7debff', '#ffa53d', '#c49bff'];
  function confetti(ctx, t, t0, n = 90, cx = 540, cy = 700, dur = 2.6) {
    const d = t - t0;
    if (d < 0 || d > dur) return;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (hash(i) - 0.5) * 2.6, v = 900 + hash(i + 1) * 1300;
      const x = cx + Math.cos(a) * v * d, y = cy + Math.sin(a) * v * d + 1400 * d * d;
      ctx.save(); ctx.translate(x + Math.sin(d * 8 + i) * 30, y); ctx.rotate(d * (6 + hash(i + 2) * 10));
      ctx.scale(1, Math.cos(d * 12 + i));
      ctx.fillStyle = CONF[i % CONF.length]; ctx.fillRect(-14, -9, 28, 18);
      ctx.restore();
    }
  }
  function speedLines(ctx, t, n = 22, color = 'rgba(255,255,255,0.85)', dir = -1) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const y = hash(i) * 1920, len = 200 + hash(i + 3) * 400, sp = 3000 + hash(i + 5) * 2000;
      const x = ((hash(i + 7) * 2000 + t * sp * -dir) % 2400 + 2400) % 2400 - 600;
      ctx.lineWidth = 6 + hash(i + 11) * 10;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * -dir, y); ctx.stroke();
    }
    ctx.restore();
  }
  function spinner(ctx, x, y, r, t, color = '#ffffff') {
    ctx.save(); ctx.translate(x, y);
    const head = Math.floor(t * 12) % 8;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2, k = ((i - head + 8) % 8) / 8;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, r * 0.26 * (0.6 + 0.4 * (1 - k)), 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.globalAlpha = 0.25 + 0.75 * (1 - k); ctx.fill();
    }
    ctx.restore();
  }
  function bigSpinner(ctx, x, y, s, t, t0) {
    const k = popIn(t, t0, 0.3);
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k);
    circle(ctx, 0, 0, 92, 'rgba(28,16,48,0.85)', null, 7);
    spinner(ctx, 0, 0, 58, t, '#ffffff');
    ctx.restore();
  }
  let TMP = null;
  function glitch(ctx, t, amt) {
    if (amt <= 0) return;
    const cv = ctx.canvas;
    if (!TMP) { TMP = document.createElement('canvas'); TMP.width = cv.width; TMP.height = cv.height; }
    const tc = TMP.getContext('2d');
    tc.clearRect(0, 0, cv.width, cv.height); tc.drawImage(cv, 0, 0);
    const seed = Math.floor(t * 30);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < 7; i++) {
      const y = hash(seed * 13 + i) * 1920, h = 30 + hash(seed * 7 + i) * 160, dx = (hash(seed * 3 + i) - 0.5) * 140 * amt;
      ctx.drawImage(TMP, 0, y, 1080, h, dx, y, 1080, h);
    }
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * amt;
    ctx.drawImage(TMP, 14 * amt, 0);
    ctx.restore();
  }
  function impact(ctx, x, y, s, t0, t, color = '#ffd23f') {
    const d = (t - t0) / 0.45;
    if (d < 0 || d > 1) return;
    const k = d < 0.3 ? ease.back(d / 0.3) : 1 - ease.in((d - 0.3) / 0.7);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * k, s * k); ctx.rotate(d * 0.4);
    G.starPath(ctx, 0, 0, 170, 80, 10); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = O; ctx.stroke();
    G.starPath(ctx, 0, 0, 90, 46, 10); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  }
  function stamp(ctx, msg, x, y, size, color, t0, t, rot = -0.12) {
    const k = popIn(t, t0, 0.25);
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    text(ctx, msg, 0, 0, size, color, { lw: size * 0.16, stroke: '#1c1030', shadow: 14 });
    ctx.restore();
  }
  function rewindOverlay(ctx, t, k) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(40,0,80,0.18)'; ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (let y = 0; y < 1920; y += 8) ctx.fillRect(0, y, 1080, 3);
    for (let i = 0; i < 4; i++) { // tracking bands
      const y = ((hash(i) * 1920 + t * 2600 * (1 + i * 0.3)) % 2100) - 100;
      ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(0, y, 1080, 18 + i * 8);
    }
    const s = popIn(k, 0, 0.2);
    ctx.translate(90, 150); ctx.scale(s, s);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1c1030'; ctx.lineWidth = 10;
    for (const ox of [0, 56]) { ctx.beginPath(); ctx.moveTo(ox + 56, -40); ctx.lineTo(ox, 0); ctx.lineTo(ox + 56, 40); ctx.closePath(); ctx.stroke(); ctx.fill(); }
    text(ctx, 'REWIND', 330, 6, 96, '#ffffff', { lw: 16, stroke: '#1c1030', align: 'center' });
    ctx.restore();
  }

  G.ui = { captions, dayCard, hud, toast, chat, chips, subscribe, cursorHand, poof, confetti, speedLines, spinner, bigSpinner, glitch, impact, stamp, rewindOverlay, fmt };
})();
