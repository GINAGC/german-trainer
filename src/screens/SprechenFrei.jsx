import { useEffect, useRef, useState } from "react";
import { Chips, beep, fmtTime, label, pill, primaryBtn } from "../components/sprechenUi";
import { cleanDe } from "../lib/speechText";

const DAYS_KEY = "german_selftalk_v1";
const WORDS_KEY = "german_missing_words_v1";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
};

const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function daysThisWeek(days) {
  const d = new Date();
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const keys = new Set(Array.from({ length: 7 }, (_, i) => dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))));
  return days.filter((k) => keys.has(k)).length;
}

const SELF = [["😬", "Viele Pausen"], ["🙂", "Ging so"], ["🚀", "Flüssig"]];
const ROUND_PLANS = { three: [120, 90, 60], one: [120] };

const TASKS = [
  ["meinung", "💭 Meinung"],
  ["tag", "🌙 Meinen Tag erzählen"],
  ["rolle", "🎭 Rollenspiel"],
  ["erklaeren", "🧒 Erklären"],
  ["frei", "🗣 Frei"],
];

const ROLES = {
  work: ["Gespräch mit dem Chef über Aufgaben und Gehalt", "Vorstellungsgespräch", "Telefonat mit einer Kollegin: einen Termin verschieben"],
  daily: ["Einen neuen Nachbarn kennenlernen", "Anruf beim Vermieter: etwas ist kaputt", "Ein Paket reklamieren, das nicht angekommen ist"],
  food: ["Im Restaurant bestellen und etwas reklamieren", "Auf dem Markt einkaufen", "Mit Freunden ein Essen planen"],
  shopping: ["Im Geschäft etwas umtauschen", "Nach Größe, Farbe und Preis fragen"],
  travel: ["Am Bahnhof eine Verbindung erfragen", "An der Hotelrezeption: Zimmer und Wünsche"],
  medical: ["Beim Arzt Symptome beschreiben", "In der Apotheke ein Medikament erfragen"],
  conversation: ["Smalltalk auf einer Party", "Mit einer Kollegin in der Pause plaudern"],
  smalltalk: ["Smalltalk auf einer Party", "Einen neuen Kollegen kennenlernen"],
  umgang: ["Mit Freunden locker plaudern", "Einer Freundin eine Sprachnachricht schicken"],
  learning: ["Mit der Sprachlehrerin über deinen Fortschritt sprechen", "Tandem-Gespräch mit einer Muttersprachlerin"],
  moka: ["Beim Tierarzt: Moka beschreiben", "Mit einer Nachbarin über Hunde sprechen"],
  spende: ["Mit der Organisation: ehrenamtlich helfen", "Jemanden um eine Spende bitten"],
};
const ROLES_ANY = ["Gespräch mit dem Chef", "Anruf beim Vermieter", "Beim Arzt", "Im Restaurant", "Einen neuen Nachbarn kennenlernen"];

const pickOne = (list, avoid) => {
  const options = list.filter((p) => p !== avoid);
  return (options.length ? options : list)[Math.floor(Math.random() * (options.length || list.length))];
};

function makePrompt(task, topic, cat, avoid) {
  const mix = !topic || topic === "Gemischt";
  const t = mix ? "deinem Set" : topic;
  const lists = {
    meinung: mix
      ? ["Such dir ein Thema aus deinem Set und sag deine Meinung dazu. Begründe sie."]
      : [
          `Was ist deine Meinung zum Thema „${t}“? Was findest du gut, was schwierig?`,
          `Was würdest du beim Thema „${t}“ ändern, wenn du könntest? Begründe.`,
          `„${t}“ in Deutschland und in Mexiko: Was ist anders, was ist besser?`,
          `Welchen Rat würdest du jemandem zum Thema „${t}“ geben?`,
        ],
    tag: [
      "Erzähl von deinem Tag. Benutze das Perfekt.",
      "Erzähl, was du gestern gemacht hast – von morgens bis abends.",
      "Erzähl von deiner Woche: Was war gut, was war anstrengend?",
      "Erzähl von heute: Was hast du geplant, was hat geklappt?",
    ],
    rolle: ROLES[cat] || ROLES_ANY,
    erklaeren: mix
      ? ["Erkläre deinen Job.", "Erkläre ein Rezept oder ein Hobby."]
      : [
          `Erkläre einem Kind, worum es beim Thema „${t}“ geht.`,
          `Erkläre jemandem, der neu in Deutschland ist: Wie funktioniert „${t}“ hier?`,
          "Erkläre deinen Job.",
        ],
    frei: [mix ? "Sprich frei über das, was dir zu deinem Set einfällt." : `Sprich frei über „${t}“.`],
  };
  return pickOne(lists[task], avoid);
}

const HINT = {
  meinung: "Ich sehe das eher kritisch, weil … · Einerseits …, andererseits … · Meiner Meinung nach …",
  tag: "zuerst · danach · anschließend · schließlich · obwohl · deshalb",
  rolle: "Sprich beide Rollen – ändere deine Stimme und reagiere auf die Antworten.",
  erklaeren: "Kurze Sätze! · Stell dir vor, … · Das ist wie … · Zuerst …, dann …",
  frei: "Nicht stoppen, nicht korrigieren: einfach weitersprechen.",
};

const RESCUE = [
  "Wie sagt man noch mal …?",
  "Das ist so ein Ding, mit dem man …",
  "Das ist das Gegenteil von …",
  "Das ist ähnlich wie …",
  "Ich meine so eine Art …",
  "Mir fällt das Wort gerade nicht ein, aber …",
];

function MissingWords({ words, setWords }) {
  const [text, setText] = useState("");
  function commit(next) { setWords(next); write(WORDS_KEY, next); }
  function add() {
    const w = text.trim();
    if (!w) return;
    commit([w, ...words.filter((x) => x !== w)]);
    setText("");
  }
  return (
    <div style={{ textAlign: "left" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="z. B. die Heizung"
          style={{ flex: 1, minWidth: 0, border: "1px solid #ccc", borderRadius: 8, padding: "7px 10px", fontSize: 13 }}
        />
        <button onClick={add} style={{ ...pill(false), padding: "6px 12px" }}>＋</button>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {words.map((w) => (
          <span key={w} style={{ background: "#FBEAF0", color: "#4B1528", borderRadius: 12, padding: "3px 4px 3px 10px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
            {w}
            <button onClick={() => commit(words.filter((x) => x !== w))} aria-label={`${w} entfernen`} style={{ background: "none", border: "none", cursor: "pointer", color: "#993556", fontSize: 13, padding: "0 4px" }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// The set stays visible; tap a chunk when you have used it while speaking.
function UseBank({ set, used, toggle }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: "4px 10px", textAlign: "left" }}>
      {set.map((c) => {
        const on = used.has(c.id);
        return (
          <button
            key={c.id} onClick={() => toggle(c.id)}
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "7px 0", display: "flex", gap: 9, alignItems: "flex-start", borderBottom: "1px solid #f5f5f5" }}
          >
            <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? "#22c55e" : "#ccc"}`, background: on ? "#22c55e" : "transparent", color: "#fff", fontSize: 11, lineHeight: "14px", textAlign: "center", flexShrink: 0, marginTop: 1 }}>{on ? "✓" : ""}</span>
            <span style={{ opacity: on ? 0.55 : 1 }}>
              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{cleanDe(c.de)}</span>
              {c.en && <span style={{ display: "block", fontSize: 11, color: "#999", fontStyle: "italic" }}>{c.en.replace(/^\[[^\]]*\]\s*/, "").replace(/\s*\([^)]*\)/g, "")}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// 4/3/2 and Selbstgespräch in one: free speaking with the day's set on screen.
export default function SprechenFrei({ set, topicLabel, topicCat, onActive, onDone }) {
  const [task, setTask] = useState("meinung");
  const [plan, setPlan] = useState("three");
  const [sess, setSess] = useState(null);
  const [prompt, setPrompt] = useState(() => makePrompt("meinung", topicLabel, topicCat));
  const [days, setDays] = useState(() => read(DAYS_KEY, []));
  const [words, setWords] = useState(() => read(WORDS_KEY, []));
  const audioRef = useRef(null);
  const durations = ROUND_PLANS[plan];

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

  // Count the day and the step once the session reaches the summary.
  const done = sess?.phase === "done";
  useEffect(() => {
    if (!done) return;
    onDone();
    setDays((prev) => {
      const k = dateKey();
      if (prev.includes(k)) return prev;
      const next = [...prev, k].slice(-120);
      write(DAYS_KEY, next);
      return next;
    });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickTask = (t) => { setTask(t); setPrompt(makePrompt(t, topicLabel, topicCat)); };

  function start() {
    setSess({ round: 0, phase: "ready", left: durations[0], ratings: [], used: new Set() });
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
      if (s.round + 1 >= durations.length) return { ...s, ratings, phase: "done" };
      return { ...s, ratings, round: s.round + 1, phase: "ready", left: durations[s.round + 1] };
    });
  }

  const toggleUsed = (id) => setSess((s) => {
    const used = new Set(s.used);
    if (used.has(id)) used.delete(id); else used.add(id);
    return { ...s, used };
  });

  if (!sess) {
    return (
      <div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 12px" }}>
          Jetzt sprichst du <b>frei</b> und benutzt dabei die Sätze deines Sets. Wähle eine Aufgabe; die Sätze bleiben auf dem
          Bildschirm und du tippst jeden an, sobald du ihn gesagt hast. Bei mehreren Runden wird die Zeit kürzer – das macht dich flüssiger.
        </p>
        <p style={label}>Aufgabe</p>
        <div style={{ marginBottom: 10 }}>
          <Chips options={TASKS} value={task} onChange={pickTask} />
        </div>
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "11px 13px", textAlign: "center", marginBottom: 6 }}>
          <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{prompt}</p>
        </div>
        <button onClick={() => setPrompt(makePrompt(task, topicLabel, topicCat, prompt))} style={{ ...pill(false), marginBottom: 12 }}>🎲 Andere Aufgabe</button>
        <p style={{ fontSize: 11.5, color: "#7a4f00", lineHeight: 1.5, margin: "0 0 12px" }}>{HINT[task]}</p>
        <p style={label}>Runden</p>
        <div style={{ marginBottom: 12 }}>
          <Chips options={[["three", "3 Runden · 2 · 1,5 · 1 Min"], ["one", "1 Runde · 2 Min"]]} value={plan} onChange={setPlan} />
        </div>
        <p style={{ fontSize: 11, color: "#aaa", margin: "0 0 12px" }}>Diese Woche: {daysThisWeek(days)} Tage mit Sprechübung</p>
        <button disabled={!set.length} onClick={start} style={{ ...primaryBtn("#D4537E"), opacity: set.length ? 1 : 0.4 }}>Sprechen starten</button>
        <details style={{ marginTop: 14 }}>
          <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Wörter, die mir fehlten ({words.length})</summary>
          <div style={{ marginTop: 8 }}><MissingWords words={words} setWords={setWords} /></div>
        </details>
      </div>
    );
  }

  const total = durations[sess.round];
  const header = `Runde ${sess.round + 1} / ${durations.length} · ${TASKS.find(([k]) => k === task)[1]}`;
  const counter = `${sess.used.size} / ${set.length} Sätze benutzt`;

  const promptCard = (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "11px 13px", margin: "0 0 8px", textAlign: "center" }}>
      <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{prompt}</p>
    </div>
  );

  if (sess.phase === "done") {
    const better = sess.ratings.length > 1 && sess.ratings[sess.ratings.length - 1] > sess.ratings[0];
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 10px" }}>Fertig 🎉</p>
        <div style={{ fontSize: 14, lineHeight: 2, margin: "0 0 6px" }}>
          {sess.ratings.map((v, i) => (
            <div key={i}>Runde {i + 1} ({fmtTime(durations[i])}): {SELF[v][0]} {SELF[v][1]}</div>
          ))}
        </div>
        <p style={{ fontSize: 13.5, margin: "0 0 6px" }}><b>{counter}</b></p>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 4px" }}>
          {better
            ? "Die letzte Runde war flüssiger als die erste. Genau das soll passieren."
            : sess.used.size < set.length
              ? "Versuch morgen, mehr Sätze einzubauen – oder wiederhole dieselbe Aufgabe."
              : "Alle Sätze benutzt – stark!"}
        </p>
        <p style={{ fontSize: 12, color: "#16a34a", margin: "0 0 14px" }}>Diese Woche: {daysThisWeek(days)} Tage mit Sprechübung</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setPrompt(makePrompt(task, topicLabel, topicCat, prompt)); start(); }} style={{ ...primaryBtn("#D4537E"), flex: 1 }}>Nochmal</button>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#999"), flex: 1 }}>Beenden</button>
        </div>
        <details style={{ marginTop: 14, textAlign: "left" }}>
          <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Wörter, die mir fehlten ({words.length})</summary>
          <div style={{ marginTop: 8 }}><MissingWords words={words} setWords={setWords} /></div>
        </details>
      </div>
    );
  }

  if (sess.phase === "ready") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{header}</p>
        <p style={{ fontSize: 36, fontWeight: 700, margin: "0 0 10px" }}>{fmtTime(total)}</p>
        {promptCard}
        <p style={{ fontSize: 11.5, color: "#7a4f00", lineHeight: 1.5, margin: "0 0 10px" }}>{HINT[task]}</p>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>Wenn du bereit bist, startet der Countdown. Am Ende hörst du einen Ton.</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#bbb"), flex: 1 }}>Abbrechen</button>
          <button onClick={go} style={{ ...primaryBtn("#D4537E"), flex: 2 }}>Los!</button>
        </div>
        <UseBank set={set} used={sess.used} toggle={toggleUsed} />
      </div>
    );
  }

  if (sess.phase === "running") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 5, padding: "4px 0 8px", marginBottom: 6 }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 2px" }}>{header}</p>
          <p style={{ fontSize: 46, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{fmtTime(sess.left)}</p>
          <div style={{ background: "#eee", borderRadius: 3, height: 6 }}>
            <div style={{ background: "#D4537E", width: `${Math.max(0, (sess.left / total) * 100)}%`, height: "100%", borderRadius: 3, transition: "width 0.25s linear" }} />
          </div>
        </div>
        {promptCard}
        <p style={{ fontSize: 12, color: "#16a34a", margin: "0 0 8px", fontWeight: 600 }}>{counter}</p>
        <UseBank set={set} used={sess.used} toggle={toggleUsed} />
        <button onClick={() => setSess((s) => ({ ...s, phase: "check" }))} style={{ ...primaryBtn("#bbb"), padding: "8px", fontSize: 13, margin: "12px 0 6px" }}>Früher beenden</button>
        <details style={{ textAlign: "left", marginTop: 6 }}>
          <summary style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>Wort vergessen? Umschreibe es …</summary>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
            {RESCUE.map((r) => <span key={r} style={{ background: "#f5f5f5", color: "#555", borderRadius: 10, padding: "3px 9px", fontSize: 11.5 }}>{r}</span>)}
          </div>
          <p style={{ ...label, margin: "10px 0 5px" }}>Fehlendes Wort notieren</p>
          <MissingWords words={words} setWords={setWords} />
        </details>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{header}</p>
      <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 4px" }}>Zeit! 🔔</p>
      <p style={{ fontSize: 12.5, color: "#666", margin: "0 0 14px" }}>{counter} · Wie lief die Runde?</p>
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
