// NMGC — Events calendar
// Fetches events.json from Cloudinary and renders the calendar on index.html.

(function () {
  var CLOUD      = 'dy0kdvq96';
  var EVENTS_URL = 'https://res.cloudinary.com/' + CLOUD + '/raw/upload/nmgc-docs/events.json?v=' + Date.now();

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function autoDate(dateStr) {
    var p = dateStr.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate();
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderCalendar(events) {
    var container = document.getElementById('events-calendar');
    if (!container) return;

    if (!events.length) {
      container.innerHTML = '<div style="padding:1rem;color:#888;font-size:0.85rem;">No events scheduled.</div>';
      return;
    }

    // Sort by date
    events.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    // Upcoming window
    var today  = new Date(); today.setHours(0, 0, 0, 0);
    var cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + 30);

    // Group by YYYY-MM
    var groups = {}, order = [];
    events.forEach(function (ev) {
      var m = ev.date.slice(0, 7);
      if (!groups[m]) { groups[m] = []; order.push(m); }
      groups[m].push(ev);
    });

    var html     = '';
    var anyHidden = false;

    order.forEach(function (m) {
      var p      = m.split('-');
      var header = MONTHS[+p[1] - 1] + ' ' + p[0];
      var rowsHtml = '';
      var allHidden = true;

      groups[m].forEach(function (ev) {
        var evDate = new Date(ev.date + 'T00:00:00');
        var hidden = evDate < today || evDate > cutoff;
        if (!hidden) allHidden = false;
        if (hidden)  anyHidden = true;

        // Schedule items
        var schedHtml = '';
        if (ev.schedule && ev.schedule.length) {
          schedHtml = '<div class="event-schedule">';
          ev.schedule.forEach(function (s, i) {
            if (i) schedHtml += '<span class="event-schedule-sep">\u00b7</span>';
            schedHtml += '<span class="event-schedule-item"><span class="event-schedule-time">' + esc(s.time) + '</span> ' + esc(s.label) + '</span>';
          });
          schedHtml += '</div>';
        }

        var noteHtml  = ev.note ? ' <span class="event-note">' + esc(ev.note) + '</span>' : '';
        var nameClass = 'event-name' + (ev.highlight ? ' event-highlight' : '');
        var display   = ev.displayDate || autoDate(ev.date);

        rowsHtml +=
          '<div class="event-row" data-date="' + esc(ev.date) + '"' + (hidden ? ' style="display:none"' : '') + '>' +
            '<div class="event-date">' + esc(display) + '</div>' +
            '<div class="' + nameClass + '">' + esc(ev.title) + noteHtml + schedHtml + '</div>' +
          '</div>';
      });

      html +=
        '<div class="events-month" data-month="' + m + '"' + (allHidden ? ' style="display:none"' : '') + '>' +
          '<div class="events-month-header">' + header + '</div>' +
          rowsHtml +
        '</div>';
    });

    // Toggle row
    html +=
      '<div id="events-toggle-row" style="padding:0.75rem 1rem;border-top:1px solid #eee;text-align:center;' +
        (anyHidden ? '' : 'display:none') + '">' +
        '<button onclick="showAllEvents(this)" style="background:none;border:none;color:#3a5fc8;font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;">Show full 2026 season \u25be</button>' +
      '</div>';

    container.innerHTML = html;
  }

  // Global — called from the toggle button onclick
  window.showAllEvents = function () {
    document.querySelectorAll('.event-row[data-date]').forEach(function (r) { r.style.display = ''; });
    document.querySelectorAll('.events-month').forEach(function (m) { m.style.display = ''; });
    var toggle = document.getElementById('events-toggle-row');
    if (toggle) toggle.style.display = 'none';
  };

  fetch(EVENTS_URL)
    .then(function (r) { return r.ok ? r.json() : { events: [] }; })
    .then(function (d) { renderCalendar(d.events || []); })
    .catch(function ()  { renderCalendar([]); });
})();
