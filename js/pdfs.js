// NMGC PDF row links — all shown as active regardless of upload status.
(function() {
  document.querySelectorAll('a.pdf-row').forEach(function(row) {
    row.classList.remove('pdf-disabled');
  });
})();
