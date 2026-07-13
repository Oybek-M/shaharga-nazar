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
  const wheelMaterial = new MeshStandardMaterial({ color: 0x161616, roughness: 0.9, metalness: 0.1 });
  const hubMaterial = new MeshStandardMaterial({ color: 0x8a94a6, roughness: 0.4, metalness: 0.7 });
  const mirrorMaterial = new MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.6 });
  const acUnitMaterial = new MeshStandardMaterial({ color: 0x475169, roughness: 0.7, metalness: 0.2 });
  const liveryMaterial = new MeshStandardMaterial({
    color: 0xe8edf5, roughness: 0.35, metalness: 0.1, emissive: 0x38bdf8, emissiveIntensity: 0.12,
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

  // A thin light livery band along the waistline — reads as a painted stripe
  // rather than a flat panel, breaking up the boxy silhouette.
  const liveryGeometry = new BoxGeometry(0.05, 0.28, 8.8);
  for (const side of [-1, 1]) {
    const stripe = new Mesh(liveryGeometry, liveryMaterial);
    stripe.position.set(side * 1.33, 0.95, 0.05);
    group.add(stripe);
  }

  // Roof-mounted AC/equipment box — sits above the light strip near the front,
  // a common articulated-bus detail that reads well from the elevated camera.
  const acUnit = new Mesh(new BoxGeometry(0.9, 0.42, 1.1), acUnitMaterial);
  acUnit.position.set(0, 2.56, 1.6);
  acUnit.castShadow = true;
  group.add(acUnit);

  // Door-side wing mirrors flanking the windshield.
  const mirrorArmGeometry = new BoxGeometry(0.06, 0.06, 0.35);
  const mirrorHeadGeometry = new BoxGeometry(0.3, 0.38, 0.08);
  for (const side of [-1, 1]) {
    const arm = new Mesh(mirrorArmGeometry, mirrorMaterial);
    arm.position.set(side * 1.42, 1.55, 4.15);
    group.add(arm);
    const head = new Mesh(mirrorHeadGeometry, mirrorMaterial);
    head.position.set(side * 1.58, 1.55, 4.15);
    group.add(head);
  }

  // Wheels: dark tyres with a metallic hub, tucked half-under the body edges
  // so they read as wheels from the side without exposing the flat underside.
  const tyreGeometry = new CylinderGeometry(0.52, 0.52, 0.34, 18);
  const hubGeometry = new CylinderGeometry(0.24, 0.24, 0.36, 12);
  for (const wz of [2.6, -3.1]) {
    for (const side of [-1, 1]) {
      const tyre = new Mesh(tyreGeometry, wheelMaterial);
      tyre.rotation.z = Math.PI / 2;
      tyre.position.set(side * 1.35, 0.52, wz);
      group.add(tyre);
      const hub = new Mesh(hubGeometry, hubMaterial);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(side * 1.35, 0.52, wz);
      group.add(hub);
    }
  }

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
