// NMGC — Mobile nav toggle

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

document.addEventListener('DOMContentLoaded', function () {
  // Floating back button — always present, history.back() is a no-op if nothing to go back to
  var back = document.createElement('button');
  back.className = 'back-btn visible';
  back.setAttribute('aria-label', 'Go back');
  back.textContent = '←';
  back.onclick = function() { history.back(); };
  document.body.appendChild(back);

  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    var siteNav = document.querySelector('.site-nav');

    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      // Position the fixed overlay flush below the nav bar
      if (isOpen && siteNav) {
        mobileNav.style.top = siteNav.offsetHeight + 'px';
      }
    });

    // Don't close the nav on link tap — let navigation happen naturally.
    // Closing first causes a flash of the page behind the overlay.
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
