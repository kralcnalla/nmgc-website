// NMGC — Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    function toggleMenu() {
      mobileNav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-label', toggle.classList.contains('active') ? 'Close menu' : 'Open menu');
    }

    // touchstart fires instantly — no 300ms delay
    toggle.addEventListener('touchstart', function (e) {
      e.preventDefault(); // prevent the delayed click from also firing
      toggleMenu();
    }, { passive: false });

    // fallback for non-touch (mouse click on desktop)
    toggle.addEventListener('click', toggleMenu);
  }

  // Touch-friendly dropdowns — tap to open, tap again to follow link
  document.querySelectorAll('.has-dropdown > a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var isTouchDevice = window.matchMedia('(hover: none)').matches;
      if (!isTouchDevice) return; // desktop hover handles it
      var dropdown = link.parentNode.querySelector('.dropdown-menu');
      if (!dropdown) return;
      var isOpen = dropdown.classList.contains('touch-open');
      // Close all other open dropdowns
      document.querySelectorAll('.dropdown-menu.touch-open').forEach(function (d) {
        d.classList.remove('touch-open');
      });
      if (!isOpen) {
        e.preventDefault();
        dropdown.classList.add('touch-open');
      }
    });
  });

  // Close touch dropdowns when tapping outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.dropdown-menu.touch-open').forEach(function (d) {
        d.classList.remove('touch-open');
      });
    }
  });

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
