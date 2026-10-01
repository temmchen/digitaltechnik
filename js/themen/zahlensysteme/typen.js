// typen.js – Aufgabenbausteine des Themas Zahlensysteme: Umwandlung, Addition, Subtraktion
//
// Jeder Baustein berechnet Ergebnis, Tipp und Rechenweg selbst und bringt mit
// erzeugeVariante(r) einen Generator für „neue Zahlen“ mit.

import {
  ZIFFERN, nachBasis, auffuellen, wegStellenwert, wegDivisionsrest, wegZweierpotenzen,
  wegHexZuDual, wegDualZuHex, wegAddition, wegSubtraktion,
} from '../../kern/zahlen.js';
import {
  z, dez, htmlStellenwert, htmlDivisionsrest, htmlZweierpotenzen, htmlHexZuDual, htmlDualZuHex,
  htmlAddition, htmlAdditionErklaerung, htmlSubtraktion, htmlSubtraktionErklaerung,
  htmlProbeSubtraktion, htmlDezimalProbe,
} from '../../kern/darstellung.js';
import { zahlFeld, nummeriere } from '../../kern/felder.js';
import { ganz } from '../../kern/varianten.js';

export const ZAHLWORT = { 2: 'Dualzahl', 10: 'Dezimalzahl', 16: 'Hexadezimalzahl' };
export const SYSTEMWORT = { 2: 'Dual', 10: 'Dezimal', 16: 'Hexadezimal' };

const TIPP_UMWANDLUNG = {
  '2>10': 'Schreibe die Stellenwerte 1, 2, 4, 8, 16 … von rechts nach links über die Bits. Addiere die Stellenwerte, unter denen eine 1 steht.',
  '10>2': 'Teile fortgesetzt durch 2 und notiere jeden Rest, bis der Quotient 0 ist. Lies die Reste von unten nach oben. (Alternative: größte passende Zweierpotenz abziehen.)',
  '16>10': 'Multipliziere jede Ziffer mit ihrem Stellenwert 1, 16, 256, 4096 … und addiere. Buchstaben zuerst umrechnen: A = 10 … F = 15.',
  '10>16': 'Teile fortgesetzt durch 16 und notiere die Reste. Reste von 10 bis 15 werden zu A bis F. Lies die Reste von unten nach oben.',
  '16>2': 'Übersetze jede Hex-Ziffer einzeln in vier Bit (8-4-2-1) und schreibe die Tetraden aneinander.',
  '2>16': 'Teile die Dualzahl von rechts in Vierergruppen, fülle links mit Nullen auf und übersetze jede Gruppe in eine Hex-Ziffer.',
};

/** Kurze Rückrechnung als Probe, z. B. „32 + 8 + 4 + 1 = 45 ✓“. */
export function probeZeile(wert, basis) {
  const weg = wegStellenwert(nachBasis(wert, basis), basis);
  const terme = weg.stellen.filter((s) => s.wert);
  if (basis === 2) return `${terme.map((s) => dez(s.gewicht)).join(' + ')} = ${dez(wert)} ✓`;
  return `${terme.map((s) => `${s.wert}·${dez(s.gewicht)}`).join(' + ')} = ${dez(wert)} ✓`;
}

/* ------------------------------------------------------------------ */
/* Hilfen für neue Zahlen                                              */
/* ------------------------------------------------------------------ */

const VERSUCHE = 3000;

function trivial(n, basis) {
  const s = nachBasis(n, basis);
  return /^10*$/.test(s) || new RegExp(`^${ZIFFERN[basis - 1]}+$`).test(s);
}

function zahlMitStellen(r, basis, stellen) {
  const min = stellen === 1 ? 1 : basis ** (stellen - 1);
  return ganz(r, min, basis ** stellen - 1);
}

function signifikant(s) {
  return s.replace(/^0+/, '').length;
}

/* ------------------------------------------------------------------ */
/* Umwandlung                                                          */
/* ------------------------------------------------------------------ */

export function baueUmwandlung({ von, nach, wert, stellen = 0 }) {
  const quelle = nachBasis(wert, von);
  const ziel = nachBasis(wert, nach);
  const schluessel = `${von}>${nach}`;
  let frage = `<b>Wandle</b> die ${ZAHLWORT[von]} in eine ${ZAHLWORT[nach]} <b>um</b>.`;
  if (stellen) frage += ` Gib das Ergebnis als ${stellen}-Bit-Zahl an (führende Nullen ergänzen).`;
  const felder = nummeriere([
    zahlFeld(nach, wert, { vor: `${z(quelle, von)} =`, stellen, diag: { von, nach, n: wert, text: quelle } }),
  ]);

  let loesung = '';
  switch (schluessel) {
    case '2>10':
      loesung = `<h4>Stellenwertmethode</h4>${htmlStellenwert(wegStellenwert(quelle, 2))}`;
      break;
    case '16>10':
      loesung = `<h4>Stellenwertmethode</h4>${htmlStellenwert(wegStellenwert(quelle, 16))}`;
      break;
    case '10>2': {
      const zielVoll = stellen ? auffuellen(ziel, stellen) : ziel;
      loesung = `<h4>Divisionsrestverfahren</h4>${htmlDivisionsrest(wegDivisionsrest(wert, 2))}`;
      if (stellen && zielVoll !== ziel) loesung += `<p>Als ${stellen}-Bit-Zahl mit führenden Nullen: ${z(zielVoll, 2)}</p>`;
      loesung += `<details class="alternative"><summary>Alternative: Zweierpotenzen-Methode</summary>${htmlZweierpotenzen(wegZweierpotenzen(wert))}</details>`;
      loesung += `<p class="probe-zeile"><b>Probe:</b> ${probeZeile(wert, 2)}</p>`;
      break;
    }
    case '10>16': {
      loesung = `<h4>Divisionsrestverfahren (durch 16)</h4>${htmlDivisionsrest(wegDivisionsrest(wert, 16))}`;
      if (wert < 4096) {
        loesung += `<details class="alternative"><summary>Alternative: über das Dualsystem</summary>${htmlDivisionsrest(wegDivisionsrest(wert, 2))}${htmlDualZuHex(wegDualZuHex(nachBasis(wert, 2)))}</details>`;
      }
      loesung += `<p class="probe-zeile"><b>Probe:</b> ${probeZeile(wert, 16)}</p>`;
      break;
    }
    case '16>2':
      loesung = `<h4>Tetraden: jede Hex-Ziffer → 4 Bit</h4>${htmlHexZuDual(wegHexZuDual(quelle))}`;
      break;
    case '2>16':
      loesung = `<h4>Tetraden: Vierergruppen von rechts</h4>${htmlDualZuHex(wegDualZuHex(quelle))}`;
      break;
    default:
      throw new Error('Unbekannte Umwandlung ' + schluessel);
  }
  return {
    typ: 'umwandlung',
    param: { von, nach, wert, stellen },
    titel: `${SYSTEMWORT[von]} → ${SYSTEMWORT[nach]}${stellen ? ` (${stellen} Bit)` : ''}`,
    frage,
    felder,
    tipp: TIPP_UMWANDLUNG[schluessel],
    loesung,
    erzeugeVariante: (r) => varianteUmwandlung({ von, nach, wert, stellen }, r),
  };
}

/** Gleiche Richtung, gleich viele Stellen, keine „glatten“ Zahlen wie 1000₂ oder FF₁₆. */
function varianteUmwandlung({ von, nach, wert, stellen }, r) {
  const bezug = von === 10 ? nach : nach === 10 ? von : 2;
  const laenge = nachBasis(wert, bezug).length;
  for (let i = 0; i < VERSUCHE; i++) {
    const n = zahlMitStellen(r, bezug, laenge);
    if (n === wert || trivial(n, bezug) || trivial(n, nach) || trivial(n, von)) continue;
    if (stellen && nachBasis(n, 2).length > stellen) continue;
    return baueUmwandlung({ von, nach, wert: n, stellen });
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Addition                                                            */
/* ------------------------------------------------------------------ */

export function baueAddition({ a, b }) {
  const weg = wegAddition(a, b);
  const soll = parseInt(weg.ergebnis, 2);
  return {
    typ: 'addition',
    param: { a, b },
    titel: `Addition (${Math.max(a.length, b.length)} Bit)`,
    frage: '<b>Addiere</b> die beiden Dualzahlen schriftlich.',
    felder: nummeriere([zahlFeld(2, soll, { vor: `${z(a, 2)} + ${z(b, 2)} =`, diag: { op: '+', a, b } })]),
    tipp: 'Rechne von rechts nach links wie im Dezimalsystem: 0 + 1 = 1, 1 + 1 = 10₂ (schreibe 0, Übertrag 1), 1 + 1 + 1 = 11₂ (schreibe 1, Übertrag 1).',
    loesung: `<h4>Schriftlich, von rechts nach links</h4>${htmlAddition(weg)}${htmlAdditionErklaerung(weg)}${htmlDezimalProbe(a, b, '+')}`,
    erzeugeVariante: (r) => varianteAddition({ a, b }, r),
  };
}

/** Gleiche Breiten, ähnlich viele Überträge, gleicher Endübertrag. */
function varianteAddition({ a, b }, r) {
  const orig = wegAddition(a, b);
  const la = signifikant(a);
  const lb = signifikant(b);
  for (let i = 0; i < VERSUCHE; i++) {
    const xa = auffuellen(nachBasis(zahlMitStellen(r, 2, la), 2), a.length);
    const yb = auffuellen(nachBasis(zahlMitStellen(r, 2, lb), 2), b.length);
    if (xa === a && yb === b) continue;
    const w = wegAddition(xa, yb);
    if (orig.uebertraege === 0 ? w.uebertraege !== 0 : w.uebertraege < Math.max(1, orig.uebertraege - 1)) continue;
    if (w.endUebertrag !== orig.endUebertrag) continue;
    return baueAddition({ a: xa, b: yb });
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Subtraktion                                                         */
/* ------------------------------------------------------------------ */

export function baueSubtraktion({ a, b }) {
  const weg = wegSubtraktion(a, b);
  const soll = parseInt(weg.ergebnis, 2);
  return {
    typ: 'subtraktion',
    param: { a, b },
    titel: `Subtraktion (${Math.max(a.length, b.length)} Bit)`,
    frage: '<b>Subtrahiere</b> die Dualzahlen schriftlich und mache die Probe.',
    felder: nummeriere([zahlFeld(2, soll, { vor: `${z(a, 2)} − ${z(b, 2)} =`, diag: { op: '−', a, b } })]),
    tipp: 'Rechne von rechts nach links: 1 − 0 = 1, 1 − 1 = 0, 0 − 1 geht nicht → eine 1 aus der nächsten Stelle entleihen: 10₂ − 1 = 1. Die Entleihung ziehst du in der nächsten Stelle zusätzlich ab.',
    loesung: `<h4>Schriftlich, von rechts nach links</h4>${htmlSubtraktion(weg)}${htmlSubtraktionErklaerung(weg)}${htmlProbeSubtraktion(weg)}${htmlDezimalProbe(a, b, '−')}`,
    erzeugeVariante: (r) => varianteSubtraktion({ a, b }, r),
  };
}

/** Gleiche Breiten, Minuend ≥ Subtrahend, ähnlich viele Entleihungen. */
function varianteSubtraktion({ a, b }, r) {
  const orig = wegSubtraktion(a, b);
  const la = signifikant(a);
  const lb = signifikant(b);
  for (let i = 0; i < VERSUCHE; i++) {
    const x = zahlMitStellen(r, 2, la);
    const y = zahlMitStellen(r, 2, lb);
    if (y > x) continue;
    const xa = auffuellen(nachBasis(x, 2), a.length);
    const yb = auffuellen(nachBasis(y, 2), b.length);
    if (xa === a && yb === b) continue;
    const w = wegSubtraktion(xa, yb);
    if (orig.entleihungen === 0 ? w.entleihungen !== 0 : w.entleihungen < Math.max(1, orig.entleihungen - 1)) continue;
    return baueSubtraktion({ a: xa, b: yb });
  }
  return null;
}
