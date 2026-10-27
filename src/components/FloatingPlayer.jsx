import { CASE, genderColorForNoun } from "../lib/colors";

const roundBtn = { background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0, width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" };

export default function FloatingPlayer({ speaking, currentChunk, repeatCount, paused, stopAll, pauseResume }) {
  if (!speaking || !currentChunk) return null;
  const { nouns = [], g = [] } = currentChunk.details || {};
  return (
    <div style={{ position: "fixed", bottom: "calc(76px + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", borderRadius: 24, padding: "16px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.35)", width: "95vw", maxWidth: 540, maxHeight: "62vh", zIndex: 999 }}>
      <button onClick={stopAll} style={{ ...roundBtn, color: "#fff", fontSize: 20 }}>⏹</button>

      <div style={{ flex: 1, minWidth: 0, maxHeight: "calc(62vh - 32px)", overflowY: "auto" }}>
        <p style={{ margin: 0, fontSize: 12, color: currentChunk.phase === "repeat" ? "#fcd34d" : "#999", marginBottom: 6 }}>
          {currentChunk.idx ? `${currentChunk.idx} / ${currentChunk.total}${repeatCount > 1 && !currentChunk.phase ? ` · ${currentChunk.rep || 1}×` : ""}` : "Spielt"}
          {currentChunk.phase === "listen" && " · 👂 Hör zu"}
          {currentChunk.phase === "repeat" && " · 🎤 Jetzt du!"}
        </p>

        <p style={{ margin: 0, fontSize: 19, fontWeight: 600, lineHeight: 1.4, wordBreak: "break-word" }}>
          {currentChunk.text}
        </p>

        {nouns.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            {nouns.map((n, i) => {
              const col = genderColorForNoun(n) ?? { bg: "#444", text: "#ddd" };
              return (
                <span key={i} style={{ background: col.bg, color: col.text, fontSize: 13, fontWeight: 700, padding: "2px 10px", borderRadius: 11 }}>{n}</span>
              );
            })}
          </div>
        )}

        {g.length > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {g.map((x, i) => {
              const gc = CASE[x.c];
              return (
                <div key={i} style={{ display: "flex", gap: 7, alignItems: "baseline" }}>
                  {gc && <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: gc.bg, color: gc.text, flexShrink: 0 }}>{x.c}</span>}
                  <span style={{ fontSize: 13, color: "#bbb", lineHeight: 1.4 }}>
                    <b style={{ color: "#fff" }}>{x.w}</b> — {x.n}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {currentChunk.subtitle && (
          <p style={{ margin: "12px 0 0", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontStyle: "italic", color: "#888", lineHeight: 1.4, wordBreak: "break-word" }}>
            {currentChunk.subtitle}
          </p>
        )}
      </div>

      <button onClick={pauseResume} style={{ ...roundBtn, color: paused ? "#fcd34d" : "#fff", fontSize: 24 }}>
        {paused ? "▶" : "⏸"}
      </button>
    </div>
  );
}
