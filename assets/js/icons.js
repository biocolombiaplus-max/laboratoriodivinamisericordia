/* Iconos SVG en línea (trazo). Se usan en servicios, calidad y resultados. */
window.ICONS = {
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M7 15h10"/>',
  microscope: '<path d="M6 18h8M3 22h18M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  drop: '<path d="M12 2.7s-6.5 7.2-6.5 12A6.5 6.5 0 0 0 12 21.2a6.5 6.5 0 0 0 6.5-6.5c0-4.8-6.5-12-6.5-12Z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M3.2 12H8l1.5-3 3 6 1.5-3h6.8"/>',
  dna: '<path d="M2 15c6.7-6 13.3 0 20-6M2 9c6.7 6 13.3 0 20 6"/><path d="M5 10.5v3M9 8.5v7M15 8.5v7M19 10.5v3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M12 11v6M9 14h6"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
  virus: '<circle cx="12" cy="12" r="5"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M5 19l3.5-3.5M15.5 8.5 19 5"/>',
  baby: '<circle cx="12" cy="7" r="4"/><path d="M9 7h.01M15 7h.01M10 9a3 3 0 0 0 4 0"/><path d="M6 21v-3a6 6 0 0 1 12 0v3"/>',
  pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  map: '<path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h4M14 14h4"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  route: '<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/>'
};
window.icon = function (name, cls) {
  var p = window.ICONS[name] || window.ICONS.flask;
  return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
};
