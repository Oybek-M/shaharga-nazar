# 3D Transport & Road Monitoring Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a front-end-only Vite + Three.js prototype of a 3D "AI monitoring" dashboard for public transport buses driving a stylized dusk cityscape of Andijon, with simulated AI detection markers and a glassmorphic UI overlay.

**Architecture:** Pure-logic modules (event store, marker data, detection simulation, route curves) are unit-tested with Vitest since they don't touch the DOM/WebGL. Scene modules (city, buses, post-processing, 3D labels) and UI panels are inherently visual and are verified manually by running the dev server and inspecting the rendered app with the preview tool — this matches the spec's explicit "no automated test suite, manual verification" decision for the visual layer.

**Tech Stack:** Vite (vanilla JS template, no framework), Three.js (WebGLRenderer, EffectComposer/UnrealBloomPass, CSS2DRenderer), Vitest for unit tests, plain HTML/CSS for glassmorphic UI panels.

---

## Task 1: Project scaffolding + render smoke test

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/style.css`
- Create: `src/main.js`
- Create: `.claude/launch.json`
- Create: `.gitignore`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "andijon-transport-ai-monitor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "vitest": "^2.1.0"
  },
  "dependencies": {
    "three": "^0.170.0"
  }
}
```

- [ ] **Step 2: Write .gitignore**

```
node_modules
dist
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`
Expected: installs succeed, `node_modules/` and `package-lock.json` are created, no errors.

- [ ] **Step 4: Write index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Andijon Public Transport & Road AI Monitoring System</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app">
      <canvas id="scene-canvas"></canvas>
      <div id="ui-root"></div>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 5: Write src/style.css (base layout only for now)**

```css
:root {
  --panel-bg: rgba(15, 23, 42, 0.55);
  --panel-border: rgba(148, 163, 184, 0.25);
  --accent-blue: #38bdf8;
  --text-primary: #e2e8f0;
  --text-muted: #94a3b8;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  background: #0b1220;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

#app { position: relative; width: 100vw; height: 100vh; }

#scene-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

#ui-root { position: absolute; inset: 0; pointer-events: none; }
```

- [ ] **Step 6: Write src/main.js as a minimal render smoke test (spinning cube)**

```js
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshStandardMaterial, Mesh, DirectionalLight, AmbientLight } from 'three';

const canvas = document.getElementById('scene-canvas');

const scene = new Scene();
const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new AmbientLight(0xffffff, 0.6));
const sun = new DirectionalLight(0xffffff, 1);
sun.position.set(3, 5, 2);
scene.add(sun);

const cube = new Mesh(new BoxGeometry(1.5, 1.5, 1.5), new MeshStandardMaterial({ color: 0x38bdf8 }));
scene.add(cube);

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

- [ ] **Step 7: Create .claude/launch.json for the preview tool**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 8: Start the dev server and verify the smoke test renders**

Use the preview tool to start configuration `dev`, then take a screenshot and check the console for errors.
Expected: a blue rotating cube on a dark background, no errors in console logs.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .gitignore index.html src/style.css src/main.js .claude/launch.json
git commit -m "Scaffold Vite + Three.js project with render smoke test"
```

---

## Task 2: Event store (`src/store.js`)

**Files:**
- Create: `src/store.js`
- Test: `src/store.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/store.test.js
import { describe, it, expect, vi } from 'vitest';
import { createStore } from './store.js';

describe('createStore', () => {
  it('returns initial state', () => {
    const store = createStore({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it('merges patches into state via setState', () => {
    const store = createStore({ count: 0, name: 'a' });
    store.setState({ count: 1 });
    expect(store.getState()).toEqual({ count: 1, name: 'a' });
  });

  it('notifies subscribers with the new state on setState', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ count: 5 });
    expect(listener).toHaveBeenCalledWith({ count: 5 });
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ count: 5 });
    expect(listener).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/store.test.js`
Expected: FAIL — `Cannot find module './store.js'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```js
// src/store.js
export function createStore(initialState) {
  const state = { ...initialState };
  const listeners = new Set();

  function getState() {
    return state;
  }

  function setState(patch) {
    Object.assign(state, patch);
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, setState, subscribe };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/store.test.js`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/store.js src/store.test.js
git commit -m "Add event store with pub/sub for UI state"
```

---

## Task 3: Marker data (`src/ai/markers.js`)

**Files:**
- Create: `src/ai/markers.js`
- Test: `src/ai/markers.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/ai/markers.test.js
import { describe, it, expect } from 'vitest';
import { findMarkersNear, MARKERS } from './markers.js';

describe('findMarkersNear', () => {
  it('returns markers on the given route within radius', () => {
    const result = findMarkersNear('route-a', { x: 12, z: -4 }, 5);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('m1');
  });

  it('excludes markers on a different route', () => {
    const result = findMarkersNear('route-b', { x: 12, z: -4 }, 5);
    expect(result).toHaveLength(0);
  });

  it('excludes markers outside the radius', () => {
    const result = findMarkersNear('route-a', { x: 0, z: 0 }, 5);
    expect(result).toHaveLength(0);
  });

  it('never mutates the MARKERS source array', () => {
    const before = MARKERS.length;
    findMarkersNear('route-a', { x: 12, z: -4 }, 5);
    expect(MARKERS).toHaveLength(before);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/ai/markers.test.js`
Expected: FAIL — `Cannot find module './markers.js'`.

- [ ] **Step 3: Write the implementation**

```js
// src/ai/markers.js
export const ISSUE_TYPES = {
  POTHOLE: { key: 'pothole', label: 'Pothole (Detected)', color: 0xe63946 },
  CRACKED_ASPHALT: { key: 'cracked_asphalt', label: 'Cracked Asphalt', color: 0xf4a261 },
  STREETLIGHT: { key: 'streetlight', label: 'Non-functioning Street Light', color: 0xe9c46a },
};

export const MARKERS = [
  { id: 'm1', routeId: 'route-a', position: { x: 12, z: -4 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm2', routeId: 'route-a', position: { x: -18, z: -4 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
  { id: 'm3', routeId: 'route-b', position: { x: 5, z: 22 }, type: ISSUE_TYPES.STREETLIGHT },
  { id: 'm4', routeId: 'route-b', position: { x: -10, z: -20 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm5', routeId: 'route-c', position: { x: 30, z: 3 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
];

export function findMarkersNear(routeId, position, radius) {
  return MARKERS.filter((marker) => {
    if (marker.routeId !== routeId) return false;
    const dx = marker.position.x - position.x;
    const dz = marker.position.z - position.z;
    return Math.sqrt(dx * dx + dz * dz) <= radius;
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/ai/markers.test.js`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/ai/markers.js src/ai/markers.test.js
git commit -m "Add fixed marker/issue data for simulated detection"
```

---

## Task 4: Simulated detection service (`src/ai/DetectionService.js`)

**Files:**
- Create: `src/ai/DetectionService.js`
- Test: `src/ai/DetectionService.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/ai/DetectionService.test.js
import { describe, it, expect } from 'vitest';
import { createDetectionService } from './DetectionService.js';

describe('createDetectionService', () => {
  it('returns a detection for a marker within range, with confidence in [90,99]', () => {
    const service = createDetectionService({ random: () => 0.5 });
    const results = service.detect('route-a', { x: 12, z: -4 });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ markerId: 'm1', type: 'pothole' });
    expect(results[0].confidence).toBeGreaterThanOrEqual(90);
    expect(results[0].confidence).toBeLessThanOrEqual(99);
  });

  it('does not re-trigger the same marker twice in a row', () => {
    const service = createDetectionService({ random: () => 0.5 });
    service.detect('route-a', { x: 12, z: -4 });
    const second = service.detect('route-a', { x: 12, z: -4 });
    expect(second).toHaveLength(0);
  });

  it('re-triggers a marker after reset() is called for it', () => {
    const service = createDetectionService({ random: () => 0.5 });
    service.detect('route-a', { x: 12, z: -4 });
    service.reset('m1');
    const result = service.detect('route-a', { x: 12, z: -4 });
    expect(result).toHaveLength(1);
  });

  it('returns an empty array when no marker is nearby', () => {
    const service = createDetectionService();
    const results = service.detect('route-a', { x: 0, z: 0 });
    expect(results).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/ai/DetectionService.test.js`
Expected: FAIL — `Cannot find module './DetectionService.js'`.

- [ ] **Step 3: Write the implementation**

```js
// src/ai/DetectionService.js
import { findMarkersNear } from './markers.js';

const DETECTION_RADIUS = 4;
const MIN_CONFIDENCE = 90;
const MAX_CONFIDENCE = 99;

export function createDetectionService({ random = Math.random } = {}) {
  const triggeredIds = new Set();

  function detect(routeId, beamPosition) {
    const nearby = findMarkersNear(routeId, beamPosition, DETECTION_RADIUS);
    const results = [];

    for (const marker of nearby) {
      if (triggeredIds.has(marker.id)) continue;
      triggeredIds.add(marker.id);
      const confidence = Math.round(MIN_CONFIDENCE + random() * (MAX_CONFIDENCE - MIN_CONFIDENCE));
      results.push({
        markerId: marker.id,
        position: marker.position,
        type: marker.type.key,
        label: marker.type.label,
        color: marker.type.color,
        confidence,
      });
    }

    return results;
  }

  function reset(markerId) {
    triggeredIds.delete(markerId);
  }

  return { detect, reset };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/ai/DetectionService.test.js`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/ai/DetectionService.js src/ai/DetectionService.test.js
git commit -m "Add simulated detection service with a swappable seam for real AI"
```

---

## Task 5: Route curves (`src/scene/Route.js`)

**Files:**
- Create: `src/scene/Route.js`
- Test: `src/scene/Route.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// src/scene/Route.test.js
import { describe, it, expect } from 'vitest';
import { createRouteCurve, getPointOnRoute, ROUTES } from './Route.js';

describe('createRouteCurve', () => {
  it('builds a closed curve for every defined route', () => {
    for (const routeId of Object.keys(ROUTES)) {
      const curve = createRouteCurve(routeId);
      expect(curve.closed).toBe(true);
    }
  });

  it('throws for an unknown routeId', () => {
    expect(() => createRouteCurve('nope')).toThrow('Unknown routeId: nope');
  });
});

describe('getPointOnRoute', () => {
  it('returns a position and a unit-length tangent', () => {
    const curve = createRouteCurve('route-a');
    const { position, tangent } = getPointOnRoute(curve, 0.25);
    expect(position.isVector3).toBe(true);
    expect(tangent.length()).toBeCloseTo(1, 5);
  });

  it('wraps t values outside [0,1) around the loop', () => {
    const curve = createRouteCurve('route-a');
    const a = getPointOnRoute(curve, 0.1);
    const b = getPointOnRoute(curve, 1.1);
    expect(a.position.distanceTo(b.position)).toBeCloseTo(0, 5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/scene/Route.test.js`
Expected: FAIL — `Cannot find module './Route.js'`.

- [ ] **Step 3: Write the implementation**

```js
// src/scene/Route.js
import { CatmullRomCurve3, Vector3 } from 'three';

export const ROUTES = {
  'route-a': [
    [-40, 0, -4], [-10, 0, -4], [12, 0, -4], [40, 0, -4],
  ],
  'route-b': [
    [-10, 0, -30], [-10, 0, 0], [5, 0, 22], [5, 0, 40],
  ],
  'route-c': [
    [-30, 0, 3], [0, 0, 3], [30, 0, 3], [45, 0, 3],
  ],
};

export function createRouteCurve(routeId) {
  const points = ROUTES[routeId];
  if (!points) throw new Error(`Unknown routeId: ${routeId}`);
  const vectors = points.map(([x, y, z]) => new Vector3(x, y, z));
  return new CatmullRomCurve3(vectors, true, 'catmullrom', 0.2);
}

export function getPointOnRoute(curve, t) {
  const wrapped = ((t % 1) + 1) % 1;
  const position = curve.getPointAt(wrapped);
  const tangent = curve.getTangentAt(wrapped);
  return { position, tangent };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/scene/Route.test.js`
Expected: PASS — 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/scene/Route.js src/scene/Route.test.js
git commit -m "Add closed spline routes for buses to follow"
```

---

## Task 6: Procedural city scene (`src/scene/City.js`)

This task is visual (geometry/lighting), so it is verified manually rather than with unit tests — consistent with the spec's decision that scene rendering has no automated test suite.

**Files:**
- Create: `src/scene/City.js`
- Modify: `src/main.js` (temporarily call `createCity(scene)` in place of the cube, to verify visually before Task 11 does the full wiring)

- [ ] **Step 1: Write the implementation**

```js
// src/scene/City.js
import { Group, Mesh, BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry, HemisphereLight, DirectionalLight, Color, Fog } from 'three';

const BUILDING_COLORS = [0x1e293b, 0x334155, 0x0f172a, 0x1e3a5f];

export function createCity(scene) {
  scene.background = new Color(0x0b1220);
  scene.fog = new Fog(0x0b1220, 60, 220);

  const hemi = new HemisphereLight(0xbfd8ff, 0x0b1220, 0.8);
  scene.add(hemi);

  const sun = new DirectionalLight(0xffb677, 1.1);
  sun.position.set(-60, 40, -30);
  scene.add(sun);

  const ground = new Mesh(
    new PlaneGeometry(400, 400),
    new MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  scene.add(createRoads());
  scene.add(createBuildings());
}

function createRoads() {
  const group = new Group();
  const roadMaterial = new MeshStandardMaterial({ color: 0x1a2233, roughness: 0.6 });
  const roadSpecs = [
    { x: 0, z: -4, w: 240, d: 8 },
    { x: 0, z: 22, w: 240, d: 8 },
    { x: 0, z: 3, w: 240, d: 8 },
    { x: -10, z: 0, w: 8, d: 240 },
    { x: 12, z: 0, w: 8, d: 240 },
  ];
  for (const spec of roadSpecs) {
    const mesh = new Mesh(new PlaneGeometry(spec.w, spec.d), roadMaterial);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(spec.x, 0.01, spec.z);
    group.add(mesh);
  }
  return group;
}

function createBuildings() {
  const group = new Group();
  let seed = 1;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 60; i += 1) {
    const x = (random() - 0.5) * 320;
    const z = (random() - 0.5) * 320;
    if (Math.abs(x) < 20 || Math.abs(z - 3) < 20 || Math.abs(z + 4) < 20 || Math.abs(z - 22) < 20) continue;

    const height = 6 + random() * 34;
    const width = 4 + random() * 6;
    const depth = 4 + random() * 6;
    const color = BUILDING_COLORS[Math.floor(random() * BUILDING_COLORS.length)];

    const material = new MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.3,
      emissive: new Color(0x0ea5e9),
      emissiveIntensity: random() * 0.15,
    });
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.position.set(x, height / 2, z);
    group.add(mesh);
  }
  return group;
}
```

- [ ] **Step 2: Temporarily wire it into main.js to verify visually**

Replace the cube-related lines in `src/main.js` (the `Mesh`/`BoxGeometry`/`MeshStandardMaterial` cube, and the ambient/directional lights added directly) with:

```js
import { createCity } from './scene/City.js';
// ...after camera setup, before the animate() function:
camera.position.set(0, 55, 70);
camera.lookAt(0, 0, 0);
createCity(scene);
```

Remove the `cube.rotation` lines from inside `animate()` (there is no cube anymore).

- [ ] **Step 3: Manual verification**

Use the preview tool (start config `dev` if not already running) to view the app, then take a screenshot.
Expected: a dark dusk-lit ground plane with road strips, dozens of glassy semi-transparent buildings of varying height scattered around the roads, camera looking down at an angle over the whole city. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/scene/City.js src/main.js
git commit -m "Add procedural dusk cityscape with roads and glass buildings"
```

---

## Task 7: Articulated bus with scan beam (`src/scene/Bus.js`)

**Files:**
- Create: `src/scene/Bus.js`
- Modify: `src/main.js` (temporarily add one bus to verify visually)

- [ ] **Step 1: Write the implementation**

```js
// src/scene/Bus.js
import { Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, MeshStandardMaterial, MeshBasicMaterial, DoubleSide } from 'three';
import { createRouteCurve, getPointOnRoute } from './Route.js';

const BUS_COLOR = 0xe2e8f0;
const BEAM_COLOR = 0x38bdf8;

export function createBus({ routeId, speed = 0.03, offset = 0 }) {
  const curve = createRouteCurve(routeId);
  const group = new Group();

  const bodyMaterial = new MeshStandardMaterial({ color: BUS_COLOR, roughness: 0.4, metalness: 0.3 });

  const frontSegment = new Mesh(new BoxGeometry(2.6, 2.2, 5), bodyMaterial);
  frontSegment.position.set(0, 1.1, -2.2);
  const rearSegment = new Mesh(new BoxGeometry(2.6, 2.2, 4), bodyMaterial);
  rearSegment.position.set(0, 1.1, 2.6);
  const connector = new Mesh(new CylinderGeometry(1.1, 1.1, 1.2, 12), bodyMaterial);
  connector.rotation.z = Math.PI / 2;
  connector.position.set(0, 1.0, 0.5);
  group.add(frontSegment, rearSegment, connector);

  const beamGeometry = new ConeGeometry(3.5, 10, 24, 1, true);
  beamGeometry.translate(0, -5, 0);
  const beam = new Mesh(
    beamGeometry,
    new MeshBasicMaterial({ color: BEAM_COLOR, transparent: true, opacity: 0.15, side: DoubleSide, depthWrite: false })
  );
  beam.rotation.x = 0.9;
  beam.position.set(0, 2.3, -2.5);
  group.add(beam);

  let t = offset;

  function update(delta) {
    t += speed * delta;
    const { position, tangent } = getPointOnRoute(curve, t);
    group.position.set(position.x, 0, position.z);
    group.lookAt(position.x + tangent.x, 0, position.z + tangent.z);
  }

  function getBeamWorldPosition(distance = 9) {
    const theta = group.rotation.y;
    return {
      x: group.position.x - Math.sin(theta) * distance,
      z: group.position.z - Math.cos(theta) * distance,
    };
  }

  return { object: group, update, getBeamWorldPosition, routeId };
}
```

- [ ] **Step 2: Temporarily wire one bus into main.js to verify visually**

In `src/main.js`, after `createCity(scene);`, add:

```js
import { createBus } from './scene/Bus.js';
// ...
const bus = createBus({ routeId: 'route-a', speed: 0.03, offset: 0 });
scene.add(bus.object);
```

In `animate()`, add `bus.update(0.016);` each frame (a fixed ~60fps timestep in seconds; call it right before `renderer.render(scene, camera);`) — Task 11 replaces this with a real clock-based delta.

- [ ] **Step 3: Manual verification**

Use the preview tool to view the running app, take a screenshot, and watch it for a few seconds via repeated screenshots.
Expected: an articulated two-segment bus visibly moves along the road in a loop, oriented facing its direction of travel, staying roughly on top of the road strips drawn in `City.js`, with a faint translucent blue cone (scan beam) projecting ahead of it toward the road. No console errors.
If the beam looks disconnected from the road or the bus orientation looks backwards, adjust the `rotation.x`/`position` values on `beam` or swap the front/rear segment `z` positions. If the route visibly drifts off the road strips, nudge the waypoint coordinates in `ROUTES` (`src/scene/Route.js`) to better match the `roadSpecs` in `City.js`. These are cosmetic tuning passes, not logic bugs.

- [ ] **Step 4: Commit**

```bash
git add src/scene/Bus.js src/main.js
git commit -m "Add articulated bus with route following and scan beam"
```

---

**Post-Task-7 correction (found in code review, applied in commit `6f8b0ea`):** the code above assumed `Object3D.lookAt()` orients the local `-Z` axis toward the target (the camera convention). For non-Camera/Light objects (like this `Group`), Three.js actually orients local `+Z` toward the target instead. This was fixed by moving `frontSegment`/`beam` to the `+Z` local side (and `rearSegment` to `-Z`), flipping the beam's tilt sign, and replacing the Euler-angle-based `getBeamWorldPosition` with a quaternion-based direction transform:

```js
import { Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, MeshStandardMaterial, MeshBasicMaterial, DoubleSide, Vector3 } from 'three';
// ... frontSegment.position.set(0, 1.1, 2.2); rearSegment.position.set(0, 1.1, -2.6);
// ... beam.rotation.x = -0.9; beam.position.set(0, 2.3, 2.5);

const FORWARD_AXIS = new Vector3(0, 0, 1);
function getBeamWorldPosition(distance = 9) {
  const direction = FORWARD_AXIS.clone().applyQuaternion(group.quaternion);
  return {
    x: group.position.x + direction.x * distance,
    z: group.position.z + direction.z * distance,
  };
}
```

Any later task reading this plan should use the corrected version above, not the original snippet.

## Task 8: Bloom post-processing (`src/scene/PostProcessing.js`)

**Files:**
- Create: `src/scene/PostProcessing.js`
- Modify: `src/main.js` (render through the composer instead of the raw renderer)

- [ ] **Step 1: Write the implementation**

```js
// src/scene/PostProcessing.js
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Vector2 } from 'three';

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.9,
    0.6,
    0.15
  );
  composer.addPass(bloomPass);

  function setSize(width, height) {
    composer.setSize(width, height);
    bloomPass.setSize(width, height);
  }

  return { composer, setSize };
}
```

- [ ] **Step 2: Wire it into main.js**

Add the import and, after the renderer is created:

```js
import { createPostProcessing } from './scene/PostProcessing.js';
// ...
const { composer, setSize } = createPostProcessing(renderer, scene, camera);
```

Replace `renderer.render(scene, camera);` in `animate()` with `composer.render();`.
In the `resize` listener, after `renderer.setSize(...)`, add `setSize(window.innerWidth, window.innerHeight);`.

- [ ] **Step 3: Manual verification**

Use the preview tool to view the app and take a screenshot.
Expected: the bus's scan beam and any emissive building glow now have a soft bloom/glow halo compared to before; overall image looks slightly brighter/softer around bright elements. No console errors, frame rate still smooth (no visible stutter in repeated screenshots).

- [ ] **Step 4: Commit**

```bash
git add src/scene/PostProcessing.js src/main.js
git commit -m "Add bloom post-processing for a futuristic glow look"
```

---

## Task 9: Floating 3D detection labels (`src/ui/Marker3D.js`)

**Files:**
- Create: `src/ui/Marker3D.js`
- Modify: `src/main.js` (add CSS2DRenderer and spawn a test marker to verify visually)
- Modify: `src/style.css` (add `.marker-label` style)

- [ ] **Step 1: Add the marker-label style**

Append to `src/style.css`:

```css
.marker-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
  color: #0b1220;
  font-weight: 600;
  transform: translate(-50%, -140%);
}
```

- [ ] **Step 2: Write the implementation**

```js
// src/ui/Marker3D.js
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const MARKER_LIFETIME_MS = 6000;

export function spawnMarker3D(scene, { markerId, position, label, color }, onExpire) {
  const el = document.createElement('div');
  el.className = 'marker-label';
  el.style.background = `#${color.toString(16).padStart(6, '0')}`;
  el.textContent = label;

  const object = new CSS2DObject(el);
  object.position.set(position.x, 2.5, position.z);
  scene.add(object);

  setTimeout(() => {
    scene.remove(object);
    el.remove();
    if (onExpire) onExpire(markerId);
  }, MARKER_LIFETIME_MS);

  return object;
}
```

- [ ] **Step 3: Wire CSS2DRenderer + a test marker into main.js to verify visually**

Add near the top of `src/main.js`:

```js
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { spawnMarker3D } from './ui/Marker3D.js';
```

After the WebGLRenderer is created:

```js
const uiRoot = document.getElementById('ui-root');
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
uiRoot.appendChild(labelRenderer.domElement);
```

After the bus is added to the scene (test code, will be removed in Task 11):

```js
spawnMarker3D(scene, { markerId: 'test', position: { x: 0, z: -4 }, label: 'Pothole (Detected)', color: 0xe63946 });
```

In `animate()`, after `composer.render();`, add `labelRenderer.render(scene, camera);`.
In the resize listener, add `labelRenderer.setSize(window.innerWidth, window.innerHeight);`.

- [ ] **Step 4: Manual verification**

Use the preview tool to view the app and take a screenshot.
Expected: a red pill-shaped label reading "Pothole (Detected)" floats above the road near the city center, staying anchored to that 3D point as the camera would move (camera is static here, so just confirm it renders in the right place), and disappears after ~6 seconds if you take a second screenshot later.

- [ ] **Step 5: Remove the test marker line** (`spawnMarker3D(scene, { markerId: 'test', ... })`) — Task 11 will spawn real ones from detection results.

- [ ] **Step 6: Commit**

```bash
git add src/ui/Marker3D.js src/main.js src/style.css
git commit -m "Add floating 3D detection labels via CSS2DRenderer"
```

---

## Task 10: Glassmorphic UI panels

**Files:**
- Create: `src/ui/LeftPanel.js`
- Create: `src/ui/RightPanel.js`
- Create: `src/ui/BottomLeftPanel.js`
- Modify: `src/style.css` (panel styling)
- Modify: `src/main.js` (mount the panels + top bar, wired to the store from Task 2)

- [ ] **Step 1: Append panel styles to src/style.css**

```css
.panel {
  position: absolute;
  pointer-events: auto;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 14px 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

#top-bar {
  top: 16px; left: 16px; right: 16px;
  display: flex; align-items: center; justify-content: space-between;
  height: 48px;
}
#top-bar h1 { font-size: 16px; margin: 0; font-weight: 600; letter-spacing: 0.3px; }

#left-panel { top: 80px; left: 16px; width: 260px; }
#left-panel .stat-row { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
#left-panel .stat-row .value { font-weight: 700; color: var(--accent-blue); }
#left-panel .stat-row.priority .value { color: #ef4444; }

#detections-list h3 { font-size: 12px; text-transform: uppercase; color: var(--text-muted); margin: 12px 0 6px; }
.detection-item {
  display: flex; gap: 8px; align-items: center;
  padding: 6px; border-radius: 8px; margin-bottom: 6px;
  background: rgba(255,255,255,0.03);
}
.detection-thumb {
  width: 48px; height: 32px; border-radius: 4px;
  background: linear-gradient(135deg, #1e293b, #334155);
  border: 1px solid var(--panel-border);
  flex-shrink: 0;
}
.detection-info { font-size: 11px; color: var(--text-muted); }
.detection-info strong { display: block; color: var(--text-primary); font-size: 12px; }

#right-panel { top: 80px; right: 16px; width: 200px; display: flex; flex-direction: column; gap: 10px; }
#minimap { width: 100%; height: 110px; border-radius: 8px; background: rgba(30,41,59,0.6); }
#weather-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }

#bottom-left-panel { bottom: 16px; left: 16px; display: flex; flex-direction: column; gap: 4px; width: 220px; }
.mode-button {
  pointer-events: auto;
  display: flex; align-items: center; gap: 8px;
  background: transparent; border: none; color: var(--text-primary);
  padding: 8px 6px; border-radius: 8px; cursor: pointer; font-size: 13px; text-align: left;
}
.mode-button:hover { background: rgba(255,255,255,0.06); }
.mode-button.active { background: rgba(56,189,248,0.15); color: var(--accent-blue); }
```

- [ ] **Step 2: Write src/ui/LeftPanel.js**

```js
export function mountLeftPanel(root, store) {
  const el = document.createElement('div');
  el.id = 'left-panel';
  el.className = 'panel';
  root.appendChild(el);

  function render(state) {
    el.innerHTML = `
      <div class="stat-row"><span>SYSTEM STATUS:</span><span class="value">${state.systemStatus}</span></div>
      <div class="stat-row"><span>ACTIVE BUSES:</span><span class="value">${state.activeBuses}</span></div>
      <div class="stat-row"><span>ISSUES DETECTED:</span><span class="value">${state.issuesDetected}</span></div>
      <div class="stat-row priority"><span>PRIORITY 1 ISSUES:</span><span class="value">${state.priorityIssues} ⚠️</span></div>
      <div id="detections-list">
        <h3>Recent Detections</h3>
        ${state.detections.map((d) => `
          <div class="detection-item">
            <div class="detection-thumb"></div>
            <div class="detection-info"><strong>${d.label}</strong>${d.confidence}% Confidence</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
```

- [ ] **Step 3: Write src/ui/RightPanel.js**

```js
export function mountRightPanel(root) {
  const el = document.createElement('div');
  el.id = 'right-panel';
  el.className = 'panel';
  el.innerHTML = `
    <div id="minimap"></div>
    <div id="weather-row"><span>\u{1F324}️ 29°C</span><span>\u{1F514}</span></div>
  `;
  root.appendChild(el);
}
```

- [ ] **Step 4: Write src/ui/BottomLeftPanel.js**

```js
const MODES = [
  { id: 'live', label: '\u{1F534} Live Mode' },
  { id: 'heatmap', label: '\u{1F525} Heatmap' },
  { id: 'playback', label: '▶ Simulation Playback' },
];

export function mountBottomLeftPanel(root, store) {
  const el = document.createElement('div');
  el.id = 'bottom-left-panel';
  el.className = 'panel';
  root.appendChild(el);

  function render(state) {
    el.innerHTML = MODES.map(
      (mode) => `<button class="mode-button${state.mode === mode.id ? ' active' : ''}" data-mode="${mode.id}">${mode.label}</button>`
    ).join('');

    el.querySelectorAll('.mode-button').forEach((button) => {
      button.addEventListener('click', () => {
        store.setState({ mode: button.dataset.mode });
      });
    });
  }

  render(store.getState());
  store.subscribe(render);
}
```

- [ ] **Step 5: Mount the panels and top bar in main.js**

Add imports:

```js
import { createStore } from './store.js';
import { mountLeftPanel } from './ui/LeftPanel.js';
import { mountRightPanel } from './ui/RightPanel.js';
import { mountBottomLeftPanel } from './ui/BottomLeftPanel.js';
```

After `uiRoot` is defined, add:

```js
const topBar = document.createElement('div');
topBar.id = 'top-bar';
topBar.className = 'panel';
topBar.innerHTML = '<h1>Andijon Public Transport & Road AI Monitoring System</h1>';
uiRoot.appendChild(topBar);

const store = createStore({
  systemStatus: 'OPTIMIZED',
  activeBuses: 1,
  issuesDetected: 0,
  priorityIssues: 0,
  detections: [],
  mode: 'live',
});

mountLeftPanel(uiRoot, store);
mountRightPanel(uiRoot);
mountBottomLeftPanel(uiRoot, store);
```

- [ ] **Step 6: Manual verification**

Use the preview tool to view the app and take a screenshot.
Expected: top bar with title, left panel showing stats (all zero/one) and an empty "Recent Detections" list, right panel with minimap box + weather + bell, bottom-left panel with three clickable mode buttons. Click each mode button and confirm the "active" highlight moves between them (use `preview_click` on `.mode-button[data-mode="heatmap"]` etc.). No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/ui/LeftPanel.js src/ui/RightPanel.js src/ui/BottomLeftPanel.js src/style.css src/main.js
git commit -m "Add glassmorphic UI panels wired to the event store"
```

---

## Task 11: Full integration in main.js

This task replaces the incremental test-wiring from Tasks 6-10 with the final, complete `main.js` that ties every module together: multiple buses, the real detection loop (with marker-expiry reset), WebGL availability fallback, and the full render pipeline.

**Files:**
- Modify: `src/main.js` (rewrite in full)

- [ ] **Step 1: Rewrite src/main.js in full**

```js
import { Scene, PerspectiveCamera, WebGLRenderer, Clock, ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { createCity } from './scene/City.js';
import { createBus } from './scene/Bus.js';
import { createPostProcessing } from './scene/PostProcessing.js';
import { spawnMarker3D } from './ui/Marker3D.js';
import { createDetectionService } from './ai/DetectionService.js';
import { createStore } from './store.js';
import { mountLeftPanel } from './ui/LeftPanel.js';
import { mountRightPanel } from './ui/RightPanel.js';
import { mountBottomLeftPanel } from './ui/BottomLeftPanel.js';

function isWebglAvailable() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function showWebglFallback() {
  document.body.innerHTML = '<p style="color:#e2e8f0;text-align:center;margin-top:40vh;font-family:sans-serif;">WebGL is not available in this browser.</p>';
}

function init() {
  const canvas = document.getElementById('scene-canvas');
  const uiRoot = document.getElementById('ui-root');

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 55, 70);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  uiRoot.appendChild(labelRenderer.domElement);

  createCity(scene);

  const buses = [
    createBus({ routeId: 'route-a', speed: 0.028, offset: 0 }),
    createBus({ routeId: 'route-a', speed: 0.028, offset: 0.5 }),
    createBus({ routeId: 'route-b', speed: 0.022, offset: 0.2 }),
    createBus({ routeId: 'route-c', speed: 0.025, offset: 0.7 }),
  ];
  buses.forEach((bus) => scene.add(bus.object));

  const { composer, setSize } = createPostProcessing(renderer, scene, camera);
  const detectionService = createDetectionService();

  const topBar = document.createElement('div');
  topBar.id = 'top-bar';
  topBar.className = 'panel';
  topBar.innerHTML = '<h1>Andijon Public Transport & Road AI Monitoring System</h1>';
  uiRoot.appendChild(topBar);

  const store = createStore({
    systemStatus: 'OPTIMIZED',
    activeBuses: buses.length,
    issuesDetected: 0,
    priorityIssues: 0,
    detections: [],
    mode: 'live',
  });

  mountLeftPanel(uiRoot, store);
  mountRightPanel(uiRoot);
  mountBottomLeftPanel(uiRoot, store);

  const clock = new Clock();

  function handleDetection(result) {
    spawnMarker3D(scene, result, (markerId) => detectionService.reset(markerId));
    const state = store.getState();
    store.setState({
      issuesDetected: state.issuesDetected + 1,
      priorityIssues: result.type === 'pothole' ? state.priorityIssues + 1 : state.priorityIssues,
      detections: [
        { label: result.label, confidence: result.confidence, id: `${result.markerId}-${Date.now()}` },
        ...state.detections,
      ].slice(0, 6),
    });
  }

  function animate() {
    const delta = clock.getDelta();

    for (const bus of buses) {
      bus.update(delta);
      const beamPos = bus.getBeamWorldPosition();
      const results = detectionService.detect(bus.routeId, beamPos);
      results.forEach(handleDetection);
    }

    composer.render();
    labelRenderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (isWebglAvailable()) {
  init();
} else {
  showWebglFallback();
}
```

- [ ] **Step 2: Manual verification**

Use the preview tool to view the app and take a screenshot, then wait a few seconds and take another.
Expected: four buses moving continuously along their routes through the cityscape, each with a scan beam; as beams cross the five fixed marker points, colored labels ("Pothole (Detected)", "Cracked Asphalt", "Non-functioning Street Light") appear at those road positions and the Left Panel's issue counters and "Recent Detections" list update to match. No console errors over ~30 seconds of running.

- [ ] **Step 3: Run the unit test suite once more to confirm nothing broke**

Run: `npm test`
Expected: all Vitest suites from Tasks 2-5 still pass.

- [ ] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "Wire full scene, detection loop, and UI panels together in main.js"
```

---

## Task 12: README and final verification pass

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

```markdown
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
```

- [ ] **Step 2: Full manual verification against the spec's verification plan**

Use the preview tool to run the app and check each of the following:
- [ ] Buses move continuously and loop along their routes without popping/jumping.
- [ ] Scan beams visibly sweep the road ahead of each bus.
- [ ] Markers spawn with correct color/icon/label when a beam crosses a marker point.
- [ ] Left Panel's stats and detection feed update in sync with spawned markers.
- [ ] All three bottom-left buttons are clickable and change visual (active) state.
- [ ] No errors in `preview_console_logs` (level: error) during a few minutes of continuous running.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add project README with run instructions"
```
