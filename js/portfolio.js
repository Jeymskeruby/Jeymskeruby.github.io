/* ============================================================================
   Portfolio interactions — vanilla, no dependencies, one <script defer>.
   Footer year · mobile menu · scroll-spy nav · reveal-on-scroll.
   ============================================================================ */
(function () {
  'use strict';

  /* ---- footer year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---- theme switch (Light / Dark / System) ---- */
  var THEME_KEY = 'portfolio-theme';
  var themeBtns = Array.prototype.slice.call(document.querySelectorAll('.theme-switch-btn'));
  if (themeBtns.length) {
    var applyTheme = function (theme) {
      document.documentElement.setAttribute('data-theme', theme);
      themeBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-theme-btn') === theme ? 'true' : 'false');
      });
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    };
    themeBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyTheme(b.getAttribute('data-theme-btn')); });
    });
    applyTheme(document.documentElement.getAttribute('data-theme') || 'system');
  }

  /* ---- layout switch (Overview / Dashboard), desktop only via CSS ---- */
  var LAYOUT_KEY = 'portfolio-layout';
  var layoutBtns = Array.prototype.slice.call(document.querySelectorAll('.layout-switch-btn'));
  if (layoutBtns.length) {
    var applyLayout = function (layout, save) {
      document.documentElement.setAttribute('data-layout', layout);
      layoutBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-layout-btn') === layout ? 'true' : 'false');
      });
      if (save) { try { localStorage.setItem(LAYOUT_KEY, layout); } catch (e) {} }
    };
    layoutBtns.forEach(function (b) {
      b.addEventListener('click', function () { applyLayout(b.getAttribute('data-layout-btn'), true); });
    });
    applyLayout(document.documentElement.getAttribute('data-layout') === 'dashboard' ? 'dashboard' : 'overview', false);
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

  /* ---- scroll-spy: mark the nav link for the section in view ---- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], header#top'));
  var navLinks = {};
  Array.prototype.forEach.call(document.querySelectorAll('#nav a[href^="#"], .sidebar-nav a[href^="#"]'), function (a) {
    var k = a.getAttribute('href').slice(1);
    (navLinks[k] = navLinks[k] || []).push(a);
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        Object.keys(navLinks).forEach(function (k) {
          navLinks[k].forEach(function (a) {
            if (k === id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- reveal on scroll ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
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
