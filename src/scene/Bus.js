import { Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, MeshStandardMaterial, MeshBasicMaterial, DoubleSide, Vector3 } from 'three';
import { createRouteCurve, getPointOnRoute } from './Route.js';

const BUS_COLOR = 0xe2e8f0;
const BEAM_COLOR = 0x38bdf8;
const FORWARD_AXIS = new Vector3(0, 0, 1);
const LANE_OFFSET = 3.5;

export function createBus({ routeId, speed = 0.03, offset = 0 }) {
  const curve = createRouteCurve(routeId);
  const group = new Group();

  const bodyMaterial = new MeshStandardMaterial({ color: BUS_COLOR, roughness: 0.4, metalness: 0.3 });
  const glassMaterial = new MeshStandardMaterial({
    color: 0x1e3a5f, roughness: 0.15, metalness: 0.6, emissive: 0x38bdf8, emissiveIntensity: 0.5,
  });
  const headlightMaterial = new MeshStandardMaterial({
    color: 0xfff3d6, roughness: 0.3, emissive: 0xffe9a8, emissiveIntensity: 1.4,
  });
  const taillightMaterial = new MeshStandardMaterial({
    color: 0x7f1d1d, roughness: 0.3, emissive: 0xff3b3b, emissiveIntensity: 1.1,
  });
  const roofStripMaterial = new MeshStandardMaterial({
    color: 0x38bdf8, roughness: 0.3, emissive: 0x38bdf8, emissiveIntensity: 1.6,
  });

  const frontSegment = new Mesh(new BoxGeometry(2.6, 2.2, 5), bodyMaterial);
  frontSegment.position.set(0, 1.1, 2.2);
  frontSegment.castShadow = true;
  const rearSegment = new Mesh(new BoxGeometry(2.6, 2.2, 4), bodyMaterial);
  rearSegment.position.set(0, 1.1, -2.6);
  rearSegment.castShadow = true;
  const connector = new Mesh(new CylinderGeometry(1.1, 1.1, 1.2, 12), bodyMaterial);
  connector.rotation.z = Math.PI / 2;
  connector.position.set(0, 1.0, 0.5);
  connector.castShadow = true;
  group.add(frontSegment, rearSegment, connector);

  const windshield = new Mesh(new BoxGeometry(2.2, 0.75, 0.12), glassMaterial);
  windshield.position.set(0, 1.65, 4.66);
  group.add(windshield);

  const rearWindow = new Mesh(new BoxGeometry(2.2, 0.75, 0.12), glassMaterial);
  rearWindow.position.set(0, 1.65, -4.65);
  group.add(rearWindow);

  // Glowing window band wrapping both segments, plus a roof light strip —
  // gives the bus a lit, futuristic silhouette that reads clearly from the
  // elevated dashboard camera.
  const sideWindowGeometry = new BoxGeometry(0.1, 0.55, 8.6);
  for (const side of [-1, 1]) {
    const sideWindow = new Mesh(sideWindowGeometry, glassMaterial);
    sideWindow.position.set(side * 1.31, 1.7, 0.05);
    group.add(sideWindow);
  }

  const roofStrip = new Mesh(new BoxGeometry(0.35, 0.08, 8.6), roofStripMaterial);
  roofStrip.position.set(0, 2.25, 0.05);
  group.add(roofStrip);

  const headlightGeometry = new BoxGeometry(0.35, 0.3, 0.1);
  for (const side of [-1, 1]) {
    const headlight = new Mesh(headlightGeometry, headlightMaterial);
    headlight.position.set(side * 0.9, 0.6, 4.66);
    group.add(headlight);

    const taillight = new Mesh(headlightGeometry, taillightMaterial);
    taillight.position.set(side * 0.9, 0.6, -4.61);
    group.add(taillight);
  }

  const beamGeometry = new ConeGeometry(3.5, 10, 24, 1, true);
  beamGeometry.translate(0, -5, 0);
  const beam = new Mesh(
    beamGeometry,
    new MeshBasicMaterial({ color: BEAM_COLOR, transparent: true, opacity: 0.15, side: DoubleSide, depthWrite: false })
  );
  beam.rotation.x = -0.9;
  beam.position.set(0, 2.3, 2.5);
  group.add(beam);

  let t = offset;

  function update(delta) {
    t += speed * delta;
    const { position, tangent } = getPointOnRoute(curve, t);
    // Shift the bus onto the right-hand lane of its road. The unit vector to the
    // right of the travel direction (with +Y up) is (-tangent.z, 0, tangent.x),
    // so buses keep to the right like real Uzbek traffic and return trips run on
    // the opposite lane instead of retracing the centerline.
    const laneX = position.x - tangent.z * LANE_OFFSET;
    const laneZ = position.z + tangent.x * LANE_OFFSET;
    group.position.set(laneX, 0, laneZ);
    group.lookAt(laneX + tangent.x, 0, laneZ + tangent.z);
  }

  function getBeamWorldPosition(distance = 9) {
    const direction = FORWARD_AXIS.clone().applyQuaternion(group.quaternion);
    return {
      x: group.position.x + direction.x * distance,
      z: group.position.z + direction.z * distance,
    };
  }

  return { object: group, update, getBeamWorldPosition, routeId };
}
