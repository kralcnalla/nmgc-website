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

  // PDF link checker — show toast if file not yet uploaded to Cloudinary
  var toast = document.createElement('div');
  toast.id = 'pdf-toast';
  toast.style.cssText = [
    'position:fixed', 'bottom:1.5rem', 'left:50%', 'transform:translateX(-50%)',
    'background:#1a1a1a', 'color:white', 'padding:0.7rem 1.2rem',
    'border-radius:8px', 'font-size:0.85rem', 'font-weight:600',
    'box-shadow:0 4px 16px rgba(0,0,0,0.25)', 'z-index:9999',
    'opacity:0', 'transition:opacity 0.2s', 'pointer-events:none',
    'white-space:nowrap'
  ].join(';');
  document.body.appendChild(toast);

  var toastTimer;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.style.opacity = '1';
    toastTimer = setTimeout(function () { toast.style.opacity = '0'; }, 3000);
  }

  document.querySelectorAll('a.pdf-row[href*="res.cloudinary.com"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var url = link.getAttribute('href');
      fetch(url, { method: 'HEAD' })
        .then(function (res) {
          if (res.ok) {
            window.open(url, '_blank', 'noopener');
          } else {
            showToast('No document uploaded yet.');
          }
        })
        .catch(function () {
          // Network error — just try opening it
          window.open(url, '_blank', 'noopener');
        });
    });
  });
});
