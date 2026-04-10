// NMGC — Banner display
// Each page sets window.NMGC_SCOPE before loading this script.
// e.g. <script>window.NMGC_SCOPE = 'bushwhackers';</script>

(function () {
  var CLOUD = 'dy0kdvq96';
  var _ver  = (function() { try { return localStorage.getItem('nmgc_banners_ver'); } catch(e) { return null; } })();
  var URL   = _ver
    ? 'https://res.cloudinary.com/' + CLOUD + '/raw/upload/v' + _ver + '/nmgc-docs/banners.json'
    : 'https://res.cloudinary.com/' + CLOUD + '/raw/upload/nmgc-docs/banners.json?v=' + Date.now();
  var scope = window.NMGC_SCOPE || 'all';

  var TYPE_STYLES = {
    info:      { bg: '#1a3a6e', color: '#fff', label: 'NOTICE' },
    warning:   { bg: '#d4a000', color: '#1a1a1a', label: 'NOTICE' },
    important: { bg: '#cc2200', color: '#fff', label: 'ALERT'  }
  };

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      '@keyframes nmgc-scroll {',
      '  0%   { transform: translateX(-50%); }',
      '  100% { transform: translateX(0%); }',
      '}',
      '#nmgc-banner-wrap { position:relative; z-index:10; }',
      '.nmgc-banner {',
      '  display:flex; align-items:stretch;',
      '  overflow:hidden;',
      '  border-bottom:3px solid rgba(0,0,0,0.2);',
      '}',
      '.nmgc-banner-label {',
      '  flex-shrink:0; display:flex; align-items:center;',
      '  padding:0 1.1rem;',
      '  font-size:0.7rem; font-weight:900; letter-spacing:0.15em; text-transform:uppercase;',
      '  background:rgba(0,0,0,0.3); white-space:nowrap;',
      '}',
      '.nmgc-banner-track {',
      '  flex:1; overflow:hidden; display:flex; align-items:center; padding:0.75rem 0;',
      '}',
      '.nmgc-banner-msg {',
      '  white-space:nowrap; font-size:1.05rem; font-weight:700; letter-spacing:0.03em;',
      '  animation:nmgc-scroll 25s linear infinite;',
      '  display:inline-block;',
      '}',
      '.nmgc-banner-close {',
      '  flex-shrink:0; background:rgba(0,0,0,0.2);',
      '  border:none; border-left:1px solid rgba(255,255,255,0.2);',
      '  color:inherit; font-size:1.1rem; padding:0 1rem;',
      '  cursor:pointer; opacity:0.7; transition:opacity 0.15s, background 0.15s;',
      '}',
      '.nmgc-banner-close:hover { opacity:1; background:rgba(0,0,0,0.35); }'
    ].join('\n');
    document.head.appendChild(s);
  }

  function renderBanners(banners) {
    var now = Date.now();
    var active = banners.filter(function (b) {
      return now < b.expires && (b.scope === 'all' || b.scope === scope);
    });
    if (!active.length) return;

    var wrap = document.createElement('div');
    wrap.id = 'nmgc-banner-wrap';

    active.forEach(function (b) {
      var style = TYPE_STYLES[b.type] || TYPE_STYLES.info;
      var repeated = (escHtml(b.message) + ' &nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp; ').repeat(6);

      var div = document.createElement('div');
      div.className = 'nmgc-banner';
      div.style.cssText = 'background:' + style.bg + ';color:' + style.color + ';';
      div.innerHTML =
        '<div class="nmgc-banner-label">' + style.label + '</div>' +
        '<div class="nmgc-banner-track">' +
          '<span class="nmgc-banner-msg">' + repeated + '</span>' +
        '</div>' +
        '<button class="nmgc-banner-close" aria-label="Dismiss">&times;</button>';

      div.querySelector('.nmgc-banner-close').addEventListener('click', function () {
        div.remove();
        if (!wrap.children.length) wrap.remove();
      });
      wrap.appendChild(div);
    });

    var nav = document.querySelector('nav.site-nav');
    if (nav && nav.nextSibling) {
      nav.parentNode.insertBefore(wrap, nav.nextSibling);
    } else {
      document.body.insertBefore(wrap, document.body.firstChild);
    }
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  injectStyles();

  fetch(URL)
    .then(function (r) { return r.ok ? r.json() : { banners: [] }; })
    .then(function (data) { renderBanners(data.banners || []); })
    .catch(function () { /* no banners.json yet — silent */ });
})();
