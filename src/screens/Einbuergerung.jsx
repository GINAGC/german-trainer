import { useMemo, useRef, useState } from "react";
import { pill, shuffle } from "../components/sprechenUi";
import JsonImport from "../components/JsonImport";
import RepeatCountControl from "../components/RepeatCountControl";
import { usePersisted, validateEin } from "../hooks/useEinbuergerung";

const ACCENT = "#b45309";
const SOFT = "#fef3c7";
const box = { border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", marginBottom: 10 };
const h2 = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "20px 0 8px" };
const esStyle = { fontSize: 12.5, color: "#7a4f00", fontStyle: "italic", marginTop: 3, lineHeight: 1.45, whiteSpace: "pre-line" };

// ---- speech text: "1.1" → "eins Punkt eins", quotes and abbreviations removed ----
const DIG = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun"];
const nrWords = (nr) => nr.split(".").map((p) => (/^\d$/.test(p) ? DIG[+p] : p)).join(" Punkt ");
export const sp = (t) => t
  .replace(/Nr\.\s*(\d+(?:\.\d+)*)/g, (_, n) => `Nummer ${nrWords(n)}`)
  .replace(/(^|\s)(\d+\.\d+(?:\.\d+)*)(?=[:\s])/g, (_, s, n) => `${s}${nrWords(n)}`)
  .replace(/[„“‚‘"«»]/g, "")
  .replace(/z\.\s?B\./g, "zum Beispiel")
  .replace(/…/g, "")
  .replace(/\s+/g, " ")
  .trim();

const qid = (q) => `q:${q.nr}|${q.q.de.slice(0, 40)}`;
const isIntro = (t) => t.nr === "·";
const teilOf = (nr) => (nr.startsWith("1") ? "1" : nr.startsWith("2") ? "2" : nr.startsWith("3") ? "3" : "");

// What a block says when played: the label tells the listener which part is coming.
function blockItems(b, merk) {
  if (b.k === "merk") return merk ? [{ text: sp(b.de), say: `Merkblatt. ${sp(b.de)}`, subtitle: b.es }] : [];
  if (b.k === "own") return [{ text: sp(b.de), say: `Mit eigenen Worten. ${sp(b.de)}`, subtitle: b.es }];
  if (b.k === "note") return [{ text: sp(b.de), subtitle: b.es }];
  if (b.k === "list") return [{ text: sp(b.title.de), subtitle: b.title.es }, ...b.items.map((it) => ({ text: sp(it.de), subtitle: it.es }))];
  if (b.k === "group") return [{ text: sp(b.title.de), subtitle: b.title.es }, ...b.blocks.flatMap((x) => blockItems(x, merk))];
  // Older import files had flat "head" / "bullet" blocks.
  return b.de ? [{ text: sp(b.de), subtitle: b.es }] : [];
}
const isOldFormat = (topics) => topics.some((t) => t.blocks.some((b) => b.k === "head" || b.k === "bullet"));
const qaItems = (list, labels = false) => list.flatMap((q) => [
  { text: sp(q.q.de), say: labels ? `Frage. ${sp(q.q.de)}` : undefined, subtitle: q.q.es },
  { text: sp(q.a.de), say: labels ? `Antwort. ${sp(q.a.de)}` : undefined, subtitle: q.a.es },
]);
function topicItems(t, { merk, withQ, qs }) {
  const items = [{ text: sp(t.nr === "·" ? t.title.de : `Punkt ${nrWords(t.nr)}. ${t.title.de}`), subtitle: t.title.es }];
  t.blocks.forEach((b) => items.push(...blockItems(b, merk)));
  if (withQ) items.push(...qaItems(qs.filter((q) => q.nr === t.nr), true));
  return items;
}

function Play({ id, speech, text, es, size = 15 }) {
  const on = speech.speaking === id;
  return (
    <button
      onClick={() => speech.speak(id, text, es)} aria-label="Vorlesen"
      style={{ background: "none", border: "none", cursor: "pointer", fontSize: size, color: on ? ACCENT : "#aaa", padding: "1px 3px", flexShrink: 0 }}
    >
      {on ? "⏹" : "▶"}
    </button>
  );
}

const Lra = () => <span title="Aus dem Vorbereitungsblatt des Landratsamts" style={{ fontSize: 9.5, fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", borderRadius: 4, padding: "1px 5px", marginLeft: 6, verticalAlign: "middle" }}>LRA</span>;
const Added = () => <span style={{ fontSize: 9.5, fontWeight: 700, color: "#92400e", background: SOFT, borderRadius: 4, padding: "1px 5px", marginLeft: 6, verticalAlign: "middle" }}>ERGÄNZUNG</span>;

// One look per kind of content, so every part of a topic sits in a clearly labelled box.
const TONES = {
  merk: { label: "MERKBLATT", bg: "#f5f5f5", bar: "#bdbdbd", fg: "#777" },
  own: { label: "MIT EIGENEN WORTEN", bg: SOFT, bar: ACCENT, fg: "#92400e" },
  note: { label: "HINWEIS", bg: "#eff6ff", bar: "#93c5fd", fg: "#1d4ed8" },
  list: { label: "", bg: "#fff", bar: "#a3a3a3", fg: "#555" },
  qa: { label: "", bg: "#f0fdf4", bar: "#86efac", fg: "#15803d" },
};

function PlayAll({ id, items, speech }) {
  const on = speech.speaking === id;
  return (
    <button onClick={() => (on ? speech.stopAll() : speech.playAll(items, id))} aria-label="Abschnitt anhören" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: on ? ACCENT : "#999", padding: "0 3px", flexShrink: 0 }}>
      {on ? "⏹" : "▶"}
    </button>
  );
}

function Box({ tone, label, added, play, children, plain }) {
  const c = TONES[tone];
  return (
    <div style={{ margin: "10px 0", padding: "8px 10px 10px", borderRadius: 10, background: c.bg, borderLeft: `3px solid ${c.bar}`, border: plain ? `1px solid #e5e5e5` : undefined, ...(plain ? { borderLeft: `3px solid ${c.bar}` } : {}) }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, color: c.fg, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span>{label || c.label}{added && <Added />}</span>
        {play}
      </div>
      {children}
    </div>
  );
}

function BlockView({ b, id, es, merk, speech, silent }) {
  const trans = (txt) => (es && txt ? <div style={esStyle}>{txt}</div> : null);
  if (b.k === "group") {
    return (
      <div style={{ margin: "14px 0", padding: "10px 10px 2px", borderRadius: 12, border: "1px solid #e5e5e5", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>{b.title.de}</div>
            {trans(b.title.es)}
          </div>
          {!silent && <PlayAll id={id} items={blockItems(b, merk)} speech={speech} />}
        </div>
        {b.blocks.map((x, i) => <BlockView key={i} b={x} id={`${id}-${i}`} es={es} merk={merk} speech={speech} silent={silent} />)}
      </div>
    );
  }
  if (b.k === "list") {
    return (
      <Box tone="list" plain label="LISTE" play={silent ? null : <PlayAll id={id} items={blockItems(b, true)} speech={speech} />}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{b.title.de}</div>
        {trans(b.title.es)}
        <div style={{ marginTop: 6 }}>
          {b.items.map((it, i) => (
            <div key={i} style={{ padding: "5px 0", borderTop: i ? "1px solid #f0f0f0" : "none", fontSize: 14, lineHeight: 1.5 }}>
              • {it.de}{it.added && <Added />}
              {trans(it.es)}
            </div>
          ))}
        </div>
      </Box>
    );
  }
  const play = silent ? null : <Play id={id} speech={speech} text={sp(b.de)} es={b.es} />;
  const own = b.k === "own";
  return (
    <Box tone={TONES[b.k] ? b.k : "note"} added={b.added} play={play}>
      <div style={{ fontSize: own ? 14.5 : 13.5, lineHeight: 1.55, color: b.k === "merk" ? "#444" : "#1a1a1a", fontWeight: own ? 500 : 400, whiteSpace: "pre-line" }}>{b.de}</div>
      {trans(b.es)}
    </Box>
  );
}

function QA({ q, id, es, speech, weak, onWeak }) {
  return (
    <div style={{ padding: "8px 0", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        <button onClick={() => speech.playAll(qaItems([q]), id)} aria-label="Frage und Antwort anhören" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: speech.speaking === id ? ACCENT : "#aaa", padding: "1px 3px", flexShrink: 0 }}>
          {speech.speaking === id ? "⏹" : "▶"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{q.q.de}{q.lra && <Lra />}{q.added && <Added />}</div>
          {es && <div style={esStyle}>{q.q.es}</div>}
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4, color: "#1a1a1a" }}>{q.a.de}</div>
          {es && <div style={esStyle}>{q.a.es}</div>}
        </div>
        {onWeak && <button onClick={onWeak} aria-label="Schwierig" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: weak ? "#dc2626" : "#ccc", padding: "0 2px" }}>⚑</button>}
      </div>
    </div>
  );
}

// ---------------- tab: Lernen ----------------
function Lernen({ ein, es, merk, withQ, speech }) {
  const { topics, questions } = ein.data;
  const [open, setOpen] = useState(() => new Set());
  const toggle = (nr) => setOpen((s) => { const n = new Set(s); if (n.has(nr)) n.delete(nr); else n.add(nr); return n; });
  const opts = { merk, withQ, qs: questions };
  // The Einleitung is reference text only: no audio.
  const all = () => speech.playAll(topics.filter((t) => !isIntro(t)).flatMap((t) => topicItems(t, opts)), "ein-lernen-all");
  const allOn = speech.speaking === "ein-lernen-all";
  return (
    <div>
      {isOldFormat(topics) && (
        <p style={{ fontSize: 12.5, color: "#92400e", background: SOFT, borderRadius: 8, padding: "8px 10px", lineHeight: 1.5, margin: "4px 0 10px" }}>
          Es gibt eine neue Version der Lerndatei mit klareren Abschnitten. Importiere sie unter <b>Mehr → Material aktualisieren</b>, deine Antworten bleiben erhalten.
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "4px 0 10px" }}>
        <button onClick={() => (allOn ? speech.stopAll() : all())} style={{ ...pill(allOn, ACCENT, SOFT), padding: "5px 13px" }}>{allOn ? "⏹ Stop" : "▶ Alles anhören"}</button>
        <button onClick={() => setOpen(open.size ? new Set() : new Set(topics.map((t) => t.nr)))} style={pill(false)}>{open.size ? "Alle zuklappen" : "Alle aufklappen"}</button>
      </div>
      {topics.map((t) => {
        const isOpen = open.has(t.nr);
        const id = `ein-t-${t.nr}`;
        const tq = questions.filter((q) => q.nr === t.nr);
        const on = speech.speaking === id;
        return (
          <div key={t.nr} style={{ ...box, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
              <button onClick={() => toggle(t.nr)} aria-expanded={isOpen} style={{ flex: 1, minWidth: 0, display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit", color: "inherit" }}>
                <span style={{ minWidth: 34, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#fff", background: ACCENT, borderRadius: 6, padding: "2px 6px", flexShrink: 0 }}>{t.nr}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, display: "block" }}>{t.title.de}</span>
                  {es && <span style={{ ...esStyle, display: "block" }}>{t.title.es}</span>}
                </span>
                <span style={{ color: "#aaa", fontSize: 13 }}>{isOpen ? "▾" : "▸"}</span>
              </button>
              {!isIntro(t) && (
              <button
                onClick={() => (on ? speech.stopAll() : speech.playAll(topicItems(t, opts), id))}
                aria-label="Thema anhören" style={{ ...pill(on, ACCENT, SOFT), padding: "4px 10px", flexShrink: 0 }}
              >
                {on ? "⏹" : "▶"}
              </button>
              )}
            </div>
            {isOpen && (
              <div style={{ padding: "0 12px 12px", borderTop: "1px solid #f0f0f0" }}>
                {t.blocks.map((b, i) => <BlockView key={i} b={b} id={`ein-b-${t.nr}-${i}`} es={es} merk={merk} speech={speech} silent={isIntro(t)} />)}
                {tq.length > 0 && (
                  <Box tone="qa" plain label={`FRAGEN ZU PUNKT ${t.nr}`} play={<PlayAll id={`ein-qs-${t.nr}`} items={qaItems(tq, true)} speech={speech} />}>
                    {tq.map((q, i) => <QA key={i} q={q} id={`ein-qa-${t.nr}-${i}`} es={es} speech={speech} />)}
                  </Box>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------- tab: Übersicht ----------------
function Uebersicht({ ein, es, speech }) {
  const { kurz, questions, legend } = ein.data;
  const all = () => speech.playAll([...kurz.flatMap((k) => qaItems([k])), ...qaItems(questions)], "ein-ueb-all");
  const allOn = speech.speaking === "ein-ueb-all";
  return (
    <div>
      {legend && <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, margin: "4px 0 10px" }}>{legend}</p>}
      <button onClick={() => (allOn ? speech.stopAll() : all())} style={{ ...pill(allOn, ACCENT, SOFT), padding: "5px 13px" }}>{allOn ? "⏹ Stop" : "▶ Kurzfassung + alle Fragen anhören"}</button>

      <p style={h2}>Kurzfassung</p>
      {kurz.map((k, i) => (
        <div key={i} style={{ ...box, background: "#fffbeb" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>{k.teil}</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{k.title.de}{es && <span style={esStyle}> · {k.title.es}</span>}</div>
          <QA q={{ q: k.q, a: k.a }} id={`ein-kurz-${i}`} es={es} speech={speech} />
        </div>
      ))}

      <p style={h2}>Alle Themen</p>
      {["1", "2", "3"].map((teil) => (
        <div key={teil}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: "14px 0 4px" }}>Teil {teil}</p>
          {questions.map((q, i) => ({ q, i })).filter(({ q }) => teilOf(q.nr) === teil).map(({ q, i }) => {
            const theme = q.theme || (() => { const t = ein.data.topics.find((x) => x.nr === q.nr); return t && t.title; })();
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", borderTop: "1px solid #eee" }}>
                <span style={{ minWidth: 34, textAlign: "center", fontSize: 11.5, fontWeight: 700, color: "#fff", background: ACCENT, borderRadius: 6, padding: "2px 5px", marginTop: 12, flexShrink: 0 }}>{q.nr}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {theme && <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginTop: 8 }}>{theme.de}{es && theme.es && <span style={{ fontWeight: 400, fontStyle: "italic", color: "#7a4f00" }}> · {theme.es}</span>}</div>}
                  <QA q={q} id={`ein-ueb-${i}`} es={es} speech={speech} weak={ein.weak.includes(qid(q))} onWeak={() => ein.toggleWeak(qid(q))} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------- tab: Üben ----------------
const FILTERS = [["all", "Alle"], ["1", "Teil 1"], ["2", "Teil 2"], ["3", "Teil 3"], ["person", "Zur Person"], ["weak", "⚑ Schwierige"]];

function Ueben({ ein, es, speech, daily }) {
  const [mode, setMode] = usePersisted("german_ein_mode_v1", "hoeren");
  const [filter, setFilter] = useState("all");
  const [think, setThink] = usePersisted("german_ein_think_v1", 15);
  const [mix, setMix] = usePersisted("german_ein_mix_v1", true);
  const [seed, setSeed] = useState(0);
  const [msg, setMsg] = useState(null);

  // The deck must not reshuffle while a card is being rated, so the ⚑ marks are read through a ref:
  // they only matter at the moment the "Schwierige" filter is picked.
  const weakRef = useRef(ein.weak);
  weakRef.current = ein.weak;
  const pool = useMemo(() => {
    const qs = ein.data.questions.map((q) => ({ id: qid(q), nr: q.nr, q: q.q, a: q.a, lra: q.lra }));
    const ps = ein.data.person.map((p, i) => ({ id: `p${i}`, nr: "Person", q: p.q, a: { de: ein.answer(i), es: ein.isEdited(i) ? "" : p.a.es } }));
    let list = [...qs, ...ps];
    if (filter === "1" || filter === "2" || filter === "3") list = qs.filter((c) => teilOf(c.nr) === filter);
    else if (filter === "person") list = ps;
    else if (filter === "weak") list = list.filter((c) => weakRef.current.includes(c.id));
    return list;
  }, [ein.data, ein.edits, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const deck = useMemo(() => (mix ? shuffle(pool) : pool), [pool, mix, seed]);

  // --- Hören & antworten: the question is read, then there is time to answer aloud, then the model answer ---
  function startListen() {
    setMsg(null);
    const items = deck.flatMap((c) => [
      { text: `❓ ${c.q.de}`, say: sp(c.q.de), subtitle: c.q.es, gapMs: think * 1000 },
      { text: `✅ ${c.a.de}`, say: sp(c.a.de), subtitle: c.a.es, gapMs: 2500, afterPhase: null },
    ]);
    speech.echoAll(items, 1.5, "ein-ueben", () => {
      if (filter === "all") { daily.addKPass(); setMsg("Durchgang gezählt ✓"); } else setMsg("Fertig ✓");
    });
  }
  const listening = speech.speaking === "ein-ueben";

  // --- Karten ---
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const card = deck[i];
  function go(n) {
    setI(n); setShown(false);
    const c = deck[n];
    if (c) speech.speak(`ein-card-${n}-${seed}`, sp(c.q.de), c.q.es);
  }
  function reset(fn) { speech.stopAll(); fn(); setI(0); setShown(false); setMsg(null); }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 8px" }}>
        {[["hoeren", "🔁 Hören & antworten"], ["karten", "🃏 Karten"]].map(([v, l]) => (
          <button key={v} onClick={() => reset(() => setMode(v))} style={{ ...pill(mode === v, ACCENT, SOFT), padding: "5px 12px" }}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {FILTERS.map(([v, l]) => <button key={v} onClick={() => reset(() => setFilter(v))} style={pill(filter === v, ACCENT, SOFT)}>{l}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12, color: "#777", marginBottom: 12 }}>
        <button onClick={() => reset(() => { setMix(!mix); setSeed((s) => s + 1); })} style={pill(mix, ACCENT, SOFT)}>🔀 Zufällig</button>
        {mode === "hoeren" && (
          <>
            <span>Zeit zum Antworten</span>
            {[8, 15, 25].map((s) => <button key={s} onClick={() => setThink(s)} style={pill(think === s, ACCENT, SOFT)}>{s} s</button>)}
          </>
        )}
        <span style={{ marginLeft: "auto" }}>{pool.length} Fragen</span>
      </div>

      {pool.length === 0 && <p style={{ fontSize: 13, color: "#aaa" }}>Keine Fragen in dieser Auswahl{filter === "weak" ? ". Markiere schwierige Fragen mit ⚑." : "."}</p>}

      {mode === "hoeren" && pool.length > 0 && (
        <div style={box}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#555", lineHeight: 1.55 }}>
            Die Prüferin liest die Frage vor. Du antwortest <b>laut</b> in der Pause. Danach hörst du die Musterantwort.
            {filter === "all" && " Ein vollständiger Durchgang zählt automatisch für heute."}
          </p>
          <button onClick={() => (listening ? speech.stopAll() : startListen())} style={{ width: "100%", cursor: "pointer", border: "none", borderRadius: 12, padding: "13px 18px", fontSize: 15, fontWeight: 600, background: listening ? "#444" : ACCENT, color: "#fff" }}>
            {listening ? "⏹ Stop" : `▶ Start (${pool.length} Fragen)`}
          </button>
          {msg && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#15803d", fontWeight: 600 }}>{msg}</p>}
        </div>
      )}

      {mode === "karten" && pool.length > 0 && (
        i >= deck.length ? (
          <div style={{ ...box, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: "6px 0" }}>Fertig ✓</p>
            <p style={{ fontSize: 13, color: "#777", margin: "0 0 12px" }}>{deck.length} Karten · {ein.weak.length} als schwierig markiert</p>
            <button onClick={() => reset(() => setSeed((s) => s + 1))} style={{ ...pill(true, ACCENT, SOFT), padding: "7px 16px" }}>Nochmal von vorn</button>
          </div>
        ) : (
          <div style={box}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#999", marginBottom: 8 }}>
              <span>{card.nr === "Person" ? "Zur Person" : `Punkt ${card.nr}`}{card.lra && <Lra />}</span><span>{i + 1} / {deck.length}</span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <button onClick={() => speech.speak(`ein-card-${i}-${seed}`, sp(card.q.de), card.q.es)} aria-label="Frage vorlesen" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: speech.speaking === `ein-card-${i}-${seed}` ? ACCENT : "#aaa", padding: 0 }}>
                {speech.speaking === `ein-card-${i}-${seed}` ? "⏹" : "▶"}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45 }}>{card.q.de}</div>
                {es && <div style={esStyle}>{card.q.es}</div>}
              </div>
            </div>
            {shown ? (
              <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: SOFT }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <button onClick={() => speech.speak(`ein-card-a-${i}-${seed}`, sp(card.a.de), card.a.es)} aria-label="Antwort vorlesen" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: speech.speaking === `ein-card-a-${i}-${seed}` ? ACCENT : "#aaa", padding: 0 }}>
                    {speech.speaking === `ein-card-a-${i}-${seed}` ? "⏹" : "▶"}
                  </button>
                  <div style={{ flex: 1, fontSize: 14.5, lineHeight: 1.55 }}>{card.a.de}{es && card.a.es && <div style={esStyle}>{card.a.es}</div>}</div>
                </div>
              </div>
            ) : (
              <button onClick={() => setShown(true)} style={{ marginTop: 14, width: "100%", cursor: "pointer", border: `1px dashed ${ACCENT}`, background: "#fff", color: ACCENT, borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 600 }}>Antwort zeigen</button>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button onClick={() => { if (!ein.weak.includes(card.id)) ein.toggleWeak(card.id); go(i + 1); }} style={{ flex: 1, cursor: "pointer", border: "1px solid #fca5a5", background: "#fef2f2", color: "#b91c1c", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 600 }}>⚑ Nochmal</button>
              <button onClick={() => { if (ein.weak.includes(card.id)) ein.toggleWeak(card.id); go(i + 1); }} style={{ flex: 1, cursor: "pointer", border: "1px solid #86efac", background: "#f0fdf4", color: "#15803d", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 600 }}>✓ Sitzt</button>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ---------------- tab: Zur Person ----------------
function PersonRow({ ein, i, p, es, speech }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ans = ein.answer(i);
  const edited = ein.isEdited(i);
  const id = `ein-p-${i}`;
  return (
    <div style={box}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        <button onClick={() => speech.playAll([{ text: sp(p.q.de), subtitle: p.q.es }, { text: sp(ans), subtitle: edited ? "" : p.a.es }], id)} aria-label="Frage und Antwort anhören" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: speech.speaking === id ? ACCENT : "#aaa", padding: "1px 3px" }}>
          {speech.speaking === id ? "⏹" : "▶"}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{p.q.de}</div>
          {es && <div style={esStyle}>{p.q.es}</div>}
          {editing ? (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} style={{ width: "100%", boxSizing: "border-box", marginTop: 8, border: "1px solid #ccc", borderRadius: 8, padding: 8, fontSize: 14, fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button onClick={() => { ein.setAnswer(i, draft.trim() || null); setEditing(false); }} style={{ ...pill(true, ACCENT, SOFT), padding: "5px 14px" }}>Speichern</button>
                <button onClick={() => setEditing(false)} style={pill(false)}>Abbrechen</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 10, background: SOFT, fontSize: 14.5, lineHeight: 1.55 }}>
              {ans}
              {es && !edited && p.a.es && <div style={esStyle}>{p.a.es}</div>}
              {es && edited && <div style={{ ...esStyle, color: "#aaa" }}>Die Übersetzung gilt nur für den Originaltext.</div>}
            </div>
          )}
          {!editing && (
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <button onClick={() => { setDraft(ans); setEditing(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: ACCENT, padding: 0 }}>✎ Antwort ändern</button>
              {edited && <button onClick={() => ein.setAnswer(i, null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#999", padding: 0 }}>Original wiederherstellen</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Person({ ein, es, speech }) {
  const list = ein.data.person;
  const all = () => speech.playAll(list.flatMap((p, i) => [{ text: sp(p.q.de), subtitle: p.q.es }, { text: sp(ein.answer(i)), subtitle: ein.isEdited(i) ? "" : p.a.es }]), "ein-person-all");
  const on = speech.speaking === "ein-person-all";
  return (
    <div>
      <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.55, margin: "4px 0 10px" }}>
        Deine eigenen Antworten. Antworte immer ehrlich. Wenn etwas nicht stimmt, ändere es hier, der Text wird nur auf diesem Gerät gespeichert.
      </p>
      <button onClick={() => (on ? speech.stopAll() : all())} style={{ ...pill(on, ACCENT, SOFT), padding: "5px 13px", marginBottom: 10 }}>{on ? "⏹ Stop" : "▶ Alle anhören"}</button>
      {list.map((p, i) => <PersonRow key={i} ein={ein} i={i} p={p} es={es} speech={speech} />)}
    </div>
  );
}

// ---------------- tab: Mehr ----------------
function Mehr({ ein, es, speech }) {
  const { appointment, phrases, glossary, bring } = ein.data;
  const [q, setQ] = useState("");
  const gl = glossary.filter((g) => !q.trim() || `${g.w} ${g.es} ${g.de}`.toLowerCase().includes(q.trim().toLowerCase()));
  const sum = { ...box, padding: 0 };
  const sumHead = { cursor: "pointer", padding: "12px 14px", fontSize: 14, fontWeight: 600 };
  const dateText = appointment?.date ? new Date(`${appointment.date}T00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) : "";
  return (
    <div>
      <details open style={sum}>
        <summary style={sumHead}>📅 Termin & Mitbringen</summary>
        <div style={{ padding: "0 14px 12px" }}>
          {appointment && <p style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.5 }}><b>{dateText}</b>{appointment.time ? `, ${appointment.time} Uhr` : ""}<br />{appointment.where}</p>}
          {bring.map((b, i) => {
            const on = ein.bring.includes(i);
            return (
              <button key={i} onClick={() => ein.toggleBring(i)} style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "7px 0", font: "inherit", color: "inherit", borderTop: "1px solid #f0f0f0" }}>
                <span style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${on ? "#22c55e" : "#ccc"}`, background: on ? "#22c55e" : "#fff", color: "#fff", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on ? "✓" : ""}</span>
                <span style={{ fontSize: 14, lineHeight: 1.45, textDecoration: on ? "line-through" : "none", color: on ? "#999" : "#1a1a1a" }}>{b.de}{es && <span style={{ ...esStyle, display: "block", textDecoration: "none" }}>{b.es}</span>}</span>
              </button>
            );
          })}
        </div>
      </details>

      <details style={sum}>
        <summary style={sumHead}>💬 Nützliche Sätze im Gespräch</summary>
        <div style={{ padding: "0 14px 12px" }}>
          {phrases.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "7px 0", borderTop: i ? "1px solid #f0f0f0" : "none" }}>
              <Play id={`ein-ph-${i}`} speech={speech} text={sp(p.de)} es={p.es} />
              <div style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>{p.de}{p.added && <Added />}<div style={esStyle}>{p.es}</div></div>
            </div>
          ))}
        </div>
      </details>

      <details style={sum}>
        <summary style={sumHead}>📖 Wortschatz ({glossary.length})</summary>
        <div style={{ padding: "0 14px 12px" }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen …" style={{ width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 8, padding: "7px 10px", fontSize: 14, marginBottom: 6 }} />
          {gl.map((g, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", padding: "7px 0", borderTop: "1px solid #f0f0f0" }}>
              <Play id={`ein-g-${g.w}`} speech={speech} text={sp(g.w)} es={g.es} />
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.45 }}><b>{g.w}</b> · <span style={{ color: "#7a4f00" }}>{g.es}</span><div style={{ fontSize: 12, color: "#888" }}>{g.de}</div></div>
            </div>
          ))}
          {gl.length === 0 && <p style={{ fontSize: 13, color: "#aaa" }}>Nichts gefunden.</p>}
        </div>
      </details>

      <details style={sum}>
        <summary style={sumHead}>🔄 Material aktualisieren</summary>
        <div style={{ padding: "0 14px 12px" }}>
          <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.5, margin: "0 0 10px" }}>Neue Version der Datei einlesen. Deine geänderten Antworten, ⚑-Markierungen und Häkchen bleiben erhalten.</p>
          <JsonImport validate={validateEin} onImport={ein.load} accent={ACCENT} okText={() => "Material wurde aktualisiert."} />
        </div>
      </details>

      <button
        onClick={() => { if (window.confirm("Einbürgerungs-Material von diesem Gerät löschen? Die Datei auf deinem Mac bleibt erhalten und kann neu importiert werden.")) ein.remove(); }}
        style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer", color: "#b91c1c", fontSize: 12.5 }}
      >
        Material von diesem Gerät löschen
      </button>
    </div>
  );
}

// ---------------- screen ----------------
const TABS = [["lernen", "Lernen"], ["uebersicht", "Übersicht"], ["ueben", "Üben"], ["person", "Zur Person"], ["mehr", "Mehr"]];

export default function Einbuergerung({ ein, speech, daily }) {
  const [tab, setTab] = usePersisted("german_ein_tab_v1", "lernen");
  const [es, setEs] = usePersisted("german_ein_es_v1", true);
  // What "anhören" plays: everything, or only the own-words answers. (A new key, so an old "off" is not carried over.)
  const [scope, setScope] = usePersisted("german_ein_scope_v1", "alles");
  const merk = scope === "alles";
  const [withQ, setWithQ] = usePersisted("german_ein_withq_v1", true);

  if (!ein.data) {
    return (
      <div style={{ padding: "20px 16px 24px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>🏛️ Einbürgerungsgespräch</h1>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 14px" }}>
          Hier übst du die Themen, Fragen und Antworten für dein Gespräch: lesen, anhören, Frage–Antwort-Training, mit Übersetzung.
          Das Material wird <b>nur auf deinem Gerät</b> gespeichert, nicht im Internet.
        </p>
        <JsonImport validate={validateEin} onImport={ein.load} accent={ACCENT} okText={(o) => `„${o.title || "Material"}“ wurde importiert.`} />
      </div>
    );
  }

  const when = ein.date
    ? new Date(`${ein.date}T00:00`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) + (ein.data.appointment?.time ? `, ${ein.data.appointment.time} Uhr` : "")
    : "";
  const left = ein.days === null ? "" : ein.days > 1 ? `noch ${ein.days} Tage` : ein.days === 1 ? "morgen" : ein.days === 0 ? "heute" : "vorbei";

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>🏛️ Einbürgerungsgespräch</h1>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: ACCENT, whiteSpace: "nowrap" }}>{left}</span>
      </div>
      {when && <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{when}</p>}

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", margin: "10px 0 0" }}>
        <span style={{ fontSize: 12, color: "#777" }}>Heute:</span>
        {[1, 2].map((n) => (
          <button key={n} onClick={() => daily.toggleKPass(n)} style={{ ...pill(daily.kN >= n, "#86efac", "#dcfce7"), color: daily.kN >= n ? "#15803d" : "#666" }}>{daily.kN >= n ? "✓" : "○"} Durchgang {n}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", margin: "10px 0 8px" }}>
        <button onClick={() => setEs(!es)} style={pill(es, "#7a4f00", "#fdf4e7")}>🇪🇸 Übersetzung</button>
        <RepeatCountControl repeatCount={speech.repeatCount} setRepeatCount={speech.setRepeatCount} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", margin: "0 0 8px" }}>
        <span style={{ fontSize: 12, color: "#777" }}>Anhören:</span>
        <button onClick={() => setScope("alles")} style={pill(scope === "alles", ACCENT, SOFT)}>Merkblatt + eigene Worte</button>
        <button onClick={() => setScope("own")} style={pill(scope === "own", ACCENT, SOFT)}>Nur eigene Worte</button>
        <button onClick={() => setWithQ(!withQ)} style={pill(withQ, ACCENT, SOFT)}>+ Fragen</button>
      </div>

      <div style={{ display: "flex", gap: 5, overflowX: "auto", padding: "2px 0 10px", borderBottom: "1px solid #eee", marginBottom: 8 }}>
        {TABS.map(([v, l]) => <button key={v} onClick={() => { speech.stopAll(); setTab(v); }} style={{ ...pill(tab === v, ACCENT, SOFT), padding: "6px 10px", fontSize: 12.5, whiteSpace: "nowrap", flexShrink: 0 }}>{l}</button>)}
      </div>

      {tab === "lernen" && <Lernen ein={ein} es={es} merk={merk} withQ={withQ} speech={speech} />}
      {tab === "uebersicht" && <Uebersicht ein={ein} es={es} speech={speech} />}
      {tab === "ueben" && <Ueben ein={ein} es={es} speech={speech} daily={daily} />}
      {tab === "person" && <Person ein={ein} es={es} speech={speech} />}
      {tab === "mehr" && <Mehr ein={ein} es={es} speech={speech} />}
    </div>
  );
}
