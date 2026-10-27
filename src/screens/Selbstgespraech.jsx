import { useEffect, useRef, useState } from "react";
import { Chips, beep, fmtTime, label, pill, primaryBtn } from "../components/sprechenUi";

const DAYS_KEY = "german_selftalk_v1";
const WORDS_KEY = "german_missing_words_v1";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
};

const EXERCISES = {
  kommentator: {
    icon: "🎤", name: "Der Kommentator",
    how: "Beschreibe laut, was du gerade machst – wie ein Sportreporter.",
    hints: ["Jetzt …", "Gerade …", "Als Nächstes …", "Und schon …"],
    prompts: ["Du kochst gerade Kaffee.", "Du räumst die Küche auf.", "Du gehst zur Arbeit oder zum Supermarkt.", "Du machst dich fertig für den Tag.", "Du bereitest das Abendessen vor.", "Du sitzt am Schreibtisch und arbeitest.", "Du spülst das Geschirr.", "Du packst einen Koffer."],
  },
  rueckblick: {
    icon: "🌙", name: "Der Tagesrückblick",
    how: "Erzähl im Perfekt, was du heute gemacht hast. Benutze Konnektoren.",
    hints: ["zuerst", "danach", "anschließend", "schließlich", "obwohl", "deshalb"],
    prompts: ["Was hast du heute gemacht – von morgens bis jetzt?", "Was war heute das Beste, und was war anstrengend?", "Wen hast du heute getroffen oder gesprochen?", "Was hast du heute gegessen oder gekocht?", "Was hast du heute Neues gelernt?"],
  },
  meinung: {
    icon: "💭", name: "Die Meinung",
    how: "Sag deine Meinung zu einem Thema und begründe sie.",
    hints: ["Ich sehe das eher kritisch, weil …", "Einerseits …, andererseits …", "Meiner Meinung nach …", "Das hängt davon ab, ob …"],
    prompts: ["Homeoffice oder Büro – was ist besser?", "Sollte man jeden Tag Sport machen?", "Sind Handys am Esstisch okay?", "Lohnt sich ein Auto in der Stadt?", "Soll die Schule später anfangen?", "Ist Deutsch schwerer als Spanisch?", "Sollte man nur vier Tage pro Woche arbeiten?", "Sind Haustiere gut für Kinder?"],
  },
  rollenspiel: {
    icon: "🎭", name: "Das Rollenspiel",
    how: "Spiel die Situation durch und sprich beide Rollen.",
    hints: ["Ändere deine Stimme für die zweite Rolle.", "Stell dir die Antworten vor und reagiere darauf."],
    prompts: ["Gespräch mit dem Chef: mehr Gehalt oder weniger Überstunden", "Anruf beim Vermieter: die Heizung ist kaputt", "Vorstellungsgespräch: Erzähl von dir und deiner Erfahrung", "Beim Arzt: Symptome beschreiben und einen Termin vereinbaren", "Im Restaurant: einen Tisch reservieren und etwas reklamieren", "Einen neuen Nachbarn kennenlernen", "Ein Paket reklamieren, das nicht angekommen ist", "Beim Amt einen Termin verschieben"],
  },
  erklaerung: {
    icon: "🧒", name: "Die Erklärung",
    how: "Erkläre etwas, das du gut kannst – so einfach, als würdest du es einem Kind erklären.",
    hints: ["Stell dir vor, …", "Das ist wie …", "Zuerst …, dann …", "Kurze Sätze!"],
    prompts: ["Erkläre deinen Job.", "Erkläre, wie man dein Lieblingsgericht kocht.", "Erkläre, wie man Tacos macht.", "Erkläre, wie man ein Handy einrichtet.", "Erkläre, was du an deiner Heimatstadt magst.", "Erkläre ein Hobby von dir.", "Erkläre den Weg von deiner Wohnung zum Supermarkt."],
  },
};
const ORDER = ["kommentator", "rueckblick", "meinung", "rollenspiel", "erklaerung"];

// Weekly plan: three exercises a day, Monday to Friday; weekends are free.
const PLAN = {
  1: ["kommentator", "rueckblick", "meinung"],
  2: ["rollenspiel", "erklaerung", "rueckblick"],
  3: ["kommentator", "meinung", "rollenspiel"],
  4: ["erklaerung", "rueckblick", "meinung"],
  5: ["rollenspiel", "kommentator", "erklaerung"],
  6: ["rueckblick", "erklaerung"],
  0: ["rueckblick", "erklaerung"],
};
const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const RESCUE = [
  "Wie sagt man noch mal …?",
  "Das ist so ein Ding, mit dem man …",
  "Das ist das Gegenteil von …",
  "Das ist ähnlich wie …",
  "Ich meine so eine Art …",
  "Mir fällt das Wort gerade nicht ein, aber …",
];

const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function daysThisWeek(days) {
  const d = new Date();
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  const keys = new Set(Array.from({ length: 7 }, (_, i) => dateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))));
  return days.filter((k) => keys.has(k)).length;
}

const pickPrompt = (id, avoid) => {
  const list = EXERCISES[id].prompts;
  const options = list.filter((p) => p !== avoid);
  return options[Math.floor(Math.random() * options.length)] ?? list[0];
};

function MissingWords({ words, setWords }) {
  const [text, setText] = useState("");
  function add() {
    const w = text.trim();
    if (!w) return;
    const next = [w, ...words.filter((x) => x !== w)];
    setWords(next);
    write(WORDS_KEY, next);
    setText("");
  }
  function remove(w) {
    const next = words.filter((x) => x !== w);
    setWords(next);
    write(WORDS_KEY, next);
  }
  return (
    <div style={{ marginTop: 16, textAlign: "left" }}>
      <p style={label}>Wörter, die mir gefehlt haben – abends nachschlagen</p>
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
            <button onClick={() => remove(w)} aria-label={`${w} entfernen`} style={{ background: "none", border: "none", cursor: "pointer", color: "#993556", fontSize: 13, padding: "0 4px" }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Selbstgespraech({ onActive }) {
  const todayIdx = new Date().getDay();
  const [picks, setPicks] = useState(PLAN[todayIdx]);
  const [dur, setDur] = useState(120);
  const [sess, setSess] = useState(null);
  const [days, setDays] = useState(() => read(DAYS_KEY, []));
  const [words, setWords] = useState(() => read(WORDS_KEY, []));
  const audioRef = useRef(null);

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
        setSess((s) => (s && s.phase === "running" ? { ...s, phase: "between", left: 0 } : s));
      } else {
        setSess((s) => (s && s.phase === "running" ? { ...s, left } : s));
      }
    }, 250);
    return () => clearInterval(t);
  }, [running, endAt]);

  const toggle = (id) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : ORDER.filter((x) => p.includes(x) || x === id)));

  function start() {
    const list = picks.length ? picks : PLAN[todayIdx];
    setSess({ list, i: 0, phase: "ready", left: dur, prompt: pickPrompt(list[0]) });
  }

  function go() {
    if (!audioRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioRef.current = new AC();
    }
    audioRef.current?.resume?.();
    setSess((s) => ({ ...s, phase: "running", endAt: Date.now() + dur * 1000, left: dur }));
  }

  function advance() {
    setSess((s) => {
      if (s.i + 1 >= s.list.length) return { ...s, phase: "done" };
      const ni = s.i + 1;
      return { ...s, i: ni, phase: "ready", left: dur, prompt: pickPrompt(s.list[ni]) };
    });
  }

  // Count the day once the session reaches the summary.
  const done = sess?.phase === "done";
  useEffect(() => {
    if (!done) return;
    setDays((prev) => {
      const k = dateKey();
      if (prev.includes(k)) return prev;
      const next = [...prev, k].slice(-120);
      write(DAYS_KEY, next);
      return next;
    });
  }, [done]);

  if (!sess) {
    return (
      <div>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.6, margin: "0 0 10px" }}>
          10 Minuten täglich, laut auf Deutsch, ohne Publikum. Hör nicht auf, wenn dir ein Wort fehlt: <b>umschreibe es</b>
          {" "}und notiere es später.
        </p>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
          Heute ist {DAY_NAMES[todayIdx]} · Diese Woche: <b>{daysThisWeek(days)}</b> / 5 Tage geschafft
        </p>
        <p style={label}>Übungen {todayIdx === 0 || todayIdx === 6 ? "(Wochenende: freie Auswahl)" : "(Plan für heute, du kannst ändern)"}</p>
        <div style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          {ORDER.map((id) => {
            const e = EXERCISES[id];
            const on = picks.includes(id);
            return (
              <button
                key={id} onClick={() => toggle(id)}
                style={{ textAlign: "left", cursor: "pointer", border: `1px solid ${on ? "#D4537E" : "#ddd"}`, background: on ? "#FBEAF0" : "#fff", borderRadius: 10, padding: "8px 11px", display: "flex", gap: 10, alignItems: "center" }}
              >
                <span style={{ fontSize: 20 }}>{e.icon}</span>
                <span style={{ flex: 1 }}>
                  <b style={{ fontSize: 13, color: "#222" }}>{e.name}</b>
                  <span style={{ display: "block", fontSize: 11, color: "#777", lineHeight: 1.4 }}>{e.how}</span>
                </span>
                <span style={{ fontSize: 15, color: on ? "#D4537E" : "#ccc" }}>{on ? "●" : "○"}</span>
              </button>
            );
          })}
        </div>
        <p style={label}>Dauer pro Übung</p>
        <div style={{ marginBottom: 12 }}>
          <Chips options={[[120, "2 Min (Plan)"], [60, "1 Min"]]} value={dur} onChange={setDur} />
        </div>
        {(todayIdx === 0 || todayIdx === 6) && (
          <p style={{ fontSize: 11.5, color: "#7a4f00", lineHeight: 1.5, margin: "0 0 12px" }}>
            Wochenend-Idee: Schick einer Freundin eine Sprachnachricht auf Deutsch.
          </p>
        )}
        <button disabled={!picks.length} onClick={start} style={{ ...primaryBtn("#D4537E"), opacity: picks.length ? 1 : 0.4 }}>
          Selbstgespräch starten ({picks.length} × {dur / 60} Min)
        </button>
        <p style={{ fontSize: 11, color: "#aaa", lineHeight: 1.5, margin: "10px 0 0" }}>
          Level-up: Nimm dich einmal pro Woche auf. Nach vier Wochen hörst du die erste und die letzte Aufnahme an.
        </p>
        <MissingWords words={words} setWords={setWords} />
      </div>
    );
  }

  if (sess.phase === "done") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>Fertig 🎉</p>
        <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.7, margin: "0 0 4px" }}>
          {sess.list.length} {sess.list.length === 1 ? "Übung" : "Übungen"} · {Math.round((sess.list.length * dur) / 60)} Minuten laut gesprochen.
        </p>
        <p style={{ fontSize: 12.5, color: "#16a34a", margin: "0 0 14px" }}>Diese Woche: {daysThisWeek(days)} / 5 Tage</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={start} style={{ ...primaryBtn("#D4537E"), flex: 1 }}>Nochmal</button>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#999"), flex: 1 }}>Beenden</button>
        </div>
        <MissingWords words={words} setWords={setWords} />
      </div>
    );
  }

  const id = sess.list[sess.i];
  const ex = EXERCISES[id];
  const header = `Übung ${sess.i + 1} / ${sess.list.length}`;

  const rescue = (
    <div style={{ textAlign: "left", marginTop: 12 }}>
      <p style={label}>Wort vergessen? Umschreibe es:</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {RESCUE.map((r) => (
          <span key={r} style={{ background: "#f5f5f5", color: "#555", borderRadius: 10, padding: "3px 9px", fontSize: 11.5 }}>{r}</span>
        ))}
      </div>
    </div>
  );

  const promptCard = (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: "12px 14px", margin: "0 0 10px", textAlign: "center" }}>
      <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>{sess.prompt}</p>
    </div>
  );

  const hints = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", margin: "0 0 4px" }}>
      {ex.hints.map((h) => (
        <span key={h} style={{ background: "#FBEAF0", color: "#4B1528", borderRadius: 10, padding: "3px 9px", fontSize: 12 }}>{h}</span>
      ))}
    </div>
  );

  if (sess.phase === "ready") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 2px" }}>{header}</p>
        <p style={{ fontSize: 22, fontWeight: 700, margin: "0 0 2px" }}>{ex.icon} {ex.name}</p>
        <p style={{ fontSize: 12.5, color: "#666", lineHeight: 1.5, margin: "0 0 10px" }}>{ex.how}</p>
        {promptCard}
        <button onClick={() => setSess((s) => ({ ...s, prompt: pickPrompt(id, s.prompt) }))} style={{ ...pill(false), marginBottom: 12 }}>🎲 Anderes Thema</button>
        {hints}
        <p style={{ fontSize: 36, fontWeight: 700, margin: "10px 0 8px" }}>{fmtTime(dur)}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSess(null)} style={{ ...primaryBtn("#bbb"), flex: 1 }}>Abbrechen</button>
          <button onClick={go} style={{ ...primaryBtn("#D4537E"), flex: 2 }}>Los!</button>
        </div>
        {rescue}
      </div>
    );
  }

  if (sess.phase === "running") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 5, padding: "4px 0 8px", marginBottom: 6 }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 2px" }}>{header} · {ex.name}</p>
          <p style={{ fontSize: 46, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{fmtTime(sess.left)}</p>
          <div style={{ background: "#eee", borderRadius: 3, height: 6 }}>
            <div style={{ background: "#D4537E", width: `${Math.max(0, (sess.left / dur) * 100)}%`, height: "100%", borderRadius: 3, transition: "width 0.25s linear" }} />
          </div>
        </div>
        {promptCard}
        {hints}
        <button onClick={() => setSess((s) => ({ ...s, phase: "between" }))} style={{ ...primaryBtn("#bbb"), padding: "8px", fontSize: 13, margin: "10px 0 0" }}>
          Früher beenden
        </button>
        {rescue}
        <MissingWords words={words} setWords={setWords} />
      </div>
    );
  }

  // between exercises
  const last = sess.i + 1 >= sess.list.length;
  const nextEx = last ? null : EXERCISES[sess.list[sess.i + 1]];
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>{header}</p>
      <p style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px" }}>Zeit! 🔔</p>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 14px" }}>
        {last ? "Das war die letzte Übung." : `Als Nächstes: ${nextEx.icon} ${nextEx.name}`}
      </p>
      <button onClick={advance} style={primaryBtn("#D4537E")}>{last ? "Fertig" : "Weiter"}</button>
      <MissingWords words={words} setWords={setWords} />
    </div>
  );
}
