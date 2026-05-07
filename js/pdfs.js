// NMGC PDF availability checker
// HEAD-checks every pdf-row link on the page.
// Rows start disabled; each one is enabled as soon as its file is confirmed available.
(function() {
  var rows = document.querySelectorAll('a.pdf-row[href]');
  if (!rows.length) return;

  rows.forEach(function(row) {
    var href = row.getAttribute('href');
    if (!href || href === '#') return;

    // Disable immediately and inject badge (idempotent — skips if already present)
    row.classList.add('pdf-disabled');
    if (!row.querySelector('.pdf-not-uploaded')) {
      var badge = document.createElement('div');
      badge.className = 'pdf-not-uploaded';
      badge.textContent = 'Not yet uploaded';
      var dl = row.querySelector('.pdf-dl');
      if (dl) row.insertBefore(badge, dl);
      else row.appendChild(badge);
    }

    // Enable the row as soon as the file is confirmed to exist
    fetch(href, { method: 'HEAD' })
      .then(function(res) {
        if (res.ok) row.classList.remove('pdf-disabled');
      })
      .catch(function() { /* leave disabled on network error */ });
  });
})();
