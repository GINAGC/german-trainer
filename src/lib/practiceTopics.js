// Daily rotation: one grammar topic and one verb topic per day. Each points to
// a place in the app. `anchor` matches a data-topic attribute in the grammar
// pages; `group` preselects a chip in Verben / Genus-Regeln.
export const GRAMMAR_TOPICS = [
  { id: "artikel", page: "tabellen", anchor: "artikel", title: "Artikel nach Kasus", teaser: "der / die / das in Nominativ, Akkusativ, Dativ und Genitiv." },
  { id: "pronomen", page: "tabellen", anchor: "pronomen", title: "Personalpronomen", teaser: "ich, du, er … in allen Fällen – mit spanischer Hilfe." },
  { id: "akkdat", page: "tabellen", anchor: "akkdat", title: "Akkusativ vs. Dativ", teaser: "Wann steht der Akkusativ, wann der Dativ?" },
  { id: "g-maskulin", page: "genus", group: "maskulin", title: "Genus-Regeln: der", teaser: "Woran du ein maskulines Nomen erkennst." },
  { id: "g-neutral", page: "genus", group: "neutral", title: "Genus-Regeln: das", teaser: "Woran du ein Neutrum erkennst." },
  { id: "g-feminin", page: "genus", group: "feminin", title: "Genus-Regeln: die", teaser: "Woran du ein feminines Nomen erkennst." },
  { id: "g-plural", page: "genus", group: "plural", title: "Genus-Regeln: Plural", teaser: "Pluralformen und ihre Regeln." },
  { id: "d-muster", page: "deklination", anchor: "muster", title: "Deklination: der- und ein-Wörter", teaser: "Welches Wort folgt welchem Muster?" },
  { id: "d-endungen", page: "deklination", anchor: "endungen", title: "Endungen der der-Wörter", teaser: "Die Endungen in allen Fällen und Genera." },
  { id: "d-adjektive", page: "deklination", anchor: "adjektive", title: "Adjektivendungen", teaser: "Alle drei Muster auf einen Blick." },
  { id: "d-possessiv", page: "deklination", anchor: "possessiv", title: "Possessiv: Artikel und Pronomen", teaser: "mein, dein, sein … und ihre Endungen." },
  { id: "s-verwirren", page: "satzbau", anchor: "verwirren", title: "Verben, die verwirren", teaser: "sein / haben / wollen / werden – würde ≠ wurde." },
  { id: "s-zeiten", page: "satzbau", anchor: "zeiten", title: "Zeiten", teaser: "Präsens, Perfekt, Präteritum, Futur – Formeln und Beispiele." },
  { id: "s-modal", page: "satzbau", anchor: "modal", title: "Modalverben", teaser: "wollen, dürfen, müssen, können, sollen, möchten." },
  { id: "s-partikeln", page: "satzbau", anchor: "partikeln", title: "Modalpartikeln", teaser: "denn, ja, mal, doch, halt, schon, wohl – natürlich klingen." },
  { id: "s-konzessiv", page: "satzbau", anchor: "konzessiv", title: "obwohl / trotzdem / trotz", teaser: "Drei Wörter, drei Wortstellungen." },
  { id: "s-b1", page: "satzbau", anchor: "b1fehler", title: "15 typische B1-Fehler", teaser: "Wähle heute einen Fehler und trainiere ihn weg." },
  { id: "a-register", page: "alltag", anchor: "register", title: "Drei Register", teaser: "Formell, neutral, umgangssprachlich – wann was?" },
  { id: "a-verkuerzung", page: "alltag", anchor: "verkuerzung", title: "Verkürzungen beim Sprechen", teaser: "hab, gibt's, 'ne, haste …" },
  { id: "a-woerter", page: "alltag", anchor: "alltagswoerter", title: "Standard und Alltag", teaser: "Wie Muttersprachler wirklich sagen, was du im Kurs lernst." },
  { id: "a-satzbau", page: "alltag", anchor: "satzbau", title: "Satzbau im gesprochenen Deutsch", teaser: "weil + Hauptsatz, Thema nach vorn, Nachträge." },
  { id: "a-smalltalk", page: "alltag", anchor: "smalltalk", title: "Smalltalk", teaser: "Eröffnen, am Laufen halten, elegant beenden." },
];

const VERB_GROUPS = ["Alltag & Organisation", "Denken & Verstehen", "Gefühle & Reaktionen", "Kommunikation", "Arbeit & Beruf", "Bewegung & Veränderung", "Kleine Wörter, große Wirkung"];
const NVV_GROUPS = ["Entscheiden & Handeln", "Sprechen & Diskutieren", "Denken & Bewerten", "Prozesse & Veränderung", "Beziehungen & Kontakt"];
const DAT_GROUPS = [["Nur Dativ", "Verben, bei denen die Person im Dativ steht."], ["Dativ + Akkusativ", "Die Person im Dativ, die Sache im Akkusativ."]];

export const VERB_TOPICS = [
  ...VERB_GROUPS.map((g) => ({ id: `v-${g}`, tab: "verben", grp: g, title: g, sub: "Alltagsverben" })),
  ...DAT_GROUPS.map(([g, t]) => ({ id: `d-${g}`, tab: "dativ", grp: g, title: `Dativ-Verben: ${g}`, sub: t })),
  ...NVV_GROUPS.map((g) => ({ id: `n-${g}`, tab: "nvv", grp: g, title: `Nomen-Verb-Verbindungen: ${g}`, sub: "C1-Wendungen" })),
];

// Whole days since 1970 in local calendar terms – the rotation index.
export function dayNumber(d = new Date()) {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
