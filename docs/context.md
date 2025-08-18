# AuxeOS UI Architecture & Interaction Guide

This document explains how the user experience is composed across three layers:
- Initial terminal-style preloader
- The 3D interface (Three.js scene + overlays)
- The interactive computer screen (embedded site on a CSS3D plane)

It also covers mouse/keyboard interactions, the event bus, and extension points.

## Layers at a glance

- **3D Scene (WebGL)**: Core environment, models, and visual effects.
  - Implemented via `three` in `src/Application/` with render/update loops.
- **CSS3D Layer**: DOM elements (notably the monitor `iframe`) projected in 3D.
  - See `CSS3DRenderer` usage in `src/Application/Renderer.ts`.
- **UI Layer (React)**: Loading screen, overlays, toggles.
  - Mounted in `#ui` and `#ui-interactive`. See `src/Application/UI/`.

---

## 1) Startup terminal-style preloader

File: `src/Application/UI/components/LoadingScreen.tsx`

Purpose: Gate the experience until assets are loaded and the user clicks START.

- Shows a BIOS-like boot sequence with resource loading logs and progress.
- Smooth progress text via `requestAnimationFrame` interpolation.
- Detects WebGL availability; shows a blocking error UI if unavailable.
- On Start:
  - Fades out the overlay and dispatches `loadingScreenDone` via the UI event bus.
  - Disables pointer events on `#ui` to let 3D interactions pass through.

Downstream effects of `loadingScreenDone`:
- Camera transitions from `loading` to `idle` keyframe (`src/Application/Camera/Camera.ts`).
- Audio initializes/resumes audio context and begins ambience (`src/Application/Audio/AudioManager.ts`, `AudioSources.ts`).
- Time clock resets its start time for consistent animations (`src/Application/Utils/Time.ts`).

Developer tips:
- Toggle debug panel via `?debug` query param (FPS `stats.js`).
- For local embedded site dev, use `?dev` to load `http://localhost:3000/` into the monitor iframe (see below).

---

## 2) The 3D interface

Entry point: `src/script.ts` -> `src/Application/Application.ts`

Key components:
- Scenes: `scene` (WebGL), `cssScene` (CSS3D), `overlayScene` (noise overlay)
- Renderer: `src/Application/Renderer.ts`
  - WebGLRenderer for 3D
  - CSS3DRenderer for DOM-in-3D
  - A WebGL overlay with a scanline/noise shader (`src/Application/Shaders/screen/*`)
- Camera system: `src/Application/Camera/Camera.ts`
  - Predefined keyframes in `CameraKeyframes.ts`: `loading`, `idle`, `desk`, `monitor`, `orbitControlsStart`
  - Smooth transitions (TWEEN/Bezier easing), and optional free-cam (OrbitControls)
- World composition: `src/Application/World/World.ts`
  - Loads resources, instantiates `Environment`, `Decor`, `Computer`, `MonitorScreen`, `CoffeeSteam`, and `AudioManager` once assets are ready

UI Overlays (React):
- `InterfaceUI.tsx` mounts an Info overlay with time, Mute and Free Cam toggles.
- `HelpPrompt.tsx` shows “Click anywhere to begin” with typing animation for initial guidance.

Free Cam:
- Toggled via the camera icon (`FreeCamToggle.tsx`).
- Enables OrbitControls and sets `#webgl` pointer-events to `auto` while active.

---

## 3) Interactive computer screen (CSS3D iframe)

File: `src/Application/World/MonitorScreen.ts`

What it is:
- A `CSS3DObject` that holds a DOM `div` containing an `iframe`, positioned/rotated to match the 3D monitor.
- A hidden WebGL plane precisely overlaps the CSS3D plane to handle occlusion properly (using `NoBlending`).

What it loads:
- By default: `https://auxe.framer.website/?editSite`
- Dev mode (`?dev`): `http://localhost:3000/`

Depth layering and look:
- Additional transparent planes with textures (smudges, shadow) and looping video static (`video-1`, `video-2`) are stacked in Z to simulate glass depth and reflections.
- A “perspective dimmer” plane adjusts opacity based on camera angle and distance for realism.

Mouse/keyboard bridging from iframe to scene:
- The iframe listens for `window.postMessage` and re-dispatches synthetic DOM events (`mousemove`, `keydown`, `keyup`) on itself.
- Each bridged event is annotated with `inComputer = true` and scaled to the iframe’s current screen rect.
- `document` listeners in `MonitorScreen` update the shared `Mouse` state and trigger camera transitions:
  - On entering the screen area: emit `enterMonitor` → camera moves to `monitor` keyframe.
  - On leaving (and on mouseup if a click started inside): emit `leftMonitor` → camera returns to `desk`.

---

## View modes (View1 vs View2)

Use these terms when referring to the two primary camera states during interaction:

- **View1 (Desk/World view)**
  - Camera state: Desk keyframe (wide shot of the desk and environment). The Idle keyframe can also be active when not interacting.
  - How you get here:
    - Default state after loading when not focused on the monitor.
    - Emitted `leftMonitor` event (e.g., mouse leaves the monitor container and a click is not in progress), or a global click toggling back from other keyframes.
  - UI behavior: Standard overlay is active; monitor-specific controls are hidden.

- **View2 (Monitor-focused view)**
  - Camera state: Monitor keyframe (close-up of the CRT screen).
  - How you get here:
    - Moving the cursor into the monitor container (the CSS3D element that wraps the `iframe`) emits `enterMonitor`.
  - Input and focus rules:
    - The entire monitor container, including the inline control bar (`#screen-controls`), is treated as "in-computer." Hovering or clicking these controls keeps focus in View2 and does not cause a zoom-out.
    - Leaving the container while a click started inside will only exit after mouseup outside (prevents accidental exits while dragging).
  - UI behavior:
    - A small inline control bar shows three circular buttons centered near the bottom of the monitor: `A`, `Y`, `B`.
    - These buttons dispatch a `setScreenURL` event that updates the embedded screen URL without re-creating the CSS3D object.
    - Current mappings:
      - `A` → `https://auxe.framer.website/?editSite`
      - `Y` → `https://www.youtube-nocookie.com/embed/<videoId>?autoplay=1&mute=1&controls=1&playsinline=1` (homepage is frame-blocked, so an embeddable endpoint is used)
      - `B` → Fallback page that opens `https://www.bing.com/` in a new tab (Bing blocks being framed)

Notes:
- Some third-party sites block framing via CSP/X-Frame-Options; use embed endpoints or local fallbacks as above.
- Free Cam is a separate mode. When enabled, pointer events on `#webgl` are turned on and OrbitControls are active; View1/View2 rules apply when Free Cam is disabled.

---

## Input model: mouse and keyboard

Mouse tracking:
- `src/Application/Utils/Mouse.ts` maintains `x`, `y`, and `inComputer` and updates via custom events triggered from `MonitorScreen`’s document handlers.

Click behavior (outside the monitor):
- In `Camera.ts`, a global `mousedown` toggles between `idle` and `desk` when not interacting with the monitor UI.

Keyboard/SFX typing:
- UI components (HelpPrompt, InfoOverlay, FreeCamToggle) emit artificial keydown posts (`_AUTO_`) to produce consistent typing sounds.
- `AudioSources.ts` listens to key events; when `event.key` contains `_AUTO_`, a low-volume typing SFX is played.

---

## Event bus (UI layer)

Location: `src/Application/UI/EventBus.ts`

Pattern:
- Thin wrapper over `document` custom events.
- Used broadly for cross-layer communication without tight coupling.

Notable events:
- `loadingScreenDone` — start the experience (camera, audio, timers reset)
- `enterMonitor` / `leftMonitor` — camera focus/defocus monitor
- `muteToggle` — master volume 0/1 on the AudioListener
- `freeCamToggle` — switches between keyframed camera and OrbitControls

---

## Audio behavior

Files: `src/Application/Audio/AudioManager.ts`, `AudioSources.ts`

- Global `AudioListener` attached to the camera.
- SFX for mouse down/up and keyboard typing when cursor is in the monitor.
- Ambience loop (`office`) with a low-pass filter whose cutoff and volume track camera distance (farther = quieter, brighter).
- Master mute controlled by UI (`MuteToggle.tsx`).

---

## Extending and customizing

Add clickable hotspots in 3D:
- See the `Hitboxes` scaffold in `src/Application/World/Hitboxes.ts` for an approach (raycasting). You can re-enable or adapt it for scene interactions beyond the monitor.

Change embedded content:
- Edit the default iframe URL or enable `?dev` for local development in `createIframe()` within `MonitorScreen.ts`.

Adjust camera routes:
- Modify keyframes in `src/Application/Camera/CameraKeyframes.ts` and transition timings/easings in `Camera.ts`.

Style/UI updates:
- React components live in `src/Application/UI/components/` and share styles in `src/Application/UI/style.css` and `src/style.css` (Tailwind utilities included).

---

## Debug & development tips

- Add `?debug` to see the FPS panel and debug UI.
- `webpack dev` serves assets with hot file watching; see `bundler/webpack.dev.js`.
- Tailwind CSS v4 is configured via `tailwind.config.js` and PostCSS in `postcss.config.js`.

