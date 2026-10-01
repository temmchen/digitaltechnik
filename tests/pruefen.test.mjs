// pruefen.test.mjs – Eingaben lesen, Felder prüfen, typische Fehler erkennen
import { test, gleich, wahr, enthaelt } from './harness.mjs';
import { leseZahl, pruefeFeld, pruefeAufgabe, diagnose, feldLoesungText } from '../js/kern/pruefen.js';
import { zahlFeld, wahlFeld } from '../js/kern/felder.js';
import { baueUmwandlung, baueAddition, baueSubtraktion } from '../js/themen/zahlensysteme/typen.js';

test('leseZahl: großzügige Schreibweisen', () => {
  gleich(leseZahl('0b1011', 2).wert, 11);
  gleich(leseZahl('1011₂', 2).wert, 11);
  gleich(leseZahl('10 1101', 2).wert, 45);
  gleich(leseZahl('  0010 1101 ', 2).wert, 45);
  gleich(leseZahl('0x2f', 16).wert, 47);
  gleich(leseZahl('2Fh', 16).wert, 47);
  gleich(leseZahl('#2F', 16).wert, 47);
  gleich(leseZahl('$2F', 16).wert, 47);
  gleich(leseZahl('2F₁₆', 16).wert, 47);
  gleich(leseZahl('(2F)', 16).ok, false); // Klammern ohne Index sind keine Schreibweise
  gleich(leseZahl('1.000', 10).wert, 1000);
  gleich(leseZahl('48 879', 10).wert, 48879);
  gleich(leseZahl('1011 (2)', 2).wert, 11);
});

test('leseZahl: verständliche Meldungen bei ungültigen Ziffern', () => {
  enthaelt(leseZahl('102', 2).meldung, 'nur die Ziffern 0 und 1');
  enthaelt(leseZahl('1O1', 2).meldung, 'Ziffer 0');
  enthaelt(leseZahl('1l1', 2).meldung, 'Ziffer 1');
  enthaelt(leseZahl('2G', 16).meldung, 'keine Hexadezimalziffer');
  enthaelt(leseZahl('2F', 10).meldung, 'Dezimalzahl');
  enthaelt(leseZahl('-5', 10).meldung, 'positive');
  enthaelt(leseZahl('2,5', 10).meldung, 'Komma');
  gleich(leseZahl('', 2).leer, true);
  gleich(leseZahl('   ', 2).leer, true);
});

test('Feld mit Stellenvorgabe: Wert richtig, Format falsch', () => {
  const f = zahlFeld(2, 75, { stellen: 8 });
  gleich(pruefeFeld(f, '1001011').status, 'format');
  enthaelt(pruefeFeld(f, '1001011').meldung, '0100 1011');
  gleich(pruefeFeld(f, '0100 1011').status, 'richtig');
  gleich(pruefeFeld(f, '1001010').status, 'falsch');
});

function diag(aufgabe, eingabe) {
  const f = aufgabe.felder[0];
  return pruefeFeld(f, eingabe).meldung;
}

test('Diagnose Dezimal → Dual', () => {
  const a12 = baueUmwandlung({ von: 10, nach: 2, wert: 12 });
  enthaelt(diag(a12, '0011'), 'Reihenfolge');
  enthaelt(diag(a12, '11'), 'Reihenfolge');
  const a45 = baueUmwandlung({ von: 10, nach: 2, wert: 45 });
  enthaelt(diag(a45, '01101'), 'vorderste Stelle');
  enthaelt(diag(a45, '10110'), 'ganz rechts fehlt');
  enthaelt(diag(a45, '101100'), 'Genau ein Bit');
  enthaelt(diag(a45, '45'), 'nur die Ziffern 0 und 1');
});

test('Diagnose Dual → Dezimal', () => {
  const a = baueUmwandlung({ von: 2, nach: 10, wert: 0b110100 });
  enthaelt(diag(a, '11'), 'von links nach rechts');
  const b = baueUmwandlung({ von: 2, nach: 10, wert: 0b1011 });
  enthaelt(diag(b, '22'), 'doppelt');
  enthaelt(diag(b, '1011'), 'Dualzahl');
  enthaelt(diag(b, '9'), 'Summand fehlt'); // 8 + 1, die 2 vergessen
  enthaelt(diag(b, '15'), 'unter dem eine 0 steht'); // 4 zu viel
});

test('Diagnose Hex ↔ Dezimal', () => {
  const a = baueUmwandlung({ von: 16, nach: 10, wert: 0x2af });
  enthaelt(diag(a, '315'), 'Zehnerpotenzen');
  enthaelt(diag(a, '10992'), '16-mal'); // 687 · 16
  const d = baueUmwandlung({ von: 16, nach: 10, wert: 0x64 });
  enthaelt(diag(d, '64'), 'Hexadezimalzahl');
  const e = baueUmwandlung({ von: 10, nach: 16, wert: 190 });
  enthaelt(diag(e, '1114'), 'Buchstaben');
  enthaelt(diag(e, '1411'), 'Zwei Fehler');
  enthaelt(diag(e, 'EB'), 'Reihenfolge');
  enthaelt(diag(e, '190'), 'Dezimalwert');
});

test('Diagnose Hex ↔ Dual', () => {
  const a = baueUmwandlung({ von: 16, nach: 2, wert: 0x1f2 });
  enthaelt(diag(a, '1111110'), 'vier Bit');
  const b = baueUmwandlung({ von: 2, nach: 16, wert: 0b101101 });
  enthaelt(diag(b, 'B1'), 'von links');
  enthaelt(diag(b, 'B4'), 'von links');
});

test('Diagnose Addition und Subtraktion', () => {
  const a = baueAddition({ a: '1011', b: '0110' });
  enthaelt(diag(a, '1101'), 'Überträge vergessen');
  const b = baueAddition({ a: '11011010', b: '00110101' });
  enthaelt(diag(b, '00001111'), 'letzte Übertrag');
  enthaelt(diag(a, '101'), 'addiert'); // 11 − 6 = 5 statt 11 + 6
  const s = baueSubtraktion({ a: '1101', b: '0111' });
  enthaelt(diag(s, '1010'), 'Entleihungen vergessen');
  enthaelt(diag(s, '0111'), 'Probe');
});

test('Einfachauswahl mit Hinweis zur gewählten Antwort', () => {
  const f = wahlFeld([['a', 'gut'], ['b', 'nein, weil …']], 0);
  gleich(pruefeFeld(f, 0).status, 'richtig');
  gleich(pruefeFeld(f, 1).status, 'falsch');
  gleich(pruefeFeld(f, 1).meldung, 'nein, weil …');
  gleich(pruefeFeld(f, null).status, 'leer');
});

test('pruefeAufgabe: Übungsmodus zählt ungültige und unvollständige Eingaben nicht', () => {
  const a = { punkte: 2, felder: [{ id: 'f1', ...zahlFeld(10, 5) }, { id: 'f2', ...zahlFeld(2, 5) }] };
  gleich(pruefeAufgabe(a, { f1: '5', f2: '102' }).status, 'ungueltig');
  gleich(pruefeAufgabe(a, { f1: '5', f2: '' }).status, 'unvollstaendig');
  gleich(pruefeAufgabe(a, {}).status, 'leer');
  const r = pruefeAufgabe(a, { f1: '5', f2: '110' });
  gleich(r.status, 'teilweise');
  gleich(r.punkte, 1);
  gleich(pruefeAufgabe(a, { f1: '5', f2: '' }, 'pruefung').punkte, 1);
  gleich(pruefeAufgabe(a, { f1: '5', f2: '101' }).punkte, 2);
});

test('Lösungstext eines Feldes', () => {
  gleich(feldLoesungText(zahlFeld(2, 75, { stellen: 8 })), '0100 1011₂');
  gleich(feldLoesungText(zahlFeld(16, 255)), 'FF₁₆');
  gleich(feldLoesungText(zahlFeld(10, 48879)), '48879₁₀');
});

test('diagnose liefert bei Zufallsfehlern keinen Absturz', () => {
  for (let n = 1; n < 600; n += 13) {
    for (const [von, nach] of [[10, 2], [2, 10], [16, 10], [10, 16], [16, 2], [2, 16]]) {
      const a = baueUmwandlung({ von, nach, wert: n });
      for (const falsch of [n + 1, n * 3 + 7, 1]) {
        if (falsch === n) continue;
        const r = pruefeFeld(a.felder[0], falsch.toString(nach));
        wahr(r.status === 'falsch', `${von}>${nach} ${n}: ${r.status}`);
        wahr(typeof r.meldung === 'string');
      }
    }
  }
  wahr(typeof diagnose === 'function');
});
