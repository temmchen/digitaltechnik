// app.js – Rahmen der Seite: Navigation, Router, Hell/Dunkel, Schriftgröße, QR-Code

import { icon } from './kern/icons.js';
import { lies, schreibe } from './kern/speicher.js';
import { istLehrer } from './kern/lehrer.js';
import { start } from './ansichten/start.js';
import { lernenUebersicht, themaLektionen, lektion } from './ansichten/lernen.js';
import { ueben } from './ansichten/ueben.js';
import { pruefung } from './ansichten/pruefung.js';
import { lehrer } from './ansichten/lehrer.js';
import { merkhilfe } from './ansichten/merkhilfe.js';
import { QR_ZEILEN, QR_ADRESSE } from './qr.js';

export const VERSION = '1.0.0';

const NAV = [
  ['start', 'Start', 'start', '#/'],
  ['lernen', 'Lernen', 'lernen', '#/lernen'],
  ['ueben', 'Üben', 'ueben', '#/ueben'],
  ['pruefung', 'Prüfung', 'pruefung', '#/pruefung'],
  ['lehrer', 'Lehrer', 'schloss', '#/lehrer'],
];

const wurzel = document.documentElement;
let aufraeumen = null;

/* ----------------------------- Navigation ----------------------------- */

function baueNavigation() {
  const nav = document.querySelector('.hauptnav');
  nav.innerHTML = NAV.map(([id, text, sym, href]) => `<a href="${href}" data-nav="${id}">${icon(id === 'lehrer' && istLehrer() ? 'offen' : sym)}<span>${text}</span></a>`).join('');
}

function markiereNav(seite) {
  document.querySelectorAll('.hauptnav a').forEach((a) => {
    const aktiv = a.dataset.nav === seite;
    a.classList.toggle('aktiv', aktiv);
    if (aktiv) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  wurzel.classList.toggle('lehrermodus', istLehrer());
}

/* ----------------------------- Router ----------------------------- */

function leseAdresse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [pfad, query = ''] = h.split('?');
  return { teile: pfad.split('/').filter(Boolean).map(decodeURIComponent), params: Object.fromEntries(new URLSearchParams(query)) };
}

function nichtGefunden(main) {
  document.title = 'Nicht gefunden · Digitaltechnik';
  main.innerHTML = '<header class="seitenkopf"><h1>Seite nicht gefunden</h1><p class="lead">Diese Adresse gibt es nicht (mehr).</p></header><a class="btn primaer" href="#/">Zur Startseite</a>';
}

function zeige() {
  const { teile, params } = leseAdresse();
  const main = document.getElementById('inhalt');
  const seite = teile[0] || 'start';
  if (aufraeumen) {
    try { aufraeumen(); } catch { /* egal */ }
    aufraeumen = null;
  }
  let ergebnis;
  try {
    switch (seite) {
      case 'start': ergebnis = start(main); break;
      case 'lernen':
        if (teile[2]) ergebnis = lektion(main, teile[1], Number(teile[2]));
        else if (teile[1]) ergebnis = themaLektionen(main, teile[1]);
        else ergebnis = lernenUebersicht(main);
        break;
      case 'ueben': ergebnis = ueben(main, { thema: teile[1], nr: teile[2] ? Number(teile[2]) : null, params }); break;
      case 'pruefung': ergebnis = pruefung(main, params); break;
      case 'lehrer': ergebnis = lehrer(main, teile[1]); break;
      case 'merkhilfe': ergebnis = merkhilfe(main, teile[1]); break;
      default: nichtGefunden(main);
    }
  } catch (err) {
    console.error(err);
    main.innerHTML = `<header class="seitenkopf"><h1>Hoppla</h1><p class="lead">Beim Anzeigen ist ein Fehler aufgetreten. Bitte lade die Seite neu.</p></header><pre class="fehlertext">${String(err && err.message ? err.message : err).replace(/</g, '&lt;')}</pre>`;
  }
  if (typeof ergebnis === 'function') aufraeumen = ergebnis;
  markiereNav(seite);
  if (!(seite === 'ueben' && teile[2])) window.scrollTo(0, 0);
}

/* ----------------------------- Hell / Dunkel ----------------------------- */

function aktuellesThema() {
  return wurzel.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function zeichneWerkzeuge() {
  const dunkel = aktuellesThema() === 'dark';
  const k = document.querySelector('[data-werkzeug="thema"]');
  k.innerHTML = icon(dunkel ? 'sonne' : 'mond');
  k.title = dunkel ? 'Helle Darstellung' : 'Dunkle Darstellung';
  k.setAttribute('aria-label', k.title);
  const s = document.querySelector('[data-werkzeug="schrift"]');
  const stufe = wurzel.dataset.schrift || 'normal';
  s.title = `Schriftgröße: ${{ normal: 'normal', gross: 'groß', beamer: 'Beamer' }[stufe]} (antippen zum Wechseln)`;
  s.setAttribute('aria-label', s.title);
  s.dataset.stufe = stufe;
}

function wechsleThema() {
  const neu = aktuellesThema() === 'dark' ? 'light' : 'dark';
  wurzel.dataset.theme = neu;
  schreibe('thema', neu);
  zeichneWerkzeuge();
}

function wechsleSchrift() {
  const folge = ['normal', 'gross', 'beamer'];
  const jetzt = wurzel.dataset.schrift || 'normal';
  const neu = folge[(folge.indexOf(jetzt) + 1) % folge.length];
  if (neu === 'normal') delete wurzel.dataset.schrift;
  else wurzel.dataset.schrift = neu;
  schreibe('schrift', neu);
  zeichneWerkzeuge();
}

/* ----------------------------- QR-Code ----------------------------- */

function qrSVG() {
  const n = QR_ZEILEN.length;
  const rand = 4;
  let pfad = '';
  QR_ZEILEN.forEach((zeile, y) => {
    for (let x = 0; x < n; x++) if (zeile[x] === '1') pfad += `M${x + rand} ${y + rand}h1v1h-1z`;
  });
  const g = n + 2 * rand;
  return `<svg viewBox="0 0 ${g} ${g}" shape-rendering="crispEdges" role="img" aria-label="QR-Code: ${QR_ADRESSE}"><rect width="${g}" height="${g}" fill="#fff"/><path d="${pfad}" fill="#000"/></svg>`;
}

function zeigeQR(an = null) {
  const o = document.querySelector('.qr-ueberlagerung');
  const sichtbar = an === null ? o.hidden : an;
  o.hidden = !sichtbar;
  if (sichtbar) {
    if (!o.dataset.bereit) {
      o.querySelector('.qr-bild').innerHTML = qrSVG();
      o.dataset.bereit = '1';
    }
    o.querySelector('.qr-schliessen').focus();
  }
}

/* ----------------------------- Start ----------------------------- */

function init() {
  const params = new URLSearchParams(location.search);
  const schrift = params.get('beamer') === '1' ? 'beamer' : lies('schrift', 'normal');
  if (schrift && schrift !== 'normal') wurzel.dataset.schrift = schrift;
  const thema = lies('thema', null);
  if (thema) wurzel.dataset.theme = thema;

  document.querySelector('.fuss-version').textContent = `Version ${VERSION}`;
  baueNavigation();
  zeichneWerkzeuge();

  document.querySelector('.werkzeuge').addEventListener('click', (e) => {
    const w = e.target.closest('[data-werkzeug]')?.dataset.werkzeug;
    if (w === 'thema') wechsleThema();
    if (w === 'schrift') wechsleSchrift();
    if (w === 'qr') zeigeQR(true);
  });
  const ueberlagerung = document.querySelector('.qr-ueberlagerung');
  ueberlagerung.addEventListener('click', (e) => {
    if (e.target === ueberlagerung || e.target.closest('.qr-schliessen')) zeigeQR(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !ueberlagerung.hidden) zeigeQR(false);
    const tippen = e.target.closest('input, textarea, select, [contenteditable]');
    if (!tippen && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === 'q' || e.key === 'Q')) zeigeQR();
  });
  document.addEventListener('qr-zeigen', () => zeigeQR(true));
  document.addEventListener('lehrer-geaendert', () => {
    baueNavigation();
    markiereNav(leseAdresse().teile[0] || 'start');
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', zeichneWerkzeuge);
  window.addEventListener('hashchange', zeige);
  zeige();
}

init();
