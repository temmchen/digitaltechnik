// pruefungsplan.js – Prüfungen nach Taxonomiestufen zusammenstellen (allgemein, ohne DOM)
//
// pool = die Aufgaben der gewählten Themen und Kapitel. Geplant wird nach den drei
// Taxonomiestufen (leicht, mittel, schwer); innerhalb einer Stufe mischt die Auswahl
// die Denkprozesse und verteilt die Aufgaben auf möglichst viele Kapitel.

import { zufall, mische, variante, mischeOptionen } from './varianten.js';
import { stufeVon } from './taxonomie.js';

/** Vorlagen: Anzahl der Aufgaben je Taxonomiestufe 1 (leicht), 2 (mittel), 3 (schwer). */
export const VORLAGEN = {
  kurz: { name: 'Kurztest', dauer: 20, plan: { 1: 3, 2: 4, 3: 1 } },
  standard: { name: 'Prüfung', dauer: 45, plan: { 1: 5, 2: 7, 3: 2 } },
  lang: { name: 'Große Prüfung', dauer: 90, plan: { 1: 7, 2: 11, 3: 4 } },
};

/** Wie viele Aufgaben gibt es je Stufe im Pool? */
export function verfuegbar(pool) {
  const v = { 1: 0, 2: 0, 3: 0 };
  pool.forEach((a) => { v[stufeVon(a.k)]++; });
  return v;
}

function ordnung(a) {
  return a.ordnung ?? a.nr;
}

const kapSchluessel = (a) => `${a.thema || ''}/${a.kap}`;

/**
 * Wählt `anzahl` Aufgaben aus den (gemischten) Kandidaten: bevorzugt Denkprozesse und
 * Kapitel, die in der Prüfung noch selten vorkommen.
 */
function waehle(kandidaten, anzahl, schonKapitel) {
  const rest = kandidaten.slice();
  const aus = [];
  const prozesse = {};
  while (aus.length < anzahl && rest.length) {
    let besterIndex = 0;
    let besteWertung = -Infinity;
    rest.forEach((a, i) => {
      const wertung = -2 * (prozesse[a.k] || 0) - (schonKapitel[kapSchluessel(a)] || 0);
      if (wertung > besteWertung) {
        besteWertung = wertung;
        besterIndex = i;
      }
    });
    const [a] = rest.splice(besterIndex, 1);
    aus.push(a);
    prozesse[a.k] = (prozesse[a.k] || 0) + 1;
    schonKapitel[kapSchluessel(a)] = (schonKapitel[kapSchluessel(a)] || 0) + 1;
  }
  return aus;
}

/**
 * Stellt eine Prüfung zusammen.
 * plan: {1: …, 2: …, 3: …}; neueZahlen: Rechenaufgaben mit neuen Zahlen;
 * startwert: macht Auswahl und Zahlen reproduzierbar.
 */
export function stellePruefungZusammen({ pool, plan = VORLAGEN.standard.plan, neueZahlen = true, startwert = 1 }) {
  const r = zufall(startwert);
  const gewaehlt = [];
  const fehlend = {};
  const schonKapitel = {};
  for (let s = 1; s <= 3; s++) {
    const anzahl = Number(plan[s] || 0);
    if (!anzahl) continue;
    const kandidaten = mische(pool.filter((a) => stufeVon(a.k) === s), r);
    const auswahl = waehle(kandidaten, anzahl, schonKapitel);
    if (auswahl.length < anzahl) fehlend[s] = anzahl - auswahl.length;
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

/** Tauscht eine Aufgabe gegen eine andere derselben Taxonomiestufe (möglichst gleicher Denkprozess, anderes Kapitel). */
export function ersetzeAufgabe(liste, index, { pool, neueZahlen = true, startwert = 1 }) {
  const r = zufall(startwert);
  const alt = liste[index];
  const belegt = new Set(liste.map((a) => a.schluessel || a.nr));
  const kandidaten = mische(pool.filter((a) => stufeVon(a.k) === stufeVon(alt.k) && !belegt.has(a.schluessel || a.nr)), r);
  let neu;
  if (!kandidaten.length) {
    neu = variante(alt.original || alt, r); // nichts frei: dieselbe Aufgabe mit neuen Zahlen
  } else {
    const gleich = kandidaten.filter((a) => a.k === alt.k);
    const auswahl = gleich.length ? gleich : kandidaten;
    const andere = auswahl.find((a) => a.kap !== alt.kap || a.thema !== alt.thema) || auswahl[0];
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

/** Punkte je Taxonomiestufe, Denkprozess und Kapitel (für die Taxonomie-Übersicht). */
export function verteilung(aufgaben) {
  const punkteJeStufe = { 1: 0, 2: 0, 3: 0 };
  const anzahlJeStufe = { 1: 0, 2: 0, 3: 0 };
  const anzahlJeProzess = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const punkteJeKapitel = {};
  aufgaben.forEach((a) => {
    const s = stufeVon(a.k);
    punkteJeStufe[s] += a.punkte;
    anzahlJeStufe[s]++;
    anzahlJeProzess[a.k]++;
    const schl = `${a.kuerzel || ''}${a.kuerzel ? ' ' : ''}${a.kap}`;
    punkteJeKapitel[schl] = (punkteJeKapitel[schl] || 0) + a.punkte;
  });
  return { punkteJeStufe, anzahlJeStufe, anzahlJeProzess, punkteJeKapitel, summe: summePunkte(aufgaben) };
}
