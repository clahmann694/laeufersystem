# CLAUDE.md

Guidance for AI coding agents working in this repository.
The user speaks German; UI strings are German, code and commits are English.

## Project

**Läufersystem lernen** – a website that teaches the volleyball rotation ("Läufersystem")
visually: where does each player stand at serve, and where do they run afterwards.
Built by the same user as `~/Volleyball DJ V2`; same stack on purpose.

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npm run type-check   # tsc --noEmit (strict, noUnusedLocals)
npm run build        # tsc + vite build
```

## Stack

React 19 + TypeScript (strict), Vite 7, Tailwind CSS 3.4. The court is inline SVG –
no charting or animation library. `vite.config.ts` reads `VITE_BASE_PATH` so the site
can be published under a GitHub Pages sub-path.

## Domain model (`src/data/volleyball.ts`)

Zones on the own half, net at the top:

```
        Netz
   4  |  3  |  2      front (attack zone, up to the 3 m line)
   ---+-----+---
   5  |  6  |  1      back        zone 1 serves
```

- **Rotation is clockwise**: `1 → 6 → 5 → 4 → 3 → 2 → 1` (`ROTATION_CYCLE`). One step per
  won serve. `zoneOf(player, rotation)` derives every position from `startZone`.
- **5-1 system** (one setter): setter and opposite are always three rotations apart, so
  exactly one of them is front row. The default `TEAM` encodes that – don't break the
  pairing when editing it.
- `isFrontRow()` = zones 2, 3, 4. Only they may attack above the net.
- **Libero** (`LIBERO`, not part of `TEAM`) is on court from the start for the back-row middle
  (`benchedMiddle()`); the replaced middle waits on the bench in the Wechselzone.
- **Läufer I–VI** (`laeuferOf()`): named after the setter's zone, as in the club's
  training diagrams (rotation 1 = Läufer I, rotation 2 = Läufer VI, … rotation 6 = Läufer II).
- **Phases** (`PHASES`, `lineup(rotation, phase)`): `grund` → `annahme` → `erklaerung`.
  The user explicitly removed a "Z ans Netz"/after-serve phase – don't reintroduce it
  unasked. `content.reception` holds the hand-placed reception formation per rotation, legal at
  serve contact (overlap rule); `erklaerung` shows the same positions plus `content.constraints`:
  the overlap pairs (`left` = vertical line, `front` = horizontal line, orange like the
  club diagrams) with one sentence each in the sidebar. All six formations and their
  lines come from the club PDF "5-1 Läufersystem" (Formation K1, lower half) – the user
  is the volleyball expert, ask her before "correcting" coordinates.

## Editable content

Everything the user may want to change lives in `src/data/content.json` (typed by
`src/data/content.ts`): texts, the eight rule cards, phase texts, role tasks, `reception`
positions and `constraints` lines. `ContentProvider` (`src/content/`) serves it, keeps a
draft in localStorage and, with `?edit=1`, turns `Editable` texts into contentEditable,
makes court figures draggable and shows a line editor + export bar. Code holds only what
is structural (`TEAM`, colours, zone centres, sketches). New text → add it to the JSON
and render it through `Editable`, don't hardcode it.

## UI

Structure: one chapter per view, hash-routed (`src/router.ts`: `#/`, `#/grundlagen`,
`#/trainer`, `#/regeln`; query params like `?r=3&p=annahme&edit=1` go *before* the hash).
`App.tsx` renders `SiteNav` (sticky, chapter tabs) + Home (three chapter tiles, no
scrolling) | `Basics` (eight rules as a stepper with inline-SVG sketches, then a role
legend) | `Trainer` | Rules, each followed by `ChapterNav`. The user explicitly chose
"one chapter per view" over one long scroll page because of phone usability – don't merge
the chapters back into one page. Keep rule wording consistent with FIVB 7.4/7.5 (only
the receiving team since 2025). Mobile matters: check narrow widths after layout changes.

Layout follows a "Sideout Lab"-style mock, colours are the club's: dark navy page,
VSG cyan (`vsg-500` = crest blue #009fe3) as the only accent, hall-blue court, white
info card, big tight headlines (`.headline`, `.eyebrow` in `index.css`). Role colours
(Z pink, A orange, M teal, D purple, L yellow) are deliberately off-brand so figures
stand out on the blue court. The
Wechselzone is drawn inside the court SVG so figures can glide in and out with the
same CSS transition. Mascots and club crest live in `public/`; reference them through
`import.meta.env.BASE_URL` so GitHub Pages sub-paths work. `?r=<1-6>&p=<phase>` sets
the initial state.

## Not built yet

Movement after the serve (setter to the net, attack approaches), defence formation,
overlap faults (Stellungsfehler), 4-2 and 6-2 systems, explanatory text per rotation.
See README.
