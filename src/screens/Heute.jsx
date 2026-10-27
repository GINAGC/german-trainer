import { useMemo } from "react";
import ChunkCard from "../components/ChunkCard";
import { USE_TARGET } from "../hooks/useDailyChunks";
import { CASE, genderColorForNoun } from "../lib/colors";
import { cleanDe, speechText, chunkDetails } from "../lib/speechText";

const sectionTitle = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "22px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "baseline" };
const linkBtn = { background: "none", border: "none", cursor: "pointer", color: "#D4537E", fontSize: 12, fontWeight: 500, padding: 0, letterSpacing: 0, textTransform: "none" };

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend";
}

function DailyCard({ chunk: c, used, count, speaking, onSpeak, onToggleUsed, onMaster }) {
  const de = cleanDe(c.de);
  const ready = count >= USE_TARGET;
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start", background: used ? "#f6fdf8" : "#fff" }}>
      <button
        onClick={() => onToggleUsed(c.id)}
        aria-label={used ? "Heute benutzt – zurücknehmen" : "Heute benutzt"}
        style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${used ? "#22c55e" : "#ccc"}`, background: used ? "#22c55e" : "transparent", color: "#fff", cursor: "pointer", flexShrink: 0, marginTop: 1, fontSize: 14, lineHeight: 1, padding: 0 }}
      >
        {used ? "✓" : ""}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{de}</div>
        {c.en && <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginTop: 2 }}>{c.en}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5, alignItems: "center" }}>
          {(c.nouns || []).map((n, i) => {
            const col = genderColorForNoun(n) ?? { bg: "#f0f0f0", text: "#666" };
            return <span key={i} style={{ background: col.bg, color: col.text, fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>{n}</span>;
          })}
          {(c.g || []).map((g, i) => {
            const gc = CASE[g.c];
            return <span key={`g${i}`} style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: gc.bg, color: gc.text }}>{g.c}</span>;
          })}
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{Math.min(count, USE_TARGET)} / {USE_TARGET} benutzt</span>
          {ready && (
            <button onClick={() => onMaster(c.id)} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 12, fontSize: 11, fontWeight: 600, padding: "2px 9px", cursor: "pointer" }}>
              Gemeistert ✓
            </button>
          )}
        </div>
      </div>
      <button onClick={() => onSpeak(c.id, de, c.en, chunkDetails(c))} title="Vorlesen" style={{ background: "none", border: "none", cursor: "pointer", color: speaking === c.id ? "#1e40af" : "#bbb", fontSize: 16, padding: "2px 4px" }}>
        {speaking === c.id ? "⏹" : "▶"}
      </button>
    </div>
  );
}

function Tile({ bg, color, icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} style={{ flex: 1, textAlign: "left", background: bg, color, border: "none", borderRadius: 14, padding: 12, minHeight: 84, cursor: "pointer" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <b style={{ display: "block", fontSize: 14, margin: "4px 0 2px" }}>{title}</b>
      <small style={{ fontSize: 11, opacity: 0.75 }}>{sub}</small>
    </button>
  );
}

export default function Heute({ chunks, daily, aCnt, mCnt, total, pct, speaking, speak, toggleMastered, goto }) {
  const latest = useMemo(() => [...chunks].filter((c) => !c.mastered).sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3), [chunks]);
  const usedToday = daily.items.filter((c) => daily.used.has(c.id)).length;

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{greeting()} 👋</h1>
      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 8px" }}>{aCnt} aktiv · {mCnt} gemeistert · {total} gesamt</p>
      <div style={{ background: "#e5e5e5", borderRadius: 3, height: 5 }}>
        <div style={{ background: "#22c55e", width: `${pct}%`, height: "100%", borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "3px 0 0" }}>{pct}% gemeistert</p>

      <div style={sectionTitle}>
        <span>Chunk des Tages</span>
        <span style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          <span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500, color: "#888" }}>{usedToday} / {daily.items.length} ✓</span>
          <button onClick={daily.reshuffle} style={linkBtn}>Neu mischen</button>
        </span>
      </div>
      {daily.items.length === 0 ? (
        <p style={{ fontSize: 12, color: "#bbb" }}>Keine aktiven Chunks übrig.</p>
      ) : (
        daily.items.map((c) => (
          <DailyCard
            key={c.id} chunk={c} used={daily.used.has(c.id)} count={daily.uses[c.id] || 0}
            speaking={speaking} onSpeak={(id, de, en, d) => speak(id, speechText(de), en, d)}
            onToggleUsed={daily.toggleUsed} onMaster={toggleMastered}
          />
        ))
      )}
      <div style={{ fontSize: 11, color: "#aaa", marginTop: -2 }}>Benutze jeden heute einmal in einem echten Gespräch · {USE_TARGET}× benutzt = gemeistert</div>

      <div style={sectionTitle}><span>Jetzt üben</span></div>
      <div style={{ display: "flex", gap: 8 }}>
        <Tile bg="#FBEAF0" color="#4B1528" icon="🔁" title="Echo" sub="Hören und nachsprechen" onClick={() => goto("sprechen", { mode: "echo" })} />
        <Tile bg="#E6F1FB" color="#042C53" icon="💬" title="Übersetzen" sub="Übersetzen und bewerten" onClick={() => goto("sprechen", { mode: "translate" })} />
      </div>

      <div style={sectionTitle}>
        <span>Zuletzt hinzugefügt</span>
        <button onClick={() => goto("sammlung", { tab: "chunks", newest: true })} style={linkBtn}>Alle ›</button>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {latest.map((c) => (
          <ChunkCard key={c.id} chunk={c} speaking={speaking} onSpeak={(id, de, en, d) => speak(id, speechText(de), en, d)} onToggleMastered={toggleMastered} />
        ))}
      </div>
    </div>
  );
}
