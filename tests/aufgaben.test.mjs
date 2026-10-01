// aufgaben.test.mjs – alle 100 Aufgaben: Aufbau, Taxonomie, Musterlösungen, Regeln
import { test, gleich, wahr, htmlAusgewogen } from './harness.mjs';
import { THEMEN, ALLE_AUFGABEN, aufgabeNachSchluessel } from '../js/themen/index.js';
import { TAXONOMIE } from '../js/kern/taxonomie.js';
import { pruefeAufgabe, musterAntworten, feldLoesungText, REGELN } from '../js/kern/pruefen.js';
import { nachBasis, wegSubtraktion, einsen } from '../js/kern/zahlen.js';

const ZS = THEMEN.find((t) => t.id === 'zahlensysteme');
const AUFGABEN = ZS.aufgaben;
const KAPITEL = ZS.kapitel;

test('Themenregister: Schlüssel und Ordnung', () => {
  gleich(new Set(ALLE_AUFGABEN.map((a) => a.schluessel)).size, ALLE_AUFGABEN.length);
  gleich(aufgabeNachSchluessel('ZS-37').nr, 37);
  ALLE_AUFGABEN.forEach((a, i) => gleich(a.ordnung, i + 1));
  for (const t of THEMEN) {
    wahr(t.id && t.kuerzel && t.titel && t.kapitel.length && t.lektionen.length && t.aufgaben.length, t.id);
    t.aufgaben.forEach((a) => wahr(t.kapitel.some((k) => k.id === a.kap), `${t.id}: Kapitel ${a.kap}`));
  }
});

test('Genau 100 Aufgaben, Nummern und IDs eindeutig', () => {
  gleich(AUFGABEN.length, 100);
  AUFGABEN.forEach((a, i) => gleich(a.nr, i + 1, 'nr'));
  gleich(new Set(AUFGABEN.map((a) => a.id)).size, 100, 'IDs');
});

test('Verteilung auf Kapitel', () => {
  const soll = { A: 10, B: 12, C: 12, D: 10, E: 10, F: 12, G: 12, H: 12, I: 10 };
  const ist = {};
  AUFGABEN.forEach((a) => { ist[a.kap] = (ist[a.kap] || 0) + 1; });
  for (const k of KAPITEL) gleich(ist[k.id], soll[k.id], 'Kapitel ' + k.id);
});

test('Verteilung auf Taxonomiestufen K1 … K6', () => {
  const ist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  AUFGABEN.forEach((a) => ist[a.k]++);
  gleich(JSON.stringify(ist), JSON.stringify({ 1: 10, 2: 10, 3: 58, 4: 12, 5: 7, 6: 3 }));
  gleich(TAXONOMIE.length, 6);
});

test('Pflichtangaben jeder Aufgabe', () => {
  for (const a of AUFGABEN) {
    const t = `Aufgabe ${a.nr} (${a.id})`;
    wahr(a.titel && a.frage && a.tipp && a.loesung, t + ': Titel/Frage/Tipp/Lösung');
    wahr([1, 2, 3].includes(a.niveau), t + ': Niveau');
    wahr(a.punkte > 0 && a.punkte <= 6 && Number.isInteger(a.punkte * 2), t + ': Punkte');
    wahr(a.felder.length >= 1, t + ': Felder');
    wahr(new Set(a.felder.map((f) => f.id)).size === a.felder.length, t + ': Feld-IDs');
    for (const f of a.felder) {
      if (f.art === 'zahl') {
        wahr(Number.isSafeInteger(f.loesung) && f.loesung >= 0, t + ': Lösung ganzzahlig ≥ 0');
        wahr([2, 10, 16].includes(f.basis), t + ': Basis');
        if (f.stellen) wahr(nachBasis(f.loesung, f.basis).length <= f.stellen, t + ': Stellen');
      }
      if (f.art === 'wahl' || f.art === 'liste') wahr(f.optionen.length >= 2 && f.loesung >= 0 && f.loesung < f.optionen.length, t + ': Auswahl');
      if (f.art === 'mehrfach') wahr(f.loesung.every((i) => i >= 0 && i < f.optionen.length), t + ': Mehrfach');
      if (f.art === 'bits') wahr(f.loesung.every((i) => i >= 0 && i < f.anzahl), t + ': Bits');
    }
  }
});

test('Operator der Aufgabe steht fett im Aufgabentext', () => {
  for (const a of AUFGABEN) wahr(/<b>[A-ZÄÖÜ][a-zäöüß]+(?: [a-zäöüß]+)?<\/b>/.test(a.frage), `Aufgabe ${a.nr}: Operator fehlt`);
});

test('HTML aller Aufgaben ist wohlgeformt', () => {
  for (const a of AUFGABEN) {
    htmlAusgewogen(a.frage, `Frage ${a.nr}`);
    htmlAusgewogen(a.loesung, `Lösung ${a.nr}`);
    htmlAusgewogen(a.tipp, `Tipp ${a.nr}`);
    a.felder.forEach((f) => { if (f.vor) htmlAusgewogen(f.vor, `Feld ${a.nr}`); });
  }
});

test('Musterantworten aller Aufgaben werden als richtig erkannt (volle Punkte)', () => {
  for (const a of AUFGABEN) {
    const r = pruefeAufgabe(a, musterAntworten(a));
    gleich(r.status, 'richtig', `Aufgabe ${a.nr}`);
    gleich(r.punkte, a.punkte, `Punkte ${a.nr}`);
    const p = pruefeAufgabe(a, musterAntworten(a), 'pruefung');
    gleich(p.punkte, a.punkte, `Prüfungsmodus ${a.nr}`);
  }
});

test('Falsche Zahlen werden als falsch erkannt', () => {
  for (const a of AUFGABEN) {
    if (a.regel) continue;
    const m = musterAntworten(a);
    a.felder.forEach((f) => {
      if (f.art !== 'zahl') return;
      const kopie = { ...m, [f.id]: nachBasis(f.loesung + 1, f.basis) };
      const r = pruefeAufgabe(a, kopie);
      wahr(r.felder[f.id].status === 'falsch', `Aufgabe ${a.nr} Feld ${f.id}`);
      wahr(r.status !== 'richtig', `Aufgabe ${a.nr} gesamt`);
    });
  }
});

test('Leere Antworten zählen im Übungsmodus nicht, in der Prüfung mit 0 Punkten', () => {
  for (const a of AUFGABEN) {
    const r = pruefeAufgabe(a, {});
    wahr(!r.zaehlt, `Aufgabe ${a.nr} zählt`);
    gleich(pruefeAufgabe(a, {}, 'pruefung').punkte, 0, `Aufgabe ${a.nr} Punkte`);
  }
});

test('Lösungstexte für den Lösungsschlüssel', () => {
  for (const a of AUFGABEN) a.felder.forEach((f) => wahr(feldLoesungText(f).length > 0, `Aufgabe ${a.nr}`));
});

const g12 = AUFGABEN.find((a) => a.regel && a.regel.name === 'summeUebertraege');
const h12 = AUFGABEN.find((a) => a.regel && a.regel.name === 'subtraktionEntleihungen');
const i10 = AUFGABEN.find((a) => a.regel && a.regel.name === 'bitmuster');

test('K6 Summe mit Überträgen: alle vier Lösungen, typische Fehlversuche', () => {
  for (const [x, y] of [['1011', '0111'], ['0111', '1011'], ['1111', '0011'], ['0011', '1111'], ['111', '1011']]) {
    gleich(pruefeAufgabe(g12, { f1: x, f2: y }).status, 'richtig', `${x}+${y}`);
  }
  gleich(pruefeAufgabe(g12, { f1: '1001', f2: '1001' }).status, 'falsch', '1001+1001 (Summe 18, aber nicht überall Übertrag)');
  gleich(pruefeAufgabe(g12, { f1: '10000', f2: '10' }).status, 'falsch', '5 Bit');
  gleich(pruefeAufgabe(g12, { f1: '1011', f2: '0110' }).status, 'falsch', 'falsche Summe');
  // Vollständige Suche: genau vier Lösungen
  let n = 0;
  for (let a = 0; a < 16; a++) {
    for (let b = 0; b < 16; b++) {
      if (pruefeAufgabe(g12, { f1: a.toString(2), f2: b.toString(2) }).status === 'richtig') n++;
    }
  }
  gleich(n, 4, 'Anzahl Lösungen');
});

test('K6 Subtraktion mit genau zwei Entleihungen', () => {
  gleich(pruefeAufgabe(h12, { f1: '101010', f2: '000101', f3: '100101' }).status, 'richtig');
  gleich(pruefeAufgabe(h12, { f1: '101010', f2: '101', f3: '100101' }).status, 'richtig', 'Subtrahend ohne führende Nullen');
  gleich(pruefeAufgabe(h12, { f1: '111111', f2: '000001', f3: '111110' }).status, 'teilweise', 'keine Entleihung, aber richtig gerechnet');
  gleich(pruefeAufgabe(h12, { f1: '101010', f2: '000101', f3: '100111' }).status, 'teilweise', 'Differenz falsch');
  gleich(pruefeAufgabe(h12, { f1: '11010', f2: '00101', f3: '10101' }).status !== 'richtig', true, 'Minuend nur 5 Bit');
  gleich(pruefeAufgabe(h12, { f1: '000101', f2: '101010', f3: '1' }).status !== 'richtig', true, 'Minuend kleiner');
  // Jede Kombination mit genau zwei Entleihungen und richtiger Differenz wird akzeptiert
  let akzeptiert = 0;
  let erwartet = 0;
  for (let m = 32; m < 64; m += 3) {
    for (let s = 0; s < m; s += 5) {
      const w = wegSubtraktion(m.toString(2), s.toString(2).padStart(6, '0'));
      const ok = w.entleihungen === 2;
      if (ok) erwartet++;
      if (pruefeAufgabe(h12, { f1: m.toString(2), f2: s.toString(2), f3: (m - s).toString(2) }).status === 'richtig') akzeptiert++;
    }
  }
  gleich(akzeptiert, erwartet);
  wahr(erwartet > 10);
});

test('K6 Bitmuster: genau 12 Lösungen über 200 mit vier Einsen', () => {
  let n = 0;
  for (let v = 0; v < 256; v++) {
    const bits = v.toString(2).padStart(8, '0');
    const r = pruefeAufgabe(i10, { f1: bits, f2: v.toString(16) });
    if (r.status === 'richtig') {
      n++;
      wahr(v > 200 && einsen(v) === 4, 'nur gültige Lösungen');
    }
  }
  gleich(n, 12);
  gleich(pruefeAufgabe(i10, { f1: '11100001', f2: 'E2' }).status, 'teilweise', 'Hex passt nicht');
  gleich(pruefeAufgabe(i10, { f1: '11000110', f2: 'C6' }).status, 'teilweise', '198 zu klein (Hex passt)');
  wahr(typeof REGELN.bitmuster === 'function');
});

test('Erklärende Zahlen in Texten stimmen', () => {
  gleich(0x1114, 4372); // E10
  gleich(0xb1, 177); // F12
  gleich(0xeb5, 3765); // I9
  gleich(0b101001011100, 2652); // B9
  gleich(0xbeef, 48879); // D9
  gleich(0b101101101101 + 0b011011010111, 4676); // G9
  gleich(parseInt('1110', 2) * 256 + parseInt('1011', 2) * 16 + 5, 3765);
});
