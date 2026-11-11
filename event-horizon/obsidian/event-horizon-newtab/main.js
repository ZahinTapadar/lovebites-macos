// Event Horizon New Tab: the same living black hole as the Chrome new tab, drawn into Obsidian's empty tabs.
// It does nothing unless the active theme is "Event Horizon", so other themes keep their own empty tab.
const { Plugin } = require("obsidian");

const THEME = "Event Horizon";
// the disk, measured on the photo (fractions of its width/height): k=0 inner edge, k=1 outer edge
const DISK = { cx0: 0.264, cy0: 0.528, rx0: 0.387, ry0: 0.132, cx1: 0.236, cy1: 0.56, rx1: 0.75, ry1: 0.228 };
const lerp = (a, b, k) => a + (b - a) * k;

// colour across the disk: blue inside, white in the bright band, ember at the rim
function tone(k, a) {
  const stops = [[0, [90, 130, 255]], [0.45, [200, 220, 255]], [0.62, [255, 255, 255]], [0.82, [255, 150, 90]], [1, [255, 70, 40]]];
  let i = 1; while (i < stops.length - 1 && k > stops[i][0]) i++;
  const [k0, c0] = stops[i - 1], [k1, c1] = stops[i], t = Math.min(1, Math.max(0, (k - k0) / (k1 - k0)));
  return `rgba(${c0.map((v, j) => Math.round(v + (c1[j] - v) * t)).join(",")},${a})`;
}

class Scene {
  constructor(plugin, host) {
    this.plugin = plugin;
    const app = plugin.app, doc = host.doc, win = host.win;
    this.win = win;
    this.el = host.createDiv({ cls: "eh-newtab" });
    this.cv = this.el.createEl("canvas", { cls: "eh-sky", attr: { "aria-hidden": "true" } });
    this.el.createDiv({ cls: "eh-veil", attr: { "aria-hidden": "true" } });
    const head = this.el.createDiv({ cls: "eh-head" });
    this.greet = head.createEl("p", { cls: "eh-kicker eh-greet" });
    this.time = head.createEl("h1", { cls: "eh-time" });
    this.date = head.createEl("p", { cls: "eh-kicker" });
    const dock = this.el.createDiv({ cls: "eh-dock" });
    const input = dock.createEl("input", { cls: "eh-q", attr: { type: "search", placeholder: "Search the vault", "aria-label": "Search the vault" } });
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || !input.value.trim()) return;
      app.internalPlugins.getPluginById("global-search")?.instance.openGlobalSearch(input.value.trim());
    });
    const recent = dock.createDiv({ cls: "eh-recent" });
    for (const path of app.workspace.getLastOpenFiles().slice(0, 6)) {
      const name = path.split("/").pop().replace(/\.md$/, "");
      recent.createEl("button", { text: name, attr: { title: path } }).addEventListener("click", () => app.workspace.openLinkText(path, "", false));
    }

    this.ctx = this.cv.getContext("2d");
    this.calm = win.matchMedia("(prefers-reduced-motion: reduce)").matches;   // frame holds still; light still moves, slower
    this.mx = this.my = this.px = this.py = 0.5;
    this.el.addEventListener("mousemove", (e) => { const r = this.el.getBoundingClientRect(); this.mx = (e.clientX - r.left) / r.width; this.my = (e.clientY - r.top) / r.height; });
    this.glow = this.sprite(doc, 255, 70, 40);
    this.streaks = Array.from({ length: 150 }, () => this.streak());
    this.lights = Array.from({ length: 140 }, () => ({ x: Math.random(), y: 0.79 + Math.pow(Math.random(), 0.7) * 0.21, s: 6 + Math.random() * 16, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 1.4 }));
    this.img = new Image();
    this.img.src = plugin.sky;
    this.img.decode().then(() => { this.raf = win.requestAnimationFrame((t) => this.frame(t)); }).catch(() => {});
    this.clock = win.setInterval(() => this.tick(), 1000);
    this.tick();
  }

  sprite(doc, r, g, b) {
    const s = doc.createElement("canvas"); s.width = s.height = 64;
    const c = s.getContext("2d"), grd = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, `rgba(${r},${g},${b},1)`); grd.addColorStop(0.25, `rgba(${r},${g},${b},.45)`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    c.fillStyle = grd; c.fillRect(0, 0, 64, 64);
    return s;
  }

  streak() {
    const k = Math.pow(Math.random(), 0.8);
    return { k, a: Math.random() * Math.PI * 2, len: 0.12 + Math.random() * 0.35, w: 1 + Math.random() * 2.2, life: 0, max: 400 + Math.random() * 900,
             v: (0.9 + Math.random() * 0.3) * 0.0016 / Math.pow(0.3 + k, 1.5) };
  }

  tick() {
    const d = new Date(), h = d.getHours();
    this.time.setText(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/i, ""));
    this.date.setText(d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }));
    this.greet.setText(h < 5 ? "Deep night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 22 ? "Good evening" : "Late orbit");
  }

  frame(t) {
    this.raf = this.win.requestAnimationFrame((n) => this.frame(n));
    const W = this.el.clientWidth, H = this.el.clientHeight;
    if (!W || !H) return;                                        // tab hidden behind another one
    const dpr = Math.min(this.win.devicePixelRatio || 1, 2), ctx = this.ctx, img = this.img;
    if (this.cv.width !== Math.round(W * dpr) || this.cv.height !== Math.round(H * dpr)) {
      this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.calm) { this.px += (this.mx - this.px) * 0.04; this.py += (this.my - this.py) * 0.04; }
    const zoom = 1.06 + (this.calm ? 0 : 0.015 * Math.sin(t / 9000));
    const s = Math.max(W / img.width, H / img.height) * zoom, iw = img.width * s, ih = img.height * s;
    const ox = (W - iw) / 2 - (this.px - 0.5) * 36, oy = (H - ih) / 2 - (this.py - 0.5) * 22;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(img, ox, oy, iw, ih);
    ctx.globalCompositeOperation = "lighter";
    for (const l of this.lights) {
      ctx.globalAlpha = (0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t / 1000 * l.sp + l.ph), 3)) * 0.55;
      ctx.drawImage(this.glow, ox + l.x * iw - l.s / 2, oy + l.y * ih - l.s / 2, l.s, l.s);
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < this.streaks.length; i++) {
      const st = this.streaks[i];
      st.a += this.calm ? st.v * 0.5 : st.v; st.life++;
      if (st.life > st.max) { this.streaks[i] = this.streak(); continue; }
      const fade = Math.min(1, st.life / 60, (st.max - st.life) / 60), k = st.k;
      const cx = ox + lerp(DISK.cx0, DISK.cx1, k) * iw, cy = oy + lerp(DISK.cy0, DISK.cy1, k) * ih;
      const rx = lerp(DISK.rx0, DISK.rx1, k) * iw, ry = lerp(DISK.ry0, DISK.ry1, k) * ih;
      const a0 = st.a - st.len, g = ctx.createLinearGradient(cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry, cx + Math.cos(st.a) * rx, cy + Math.sin(st.a) * ry);
      g.addColorStop(0, tone(k, 0)); g.addColorStop(0.7, tone(k, 0.5 * fade)); g.addColorStop(1, `rgba(255,255,255,${fade})`);
      ctx.strokeStyle = g; ctx.lineWidth = st.w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, st.a); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  destroy() {
    this.win.cancelAnimationFrame(this.raf);
    this.win.clearInterval(this.clock);
    this.el.detach();
  }
}

module.exports = class EventHorizonNewTab extends Plugin {
  onload() {
    this.sky = this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/sky.jpg`);
    this.scenes = new Map();   // leaf view content element -> Scene
    const sync = () => this.sync();
    this.app.workspace.onLayoutReady(sync);
    this.registerEvent(this.app.workspace.on("layout-change", sync));
    this.registerEvent(this.app.workspace.on("css-change", sync));   // fires when the theme changes
  }

  sync() {
    const on = this.app.customCss.theme === THEME;
    const wanted = new Set();
    if (on) this.app.workspace.iterateAllLeaves((leaf) => { if (leaf.view.getViewType() === "empty") wanted.add(leaf.view.contentEl); });
    for (const [host, scene] of this.scenes) {
      if (!wanted.has(host) || !host.isConnected) { scene.destroy(); host.removeClass("eh-newtab-host"); this.scenes.delete(host); }
    }
    for (const host of wanted) {
      if (this.scenes.has(host)) continue;
      host.addClass("eh-newtab-host");
      this.scenes.set(host, new Scene(this, host));
    }
  }

  onunload() {
    for (const [host, scene] of this.scenes) { scene.destroy(); host.removeClass("eh-newtab-host"); }
    this.scenes.clear();
  }
};
