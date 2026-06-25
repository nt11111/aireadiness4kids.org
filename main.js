/* aireadiness4kids (ARK) — interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll progress bar ---- */
  var bar = document.querySelector('.progress');
  function onScroll() {
    var nav = document.querySelector('.nav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
    if (bar) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---- Reveal + circuit-trace draw on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal, .trace');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Set dash lengths for traces so they animate cleanly ---- */
  document.querySelectorAll('.trace').forEach(function (svg) {
    svg.querySelectorAll('path, line, polyline').forEach(function (p) {
      try {
        var len = p.getTotalLength ? p.getTotalLength() : 600;
        p.style.setProperty('--len', Math.ceil(len));
        p.style.strokeDasharray = Math.ceil(len);
        p.style.strokeDashoffset = Math.ceil(len);
      } catch (err) {}
    });
  });

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var fmt = function (n) { return n.toLocaleString('en-US'); };
    var animate = function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var start = performance.now(), dur = 1600;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target >= 100 ? Math.round(target * eased) : Math.round(target * eased * 10) / 10;
        el.textContent = prefix + fmt(val) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = prefix + fmt(target) + suffix;
      };
      requestAnimationFrame(tick);
    };
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- Accordions (modules / FAQ) ---- */
  var bindAccordion = function (selector, headSel, bodySel) {
    document.querySelectorAll(selector).forEach(function (item) {
      var head = item.querySelector(headSel);
      var body = item.querySelector(bodySel);
      if (!head || !body) return;
      head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        var group = item.parentElement;
        group.querySelectorAll(selector + '.open').forEach(function (sib) {
          if (sib !== item) {
            sib.classList.remove('open');
            var b = sib.querySelector(bodySel); if (b) b.style.maxHeight = null;
            var h = sib.querySelector(headSel); if (h) h.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('open', !isOpen);
        head.setAttribute('aria-expanded', String(!isOpen));
        body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
      });
    });
  };
  bindAccordion('.module', '.module__head', '.module__body');
  bindAccordion('.faq__item', '.faq__q', '.faq__a');

  /* ---- Curriculum tabs ---- */
  var tabs = document.querySelectorAll('.tab[data-tab]');
  if (tabs.length) {
    var activate = function (id, scroll) {
      var found = false;
      tabs.forEach(function (t) {
        var on = t.dataset.tab === id;
        if (on) found = true;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
      });
      if (!found) return false;
      document.querySelectorAll('.tab-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.id === id);
      });
      if (scroll) {
        var tablist = document.querySelector('.tabs');
        if (tablist) window.scrollTo({ top: tablist.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
      }
      return true;
    };
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab.dataset.tab, false);
        history.replaceState(null, '', '#' + tab.dataset.tab);
      });
    });
    var hash = location.hash.replace('#', '');
    if (hash) activate(hash, true);
  }

  /* ---- Magnetic buttons (subtle) ---- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.28 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---- Parallax mascot stage + watermarks ---- */
  if (!reduce) {
    var floats = document.querySelectorAll('[data-parallax]');
    if (floats.length) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          floats.forEach(function (el) {
            var sp = parseFloat(el.dataset.parallax) || 0.05;
            el.style.transform = 'translateY(' + y * sp + 'px)';
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---- Year + demo forms ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button');
      var original = btn.textContent;
      btn.textContent = 'Thank you';
      btn.disabled = true;
      form.querySelectorAll('input').forEach(function (i) { i.value = ''; });
      setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 2600);
    });
  });
})();
