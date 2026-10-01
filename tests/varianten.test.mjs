// varianten.test.mjs – neue Zahlen und Prüfungen zusammenstellen
import { test, gleich, wahr, htmlAusgewogen } from './harness.mjs';
import { ALLE_AUFGABEN, pool } from '../js/themen/index.js';
import { zufall, variante, hatVarianten, mische, mischeOptionen } from '../js/kern/varianten.js';
import { stellePruefungZusammen, ersetzeAufgabe, parallelGruppe, VORLAGEN, verfuegbar, verteilung } from '../js/kern/pruefungsplan.js';
import { pruefeAufgabe, musterAntworten } from '../js/kern/pruefen.js';
import { nachBasis, wegAddition, wegSubtraktion } from '../js/kern/zahlen.js';
import { stufeVon } from '../js/kern/taxonomie.js';

const AUFGABEN = ALLE_AUFGABEN.filter((a) => a.thema === 'zahlensysteme');

test('Zufall ist reproduzierbar', () => {
  const a = zufall(42);
  const b = zufall(42);
  for (let i = 0; i < 100; i++) gleich(a(), b());
  const c = zufall(43);
  wahr(zufall(42)() !== c());
  gleich(mische([1, 2, 3, 4, 5], zufall(7)).slice().sort().join(), '1,2,3,4,5');
});

test('Varianten aller Rechenaufgaben: gültig, gleich lang, gleiche Art', () => {
  const rechen = AUFGABEN.filter(hatVarianten);
  gleich(rechen.length, 53, 'Anzahl Rechenaufgaben');
  for (const a of rechen) {
    for (let s = 1; s <= 40; s++) {
      const v = variante(a, zufall(s * 7919 + a.nr));
      const t = `Aufgabe ${a.nr}, Startwert ${s}`;
      gleich(v.typ, a.typ, t);
      gleich(v.k, a.k, t);
      gleich(v.punkte, a.punkte, t);
      gleich(pruefeAufgabe(v, musterAntworten(v)).status, 'richtig', t);
      htmlAusgewogen(v.loesung, t);
      if (a.typ === 'umwandlung') {
        const p = a.param;
        const q = v.param;
        gleich(q.von, p.von, t);
        gleich(q.nach, p.nach, t);
        const bezug = p.von === 10 ? p.nach : p.nach === 10 ? p.von : 2;
        gleich(nachBasis(q.wert, bezug).length, nachBasis(p.wert, bezug).length, t + ' Stellen');
      } else {
        gleich(v.param.a.length, a.param.a.length, t);
        gleich(v.param.b.length, a.param.b.length, t);
        if (a.typ === 'addition') {
          const o = wegAddition(a.param.a, a.param.b);
          const w = wegAddition(v.param.a, v.param.b);
          gleich(w.endUebertrag, o.endUebertrag, t + ' Endübertrag');
          if (o.uebertraege === 0) gleich(w.uebertraege, 0, t);
          else wahr(w.uebertraege >= 1, t);
        } else {
          wahr(parseInt(v.param.a, 2) >= parseInt(v.param.b, 2), t + ' a ≥ b');
          const o = wegSubtraktion(a.param.a, a.param.b);
          const w = wegSubtraktion(v.param.a, v.param.b);
          if (o.entleihungen === 0) gleich(w.entleihungen, 0, t);
          else wahr(w.entleihungen >= 1, t);
        }
      }
    }
  }
});

test('Andere Aufgaben bleiben bei „Variante“ unverändert', () => {
  for (const a of AUFGABEN.filter((x) => !hatVarianten(x))) gleich(variante(a, zufall(1)), a);
});

test('Prüfung nach Vorlage: Taxonomie-Plan wird eingehalten', () => {
  for (const [name, v] of Object.entries(VORLAGEN)) {
    for (let s = 1; s <= 25; s++) {
      const p = stellePruefungZusammen({ pool: ALLE_AUFGABEN, plan: v.plan, startwert: s });
      const soll = Object.values(v.plan).reduce((x, y) => x + y, 0);
      gleich(p.aufgaben.length, soll, name);
      const vt = verteilung(p.aufgaben);
      for (let k = 1; k <= 3; k++) gleich(vt.anzahlJeStufe[k], v.plan[k] || 0, `${name} Stufe ${k}`);
      gleich(new Set(p.aufgaben.map((a) => a.nr)).size, soll, 'keine Aufgabe doppelt');
      gleich(vt.summe, p.punkte);
      for (let i = 1; i < p.aufgaben.length; i++) wahr(p.aufgaben[i - 1].ordnung < p.aufgaben[i].ordnung, 'sortiert');
      p.aufgaben.forEach((a) => gleich(pruefeAufgabe(a, musterAntworten(a)).status, 'richtig'));
    }
  }
});

test('Gleicher Startwert → gleiche Prüfung; anderer Startwert → andere', () => {
  const a = stellePruefungZusammen({ pool: ALLE_AUFGABEN, startwert: 4711 });
  const b = stellePruefungZusammen({ pool: ALLE_AUFGABEN, startwert: 4711 });
  const c = stellePruefungZusammen({ pool: ALLE_AUFGABEN, startwert: 4712 });
  const sig = (p) => p.aufgaben.map((x) => x.nr + ':' + JSON.stringify(x.param || '')).join('|');
  gleich(sig(a), sig(b));
  wahr(sig(a) !== sig(c));
});

test('Kapitelauswahl und fehlende Aufgaben werden gemeldet', () => {
  const v = verfuegbar(pool({ zahlensysteme: ['G', 'H'] }));
  gleich(v[3], 6);
  const p = stellePruefungZusammen({ pool: pool({ zahlensysteme: ['A'] }), plan: { 1: 2, 3: 3 }, startwert: 3 });
  gleich(p.aufgaben.length, 3);
  gleich(p.fehlend[3], 2);
  p.aufgaben.forEach((a) => gleich(a.kap, 'A'));
});

test('Aufgabe ersetzen behält die Taxonomiestufe', () => {
  const p = stellePruefungZusammen({ pool: ALLE_AUFGABEN, startwert: 99 });
  for (let i = 0; i < p.aufgaben.length; i++) {
    const neu = ersetzeAufgabe(p.aufgaben, i, { pool: ALLE_AUFGABEN, startwert: 1000 + i });
    gleich(neu.length, p.aufgaben.length);
    const sAlt = p.aufgaben.map((a) => stufeVon(a.k)).sort().join();
    const sNeu = neu.map((a) => stufeVon(a.k)).sort().join();
    gleich(sNeu, sAlt);
  }
});

test('Gruppe B: gleiche Aufgaben, neue Zahlen, Musterlösungen stimmen', () => {
  for (let s = 1; s <= 20; s++) {
    const a = stellePruefungZusammen({ pool: ALLE_AUFGABEN, startwert: s });
    const b = parallelGruppe(a.aufgaben, s + 5000);
    gleich(b.length, a.aufgaben.length);
    b.forEach((x, i) => {
      gleich(x.schluessel, a.aufgaben[i].schluessel);
      gleich(x.k, a.aufgaben[i].k);
      gleich(pruefeAufgabe(x, musterAntworten(x)).status, 'richtig', 'Gruppe B ' + x.schluessel);
    });
  }
});

test('Gemischte Antwortreihenfolge behält die richtige Antwort', () => {
  for (const a of AUFGABEN.filter((x) => x.felder.some((f) => f.art === 'wahl'))) {
    for (let s = 1; s <= 10; s++) {
      const m = mischeOptionen(a, zufall(s));
      a.felder.forEach((f, i) => {
        if (f.art !== 'wahl') return;
        gleich(m.felder[i].optionen[m.felder[i].loesung].text, f.optionen[f.loesung].text, a.schluessel);
      });
    }
  }
});

test('Stufe „schwer“ mischt die Denkprozesse', () => {
  for (let s = 1; s <= 30; s++) {
    const p = stellePruefungZusammen({ pool: ALLE_AUFGABEN, plan: { 1: 0, 2: 0, 3: 3 }, startwert: s });
    const prozesse = new Set(p.aufgaben.map((a) => a.k));
    gleich(prozesse.size, 3, 'Analysieren, Bewerten und Erschaffen je einmal (Startwert ' + s + ')');
  }
});
