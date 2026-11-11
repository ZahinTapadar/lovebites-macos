// Event Horizon New Tab: the ringed black hole photo, alive. Light streams along the disk,
// the ground lights breathe, the frame drifts with the mouse. Clock, search and top sites on top.
const $ = (id) => document.getElementById(id);

function tick() {
  const d = new Date(), h = d.getHours();
  $("time").textContent = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, "");
  $("date").textContent = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  $("greet").textContent = h < 5 ? "Deep night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Late orbit";
}
tick();
setInterval(tick, 1000);

// search with the user's default engine; plain google fallback when previewed outside the extension
$("search").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("q").value.trim();
  if (!text) return;
  if (globalThis.chrome?.search?.query) chrome.search.query({ text, disposition: "CURRENT_TAB" });
  else location.href = "https://www.google.com/search?q=" + encodeURIComponent(text);
});

// most visited sites, with Chrome's own favicons
globalThis.chrome?.topSites?.get((list) => {
  for (const s of list.slice(0, 8)) {
    const a = document.createElement("a");
    a.href = s.url; a.title = s.title;
    const img = document.createElement("img");
    img.alt = "";
    img.src = `/_favicon/?pageUrl=${encodeURIComponent(s.url)}&size=32`;
    a.append(img);
    $("sites").append(a);
  }
});

// ---- the living photo ----------------------------------------------------
const cv = $("sky"), ctx = cv.getContext("2d");
// Reduce Motion: the frame holds still (no parallax, no zoom); light keeps moving, slower
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const img = new Image();
img.src = "sky.jpg";

// the disk, measured on the photo (fractions of its width/height): k=0 inner edge, k=1 outer edge
const DISK = { cx0: 0.264, cy0: 0.528, rx0: 0.387, ry0: 0.132, cx1: 0.236, cy1: 0.56, rx1: 0.75, ry1: 0.228 };
const lerp = (a, b, k) => a + (b - a) * k;
let W = 0, H = 0, mx = 0.5, my = 0.5, px = 0.5, py = 0.5;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();
addEventListener("mousemove", (e) => { mx = e.clientX / W; my = e.clientY / H; });

// soft round glow, drawn once and stamped many times
function sprite(r, g, b) {
  const s = document.createElement("canvas"); s.width = s.height = 64;
  const c = s.getContext("2d"), grd = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`); grd.addColorStop(0.25, `rgba(${r},${g},${b},.45)`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  c.fillStyle = grd; c.fillRect(0, 0, 64, 64);
  return s;
}
const EMBER_GLOW = sprite(255, 70, 40);

// colour across the disk: blue inside, white in the bright band, ember at the rim
function tone(k, a) {
  const stops = [[0, [90, 130, 255]], [0.45, [200, 220, 255]], [0.62, [255, 255, 255]], [0.82, [255, 150, 90]], [1, [255, 70, 40]]];
  let i = 1; while (i < stops.length - 1 && k > stops[i][0]) i++;
  const [k0, c0] = stops[i - 1], [k1, c1] = stops[i], t = Math.min(1, Math.max(0, (k - k0) / (k1 - k0)));
  return `rgba(${c0.map((v, j) => Math.round(v + (c1[j] - v) * t)).join(",")},${a})`;
}

const streaks = Array.from({ length: 150 }, newStreak);
function newStreak() {
  const k = Math.pow(Math.random(), 0.8);
  return { k, a: Math.random() * Math.PI * 2,
           len: 0.12 + Math.random() * 0.35, w: 1 + Math.random() * 2.2, life: 0, max: 400 + Math.random() * 900,
           v: (0.9 + Math.random() * 0.3) * 0.0016 / Math.pow(0.3 + k, 1.5) };   // inner light turns faster
}
const lights = Array.from({ length: 140 }, () => ({
  x: Math.random(), y: 0.79 + Math.pow(Math.random(), 0.7) * 0.21, s: 6 + Math.random() * 16,
  ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.4,
}));

function frame(t) {
  if (!calm) { px += (mx - px) * 0.04; py += (my - py) * 0.04; }
  // cover the window with the photo, breathe slowly and lean away from the mouse
  const zoom = 1.06 + (calm ? 0 : 0.015 * Math.sin(t / 9000));
  const s = Math.max(W / img.width, H / img.height) * zoom;
  const iw = img.width * s, ih = img.height * s;
  const ox = (W - iw) / 2 - (px - 0.5) * 36, oy = (H - ih) / 2 - (py - 0.5) * 22;
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(img, ox, oy, iw, ih);

  ctx.globalCompositeOperation = "lighter";
  // ground lights breathe
  for (const l of lights) {
    const a = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t / 1000 * l.sp + l.ph), 3);
    ctx.globalAlpha = a * 0.55;
    ctx.drawImage(EMBER_GLOW, ox + l.x * iw - l.s / 2, oy + l.y * ih - l.s / 2, l.s, l.s);
  }
  ctx.globalAlpha = 1;
  // light streams along the disk
  for (let i = 0; i < streaks.length; i++) {
    const st = streaks[i];
    st.a += calm ? st.v * 0.5 : st.v; st.life++;
    if (st.life > st.max) { streaks[i] = newStreak(); continue; }
    const fade = Math.min(1, st.life / 60, (st.max - st.life) / 60);
    const k = st.k, cx = ox + lerp(DISK.cx0, DISK.cx1, k) * iw, cy = oy + lerp(DISK.cy0, DISK.cy1, k) * ih;
    const rx = lerp(DISK.rx0, DISK.rx1, k) * iw, ry = lerp(DISK.ry0, DISK.ry1, k) * ih;
    const a0 = st.a - st.len, x0 = cx + Math.cos(a0) * rx, y0 = cy + Math.sin(a0) * ry;
    const x1 = cx + Math.cos(st.a) * rx, y1 = cy + Math.sin(st.a) * ry;
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, tone(st.k, 0)); g.addColorStop(0.7, tone(st.k, 0.5 * fade)); g.addColorStop(1, `rgba(255,255,255,${fade})`);
    ctx.strokeStyle = g; ctx.lineWidth = st.w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, st.a); ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(frame);
}
img.decode().then(() => requestAnimationFrame(frame));
