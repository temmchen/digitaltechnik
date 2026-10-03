// manifest.mjs – Inhaltsverzeichnis des Kompendiums als Daten (Vorlage für kompendium.json)
//
// kompendium.json beschreibt das Kompendium für andere Werkzeuge, z. B. die Lerndashboards im
// Präsentations-Filemanager: Themen, Lektionen mit Sprungadressen und die Zahl der Aufgaben je
// Taxonomiestufe. Geschrieben wird die Datei von werkzeuge/kompendium-json.mjs; der Test
// tests/manifest.test.mjs meldet, wenn sie nicht mehr zum Inhalt passt.

import { THEMEN } from '../js/themen/index.js';
import { STUFEN, stufeVon } from '../js/kern/taxonomie.js';

export const KOPF = {
  titel: 'Digitaltechnik · Kompendium DP1ET',
  klasse: 'DP1ET',
  modul: 'DITEC1',
  schule: 'LTEtt',
  autor: 'Tom Bleyer',
  adresse: 'https://temmchen.github.io/digitaltechnik/',
  repo: 'temmchen/digitaltechnik',
};

/** Die Bereiche der Seite mit ihrer Adresse (Router in js/app.js). */
export const BEREICHE = [
  ['start', 'Start', '#/'],
  ['lernen', 'Lernen', '#/lernen'],
  ['ueben', 'Üben', '#/ueben'],
  ['pruefung', 'Prüfungstraining', '#/pruefung'],
  ['merkhilfe', 'Merkhilfe', '#/merkhilfe'],
  ['lehrer', 'Lehrerbereich', '#/lehrer'],
];

/** Hauptordner des Repos, aus der Adresse dieses Moduls (jsc kennt kein URL-Objekt). */
export const WURZEL = decodeURIComponent(import.meta.url.replace(/^file:\/\//, '')).replace(/\/werkzeuge\/[^/]+$/, '');

function zaehleStufen(aufgaben) {
  const n = { 1: 0, 2: 0, 3: 0 };
  aufgaben.forEach((a) => { n[stufeVon(a.k)]++; });
  return n;
}

export function manifest() {
  const themen = THEMEN.map((t, i) => ({
    nr: i + 1,
    id: t.id,
    kuerzel: t.kuerzel,
    symbol: t.symbol,
    titel: t.titel,
    kurz: t.kurz,
    beschreibung: t.beschreibung,
    stand: t.stand,
    hash: `#/lernen/${t.id}`,
    aufgaben: t.aufgaben.length,
    stufen: zaehleStufen(t.aufgaben),
    kapitel: t.kapitel.map((k) => ({
      id: k.id,
      titel: k.titel,
      lektion: k.lektion,
      aufgaben: t.aufgaben.filter((a) => a.kap === k.id).length,
    })),
    lektionen: t.lektionen.map((l) => ({
      nr: l.nr,
      titel: l.titel,
      untertitel: l.untertitel || '',
      kapitel: l.kap || '',
      hash: `#/lernen/${t.id}/${l.nr}`,
    })),
  }));
  const alle = THEMEN.flatMap((t) => t.aufgaben);
  return {
    format: 1,
    art: 'kompendium',
    ...KOPF,
    stand: themen.map((t) => t.stand).sort().pop() || '',
    taxonomie: STUFEN.map((s) => ({ stufe: s.s, name: s.name, zeichen: s.zeichen, afb: s.afb, titel: s.titel })),
    summe: {
      themen: themen.length,
      lektionen: themen.reduce((n, t) => n + t.lektionen.length, 0),
      kapitel: themen.reduce((n, t) => n + t.kapitel.length, 0),
      aufgaben: alle.length,
      stufen: zaehleStufen(alle),
    },
    bereiche: BEREICHE.map(([id, titel, hash]) => ({ id, titel, hash })),
    themen,
  };
}

export function alsText(m) {
  return JSON.stringify(m, null, 2) + '\n';
}
