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
