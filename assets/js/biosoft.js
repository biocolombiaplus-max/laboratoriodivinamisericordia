/* =========================================================================
   Conexión con BIOsoft (software de laboratorio) vía API REST de Firestore.
   Usa solo las colecciones PÚBLICAS que BIOsoft ya expone para la página web
   de cada laboratorio (ver biosoft/firestore.rules en el repo bioauditoria):
   - resultadosPublicos/{codigo}: un resultado por código de consulta
     (solo lectura puntual por id, nunca listado). El documento del paciente
     se valida aquí antes de mostrar nada.
   - demoSitioWeb/{tenantId}: marca y contenido de la página del laboratorio.
   La configuración web de Firebase no es secreta: la seguridad la dan las
   reglas de Firestore.
   ========================================================================= */
(function () {
  'use strict';

  var PROJECT = 'biosoft-produccion';
  var KEY = 'AIzaSyD3GrNA36sy4iCszTuPN5Ol2H3KTNbyUQM';
  var BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';

  /* Convierte un valor tipado de Firestore REST a JS plano */
  function val(v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('timestampValue' in v) return v.timestampValue;
    if ('nullValue' in v) return null;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(val);
    if ('mapValue' in v) return fields(v.mapValue.fields);
    return null;
  }
  function fields(f) {
    var o = {};
    Object.keys(f || {}).forEach(function (k) { o[k] = val(f[k]); });
    return o;
  }

  function getDoc(path) {
    return fetch(BASE + '/' + path + '?key=' + KEY, { cache: 'no-store' }).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) { var e = new Error('http_' + r.status); e.status = r.status; throw e; }
      return r.json().then(function (d) { return fields(d.fields); });
    });
  }

  /* Acepta el ID («lab-xxxx») o el enlace completo de la Página Web de
     BIOsoft (…/sitio-web.html?t=lab-xxxx) y devuelve solo el ID. */
  function tenantId(v) {
    v = String(v || '').trim();
    var m = v.match(/[?&]t=([^&#\s]+)/);
    if (m) v = decodeURIComponent(m[1]);
    return /^[A-Za-z0-9_-]{3,80}$/.test(v) ? v : '';
  }

  function normDoc(v) { return String(v || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase(); }
  /* «V-12.345.678», «v12345678» y «12345678» son el mismo documento */
  function sameDoc(a, b) {
    a = normDoc(a); b = normDoc(b);
    var strip = function (x) { return x.replace(/^[VEPJG](?=\d)/, ''); };
    return !!a && (a === b || strip(a) === strip(b));
  }

  /* Devuelve el resultado si el código existe Y el documento coincide;
     null en cualquier otro caso (sin revelar cuál de los dos falló). */
  function getResult(codigo, documento, tenant) {
    var tid = tenantId(tenant);
    var cod = String(codigo || '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,40}$/.test(cod)) return Promise.resolve(null);
    return getDoc('resultadosPublicos/' + encodeURIComponent(cod)).then(function (d) {
      if (!d || !sameDoc(d.numeroDocumento, documento)) return null;
      if (tid && d.tenantId && d.tenantId !== tid) return null;
      d.codigo = cod;
      return d;
    });
  }

  /* PDF de otra orden del historial del mismo paciente (lectura puntual) */
  function getPdf(codigo) {
    return getDoc('resultadosPublicos/' + encodeURIComponent(String(codigo).toUpperCase()))
      .then(function (d) { return d && d.pdfDataUrl ? d.pdfDataUrl : null; });
  }

  function findTenantByDomain(host) {
    host = String(host || '').replace(/^www\./, '');
    if (!host) return Promise.resolve(null);
    return fetch(BASE + ':runQuery?key=' + KEY, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: 'demoSitioWeb' }],
        where: { fieldFilter: { field: { fieldPath: 'dominio' }, op: 'EQUAL', value: { stringValue: host } } },
        limit: 1
      } })
    }).then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        var doc = (rows || []).filter(function (x) { return x.document; })[0];
        return doc ? doc.document.name.split('/').pop() : null;
      });
  }

  function getSite(tenant) {
    var tid = tenantId(tenant);
    if (!tid) return Promise.resolve(null);
    return getDoc('demoSitioWeb/' + encodeURIComponent(tid));
  }

  /* Convierte un dataURL de PDF en un blob: URL (los navegadores bloquean
     abrir data: directamente en pestañas nuevas). */
  function pdfBlobUrl(dataUrl) {
    var b64 = String(dataUrl).split(',')[1] || '';
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: 'application/pdf' }));
  }

  window.BIOSOFT = {
    getResult: getResult, getPdf: getPdf, getSite: getSite, tenantId: tenantId,
    findTenantByDomain: findTenantByDomain, pdfBlobUrl: pdfBlobUrl
  };
})();
