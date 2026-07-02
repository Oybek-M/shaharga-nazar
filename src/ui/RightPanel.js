const ROUTE_COLORS = { 'route-a': '#22d3ee', 'route-b': '#34d399' };

// Minimap world bounds → canvas mapping (x ∈ ±60, z ∈ ±75).
const MAP_W = 200;
const MAP_H = 110;
function worldToMap(x, z) {
  return [((x + 60) / 120) * MAP_W, ((z + 75) / 150) * MAP_H];
}

export function mountRightPanel(root) {
  const el = document.createElement('div');
  el.id = 'right-panel';
  el.className = 'panel';
  el.innerHTML = `
    <div class="panel-caption">Jonli xarita</div>
    <canvas id="minimap" width="${MAP_W}" height="${MAP_H}"></canvas>
    <div class="panel-caption">Muammolar trendi</div>
    <svg id="trend-chart" viewBox="0 0 200 60" preserveAspectRatio="none">
      <polyline class="trend trend-1" points="0,45 28,40 56,42 84,30 112,33 140,20 168,24 200,12" />
      <polyline class="trend trend-2" points="0,52 28,48 56,50 84,44 112,46 140,40 168,42 200,34" />
      <polyline class="trend trend-3" points="0,55 28,53 56,54 84,50 112,52 140,49 168,51 200,46" />
    </svg>
    <div id="weather-row"><span>🌤️ 29°C</span><span>🔔</span></div>
  `;
  root.appendChild(el);

  const canvas = el.querySelector('#minimap');
  const ctx = canvas.getContext('2d');

  function drawMinimap(buses) {
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // The four-way intersection: main avenue (vertical, Z) + cross street (horizontal, X).
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = ROUTE_COLORS['route-a'];
    const [ax1, ay1] = worldToMap(0, -70);
    const [ax2, ay2] = worldToMap(0, 70);
    ctx.beginPath();
    ctx.moveTo(ax1, ay1);
    ctx.lineTo(ax2, ay2);
    ctx.stroke();
    ctx.strokeStyle = ROUTE_COLORS['route-b'];
    const [bx1, by1] = worldToMap(-55, 0);
    const [bx2, by2] = worldToMap(55, 0);
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.lineTo(bx2, by2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    for (const bus of buses) {
      const [mx, my] = worldToMap(bus.x, bus.z);
      ctx.beginPath();
      ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = bus.color;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.stroke();
    }
  }

  drawMinimap([]);
  return { drawMinimap };
}

export { ROUTE_COLORS };
