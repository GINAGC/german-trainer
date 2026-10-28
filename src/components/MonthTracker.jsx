import { useState } from "react";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const PARTS = [["c", "Chunks"], ["s", "Sprechen"], ["g", "Grammatik"], ["v", "Verben"]];
const SHADES = ["#f3f3f3", "#d9f2e0", "#a7e3b8", "#6fd08c", "#22c55e"];

const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const count = (e) => (e ? PARTS.filter(([k]) => e[k]).length : 0);

// Consecutive days with all 4 parts done, counting back from today (or yesterday if today isn't finished yet).
function streak(log) {
  const d = new Date();
  if (count(log[key(d.getFullYear(), d.getMonth(), d.getDate())]) < 4) d.setDate(d.getDate() - 1);
  let n = 0;
  while (count(log[key(d.getFullYear(), d.getMonth(), d.getDate())]) === 4) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

const navBtn = { background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888", padding: "0 8px" };

export default function MonthTracker({ log }) {
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState(null);

  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const y = base.getFullYear();
  const m = base.getMonth();
  const lead = (base.getDay() + 6) % 7; // Monday first
  const days = new Date(y, m + 1, 0).getDate();
  const todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());

  let full = 0;
  let active = 0;
  for (let d = 1; d <= days; d++) {
    const c = count(log[key(y, m, d)]);
    if (c) active++;
    if (c === 4) full++;
  }

  const pickedEntry = picked ? log[picked] : null;

  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button style={navBtn} onClick={() => { setOffset(offset - 1); setPicked(null); }} aria-label="Vorheriger Monat">‹</button>
        <b style={{ fontSize: 14 }}>{MONTHS[m]} {y}</b>
        <button style={{ ...navBtn, opacity: offset >= 0 ? 0.25 : 1 }} disabled={offset >= 0} onClick={() => { setOffset(offset + 1); setPicked(null); }} aria-label="Nächster Monat">›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {WEEKDAYS.map((w) => <div key={w} style={{ fontSize: 10, color: "#aaa", textAlign: "center" }}>{w}</div>)}
        {Array.from({ length: lead }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const k = key(y, m, d);
          const c = count(log[k]);
          const future = k > todayKey;
          const isToday = k === todayKey;
          return (
            <button
              key={k} onClick={() => setPicked(picked === k ? null : k)}
              style={{
                aspectRatio: "1", borderRadius: 8, cursor: "pointer", fontSize: 11.5, padding: 0,
                border: isToday ? "2px solid #D4537E" : picked === k ? "2px solid #888" : "1px solid transparent",
                background: SHADES[c], color: c >= 3 ? "#fff" : future ? "#ccc" : "#666", fontWeight: c === 4 ? 700 : 400,
              }}
            >
              {c === 4 ? "✓" : d}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "10px 0 0", fontSize: 10.5, color: "#aaa" }}>
        <span>weniger</span>
        {SHADES.map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />)}
        <span>alle 4 ✓</span>
      </div>

      {picked && (
        <p style={{ fontSize: 12, color: "#555", margin: "10px 0 0", lineHeight: 1.7 }}>
          <b>{picked.slice(8)}.{picked.slice(5, 7)}.</b>{" "}
          {PARTS.map(([k, name]) => <span key={k} style={{ marginRight: 8, color: pickedEntry?.[k] ? "#15803d" : "#bbb" }}>{pickedEntry?.[k] ? "✓" : "○"} {name}</span>)}
        </p>
      )}

      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12.5, color: "#444", flexWrap: "wrap" }}>
        <span>Alle 4: <b>{full}</b> {full === 1 ? "Tag" : "Tage"}</span>
        <span>Aktiv: <b>{active}</b></span>
        {offset === 0 && <span>Serie: <b>{streak(log)}</b> 🔥</span>}
      </div>
    </div>
  );
}
