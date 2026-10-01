// harness.mjs – kleines Testgerüst für JavaScriptCore (jsc) ohne Abhängigkeiten

export const results = { ok: 0, fail: [] };
const ausgabe = typeof print === 'function' ? print : (...a) => console.log(...a);

export function test(name, fn) {
  try {
    fn();
    results.ok++;
  } catch (e) {
    results.fail.push(`${name}: ${e && e.message ? e.message : e}`);
  }
}

export function gleich(ist, soll, text = '') {
  if (ist !== soll) {
    throw new Error(`${text ? text + ' – ' : ''}erwartet ${JSON.stringify(soll)}, erhalten ${JSON.stringify(ist)}`);
  }
}

export function wahr(wert, text = 'erwartet wahr') {
  if (!wert) throw new Error(text);
}

export function enthaelt(text, teil, hinweis = '') {
  if (!String(text).includes(teil)) {
    throw new Error(`${hinweis ? hinweis + ' – ' : ''}„${teil}“ fehlt in „${String(text).slice(0, 160)}“`);
  }
}

/** Prüft, ob die wichtigsten HTML-Tags paarweise geöffnet und geschlossen werden. */
export function htmlAusgewogen(html, text = '') {
  for (const tag of ['div', 'table', 'tr', 'td', 'th', 'p', 'ul', 'ol', 'li', 'span', 'b', 'details', 'summary', 'sub', 'h4', 'thead', 'tbody']) {
    const auf = (html.match(new RegExp(`<${tag}(?=[\\s>])`, 'g')) || []).length;
    const zu = (html.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    if (auf !== zu) throw new Error(`${text}: <${tag}> ${auf}× geöffnet, ${zu}× geschlossen`);
  }
}

export function report() {
  ausgabe(`\n${results.ok} Tests bestanden, ${results.fail.length} fehlgeschlagen.`);
  results.fail.slice(0, 60).forEach((f) => ausgabe('  ✗ ' + f));
  return results.fail.length === 0;
}
