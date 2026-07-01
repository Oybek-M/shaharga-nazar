import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Vector2 } from 'three';

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    0.9,
    0.6,
    0.15
  );
  composer.addPass(bloomPass);

  function setSize(width, height) {
    composer.setSize(width, height);
    bloomPass.setSize(width, height);
  }

  return { composer, setSize };
}
