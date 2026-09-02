/* ═══════════════════════════════════════════
   WYT — RENDER.JS  v4
   Fetches /api/content and renders the site.
   Updates via SSE (real-time) + 5s polling
   fallback so changes ALWAYS appear.
═══════════════════════════════════════════ */
(function () {

  /* ── Helpers ── */
  function isAr() { return window.i18n && window.i18n.lang === 'ar'; }
  function pick(en, ar) { return (isAr() && ar) ? ar : (en || ''); }
  function s(v) { return v || ''; }
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }
  function setHref(id, val) {
    var el = document.getElementById(id);
    if (el && val) el.href = val;
  }

  /* ── Fetch from API ── */
  function fetchContent(cb) {
    fetch('/api/content')
      .then(function(r) { return r.json(); })
      .then(function(data) { cb(null, data); })
      .catch(function(err) { console.error('[WYT] fetch failed:', err); cb(err); });
  }

  /* ── STATS ── */
  function renderStats(stats) {
    if (!stats) return;
    var map = [
      ['stat-mach-num', 'stat-mach-lbl', stats.machines],
      ['stat-loc-num',  'stat-loc-lbl',  stats.locations],
      ['stat-up-num',   'stat-up-lbl',   stats.uptime]
    ];
    map.forEach(function(row) {
      var numEl = document.getElementById(row[0]);
      var lblEl = document.getElementById(row[1]);
      var data  = row[2];
      if (!data) return;
      if (numEl) {
        numEl.dataset.target = data.value;
        numEl.dataset.suffix = data.suffix || '';
        numEl.removeAttribute('data-counted');
        numEl.textContent = '0' + (data.suffix || '');
      }
      if (lblEl) lblEl.textContent = pick(data.label, data.labelAr) || lblEl.textContent;
    });
  }

  /* ── MACHINES ── */
  function renderMachines(machines) {
    var grid = document.getElementById('machinesGrid');
    if (!grid || !machines) return;
    if (!machines.length) { grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px">No machines added yet</p>'; return; }

    window.WYT_machineData = [];

    grid.innerHTML = machines.map(function(m, i) {
      window.WYT_machineData.push({
        name : pick(m.name,  m.nameAr),
        desc : pick(m.desc,  m.descAr),
        image: m.image || 'machine.jfif',
        specs: (m.specs || []).map(function(sp) { return { l: sp.l || '', v: sp.v || '' }; })
      });
      var badge = m.badge
        ? '<span class="card-badge' + (m.badge.toLowerCase().indexOf('new') > -1 ? ' new' : '') + '">' + pick(m.badge, m.badgeAr) + '</span>'
        : '';
      var chips = (m.specs || []).slice(0, 3).map(function(sp) { return '<span>' + s(sp.v) + '</span>'; }).join('');
      return '<div class="machine-card reveal" data-modal="' + i + '">'
        + '<div class="mc-img"><img src="' + s(m.image || 'machine.jfif') + '" alt="' + s(m.name) + '" loading="lazy" onerror="this.src=\'machine.jfif\'"/>' + badge + '</div>'
        + '<div class="mc-body"><h3>' + pick(m.name, m.nameAr) + '</h3><p>' + pick(m.desc, m.descAr) + '</p>'
        + '<div class="chips">' + chips + '</div></div>'
        + '<div class="card-cta">' + (isAr() ? 'عرض المواصفات ←' : 'View Specs →') + '</div>'
        + '</div>';
    }).join('');
  }

  /* ── PRODUCTS ── */
  function renderProducts(products) {
    var grid = document.getElementById('productsGrid');
    if (!grid || !products) return;
    if (!products.length) { grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px">No products added yet</p>'; return; }

    grid.innerHTML = products.map(function(p) {
      var chips = (p.items || []).map(function(i) { return '<span>' + i + '</span>'; }).join('');
      return '<div class="product-card reveal">'
        + '<div class="prod-img"><img src="' + s(p.image) + '" alt="' + s(p.name) + '" loading="lazy" onerror="this.style.background=\'#f4f4f0\'"/></div>'
        + '<div class="prod-body"><h3>' + pick(p.name, p.nameAr) + '</h3>'
        + '<p>' + pick(p.desc, p.descAr) + '</p>'
        + '<div class="chips">' + chips + '</div></div></div>';
    }).join('');
  }

  /* ── PARTNERS BAR ── */
  function renderPartners(partners) {
    var bar = document.getElementById('partnersBar');
    if (!bar || !partners) return;
    if (!partners.length) { bar.innerHTML = ''; return; }

    bar.innerHTML = partners.map(function(p) {
      return '<div class="partner-logo">'
        + '<div class="logo-badge" style="background:' + s(p.bg) + ';color:' + s(p.color) + '">' + s(p.initials) + '</div>'
        + '<span>' + s(p.name) + '</span></div>';
    }).join('');
  }

  /* ── LOCATIONS ── */
  function renderLocations(locations) {
    var grid = document.getElementById('locationsGrid');
    if (!grid || !locations) return;
    if (!locations.length) { grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px">No locations added yet</p>'; return; }

    var sorted = locations.slice().sort(function(a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    grid.innerHTML = sorted.map(function(l, i) {
      var isFeat = i === 0 && l.featured;
      return '<div class="loc-card' + (isFeat ? ' loc-featured' : '') + ' reveal">'
        + '<div class="loc-bg"><img src="' + s(l.image) + '" alt="' + s(l.name) + '" loading="lazy" onerror="this.style.background=\'#1a1a2e\'"/><div class="loc-overlay"></div></div>'
        + '<div class="loc-machine' + (isFeat ? '' : ' loc-machine-sm') + '"><img src="machine.jfif" alt="WYT Machine"/></div>'
        + '<div class="loc-info"><span class="loc-type">' + pick(l.type, l.typeAr) + '</span>'
        + '<h3>' + pick(l.name, l.nameAr) + '</h3>'
        + '<p>' + s(l.machine) + (l.area ? ' · ' + pick(l.area, l.areaAr) : '') + '</p></div></div>';
    }).join('');
  }

  /* ── FAQs ── */
  function renderFaqs(faqs) {
    var list = document.getElementById('faqList');
    if (!list || !faqs) return;
    if (!faqs.length) { list.innerHTML = '<p style="color:#999;text-align:center;padding:40px">No FAQs added yet</p>'; return; }

    list.innerHTML = faqs.map(function(f) {
      return '<div class="faq-item reveal" data-faq>'
        + '<button class="faq-q"><span>' + pick(f.q, f.qAr) + '</span><span class="faq-icon">+</span></button>'
        + '<div class="faq-a"><p>' + pick(f.a, f.aAr) + '</p></div></div>';
    }).join('');
  }

  /* ── SETTINGS (contact info, WA links) ── */
  function renderSettings(settings) {
    if (!settings) return;
    setText('ci-address-val', pick(settings.address, settings.addressAr));
    setText('ci-phone-val',   settings.phone);
    setText('ci-email-val',   settings.email);
    setText('ci-hours-val',   pick(settings.hours, settings.hoursAr));
    if (settings.phone) {
      var el = document.getElementById('footer-phone');
      if (el) { el.href = 'tel:' + settings.phone.replace(/[^\d+]/g,''); el.textContent = settings.phone; }
    }
    if (settings.email) {
      var el2 = document.getElementById('footer-email');
      if (el2) { el2.href = 'mailto:' + settings.email; el2.textContent = settings.email; }
    }
    if (settings.whatsapp) {
      var wa = 'https://wa.me/' + settings.whatsapp.replace(/[^\d]/g,'');
      setHref('floatingWaBtn',  wa);
      setHref('footer-wa-link', wa);
      setHref('footer-wa-icon', wa);
    }
  }

  /* ── MASTER RENDER ── */
  function renderAll() {
    fetchContent(function(err, c) {
      if (err || !c) return;
      renderStats(c.stats);
      renderMachines(c.machines);
      renderProducts(c.products);
      renderPartners(c.partners);
      renderLocations(c.locations);
      renderFaqs(c.faqs);
      renderSettings(c.settings);
      /* Re-init interactions for newly injected elements */
      if (window.WYT) {
        window.WYT.initModal(window.WYT_machineData || []);
        window.WYT.initFaq();
        window.WYT.initReveal();
        window.WYT.initCounters();
      }
      console.log('[WYT] Rendered — locs:' + (c.locations||[]).length + ' machines:' + (c.machines||[]).length + ' faqs:' + (c.faqs||[]).length);
    });
  }

  /* ── SSE real-time connection ── */
  function connectSSE() {
    var es = new EventSource('/api/events');
    es.onopen = function() { console.log('[WYT] SSE connected ✅'); };
    es.onmessage = function(e) {
      if (e.data === 'update' || e.data === 'connected') {
        if (e.data === 'update') {
          console.log('[WYT] Admin changed content → re-rendering…');
          renderAll();
        }
      }
    };
    es.onerror = function() {
      console.warn('[WYT] SSE disconnected — retry in 3s');
      es.close();
      setTimeout(connectSSE, 3000);
    };
  }

  /* ── Polling fallback (every 5s) ── */
  /* This ensures the website always stays in sync even if SSE drops */
  var lastHash = '';
  function pollContent() {
    fetch('/api/content')
      .then(function(r) { return r.json(); })
      .then(function(c) {
        var hash = (c.locations||[]).length + '-' + (c.machines||[]).length + '-' + (c.faqs||[]).length + '-' + (c.partners||[]).length + '-' + JSON.stringify(c.stats);
        if (hash !== lastHash) {
          lastHash = hash;
          console.log('[WYT] Polling detected change → re-rendering');
          renderAll();
        }
      })
      .catch(function(){});
  }

  /* ── Expose for language switch ── */
  window.WYT_render = renderAll;

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', function() {
    renderAll();       /* first paint from DB */
    connectSSE();      /* real-time updates */
    setInterval(pollContent, 5000); /* 5s polling fallback */
  });

})();