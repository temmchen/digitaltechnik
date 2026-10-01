// speicher.js – Browser-Speicher mit Namensraum (alle Seiten auf temmchen.github.io teilen sich einen Speicher)
//
// Jeder Zugriff ist abgesichert: Im privaten Modus oder bei gesperrtem Speicher
// funktioniert die Seite trotzdem – nur ohne Gedächtnis.

const PRAEFIX = 'digitaltechnik.';

function speicher(art) {
  try {
    return art === 'sitzung' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function lies(schluessel, standard = null, art = 'lokal') {
  try {
    const s = speicher(art)?.getItem(PRAEFIX + schluessel);
    return s ? JSON.parse(s) : standard;
  } catch {
    return standard;
  }
}

export function schreibe(schluessel, wert, art = 'lokal') {
  try {
    speicher(art)?.setItem(PRAEFIX + schluessel, JSON.stringify(wert));
    return true;
  } catch {
    return false;
  }
}

export function entferne(schluessel, art = 'lokal') {
  try {
    speicher(art)?.removeItem(PRAEFIX + schluessel);
  } catch {
    /* nichts zu tun */
  }
}
