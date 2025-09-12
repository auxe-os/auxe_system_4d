# copilot-instructions — auxeOS portfolio

Purpose: give an AI coding assistant the minimal, high-value knowledge to be productive in this repository.

High-level architecture
- Three coordinated layers:
  1. WebGL 3D scene (Three.js) — `src/Application/` (scene setup, models, Camera, Renderer)
  2. CSS3D "monitor" layer — `src/Application/World/MonitorScreen.ts` (an iframe inside a CSS3DObject with overlapping WebGL occlusion planes)
  3. React UI overlays — `src/Application/UI/*` (mounted into `#ui` / `#ui-interactive` in `src/index.html`)
- Entry points: `src/script.ts` → constructs `Application` which wires `Renderer`, `World`, `Camera`, `AudioManager`, and mounts React UI.
- Key coupling: Camera position drives audio/visual behaviour (AudioListener attached to camera) and view modes (View1 desk vs View2 monitor).

Developer workflows (commands & scripts)
- Install: `npm install` (readme shows `npm i`).
- Dev server: `npm run dev` (webpack dev server; see `bundler/webpack.dev.js`).
- Build: `npm run build` (webpack prod config in `bundler/webpack.prod.js`).
- Serve production: `npm start` (express server in `server/index.ts`).
- Deploy: `./deploy.sh` runs a git push then `vercel --prod` (see `deploy.sh`).

Important project-specific patterns and conventions
- Event bus: lightweight wrapper over DOM custom events in `src/Application/UI/EventBus.ts`. Use it for cross-layer events like `loadingScreenDone`, `enterMonitor`, `leftMonitor`, `muteToggle`, `freeCamToggle`.
- Monitor iframe bridging: `MonitorScreen` uses `window.postMessage` to bridge iframe → parent, re-dispatches scaled synthetic DOM events and annotates them with `inComputer = true`. See `docs/context.md` and `src/Application/World/MonitorScreen.ts` for exact behavior.
- Special synthetic key events: UI components emit `_AUTO_` prefixed `keydown` tokens to trigger typing SFX. See `src/Application/UI/components/HelpPrompt.tsx` and `src/Application/UI/components/InfoOverlay.tsx` and `AudioSources.ts`.
- FreeCam / pointer-events: enabling FreeCam toggles OrbitControls and sets `#webgl` pointer-events to `auto`. See `FreeCamToggle.tsx` and `Camera.ts`.
- Debug toggle: `src/Application/Utils/Debug.ts` activates a `lil-gui` panel when the URL hash equals `#debug`. (Docs mention `?debug` — check both places when asked for debug behavior.)
- GLTF + Draco + GLSL: assets are loaded with `GLTFLoader`, `DRACOLoader` decoders live in `static/draco/` and GLSL files are handled by `bundler/webpack.common.js` (glslify/raw loaders).
- Styling: project mixes global CSS (`src/style.css`) + UI CSS (`src/Application/UI/style.css`) and Tailwind utilities (see `tailwind.config.js`, `postcss.config.js`) and a small `cn` util at `src/Application/UI/lib/utils.ts`.

Integration & external dependencies to watch
- Hosting/deploy: Vercel (`deploy.sh`) and an Express server (`server/index.ts`) that also exposes a `POST /api/send-email` endpoint (Nodemailer). Keep secrets out of repo.
- Analytics: Google Analytics snippet in `src/index.html` (gtag).
- Embedded content: default monitor URL is `https://calm-context-197021.framer.app/`, but `?dev` loads `http://localhost:3000/`. Many external sites block framing (CSP/X-Frame-Options); `MonitorScreen` uses fallback pages in `static/iframe-pages/`.

Where to make common changes (quick map)
- Camera routes & timings: `src/Application/Camera/CameraKeyframes.ts` + `Camera.ts`.
- Add/adjust UI: `src/Application/UI/components/` and shared styles in `src/Application/UI/style.css`.
- Add models/textures: `src/models/`, `static/draco/`, `static/textures/` and loaders in `src/Application/World/*`.
- Audio sources & SFX: `src/Application/Audio/AudioManager.ts` and `src/Application/Audio/AudioSources.ts` (typing and UI SFX mapping here).
- Embedded screen behavior & controls: `src/Application/World/MonitorScreen.ts` and `static/iframe-pages/*`.

Notes for an AI making changes
- Read `docs/context.md` first — it documents the UX and many implementation details; use it as authoritative context.
- Preserve the three-layer rendering model (WebGL/CSS3D/React) — many UI behaviors assume those layers and DOM mountpoints (`#webgl`, `#css`, `#ui`, `#ui-interactive`).
- When changing camera or audio, verify effects by running the dev server and using `#debug` to inspect the camera and audio listener.
- Event names must be exact (case-sensitive); prefer using `UIEventBus` helpers rather than adding new global DOM events.

If anything in this file is unclear or missing, tell me which area you'd like expanded (build, camera, audio, monitor bridging, or deployment) and I will extend the instructions.
