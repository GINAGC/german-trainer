import { useMemo, useState } from "react";
import ChunkCard from "../components/ChunkCard";
import SegmentedControl from "../components/SegmentedControl";
import { speechText, chunkDetails } from "../lib/speechText";

const NVV_ORDER = ["Entscheiden & Handeln", "Sprechen & Diskutieren", "Denken & Bewerten", "Prozesse & Veränderung", "Beziehungen & Kontakt"];

const BLUE = { border: "#378ADD", bg: "#E6F1FB", color: "#042C53" };

// Fill-in exercise: replace the plain verb by the Nomen-Verb-Verbindung.
const EXERCISE = [
  ["Ich möchte dich etwas fragen.", "Ich möchte dir eine Frage stellen."],
  ["Das Wetter ist unwichtig.", "Das Wetter spielt keine Rolle."],
  ["Die neue Regel gilt ab nächster Woche.", "Die neue Regel tritt nächste Woche in Kraft."],
  ["Sie hat den Plan stark kritisiert.", "Sie hat scharfe Kritik am Plan geübt."],
  ["Ich habe lange über die Reise nachgedacht.", "Ich habe mir lange Gedanken über die Reise gemacht."],
  ["Ich schlage vor, früher zu beginnen.", "Ich möchte den Vorschlag machen, früher zu beginnen."],
];

function Chip({ on, onClick, children }) {
  return (
    <button onClick={onClick} style={{ cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, border: `1px solid ${on ? BLUE.border : "#ddd"}`, background: on ? BLUE.bg : "transparent", color: on ? BLUE.color : "#555", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: on ? 500 : 400 }}>
      {children}
    </button>
  );
}

const flagStyle = { fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "#EEEDFE", color: "#3c3489" };

function VerbHeader({ v }) {
  return (
    <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <b style={{ fontSize: 16, color: BLUE.color }}>{v.inf}</b>
        {(v.f || []).map((f) => <span key={f} style={flagStyle}>{f}</span>)}
      </div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{v.t}</div>
    </div>
  );
}

function NvvHeader({ n }) {
  return (
    <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #f0f0f0" }}>
      <b style={{ fontSize: 16, color: "#0D3B36" }}>{n.phrase}</b>
      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>statt: <i>{n.simple}</i></div>
    </div>
  );
}

function Exercise() {
  return (
    <div style={{ marginTop: 22, border: "1px solid #e5e5e5", borderRadius: 12, padding: 14 }}>
      <b style={{ fontSize: 14 }}>Mach es C1</b>
      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 10px" }}>Ersetze das einfache Verb durch eine Nomen-Verb-Verbindung – sag es erst laut, dann tippe auf den Satz.</p>
      {EXERCISE.map(([plain, nvv], i) => (
        <details key={i} style={{ borderTop: i ? "1px solid #f0f0f0" : "none", padding: "8px 0" }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 500 }}>{i + 1}. {plain}</summary>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#0D3B36", fontWeight: 600 }}>→ {nvv}</p>
        </details>
      ))}
    </div>
  );
}

export default function Verben({ chunks, toggleMastered, speech }) {
  const [tab, setTab] = useState("verben");
  const [grp, setGrp] = useState("all");
  const [search, setSearch] = useState("");

  const all = useMemo(() => {
    if (tab === "verben") return chunks.filter((c) => c.verb);
    // NVV: a chunk added earlier may carry the tag, so order by theme first.
    return chunks.filter((c) => c.nvv).sort((a, b) => NVV_ORDER.indexOf(a.nvv.grp) - NVV_ORDER.indexOf(b.nvv.grp) || Number(a.id) - Number(b.id));
  }, [chunks, tab]);
  const field = tab === "verben" ? "verb" : "nvv";

  const groups = useMemo(() => {
    const m = new Map();
    for (const c of all) m.set(c[field].grp, (m.get(c[field].grp) || 0) + 1);
    return [...m.entries()];
  }, [all, field]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((c) => {
      if (grp !== "all" && c[field].grp !== grp) return false;
      if (!q) return true;
      const o = c[field];
      return [c.de, c.en, o.inf, o.t, o.phrase, o.simple].some((x) => (x || "").toLowerCase().includes(q));
    });
  }, [all, grp, search, field]);

  const { speaking, speak, playAll, stopAll } = speech;
  const switchTab = (t) => { if (speaking) stopAll(); setTab(t); setGrp("all"); setSearch(""); };
  const onSpeak = (id, de, en, d) => speak(id, speechText(de), en, d);

  return (
    <>
      <div style={{ padding: "16px 16px 0", borderBottom: "1px solid #e5e5e5" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px" }}>Verben</h1>
        <SegmentedControl
          options={[["verben", `100 Verben`], ["nvv", `Nomen-Verb-Verb.`]]}
          value={tab} onChange={switchTab}
        />
        <div style={{ display: "flex", gap: 8, margin: "10px 0 8px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." style={{ flex: 1, minWidth: 0, border: "1px solid #ccc", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit" }} />
          <button
            onClick={() => { if (speaking) stopAll(); else playAll(shown.map((c) => ({ id: c.id, text: speechText(c.de), subtitle: c.en, details: chunkDetails(c) }))); }}
            style={{ cursor: "pointer", border: `1px solid ${speaking ? "#93c5fd" : "#ddd"}`, background: speaking ? "#dbeafe" : "transparent", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: speaking ? "#1e40af" : "#555", whiteSpace: "nowrap" }}
          >
            {speaking ? "⏹ Stop" : "▶ Alle"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          <Chip on={grp === "all"} onClick={() => setGrp("all")}>Alle ({all.length})</Chip>
          {groups.map(([g, n]) => <Chip key={g} on={grp === g} onClick={() => setGrp(g)}>{g} ({n})</Chip>)}
        </div>
      </div>

      <div style={{ padding: "12px 16px 24px" }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", lineHeight: 1.5 }}>
          {tab === "verben"
            ? "Lerne jedes Verb mit seinem Satz als Chunk. Trennbare Verben: das Präfix geht ans Satzende – „Ich hole dich ab.“"
            : "Nomen-Verb-Verbindungen sind fest – das Verb lässt sich nicht ableiten: man trifft eine Entscheidung, man stellt eine Frage. Immer als Chunk lernen."}
        </p>
        {shown.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", padding: 32 }}>Keine Ergebnisse.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
            {shown.map((c) => (
              <ChunkCard
                key={c.id} chunk={c} speaking={speaking} onSpeak={onSpeak} onToggleMastered={toggleMastered}
                header={tab === "verben" ? <VerbHeader v={c.verb} /> : <NvvHeader n={c.nvv} />}
              />
            ))}
          </div>
        )}
        {tab === "nvv" && <Exercise />}
      </div>
    </>
  );
}
