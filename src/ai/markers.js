export const ISSUE_TYPES = {
  POTHOLE: { key: 'pothole', label: 'Yo\'l cho\'kishi', color: 0xe63946, icon: '🕳️' },
  CRACKED_ASPHALT: { key: 'cracked_asphalt', label: 'Yoriq asfalt', color: 0xf4a261, icon: '🧩' },
  STREETLIGHT: { key: 'streetlight', label: 'Chiroq ishlamayapti', color: 0xe9c46a, icon: '💡' },
  ROAD_DEBRIS: { key: 'road_debris', label: 'Yo\'lda chiqindi', color: 0x8b5cf6, icon: '🗑️' },
};

// Positions sit on the main avenue's two right-hand lanes (x = +3.5 for the
// into-the-distance direction, x = -3.5 toward the camera), verified against the
// route curve so a passing bus's scan beam reaches each one within DETECTION_RADIUS.
export const MARKERS = [
  { id: 'm1', routeId: 'route-a', position: { x: 3.5, z: -40 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm2', routeId: 'route-a', position: { x: 3.5, z: 6 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
  { id: 'm3', routeId: 'route-a', position: { x: 3.5, z: 52 }, type: ISSUE_TYPES.ROAD_DEBRIS },
  { id: 'm4', routeId: 'route-a', position: { x: -3.5, z: 40 }, type: ISSUE_TYPES.STREETLIGHT },
  { id: 'm5', routeId: 'route-a', position: { x: -3.5, z: -6 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm6', routeId: 'route-a', position: { x: -3.5, z: -52 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
];

export function findMarkersNear(routeId, position, radius) {
  return MARKERS.filter((marker) => {
    if (marker.routeId !== routeId) return false;
    const dx = marker.position.x - position.x;
    const dz = marker.position.z - position.z;
    return Math.sqrt(dx * dx + dz * dz) <= radius;
  });
}
