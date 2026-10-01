// kern.test.mjs – Umwandlungen und Rechenwege
import { test, gleich, wahr, htmlAusgewogen } from './harness.mjs';
import {
  nachBasis, vonBasis, gruppieren, auffuellen, ohneFuehrendeNullen, bitsNoetig, einsen, hoch, tief,
  wegDivisionsrest, wegStellenwert, wegZweierpotenzen, wegHexZuDual, wegDualZuHex, wegAddition, wegSubtraktion,
} from '../js/kern/zahlen.js';
import {
  z, dez, htmlDivisionsrest, htmlStellenwert, htmlZweierpotenzen, htmlHexZuDual, htmlDualZuHex,
  htmlAddition, htmlSubtraktion, htmlAdditionErklaerung, htmlSubtraktionErklaerung, htmlProbeSubtraktion,
  htmlHexTabelle, htmlDip,
} from '../js/kern/darstellung.js';

test('nachBasis/vonBasis: Hin- und Rückweg 0 … 70 000', () => {
  for (let n = 0; n <= 70000; n++) {
    for (const b of [2, 10, 16]) {
      const s = nachBasis(n, b);
      if (vonBasis(s, b) !== n) throw new Error(`${n} zur Basis ${b}`);
      if (s !== n.toString(b).toUpperCase()) throw new Error('Großbuchstaben');
    }
  }
});

test('vonBasis lehnt ungültige Ziffern ab', () => {
  wahr(Number.isNaN(vonBasis('102', 2)));
  wahr(Number.isNaN(vonBasis('1G', 16)));
  wahr(Number.isNaN(vonBasis('', 10)));
  gleich(vonBasis('ff', 16), 255);
});

test('nachBasis: nur positive ganze Zahlen', () => {
  let fehler = 0;
  for (const x of [-1, 1.5, NaN]) {
    try { nachBasis(x, 2); } catch { fehler++; }
  }
  gleich(fehler, 3);
});

test('Hilfsfunktionen', () => {
  gleich(gruppieren('101101'), '10 1101');
  gleich(gruppieren('1011'), '1011');
  gleich(gruppieren('101101101'), '1 0110 1101');
  gleich(gruppieren('48879', 3, ' '), '48 879');
  gleich(auffuellen('101', 8), '00000101');
  gleich(ohneFuehrendeNullen('000'), '0');
  gleich(ohneFuehrendeNullen('0010'), '10');
  gleich(bitsNoetig(300), 9);
  gleich(bitsNoetig(255), 8);
  gleich(einsen(0b10110110), 5);
  gleich(hoch(10), '¹⁰');
  gleich(tief(16), '₁₆');
  gleich(dez(48879), '48 879');
  gleich(dez(4096), '4096');
});

test('Divisionsrestverfahren: Ergebnis und jede Zeile stimmen', () => {
  for (const b of [2, 16]) {
    for (let n = 0; n <= 5000; n++) {
      const w = wegDivisionsrest(n, b);
      if (w.ergebnis !== nachBasis(n, b)) throw new Error(`${n}/${b}`);
      for (const zl of w.zeilen) {
        if (zl.quotient * b + zl.rest !== zl.dividend || zl.rest >= b) throw new Error('Zeile');
      }
      if (w.zeilen[w.zeilen.length - 1].quotient !== 0) throw new Error('Ende');
    }
  }
});

test('Stellenwertmethode', () => {
  for (const b of [2, 16]) {
    for (let n = 0; n <= 5000; n += 7) {
      const w = wegStellenwert(nachBasis(n, b), b);
      if (w.summe !== n) throw new Error(`${n}/${b}`);
    }
  }
  const w = wegStellenwert('2AF', 16);
  gleich(w.stellen.map((s) => s.produkt).join(','), '512,160,15');
});

test('Zweierpotenzen-Methode', () => {
  for (let n = 1; n <= 5000; n++) {
    if (wegZweierpotenzen(n).ergebnis !== nachBasis(n, 2)) throw new Error(String(n));
  }
});

test('Tetraden in beide Richtungen', () => {
  for (let n = 0; n <= 70000; n += 3) {
    if (wegHexZuDual(nachBasis(n, 16)).ergebnis !== nachBasis(n, 2)) throw new Error('hex→dual ' + n);
    if (wegDualZuHex(nachBasis(n, 2)).ergebnis !== nachBasis(n, 16)) throw new Error('dual→hex ' + n);
  }
  const w = wegDualZuHex('1011001111');
  gleich(w.aufgefuellt, '001011001111');
  gleich(w.ergaenzt, 2);
  gleich(w.ergebnis, '2CF');
  gleich(wegHexZuDual('3A').voll, '00111010');
});

test('Addition: alle Paare 0 … 255, Überträge unabhängig gezählt', () => {
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b < 256; b++) {
      const w = wegAddition(auffuellen(nachBasis(a, 2), 8), auffuellen(nachBasis(b, 2), 8));
      if (parseInt(w.ergebnis, 2) !== a + b) throw new Error(`${a}+${b}`);
      let c = 0;
      let n = 0;
      for (let i = 0; i < 8; i++) {
        const s = ((a >> i) & 1) + ((b >> i) & 1) + c;
        c = s >= 2 ? 1 : 0;
        n += c;
      }
      if (w.uebertraege !== n) throw new Error(`Überträge ${a}+${b}`);
      if (w.endUebertrag !== (a + b > 255 ? 1 : 0)) throw new Error('Endübertrag');
    }
  }
});

test('Subtraktion: alle Paare a ≥ b bis 255, Entleihungen unabhängig gezählt', () => {
  for (let a = 0; a < 256; a++) {
    for (let b = 0; b <= a; b++) {
      const w = wegSubtraktion(auffuellen(nachBasis(a, 2), 8), auffuellen(nachBasis(b, 2), 8));
      if (parseInt(w.ergebnis, 2) !== a - b) throw new Error(`${a}-${b}`);
      let br = 0;
      let n = 0;
      for (let i = 0; i < 8; i++) {
        const d = ((a >> i) & 1) - ((b >> i) & 1) - br;
        br = d < 0 ? 1 : 0;
        n += br;
      }
      if (w.entleihungen !== n) throw new Error(`Entleihungen ${a}-${b}`);
    }
  }
  let fehler = false;
  try { wegSubtraktion('0101', '1000'); } catch { fehler = true; }
  wahr(fehler, 'Minuend < Subtrahend muss abgelehnt werden');
});

test('Rechenwege als HTML sind wohlgeformt', () => {
  for (const n of [0, 1, 6, 45, 156, 687, 2024, 48879]) {
    htmlAusgewogen(htmlDivisionsrest(wegDivisionsrest(n, 2)), 'div2 ' + n);
    htmlAusgewogen(htmlDivisionsrest(wegDivisionsrest(n, 16)), 'div16 ' + n);
    htmlAusgewogen(htmlDivisionsrest(wegDivisionsrest(n, 2), { sichtbar: 2 }), 'div2 teilweise ' + n);
    htmlAusgewogen(htmlStellenwert(wegStellenwert(nachBasis(n, 2), 2)), 'sw2 ' + n);
    htmlAusgewogen(htmlStellenwert(wegStellenwert(nachBasis(n, 16), 16)), 'sw16 ' + n);
    if (n > 0) htmlAusgewogen(htmlZweierpotenzen(wegZweierpotenzen(n)), 'zp ' + n);
    htmlAusgewogen(htmlHexZuDual(wegHexZuDual(nachBasis(n, 16))), 'h2d ' + n);
    htmlAusgewogen(htmlDualZuHex(wegDualZuHex(nachBasis(n, 2))), 'd2h ' + n);
  }
  const add = wegAddition('1011', '0110');
  const sub = wegSubtraktion('11010', '01011');
  for (let bis = 0; bis <= 5; bis++) {
    htmlAusgewogen(htmlAddition(add, { bis, aktiv: bis }), 'add ' + bis);
    htmlAusgewogen(htmlSubtraktion(sub, { bis, aktiv: bis }), 'sub ' + bis);
  }
  htmlAusgewogen(htmlAdditionErklaerung(add), 'add erkl');
  htmlAusgewogen(htmlSubtraktionErklaerung(sub), 'sub erkl');
  htmlAusgewogen(htmlProbeSubtraktion(sub), 'probe');
  htmlAusgewogen(htmlHexTabelle(), 'hex');
  htmlAusgewogen(htmlDip(9, [1, 3]), 'dip');
  htmlAusgewogen(z('101101', 2), 'z');
});

test('Schriftliche Addition zeigt Überträge in der richtigen Spalte', () => {
  const html = htmlAddition(wegAddition('1011', '0110'));
  // 1011 + 0110 = 10001: Überträge in den Spalten 2¹ … 2⁴
  const reihe = html.split('<tr').find((t) => t.includes('uebertraege'));
  const zellen = reihe.match(/<td[^>]*>([^<]*)<\/td>/g).map((t) => t.replace(/<[^>]+>/g, ''));
  gleich(zellen.join('|'), '1|1|1||');
});

test('Subtraktion: Text der Spaltenerklärung', () => {
  const sub = wegSubtraktion('1000', '0001');
  const t = htmlSubtraktionErklaerung(sub);
  wahr(t.includes('entleihen'), 'Entleihen erwähnt');
  gleich(sub.ergebnis, '0111');
  gleich(sub.entleihungen, 3);
});
