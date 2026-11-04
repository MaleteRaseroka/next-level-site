/* ==========================================================================
   NEXT LEVEL - Gaming & Esports Arena
   One shared script for every page. Each feature only runs when the
   elements it needs exist on the current page.
   Sections: 1 Data · 2 Helpers · 3 Validation · 4 Navigation & dropdown
             5 Newsletter · 6 FAQ · 7 Opening hours · 8 Experiences table
             9 Contact form · 10 Booking flow · 11 Fee calculator
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. DATA ---------- */
  const EXPERIENCES = [
  {
    "id": "vip",
    "name": "VIP Gaming Experience",
    "meta": "1–5 players · 2 hours",
    "price": 700,
    "hours": 2,
    "minPlayers": 1,
    "maxPlayers": 5,
    "img": "photo-14.png",
    "alt": "Private VIP gaming suite",
    "tag": "PRIVATE SUITE"
  },
  {
    "id": "bootcamp",
    "name": "Esports Team Bootcamp",
    "meta": "Up to 10 players · 4 hours",
    "price": 1800,
    "hours": 4,
    "minPlayers": 1,
    "maxPlayers": 10,
    "img": "photo-19.png",
    "alt": "Esports team competing together",
    "tag": "TEAM EXPERIENCE"
  },
  {
    "id": "console",
    "name": "Console Party Lounge",
    "meta": "Up to 8 players · 3 hours",
    "price": 1100,
    "hours": 3,
    "minPlayers": 1,
    "maxPlayers": 8,
    "img": "photo-18.png",
    "alt": "Friends playing console games together on a couch",
    "tag": "TEAM EXPERIENCE"
  },
  {
    "id": "racing",
    "name": "Racing Simulator Duel",
    "meta": "2 players · 60 minutes",
    "price": 550,
    "hours": 1,
    "minPlayers": 2,
    "maxPlayers": 2,
    "img": "photo-11.png",
    "alt": "Two racing simulator cockpits side by side",
    "tag": "SIM RACING"
  }
];
  const VAT_RATE = 0.15;
  const DISCOUNT_RATE = 0.10;
  const DISCOUNT_MIN_BOOKINGS = 3;
  const MAX_QTY = 10;
  const DURATIONS = [1, 2, 3, 4];
  // Opening and closing hour per weekday (0 = Sunday). A close above 24 means "after midnight".
  const HOURS = {
    0: [10, 24], 1: [10, 24], 2: [10, 24], 3: [10, 24], 4: [10, 24],
    5: [14, 26], 6: [10, 26]
  };

  /* ---------- 2. HELPERS ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const money = n => 'R' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const findExp = id => EXPERIENCES.find(e => e.id === id);

  const store = {
    get(key, fallback) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) { return fallback; }          // storage blocked or corrupt JSON
    },
    set(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (err) { return false; }
    }
  };

  function toast(message, type) {
    let box = $('#toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.className = 'show ' + (type || 'success');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { box.className = ''; }, 4500);
  }

  // Broken images fall back to a dark placeholder instead of a broken icon.
  document.addEventListener('error', function (e) {
    const img = e.target;
    if (img && img.tagName === 'IMG' && !img.dataset.failed) {
      img.dataset.failed = '1';
      img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#141a2e"/>' +
        '<text x="50%" y="50%" fill="#9aa3b8" font-family="Arial" font-size="28" text-anchor="middle">Image unavailable</text></svg>');
    }
  }, true);

  // Last line of defence: unexpected errors never leave the visitor with a silent failure.
  window.addEventListener('error', function (e) {
    if (e.target && e.target.tagName) return;      // resource errors handled above
    console.error(e.error || e.message);
    toast('Something went wrong. Please refresh the page and try again.', 'error');
  });
  window.addEventListener('unhandledrejection', function (e) {
    console.error(e.reason);
    toast('Something went wrong. Please refresh the page and try again.', 'error');
  });

  /* ---------- 3. VALIDATION ---------- */
  function setError(input, message) {
    const field = input.closest('.field') || input.closest('.check-field');
    if (!field) return;
    let err = field.querySelector('.error-msg');
    if (!err) {
      err = document.createElement('p');
      err.className = 'error-msg';
      err.id = (input.id || input.name) + '-error';
      field.appendChild(err);
    }
    err.textContent = message;
    field.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', err.id);
  }

  function clearError(input) {
    const field = input.closest('.field') || input.closest('.check-field');
    if (!field) return;
    const err = field.querySelector('.error-msg');
    if (err) err.remove();
    field.classList.remove('has-error');
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }

  const rules = {
    name(v) {
      v = v.trim();
      if (v.length < 2) return 'Enter your full name (at least 2 characters).';
      if (!/^\p{L}[\p{L}\s.'-]*$/u.test(v)) return 'Names can only contain letters, spaces, apostrophes and hyphens.';
      return '';
    },
    email(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address, for example you@example.com.';
    },
    phone(v) {
      const digits = v.replace(/[\s()-]/g, '');
      return /^(\+27|0027|0)[6-8]\d{8}$/.test(digits) ? '' : 'Enter a South African mobile number, for example 082 123 4567 or +27 82 123 4567.';
    },
    select(v) { return v ? '' : 'Choose an option from the list.'; },
    message(v) {
      const len = v.trim().length;
      if (len < 10) return 'Write at least 10 characters so we can help you properly.';
      if (len > 1000) return 'Keep your message under 1000 characters.';
      return '';
    },
    date(v) {
      if (!v) return 'Choose a date for your session.';
      const d = parseDate(v);
      if (!d) return 'Enter a valid date.';
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) return 'That date has passed. Choose today or a future date.';
      const max = new Date(today); max.setDate(max.getDate() + 180);
      if (d > max) return 'Bookings open up to 180 days ahead. Choose an earlier date.';
      return '';
    },
    time(v) { return /^\d{2}:\d{2}$/.test(v) ? '' : 'Choose a start time.'; },
    checkbox(v, input) { return input.checked ? '' : 'You need to accept this before continuing.'; }
  };

  function parseDate(value) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return null;
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }

  // Validates one input that has data-validate="rule". Returns true when valid.
  function checkField(input) {
    const rule = input.dataset.validate;
    if (!rule || !rules[rule]) return true;
    let message = '';
    if (input.required && input.type !== 'checkbox' && !input.value.trim()) message = 'This field is required.';
    else message = rules[rule](input.value, input);
    if (message) { setError(input, message); return false; }
    clearError(input);
    return true;
  }

  // Validates every field in a container, focuses the first invalid one.
  function checkAll(container) {
    const inputs = $$('[data-validate]', container);
    let firstBad = null;
    inputs.forEach(function (input) {
      if (!checkField(input) && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function liveValidate(container) {
    $$('[data-validate]', container).forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value || input.dataset.touched) checkField(input); });
      input.addEventListener('input', function () { input.dataset.touched = '1'; if (input.closest('.has-error')) checkField(input); });
      input.addEventListener('change', function () { if (input.closest('.has-error')) checkField(input); });
    });
  }

  function showAlert(box, type, message) {
    if (!box) return;
    box.className = 'form-alert ' + type;
    box.textContent = message;
    box.hidden = false;
  }

  /* ---------- 4. NAVIGATION AND DROPDOWN ---------- */
  function initNav() {
    const toggle = $('.nav-toggle');
    const nav = $('#site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? '✕' : '☰';
      });
    }
    $$('.dropdown').forEach(function (dd) {
      const btn = $('.dropdown-toggle', dd);
      const setOpen = function (open) {
        dd.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
      };
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        setOpen(!dd.classList.contains('open'));
      });
      dd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { setOpen(false); btn.focus(); }
      });
      dd.addEventListener('focusout', function (e) {
        if (!dd.contains(e.relatedTarget)) setOpen(false);
      });
      document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setOpen(false); });
    });
    const year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- 5. NEWSLETTER ---------- */
  function initNewsletter() {
    $$('.newsletter').forEach(function (form) {
      const input = $('input', form);
      const msg = $('.msg', form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const problem = rules.email(input.value);
        msg.className = 'msg ' + (problem ? 'error' : 'success');
        if (problem) {
          msg.textContent = problem;
          input.setAttribute('aria-invalid', 'true');
          input.focus();
        } else {
          input.removeAttribute('aria-invalid');
          msg.textContent = 'You are on the list. Watch your inbox for drops and tournaments.';
          form.reset();
        }
      });
    });
  }

  /* ---------- 6. FAQ ACCORDION ---------- */
  function initFaq() {
    $$('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        document.getElementById(btn.getAttribute('aria-controls')).hidden = open;
      });
    });
  }

  /* ---------- 7. OPENING HOURS (South African time) ---------- */
  function saNow() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Africa/Johannesburg', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      const get = type => parts.find(p => p.type === type).value;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return { day: days.indexOf(get('weekday')), hour: (+get('hour') % 24) + (+get('minute')) / 60 };
    } catch (err) {
      const d = new Date();
      return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 };
    }
  }

  function isOpenAt(day, hour) {
    const today = HOURS[day];
    if (hour >= today[0] && hour < Math.min(today[1], 24)) return true;
    const prev = HOURS[(day + 6) % 7];
    return prev[1] > 24 && hour < prev[1] - 24;     // still open from yesterday's late close
  }

  function initOpenStatus() {
    const badges = $$('[data-open-status]');
    const rows = $$('[data-day]');
    if (!badges.length && !rows.length) return;
    const now = saNow();
    const open = isOpenAt(now.day, now.hour);
    badges.forEach(function (b) {
      b.textContent = open ? 'OPEN NOW' : 'CLOSED';
      b.classList.toggle('closed', !open);
    });
    const tag = $('[data-open-tag]');
    if (tag) tag.textContent = open ? 'Open now in Pretoria' : 'Closed right now. Opens at 10:00 AM (2:00 PM Fridays)';
    rows.forEach(function (row) {
      const days = row.dataset.day.split(',').map(Number);
      row.classList.toggle('today', days.indexOf(now.day) !== -1);
    });
  }

  /* ---------- 8. EXPERIENCES TABLE (sort drop-down) ---------- */
  function initExperienceTable() {
    const select = $('#sortTable');
    const body = $('#compareBody');
    if (!select || !body) return;
    const sorters = {
      default: (a, b) => a.dataset.order - b.dataset.order,
      'price-asc': (a, b) => a.dataset.price - b.dataset.price,
      'price-desc': (a, b) => b.dataset.price - a.dataset.price,
      duration: (a, b) => a.dataset.hours - b.dataset.hours,
      players: (a, b) => b.dataset.max - a.dataset.max
    };
    select.addEventListener('change', function () {
      const sorter = sorters[select.value] || sorters.default;
      $$('tr', body).sort(sorter).forEach(row => body.appendChild(row));
    });
  }

  /* ---------- 9. CONTACT FORM ---------- */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;
    const alertBox = $('#contactAlert');
    const counter = $('#msgCount');
    const message = $('#message');
    liveValidate(form);
    if (message && counter) {
      message.addEventListener('input', function () { counter.textContent = message.value.length + ' / 1000'; });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox.hidden = true;
      if (!checkAll(form)) {
        showAlert(alertBox, 'error', 'Some fields need your attention. Fix the highlighted fields and send again.');
        return;
      }
      try {
        // A static site has no server, so the enquiry is kept in the browser for the demo.
        const inbox = store.get('nl-enquiries', []);
        inbox.push({ name: $('#fullName', form).value.trim(), subject: $('#subject', form).value, sent: new Date().toISOString() });
        store.set('nl-enquiries', inbox);
        showAlert(alertBox, 'success', 'Thanks ' + $('#fullName', form).value.trim().split(' ')[0] + ', your message is in. We reply within one business day.');
        form.reset();
        if (counter) counter.textContent = '0 / 1000';
        $$('[data-validate]', form).forEach(clearError);
        if (typeof alertBox.scrollIntoView === 'function') alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (err) {
        console.error(err);
        showAlert(alertBox, 'error', 'We could not send your message. Check your connection and try again, or call +27 12 555 0199.');
      }
    });
  }

  /* ---------- 10. BOOKING FLOW ---------- */
  function initBooking() {
    const panel = $('#bookingPanel');
    if (!panel) return;
    const optionsBox = $('#expOptions');
    const playersSel = $('#players');
    const dateIn = $('#date');
    const timeIn = $('#time');
    const alertBox = $('#bookAlert');
    const stepper = $('#stepper');
    const state = { step: 1, exp: EXPERIENCES[0] };

    // Date picker cannot go into the past or beyond 180 days.
    const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const today = new Date();
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 180);
    dateIn.min = iso(today);
    dateIn.max = iso(maxDate);

    // Build the experience choices from the shared data.
    EXPERIENCES.forEach(function (exp) {
      const label = document.createElement('label');
      label.className = 'exp-option';
      label.innerHTML =
        '<input type="radio" name="experience" class="visually-hidden" value="' + exp.id + '">' +
        '<div><div class="name">' + exp.name + '</div><div class="meta">' + exp.meta + '</div></div>' +
        '<div class="price">R ' + exp.price + '</div>';
      optionsBox.appendChild(label);
    });

    function chooseExperience(id) {
      state.exp = findExp(id) || EXPERIENCES[0];
      $$('.exp-option', optionsBox).forEach(function (label) {
        const radio = $('input', label);
        radio.checked = radio.value === state.exp.id;
        label.classList.toggle('selected', radio.checked);
      });
      // The players list follows the experience's real capacity.
      playersSel.innerHTML = '';
      for (let n = state.exp.minPlayers; n <= state.exp.maxPlayers; n++) {
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = n + (n === 1 ? ' player' : ' players');
        playersSel.appendChild(opt);
      }
      playersSel.value = String(Math.min(Math.max(4, state.exp.minPlayers), state.exp.maxPlayers));
    }
    optionsBox.addEventListener('change', function (e) { if (e.target.name === 'experience') chooseExperience(e.target.value); });

    // ?exp=racing preselects an experience (used by the links on other pages).
    const wanted = new URLSearchParams(window.location.search).get('exp');
    chooseExperience(wanted && findExp(wanted) ? wanted : EXPERIENCES[0].id);

    liveValidate(panel);

    function sessionWindowError() {
      const d = parseDate(dateIn.value);
      if (!d || !timeIn.value) return '';
      const [h, m] = timeIn.value.split(':').map(Number);
      const start = h + m / 60;
      const [open, close] = HOURS[d.getDay()];
      const end = start + state.exp.hours;
      if (start < open) return 'We open at ' + fmtHour(open) + ' on that day. Choose a later start time.';
      if (end > close) return 'A ' + state.exp.hours + '-hour session starting then would end after closing at ' + fmtHour(close) + '. Start earlier.';
      if (iso(d) === iso(today) && start <= today.getHours() + today.getMinutes() / 60) return 'That start time has already passed today.';
      return '';
    }
    function fmtHour(h) {
      const hh = h % 24, suffix = hh >= 12 && hh < 24 ? 'PM' : 'AM';
      return ((hh + 11) % 12 + 1) + ':00 ' + suffix;
    }

    function validateStep(n) {
      alertBox.hidden = true;
      if (n === 1) return true;
      if (n === 2) {
        const ok = checkAll($('#step2'));
        if (!ok) { showAlert(alertBox, 'error', 'Check the date and time before continuing.'); return false; }
        const windowError = sessionWindowError();
        if (windowError) { setError(timeIn, windowError); timeIn.focus(); showAlert(alertBox, 'error', windowError); return false; }
        return true;
      }
      if (n === 3) {
        const ok = checkAll($('#step3'));
        if (!ok) showAlert(alertBox, 'error', 'Some details are missing or invalid. Fix the highlighted fields.');
        return ok;
      }
      return true;
    }

    function goToStep(n) {
      state.step = n;
      [1, 2, 3].forEach(i => { $('#step' + i).hidden = i !== n; });
      $$('.step', stepper).forEach(function (s) {
        const num = +s.dataset.step;
        s.classList.toggle('active', num === n);
        s.classList.toggle('done', num < n);
        if (num === n) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
      });
      if (n === 3) renderSummary($('#summaryTable'));
      const heading = $('#step' + n + ' h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    }

    function pricing() {
      const subtotal = state.exp.price;
      const vat = subtotal * VAT_RATE;
      return { subtotal: subtotal, vat: vat, total: subtotal + vat };
    }

    function prettyDate(value) {
      const d = parseDate(value);
      return d ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : value;
    }

    function renderSummary(table) {
      const p = pricing();
      table.innerHTML =
        '<tbody>' +
        row('Experience', state.exp.name) +
        row('Date', prettyDate(dateIn.value)) +
        row('Start time', timeIn.value) +
        row('Players', playersSel.value + (playersSel.value === '1' ? ' player' : ' players')) +
        row('Session price', money(p.subtotal)) +
        row('VAT (15%)', money(p.vat)) +
        '<tr class="total"><th scope="row">Total</th><td>' + money(p.total) + '</td></tr>' +
        '</tbody>';
      function row(label, value) { return '<tr><th scope="row">' + label + '</th><td>' + value + '</td></tr>'; }
    }

    $$('[data-next]', panel).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const next = +btn.dataset.next;
        if (validateStep(state.step)) goToStep(next);
      });
    });
    $$('[data-back]', panel).forEach(function (btn) {
      btn.addEventListener('click', function () { alertBox.hidden = true; goToStep(+btn.dataset.back); });
    });

    $('#confirmBtn').addEventListener('click', function () {
      if (!validateStep(3)) return;
      try {
        const booking = {
          ref: 'NL-' + Date.now().toString(36).toUpperCase().slice(-6),
          experience: state.exp.name,
          date: dateIn.value,
          time: timeIn.value,
          players: playersSel.value,
          name: $('#bookName').value.trim(),
          phone: $('#bookPhone').value.trim(),
          total: pricing().total
        };
        store.set('nl-last-booking', booking);
        $('#refCode').textContent = booking.ref;
        $('#confirmName').textContent = booking.name.split(' ')[0];
        renderSummary($('#confirmTable'));
        [1, 2, 3].forEach(i => { $('#step' + i).hidden = true; });
        stepper.hidden = true;
        $('#stepConfirm').hidden = false;
        alertBox.hidden = true;
        const h = $('#stepConfirm h2'); h.setAttribute('tabindex', '-1'); h.focus();
      } catch (err) {
        console.error(err);
        showAlert(alertBox, 'error', 'We could not complete your booking. Nothing was charged. Please try again.');
      }
    });

    $('#newBooking').addEventListener('click', function () {
      $('#stepConfirm').hidden = true;
      stepper.hidden = false;
      $$('[data-validate]', panel).forEach(function (i) { if (i.type !== 'radio') { i.value = i.defaultValue; } clearError(i); });
      $('#terms').checked = false;
      chooseExperience(EXPERIENCES[0].id);
      goToStep(1);
    });
  }

  /* ---------- 11. FEE CALCULATOR ---------- */
  function initCalculator() {
    const list = $('#calcList');
    if (!list) return;
    const addSel = $('#addSelect');
    const emptyBox = $('#calcEmpty');
    const continueBtn = $('#continueBtn');
    const quoteBtn = $('#quoteBtn');
    const hint = $('#discountHint');

    const DEFAULT_LINES = [
      { id: 'vip', qty: 1, hours: 2 },
      { id: 'bootcamp', qty: 2, hours: 4 },
      { id: 'racing', qty: 1, hours: 1 }
    ];

    // Saved lines are validated before use: stale or edited storage can never break the page.
    function loadLines() {
      const saved = store.get('nl-calculator', null);
      if (!Array.isArray(saved)) return DEFAULT_LINES.map(l => Object.assign({}, l));
      return saved.filter(l => l && findExp(l.id) && Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= MAX_QTY && DURATIONS.indexOf(l.hours) !== -1)
        .map(l => ({ id: l.id, qty: l.qty, hours: l.hours }));
    }
    let lines = loadLines();

    EXPERIENCES.forEach(function (exp) {
      const opt = document.createElement('option');
      opt.value = exp.id;
      opt.textContent = exp.name + ' (from R' + exp.price + ')';
      addSel.appendChild(opt);
    });

    const linePrice = l => Math.round(findExp(l.id).price * (l.hours / findExp(l.id).hours) * l.qty * 100) / 100;

    function totals() {
      const subtotal = lines.reduce((s, l) => s + linePrice(l), 0);
      const bookings = lines.reduce((s, l) => s + l.qty, 0);
      const discount = bookings >= DISCOUNT_MIN_BOOKINGS ? subtotal * DISCOUNT_RATE : 0;
      const vat = (subtotal - discount) * VAT_RATE;
      return { subtotal: subtotal, bookings: bookings, discount: discount, vat: vat, total: subtotal - discount + vat };
    }

    function render(focus) {
      list.innerHTML = '';
      lines.forEach(function (l, i) {
        const exp = findExp(l.id);
        const card = document.createElement('div');
        card.className = 'calc-card';
        card.innerHTML =
          '<img class="calc-thumb" src="images/' + exp.img + '" alt="' + exp.alt + '">' +
          '<div>' +
            '<div class="calc-tag">' + exp.tag + '</div>' +
            '<div class="calc-name">' + exp.name + '</div>' +
            '<div class="calc-meta">Equipment included · ' + exp.meta + '</div>' +
            '<div class="calc-controls">' +
              '<div><span class="label" id="q' + i + '">Quantity</span>' +
                '<div class="qty-btns" role="group" aria-labelledby="q' + i + '">' +
                  '<button type="button" data-act="dec" data-i="' + i + '" aria-label="Decrease quantity of ' + exp.name + '"' + (l.qty <= 1 ? ' disabled' : '') + '>–</button>' +
                  '<output aria-live="polite">' + l.qty + '</output>' +
                  '<button type="button" data-act="inc" data-i="' + i + '" aria-label="Increase quantity of ' + exp.name + '"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
                '</div></div>' +
              '<div><label class="label" for="d' + i + '">Duration</label>' +
                '<select id="d' + i + '" data-act="dur" data-i="' + i + '">' +
                  DURATIONS.map(h => '<option value="' + h + '"' + (h === l.hours ? ' selected' : '') + '>' + h + (h === 1 ? ' hour' : ' hours') + '</option>').join('') +
                '</select></div>' +
            '</div>' +
          '</div>' +
          '<div class="calc-right">' +
            '<div class="calc-price">' + money(linePrice(l)) + '</div>' +
            '<button type="button" class="remove-btn" data-act="remove" data-i="' + i + '" aria-label="Remove ' + exp.name + '">Remove</button>' +
          '</div>';
        list.appendChild(card);
      });

      const t = totals();
      const set = (id, v) => { $(id).textContent = v; };
      set('#selectedCount', lines.length + ' selected');
      set('#subtotal', money(t.subtotal));
      set('#bookingCount', String(t.bookings));
      set('#discount', '– ' + money(t.discount));
      set('#vat', money(t.vat));
      set('#finalTotal', money(t.total));
      emptyBox.hidden = lines.length > 0;
      continueBtn.disabled = quoteBtn.disabled = lines.length === 0;
      if (!lines.length) hint.textContent = 'Add at least one experience to see your estimate.';
      else if (t.bookings < DISCOUNT_MIN_BOOKINGS) {
        const need = DISCOUNT_MIN_BOOKINGS - t.bookings;
        hint.textContent = 'Add ' + need + ' more booking' + (need > 1 ? 's' : '') + ' to unlock the 10% multi-booking discount.';
      } else hint.textContent = '10% multi-booking discount applied. This is an estimate. Final pricing and availability are confirmed before payment.';

      store.set('nl-calculator', lines);
      if (focus) {
        const target = $('[data-act="' + focus.act + '"][data-i="' + focus.i + '"]', list);
        if (target && !target.disabled) target.focus();
      }
    }

    list.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const i = +btn.dataset.i, act = btn.dataset.act;
      if (act === 'inc') {
        if (lines[i].qty >= MAX_QTY) return toast('For more than ' + MAX_QTY + ' of one experience, request a custom quote.', 'error');
        lines[i].qty++;
        render({ act: 'inc', i: i });
      } else if (act === 'dec') { lines[i].qty = Math.max(1, lines[i].qty - 1); render({ act: 'dec', i: i }); }
      else if (act === 'remove') { lines.splice(i, 1); render(); toast('Experience removed.'); }
    });
    list.addEventListener('change', function (e) {
      if (e.target.dataset.act !== 'dur') return;
      const hours = +e.target.value;
      if (DURATIONS.indexOf(hours) === -1) return toast('Choose a duration from the list.', 'error');
      lines[+e.target.dataset.i].hours = hours;
      render({ act: 'dur', i: e.target.dataset.i });
    });

    $('#addBtn').addEventListener('click', function () {
      if (!addSel.value) return toast('Choose an experience to add first.', 'error');
      const existing = lines.find(l => l.id === addSel.value);
      const exp = findExp(addSel.value);
      if (existing) {
        if (existing.qty >= MAX_QTY) return toast('You already have the maximum of ' + MAX_QTY + '. Request a custom quote instead.', 'error');
        existing.qty++;
      } else lines.push({ id: exp.id, qty: 1, hours: exp.hours });
      addSel.value = '';
      render();
      toast(exp.name + ' added.');
    });

    continueBtn.addEventListener('click', function () {
      if (!lines.length) return toast('Add an experience before continuing.', 'error');
      window.location.href = 'book.html?exp=' + encodeURIComponent(lines[0].id);
    });

    // Quote request dialog
    const dialog = $('#quoteDialog');
    const quoteForm = $('#quoteForm');
    liveValidate(quoteForm);
    quoteBtn.addEventListener('click', function () {
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    });
    const closeDialog = () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); };
    $('#quoteCancel').addEventListener('click', closeDialog);
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkAll(quoteForm)) return;
      const t = totals();
      store.set('nl-last-quote', { name: $('#quoteName').value.trim(), email: $('#quoteEmail').value.trim(), total: t.total, lines: lines });
      closeDialog();
      quoteForm.reset();
      toast('Quote requested. Our team will email you shortly.');
    });

    render();
  }

  /* ---------- START ---------- */
  function start() {
    initNav();
    initNewsletter();
    initFaq();
    initOpenStatus();
    initExperienceTable();
    initContactForm();
    initBooking();
    initCalculator();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
