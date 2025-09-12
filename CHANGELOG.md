# Changelog

Changelog

All notable changes to this project will be documented in this file.

The format is based on Conventional Changelog.

## [Unreleased]

### Added
- Updated React to v18 for concurrent features and automatic batching.

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.1.1] - 2025-08-21

Updated repository to current version with React v18.

### Added

-   Inline monitor control bar rendered inside the CSS3D monitor container with A/Y/B buttons to switch screen content.
-   YouTube embed support via iframe-safe URLs; added fallback page for Bing to open externally.
-   Documentation updates describing View1 (desk) vs View2 (monitor) behavior and focus retention rules.

### Changed

-   Monitor focus detection now treats the entire monitor container (including controls) as in-computer, preventing unintended zoom-out when hovering the menu.
-   Screen controls positioned higher within the monitor to avoid overlap with content.

### Deprecated

-

### Removed

-

### Fixed

-   Prevented camera from leaving View2 when hovering or clicking the screen controls.
-   Resolved iframe "refused to connect" issues by switching to embeddable endpoints (YouTube) and a local fallback (Bing).
-   Reverted performance tweaks that caused regressions in scene updates and camera behavior.

### Security

-

## [0.1.0] - 2025-08-18

Initial test build for AuxeOS (deployed on Vercel).

### Added

-   Interactive 3D web application built with TypeScript, Three.js, and React.
-   Scene setup with camera keyframes and smooth transitions (idle, desk, monitor, orbit-controls start).
-   WebGL renderer with CSS3D overlay and a noise/scanline shader overlay.
-   Resource loader for GLTF models, textures, cube textures, and audio (GLTFLoader, TextureLoader, AudioLoader).
-   Environment, decor, and computer models with baked textures.
-   Monitor screen implemented via CSS3D `iframe` with depth-layered texture planes and video static layers.
-   Perspective dimmer that responds to camera distance/angle for added depth.
-   Audio system with listener, positional audio sources, ambience loop, input SFX, and dynamic low-pass/volume mapping based on camera distance.
-   BIOS-style loading screen with smooth progress interpolation, resource logs, WebGL detection, and start prompt.
-   UI overlay: info banner with time, mute toggle, and free-cam toggle; help prompt typing animation.
-   Express server with gzip compression, static hosting of build output, and `POST /api/send-email` endpoint (Nodemailer).
-   Build pipeline via Webpack (dev/prod) with GLSL, assets, audio, and TypeScript support.
-   Tailwind CSS v4 integration with PostCSS; added Tailwind config and PostCSS config; utility `cn` using `tailwind-merge`.
-   Generic `DropdownMenu` React component primitives.

### Changed

-   Webpack common updated to include PostCSS loader for CSS processing.

### Deprecated

-   None.

### Removed

-   Bottom monitor-navigation buttons in interface overlay (cleaned up UI).
-   `GEMINI.md` file removed.

### Fixed

-   Smoother loading progress display using requestAnimationFrame-driven interpolation.

### Security

-   None.

[Unreleased]: https://example.com/compare/v0.1.0...HEAD
[0.1.0]: https://example.com/releases/tag/v0.1.0
