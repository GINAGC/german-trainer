export default function FloatingPlayer({ speaking, currentChunk, repeatCount, paused, stopAll, pauseResume }) {
  if (!speaking || !currentChunk) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", borderRadius: 24, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.35)", width: "92vw", maxWidth: 480, zIndex: 999 }}>
      <button onClick={stopAll} style={{ background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: "#fff", fontSize: 22, padding: 0, lineHeight: 1, flexShrink: 0, width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        ⏹
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#aaa", marginBottom: 5 }}>
          {currentChunk.idx ? `${currentChunk.idx} / ${currentChunk.total}${repeatCount > 1 ? ` · ${currentChunk.rep || 1}×` : ""}` : "Spielt"}
        </p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 500, lineHeight: 1.5, wordBreak: "break-word" }}>
          {currentChunk.text}
        </p>
      </div>
      <button onClick={pauseResume} style={{ background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", color: paused ? "#fcd34d" : "#fff", fontSize: 26, padding: 0, lineHeight: 1, flexShrink: 0, width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {paused ? "▶" : "⏸"}
      </button>
    </div>
  );
}
