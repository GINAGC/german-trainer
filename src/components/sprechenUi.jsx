

export const pill = (on, accent = "#999", bg = "#f0f0f0") => ({
  cursor: "pointer", borderRadius: 20, padding: "4px 11px", fontSize: 12,
  border: `1px solid ${on ? accent : "#ddd"}`, background: on ? bg : "transparent",
  fontWeight: on ? 500 : 400, color: on ? "#111" : "#666",
});
export const label = { fontSize: 11, color: "#aaa", margin: "0 0 5px" };
export const primaryBtn = (bg) => ({
  cursor: "pointer", border: "none", borderRadius: 12, padding: "12px 18px", fontSize: 15, fontWeight: 600,
  background: bg, color: "#fff", width: "100%",
});

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


export function Chips({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([v, l]) => (
        <button key={String(v)} onClick={() => onChange(v)} style={pill(value === v)}>{l}</button>
      ))}
    </div>
  );
}


export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function beep(ctx) {
  try {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.2;
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {
    /* the visual cue still shows */
  }
}

