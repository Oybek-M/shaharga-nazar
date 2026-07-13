import {
  Group, Mesh, BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial,
  PlaneGeometry, CircleGeometry, BufferGeometry, BufferAttribute,
  HemisphereLight, DirectionalLight, Color, Fog,
} from 'three';
import { ROUTES, createRouteCurve } from './Route.js';

const BUILDING_COLORS = [0x1e293b, 0x334155, 0x0f172a, 0x1e3a5f];

// Neon AI-nav overlays, one glowing colour per monitored road.
const ROUTE_LINE_COLORS = {
  'route-a': 0x22d3ee,
  'route-b': 0x34d399,
};

const ROAD_HALF = 7;      // road is 14 wide (two ~3.5 lanes)
const LANE_OFFSET = 3.5;  // must match Bus.js

export function createCity(scene) {
  scene.background = new Color(0x0b1220);
  scene.fog = new Fog(0x0b1220, 100, 300);

  const hemi = new HemisphereLight(0xbfd8ff, 0x0b1220, 0.9);
  scene.add(hemi);

  const sun = new DirectionalLight(0xffb677, 1.15);
  sun.position.set(-60, 50, -20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -130;
  sun.shadow.camera.right = 130;
  sun.shadow.camera.top = 130;
  sun.shadow.camera.bottom = -130;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 220;
  sun.shadow.bias = -0.0015;
  scene.add(sun);

  const ground = new Mesh(
    new PlaneGeometry(600, 600),
    new MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  scene.add(createRoads());
  scene.add(createRouteLines());
  scene.add(createBuildings());
}

function flatPlane(w, d, mat, x, z, y) {
  const m = new Mesh(new PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  return m;
}

// A realistic four-way intersection: dark asphalt, dashed centre lines, solid
// lane edges, zebra crossings on all four approaches, curbs, and a few damaged
// patches so the road reads like the reference photos.
function createRoads() {
  const group = new Group();
  const asphalt = new MeshStandardMaterial({ color: 0x33353d, roughness: 0.92, metalness: 0.0 });
  const whiteLine = new MeshStandardMaterial({ color: 0xd8dee9, roughness: 0.5, emissive: new Color(0x223049), emissiveIntensity: 0.15 });
  const yellowLine = new MeshStandardMaterial({ color: 0xe6c34a, roughness: 0.5, emissive: new Color(0x3a2f10), emissiveIntensity: 0.12 });
  const curbMat = new MeshStandardMaterial({ color: 0x4a5163, roughness: 0.9 });
  const patchMat = new MeshStandardMaterial({ color: 0x141519, roughness: 1.0 });

  // Main avenue runs along Z (into the distance); cross street runs along X.
  const main = flatPlane(14, 140, asphalt, 0, 0, 0.01);
  main.receiveShadow = true;
  group.add(main);
  const cross = flatPlane(110, 14, asphalt, 0, 0, 0.012);
  cross.receiveShadow = true;
  group.add(cross);

  // Dashed yellow centre lines (skip the intersection box).
  for (let z = -68; z <= 68; z += 6) {
    if (Math.abs(z) < 9) continue;
    group.add(flatPlane(0.3, 3, yellowLine, 0, z, 0.03));
  }
  for (let x = -53; x <= 53; x += 6) {
    if (Math.abs(x) < 9) continue;
    group.add(flatPlane(3, 0.3, yellowLine, x, 0, 0.032));
  }

  // Solid white lane edges, broken where the cross street opens up.
  for (const side of [-7, 7]) {
    group.add(flatPlane(0.25, 63, whiteLine, side, -38.5, 0.03));
    group.add(flatPlane(0.25, 63, whiteLine, side, 38.5, 0.03));
  }
  for (const side of [-7, 7]) {
    group.add(flatPlane(48, 0.25, whiteLine, -31, side, 0.032));
    group.add(flatPlane(48, 0.25, whiteLine, 31, side, 0.032));
  }

  // Zebra crossings on all four approaches.
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 5; i += 1) {
      group.add(flatPlane(12, 0.6, whiteLine, 0, sign * (9.5 + i * 1.3), 0.033));
      group.add(flatPlane(0.6, 12, whiteLine, sign * (9.5 + i * 1.3), 0, 0.034));
    }
  }

  // Curbs beside each road arm.
  const curbW = 1.4;
  for (const side of [-1, 1]) {
    const xc = side * (ROAD_HALF + curbW / 2);
    group.add(flatPlane(curbW, 63, curbMat, xc, -38.5, 0.006));
    group.add(flatPlane(curbW, 63, curbMat, xc, 38.5, 0.006));
    const zc = side * (ROAD_HALF + curbW / 2);
    group.add(flatPlane(48, curbW, curbMat, -31, zc, 0.006));
    group.add(flatPlane(48, curbW, curbMat, 31, zc, 0.006));
  }

  // Damaged patches near the pothole/crack markers.
  for (const [px, pz, r] of [[3.5, -40, 2.2], [-3.5, -6, 1.8], [3.5, 6, 1.6], [-3.5, -52, 1.5]]) {
    const patch = new Mesh(new CircleGeometry(r, 18), patchMat);
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(px, 0.02, pz);
    group.add(patch);
  }

  // Expansion-joint seams — thin dark strips crossing the asphalt at regular
  // intervals, breaking up the flat plane without needing any texture image.
  const seamMat = new MeshStandardMaterial({ color: 0x1a1c24, roughness: 1.0, metalness: 0.0 });
  for (let z = -66; z <= 66; z += 12) {
    if (Math.abs(z) < 10) continue;
    group.add(flatPlane(14, 0.15, seamMat, 0, z, 0.035));
  }
  for (let x = -54; x <= 54; x += 12) {
    if (Math.abs(x) < 10) continue;
    group.add(flatPlane(0.15, 14, seamMat, x, 0, 0.038));
  }

  // A manhole cover on the main avenue — a small grounded prop that reads
  // clearly at the elevated dashboard camera angle.
  const coverMat = new MeshStandardMaterial({ color: 0x2a2e38, roughness: 0.25, metalness: 0.6 });
  const coverRimMat = new MeshStandardMaterial({ color: 0x14151a, roughness: 0.9, metalness: 0.1 });
  const coverRim = new Mesh(new CircleGeometry(0.95, 24), coverRimMat);
  coverRim.rotation.x = -Math.PI / 2;
  coverRim.position.set(0, 0.04, -20);
  group.add(coverRim);
  const cover = new Mesh(new CircleGeometry(0.78, 24), coverMat);
  cover.rotation.x = -Math.PI / 2;
  cover.position.set(0, 0.045, -20);
  group.add(cover);

  return group;
}

// Flat glowing ribbon following a route curve, offset onto the right-hand lane.
function buildLaneRibbon(curve, width, laneOffset, y) {
  const segments = 160;
  const half = width / 2;
  const verts = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const rx = -tan.z;
    const rz = tan.x;
    const cx = p.x + rx * laneOffset;
    const cz = p.z + rz * laneOffset;
    verts.push(cx + rx * half, y, cz + rz * half);
    verts.push(cx - rx * half, y, cz - rz * half);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3));
  const indices = [];
  for (let i = 0; i < segments; i += 1) {
    const a = 2 * i, b = 2 * i + 1, c = 2 * i + 2, d = 2 * i + 3;
    indices.push(a, b, d, a, d, c);
  }
  geo.setIndex(indices);
  return geo;
}

function createRouteLines() {
  const group = new Group();
  for (const routeId of Object.keys(ROUTES)) {
    const color = ROUTE_LINE_COLORS[routeId];
    if (!color) continue;
    const curve = createRouteCurve(routeId);
    const glow = new Mesh(
      buildLaneRibbon(curve, 3.0, LANE_OFFSET, 0.05),
      new MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false })
    );
    const core = new Mesh(
      buildLaneRibbon(curve, 1.1, LANE_OFFSET, 0.06),
      new MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false })
    );
    group.add(glow, core);
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

  // Keep towers off both road arms and out of the near-camera foreground so the
  // intersection stays clearly in view.
  const isBlocked = (x, z) =>
    (Math.abs(x) < 11 && Math.abs(z) < 82) ||
    (Math.abs(z) < 11 && Math.abs(x) < 62) ||
    z > 16;

  let placed = 0;
  let attempts = 0;
  while (placed < 64 && attempts < 600) {
    attempts += 1;
    const x = (random() - 0.5) * 300;
    const z = (random() - 0.5) * 260 - 40; // bias toward the background
    if (isBlocked(x, z)) continue;

    const height = 6 + random() * 36;
    const width = 4 + random() * 6;
    const depth = 4 + random() * 6;
    const color = BUILDING_COLORS[Math.floor(random() * BUILDING_COLORS.length)];
    const isWarmLit = random() > 0.6;

    const material = new MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity: 0.78,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.3,
      emissive: new Color(isWarmLit ? 0xffcf8a : 0x0ea5e9),
      emissiveIntensity: isWarmLit ? 0.25 + random() * 0.35 : random() * 0.15,
    });
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    placed += 1;
  }
  return group;
}
