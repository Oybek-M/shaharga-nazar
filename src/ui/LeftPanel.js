export function mountLeftPanel(root, store) {
  const el = document.createElement('div');
  el.id = 'left-panel';
  el.className = 'panel';
  root.appendChild(el);

  function render(state) {
    el.innerHTML = `
      <div class="stat-row"><span>SYSTEM STATUS:</span><span class="value">${state.systemStatus}</span></div>
      <div class="stat-row"><span>ACTIVE BUSES:</span><span class="value">${state.activeBuses}</span></div>
      <div class="stat-row"><span>ISSUES DETECTED:</span><span class="value">${state.issuesDetected}</span></div>
      <div class="stat-row priority"><span>PRIORITY 1 ISSUES:</span><span class="value">${state.priorityIssues} ⚠️</span></div>
      <div id="detections-list">
        <h3>Recent Detections</h3>
        ${state.detections.map((d) => `
          <div class="detection-item">
            <div class="detection-thumb"></div>
            <div class="detection-info"><strong>${d.label}</strong>${d.confidence}% Confidence</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
