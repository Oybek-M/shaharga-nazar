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
