"use strict";
const { Plugin, PluginSettingTab, Setting, ItemView, MarkdownView, debounce, setTooltip } = require("obsidian");
const { EditorView } = require("@codemirror/view");

const STATS_VIEW = "lovebites-stats";
const DEFAULTS = { glide: true, particles: true, milestones: true, followSystemMotion: false, goal: 500, every: 100, history: {} };
const GLYPHS = ["•", "•", "·", "✦", "❤", "✿"];
const READ_WPM = 230;
const IDLE_MS = 20000; // a pause longer than this does not count as writing time
const dayKey = (d = new Date()) => d.toLocaleDateString("en-CA"); // local YYYY-MM-DD
const countWords = (text) => (String(text).match(/\S+/g) || []).length;
const systemReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const fmt = (n) => n.toLocaleString();

module.exports = class LoveBitesBloom extends Plugin {
  async onload() {
    const saved = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULTS, saved, { history: Object.assign({}, saved.history) });
    // v1 kept only today's count; carry it into the history
    if (saved.day && saved.words) this.settings.history[saved.day] = { w: saved.words, s: 0 };
    delete this.settings.day; delete this.settings.words;
    this.save = debounce(() => this.saveData(this.settings), 1500, true);
    this.refreshStats = debounce(() => this.statsViews().forEach((v) => v.render(false)), 400, false);

    this.layer = document.body.createDiv({ cls: "lb-bloom-layer" });
    this.caret = document.body.createDiv({ cls: "lb-caret" });
    this.progress = document.body.createDiv({ cls: "lb-progress" });
    this.folio = document.body.createDiv({ cls: "lb-folio" });
    this.applyBodyClasses();
    this.registerDomEvent(systemReduce, "change", () => this.applyBodyClasses());

    this.ring = this.addStatusBarItem();
    this.ring.addClass("lb-ring");
    this.ring.innerHTML = '<svg viewBox="0 0 16 16"><circle class="lb-ring-bg" cx="8" cy="8" r="6"/><circle class="lb-ring-fg" cx="8" cy="8" r="6"/></svg><span class="lb-ring-text"></span>';
    this.ring.onClickEvent(() => this.openStats());
    this.modeEl = this.addStatusBarItem();
    this.modeEl.addClass("lb-mode");
    this.modeEl.onClickEvent(() => this.setReading(!this.reading));
    this.reading = false;
    this.renderRing();
    this.renderModePill();

    this.registerView(STATS_VIEW, (leaf) => new StatsView(leaf, this));
    this.addCommand({ id: "open-stats", name: "Open writing statistics", callback: () => this.openStats() });
    this.addCommand({ id: "toggle-reading", name: "Toggle Reading mode (book)", hotkeys: [{ modifiers: ["Mod", "Shift"], key: "b" }], callback: () => this.setReading(!this.reading) });

    this.measureKey = {};
    this.lastBurst = 0;
    this.registerEditorExtension(EditorView.updateListener.of((u) => this.onUpdate(u)));
    this.registerDomEvent(document, "scroll", (e) => this.onScroll(e), { capture: true, passive: true });
    this.registerDomEvent(window, "keydown", (e) => {
      if (e.key === "Escape" && this.reading && !document.querySelector(".modal-container, .menu, .suggestion-container")) this.setReading(false);
    });
    // switching notes, panes or reading/editing: drop the caret until an editor reports focus again
    const reset = () => { this.view = null; this.caret.removeClass("is-on"); };
    this.registerEvent(this.app.workspace.on("layout-change", reset));
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => { reset(); if (this.reading) this.applyModeToActive(); this.refreshStats(); }));
    this.registerEvent(this.app.workspace.on("file-open", () => { if (this.reading) setTimeout(() => this.applyModeToActive(), 30); }));
    this.app.workspace.onLayoutReady(() => this.restoreSides());
    this.addSettingTab(new BloomTab(this.app, this));
  }

  onunload() {
    [this.layer, this.caret, this.progress, this.folio].forEach((el) => el?.remove());
    document.body.removeClass("lb-glide", "lb-calm", "lb-reading");
  }

  // ---- shared -----------------------------------------------------------
  calm() { return this.settings.followSystemMotion && systemReduce.matches; } // user opted to follow macOS Reduce Motion

  applyBodyClasses() {
    document.body.toggleClass("lb-calm", this.calm());
    document.body.toggleClass("lb-glide", this.settings.glide && !this.calm());
  }

  day(key = dayKey()) {
    const h = this.settings.history;
    if (!h[key]) h[key] = { w: 0, s: 0 };
    return h[key];
  }

  // ---- writing: caret, petals, milestones -------------------------------
  onUpdate(u) {
    if (u.docChanged && u.transactions.some((t) => t.isUserEvent("input") || t.isUserEvent("delete"))) this.lastEditAt = performance.now();
    const typed = u.docChanged && u.transactions.some((t) => t.isUserEvent("input.type"));
    if (typed) {
      const now = Date.now();
      if (this.lastType && now - this.lastType < IDLE_MS) this.day().s += (now - this.lastType) / 1000;
      this.lastType = now;
      const delta = countWords(u.state.doc) - countWords(u.startState.doc);
      if (delta > 0) this.addWords(delta);
    }
    if (typed || u.selectionSet || u.focusChanged || u.geometryChanged || u.viewportChanged) {
      if (u.view.hasFocus) this.view = u.view;
      this.measure(u.view, typed, false);
    }
  }

  onScroll(e) {
    if (e.target instanceof HTMLElement && e.target.classList.contains("cm-scroller")) this.glideScroll(e.target);
    if (this.view) this.measure(this.view, false, true); // keep the caret glued (typewriter mode scrolls every line)
    if (this.reading && e.target instanceof HTMLElement && e.target.matches(".markdown-preview-view")) this.updateProgress(e.target);
  }

  // Typewriter Mode recenters with an instant scroll on every Enter/wrap. When a scroll lands right after an
  // edit, rewind it and glide to the same place instead. Wheel/trackpad scrolling is never touched.
  glideScroll(el) {
    this.tops ??= new WeakMap(); this.ours ??= new WeakMap(); this.anims ??= new WeakMap();
    const top = el.scrollTop, prev = this.tops.get(el) ?? top;
    this.tops.set(el, top);
    const ours = this.ours.get(el);
    if (ours != null && Math.abs(top - ours) < 1) return; // an event from our own animation frame
    const anim = this.anims.get(el);
    const delta = top - prev;
    const justEdited = performance.now() - (this.lastEditAt || 0) < 150;
    if (!justEdited || this.calm() || Math.abs(delta) < 1 || Math.abs(delta) > 800) {
      if (anim) { cancelAnimationFrame(anim.raf); this.anims.delete(el); this.ours.delete(el); }
      return;
    }
    if (anim) cancelAnimationFrame(anim.raf);
    const from = prev, to = top, t0 = performance.now(), dur = 190;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - k, 3);
      const v = from + (to - from) * ease;
      this.ours.set(el, v);
      el.scrollTop = v;
      if (k < 1) this.anims.set(el, { raf: requestAnimationFrame(step) });
      else { this.anims.delete(el); this.ours.delete(el); }
    };
    this.ours.set(el, from);
    el.scrollTop = from; // undo the jump this same frame, then glide
    this.anims.set(el, { raf: requestAnimationFrame(step) });
  }

  measure(view, burst, instant) {
    view.requestMeasure({
      key: this.measureKey,
      read: (v) => {
        const sel = v.state.selection.main;
        if (!v.hasFocus || !sel.empty || !v.dom.isShown()) return null;
        const c = v.coordsAtPos(sel.head);
        const box = v.scrollDOM.getBoundingClientRect();
        if (!c || c.bottom < box.top || c.top > box.bottom) return null;
        return c;
      },
      write: (c) => this.place(c, burst, instant),
    });
  }

  place(c, burst, instant) {
    const el = this.caret;
    if (!c || !this.settings.glide) { el.removeClass("is-on"); return; }
    el.toggleClass("no-anim", !!instant);
    el.style.transform = `translate(${c.left}px, ${c.top}px)`;
    el.style.height = `${c.bottom - c.top}px`;
    el.addClass("is-on");
    if (burst) {
      el.addClass("is-typing");
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => el.removeClass("is-typing"), 650);
      this.typeBurst(c.left, (c.top + c.bottom) / 2);
    }
  }

  typeBurst(x, y) {
    if (!this.settings.particles || this.calm()) return;
    const now = performance.now();
    if (now - this.lastBurst < 45) return;
    this.lastBurst = now;
    this.spawn(x, y, 2, false);
  }

  spawn(x, y, n, big) {
    for (let i = 0; i < n; i++) {
      const p = this.layer.createSpan({ cls: "lb-p", text: GLYPHS[(Math.random() * GLYPHS.length) | 0] });
      const ang = big ? Math.random() * Math.PI * 2 : -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const dist = big ? 80 + Math.random() * 220 : 12 + Math.random() * 26;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.setProperty("--dx", `${Math.cos(ang) * dist}px`);
      p.style.setProperty("--dy", `${Math.sin(ang) * dist + (big ? 60 : 0)}px`);
      p.style.setProperty("--r", `${(Math.random() - 0.5) * 240}deg`);
      p.style.setProperty("--s", `${big ? 10 + Math.random() * 14 : 6 + Math.random() * 6}px`);
      p.style.setProperty("--t", `${big ? 1.2 + Math.random() * 0.8 : 0.55 + Math.random() * 0.35}s`);
      p.style.setProperty("--h", `${340 + Math.random() * 30}`);
      p.addEventListener("animationend", () => p.remove(), { once: true });
    }
  }

  addWords(delta) {
    const d = this.day();
    const before = d.w;
    d.w += delta;
    this.save();
    this.renderRing();
    this.refreshStats();
    if (!this.settings.milestones || this.calm()) return;
    const { goal, every } = this.settings;
    if (before < goal && d.w >= goal) this.celebrate(d.w);
    else if (Math.floor(before / every) < Math.floor(d.w / every)) this.bloom(`${Math.floor(d.w / every) * every} words`);
  }

  toast(text, sub) {
    const t = this.layer.createDiv({ cls: "lb-toast" });
    t.createSpan({ cls: "lb-orn", text: "— ❦ —" });
    t.createSpan({ cls: "lb-toast-text", text });
    if (sub) t.createSpan({ cls: "lb-toast-sub", text: sub });
    t.addEventListener("animationend", () => t.remove(), { once: true });
  }

  bloom(text) {
    this.toast(text);
    this.ring.addClass("is-pulse");
    setTimeout(() => this.ring.removeClass("is-pulse"), 900);
    this.spawn(window.innerWidth / 2, window.innerHeight * 0.18, 14, true);
  }

  celebrate(words) {
    this.toast("Today's page is written.", `${fmt(words)} words`);
    const flash = this.layer.createDiv({ cls: "lb-flash" });
    flash.addEventListener("animationend", () => flash.remove(), { once: true });
    this.spawn(window.innerWidth / 2, window.innerHeight * 0.4, 46, true);
  }

  renderRing() {
    const words = this.day().w, goal = this.settings.goal;
    const C = 2 * Math.PI * 6;
    const fg = this.ring.querySelector(".lb-ring-fg");
    fg.style.strokeDasharray = `${C}`;
    fg.style.strokeDashoffset = `${C * (1 - Math.min(1, words / Math.max(1, goal)))}`;
    this.ring.querySelector(".lb-ring-text").setText(`${fmt(words)} / ${fmt(goal)}`);
    this.ring.toggleClass("is-done", words >= goal);
    setTooltip(this.ring, `${fmt(words)} of ${fmt(goal)} words today · click for statistics`, { placement: "top" });
  }

  // ---- statistics -------------------------------------------------------
  stats() {
    const h = this.settings.history, goal = this.settings.goal;
    const today = this.day();
    const keys = Object.keys(h).filter((k) => h[k].w > 0);
    let streak = 0;
    const d = new Date();
    if (!(h[dayKey(d)]?.w > 0)) d.setDate(d.getDate() - 1); // today not started yet: the streak still stands
    while (h[dayKey(d)]?.w > 0) { streak++; d.setDate(d.getDate() - 1); }
    const best = keys.reduce((b, k) => (h[k].w > b.w ? { k, w: h[k].w } : b), { k: null, w: 0 });
    return {
      today: today.w, goal, streak, best,
      total: keys.reduce((s, k) => s + h[k].w, 0),
      goalDays: keys.filter((k) => h[k].w >= goal).length,
      minutes: Math.round(today.s / 60),
      pace: today.s >= 60 ? Math.round(today.w / (today.s / 60)) : null,
    };
  }

  statsViews() { return this.app.workspace.getLeavesOfType(STATS_VIEW).map((l) => l.view).filter((v) => v instanceof StatsView); }

  async openStats() {
    let leaf = this.app.workspace.getLeavesOfType(STATS_VIEW)[0];
    if (!leaf) { leaf = this.app.workspace.getRightLeaf(false); await leaf.setViewState({ type: STATS_VIEW, active: true }); }
    this.app.workspace.revealLeaf(leaf);
  }

  // ---- reading mode (the book) ------------------------------------------
  async setReading(on) {
    const ws = this.app.workspace;
    if (on === this.reading) return;
    this.reading = on;
    document.body.toggleClass("lb-reading", on);
    if (on) {
      // remembered on disk too, so quitting mid-book still gives the sidebars back next launch
      this.settings.sides = { l: ws.leftSplit.collapsed, r: ws.rightSplit.collapsed };
      this.save();
      ws.leftSplit.collapse(); ws.rightSplit.collapse();
    } else this.restoreSides();
    await this.applyModeToActive();
    this.renderModePill();
  }

  restoreSides() {
    const sides = this.settings.sides, ws = this.app.workspace;
    if (!sides) return;
    if (!sides.l) ws.leftSplit.expand();
    if (!sides.r) ws.rightSplit.expand();
    delete this.settings.sides;
    this.save();
  }

  async applyModeToActive() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    const want = this.reading ? "preview" : "source";
    const st = view.leaf.getViewState();
    if (st.state?.mode !== want) await view.leaf.setViewState({ ...st, state: { ...st.state, mode: want } });
    if (!this.reading) return;
    const fm = this.app.metadataCache.getFileCache(view.file)?.frontmatter || {};
    const title = fm.title || view.file.basename;
    view.containerEl.style.setProperty("--lb-running", JSON.stringify(fm.author ? `${fm.author}  ·  ${title}` : title));
    this.bookWords = countWords(view.data.replace(/^---[\s\S]*?\n---/, ""));
    const scroller = view.containerEl.querySelector(".markdown-preview-view");
    if (scroller) { scroller.scrollTop = 0; this.updateProgress(scroller); }
  }

  updateProgress(el) {
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? Math.min(1, el.scrollTop / max) : 1;
    this.progress.style.transform = `scaleX(${pct})`;
    const left = Math.max(0, Math.ceil((this.bookWords || 0) * (1 - pct) / READ_WPM));
    this.folio.setText(pct >= 0.995 ? "fin" : `${Math.round(pct * 100)}%  ·  ${left} min left`);
  }

  renderModePill() {
    this.modeEl.empty();
    this.modeEl.createSpan({ cls: "lb-mode-glyph", text: this.reading ? "❦" : "✎" });
    this.modeEl.createSpan({ text: this.reading ? "Reading" : "Writing" });
    this.modeEl.toggleClass("is-reading", this.reading);
    setTooltip(this.modeEl, this.reading ? "Back to Writing (Esc)" : "Read as a book (⌘⇧B)", { placement: "top" });
  }
};

// ---- the statistics panel -------------------------------------------------
class StatsView extends ItemView {
  constructor(leaf, plugin) { super(leaf); this.plugin = plugin; }
  getViewType() { return STATS_VIEW; }
  getDisplayText() { return "Writing statistics"; }
  getIcon() { return "flower-2"; }
  async onOpen() { this.render(true); }

  countUp(el, to, suffix = "") {
    if (this.plugin.calm() || to === 0) { el.setText(fmt(to) + suffix); return; }
    const t0 = performance.now(), dur = 900;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.setText(fmt(Math.round(to * e)) + suffix);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  render(animate) {
    const p = this.plugin, s = p.stats(), h = p.settings.history;
    const root = this.contentEl;
    root.empty();
    root.addClass("lb-stats");
    root.toggleClass("is-animated", animate && !p.calm());

    const head = root.createDiv({ cls: "lb-stats-head" });
    head.createDiv({ cls: "lb-eyebrow", text: new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) });
    head.createDiv({ cls: "lb-stats-title", text: "Writing" });

    // today: one big number inside a ring
    const today = root.createDiv({ cls: "lb-today" });
    const C = 2 * Math.PI * 52, pct = Math.min(1, s.today / Math.max(1, s.goal));
    today.innerHTML = `<svg viewBox="0 0 120 120"><circle class="lb-big-bg" cx="60" cy="60" r="52"/><circle class="lb-big-fg" cx="60" cy="60" r="52" style="stroke-dasharray:${C};stroke-dashoffset:${animate ? C : C * (1 - pct)}"/></svg>`;
    if (animate) requestAnimationFrame(() => requestAnimationFrame(() => { today.querySelector(".lb-big-fg").style.strokeDashoffset = `${C * (1 - pct)}`; }));
    const mid = today.createDiv({ cls: "lb-today-mid" });
    const num = mid.createDiv({ cls: "lb-today-num" });
    mid.createDiv({ cls: "lb-today-sub", text: s.today >= s.goal ? "page written ❦" : `of ${fmt(s.goal)} words` });
    animate ? this.countUp(num, s.today) : num.setText(fmt(s.today));
    setTooltip(today, `${fmt(s.today)} words today, ${Math.round(pct * 100)}% of your goal`);

    // tiles
    const tiles = root.createDiv({ cls: "lb-tiles" });
    const tile = (label, value, note) => {
      const t = tiles.createDiv({ cls: "lb-tile" });
      const v = t.createDiv({ cls: "lb-tile-value" });
      t.createDiv({ cls: "lb-tile-label", text: label });
      if (note) setTooltip(t, note);
      typeof value === "number" && animate ? this.countUp(v, value) : v.setText(typeof value === "number" ? fmt(value) : value);
    };
    tile("day streak", s.streak, "Days in a row with any writing");
    tile("words, all time", s.total);
    tile("best day", s.best.w, s.best.k ? `Most words in one day: ${s.best.k}` : "No writing yet");
    tile("goal days", s.goalDays, `Days you reached ${fmt(s.goal)} words`);
    tile("min writing today", s.minutes, "Typing time today; pauses over 20 seconds are not counted");
    tile("words / min", s.pace == null ? "—" : s.pace, "Your pace today while actually writing");

    // heatmap: last 16 weeks, one pink hue from faint to full
    const sec1 = root.createDiv({ cls: "lb-section" });
    sec1.createDiv({ cls: "lb-section-title", text: "Last 16 weeks" });
    const grid = sec1.createDiv({ cls: "lb-heat" });
    const start = new Date(); start.setDate(start.getDate() - start.getDay() - 7 * 15); // Sunday, 15 weeks back
    for (let i = 0; i < 16 * 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = dayKey(d), w = h[k]?.w || 0, future = d > new Date();
      const lvl = future ? -1 : w === 0 ? 0 : w < s.goal * 0.25 ? 1 : w < s.goal * 0.5 ? 2 : w < s.goal ? 3 : 4;
      const c = grid.createDiv({ cls: `lb-cell l${lvl}` });
      c.style.setProperty("--i", i);
      if (!future) setTooltip(c, `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${fmt(w)} words`, { placement: "top" });
    }
    const legend = sec1.createDiv({ cls: "lb-heat-legend" });
    legend.createSpan({ text: "less" });
    [0, 1, 2, 3, 4].forEach((l) => legend.createDiv({ cls: `lb-cell l${l}` }));
    legend.createSpan({ text: "goal" });

    // bars: last 14 days, dashed line at the goal
    const sec2 = root.createDiv({ cls: "lb-section" });
    sec2.createDiv({ cls: "lb-section-title", text: "Last 14 days" });
    const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return { d, w: h[dayKey(d)]?.w || 0 }; });
    const top = Math.max(s.goal, ...days.map((x) => x.w));
    const bars = sec2.createDiv({ cls: "lb-bars" });
    const goalLine = bars.createDiv({ cls: "lb-goal-line" });
    goalLine.style.bottom = `${(s.goal / top) * 100}%`;
    goalLine.createSpan({ text: `goal ${fmt(s.goal)}` });
    days.forEach(({ d, w }, i) => {
      const col = bars.createDiv({ cls: "lb-bar-col" });
      const bar = col.createDiv({ cls: "lb-bar" + (w >= s.goal ? " is-goal" : "") });
      bar.style.height = `${(w / top) * 100}%`;
      bar.style.setProperty("--i", i);
      setTooltip(col, `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${fmt(w)} words`, { placement: "top" });
    });
    const axis = sec2.createDiv({ cls: "lb-bars-axis" });
    axis.createSpan({ text: days[0].d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) });
    axis.createSpan({ text: "today" });

    // this note
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (view?.file) {
      const words = countWords(view.data.replace(/^---[\s\S]*?\n---/, ""));
      const sec3 = root.createDiv({ cls: "lb-section lb-note" });
      sec3.createDiv({ cls: "lb-section-title", text: "This note" });
      sec3.createDiv({ cls: "lb-note-name", text: view.file.basename });
      sec3.createDiv({ cls: "lb-note-meta", text: `${fmt(words)} words  ·  ${Math.max(1, Math.round(words / READ_WPM))} min read  ·  ${fmt(view.data.length)} characters` });
    }
  }
}

class BloomTab extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    const save = () => { this.plugin.save(); this.plugin.applyBodyClasses(); this.plugin.renderRing(); this.plugin.refreshStats(); };
    containerEl.empty();
    new Setting(containerEl).setName("Gliding caret").setDesc("The caret slides between positions instead of jumping.")
      .addToggle((t) => t.setValue(s.glide).onChange((v) => { s.glide = v; save(); }));
    new Setting(containerEl).setName("Petals while typing").setDesc("Tiny hearts and petals drift up from the caret.")
      .addToggle((t) => t.setValue(s.particles).onChange((v) => { s.particles = v; save(); }));
    new Setting(containerEl).setName("Milestones").setDesc("A word bloom every few words, and a celebration at your daily goal.")
      .addToggle((t) => t.setValue(s.milestones).onChange((v) => { s.milestones = v; save(); }));
    new Setting(containerEl).setName("Follow macOS Reduce Motion").setDesc("When on, Obsidian goes still whenever Reduce Motion is enabled in System Settings → Accessibility.")
      .addToggle((t) => t.setValue(s.followSystemMotion).onChange((v) => { s.followSystemMotion = v; save(); }));
    new Setting(containerEl).setName("Daily goal").setDesc("Words typed per day. Pasted text does not count.")
      .addText((t) => t.setValue(String(s.goal)).onChange((v) => { const n = parseInt(v, 10); if (n > 0) { s.goal = n; save(); } }));
    new Setting(containerEl).setName("Bloom every").setDesc("Words between milestone blooms.")
      .addText((t) => t.setValue(String(s.every)).onChange((v) => { const n = parseInt(v, 10); if (n > 0) { s.every = n; save(); } }));
  }
}
