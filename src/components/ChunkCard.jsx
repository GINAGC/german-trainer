import categories from "../data/categories.json";
import { CASE, genderColorForNoun } from "../lib/colors";
import { cleanDe, isPast } from "../lib/speechText";

const CM = Object.fromEntries(categories.map((c) => [c.id, c]));

function CategoryPill({ ci }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: ci.bg, color: ci.tc, display: "inline-flex", alignItems: "center", gap: 4 }}>
      {ci.dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: ci.dot, display: "inline-block", flexShrink: 0 }} />}
      {ci.label}
    </span>
  );
}

export default function ChunkCard({ chunk: c, speaking, onSpeak, onToggleMastered }) {
  const ci = CM[c.cat] || CM.conversation;
  const past = isPast(c.de);
  const de = cleanDe(c.de);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 12, opacity: c.mastered ? 0.5 : 1, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <CategoryPill ci={ci} />
          {past && <span style={{ background: "#dbeafe", color: "#1e40af", fontSize: 10, padding: "1px 5px", borderRadius: 3 }}>Vgt.</span>}
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }}>
          <button onClick={() => onSpeak(c.id, de)} title="Vorlesen" style={{ background: speaking === c.id ? "#dbeafe" : "none", border: "none", cursor: "pointer", color: speaking === c.id ? "#1e40af" : "#ccc", fontSize: 14, padding: "2px 4px", lineHeight: 1 }}>
            {speaking === c.id ? "⏹" : "▶"}
          </button>
          <button onClick={() => onToggleMastered(c.id)} title={c.mastered ? "Zurücksetzen" : "Gemeistert"} style={{ background: c.mastered ? "#dcfce7" : "none", border: `1px solid ${c.mastered ? "#86efac" : "#ccc"}`, borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: c.mastered ? "#15803d" : "#aaa", flexShrink: 0 }}>
            {c.mastered ? "✓" : "○"}
          </button>
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, margin: "0 0 4px", color: "#111" }}>{de}</p>
      {c.en && <p style={{ fontSize: 12, color: "#888", fontStyle: "italic", lineHeight: 1.4, margin: "0 0 6px" }}>{c.en}</p>}
      {c.nouns && c.nouns.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4 }}>
          {c.nouns.map((n, i) => {
            const col = genderColorForNoun(n) ?? { bg: "#f0f0f0", text: "#666" };
            return (
              <span key={i} style={{ background: col.bg, color: col.text, fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>
                {n}
              </span>
            );
          })}
        </div>
      )}
      {c.g && c.g.length > 0 && (
        <div style={{ borderTop: "1px solid #f5f5f5", marginTop: 8, paddingTop: 7, display: "flex", flexDirection: "column", gap: 4 }}>
          {c.g.map((g, i) => {
            const gc = CASE[g.c];
            return (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: gc.bg, color: gc.text, flexShrink: 0 }}>{g.c}</span>
                <span style={{ fontSize: 11, color: "#777" }}><b style={{ color: "#444" }}>{g.w}</b> — {g.n}</span>
              </div>
            );
          })}
        </div>
      )}
      {c.addedDate && <p style={{ fontSize: 10, color: "#bbb", marginTop: 6, marginBottom: 0 }}>{c.addedDate}</p>}
    </div>
  );
}
