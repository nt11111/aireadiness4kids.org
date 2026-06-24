/* ResponsibleAI4Kids — interactions */
(function () {
  'use strict';

  /* ---- Navbar scroll state ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---- Animated counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const fmt = (n) => n.toLocaleString('en-US');
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target >= 100 ? Math.round(target * eased) : Math.round(target * eased * 10) / 10;
        el.textContent = prefix + fmt(val) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + fmt(target) + suffix;
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---- Accordions (modules / FAQ) ---- */
  const bindAccordion = (selector, headSel, bodySel, openClass) => {
    document.querySelectorAll(selector).forEach((item) => {
      const head = item.querySelector(headSel);
      const body = item.querySelector(bodySel);
      if (!head || !body) return;
      head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', () => {
        const isOpen = item.classList.contains(openClass);
        // close siblings within same group
        const group = item.parentElement;
        group.querySelectorAll(selector + '.' + openClass).forEach((sib) => {
          if (sib !== item) {
            sib.classList.remove(openClass);
            const b = sib.querySelector(bodySel); if (b) b.style.maxHeight = null;
            const h = sib.querySelector(headSel); if (h) h.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle(openClass, !isOpen);
        head.setAttribute('aria-expanded', String(!isOpen));
        body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
      });
    });
  };
  bindAccordion('.module', '.module__head', '.module__body', 'open');
  bindAccordion('.faq__item', '.faq__q', '.faq__a', 'open');

  /* ---- Parallax blobs (subtle, respects reduced motion) ---- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    const blobs = document.querySelectorAll('.hero__blob');
    if (blobs.length) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return; ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          blobs.forEach((b, i) => { b.style.transform = `translateY(${y * (0.04 + i * 0.02)}px)`; });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---- Year ---- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---- Newsletter (front-end only demo) ---- */
  document.querySelectorAll('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Thank you ✓';
      btn.disabled = true;
      form.querySelectorAll('input').forEach((i) => (i.value = ''));
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2600);
    });
  });
})();
