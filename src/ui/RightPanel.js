export function mountRightPanel(root) {
  const el = document.createElement('div');
  el.id = 'right-panel';
  el.className = 'panel';
  el.innerHTML = `
    <div id="minimap"></div>
    <div id="weather-row"><span>🌤️ 29°C</span><span>🔔</span></div>
  `;
  root.appendChild(el);
}
