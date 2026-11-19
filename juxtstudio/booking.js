/* Demo booking for the Juxt Studio pitch site.
   Fully client-side: no API calls, nothing sent or stored.
   Flow: service → day/time (today + next 2 days, 1 hour lead) → name + phone → confirmation.
   Only the X (and Done on the last screen) closes the modal. */
(function () {
  'use strict';
  if (typeof HTMLDialogElement === 'undefined') return;

  var TZ = 'America/Chicago';
  var DAYS = 3; // today + the next 2 days
  var MIN_LEAD_MS = 60 * 60 * 1000;
  // Brandon's haircut price (Bryan, Nov 18, 2026). Duration not confirmed; 45 min is a placeholder.
  var SERVICES = [
    { id: 'haircut', name: 'Haircut', priceCents: 10000, durationMin: 45 }
  ];

  var triggers = document.querySelectorAll('[data-book]');
  if (!triggers.length) return;

  var S = { service: null, day: null, slot: null, slots: [], barber: '', info: { name: '', phone: '' }, step: 0 };

  var keyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  var longDay = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric' });
  var shortDay = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' });
  var timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
  var utcMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short' });
  var utcLong = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });
  var partsFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });

  function dayKey(d) { return keyFmt.format(d); }
  function keyToNoon(k) { var p = k.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(c) { return c == null ? '' : '$' + (c % 100 ? (c / 100).toFixed(2) : c / 100); }
  function meta(s) { return [money(s.priceCents), s.durationMin ? s.durationMin + ' min' : ''].filter(Boolean).join(' · '); }
  function fmtPhone(v) {
    var d = String(v).replace(/\D/g, '');
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function tzParts(d) {
    var o = {};
    partsFmt.formatToParts(d).forEach(function (p) { if (p.type !== 'literal') o[p.type] = p.value; });
    return o;
  }
  function tzDate(y, m, day, hh, mm) {
    // Build a Date for y-m-d hh:mm in America/Chicago, including DST.
    var guess = new Date(Date.UTC(y, m - 1, day, hh + 6, mm)); // CST as first guess
    var p = tzParts(guess);
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
    var want = Date.UTC(y, m - 1, day, hh, mm);
    return new Date(guess.getTime() + (want - asUtc));
  }
  function leadOk(startAt) { return Date.parse(startAt) >= Date.now() + MIN_LEAD_MS; }

  // Stable fake openings: same times every time the page loads on a given day,
  // with a few "already taken" slots so it looks like a real book.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function fakeSlots(service) {
    var todayK = dayKey(new Date());
    var start = keyToNoon(todayK);
    var list = [];
    var stepMin = 30;
    for (var i = 0; i < DAYS; i++) {
      var noon = new Date(start.getTime() + i * 864e5);
      var y = noon.getUTCFullYear(), m = noon.getUTCMonth() + 1, d = noon.getUTCDate();
      var key = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      // Demo hours: 10:00–18:00, last start leaves room for the service length.
      var openMin = 10 * 60;
      var closeMin = 18 * 60;
      var lastStart = closeMin - service.durationMin;
      for (var t = openMin; t <= lastStart; t += stepMin) {
        var at = tzDate(y, m, d, Math.floor(t / 60), t % 60);
        var iso = at.toISOString();
        if (!leadOk(iso)) continue;
        // Drop ~1 in 3 slots, stably, so some times look taken.
        if (hash(service.id + '|' + iso) % 3 === 0) continue;
        list.push({ startAt: iso });
      }
    }
    return list;
  }

  // ---------- shell ----------
  var dlg = document.createElement('dialog');
  dlg.className = 'bk-modal';
  dlg.setAttribute('aria-labelledby', 'bkTitle');
  dlg.setAttribute('closedby', 'none');
  dlg.innerHTML =
    '<div class="bk-head">' +
      '<ol class="bk-steps" aria-label="Progress">' +
        '<li><button type="button" data-step="1"><b>1</b> Service</button></li>' +
        '<li><button type="button" data-step="2"><b>2</b> Time</button></li>' +
        '<li><button type="button" data-step="3"><b>3</b> Info</button></li>' +
      '</ol>' +
      '<button type="button" class="bk-close" aria-label="Close">&times;</button>' +
    '</div>' +
    '<div class="bk-body"><p class="bk-demo">Demo booking</p><h2 class="bk-title" id="bkTitle" tabindex="-1"></h2><div class="bk-content"></div></div>' +
    '<div class="bk-foot"></div>' +
    '<p class="bk-sr" aria-live="polite"></p>';
  document.body.appendChild(dlg);
  var titleEl = dlg.querySelector('.bk-title');
  var contentEl = dlg.querySelector('.bk-content');
  var bodyEl = dlg.querySelector('.bk-body');
  var footEl = dlg.querySelector('.bk-foot');
  var liveEl = dlg.querySelector('.bk-sr');
  var stepsEl = dlg.querySelector('.bk-steps');

  stepsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-step]');
    if (!b || b.disabled) return;
    var n = +b.getAttribute('data-step');
    if (n < S.step) back(S.step - n);
  });
  dlg.querySelector('.bk-close').addEventListener('click', close);
  // Only the X (and Done after a booking) closes the card — not Escape, backdrop, or swipe-back.
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); });

  triggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      S.barber = btn.getAttribute('data-barber') || '';
      if (dlg.open) return;
      dlg.showModal();
      document.documentElement.classList.add('bk-lock');
      go(S.step >= 1 && S.step < 4 ? S.step : 1);
    });
  });

  function go(n) { render(n); }
  function back(k) { render(Math.max(1, S.step - (k || 1))); }
  function close() { shut(); }
  function shut() {
    if (dlg.open) dlg.close();
    document.documentElement.classList.remove('bk-lock');
    if (S.step === 4) { S.slot = null; S.step = 0; }
  }

  function setSteps(n) {
    stepsEl.hidden = n === 4;
    stepsEl.querySelectorAll('button').forEach(function (b) {
      var k = +b.getAttribute('data-step');
      b.disabled = !(k < n);
      b.parentNode.className = k === n ? 'is-now' : k < n ? 'is-done' : '';
      if (k === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }
  function frame(n, title, html) {
    S.step = n;
    setSteps(n);
    titleEl.textContent = title;
    contentEl.innerHTML = html;
    footEl.innerHTML = '';
    bodyEl.scrollTop = 0;
    titleEl.focus({ preventScroll: true });
  }
  function foot(backFn, primary) {
    footEl.innerHTML = '';
    if (backFn) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'bk-btn bk-btn-back'; b.textContent = 'Back';
      b.addEventListener('click', backFn);
      footEl.appendChild(b);
    }
    if (primary) footEl.appendChild(primary);
    footEl.hidden = !footEl.children.length;
  }

  function render(n) {
    if (n === 1) return stepService();
    if (n === 2 && S.service) return stepTime();
    if (n === 3 && S.service && S.slot) return stepInfo();
    if (n === 4 && S.service && S.slot) return done();
    return stepService();
  }

  function stepService() {
    frame(1, 'Pick a service', '<ul class="bk-list">' + SERVICES.map(function (s, i) {
      var on = S.service && S.service.id === s.id;
      return '<li><button type="button" class="bk-option' + (on ? ' is-on' : '') + '" data-i="' + i + '">' +
        '<span class="bk-option-name">' + esc(s.name) + '</span>' +
        '<span class="bk-option-meta"><b>' + esc(money(s.priceCents)) + '</b>' +
        (s.durationMin ? '<small>' + s.durationMin + ' min</small>' : '') + '</span>' +
        '</button></li>';
    }).join('') + '</ul>');
    foot(null);
    contentEl.querySelectorAll('.bk-option').forEach(function (el) {
      el.addEventListener('click', function () {
        var s = SERVICES[+el.getAttribute('data-i')];
        if (!S.service || S.service.id !== s.id) { S.day = null; S.slot = null; }
        S.service = s;
        go(2);
      });
    });
  }

  function stepTime() {
    var slots = fakeSlots(S.service);
    S.slots = slots;
    var flash = S.flash; S.flash = '';
    drawTime(slots, flash);
  }
  function drawTime(slots, flash) {
    var byDay = {};
    slots.forEach(function (s) {
      if (!leadOk(s.startAt)) return;
      var k = dayKey(new Date(s.startAt));
      (byDay[k] = byDay[k] || []).push(s);
    });
    if (S.slot && !leadOk(S.slot.startAt)) S.slot = null;
    var keys = Object.keys(byDay).sort();
    if (!keys.length) {
      frame(2, 'Pick a time', summaryBar(false) + '<p class="bk-msg">No open times in the next ' + DAYS + ' days.</p>');
      foot(function () { back(); });
      return;
    }
    if (!S.day || !byDay[S.day]) S.day = keys[0];

    var todayKey = dayKey(new Date());
    var start = keyToNoon(todayKey); start = new Date(start.getTime() - start.getUTCDay() * 864e5);
    var last = keyToNoon(keys[keys.length - 1]); last = new Date(last.getTime() + (6 - last.getUTCDay()) * 864e5);
    var cells = '';
    for (var t = start.getTime(); t <= last.getTime(); t += 864e5) {
      var d = new Date(t), k = d.toISOString().slice(0, 10), n = d.getUTCDate();
      var has = !!byDay[k], on = k === S.day;
      var mon = (n === 1 || t === start.getTime()) ? '<small>' + esc(utcMonth.format(d)) + '</small>' : '';
      cells += '<button type="button" class="bk-day' + (on ? ' is-on' : '') + (k === todayKey ? ' is-today' : '') + '" data-k="' + k + '"' +
        (has ? '' : ' disabled') + ' aria-pressed="' + on + '" aria-label="' + esc(utcLong.format(d)) + (has ? '' : ', no times') + '">' +
        mon + '<span>' + n + '</span></button>';
    }
    var times = byDay[S.day].map(function (s, i) {
      var on = S.slot && S.slot.startAt === s.startAt;
      return '<button type="button" class="bk-time' + (on ? ' is-on' : '') + '" data-i="' + i + '">' + esc(timeFmt.format(new Date(s.startAt))) + '</button>';
    }).join('');
    frame(2, 'Pick a time',
      summaryBar(false) +
      (flash ? '<p class="bk-msg bk-warn" role="alert">' + esc(flash) + '</p>' : '') +
      '<div class="bk-cal" role="group" aria-label="Day">' +
        '<div class="bk-dow" aria-hidden="true"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>' +
        '<div class="bk-grid">' + cells + '</div>' +
      '</div>' +
      '<h3 class="bk-sub" id="bkDay">' + esc(longDay.format(new Date(byDay[S.day][0].startAt))) + '</h3>' +
      '<div class="bk-times" role="group" aria-labelledby="bkDay">' + times + '</div>');
    foot(function () { back(); });
    contentEl.querySelectorAll('.bk-day:not([disabled])').forEach(function (el) {
      el.addEventListener('click', function () {
        S.day = el.getAttribute('data-k');
        var y = bodyEl.scrollTop;
        drawTime(slots);
        bodyEl.scrollTop = y;
        var sub = contentEl.querySelector('#bkDay');
        var f = contentEl.querySelector('.bk-day[data-k="' + S.day + '"]');
        if (f) f.focus({ preventScroll: true });
        if (sub && sub.scrollIntoView) sub.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        liveEl.textContent = byDay[S.day].length + ' times on ' + longDay.format(new Date(byDay[S.day][0].startAt));
      });
    });
    contentEl.querySelectorAll('.bk-time').forEach(function (el) {
      el.addEventListener('click', function () { S.slot = byDay[S.day][+el.getAttribute('data-i')]; go(3); });
    });
  }

  function summaryBar(withTime) {
    var s = S.service;
    var html = '<div class="bk-pick"><div><b>' + esc(s.name) + '</b><span>' + esc(meta(s)) + '</span></div>' +
      '<button type="button" class="bk-link" data-edit="1">Change</button></div>';
    if (withTime && S.slot) {
      var d = new Date(S.slot.startAt);
      html += '<div class="bk-pick"><div><b>' + esc(shortDay.format(d)) + '</b><span>' + esc(timeFmt.format(d)) + '</span></div>' +
        '<button type="button" class="bk-link" data-edit="2">Change</button></div>';
    }
    return '<div class="bk-picks">' + html + '</div>';
  }
  contentEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-edit]');
    if (b) back(S.step - +b.getAttribute('data-edit'));
  });

  var CHECKS = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name.'; },
    phone: function (v) { var d = v.replace(/\D/g, ''); return d.length === 10 || (d.length === 11 && d[0] === '1') ? '' : 'Enter a 10-digit phone number.'; }
  };

  function stepInfo() {
    var i = S.info;
    function field(name, label, attrs, val) {
      return '<div class="bk-field"><label for="bk-' + name + '">' + label + '</label>' +
        '<input id="bk-' + name + '" name="' + name + '" ' + attrs + ' value="' + esc(val) + '" aria-describedby="bk-' + name + '-err">' +
        '<p class="bk-err" id="bk-' + name + '-err"></p></div>';
    }
    frame(3, 'Your info',
      summaryBar(true) +
      '<form class="bk-form" id="bkForm" novalidate>' +
        field('name', 'Name', 'type="text" autocomplete="name" autocapitalize="words" autocorrect="off" spellcheck="false" enterkeyhint="next" required maxlength="80"', i.name) +
        field('phone', 'Phone', 'type="tel" autocomplete="tel" inputmode="tel" enterkeyhint="done" required maxlength="20"', i.phone) +
      '</form>');
    var form = contentEl.querySelector('form');
    var go3 = document.createElement('button');
    go3.type = 'submit'; go3.setAttribute('form', 'bkForm'); go3.className = 'bk-btn bk-btn-book';
    go3.innerHTML = 'Book it <span>' + esc(money(S.service.priceCents)) + '</span>';
    foot(function () { save(); back(); }, go3);

    function save() { ['name', 'phone'].forEach(function (n) { S.info[n] = form.elements[n].value; }); }
    function check(name) {
      var el = form.elements[name], msg = CHECKS[name](el.value);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      form.querySelector('#bk-' + name + '-err').textContent = msg;
      return !msg;
    }
    var phoneEl = form.elements.phone;
    phoneEl.addEventListener('input', function () {
      var atEnd = phoneEl.selectionStart === phoneEl.value.length;
      var f = fmtPhone(phoneEl.value);
      if (atEnd && f !== phoneEl.value) phoneEl.value = f;
    });
    Object.keys(CHECKS).forEach(function (n) {
      var el = form.elements[n];
      el.addEventListener('blur', function () { if (el.value) check(n); save(); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') check(n); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      save();
      var bad = Object.keys(CHECKS).filter(function (n) { return !check(n); });
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      if (!S.slot || !leadOk(S.slot.startAt)) {
        S.slot = null;
        S.flash = 'That time is too soon. Pick one at least an hour from now.';
        return back(1);
      }
      // Fake book: no request is sent, nothing is saved.
      go3.disabled = true; go3.textContent = 'Booking...';
      setTimeout(function () { done(); }, 280);
    });
  }

  function done() {
    var at = new Date(S.slot.startAt);
    var barberRow = S.barber
      ? '<dt>Barber</dt><dd>' + esc(S.barber) + '</dd>'
      : '';
    frame(4, "You're booked",
      '<p class="bk-msg">See you ' + esc(longDay.format(at)) + ' at ' + esc(timeFmt.format(at)) + '.</p>' +
      '<dl class="bk-summary">' +
        barberRow +
        '<dt>Service</dt><dd>' + esc(S.service.name) + ' <span>' + esc(meta(S.service)) + '</span></dd>' +
        '<dt>When</dt><dd>' + esc(longDay.format(at)) + ', ' + esc(timeFmt.format(at)) + '</dd>' +
        (S.info.name ? '<dt>Name</dt><dd>' + esc(S.info.name) + '</dd>' : '') +
        (S.info.phone ? '<dt>Phone</dt><dd>' + esc(S.info.phone) + '</dd>' : '') +
      '</dl>');
    var ok = document.createElement('button');
    ok.type = 'button'; ok.className = 'bk-btn bk-btn-go'; ok.textContent = 'Done';
    ok.addEventListener('click', close);
    foot(null, ok);
  }
})();
