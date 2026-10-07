/* ============================================================================
   Portfolio interactions — vanilla, no dependencies, one <script defer>.
   Footer year · theme + layout switches · mobile menu · scroll-spy nav ·
   dashboard view router · reveal-on-scroll.
   ============================================================================ */
(function () {
  'use strict';

  var slice = function (list) { return Array.prototype.slice.call(list); };
  var root = document.documentElement;

  /* ---- footer year ---- */
  var year = String(new Date().getFullYear());
  var y = document.getElementById('year');
  if (y) y.textContent = year;
  slice(document.querySelectorAll('.year')).forEach(function (el) { el.textContent = year; });

  /* ---- theme switch (Light / Dark / System) ---- */
  var THEME_KEY = 'portfolio-theme';
  var themeBtns = slice(document.querySelectorAll('.theme-switch-btn'));
  if (themeBtns.length) {
    var applyTheme = function (theme) {
      root.setAttribute('data-theme', theme);
      themeBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-theme-btn') === theme ? 'true' : 'false');
      });
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    };
    themeBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyTheme(b.getAttribute('data-theme-btn')); });
    });
    applyTheme(root.getAttribute('data-theme') || 'system');
  }

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.matchMedia('(min-width:861px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---- nav highlighting, shared by scroll-spy and the view router ---- */
  var navLinks = {};
  slice(document.querySelectorAll('#nav a[href^="#"], .sidebar-nav a[href^="#"]')).forEach(function (a) {
    var k = a.getAttribute('href').slice(1);
    (navLinks[k] = navLinks[k] || []).push(a);
  });
  var markCurrent = function (id) {
    Object.keys(navLinks).forEach(function (k) {
      navLinks[k].forEach(function (a) {
        if (k === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  };

  /* ---- dashboard view router: one section ("view") at a time ----
     Only active on desktop with the Dashboard layout; everywhere else the
     page is a normal scrolling site and all sections show (via CSS). */
  var main = document.getElementById('main');
  var wide = window.matchMedia('(min-width:861px)');
  var viewEls = main ? slice(main.querySelectorAll('[data-view]')) : [];
  var views = [];
  viewEls.forEach(function (el) {
    var v = el.getAttribute('data-view');
    if (views.indexOf(v) < 0) views.push(v);
  });
  var currentView = 'home';
  var spyId = 'top';
  var isShell = function () { return wide.matches && root.getAttribute('data-layout') === 'dashboard'; };
  var viewFor = function (hash) {
    var id = (hash || '').replace(/^#/, '');
    if (!id || id === 'top') return 'home';
    return views.indexOf(id) >= 0 ? id : null;
  };
  var hashFor = function (view) { return view === 'home' ? '#top' : '#' + view; };
  var showView = function (view, focus) {
    currentView = view;
    viewEls.forEach(function (el) { el.classList.toggle('is-view', el.getAttribute('data-view') === view); });
    if (!isShell()) return;
    markCurrent(hashFor(view).slice(1));
    main.scrollTop = 0;
    if (focus) {
      var h = main.querySelector('.is-view h1, .is-view h2:not(.visually-hidden)');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  };
  if (viewEls.length) {
    showView(viewFor(location.hash) || 'home', false);
    document.addEventListener('click', function (e) {
      if (!isShell() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip-link')) return;
      var view = viewFor(a.getAttribute('href'));
      if (!view) return;
      e.preventDefault();
      if (location.hash !== hashFor(view)) history.pushState(null, '', hashFor(view));
      showView(view, true);
    });
    var syncFromHash = function () {
      var view = viewFor(location.hash);
      if (view && isShell()) showView(view, false);
    };
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    wide.addEventListener('change', function () { showView(currentView, false); });
  }

  /* ---- scroll-spy: mark the nav link for the section in view (scrolling layouts) ---- */
  var sections = slice(document.querySelectorAll('main section[id], header#top'));
  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || isShell()) return;
        spyId = entry.target.id;
        markCurrent(spyId);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- layout switch (Overview / Dashboard), desktop only via CSS ---- */
  var LAYOUT_KEY = 'portfolio-layout';
  var layoutBtns = slice(document.querySelectorAll('.layout-switch-btn'));
  if (layoutBtns.length) {
    var applyLayout = function (layout, save) {
      var from = root.getAttribute('data-layout');
      root.setAttribute('data-layout', layout);
      layoutBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-layout-btn') === layout ? 'true' : 'false');
      });
      if (save) { try { localStorage.setItem(LAYOUT_KEY, layout); } catch (e) {} }
      if (!save || from === layout || !viewEls.length || !wide.matches) return;
      if (layout === 'dashboard') {
        /* open the section the visitor was reading */
        var view = viewFor('#' + spyId) || 'home';
        history.replaceState(null, '', hashFor(view));
        showView(view, false);
      } else {
        /* back to the long page, at the section that was open */
        var target = document.getElementById(hashFor(currentView).slice(1));
        if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    };
    layoutBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyLayout(b.getAttribute('data-layout-btn'), true); });
    });
    applyLayout(root.getAttribute('data-layout') === 'dashboard' ? 'dashboard' : 'overview', false);
  }

  /* ---- reveal on scroll ---- */
  var reveals = slice(document.querySelectorAll('[data-reveal]'));
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  }
})();
