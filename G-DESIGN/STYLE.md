# STYLE — Chronomètre · Riso

> **LOCKED 2026-11-18** (`/lock` by Gaia). Validated by Gaia on 2026-11-18 (direction C of V2, matter V2.3). Any change now goes through `/delta` or `HANDOFF.md`, never at implementation.
> Reference board: `planches/v2/C-riso.html` (page « Jeu »).
> Shared implementation for the boards: `planches/v2/riso.css` + `riso.js` + `font-riso.css`.

## 1. Idea

Every day a new **race-day poster** comes off a two-ink risograph. The post is that poster. The daily target is the finish line; your result is stamped on it. While you count, the poster goes back to blank paper: there is no clock.

## 2. Inks and paper (the only colours)

| Token | Hex | Use |
|-------|-----|-----|
| `--paper` | `#f1ece0` | background, always, with a paper-fibre noise at 35 % multiply |
| `--blue` | `#0078bf` | Riso Blue — structure: headings, rules, lanes, finish line, the main sticker |
| `--pink` | `#ff48b0` | Riso Fluorescent Pink — *you*: your mark, your stamp, highlights, the halftone disc |
| overprint | ≈ `#7a3f98` | never picked: it only appears where blue and pink overlap (`mix-blend-mode: multiply`) |

Rules:
- Two inks, no third colour, no grey: a lighter value = halftone or tint of an ink, never a new hex.
- Every inked element uses `mix-blend-mode: multiply` so overlaps print violet.
- Pink means "you / your result"; blue means "the race / the rules". Never swap.

## 3. Matter — paper and ink, never flat (v2.2)

Nothing on the poster is a flat vector colour. Implementation: `riso.js` (SVG filters, paper stack) + `riso.css` (« Print matter » section).

**Paper** (stack under the ink, then light and fold over it):

| Layer | Spec |
|-------|------|
| Mottling | low-frequency fractal noise (.007, 4 octaves), warm brown, multiply (stronger in v2.3) — the paper is never one tone |
| Fibres | two thin thresholded turbulence layers, horizontal and vertical, warm grey, multiply 40–50 % |
| Inclusions | sparse dark flecks (thresholded noise .55), multiply 75 % |
| Tooth | fine grain (1.2) in soft-light 55 % **over** the ink |
| Light | warm vignette, multiply 16 % at the edges |
| Fold | one vertical fold at 51.6 %: shadow line + white crease highlight; the ink is worn on the crease |

**Ink** — **every** printed element is filtered; nothing is a flat vector colour. One recipe, five strengths: ragged edges (displacement) × drum banding (horizontal) × mottling × riso grain (fine speckle inside solids). Density stays high on average; the texture lives *inside* the ink.

| Filter | Edges | Banding / mottle | Grain | Used on |
|--------|-------|------------------|-------|---------|
| `rs-ink` | 3 | 1.7 / 1.9 | 4.2 | poster numbers, stats, finish line, your mark |
| `rs-ink-mid` | 1.8 | 1.4 / 1.5 | 3.2 | masthead + rule, leads, lanes, lists + rules, quote, histogram, tally |
| `rs-ink-lite` | 1.1 | 1.1 / 1.1 | 2.4 | labels, small print, stub text, axis, streak row |
| `rs-dots` | 3.6 (slow) | 1.4 / 1.6 | 2.6 | halftone disc, halftone bars and tiles: irregular dots, ink gain |
| `rs-stamp` | 4 | 2.2 / 2.8 | 5 | stamps (+ pressure fade + ghost strike) |

**Paper relief** (over the ink, so the ink sits in the paper): `rs-relief` = grazing light (azimuth 235°, elevation 50°) on the paper tooth, soft-light 85 %; `rs-cockle` = slow waves of the sheet, soft-light 85 %.

**Print artefacts**

| Effect | Spec |
|--------|------|
| Misregistration | pink layer `translate(6–7px, 4–5px) rotate(.35deg)` from blue on the big number; lanes offset `(-6, 4)` from the pink disc |
| Halftone | real dot-size halftone, 8 px grid, rotated 15°, dot radius 0.5 → 4.4 px, dots roughened by `rs-ink` |
| Perforation | punched holes every 11 px (dark hole + light rim) and a small crease, instead of a drawn line |
| Sticker | printed vinyl: radial ink shading, diagonal gloss, grain overlay, 5 px die-cut paper ring, lifted shadow; sits **above** the fold |
| Printer's marks | crop marks + misregistered crosshair, only in the blank-paper state |

## 4. Type — one family, one weight

Ubuntu Sans (Ubuntu Font Licence), **width 75 %, weight 900 only**, embedded and subset (`font-riso.css`). Tabular lining figures.

| Role | Size / tracking | Ink |
|------|-----------------|-----|
| Poster number | 226 px (Jeu), 150–170 px elsewhere, line-height .84, −0.035 em | blue + pink offset |
| Masthead `CHRONOMÈTRE` | 34 px, +0.01 em | blue |
| Lead line (`STOP THE CLOCK AT`) | 18 px, +0.14 em, caps | pink |
| Stat number | 44–64 px, −0.02 em | pink or blue per §2 |
| Label / stub | 12.5–14 px, +0.14 to +0.16 em, caps | blue (pink for *you*) |
| Small print | 11 px, +0.12 em, caps | blue |

Everything is set in caps except user names (`u/…`) and the comment quote.

## 5. Grid (desktop post 740 × 512)

- Margins 30 px left/right.
- **Masthead band**: top 22 px, height ≈ 46 px, closed by a 2 px blue rule.
- **Body**: from y 92 to the stub. Two columns when needed: left 30–400 (the number), right 420–710 (disc, stats, lists).
- **Stub**: bottom band 58 px (80 px on Séries), opened by the perforation.
- **Sticker**: bottom-right, 30 px from the edges, overlaps the perforation on purpose.

## 6. Components

`masthead` · `lead` · `poster number` (blue + pink offset) · `stamp` · `sticker button` (the only action, one per screen) · `halftone disc` · `lanes` (3 rings, numbered) · `finish line` (blue) · `your mark` (pink) · `stub` (perforated ticket) · `stat block` (label + number) · `halftone bar` (histogram) · `tally` (streak days) · `printer's marks`.

## 7. States

| State | Rule |
|-------|------|
| Ready | full poster; sticker blue `GO` |
| Measuring | masthead, body and stub fade to 0 in 400 ms; only printer's marks and `COUNT IN YOUR HEAD`; sticker pink `STOP`. Nothing moves at a regular rhythm |
| Result | number swaps to your time, pink mark appears on the lanes, stamp; sticker `CARD` |
| Already played (feed) | the poster keeps your stamp and your mark, stub shows `NEXT HEAT IN hh:mm:ss`; sticker `CARD` |

## 8. Motion

- Sticker press: scale .95, 120 ms.
- Stamp: slams in (scale 1.3 → 1, rotate −9° → −5°, 180 ms, ease-out), no bounce.
- Blank paper: 400 ms fade; no other animation while measuring.
- No parallax, no looping animation.

## 9. Don'ts

A third colour, decorative gradients (only paper light/fold and sticker gloss), drop shadows other than the sticker's, any flat untextured ink, grey text, emoji, rounded cards, more than one sticker per screen, any moving element during the measurement.
