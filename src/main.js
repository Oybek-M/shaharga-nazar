import { Scene, PerspectiveCamera, WebGLRenderer, Clock, ACESFilmicToneMapping, SRGBColorSpace, PCFSoftShadowMap } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { createCity } from './scene/City.js';
import { createBus } from './scene/Bus.js';
import { createPostProcessing } from './scene/PostProcessing.js';
import { spawnMarker3D } from './ui/Marker3D.js';
import { createDetectionService } from './ai/DetectionService.js';
import { MARKERS } from './ai/markers.js';
import { createStore } from './store.js';
import { mountLeftPanel } from './ui/LeftPanel.js';
import { mountRightPanel, ROUTE_COLORS } from './ui/RightPanel.js';
import { mountBottomLeftPanel } from './ui/BottomLeftPanel.js';
import { mountTopBar } from './ui/Nav.js';

function isWebglAvailable() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

function showWebglFallback() {
  document.body.innerHTML = '<p style="color:#e2e8f0;text-align:center;margin-top:40vh;font-family:sans-serif;">Ushbu brauzerda WebGL mavjud emas.</p>';
}

function init() {
  const canvas = document.getElementById('scene-canvas');
  const uiRoot = document.getElementById('ui-root');

  const scene = new Scene();
  const camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 600);
  // Look down the main avenue (Z axis) so the buses recede into the distance.
  camera.position.set(0, 44, 74);
  camera.lookAt(0, 1, -10);

  const renderer = new WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';
  uiRoot.appendChild(labelRenderer.domElement);

  createCity(scene);

  // Four buses on the main avenue, evenly spaced at one speed so they keep a
  // constant gap (verified min centre distance ~7) and never touch. The crossing
  // street carries no traffic, so nothing conflicts at the intersection.
  const buses = [
    createBus({ routeId: 'route-a', speed: 0.02, offset: 0 }),
    createBus({ routeId: 'route-a', speed: 0.02, offset: 0.25 }),
    createBus({ routeId: 'route-a', speed: 0.02, offset: 0.5 }),
    createBus({ routeId: 'route-a', speed: 0.02, offset: 0.75 }),
  ];
  buses.forEach((bus) => scene.add(bus.object));

  const { composer, setSize } = createPostProcessing(renderer, scene, camera);
  const detectionService = createDetectionService();

  mountTopBar(uiRoot, 'dashboard', 'Andijon Jamoat Transporti va Yo\'l AI Monitoring Tizimi');

  const store = createStore({
    systemStatus: 'OPTIMAL',
    activeBuses: buses.length,
    issuesDetected: 0,
    priorityIssues: 0,
    detections: [],
    mode: 'live',
  });

  mountLeftPanel(uiRoot, store);
  const rightPanel = mountRightPanel(uiRoot);
  mountBottomLeftPanel(uiRoot, store);

  const MODE_CAPTIONS = {
    live: 'Jonli xarita',
    heatmap: 'Issiqlik xaritasi',
    playback: 'Simulyatsiya (to\'xtatilgan)',
  };
  store.subscribe((state) => rightPanel.setCaption(MODE_CAPTIONS[state.mode] || 'Jonli xarita'));

  const clock = new Clock();
  let frame = 0;

  function handleDetection(result) {
    spawnMarker3D(scene, result, (markerId) => detectionService.reset(markerId));
    const state = store.getState();
    const hex = `#${result.color.toString(16).padStart(6, '0')}`;
    store.setState({
      issuesDetected: state.issuesDetected + 1,
      priorityIssues: result.type === 'pothole' ? state.priorityIssues + 1 : state.priorityIssues,
      detections: [
        { label: result.label, confidence: result.confidence, color: hex, icon: result.icon, id: `${result.markerId}-${Date.now()}` },
        ...state.detections,
      ].slice(0, 6),
    });
  }

  function animate() {
    const delta = clock.getDelta();
    frame += 1;
    const mode = store.getState().mode;

    // Playback mode freezes the buses in place, as if reviewing a paused
    // recording, instead of continuing the live simulation.
    if (mode !== 'playback') {
      for (const bus of buses) {
        bus.update(delta);
        const beamPos = bus.getBeamWorldPosition();
        const results = detectionService.detect(bus.routeId, beamPos);
        results.forEach(handleDetection);
      }
    }

    // Refresh the minimap a few times a second — no need to redraw every frame.
    if (frame % 5 === 0) {
      if (mode === 'heatmap') {
        rightPanel.drawHeatmap(MARKERS);
      } else {
        rightPanel.drawMinimap(
          buses.map((bus) => ({
            x: bus.object.position.x,
            z: bus.object.position.z,
            color: ROUTE_COLORS[bus.routeId] || '#e2e8f0',
          }))
        );
      }
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
