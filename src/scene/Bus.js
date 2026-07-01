import { Group, Mesh, BoxGeometry, CylinderGeometry, ConeGeometry, MeshStandardMaterial, MeshBasicMaterial, DoubleSide, Vector3 } from 'three';
import { createRouteCurve, getPointOnRoute } from './Route.js';

const BUS_COLOR = 0xe2e8f0;
const BEAM_COLOR = 0x38bdf8;
const FORWARD_AXIS = new Vector3(0, 0, 1);

export function createBus({ routeId, speed = 0.03, offset = 0 }) {
  const curve = createRouteCurve(routeId);
  const group = new Group();

  const bodyMaterial = new MeshStandardMaterial({ color: BUS_COLOR, roughness: 0.4, metalness: 0.3 });

  const frontSegment = new Mesh(new BoxGeometry(2.6, 2.2, 5), bodyMaterial);
  frontSegment.position.set(0, 1.1, 2.2);
  const rearSegment = new Mesh(new BoxGeometry(2.6, 2.2, 4), bodyMaterial);
  rearSegment.position.set(0, 1.1, -2.6);
  const connector = new Mesh(new CylinderGeometry(1.1, 1.1, 1.2, 12), bodyMaterial);
  connector.rotation.z = Math.PI / 2;
  connector.position.set(0, 1.0, 0.5);
  group.add(frontSegment, rearSegment, connector);

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
    group.position.set(position.x, 0, position.z);
    group.lookAt(position.x + tangent.x, 0, position.z + tangent.z);
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
