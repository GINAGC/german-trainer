import { useCallback, useState } from "react";
import { loadKnownWords, saveKnownWords } from "../lib/storage";

export function useKnownWords() {
  const [knownWords, setKnownWords] = useState(() => loadKnownWords());

  const markKnown = useCallback((key) => {
    setKnownWords((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveKnownWords(next);
      return next;
    });
  }, []);

  const undoKnown = useCallback((key) => {
    setKnownWords((prev) => {
      const next = new Set(prev);
      next.delete(key);
      saveKnownWords(next);
      return next;
    });
  }, []);

  return { knownWords, markKnown, undoKnown };
}
