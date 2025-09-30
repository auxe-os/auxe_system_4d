# Repository Guidelines

## Project Structure & Module Organization
Keep gameplay and UI logic under `src/`, with entry points in `src/index.html`, `src/script.ts`, and `src/Application/`. Place React UI pieces in `src/Application/UI/components` (PascalCase files) and ensure shaders live in `src/Application/Shaders`. Runtime assets belong in `static/`, while public metadata stays in `public/`. Server-side helpers sit in `server/index.ts`, build tooling in `bundler/`, and reference material in `docs/` or `workshop/`.

## Build, Test, and Development Commands
Use `npm run dev` for a webpack dev server with hot reload. `npm run build` produces the production bundle through `bundler/webpack.prod.js`, and `npm run start` launches the compiled Node server. Run `npm ci && npm run dev` on fresh clones to guarantee lockfile parity.

## Coding Style & Naming Conventions
Formatting is enforced by Prettier (4-space indent, semicolons, single quotes). TypeScript strict mode is enabled, so prefer explicit types and guard against nullish values. Follow PascalCase for components and classes, camelCase for functions and variables, kebab-case for GLSL files, and colocate optional Tailwind tweaks in `src/Application/UI/style.css`.

## Testing Guidelines
A test harness is not bundled yet. When adding coverage, place unit specs under `src/**/__tests__/*.test.ts(x)` and end-to-end specs under `/e2e` (Playwright recommended). Add an `npm test` script when introducing a framework, and prioritize render flows, the event bus, and asset loaders.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (e.g., `feat(renderer): reduce draw calls`). Keep commits focused and descriptive. Pull requests should include a summary, screenshots or clips for visual changes, related issue links, and confirmation that `npm run build` plus `npm run start` succeed locally.

## Security & Configuration Tips
Never commit secrets; load environment-specific values from `.env` files or deployment settings. Store large binaries under `static/` after optimizing size, and audit third-party assets before inclusion.

## Agent-Specific Instructions
Respect the existing module layout, avoid sweeping refactors, and wire new features through `src/Application/Application.ts` with relative imports. Keep edits scoped, document new conventions here, and prefer incremental improvements over wholesale rewrites.
