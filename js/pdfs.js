// NMGC PDF row links — navigate directly, no interception.
(function() {
  document.querySelectorAll('a.pdf-row').forEach(function(row) {
    row.classList.remove('pdf-disabled');
  });
})();
