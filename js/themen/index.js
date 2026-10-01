// index.js – alle Themen des Kompendiums Digitaltechnik
//
// Neues Thema: Ordner js/themen/<id>/ mit thema.js (Vorlage: zahlensysteme/thema.js)
// anlegen und unten in THEMEN eintragen. Alles andere (Start, Lernen, Üben, Prüfung,
// Lehrerbereich, Lösungsschlüssel) liest die Themen aus dieser Liste.

import zahlensysteme from './zahlensysteme/thema.js';

export const THEMEN = [zahlensysteme];

let ordnung = 0;
for (const t of THEMEN) {
  for (const a of t.aufgaben) {
    a.thema = t.id;
    a.kuerzel = t.kuerzel;
    a.schluessel = `${t.kuerzel}-${a.nr}`;
    a.ordnung = ++ordnung;
  }
}

export const ALLE_AUFGABEN = THEMEN.flatMap((t) => t.aufgaben);

export const WIDGETS = Object.assign({}, ...THEMEN.map((t) => t.widgets || {}));

export function themaNachId(id) {
  return THEMEN.find((t) => t.id === id) || null;
}

export function aufgabeNachSchluessel(schluessel) {
  return ALLE_AUFGABEN.find((a) => a.schluessel === schluessel) || null;
}

export function kapitelVon(aufgabe) {
  const t = themaNachId(aufgabe.thema);
  return t ? t.kapitel.find((k) => k.id === aufgabe.kap) : null;
}

/** Aufgaben der gewählten Kapitel, z. B. auswahl = { zahlensysteme: ['A','B'] }. */
export function pool(auswahl) {
  return ALLE_AUFGABEN.filter((a) => auswahl[a.thema] && auswahl[a.thema].includes(a.kap));
}
