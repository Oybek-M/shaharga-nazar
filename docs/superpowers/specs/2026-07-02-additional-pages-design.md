# Additional Pages — Upload/Analysis, Camera Monitoring, Issues List

Date: 2026-07-02

## Purpose

Extend the existing 3D dashboard prototype with three additional pages the project
owner asked for directly (in chat, while stepping away — this spec documents the
decisions made in their absence so they can review on return):

1. **Upload & Analyze** — upload a photo/video, run it through a (currently mocked)
   AI detection service, and show the results.
2. **Camera Monitoring** — a live-camera-style monitoring view. Real camera access
   isn't authorized yet, so this ships as a mock/demo feed grid, built to the same
   shape a real integration would need.
3. **Detected Issues** — a list/grid of road issues found by the AI (type, photo,
   GPS location), seeded with a small number of mock records since real camera/GPS
   data isn't flowing yet.

The owner is separately collecting a training dataset and fine-tuning a real AI
model; when that's ready, it will be wired in over an API. Every mocked piece here
is built so that swap is a matter of replacing one service module's internals, not
restructuring the app.

## Scope

In scope:
- Three new pages, each a separate Vite HTML entry (multi-page app), sharing the
  existing dark/glassmorphic visual language (`src/style.css` variables and `.panel`
  styling) and a new shared top navigation bar linking all four pages (including the
  existing 3D dashboard).
- A mock `AnalysisService` (upload page) with an interface shaped like a real
  inference call, returning simulated detections after a fake "processing" delay.
- A mock camera grid (no real `getUserMedia`/RTSP integration — out of scope until
  camera access is granted).
- A small static mock dataset (4 records, one per issue type below) for the issues
  list page.
- Issue taxonomy (per the owner's description), each with a color/icon consistent
  with the existing `ISSUE_TYPES` in `src/ai/markers.js`:
  - Pothole / road surface sinking (`pothole`)
  - Cracked asphalt (`cracked_asphalt`)
  - Road debris / trash (`road_debris`) — **new type**, not previously in `markers.js`
  - Non-functioning street/traffic light (`streetlight`)

Out of scope (explicitly deferred):
- Any real AI inference, real camera feeds, or real GPS data — all mocked.
- A shared backend/database. Each page manages its own local/mock state; nothing
  persists across page loads.
- Authentication, user accounts, or camera provisioning flows.

## Architecture

```
hokimga_project/
  index.html            (existing 3D dashboard — unchanged, gets a nav bar added)
  upload.html            — new
  cameras.html            — new
  issues.html              — new
  vite.config.js           — new, declares the 4 HTML entries for `vite build`
  src/
    main.js                (existing dashboard entry — adds nav mount)
    upload.js               — new entry for upload.html
    cameras.js               — new entry for cameras.html
    issues.js                 — new entry for issues.html
    ui/
      Nav.js                  — new: shared top nav bar, mounted on all 4 pages
      UploadPanel.js            — new: file picker + preview + analyze button + results list
      CameraGrid.js               — new: grid of mock camera tiles
      IssuesList.js                 — new: filterable list/grid of issue cards
    ai/
      AnalysisService.js              — new: mock media-analysis service (upload page)
      markers.js                       (existing — extend ISSUE_TYPES with `road_debris`)
    data/
      mockIssues.js                     — new: 4 static mock issue records
```

### AnalysisService (the AI swap point for this feature)

```js
export function createAnalysisService() {
  async function analyzeMedia(file) {
    // Simulated: fake network/inference delay, then random-but-plausible results.
    // A real integration replaces this function's body with an API call, e.g.:
    //   const formData = new FormData(); formData.append('file', file);
    //   const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    //   return res.json();
    // The return shape below is the contract the UI depends on — keep it stable.
    await delay(1200 + Math.random() * 800);
    return { results: [...] }; // [{ type, label, color, confidence, boundingBoxHint? }]
  }
  return { analyzeMedia };
}
```

This mirrors the existing `DetectionService` swap-point pattern from the 3D dashboard
(same shape: a factory function returning an object with one core method, simulated
now, real later).

### Shared navigation

`src/ui/Nav.js` exports `mountNav(root, activePageId)`, rendering a slim glassmorphic
bar with 4 links (Dashboard, Upload & Analyze, Cameras, Issues) as plain `<a href>`
tags to the sibling `.html` files (full page navigation — no client-side router, to
keep the heavy Three.js dashboard fully unloaded when on the other pages, and vice
versa). The active page gets a highlighted style.

### Upload & Analyze page

`UploadPanel.js` renders: a drop-zone/file-input (`accept="image/*,video/*"`), a
preview thumbnail (`<img>`/`<video>` from `URL.createObjectURL`), an "Analyze" button
(disabled until a file is chosen), a loading spinner state while `analyzeMedia` runs,
and a results panel listing each detected issue (color-coded pill, label, confidence
%) reusing the same `.detection-item` visual pattern from the dashboard's Left Panel.
If detection returns zero results, show a clear "No issues detected" state rather
than an empty list.

### Camera Monitoring page

`CameraGrid.js` renders a fixed set of mock camera tiles (e.g. 4, matching bus-route
naming for narrative consistency — "Bus 1 — Route A", etc.), each tile showing a
static placeholder pattern (CSS gradient, not a real video element, since there's no
stream), a status badge (e.g. "Demo Feed" in amber), and camera metadata (name,
last-update timestamp). A banner at the top states plainly that live camera access is
pending authorization and this is demo data — so nobody mistakes it for a real feed.

### Detected Issues page

`IssuesList.js` renders the 4 mock records from `mockIssues.js` as cards: color-coded
type badge + icon, a placeholder photo (styled gradient box, consistent with the
"no real photos yet" constraint), GPS coordinates (Andijon-area lat/lng, since the
project is themed there), a relative timestamp, and a severity tag. A row of filter
buttons ("All", "Pothole", "Cracked Asphalt", "Road Debris", "Streetlight") toggles
visibility by type — pure client-side filtering, no backend.

## Data flow

- Upload page: user selects file → `UploadPanel` calls `analysisService.analyzeMedia(file)`
  → shows loading state → renders results from the resolved array. No state persists
  after leaving the page (by design — no backend yet).
- Camera page: static mock data rendered once on mount, no live updates (real camera
  streaming is out of scope until access is granted).
- Issues page: static mock data rendered once on mount, filtered client-side by a
  local (non-persisted) filter state variable.

## Error handling / edge cases

- Upload page: if no file is selected, the Analyze button is disabled (not a runtime
  error path). If the browser can't preview a given file type, fall back to showing
  the filename instead of a thumbnail.
- All three new pages must render correctly even with JavaScript-disabled dev tools
  errors absent — i.e., no console errors on load, matching the existing project's
  bar for quality.

## Verification plan

No automated tests (consistent with how the dashboard's UI/visual work was treated —
`docs/superpowers/specs/2026-07-01-3d-transport-monitoring-design.md` sets this
precedent). Manual verification via the preview tool for each page:
- Upload: select a file, see preview, click Analyze, see a loading state, then see
  plausible mock results rendered.
- Cameras: see the grid of mock tiles with the "demo data" banner clearly visible.
- Issues: see all 4 mock cards, click each filter button and confirm the list narrows
  correctly, click "All" to confirm it resets.
- Nav: from each of the 4 pages, click through to each other page and confirm it
  loads correctly and highlights the right nav item.
