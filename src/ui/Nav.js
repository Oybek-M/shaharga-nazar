const PAGES = [
  { id: 'dashboard', href: 'index.html', label: 'Boshqaruv paneli' },
  { id: 'upload', href: 'upload.html', label: 'Yuklash va tahlil' },
  { id: 'cameras', href: 'cameras.html', label: 'Kameralar' },
  { id: 'issues', href: 'issues.html', label: 'Aniqlangan muammolar' },
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
  const homeLink = activePageId === 'dashboard'
    ? ''
    : `<a class="home-link" href="index.html" title="Bosh sahifaga qaytish">🏠 Bosh sahifa</a>`;
  el.innerHTML = `<div class="top-bar-title">${homeLink}<h1>${title}</h1></div>${renderNavLinksHtml(activePageId)}`;
  root.appendChild(el);
}
