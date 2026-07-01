import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshStandardMaterial, Mesh, DirectionalLight, AmbientLight } from 'three';

const canvas = document.getElementById('scene-canvas');

const scene = new Scene();
const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 2, 6);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

scene.add(new AmbientLight(0xffffff, 0.6));
const sun = new DirectionalLight(0xffffff, 1);
sun.position.set(3, 5, 2);
scene.add(sun);

const cube = new Mesh(new BoxGeometry(1.5, 1.5, 1.5), new MeshStandardMaterial({ color: 0x38bdf8 }));
scene.add(cube);

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.015;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
