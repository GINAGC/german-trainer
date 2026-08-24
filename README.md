# German Trainer

A personal German learning app — chunks (whole sentences), vocabulary, and
grammar reference tables, with spoken audio. Installable on iPhone as a
home-screen app (PWA), works offline after first load.

Live at **[ginagc.github.io/german-trainer](https://ginagc.github.io/german-trainer/)**.

## What it does

Four screens, accessed via the tab bar at the top:

- **Chunks** — full German sentences with English translations, organised
  into categories (Alltag, Arbeit, Essen, Arzt, …), each with a play button,
  filtering by category/search, and a "mastered" toggle. A floating
  mini-player handles playback with repeat counts and pause/stop.
- **Tabellen** — static reference tables: articles by case, personal
  pronouns, adjective endings, Akkusativ vs. Dativ, irregular verbs, tenses,
  modal verbs.
- **Wörter** — the vocabulary list (2,000+ words, German → Spanish), with
  search, audio, and a "known" toggle to hide words you've learned.
- **Archiv** — everything marked mastered/known lands here instead of
  disappearing for good; one tap restores it to the active list.

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
