(function() {
  document.querySelectorAll('a.pdf-row[href]').forEach(function(row) {
    row.addEventListener('click', function(e) {
      var href = row.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      fetch(href, { method: 'HEAD' })
        .then(function(res) {
          if (res.ok) {
            window.open(href, '_blank', 'noopener');
          } else {
            showMsg(row);
          }
        })
        .catch(function() { showMsg(row); });
    });
  });

  function showMsg(row) {
    if (row.querySelector('.pdf-unavailable')) return;
    var msg = document.createElement('div');
    msg.className = 'pdf-unavailable';
    msg.textContent = 'This document hasn’t been uploaded yet. Check back soon.';
    Object.assign(msg.style, {
      fontSize: '0.78rem', fontWeight: '600', color: '#8b4513',
      background: '#fff3e0', border: '1px solid #f0a060',
      borderRadius: '5px', padding: '0.4rem 0.7rem', marginTop: '0.4rem'
    });
    row.insertAdjacentElement('afterend', msg);
    setTimeout(function() { msg.remove(); }, 4000);
  }
})();
