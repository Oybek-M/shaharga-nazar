# Andijon Public Transport & Road AI Monitoring — Prototype

Front-end-only 3D dashboard prototype (Vite + Three.js) simulating an AI-based
monitoring system for city buses and road infrastructure issues.

## Run it

npm install
npm run dev

Then open the printed local URL in a browser.

## Run unit tests

npm test

## Pages

- `index.html` — 3D live dashboard (buses, simulated AI detection, glassmorphic stats panels)
- `upload.html` — upload a photo/video and get mock AI-analyzed road-issue results
- `cameras.html` — camera monitoring grid (demo feeds; real camera access not yet authorized)
- `issues.html` — list of detected road issues (type, mock photo, GPS, severity) with type filters

All AI/camera/GPS data on these pages is currently simulated. `src/ai/AnalysisService.js`
and `src/ai/DetectionService.js` are the two swap points for plugging in a real trained
model later via an API call — everything else in the UI is built against their existing
return shapes and won't need to change.

## Notes

- AI detection is simulated (`src/ai/DetectionService.js`). It is designed as a single
  swappable module: replace its internals to call a real model/backend later without
  touching the rest of the app.
- No backend, persistence, or business logic is included — this is a visual prototype only.
