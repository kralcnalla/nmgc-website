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

  // PDF link checker — show inline tooltip if file not yet uploaded to Cloudinary
  var tooltip = document.createElement('div');
  tooltip.id = 'pdf-tooltip';
  tooltip.style.cssText = [
    'position:absolute',
    'background:#1a1a1a', 'color:white', 'padding:0.45rem 0.85rem',
    'border-radius:6px', 'font-size:0.8rem', 'font-weight:600',
    'box-shadow:0 4px 16px rgba(0,0,0,0.25)', 'z-index:9999',
    'opacity:0', 'transition:opacity 0.15s', 'pointer-events:none',
    'white-space:nowrap'
  ].join(';');
  document.body.appendChild(tooltip);

  var tooltipTimer;
  function showTooltip(anchor, msg) {
    clearTimeout(tooltipTimer);
    tooltip.textContent = msg;
    tooltip.style.opacity = '0';

    var rect = anchor.getBoundingClientRect();
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    tooltip.style.top  = (rect.top  + window.scrollY - 38) + 'px';

    tooltip.style.opacity = '1';
    tooltipTimer = setTimeout(function () { tooltip.style.opacity = '0'; }, 3000);
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
            showTooltip(link, 'No document uploaded yet.');
          }
        })
        .catch(function () {
          window.open(url, '_blank', 'noopener');
        });
    });
  });
});
