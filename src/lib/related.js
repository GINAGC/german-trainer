// Which chunks belong together? Shared nouns/words, plus ids that were added
// in the same batch (they usually come from one scene or conversation).
const STOP = new Set(("ich du er sie es wir ihr der die das den dem des ein eine einen einem einer und oder aber nicht ist sind war bin " +
  "habe hat haben hatte mit für auf in im zu zum zur von vom bei nach wie was wann wo dass weil wenn mir mich dir dich uns sich mein meine " +
  "meinen meinem dein deine sehr noch auch schon nur mal gern gerne dann hier dort kann muss will möchte ganz viel viele mehr als aus " +
  "über vor bitte jetzt heute morgen ihnen ihre ihren ihrem werden wird wurde kein keine keinen etwas alles gibt gab dieses diese diesen").split(" "));

const stem = (w) => (w.length > 5 ? w.replace(/(en|er|e|n|s)$/, "") : w);
export const bareNoun = (n) => n.replace(/^(der|die|das) /, "");

export function features(c) {
  const nouns = new Set((c.nouns || []).map((n) => stem(bareNoun(n).toLowerCase())));
  const words = new Set(
    c.de.toLowerCase().replace(/\[vgt\]/g, "").split(/[^a-zäöüß]+/)
      .filter((w) => w.length > 3 && !STOP.has(w)).map(stem)
  );
  return { nouns, words, id: Number(c.id) };
}

export function relatedness(a, b) {
  let score = 0;
  for (const n of a.nouns) if (b.nouns.has(n)) score += 3;
  for (const w of a.words) if (b.words.has(w)) score += 2;
  if (Math.abs(a.id - b.id) <= 6) score += 2;
  return score;
}

// Most related candidates to the given seeds, best first (a little noise breaks ties).
export function rankRelated(seeds, candidates, noise = 0.7) {
  const sf = seeds.map(features);
  return candidates
    .map((c) => {
      const f = features(c);
      return { c, s: sf.reduce((t, s) => t + relatedness(s, f), 0) + Math.random() * noise };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.c);
}

// Name a group of chunks after the noun most of them share ("" if none stands out).
export function subTopic(chunks) {
  const counts = {};
  for (const c of chunks) for (const n of c.nouns || []) counts[bareNoun(n)] = (counts[bareNoun(n)] || 0) + 1;
  const top = Object.entries(counts).sort((x, y) => y[1] - x[1])[0];
  return top && top[1] >= 3 ? top[0] : "";
}
