import { useCallback, useEffect, useMemo, useState } from "react";
import { loadChunkUses, loadDaily, saveChunkUses, saveDaily } from "../lib/storage";

export const USE_TARGET = 5;
const DAILY_COUNT = 3;
const NEWEST_POOL = 40;

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sample(arr, n) {
  const a = [...arr];
  const out = [];
  while (a.length && out.length < n) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  return out;
}

// One fresh chunk (from the newest additions) plus two others that haven't
// reached the usage target yet. Grammar/contrast entries aren't speakable
// sentences, so they're skipped.
function pickIds(chunks, uses) {
  const cand = chunks.filter(
    (c) => !c.mastered && c.cat !== "grammar" && !/→| vs\. /.test(c.de) && (uses[c.id] || 0) < USE_TARGET
  );
  const newest = [...cand].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, NEWEST_POOL);
  const first = sample(newest, 1);
  const rest = sample(cand.filter((c) => !first.includes(c)), DAILY_COUNT - first.length);
  return [...first, ...rest].map((c) => c.id);
}

// "Chunk des Tages": 3 chunks per day to use in real conversation. Ticking
// one counts a day of real use; at USE_TARGET the chunk offers "gemeistert".
export function useDailyChunks(chunks) {
  const [uses, setUses] = useState(() => loadChunkUses());
  const [daily, setDaily] = useState(() => {
    const saved = loadDaily();
    if (saved && saved.date === todayKey() && Array.isArray(saved.ids) && saved.ids.length) return saved;
    return { date: todayKey(), ids: pickIds(chunks, loadChunkUses()), used: [] };
  });

  useEffect(() => { saveDaily(daily); }, [daily]);

  // New day while the app stayed open.
  useEffect(() => {
    function check() {
      setDaily((d) => (d.date === todayKey() ? d : { date: todayKey(), ids: pickIds(chunks, uses), used: [] }));
    }
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [chunks, uses]);

  const byId = useMemo(() => new Map(chunks.map((c) => [c.id, c])), [chunks]);
  const items = daily.ids.map((id) => byId.get(id)).filter(Boolean);

  const toggleUsed = useCallback((id) => {
    const wasUsed = daily.used.includes(id);
    setDaily((d) => ({ ...d, used: wasUsed ? d.used.filter((x) => x !== id) : [...d.used, id] }));
    setUses((prev) => {
      const n = Math.max(0, (prev[id] || 0) + (wasUsed ? -1 : 1));
      const next = { ...prev, [id]: n };
      saveChunkUses(next);
      return next;
    });
  }, [daily.used]);

  const reshuffle = useCallback(() => {
    setDaily({ date: todayKey(), ids: pickIds(chunks, uses), used: [] });
  }, [chunks, uses]);

  return { items, used: new Set(daily.used), uses, toggleUsed, reshuffle };
}
