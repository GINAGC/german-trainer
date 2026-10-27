# German Trainer

A personal German learning app — chunks (whole sentences), vocabulary, and
grammar reference tables, with spoken audio. Installable on iPhone as a
home-screen app (PWA), works offline after first load.

Live at **[ginagc.github.io/german-trainer](https://ginagc.github.io/german-trainer/)**.

## What it does

A bottom navigation bar with five areas:

- **Heute** — the start screen: progress, the **Chunk des Tages** (3 chunks a
  day to use in real conversations; 5 uses = mastered), shortcuts into
  Sprechen, and the newest chunks.
- **Sammlung** — **Chunks** (full sentences with translations, categories, audio,
  search, "newest first", mastered toggle), **Wörter** (2,000+ words,
  German → Spanish, known toggle) and **Archiv** (everything mastered/known;
  one tap restores it). A floating player shows the German with noun
  gender colours, Akk/Dat notes and the translation.
- **Verben** — **100 Verben** (everyday verbs in seven themes, each as a
  chunk, with Spanish meaning, trennbar/reflexiv badges) and
  **Nomen-Verb-Verbindungen** (C1 collocations with the simple verb they
  replace, plus an exercise).
- **Sprechen** — turns knowledge into speaking, based on the automatisation
  research (declarative → procedural → automatic):
  **Echo** (hear a chunk, then a pause to repeat it aloud),
  **Übersetzen** (see the translation, say the German aloud, reveal, rate
  yourself automatisch / gezögert / nicht gewusst; 3× automatisch in a row
  offers to mark a chunk mastered) and **4/3/2** (talk about one topic three
  times in shrinking time, with 5–8 related chunks kept on screen).
- **Grammatik** — reference pages: **Tabellen** (articles by case,
  pronouns, Akk vs. Dat), **Genus-Regeln**, **Deklination**,
  **Verben & Satzbau** (tenses, modal verbs, modal particles, concessive
  clauses, the 15 typical B1 errors) and **Alltagssprache** (registers,
  spoken contractions, spoken sentence patterns, smalltalk).

Nouns and articles throughout are colour-coded by gender (der/die/das/plural),
following the *Grammatikon* colour system — that palette is intentionally
fixed and lives in one place (`src/lib/colors.js`).

## Tech stack

- **React 19 + Vite** — UI and build tooling. Plain JavaScript/JSX, no
  TypeScript, no backend.
- **Data**: plain JSON files (`src/data/*.json`), bundled directly into the
  app — no database, no admin UI. You edit them by hand and commit.
- **Persistence**: `localStorage` — mastered chunks and known words survive
  closing the app.
- **`@tanstack/react-virtual`**: windowed rendering for the word list, so
  only the visible rows are ever in the DOM.
- **Web Speech API** (`speechSynthesis`): audio, using whichever German
  voices iOS/the browser exposes — no external TTS service.
- **`vite-plugin-pwa`** (Workbox): generates the manifest and service worker
  that make "Add to Home Screen" installable and offline-capable.
- **GitHub Pages + GitHub Actions**: hosting and deployment. Every push to
  `main` rebuilds and republishes automatically — no manual deploy step.

## Adding new sentences

Edit [`src/data/chunks.json`](src/data/chunks.json) directly, commit, and
push to `main`. The site updates itself within about a minute.

Each entry looks like:

```json
{
  "id": "362",
  "de": "Ich hätte gerne einen Tee.",
  "en": "I'd like a tea.",
  "cat": "food",
  "nouns": ["der Tee"],
  "g": [{ "w": "einen Tee", "c": "Akk", "n": "dir. Objekt → Akk (mask.)" }]
}
```

- `id` — unique; keep counting up from the current highest.
- `de` — the sentence. Append `" [Vgt]"` for past tense (Perfekt/Präteritum) —
  it's stripped for display/speech but shows a "Vgt." badge.
- `cat` — one of the ids in `src/data/categories.json`.
- `nouns` and `g` (grammar notes) are optional; add them when there's
  something worth flagging.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Data

- `src/data/chunks.json` — sentences, hand-edited, source of truth.
- `src/data/words.json` — vocabulary list (German → Spanish).
- `src/data/categories.json` — chunk categories and their colours.

## Colours

The gender colour system (der/die/das/plural) follows the *Grammatikon* book
and is centralised in `src/lib/colors.js` — do not change these values.
