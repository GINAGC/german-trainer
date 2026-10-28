import { useEffect, useMemo, useState } from "react";
import categories from "../data/categories.json";
import ChunkCard from "../components/ChunkCard";
import { speechText, chunkDetails } from "../lib/speechText";
import { AUTO_TARGET, useSpeakingProgress } from "../hooks/useSpeakingProgress";
import { MIX, SET_SIZES } from "../hooks/useDailyPractice";
import { pill, label, primaryBtn, shuffle, Chips } from "../components/sprechenUi";
import SprechenFrei from "./SprechenFrei";
import RegisterDrill from "./RegisterDrill";

const CM = Object.fromEntries(categories.map((c) => [c.id, c]));

// English/Spanish prompt without the study notes: "[R] ..." tags and "(past)" asides.
function promptText(en) {
  const t = en.replace(/^\[[^\]]*\]\s*/, "").replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
  return t || en;
}

function TranslateDrill({ pool, byId, count, progress, rate, speaking, speak, stopAll, toggleMastered, onActive, onFinish }) {
  const [sess, setSess] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sess || sess.revealed || sess.finished) return;
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, [sess]);

  const active = !!sess;
  useEffect(() => {
    onActive(active);
    return () => onActive(false);
  }, [active, onActive]);

  const finished = !!sess?.finished;
  useEffect(() => {
    if (finished) onFinish?.();
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const streakDone = pool.filter((c) => (progress[c.id]?.streak || 0) >= AUTO_TARGET).length;

  function start() {
    // Weakest first: lowest streak, then least recently practised, random among ties.
    const ranked = pool
      .map((c) => ({ id: c.id, k: (progress[c.id]?.streak || 0) * 1e13 + (progress[c.id]?.last || 0) + Math.random() * 1e9 }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.id);
    const queue = count ? ranked.slice(0, count) : ranked;
    setSess({ queue, idx: 0, revealed: false, hint: false, startedAt: Date.now(), ms: 0, results: [], offer: null, finished: false });
  }

  function advance(results) {
    stopAll();
    setSess((s) => {
      if (s.idx + 1 >= s.queue.length) return { ...s, results, finished: true, offer: null };
      return { ...s, idx: s.idx + 1, revealed: false, hint: false, startedAt: Date.now(), ms: 0, results, offer: null };
    });
  }

  if (!sess) {
    return (
      <div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
          Du siehst die Übersetzung und sagst den Satz <b>laut auf Deutsch</b>, bevor du aufdeckst.
          Dann hörst du die Lösung und bewertest dich ehrlich. Was du schwer findest, kommt öfter dran.
        </p>
        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 12px" }}>
          {pool.length} Chunks im Pool · {streakDone} davon schon {AUTO_TARGET}× in Folge automatisch
        </p>
        <button disabled={!pool.length} onClick={start} style={{ ...primaryBtn("#D4537E"), opacity: pool.length ? 1 : 0.4 }}>
          Start ({count ? Math.min(count, pool.length) : pool.length} Chunks)
        </button>
      </div>
    );
  }

  if (sess.finished) {
    const n = (r) => sess.results.filter((x) => x === r).length;
    return (
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px" }}>Runde fertig 🎉</p>
        <p style={{ fontSize: 14, lineHeight: 1.9, margin: "0 0 16px" }}>
          ✓ Automatisch: <b>{n("auto")}</b><br />
          ~ Gezögert: <b>{n("slow")}</b><br />
          ✗ Nicht gewusst: <b>{n("miss")}</b>
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} style={{ ...primaryBtn("#D4537E"), flex: 1 }}>Nochmal</button>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#999"), flex: 1 }}>Beenden</button>
        </div>
      </div>
    );
  }

  const c = byId.get(sess.queue[sess.idx]);
  if (!c) return null;
  const ci = CM[c.cat] || CM.conversation;
  const elapsed = (Math.max(0, sess.revealed ? sess.ms : now - sess.startedAt) / 1000).toFixed(1);

  function reveal() {
    const ms = Date.now() - sess.startedAt;
    setSess({ ...sess, revealed: true, ms });
    speak(c.id, speechText(c.de), c.en);
  }

  function rateIt(rating) {
    rate(c.id, rating, sess.ms);
    const results = [...sess.results, rating];
    const newStreak = rating === "auto" ? (progress[c.id]?.streak || 0) + 1 : 0;
    if (rating === "auto" && newStreak >= AUTO_TARGET && !c.mastered) {
      setSess({ ...sess, results, offer: c.id });
    } else {
      advance(results);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#888" }}>{sess.idx + 1} / {sess.queue.length}</span>
        <button onClick={() => { stopAll(); setSess(null); }} style={{ ...pill(false), padding: "2px 10px" }}>Beenden</button>
      </div>

      {!sess.revealed ? (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 14, padding: "22px 16px", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10, background: ci.bg, color: ci.tc }}>{ci.label}</span>
          <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.4, margin: "16px 0 8px" }}>{promptText(c.en)}</p>
          <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 14px" }}>Sag es jetzt laut auf Deutsch · ⏱ {elapsed} s</p>
          {sess.hint && (
            <p style={{ fontSize: 14, color: "#7a4f00", margin: "0 0 12px" }}>Tipp: {speechText(c.de).split(" ")[0]} …</p>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            {!sess.hint && <button onClick={() => setSess({ ...sess, hint: true })} style={{ ...primaryBtn("#bbb"), flex: 1 }}>Tipp</button>}
            <button onClick={reveal} style={{ ...primaryBtn("#D4537E"), flex: 2 }}>Aufdecken</button>
          </div>
        </div>
      ) : (
        <div>
          <ChunkCard
            chunk={c}
            speaking={speaking}
            onSpeak={(id, de, en, details) => speak(id, speechText(de), en, details)}
            onToggleMastered={toggleMastered}
          />
          <p style={{ fontSize: 11, color: "#aaa", margin: "8px 0 6px", textAlign: "center" }}>
            ⏱ {elapsed} s · Wie war es? (automatisch = sofort, ohne Nachdenken)
          </p>
          {sess.offer === c.id ? (
            <div style={{ border: "1px solid #86efac", background: "#f0fdf4", borderRadius: 12, padding: "12px", textAlign: "center" }}>
              <p style={{ fontSize: 13, margin: "0 0 10px" }}>🎉 {AUTO_TARGET}× in Folge automatisch. Als gemeistert markieren?</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { toggleMastered(c.id); advance(sess.results); }} style={{ ...primaryBtn("#16a34a"), flex: 1, padding: "9px" }}>Gemeistert ✓</button>
                <button onClick={() => advance(sess.results)} style={{ ...primaryBtn("#999"), flex: 1, padding: "9px" }}>Weiter</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => rateIt("auto")} style={{ ...primaryBtn("#16a34a"), flex: 1, padding: "10px 4px", fontSize: 13 }}>✓ Automatisch</button>
              <button onClick={() => rateIt("slow")} style={{ ...primaryBtn("#d97706"), flex: 1, padding: "10px 4px", fontSize: 13 }}>~ Gezögert</button>
              <button onClick={() => rateIt("miss")} style={{ ...primaryBtn("#dc2626"), flex: 1, padding: "10px 4px", fontSize: 13 }}>✗ Nicht gewusst</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TALK_PLANS = { short: [120, 90, 60], classic: [240, 180, 120] };

function EchoStep({ set, speaking, echoAll, stopAll, gap, setGap, onDone }) {
  const running = speaking === "echo";
  function start() {
    if (running) { stopAll(); return; }
    echoAll(shuffle(set).map((c) => ({ text: speechText(c.de), subtitle: c.en, details: chunkDetails(c) })), gap, "echo", onDone);
  }
  return (
    <div>
      <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
        Du hörst den Satz, dann kommt eine Pause: <b>sprich ihn laut nach</b>, so gleichmäßig wie möglich.
        Der Player zeigt dir „Hör zu“ und „Jetzt du!“.
      </p>
      <p style={label}>Pause zum Nachsprechen</p>
      <div style={{ marginBottom: 16 }}>
        <Chips options={[[1, "kurz"], [1.5, "normal"], [2, "lang"]]} value={gap} onChange={setGap} />
      </div>
      <button disabled={!set.length} onClick={start} style={{ ...primaryBtn(running ? "#555" : "#D4537E"), opacity: set.length ? 1 : 0.4 }}>
        {running ? "⏹ Stop" : `▶ Echo starten (${set.length} Chunks)`}
      </button>
    </div>
  );
}

function StepRow({ icon, name, hint, done, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", textAlign: "left", cursor: "pointer", background: done ? "#f6fdf8" : "#fff", border: `1px solid ${done ? "#bbf7d0" : "#e5e5e5"}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ flex: 1 }}>
        <b style={{ fontSize: 14 }}>{name}</b>
        <span style={{ display: "block", fontSize: 11.5, color: "#888", marginTop: 1 }}>{hint}</span>
      </span>
      <span style={{ fontSize: 17, color: done ? "#22c55e" : "#ccc" }}>{done ? "✓" : "›"}</span>
    </button>
  );
}

const STEPS = [
  ["echo", "🔁", "1 · Echo", "Hören und laut nachsprechen"],
  ["translate", "💬", "2 · Übersetzen", "Übersetzung sehen, Satz laut sagen, bewerten"],
  ["speak", "🎙", "3 · Sprechen", "Frei sprechen und die Sätze benutzen"],
];

export default function Sprechen({ chunks, toggleMastered, speech, daily, initialStep = null }) {
  const { speaking, speak, playAll, echoAll, stopAll } = speech;
  const [step, setStep] = useState(initialStep);
  const [drillActive, setDrillActive] = useState(false);
  const [gap, setGap] = useState(1.5);
  const { progress, rate } = useSpeakingProgress();
  const byId = useMemo(() => new Map(chunks.map((c) => [c.id, c])), [chunks]);
  const set = daily.set;

  // "Gespräch" is too broad to ask about; use the noun the set is built around, else let the learner pick.
  const promptTopic = daily.sub || (daily.topic === "conversation" ? "Gemischt" : daily.topicLabel);
  const back = () => { if (speaking) stopAll(); setStep(null); };
  const onEchoDone = () => daily.markStep("echo");
  const onTranslateDone = () => daily.markStep("translate");
  const onSpeakDone = () => daily.markStep("speak");

  if (step) {
    const current = step === "register" ? "🎭 Register-Drill" : STEPS.find(([k]) => k === step)?.[2].slice(4);
    return (
      <div style={{ padding: "12px 16px 100px" }}>
        {!drillActive && (
          <div style={{ marginBottom: 12 }}>
            <button onClick={back} style={{ background: "none", border: "none", cursor: "pointer", color: "#D4537E", fontSize: 13, fontWeight: 500, padding: 0 }}>‹ Übersicht</button>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: "6px 0 2px" }}>{current}</h1>
            {step !== "register" && (
              <p style={{ fontSize: 11.5, color: "#999", margin: 0 }}>{daily.topicLabel}{daily.sub ? ` · ${daily.sub}` : ""} · {set.length} Chunks</p>
            )}
          </div>
        )}

        {step === "echo" && <EchoStep set={set} speaking={speaking} echoAll={echoAll} stopAll={stopAll} gap={gap} setGap={setGap} onDone={onEchoDone} />}
        {step === "translate" && (
          <TranslateDrill
            pool={set} byId={byId} count={0} progress={progress} rate={rate}
            speaking={speaking} speak={speak} stopAll={stopAll} toggleMastered={toggleMastered}
            onActive={setDrillActive} onFinish={onTranslateDone}
          />
        )}
        {step === "speak" && (
          <SprechenFrei set={set} topicLabel={promptTopic} topicCat={daily.topic} onActive={setDrillActive} onDone={onSpeakDone} />
        )}
        {step === "register" && <RegisterDrill speaking={speaking} speak={speak} playAll={playAll} stopAll={stopAll} onActive={setDrillActive} />}
      </div>
    );
  }

  const doneCount = ["echo", "translate", "speak"].filter((k) => daily.steps[k]).length;
  return (
    <div style={{ padding: "16px 16px 100px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Sprechen</h1>
      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 14px", lineHeight: 1.5 }}>
        Ein Set, drei Schritte: erst hören, dann übersetzen, dann frei sprechen – immer mit denselben Sätzen. {doneCount} / 3 erledigt.
      </p>

      <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Thema</span>
          <select
            value={daily.topic} onChange={(e) => daily.setTopic(e.target.value)} aria-label="Thema ändern"
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "4px 6px", fontSize: 13, background: "#fff", color: "#444", maxWidth: 160 }}
          >
            {daily.topics.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            <option value={MIX}>Gemischt</option>
          </select>
          <button onClick={daily.newSet} style={{ ...pill(false), padding: "3px 10px" }}>↻ Neues Set</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Größe</span>
          {SET_SIZES.map((n) => (
            <button key={n} onClick={() => daily.setSize(n)} style={{ ...pill(daily.size === n, "#D4537E", "#FBEAF0"), padding: "3px 11px" }}>{n}</button>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: "#999", margin: "8px 0 0", lineHeight: 1.5 }}>
          {set.length} Sätze{daily.sub ? ` rund um „${daily.sub}“` : ""}. Die 3 Chunks des Tages sind dabei.
        </p>
        <details style={{ marginTop: 6 }}>
          <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Sätze ansehen</summary>
          <ol style={{ margin: "6px 0 0", paddingLeft: 20, fontSize: 12.5, lineHeight: 1.6, color: "#444" }}>
            {set.map((c) => <li key={c.id}>{speechText(c.de)}</li>)}
          </ol>
        </details>
      </div>

      {STEPS.map(([k, icon, name, hint]) => (
        <StepRow key={k} icon={icon} name={name} hint={hint} done={daily.steps[k]} onClick={() => setStep(k)} />
      ))}

      <p style={{ fontSize: 11, color: "#aaa", margin: "16px 0 6px" }}>Extra</p>
      <StepRow icon="🎭" name="Register-Drill" hint="Dieselbe Aussage: formell, neutral, umgangssprachlich" done={false} onClick={() => setStep("register")} />
    </div>
  );
}
