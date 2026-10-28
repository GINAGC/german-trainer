import { useState } from "react";
import BottomNav from "./components/BottomNav";
import FloatingPlayer from "./components/FloatingPlayer";
import Heute from "./screens/Heute";
import Sammlung from "./screens/Sammlung";
import Verben from "./screens/Verben";
import Sprechen from "./screens/Sprechen";
import Grammatik from "./screens/Grammatik";
import { useSpeech } from "./hooks/useSpeech";
import { useMasteredChunks } from "./hooks/useMasteredChunks";
import { useKnownWords } from "./hooks/useKnownWords";
import { useDailyPractice } from "./hooks/useDailyPractice";

export default function App() {
  const [section, setSection] = useState("heute");
  const [sammlungTab, setSammlungTab] = useState("chunks");
  const [sammlungNewest, setSammlungNewest] = useState(false);
  const [sprechenStep, setSprechenStep] = useState(null);
  const [grammatikPage, setGrammatikPage] = useState(null);
  const [grammatikTopic, setGrammatikTopic] = useState(null);
  const [grammatikGroup, setGrammatikGroup] = useState(null);
  const [verbenInit, setVerbenInit] = useState(null);

  const { chunks, toggleMastered } = useMasteredChunks();
  const { knownWords, markKnown, undoKnown } = useKnownWords();
  const speech = useSpeech();
  const daily = useDailyPractice(chunks);

  const total = chunks.length;
  const mCnt = chunks.filter((c) => c.mastered).length;
  const aCnt = total - mCnt;
  const pct = total > 0 ? Math.round((mCnt / total) * 100) : 0;

  // Jump from the daily practice into a section, optionally to a specific tab/topic.
  function goto(sec, opts = {}) {
    if (sec === "sammlung") {
      if (opts.tab) setSammlungTab(opts.tab);
      setSammlungNewest(!!opts.newest);
    }
    if (sec === "sprechen") setSprechenStep(opts.step || null);
    if (sec === "grammatik") {
      setGrammatikPage(opts.page || null);
      setGrammatikTopic(opts.topic || null);
      setGrammatikGroup(opts.group || null);
    }
    if (sec === "verben") setVerbenInit(opts.tab ? { tab: opts.tab, grp: opts.grp || "all" } : null);
    setSection(sec);
  }

  function selectSection(id) {
    if (id === section && id === "grammatik") setGrammatikPage(null);
    if (id === section) window.scrollTo({ top: 0 });
    // Coming in from the bar starts fresh; only the daily-practice links preselect.
    if (id !== section) {
      if (id === "sprechen") setSprechenStep(null);
      if (id === "verben") setVerbenInit(null);
      if (id === "grammatik") { setGrammatikTopic(null); setGrammatikGroup(null); }
    }
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

      {section === "verben" && (
        <Verben
          key={verbenInit ? `${verbenInit.tab}-${verbenInit.grp}` : "default"}
          chunks={chunks} toggleMastered={toggleMastered} speech={speech}
          initialTab={verbenInit?.tab} initialGrp={verbenInit?.grp}
        />
      )}

      {section === "sprechen" && (
        <Sprechen
          key={sprechenStep || "overview"} initialStep={sprechenStep}
          chunks={chunks} toggleMastered={toggleMastered} speech={speech} daily={daily}
        />
      )}

      {section === "grammatik" && (
        <Grammatik page={grammatikPage} setPage={setGrammatikPage} speech={speech} topic={grammatikTopic} group={grammatikGroup} />
      )}

      <FloatingPlayer
        speaking={speech.speaking} currentChunk={speech.currentChunk}
        repeatCount={speech.repeatCount} paused={speech.paused}
        stopAll={speech.stopAll} pauseResume={speech.pauseResume}
      />
      <BottomNav section={section} onSelect={selectSection} />
    </div>
  );
}
