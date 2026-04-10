// NMGC — Resources page
// 1. HEAD-checks each pdf-row URL and removes pdf-disabled when the file exists.
// 2. Fetches minutes.json from Cloudinary and renders the Meeting Minutes Archive.

(function () {
  var CLOUD       = 'dy0kdvq96';
  var MINUTES_URL = 'https://res.cloudinary.com/' + CLOUD + '/raw/upload/nmgc-docs/minutes.json?v=' + Date.now();

  // ── PDF availability checks ──────────────────────────────────────────────
  // For each pdf-row that has a real Cloudinary URL, HEAD-request it.
  // If the file exists (2xx), remove pdf-disabled so the row becomes clickable.
  document.querySelectorAll('a.pdf-row.pdf-disabled[href]').forEach(function (el) {
    var url = el.getAttribute('href');
    if (!url || url === '#') return;
    fetch(url, { method: 'HEAD' })
      .then(function (r) {
        if (r.ok) el.classList.remove('pdf-disabled');
      })
      .catch(function () { /* leave disabled */ });
  });

  // ── Meeting Minutes Archive ──────────────────────────────────────────────
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderMinutes(minutes) {
    var container = document.getElementById('minutes-archive-list');
    if (!container) return;

    if (!minutes.length) {
      container.innerHTML = '<div style="padding:1rem;color:#888;font-size:0.85rem;">No minutes uploaded yet.</div>';
      return;
    }

    // Newest first
    minutes.sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    container.innerHTML = minutes.map(function (m) {
      return '<a href="' + esc(m.url) + '" target="_blank" rel="noopener" class="pdf-row">' +
        '<div class="pdf-icon"></div>' +
        '<div class="pdf-info">' +
          '<div class="pdf-name">' + esc(m.title) + '</div>' +
          '<div class="pdf-sub">' + esc(m.year) + '</div>' +
        '</div>' +
        '<div class="pdf-dl">\u2193</div>' +
      '</a>';
    }).join('');
  }

  fetch(MINUTES_URL)
    .then(function (r) { return r.ok ? r.json() : { minutes: [] }; })
    .then(function (d) { renderMinutes(d.minutes || []); })
    .catch(function () {
      var c = document.getElementById('minutes-archive-list');
      if (c) c.innerHTML = '<div style="padding:1rem;color:#888;font-size:0.85rem;">Could not load minutes.</div>';
    });
})();
