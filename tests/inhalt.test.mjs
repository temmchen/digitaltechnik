// inhalt.test.mjs – Lektionen, Merkhilfe, Werkzeuge und Verweise aller Themen
import { test, gleich, wahr, htmlAusgewogen } from './harness.mjs';
import { THEMEN, WIDGETS } from '../js/themen/index.js';
import { PROZESSE } from '../js/kern/taxonomie.js';

test('Jedes Thema: Lektionen passen zu den Kapiteln', () => {
  for (const t of THEMEN) {
    gleich(t.lektionen.length, t.kapitel.length, t.id + ': je Kapitel eine Lektion');
    t.lektionen.forEach((l, i) => {
      gleich(l.nr, i + 1, `${t.id}: Nummer`);
      wahr(t.kapitel.some((k) => k.id === l.kap && k.lektion === l.nr), `${t.id} Lektion ${l.nr}: Kapitel ${l.kap}`);
      wahr(l.titel && l.untertitel && l.dauer > 0 && l.inhalt.length > 500, `${t.id} Lektion ${l.nr}: Angaben`);
      wahr(l.ziele.length >= 3 && l.ziele.every(([text, k]) => text && PROZESSE.some((s) => s.k === k)), `${t.id} Lektion ${l.nr}: Lernziele`);
    });
  }
});

test('HTML der Lektionen und Merkhilfen ist wohlgeformt', () => {
  for (const t of THEMEN) {
    t.lektionen.forEach((l) => htmlAusgewogen(l.inhalt, `${t.id} Lektion ${l.nr}`));
    htmlAusgewogen(t.merkhilfe(), `${t.id} Merkhilfe`);
  }
});

test('Alle Werkzeuge der Lektionen sind registriert', () => {
  for (const t of THEMEN) {
    for (const l of t.lektionen) {
      for (const m of l.inhalt.matchAll(/data-widget="([^"]+)"/g)) {
        wahr(typeof WIDGETS[m[1]] === 'function', `${t.id} Lektion ${l.nr}: Werkzeug „${m[1]}“ fehlt`);
      }
    }
  }
});

test('Interne Verweise zeigen auf vorhandene Lektionen und Themen', () => {
  for (const t of THEMEN) {
    const texte = [...t.lektionen.map((l) => l.inhalt), t.merkhilfe()];
    for (const text of texte) {
      for (const m of text.matchAll(/#\/lernen\/([a-z0-9-]+)\/(\d+)/g)) {
        const ziel = THEMEN.find((x) => x.id === m[1]);
        wahr(ziel && ziel.lektionen.some((l) => l.nr === Number(m[2])), `Verweis ${m[0]}`);
      }
    }
  }
});

test('Jede Lektion hat mindestens zwei Zwischenüberschriften (Inhaltsverzeichnis)', () => {
  for (const t of THEMEN) {
    for (const l of t.lektionen) wahr((l.inhalt.match(/<h2>/g) || []).length >= 2, `${t.id} Lektion ${l.nr}`);
  }
});
