# auxe.co Portfolio Website - GEMINI.md

This document provides an overview of the `auxe.co` portfolio website project, intended to serve as instructional context for AI agents.

## Project Overview

This project is an interactive 3D portfolio website that simulates a desktop environment. Users can interact with a virtual computer setup, including a monitor that displays various web content. It employs a sophisticated three-layered architecture to achieve its interactive experience:

1.  **WebGL Layer (Three.js Scene):** Manages the core 3D environment, models, and visual effects using Three.js.
2.  **CSS3D Layer:** Projects DOM elements, primarily the interactive monitor iframe, into the 3D space using `CSS3DRenderer`.
3.  **UI Layer (React):** Handles all user interface overlays, loading screens, and controls, built with React 18 and TypeScript.

**Key Technologies:**
*   **Three.js:** For 3D rendering and scene management.
*   **React/TypeScript:** For building user interface components, leveraging React 18's features.
*   **Web Audio API:** For interactive sound effects and ambient audio.
*   **CSS3DRenderer:** For embedding HTML content (iframes) within the 3D scene.
*   **Webpack:** For bundling and managing assets (GLTF models, Draco decoders, GLSL shaders, images, audio).
*   **Tailwind CSS & PostCSS:** For styling, alongside component-specific inline styles.
*   **Express.js:** For the production server and API endpoints.


## Building and Running

The project uses `npm` scripts for common development and build tasks.

*   **Install Dependencies:**
    ```bash
    npm install
    # or
    npm i
    ```

*   **Run Local Development Server:**
    Starts a webpack development server with hot reloading and file watching. Access via `http://localhost:8080` (or the port reported in the console).
    ```bash
    npm run dev
    ```
    *Note: For local embedded site development within the monitor iframe, append `?dev` to the URL (e.g., `http://localhost:8080/?dev`). This loads `http://localhost:3000/` into the iframe.*

*   **Create Production Build:**
    Compiles and optimizes the project for production, outputting files to the `public/` directory.
    ```bash
    npm run build
    # or
    npm run build:prod
    ```

*   **Serve Production Build:**
    Starts an Express.js server to serve the production-ready build.
    ```bash
    npm start
    ```

*   **Deploy to Vercel:**
    This script commits local changes, pushes to the repository, and then deploys the project to Vercel.
    ```bash
    ./deploy.sh
    ```

## Development Conventions

### High-Level Architecture
*   **Three Coordinated Layers:** Always preserve the WebGL, CSS3D, and React UI layers. Many UI behaviors and interactions depend on this separation and specific DOM mount points (`#webgl`, `#css`, `#ui`, `#ui-interactive`).
*   **Entry Point:** `src/script.ts` initializes the main `Application` class, which orchestrates the Three.js scene, audio, and mounts the React UI.
*   **Camera Coupling:** Camera position is central to audio/visual behavior and view modes (e.g., `View1` desk vs `View2` monitor).

### React Component Development (`src/Application/UI/components/`)
*   **Functional Components:** All React components must be functional.
*   **TypeScript:** Use TypeScript with clear interfaces for props.
*   **Styling:**
    *   Prefer inline styles for simple, component-specific styling.
    *   Integrate with Tailwind CSS classes using the `cn` utility (`src/Application/UI/lib/utils.ts`).
    *   Avoid creating new `.css` files unless absolutely necessary for global styles.
*   **Event Handling:**
    *   Use `useCallback` for event handlers to prevent unnecessary re-renders.
    *   **Crucially, for any interactive UI element that overlays the WebGL canvas, always call `event.stopPropagation()` to prevent events from bubbling up and interfering with Three.js interactions.**
*   **State Management:**
    *   Use `useState` and `useEffect` for local component state.
    *   For global state or communication between disparate parts of the application, use the `UIEventBus` (`src/Application/UI/EventBus.ts`).
    *   Avoid excessive prop drilling; use `UIEventBus` or refactor hierarchy if data needs to be shared deeply.
*   **Animations:** Utilize `framer-motion` for declarative animations. Define animation variants clearly.
*   **Accessibility:** Ensure interactive elements are accessible (e.g., keyboard navigation, ARIA attributes).
*   **Asset Imports:** Use `import` syntax with `@ts-ignore` for non-TypeScript files (e.g., SVG images).

### WebGL Compatibility for UI Elements
To prevent UI elements from interfering with the underlying Three.js canvas, interactive React components must include specific attributes and styles:
*   `id="prevent-click"`
*   `data-prevent-monitor="true"`
*   `style={{ pointerEvents: 'auto', zIndex: 999 }}` (adjust `zIndex` as needed for layering)
*   Always call `e.stopPropagation()` on click/mouse events.

### Event Bus (`src/Application/UI/EventBus.ts`)
*   A thin wrapper over `document` custom events for cross-layer communication.
*   Event names must be exact and case-sensitive.
*   Notable events: `loadingScreenDone`, `enterMonitor`, `leftMonitor`, `muteToggle`, `freeCamToggle`, `setScreenURL`.

### Monitor Iframe Bridging (`src/Application/World/MonitorScreen.ts`)
*   Uses `window.postMessage` to bridge events (e.g., `mousemove`, `keydown`, `keyup`) from the embedded iframe to the parent application.
*   Bridged events are annotated with `inComputer = true` and scaled to the iframe's screen rectangle.

### Audio Feedback
*   UI components (e.g., `HelpPrompt.tsx`, `InfoOverlay.tsx`) emit `_AUTO_` prefixed `keydown` tokens via `window.postMessage` to trigger consistent typing sound effects (`AudioSources.ts` listens for these).

### Debugging
*   Append `#debug` to the URL (e.g., `http://localhost:8080/#debug`) to activate a `lil-gui` panel and `stats.js` FPS counter.

### Styling
*   The project mixes global CSS (`src/style.css`), UI-specific CSS (`src/Application/UI/style.css`), and Tailwind CSS utilities.
*   `tailwind.config.js` and `postcss.config.js` define the Tailwind setup.
*   The `cn` utility (`src/Application/UI/lib/utils.ts`) is used for conditionally merging Tailwind classes.



### File Structure
*   React components are primarily located in `src/Application/UI/components/`.
*   Shared UI utilities are in `src/Application/UI/lib/`.
*   Three.js related code is in `src/Application/`.
*   Static assets are in `static/`.
*   Webpack configurations are in `bundler/`.
*   Server-side code is in `server/`.
*   Documentation and workshop materials are in `docs/` and `workshop/`.
