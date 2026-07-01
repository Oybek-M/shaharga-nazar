// Mock camera data for demo
const MOCK_CAMERAS = [
  {
    id: 'bus-1-route-a',
    name: 'Bus 1 — Route A',
    route: 'Route A',
    lastUpdated: new Date(Date.now() - 5000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-2-route-a',
    name: 'Bus 2 — Route A',
    route: 'Route A',
    lastUpdated: new Date(Date.now() - 12000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-3-route-b',
    name: 'Bus 3 — Route B',
    route: 'Route B',
    lastUpdated: new Date(Date.now() - 8000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-4-route-c',
    name: 'Bus 4 — Route C',
    route: 'Route C',
    lastUpdated: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
];

function renderCameraTileHtml(camera) {
  return `
    <div class="camera-tile">
      <div class="camera-feed-placeholder"></div>
      <div class="camera-info">
        <div class="camera-header">
          <h3 class="camera-name">${camera.name}</h3>
          <span class="demo-badge">Demo Feed</span>
        </div>
        <p class="camera-timestamp">Last updated: ${camera.lastUpdated}</p>
      </div>
    </div>
  `;
}

export function mountCameraGrid(root) {
  const container = document.createElement('div');
  container.className = 'panel camera-grid-container';

  container.innerHTML = `
    <div class="camera-grid-notice">
      <p class="notice-icon">⚠️</p>
      <p class="notice-text">Live camera feeds have not been authorized yet. The feeds shown below are <strong>demonstration data only</strong> and should not be relied upon for real-time monitoring.</p>
    </div>
    <div class="camera-grid">
      ${MOCK_CAMERAS.map(renderCameraTileHtml).join('')}
    </div>
  `;

  root.appendChild(container);
}
