import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const MARKER_LIFETIME_MS = 6000;

export function spawnMarker3D(scene, { markerId, position, label, color }, onExpire) {
  const el = document.createElement('div');
  el.className = 'marker-label';
  el.style.background = `#${color.toString(16).padStart(6, '0')}`;
  el.textContent = label;

  const object = new CSS2DObject(el);
  object.position.set(position.x, 2.5, position.z);
  scene.add(object);

  setTimeout(() => {
    scene.remove(object);
    el.remove();
    if (onExpire) onExpire(markerId);
  }, MARKER_LIFETIME_MS);

  return object;
}
