import { MOCK_ISSUES } from '../data/mockIssues.js';

export function mountIssuesList(root) {
  const container = document.createElement('div');
  container.className = 'panel issues-container';

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
      card.style.borderLeftColor = `#${issue.color.toString(16).padStart(6, '0')}`;

      // Photo placeholder
      const photoPlaceholder = document.createElement('div');
      photoPlaceholder.className = 'issue-photo-placeholder';

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

      const SEVERITY_LABELS = { High: 'Yuqori', Medium: 'O\'rta', Low: 'Past' };
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

  container.appendChild(filterRow);
  container.appendChild(cardsContainer);
  root.appendChild(container);

  // Render initial cards
  renderCards();
}
