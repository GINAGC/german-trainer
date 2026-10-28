import { useMemo } from "react";
import ChunkCard from "../components/ChunkCard";
import { MIX, SET_SIZES, USE_TARGET } from "../hooks/useDailyPractice";
import { CASE, genderColorForNoun } from "../lib/colors";
import { cleanDe, speechText, chunkDetails } from "../lib/speechText";
import { pill } from "../components/sprechenUi";

const sectionTitle = { fontSize: 11, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase", margin: "22px 0 8px", display: "flex", justifyContent: "space-between", alignItems: "baseline" };
const linkBtn = { background: "none", border: "none", cursor: "pointer", color: "#D4537E", fontSize: 12, fontWeight: 500, padding: 0, letterSpacing: 0, textTransform: "none" };
const card = { border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", background: "#fff" };

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend";
}

function StepTitle({ n, done, children, right }) {
  return (
    <div style={sectionTitle}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: done ? "#22c55e" : "#e5e5e5", color: done ? "#fff" : "#777", fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center", letterSpacing: 0 }}>
          {done ? "✓" : n}
        </span>
        {children}
      </span>
      {right}
    </div>
  );
}

function DailyCard({ chunk: c, used, count, speaking, onSpeak, onToggleUsed, onMaster }) {
  const de = cleanDe(c.de);
  const ready = count >= USE_TARGET;
  return (
    <div style={{ ...card, padding: "10px 12px", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start", background: used ? "#f6fdf8" : "#fff" }}>
      <button
        onClick={() => onToggleUsed(c.id)}
        aria-label={used ? "Heute benutzt – zurücknehmen" : "Heute benutzt"}
        style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${used ? "#22c55e" : "#ccc"}`, background: used ? "#22c55e" : "transparent", color: "#fff", cursor: "pointer", flexShrink: 0, marginTop: 1, fontSize: 14, lineHeight: 1, padding: 0 }}
      >
        {used ? "✓" : ""}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{de}</div>
        {c.en && <div style={{ fontSize: 12, color: "#888", fontStyle: "italic", marginTop: 2 }}>{c.en}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5, alignItems: "center" }}>
          {(c.nouns || []).map((n, i) => {
            const col = genderColorForNoun(n) ?? { bg: "#f0f0f0", text: "#666" };
            return <span key={i} style={{ background: col.bg, color: col.text, fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 10 }}>{n}</span>;
          })}
          {(c.g || []).map((g, i) => {
            const gc = CASE[g.c];
            return <span key={`g${i}`} style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: gc.bg, color: gc.text }}>{g.c}</span>;
          })}
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <span>{Math.min(count, USE_TARGET)} / {USE_TARGET} benutzt</span>
          {ready && (
            <button onClick={() => onMaster(c.id)} style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: 12, fontSize: 11, fontWeight: 600, padding: "2px 9px", cursor: "pointer" }}>
              Gemeistert ✓
            </button>
          )}
        </div>
      </div>
      <button onClick={() => onSpeak(c.id, de, c.en, chunkDetails(c))} title="Vorlesen" style={{ background: "none", border: "none", cursor: "pointer", color: speaking === c.id ? "#1e40af" : "#bbb", fontSize: 16, padding: "2px 4px" }}>
        {speaking === c.id ? "⏹" : "▶"}
      </button>
    </div>
  );
}

function TopicSelect({ daily }) {
  return (
    <select
      value={daily.topic} onChange={(e) => daily.setTopic(e.target.value)}
      aria-label="Thema ändern"
      style={{ border: "1px solid #ddd", borderRadius: 8, padding: "3px 6px", fontSize: 12, background: "#fff", color: "#444", maxWidth: 150 }}
    >
      {daily.topics.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      <option value={MIX}>Gemischt</option>
    </select>
  );
}

function StepRow({ icon, name, hint, done, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: done ? "#f6fdf8" : "#fff", border: `1px solid ${done ? "#bbf7d0" : "#e5e5e5"}`, borderRadius: 10, padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <b style={{ fontSize: 13.5 }}>{name}</b>
        <span style={{ display: "block", fontSize: 11, color: "#888" }}>{hint}</span>
      </span>
      <span style={{ fontSize: 16, color: done ? "#22c55e" : "#ccc" }}>{done ? "✓" : "›"}</span>
    </button>
  );
}

function TopicCard({ title, sub, teaser, done, onOpen, onDone, onNext, accent }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 15, fontWeight: 600, color: accent }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{sub}</div>}
      {teaser && <div style={{ fontSize: 12.5, color: "#555", lineHeight: 1.5, marginTop: 6 }}>{teaser}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <button onClick={onOpen} style={{ flex: 1, cursor: "pointer", border: "none", background: accent, color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 600 }}>Öffnen ›</button>
        <button onClick={onDone} style={{ cursor: "pointer", border: `1px solid ${done ? "#86efac" : "#ddd"}`, background: done ? "#dcfce7" : "#fff", color: done ? "#15803d" : "#666", borderRadius: 10, padding: "8px 11px", fontSize: 12.5, fontWeight: 500 }}>
          {done ? "✓ Erledigt" : "Erledigt"}
        </button>
        <button onClick={onNext} title="Anderes Thema" aria-label="Anderes Thema" style={{ cursor: "pointer", border: "1px solid #ddd", background: "#fff", color: "#888", borderRadius: 10, padding: "8px 10px", fontSize: 13 }}>↻</button>
      </div>
    </div>
  );
}

export default function Heute({ chunks, daily, aCnt, mCnt, total, pct, speaking, speak, toggleMastered, goto }) {
  const latest = useMemo(() => [...chunks].filter((c) => !c.mastered).sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 3), [chunks]);

  const { gram, verb } = daily;
  // Verb topics show a few example verbs from their group.
  const verbInfo = useMemo(() => {
    const field = verb.tab === "verben" ? "verb" : verb.tab === "dativ" ? "dativ" : "nvv";
    const key = verb.tab === "nvv" ? "phrase" : "inf";
    const list = chunks.filter((c) => c[field] && c[field].grp === verb.grp);
    return { n: list.length, examples: list.slice(0, 3).map((c) => c[field][key]).join(" · ") };
  }, [chunks, verb]);

  const usedToday = daily.items.filter((c) => daily.used.has(c.id)).length;
  const chunksDone = daily.items.length > 0 && usedToday === daily.items.length;
  const stepsDone = ["echo", "translate", "speak"].filter((s) => daily.steps[s]).length;
  const speakDone = stepsDone === 3;
  const doneCount = [chunksDone, speakDone, daily.gDone, daily.vDone].filter(Boolean).length;

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{greeting()} 👋</h1>
      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 8px" }}>
        Meine tägliche Übung · <b style={{ color: doneCount === 4 ? "#16a34a" : "#555" }}>{doneCount} / 4</b> erledigt
      </p>
      <div style={{ background: "#e5e5e5", borderRadius: 3, height: 5 }}>
        <div style={{ background: "#22c55e", width: `${(doneCount / 4) * 100}%`, height: "100%", borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <p style={{ fontSize: 11, color: "#aaa", margin: "3px 0 0" }}>{aCnt} aktiv · {mCnt} gemeistert · {total} gesamt ({pct}%)</p>

      <StepTitle n={1} done={chunksDone} right={<span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500, color: "#888" }}>{usedToday} / {daily.items.length} ✓</span>}>
        3 Chunks des Tages
      </StepTitle>
      <p style={{ fontSize: 11.5, color: "#999", margin: "-2px 0 8px" }}>Lerne diese Sätze auswendig und benutze jeden heute einmal in einem echten Gespräch.</p>
      {daily.items.length === 0 ? (
        <p style={{ fontSize: 12, color: "#bbb" }}>Keine aktiven Chunks übrig.</p>
      ) : (
        daily.items.map((c) => (
          <DailyCard
            key={c.id} chunk={c} used={daily.used.has(c.id)} count={daily.uses[c.id] || 0}
            speaking={speaking} onSpeak={(id, de, en, d) => speak(id, speechText(de), en, d)}
            onToggleUsed={daily.toggleUsed} onMaster={toggleMastered}
          />
        ))
      )}
      <div style={{ fontSize: 11, color: "#aaa" }}>{USE_TARGET}× benutzt = gemeistert</div>

      <StepTitle n={2} done={speakDone} right={<span style={{ letterSpacing: 0, textTransform: "none", fontWeight: 500, color: "#888" }}>{stepsDone} / 3 ✓</span>}>
        Sprechtraining
      </StepTitle>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Thema</span>
          <TopicSelect daily={daily} />
          <span style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {SET_SIZES.map((n) => (
              <button key={n} onClick={() => daily.setSize(n)} style={{ ...pill(daily.size === n, "#D4537E", "#FBEAF0"), padding: "2px 9px" }}>{n}</button>
            ))}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: "#999", margin: "6px 0 2px" }}>
          {daily.set.length} Chunks{daily.sub ? ` · rund um „${daily.sub}“` : ""} – dieselben für alle drei Schritte.
        </div>
        <StepRow icon="🔁" name="Echo" hint="Hören und nachsprechen" done={daily.steps.echo} onClick={() => goto("sprechen", { step: "echo" })} />
        <StepRow icon="💬" name="Übersetzen" hint="Übersetzung sehen, Satz laut sagen" done={daily.steps.translate} onClick={() => goto("sprechen", { step: "translate" })} />
        <StepRow icon="🎙" name="Sprechen" hint="Meinung, Tag erzählen, Rollenspiel …" done={daily.steps.speak} onClick={() => goto("sprechen", { step: "speak" })} />
      </div>

      <StepTitle n={3} done={daily.gDone}>Grammatik des Tages</StepTitle>
      <TopicCard
        title={gram.title} teaser={gram.teaser} accent="#378ADD"
        done={daily.gDone}
        onOpen={() => goto("grammatik", { page: gram.page, topic: gram.anchor, group: gram.group })}
        onDone={daily.toggleG} onNext={daily.nextGram}
      />

      <StepTitle n={4} done={daily.vDone}>Verben des Tages</StepTitle>
      <TopicCard
        title={verb.title} sub={`${verbInfo.n} ${verb.tab === "nvv" ? "Wendungen" : "Verben"}`} teaser={verbInfo.examples ? `z. B. ${verbInfo.examples}` : verb.sub} accent="#2A9D8F"
        done={daily.vDone}
        onOpen={() => goto("verben", { tab: verb.tab, grp: verb.grp })}
        onDone={daily.toggleV} onNext={daily.nextVerb}
      />

      <div style={sectionTitle}>
        <span>Zuletzt hinzugefügt</span>
        <button onClick={() => goto("sammlung", { tab: "chunks", newest: true })} style={linkBtn}>Alle ›</button>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {latest.map((c) => (
          <ChunkCard key={c.id} chunk={c} speaking={speaking} onSpeak={(id, de, en, d) => speak(id, speechText(de), en, d)} onToggleMastered={toggleMastered} />
        ))}
      </div>
    </div>
  );
}
