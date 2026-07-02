export function mountLeftPanel(root, store) {
  const el = document.createElement('div');
  el.id = 'left-panel';
  el.className = 'panel';
  root.appendChild(el);

  function render(state) {
    el.innerHTML = `
      <div class="stat-row"><span>TIZIM HOLATI:</span><span class="value">${state.systemStatus}</span></div>
      <div class="stat-row"><span>FAOL AVTOBUSLAR:</span><span class="value">${state.activeBuses}</span></div>
      <div class="stat-row"><span>ANIQLANGAN MUAMMOLAR:</span><span class="value">${state.issuesDetected}</span></div>
      <div class="stat-row priority"><span>1-DARAJALI MUAMMOLAR:</span><span class="value">${state.priorityIssues} ⚠️</span></div>
      <div id="detections-list">
        <h3>So'nggi aniqlanganlar</h3>
        ${state.detections.map((d) => `
          <div class="detection-item">
            <div class="detection-thumb">
              <span class="detection-bbox" style="border-color:${d.color || '#38bdf8'}">
                <span class="detection-bbox-tag" style="background:${d.color || '#38bdf8'}">${d.icon || 'AI'}</span>
              </span>
            </div>
            <div class="detection-info"><strong>${d.label}</strong>${d.confidence}% ishonch</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  render(store.getState());
  store.subscribe(render);
}
