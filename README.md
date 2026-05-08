# Industrial Motion Graphics — Remotion Project

A premium dark-navy industrial-tech motion graphics scene built with
Remotion + React. The flagship composition is **`BlackBoxScene`** (9 s,
1920×1080, 30 fps) visualizing the "black box" of overseas mold trials.

---

## Quick start in VS Code

```bash
# 1. Install dependencies (one-time)
npm install

# 2. Open the Remotion Studio (live preview, scrubbable timeline)
npm start
# → opens http://localhost:3000 — pick "BlackBoxScene"

# 3. Render to MP4
npx remotion render BlackBoxScene out/blackbox.mp4

# 4. Render to MOV with alpha (post-production / CapCut / AE)
npx remotion render BlackBoxScene out/blackbox.mov \
  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le
```

Recommended VS Code extensions: **ESLint**, **Prettier**, **Tailwind CSS
IntelliSense** (optional), **Remotion Preview** (optional).

---

## Project structure

```
.
├── package.json              # deps + scripts
├── remotion.config.ts        # Remotion CLI config
├── tsconfig.json
├── public/
│   └── assets/               # static assets (referenced via staticFile())
│       ├── photos/           # factory floor JPG/PNG
│       ├── logos/            # brand SVG
│       ├── overlays/         # grain / scanline PNG
│       ├── audio/            # MP3 / WAV stems
│       └── svg/              # standalone SVG (e.g. factory-placeholder.svg)
└── src/
    ├── index.ts              # registerRoot()
    ├── Root.tsx              # all <Composition> definitions
    ├── BlackBoxScene/        # primary scene (this project)
    │   ├── BlackBoxScene.tsx # composition root
    │   ├── timing.ts         # BEATS map (single source of truth)
    │   ├── theme.ts          # colors, fonts, easing
    │   ├── components/       # Background, WorldMap, Timeline, etc.
    │   └── icons/SvgIcons.tsx
    ├── MapAnimation.tsx      # legacy scene
    └── TravelRouteAnimation.tsx
```

---

## Compositions registered

| ID | Component | Duration |
|---|---|---|
| `BlackBoxScene` | `BlackBoxScene` | 9 s @ 30fps |
| `MapAnimation` | `MapAnimation` | ~6.7 s |
| `TravelRouteAnimation` | `TravelRouteAnimation` | varies |

---

## Editing the scene

All timing lives in `src/BlackBoxScene/timing.ts` — change a beat there
and the whole composition re-times.

All colors / typography live in `src/BlackBoxScene/theme.ts`.

The font is **Inter**, loaded via `@remotion/google-fonts/Inter` in
`BlackBoxScene.tsx`. No external font files are required.

To replace the blurred SVG factory photo placeholders with real photos:

```tsx
// src/BlackBoxScene/components/FactoryPanels.tsx
import {staticFile, Img} from 'remotion';
<Img
  src={staticFile('assets/photos/floor-01.jpg')}
  style={{width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'blur(6px) saturate(0.85)'}}
/>
```

---

## Animation timing map (seconds)

| Beat | Range | What |
|---|---|---|
| `mapFadeIn` | 0.0–1.4 | World map + grid emerges |
| `routeDraw` | 0.6–2.0 | Korea → Mexico arc draws |
| `factoryPanels` | 2.0–4.0 | Blurry factory photos |
| `emailPanels` | 2.4–4.0 | Delayed email cards |
| `loadingDots` | 2.6–4.0 | Packet stream |
| `timeline` | 4.0–6.0 | Day 01 / 03 / 07 reveal |
| `progressStall` | 4.4–6.0 | Bar stalls at ~62 % |
| `questionMarks` | 5.0–6.0 | `?` glyphs over Day 07 |
| `silhouette` | 6.0–8.0 | Customer in front of monitor |
| `monitorFlicker` | 6.2–8.0 | Screen flicker / glitch |
| `dimOut` | 7.8–8.4 | Black plate fades to 72 % |
| `closingLine` | 8.0–9.0 | Tagline + accent underline |

---

## Render presets

```bash
# Web reference
npx remotion render BlackBoxScene out/web.mp4 --codec=h264 --crf=18

# CapCut / AE alpha
npx remotion render BlackBoxScene out/alpha.mov \
  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le

# Single hero frame (PNG, e.g. for thumbnails)
npx remotion still BlackBoxScene out/still.png --frame=240
```

---

## Troubleshooting

- **Blank preview**: ensure `npm install` finished without errors and
  Node ≥ 18.
- **Type errors in editor**: open the workspace at the project root so
  VS Code picks up `tsconfig.json`.
- **Missing photos / audio**: those folders are intentionally empty.
  Drop your own assets in `public/assets/<subfolder>/`.
