import { useCallback, useMemo, useState } from "react";
import chunksData from "../data/chunks.json";
import { loadMasteredChunkIds, saveMasteredChunkIds } from "../lib/storage";

export function useMasteredChunks() {
  const [masteredIds, setMasteredIds] = useState(() => loadMasteredChunkIds());

  const chunks = useMemo(
    () => chunksData.map((c) => ({ ...c, mastered: masteredIds.has(c.id) })),
    [masteredIds]
  );

  const toggleMastered = useCallback((id) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveMasteredChunkIds(next);
      return next;
    });
  }, []);

  return { chunks, toggleMastered };
}
