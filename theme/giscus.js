// Comment box (Giscus) under every page; comments live in this repo's GitHub Discussions, one thread per page path.
(function () {
  var main = document.querySelector('main');
  if (!main) return;
  var box = document.createElement('div');
  box.className = 'giscus-box';
  box.innerHTML = '<hr><h2>留言与勘误</h2><p class="giscus-hint">发现错误、读不懂或有更好的讲法，欢迎留言（需 GitHub 账号）。</p>';
  var s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  var cfg = {
    'data-repo': 'wenmin20212-dotcom/ai-era-system-books',
    'data-repo-id': 'REPO_ID',
    'data-category': 'CATEGORY_NAME',
    'data-category-id': 'CATEGORY_ID',
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': 'preferred_color_scheme',
    'data-lang': 'zh-CN',
    'data-loading': 'lazy',
    'crossorigin': 'anonymous'
  };
  for (var k in cfg) s.setAttribute(k, cfg[k]);
  s.async = true;
  box.appendChild(s);
  main.appendChild(box);
})();
