// LoveBites conky panel, rebuilt for Übersicht. Positions follow the original .conkyrc over background.png.
export const command = "lovebites.widget/stats.sh";
export const refreshFrequency = 2000;

const PINK = "#ff5a6f";
const IMG = "lovebites.widget/";

export const className = `
  right: 30px; top: 50%; transform: translateY(-50%);
  width: 283px; height: 540px;
  font-family: "Iosevka", monospace; font-weight: 300; color: ${PINK};
  -webkit-font-smoothing: antialiased;
`;

export const initialState = { hist: [], d: null, dl: 0 };

export const updateState = (event, prev) => {
  if (event.type !== "UB/COMMAND_RAN" || event.error) return prev;
  let d;
  try { d = JSON.parse(event.output); } catch (e) { return prev; }
  const now = Date.now();
  const dl = prev.d && prev.t && d.rx >= prev.d.rx ? ((d.rx - prev.d.rx) * 1000) / (now - prev.t) : prev.dl;
  return { d, t: now, dl, hist: [...prev.hist, d.cpu].slice(-50) };
};

const gib = (b) => `${(b / 2 ** 30).toFixed(2)} GiB`;
const speed = (b) => {
  const u = ["B", "KiB", "MiB", "GiB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(i ? 2 : 0)} ${u[i]}/s`;
};
const uptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : `${h}h ${m}m`;
};
const temp = (t) => (t > 0 ? `${Math.round(t)}°C` : "--°C");

const at = (left, top, size, extra = {}) => ({ position: "absolute", left, top, fontSize: size, lineHeight: 1, whiteSpace: "nowrap", ...extra });
const right = (r, top, size, extra = {}) => ({ position: "absolute", right: r, top, fontSize: size, lineHeight: 1, whiteSpace: "nowrap", ...extra });

const Graph = ({ hist }) => {
  const w = 150, h = 28, n = 50;
  const pts = hist.map((v, i) => `${w - (hist.length - 1 - i) * (w / (n - 1))},${h - (v / 100) * h}`);
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 87, top: 33 }}>
      {pts.length > 1 && <polygon points={`${pts[0].split(",")[0]},${h} ${pts.join(" ")} ${w},${h}`} fill={PINK} fillOpacity="0.5" stroke={PINK} strokeWidth="1" />}
    </svg>
  );
};

// follows macOS appearance (stats.sh reports it), with a recolored copy of the conky art
const THEMES = {
  light: { img: "background.png", panel: "#f5f5f6", track: "#f7d8dd" },
  dark: { img: "background-dark.png", panel: "#2a2326", track: "#4a2a31" },
};

export const render = ({ d, dl, hist }) => {
  if (!d) return <div />;
  const th = d.dark ? THEMES.dark : THEMES.light;
  const mac = d.mac || {};
  const mhz = mac.pcpu_usage ? Math.round(mac.pcpu_usage[0]) : null;
  const memPct = Math.round((d.used / d.total) * 100);
  return (
    <div style={{ position: "absolute", inset: 0, background: `url(${IMG}${th.img}) no-repeat` }}>
      <Graph hist={hist} />
      {mhz ? (
        <div style={at(69, 82, 16, { fontWeight: 400 })}>{mhz}<span style={{ fontWeight: 300 }}> MHz</span></div>
      ) : (
        <div style={at(69, 84, 14)}>{d.chip}</div>
      )}
      <div style={right(48, 78, 23, { fontWeight: 400 })}>{d.cpu}%</div>

      {/* RAM bar: track + fill inside the baked frame */}
      <div style={{ position: "absolute", left: 47, top: 133, width: 192, height: 6, background: th.track }}>
        <div style={{ width: `${memPct}%`, height: "100%", background: PINK }} />
      </div>
      <div style={at(27, 172, 16, { fontWeight: 400 })}>{gib(d.used)} /<span style={{ fontWeight: 300 }}> {gib(d.total)}</span></div>
      <div style={right(40, 160, 23, { fontWeight: 400 })}>{memPct}%</div>

      {/* baked label says ACPI; Apple silicon has no ACPI sensor, so relabel it GPU */}
      <div style={at(56, 200, 15, { width: 46, height: 20, background: th.panel, textAlign: "center", lineHeight: "20px" })}>GPU</div>
      <div style={at(37, 226, 33)}>{temp(mac.temp && mac.temp.gpu_temp_avg)}</div>
      <div style={at(166, 226, 33)}>{temp(mac.temp && mac.temp.cpu_temp_avg)}</div>

      {d.iface ? (
        <div>
          <img src={`${IMG}connected.png`} style={{ position: "absolute", left: 55, top: 281 }} />
          <div style={right(56, 280, 23)}><span style={{ fontSize: 16, fontWeight: 400 }}>DL  </span>{speed(dl)}</div>
        </div>
      ) : (
        <div>
          <img src={`${IMG}disconnected.png`} style={{ position: "absolute", left: 50, top: 277 }} />
          <div style={right(56, 280, 23)}>disconnected</div>
        </div>
      )}

      <div style={right(56, 337, 23)}>{uptime(d.up)}</div>
    </div>
  );
};
