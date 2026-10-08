import { useCallback, useState } from "react";
import { loadSpeakingProgress, saveSpeakingProgress } from "../lib/storage";

// Consecutive "automatisch" ratings after which we offer to mark a chunk mastered.
export const AUTO_TARGET = 3;

// Per-chunk self-ratings from the translation drill:
// { [chunkId]: { streak, seen, auto, last, lastMs, lastRating } }
export function useSpeakingProgress() {
  const [progress, setProgress] = useState(() => loadSpeakingProgress());

  const rate = useCallback((id, rating, ms) => {
    setProgress((prev) => {
      const p = prev[id] || { streak: 0, seen: 0, auto: 0 };
      const next = {
        ...p,
        seen: p.seen + 1,
        auto: p.auto + (rating === "auto" ? 1 : 0),
        streak: rating === "auto" ? p.streak + 1 : 0,
        last: Date.now(),
        lastMs: ms,
        lastRating: rating,
      };
      const all = { ...prev, [id]: next };
      saveSpeakingProgress(all);
      return all;
    });
  }, []);

  return { progress, rate };
}
