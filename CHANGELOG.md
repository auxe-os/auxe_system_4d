Changelog

All notable changes to this project will be documented in this file.

The format is based on Conventional Changelog.

## [Unreleased]

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 

## [0.1.0] - 2025-08-18

Initial test build for AuxeOS (deployed on Vercel).

### Added
- Interactive 3D web application built with TypeScript, Three.js, and React.
- Scene setup with camera keyframes and smooth transitions (idle, desk, monitor, orbit-controls start).
- WebGL renderer with CSS3D overlay and a noise/scanline shader overlay.
- Resource loader for GLTF models, textures, cube textures, and audio (GLTFLoader, TextureLoader, AudioLoader).
- Environment, decor, and computer models with baked textures.
- Monitor screen implemented via CSS3D `iframe` with depth-layered texture planes and video static layers.
- Perspective dimmer that responds to camera distance/angle for added depth.
- Audio system with listener, positional audio sources, ambience loop, input SFX, and dynamic low-pass/volume mapping based on camera distance.
- BIOS-style loading screen with smooth progress interpolation, resource logs, WebGL detection, and start prompt.
- UI overlay: info banner with time, mute toggle, and free-cam toggle; help prompt typing animation.
- Express server with gzip compression, static hosting of build output, and `POST /api/send-email` endpoint (Nodemailer).
- Build pipeline via Webpack (dev/prod) with GLSL, assets, audio, and TypeScript support.
- Tailwind CSS v4 integration with PostCSS; added Tailwind config and PostCSS config; utility `cn` using `tailwind-merge`.
- Generic `DropdownMenu` React component primitives.

### Changed
- Webpack common updated to include PostCSS loader for CSS processing.

### Deprecated
- None.

### Removed
- Bottom monitor-navigation buttons in interface overlay (cleaned up UI).
- `GEMINI.md` file removed.

### Fixed
- Smoother loading progress display using requestAnimationFrame-driven interpolation.

### Security
- None.

[Unreleased]: https://example.com/compare/v0.1.0...HEAD
[0.1.0]: https://example.com/releases/tag/v0.1.0


