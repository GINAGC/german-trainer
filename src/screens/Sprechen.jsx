import { useEffect, useMemo, useState } from "react";
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
          <button onClick={() => setMode("echo")} style={{ ...pill(mode === "echo", "#D4537E", "#FBEAF0"), flex: 1, padding: "8px" }}>🔁 Echo</button>
          <button onClick={() => { if (speaking === "echo") stopAll(); setMode("translate"); }} style={{ ...pill(mode === "translate", "#D4537E", "#FBEAF0"), flex: 1, padding: "8px" }}>💬 Übersetzen</button>
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
          <option value="all">Alle Kategorien ({poolCounts[pool]})</option>
          {categories.filter((c) => c.id !== "all" && catCounts[c.id]).map((c) => (
            <option key={c.id} value={c.id}>{c.label} ({catCounts[c.id]})</option>
          ))}
        </select>

        <p style={label}>Anzahl pro Runde</p>
        <div style={{ marginBottom: 14 }}>
          <Chips options={[[10, "10"], [20, "20"], [0, "Alle"]]} value={count} onChange={setCount} />
        </div>
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
      ) : (
        <TranslateDrill
          pool={drillPool} byId={byId} count={count} progress={progress} rate={rate}
          speaking={speaking} speak={speak} stopAll={stopAll} toggleMastered={toggleMastered}
          onActive={setDrillActive}
        />
      )}
    </div>
  );
}
