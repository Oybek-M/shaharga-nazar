# Additional Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three new pages to the prototype — Upload & Analyze, Camera Monitoring, Detected Issues — sharing the existing glassmorphic visual language and a new cross-page nav bar, with a mock-but-API-shaped AI analysis service.

**Architecture:** Multi-page Vite app (separate `.html` entries, each with its own JS entry file) instead of client-side routing, so the heavy Three.js dashboard stays fully unloaded when viewing the other pages. A new `AnalysisService` module mirrors the existing `DetectionService` swap-point pattern. A new shared `Nav.js` renders the top bar + navigation links, reused (via one new import + one changed line) on the existing dashboard and freshly on the three new pages.

**Tech Stack:** Same as the existing project — Vite, vanilla JS, the existing `src/style.css` variables/`.panel` component styles. Vitest for the one new testable logic module (`AnalysisService`).

---

## Task A: Extend marker taxonomy + mock data + AnalysisService

**Files:**
- Modify: `src/ai/markers.js` (add `ROAD_DEBRIS` issue type)
- Create: `src/data/mockIssues.js`
- Create: `src/ai/AnalysisService.js`
- Test: `src/ai/AnalysisService.test.js`

- [ ] **Step 1: Add the new issue type to markers.js**

In `src/ai/markers.js`, add one line to the `ISSUE_TYPES` object (don't change anything else in the file — the existing `MARKERS` array and `findMarkersNear` stay untouched):

```js
export const ISSUE_TYPES = {
  POTHOLE: { key: 'pothole', label: 'Pothole (Detected)', color: 0xe63946 },
  CRACKED_ASPHALT: { key: 'cracked_asphalt', label: 'Cracked Asphalt', color: 0xf4a261 },
  STREETLIGHT: { key: 'streetlight', label: 'Non-functioning Street Light', color: 0xe9c46a },
  ROAD_DEBRIS: { key: 'road_debris', label: 'Road Debris', color: 0x8b5cf6 },
};
```

- [ ] **Step 2: Run the existing markers test to confirm nothing broke**

Run: `npx vitest run src/ai/markers.test.js`
Expected: PASS — 4 passed (unchanged; the tests don't enumerate `ISSUE_TYPES` exhaustively).

- [ ] **Step 3: Create the mock issues dataset**

```js
// src/data/mockIssues.js
export const MOCK_ISSUES = [
  {
    id: 'issue-1',
    type: 'pothole',
    label: 'Pothole (Detected)',
    color: 0xe63946,
    gps: { lat: 40.7530, lng: 72.3450 },
    detectedAt: '2026-06-30T08:12:00+05:00',
    severity: 'High',
    source: 'Bus 1 — Route A',
  },
  {
    id: 'issue-2',
    type: 'cracked_asphalt',
    label: 'Cracked Asphalt',
    color: 0xf4a261,
    gps: { lat: 40.7601, lng: 72.3392 },
    detectedAt: '2026-06-30T10:47:00+05:00',
    severity: 'Medium',
    source: 'Bus 2 — Route A',
  },
  {
    id: 'issue-3',
    type: 'road_debris',
    label: 'Road Debris',
    color: 0x8b5cf6,
    gps: { lat: 40.7488, lng: 72.3511 },
    detectedAt: '2026-06-29T16:20:00+05:00',
    severity: 'Low',
    source: 'Bus 3 — Route B',
  },
  {
    id: 'issue-4',
    type: 'streetlight',
    label: 'Non-functioning Street Light',
    color: 0xe9c46a,
    gps: { lat: 40.7702, lng: 72.3467 },
    detectedAt: '2026-06-29T21:05:00+05:00',
    severity: 'Medium',
    source: 'Bus 4 — Route C',
  },
];
```

- [ ] **Step 4: Write the failing test for AnalysisService**

```js
// src/ai/AnalysisService.test.js
import { describe, it, expect } from 'vitest';
import { createAnalysisService } from './AnalysisService.js';

describe('createAnalysisService', () => {
  it('resolves with a results array shaped for the UI', async () => {
    const service = createAnalysisService({ random: () => 0.1, wait: () => Promise.resolve() });
    const { results } = await service.analyzeMedia({ name: 'test.jpg' });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('color');
      expect(result.confidence).toBeGreaterThanOrEqual(85);
      expect(result.confidence).toBeLessThanOrEqual(99);
    }
  });

  it('uses the injected wait function instead of a real timer', async () => {
    let waited = false;
    const service = createAnalysisService({ random: () => 0.5, wait: () => { waited = true; return Promise.resolve(); } });
    await service.analyzeMedia({ name: 'test.jpg' });
    expect(waited).toBe(true);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run src/ai/AnalysisService.test.js`
Expected: FAIL — `Cannot find module './AnalysisService.js'`.

- [ ] **Step 6: Write the implementation**

```js
// src/ai/AnalysisService.js
import { ISSUE_TYPES } from './markers.js';

const ISSUE_POOL = [ISSUE_TYPES.POTHOLE, ISSUE_TYPES.CRACKED_ASPHALT, ISSUE_TYPES.ROAD_DEBRIS, ISSUE_TYPES.STREETLIGHT];

function defaultWait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createAnalysisService({ random = Math.random, wait = defaultWait } = {}) {
  async function analyzeMedia(file) {
    // Simulated inference delay. A real integration replaces this whole function
    // body with something like:
    //   const formData = new FormData(); formData.append('file', file);
    //   const res = await fetch('/api/analyze', { method: 'POST', body: formData });
    //   return res.json();
    // The returned shape ({ results: [{type,label,color,confidence}] }) is the
    // contract the UI depends on — keep it stable when swapping in a real backend.
    await wait(1200 + random() * 800);

    const resultCount = 1 + Math.floor(random() * 2);
    const results = [];
    for (let i = 0; i < resultCount; i += 1) {
      const type = ISSUE_POOL[Math.floor(random() * ISSUE_POOL.length)];
      const confidence = Math.round(85 + random() * 14);
      results.push({ type: type.key, label: type.label, color: type.color, confidence });
    }
    return { results };
  }

  return { analyzeMedia };
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/ai/AnalysisService.test.js`
Expected: PASS — 2 passed.

- [ ] **Step 8: Commit**

```bash
git add src/ai/markers.js src/data/mockIssues.js src/ai/AnalysisService.js src/ai/AnalysisService.test.js
git commit -m "Add road-debris issue type, mock issues dataset, and mock AnalysisService"
```

---

## Task B: Shared navigation + multi-page Vite config

**Files:**
- Create: `src/ui/Nav.js`
- Create: `vite.config.js`
- Modify: `src/style.css` (nav link styles)
- Modify: `src/main.js` (use the shared top-bar mount instead of the inline block)

- [ ] **Step 1: Write src/ui/Nav.js**

```js
const PAGES = [
  { id: 'dashboard', href: 'index.html', label: 'Dashboard' },
  { id: 'upload', href: 'upload.html', label: 'Upload & Analyze' },
  { id: 'cameras', href: 'cameras.html', label: 'Cameras' },
  { id: 'issues', href: 'issues.html', label: 'Detected Issues' },
];

export function renderNavLinksHtml(activePageId) {
  return `<div class="nav-links">${PAGES.map(
    (page) => `<a class="nav-link${page.id === activePageId ? ' active' : ''}" href="${page.href}">${page.label}</a>`
  ).join('')}</div>`;
}

export function mountTopBar(root, activePageId, title) {
  const el = document.createElement('div');
  el.id = 'top-bar';
  el.className = 'panel';
  el.innerHTML = `<h1>${title}</h1>${renderNavLinksHtml(activePageId)}`;
  root.appendChild(el);
}
```

- [ ] **Step 2: Append nav styles to src/style.css**

```css
.nav-links { display: flex; gap: 4px; }
.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
}
.nav-link:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
.nav-link.active { background: rgba(56,189,248,0.15); color: var(--accent-blue); }
```

- [ ] **Step 3: Write vite.config.js for the multi-page build**

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        upload: resolve(__dirname, 'upload.html'),
        cameras: resolve(__dirname, 'cameras.html'),
        issues: resolve(__dirname, 'issues.html'),
      },
    },
  },
});
```

(`upload.html`/`cameras.html`/`issues.html` don't exist yet — that's fine, they're created in Tasks D/E/F. This file just needs to exist with these four entries declared before the project is ever built for production; `npm run dev` doesn't need it, but don't skip creating it now since it's a one-time low-risk file.)

- [ ] **Step 4: Replace the inline top-bar block in src/main.js with the shared mount**

Find this block in `src/main.js`:

```js
  const topBar = document.createElement('div');
  topBar.id = 'top-bar';
  topBar.className = 'panel';
  topBar.innerHTML = '<h1>Andijon Public Transport & Road AI Monitoring System</h1>';
  uiRoot.appendChild(topBar);
```

Replace it with:

```js
  mountTopBar(uiRoot, 'dashboard', 'Andijon Public Transport & Road AI Monitoring System');
```

And add the import near the top of the file, alongside the other `./ui/*` imports:

```js
import { mountTopBar } from './ui/Nav.js';
```

- [ ] **Step 5: Manual verification — dashboard regression check**

Use the preview tool to load the dashboard (`index.html`) and confirm: the top bar still shows the title on the left, and now shows 4 nav links ("Dashboard" highlighted as active) on the right side of the same bar. Confirm the rest of the dashboard (buses, panels, bottom-left buttons) still works exactly as before — this is a minimal, additive change, so a quick sanity check is enough, not a full re-verification of every prior task.

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: all test files pass (should now be 5 files: store, markers, DetectionService, Route, AnalysisService).

- [ ] **Step 7: Commit**

```bash
git add src/ui/Nav.js vite.config.js src/style.css src/main.js
git commit -m "Add shared cross-page navigation and multi-page Vite config"
```

---

## Task C: Upload & Analyze page

**Files:**
- Create: `upload.html`
- Create: `src/upload.js`
- Create: `src/ui/UploadPanel.js`
- Modify: `src/style.css` (content-page layout + upload-specific styles)

- [ ] **Step 1: Write upload.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Upload & Analyze — Andijon AI Monitoring</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body class="content-page">
    <div id="ui-root"></div>
    <script type="module" src="/src/upload.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Add content-page layout styles to src/style.css**

The dashboard's `html, body { overflow: hidden; }` and `#ui-root { position: absolute; inset: 0; }` rules assume a full-bleed 3D canvas underneath. The new pages have no canvas and need normal scrolling flow instead. Add:

```css
body.content-page { overflow-y: auto; }
body.content-page #ui-root {
  position: relative;
  inset: auto;
  pointer-events: auto;
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
body.content-page #top-bar { position: static; }
```

- [ ] **Step 3: Write src/ui/UploadPanel.js**

Build a panel (reuse the `.panel` class for the outer container, matching the dashboard's visual language) with:
- A file input (`accept="image/*,video/*"`) styled as a drop-zone-looking control.
- A preview area: once a file is selected, show an `<img>` (via `URL.createObjectURL`) for images or a filename chip for video/unsupported preview types.
- An "Analyze" button, disabled until a file is chosen, showing a loading/spinner state while `analysisService.analyzeMedia(file)` is in flight.
- A results section that, once resolved, lists each detected issue reusing the same visual pattern as the dashboard's `.detection-item` (color-coded swatch/pill using the result's `color` as a hex background, label, confidence %). If `results.length === 0`, show a clear "No issues detected" message instead of an empty list.

Structure it as a single exported function, e.g. `mountUploadPanel(root, analysisService)`, that creates and appends its own DOM and wires up the file-input/button/results interactions internally (no external store needed — this page's state is local to the panel).

Import the service from `../ai/AnalysisService.js` (created in Task A) — don't reimplement the mock logic here, just call it.

- [ ] **Step 4: Write src/upload.js**

```js
import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountUploadPanel } from './ui/UploadPanel.js';
import { createAnalysisService } from './ai/AnalysisService.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'upload', 'Upload & Analyze');

const analysisService = createAnalysisService();
mountUploadPanel(uiRoot, analysisService);
```

(Adjust the exact function/import names here if your `UploadPanel.js` export differs — keep them consistent with what you wrote in Step 3.)

- [ ] **Step 5: Manual verification**

Use the preview tool to load `upload.html`. Confirm: top bar shows "Upload & Analyze" title with nav links (Upload highlighted active), a file picker is visible, selecting an image file shows a preview and enables the Analyze button, clicking Analyze shows a loading state for ~1-2 seconds then renders 1-2 mock detection results with plausible labels/colors/confidence values. No console errors. Click through the nav to Dashboard and back to confirm navigation works.

- [ ] **Step 6: Commit**

```bash
git add upload.html src/upload.js src/ui/UploadPanel.js src/style.css
git commit -m "Add upload-and-analyze page with mock AI results"
```

---

## Task D: Camera Monitoring page

**Files:**
- Create: `cameras.html`
- Create: `src/cameras.js`
- Create: `src/ui/CameraGrid.js`
- Modify: `src/style.css` (camera tile styles)

- [ ] **Step 1: Write cameras.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Camera Monitoring — Andijon AI Monitoring</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body class="content-page">
    <div id="ui-root"></div>
    <script type="module" src="/src/cameras.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Write src/ui/CameraGrid.js**

Render, inside its own `.panel`-styled container:
- A clearly visible banner/notice stating live camera access hasn't been authorized yet and this is demo data (so it's never mistaken for a real feed).
- A responsive grid (CSS grid, e.g. `repeat(auto-fill, minmax(220px, 1fr))`) of camera tiles. Use a fixed mock list of 4 cameras named to match the dashboard's route naming for narrative consistency (e.g. "Bus 1 — Route A", "Bus 2 — Route A", "Bus 3 — Route B", "Bus 4 — Route C"). Each tile: a placeholder "feed" area (a CSS gradient box, NOT a real `<video>`/`<img>` — there's no stream), a status badge reading "Demo Feed" (amber/warning color, distinct from a "Live" green you'd use for a real integration later), the camera name, and a "last updated" mock timestamp.

Export a single mount function, e.g. `mountCameraGrid(root)` — no external service needed since this is fully static mock data (define the 4-camera list inline in this file or in a small local const array; it doesn't need its own data module since it's presentation-only and not reused elsewhere).

- [ ] **Step 3: Write src/cameras.js**

```js
import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountCameraGrid } from './ui/CameraGrid.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'cameras', 'Camera Monitoring');
mountCameraGrid(uiRoot);
```

- [ ] **Step 4: Manual verification**

Use the preview tool to load `cameras.html`. Confirm: top bar with "Camera Monitoring" title and nav (Cameras highlighted active), the "not yet authorized / demo data" banner is clearly visible and readable, 4 camera tiles render in a grid with distinct placeholder patterns, names, and "Demo Feed" badges. No console errors.

- [ ] **Step 5: Commit**

```bash
git add cameras.html src/cameras.js src/ui/CameraGrid.js src/style.css
git commit -m "Add camera monitoring page with mock demo feeds"
```

---

## Task E: Detected Issues page

**Files:**
- Create: `issues.html`
- Create: `src/issues.js`
- Create: `src/ui/IssuesList.js`
- Modify: `src/style.css` (issue card + filter button styles)

- [ ] **Step 1: Write issues.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Detected Issues — Andijon AI Monitoring</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body class="content-page">
    <div id="ui-root"></div>
    <script type="module" src="/src/issues.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Write src/ui/IssuesList.js**

Import `MOCK_ISSUES` from `../data/mockIssues.js` (Task A). Render, inside a `.panel`-styled container:
- A row of filter buttons: "All", "Pothole", "Cracked Asphalt", "Road Debris", "Streetlight" (reuse the `.mode-button`/`.mode-button.active` visual pattern from the dashboard's bottom-left panel for consistency). Clicking a filter shows only matching-type cards; "All" shows everything. Track the active filter in a local variable (no store needed — this page doesn't need cross-component reactivity beyond its own filtered list).
- A grid or stacked list of issue cards, one per (filtered) record: a color-coded left border or badge using the record's `color` field, the `label`, a placeholder photo area (styled gradient box — no real photos available), GPS coordinates formatted as `lat, lng` (e.g. "40.7530, 72.3450"), a human-readable relative-or-formatted timestamp from `detectedAt`, the `severity` tag, and the `source` (which bus detected it).

Export a single mount function, e.g. `mountIssuesList(root)`.

- [ ] **Step 3: Write src/issues.js**

```js
import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountIssuesList } from './ui/IssuesList.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'issues', 'Detected Issues');
mountIssuesList(uiRoot);
```

- [ ] **Step 4: Manual verification**

Use the preview tool to load `issues.html`. Confirm: top bar with "Detected Issues" title and nav (Issues highlighted active), all 4 mock issue cards render with correct color coding per type, GPS/timestamp/severity/source fields are readable. Click each filter button in turn (use `preview_click`) and confirm the list narrows to only matching cards each time, then click "All" and confirm it resets to all 4. No console errors.

- [ ] **Step 5: Commit**

```bash
git add issues.html src/issues.js src/ui/IssuesList.js src/style.css
git commit -m "Add detected-issues list page with mock records and type filters"
```

---

## Task F: Final cross-page verification

**Files:** none created/modified — verification only, plus README update.

- [ ] **Step 1: Full navigation walk-through**

Use the preview tool. Starting from `index.html`, click through the nav to `upload.html` → `cameras.html` → `issues.html` → back to `index.html` (Dashboard). Confirm each page loads without console errors, the active nav link is correctly highlighted on every page, and the dashboard's 3D scene still works exactly as it did after Task 11/12 (buses moving, detections firing) — this is the final regression check for the whole project.

- [ ] **Step 2: Run the full test suite one more time**

Run: `npm test`
Expected: 5 test files, all passing (store, markers, DetectionService, Route, AnalysisService).

- [ ] **Step 3: Update README.md**

Add a short section to the existing `README.md` (append, don't rewrite the whole file) listing the four pages and what each does:

```markdown
## Pages

- `index.html` — 3D live dashboard (buses, simulated AI detection, glassmorphic stats panels)
- `upload.html` — upload a photo/video and get mock AI-analyzed road-issue results
- `cameras.html` — camera monitoring grid (demo feeds; real camera access not yet authorized)
- `issues.html` — list of detected road issues (type, mock photo, GPS, severity) with type filters

All AI/camera/GPS data on these pages is currently simulated. `src/ai/AnalysisService.js`
and `src/ai/DetectionService.js` are the two swap points for plugging in a real trained
model later via an API call — everything else in the UI is built against their existing
return shapes and won't need to change.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Document the four pages in README"
```
