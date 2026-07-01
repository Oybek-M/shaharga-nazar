const PAGES = [
  { id: 'dashboard', href: 'index.html', label: 'Dashboard' },
  { id: 'upload', href: 'upload.html', label: 'Upload & Analyze' },
  { id: 'cameras', href: 'cameras.html', label: 'Cameras' },
  { id: 'issues', href: 'issues.html', label: 'Detected Issues' },
];

export function renderNavLinksHtml(activePageId) {
  return `<div class="nav-links">${PAGES.map(
    (page) => `<a class="nav-link${page.id === activePageId ? ' active' : ''}" href="${page.href}">${page.label}</a>`
  ).join('')}</div>`;
}

export function mountTopBar(root, activePageId, title) {
  const el = document.createElement('div');
  el.id = 'top-bar';
  el.className = 'panel';
  el.innerHTML = `<h1>${title}</h1>${renderNavLinksHtml(activePageId)}`;
  root.appendChild(el);
}
