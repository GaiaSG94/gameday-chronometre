# PAGES — Chronomètre

> Pages derived from `IDEE.md` (daily loop: one measurement, end card with result + streak + comment prompt; community scores).
> Status: `to draw` / `in review` / `validated`. **All pages validated — style LOCKED 2026-11-18.**
> Devvit mapping: « Post » = `splash.html` (inline in the feed); « Jeu », « Carte de fin », « Séries & classement » = `game.html` (expanded view).

| # | Page | Role | Key content | Status |
|---|------|------|-------------|--------|
| 1 | **Post** | How the game sits in the feed before anyone touches it: it must say "today's target" in 1 second. | Post header (community, age, title "Measurement N°"), game area at rest: date, today's target in seconds, the single Start action, how many have measured today. | **validated** — `planches/v2/01-post.html` |
| 2 | **Jeu** (main page) | The measurement itself. One rule readable in 5 s: *start, wait without a clock, stop on the target second.* | 3 states: **Ready** (target + Start), **Measuring** (nothing visible except Stop — the void is the clock), **Released** (your time, the gap to target, where you land in today's community). | **validated** (Riso) — `planches/v2/C-riso.html` |
| 3 | **Carte de fin** | The shareable end of the daily loop. | Your time vs target, gap, streak (days in a row), today's community median and your rank, one-tap "comment your time" prompt, "next measurement in hh:mm". | **validated** — `planches/v2/03-carte-de-fin.html` |
| 4 | **Séries & classement** | Why you come back tomorrow. | Your streak and history of past gaps, today's community distribution (how far people landed), closest measurers of the day. | **validated** — `planches/v2/04-series-classement.html` |

## Open questions (product decisions not in `IDEE.md`)

1. ~~Gesture~~ **Decided**: one press to start, one to stop (all three v2 directions; in B the press is on the watch crown). The v1 "press-and-hold" variant is dropped unless you want it back.
2. **Target range**: I used 7.30 s for the demo. Should the daily seed vary the target (e.g. 3–15 s, two decimals), or always a whole second?
3. ~~Pages 1 and 2 merge?~~ **Settled by Devvit**: the inline post (`splash.html`, must stay light) and the expanded game (`game.html`) are two entry points, so « Post » and « Jeu » stay two pages.
