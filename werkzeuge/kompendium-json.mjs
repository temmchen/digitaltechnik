// kompendium-json.mjs – schreibt kompendium.json neu (nach jeder Änderung an Themen, Lektionen oder Aufgaben)
//
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m werkzeuge/kompendium-json.mjs

import { manifest, alsText, WURZEL } from './manifest.mjs';

const m = manifest();
writeFile(`${WURZEL}/kompendium.json`, alsText(m));
print(`kompendium.json geschrieben: ${m.summe.themen} Thema/Themen, ${m.summe.lektionen} Lektionen, ${m.summe.aufgaben} Aufgaben `
  + `(leicht ${m.summe.stufen[1]}, mittel ${m.summe.stufen[2]}, schwer ${m.summe.stufen[3]}).`);
