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

  /* ---- copy email buttons ---- */
  slice(document.querySelectorAll('.copy-email')).forEach(function (btn) {
    if (!navigator.clipboard) { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Email address copied');
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', 'Copy email address');
        }, 2000);
      });
    });
  });

  /* ---- footer clock (Philippine time) ---- */
  var clocks = slice(document.querySelectorAll('.ph-clock'));
  if (clocks.length && window.Intl) {
    var phTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    var tick = function () {
      var t = phTime.format(new Date());
      clocks.forEach(function (el) { el.textContent = t; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---- contact form (FormSubmit relays it to Gmail; the visitor's email becomes Reply-To) ---- */
  var form = document.getElementById('contact-form');
  if (form && window.fetch) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var btn = form.querySelector('button[type="submit"]');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      btn.disabled = true;
      status.removeAttribute('data-state');
      status.textContent = 'Sending…';
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (String(res.success) !== 'true') throw new Error(res.message);
          form.reset();
          status.textContent = 'Message sent. I usually reply within a day.';
        })
        .catch(function () {
          status.setAttribute('data-state', 'error');
          status.textContent = "Your message didn't send. Try again, or email james.sarmiento.1456@gmail.com directly.";
        })
        .then(function () { btn.disabled = false; });
    });
  }

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

  /* ---- scroll effects (scrolling layouts only) ----
     Staggered fly-ins, hero parallax + tilt, live workflow chains, count-ups
     and word-by-word headings. Every hidden state is gated in CSS behind
     html[data-fx="on"], so without JS, with reduced motion, or in the
     Dashboard shell the page is simply static and fully visible. */
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hero = document.querySelector('.hero');
  var fxReady = false;
  var fxOn = function () { return root.getAttribute('data-fx') === 'on'; };

  var splitWords = function (el) {
    var n = 0;
    (function walk(node) {
      slice(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1) { walk(child); return; }
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var outer = document.createElement('span');
          var inner = document.createElement('span');
          outer.className = 'w';
          inner.textContent = part;
          inner.style.setProperty('--w', n++);
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.parentNode.replaceChild(frag, child);
      });
    })(el);
    el.classList.add('fx-words');
  };

  /* count-ups replay on every entry; leaving cancels and restores the real number */
  var counts = new WeakMap();
  var resetCount = function (el) {
    var c = counts.get(el);
    if (!c) return;
    cancelAnimationFrame(c.raf);
    el.textContent = c.text;
  };
  var countUp = function (el) {
    var c = counts.get(el) || { text: el.textContent, raf: 0 };
    counts.set(el, c);
    cancelAnimationFrame(c.raf);
    if (!/^\d+$/.test(c.text.trim()) || !fxOn()) return;
    var target = parseInt(c.text, 10);
    var start = null;
    var step = function (t) {
      if (start === null) start = t;
      var k = Math.min((t - start) / 1000, 1);
      el.textContent = k < 1 ? String(Math.round(target * (1 - Math.pow(1 - k, 3)))) : c.text;
      if (k < 1) c.raf = requestAnimationFrame(step);
    };
    el.textContent = '0';
    c.raf = requestAnimationFrame(step);
  };

  var initFx = function () {
    fxReady = true;
    slice(document.querySelectorAll('.services > div, .project-card, .work-disclosure, .automation-list > a, .about-photo, .about-copy, .contact-panel')).forEach(function (el) {
      el.classList.add('fx-item');
      el.style.setProperty('--i', Math.min(slice(el.parentNode.children).indexOf(el), 6));
    });
    var headings = slice(document.querySelectorAll('.hero h1, .section-heading h2, .automation-intro h2, .about-copy h2, .contact-section h2'));
    headings.forEach(splitWords);
    var flows = slice(document.querySelectorAll('.flow'));
    flows.forEach(function (f) {
      slice(f.children).forEach(function (li, i) { li.style.setProperty('--s', i); });
    });
    var counters = slice(document.querySelectorAll('.project-card .project-proof strong'));

    if (!('IntersectionObserver' in window)) {
      slice(document.querySelectorAll('.fx-item, .fx-words')).forEach(function (el) { el.classList.add('in'); });
      flows.forEach(function (f) { f.classList.add('run'); });
      return;
    }
    /* Effects replay on every entry and "rewind" on exit. Hysteresis: enter at
       15% visible, leave only once fully out, so the 28px hidden offset can't
       make an element flicker at the edge. data-fx-side remembers which edge it
       left through, so it comes back in from that side. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var isFlow = el.classList.contains('flow');
        var isCount = counters.indexOf(el) >= 0;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          if (isFlow) el.classList.add('run');
          else if (isCount) countUp(el);
          else { el.removeAttribute('data-fx-side'); el.classList.add('in'); }
        } else if (!entry.isIntersecting) {
          if (isFlow) el.classList.remove('run');
          else if (isCount) resetCount(el);
          else {
            el.setAttribute('data-fx-side', entry.boundingClientRect.top < 0 ? 'above' : 'below');
            el.classList.remove('in');
          }
        }
      });
    }, { threshold: [0, 0.15], rootMargin: '0px 0px -8% 0px' });
    slice(document.querySelectorAll('.fx-item, .fx-words')).concat(flows, counters).forEach(function (el) { io.observe(el); });

    /* subtle mouse-follow tilt on the hero preview (fine pointers only) */
    if (hero && window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('mousemove', function (e) {
        if (!fxOn()) return;
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
      hero.addEventListener('mouseleave', function () {
        hero.style.setProperty('--mx', 0);
        hero.style.setProperty('--my', 0);
      });
    }
  };

  var setFx = function () {
    if (!reduce && hero && !isShell()) {
      root.setAttribute('data-fx', 'on');
      if (!fxReady) initFx();
      updateScroll();
    } else {
      root.removeAttribute('data-fx');
      if (hero) ['--p', '--mx', '--my'].forEach(function (v) { hero.style.removeProperty(v); });
    }
  };

  /* one rAF-throttled scroll handler: header progress bar + hero parallax */
  var progress = document.querySelector('.scroll-progress');
  var ticking = false;
  var updateScroll = function () {
    ticking = false;
    var se = document.scrollingElement || document.documentElement;
    var max = se.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(se.scrollTop / max, 1) : 0).toFixed(4) + ')';
    if (hero && fxOn()) hero.style.setProperty('--p', Math.min(Math.max(se.scrollTop / hero.offsetHeight, 0), 1).toFixed(3));
  };
  var onScroll = function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  wide.addEventListener('change', setFx);
  setFx();
  updateScroll();

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
      setFx();
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

  /* ---- living background: dot grid + cursor glow (visuals in css/home.css .bg-fx) ---- */
  var bg = document.createElement('div');
  bg.className = 'bg-fx';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<span class="bg-fx-glow"></span>';
  document.body.insertBefore(bg, document.body.firstChild);
  var bgX = 0, bgY = 0, bgQueued = false;
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    bgX = e.clientX; bgY = e.clientY;
    if (bgQueued) return;
    bgQueued = true;
    requestAnimationFrame(function () {
      bgQueued = false;
      var r = bg.getBoundingClientRect();
      bg.style.setProperty('--cx', (bgX - r.left) + 'px');
      bg.style.setProperty('--cy', (bgY - r.top) + 'px');
      bg.classList.add('live');
    });
  });
  document.documentElement.addEventListener('pointerleave', function () { bg.classList.remove('live'); });
})();
