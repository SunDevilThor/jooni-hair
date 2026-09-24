/* ============================================================
   JOON | site behaviour
   Vanilla JS, no dependencies. Every block guards on the
   elements it needs, so one file serves every page.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG

     Four strings turn features on. Every one of them is safe to
     leave empty: the page falls back to the Instagram only flow
     and nothing broken or half finished is ever shown.

     BOOKING_URL  Her Square Appointments booking link. In Square:
                  Appointments > Online Booking > Channels > "Add
                  your booking flow to an existing site" > Get URL.
                  Setting it puts a "Book online" button at the top
                  of book.html and demotes the Instagram button.

     FORM_KEY     Her Web3Forms access key, a UUID. Get it at
                  web3forms.com by entering the email the enquiries
                  should go to; the key arrives by return email.
                  It is public by design and belongs in the source.
                  Setting it turns the message helper into a form
                  that can send straight to her inbox, as well as
                  building a DM.

     DEPOSIT_URL  A Square payment link or invoice, for taking a
                  deposit by hand. Square charges for automatic
                  deposits; a payment link is free.
     ---------------------------------------------------------- */
  var CONFIG = {
    IG_HANDLE: 'jooni.hair',
    DM_URL: 'https://ig.me/m/jooni.hair',
    PROFILE_URL: 'https://www.instagram.com/jooni.hair/',
    /* Joon's Square Appointments booking link goes here when she
       has one. Setting it turns on the Book online button; leaving
       it empty keeps the Instagram only flow. It must be her own
       calendar, never anyone else's. */
    BOOKING_URL: '',
    BOOKING_LABEL: 'Book online',
    /* Joon's Web3Forms access key. Enquiries from the site's message
       form go to the email address this key is registered against.
       If that address changes, get a new key at web3forms.com and
       replace this string. */
    FORM_KEY: 'dab7612d-f0a9-416d-9c68-ffa6f3c50ceb',
    FORM_SUBJECT: 'New booking enquiry from the website',
    DEPOSIT_URL: '',
    DEPOSIT_LABEL: 'Pay deposit and book'
  };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- header state ---------- */
  var header = $('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile drawer ---------- */
  var burger = $('.burger');
  var drawer = $('.drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      drawer.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDrawer(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setDrawer(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealables = $$('.reveal');
  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
      /* Safety net: if the observer never fires for something (headless
         renders, odd scroll containers), show everything after 3s. */
      window.setTimeout(function () {
        revealables.forEach(function (el) { el.classList.add('is-in'); });
      }, 3000);
    }
  }

  /* ---------- gallery filter ---------- */
  var filterBar = $('.filters');
  var tiles = $$('.tile');
  if (filterBar && tiles.length) {
    var applyFilter = function (cat) {
      tiles.forEach(function (t) {
        var show = cat === 'all' || t.getAttribute('data-cat') === cat;
        t.classList.toggle('is-hidden', !show);
      });
      $$('.filter', filterBar).forEach(function (b) {
        b.setAttribute('aria-selected', String(b.getAttribute('data-filter') === cat));
      });
      /* A category with no photos yet shows its own panel instead of an
         empty grid. Add data-empty="<category>" to any such block. */
      var emptyShown = null;
      $$('[data-empty]').forEach(function (el) {
        var match = el.getAttribute('data-empty') === cat;
        el.hidden = !match;
        if (match) emptyShown = el;
      });
      var count = tiles.filter(function (t) { return !t.classList.contains('is-hidden'); }).length;
      var live = $('#filter-status');
      if (!live) return;
      live.textContent = emptyShown
        ? 'No photos in this category yet'
        : count + (count === 1 ? ' look shown' : ' looks shown');
    };
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (btn) applyFilter(btn.getAttribute('data-filter'));
    });
  }

  /* ---------- lightbox ---------- */
  var lb = $('.lb');
  if (lb && tiles.length) {
    var lbImg   = $('.lb__img', lb);
    var lbCap   = $('.lb__cap', lb);
    var lastFocus = null;
    var index = 0;

    var visible = function () {
      return tiles.filter(function (t) { return !t.classList.contains('is-hidden'); });
    };
    var show = function (i) {
      var list = visible();
      if (!list.length) return;
      index = (i + list.length) % list.length;
      var tile = list[index];
      lbImg.src = tile.getAttribute('data-full');
      lbImg.alt = tile.getAttribute('data-alt') || '';
      lbCap.textContent = tile.getAttribute('data-alt') || '';
    };
    var open = function (tile) {
      lastFocus = document.activeElement;
      show(visible().indexOf(tile));
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      $('.lb__close', lb).focus();
    };
    var close = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      lbImg.removeAttribute('src');
      if (lastFocus) lastFocus.focus();
    };

    tiles.forEach(function (t) {
      t.addEventListener('click', function () { open(t); });
    });
    $('.lb__close', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', function () { show(index - 1); });
    $('.lb__next', lb).addEventListener('click', function () { show(index + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'Tab') {
        var f = $$('button', lb);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Square booking button, only when a link exists ----------
     When she has a bookable calendar, that becomes the main way in and
     Instagram steps back to a secondary option. Until then the page
     never mentions online booking at all. */
  var booking = $('[data-booking]');
  if (booking) {
    if (CONFIG.BOOKING_URL) {
      var bLink = $('a', booking);
      bLink.href = CONFIG.BOOKING_URL;
      bLink.textContent = CONFIG.BOOKING_LABEL;
      booking.hidden = false;
      $$('[data-dm-primary]').forEach(function (el) {
        el.classList.replace('btn--primary', 'btn--ghost');
      });
      $$('[data-dm-only]').forEach(function (el) { el.hidden = true; });
      $$('[data-booking-only]').forEach(function (el) { el.hidden = false; });
    } else {
      booking.hidden = true;
    }
  }

  /* ---------- deposit button, only when a link exists ---------- */
  var deposit = $('[data-deposit]');
  if (deposit) {
    if (CONFIG.DEPOSIT_URL) {
      var link = $('a', deposit);
      link.href = CONFIG.DEPOSIT_URL;
      link.textContent = CONFIG.DEPOSIT_LABEL;
      deposit.hidden = false;
      var dmFirst = $('[data-dm-primary]');
      if (dmFirst) dmFirst.classList.replace('btn--primary', 'btn--ghost');
    } else {
      deposit.hidden = true;
    }
  }

  /* ---------- DM message composer ---------- */
  var form = $('#dm-form');
  if (form) {
    var preview  = $('#dm-preview');
    var copyBtn  = $('#dm-copy');
    var openBtn  = $('#dm-open');
    var status   = $('#dm-status');

    var build = function () {
      var name    = $('#f-name').value.trim();
      var service = $('#f-service').value;
      var current = $('#f-current').value.trim();
      var when    = $('#f-when').value.trim();

      var lines = [];
      lines.push('Hi Joon! ' + (name ? 'This is ' + name + '. ' : '') + 'I would love to book with you.');
      if (service) lines.push('Looking for: ' + service);
      if (current) lines.push('My hair right now: ' + current);
      if (when)    lines.push('Best days for me: ' + when);
      lines.push('Let me know what you need from me and I will send photos.');
      return lines.join('\n');
    };

    var render = function () {
      preview.textContent = build();
    };

    form.addEventListener('input', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    render();

    copyBtn.addEventListener('click', function () {
      var text = build();
      var done = function () {
        status.textContent = 'Copied. Paste it into the DM.';
        window.setTimeout(function () { status.textContent = ''; }, 3200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { status.textContent = 'Select the text above and copy it.'; });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (err) { status.textContent = 'Select the text above and copy it.'; }
        document.body.removeChild(ta);
      }
    });

    openBtn.addEventListener('click', function () {
      window.open(CONFIG.DM_URL, '_blank', 'noopener');
    });

    /* ---------- send it straight to her inbox ----------
       Same four answers, a second way out. This exists for the
       visitor who has no Instagram account, which is the whole
       reason it was asked for. It posts to Web3Forms over fetch
       rather than a normal form submit, so nobody leaves the page
       and there is no thank you page to maintain. Everything below
       stays hidden until CONFIG.FORM_KEY is set. */
    var sendBtn = $('#dm-send');
    if (sendBtn && CONFIG.FORM_KEY) {
      var email = $('#f-email');
      var phone = $('#f-phone');
      var trap  = $('#f-botcheck');

      $$('[data-form-only]').forEach(function (el) { el.hidden = false; });
      $$('[data-dm-note]').forEach(function (el) { el.hidden = true; });
      /* Only one primary button in a row, so Send takes the weight and
         the DM becomes the alternative rather than a rival. */
      openBtn.classList.replace('btn--primary', 'btn--ghost');

      var busy = false;
      var say = function (msg, hold) {
        status.textContent = msg;
        if (hold) return;
        window.setTimeout(function () { status.textContent = ''; }, 5000);
      };

      sendBtn.addEventListener('click', function () {
        if (busy) return;
        if (trap && trap.checked) return;               // bot filled the honeypot

        var addr = email.value.trim();
        if (!addr || addr.indexOf('@') < 1 || addr.indexOf('.', addr.indexOf('@')) < 0) {
          say('Add an email address so Joon can reply to you.');
          email.focus();
          return;
        }

        busy = true;
        var label = sendBtn.textContent;
        sendBtn.textContent = 'Sending';
        sendBtn.disabled = true;
        say('Sending your message.', true);

        var body = {
          access_key: CONFIG.FORM_KEY,
          subject: CONFIG.FORM_SUBJECT,
          from_name: 'jooni.hair website',
          replyto: addr,
          name: $('#f-name').value.trim() || 'Not given',
          email: addr,
          phone: phone.value.trim() || 'Not given',
          service: $('#f-service').value || 'Not chosen',
          hair_now: $('#f-current').value.trim() || 'Not given',
          availability: $('#f-when').value.trim() || 'Not given',
          message: build()
        };

        var reset = function () {
          busy = false;
          sendBtn.textContent = label;
          sendBtn.disabled = false;
        };

        var failed = function () {
          reset();
          say('That did not send. Try the Instagram DM instead, or email is fine too.', true);
        };

        window.fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body)
        }).then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok || !data.success) return failed();
            reset();
            form.reset();
            render();
            email.value = '';
            say('Sent. Joon will reply to ' + addr + '.', true);
          });
        }, failed);
      });
    }
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
