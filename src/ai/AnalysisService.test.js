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
