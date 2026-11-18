# Chronomètre

**Stop the clock — without a clock.** A daily time-perception game for Reddit, built on [Devvit Web](https://developers.reddit.com/).

Every day a new race poster comes off the press with one target, say **7.30 seconds**. Press **GO**: the poster goes blank — no clock, no ticking, nothing moves. Count in your head and press **STOP** when you feel the second. Your time is stamped on the poster, your pink mark lands before or after the blue finish line, and you see how close you came compared with everyone else who ran today's heat.

One heat a day, the same target for everyone, one try each.

## How to play

1. Open today's heat post and press **GO**.
2. Count silently. The screen shows nothing that could help you.
3. Press **STOP** (or the space bar on desktop) on the target second.
4. Read your result card: your time, how early or late you were, your streak, and the share of today's runners you beat.
5. Press **COMMENT** to post your line in the thread in one tap — `7.12 on heat Nº041 — 0.18 s early.` — then open **STANDINGS** to see where the whole field stopped.

Come back tomorrow: a new target, and your streak keeps counting.

## What's in the post

| Screen | What it shows |
|--------|---------------|
| **Post** (in the feed) | Today's heat poster. Once you've run it, the poster keeps your stamp and counts down to the next heat. |
| **Heat** | Ready → blank paper while you count → your stamped result. |
| **Result card** | Official time, gap, streak, share of the field you beat, pre-written comment line. |
| **Standings** | Today's field as a halftone histogram around the finish line, the five closest runners, your rank, your last 14 days. |

## Under the hood

- **Daily content**: the target is derived from the UTC date (FNV-1a + mulberry32), between 3.00 and 12.00 s, identical for every player. A scheduled job posts a new heat every day at 00:00 UTC; moderators can also post it from the subreddit menu. Posts from past days stay readable (results only).
- **Server** (Hono on Devvit): `/api/init`, `/api/submit`, `/api/standings`, `/api/comment`. One run per user per heat, validated (0.3–60 s). Redis sorted sets rank runners by distance to the target; a hash builds the histogram; streaks and the last 14 days are stored per user.
- **Client** (React 19 + Vite): a two-ink risograph look — paper, uneven ink, real halftone, misregistration — drawn entirely with SVG filters and CSS. No images, no network requests outside the app's own API. The only font (Ubuntu Sans, subset) is bundled; see `src/client/assets/UBUNTU-FONT-LICENCE.txt`.
- **Comments** are posted from the player's own account (`runAs: 'USER'`), only when they press COMMENT.

## Development

Requires Node 24 (`.nvmrc`).

```bash
npm install
npm run dev          # devvit playtest
npm run test:unit    # daily seed, ranking maths
npm run test:types && npm run lint && npm run build
```

## Licence

Code: BSD-3-Clause (see `LICENSE`). Font: Ubuntu Font Licence 1.0.
