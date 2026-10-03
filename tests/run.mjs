// run.mjs – alle Tests:
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m tests/run.mjs
import { results, report } from './harness.mjs';

const dateien = [
  './kern.test.mjs', // Umwandlungen und Rechenwege
  './pruefen.test.mjs', // Eingaben lesen, Fehlerdiagnose
  './aufgaben.test.mjs', // alle 100 Aufgaben
  './varianten.test.mjs', // neue Zahlen, Prüfungen zusammenstellen
  './inhalt.test.mjs', // Lektionen und Lehrerinhalte
  './manifest.test.mjs', // kompendium.json für die Lerndashboards
];

for (const f of dateien) {
  try {
    await import(f);
  } catch (e) {
    results.fail.push(`[${f}] nicht ladbar: ${e && e.message ? e.message : e}${e && e.stack ? '\n' + e.stack : ''}`);
  }
}
const ok = report();
if (!ok && typeof quit === 'function') quit(1);
