// icons.js – schlichte Strich-Symbole (eigene Zeichnung, 24 × 24, currentColor)

const PFADE = {
  start: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  lernen: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  ueben: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
  pruefung: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>',
  schloss: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  offen: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>',
  qr: '<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2.5v2.5h-2.5zM20.5 14.5v.01M14.5 20.5h.01M18 18h2.5v2.5H18z"/>',
  sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  mond: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  tipp: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  achtung: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.01"/>',
  merke: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  beispiel: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
  technik: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  rechner: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 6.5h8v3.5H8zM8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17.5h.01M12 17.5h.01M15.5 17.5h.01"/>',
  haken: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  kreuz: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  drucken: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v6.5H7z"/>',
  neu: '<path d="M20 11.5a8 8 0 1 0-2.4 5.7"/><path d="M20.5 4.5V11H14"/>',
  pfeil: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  uhr: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  auge: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  stufen: '<path d="M3.5 20h4v-4h4v-4h4V8h4V4"/>',
  abmelden: '<path d="M14 4h5v16h-5"/><path d="m10 8-4 4 4 4M6 12h10"/>',
  zufall: '<path d="M4 7h3c5 0 5 10 10 10h3M4 17h3c2 0 3-1.4 4-3.1M13.5 9.6C14.5 8 15.6 7 17 7h3"/><path d="m18 4 3 3-3 3M18 14l3 3-3 3"/>',
  schritt: '<path d="M6 5v14l10-7z"/><path d="M18 5v14"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  zurueck: '<path d="m15 6-6 6 6 6"/>',
  vor: '<path d="m9 6 6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.8v.01"/>',
  liste: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  ziel: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".6"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.3-5.7"/><path d="M3.5 4.5V10H9"/>',
  vollbild: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  schalter: '<rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
  menue: '<path d="M4 7h16M4 12h16M4 17h16"/>',
};

export function icon(name, klasse = '') {
  const p = PFADE[name] || PFADE.info;
  return `<svg class="ic${klasse ? ' ' + klasse : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}
