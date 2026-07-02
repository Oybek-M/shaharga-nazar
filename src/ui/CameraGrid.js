// Mock camera data for demo
const MOCK_CAMERAS = [
  {
    id: 'bus-1-route-a',
    name: '1-avtobus — A yo\'nalishi',
    route: 'A yo\'nalishi',
    lastUpdated: new Date(Date.now() - 5000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-2-route-a',
    name: '2-avtobus — A yo\'nalishi',
    route: 'A yo\'nalishi',
    lastUpdated: new Date(Date.now() - 12000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-3-route-b',
    name: '3-avtobus — B yo\'nalishi',
    route: 'B yo\'nalishi',
    lastUpdated: new Date(Date.now() - 8000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
  {
    id: 'bus-4-route-c',
    name: '4-avtobus — C yo\'nalishi',
    route: 'C yo\'nalishi',
    lastUpdated: new Date(Date.now() - 3000).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  },
];

function renderCameraTileHtml(camera) {
  return `
    <div class="camera-tile">
      <div class="camera-feed-placeholder"></div>
      <div class="camera-info">
        <div class="camera-header">
          <h3 class="camera-name">${camera.name}</h3>
          <span class="demo-badge">Demo rejim</span>
        </div>
        <p class="camera-timestamp">Yangilangan: ${camera.lastUpdated}</p>
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
}
