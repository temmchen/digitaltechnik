// thema.js – Thema 1 des Kompendiums: Zahlensysteme und Dualarithmetik

import { AUFGABEN } from './aufgaben.js';
import { LEKTIONEN, merkhilfeHTML } from './lektionen.js';
import { WIDGETS } from './widgets.js';

export const KAPITEL = [
  { id: 'A', titel: 'Grundlagen der Stellenwertsysteme', kurz: 'Grundlagen', lektion: 1 },
  { id: 'B', titel: 'Dual → Dezimal', kurz: 'Dual → Dez', lektion: 2 },
  { id: 'C', titel: 'Dezimal → Dual', kurz: 'Dez → Dual', lektion: 3 },
  { id: 'D', titel: 'Hexadezimal → Dezimal', kurz: 'Hex → Dez', lektion: 4 },
  { id: 'E', titel: 'Dezimal → Hexadezimal', kurz: 'Dez → Hex', lektion: 5 },
  { id: 'F', titel: 'Hexadezimal ↔ Dual', kurz: 'Hex ↔ Dual', lektion: 6 },
  { id: 'G', titel: 'Addition von Dualzahlen', kurz: 'Addition', lektion: 7 },
  { id: 'H', titel: 'Subtraktion von Dualzahlen', kurz: 'Subtraktion', lektion: 8 },
  { id: 'I', titel: 'Gemischte Aufgaben und Anwendungen', kurz: 'Gemischt', lektion: 9 },
];

export default {
  id: 'zahlensysteme',
  kuerzel: 'ZS',
  symbol: '01',
  titel: 'Zahlensysteme und Dualarithmetik',
  kurz: 'Zahlensysteme',
  beschreibung: 'Dezimal, Dual und Hexadezimal: umwandeln, vergleichen und jonglieren – dazu Dualzahlen addieren und subtrahieren. Nur positive ganze Zahlen.',
  kompetenz: 'Positive ganze Zahlen zwischen Dezimal-, Dual- und Hexadezimalsystem umwandeln sowie Dualzahlen addieren und subtrahieren.',
  stand: '2026-10-01',
  kapitel: KAPITEL,
  lektionen: LEKTIONEN,
  aufgaben: AUFGABEN,
  merkhilfe: merkhilfeHTML,
  widgets: WIDGETS,
};
