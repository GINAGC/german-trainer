import { useEffect, useMemo, useRef, useState } from "react";
import categories from "../data/categories.json";
import ChunkCard from "../components/ChunkCard";
import { speechText } from "../lib/speechText";
import { AUTO_TARGET, useSpeakingProgress } from "../hooks/useSpeakingProgress";

const CM = Object.fromEntries(categories.map((c) => [c.id, c]));

const pill = (on, accent = "#999", bg = "#f0f0f0") => ({
  cursor: "pointer", borderRadius: 20, padding: "4px 11px", fontSize: 12,
  border: `1px solid ${on ? accent : "#ddd"}`, background: on ? bg : "transparent",
  fontWeight: on ? 500 : 400, color: on ? "#111" : "#666",
});
const label = { fontSize: 11, color: "#aaa", margin: "0 0 5px" };
const primaryBtn = (bg) => ({
  cursor: "pointer", border: "none", borderRadius: 12, padding: "12px 18px", fontSize: 15, fontWeight: 600,
  background: bg, color: "#fff", width: "100%",
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// English/Spanish prompt without the study notes: "[R] ..." tags and "(past)" asides.
function promptText(en) {
  const t = en.replace(/^\[[^\]]*\]\s*/, "").replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim();
  return t || en;
}

function Chips({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([v, l]) => (
        <button key={String(v)} onClick={() => onChange(v)} style={pill(value === v)}>{l}</button>
      ))}
    </div>
  );
}

function TranslateDrill({ pool, byId, count, progress, rate, speaking, speak, stopAll, toggleMastered, onActive }) {
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
            onSpeak={(id, de, en) => speak(id, speechText(de), en)}
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
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const SELF = [["😬", "Viele Pausen"], ["🙂", "Ging so"], ["🚀", "Flüssig"]];

function beep(ctx) {
  try {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.2;
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {
    /* the visual cue still shows */
  }
}

function WordBank({ bank }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "8px 12px", marginBottom: 12, textAlign: "left" }}>
      {bank.map((c) => (
        <p key={c.id} style={{ fontSize: 12.5, margin: "5px 0", lineHeight: 1.4 }}>
          <b>{speechText(c.de)}</b><br />
          <span style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>{promptText(c.en || "")}</span>
        </p>
      ))}
    </div>
  );
}

// 4/3/2 fluency: same topic, three rounds, each shorter. Chunks of the topic
// fade out as a word bank (visible, then peek-only, then gone).
function TalkDrill({ pool, topic, ready, onActive }) {
  const [plan, setPlan] = useState("short");
  const [sess, setSess] = useState(null);
  const audioRef = useRef(null);
  const durations = TALK_PLANS[plan];

  const active = !!sess;
  useEffect(() => {
    onActive(active);
    return () => onActive(false);
  }, [active, onActive]);

  const running = sess?.phase === "running";
  const endAt = sess?.endAt;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const left = Math.ceil((endAt - Date.now()) / 1000);
      if (left <= 0) {
        beep(audioRef.current);
        setSess((s) => (s && s.phase === "running" ? { ...s, phase: "check", left: 0 } : s));
      } else {
        setSess((s) => (s && s.phase === "running" ? { ...s, left } : s));
      }
    }, 250);
    return () => clearInterval(t);
  }, [running, endAt]);

  function start() {
    setSess({ bank: shuffle(pool.filter((c) => !c.de.includes(" / "))).slice(0, 8), round: 0, phase: "ready", left: durations[0], ratings: [], peek: false });
  }

  function go() {
    if (!audioRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    audioRef.current?.resume?.();
    setSess((s) => ({ ...s, phase: "running", endAt: Date.now() + durations[s.round] * 1000, left: durations[s.round] }));
  }

  function selfRate(v) {
    setSess((s) => {
      const ratings = [...s.ratings, v];
      if (s.round >= 2) return { ...s, ratings, phase: "done" };
      return { ...s, ratings, round: s.round + 1, phase: "ready", left: durations[s.round + 1], peek: false };
    });
  }

  if (!sess) {
    return (
      <div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
          Du sprichst <b>dreimal über dasselbe Thema</b>, jedes Mal in kürzerer Zeit. Das zwingt dich, schneller und
          flüssiger zu werden. Die Sätze des Themas helfen dir als Wortbank, aber sie verschwinden von Runde zu Runde.
        </p>
        <p style={label}>Zeiten</p>
        <div style={{ marginBottom: 12 }}>
          <Chips options={[["short", "Kurz · 2 · 1,5 · 1 min"], ["classic", "Klassisch · 4 · 3 · 2 min"]]} value={plan} onChange={setPlan} />
        </div>
        <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5, margin: "0 0 14px" }}>
          Tipp: nimm Runde 1 und Runde 3 mit der Sprachmemo-App auf und vergleiche, wie viel du gesagt hast.
        </p>
        <button disabled={!ready} onClick={start} style={{ ...primaryBtn("#D4537E"), opacity: ready ? 1 : 0.4 }}>
          {ready ? `Thema „${topic}“ starten` : "Wähle oben ein Thema (Kategorie)"}
        </button>
      </div>
    );
  }

  const total = durations[sess.round];
  const roundLabel = `Runde ${sess.round + 1} / 3 · ${topic}`;

  if (sess.phase === "done") {
    const better = sess.ratings[2] > sess.ratings[0];
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 12px" }}>Fertig 🎉</p>
        <div style={{ fontSize: 14, lineHeight: 2, margin: "0 0 10px" }}>
          {sess.ratings.map((v, i) => (
            <div key={i}>Runde {i + 1} ({fmtTime(durations[i])}): {SELF[v][0]} {SELF[v][1]}</div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 16px" }}>
          {better
            ? "Runde 3 war flüssiger als Runde 1. Genau das soll passieren."
            : "Wiederhole dasselbe Thema an einem anderen Tag: die Verbesserung kommt durch Wiederholung."}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} style={{ ...primaryBtn("#D4537E"), flex: 1 }}>Nochmal</button>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#999"), flex: 1 }}>Beenden</button>
        </div>
      </div>
    );
  }

  if (sess.phase === "ready") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{roundLabel}</p>
        <p style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px" }}>{fmtTime(total)}</p>
        {sess.round === 0 && <WordBank bank={sess.bank} />}
        {sess.round === 1 && (
          <>
            <button onClick={() => setSess({ ...sess, peek: !sess.peek })} style={{ ...pill(sess.peek), marginBottom: 10 }}>
              {sess.peek ? "Wortbank verstecken" : "Wortbank kurz ansehen"}
            </button>
            {sess.peek && <WordBank bank={sess.bank} />}
          </>
        )}
        {sess.round === 2 && <p style={{ fontSize: 13, color: "#7a4f00", margin: "0 0 12px" }}>Jetzt ohne Hilfe: nur du und das Thema.</p>}
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>Wenn du bereit bist, startet der Countdown. Am Ende hörst du einen Ton.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#bbb"), flex: 1 }}>Abbrechen</button>
          <button onClick={go} style={{ ...primaryBtn("#D4537E"), flex: 2 }}>Los!</button>
        </div>
      </div>
    );
  }

  if (sess.phase === "running") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{roundLabel}</p>
        <p style={{ fontSize: 64, fontWeight: 700, margin: "6px 0 10px", fontVariantNumeric: "tabular-nums" }}>{fmtTime(sess.left)}</p>
        <div style={{ background: "#eee", borderRadius: 3, height: 6, margin: "0 0 16px" }}>
          <div style={{ background: "#D4537E", width: `${Math.max(0, (sess.left / total) * 100)}%`, height: "100%", borderRadius: 3, transition: "width 0.25s linear" }} />
        </div>
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "0 0 16px" }}>
          Sprich laut über <b>{topic}</b>. Nicht korrigieren, nicht stoppen: einfach weitersprechen.
        </p>
        <button
          onClick={() => setSess((s) => ({ ...s, phase: "check" }))}
          style={{ ...primaryBtn("#bbb"), padding: "9px" }}
        >
          Früher beenden
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{roundLabel}</p>
      <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 14px" }}>Zeit! Wie lief die Runde?</p>
      <div style={{ display: "flex", gap: 6 }}>
        {SELF.map(([emoji, text], v) => (
          <button key={v} onClick={() => selfRate(v)} style={{ ...primaryBtn(v === 0 ? "#d97706" : v === 1 ? "#6b7280" : "#16a34a"), flex: 1, padding: "12px 4px", fontSize: 13 }}>
            {emoji}<br />{text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Sprechen({ chunks, toggleMastered, speaking, speak, echoAll, stopAll }) {
  const [mode, setMode] = useState("echo");
  const [pool, setPool] = useState("active");
  const [cat, setCat] = useState("all");
  const [count, setCount] = useState(10);
  const [order, setOrder] = useState("random");
  const [gap, setGap] = useState(1.5);
  const [drillActive, setDrillActive] = useState(false);
  const { progress, rate } = useSpeakingProgress();

  const byId = useMemo(() => new Map(chunks.map((c) => [c.id, c])), [chunks]);
  const usable = useMemo(() => chunks.filter((c) => c.cat !== "grammar" && !/→| vs\. /.test(c.de)), [chunks]);
  const inPool = (c) => pool === "all" || (pool === "mastered") === !!c.mastered;

  const poolCounts = {
    active: usable.filter((c) => !c.mastered).length,
    mastered: usable.filter((c) => c.mastered).length,
    all: usable.length,
  };
  const catCounts = useMemo(() => {
    const m = {};
    for (const c of usable) if (inPool(c)) m[c.cat] = (m[c.cat] || 0) + 1;
    return m;
  }, [usable, pool]); // eslint-disable-line react-hooks/exhaustive-deps

  const poolList = useMemo(
    () => usable.filter((c) => inPool(c) && (cat === "all" || c.cat === cat)),
    [usable, pool, cat] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const drillPool = useMemo(() => poolList.filter((c) => c.en && !c.de.includes(" / ")), [poolList]);

  function randomTopic() {
    const ids = categories.filter((c) => c.id !== "all" && (catCounts[c.id] || 0) >= 5).map((c) => c.id);
    if (ids.length) setCat(ids[Math.floor(Math.random() * ids.length)]);
  }

  function startEcho() {
    if (speaking === "echo") { stopAll(); return; }
    const ordered = order === "newest"
      ? [...poolList].sort((a, b) => Number(b.id) - Number(a.id))
      : shuffle(poolList);
    const picked = count ? ordered.slice(0, count) : ordered;
    echoAll(picked.map((c) => ({ text: speechText(c.de), subtitle: c.en })), gap);
  }

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      {!drillActive && (
        <>
        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 12px" }}>
          Vom Wissen zum Können: erst hören und nachsprechen, dann aus dem Kopf.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["echo", "🔁 Echo"], ["translate", "💬 Übersetzen"], ["talk", "⏱ 4/3/2"]].map(([m, l]) => (
            <button
              key={m}
              onClick={() => { if (speaking === "echo") stopAll(); setMode(m); }}
              style={{ ...pill(mode === m, "#D4537E", "#FBEAF0"), flex: 1, padding: "8px 4px" }}
            >
              {l}
            </button>
          ))}
        </div>

        <p style={label}>Material</p>
        <Chips
          options={[["active", `Aktiv (${poolCounts.active})`], ["mastered", `Gemeistert (${poolCounts.mastered})`], ["all", `Alle (${poolCounts.all})`]]}
          value={pool} onChange={setPool}
        />
        <p style={{ fontSize: 10.5, color: "#bbb", margin: "5px 0 10px" }}>
          „Gemeistert“ = Flüssigkeit üben mit Sätzen, die du schon kennst.
        </p>
        <select
          value={cat} onChange={(e) => setCat(e.target.value)}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "6px 8px", fontSize: 12, background: "#fff", color: "#444", marginBottom: 14 }}
        >
          <option value="all">{mode === "talk" ? "Thema wählen …" : `Alle Kategorien (${poolCounts[pool]})`}</option>
          {categories.filter((c) => c.id !== "all" && catCounts[c.id]).map((c) => (
            <option key={c.id} value={c.id}>{c.label} ({catCounts[c.id]})</option>
          ))}
        </select>

        {mode === "talk" ? (
          <button onClick={randomTopic} style={{ ...pill(false), marginBottom: 14 }}>🎲 Zufälliges Thema</button>
        ) : (
          <>
            <p style={label}>Anzahl pro Runde</p>
            <div style={{ marginBottom: 14 }}>
              <Chips options={[[10, "10"], [20, "20"], [0, "Alle"]]} value={count} onChange={setCount} />
            </div>
          </>
        )}
        </>
      )}

      {mode === "echo" ? (
        <div>
          <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
            Du hörst den Satz, dann kommt eine Pause: <b>sprich ihn laut nach</b>, so gleichmäßig wie möglich.
            Der Player zeigt dir „Hör zu“ und „Jetzt du!“.
          </p>
          <p style={label}>Pause zum Nachsprechen</p>
          <div style={{ marginBottom: 12 }}>
            <Chips options={[[1, "kurz"], [1.5, "normal"], [2, "lang"]]} value={gap} onChange={setGap} />
          </div>
          <p style={label}>Reihenfolge</p>
          <div style={{ marginBottom: 16 }}>
            <Chips options={[["random", "Zufällig"], ["newest", "Neueste zuerst"]]} value={order} onChange={setOrder} />
          </div>
          <button
            disabled={!poolList.length}
            onClick={startEcho}
            style={{ ...primaryBtn(speaking === "echo" ? "#555" : "#D4537E"), opacity: poolList.length ? 1 : 0.4 }}
          >
            {speaking === "echo" ? "⏹ Stop" : `▶ Echo starten (${count ? Math.min(count, poolList.length) : poolList.length} Chunks)`}
          </button>
        </div>
      ) : mode === "translate" ? (
        <TranslateDrill
          pool={drillPool} byId={byId} count={count} progress={progress} rate={rate}
          speaking={speaking} speak={speak} stopAll={stopAll} toggleMastered={toggleMastered}
          onActive={setDrillActive}
        />
      ) : (
        <TalkDrill
          pool={poolList} ready={cat !== "all" && poolList.length >= 3}
          topic={CM[cat]?.label || ""} onActive={setDrillActive}
        />
      )}
    </div>
  );
}
