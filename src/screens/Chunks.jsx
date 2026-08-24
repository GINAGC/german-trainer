import { useMemo, useState } from "react";
import ChunkCard from "../components/ChunkCard";
import CategoryFilterBar from "../components/CategoryFilterBar";
import RepeatCountControl from "../components/RepeatCountControl";
import { speechText } from "../lib/speechText";

export default function Chunks({ chunks, toggleMastered, speaking, speak, playAll, stopAll, repeatCount, setRepeatCount }) {
  const [cat, setCat] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("active");

  const total = chunks.length;
  const mCnt = chunks.filter((c) => c.mastered).length;
  const aCnt = total - mCnt;

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return chunks.filter((c) => {
      if (view === "active" && c.mastered) return false;
      if (view === "mastered" && !c.mastered) return false;
      if (cat !== "all" && c.cat !== cat) return false;
      if (!q) return true;
      return c.de.toLowerCase().includes(q) || (c.en || "").toLowerCase().includes(q) || (c.nouns || []).some((n) => n.toLowerCase().includes(q));
    });
  }, [chunks, view, cat, search]);

  const catCounts = useMemo(() => {
    const m = { all: 0 };
    for (const c of chunks) {
      if (view === "mastered" ? !c.mastered : c.mastered) continue;
      m.all = (m.all || 0) + 1;
      m[c.cat] = (m[c.cat] || 0) + 1;
    }
    return m;
  }, [chunks, view]);
  const catCount = (cid) => catCounts[cid] || 0;

  return (
    <>
      <div style={{ padding: "10px 16px 0", borderBottom: "1px solid #e5e5e5" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
          {[["active", "Aktiv", aCnt], ["mastered", "Gemeistert", mCnt]].map(([v, l, n]) => (
            <button key={v} onClick={() => setView(v)} style={{ cursor: "pointer", border: `1px solid ${view === v ? "#999" : "#ddd"}`, background: view === v ? "#f0f0f0" : "transparent", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: view === v ? 500 : 400 }}>
              {l} ({n})
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
            <RepeatCountControl repeatCount={repeatCount} setRepeatCount={setRepeatCount} />
            <button
              onClick={() => { if (speaking) stopAll(); else playAll(shown.map((c) => ({ id: c.id, text: speechText(c.de) }))); }}
              style={{ cursor: "pointer", border: `1px solid ${speaking ? "#93c5fd" : "#ddd"}`, background: speaking ? "#dbeafe" : "transparent", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: speaking ? "#1e40af" : "#555", display: "flex", alignItems: "center", gap: 4 }}
            >
              {speaking ? "⏹ Stop" : "▶ Alle"}
            </button>
          </div>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." style={{ width: "100%", border: "1px solid #ccc", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit", marginBottom: 8, boxSizing: "border-box" }} />
        <CategoryFilterBar cat={cat} setCat={setCat} catCount={catCount} />
      </div>

      <div style={{ padding: "12px 16px 40px" }}>
        {shown.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", padding: 32 }}>
            {search ? "Keine Ergebnisse." : view === "mastered" ? "Noch nichts gemeistert – weiter so!" : "Keine Chunks hier."}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {shown.map((c) => (
              <ChunkCard
                key={c.id}
                chunk={c}
                speaking={speaking}
                onSpeak={(id, de) => speak(id, speechText(de))}
                onToggleMastered={toggleMastered}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
