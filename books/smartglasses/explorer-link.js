/* Scoped to this book through smartglasses/book.toml; no shared-theme changes. */
(function () {
  const script = document.currentScript;
  if (!script || /\/(print|404)\.html$/.test(location.pathname)) return;
  const base = new URL('.', script.src);
  const relative = location.pathname.startsWith(base.pathname)
    ? location.pathname.slice(base.pathname.length) : '';
  const match = relative.match(/^ch(\d+)\/(?:index|\d+)\.html$/);
  const main = document.querySelector('main');
  if (!main) return;
  const url = new URL('explorer/index.html', base);
  if (match) {
    url.searchParams.set('chapter', 'ch' + Number(match[1]));
    const title = main.querySelector('h1')?.textContent.trim() || '';
    const section = title.match(/\b\d+\.\d+\b/);
    if (section) url.searchParams.set('section', section[0]);
  }
  const entry = document.createElement('p');
  entry.className = 'explorer-entry';
  const link = document.createElement('a');
  link.href = url.href;
  link.textContent = match ? '三维探索本章结构 ↗' : '打开智能眼镜三维探索 ↗';
  entry.append(link);
  main.querySelector('h1')?.insertAdjacentElement('afterend', entry);
})();
