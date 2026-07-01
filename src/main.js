import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { createCity } from './scene/City.js';
import { createBus } from './scene/Bus.js';
import { createPostProcessing } from './scene/PostProcessing.js';

const canvas = document.getElementById('scene-canvas');

const scene = new Scene();
const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 55, 70);
camera.lookAt(0, 0, 0);

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const { composer, setSize } = createPostProcessing(renderer, scene, camera);

createCity(scene);

const bus = createBus({ routeId: 'route-a', speed: 0.03, offset: 0 });
scene.add(bus.object);

function animate() {
  bus.update(0.016);
  composer.render();
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setSize(window.innerWidth, window.innerHeight);
});
