const TABS = [
  { id: "chunks", label: "Chunks", activeBorder: "#999", activeBg: "#f0f0f0", activeColor: "#111" },
  { id: "tabellen", label: "Tabellen", activeBorder: "#7F77DD", activeBg: "#f3f0ff", activeColor: "#3c3489" },
  { id: "woerter", label: "Wörter", activeBorder: "#1D9E75", activeBg: "#e1f5ee", activeColor: "#04342C" },
  { id: "genus", label: "Genus-Regeln", activeBorder: "#639922", activeBg: "#EAF3DE", activeColor: "#173404" },
  { id: "archiv", label: "Archiv", activeBorder: "#888780", activeBg: "#F1EFE8", activeColor: "#2C2C2A" },
];

export default function Header({ mainTab, setMainTab, aCnt, mCnt, total, pct }) {
  return (
    <div style={{ borderBottom: "1px solid #e5e5e5", padding: "14px 16px 12px" }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Meine Chunks 🇩🇪</h2>
        <p style={{ fontSize: 12, color: "#888", margin: "2px 0 8px" }}>{aCnt} aktiv · {mCnt} gemeistert · {total} gesamt</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const on = mainTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                style={{
                  cursor: "pointer",
                  border: `1px solid ${on ? t.activeBorder : "#ddd"}`,
                  background: on ? t.activeBg : "transparent",
                  color: on ? t.activeColor : "#555",
                  borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: on ? 500 : 400,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ background: "#e5e5e5", borderRadius: 2, height: 4 }}>
        <div style={{ background: "#22c55e", width: `${pct}%`, height: "100%", borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "3px 0 0" }}>{pct}% gemeistert</p>
    </div>
  );
}
