export const ISSUE_TYPES = {
  POTHOLE: { key: 'pothole', label: 'Pothole (Detected)', color: 0xe63946 },
  CRACKED_ASPHALT: { key: 'cracked_asphalt', label: 'Cracked Asphalt', color: 0xf4a261 },
  STREETLIGHT: { key: 'streetlight', label: 'Non-functioning Street Light', color: 0xe9c46a },
  ROAD_DEBRIS: { key: 'road_debris', label: 'Road Debris', color: 0x8b5cf6 },
};

export const MARKERS = [
  { id: 'm1', routeId: 'route-a', position: { x: 12, z: -4 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm2', routeId: 'route-a', position: { x: -18, z: -4 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
  { id: 'm3', routeId: 'route-b', position: { x: 5, z: 22 }, type: ISSUE_TYPES.STREETLIGHT },
  { id: 'm4', routeId: 'route-b', position: { x: -10, z: -20 }, type: ISSUE_TYPES.POTHOLE },
  { id: 'm5', routeId: 'route-c', position: { x: 30, z: 3 }, type: ISSUE_TYPES.CRACKED_ASPHALT },
];

export function findMarkersNear(routeId, position, radius) {
  return MARKERS.filter((marker) => {
    if (marker.routeId !== routeId) return false;
    const dx = marker.position.x - position.x;
    const dz = marker.position.z - position.z;
    return Math.sqrt(dx * dx + dz * dz) <= radius;
  });
}
