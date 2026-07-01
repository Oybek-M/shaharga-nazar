# Andijon Public Transport & Road AI Monitoring — Prototype

Front-end-only 3D dashboard prototype (Vite + Three.js) simulating an AI-based
monitoring system for city buses and road infrastructure issues.

## Run it

npm install
npm run dev

Then open the printed local URL in a browser.

## Run unit tests

npm test

## Notes

- AI detection is simulated (`src/ai/DetectionService.js`). It is designed as a single
  swappable module: replace its internals to call a real model/backend later without
  touching the rest of the app.
- No backend, persistence, or business logic is included — this is a visual prototype only.
