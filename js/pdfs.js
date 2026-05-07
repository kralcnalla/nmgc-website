// NMGC PDF row links — all shown as active, navigate directly on click.
(function() {
  document.querySelectorAll('a.pdf-row').forEach(function(row) {
    row.classList.remove('pdf-disabled');
  });
})();
