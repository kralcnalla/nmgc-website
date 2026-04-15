// NMGC Announcement Loader — checks page-specific banner only
(async function() {
  var el = document.getElementById('league-announcement');
  if (!el) return;

  var league = el.getAttribute('data-league') || 'homepage';
  var BASE = 'https://res.cloudinary.com/dy0kdvq96/raw/upload/nmgc-docs/';

  async function fetchJson(url) {
    try {
      var r = await fetch(url + '?v=' + Date.now());
      return r.ok ? await r.json() : null;
    } catch { return null; }
  }

  function show(data) {
    var textEl = el.querySelector('.announcement-text');
    if (textEl) textEl.innerHTML = data.text;
    el.style.display = 'flex';
  }

  var data = await fetchJson(BASE + 'announcement-' + league + '.json');
  if (data && data.active && data.text) show(data);
})();
