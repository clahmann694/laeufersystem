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
- `targetOf()` returns where a player runs once the ball is served: the setter always to
  the net right of centre (that *is* the Läufersystem), outsides attack from zone 4,
  middles from zone 3, the opposite from zone 2; back-row players go to defensive spots.
  These target points are a first approximation – the user is the volleyball expert,
  ask her before "correcting" them.

## Not built yet

Overlap faults (Stellungsfehler), 4-2 and 6-2 systems, libero, reception formation
separate from attack positions, explanatory text per rotation. See README.
