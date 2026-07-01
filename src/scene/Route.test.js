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
