import categories from "../data/categories.json";

export default function CategoryFilterBar({ cat, setCat, catCount }) {
  return (
    <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
      {categories.map((c) => {
        const on = cat === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            style={{
              cursor: "pointer", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 4,
              border: `1px solid ${on && c.dot ? c.dot : on ? "#999" : "#ddd"}`,
              background: on && c.bg ? c.bg : on ? "#f0f0f0" : "transparent",
              color: on && c.tc ? c.tc : on ? "#111" : "#555",
              borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: on ? 500 : 400, flexShrink: 0,
            }}
          >
            {c.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block", flexShrink: 0 }} />}
            {c.label} <span style={{ opacity: 0.6 }}>({catCount(c.id)})</span>
          </button>
        );
      })}
    </div>
  );
}
