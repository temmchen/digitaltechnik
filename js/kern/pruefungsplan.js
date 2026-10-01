// pruefungsplan.js – Prüfungen nach Taxonomiestufen zusammenstellen (allgemein, ohne DOM)
//
// pool = die Aufgaben der gewählten Themen und Kapitel (Aufgaben mit Feld `ordnung`).

import { zufall, mische, variante, mischeOptionen } from './varianten.js';

/** Vorlagen: Anzahl der Aufgaben je Taxonomiestufe K1 … K6. */
export const VORLAGEN = {
  kurz: { name: 'Kurztest', dauer: 20, plan: { 1: 1, 2: 1, 3: 4, 4: 1, 5: 1, 6: 0 } },
  standard: { name: 'Prüfung', dauer: 45, plan: { 1: 2, 2: 2, 3: 6, 4: 2, 5: 1, 6: 1 } },
  lang: { name: 'Große Prüfung', dauer: 90, plan: { 1: 3, 2: 3, 3: 10, 4: 3, 5: 2, 6: 1 } },
};

/** Wie viele Aufgaben gibt es je Stufe im Pool? */
export function verfuegbar(pool) {
  const v = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  pool.forEach((a) => { v[a.k]++; });
  return v;
}

function ordnung(a) {
  return a.ordnung ?? a.nr;
}

/** Wählt `anzahl` Aufgaben so, dass möglichst viele Kapitel vorkommen. */
function verteile(kandidaten, anzahl) {
  const nachKapitel = new Map();
  kandidaten.forEach((a) => {
    const schl = `${a.thema || ''}/${a.kap}`;
    if (!nachKapitel.has(schl)) nachKapitel.set(schl, []);
    nachKapitel.get(schl).push(a);
  });
  const stapel = [...nachKapitel.values()];
  const aus = [];
  while (aus.length < anzahl && stapel.some((s) => s.length)) {
    for (const s of stapel) {
      if (aus.length >= anzahl) break;
      if (s.length) aus.push(s.shift());
    }
  }
  return aus;
}

/**
 * Stellt eine Prüfung zusammen.
 * plan: {1:2, 2:2, …}; neueZahlen: Rechenaufgaben mit neuen Zahlen;
 * startwert: macht Auswahl und Zahlen reproduzierbar.
 */
export function stellePruefungZusammen({ pool, plan = VORLAGEN.standard.plan, neueZahlen = true, startwert = 1 }) {
  const r = zufall(startwert);
  const gewaehlt = [];
  const fehlend = {};
  for (let k = 1; k <= 6; k++) {
    const anzahl = Number(plan[k] || 0);
    if (!anzahl) continue;
    const kandidaten = mische(pool.filter((a) => a.k === k), r);
    const auswahl = verteile(kandidaten, anzahl);
    if (auswahl.length < anzahl) fehlend[k] = anzahl - auswahl.length;
    gewaehlt.push(...auswahl);
  }
  gewaehlt.sort((x, y) => ordnung(x) - ordnung(y));
  const aufgaben = gewaehlt.map((a) => (neueZahlen ? variante(a, r) : a));
  return { aufgaben, fehlend, punkte: summePunkte(aufgaben), startwert };
}

/** Gruppe B: dieselben Aufgaben, neue Zahlen und gemischte Antwortreihenfolge. */
export function parallelGruppe(aufgaben, startwert) {
  const r = zufall(startwert);
  return aufgaben.map((a) => mischeOptionen(variante(a.original || a, r), r));
}

/** Tauscht eine Aufgabe gegen eine andere derselben Taxonomiestufe (möglichst anderes Kapitel). */
export function ersetzeAufgabe(liste, index, { pool, neueZahlen = true, startwert = 1 }) {
  const r = zufall(startwert);
  const alt = liste[index];
  const belegt = new Set(liste.map((a) => a.schluessel || a.nr));
  const kandidaten = mische(pool.filter((a) => a.k === alt.k && !belegt.has(a.schluessel || a.nr)), r);
  let neu;
  if (!kandidaten.length) {
    neu = variante(alt.original || alt, r); // nichts frei: dieselbe Aufgabe mit neuen Zahlen
  } else {
    const andere = kandidaten.find((a) => a.kap !== alt.kap || a.thema !== alt.thema) || kandidaten[0];
    neu = neueZahlen ? variante(andere, r) : andere;
  }
  const kopie = liste.slice();
  kopie[index] = neu;
  kopie.sort((x, y) => ordnung(x) - ordnung(y));
  return kopie;
}

export function summePunkte(aufgaben) {
  return aufgaben.reduce((s, a) => s + a.punkte, 0);
}

/** Punkte je Taxonomiestufe und Kapitel (für die Taxonomie-Übersicht der Lehrkraft). */
export function verteilung(aufgaben) {
  const k = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const anzahl = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const kap = {};
  aufgaben.forEach((a) => {
    k[a.k] += a.punkte;
    anzahl[a.k]++;
    const schl = `${a.kuerzel || ''}${a.kuerzel ? ' ' : ''}${a.kap}`;
    kap[schl] = (kap[schl] || 0) + a.punkte;
  });
  return { punkteJeStufe: k, anzahlJeStufe: anzahl, punkteJeKapitel: kap, summe: summePunkte(aufgaben) };
}
