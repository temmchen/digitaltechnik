// aufgaben.js – Thema Zahlensysteme: die 100 Aufgaben (Klasse DP1ET, DITEC1)
//
// Jede Aufgabe hat: Kapitel (A–I), Denkprozess k (1–6, Bloom/Anderson-Krathwohl; daraus folgt
// die Taxonomiestufe leicht/mittel/schwer), ein internes Niveau (Zahlengröße, steuert u. a. den
// Platz für den Rechenweg auf dem Prüfungsblatt) und Punkte für die Prüfung.
// Ergebnisse von Umwandlungen und Rechnungen werden berechnet, nicht abgetippt.

import { wegDivisionsrest, wegStellenwert, wegDualZuHex, wegHexZuDual, wegAddition, wegSubtraktion, wegZweierpotenzen } from '../../kern/zahlen.js';
import {
  z, pot, dez, htmlStellenwert, htmlDivisionsrest, htmlDualZuHex, htmlHexZuDual, htmlAddition,
  htmlSubtraktion, htmlProbeSubtraktion, htmlHexTabelle, htmlZweierTabelle, htmlDip, htmlZweierpotenzen,
} from '../../kern/darstellung.js';
import { zahlFeld, wahlFeld, listeFeld, mehrfachFeld, bitsFeld, nummeriere } from '../../kern/felder.js';
import { baueUmwandlung, baueAddition, baueSubtraktion } from './typen.js';

const LISTE = [];

function meta(kap, k, niveau, punkte) {
  return { kap, k, niveau, punkte };
}

/** Umwandlungsaufgabe */
function U(kap, k, niveau, punkte, von, nach, wert, stellen = 0) {
  LISTE.push({ ...meta(kap, k, niveau, punkte), ...baueUmwandlung({ von, nach, wert, stellen }) });
}
/** Additionsaufgabe (Dualzahlen als Text, auch mit führenden Nullen) */
function ADD(kap, k, niveau, punkte, a, b) {
  LISTE.push({ ...meta(kap, k, niveau, punkte), ...baueAddition({ a, b }) });
}
/** Subtraktionsaufgabe (Minuend ≥ Subtrahend) */
function SUB(kap, k, niveau, punkte, a, b) {
  LISTE.push({ ...meta(kap, k, niveau, punkte), ...baueSubtraktion({ a, b }) });
}
/** Frei gestaltete Aufgabe */
function H(kap, k, niveau, punkte, def) {
  LISTE.push({ ...meta(kap, k, niveau, punkte), typ: def.typ || 'frei', ...def, felder: nummeriere(def.felder) });
}

const B = (s) => z(s, 2);
const D = (s) => z(String(s), 10);
const X = (s) => z(s, 16);

/* ================================================================== */
/* A – Grundlagen der Stellenwertsysteme                              */
/* ================================================================== */

H('A', 1, 1, 1, {
  titel: 'Ziffern des Dualsystems',
  frage: '<b>Nenne</b> die Ziffern, die im Dualsystem vorkommen.',
  felder: [wahlFeld([
    ['0 und 1', 'Richtig: Basis 2 bedeutet genau zwei Ziffern.'],
    ['1 und 2', 'Jedes Stellenwertsystem beginnt mit der Ziffer 0. Die größte Ziffer ist immer Basis − 1.'],
    ['0, 1 und 2', 'Basis 2 bedeutet genau zwei Ziffern – die 2 selbst gehört nicht dazu.'],
    ['0 bis 9', 'Das sind die Ziffern des Dezimalsystems (Basis 10).'],
  ], 0)],
  tipp: 'Im Dezimalsystem (Basis 10) gibt es zehn Ziffern: 0 bis 9. Die größte Ziffer ist immer um 1 kleiner als die Basis.',
  loesung: '<p>Das Dualsystem hat die Basis 2 und damit genau zwei Ziffern: <b>0 und 1</b>.</p><p class="merke-kurz">Allgemein: Ein System zur Basis b hat die Ziffern 0 bis b − 1.</p>',
});

H('A', 1, 1, 2, {
  titel: 'Basis des Hexadezimalsystems',
  frage: '<b>Gib</b> die Basis des Hexadezimalsystems und seine größte Ziffer <b>an</b>.',
  felder: [
    zahlFeld(10, 16, { vor: 'Basis:' }),
    zahlFeld(16, 15, { vor: 'Größte Ziffer:' }),
  ],
  tipp: '„Hexa“ heißt sechs, „dezimal“ heißt zehn.',
  loesung: `<p>Hexa (6) + dezimal (10) = 16 → <b>Basis 16</b>. Die Ziffern sind 0 … 9 und A … F; die größte ist <b>F</b> (= 15).</p>${htmlHexTabelle({ kompakt: true })}`,
});

H('A', 1, 1, 2, {
  titel: 'Zweierpotenzen',
  frage: '<b>Gib</b> den Wert der Zweierpotenzen als Dezimalzahl <b>an</b>.',
  felder: [
    zahlFeld(10, 1, { vor: `${pot(2, 0)} =` }),
    zahlFeld(10, 8, { vor: `${pot(2, 3)} =` }),
    zahlFeld(10, 128, { vor: `${pot(2, 7)} =` }),
    zahlFeld(10, 1024, { vor: `${pot(2, 10)} =` }),
  ],
  tipp: 'Beginne bei 2⁰ = 1 und verdopple immer wieder: 1, 2, 4, 8, …',
  loesung: `<p>Jede Zweierpotenz ist doppelt so groß wie die vorherige. Jede Zahl hoch 0 ergibt 1.</p>${htmlZweierTabelle(10)}<p class="merke-kurz">Die Reihe 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024 solltest du auswendig können.</p>`,
});

H('A', 1, 1, 2, {
  titel: 'Bit, Nibble, Byte',
  frage: '<b>Gib an</b>, aus wie vielen Bit ein Nibble (Tetrade) und ein Byte bestehen und wie viele Nibbles ein Byte hat.',
  felder: [
    zahlFeld(10, 4, { vor: '1 Nibble (Tetrade) =', nach: 'Bit' }),
    zahlFeld(10, 8, { vor: '1 Byte =', nach: 'Bit' }),
    zahlFeld(10, 2, { vor: '1 Byte =', nach: 'Nibbles' }),
  ],
  tipp: 'Ein Bit ist eine einzelne Dualziffer (0 oder 1). Eine Hex-Ziffer entspricht genau einem Nibble.',
  loesung: '<ul><li><b>Bit</b> = eine Dualstelle (0 oder 1)</li><li><b>Nibble</b> (Tetrade, Halbbyte) = <b>4 Bit</b> = eine Hex-Ziffer</li><li><b>Byte</b> = <b>8 Bit</b> = <b>2 Nibbles</b> = zwei Hex-Ziffern (00 … FF)</li></ul>',
});

H('A', 2, 1, 2, {
  titel: 'Stellenwert in drei Systemen',
  frage: 'Die 5. Stelle von rechts hat die Stellennummer 4. <b>Bestimme</b> ihren Stellenwert in den drei Systemen (jeweils als Dezimalzahl).',
  felder: [
    zahlFeld(10, 10000, { vor: 'Dezimalsystem:' }),
    zahlFeld(10, 16, { vor: 'Dualsystem:' }),
    zahlFeld(10, 65536, { vor: 'Hexadezimalsystem:' }),
  ],
  tipp: 'Stellenwert = Basis hoch Stellennummer. Die Stellen werden von rechts ab 0 gezählt.',
  loesung: `<p>Stellenwert = Basis<sup>Stellennummer</sup>. Die 5. Stelle von rechts hat die Nummer 4, weil man bei 0 zu zählen beginnt:</p><ul><li>Dezimal: ${pot(10, 4)} = ${dez(10000)}</li><li>Dual: ${pot(2, 4)} = 16</li><li>Hexadezimal: ${pot(16, 4)} = ${dez(65536)}</li></ul>`,
});

H('A', 2, 1, 2, {
  titel: 'Warum A bis F?',
  frage: '<b>Erkläre</b>: Warum verwendet das Hexadezimalsystem die Buchstaben A bis F?',
  felder: [wahlFeld([
    ['Es braucht 16 verschiedene Ziffern – die Ziffern 0 bis 9 reichen nur für zehn.', 'Genau: Für die Werte 10 bis 15 braucht jede Stelle ein eigenes Zeichen.'],
    ['Buchstaben brauchen weniger Speicherplatz als Ziffern.', 'Mit Speicherplatz hat das nichts zu tun – es geht um die Anzahl der Ziffern.'],
    ['Damit man Hexadezimalzahlen nicht mit Dezimalzahlen verwechselt.', 'Dafür gibt es den Index ₁₆ oder die Vorsilbe 0x. Die Buchstaben braucht man, weil 16 Ziffern nötig sind.'],
    ['A bis F stehen für die Zahlen 1 bis 6.', 'A bis F stehen für 10 bis 15.'],
  ], 0)],
  tipp: 'Wie viele verschiedene Ziffern braucht ein System zur Basis 16?',
  loesung: '<p>Ein System zur Basis 16 braucht 16 Ziffern für die Werte 0 bis 15. Für 10 bis 15 gibt es keine einzelnen Ziffernzeichen, deshalb gilt: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15.</p>',
});

H('A', 2, 2, 3, {
  titel: 'Dual weiterzählen',
  frage: `<b>Zähle</b> im Dualsystem <b>weiter</b>: Gib die drei Zahlen an, die auf ${B('1011')} folgen.`,
  felder: [
    zahlFeld(2, 12, { vor: '1. Zahl:' }),
    zahlFeld(2, 13, { vor: '2. Zahl:' }),
    zahlFeld(2, 14, { vor: '3. Zahl:' }),
  ],
  tipp: 'Wie beim Kilometerzähler: Die rechte Stelle wird erhöht. Ist sie schon 1, wird sie 0 und es gibt einen Übertrag nach links.',
  loesung: `<p>${B('1011')} + 1 = ${B('1100')} (zwei Überträge), danach ${B('1101')} und ${B('1110')}.</p><p>Kontrolle: ${B('1011')} = 11, also folgen 12, 13 und 14.</p>`,
});

H('A', 2, 2, 3, {
  titel: 'Hexadezimal weiterzählen',
  frage: `<b>Zähle</b> im Hexadezimalsystem <b>weiter</b>: Gib die drei Zahlen an, die auf ${X('3E')} folgen.`,
  felder: [
    zahlFeld(16, 0x3f, { vor: '1. Zahl:' }),
    zahlFeld(16, 0x40, { vor: '2. Zahl:' }),
    zahlFeld(16, 0x41, { vor: '3. Zahl:' }),
  ],
  tipp: 'Nach der Ziffer F entsteht ein Übertrag – so wie im Dezimalsystem nach der 9.',
  loesung: `<p>${X('3E')} → ${X('3F')} → ${X('40')} → ${X('41')}.</p><p>Nach F (= 15) ist die Einerstelle voll: Sie wird 0 und die 16er-Stelle erhöht sich um 1. Dezimal: 62, 63, 64, 65.</p>`,
});

H('A', 3, 2, 3, {
  titel: 'Wertebereich mit 6 Bit',
  frage: 'Ein Sensor liefert seinen Messwert als 6-Bit-Dualzahl. <b>Berechne</b>, wie viele verschiedene Werte möglich sind und welches der größte Wert ist.',
  felder: [
    zahlFeld(10, 64, { vor: 'Anzahl der Werte:' }),
    zahlFeld(10, 63, { vor: 'Größter Wert (dezimal):' }),
    zahlFeld(2, 63, { vor: 'Größter Wert (dual):' }),
  ],
  tipp: 'Mit n Bit gibt es 2ⁿ verschiedene Bitmuster. Weil man bei 0 zu zählen beginnt, ist der größte Wert 2ⁿ − 1.',
  loesung: `<p>Anzahl: ${pot(2, 6)} = <b>64</b> Werte (0 bis 63).</p><p>Größter Wert: ${pot(2, 6)} − 1 = <b>63</b> = ${B('111111')} (alle Bits 1).</p><p class="merke-kurz">n Bit → 2ⁿ Werte von 0 bis 2ⁿ − 1.</p>`,
});

H('A', 4, 3, 4, {
  titel: 'Wie viele Stellen braucht 300?',
  frage: `<b>Ermittle</b>, wie viele Bit man mindestens braucht, um ${D(300)} darzustellen, und wie viele Hexadezimalziffern.`,
  felder: [
    zahlFeld(10, 9, { vor: 'Bit:' }),
    zahlFeld(10, 3, { vor: 'Hex-Ziffern:' }),
  ],
  tipp: 'Suche die kleinste Zweierpotenz, die größer als 300 ist. Jede Hex-Ziffer fasst 4 Bit zusammen.',
  loesung: `<p>${pot(2, 8)} = 256 ≤ 300 &lt; 512 = ${pot(2, 9)} → <b>9 Bit</b>: ${D(300)} = ${B('100101100')}.</p><p>Mit 8 Bit kommt man nur bis 255. 9 Bit brauchen drei Vierergruppen → <b>3 Hex-Ziffern</b>: ${D(300)} = ${X('12C')}.</p>`,
});

/* ================================================================== */
/* B – Dual → Dezimal                                                  */
/* ================================================================== */

H('B', 1, 1, 2, {
  titel: 'Stellenwerte eines Bytes',
  frage: '<b>Gib</b> die Stellenwerte einer 8-Bit-Dualzahl als Dezimalzahlen <b>an</b> – von Bit 7 (links, MSB) bis Bit 0 (rechts, LSB).',
  felder: [7, 6, 5, 4, 3, 2, 1, 0].map((i) => zahlFeld(10, 2 ** i, { vor: `Bit ${i}:` })),
  tipp: 'Bit 0 ganz rechts hat den Stellenwert 2⁰ = 1. Nach links verdoppelt sich der Stellenwert von Stelle zu Stelle.',
  loesung: `${htmlStellenwert(wegStellenwert('11111111', 2), { ergebnisZeigen: false })}<p><b>MSB</b> (most significant bit) = höchstwertiges Bit, links; <b>LSB</b> (least significant bit) = niederwertigstes Bit, rechts.</p>`,
});

U('B', 3, 1, 2, 2, 10, 0b1011);
U('B', 3, 1, 2, 2, 10, 0b11001);
U('B', 3, 1, 2, 2, 10, 0b100110);
U('B', 3, 2, 3, 2, 10, 0b10110110);
U('B', 3, 2, 3, 2, 10, 0b11100011);
U('B', 3, 2, 3, 2, 10, 0b11111111);
U('B', 3, 3, 4, 2, 10, 0b100101100);
U('B', 3, 3, 4, 2, 10, 0b101001011100);

H('B', 2, 2, 2, {
  titel: 'Eine Null anhängen',
  frage: `<b>Erkläre</b>: Was passiert mit dem Wert einer Dualzahl, wenn man rechts eine 0 anhängt (z. B. ${B('101')} → ${B('1010')})?`,
  felder: [wahlFeld([
    ['Der Wert verdoppelt sich.', `Genau: Jede Ziffer rückt eine Stelle nach links, ihr Stellenwert verdoppelt sich. ${B('101')} = 5, ${B('1010')} = 10.`],
    ['Der Wert verzehnfacht sich.', 'Das gilt im Dezimalsystem (Basis 10). Im Dualsystem ist die Basis 2.'],
    ['Der Wert bleibt gleich, weil eine 0 nichts zählt.', 'Führende Nullen (links) ändern nichts – eine angehängte 0 rechts verschiebt aber alle Stellen.'],
    ['Der Wert halbiert sich.', 'Halbiert wird der Wert, wenn man eine 0 am Ende wegnimmt.'],
  ], 0)],
  tipp: `Rechne beide Beispiele aus: ${B('101')} und ${B('1010')}.`,
  loesung: `<p>Alle Ziffern rücken eine Stelle nach links – jede Stelle ist danach doppelt so viel wert: ${B('101')} = 5 → ${B('1010')} = 10.</p><p class="merke-kurz">Im Dezimalsystem verzehnfacht eine angehängte 0 den Wert, im Dualsystem verdoppelt sie ihn – die Basis entscheidet.</p>`,
});

H('B', 4, 2, 4, {
  titel: 'Vergleich ohne Umrechnung',
  frage: `<b>Vergleiche</b> ohne vollständige Umrechnung: Welche Zahl ist größer – ${B('10000000')} oder ${B('01111111')}? Um wie viel?`,
  felder: [
    wahlFeld([
      [B('10000000'), ''],
      [B('01111111'), 'Vergleiche die höchsten Stellen zuerst: Bei 1000 0000₂ ist das Bit mit dem Wert 128 gesetzt.'],
      ['Beide sind gleich groß.', 'Rechne 0111 1111₂ + 1 aus.'],
    ], 0, { vor: 'Größer ist:' }),
    zahlFeld(10, 1, { vor: 'Unterschied:' }),
  ],
  tipp: 'Vergleiche die höchsten Stellen zuerst. Was ergibt 0111 1111₂ + 1?',
  loesung: `<p>${B('10000000')} hat das Bit 2⁷ = 128 gesetzt. ${B('01111111')} = 64 + 32 + 16 + 8 + 4 + 2 + 1 = 127.</p><p>Unterschied: <b>1</b>. Die Summe aller niedrigeren Stellenwerte ist immer um 1 kleiner als der nächsthöhere Stellenwert.</p>`,
});

H('B', 5, 2, 4, {
  titel: 'Tims Rechnung beurteilen',
  frage: `Tim wandelt ${B('110100')} um und rechnet: 1·1 + 1·2 + 0·4 + 1·8 + 0·16 + 0·32 = 11. <b>Beurteile</b> Tims Rechnung und gib den richtigen Wert an.`,
  felder: [
    wahlFeld([
      ['Tim hat richtig gerechnet.', 'Prüfe, welcher Ziffer Tim den Stellenwert 1 gegeben hat.'],
      ['Falsch: Tim hat die Stellenwerte von links nach rechts vergeben – der Stellenwert 1 gehört zur Ziffer ganz rechts.', 'Richtig erkannt.'],
      ['Falsch: Tim hätte die Nullen mitzählen müssen.', 'Stellen mit 0 tragen nichts zum Wert bei – das hat Tim richtig gemacht.'],
      ['Falsch: Tim hätte mit dem Stellenwert 2 beginnen müssen.', 'Die rechte Stelle hat immer den Stellenwert 2⁰ = 1.'],
    ], 1),
    zahlFeld(10, 52, { vor: 'Richtiger Wert:' }),
  ],
  tipp: `Welche Ziffer steht ganz rechts in ${B('110100')}? Nur diese Ziffer hat den Stellenwert 1.`,
  loesung: `${htmlStellenwert(wegStellenwert('110100', 2))}<p>Tim hat die Zahl von links gelesen. Seine Rechnung gehört zur gespiegelten Zahl ${B('001011')} = 11. Richtig ist 32 + 16 + 4 = <b>52</b>.</p>`,
});

/* ================================================================== */
/* C – Dezimal → Dual                                                  */
/* ================================================================== */

H('C', 2, 1, 2, {
  titel: 'Leserichtung der Reste',
  frage: '<b>Erkläre</b>: In welcher Reihenfolge liest man beim Divisionsrestverfahren die Reste ab?',
  felder: [wahlFeld([
    ['Von unten nach oben – der letzte Rest ist die höchste Stelle (ganz links).', 'Richtig: Der erste Rest gehört zur Stelle 2⁰ ganz rechts.'],
    ['Von oben nach unten – der erste Rest ist die höchste Stelle.', 'Der erste Rest zeigt, ob die Zahl gerade oder ungerade ist – das ist die Stelle 2⁰ ganz rechts.'],
    ['Die Reihenfolge ist egal.', `Bei 6 = ${B('110')} würde man rückwärts ${B('011')} = 3 erhalten.`],
    ['Man liest die Quotienten, nicht die Reste.', 'Die Dualziffern sind die Reste.'],
  ], 0)],
  tipp: 'Der erste Rest zeigt, ob die Zahl gerade (0) oder ungerade (1) ist. Welche Stelle entscheidet darüber?',
  loesung: `<p>Der erste Rest zeigt, ob die Zahl gerade (0) oder ungerade (1) ist – das ist die Stelle 2⁰ ganz rechts. Jeder weitere Rest gehört eine Stelle weiter nach links. Deshalb liest man die Reste <b>von unten nach oben</b>.</p>${htmlDivisionsrest(wegDivisionsrest(6, 2))}`,
});

U('C', 3, 1, 2, 10, 2, 13);
U('C', 3, 1, 2, 10, 2, 22);
U('C', 3, 1, 2, 10, 2, 37);
U('C', 3, 2, 3, 10, 2, 100);
U('C', 3, 2, 3, 10, 2, 156);
U('C', 3, 2, 3, 10, 2, 75, 8);
U('C', 3, 3, 4, 10, 2, 345);
U('C', 3, 3, 4, 10, 2, 1000);

H('C', 4, 2, 4, {
  titel: 'Zweierpotenz ± 1',
  frage: `Es gilt ${D(64)} = ${B('1000000')}. <b>Untersuche</b> den Zusammenhang und gib ohne Divisionsrestverfahren an, wie 63 und 65 als Dualzahl lauten.`,
  felder: [
    zahlFeld(2, 63, { vor: `${D(63)} =` }),
    zahlFeld(2, 65, { vor: `${D(65)} =` }),
  ],
  tipp: '64 ist eine Zweierpotenz (2⁶). Was ergibt 100 0000₂ − 1, was 100 0000₂ + 1?',
  loesung: `<p>64 = 2⁶ → eine 1 mit sechs Nullen.</p><ul><li>63 = 64 − 1: Alle sechs unteren Stellen werden 1 → ${B('111111')}.</li><li>65 = 64 + 1 → ${B('1000001')}.</li></ul><p class="merke-kurz">2ⁿ − 1 besteht aus n Einsen (wie 999 = 1000 − 1 im Dezimalsystem).</p>`,
});

H('C', 4, 2, 4, {
  titel: 'Reste rückwärts deuten',
  frage: 'Beim Divisionsrestverfahren wurden nacheinander (von oben nach unten) die Reste 1, 1, 0, 1, 0, 1 notiert. <b>Ermittle</b> die Dualzahl und die ursprüngliche Dezimalzahl.',
  felder: [
    zahlFeld(2, 43, { vor: 'Dualzahl:' }),
    zahlFeld(10, 43, { vor: 'Dezimalzahl:' }),
  ],
  tipp: 'Der erste Rest ist die Stelle ganz rechts (2⁰). Lies die Reste von unten nach oben.',
  loesung: `<p>Von unten nach oben gelesen: ${B('101011')} = 32 + 8 + 2 + 1 = <b>43</b>.</p><p>Probe mit dem Divisionsrestverfahren:</p>${htmlDivisionsrest(wegDivisionsrest(43, 2))}`,
});

H('C', 5, 2, 4, {
  titel: 'Mias Ergebnis beurteilen',
  frage: `Mia wandelt ${D(26)} um: 26 : 2 = 13 Rest 0; 13 : 2 = 6 Rest 1; 6 : 2 = 3 Rest 0; 3 : 2 = 1 Rest 1; 1 : 2 = 0 Rest 1. Sie schreibt als Ergebnis ${B('01011')}. <b>Beurteile</b> Mias Ergebnis und gib die richtige Dualzahl an.`,
  felder: [
    wahlFeld([
      ['Richtig – Rechnung und Ergebnis stimmen.', 'Die Divisionen stimmen – prüfe aber die Leserichtung: 01011₂ = 11, nicht 26.'],
      ['Die Divisionen stimmen, aber Mia hat die Reste von oben nach unten gelesen.', 'Richtig erkannt.'],
      ['Mia hat sich bei 13 : 2 verrechnet.', '13 : 2 = 6 Rest 1 ist richtig.'],
      ['Mia hätte durch 10 teilen müssen.', 'Ins Dualsystem teilt man durch die Basis 2.'],
    ], 1),
    zahlFeld(2, 26, { vor: 'Richtige Dualzahl:' }),
  ],
  tipp: `Mach die Probe: Welchen Wert hat ${B('01011')}?`,
  loesung: `${htmlDivisionsrest(wegDivisionsrest(26, 2))}<p>Probe von Mias Ergebnis: ${B('01011')} = 8 + 2 + 1 = 11 ≠ 26. Von unten nach oben gelesen: ${B('11010')} = 16 + 8 + 2 = 26 ✓.</p><p class="merke-kurz">Eine Probe durch Rückwandlung entlarvt solche Fehler sofort.</p>`,
});

/* ================================================================== */
/* D – Hexadezimal → Dezimal                                           */
/* ================================================================== */

H('D', 1, 1, 2, {
  titel: 'Werte der Hex-Buchstaben',
  frage: '<b>Gib</b> den Dezimalwert der Hex-Ziffern <b>an</b>.',
  felder: [
    zahlFeld(10, 10, { vor: 'A =' }),
    zahlFeld(10, 12, { vor: 'C =' }),
    zahlFeld(10, 14, { vor: 'E =' }),
    zahlFeld(10, 15, { vor: 'F =' }),
  ],
  tipp: 'Nach der 9 geht es mit A = 10 weiter.',
  loesung: htmlHexTabelle(),
});

H('D', 1, 1, 1, {
  titel: 'Schreibweisen für Hexadezimalzahlen',
  frage: `<b>Gib an</b>, welche Schreibweisen dieselbe Zahl wie ${X('2F')} bezeichnen. Mehrere Antworten sind möglich.`,
  felder: [mehrfachFeld(['0x2F', '2Fh', '(2F)₁₆', '2F₁₀', '0b2F'], [0, 1, 2])],
  tipp: 'Programmierer schreiben 0x vor eine Hex-Zahl, in Datenblättern steht oft ein h dahinter.',
  loesung: '<p>Hexadezimalzahlen kennzeichnet man mit dem Index ₁₆ bzw. (…)₁₆, in Programmiersprachen mit <b>0x</b> davor, in Datenblättern oft mit <b>h</b> dahinter. Richtig sind also <b>0x2F</b>, <b>2Fh</b> und <b>(2F)₁₆</b>.</p><p>2F₁₀ gibt es nicht (F ist keine Dezimalziffer), und 0b kennzeichnet Dualzahlen.</p>',
});

U('D', 3, 1, 2, 16, 10, 0x1f);
U('D', 3, 1, 2, 16, 10, 0x64);
U('D', 3, 2, 3, 16, 10, 0xa7);
U('D', 3, 2, 3, 16, 10, 0xff);
U('D', 3, 2, 3, 16, 10, 0x1c8);
U('D', 3, 3, 4, 16, 10, 0x3e8);
U('D', 3, 3, 4, 16, 10, 0xbeef);

H('D', 4, 2, 4, {
  titel: 'Vergleichen über Systeme hinweg',
  frage: '<b>Vergleiche</b> und setze &lt;, = oder &gt; ein.',
  felder: [
    listeFeld(['<', '=', '>'], 2, { vor: X('99'), nach: D(99) }),
    listeFeld(['<', '=', '>'], 1, { vor: X('99'), nach: B('10011001') }),
    listeFeld(['<', '=', '>'], 2, { vor: X('100'), nach: D(255) }),
    listeFeld(['<', '=', '>'], 0, { vor: X('FF'), nach: B('100000000') }),
  ],
  tipp: 'Gleiche Ziffern bedeuten in verschiedenen Systemen verschiedene Werte. Rechne im Zweifel alles ins Dezimalsystem um.',
  loesung: `<ul><li>${X('99')} = 9·16 + 9 = 153 &gt; 99</li><li>${X('99')} = ${B('10011001')} (jede 9 ist die Tetrade 1001) → gleich</li><li>${X('100')} = 256 &gt; 255</li><li>${X('FF')} = 255 &lt; 256 = ${B('100000000')}</li></ul>`,
});

/* ================================================================== */
/* E – Dezimal → Hexadezimal                                           */
/* ================================================================== */

H('E', 2, 1, 2, {
  titel: 'Warum durch 16 teilen?',
  frage: '<b>Erkläre</b>: Warum teilt man beim Umwandeln einer Dezimalzahl ins Hexadezimalsystem immer durch 16?',
  felder: [wahlFeld([
    ['Weil 16 die Basis des Zielsystems ist – jeder Rest (0 bis 15) ist eine Hex-Ziffer.', 'Genau.'],
    ['Weil eine Hex-Ziffer aus 16 Bit besteht.', 'Eine Hex-Ziffer entspricht 4 Bit.'],
    ['Weil Teilen durch 16 schneller geht als durch 10.', 'Teilt man durch 10, erhält man wieder die Dezimalziffern.'],
    ['Weil 16 die größte Hex-Ziffer ist.', 'Die größte Hex-Ziffer ist F = 15.'],
  ], 0)],
  tipp: 'Durch welche Zahl teilt man beim Umwandeln ins Dualsystem – und warum?',
  loesung: '<p>Beim Divisionsrestverfahren teilt man immer durch die <b>Basis des Zielsystems</b>: ins Dualsystem durch 2, ins Hexadezimalsystem durch 16. Die Reste (0 bis 15) sind die Ziffern des Ergebnisses.</p>',
});

U('E', 3, 1, 2, 10, 16, 26);
U('E', 3, 1, 2, 10, 16, 47);
U('E', 3, 1, 2, 10, 16, 100);
U('E', 3, 2, 3, 10, 16, 171);
U('E', 3, 2, 3, 10, 16, 255);
U('E', 3, 2, 3, 10, 16, 500);
U('E', 3, 3, 4, 10, 16, 2024);

H('E', 4, 3, 4, {
  titel: 'Sechzehnerpotenz ± 1',
  frage: `Es gilt ${D(4096)} = ${X('1000')}. <b>Untersuche</b> den Zusammenhang und gib ohne Divisionsrestverfahren an, wie 4095 und 4097 hexadezimal lauten.`,
  felder: [
    zahlFeld(16, 4095, { vor: `${D(4095)} =` }),
    zahlFeld(16, 4097, { vor: `${D(4097)} =` }),
  ],
  tipp: '4096 = 16³. Was ergibt 1000₁₆ − 1? Denke an 1000 − 1 = 999 im Dezimalsystem.',
  loesung: `<p>4096 = 16³ → ${X('1000')}.</p><ul><li>4095 = 4096 − 1: Alle drei unteren Stellen werden zur größten Ziffer F → ${X('FFF')}.</li><li>4097 = 4096 + 1 → ${X('1001')}.</li></ul><p class="merke-kurz">Wie im Dezimalsystem (1000 − 1 = 999): Die größte Ziffer heißt hier F.</p>`,
});

H('E', 5, 2, 4, {
  titel: 'Jans Ergebnis beurteilen',
  frage: `Jan wandelt ${D(190)} um: 190 : 16 = 11 Rest 14; 11 : 16 = 0 Rest 11. Er schreibt das Ergebnis ${X('1114')}. <b>Beurteile</b> Jans Ergebnis und gib die richtige Hexadezimalzahl an.`,
  felder: [
    wahlFeld([
      ['Jans Ergebnis ist richtig.', '1114₁₆ wäre 4372 – viel zu groß für 190.'],
      ['Die Divisionen stimmen, aber die Reste 11 und 14 müssen als Hex-Ziffern B und E geschrieben werden.', 'Richtig erkannt.'],
      ['Jan hätte durch 2 teilen müssen.', 'Für das Hexadezimalsystem teilt man durch 16.'],
      ['Jan hat die Reste falsch herum gelesen; richtig wäre 1411₁₆.', 'Die Leserichtung stimmt. Das Problem sind die zweistelligen Reste.'],
    ], 1),
    zahlFeld(16, 190, { vor: 'Richtige Hexadezimalzahl:' }),
  ],
  tipp: 'Wie viele Hex-Ziffern liefert ein einzelner Rest?',
  loesung: `${htmlDivisionsrest(wegDivisionsrest(190, 16))}<p>Jeder Rest ist genau <b>eine</b> Hex-Ziffer: 11 = B, 14 = E → <b>${X('BE')}</b>. Probe: 11·16 + 14 = 190 ✓. Jans ${X('1114')} wäre 4096 + 256 + 16 + 4 = 4372.</p>`,
});

/* ================================================================== */
/* F – Hexadezimal ↔ Dual                                              */
/* ================================================================== */

H('F', 1, 1, 2, {
  titel: 'Tetraden',
  frage: '<b>Gib</b> zu jeder Hex-Ziffer die Tetrade (4 Bit) <b>an</b>.',
  felder: [
    zahlFeld(2, 5, { vor: `${X('5')} →`, stellen: 4 }),
    zahlFeld(2, 9, { vor: `${X('9')} →`, stellen: 4 }),
    zahlFeld(2, 12, { vor: `${X('C')} →`, stellen: 4 }),
    zahlFeld(2, 15, { vor: `${X('F')} →`, stellen: 4 }),
  ],
  tipp: 'Zerlege den Wert der Hex-Ziffer in die Stellenwerte 8, 4, 2 und 1. Beispiel: 6 = 4 + 2 → 0110.',
  loesung: `<p>5 = 4 + 1 → 0101; 9 = 8 + 1 → 1001; C = 12 = 8 + 4 → 1100; F = 15 = 8 + 4 + 2 + 1 → 1111.</p>${htmlHexTabelle({ kompakt: true })}`,
});

H('F', 2, 1, 2, {
  titel: 'Warum genau 4 Bit?',
  frage: '<b>Erkläre</b>: Warum entspricht eine Hex-Ziffer genau 4 Bit?',
  felder: [wahlFeld([
    ['Weil 2⁴ = 16 ist – mit 4 Bit gibt es genau 16 Bitmuster, eins für jede Hex-Ziffer.', 'Genau.'],
    ['Weil ein Byte aus 4 Bit besteht.', 'Ein Byte hat 8 Bit = 2 Hex-Ziffern.'],
    ['Weil Hexadezimalzahlen höchstens vier Stellen haben.', 'Hexadezimalzahlen können beliebig viele Stellen haben.'],
    ['Weil 4 · 4 = 16 ist.', 'Entscheidend ist 2 · 2 · 2 · 2 = 2⁴ = 16: vier Bit mit je zwei Zuständen.'],
  ], 0)],
  tipp: 'Wie viele verschiedene Bitmuster gibt es mit 4 Bit?',
  loesung: '<p>Vier Bit haben 2 · 2 · 2 · 2 = 2⁴ = 16 Kombinationen (0000 bis 1111 = 0 bis 15) – genau so viele, wie es Hex-Ziffern gibt. Deshalb kann man jede Hex-Ziffer einzeln in vier Bit übersetzen, ohne zu rechnen.</p>',
});

U('F', 3, 1, 2, 16, 2, 0x3a);
U('F', 3, 1, 2, 16, 2, 0x7f);
U('F', 3, 2, 3, 16, 2, 0xc5);
U('F', 3, 2, 3, 16, 2, 0x2b9);
U('F', 3, 3, 4, 16, 2, 0xf0a3);
U('F', 3, 1, 2, 2, 16, 0b11010110);
U('F', 3, 2, 3, 2, 16, 0b10111110);
U('F', 3, 2, 3, 2, 16, 0b1011001111);
U('F', 3, 3, 4, 2, 16, 0b1000000011110);

H('F', 4, 2, 4, {
  titel: 'Saras Vierergruppen',
  frage: `Sara wandelt ${B('101101')} ins Hexadezimalsystem um. Sie teilt so auf: 1011 | 01 und erhält ${X('B1')}. <b>Untersuche</b> Saras Vorgehen: Welcher Fehler ist passiert? Gib das richtige Ergebnis an.`,
  felder: [
    wahlFeld([
      ['Sie hat die Vierergruppen von links gebildet – richtig ist von rechts: 10 | 1101.', 'Richtig erkannt.'],
      ['Sie hat 1011 falsch übersetzt; 1011 ist D.', '1011 = 8 + 2 + 1 = 11 = B ist richtig übersetzt.'],
      ['Kein Fehler – B1₁₆ ist richtig.', 'B1₁₆ = 177, aber 101101₂ = 45.'],
      ['Sie hätte die Zahl zuerst ins Dezimalsystem umwandeln müssen.', 'Der Umweg ist möglich, aber nicht nötig – Vierergruppen sind der direkte Weg.'],
    ], 0),
    zahlFeld(16, 45, { vor: 'Richtiges Ergebnis:' }),
  ],
  tipp: 'Wo beginnt man beim Gruppieren – beim größten oder beim kleinsten Stellenwert?',
  loesung: `${htmlDualZuHex(wegDualZuHex('101101'))}<p>Die Gruppen beginnen immer rechts beim kleinsten Stellenwert; fehlende Stellen links füllt man mit Nullen auf. Probe: ${X('2D')} = 2·16 + 13 = 45 = ${B('101101')} ✓.</p>`,
});

/* ================================================================== */
/* G – Addition von Dualzahlen                                         */
/* ================================================================== */

H('G', 1, 1, 2, {
  titel: 'Additionsregeln',
  frage: '<b>Gib</b> die Ergebnisse als Dualzahl <b>an</b>.',
  felder: [
    zahlFeld(2, 1, { vor: `${B('0')} + ${B('1')} =` }),
    zahlFeld(2, 2, { vor: `${B('1')} + ${B('1')} =` }),
    zahlFeld(2, 3, { vor: `${B('1')} + ${B('1')} + ${B('1')} =` }),
  ],
  tipp: '1 + 1 = 2. Wie schreibt man 2 im Dualsystem?',
  loesung: `<table class="regeltabelle"><tr><td>0 + 0</td><td>= 0</td><td></td></tr><tr><td>0 + 1</td><td>= 1</td><td></td></tr><tr><td>1 + 1</td><td>= ${B('10')}</td><td>schreibe 0, Übertrag 1</td></tr><tr><td>1 + 1 + 1</td><td>= ${B('11')}</td><td>schreibe 1, Übertrag 1</td></tr></table>`,
});

H('G', 2, 1, 2, {
  titel: 'Warum ein Übertrag?',
  frage: `<b>Erkläre</b>: Warum entsteht bei ${B('1')} + ${B('1')} ein Übertrag?`,
  felder: [wahlFeld([
    [`Weil die Summe 2 im Dualsystem keine einzelne Ziffer hat: 2 = ${B('10')} → schreibe 0, Übertrag 1.`, 'Genau.'],
    ['Weil 1 + 1 im Dualsystem 0 ergibt.', 'In der Stelle steht zwar 0, aber die 1 wandert als Übertrag weiter – der Wert 2 geht nicht verloren.'],
    ['Weil man im Dualsystem immer einen Übertrag hat.', 'Bei 0 + 1 = 1 entsteht kein Übertrag.'],
    [`Weil 1 + 1 = ${B('11')} ist.`, '11₂ = 3. Es gilt 1 + 1 = 10₂ = 2.'],
  ], 0)],
  tipp: 'Denke an 9 + 1 im Dezimalsystem.',
  loesung: '<p>Im Dualsystem gibt es nur 0 und 1. Die Summe 2 passt nicht in eine Stelle: 2 = 10₂. In der Stelle bleibt die 0, die 1 wird als Übertrag in die nächste Stelle (doppelter Stellenwert) mitgenommen – genau wie bei 9 + 1 = 10 im Dezimalsystem.</p>',
});

ADD('G', 3, 1, 2, '1010', '0101');
ADD('G', 3, 1, 2, '0110', '0011');
ADD('G', 3, 1, 2, '1011', '0110');
ADD('G', 3, 2, 3, '11011010', '00110101');
ADD('G', 3, 2, 3, '01110111', '01011001');
ADD('G', 3, 2, 3, '1111', '1111');
ADD('G', 3, 3, 4, '101101101101', '011011010111');

H('G', 4, 2, 4, {
  titel: 'Überlauf im 8-Bit-Register',
  frage: `Ein 8-Bit-Register enthält ${B('11001000')}. Dazu wird ${B('01010000')} addiert. <b>Berechne</b> die Summe und <b>untersuche</b>, ob das Ergebnis noch in das 8-Bit-Register passt.`,
  felder: [
    zahlFeld(2, 280, { vor: 'Summe:', diag: { op: '+', a: '11001000', b: '01010000' } }),
    wahlFeld([
      ['Ja, das Ergebnis passt.', 'Mit 8 Bit kann man höchstens 255 darstellen.'],
      ['Nein – das Ergebnis braucht 9 Bit (Überlauf).', 'Richtig erkannt.'],
    ], 1, { vor: 'Passt es?' }),
  ],
  tipp: 'Mit 8 Bit kann man höchstens 1111 1111₂ = 255 darstellen.',
  loesung: `${htmlAddition(wegAddition('11001000', '01010000'))}<p>200 + 80 = 280 &gt; 255: Das Ergebnis braucht <b>9 Bit</b>. Im Register bleiben nur die unteren 8 Bit (${B('00011000')} = 24) – das 9. Bit geht verloren bzw. wird als Übertragsbit („Carry“) gemeldet. Man spricht von einem <b>Überlauf</b>.</p>`,
});

H('G', 5, 2, 3, {
  titel: 'Lukas’ Behauptung',
  frage: '<b>Beurteile</b> die Behauptung von Lukas: „Die Summe zweier 4-Bit-Dualzahlen hat höchstens 5 Bit.“',
  felder: [wahlFeld([
    [`Stimmt: Die größte Summe ist ${B('1111')} + ${B('1111')} = ${B('11110')} (15 + 15 = 30) – das sind 5 Bit.`, 'Genau.'],
    ['Stimmt nicht: 1111₂ + 1111₂ ergibt 8 Bit.', 'Rechne nach: 15 + 15 = 30 = 11110₂.'],
    ['Stimmt nicht: Die Summe hat immer genau 4 Bit.', '1000₂ + 1000₂ = 10000₂ hat schon 5 Bit.'],
    ['Stimmt nur, wenn kein Übertrag entsteht.', 'Ohne Übertrag hat die Summe sogar höchstens 4 Bit – mit Überträgen höchstens 5.'],
  ], 0)],
  tipp: 'Teste den extremsten Fall: die beiden größten 4-Bit-Zahlen.',
  loesung: `${htmlAddition(wegAddition('1111', '1111'))}<p>Die größte 4-Bit-Zahl ist ${B('1111')} = 15. Die größte mögliche Summe ist 15 + 15 = 30 = ${B('11110')} → <b>5 Bit</b>.</p><p class="merke-kurz">Die Summe zweier n-Bit-Zahlen hat höchstens n + 1 Bit.</p>`,
});

H('G', 6, 3, 6, {
  typ: 'konstruktion',
  titel: 'Summe mit lauter Überträgen',
  frage: `<b>Konstruiere</b> zwei 4-Bit-Dualzahlen, deren Summe ${B('10010')} ist und bei deren Addition in <i>jeder</i> der vier Stellen ein Übertrag entsteht.`,
  felder: [
    zahlFeld(2, 0b1011, { vor: '1. Summand:', stellen: 4 }),
    zahlFeld(2, 0b0111, { vor: '2. Summand:', stellen: 4 }),
  ],
  regel: { name: 'summeUebertraege', summe: 0b10010, bits: 4 },
  tipp: 'Arbeite von rechts: In der Stelle 2⁰ muss 1 + 1 stehen, damit ein Übertrag entsteht und die Ergebnisziffer 0 ist. Überlege dann Stelle für Stelle weiter.',
  loesung: `<ul><li>Stelle 2⁰: Ergebnis 0 und Übertrag → 1 + 1.</li><li>Stelle 2¹: Ergebnis 1 und Übertrag, es kommt 1 dazu → 1 + 1 + 1.</li><li>Stellen 2² und 2³: Ergebnis 0 und Übertrag, es kommt 1 dazu → in jeder dieser Stellen hat genau ein Summand eine 1.</li></ul><p>Es gibt vier Lösungen: ${B('1011')} + ${B('0111')}, ${B('0111')} + ${B('1011')}, ${B('1111')} + ${B('0011')} und ${B('0011')} + ${B('1111')}.</p>${htmlAddition(wegAddition('1011', '0111'))}<p>Probe: 11 + 7 = 18 = ${B('10010')} ✓</p>`,
  beispiel: 'z. B. 1011₂ + 0111₂',
});

/* ================================================================== */
/* H – Subtraktion von Dualzahlen                                      */
/* ================================================================== */

H('H', 1, 1, 2, {
  titel: 'Subtraktionsregeln',
  frage: '<b>Gib</b> die Ergebnisse als Dualzahl <b>an</b>.',
  felder: [
    zahlFeld(2, 1, { vor: `${B('1')} − ${B('0')} =` }),
    zahlFeld(2, 0, { vor: `${B('1')} − ${B('1')} =` }),
    zahlFeld(2, 1, { vor: `${B('10')} − ${B('1')} =` }),
  ],
  tipp: '10₂ ist die Zahl 2.',
  loesung: `<table class="regeltabelle"><tr><td>0 − 0</td><td>= 0</td><td></td></tr><tr><td>1 − 0</td><td>= 1</td><td></td></tr><tr><td>1 − 1</td><td>= 0</td><td></td></tr><tr><td>0 − 1</td><td>= 1</td><td>mit Entleihung: ${B('10')} − 1 = 1</td></tr></table>`,
});

H('H', 2, 1, 2, {
  titel: 'Was heißt Entleihen?',
  frage: '<b>Erkläre</b>: Was bedeutet „Entleihen“ bei 0 − 1 im Dualsystem?',
  felder: [wahlFeld([
    [`Man nimmt eine 1 aus der nächsthöheren Stelle; sie ist in der aktuellen Stelle 2 wert: ${B('10')} − ${B('1')} = ${B('1')}.`, 'Genau.'],
    ['Man schreibt bei 0 − 1 einfach −1 in die Stelle.', 'Im Dualsystem gibt es nur die Ziffern 0 und 1 – negative Ziffern gibt es nicht.'],
    ['Man vertauscht in dieser Stelle Minuend und Subtrahend.', 'Dann rechnet man 1 − 0 – das ergibt ein falsches Ergebnis.'],
    ['Man leiht sich 10 aus der nächsten Stelle, wie im Dezimalsystem.', 'Im Dezimalsystem ist die geliehene 1 zehn wert, im Dualsystem nur zwei.'],
  ], 0)],
  tipp: 'Welchen Wert hat eine 1 der nächsthöheren Stelle, gemessen an der aktuellen Stelle?',
  loesung: '<p>Bei 0 − 1 reicht die Ziffer nicht. Man entleiht eine 1 aus der nächsthöheren Stelle. Weil diese Stelle den doppelten Stellenwert hat, zählt die geliehene 1 hier als 2: 2 − 1 = 1. In der nächsten Stelle wird die Entleihung zusätzlich abgezogen.</p>',
});

SUB('H', 3, 1, 2, '1111', '0101');
SUB('H', 3, 1, 2, '1101', '0110');
SUB('H', 3, 1, 2, '10110', '01011');
SUB('H', 3, 2, 3, '11001010', '01010110');
SUB('H', 3, 2, 3, '10000000', '00000001');
SUB('H', 3, 2, 3, '10110001', '01101111');
SUB('H', 3, 3, 4, '100000000', '01010101');

H('H', 4, 2, 4, {
  titel: 'Umkehraufgabe',
  frage: `<b>Bestimme</b> die Dualzahl x: x + ${B('0110')} = ${B('10011')}`,
  felder: [zahlFeld(2, 0b1101, { vor: 'x =', diag: { op: '−', a: '10011', b: '00110' } })],
  tipp: 'Die Umkehrung der Addition ist die Subtraktion: x = 1 0011₂ − 0110₂.',
  loesung: (() => {
    const w = wegSubtraktion('10011', '00110');
    return `<p>x = ${B('10011')} − ${B('0110')}:</p>${htmlSubtraktion(w)}${htmlProbeSubtraktion(w)}<p>x = <b>${B('1101')}</b> (19 − 6 = 13).</p>`;
  })(),
});

H('H', 5, 2, 4, {
  titel: 'Pauls Ergebnis prüfen',
  frage: `Paul rechnet: ${B('1101')} − ${B('0111')} = ${B('1010')}. <b>Prüfe</b> Pauls Ergebnis mit einer Probe und <b>beurteile</b> es. Gib das richtige Ergebnis an.`,
  felder: [
    wahlFeld([
      ['Richtig – die Probe geht auf.', 'Mach die Probe: 1010₂ + 0111₂ = 1 0001₂ – das ist nicht 1101₂.'],
      [`Falsch – Paul hat die Entleihungen vergessen; die Probe ${B('1010')} + ${B('0111')} = ${B('10001')} ≠ ${B('1101')} zeigt den Fehler.`, 'Richtig erkannt.'],
      ['Falsch – 0111₂ ist größer als 1101₂, weil sie mehr Einsen hat.', 'Entscheidend ist der Wert: 1101₂ = 13 > 7 = 0111₂.'],
      ['Falsch – Paul hätte von links nach rechts rechnen müssen.', 'Schriftlich rechnet man immer von rechts nach links.'],
    ], 1),
    zahlFeld(2, 6, { vor: 'Richtiges Ergebnis:', diag: { op: '−', a: '1101', b: '0111' } }),
  ],
  tipp: 'Probe: Ergebnis + Subtrahend muss den Minuenden ergeben.',
  loesung: (() => {
    const w = wegSubtraktion('1101', '0111');
    const p = wegAddition('1010', '0111');
    return `<p>Probe von Pauls Ergebnis:</p>${htmlAddition(p, { beschriftung: false })}<p>${B('10001')} ≠ ${B('1101')} → Pauls Ergebnis ist falsch. Er hat in jeder Stelle einfach „die kleinere von der größeren Ziffer“ abgezogen und die Entleihungen vergessen.</p><p>Richtig:</p>${htmlSubtraktion(w)}${htmlProbeSubtraktion(w)}<p>Ergebnis: <b>${B('0110')}</b> (13 − 7 = 6).</p>`;
  })(),
});

H('H', 6, 3, 6, {
  typ: 'konstruktion',
  titel: 'Eigene Subtraktionsaufgabe',
  frage: '<b>Erfinde</b> eine Subtraktionsaufgabe mit zwei 6-Bit-Dualzahlen (Minuend größer als Subtrahend), bei der beim schriftlichen Rechnen <i>genau zweimal</i> entliehen wird. Gib Minuend, Subtrahend und Differenz an.',
  felder: [
    zahlFeld(2, 0b101010, { vor: 'Minuend:', stellen: 6 }),
    zahlFeld(2, 0b000101, { vor: 'Subtrahend:', stellen: 6 }),
    zahlFeld(2, 0b100101, { vor: 'Differenz:', stellen: 6 }),
  ],
  regel: { name: 'subtraktionEntleihungen', bits: 6, entleihungen: 2 },
  tipp: 'Eine Entleihung entsteht, wenn oben 0 und unten 1 steht – oder wenn nach einer Entleihung die Ziffer nicht mehr reicht. Plane die Stellen von rechts nach links und rechne am Ende nach.',
  loesung: (() => {
    const w = wegSubtraktion('101010', '000101');
    return `<p>Ein mögliches Beispiel (es gibt viele):</p>${htmlSubtraktion(w)}<p>Entleihungen entstehen in den Stellen 2⁰ (0 − 1) und 2² (0 − 1); in den Stellen 2¹ und 2³ wird die Entleihung ohne neue Entleihung abgezogen (1 − 0 − 1 = 0). Also genau <b>zwei</b> Entleihungen.</p>${htmlProbeSubtraktion(w)}<p>${B('101010')} − ${B('000101')} = ${B('100101')} (42 − 5 = 37).</p>`;
  })(),
  beispiel: 'z. B. 101010₂ − 000101₂ = 100101₂',
});

/* ================================================================== */
/* I – Gemischte Aufgaben und Anwendungen                              */
/* ================================================================== */

H('I', 3, 2, 6, {
  titel: 'Umrechnungstabelle',
  frage: '<b>Vervollständige</b> die Tabelle: In jeder Zeile steht dieselbe Zahl in drei Zahlensystemen.',
  layout: {
    art: 'tabelle',
    kopf: ['Dezimal', 'Dual', 'Hexadezimal'],
    zeilen: [
      [{ t: D(45) }, { f: 'f1' }, { f: 'f2' }],
      [{ f: 'f3' }, { t: B('11001000') }, { f: 'f4' }],
      [{ f: 'f5' }, { f: 'f6' }, { t: X('7B') }],
    ],
  },
  felder: [
    zahlFeld(2, 45, { diag: { von: 10, nach: 2, n: 45, text: '45' } }),
    zahlFeld(16, 45, { diag: { von: 10, nach: 16, n: 45, text: '45' } }),
    zahlFeld(10, 200, { diag: { von: 2, nach: 10, n: 200, text: '11001000' } }),
    zahlFeld(16, 200, { diag: { von: 2, nach: 16, n: 200, text: '11001000' } }),
    zahlFeld(10, 123, { diag: { von: 16, nach: 10, n: 123, text: '7B' } }),
    zahlFeld(2, 123, { diag: { von: 16, nach: 2, n: 123, text: '7B' } }),
  ],
  tipp: 'Nutze den kürzesten Weg: Zwischen Dual und Hex über Tetraden, ins Dezimalsystem über Stellenwerte.',
  loesung: `<h4>Zeile 1: ${D(45)}</h4>${htmlDivisionsrest(wegDivisionsrest(45, 2))}${htmlDualZuHex(wegDualZuHex('101101'))}
<h4>Zeile 2: ${B('11001000')}</h4><p>128 + 64 + 8 = <b>200</b>; Tetraden 1100 | 1000 → <b>${X('C8')}</b></p>
<h4>Zeile 3: ${X('7B')}</h4><p>7·16 + 11 = 112 + 11 = <b>123</b>; Tetraden 7 → 0111, B → 1011 → <b>${B('1111011')}</b></p>`,
});

H('I', 3, 2, 3, {
  titel: 'Farbcode einer Webseite',
  frage: `Webfarben werden als Hexadezimalzahl #RRGGBB angegeben: je ein Byte für Rot, Grün und Blau. <b>Berechne</b> die Dezimalwerte der Farbe <span class="farbprobe" style="--farbe:#1E90FF"></span> <b>#1E90FF</b>.`,
  felder: [
    zahlFeld(10, 0x1e, { vor: `Rot (${X('1E')}):`, diag: { von: 16, nach: 10, n: 0x1e, text: '1E' } }),
    zahlFeld(10, 0x90, { vor: `Grün (${X('90')}):`, diag: { von: 16, nach: 10, n: 0x90, text: '90' } }),
    zahlFeld(10, 0xff, { vor: `Blau (${X('FF')}):`, diag: { von: 16, nach: 10, n: 0xff, text: 'FF' } }),
  ],
  tipp: 'Jedes Byte besteht aus zwei Hex-Ziffern: erste Ziffer · 16 + zweite Ziffer.',
  loesung: `<ul><li>Rot: ${X('1E')} = 1·16 + 14 = <b>30</b></li><li>Grün: ${X('90')} = 9·16 + 0 = <b>144</b></li><li>Blau: ${X('FF')} = 15·16 + 15 = <b>255</b></li></ul><p>Jeder Farbanteil reicht von 0 (00₁₆) bis 255 (FF₁₆). Diese Farbe heißt „DodgerBlue“.</p>`,
});

H('I', 3, 2, 3, {
  titel: 'DIP-Schalter ablesen',
  frage: `An einem DMX-Scheinwerfer wird die Startadresse mit DIP-Schaltern eingestellt. Schalter 1 hat den Wert 1, Schalter 2 den Wert 2, Schalter 3 den Wert 4 usw. <b>Berechne</b> die eingestellte Adresse.${htmlDip(9, [1, 2, 5, 7])}`,
  felder: [zahlFeld(10, 83, { vor: 'Adresse:' })],
  tipp: 'Addiere die Werte der Schalter, die auf ON stehen. Achtung: Schalter 1 (Wert 1) ist links – umgekehrt wie beim Schreiben einer Dualzahl.',
  loesung: `<p>ON stehen die Schalter 1, 2, 5 und 7 mit den Werten 1, 2, 16 und 64: 1 + 2 + 16 + 64 = <b>83</b>.</p><p>Als Dualzahl (Schalter 9 links … Schalter 1 rechts): ${B('001010011')} = 83. Am Gerät steht Schalter 1 aber links – die Reihenfolge ist also gespiegelt.</p>`,
});

H('I', 3, 3, 4, {
  titel: 'DIP-Schalter einstellen',
  frage: '<b>Wandle</b> die DMX-Startadresse 300 in eine Dualzahl <b>um</b> und <b>stelle</b> sie an den DIP-Schaltern <b>ein</b>: Tippe die Schalter an, die auf ON stehen müssen (Schalter 1 = Wert 1, links).',
  felder: [bitsFeld(9, [2, 3, 5, 8], (i) => `Schalter ${i + 1}`, { stil: 'dip' })],
  tipp: 'Zerlege 300 in Zweierpotenzen: Welche ist die größte, die hineinpasst? Schalter n hat den Wert 2ⁿ⁻¹.',
  loesung: `${htmlZweierpotenzen(wegZweierpotenzen(300))}<p>300 = 256 + 32 + 8 + 4. Schalter n hat den Wert 2ⁿ⁻¹ → Schalter <b>3</b> (4), <b>4</b> (8), <b>6</b> (32) und <b>9</b> (256) auf ON.</p>${htmlDip(9, [3, 4, 6, 9])}`,
});

H('I', 4, 2, 4, {
  titel: 'SPS-Eingangsbyte deuten',
  frage: `Das Eingangsbyte EB0 einer SPS hat den Wert ${X('A6')}. Bit 7 gehört zum Eingang E0.7, Bit 0 zum Eingang E0.0. <b>Ermittle</b>, welche Eingänge ein 1-Signal haben, und tippe sie an.`,
  felder: [bitsFeld(8, [7, 5, 2, 1], (i) => `E0.${i}`, { stil: 'sps' })],
  tipp: 'Übersetze A und 6 in Tetraden. Jedes Bit gehört zu einem Eingang.',
  loesung: `${htmlHexZuDual(wegHexZuDual('A6'))}<p>${X('A6')} = ${B('10100110')}. Einsen stehen bei Bit 7, 5, 2 und 1 → <b>E0.7, E0.5, E0.2 und E0.1</b> haben ein 1-Signal.</p>`,
});

H('I', 4, 3, 4, {
  titel: 'Der Größe nach ordnen',
  frage: `<b>Ordne</b> die Zahlen der Größe nach, die kleinste zuerst:<br>A = ${B('01100100')}, &nbsp;B = ${X('65')}, &nbsp;C = ${D(99)}, &nbsp;D = ${X('5F')}`,
  felder: [
    listeFeld(['A', 'B', 'C', 'D'], 3, { vor: '1. (kleinste)' }),
    listeFeld(['A', 'B', 'C', 'D'], 2, { vor: '2.' }),
    listeFeld(['A', 'B', 'C', 'D'], 0, { vor: '3.' }),
    listeFeld(['A', 'B', 'C', 'D'], 1, { vor: '4. (größte)' }),
  ],
  tipp: 'Die Zahlen liegen eng beieinander – rechne alle genau ins Dezimalsystem um.',
  loesung: `<ul><li>A = ${B('01100100')} = 64 + 32 + 4 = 100</li><li>B = ${X('65')} = 6·16 + 5 = 101</li><li>C = 99</li><li>D = ${X('5F')} = 5·16 + 15 = 95</li></ul><p>Reihenfolge: <b>D (95) &lt; C (99) &lt; A (100) &lt; B (101)</b></p>`,
});

H('I', 4, 3, 4, {
  titel: 'Rechnen über Systemgrenzen',
  frage: `<b>Berechne</b> ${X('3A')} + ${B('1011')} und gib das Ergebnis als Dezimalzahl und als Hexadezimalzahl an. Wähle selbst einen geschickten Rechenweg.`,
  felder: [
    zahlFeld(10, 69, { vor: 'Dezimal:' }),
    zahlFeld(16, 69, { vor: 'Hexadezimal:' }),
  ],
  tipp: 'Bringe zuerst beide Zahlen in dasselbe System – dezimal oder dual.',
  loesung: `<h4>Weg 1: dezimal</h4><p>${X('3A')} = 3·16 + 10 = 58; ${B('1011')} = 11; 58 + 11 = <b>69</b> = 4·16 + 5 = <b>${X('45')}</b>.</p><h4>Weg 2: dual</h4><p>${X('3A')} = ${B('00111010')}:</p>${htmlAddition(wegAddition('00111010', '00001011'))}<p>${B('01000101')} = ${X('45')} = 69 ✓</p>`,
});

H('I', 5, 2, 3, {
  titel: 'Bens Umweg beurteilen',
  frage: `Ben soll ${X('C3')} ins Dezimalsystem umwandeln. Er rechnet über das Dualsystem: ${X('C3')} = ${B('11000011')} = 128 + 64 + 2 + 1 = ${D(195)}. <b>Beurteile</b> Bens Lösung.`,
  felder: [wahlFeld([
    ['Richtig – der Umweg über das Dualsystem ist erlaubt und liefert 195₁₀.', 'Genau.'],
    ['Falsch – man darf nur direkt mit Sechzehnerpotenzen rechnen.', 'Jeder richtige Weg ist erlaubt. Direkt: 12·16 + 3 = 195 – dasselbe Ergebnis.'],
    ['Falsch – C3₁₆ ist nicht 1100 0011₂, sondern 1011 0011₂.', 'C = 12 = 8 + 4 → 1100. Bens Tetraden stimmen.'],
    ['Falsch – das Ergebnis muss 193₁₀ sein.', '128 + 64 + 2 + 1 = 195.'],
  ], 0)],
  tipp: 'Prüfe jeden Schritt einzeln: die Tetraden, dann die Summe der Stellenwerte. Rechne zur Kontrolle direkt.',
  loesung: `<p>Bens Weg ist richtig: C = 1100, 3 = 0011 → ${B('11000011')} = 128 + 64 + 2 + 1 = 195.</p><p>Kontrolle direkt: 12·16 + 3 = 192 + 3 = 195 ✓.</p><p class="merke-kurz">Beide Wege sind gleichwertig. Bei zweistelligen Hex-Zahlen ist der direkte Weg meist kürzer.</p>`,
});

H('I', 5, 3, 4, {
  titel: 'Den geschicktesten Weg wählen',
  frage: `Die Dualzahl ${B('111010110101')} soll ins Hexadezimalsystem umgewandelt werden. <b>Entscheide</b>, welcher Weg am geschicktesten ist, und gib das Ergebnis an.`,
  felder: [
    wahlFeld([
      ['Direkt über Tetraden: jede Vierergruppe in eine Hex-Ziffer übersetzen.', 'Genau – ganz ohne Division.'],
      ['Erst ins Dezimalsystem umrechnen, dann fortgesetzt durch 16 teilen.', 'Das geht, ist aber viel länger und fehleranfälliger.'],
      ['Erst ins Dezimalsystem, dann mit Zweierpotenzen zurück.', 'Damit landet man wieder im Dualsystem – nicht im Hexadezimalsystem.'],
      ['Ohne Taschenrechner ist das nicht möglich.', 'Mit Tetraden geht es im Kopf: 1110 = E, 1011 = B, 0101 = 5.'],
    ], 0),
    zahlFeld(16, 0xeb5, { vor: 'Ergebnis:', diag: { von: 2, nach: 16, n: 0xeb5, text: '111010110101' } }),
  ],
  tipp: 'Welcher Zusammenhang besteht zwischen 16 und 2?',
  loesung: `${htmlDualZuHex(wegDualZuHex('111010110101'))}<p>Weil 16 = 2⁴ ist, entspricht jede Vierergruppe genau einer Hex-Ziffer. Der Weg über das Dezimalsystem (${dez(3765)}) wäre deutlich länger.</p>`,
});

H('I', 6, 3, 6, {
  typ: 'konstruktion',
  titel: 'Bitmuster konstruieren',
  frage: `<b>Konstruiere</b> eine 8-Bit-Dualzahl, die genau vier Einsen enthält und größer als ${D(200)} ist. Gib sie auch hexadezimal an.`,
  felder: [
    zahlFeld(2, 0b11100001, { vor: 'Dualzahl (8 Bit):', stellen: 8 }),
    zahlFeld(16, 0xe1, { vor: 'Hexadezimal:' }),
  ],
  regel: { name: 'bitmuster', bits: 8, einsen: 4, groesserAls: 200 },
  tipp: 'Damit die Zahl größer als 200 wird, müssen die höchsten Bits 1 sein. Wie viele Einsen bleiben dann noch übrig?',
  loesung: `<p>Die beiden höchsten Bits müssen 1 sein (128 + 64 = 192), sonst bleibt die Zahl unter 200. Mit den zwei übrigen Einsen muss man über 200 kommen, z. B.:</p><ul><li>${B('11100001')} = 225 = ${X('E1')}</li><li>${B('11010001')} = 209 = ${X('D1')}</li><li>${B('11001001')} = 201 = ${X('C9')}</li><li>${B('11110000')} = 240 = ${X('F0')}</li></ul><p>Insgesamt gibt es 12 Lösungen. ${B('11000110')} = 198 wäre zu klein.</p>`,
  beispiel: 'z. B. 1110 0001₂ = E1₁₆',
});

/* ------------------------------------------------------------------ */

const ZAEHLER = {};
LISTE.forEach((a, i) => {
  ZAEHLER[a.kap] = (ZAEHLER[a.kap] || 0) + 1;
  a.nr = i + 1;
  a.id = `${a.kap}${ZAEHLER[a.kap]}`;
});

export const AUFGABEN = LISTE;
