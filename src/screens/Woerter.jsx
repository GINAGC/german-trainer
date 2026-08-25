import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import wordsData from "../data/words.json";
import RepeatCountControl from "../components/RepeatCountControl";
import WordRow from "../components/WordRow";
import { wordSpeechText } from "../lib/speechText";

export default function Woerter({ knownWords, markKnown, undoKnown, speaking, speak, playAll, stopAll, repeatCount, setRepeatCount }) {
  const [wordSearch, setWordSearch] = useState("");
  const [showKnown, setShowKnown] = useState(false);
  const parentRef = useRef(null);

  const filtered = useMemo(() => {
    const q = wordSearch.trim().toLowerCase();
    return wordsData.filter((w) => {
      if (knownWords.has(w.g)) return false;
      if (!q) return true;
      return w.g.toLowerCase().includes(q) || w.t.toLowerCase().includes(q);
    });
  }, [wordSearch, knownWords]);

  const knownList = useMemo(() => Array.from(knownWords), [knownWords]);
  const remaining = wordsData.length - knownWords.size;

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 46,
    overscan: 10,
  });

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "#555" }}>{remaining} offen · {knownWords.size} bekannt</span>
          <span style={{ fontSize: 11, color: "#1D9E75", fontWeight: 600 }}>{wordsData.length} gesamt</span>
        </div>
        {knownWords.size > 0 && (
          <div style={{ marginTop: 6, background: "#e1f5ee", borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#0D3B36" }}>✓ {knownWords.size} bekannt</span>
            <button onClick={() => setShowKnown((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "#1D9E75", fontSize: 11, fontWeight: 600, padding: 0 }}>
              {showKnown ? "Ausblenden" : "Liste"}
            </button>
          </div>
        )}
        {showKnown && knownList.length > 0 && (
          <div style={{ marginTop: 6, background: "#f9f9f9", borderRadius: 8, padding: "8px 10px", border: "1px solid #e5e5e5" }}>
            <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px", fontWeight: 600 }}>Bekannte Wörter:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {knownList.map((w, i) => (
                <span key={i} style={{ fontSize: 11, background: "#e1f5ee", color: "#0D3B36", padding: "2px 8px", borderRadius: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {w}
                  <button onClick={() => undoKnown(w)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 10, padding: 0, lineHeight: 1 }}>↩</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
        <input value={wordSearch} onChange={(e) => setWordSearch(e.target.value)} placeholder="Suchen..." style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }} />
        <RepeatCountControl repeatCount={repeatCount} setRepeatCount={setRepeatCount} />
        <button
          onClick={() => { if (speaking) stopAll(); else playAll(filtered.map((w) => ({ id: w.g, text: wordSpeechText(w.g), subtitle: w.t }))); }}
          style={{ cursor: "pointer", border: `1px solid ${speaking ? "#93c5fd" : "#ddd"}`, background: speaking ? "#dbeafe" : "transparent", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: speaking ? "#1e40af" : "#555", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
        >
          {speaking ? "⏹ Stop" : "▶ Alle"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 10px" }}>{filtered.length} Wörter</p>

      <div ref={parentRef} style={{ height: "calc(100vh - 260px)", minHeight: 300, overflow: "auto" }}>
        <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
          {virtualizer.getVirtualItems().map((vi) => {
            const w = filtered[vi.index];
            return (
              <div
                key={vi.key}
                data-index={vi.index}
                ref={virtualizer.measureElement}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vi.start}px)`, paddingBottom: 6 }}
              >
                <WordRow word={w} id={w.g} speaking={speaking} onSpeak={(id, g) => speak(id, wordSpeechText(g), w.t)} onAction={markKnown} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
