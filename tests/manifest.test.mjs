// manifest.test.mjs – kompendium.json (Inhaltsverzeichnis für die Lerndashboards) passt zum Inhalt
import { test, gleich, wahr } from './harness.mjs';
import { manifest, alsText, WURZEL } from '../werkzeuge/manifest.mjs';
import { THEMEN } from '../js/themen/index.js';

test('kompendium.json ist aktuell', () => {
  let gespeichert = null;
  try {
    gespeichert = readFile(`${WURZEL}/kompendium.json`);
  } catch (e) {
    throw new Error('kompendium.json fehlt – erzeugen mit: jsc -m werkzeuge/kompendium-json.mjs');
  }
  wahr(gespeichert === alsText(manifest()), 'kompendium.json ist veraltet – neu erzeugen mit: jsc -m werkzeuge/kompendium-json.mjs');
});

test('Manifest: Summen, Stufen und Sprungadressen', () => {
  const m = manifest();
  gleich(m.format, 1);
  gleich(m.summe.themen, THEMEN.length);
  gleich(m.summe.aufgaben, THEMEN.reduce((n, t) => n + t.aufgaben.length, 0));
  gleich(m.summe.stufen[1] + m.summe.stufen[2] + m.summe.stufen[3], m.summe.aufgaben, 'jede Aufgabe genau einer Stufe');
  gleich(m.taxonomie.map((s) => s.name).join('/'), 'leicht/mittel/schwer');
  for (const t of m.themen) {
    wahr(t.lektionen.length > 0, `${t.id}: keine Lektionen`);
    t.lektionen.forEach((l) => gleich(l.hash, `#/lernen/${t.id}/${l.nr}`, `${t.id} Lektion ${l.nr}`));
    gleich(t.kapitel.reduce((n, k) => n + k.aufgaben, 0), t.aufgaben, `${t.id}: Aufgaben je Kapitel`);
  }
  wahr(m.bereiche.every((b) => b.hash.startsWith('#/')), 'Bereiche brauchen eine #/-Adresse');
});
