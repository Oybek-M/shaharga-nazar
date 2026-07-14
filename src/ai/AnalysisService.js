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
      results.push({ type: type.key, label: type.label, color: type.color, icon: type.icon, confidence });
    }
    return { results };
  }

  return { analyzeMedia };
}
