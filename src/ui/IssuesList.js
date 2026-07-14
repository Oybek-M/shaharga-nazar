import { MOCK_ISSUES } from '../data/mockIssues.js';
import { ISSUE_TYPES } from '../ai/markers.js';

const ICON_BY_TYPE = Object.fromEntries(
  Object.values(ISSUE_TYPES).map((t) => [t.key, t.icon])
);

function toHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`;
}

// Darken a 0xRRGGBB color by a factor (0-1) for a two-tone card gradient.
function shade(color, factor) {
  const r = Math.round(((color >> 16) & 0xff) * factor);
  const g = Math.round(((color >> 8) & 0xff) * factor);
  const b = Math.round((color & 0xff) * factor);
  return toHex((r << 16) | (g << 8) | b);
}

export function mountIssuesList(root) {
  const container = document.createElement('div');
  container.className = 'panel issues-container';

  // Summary row: total + severity breakdown, so the counts read at a glance.
  const summaryRow = document.createElement('div');
  summaryRow.className = 'issues-summary-row';
  const severityCounts = MOCK_ISSUES.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {});
  const SEVERITY_LABELS = { High: 'Yuqori', Medium: 'O\'rta', Low: 'Past' };
  const stats = [
    { label: 'Jami muammolar', value: MOCK_ISSUES.length, cls: 'stat-total' },
    ...Object.entries(severityCounts).map(([sev, count]) => ({
      label: SEVERITY_LABELS[sev] || sev,
      value: count,
      cls: `stat-severity-${sev.toLowerCase()}`,
    })),
  ];
  stats.forEach((stat) => {
    const chip = document.createElement('div');
    chip.className = `issue-stat-chip ${stat.cls}`;
    chip.innerHTML = `<span class="issue-stat-value">${stat.value}</span><span class="issue-stat-label">${stat.label}</span>`;
    summaryRow.appendChild(chip);
  });

  // Filter buttons row
  const filterRow = document.createElement('div');
  filterRow.className = 'filter-buttons-row';

  const filters = [
    { id: 'all', label: 'Barchasi' },
    { id: 'pothole', label: 'Yo\'l cho\'kishi' },
    { id: 'cracked_asphalt', label: 'Yoriq asfalt' },
    { id: 'road_debris', label: 'Yo\'lda chiqindi' },
    { id: 'streetlight', label: 'Chiroq nosozligi' },
  ];

  let activeFilter = 'all';

  const filterButtons = {};
  filters.forEach((filter) => {
    const btn = document.createElement('button');
    btn.className = `mode-button${filter.id === 'all' ? ' active' : ''}`;
    btn.textContent = filter.label;
    btn.addEventListener('click', () => {
      // Update active filter
      activeFilter = filter.id;
      // Update button styles
      Object.values(filterButtons).forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      // Re-render cards
      renderCards();
    });
    filterButtons[filter.id] = btn;
    filterRow.appendChild(btn);
  });

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'issues-grid';

  function renderCards() {
    cardsContainer.innerHTML = '';
    const filtered =
      activeFilter === 'all'
        ? MOCK_ISSUES
        : MOCK_ISSUES.filter((issue) => issue.type === activeFilter);

    filtered.forEach((issue) => {
      const card = document.createElement('div');
      card.className = 'issue-card';
      card.style.borderLeftColor = toHex(issue.color);

      // AI-detection illustration: type icon over a two-tone gradient in the
      // issue's own color, standing in for a real captured photo/frame.
      const photoPlaceholder = document.createElement('div');
      photoPlaceholder.className = 'issue-photo-placeholder';
      photoPlaceholder.style.background = `linear-gradient(135deg, ${shade(issue.color, 0.55)} 0%, ${shade(issue.color, 0.18)} 100%)`;
      const photoIcon = document.createElement('span');
      photoIcon.className = 'issue-photo-icon';
      photoIcon.textContent = ICON_BY_TYPE[issue.type] || '⚠️';
      const photoTag = document.createElement('span');
      photoTag.className = 'issue-photo-tag';
      photoTag.textContent = 'AI aniqladi';
      photoPlaceholder.appendChild(photoIcon);
      photoPlaceholder.appendChild(photoTag);

      // Content area
      const content = document.createElement('div');
      content.className = 'issue-content';

      // Label
      const labelEl = document.createElement('h3');
      labelEl.className = 'issue-label';
      labelEl.textContent = issue.label;

      // GPS coordinates
      const gpsEl = document.createElement('p');
      gpsEl.className = 'issue-gps';
      gpsEl.textContent = `📍 ${issue.gps.lat}, ${issue.gps.lng}`;

      // Timestamp (formatted)
      const dateObj = new Date(issue.detectedAt);
      const timeStr = dateObj.toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const timestampEl = document.createElement('p');
      timestampEl.className = 'issue-timestamp';
      timestampEl.textContent = `🕐 ${timeStr}`;

      // Severity and source row
      const metaRow = document.createElement('div');
      metaRow.className = 'issue-meta-row';

      const severityEl = document.createElement('span');
      severityEl.className = `issue-severity severity-${issue.severity.toLowerCase()}`;
      severityEl.textContent = SEVERITY_LABELS[issue.severity] || issue.severity;

      const sourceEl = document.createElement('span');
      sourceEl.className = 'issue-source';
      sourceEl.textContent = issue.source;

      metaRow.appendChild(severityEl);
      metaRow.appendChild(sourceEl);

      // Assemble content
      content.appendChild(labelEl);
      content.appendChild(gpsEl);
      content.appendChild(timestampEl);
      content.appendChild(metaRow);

      // Assemble card
      card.appendChild(photoPlaceholder);
      card.appendChild(content);

      cardsContainer.appendChild(card);
    });
  }

  container.appendChild(summaryRow);
  container.appendChild(filterRow);
  container.appendChild(cardsContainer);
  root.appendChild(container);

  // Render initial cards
  renderCards();
}
