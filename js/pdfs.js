// NMGC PDF Loader
// Reads from /_leagues/{league}/{league}.md and updates all PDF links on the page

(function() {
  var league = document.body.getAttribute('data-league');
  if (!league) return;

  var url = league === 'resources'
    ? '/_resources/resources.md'
    : '/_leagues/' + league + '/' + league + '.md';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(text) {
      var match = text.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return;

      // Parse all key: "value" pairs from frontmatter
      var fm = match[1];
      var pairs = fm.match(/(\w+):\s*"([^"]*)"/g) || [];

      pairs.forEach(function(pair) {
        var m = pair.match(/(\w+):\s*"([^"]*)"/);
        if (!m || !m[2]) return;

        var key = m[1];
        var val = m[2];

        // Find the link with data-pdf="key" and update href
        var el = document.querySelector('[data-pdf="' + key + '"]');
        if (el && val) {
          el.setAttribute('href', val);
          el.classList.remove('pdf-disabled');
        }
      });
    })
    .catch(function() {});
})();
