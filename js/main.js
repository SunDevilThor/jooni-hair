/* ============================================================
   JOON | site behaviour
   Vanilla JS, no dependencies. Every block guards on the
   elements it needs, so one file serves every page.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIG
     DEPOSIT_URL is the only thing that needs to change when Joon
     sends her Square or Stripe payment link. Paste the full URL
     between the quotes and the deposit button appears on the
     booking page automatically. Leave it empty and the site
     stays on the DM only flow.
     ---------------------------------------------------------- */
  var CONFIG = {
    IG_HANDLE: 'jooni.hair',
    DM_URL: 'https://ig.me/m/jooni.hair',
    PROFILE_URL: 'https://www.instagram.com/jooni.hair/',
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
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
