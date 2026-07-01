import { Scene, PerspectiveCamera, WebGLRenderer, Clock, ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { createCity } from './scene/City.js';
import { createBus } from './scene/Bus.js';
import { createPostProcessing } from './scene/PostProcessing.js';
import { spawnMarker3D } from './ui/Marker3D.js';
import { createDetectionService } from './ai/DetectionService.js';
import { createStore } from './store.js';
import { mountLeftPanel } from './ui/LeftPanel.js';
import { mountRightPanel } from './ui/RightPanel.js';
import { mountBottomLeftPanel } from './ui/BottomLeftPanel.js';

function isWebglAvailable() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function showWebglFallback() {
  document.body.innerHTML = '<p style="color:#e2e8f0;text-align:center;margin-top:40vh;font-family:sans-serif;">WebGL is not available in this browser.</p>';
}

function init() {
  const canvas = document.getElementById('scene-canvas');
  const uiRoot = document.getElementById('ui-root');

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 55, 70);
  camera.lookAt(0, 0, 0);

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  uiRoot.appendChild(labelRenderer.domElement);

  createCity(scene);

  const buses = [
    createBus({ routeId: 'route-a', speed: 0.028, offset: 0 }),
    createBus({ routeId: 'route-a', speed: 0.028, offset: 0.5 }),
    createBus({ routeId: 'route-b', speed: 0.022, offset: 0.2 }),
    createBus({ routeId: 'route-c', speed: 0.025, offset: 0.7 }),
  ];
  buses.forEach((bus) => scene.add(bus.object));

  const { composer, setSize } = createPostProcessing(renderer, scene, camera);
  const detectionService = createDetectionService();

  const topBar = document.createElement('div');
  topBar.id = 'top-bar';
  topBar.className = 'panel';
  topBar.innerHTML = '<h1>Andijon Public Transport & Road AI Monitoring System</h1>';
  uiRoot.appendChild(topBar);

  const store = createStore({
    systemStatus: 'OPTIMIZED',
    activeBuses: buses.length,
    issuesDetected: 0,
    priorityIssues: 0,
    detections: [],
    mode: 'live',
  });

  mountLeftPanel(uiRoot, store);
  mountRightPanel(uiRoot);
  mountBottomLeftPanel(uiRoot, store);

  const clock = new Clock();

  function handleDetection(result) {
    spawnMarker3D(scene, result, (markerId) => detectionService.reset(markerId));
    const state = store.getState();
    store.setState({
      issuesDetected: state.issuesDetected + 1,
      priorityIssues: result.type === 'pothole' ? state.priorityIssues + 1 : state.priorityIssues,
      detections: [
        { label: result.label, confidence: result.confidence, id: `${result.markerId}-${Date.now()}` },
        ...state.detections,
      ].slice(0, 6),
    });
  }

  function animate() {
    const delta = clock.getDelta();

    for (const bus of buses) {
      bus.update(delta);
      const beamPos = bus.getBeamWorldPosition();
      const results = detectionService.detect(bus.routeId, beamPos);
      results.forEach(handleDetection);
    }

    composer.render();
    labelRenderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

if (isWebglAvailable()) {
  init();
} else {
  showWebglFallback();
}
