import { ROUTE_COLORS } from './RightPanel.js';

// Mock camera data for demo. All four buses currently run the single main
// avenue (route-a) — see src/main.js — so every feed shares that route.
const MOCK_CAMERAS = [
  { id: 'bus-1-route-a', name: '1-avtobus', routeId: 'route-a', startedAgoMs: 5000 },
  { id: 'bus-2-route-a', name: '2-avtobus', routeId: 'route-a', startedAgoMs: 12000 },
  { id: 'bus-3-route-a', name: '3-avtobus', routeId: 'route-a', startedAgoMs: 8000 },
  { id: 'bus-4-route-a', name: '4-avtobus', routeId: 'route-a', startedAgoMs: 3000 },
].map((camera) => ({ ...camera, lastSeenAt: Date.now() - camera.startedAgoMs }));

function formatAgo(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds} soniya oldin`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} daqiqa oldin`;
}

function renderCameraTileHtml(camera) {
  const color = ROUTE_COLORS[camera.routeId] || '#38bdf8';
  return `
    <div class="camera-tile" data-camera-id="${camera.id}">
      <div class="camera-feed-placeholder" style="--route-color: ${color}">
        <span class="camera-live-dot"></span>
        <span class="camera-scan-line"></span>
        <span class="camera-feed-icon">🚌</span>
      </div>
      <div class="camera-info">
        <div class="camera-header">
          <h3 class="camera-name">${camera.name} — Asosiy prospekt</h3>
          <span class="demo-badge">Demo rejim</span>
        </div>
        <p class="camera-timestamp" data-timestamp>Yangilangan: ${formatAgo(Date.now() - camera.lastSeenAt)}</p>
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
      <p class="notice-text">Jonli kamera oqimlariga hali ruxsat berilmagan. Quyida ko'rsatilgan oqimlar <strong>faqat namunaviy ma'lumot</strong> bo'lib, real vaqtda kuzatish uchun ishlatilmasligi kerak.</p>
    </div>
    <div class="camera-grid">
      ${MOCK_CAMERAS.map(renderCameraTileHtml).join('')}
    </div>
  `;

  root.appendChild(container);

  const timestampEls = container.querySelectorAll('[data-timestamp]');
  const interval = setInterval(() => {
    timestampEls.forEach((el, i) => {
      el.textContent = `Yangilangan: ${formatAgo(Date.now() - MOCK_CAMERAS[i].lastSeenAt)}`;
    });
  }, 1000);

  return { stop: () => clearInterval(interval) };
}
