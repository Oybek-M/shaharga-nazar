import { CatmullRomCurve3, Vector3 } from 'three';

// A single four-way intersection. `route-a` is the main avenue (buses run here);
// `route-b` is the crossing street (decorative — no buses cross the box, so the
// traffic can never collide). Each is a closed path so a bus runs the length and
// returns on the opposite right-hand lane (see the lane offset in Bus.js).
export const ROUTES = {
  'route-a': [
    [0, 0, -70], [0, 0, -24], [0, 0, 24], [0, 0, 70],
  ],
  'route-b': [
    [-55, 0, 0], [-18, 0, 0], [18, 0, 0], [55, 0, 0],
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
