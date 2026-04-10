// NMGC — Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      // Lock body scroll while nav is open — prevents iOS Safari from eating
      // touches after the sticky nav changes height
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  // Close mobile nav when a link is tapped
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        if (toggle) toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
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
