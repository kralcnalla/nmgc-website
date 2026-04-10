// NMGC — Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-label', toggle.classList.contains('active') ? 'Close menu' : 'Open menu');
    });
  }

  // PDF link checker — pre-check Cloudinary links on load, mark unavailable ones
  document.querySelectorAll('a.pdf-row[href*="res.cloudinary.com"]').forEach(function (link) {
    var url = link.getAttribute('href');
    fetch(url, { method: 'HEAD' })
      .then(function (res) {
        if (!res.ok) markUnavailable(link);
      })
      .catch(function () { /* network error — leave link alone */ });
  });

  function markUnavailable(link) {
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.style.opacity = '0.45';
    link.style.cursor  = 'default';

    var badge = document.createElement('div');
    badge.textContent = 'Not yet uploaded';
    badge.style.cssText = [
      'font-size:0.68rem', 'font-weight:600', 'color:#999',
      'margin-top:0.15rem'
    ].join(';');

    var info = link.querySelector('.pdf-info');
    if (info) info.appendChild(badge);

    link.addEventListener('click', function (e) { e.preventDefault(); });
  }
});
