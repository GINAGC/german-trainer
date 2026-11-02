import { useMemo, useRef, useState } from "react";
import { validateScript } from "../hooks/useScripts";
import { pill, primaryBtn, label } from "../components/sprechenUi";

const VARIANT_COLORS = {
  A: { fg: "#1a6b3c", bg: "#eaf3ec" },
  B: { fg: "#8a5412", bg: "#f8eee0" },
  C: { fg: "#8a1fc2", bg: "#f3e5fd" },
};
const box = { border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", marginBottom: 12 };
const h2 = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "22px 0 8px" };

// "**bold**" marks fixed expressions; split into plain and bold parts.
const parts = (de) => de.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t) => (t.startsWith("**") ? { b: true, t: t.slice(2, -2) } : { b: false, t }));
const plain = (de) => de.replace(/\*\*/g, "");
// Placeholders such as "[Maßnahme]" and "(betont)" would be read out loud; the voice skips them.
const spoken = (de) => plain(de).replace(/\[[^\]]*\]/g, "…").replace(/\([^)]*\)/g, "").replace(/^\//, "").replace(/\s+/g, " ").trim();

function Rich({ text, notes = [], onNote }) {
  let bi = -1;
  return (
    <span style={{ whiteSpace: "pre-line" }}>
      {parts(text).map((p, i) => {
        if (!p.b) return <span key={i}>{p.t}</span>;
        bi += 1;
        const idx = bi;
        const has = !!notes[idx];
        return (
          <button
            key={i} onClick={(e) => { e.stopPropagation(); if (has) onNote(idx); }}
            style={{ font: "inherit", fontWeight: 700, background: has ? "#f3e5fd" : "none", color: has ? "#6b1a96" : "inherit", border: "none", borderBottom: has ? "1px dashed #b06ad8" : "none", borderRadius: 3, padding: "0 1px", cursor: has ? "pointer" : "default" }}
          >
            {p.t}
          </button>
        );
      })}
    </span>
  );
}

function Line({ line, k, speak, speaking, fav, toggleFav, showEs, hide }) {
  const [open, setOpen] = useState(null); // index of the expression whose explanation is shown
  const [es, setEs] = useState(false);
  const [peek, setPeek] = useState(false);
  const id = `skript-${k}`;
  const masked = hide && !peek;
  const notes = line.x || [];
  const note = open !== null ? notes[open] : null;
  return (
    <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <button onClick={() => speak(id, spoken(line.de), line.es)} aria-label="Vorlesen" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: speaking === id ? "#1e40af" : "#999", padding: "1px 2px", flexShrink: 0 }}>
          {speaking === id ? "⏹" : "▶"}
        </button>
        <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, lineHeight: 1.5 }} onClick={() => hide && setPeek((p) => !p)}>
          {masked ? <span style={{ color: "#bbb", letterSpacing: 2 }}>••• tippen zum Anzeigen</span> : <Rich text={line.de} notes={notes} onNote={(i) => setOpen(open === i ? null : i)} />}
          {(showEs || es) && !masked && line.es && <div style={{ fontSize: 12, color: "#7a4f00", fontStyle: "italic", marginTop: 3, whiteSpace: "pre-line" }}>{line.es}</div>}
          {note && (
            <div style={{ fontSize: 12, background: "#f3e5fd", borderRadius: 8, padding: "6px 9px", marginTop: 5, color: "#4a1466", lineHeight: 1.45 }}>
              ✨ {note.de ? <span>{note.de}</span> : null}
              {note.es && <div style={{ color: "#7a4f00", fontStyle: "italic" }}>{note.es}</div>}
            </div>
          )}
        </div>
        <button onClick={() => setEs((v) => !v)} aria-label="Übersetzung" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: es ? "#7a4f00" : "#ccc", padding: "2px 3px", flexShrink: 0 }}>ES</button>
        <button onClick={toggleFav} aria-label="Favorit" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: fav ? "#f59e0b" : "#ccc", padding: "0 2px", flexShrink: 0 }}>{fav ? "★" : "☆"}</button>
      </div>
    </div>
  );
}

function ImportPanel({ onImport }) {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  function load(raw) {
    try {
      const obj = JSON.parse(raw);
      const err = validateScript(obj);
      if (err) { setMsg({ ok: false, t: err }); return; }
      onImport(obj);
      setMsg({ ok: true, t: `„${obj.title}“ wurde importiert.` });
      setText("");
    } catch {
      setMsg({ ok: false, t: "Das ist keine gültige JSON-Datei." });
    }
  }

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    load(await f.text());
    e.target.value = "";
  }

  return (
    <div>
      <button onClick={() => fileRef.current?.click()} style={primaryBtn("#D4537E")}>📂 Skript-Datei wählen</button>
      <input ref={fileRef} type="file" accept=".json,application/json,text/plain" onChange={onFile} style={{ display: "none" }} />
      <details style={{ marginTop: 12 }}>
        <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Oder Text einfügen</summary>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="JSON hier einfügen …"
          style={{ width: "100%", marginTop: 8, border: "1px solid #ccc", borderRadius: 8, padding: 8, fontSize: 12, fontFamily: "monospace" }}
        />
        <button disabled={!text.trim()} onClick={() => load(text)} style={{ ...pill(false), marginTop: 6, opacity: text.trim() ? 1 : 0.4 }}>Importieren</button>
      </details>
      {msg && <p style={{ fontSize: 12.5, margin: "10px 0 0", color: msg.ok ? "#15803d" : "#b91c1c" }}>{msg.t}</p>}
    </div>
  );
}

export default function Skript({ sc, speech, daily }) {
  const { current: s, scripts } = sc;
  const [variant, setVariant] = useState("A");
  const [showEs, setShowEs] = useState(false);
  const [hide, setHide] = useState(false);
  const [adding, setAdding] = useState(false);
  const { speaking, speak, playAll, stopAll } = speech;

  const favKeys = sc.favs;
  const favLines = useMemo(() => {
    if (!s) return [];
    const out = [];
    s.moments.forEach((m, mi) => {
      Object.entries(m.lines).forEach(([v, lines]) => lines.forEach((l, li) => {
        const key = `m${mi}:${v}:${li}`;
        if (favKeys.includes(key)) out.push({ key, line: l, name: m.name, v });
      }));
    });
    (s.partner?.moments || []).forEach((m, mi) => m.lines.forEach((l, li) => {
      const key = `p${mi}:${li}`;
      if (favKeys.includes(key)) out.push({ key, line: l, name: `Chef:in · ${m.name}`, v: null });
    }));
    return out;
  }, [s, favKeys]);

  if (!s || adding) {
    return (
      <div>
        {!s && (
          <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 14px" }}>
            Hier liest du das Skript deines Deutschkurses: die Sätze Gesprächsmoment für Gesprächsmoment, mit Erklärung der
            festen Redewendungen, Übersetzung und Audio. Das Skript wird <b>nur auf deinem Gerät</b> gespeichert, nicht im Internet.
          </p>
        )}
        <ImportPanel onImport={(obj) => { sc.add(obj); setAdding(false); }} />
        {s && <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 12, marginTop: 12 }}>Abbrechen</button>}
      </div>
    );
  }

  const shownVariants = variant === "all" ? s.variants.map((v) => v.id) : [variant];
  const variantName = (id) => s.variants.find((v) => v.id === id)?.name || "";

  function listen() {
    if (speaking === "skript-all") { stopAll(); return; }
    const items = [];
    s.moments.forEach((m) => shownVariants.forEach((v) => (m.lines[v] || []).forEach((l) => items.push({ text: spoken(l.de), subtitle: l.es }))));
    playAll(items, "skript-all");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{s.kind}{s.domain ? ` · ${s.domain}` : ""} · {s.id}</p>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "2px 0 0" }}>{s.title}</h2>
        </div>
        <button onClick={() => setAdding(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#D4537E", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>＋ Skript</button>
      </div>
      {scripts.length > 1 && (
        <select value={s.id} onChange={(e) => sc.select(e.target.value)} style={{ marginTop: 8, border: "1px solid #ddd", borderRadius: 8, padding: "5px 8px", fontSize: 13, background: "#fff" }}>
          {scripts.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.title}</option>)}
        </select>
      )}
      {s.legend && <p style={{ fontSize: 11, color: "#aaa", margin: "8px 0 0" }}>{s.legend}</p>}

      {/* Controls */}
      <div style={{ padding: "10px 0 8px", margin: "8px 0 0", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {s.variants.map((v) => (
            <button key={v.id} onClick={() => setVariant(v.id)} style={{ ...pill(variant === v.id, VARIANT_COLORS[v.id]?.fg, VARIANT_COLORS[v.id]?.bg), fontWeight: 600 }}>{v.id}</button>
          ))}
          <button onClick={() => setVariant("all")} style={pill(variant === "all")}>Alle</button>
          <span style={{ width: 1, height: 18, background: "#ddd" }} />
          <button onClick={() => setShowEs(!showEs)} style={pill(showEs, "#7a4f00", "#fdf4e7")}>🇪🇸 Übersetzung</button>
          <button onClick={() => setHide(!hide)} style={pill(hide, "#444", "#eee")}>👁 Ohne Skript</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
          <button onClick={listen} style={{ ...pill(speaking === "skript-all", "#93c5fd", "#dbeafe"), padding: "4px 12px" }}>{speaking === "skript-all" ? "⏹ Stop" : "▶ Anhören"}</button>
          <span style={{ fontSize: 11, color: "#aaa" }}>
            {variant === "all" ? "alle Varianten" : `Variante ${variant} · ${variantName(variant)}`}
          </span>
          <button
            onClick={daily.toggleK}
            style={{ marginLeft: "auto", cursor: "pointer", border: `1px solid ${daily.kDone ? "#86efac" : "#ddd"}`, background: daily.kDone ? "#dcfce7" : "#fff", color: daily.kDone ? "#15803d" : "#666", borderRadius: 20, padding: "4px 11px", fontSize: 12, fontWeight: 500 }}
          >
            {daily.kDone ? "✓ Heute erledigt" : "Heute erledigt"}
          </button>
        </div>
      </div>

      {/* Situation and role */}
      <p style={h2}>Situation & Rolle</p>
      <div style={{ ...box, background: "#f7f9fc" }}>
        {s.situation && <p style={{ margin: "0 0 8px", fontSize: 13.5, lineHeight: 1.55 }}>{s.situation.de}{(showEs && s.situation.es) && <><br /><span style={{ fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{s.situation.es}</span></>}</p>}
        {s.role && (
          <>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#6b1a96" }}>{s.role.name}</p>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{s.role.de}</p>
            {showEs && s.role.es && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{s.role.es}</p>}
            {s.role.goal && <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.55 }}><b>Dein Ziel:</b> {s.role.goal.de}{showEs && s.role.goal.es && <><br /><span style={{ fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{s.role.goal.es}</span></>}</p>}
          </>
        )}
      </div>

      {/* Your lines, by conversation moment */}
      <p style={h2}>Deine Sätze</p>
      {s.moments.map((m, mi) => (
        <div key={mi} style={box}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>{mi + 1} · {m.name}</p>
          {shownVariants.map((v) => {
            const lines = m.lines[v] || [];
            if (!lines.length) return null;
            const c = VARIANT_COLORS[v] || { fg: "#555", bg: "#f5f5f5" };
            return (
              <div key={v} style={{ background: c.bg, borderRadius: 8, padding: "4px 10px", margin: "6px 0" }}>
                {variant === "all" && <p style={{ margin: "4px 0 0", fontSize: 11, fontWeight: 700, color: c.fg }}>Variante {v} · {variantName(v)}</p>}
                {lines.map((l, li) => {
                  const key = `m${mi}:${v}:${li}`;
                  return <Line key={key} k={`${s.id}-${key}`} line={l} speak={speak} speaking={speaking} showEs={showEs} hide={hide} fav={favKeys.includes(key)} toggleFav={() => sc.toggleFav(s.id, key)} />;
                })}
              </div>
            );
          })}
        </div>
      ))}

      {/* The other role */}
      {s.partner && (
        <>
          <p style={h2}>{s.partner.name}</p>
          <div style={{ ...box, background: "#f3f3f3" }}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}><Rich text={s.partner.de} notes={s.partner.x || []} onNote={() => {}} /></p>
            {showEs && s.partner.es && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{s.partner.es}</p>}
          </div>
          <p style={{ fontSize: 11.5, color: "#999", margin: "0 0 8px" }}>Beste Ausdrücke – du musst sie vor allem verstehen.</p>
          {(s.partner.moments || []).map((m, mi) => (
            <div key={mi} style={{ ...box, background: "#f7f7f7" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>{m.name}</p>
              {m.lines.map((l, li) => {
                const key = `p${mi}:${li}`;
                return <Line key={key} k={`${s.id}-${key}`} line={l} speak={speak} speaking={speaking} showEs={showEs} hide={hide} fav={favKeys.includes(key)} toggleFav={() => sc.toggleFav(s.id, key)} />;
              })}
            </div>
          ))}
        </>
      )}

      {/* Favourites = the sentences to learn this week */}
      <p style={h2}>★ Meine Sätze ({favLines.length})</p>
      {favLines.length === 0 ? (
        <p style={{ fontSize: 12.5, color: "#aaa", margin: 0 }}>Tippe auf ☆ bei den Sätzen, die du diese Woche automatisieren willst – mindestens einen pro Gesprächsmoment.</p>
      ) : (
        <div style={box}>
          {favLines.map(({ key, line, name, v }) => (
            <div key={key}>
              <p style={{ margin: "6px 0 0", fontSize: 10.5, color: "#aaa" }}>{name}{v ? ` · ${v}` : ""}</p>
              <Line k={`${s.id}-fav-${key}`} line={line} speak={speak} speaking={speaking} showEs={showEs} hide={hide} fav toggleFav={() => sc.toggleFav(s.id, key)} />
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      {s.grammar && (
        <details style={{ ...box, marginTop: 14 }}>
          <summary style={{ fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: "#6b1a96" }}>{s.grammar.title}</summary>
          {s.grammar.paras.map((p, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-line" }}><Rich text={p.de} notes={[]} onNote={() => {}} /></p>
              {showEs && p.es && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{p.es}</p>}
            </div>
          ))}
        </details>
      )}
      {s.culture && (
        <details style={box}>
          <summary style={{ fontSize: 13.5, fontWeight: 600, cursor: "pointer", color: "#8a5412" }}>{s.culture.title}</summary>
          {s.culture.paras.map((p, i) => (
            <div key={i} style={{ marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{p.de}</p>
              {showEs && p.es && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{p.es}</p>}
            </div>
          ))}
        </details>
      )}

      {/* Checklist and instructions */}
      {s.checklist && (
        <div style={{ ...box, background: "#fbf0f0" }}>
          <p style={{ margin: "0 0 6px", fontSize: 13.5, fontWeight: 700, color: "#b04a4a" }}>Checkliste: Das mache ich vor dem Training ✔️</p>
          {s.checklist.map((c, i) => {
            const on = sc.checks.includes(i);
            return (
              <button key={i} onClick={() => sc.toggleCheck(s.id, i)} style={{ display: "flex", gap: 9, alignItems: "flex-start", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "5px 0" }}>
                <span style={{ fontSize: 16, color: on ? "#16a34a" : "#bbb" }}>{on ? "☑" : "☐"}</span>
                <span style={{ fontSize: 13.5, lineHeight: 1.45, textDecoration: on ? "line-through" : "none", color: on ? "#999" : "#222" }}>
                  {c.de}
                  {showEs && c.es && <span style={{ display: "block", fontSize: 12, color: "#7a4f00", fontStyle: "italic", textDecoration: "none" }}>{c.es}</span>}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {s.howto && (
        <details style={box}>
          <summary style={{ fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Wie nutzt du dieses Skript?</summary>
          <ol style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 13.5, lineHeight: 1.55 }}>
            {s.howto.map((h, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <Rich text={h.de} notes={[]} onNote={() => {}} />
                {showEs && h.es && <div style={{ fontSize: 12, color: "#7a4f00", fontStyle: "italic" }}>{h.es}</div>}
              </li>
            ))}
          </ol>
        </details>
      )}

      <div style={{ marginTop: 18 }}>
        <p style={label}>Dieses Skript</p>
        <button
          onClick={() => { if (window.confirm(`„${s.title}“ von diesem Gerät löschen? Du kannst es jederzeit wieder importieren.`)) sc.remove(s.id); }}
          style={{ ...pill(false), color: "#b91c1c" }}
        >
          Skript löschen
        </button>
      </div>
    </div>
  );
}
