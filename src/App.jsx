import { useState } from "react";
import Header from "./components/Header";
import FloatingPlayer from "./components/FloatingPlayer";
import Chunks from "./screens/Chunks";
import Woerter from "./screens/Woerter";
import Tabellen from "./screens/Tabellen";
import Archiv from "./screens/Archiv";
import { useSpeech } from "./hooks/useSpeech";
import { useMasteredChunks } from "./hooks/useMasteredChunks";
import { useKnownWords } from "./hooks/useKnownWords";

export default function App() {
  const [mainTab, setMainTab] = useState("chunks");
  const { chunks, toggleMastered } = useMasteredChunks();
  const { knownWords, markKnown, undoKnown } = useKnownWords();
  const speech = useSpeech();

  const total = chunks.length;
  const mCnt = chunks.filter((c) => c.mastered).length;
  const aCnt = total - mCnt;
  const pct = total > 0 ? Math.round((mCnt / total) * 100) : 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#1a1a1a", background: "#fff", minHeight: "100vh", maxWidth: 900, margin: "0 auto" }}>
      <Header
        mainTab={mainTab} setMainTab={setMainTab}
        aCnt={aCnt} mCnt={mCnt} total={total} pct={pct}
        voice={speech.voice} setVoice={speech.setVoice} voiceList={speech.voiceList}
      />

      {mainTab === "tabellen" && <Tabellen />}

      {mainTab === "woerter" && (
        <Woerter
          knownWords={knownWords} markKnown={markKnown} undoKnown={undoKnown}
          speaking={speech.speaking} speak={speech.speak} playAll={speech.playAll} stopAll={speech.stopAll}
          repeatCount={speech.repeatCount} setRepeatCount={speech.setRepeatCount}
        />
      )}

      {mainTab === "chunks" && (
        <Chunks
          chunks={chunks} toggleMastered={toggleMastered}
          speaking={speech.speaking} speak={speech.speak} playAll={speech.playAll} stopAll={speech.stopAll}
          repeatCount={speech.repeatCount} setRepeatCount={speech.setRepeatCount}
        />
      )}

      {mainTab === "archiv" && (
        <Archiv
          chunks={chunks} toggleMastered={toggleMastered}
          knownWords={knownWords} undoKnown={undoKnown}
          speaking={speech.speaking} speak={speech.speak}
        />
      )}

      <FloatingPlayer
        speaking={speech.speaking} currentChunk={speech.currentChunk}
        repeatCount={speech.repeatCount} paused={speech.paused}
        stopAll={speech.stopAll} pauseResume={speech.pauseResume}
      />
    </div>
  );
}
