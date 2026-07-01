import { Group, Mesh, BoxGeometry, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry, HemisphereLight, DirectionalLight, Color, Fog } from 'three';

const BUILDING_COLORS = [0x1e293b, 0x334155, 0x0f172a, 0x1e3a5f];

export function createCity(scene) {
  scene.background = new Color(0x0b1220);
  scene.fog = new Fog(0x0b1220, 60, 220);

  const hemi = new HemisphereLight(0xbfd8ff, 0x0b1220, 0.8);
  scene.add(hemi);

  const sun = new DirectionalLight(0xffb677, 1.1);
  sun.position.set(-60, 40, -30);
  scene.add(sun);

  const ground = new Mesh(
    new PlaneGeometry(400, 400),
    new MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  scene.add(createRoads());
  scene.add(createBuildings());
}

function createRoads() {
  const group = new Group();
  const roadMaterial = new MeshStandardMaterial({ color: 0x1a2233, roughness: 0.6 });
  const roadSpecs = [
    { x: 0, z: -4, w: 240, d: 8 },
    { x: 0, z: 22, w: 240, d: 8 },
    { x: 0, z: 3, w: 240, d: 8 },
    { x: -10, z: 0, w: 8, d: 240 },
    { x: 12, z: 0, w: 8, d: 240 },
  ];
  for (const spec of roadSpecs) {
    const mesh = new Mesh(new PlaneGeometry(spec.w, spec.d), roadMaterial);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(spec.x, 0.01, spec.z);
    group.add(mesh);
  }
  return group;
}

function createBuildings() {
  const group = new Group();
  let seed = 1;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 60; i += 1) {
    const x = (random() - 0.5) * 320;
    const z = (random() - 0.5) * 320;
    if (Math.abs(x) < 20 || Math.abs(z - 3) < 20 || Math.abs(z + 4) < 20 || Math.abs(z - 22) < 20) continue;

    const height = 6 + random() * 34;
    const width = 4 + random() * 6;
    const depth = 4 + random() * 6;
    const color = BUILDING_COLORS[Math.floor(random() * BUILDING_COLORS.length)];

    const material = new MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.3,
      emissive: new Color(0x0ea5e9),
      emissiveIntensity: random() * 0.15,
    });
    const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
    mesh.position.set(x, height / 2, z);
    group.add(mesh);
  }
  return group;
}
