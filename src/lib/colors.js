// Grammatikon gender colour system — do not change. See docs/SPEC.md.
// Colour always means gender; case (Akk/Dat) deliberately uses a different palette.
export const GENDER = {
  der: { text: "#256070", bg: "#DFEEF2" },
  die: { text: "#9A4E17", bg: "#FBEADC" },
  das: { text: "#5A4170", bg: "#EBE3F2" },
  plural: { text: "#8F2B3B", bg: "#FBE3E7" },
};

export const CASE = {
  Akk: { text: "#993556", bg: "#fbeaf0" },
  Dat: { text: "#0f6e56", bg: "#e1f5ee" },
};

const PLURAL_NOUNS = new Set([
  "die Zähne", "die Augentropfen", "die Sachen", "die Öffnungszeiten",
  "die Hundewindeln", "die Betten", "die Decken", "die Reinigungsmittel",
  "die Medikamente", "die Papiere", "die Unterlagen", "die Blutungen",
  "die Schmerzen", "die Berge",
]);

// Article/gender colour for a "der/die/das X" noun string, with plural override.
export function genderColorForNoun(noun) {
  const article = noun.startsWith("der ") ? "der" : noun.startsWith("die ") ? "die" : noun.startsWith("das ") ? "das" : null;
  if (article === "die" && PLURAL_NOUNS.has(noun)) return GENDER.plural;
  return article ? GENDER[article] : null;
}

// Article/gender colour for a bare "der"/"die"/"das" article.
export function genderColorForArticle(article) {
  return GENDER[article] ?? null;
}
