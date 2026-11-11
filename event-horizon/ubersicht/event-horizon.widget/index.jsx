// Event Horizon system panel: CPU as an accretion ring around a black core, the rest as thin light.
import { run } from "uebersicht";

export const command = "event-horizon.widget/stats.sh";
export const refreshFrequency = 2000;

const ICE = "#a9c8ff", WHITE = "#f4f7ff", EMBER = "#ff5b38", DIM = "#8592ab";

export const className = `
  right: 34px; top: 50%; transform: translateY(-50%);
  width: 280px; padding: 22px 24px 20px;
  font-family: "Iosevka", "SF Mono", monospace; font-weight: 300; color: #dfe7f5;
  background: rgba(5, 6, 10, 0.62); border: 1px solid rgba(169, 200, 255, 0.16); border-radius: 18px;
  box-shadow: 0 0 60px rgba(91, 140, 255, 0.10), inset 0 0 40px rgba(255, 91, 56, 0.04);
  -webkit-backdrop-filter: blur(18px);
  -webkit-font-smoothing: antialiased;
  @keyframes eh-spin { to { transform: rotate(360deg); } }
  .label { font-size: 10px; letter-spacing: .32em; color: ${DIM}; text-transform: uppercase; }
  .row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 16px; }
  .big { font-size: 22px; color: ${WHITE}; }
  .unit { font-size: 12px; color: ${DIM}; }
  .switch { cursor: pointer; font-size: 10px; letter-spacing: .2em; color: ${ICE}; border: 1px solid rgba(169,200,255,.3);
            border-radius: 99px; padding: 3px 9px; background: none; font-family: inherit; }
  .switch:hover { background: rgba(169,200,255,.12); }
`;

export const initialState = { hist: [], d: null, dl: 0 };

export const updateState = (event, prev) => {
  if (event.type !== "UB/COMMAND_RAN" || event.error) return prev;
  let d;
  try { d = JSON.parse(event.output); } catch (e) { return prev; }
  const now = Date.now();
  const dl = prev.d && prev.t && d.rx >= prev.d.rx ? ((d.rx - prev.d.rx) * 1000) / (now - prev.t) : prev.dl;
  return { d, t: now, dl, hist: [...prev.hist, d.cpu].slice(-60) };
};

const gib = (b) => (b / 2 ** 30).toFixed(1);
const speed = (b) => {
  const u = ["B/s", "KiB/s", "MiB/s", "GiB/s"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return [b.toFixed(i ? 1 : 0), u[i]];
};
const uptime = (s) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d ? `${d}d ${h}h` : `${h}h ${m}m`;
};
const temp = (t) => (t > 0 ? Math.round(t) : "--");

// CPU ring: dark core, faint disk, a lit arc for the load and a slowly turning dust ring
const Ring = ({ cpu }) => {
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 232, height: 232, margin: "14px auto 4px" }}>
      <svg width="232" height="232" viewBox="0 0 232 232" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="eh-arc" gradientUnits="userSpaceOnUse" x1="116" y1="40" x2="116" y2="192">
            <stop offset="0" stopColor="#5b8cff" />
            <stop offset=".55" stopColor={WHITE} />
            <stop offset="1" stopColor={EMBER} />
          </linearGradient>
          <radialGradient id="eh-core">
            <stop offset=".62" stopColor="#000" />
            <stop offset=".8" stopColor="rgba(91,140,255,.18)" />
            <stop offset="1" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <circle cx="116" cy="116" r="100" fill="url(#eh-core)" />
        <circle cx="116" cy="116" r={r} fill="none" stroke="rgba(169,200,255,.10)" strokeWidth="10" />
        <circle cx="116" cy="116" r={r} fill="none" stroke="url(#eh-arc)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(cpu / 100) * c} ${c}`} transform="rotate(-90 116 116)"
          style={{ filter: "drop-shadow(0 0 6px rgba(169,200,255,.55))", transition: "stroke-dasharray 1.2s ease" }} />
      </svg>
      <svg width="232" height="232" viewBox="0 0 232 232" style={{ position: "absolute", inset: 0, animation: "eh-spin 40s linear infinite" }}>
        <circle cx="116" cy="116" r="96" fill="none" stroke="rgba(244,247,255,.35)" strokeWidth="1" strokeDasharray="1 7" />
        <circle cx="116" cy="116" r="108" fill="none" stroke="rgba(255,91,56,.28)" strokeWidth="1" strokeDasharray="1 13" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 40, color: WHITE, lineHeight: 1 }}>{cpu}<span className="unit">%</span></div>
        <div className="label" style={{ marginTop: 6 }}>cpu</div>
      </div>
    </div>
  );
};

const Spark = ({ hist }) => {
  const w = 232, h = 26, n = 60;
  if (hist.length < 2) return <div style={{ height: h }} />;
  const pts = hist.map((v, i) => `${w - (hist.length - 1 - i) * (w / (n - 1))},${h - (v / 100) * h}`);
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={ICE} strokeOpacity=".7" strokeWidth="1.2" />
    </svg>
  );
};

export const render = ({ d, dl, hist }) => {
  if (!d) return <div />;
  const mac = d.mac || {};
  const mem = Math.round((d.used / d.total) * 100);
  const [sp, su] = speed(dl);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="label" style={{ color: ICE }}>event horizon</span>
        <button className="switch" title="Switch to LoveBites" onClick={() => run("$HOME/.local/bin/rice toggle")}>❤ swap</button>
      </div>
      <Ring cpu={d.cpu} />
      <Spark hist={hist} />

      <div className="row"><span className="label">memory</span><span><span className="big">{gib(d.used)}</span><span className="unit"> / {gib(d.total)} GiB</span></span></div>
      <div style={{ height: 3, marginTop: 8, background: "rgba(169,200,255,.10)", borderRadius: 3 }}>
        <div style={{ width: `${mem}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, #5b8cff, ${WHITE} 70%, ${EMBER})` }} />
      </div>

      <div className="row">
        <span className="label">heat</span>
        <span><span className="unit">gpu </span><span className="big">{temp(mac.temp && mac.temp.gpu_temp_avg)}</span><span className="unit">°  cpu </span><span className="big">{temp(mac.temp && mac.temp.cpu_temp_avg)}</span><span className="unit">°</span></span>
      </div>
      <div className="row"><span className="label">{d.iface ? "inbound" : "offline"}</span><span><span className="big">{d.iface ? sp : "—"}</span><span className="unit"> {d.iface ? su : ""}</span></span></div>
      <div className="row"><span className="label">uptime</span><span className="big">{uptime(d.up)}</span></div>
    </div>
  );
};
