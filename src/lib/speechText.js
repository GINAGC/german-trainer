// Shared text-cleaning for display and speech. Ported from the reference artifact.

// Strip the "[Vgt]" past-tense marker for display.
export function cleanDe(de) {
  return de.replace(/\s*\[Vgt\]/gi, "").trim();
}

export function isPast(de) {
  return /\[Vgt\]/i.test(de);
}

// Strip everything that shouldn't be spoken: [Vgt], "→ ..." asides,
// parenthetical notes, and plural suffixes like ",-e" / ",-n" / ",-(e)s".
export function speechText(text) {
  return text
    .replace(/\s*\[Vgt\]/gi, "")
    .replace(/→.*$/gm, "")
    .replace(/\(.*?\)/g, "")
    .replace(/,[-–][\w()e]*\b/g, "")
    .trim();
}

// Word-list entries carry plural info after a comma, e.g. "der Abend,-e" or
// "die Adresse, -n" — strip from the first comma onward before speaking.
export function wordSpeechText(g) {
  return g.replace(/[,，].*$/, "").trim();
}
