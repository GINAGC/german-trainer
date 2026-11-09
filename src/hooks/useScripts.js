import { useCallback, useState } from "react";

// Course scripts are personal study material: they are imported on the device
// (never bundled with the app) and live only in this browser's storage.
const SCRIPTS_KEY = "german_scripts_v1";
const FAV_KEY = "german_script_fav_v1";
const CHECK_KEY = "german_script_check_v1";
const CURRENT_KEY = "german_script_current_v1";
// One script per week; a month's worth stays available for the final review.
export const MAX_SCRIPTS = 4;

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(`storage save error (${key}):`, e); }
};

// Minimal shape check so a wrong file gives a clear message instead of a blank screen.
export function validateScript(s) {
  if (!s || typeof s !== "object") return "Das ist kein Skript (JSON-Objekt erwartet).";
  if (!s.id || !s.title) return "Es fehlen „id“ oder „title“.";
  if (!Array.isArray(s.moments) || !s.moments.length) return "Es fehlen die Gesprächsmomente („moments“).";
  for (const m of s.moments) {
    if (!m.name || !m.lines || typeof m.lines !== "object") return `Gesprächsmoment „${m.name || "?"}“ ist unvollständig.`;
  }
  return null;
}

export function useScripts() {
  const [scripts, setScripts] = useState(() => read(SCRIPTS_KEY, []));
  const [favs, setFavs] = useState(() => read(FAV_KEY, {}));
  const [checks, setChecks] = useState(() => read(CHECK_KEY, {}));
  const [currentId, setCurrentId] = useState(() => read(CURRENT_KEY, null));

  const current = scripts.find((s) => s.id === currentId) || scripts[0] || null;

  const select = useCallback((id) => { setCurrentId(id); write(CURRENT_KEY, id); }, []);

  // Same id = same script: re-importing replaces it and keeps stars/checks.
  const add = useCallback((script) => {
    setScripts((prev) => {
      const next = [script, ...prev.filter((s) => s.id !== script.id)].slice(0, MAX_SCRIPTS);
      write(SCRIPTS_KEY, next);
      return next;
    });
    setCurrentId(script.id);
    write(CURRENT_KEY, script.id);
  }, []);

  const remove = useCallback((id) => {
    setScripts((prev) => {
      const next = prev.filter((s) => s.id !== id);
      write(SCRIPTS_KEY, next);
      return next;
    });
  }, []);

  const toggleFav = useCallback((scriptId, key) => {
    setFavs((prev) => {
      const list = prev[scriptId] || [];
      const next = { ...prev, [scriptId]: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] };
      write(FAV_KEY, next);
      return next;
    });
  }, []);

  const toggleCheck = useCallback((scriptId, i) => {
    setChecks((prev) => {
      const list = prev[scriptId] || [];
      const next = { ...prev, [scriptId]: list.includes(i) ? list.filter((k) => k !== i) : [...list, i] };
      write(CHECK_KEY, next);
      return next;
    });
  }, []);

  return {
    scripts, current, select, add, remove,
    favs: (current && favs[current.id]) || [],
    allFavs: favs,
    checks: (current && checks[current.id]) || [],
    toggleFav, toggleCheck,
  };
}
