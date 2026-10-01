// varianten.js – Zufall mit Startwert und „neue Zahlen“ (allgemein für alle Themen)
//
// Eine Aufgabe kann eine Methode erzeugeVariante(r) mitbringen (siehe Thema-Bausteine).
// variante() ruft sie auf und übernimmt Kapitel, Denkprozess, Niveau, Punkte und Nummer.

/** Reproduzierbarer Zufallsgenerator (mulberry32). Gleicher Startwert → gleiche Folge. */
export function zufall(startwert) {
  let a = startwert >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ganz(r, min, max) {
  return min + Math.floor(r() * (max - min + 1));
}

export function mische(liste, r) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Zufälliger vierstelliger Startwert (für neue Prüfungen). */
export function neuerStartwert() {
  return 1000 + Math.floor(Math.random() * 9000);
}

/** Hat die Aufgabe einen Zahlengenerator? */
export function hatVarianten(aufgabe) {
  return typeof aufgabe.erzeugeVariante === 'function';
}

const BEHALTEN = ['kap', 'k', 'niveau', 'punkte', 'nr', 'id', 'thema', 'kuerzel', 'schluessel', 'ordnung'];

/** Neue Zahlen für eine Aufgabe; Aufgaben ohne Generator kommen unverändert zurück. */
export function variante(aufgabe, r) {
  if (!hatVarianten(aufgabe)) return aufgabe;
  const neu = aufgabe.erzeugeVariante(r);
  if (!neu) return aufgabe;
  const v = { ...neu, variante: true, original: aufgabe.original || aufgabe };
  for (const k of BEHALTEN) v[k] = aufgabe[k];
  return v;
}

/** Antwortreihenfolge einer Einfachauswahl mischen (z. B. für Gruppe B einer Prüfung). */
export function mischeOptionen(aufgabe, r) {
  if (!aufgabe.felder.some((f) => f.art === 'wahl')) return aufgabe;
  const felder = aufgabe.felder.map((f) => {
    if (f.art !== 'wahl') return f;
    const reihenfolge = mische(f.optionen.map((_, i) => i), r);
    return { ...f, optionen: reihenfolge.map((i) => f.optionen[i]), loesung: reihenfolge.indexOf(f.loesung) };
  });
  return { ...aufgabe, felder };
}
