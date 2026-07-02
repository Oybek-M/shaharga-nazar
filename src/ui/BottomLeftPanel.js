const MODES = [
  { id: 'live', label: '🔴 Jonli rejim' },
  { id: 'heatmap', label: '🔥 Issiqlik xaritasi' },
  { id: 'playback', label: '▶ Simulyatsiya ijrosi' },
];

export function mountBottomLeftPanel(root, store) {
  const el = document.createElement('div');
  el.id = 'bottom-left-panel';
  el.className = 'panel';
  root.appendChild(el);

  function render(state) {
    el.innerHTML = MODES.map(
      (mode) => `<button class="mode-button${state.mode === mode.id ? ' active' : ''}" data-mode="${mode.id}">${mode.label}</button>`
    ).join('');

    el.querySelectorAll('.mode-button').forEach((button) => {
      button.addEventListener('click', () => {
        store.setState({ mode: button.dataset.mode });
      });
    });
  }

  render(store.getState());
  store.subscribe(render);
}
