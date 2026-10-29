/* =========================================================================
   Panel administrativo — acceso oculto
   · Punto discreto (•) al final del pie de página
   · Atajo de teclado Ctrl + Shift + A
   · Dirección del sitio terminada en #admin
   Clave por defecto: 123456 (cámbiela desde la pestaña "Publicar").
   ========================================================================= */
(function () {
  'use strict';

  var D = document;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var esc = function (v) { return window.Site.esc(v); };
  var API = 'api/save.php';  // se reemplaza por api/admin en Vercel (ver checkServer)
  var PASS_KEY = 'dm_admin_pass';
  var SESSION_KEY = 'dm_admin';
  var server = false;      // true si se puede publicar en el servidor (PHP o Vercel Blob)
  var platform = '';       // 'vercel' | 'php' | ''
  var pass = '';           // clave usada en esta sesión, se envía al servidor al publicar
  var current = 'hero';    // sección abierta en el editor
  var tab = 'sections';

  /* ---------- definición de campos ---------- */
  var ICON_OPTS = Object.keys(window.ICONS);
  var MODE_OPTS = [['none', 'Sin imagen'], ['frame', 'Recuadro elegante'], ['background', 'Imagen de fondo']];
  var COMMON = [
    { k: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
    { k: 'title', label: 'Título', type: 'text' },
    { k: 'subtitle', label: 'Subtítulo', type: 'textarea' }
  ];
  var IMAGE = [
    { k: 'image', label: 'Imagen de la sección', type: 'image' },
    { k: 'imageMode', label: 'Cómo mostrar la imagen', type: 'select', options: MODE_OPTS },
    { k: 'overlay', label: 'Oscurecer fondo (%)', type: 'range', min: 0, max: 95, step: 5, show: function (s) { return s.imageMode === 'background'; } }
  ];

  var SECTIONS = {
    hero: { name: 'Portada (Hero)', fields: [
      { k: 'eyebrow', label: 'Etiqueta superior', type: 'text' },
      { k: 'title', label: 'Título principal', type: 'textarea' },
      { k: 'subtitle', label: 'Texto descriptivo', type: 'textarea' },
      { k: 'cta1', label: 'Botón principal (va a Resultados)', type: 'text' },
      { k: 'cta2', label: 'Botón secundario (WhatsApp)', type: 'text' },
      { k: 'textAlign', label: 'Alineación del texto', type: 'select', options: [['left', 'Izquierda'], ['center', 'Centrado']] }
    ].concat(IMAGE), items: { label: 'Viñetas destacadas', fields: [{ k: 'text', label: 'Texto', type: 'text' }], blank: { text: 'Nuevo beneficio' } },
      note: 'El logo de la portada (tamaño y posición) se edita en la pestaña «Marca y logo».' },
    stats: { name: 'Cifras', fields: [], items: { label: 'Cifras', fields: [
      { k: 'value', label: 'Número', type: 'text' }, { k: 'suffix', label: 'Sufijo (+, %, k)', type: 'text' }, { k: 'label', label: 'Descripción', type: 'text' }
    ], blank: { value: '10', suffix: '+', label: 'Nueva cifra' } } },
    results: { name: 'Portal de resultados', fields: COMMON.concat(IMAGE), items: { label: 'Beneficios', fields: [
      { k: 'icon', label: 'Icono', type: 'icon' }, { k: 'text', label: 'Texto', type: 'text' }
    ], blank: { icon: 'check', text: 'Nuevo beneficio' } }, note: 'La conexión con el software del laboratorio se configura en la pestaña «Resultados».' },
    services: { name: 'Servicios', fields: COMMON.concat(IMAGE), items: { label: 'Servicios', fields: [
      { k: 'icon', label: 'Icono', type: 'icon' }, { k: 'title', label: 'Nombre', type: 'text' }, { k: 'text', label: 'Descripción', type: 'textarea' }, { k: 'image', label: 'Foto (opcional)', type: 'image' }
    ], blank: { icon: 'flask', title: 'Nuevo servicio', text: 'Descripción del servicio.', image: '' } } },
    about: { name: 'Nosotros', fields: COMMON.concat([
      { k: 'text', label: 'Texto principal', type: 'textarea' }, { k: 'mission', label: 'Misión', type: 'textarea' }, { k: 'vision', label: 'Visión', type: 'textarea' }
    ]).concat(IMAGE), items: { label: 'Puntos destacados', fields: [{ k: 'text', label: 'Texto', type: 'text' }], blank: { text: 'Nuevo punto' } } },
    quality: { name: 'Por qué elegirnos', fields: COMMON.concat(IMAGE), items: { label: 'Razones', fields: [
      { k: 'icon', label: 'Icono', type: 'icon' }, { k: 'title', label: 'Título', type: 'text' }, { k: 'text', label: 'Texto', type: 'textarea' }
    ], blank: { icon: 'award', title: 'Nueva razón', text: '' } } },
    process: { name: 'Cómo funciona', fields: COMMON.concat(IMAGE), items: { label: 'Pasos', fields: [
      { k: 'title', label: 'Título', type: 'text' }, { k: 'text', label: 'Texto', type: 'textarea' }
    ], blank: { title: 'Nuevo paso', text: '' } } },
    packages: { name: 'Chequeos / Paquetes', fields: COMMON.concat(IMAGE), items: { label: 'Paquetes', fields: [
      { k: 'name', label: 'Nombre', type: 'text' }, { k: 'price', label: 'Precio', type: 'text' },
      { k: 'includes', label: 'Incluye (uno por línea)', type: 'textarea' }, { k: 'featured', label: 'Destacar como «Más elegido»', type: 'toggle' }
    ], blank: { name: 'Nuevo chequeo', price: '$ 0', includes: 'Examen 1\nExamen 2', featured: false } } },
    home: { name: 'Toma a domicilio', fields: [
      { k: 'eyebrow', label: 'Etiqueta superior', type: 'text' }, { k: 'title', label: 'Título', type: 'text' },
      { k: 'text', label: 'Texto', type: 'textarea' }, { k: 'cta', label: 'Texto del botón', type: 'text' }
    ].concat(IMAGE) },
    team: { name: 'Equipo', fields: COMMON.concat(IMAGE), items: { label: 'Integrantes', fields: [
      { k: 'photo', label: 'Foto', type: 'image' }, { k: 'name', label: 'Nombre', type: 'text' }, { k: 'role', label: 'Cargo', type: 'text' }
    ], blank: { name: 'Nombre Apellido', role: 'Cargo', photo: '' } } },
    partners: { name: 'Convenios', fields: COMMON.concat(IMAGE), items: { label: 'Aliados', fields: [
      { k: 'logo', label: 'Logo', type: 'image' }, { k: 'name', label: 'Nombre', type: 'text' }
    ], blank: { name: 'Nuevo aliado', logo: '' } } },
    testimonials: { name: 'Testimonios', fields: COMMON.concat(IMAGE), items: { label: 'Testimonios', fields: [
      { k: 'name', label: 'Nombre', type: 'text' }, { k: 'text', label: 'Opinión', type: 'textarea' },
      { k: 'rating', label: 'Estrellas', type: 'select', options: [['5', '5'], ['4', '4'], ['3', '3']] }
    ], blank: { name: 'Paciente', text: '', rating: '5' } } },
    prep: { name: 'Preparación de exámenes', fields: COMMON.concat(IMAGE), items: { label: 'Indicaciones', fields: [
      { k: 'title', label: 'Examen', type: 'text' }, { k: 'text', label: 'Indicación', type: 'textarea' }
    ], blank: { title: 'Nuevo examen', text: '' } } },
    faq: { name: 'Preguntas frecuentes', fields: COMMON.concat(IMAGE), items: { label: 'Preguntas', fields: [
      { k: 'q', label: 'Pregunta', type: 'text' }, { k: 'a', label: 'Respuesta', type: 'textarea' }
    ], blank: { q: 'Nueva pregunta', a: '' } } },
    location: { name: 'Cómo llegar (mapa)', fields: COMMON.concat([
      { k: 'mapUrl', label: 'Google Maps: pegue el enlace o el código «Insertar un mapa»', type: 'textarea',
        help: 'En Google Maps busque el laboratorio → Compartir → «Insertar un mapa» → Copiar HTML y péguelo aquí. Si lo deja vacío se usa la dirección de la pestaña «Marca y logo».' }
    ]).concat(IMAGE), items: { label: 'Horarios', fields: [
      { k: 'day', label: 'Días', type: 'text' }, { k: 'hours', label: 'Horario', type: 'text' }
    ], blank: { day: 'Día', hours: '7:00 a.m. – 5:00 p.m.' } } },
    contact: { name: 'Contacto', fields: COMMON.concat(IMAGE) }
  };

  var BRAND = [
    { group: 'Identidad' },
    { k: 'name', label: 'Nombre completo', type: 'text' },
    { k: 'short', label: 'Nombre corto (encabezado)', type: 'text' },
    { k: 'tagline', label: 'Lema / tipo de negocio', type: 'text' },
    { k: 'logo', label: 'Logo (PNG transparente recomendado)', type: 'image', logo: true },
    { group: 'Logo en el encabezado' },
    { k: 'logoHeader', label: 'Tamaño en el menú (px)', type: 'range', min: 24, max: 96, step: 2 },
    { group: 'Logo en la portada' },
    { k: 'logoHeroShow', label: 'Mostrar logo en la portada', type: 'toggle' },
    { k: 'logoHero', label: 'Tamaño en la portada (px)', type: 'range', min: 40, max: 320, step: 4 },
    { k: 'logoHeroPos', label: 'Posición', type: 'select', options: [['top', 'Arriba del título'], ['bottom', 'Debajo de los botones'], ['side', 'Grande a la derecha']] },
    { k: 'logoHeroAlign', label: 'Alineación', type: 'select', options: [['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']] },
    { k: 'logoHeroCard', label: 'Fondo blanco detrás del logo (mejor contraste)', type: 'toggle' },
    { group: 'Colores de marca' },
    { k: 'primary', label: 'Color principal', type: 'color' },
    { k: 'accent', label: 'Color de acento', type: 'color' },
    { group: 'Datos de contacto' },
    { k: 'phone', label: 'Teléfono visible', type: 'text' },
    { k: 'whatsapp', label: 'WhatsApp (con indicativo, ej: 573001234567)', type: 'text' },
    { k: 'email', label: 'Correo', type: 'text' },
    { k: 'address', label: 'Dirección', type: 'text' },
    { group: 'Redes sociales (enlaces)' },
    { k: 'facebook', label: 'Facebook', type: 'text' },
    { k: 'instagram', label: 'Instagram', type: 'text' },
    { k: 'tiktok', label: 'TikTok', type: 'text' }
  ];

  var RESULTS = [
    { k: 'mode', label: 'Modo de conexión', type: 'select', options: [['biosoft', 'BIOsoft (conexión directa, recomendado)'], ['demo', 'Demostración (resultado de ejemplo)'], ['url', 'Enlace de otro software'], ['api', 'API JSON de otro software']] },
    { k: 'tenantId', label: 'Laboratorio en BIOsoft', type: 'text', show: function (r) { return r.mode === 'biosoft'; },
      help: 'Pegue aquí el enlace de su Página Web de BIOsoft (Configuración → Página Web → Copiar enlace) o solo el ID «lab-…». Así la página muestra únicamente resultados de este laboratorio.' },
    { k: 'urlTemplate', label: 'Enlace del software', type: 'textarea', show: function (r) { return r.mode === 'url'; },
      help: 'Use {cedula}, {codigo} y {tipo} donde van los datos del paciente. Ej: https://software.com/resultados?doc={cedula}&clave={codigo}' },
    { k: 'openIn', label: 'Abrir resultados en', type: 'select', options: [['modal', 'Ventana dentro de la página'], ['tab', 'Pestaña nueva']], show: function (r) { return r.mode === 'url'; } },
    { k: 'apiEndpoint', label: 'URL de la API', type: 'text', show: function (r) { return r.mode === 'api'; },
      help: 'Recibe POST JSON {tipo, cedula, codigo} y responde {ok:true, pdfUrl} o {ok:true, html} o {ok:false, message}.' },
    { k: 'help', label: 'Ayuda para el paciente (debajo del código)', type: 'textarea' }
  ];

  /* ---------- helpers de estado ---------- */
  function C() { return window.Site.content; }
  var tRender;
  function changed() {
    clearTimeout(tRender);
    tRender = setTimeout(function () {
      window.Site.render();
      if (!window.Site.saveLocal()) window.Site.toast('El navegador no tiene espacio: use imágenes más livianas o publique en el servidor.', 'err');
      setStatus('Cambios guardados en este navegador');
    }, 220);
  }
  function setStatus(t) { var s = $('#admStatus'); if (s) s.textContent = t; }

  /* ---------- imágenes ---------- */
  function compress(file, isLogo) {
    return new Promise(function (resolve, reject) {
      if (file.size > 15 * 1024 * 1024) return reject(new Error('Imagen demasiado grande (máx. 15 MB).'));
      var fr = new FileReader();
      fr.onerror = reject;
      fr.onload = function () {
        if (/svg/.test(file.type) || (isLogo && file.size < 250 * 1024)) return resolve(fr.result);
        var img = new Image();
        img.onload = function () {
          var max = isLogo ? 800 : 1800, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
          var cv = D.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          var out = cv.toDataURL('image/webp', 0.82);
          if (out.indexOf('image/webp') < 0) out = cv.toDataURL(isLogo ? 'image/png' : 'image/jpeg', 0.84);
          resolve(out);
        };
        img.onerror = function () { reject(new Error('Formato de imagen no soportado.')); };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function upload(file, isLogo) {
    return compress(file, isLogo).then(function (dataUrl) {
      if (!server) return dataUrl;
      return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upload', pass: pass, name: file.name, data: dataUrl }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { return d.ok ? d.url : dataUrl; })
        .catch(function () { return dataUrl; });
    });
  }

  /* ---------- constructor de formularios ---------- */
  var uid = 0;
  function field(f, obj, onChange) {
    if (f.group) return '<h4 class="adm-group">' + esc(f.group) + '</h4>';
    var id = 'af' + (++uid), v = obj[f.k];
    var hidden = f.show && !f.show(obj) ? ' hidden' : '';
    var h = '<div class="adm-field' + hidden + '" data-k="' + f.k + '"' + (f.show ? ' data-cond' : '') + '>';
    var help = f.help ? '<small class="adm-help">' + esc(f.help) + '</small>' : '';
    switch (f.type) {
      case 'textarea':
        h += '<label for="' + id + '">' + esc(f.label) + '</label><textarea id="' + id + '" rows="3">' + esc(v) + '</textarea>' + help; break;
      case 'select':
        h += '<label for="' + id + '">' + esc(f.label) + '</label><select id="' + id + '">' + f.options.map(function (o) {
          return '<option value="' + esc(o[0]) + '"' + (String(v) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
        }).join('') + '</select>' + help; break;
      case 'range':
        h += '<label for="' + id + '">' + esc(f.label) + ' <b class="adm-val">' + esc(v) + '</b></label><input type="range" id="' + id + '" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + esc(v) + '">'; break;
      case 'color':
        h += '<label for="' + id + '">' + esc(f.label) + '</label><div class="adm-color"><input type="color" id="' + id + '" value="' + esc(v) + '"><code>' + esc(v) + '</code></div>'; break;
      case 'toggle':
        h += '<label class="adm-toggle"><input type="checkbox" id="' + id + '"' + (v === true || v === 'true' ? ' checked' : '') + '><i></i><span>' + esc(f.label) + '</span></label>'; break;
      case 'icon':
        h += '<label>' + esc(f.label) + '</label><div class="adm-icons">' + ICON_OPTS.map(function (n) {
          return '<button type="button" data-icon="' + n + '" class="' + (n === v ? 'on' : '') + '" title="' + n + '">' + icon(n) + '</button>';
        }).join('') + '</div>'; break;
      case 'image':
        h += '<label>' + esc(f.label) + '</label><div class="adm-img">' +
          '<div class="adm-img__prev' + (f.logo ? ' adm-img__prev--logo' : '') + '">' + (v ? '<img src="' + esc(v) + '" alt="">' : '<span>Sin imagen</span>') + '</div>' +
          '<div class="adm-img__ctl"><label class="adm-btn adm-btn--pri">Subir imagen<input type="file" accept="image/*" hidden></label>' +
          (v ? '<button type="button" class="adm-btn adm-btn--ghost" data-clear>Quitar</button>' : '') +
          '<input type="url" placeholder="…o pegue un enlace de imagen" value="' + (v && v.indexOf('data:') === 0 ? '' : esc(v)) + '"></div></div>'; break;
      default:
        h += '<label for="' + id + '">' + esc(f.label) + '</label><input type="text" id="' + id + '" value="' + esc(v) + '">' + help;
    }
    return h + '</div>';
  }

  function bindFields(root, defs, obj, rerender) {
    defs.forEach(function (f) {
      if (f.group) return;
      var el = $('.adm-field[data-k="' + f.k + '"]', root);
      if (!el) return;
      function set(val) {
        if (f.k === 'tenantId') val = window.BIOSOFT.tenantId(val) || String(val).trim();
        obj[f.k] = val; changed();
        if (defs.some(function (d) { return d.show; })) $$('.adm-field[data-cond]', root).forEach(function (n) {
          var d = defs.filter(function (x) { return x.k === n.getAttribute('data-k'); })[0];
          n.classList.toggle('hidden', !d.show(obj));
        });
      }
      if (f.type === 'icon') {
        $$('[data-icon]', el).forEach(function (b) {
          b.onclick = function () { $$('[data-icon]', el).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); set(b.getAttribute('data-icon')); };
        });
      } else if (f.type === 'image') {
        $('input[type=file]', el).onchange = function (e) {
          var file = e.target.files[0]; if (!file) return;
          setStatus('Procesando imagen…');
          upload(file, f.logo).then(function (url) { obj[f.k] = url; changed(); rerender(); })
            .catch(function (err) { window.Site.toast(err.message, 'err'); setStatus(''); });
        };
        $('input[type=url]', el).onchange = function (e) { obj[f.k] = e.target.value.trim(); changed(); rerender(); };
        var clr = $('[data-clear]', el); if (clr) clr.onclick = function () { obj[f.k] = ''; changed(); rerender(); };
      } else if (f.type === 'toggle') {
        $('input', el).onchange = function (e) { set(e.target.checked); };
      } else {
        var inp = $('input,textarea,select', el);
        inp.addEventListener('input', function () {
          var val = f.type === 'range' ? +inp.value : inp.value;
          if (f.type === 'range') $('.adm-val', el).textContent = val;
          if (f.type === 'color') $('code', el).textContent = val;
          set(val);
        });
      }
    });
  }

  /* ---------- pestañas ---------- */
  function renderSections(body) {
    var c = C(), def = SECTIONS[current], s = c.sections[current];
    var opts = c.order.map(function (k) { return '<option value="' + k + '"' + (k === current ? ' selected' : '') + '>' + esc(SECTIONS[k].name) + (c.sections[k].visible ? '' : ' (oculta)') + '</option>'; }).join('');
    var h = '<div class="adm-field"><label>Sección a editar</label><select id="admSecSel">' + opts + '</select></div>' +
      '<div class="adm-field"><label class="adm-toggle"><input type="checkbox" id="admVis"' + (s.visible ? ' checked' : '') + '><i></i><span>Mostrar esta sección en la página</span></label></div>' +
      (def.note ? '<p class="adm-note">' + esc(def.note) + '</p>' : '') +
      '<div id="admSecFields">' + def.fields.map(function (f) { return field(f, s); }).join('') + '</div>';
    if (def.items) {
      h += '<h4 class="adm-group">' + esc(def.items.label) + ' <small>(' + (s.items || []).length + ')</small></h4><div class="adm-items">';
      (s.items || []).forEach(function (it, i) {
        var title = it.title || it.name || it.text || it.q || it.day || it.label || ('Elemento ' + (i + 1));
        h += '<details class="adm-item" data-i="' + i + '"' + (i === openItem ? ' open' : '') + '><summary><span>' + esc(String(title).slice(0, 48)) + '</span>' +
          '<span class="adm-item__ctl"><button type="button" data-mv="-1" title="Subir">↑</button><button type="button" data-mv="1" title="Bajar">↓</button><button type="button" data-del title="Eliminar">✕</button></span></summary>' +
          '<div class="adm-item__body">' + def.items.fields.map(function (f) { return field(f, it); }).join('') + '</div></details>';
      });
      h += '</div><button type="button" class="adm-btn adm-btn--pri adm-btn--block" id="admAdd">+ Agregar</button>';
    }
    body.innerHTML = h;

    $('#admSecSel').onchange = function (e) { current = e.target.value; openItem = -1; draw(); goTo(current); };
    $('#admVis').onchange = function (e) { s.visible = e.target.checked; changed(); };
    bindFields($('#admSecFields'), def.fields, s, draw);
    if (def.items) {
      $$('.adm-item', body).forEach(function (el) {
        var i = +el.getAttribute('data-i');
        el.addEventListener('toggle', function () { if (el.open) openItem = i; });
        bindFields($('.adm-item__body', el), def.items.fields, s.items[i], function () { openItem = i; draw(); });
        $$('[data-mv]', el).forEach(function (b) {
          b.onclick = function (e) {
            e.preventDefault();
            var j = i + (+b.getAttribute('data-mv'));
            if (j < 0 || j >= s.items.length) return;
            var t = s.items[i]; s.items[i] = s.items[j]; s.items[j] = t; openItem = j; changed(); draw();
          };
        });
        $('[data-del]', el).onclick = function (e) {
          e.preventDefault();
          if (!confirm('¿Eliminar este elemento?')) return;
          s.items.splice(i, 1); openItem = -1; changed(); draw();
        };
      });
      $('#admAdd').onclick = function () {
        s.items = s.items || [];
        s.items.push(JSON.parse(JSON.stringify(def.items.blank)));
        openItem = s.items.length - 1; changed(); draw();
      };
    }
  }
  var openItem = -1;

  function renderBrand(body) {
    var b = C().brand;
    body.innerHTML = '<button type="button" class="adm-btn adm-btn--ghost adm-btn--block" id="admImportBs2" style="margin:0 0 16px">Importar logo y datos desde BIOsoft</button>' +
      BRAND.map(function (f) { return field(f, b); }).join('');
    bindFields(body, BRAND, b, draw);
    $('#admImportBs2').onclick = importBiosoft;
  }

  /* Trae logo, colores, contacto, textos, servicios, testimonios, cifras,
     horario y mapa de la Página Web configurada en BIOsoft
     (colección pública demoSitioWeb). Solo copia los campos que tengan dato. */
  function importBiosoft() {
    var c = C(), r = c.results;
    var host = location.hostname;
    var local = /^(localhost|127\.|0\.0\.0\.0|$)/.test(host) || /github\.io|netlify|vercel/.test(host);
    var tid = window.BIOSOFT.tenantId(r.tenantId);
    var getId = tid
      ? Promise.resolve(tid)
      : (local ? Promise.resolve(null) : window.BIOSOFT.findTenantByDomain(host));
    setStatus('Consultando BIOsoft…');
    getId.then(function (id) {
      if (!id) {
        var typed = prompt('Pegue el enlace de la Página Web de BIOsoft o el ID del laboratorio:') || '';
        if (!typed.trim()) throw new Error('cancel');
        id = window.BIOSOFT.tenantId(typed);
        if (!id) throw new Error('Ese enlace o ID no es válido. Debe contener «?t=lab-…».');
      }
      return window.BIOSOFT.getSite(id).then(function (d) { return { id: id, d: d }; });
    }).then(function (res) {
      var d = res.d;
      if (!d) throw new Error('BIOsoft no tiene una Página Web con el ID «' + res.id + '». Revise el enlace en BIOsoft → Configuración → Página Web.');
      if (!confirm('Se encontró «' + (d.nombre || 'Laboratorio') + '» en BIOsoft. ¿Importar su logo, datos y contenido? Lo que no tenga dato en BIOsoft se conserva.')) throw new Error('cancel');
      var b = c.brand, S = c.sections;
      r.tenantId = res.id;
      if (d.nombre) { b.name = d.nombre; b.short = d.nombre.replace(/^laboratorio\s+(cl[ií]nico\s+)?/i, ''); }
      if (d.logoDataUrl) b.logo = d.logoDataUrl;
      if (/^#[0-9a-f]{6}$/i.test(d.colorPrimario || '')) b.accent = d.colorPrimario;
      if (d.telefonos) {
        b.phone = String(d.telefonos).split(/[\/,;·]/)[0].trim();
        var n = String(d.telefonos).replace(/\D/g, '');
        if (n.length > 13) n = n.slice(0, 10);
        if (n.length === 10 && n.charAt(0) === '3') n = '57' + n;
        if (n) b.whatsapp = n;
      }
      if (d.email) b.email = d.email;
      if (d.direccion) b.address = d.direccion;
      ['facebook', 'instagram', 'tiktok'].forEach(function (k) { if (d[k]) b[k] = d[k]; });
      if (d.heroTitulo) S.hero.title = d.heroTitulo;
      if (d.heroSubtitulo) S.hero.subtitle = d.heroSubtitulo;
      if (d.fotoHero) S.hero.image = d.fotoHero;
      if (d.sobreNosotros) S.about.text = d.sobreNosotros;
      if (d.fotoNosotros) { S.about.image = d.fotoNosotros; S.about.imageMode = 'frame'; }
      if (d.mapsQuery) S.location.mapUrl = d.mapsQuery;
      if (d.horario) {
        S.location.items = String(d.horario).split('\n').filter(Boolean).map(function (l) {
          var m = l.split(/:\s+|\s+[–-]\s+(?=\d)/);
          return m.length > 1 ? { day: m[0].trim(), hours: l.slice(m[0].length).replace(/^[:\s–-]+/, '').trim() } : { day: l.trim(), hours: '' };
        });
      }
      var icons = ['drop', 'flask', 'pill', 'microscope', 'shield', 'heart', 'virus', 'dna'];
      if (d.servicios && d.servicios.length) S.services.items = d.servicios.map(function (x, i) {
        return { icon: icons[i % icons.length], title: x.nombre || '', text: x.desc || '', image: '' };
      });
      if (d.testimonios && d.testimonios.length) S.testimonials.items = d.testimonios.map(function (x) {
        return { name: x.nombre || 'Paciente', text: x.texto || '', rating: '5' };
      });
      if (d.stats && d.stats.length) S.stats.items = d.stats.slice(0, 4).map(function (x) {
        var m = String(x.valor || '').match(/^([\d.,]+)(.*)$/);
        return m ? { value: m[1].replace(',', '.'), suffix: m[2], label: x.etiqueta || '' } : { value: x.valor || '', suffix: '', label: x.etiqueta || '' };
      });
      changed(); draw();
      window.Site.toast('Contenido importado desde BIOsoft', 'ok');
    }).catch(function (e) {
      setStatus('');
      if (e && e.message !== 'cancel') window.Site.toast(e.message && e.message.indexOf('http_') !== 0 ? e.message : 'No se pudo conectar con BIOsoft.', 'err');
    });
  }

  function renderResults(body) {
    var r = C().results;
    body.innerHTML = '<p class="adm-note">En modo BIOsoft, cada resultado que el laboratorio envía desde <b>Reportes → Enviar resultados</b> queda disponible aquí automáticamente. El paciente consulta con su documento y el código de 6 dígitos del comprobante, y ve también su historial.</p>' +
      RESULTS.map(function (f) { return field(f, r); }).join('') +
      '<button type="button" class="adm-btn adm-btn--pri adm-btn--block" id="admImportBs">Importar marca y contenido desde BIOsoft</button>' +
      '<button type="button" class="adm-btn adm-btn--ghost adm-btn--block" id="admTestRes">Probar consulta en la página</button>';
    bindFields(body, RESULTS, r, draw);
    $('#admTestRes').onclick = function () { goTo('results'); };
    $('#admImportBs').onclick = importBiosoft;
  }

  function renderOrder(body) {
    var c = C();
    body.innerHTML = '<p class="adm-note">Cambie el orden en que aparecen las secciones y oculte las que no necesite.</p><ul class="adm-order">' +
      c.order.map(function (k, i) {
        return '<li data-k="' + k + '"><label class="adm-toggle adm-toggle--sm"><input type="checkbox"' + (c.sections[k].visible ? ' checked' : '') + '><i></i></label>' +
          '<span>' + esc(SECTIONS[k].name) + '</span><span class="adm-item__ctl">' +
          (i > 0 ? '<button type="button" data-mv="-1">↑</button>' : '') + (i < c.order.length - 1 ? '<button type="button" data-mv="1">↓</button>' : '') +
          '<button type="button" data-edit>Editar</button></span></li>';
      }).join('') + '</ul>';
    $$('.adm-order li', body).forEach(function (li) {
      var k = li.getAttribute('data-k'), i = c.order.indexOf(k);
      $('input', li).onchange = function (e) { c.sections[k].visible = e.target.checked; changed(); };
      $$('[data-mv]', li).forEach(function (b) {
        b.onclick = function () {
          var j = i + (+b.getAttribute('data-mv'));
          c.order.splice(i, 1); c.order.splice(j, 0, k); changed(); draw();
        };
      });
      $('[data-edit]', li).onclick = function () { current = k; tab = 'sections'; draw(); goTo(k); };
    });
  }

  function renderPublish(body) {
    var vercelSetup = platform === 'vercel' && !server
      ? '<div class="adm-card adm-card--warn"><h4>⚙️ Active «Publicar» en Vercel (una sola vez)</h4><ol class="adm-steps">' +
        '<li>Entre a <b>vercel.com</b> → su proyecto → pestaña <b>Storage</b>.</li>' +
        '<li>Pulse <b>Create Database</b> → elija <b>Blob</b> → acceso <b>Public</b> → <b>Create</b>.</li>' +
        '<li>Cuando pregunte, conéctelo a este proyecto (todos los entornos) → <b>Connect</b>.</li>' +
        '<li>Vaya a <b>Deployments</b> → menú «⋯» del último → <b>Redeploy</b>.</li>' +
        '<li>Recargue esta página e inicie sesión de nuevo: aquí aparecerá 🟢.</li></ol></div>'
      : '';
    body.innerHTML = vercelSetup +
      '<div class="adm-card"><h4>' + (server ? '🟢 Publicación conectada' + (platform === 'vercel' ? ' (Vercel)' : '') : '🟡 Modo navegador') + '</h4><p>' +
      (server ? 'Al pulsar «Publicar cambios», todos los visitantes verán la página actualizada' + (platform === 'vercel' ? ' en 1 a 2 minutos.' : ' de inmediato.')
        : 'Los cambios se guardan solo en este navegador. Para que los vean los visitantes, descargue el archivo <b>content.json</b> y súbalo a la carpeta del sitio.') +
      '</p>' + (server ? '<button type="button" class="adm-btn adm-btn--pri adm-btn--block" id="admPublish">Publicar cambios</button>' : '') +
      '<button type="button" class="adm-btn adm-btn--block ' + (server ? 'adm-btn--ghost' : 'adm-btn--pri') + '" id="admExport">Descargar content.json</button>' +
      '<label class="adm-btn adm-btn--ghost adm-btn--block">Importar content.json<input type="file" accept="application/json,.json" hidden id="admImport"></label></div>' +
      (platform === 'vercel'
        ? '<div class="adm-card"><h4>Cambiar clave de acceso</h4><p>En Vercel la clave se guarda de forma segura en el servidor: proyecto → <b>Settings</b> → <b>Environment Variables</b> → agregue <b>ADMIN_PASSWORD</b> con la nueva clave → <b>Save</b> → <b>Redeploy</b>.</p></div>'
        : '<div class="adm-card"><h4>Cambiar clave de acceso</h4><div class="adm-field"><input type="password" id="admNewPass" placeholder="Nueva clave (mín. 6 caracteres)" autocomplete="new-password"></div>' +
          '<button type="button" class="adm-btn adm-btn--ghost adm-btn--block" id="admSavePass">Guardar nueva clave</button></div>') +
      '<div class="adm-card adm-card--danger"><h4>Zona de cuidado</h4>' +
      '<button type="button" class="adm-btn adm-btn--ghost adm-btn--block" id="admDiscard">Descartar cambios no publicados</button>' +
      '<button type="button" class="adm-btn adm-btn--danger adm-btn--block" id="admReset">Restaurar contenido de ejemplo</button></div>';

    var pub = $('#admPublish'); if (pub) pub.onclick = publish;
    $('#admExport').onclick = function () {
      var blob = new Blob([JSON.stringify(C(), null, 2)], { type: 'application/json' });
      var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'content.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    $('#admImport').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) {
        var data = JSON.parse(t);
        if (!data.sections || !data.brand) throw new Error('Archivo no válido');
        window.Site.content = Object.assign(window.Site.defaults(), data);
        changed(); draw(); window.Site.toast('Contenido importado', 'ok');
      }).catch(function () { window.Site.toast('El archivo no es un content.json válido.', 'err'); });
    };
    if ($('#admSavePass')) $('#admSavePass').onclick = function () {
      var np = $('#admNewPass').value;
      if (np.length < 6) return window.Site.toast('La clave debe tener al menos 6 caracteres.', 'err');
      var done = function () { try { localStorage.setItem(PASS_KEY, np); } catch (e) { /* noop */ } pass = np; $('#admNewPass').value = ''; window.Site.toast('Clave actualizada', 'ok'); };
      if (!server) return done();
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'password', pass: pass, newPass: np }) })
        .then(function (r) { return r.json(); }).then(function (d) { if (d.ok) done(); else window.Site.toast(d.message || 'No se pudo cambiar la clave', 'err'); });
    };
    $('#admDiscard').onclick = function () {
      if (!confirm('Se perderán los cambios guardados en este navegador que no se hayan publicado. ¿Continuar?')) return;
      try { localStorage.removeItem(window.Site.STORE_KEY); } catch (e) { /* noop */ }
      location.reload();
    };
    $('#admReset').onclick = function () {
      if (!confirm('¿Restaurar todo el contenido de ejemplo? Esta acción reemplaza textos e imágenes.')) return;
      window.Site.content = window.Site.defaults(); changed(); draw();
    };
  }

  /* Las imágenes guardadas dentro del contenido (subidas sin servidor o
     importadas de BIOsoft) se suben primero como archivos, para que el
     contenido publicado quede liviano. */
  function externalizeImages(c, btn) {
    var refs = [];
    (function walk(o) {
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (typeof v === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(v)) refs.push({ o: o, k: k });
        else if (v && typeof v === 'object') walk(v);
      });
    })(c);
    return refs.reduce(function (p, ref, i) {
      return p.then(function () {
        btn.textContent = 'Subiendo imágenes ' + (i + 1) + '/' + refs.length + '…';
        return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'upload', pass: pass, name: 'imagen', data: ref.o[ref.k] }) })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.ok && d.url) ref.o[ref.k] = d.url; else throw new Error(d.message || 'No se pudo subir una imagen'); });
      });
    }, Promise.resolve());
  }

  function publish() {
    var btn = $('#admPublish'); btn.disabled = true; btn.textContent = 'Publicando…';
    var c = C();
    externalizeImages(c, btn)
      .then(function () {
        btn.textContent = 'Publicando…';
        c.meta.updated = Date.now();
        return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', pass: pass, content: c }) });
      })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) throw new Error(d.message || 'Error al publicar');
        window.Site.saveLocal(); window.Site.render();
        window.Site.toast(platform === 'vercel' ? '¡Publicado! Los visitantes lo verán en 1 a 2 minutos.' : '¡Cambios publicados!', 'ok'); setStatus('Publicado ' + new Date().toLocaleTimeString('es-CO'));
      })
      .catch(function (e) { window.Site.toast(e.message, 'err'); })
      .then(function () { btn.disabled = false; btn.textContent = 'Publicar cambios'; });
  }

  /* ---------- panel ---------- */
  var TABS = [['sections', 'Secciones'], ['brand', 'Marca y logo'], ['results', 'Resultados'], ['order', 'Orden'], ['publish', 'Publicar']];

  function draw() {
    var root = $('#admPanel'); if (!root) return;
    var scroll = $('.adm-body', root) ? $('.adm-body', root).scrollTop : 0;
    $$('.adm-tabs button', root).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === tab); });
    var body = $('.adm-body', root);
    ({ sections: renderSections, brand: renderBrand, results: renderResults, order: renderOrder, publish: renderPublish })[tab](body);
    body.scrollTop = scroll;
  }

  function mount() {
    D.body.classList.add('admin-on');
    var root = $('#adminRoot');
    root.innerHTML = '<aside class="adm" id="admPanel" aria-label="Panel administrativo">' +
      '<header class="adm-head"><div><strong>Panel administrativo</strong><small id="admStatus">' + (server ? 'Publicación conectada' : platform === 'vercel' ? 'Falta activar «Publicar» (ver pestaña Publicar)' : 'Modo navegador') + '</small></div>' +
      '<div class="adm-head__ctl"><button type="button" class="adm-icon-btn" id="admMin" title="Minimizar">–</button><button type="button" class="adm-icon-btn" id="admOut" title="Cerrar sesión">⏻</button></div></header>' +
      '<nav class="adm-tabs">' + TABS.map(function (t) { return '<button type="button" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav>' +
      '<div class="adm-body"></div>' +
      (server ? '<footer class="adm-foot"><button type="button" class="adm-btn adm-btn--pri adm-btn--block" id="admQuickPub">Publicar cambios</button></footer>' : '') +
      '</aside><button type="button" class="adm-fab" id="admFab" title="Abrir panel">✎ Editar página</button>';
    $$('.adm-tabs button').forEach(function (b) { b.onclick = function () { tab = b.getAttribute('data-tab'); draw(); }; });
    $('#admMin').onclick = function () { D.body.classList.add('admin-min'); };
    $('#admFab').onclick = function () { D.body.classList.remove('admin-min'); };
    $('#admOut').onclick = logout;
    var qp = $('#admQuickPub'); if (qp) qp.onclick = function () { tab = 'publish'; draw(); publish(); };
    draw();
    decorate();
  }

  /* botón «Editar» flotante sobre cada sección de la página */
  function decorate() {
    if (!D.body.classList.contains('admin-on')) return;
    $$('[data-sec]').forEach(function (sec) {
      if ($('.adm-edit', sec)) return;
      var k = sec.getAttribute('data-sec');
      var b = D.createElement('button');
      b.type = 'button'; b.className = 'adm-edit'; b.textContent = '✎ Editar ' + (SECTIONS[k] ? SECTIONS[k].name : '');
      b.onclick = function () { current = k; tab = 'sections'; openItem = -1; D.body.classList.remove('admin-min'); draw(); };
      sec.appendChild(b);
    });
  }
  D.addEventListener('site:rendered', decorate);

  function goTo(k) {
    var el = D.getElementById(k);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* noop */ }
    D.body.classList.remove('admin-on', 'admin-min');
    $('#adminRoot').innerHTML = '';
    $$('.adm-edit').forEach(function (b) { b.remove(); });
    if (location.hash === '#admin') history.replaceState(null, '', location.pathname);
  }

  /* ---------- acceso ---------- */
  function ping(url) {
    return fetch(url + '?ping=1', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }
  function checkServer() {
    return ping('api/admin').then(function (d) {
      if (d && d.platform === 'vercel') { API = 'api/admin'; platform = 'vercel'; server = !!d.ok; return; }
      return ping('api/save.php').then(function (d2) {
        API = 'api/save.php'; server = !!(d2 && d2.ok); platform = server ? 'php' : '';
      });
    });
  }

  function localPass() {
    try { return localStorage.getItem(PASS_KEY) || '123456'; } catch (e) { return '123456'; }
  }

  function login(p) {
    if (server || platform === 'vercel') {
      return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', pass: p }) })
        .then(function (r) { return r.json(); }).then(function (d) { return !!d.ok; }).catch(function () { return false; });
    }
    return Promise.resolve(p === localPass());
  }

  function open() {
    if (D.body.classList.contains('admin-on')) { D.body.classList.remove('admin-min'); return; }
    var root = $('#adminRoot');
    root.innerHTML = '<div class="adm-login" role="dialog" aria-modal="true" aria-label="Acceso administrativo"><form class="adm-login__card" id="admLogin">' +
      '<span class="adm-login__ico">' + icon('lock') + '</span><h3>Acceso administrativo</h3><p>Ingrese la clave para editar la página</p>' +
      '<input type="password" id="admPass" placeholder="Clave" autocomplete="current-password" inputmode="numeric" required>' +
      '<p class="adm-login__err" id="admErr"></p>' +
      '<button class="adm-btn adm-btn--pri adm-btn--block" type="submit">Entrar</button>' +
      '<button class="adm-btn adm-btn--ghost adm-btn--block" type="button" id="admCancel">Cancelar</button></form></div>';
    setTimeout(function () { $('#admPass').focus(); }, 50);
    $('#admCancel').onclick = function () { root.innerHTML = ''; };
    $('#admLogin').onsubmit = function (e) {
      e.preventDefault();
      var p = $('#admPass').value;
      checkServer().then(function () { return login(p); }).then(function (ok) {
        if (!ok) { $('#admErr').textContent = 'Clave incorrecta'; $('#admPass').select(); return; }
        pass = p;
        try { sessionStorage.setItem(SESSION_KEY, p); } catch (e2) { /* noop */ }
        mount();
      });
    };
  }

  D.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); open(); }
  });
  window.addEventListener('hashchange', function () { if (location.hash === '#admin') open(); });
  D.addEventListener('site:ready', function () {
    var saved = null;
    try { saved = sessionStorage.getItem(SESSION_KEY); } catch (e) { /* noop */ }
    if (saved) {
      checkServer().then(function () { return login(saved); }).then(function (ok) { if (ok) { pass = saved; mount(); } });
    } else if (location.hash === '#admin') open();
  });

  window.Admin = { open: open };
})();
