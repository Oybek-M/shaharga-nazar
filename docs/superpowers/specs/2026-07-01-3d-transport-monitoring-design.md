# 3D Public Transport & Road Monitoring Dashboard — Design Spec

Date: 2026-07-01

## Purpose

A front-end-only prototype of a 3D, web-based AI monitoring dashboard, styled after a
futuristic city-transport control room. It visualizes a stylized dusk cityscape (themed
as Andijon) with buses driving predefined routes, each sweeping a translucent "AI scan
beam" over the road. When a beam passes a predefined issue location, a color-coded 3D
marker (pothole, cracked asphalt, non-functioning streetlight) appears, and the event is
logged into a live UI feed. Detection is fully simulated for now, but built behind a
single seam so a real detection backend/model can be swapped in later without touching
the rest of the app.

## Scope

In scope:
- Single-page 3D web app (Vite + vanilla JS + Three.js), running locally via `npm run dev`.
- Procedural/stylized (non-photorealistic) 3D city, buses, roads, lighting.
- Animated buses following spline routes, each with a scanning beam.
- Simulated AI detection of road/infrastructure issues at fixed marker points along routes.
- Glassmorphic UI overlay: left stats/detections panel, right minimap/weather/notifications/
  avatar panel, bottom-left mode control buttons (Live Mode, Heatmap, Simulation Playback).
- Bloom post-processing and dusk lighting for a polished, futuristic look.

Out of scope (explicitly deferred, per stakeholder decision):
- Real AI/ML detection model or backend inference service.
- Backend API, database, persistence, authentication, multi-user support.
- Monetization / business-model logic of any kind.
- Automated test suite — verification is manual, by running the app and observing behavior.

## Architecture

```
hokimga_project/
  index.html
  package.json               (vite, three)
  src/
    main.js                  — app bootstrap, animation loop, wires scene + UI + store together
    store.js                 — tiny pub/sub event store (bus stats, issue counts, detection feed)
    scene/
      City.js                — procedural low-poly cityscape: roads, glass buildings, dusk lighting
      Bus.js                 — articulated bus mesh, moves along a Route, owns its scan beam
      Route.js               — CatmullRomCurve3 path definitions buses loop along
      PostProcessing.js       — EffectComposer + RenderPass + UnrealBloomPass setup
    ai/
      DetectionService.js     — detect(position) → {type, confidence, label} | null; simulated now
      markers.js               — fixed world-space points tagged with an issue type, per route
    ui/
      LeftPanel.js             — system status stats + "Recent Detections" feed (thumbnail + confidence)
      RightPanel.js            — minimap, weather readout, notification bell, user avatar
      BottomLeftPanel.js       — Live Mode / Heatmap / Simulation Playback toggle buttons
      Marker3D.js              — CSS2DRenderer-anchored floating icon + text label at a world position
    style.css
  README.md
```

### Data flow

1. `main.js` creates the Three.js scene (`City`, several `Bus` instances on `Route`s),
   sets up `PostProcessing`, and starts the render loop.
2. Each frame, every `Bus` advances along its route and updates its scan-beam cone position.
3. `main.js` checks each bus's beam position against `markers.js` entries for that route;
   when a marker enters beam range and hasn't yet been triggered this pass, it calls
   `DetectionService.detect(markerPosition)`.
4. `DetectionService` (simulated) returns the marker's tagged issue type with a randomized
   confidence value (90–99%). This is the only module that would change to integrate real AI.
5. On a detection result, `main.js` spawns a `Marker3D` at that position and publishes an
   event to `store.js`.
6. UI panel modules (`LeftPanel`, etc.) subscribe to `store.js` and re-render their DOM
   (stats counters, detections feed) reactively — no direct coupling to Three.js internals.

### Error handling / edge cases

- A marker already displayed should not be re-triggered until the bus loops back around
  and the marker has expired/faded (avoid duplicate spam as the beam lingers over a point).
- Bottom-left panel buttons (Heatmap, Simulation Playback) are simple UI state toggles for
  this prototype — they change a visual mode flag but don't require new data pipelines.
- If WebGL isn't available, the app should show a plain-text fallback message rather than a
  blank page.

## Verification plan

No automated tests. Manual verification via the preview browser:
- Buses move continuously and loop along their routes without popping/jumping.
- Scan beams visibly sweep the road ahead of each bus.
- Markers spawn with correct color/icon/label when a beam crosses a marker point, and the
  Left Panel's stats/detection feed update in sync.
- All three bottom-left buttons are clickable and change visual state.
- No errors in the browser console during a few minutes of continuous running.
