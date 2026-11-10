// LoveBites New Tab: clock, greeting, search, and a field of rising petals.
const $ = (id) => document.getElementById(id);

function tick() {
  const d = new Date(), h = d.getHours();
  $("time").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  $("date").textContent = d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
  $("greet").textContent = h < 5 ? "Still awake" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Good night";
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

// ---- petals --------------------------------------------------------------
const cv = $("petals"), ctx = cv.getContext("2d");
const GLYPHS = ["❤", "✿", "❀", "✦", "•", "•"];
const dark = matchMedia("(prefers-color-scheme: dark)");
let W = 0, H = 0, dpr = 1, mx = 0.5, my = 0.5;
const petals = [];

function resize() {
  dpr = devicePixelRatio || 1;
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();
addEventListener("mousemove", (e) => { mx = e.clientX / W; my = e.clientY / H; });

function petal(x, y, burst) {
  const a = burst ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
  const v = burst ? 1.5 + Math.random() * 4 : 0.25 + Math.random() * 0.55;
  return {
    x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
    size: burst ? 10 + Math.random() * 16 : 8 + Math.random() * 18,
    depth: 0.3 + Math.random() * 0.9,            // nearer petals drift more with the mouse
    rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.03,
    sway: Math.random() * 6.28, hue: 340 + Math.random() * 30,
    life: burst ? 1 : Infinity, glyph: GLYPHS[(Math.random() * GLYPHS.length) | 0],
  };
}
for (let i = 0; i < 46; i++) petals.push(petal(Math.random() * innerWidth, Math.random() * innerHeight, false));

function burst(x, y, n) { for (let i = 0; i < n; i++) petals.push(petal(x, y, true)); }
addEventListener("click", (e) => { if (e.target !== $("q")) burst(e.clientX, e.clientY, 18); });
$("q").addEventListener("input", () => {
  const r = $("q").getBoundingClientRect();
  burst(r.left + 26 + Math.min(r.width - 52, $("q").value.length * 9), r.top + r.height / 2, 2);
});

function frame(t) {
  ctx.clearRect(0, 0, W, H);
  const light = dark.matches ? 72 : 68;
  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];
    p.sway += 0.012;
    p.x += p.vx + Math.sin(p.sway) * 0.35 * p.depth;
    p.y += p.vy;
    p.rot += p.spin;
    if (p.life !== Infinity) { p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.03; p.life -= 0.012; if (p.life <= 0) { petals.splice(i, 1); continue; } }
    else if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W; }   // ambient petals loop forever
    const px = p.x + (mx - 0.5) * 60 * p.depth, py = p.y + (my - 0.5) * 40 * p.depth;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.rot);
    ctx.globalAlpha = (p.life === Infinity ? 0.25 + 0.45 * p.depth : p.life) * (0.85 + 0.15 * Math.sin(t / 900 + p.sway));
    ctx.fillStyle = `hsl(${p.hue} 100% ${light}%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12 * p.depth;
    ctx.font = `${p.size * p.depth}px serif`;
    ctx.fillText(p.glyph, 0, 0);
    ctx.restore();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
