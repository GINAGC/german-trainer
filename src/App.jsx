import { useState } from "react";
import BottomNav from "./components/BottomNav";
import FloatingPlayer from "./components/FloatingPlayer";
import Heute from "./screens/Heute";
import Sammlung from "./screens/Sammlung";
import Sprechen from "./screens/Sprechen";
import Grammatik from "./screens/Grammatik";
import { useSpeech } from "./hooks/useSpeech";
import { useMasteredChunks } from "./hooks/useMasteredChunks";
import { useKnownWords } from "./hooks/useKnownWords";
import { useDailyChunks } from "./hooks/useDailyChunks";

export default function App() {
  const [section, setSection] = useState("heute");
  const [sammlungTab, setSammlungTab] = useState("chunks");
  const [sammlungNewest, setSammlungNewest] = useState(false);
  const [sprechenMode, setSprechenMode] = useState("echo");
  const [grammatikPage, setGrammatikPage] = useState(null);

  const { chunks, toggleMastered } = useMasteredChunks();
  const { knownWords, markKnown, undoKnown } = useKnownWords();
  const speech = useSpeech();
  const daily = useDailyChunks(chunks);

  const total = chunks.length;
  const mCnt = chunks.filter((c) => c.mastered).length;
  const aCnt = total - mCnt;
  const pct = total > 0 ? Math.round((mCnt / total) * 100) : 0;

  // Jump from a Home shortcut into a section, optionally pre-selecting a tab/mode.
  function goto(sec, opts = {}) {
    if (opts.tab) setSammlungTab(opts.tab);
    setSammlungNewest(!!opts.newest);
    if (opts.mode) setSprechenMode(opts.mode);
    setSection(sec);
  }

  function selectSection(id) {
    if (id === section && id === "grammatik") setGrammatikPage(null);
    if (id === section) window.scrollTo({ top: 0 });
    setSection(id);
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, color: "#1a1a1a", background: "#fff", minHeight: "100vh", maxWidth: 900, margin: "0 auto", paddingBottom: "calc(72px + env(safe-area-inset-bottom))" }}>
      {section === "heute" && (
        <Heute
          chunks={chunks} daily={daily} aCnt={aCnt} mCnt={mCnt} total={total} pct={pct}
          speaking={speech.speaking} speak={speech.speak} toggleMastered={toggleMastered} goto={goto}
        />
      )}

      {section === "sammlung" && (
        <Sammlung
          key={sammlungNewest ? "newest" : "default"}
          tab={sammlungTab} setTab={setSammlungTab} newest={sammlungNewest}
          chunks={chunks} toggleMastered={toggleMastered}
          knownWords={knownWords} markKnown={markKnown} undoKnown={undoKnown} speech={speech}
        />
      )}

      {section === "sprechen" && (
        <Sprechen
          key={sprechenMode} initialMode={sprechenMode}
          chunks={chunks} toggleMastered={toggleMastered}
          speaking={speech.speaking} speak={speech.speak} echoAll={speech.echoAll} stopAll={speech.stopAll}
        />
      )}

      {section === "grammatik" && <Grammatik page={grammatikPage} setPage={setGrammatikPage} speech={speech} />}

      <FloatingPlayer
        speaking={speech.speaking} currentChunk={speech.currentChunk}
        repeatCount={speech.repeatCount} paused={speech.paused}
        stopAll={speech.stopAll} pauseResume={speech.pauseResume}
      />
      <BottomNav section={section} onSelect={selectSection} />
    </div>
  );
}
