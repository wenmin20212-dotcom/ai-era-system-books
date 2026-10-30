// Comment box (Giscus) under every page; comments live in this repo's GitHub Discussions, one thread per page path.
(function () {
  var main = document.querySelector('main');
  if (!main) return;
  var box = document.createElement('div');
  box.className = 'giscus-box';
  var lang = (document.documentElement.lang || 'zh-CN');
  var L = /^en/.test(lang) ? ['Reader comments', 'Comments are welcome (GitHub account required).', 'en']
        : /^ms/.test(lang) ? ['Komen pembaca', 'Komen dialu-alukan (perlu akaun GitHub).', 'en']
        : /^zh-(TW|Hant)/i.test(lang) ? ['讀者留言', '歡迎留言交流（需 GitHub 帳號）。', 'zh-TW']
        : ['读者留言', '欢迎留言交流（需 GitHub 账号）。', 'zh-CN'];
  box.innerHTML = '<hr><h2>' + L[0] + '</h2><p class="giscus-hint">' + L[1] + '</p>';
  var s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  var cfg = {
    'data-repo': 'wenmin20212-dotcom/ai-era-system-books',
    'data-repo-id': 'R_kgDOVY1YMA',
    'data-category': 'Announcements',
    'data-category-id': 'DIC_kwDOVY1YMM4DJt99',
    'data-mapping': 'pathname',
    'data-strict': '1',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': 'preferred_color_scheme',
    'data-lang': L[2],
    'data-loading': 'lazy',
    'crossorigin': 'anonymous'
  };
  for (var k in cfg) s.setAttribute(k, cfg[k]);
  s.async = true;
  box.appendChild(s);
  main.appendChild(box);
})();
