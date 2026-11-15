import { useCallback, useState } from "react";

// The Einbürgerungsgespräch material (questions, answers, personal details) is private:
// it is imported on this device and lives only in this browser's storage, never in the repo.
const DATA_KEY = "german_ein_data_v1";
const PERSON_KEY = "german_ein_person_v1";
const WEAK_KEY = "german_ein_weak_v1";
const BRING_KEY = "german_ein_bring_v1";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(`storage save error (${key}):`, e); }
};

export function usePersisted(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));
  const set = useCallback((v) => { setValue(v); write(key, v); }, [key]);
  return [value, set];
}

export function validateEin(o) {
  if (!o || typeof o !== "object") return "Das ist keine Lerndatei (JSON-Objekt erwartet).";
  if (!Array.isArray(o.topics) || !o.topics.length) return "Es fehlen die Themen („topics“).";
  if (!Array.isArray(o.questions) || !o.questions.length) return "Es fehlen die Fragen („questions“).";
  if (!Array.isArray(o.person)) return "Es fehlen die Fragen zur Person („person“).";
  for (const t of o.topics) {
    if (!t.nr || !t.title || !Array.isArray(t.blocks)) return `Thema „${t.nr || "?"}“ ist unvollständig.`;
  }
  return null;
}

// Whole days from today to a YYYY-MM-DD date (0 = today, negative = past).
export function daysUntil(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export function useEinbuergerung() {
  const [data, setData] = useState(() => read(DATA_KEY, null));
  const [edits, setEdits] = useState(() => read(PERSON_KEY, {}));
  const [weak, setWeak] = useState(() => read(WEAK_KEY, []));
  const [bring, setBring] = useState(() => read(BRING_KEY, []));

  const load = useCallback((obj) => { setData(obj); write(DATA_KEY, obj); }, []);
  const remove = useCallback(() => {
    setData(null);
    setEdits({}); setWeak([]); setBring([]);
    try { [DATA_KEY, PERSON_KEY, WEAK_KEY, BRING_KEY].forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
  }, []);

  const answer = (i) => (edits[i] != null ? edits[i] : data?.person?.[i]?.a?.de || "");
  const isEdited = (i) => edits[i] != null;
  const setAnswer = useCallback((i, text) => {
    setEdits((prev) => {
      const next = { ...prev };
      if (text == null) delete next[i]; else next[i] = text;
      write(PERSON_KEY, next);
      return next;
    });
  }, []);

  const toggleWeak = useCallback((id) => {
    setWeak((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(WEAK_KEY, next);
      return next;
    });
  }, []);
  const toggleBring = useCallback((i) => {
    setBring((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      write(BRING_KEY, next);
      return next;
    });
  }, []);

  const date = data?.appointment?.date || null;
  const days = date ? daysUntil(date) : null;
  return {
    data, load, remove,
    edits, answer, isEdited, setAnswer,
    weak, toggleWeak, bring, toggleBring,
    date, days,
    // The Heute card and the 5th daily part follow it until the day after the appointment.
    active: !!data && (days === null || days >= 0),
    // The tab is there for the import until the end of the year, and while material is imported.
    visible: !!data || new Date().getFullYear() < 2027,
  };
}
