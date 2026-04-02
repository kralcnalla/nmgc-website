// NMGC Announcement Loader
(function() {
  var el = document.getElementById('league-announcement');
  if (!el) return;

  var league = el.getAttribute('data-league');
  if (!league) return;

  fetch('/_announcements/' + league + '.md')
    .then(function(r) { return r.text(); })
    .then(function(text) {
      var match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) return;

      var frontmatter = match[1];
      var body = match[2].trim();

      var activeMatch = frontmatter.match(/active:\s*(true|false)/);
      var active = activeMatch ? activeMatch[1] === 'true' : false;
      if (!active) return;

      if (!body || body.indexOf('No announcement') !== -1) return;

      var textEl = el.querySelector('.announcement-text');
      if (textEl) textEl.innerHTML = body;
      el.style.display = 'flex';
    })
    .catch(function() {});
})();
