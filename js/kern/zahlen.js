// zahlen.js – Zahlensysteme: Umwandlung und Rechenwege (reine Logik, ohne DOM)
//
// Nur positive ganze Zahlen (einschließlich 0). Gerechnet wird mit Number;
// alle Werte der Aufgaben liegen weit unter 2^53.

export const ZIFFERN = '0123456789ABCDEF';

export const SYSTEME = {
  2: { basis: 2, name: 'Dualsystem', kurz: 'Dual', zahlwort: 'Dualzahl', ziffern: '0 und 1' },
  10: { basis: 10, name: 'Dezimalsystem', kurz: 'Dez', zahlwort: 'Dezimalzahl', ziffern: '0 bis 9' },
  16: { basis: 16, name: 'Hexadezimalsystem', kurz: 'Hex', zahlwort: 'Hexadezimalzahl', ziffern: '0 bis 9 und A bis F' },
};

export const HOCHZAHL = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const TIEFZAHL = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };

/** Hochgestellte Schreibweise, z. B. hoch(12) → „¹²“ */
export function hoch(n) {
  return String(n).split('').map((c) => HOCHZAHL[c]).join('');
}

/** Tiefgestellte Schreibweise, z. B. tief(16) → „₁₆“ */
export function tief(n) {
  return String(n).split('').map((c) => TIEFZAHL[c]).join('');
}

/** Wert einer einzelnen Ziffer (0–15) oder −1. */
export function zifferWert(zeichen) {
  return ZIFFERN.indexOf(String(zeichen).toUpperCase());
}

/** Zahl → Ziffernfolge im gewünschten System (Großbuchstaben, ohne führende Nullen). */
export function nachBasis(n, basis) {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Nur positive ganze Zahlen: ' + n);
  return n.toString(basis).toUpperCase();
}

/** Ziffernfolge → Zahl. Ungültige Ziffern ergeben NaN. */
export function vonBasis(text, basis) {
  const s = String(text).toUpperCase();
  if (!s.length) return NaN;
  let wert = 0;
  for (const z of s) {
    const w = ZIFFERN.indexOf(z);
    if (w < 0 || w >= basis) return NaN;
    wert = wert * basis + w;
  }
  return wert;
}

export function ohneFuehrendeNullen(s) {
  const t = String(s).replace(/^0+/, '');
  return t === '' ? '0' : t;
}

export function auffuellen(s, laenge) {
  s = String(s);
  return s.length >= laenge ? s : '0'.repeat(laenge - s.length) + s;
}

/** Von rechts in Gruppen teilen: gruppieren('101101') → '10 1101'. */
export function gruppieren(s, n = 4, trenner = ' ') {
  s = String(s);
  let aus = '';
  for (let i = 0; i < s.length; i++) {
    aus += s[i];
    const rest = s.length - 1 - i;
    if (rest > 0 && rest % n === 0) aus += trenner;
  }
  return aus;
}

/** Anzahl der Bits, die eine Zahl mindestens braucht. */
export function bitsNoetig(n) {
  return nachBasis(n, 2).length;
}

/** Anzahl der Einsen einer Zahl (Gewicht). */
export function einsen(n) {
  return [...nachBasis(n, 2)].filter((z) => z === '1').length;
}

/* ------------------------------------------------------------------ *
 * Rechenwege – liefern die Zwischenschritte so, wie sie im Heft stehen *
 * ------------------------------------------------------------------ */

/** Divisionsrestverfahren: n fortgesetzt durch die Basis teilen, Reste von unten nach oben lesen. */
export function wegDivisionsrest(n, basis) {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Nur positive ganze Zahlen');
  const zeilen = [];
  let dividend = n;
  do {
    const quotient = Math.floor(dividend / basis);
    const rest = dividend - quotient * basis;
    zeilen.push({ dividend, quotient, produkt: quotient * basis, rest, ziffer: ZIFFERN[rest] });
    dividend = quotient;
  } while (dividend > 0);
  const ergebnis = zeilen.map((z) => z.ziffer).reverse().join('');
  return { art: 'divisionsrest', n, basis, zeilen, ergebnis };
}

/** Stellenwertmethode: Ziffernwert × Stellenwert, alles addieren. */
export function wegStellenwert(text, basis) {
  const s = String(text).toUpperCase();
  const stellen = [];
  for (let i = 0; i < s.length; i++) {
    const pos = s.length - 1 - i;
    const wert = zifferWert(s[i]);
    if (wert < 0 || wert >= basis) throw new RangeError(`Ungültige Ziffer ${s[i]} zur Basis ${basis}`);
    const gewicht = basis ** pos;
    stellen.push({ pos, ziffer: s[i], wert, gewicht, produkt: wert * gewicht });
  }
  const summe = stellen.reduce((a, st) => a + st.produkt, 0);
  return { art: 'stellenwert', text: s, basis, stellen, summe };
}

/** Zweierpotenzen-Methode (Subtraktionsmethode) für Dezimal → Dual. */
export function wegZweierpotenzen(n) {
  const bits = bitsNoetig(n);
  const schritte = [];
  let rest = n;
  for (let pos = bits - 1; pos >= 0; pos--) {
    const gewicht = 2 ** pos;
    const passt = rest >= gewicht;
    schritte.push({ pos, gewicht, vorher: rest, passt, nachher: passt ? rest - gewicht : rest });
    if (passt) rest -= gewicht;
  }
  return { art: 'zweierpotenzen', n, schritte, ergebnis: schritte.map((s) => (s.passt ? '1' : '0')).join('') };
}

/** Hexadezimal → Dual: jede Hex-Ziffer wird zu genau vier Bit (Tetrade). */
export function wegHexZuDual(hex) {
  const s = String(hex).toUpperCase();
  const gruppen = [...s].map((h) => {
    const wert = zifferWert(h);
    if (wert < 0) throw new RangeError('Ungültige Hex-Ziffer ' + h);
    return { hex: h, wert, bits: auffuellen(wert.toString(2), 4) };
  });
  const voll = gruppen.map((g) => g.bits).join('');
  return { art: 'hexzudual', hex: s, gruppen, voll, ergebnis: ohneFuehrendeNullen(voll) };
}

/** Dual → Hexadezimal: von rechts in Vierergruppen teilen, links mit Nullen auffüllen. */
export function wegDualZuHex(bin) {
  const s = String(bin);
  if (!/^[01]+$/.test(s)) throw new RangeError('Keine Dualzahl: ' + s);
  const laenge = Math.ceil(s.length / 4) * 4;
  const aufgefuellt = auffuellen(s, laenge);
  const gruppen = [];
  for (let i = 0; i < laenge; i += 4) {
    const bits = aufgefuellt.slice(i, i + 4);
    const wert = parseInt(bits, 2);
    gruppen.push({ bits, wert, hex: ZIFFERN[wert] });
  }
  return {
    art: 'dualzuhex', bin: s, aufgefuellt, ergaenzt: laenge - s.length, gruppen,
    ergebnis: ohneFuehrendeNullen(gruppen.map((g) => g.hex).join('')),
  };
}

/** Schriftliche Addition zweier Dualzahlen, Spalte für Spalte von rechts. */
export function wegAddition(a, b) {
  const breite = Math.max(a.length, b.length);
  const A = auffuellen(a, breite);
  const B = auffuellen(b, breite);
  const spalten = []; // spalten[0] = Stelle 2⁰ (ganz rechts)
  let ein = 0;
  for (let i = breite - 1; i >= 0; i--) {
    const x = +A[i];
    const y = +B[i];
    const summe = x + y + ein;
    const s = summe % 2;
    const aus = summe >= 2 ? 1 : 0;
    spalten.push({ pos: breite - 1 - i, a: x, b: y, ein, summe, s, aus });
    ein = aus;
  }
  let ergebnis = spalten.map((c) => c.s).reverse().join('');
  if (ein) ergebnis = '1' + ergebnis;
  return {
    art: 'addition', a: A, b: B, breite, spalten, endUebertrag: ein, ergebnis,
    uebertraege: spalten.filter((c) => c.aus).length,
  };
}

/** Schriftliche Subtraktion (Minuend ≥ Subtrahend) mit Entleihung, Spalte für Spalte von rechts. */
export function wegSubtraktion(a, b) {
  const breite = Math.max(a.length, b.length);
  const A = auffuellen(a, breite);
  const B = auffuellen(b, breite);
  if (parseInt(A, 2) < parseInt(B, 2)) throw new RangeError('Minuend kleiner als Subtrahend');
  const spalten = [];
  let ein = 0; // Entleihung, die aus der rechten Nachbarstelle kommt
  for (let i = breite - 1; i >= 0; i--) {
    const x = +A[i];
    const y = +B[i];
    let d = x - y - ein;
    let aus = 0;
    if (d < 0) {
      d += 2;
      aus = 1;
    }
    spalten.push({ pos: breite - 1 - i, a: x, b: y, ein, d, aus });
    ein = aus;
  }
  const ergebnis = spalten.map((c) => c.d).reverse().join('');
  return {
    art: 'subtraktion', a: A, b: B, breite, spalten, ergebnis,
    entleihungen: spalten.filter((c) => c.aus).length,
  };
}

/** Zählt die Überträge einer Addition zweier Zahlen. */
export function zaehleUebertraege(a, b) {
  return wegAddition(nachBasis(a, 2), nachBasis(b, 2)).uebertraege;
}

/** Zählt die Entleihungen einer Subtraktion a − b (a ≥ b). */
export function zaehleEntleihungen(a, b) {
  return wegSubtraktion(nachBasis(a, 2), nachBasis(b, 2)).entleihungen;
}
