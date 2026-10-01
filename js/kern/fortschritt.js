// fortschritt.js – Lernstand der Schülerin / des Schülers (nur in diesem Browser gespeichert)
//
// Je Aufgabe (Schlüssel wie „ZS-37“): s = bester Status, v = Versuche,
// e = beim ersten Versuch richtig, l = Lösung angesehen, t = Zeitpunkt.

import { lies, schreibe } from './speicher.js';
import { stufeVon } from './taxonomie.js';

const SCHLUESSEL = 'fortschritt';
let daten = null;

function alle() {
  if (!daten) daten = lies(SCHLUESSEL, {}) || {};
  return daten;
}

function sichern() {
  schreibe(SCHLUESSEL, daten);
}

const RANG = { falsch: 1, teilweise: 2, richtig: 3 };

export function eintrag(schluessel) {
  return alle()[schluessel] || null;
}

/** Anzeigestatus: offen · falsch · teilweise · richtig · gesehen (Lösung angesehen, nicht gelöst). */
export function anzeigeStatus(schluessel) {
  const e = eintrag(schluessel);
  if (!e) return 'offen';
  if (e.s === 'richtig') return 'richtig';
  if (e.l) return 'gesehen';
  return e.s || 'offen';
}

export function vermerkeVersuch(schluessel, status) {
  const d = alle();
  const e = d[schluessel] || { v: 0 };
  e.v = (e.v || 0) + 1;
  if (e.v === 1) e.e = status === 'richtig';
  if (!e.s || RANG[status] > RANG[e.s]) e.s = status;
  e.t = Date.now();
  d[schluessel] = e;
  sichern();
  return e;
}

export function vermerkeLoesung(schluessel) {
  const d = alle();
  const e = d[schluessel] || { v: 0 };
  e.l = true;
  e.t = Date.now();
  d[schluessel] = e;
  sichern();
}

export function versuche(schluessel) {
  return eintrag(schluessel)?.v || 0;
}

/** Zählt für eine Aufgabenliste: richtig, teilweise, falsch, gesehen, offen; dazu je Stufe und Kapitel. */
export function statistik(aufgaben) {
  const s = { richtig: 0, teilweise: 0, falsch: 0, gesehen: 0, offen: 0, gesamt: aufgaben.length, ersterVersuch: 0, jeStufe: {}, jeKapitel: {} };
  for (let k = 1; k <= 3; k++) s.jeStufe[k] = { richtig: 0, gesamt: 0 };
  for (const a of aufgaben) {
    const st = anzeigeStatus(a.schluessel);
    s[st]++;
    if (eintrag(a.schluessel)?.e) s.ersterVersuch++;
    const stufe = stufeVon(a.k);
    s.jeStufe[stufe].gesamt++;
    if (st === 'richtig') s.jeStufe[stufe].richtig++;
    const kap = (s.jeKapitel[a.kap] ||= { richtig: 0, gesamt: 0, bearbeitet: 0 });
    kap.gesamt++;
    if (st === 'richtig') kap.richtig++;
    if (st !== 'offen') kap.bearbeitet++;
  }
  return s;
}

/** Löscht den Lernstand (alle Aufgaben oder nur die eines Themas). */
export function zuruecksetzen(kuerzel = null) {
  const d = alle();
  for (const k of Object.keys(d)) {
    if (!kuerzel || k.startsWith(kuerzel + '-')) delete d[k];
  }
  sichern();
}
