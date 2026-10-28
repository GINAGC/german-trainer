import { useEffect } from "react";
import Tabellen from "./Tabellen";
import GenusRegeln from "./GenusRegeln";
import Deklination from "./Deklination";
import VerbenSatzbau from "./VerbenSatzbau";
import Alltagssprache from "./Alltagssprache";

const PAGES = [
  { id: "tabellen", label: "Tabellen", sub: "Artikel, Pronomen, Akkusativ vs. Dativ", color: "#f3f0ff", Comp: Tabellen },
  { id: "genus", label: "Genus-Regeln", sub: "Den Artikel an der Endung erkennen", color: "#EAF3DE", Comp: GenusRegeln },
  { id: "deklination", label: "Deklination", sub: "der-/ein-Wörter, Adjektive, Possessiva", color: "#E0F5F3", Comp: Deklination },
  { id: "satzbau", label: "Verben & Satzbau", sub: "Zeiten, Modalverben, Modalpartikeln, Konzessiv, B1-Fehler", color: "#E6F1FB", Comp: VerbenSatzbau },
  { id: "alltag", label: "Alltagssprache", sub: "Register, Verkürzungen, gesprochener Satzbau, Smalltalk", color: "#FBEAF0", Comp: Alltagssprache },
];

export default function Grammatik({ page, setPage, speech, topic, group }) {
  // Arriving from the daily practice: scroll to the section that is today's topic.
  useEffect(() => {
    if (!page || !topic) return;
    const t = setTimeout(() => document.querySelector(`[data-topic="${topic}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" }), 80);
    return () => clearTimeout(t);
  }, [page, topic]);

  const current = PAGES.find((p) => p.id === page);
  if (current) {
    const { Comp } = current;
    return (
      <>
        <div style={{ padding: "12px 16px 0" }}>
          <button onClick={() => setPage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D4537E", fontSize: 13, fontWeight: 500, padding: 0 }}>‹ Grammatik</button>
        </div>
        <Comp key={`${page}-${group || ""}`} speaking={speech.speaking} playAll={speech.playAll} initialGroup={group} />
      </>
    );
  }
  return (
    <div style={{ padding: "16px 16px 24px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Grammatik</h1>
      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 14px" }}>Nachschlagen</p>
      {PAGES.map((p) => (
        <button
          key={p.id} onClick={() => setPage(p.id)}
          style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "13px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}
        >
          <span style={{ width: 34, height: 34, borderRadius: 9, background: p.color, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <b style={{ display: "block", fontSize: 14 }}>{p.label}</b>
            <span style={{ fontSize: 11, color: "#888" }}>{p.sub}</span>
          </span>
          <span style={{ color: "#bbb", fontSize: 20 }}>›</span>
        </button>
      ))}
    </div>
  );
}
