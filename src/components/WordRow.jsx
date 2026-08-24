import { genderColorForArticle } from "../lib/colors";

export default function WordRow({ word: w, id, speaking, onSpeak, onAction, actionIcon = "✓", actionTitle = "Ich kenne dieses Wort" }) {
  const article = w.g.startsWith("der ") ? "der" : w.g.startsWith("die ") ? "die" : w.g.startsWith("das ") ? "das" : null;
  const articleColor = genderColorForArticle(article);

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      {articleColor && (
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: articleColor.bg, color: articleColor.text, flexShrink: 0 }}>{article}</span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{w.g.replace(/^(der|die|das) /, "")}</span>
        <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>{w.t}</span>
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button onClick={() => onSpeak(id, w.g)} title="Vorlesen" style={{ background: speaking === id ? "#dbeafe" : "none", border: "none", cursor: "pointer", color: speaking === id ? "#1e40af" : "#ccc", fontSize: 13, padding: "2px 4px", lineHeight: 1 }}>
          {speaking === id ? "⏹" : "▶"}
        </button>
        <button onClick={() => onAction(w.g)} title={actionTitle} style={{ background: "none", border: "1px solid #ccc", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", flexShrink: 0 }}>
          {actionIcon}
        </button>
      </div>
    </div>
  );
}
