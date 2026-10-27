import SegmentedControl from "../components/SegmentedControl";
import Chunks from "./Chunks";
import Woerter from "./Woerter";
import Archiv from "./Archiv";

export default function Sammlung({ tab, setTab, newest, chunks, toggleMastered, knownWords, markKnown, undoKnown, speech }) {
  return (
    <>
      <div style={{ padding: "16px 16px 0" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px" }}>Sammlung</h1>
        <SegmentedControl options={[["chunks", "Chunks"], ["woerter", "Wörter"], ["archiv", "Archiv"]]} value={tab} onChange={setTab} />
      </div>

      {tab === "chunks" && (
        <Chunks
          chunks={chunks} toggleMastered={toggleMastered} startNewest={newest}
          speaking={speech.speaking} speak={speech.speak} playAll={speech.playAll} stopAll={speech.stopAll}
          repeatCount={speech.repeatCount} setRepeatCount={speech.setRepeatCount}
        />
      )}
      {tab === "woerter" && (
        <Woerter
          knownWords={knownWords} markKnown={markKnown} undoKnown={undoKnown}
          speaking={speech.speaking} speak={speech.speak} playAll={speech.playAll} stopAll={speech.stopAll}
          repeatCount={speech.repeatCount} setRepeatCount={speech.setRepeatCount}
        />
      )}
      {tab === "archiv" && (
        <Archiv
          chunks={chunks} toggleMastered={toggleMastered}
          knownWords={knownWords} undoKnown={undoKnown}
          speaking={speech.speaking} speak={speech.speak}
        />
      )}
    </>
  );
}
