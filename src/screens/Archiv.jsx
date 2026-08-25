import { useMemo } from "react";
import wordsData from "../data/words.json";
import ChunkCard from "../components/ChunkCard";
import WordRow from "../components/WordRow";
import { speechText, wordSpeechText } from "../lib/speechText";

export default function Archiv({ chunks, toggleMastered, knownWords, undoKnown, speaking, speak }) {
  const masteredChunks = useMemo(() => chunks.filter((c) => c.mastered), [chunks]);

  const knownWordObjs = useMemo(() => {
    if (knownWords.size === 0) return [];
    return wordsData.filter((w) => knownWords.has(w.g));
  }, [knownWords]);

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 16px" }}>
        Gemeisterte Chunks und bekannte Wörter landen hier — nichts wird gelöscht, du kannst alles jederzeit zurückholen.
      </p>

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>
        Gemeisterte Chunks ({masteredChunks.length})
      </p>
      {masteredChunks.length === 0 ? (
        <p style={{ fontSize: 12, color: "#bbb", margin: "0 0 24px" }}>Noch nichts gemeistert.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8, marginBottom: 24 }}>
          {masteredChunks.map((c) => (
            <ChunkCard
              key={c.id}
              chunk={c}
              speaking={speaking}
              onSpeak={(id, de, en) => speak(id, speechText(de), en)}
              onToggleMastered={toggleMastered}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 8px" }}>
        Bekannte Wörter ({knownWordObjs.length})
      </p>
      {knownWordObjs.length === 0 ? (
        <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>Noch keine Wörter als bekannt markiert.</p>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {knownWordObjs.map((w) => (
            <WordRow
              key={w.g}
              word={w}
              id={w.g}
              speaking={speaking}
              onSpeak={(id, g) => speak(id, wordSpeechText(g), w.t)}
              onAction={undoKnown}
              actionIcon="↩"
              actionTitle="Zurück zu Wörter"
            />
          ))}
        </div>
      )}
    </div>
  );
}
