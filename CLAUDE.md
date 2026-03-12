# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview production build locally
```

No test or lint commands are configured.

## Architecture

This is an **Astro + React + Three.js infinite canvas** that renders a procedurally generated 3D gallery of artwork images with text overlays.

### Entry point flow

1. **`src/pages/index.astro`** — Mounts `<App client:only='react' />`
2. **`src/components/InfiniteCanvas/app/index.tsx`** — Preloads fonts (Troika), fetches `/artworks/manifest.json`, renders `<Frame>`, `<PageLoader>`, and `<InfiniteCanvas>`
3. **`src/components/InfiniteCanvas/infinite-canvas/scene.tsx`** — Core 3D scene (`InfiniteCanvasScene`) using React Three Fiber; handles camera, input, and rendering

### Key subsystems

**Infinite canvas rendering** (`infinite-canvas/`)
- Chunk-based procedural generation: artwork planes are laid out in chunks using seeded random placement (`generateChunkPlanesCached` with `hashString`-based seeds)
- `scene.tsx` → `SceneController` runs per-frame logic: camera movement, chunk visibility, texture loading callbacks
- Constants in `constants.ts` control chunk size, render distance, fade thresholds, camera speed, etc.
- `texture-manager.ts` — centralized texture cache with load-progress callbacks
- `utils.ts` (canvas-level) — chunk generation and throttle helpers
- `types.ts` — shared types: `MediaItem`, `PlaneData`, `ChunkData`, `InfiniteCanvasProps`

**Input handling** (inside `SceneController`)
- Mouse: drag to pan, scroll to zoom
- Keyboard: WASD for X/Y movement, Q/E for vertical, scroll/space for zoom
- Touch: single-finger drag, two-finger pinch zoom
- Touch devices use reduced DPR for performance

**Text rendering**
- Uses `troika-three-text` via `@react-three/drei`'s `<Text>` component
- Fonts preloaded from `/public/fonts/` (TeX Gyre Heros bold & regular) before scene mounts
- Type definitions for troika in `src/types/troika-three-text.d.ts`

**Artwork data**
- `public/artworks/` — 215 image files
- `public/artworks/manifest.json` — fetched at runtime; provides `MediaItem` list with metadata (artist name, year, title used as text overlays)

**UI overlays** (`frame/`, `loader/`)
- `<Frame>` — decorative borders and title
- `<PageLoader>` — progress bar that fades once textures load (uses `useProgress` from Drei)

### Utility files

- `src/components/InfiniteCanvas/utils.ts` — `clamp`, `lerp`, `seededRandom`, `hashString`
- `src/components/InfiniteCanvas/use-is-touch-device.ts` — touch detection hook
