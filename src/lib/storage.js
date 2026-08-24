// Real, working persistence (replaces the artifact's window.storage, which
// only exists inside the Claude artifact sandbox and never actually saved).
const MASTERED_KEY = "german_mastered_chunk_ids_v1";
const KNOWN_WORDS_KEY = "german_known_words_v1";

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (e) {
    console.error(`storage save error (${key}):`, e);
  }
}

export function loadMasteredChunkIds() {
  return loadSet(MASTERED_KEY);
}

export function saveMasteredChunkIds(set) {
  saveSet(MASTERED_KEY, set);
}

export function loadKnownWords() {
  return loadSet(KNOWN_WORDS_KEY);
}

export function saveKnownWords(set) {
  saveSet(KNOWN_WORDS_KEY, set);
}
