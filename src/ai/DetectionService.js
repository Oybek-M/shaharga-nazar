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
        icon: marker.type.icon,
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
