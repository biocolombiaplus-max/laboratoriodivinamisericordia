/* Ajustes de contenido para Venezuela. Se aplican a cualquier contenido al
   cargarlo (ejemplo, publicado o guardado en el navegador), así que textos
   antiguos nunca vuelven a aparecer aunque se publiquen desde un navegador
   con una copia vieja. Es idempotente: aplicarlo varias veces no cambia nada. */
(function (root) {
  'use strict';

  var TEXT = [
    [/Bacteri[óo]log[oa]s/g, 'Bioanalistas'], [/bacteri[óo]log[oa]s/g, 'bioanalistas'],
    [/Bacteri[óo]log[oa]/g, 'Bioanalista'], [/bacteri[óo]log[oa]/g, 'bioanalista'],
    [/Habilitados ante la Secretaría de Salud/g, 'Registrados ante el Ministerio del Poder Popular para la Salud'],
    [/(,\s*)Colombia\b/g, '$1Venezuela']
  ];
  var OLD_COP = { '$ 89.000': '25', '$ 189.000': '55', '$ 299.000': '85' };
  var NEW_PARTNERS = [
    { name: 'Seguros HCM', logo: '' }, { name: 'Pólizas de salud', logo: '' },
    { name: 'Empresas aliadas', logo: '' }, { name: 'Centros médicos', logo: '' },
    { name: 'Convenios corporativos', logo: '' }
  ];

  function fixStrings(o) {
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string') {
        if (/^(data:|https?:|uploads\/)/.test(v)) return; // imágenes y enlaces
        TEXT.forEach(function (r) { v = v.replace(r[0], r[1]); });
        o[k] = v;
      } else if (v && typeof v === 'object') fixStrings(v);
    });
  }

  function migrate(c) {
    if (!c || !c.sections) return c;
    fixStrings(c.sections);
    if (c.brand && typeof c.brand.address === 'string') fixStrings({ a: c.brand }); // dirección

    var S = c.sections;
    // Convenios: sin EPS / IPS / medicina prepagada (términos de Colombia)
    if (S.partners && Array.isArray(S.partners.items)) {
      var items = S.partners.items.filter(function (it) { return !/\b(EPS|IPS)\b/.test(it.name || ''); })
        .map(function (it) { return /prepagada/i.test(it.name || '') ? { name: 'Seguros HCM', logo: it.logo || '' } : it; });
      var onlyDefaults = items.every(function (it) { return !it.logo && /^(Seguros HCM|Pólizas de [Ss]alud|Empresas)$/.test(it.name); });
      S.partners.items = onlyDefaults && items.length < 5 ? NEW_PARTNERS.slice() : items;
    }
    // Preguntas frecuentes
    if (S.faq && Array.isArray(S.faq.items)) S.faq.items.forEach(function (it) {
      if (/\bEPS\b|prepagada/i.test(it.q || '')) {
        it.q = '¿Trabajan con seguros o empresas?';
        it.a = 'Sí, tenemos convenios con aseguradoras (HCM) y empresas. Consúltenos para verificar su cobertura.';
      }
    });
    // Precios: bolívares (calculados con la tasa del día o escritos a mano) + dólares
    if (S.packages && Array.isArray(S.packages.items)) {
      if (S.packages.rate === undefined) S.packages.rate = '';
      S.packages.items.forEach(function (it) {
        if (it.priceUsd !== undefined) return;
        if (OLD_COP[String(it.price || '').trim()]) { it.priceUsd = OLD_COP[String(it.price).trim()]; it.price = ''; }
        else it.priceUsd = '';
      });
    }
    return c;
  }

  root.migrateContent = migrate;
  if (typeof module !== 'undefined') module.exports = migrate;
})(typeof window !== 'undefined' ? window : globalThis);
