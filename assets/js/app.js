/* =========================================================================
   Laboratorio Clínico Divina Misericordia — motor del sitio
   Todo el contenido se genera desde un objeto JSON editable (ver admin.js).
   ========================================================================= */
(function () {
  'use strict';

  var STORE_KEY = 'dm_content_v1';
  var D = document;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };

  /* ---------- utilidades ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function merge(base, over) {
    if (!isObj(over)) return base;
    Object.keys(over).forEach(function (k) {
      if (isObj(base[k]) && isObj(over[k])) merge(base[k], over[k]);
      else base[k] = over[k];
    });
    return base;
  }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function nl2br(v) { return esc(v).replace(/\n/g, '<br>'); }
  function cssUrl(u) { return 'url("' + String(u).replace(/["\\\n\r]/g, encodeURIComponent) + '")'; }
  function wa(text) {
    var n = String(C.brand.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function initials(name) {
    return String(name || '').replace(/^(dr|dra)\.?\s+/i, '').split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase() || '+';
  }
  function toast(msg, type) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + (type || '');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.className = 'toast'; }, 3200);
  }

  /* ---------- contenido ---------- */
  var C = clone(window.DEFAULT_CONTENT);

  function normalize(c) {
    var keys = Object.keys(window.DEFAULT_CONTENT.sections);
    c.order = (c.order || []).filter(function (k) { return keys.indexOf(k) > -1; });
    keys.forEach(function (k) { if (c.order.indexOf(k) < 0) c.order.push(k); });
    return c;
  }

  function loadContent() {
    var base = clone(window.DEFAULT_CONTENT);
    // Contenido publicado: Vercel (api/content, desde Blob) o content.json
    // (hosting con PHP o archivo subido a mano). Gana el más reciente.
    function get(url) {
      return fetch(url, { cache: 'no-store' })
        .then(function (r) { return r.ok && /json/.test(r.headers.get('content-type') || '') ? r.json() : null; })
        .catch(function () { return null; });
    }
    return Promise.all([get('api/content'), get('content.json?v=' + Date.now())])
      .then(function (a) {
        var t = function (x) { return x && x.sections && x.meta ? x.meta.updated || 0 : -1; };
        return t(a[0]) >= t(a[1]) && t(a[0]) >= 0 ? a[0] : (t(a[1]) >= 0 ? a[1] : null);
      })
      .then(function (pub) {
        if (pub) merge(base, pub);
        try {
          var local = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
          if (local && local.meta && local.meta.updated > ((base.meta && base.meta.updated) || 0)) {
            base = merge(clone(window.DEFAULT_CONTENT), local);
          }
        } catch (e) { /* almacenamiento no disponible */ }
        C = normalize(base);
        return C;
      });
  }

  function saveLocal() {
    C.meta.updated = Date.now();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(C)); return true; }
    catch (e) { return false; }
  }

  /* ---------- piezas reutilizables ---------- */
  function logoMark(cls) {
    return '<span class="mark ' + (cls || '') + '">' + icon('flask') + '</span>';
  }
  function brandLogo(size, where) {
    var b = C.brand;
    if (b.logo) {
      return '<img class="brand-logo" src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" style="height:' + (+size || 44) + 'px">';
    }
    return logoMark(where === 'hero' ? 'mark--xl' : '') +
      '<span class="brand-text"><strong>' + esc(b.short || b.name) + '</strong><small>' + esc(b.tagline) + '</small></span>';
  }
  function head(s, center) {
    var h = '';
    if (s.eyebrow) h += '<span class="eyebrow">' + esc(s.eyebrow) + '</span>';
    if (s.title) h += '<h2 class="h2">' + esc(s.title) + '</h2>';
    if (s.subtitle) h += '<p class="lead">' + nl2br(s.subtitle) + '</p>';
    return h ? '<header class="sec-head reveal ' + (center === false ? '' : 'sec-head--center') + '">' + h + '</header>' : '';
  }
  function frame(src, alt, cls) {
    if (!src) return '';
    return '<figure class="frame reveal ' + (cls || '') + '"><img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" onerror="this.parentNode.classList.add(\'frame--broken\')"><span class="frame__glow"></span></figure>';
  }
  function bannerIfFrame(s) {
    return s.imageMode === 'frame' && s.image ? '<div class="banner-wrap">' + frame(s.image, s.title, 'frame--banner') + '</div>' : '';
  }
  function shell(key, s, inner, extra) {
    var bg = s.imageMode === 'background' && s.image;
    var dark = bg || (extra && extra.dark);
    var attrs = 'id="' + key + '" data-sec="' + key + '" class="sec sec--' + key + (dark ? ' sec--dark' : '') + (bg ? ' sec--bg' : '') + (extra && extra.cls ? ' ' + extra.cls : '') + '"';
    var layers = '';
    if (bg) {
      layers = '<div class="sec__bg" style="background-image:' + esc(cssUrl(s.image)) + '"></div>' +
        '<div class="sec__ov" style="opacity:' + ((+s.overlay || 0) / 100) + '"></div>';
    }
    return '<section ' + attrs + '>' + layers + '<div class="container">' + inner + '</div></section>';
  }
  function stars(n) {
    var out = '';
    for (var i = 0; i < 5; i++) out += '<span class="' + (i < (+n || 5) ? 'on' : '') + '">' + icon('star') + '</span>';
    return '<div class="stars" aria-label="' + (+n || 5) + ' de 5 estrellas">' + out + '</div>';
  }

  /* ---------- secciones ---------- */
  var R = {};

  R.hero = function (s) {
    var b = C.brand;
    var bg = s.imageMode === 'background' && s.image;
    var framed = s.imageMode === 'frame' && s.image;
    var pos = b.logoHeroPos || 'top';
    var logoHtml = '';
    if (b.logoHeroShow) {
      logoHtml = '<div class="hero__logo hero__logo--' + esc(b.logoHeroAlign || 'left') + (b.logoHeroCard ? ' hero__logo--card' : '') + '">' +
        (b.logo ? '<img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '" style="height:' + (+b.logoHero || 120) + 'px;--mh:' + (+b.logoHero || 120) + 'px">'
          : '<span class="hero__logo-fallback" style="--s:' + (+b.logoHero || 120) + 'px">' + logoMark('mark--xl') + '<span><strong>' + esc(b.short || b.name) + '</strong><small>' + esc(b.tagline) + '</small></span></span>') +
        '</div>';
    }
    var badges = (s.items || []).map(function (it) {
      return '<li>' + icon('check') + '<span>' + esc(it.text) + '</span></li>';
    }).join('');

    var text = '<div class="hero__text hero__text--' + esc(s.textAlign || 'left') + '">' +
      (pos === 'top' ? logoHtml : '') +
      (s.eyebrow ? '<span class="eyebrow eyebrow--light">' + esc(s.eyebrow) + '</span>' : '') +
      '<h1 class="h1">' + esc(s.title) + '</h1>' +
      (s.subtitle ? '<p class="hero__sub">' + nl2br(s.subtitle) + '</p>' : '') +
      '<div class="hero__ctas">' +
      (s.cta1 ? '<a href="#results" class="btn btn--accent btn--lg">' + icon('file') + esc(s.cta1) + '</a>' : '') +
      (s.cta2 ? '<a href="' + esc(wa('Hola, quiero agendar un examen de laboratorio.')) + '" target="_blank" rel="noopener" class="btn btn--glass btn--lg">' + icon('calendar') + esc(s.cta2) + '</a>' : '') +
      '</div>' +
      (badges ? '<ul class="hero__badges">' + badges + '</ul>' : '') +
      (pos === 'bottom' ? logoHtml : '') +
      '</div>';

    var aside = '';
    if (framed) {
      aside = '<div class="hero__aside">' + frame(s.image, s.title, 'frame--hero') + (pos === 'side' ? '<div class="hero__side-logo">' + logoHtml + '</div>' : '') + '</div>';
    } else if (pos === 'side') {
      aside = '<div class="hero__aside hero__aside--logo">' + logoHtml + '</div>';
    } else {
      aside = '<div class="hero__aside hero__aside--card">' + resultsMini() + '</div>';
    }

    return '<section id="hero" data-sec="hero" class="hero sec--dark' + (bg ? ' hero--bg' : '') + '">' +
      (bg ? '<div class="sec__bg hero__bg" style="background-image:' + esc(cssUrl(s.image)) + '"></div>' : '') +
      '<div class="hero__mesh" aria-hidden="true"></div>' +
      '<div class="sec__ov hero__ov" style="opacity:' + ((bg ? +s.overlay : 0) / 100) + '"></div>' +
      '<div class="container hero__grid">' + text + aside + '</div>' +
      '<a href="#stats" class="hero__scroll" aria-label="Bajar"><span></span></a>' +
      '</section>';
  };

  /* Formulario real de consulta en la portada (mismo flujo que el portal) */
  function resultsMini() {
    return '<form class="hero-res js-results" novalidate autocomplete="off">' +
      '<div class="hero-res__head"><span class="hero-res__ico">' + icon('lock') + '</span><div><strong>Consulte sus resultados</strong><small>Acceso seguro y confidencial</small></div></div>' +
      '<div class="field"><label for="hDoc">Número de documento</label><div class="input-ico">' + icon('id') + '<input id="hDoc" name="cedula" inputmode="numeric" placeholder="Ej: 1020304050" required maxlength="20"></div></div>' +
      '<div class="field"><label for="hCode">Código de consulta</label><div class="input-ico">' + icon('key') + '<input id="hCode" name="codigo" placeholder="Código de 6 dígitos" required maxlength="40" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase"></div>' +
      '<small class="hint">Lo encuentra en el comprobante que le entregamos.</small></div>' +
      '<label class="check"><input type="checkbox" name="ok" required><span>Autorizo el tratamiento de mis datos (Ley 1581 de 2012).</span></label>' +
      '<button class="btn btn--accent btn--block btn--lg" type="submit">' + icon('file') + '<span>Ver mis resultados</span></button>' +
      '<p class="results-card__msg js-rmsg" role="alert"></p>' +
      '</form>';
  }

  R.stats = function (s) {
    var items = (s.items || []).map(function (it) {
      return '<div class="stat reveal"><strong><span class="count" data-to="' + esc(it.value) + '">' + esc(it.value) + '</span>' + esc(it.suffix || '') + '</strong><span>' + esc(it.label) + '</span></div>';
    }).join('');
    return '<section id="stats" data-sec="stats" class="sec sec--stats"><div class="container"><div class="stats">' + items + '</div></div></section>';
  };

  R.results = function (s) {
    var r = C.results;
    var feats = (s.items || []).map(function (it) {
      return '<li>' + icon(it.icon || 'check') + '<span>' + esc(it.text) + '</span></li>';
    }).join('');
    var left = '<div class="results__info">' + head(s, false) + (feats ? '<ul class="feature-list reveal">' + feats + '</ul>' : '') +
      (s.imageMode === 'frame' ? frame(s.image, s.title, 'frame--sm') : '') + '</div>';
    var form = '<form class="results-card reveal js-results" id="resultsForm" novalidate autocomplete="off">' +
      '<div class="results-card__head"><span class="results-card__ico">' + icon('lock') + '</span><div><h3>Acceso a resultados</h3><p>Sus datos están protegidos</p></div></div>' +
      '<div class="field"><label for="rTipo">Tipo de documento</label><div class="select-wrap"><select id="rTipo" name="tipo">' +
      '<option value="CC">Cédula de ciudadanía</option><option value="TI">Tarjeta de identidad</option><option value="RC">Registro civil</option><option value="CE">Cédula de extranjería</option><option value="PA">Pasaporte</option><option value="PPT">Permiso de protección temporal</option>' +
      '</select></div></div>' +
      '<div class="field"><label for="rDoc">Número de documento</label><div class="input-ico">' + icon('id') + '<input id="rDoc" name="cedula" inputmode="numeric" placeholder="Ej: 1020304050" required maxlength="20"></div></div>' +
      '<div class="field"><label for="rCode">Código de consulta</label><div class="input-ico">' + icon('key') + '<input id="rCode" name="codigo" placeholder="Código de su comprobante" required maxlength="40" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase"></div>' +
      (r.help ? '<small class="hint">' + esc(r.help) + '</small>' : '') + '</div>' +
      '<label class="check"><input type="checkbox" id="rOk" name="ok" required><span>Autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012.</span></label>' +
      '<button class="btn btn--accent btn--block btn--lg" type="submit" id="rBtn">' + icon('file') + '<span>Consultar resultados</span></button>' +
      '<p class="results-card__msg js-rmsg" id="rMsg" role="alert"></p>' +
      '</form>';
    return shell('results', s, '<div class="split split--results">' + left + form + '</div>', { cls: 'sec--tint' });
  };

  R.services = function (s) {
    var cards = (s.items || []).map(function (it, i) {
      return '<article class="card service reveal" style="--d:' + (i % 4) * 70 + 'ms">' +
        (it.image ? '<div class="service__img"><img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" loading="lazy"></div>' : '') +
        '<span class="ico-badge">' + icon(it.icon) + '</span>' +
        '<h3>' + esc(it.title) + '</h3><p>' + nl2br(it.text) + '</p>' +
        '<a class="link-arrow" target="_blank" rel="noopener" href="' + esc(wa('Hola, quisiera información sobre: ' + it.title)) + '">Más información ' + icon('arrow') + '</a>' +
        '</article>';
    }).join('');
    return shell('services', s, head(s) + bannerIfFrame(s) + '<div class="grid grid--4">' + cards + '</div>');
  };

  R.about = function (s) {
    var bullets = (s.items || []).map(function (it) { return '<li>' + icon('check') + '<span>' + esc(it.text) + '</span></li>'; }).join('');
    var media = s.imageMode === 'frame' && s.image
      ? '<div class="about__media">' + frame(s.image, s.title) + '<div class="float-badge reveal">' + icon('award') + '<div><strong>' + esc((C.sections.stats.items[0] || {}).value || '25') + '+ años</strong><small>cuidando su salud</small></div></div></div>'
      : '';
    var text = '<div class="about__text">' + head(s, false) +
      (s.text ? '<p class="body reveal">' + nl2br(s.text) + '</p>' : '') +
      (bullets ? '<ul class="check-list reveal">' + bullets + '</ul>' : '') +
      '<div class="mv reveal">' +
      (s.mission ? '<div class="mv__card"><span>' + icon('heart') + 'Misión</span><p>' + nl2br(s.mission) + '</p></div>' : '') +
      (s.vision ? '<div class="mv__card"><span>' + icon('chart') + 'Visión</span><p>' + nl2br(s.vision) + '</p></div>' : '') +
      '</div></div>';
    return shell('about', s, '<div class="split ' + (media ? '' : 'split--single') + '">' + media + text + '</div>');
  };

  R.quality = function (s) {
    var cards = (s.items || []).map(function (it, i) {
      return '<article class="card card--glass reveal" style="--d:' + i * 80 + 'ms"><span class="ico-badge ico-badge--light">' + icon(it.icon) + '</span><h3>' + esc(it.title) + '</h3><p>' + nl2br(it.text) + '</p></article>';
    }).join('');
    return shell('quality', s, head(s) + bannerIfFrame(s) + '<div class="grid grid--4">' + cards + '</div>', { dark: true });
  };

  R.process = function (s) {
    var steps = (s.items || []).map(function (it, i) {
      return '<li class="step reveal" style="--d:' + i * 90 + 'ms"><span class="step__n">' + (i + 1) + '</span><h3>' + esc(it.title) + '</h3><p>' + nl2br(it.text) + '</p></li>';
    }).join('');
    return shell('process', s, head(s) + bannerIfFrame(s) + '<ol class="steps">' + steps + '</ol>');
  };

  R.packages = function (s) {
    var cards = (s.items || []).map(function (it, i) {
      var lis = String(it.includes || '').split('\n').filter(Boolean).map(function (l) { return '<li>' + icon('check') + esc(l) + '</li>'; }).join('');
      var feat = it.featured === true || it.featured === 'true';
      return '<article class="price reveal' + (feat ? ' price--featured' : '') + '" style="--d:' + i * 80 + 'ms">' +
        (feat ? '<span class="price__tag">Más elegido</span>' : '') +
        '<h3>' + esc(it.name) + '</h3><div class="price__amount">' + esc(it.price) + '</div>' +
        '<ul>' + lis + '</ul>' +
        '<a class="btn ' + (feat ? 'btn--accent' : 'btn--outline') + ' btn--block" target="_blank" rel="noopener" href="' + esc(wa('Hola, me interesa el ' + it.name + ' (' + it.price + ').')) + '">Quiero este chequeo</a>' +
        '</article>';
    }).join('');
    return shell('packages', s, head(s) + bannerIfFrame(s) + '<div class="grid grid--3 prices">' + cards + '</div>', { cls: 'sec--tint' });
  };

  R.home = function (s) {
    var media = s.imageMode === 'frame' && s.image ? '<div class="about__media">' + frame(s.image, s.title) + '</div>' : '';
    var text = '<div>' + head(s, false) + (s.text ? '<p class="body reveal">' + nl2br(s.text) + '</p>' : '') +
      '<div class="reveal home__ctas"><a class="btn btn--accent btn--lg" target="_blank" rel="noopener" href="' + esc(wa('Hola, quiero agendar una toma de muestra a domicilio.')) + '">' + icon('home') + esc(s.cta || 'Agendar') + '</a>' +
      '<a class="btn btn--ghost btn--lg" href="tel:' + esc(String(C.brand.phone).replace(/[^\d+]/g, '')) + '">' + icon('phone') + esc(C.brand.phone) + '</a></div></div>';
    return shell('home', s, '<div class="split split--rev ' + (media ? '' : 'split--single') + '">' + text + media + '</div>');
  };

  R.team = function (s) {
    var cards = (s.items || []).map(function (it, i) {
      return '<article class="member reveal" style="--d:' + i * 80 + 'ms"><div class="member__photo">' +
        (it.photo ? '<img src="' + esc(it.photo) + '" alt="' + esc(it.name) + '" loading="lazy">' : '<span>' + esc(initials(it.name)) + '</span>') +
        '</div><h3>' + esc(it.name) + '</h3><p>' + esc(it.role) + '</p></article>';
    }).join('');
    return shell('team', s, head(s) + bannerIfFrame(s) + '<div class="grid grid--4">' + cards + '</div>');
  };

  R.partners = function (s) {
    var items = (s.items || []).map(function (it) {
      return '<div class="partner">' + (it.logo ? '<img src="' + esc(it.logo) + '" alt="' + esc(it.name) + '" loading="lazy">' : '<span>' + icon('shield') + esc(it.name) + '</span>') + '</div>';
    }).join('');
    return shell('partners', s, head(s) + bannerIfFrame(s) + '<div class="marquee reveal"><div class="marquee__track">' + items + items + '</div></div>', { cls: 'sec--compact' });
  };

  R.testimonials = function (s) {
    var cards = (s.items || []).map(function (it, i) {
      return '<figure class="quote reveal" style="--d:' + i * 80 + 'ms">' + stars(it.rating) + '<blockquote>“' + esc(it.text) + '”</blockquote><figcaption><span class="avatar">' + esc(initials(it.name)) + '</span>' + esc(it.name) + '<small>Paciente verificado</small></figcaption></figure>';
    }).join('');
    return shell('testimonials', s, head(s) + bannerIfFrame(s) + '<div class="grid grid--3">' + cards + '</div>', { cls: 'sec--tint' });
  };

  function accordion(items, qk, ak) {
    return (items || []).map(function (it) {
      return '<details class="acc reveal"><summary><span>' + esc(it[qk]) + '</span><i></i></summary><div class="acc__body"><p>' + nl2br(it[ak]) + '</p></div></details>';
    }).join('');
  }
  R.prep = function (s) { return shell('prep', s, head(s) + bannerIfFrame(s) + '<div class="acc-grid">' + accordion(s.items, 'title', 'text') + '</div>'); };
  R.faq = function (s) { return shell('faq', s, head(s) + bannerIfFrame(s) + '<div class="acc-list">' + accordion(s.items, 'q', 'a') + '</div>', { cls: 'sec--tint' }); };

  function mapSources(s) {
    var raw = String(s.mapUrl || '').trim();
    var addr = C.brand.address || '';
    var embed = '', link = '';
    var m = raw.match(/src=["']([^"']+)["']/i);
    if (m) embed = m[1];
    else if (/\/maps\/embed|output=embed/.test(raw)) embed = raw;
    else if (raw && !/^https?:\/\//.test(raw) && raw.indexOf('<') < 0) embed = 'https://www.google.com/maps?q=' + encodeURIComponent(raw) + '&z=16&output=embed';
    else if (/^https?:\/\//.test(raw)) {
      link = raw;
      var q = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || raw.match(/[?&]q=([^&]+)/);
      if (q) embed = 'https://www.google.com/maps?q=' + (q[2] ? q[1] + ',' + q[2] : q[1]) + '&z=16&output=embed';
    }
    if (!/^https:\/\/(www\.)?google\.[a-z.]+\/maps/.test(embed)) embed = '';
    if (!embed && addr) embed = 'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&z=16&output=embed';
    var dest = raw && !/^https?:|</.test(raw) ? raw : addr;
    if (!link) link = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest);
    return { embed: embed, link: link, waze: 'https://waze.com/ul?q=' + encodeURIComponent(dest) + '&navigate=yes' };
  }

  R.location = function (s) {
    var b = C.brand, m = mapSources(s);
    var hours = (s.items || []).map(function (it) { return '<li><span>' + esc(it.day) + '</span><b>' + esc(it.hours) + '</b></li>'; }).join('');
    var card = '<aside class="loc-card reveal">' +
      '<div class="loc-item">' + icon('map') + '<div><small>Dirección</small><strong>' + esc(b.address) + '</strong></div></div>' +
      '<div class="loc-item">' + icon('phone') + '<div><small>Teléfono</small><strong><a href="tel:' + esc(String(b.phone).replace(/[^\d+]/g, '')) + '">' + esc(b.phone) + '</a></strong></div></div>' +
      '<div class="loc-item">' + icon('mail') + '<div><small>Correo</small><strong><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></strong></div></div>' +
      (hours ? '<div class="loc-hours"><h4>' + icon('clock') + 'Horario de atención</h4><ul>' + hours + '</ul></div>' : '') +
      '<div class="loc-btns"><a class="btn btn--accent" target="_blank" rel="noopener" href="' + esc(m.link) + '">' + icon('route') + 'Google Maps</a>' +
      '<a class="btn btn--outline" target="_blank" rel="noopener" href="' + esc(m.waze) + '">' + icon('map') + 'Waze</a></div>' +
      '</aside>';
    var map = '<div class="map reveal">' + (m.embed
      ? '<iframe title="Mapa de ubicación" src="' + esc(m.embed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>'
      : '<div class="map__empty">' + icon('map') + '<p>Agregue la dirección o el enlace de Google Maps desde el panel administrativo.</p></div>') +
      '</div>';
    return shell('location', s, head(s) + bannerIfFrame(s) + '<div class="loc">' + map + card + '</div>');
  };

  R.contact = function (s) {
    var b = C.brand;
    var opts = (C.sections.services.items || []).map(function (it) { return '<option>' + esc(it.title) + '</option>'; }).join('');
    var info = '<div>' + head(s, false) +
      '<div class="contact-cards reveal">' +
      '<a class="contact-chip" target="_blank" rel="noopener" href="' + esc(wa('Hola, necesito información.')) + '">' + icon('phone') + '<span><small>WhatsApp</small>' + esc(b.phone) + '</span></a>' +
      '<a class="contact-chip" href="mailto:' + esc(b.email) + '">' + icon('mail') + '<span><small>Correo</small>' + esc(b.email) + '</span></a>' +
      '<a class="contact-chip" href="#location">' + icon('map') + '<span><small>Sede</small>' + esc(b.address) + '</span></a>' +
      '</div>' + (s.imageMode === 'frame' ? frame(s.image, s.title, 'frame--sm') : '') + '</div>';
    var form = '<form class="contact-form reveal" id="contactForm">' +
      '<div class="row2"><div class="field"><label for="cName">Nombre</label><input id="cName" required placeholder="Su nombre"></div>' +
      '<div class="field"><label for="cPhone">Teléfono</label><input id="cPhone" inputmode="tel" placeholder="Su celular"></div></div>' +
      '<div class="field"><label for="cService">Servicio de interés</label><div class="select-wrap"><select id="cService"><option>Información general</option>' + opts + '</select></div></div>' +
      '<div class="field"><label for="cMsg">Mensaje</label><textarea id="cMsg" rows="4" placeholder="¿En qué podemos ayudarle?"></textarea></div>' +
      '<button class="btn btn--accent btn--block btn--lg" type="submit">' + icon('phone') + 'Enviar por WhatsApp</button>' +
      '</form>';
    return shell('contact', s, '<div class="split split--contact">' + info + form + '</div>', { dark: true });
  };

  /* ---------- header / footer ---------- */
  var NAV = [['hero', 'Inicio'], ['services', 'Servicios'], ['about', 'Nosotros'], ['packages', 'Chequeos'], ['faq', 'Preguntas'], ['location', 'Ubicación'], ['contact', 'Contacto']];

  function renderHeader() {
    var links = NAV.filter(function (n) { return C.sections[n[0]] && C.sections[n[0]].visible; })
      .map(function (n) { return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('');
    $('#siteHeader').innerHTML = '<div class="container nav">' +
      '<a class="brand" href="#hero" aria-label="' + esc(C.brand.name) + '">' + brandLogo(C.brand.logoHeader) + '</a>' +
      '<nav class="nav__links" id="navLinks" aria-label="Principal">' + links +
      '<a class="btn btn--accent nav__cta-m" href="#results">' + icon('file') + 'Resultados</a></nav>' +
      '<div class="nav__right"><a class="btn btn--accent nav__cta" href="#results">' + icon('file') + 'Resultados</a>' +
      '<button class="burger" id="burger" aria-label="Menú" aria-expanded="false"><span></span><span></span><span></span></button></div>' +
      '</div>';
  }

  function renderFooter() {
    var b = C.brand;
    var social = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['tiktok', 'TikTok']]
      .filter(function (x) { return b[x[0]]; })
      .map(function (x) { return '<a href="' + esc(b[x[0]]) + '" target="_blank" rel="noopener">' + x[1] + '</a>'; }).join('');
    var links = NAV.filter(function (n) { return C.sections[n[0]] && C.sections[n[0]].visible; })
      .map(function (n) { return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('');
    $('#siteFooter').innerHTML = '<div class="container footer">' +
      '<div class="footer__brand"><a class="brand brand--footer" href="#hero">' + brandLogo(C.brand.logoHeader) + '</a>' +
      '<p>Precisión diagnóstica con calor humano. Resultados confiables para decisiones médicas acertadas.</p>' +
      (social ? '<div class="footer__social">' + social + '</div>' : '') + '</div>' +
      '<div><h4>Navegación</h4><div class="footer__links">' + links + '<a href="#results">Resultados en línea</a></div></div>' +
      '<div><h4>Contacto</h4><div class="footer__links"><span>' + esc(b.address) + '</span><a href="tel:' + esc(String(b.phone).replace(/[^\d+]/g, '')) + '">' + esc(b.phone) + '</a><a href="mailto:' + esc(b.email) + '">' + esc(b.email) + '</a></div></div>' +
      '<div class="footer__cta"><h4>¿Listo para su examen?</h4><a class="btn btn--accent" target="_blank" rel="noopener" href="' + esc(wa('Hola, quiero agendar un examen.')) + '">Agendar ahora</a></div>' +
      '</div><div class="container footer__bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(b.name) + '. Todos los derechos reservados.</span>' +
      '<span class="footer__legal">Habeas data · Ley 1581 de 2012' +
      '<button type="button" class="admin-login-btn" id="adminDot">' + icon('lock') + 'Iniciar sesión</button></span></div>';
  }

  /* ---------- render principal ---------- */
  var firstRender = true;
  function applyTheme() {
    var r = D.documentElement.style;
    r.setProperty('--primary', C.brand.primary || '#0a2a52');
    r.setProperty('--accent', C.brand.accent || '#12b5a5');
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', C.brand.primary);
    D.title = C.brand.name;
  }

  function render() {
    applyTheme();
    renderHeader();
    var html = C.order.map(function (k) {
      var s = C.sections[k];
      return s && s.visible && R[k] ? R[k](s) : '';
    }).join('');
    $('#app').innerHTML = html;
    renderFooter();
    $('#waFloat').href = wa('Hola, quisiera más información.');
    bind();
    if (firstRender) { reveal(); counters(); firstRender = false; }
    else $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    D.dispatchEvent(new Event('site:rendered'));
  }

  /* ---------- interacciones ---------- */
  function reveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function counters() {
    var els = $$('.count');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, raw = el.getAttribute('data-to'), to = parseFloat(raw);
        if (isNaN(to)) return;
        var dec = (raw.split('.')[1] || '').length, t0 = performance.now(), dur = 1600;
        (function step(t) {
          var p = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - p, 3));
          el.textContent = v.toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (e) { io.observe(e); });
  }

  function bind() {
    var burger = $('#burger'), nav = $('#navLinks');
    burger.onclick = function () {
      var open = D.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open);
    };
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { D.body.classList.remove('nav-open'); }); });

    $$('.js-results').forEach(function (f) { f.onsubmit = onResults; });
    var cf = $('#contactForm'); if (cf) cf.onsubmit = function (e) {
      e.preventDefault();
      var msg = 'Hola, soy ' + $('#cName').value + (($('#cPhone').value) ? ' (' + $('#cPhone').value + ')' : '') +
        '.\nServicio: ' + $('#cService').value + '\n' + $('#cMsg').value;
      window.open(wa(msg), '_blank', 'noopener');
    };
    var dot = $('#adminDot'); if (dot) dot.onclick = function () { window.Admin && window.Admin.open(); };
    // Acceso oculto táctil: 5 toques seguidos sobre el logo del pie de página
    // (un solo toque sigue llevando al inicio, tras una breve espera)
    var fb = $('.brand--footer'), taps = [], tTop;
    if (fb) fb.addEventListener('click', function (e) {
      e.preventDefault();
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 2500; }); taps.push(now);
      clearTimeout(tTop);
      if (taps.length >= 5) { taps = []; window.Admin && window.Admin.open(); return; }
      if (taps.length === 1) tTop = setTimeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 700);
    });
  }

  function onScroll() {
    var y = window.scrollY, h = D.documentElement.scrollHeight - window.innerHeight;
    $('#siteHeader').classList.toggle('scrolled', y > 30);
    $('#progressBar').style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    $('#waFloat').classList.toggle('show', y > 400);
  }

  /* ---------- modal ---------- */
  function openModal(html, wide) {
    var m = $('#modal');
    $('#modalBody').innerHTML = html;
    m.classList.toggle('modal--wide', !!wide);
    m.setAttribute('aria-hidden', 'false');
    D.body.classList.add('no-scroll');
  }
  function closeModal() {
    $('#modal').setAttribute('aria-hidden', 'true');
    $('#modalBody').innerHTML = '';
    D.body.classList.remove('no-scroll');
  }
  D.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeModal(); });

  /* «Consultar resultados» / «Resultados»: lleva al formulario completo en
     pantalla, lo resalta y deja el cursor en el número de documento. Si la
     tarjeta de la portada está visible (computador), usa esa sin desplazarse. */
  function goToResultsForm(smooth) {
    var hero = $('.hero-res'), r = hero && hero.getBoundingClientRect();
    var form = hero && hero.offsetParent && r.top >= 0 && r.bottom <= window.innerHeight ? hero : $('#resultsForm');
    if (!form) return false;
    D.body.classList.remove('nav-open');
    // posición real sin la animación de entrada (offsetTop ignora transform)
    form.classList.add('in');
    var y = 0; for (var n = form; n; n = n.offsetParent) y += n.offsetTop;
    var top = y - $('#siteHeader').offsetHeight - 14;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth === false ? 'instant' : 'smooth' });
    var input = $('input[name=cedula]', form);
    var done = false, finish = function () {
      if (done) return; done = true;
      form.classList.remove('pulse'); void form.offsetWidth; form.classList.add('pulse');
      if (input) input.focus({ preventScroll: true });
    };
    if ('onscrollend' in window && Math.abs(window.scrollY - top) > 4) {
      window.addEventListener('scrollend', finish, { once: true });
      setTimeout(finish, 1200);
    } else setTimeout(finish, Math.min(900, Math.abs(window.scrollY - top) / 3 + 150));
    return true;
  }
  D.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#results"]');
    if (a && goToResultsForm()) { e.preventDefault(); history.replaceState(null, '', '#results'); }
  });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------- consulta de resultados ---------- */
  var ATT_KEY = 'dm_attempts';
  function attempts() {
    try { return JSON.parse(sessionStorage.getItem(ATT_KEY) || '[]').filter(function (t) { return Date.now() - t < 600000; }); }
    catch (e) { return []; }
  }
  function addAttempt() {
    try { var a = attempts(); a.push(Date.now()); sessionStorage.setItem(ATT_KEY, JSON.stringify(a)); } catch (e) { /* noop */ }
  }

  function onResults(e) {
    e.preventDefault();
    var f = e.currentTarget;
    var msg = $('.js-rmsg', f), btn = $('button[type=submit]', f);
    var tipo = f.tipo ? f.tipo.value : 'CC', ced = f.cedula.value.trim(), cod = f.codigo.value.trim();
    msg.textContent = ''; msg.classList.remove('err');
    if (!/^[A-Za-z0-9-]{4,20}$/.test(ced)) return fail('Ingrese un número de documento válido.');
    if (cod.length < 3) return fail('Ingrese el código de consulta de su comprobante.');
    if (!f.ok.checked) return fail('Debe autorizar el tratamiento de datos para continuar.');
    if (attempts().length >= 6) return fail('Demasiados intentos. Espere unos minutos e intente de nuevo.');

    var r = C.results;
    function fill(t) {
      return String(t).replace(/\{cedula\}/g, encodeURIComponent(ced)).replace(/\{codigo\}/g, encodeURIComponent(cod)).replace(/\{tipo\}/g, encodeURIComponent(tipo));
    }

    if (r.mode === 'biosoft' && window.BIOSOFT) {
      btn.disabled = true; btn.classList.add('loading');
      window.BIOSOFT.getResult(cod, ced, (r.tenantId || '').trim())
        .then(function (d) {
          if (!d) { addAttempt(); return fail('No encontramos un resultado con esos datos. Verifique su número de documento y el código de su comprobante.'); }
          showBiosoft(d);
        })
        .catch(function () { fail('No pudimos consultar su resultado en este momento. Intente de nuevo en unos minutos o escríbanos por WhatsApp.'); })
        .then(function () { btn.disabled = false; btn.classList.remove('loading'); });
      return;
    }

    if (r.mode === 'url' && r.urlTemplate) {
      var url = fill(r.urlTemplate);
      if (r.openIn === 'tab') { window.open(url, '_blank', 'noopener'); return; }
      return showFrame(url);
    }

    if (r.mode === 'api' && r.apiEndpoint) {
      btn.disabled = true; btn.classList.add('loading');
      fetch(r.apiEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ tipo: tipo, cedula: ced, codigo: cod })
      }).then(function (res) { return res.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          if (!d || d.ok === false || d.success === false) { addAttempt(); return fail(d && d.message ? d.message : 'No encontramos resultados con esos datos. Verifique e intente de nuevo.'); }
          var link = d.pdfUrl || d.url || d.pdf;
          if (d.pdfBase64) link = 'data:application/pdf;base64,' + d.pdfBase64;
          if (link) return showFrame(link, d.paciente || d.patient);
          if (d.html) return openModal('<div class="res-html">' + d.html + '</div>', true);
          fail('Respuesta del servidor no reconocida.');
        })
        .catch(function () { fail('No fue posible conectar con el servidor de resultados. Intente más tarde.'); })
        .then(function () { btn.disabled = false; btn.classList.remove('loading'); });
      return;
    }

    /* modo demostración */
    btn.disabled = true; btn.classList.add('loading');
    setTimeout(function () {
      btn.disabled = false; btn.classList.remove('loading');
      showDemo(tipo, ced, cod);
    }, 900);

    function fail(t) { msg.textContent = t; msg.classList.add('err'); }
  }

  /* ---------- resultado real de BIOsoft ---------- */
  function fmtFecha(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function showBiosoft(d) {
    // El más reciente de todos (el consultado + su historial) va destacado arriba
    var todas = [{ codigo: d.codigo, numeroOrden: d.numeroOrden, fechaOrden: d.fechaOrden, pdf: d.pdfDataUrl }]
      .concat((d.historial || []).map(function (h) { return { codigo: h.codigo, numeroOrden: h.numeroOrden, fechaOrden: h.fechaOrden, pdf: null }; }));
    todas.sort(function (a, b) { return String(b.fechaOrden || '').localeCompare(String(a.fechaOrden || '')); });
    var main = todas[0], rest = todas.slice(1);
    var small = window.matchMedia('(max-width: 760px)').matches;

    function fileName(e) { return 'Resultado-' + (e.numeroOrden || e.codigo) + '.pdf'; }
    function ensurePdf(e) {
      if (e.pdf) return Promise.resolve(e.pdf);
      return window.BIOSOFT.getPdf(e.codigo).then(function (p) { e.pdf = p; return p; });
    }
    function download(e, b) {
      var t = b.innerHTML; b.disabled = true; b.textContent = 'Cargando…';
      ensurePdf(e).then(function (p) {
        if (!p) throw new Error('sin_pdf');
        var a = D.createElement('a'); a.href = window.BIOSOFT.pdfBlobUrl(p); a.download = fileName(e);
        D.body.appendChild(a); a.click(); a.remove();
      }).catch(function () { toast('No se pudo descargar este resultado. Intente de nuevo.', 'err'); })
        .then(function () { b.disabled = false; b.innerHTML = t; });
    }

    var hist = rest.length ? '<div class="bs-hist"><h4>' + icon('calendar') + 'Resultados anteriores</h4>' + rest.map(function (e, i) {
      return '<div class="bs-hist__row"><div><b>Orden ' + esc(e.numeroOrden || e.codigo) + '</b><span>' + esc(fmtFecha(e.fechaOrden)) + '</span></div>' +
        '<button type="button" class="btn btn--outline btn--sm" data-h="' + i + '">' + icon('file') + 'Descargar</button></div>';
    }).join('') + '</div>' : '';

    openModal('<div class="bs">' +
      '<div class="bs__head"><span class="bs__ok">' + icon('check') + '</span><div><small>Resultado disponible</small><h3>' + esc(d.nombrePaciente || 'Paciente') + '</h3>' +
      '<p>Orden No. ' + esc(main.numeroOrden || '—') + ' · ' + esc(fmtFecha(main.fechaOrden)) + '</p></div></div>' +
      '<div class="bs__actions"><button type="button" class="btn btn--accent" id="bsDown">' + icon('file') + 'Descargar PDF</button>' +
      '<button type="button" class="btn btn--ghost" id="bsOpen">' + icon('arrow') + 'Abrir en pestaña nueva</button></div>' +
      (small ? '' : '<div class="bs__viewer" id="bsViewer"><div class="bs__loading">Cargando resultado…</div></div>') +
      hist +
      '<p class="bs__note">' + icon('lock') + '<span>Resultado validado por bacteriólogo. Ante cualquier duda, consulte a su médico tratante.</span></p>' +
      '</div>', true);

    $('#bsDown').onclick = function () { download(main, this); };
    $('#bsOpen').onclick = function () {
      var w = window.open('', '_blank');
      ensurePdf(main).then(function (p) {
        if (!p) throw new Error();
        if (w) w.location.href = window.BIOSOFT.pdfBlobUrl(p); else download(main, $('#bsDown'));
      }).catch(function () { if (w) w.close(); toast('No se pudo abrir el resultado.', 'err'); });
    };
    $$('[data-h]', $('#modalBody')).forEach(function (b) { b.onclick = function () { download(rest[+b.getAttribute('data-h')], b); }; });
    if (!small) ensurePdf(main).then(function (p) {
      var v = $('#bsViewer'); if (!v) return;
      v.innerHTML = p ? '<iframe title="Resultado del paciente" src="' + window.BIOSOFT.pdfBlobUrl(p) + '#view=FitH"></iframe>' : '<div class="bs__loading">Use el botón «Descargar PDF» para ver su resultado.</div>';
    });
  }

  function showFrame(url, patient) {
    var safe = /^(https?:|data:application\/pdf)/i.test(url) ? url : '';
    if (!safe) return toast('Enlace de resultados no válido.', 'err');
    openModal('<div class="res-frame"><div class="res-frame__bar"><div>' + icon('file') + '<strong>Sus resultados' + (patient ? ' · ' + esc(patient) : '') + '</strong></div>' +
      '<a class="btn btn--accent btn--sm" href="' + esc(safe) + '" target="_blank" rel="noopener">Abrir en pestaña nueva</a></div>' +
      '<iframe src="' + esc(safe) + '" title="Resultados del paciente"></iframe></div>', true);
  }

  function showDemo(tipo, ced, cod) {
    var rows = [['Hemoglobina', '14.2', 'g/dL', '12.0 – 16.0'], ['Hematocrito', '42.1', '%', '36 – 48'], ['Leucocitos', '6.800', '/mm³', '4.500 – 11.000'],
      ['Plaquetas', '265.000', '/mm³', '150.000 – 450.000'], ['Glucosa basal', '88', 'mg/dL', '70 – 100'], ['Colesterol total', '182', 'mg/dL', '< 200']];
    openModal('<div class="demo">' +
      '<div class="demo__head">' + brandLogo(38) + '<span class="pill">Modo demostración</span></div>' +
      '<div class="demo__pt"><div><small>Paciente</small><strong>Paciente de ejemplo</strong></div><div><small>Documento</small><strong>' + esc(tipo) + ' ' + esc(ced) + '</strong></div><div><small>Orden</small><strong>' + esc(cod) + '</strong></div><div><small>Fecha</small><strong>' + new Date().toLocaleDateString('es-CO') + '</strong></div></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Prueba</th><th>Resultado</th><th>Unidad</th><th>Referencia</th></tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<p class="demo__note">' + icon('lock') + '<span>Este es un resultado de ejemplo. El administrador debe conectar el software del laboratorio desde el panel (pestaña <b>Resultados</b>).</span></p>' +
      '<button class="btn btn--accent" onclick="window.print()">Imprimir</button></div>', true);
  }

  /* ---------- arranque ---------- */
  window.Site = {
    get content() { return C; },
    set content(v) { C = normalize(v); },
    defaults: function () { return clone(window.DEFAULT_CONTENT); },
    render: render, saveLocal: saveLocal, toast: toast, esc: esc,
    STORE_KEY: STORE_KEY
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  loadContent().then(function () {
    render(); onScroll();
    if (location.hash === '#results') goToResultsForm(false);
    else if (location.hash && location.hash !== '#admin') {
      var t = D.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView();
    }
    D.dispatchEvent(new Event('site:ready'));
  });
})();
