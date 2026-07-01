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
