# Repository Guidelines

## Project Structure & Module Organization
`index.html` is the single-page shell; it links the modern styling in `battleship.css` and boots `battleship.js` as an ES module. Gameplay logic lives under `src/`: `game.js` orchestrates turns and win states, `board.js` tracks ship placement and attacks, `ship.js` models individual vessels, `ai-controller.js` handles smart CPU targeting, and `ui-controller.js` updates the DOM. Shared constants (ship specs, orientations, board size) are defined in `src/constants.js` so both players stay in sync. `battleship.js` wires the controllers together, exposes the global bridge required by the existing `onclick` handlers, and inserts the current year into the footer. Static assets (splash/explosion SVGs, icons, screenshots) live in `images/`; prefer `.webp` for screenshots and keep SVGs optimized (`svgo` or similar) when adding new art.

## Build, Test, and Development Commands
- `npx http-server . --port 3000` serves the project with correct relative paths and caching headers; use it during active development.
- `python3 -m http.server 3000` provides a zero-dependency fallback if Node.js is unavailable.
- `open index.html` (or your OS equivalent) is fine for quick visual checks, but an HTTP server avoids asset/CORS issues and mirrors production loading better.

## Coding Style & Naming Conventions
Follow the ES module pattern already in place: default to `const`/`let`, keep classes in their own files, and export the minimal surface each module needs. JavaScript uses two-space indentation and descriptive method names (`placePlayerShip`, `handleAttackResult`). CSS also uses two spaces and kebab-case selectors; leverage the variables at the top of `battleship.css`—especially `--cell-size` for board square sizing—rather than hard-coding pixels. DOM IDs remain camelCase (`remove-on-start` is the lone kebab-case ID for legacy reasons); keep new classes prefixed with the component they style (`.player-board`, `.ship-select`) to make overrides predictable.

## Testing Guidelines
There is no automated suite yet, so rely on manual QA. Serve the site, then walk through ship placement, game start, repeated attack loops, and both win and loss flows. Confirm the hover preview outlines the full ship footprint (blue when valid, red when out of bounds or overlapping) before you click, the CPU AI switches from random attacks to focused hunts after a hit, and the retry button reloads cleanly. Validate responsive breakpoints at 1280px, 1024px, 768px, and 375px widths—the UI should keep both boards visible side by side on desktop and wrap sensibly on smaller screens. Capture GIFs or annotated screenshots for regressions and attach them to your PR.

## Commit & Pull Request Guidelines
History favors concise, lower-case subjects (`add retry button logic`). Keep messages imperative, under ~72 characters, and group related CSS/JS changes in a single commit where practical. PRs should include: (1) a short summary, (2) manual test notes listing the commands above, (3) before/after visuals for UI tweaks, and (4) linked issues or TODO references. Request reviewers aligned with the change (UI polish, gameplay logic, asset updates) to speed feedback. For larger refactors, note any follow-up tasks (e.g., migrating from inline `onclick` attributes) so the next contributor can pick them up easily.
