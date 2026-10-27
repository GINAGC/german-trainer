import { useEffect, useMemo, useState } from "react";
import registers from "../data/registers.json";
import { Chips, label, primaryBtn, shuffle } from "../components/sprechenUi";

const REG = [
  ["formal", "Formell", "#378ADD", "#E6F1FB"],
  ["neutral", "Neutral", "#639922", "#EAF3DE"],
  ["casual", "Umgangssprachlich", "#D4537E", "#FBEAF0"],
];

// The TTS voice mispronounces the spoken contractions, so expand them for audio only.
const spoken = (t) => t.replace(/'ne /g, "eine ").replace(/'n /g, "ein ");

export default function RegisterDrill({ speaking, speak, playAll, stopAll, onActive }) {
  const [count, setCount] = useState(10);
  const [sess, setSess] = useState(null);

  const active = !!sess;
  useEffect(() => {
    onActive(active);
    return () => onActive(false);
  }, [active, onActive]);

  const cards = useMemo(() => (sess ? sess.cards : []), [sess]);

  function start() {
    const picked = shuffle(registers).slice(0, count || registers.length);
    setSess({ cards: picked, i: 0, revealed: false, got: 0, partly: 0, done: false });
  }

  function next(kind) {
    stopAll();
    setSess((s) => {
      const got = s.got + (kind === "got" ? 1 : 0);
      const partly = s.partly + (kind === "partly" ? 1 : 0);
      if (s.i + 1 >= s.cards.length) return { ...s, got, partly, done: true };
      return { ...s, got, partly, i: s.i + 1, revealed: false };
    });
  }

  if (!sess) {
    return (
      <div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
          Dieselbe Aussage, <b>drei Register</b>: formell, neutral, umgangssprachlich. Du siehst die Idee, sagst alle
          drei Versionen laut, dann deckst du sie auf. So wechselst du bewusst zwischen den Registern – Ziel für C1.
        </p>
        <p style={label}>Anzahl Sätze</p>
        <div style={{ marginBottom: 14 }}>
          <Chips options={[[10, "10"], [0, `Alle (${registers.length})`]]} value={count} onChange={setCount} />
        </div>
        <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5, margin: "0 0 14px" }}>
          Nachschlagen: Grammatik → Alltagssprache (Register, Verkürzungen, Alltagswörter).
        </p>
        <button onClick={start} style={primaryBtn("#D4537E")}>Register-Drill starten</button>
      </div>
    );
  }

  if (sess.done) {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 10px" }}>Fertig 🎉</p>
        <p style={{ fontSize: 14, lineHeight: 1.9, margin: "0 0 14px" }}>
          ✅ Alle drei gewusst: {sess.got}<br />
          〰️ Teilweise: {sess.partly}<br />
          ❌ Nicht gewusst: {sess.cards.length - sess.got - sess.partly}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} style={{ ...primaryBtn("#D4537E"), flex: 1 }}>Nochmal</button>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#999"), flex: 1 }}>Beenden</button>
        </div>
      </div>
    );
  }

  const c = cards[sess.i];
  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px", textAlign: "center" }}>{sess.i + 1} / {cards.length}</p>
      <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "14px 14px 12px", textAlign: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 3px" }}>{c.es}</p>
        <p style={{ fontSize: 12, color: "#888", fontStyle: "italic", margin: 0 }}>{c.en}</p>
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
        {REG.map(([key, name, accent, bg]) => (
          <div key={key} style={{ border: `1px solid ${sess.revealed ? accent : "#ddd"}`, background: sess.revealed ? bg : "#fff", borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: 0.3 }}>{name}</div>
              <div style={{ fontSize: 15, fontWeight: 500, minHeight: 22, color: sess.revealed ? "#111" : "#bbb" }}>
                {sess.revealed ? c[key] : "Sag es laut …"}
              </div>
            </div>
            {sess.revealed && (
              <button
                onClick={() => speak(`reg-${c.id}-${key}`, spoken(c[key]), name)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: speaking === `reg-${c.id}-${key}` ? "#1e40af" : "#999" }}
              >
                {speaking === `reg-${c.id}-${key}` ? "⏹" : "▶"}
              </button>
            )}
          </div>
        ))}
      </div>

      {!sess.revealed ? (
        <button onClick={() => setSess({ ...sess, revealed: true })} style={primaryBtn("#D4537E")}>Aufdecken</button>
      ) : (
        <>
          <button
            onClick={() => (speaking === "reg-all" ? stopAll() : playAll(REG.map(([k, n]) => ({ text: spoken(c[k]), subtitle: n })), "reg-all"))}
            style={{ ...primaryBtn("#bbb"), padding: "8px", fontSize: 13, marginBottom: 8 }}
          >
            {speaking === "reg-all" ? "⏹ Stop" : "▶ Alle drei anhören"}
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {[["got", "✓ Alle drei", "#16a34a"], ["partly", "~ Teilweise", "#6b7280"], ["miss", "✗ Nicht", "#d97706"]].map(([k, t, bg]) => (
              <button key={k} onClick={() => next(k)} style={{ ...primaryBtn(bg), flex: 1, padding: "11px 4px", fontSize: 13 }}>{t}</button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => { stopAll(); setSess(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 12, marginTop: 12, width: "100%" }}>
        Abbrechen
      </button>
    </div>
  );
}
