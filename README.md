# German Trainer

A personal German learning PWA — chunks (sentences), vocabulary, and grammar
reference tables, with audio via the Web Speech API. Installable on iPhone via
Add to Home Screen.

## Adding new sentences

Edit [`src/data/chunks.json`](src/data/chunks.json) directly (see the shape
documented in `docs/SPEC.md` if you have it handy), commit, and push to `main`.
A GitHub Actions workflow rebuilds and republishes the site automatically —
no manual deploy step.

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

"Mastered" chunks and "known" words persist in the browser's `localStorage`.

## Colours

The gender colour system (der/die/das/plural) follows the *Grammatikon* book
and is centralised in `src/lib/colors.js` — do not change these values.
