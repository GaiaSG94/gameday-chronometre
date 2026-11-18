# DESIGN — Chronomètre (journal)

> Written by Claude (design brief `PROMPT-DESIGN.md`). Versions are dated and never overwritten.

## 🔒 LOCK — 2026-11-18

`/lock` acted by Gaia (« oui lock les et suite »). Locked: `STYLE.md` (Riso, matter V2.3) and the four boards
`planches/v2/01-post.html`, `C-riso.html` (Jeu), `03-carte-de-fin.html`, `04-series-classement.html`.
End of explorations: changes only as numbered deltas. Next step: `prompts/07b-impl-design.md` (implementation in the Devvit app).

### 07b — mapping and proposed order (waiting for Gaia's validation)

| Page (PAGES.md) | Board | Devvit | Data |
|-----------------|-------|--------|------|
| Post | `01-post.html` | `splash.html` (inline, light) — fresh / already run + countdown | `GET /api/init` |
| Jeu | `C-riso.html` | `game.html` — ready / measuring / result | `GET /api/init`, `POST /api/submit` |
| Carte de fin | `03-carte-de-fin.html` | `game.html` view | result + streak + rank from `/api/submit` |
| Séries & classement | `04-series-classement.html` | `game.html` view | `GET /api/standings` |

Order: (1) scaffold from the Devvit React template (same base as `gameday-cave`) + shared Riso layer (fonts, paper, ink, sticker, stamp) + daily seed with tests → (2) Jeu → (3) Post → (4) Carte de fin → (5) Séries & classement → (6) README EN, board/product captures, STATUS.

Constraints to check, to be reported here if they force a gap: SVG filter cost in the Reddit iframe (fallback: paper pre-rendered as an embedded PNG, same look); comment posting as the user vs the app account (Devvit permission); timing measured client-side.

## V2.3 — 2026-11-18 · Matter on every element

**Status**: matter **validated** by Gaia (« C'est bon »). Pages Post, Carte de fin, Séries & classement still to validate before `/lock`.

**Why**: Gaia — « pas assez ; pas seulement GO dont il faut travailler la texture, mais bien tous les éléments ».

- Ink rebuilt as one recipe in five strengths (`STYLE.md` §3): every printed element — masthead, rules, leads, labels, small print, numbers, stats, lanes, finish line, halftone, histogram, tiles, list, quote, stamp — now has ragged edges, drum banding, mottling and riso grain inside the solids.
- Paper relief added over the ink: grazing-light tooth and slow cockling of the sheet; stronger warm mottling; more visible fibres.
- Tuned so solids stay dense and the fluo pink keeps its punch (first pass was too pale).

### Changelog

- 2026-11-18 · V2.3 · ink texture on all elements, paper relief; STYLE.md §3 ink table rewritten.

---

## V2.2 — 2026-11-18 · Matter: the Riso is printed, not drawn

**Why**: Gaia — « ajoute de la matière, là c'est plat ; mêmes couleurs, travaille la texture ».

- Same inks and layout; everything now has matter (spec in `STYLE.md` §3):
  paper stack (mottling, fibres, inclusions, tooth over the ink, warm vignette, one fold), ink filters (ragged edges, uneven density with drum banding, pinholes), rubber stamp with pressure fade and ghost strike, roughened halftone, punched perforation, glossy vinyl sticker with a die-cut edge.
- Built once in `riso.js` / `riso.css`; `C-riso.html` (Jeu) now uses the shared layer too, so all four pages carry the same matter.

### Changelog

- 2026-11-18 · V2.2 · print matter on all Riso pages; STYLE.md §3 rewritten.

---

## V2.1 — 2026-11-18 · Style validated: Riso — remaining pages

**Status**: style **validated** by Gaia (« oui pour celle en bleu rose blanc » = direction C Riso). Remaining pages in review. Not locked (`/lock` once every page is validated).

- `STYLE.md` written: two inks + paper, print effects, one type family/weight, grid, components, states, motion, don'ts.
- Shared implementation extracted: `planches/v2/riso.css` (components), `riso.js` (paper/ink filters, real halftone).
- New boards, desktop only, strict continuity with `C-riso.html`:
  - `01-post.html` — the poster in the feed, fresh vs already run (keeps your stamp, countdown to next heat).
  - `03-carte-de-fin.html` — official result ticket: time, stamp, streak tiles, today's field, pre-written comment line, sticker **COMMENT**.
  - `04-series-classement.html` — today's field as a halftone histogram around the finish line, closest five + you, 14-day streak row.
- Feed frame now shows the next (ghost) post under ours, for feed context.
- Decision proposed, not taken: merge « Post » fresh with « Jeu » ready (same screen in Devvit).

### Changelog

- 2026-11-18 · V2.1 · Riso validated; STYLE.md; pages Post, Carte de fin, Séries & classement.

---

## V2 — 2026-11-18 · Style exploration redone, desktop only

**Status**: superseded by V2.1 — C Riso chosen.

**Why V2**: Gaia's review of V1 — « slop IA : la matière, les couleurs, les motifs n'ont pas été travaillés, pas d'identité visuelle ». And: show a phone only if the hackathon requires it. The hackathon criteria (`CRITERES.md`) do not require mobile, so V2 is **desktop only** (Reddit desktop feed, 1440 × 900, post 740 × 512). This overrides §6 of `PROMPT-DESIGN.md`.

**What changed in the method**: references are now game sites (see `REFS.md`), and each direction starts from a *world* with a real material, then the UI is placed in it.

### Planches delivered (`planches/v2/`)

| File | World | Matter & colour | Type | How the gap is shown |
|------|-------|-----------------|------|----------------------|
| `A-crepuscule.html` | One sunset a day; the target second is when the sun touches the sea. Night falls while you count. | Posterised dusk ramp `#2b2350 → #f2a57e`, sun `#ffe7bd`, grain. | Noto Serif Display Italic + Ubuntu Sans condensed caps | The sun comes back where your second put it: still hanging (early) or half-sunk (late). |
| `B-laiton.html` | A decimal stopwatch with its hands removed, on green felt, with a paper tag. The crown is the button. | Felt `#1f3a2e`, brass `#d9b25a/#8e6a22`, enamel `#f6efdc`, tag paper, lacquer red `#b8322a`. | C059 + Nimbus Mono (typewriter) | A single red hand swings in to your second against the red rim mark; the tag is stamped. |
| `C-riso.html` | A two-ink race-day poster printed every day. | Paper `#f1ece0`, fluo pink `#ff48b0`, blue `#0078bf`, overprint, real halftone, misregistration. | Ubuntu Sans width 75, weight 900 only | Pink mark vs blue finish line on the lanes; your time stamped in pink. |

Fonts are free licences (OFL, URW with font exception, Ubuntu Font Licence), subset to Latin and embedded as base64 (`font-*.css`): boards open offline. Shared `board.css`/`board.js` = neutral desktop feed chrome + state engine (not part of the style).

### Changelog

- 2026-11-18 · V2 · v1 rejected; game refs added to `REFS.md`; 3 new desktop-only boards in `planches/v2/`.

---

## V1 — 2026-11-18 (rejected — see V2) · Style exploration on the main page « Jeu »

**Status**: waiting for validation (step B). Nothing is locked.

Inputs: `IDEE.md`, `CRITERES.md`, `PROMPT-DESIGN.md`. References opened and decoded in `REFS.md`. Pages proposed in `PAGES.md`.

### Planches delivered (`planches/v1/`)

Each board shows the game inside a neutral feed frame, desktop 1440 × 900 and mobile 390 × 844 side by side, with clickable states (Ready / Measuring / Result). It is also playable: the time is really measured. Below the frames, the three states sit side by side on mobile.

| File | Direction | Palette | Type | Motif | Gesture |
|------|-----------|---------|------|-------|---------|
| `01-cadran.html` | **Cadran** — the starting direction, pushed to the end | `#f4f4f2` / `#111214` / grey `#8b8c8f` / accent `#e4572e` | tight neo-grotesk, −6.5 % tracking, tabular | one hairline dial, one orange tick, black pill on soft white relief | tap Start / tap Stop |
| `02-chambre-noire.html` | **Chambre noire** — the deviation | `#0e0f11` / `#ebe7de` / grey `#6f6d68` / accent `#ffb238` | condensed bold + wide-tracked caps | one horizon line, the result "develops" on it | press and hold, let go |
| `03-instrument.html` | **Instrument** — a measurement sheet | `#ebe6da` / `#1d2230` / grey `#7a776f` / accent `#2b44d6` | monospace only | printed ruler 0–10 s that never moves, logged rows | tap Start / tap Stop |

Shared: `board.css` (board chrome and neutral feed frames, not part of the style) and `board.js` (mounting and state engine, demo data).

### Decisions

- **No visible clock while measuring**, in all three: the number disappears and nothing moves at a regular rhythm (no pulse, no hand), so nothing can be counted.
- **One filled control per screen**, which is the only gesture (taken from Flow Computing).
- **One giant element** — the number of seconds — and controlled emptiness around it (taken from Dominic Burt).
- System font stacks only: no network, no licensed font.
- Demo data: measurement 041, Wed 18 Nov, target 7.30 s, result 7.12 s, 3,214 measured today, median 6.84 s. "Closer than X %" is computed from a modelled distribution (demo only).

### Open questions (see `PAGES.md`)

1. Tap/tap or press-and-hold?
2. Target range of the daily seed.
3. Merge pages « Post » and « Jeu »?

### Changelog

- 2026-11-18 · V1 · `PAGES.md`, `REFS.md`, 3 boards for the main page.
