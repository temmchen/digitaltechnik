// taxonomie.js – Taxonomiestufen (gelten für alle Themen des Kompendiums)
//
// Drei Stufen wie in Toms Skripten (ELTEC, MINT, PRODI) und Prüfungen:
//   Stufe 1 · leicht •   = Wissen und Verstehen          (Anforderungsbereich I)
//   Stufe 2 · mittel ••  = Anwenden                       (Anforderungsbereich II)
//   Stufe 3 · schwer ••• = Analysieren, Bewerten, Transfer (Anforderungsbereich III)
// Feiner trägt jede Aufgabe den Denkprozess nach Bloom (überarbeitet von Anderson &
// Krathwohl) im Feld `k` (1–6). Bewusst ohne „K1 … K6“, weil K-Nummern bei uns
// die Kompetenzen eines Moduls bezeichnen.

export const STUFEN = [
  {
    s: 1, name: 'leicht', zeichen: '•', afb: 'AFB I', titel: 'Wissen und Verstehen',
    frage: 'Weiß ich es und kann ich es erklären?',
    beschreibung: 'Begriffe, Regeln und Zusammenhänge wiedergeben und erklären.',
    prozesse: [1, 2],
    operatoren: ['nennen', 'angeben', 'erklären', 'zuordnen'],
  },
  {
    s: 2, name: 'mittel', zeichen: '••', afb: 'AFB II', titel: 'Anwenden',
    frage: 'Kann ich das Verfahren sicher ausführen?',
    beschreibung: 'Gelernte Verfahren in bekannten Situationen sicher ausführen.',
    prozesse: [3],
    operatoren: ['umwandeln', 'berechnen', 'addieren', 'subtrahieren'],
  },
  {
    s: 3, name: 'schwer', zeichen: '•••', afb: 'AFB III', titel: 'Analysieren, Bewerten, Transfer',
    frage: 'Durchschaue ich es und kann ich begründet urteilen?',
    beschreibung: 'Strukturen untersuchen, Lösungen beurteilen und eigene Lösungen entwickeln.',
    prozesse: [4, 5, 6],
    operatoren: ['untersuchen', 'bestimmen', 'beurteilen', 'konstruieren'],
  },
];

/** Denkprozesse nach Bloom (Anderson & Krathwohl). */
export const PROZESSE = [
  { k: 1, name: 'Erinnern', beschreibung: 'Fakten und Regeln wiedergeben', operatoren: ['nennen', 'angeben'] },
  { k: 2, name: 'Verstehen', beschreibung: 'Zusammenhänge erklären, zuordnen', operatoren: ['erklären', 'zuordnen', 'weiterzählen'] },
  { k: 3, name: 'Anwenden', beschreibung: 'ein Verfahren ausführen', operatoren: ['umwandeln', 'berechnen', 'addieren', 'subtrahieren'] },
  { k: 4, name: 'Analysieren', beschreibung: 'untersuchen, vergleichen, Fehler finden, Umkehraufgaben', operatoren: ['untersuchen', 'vergleichen', 'ermitteln', 'bestimmen'] },
  { k: 5, name: 'Bewerten', beschreibung: 'nach Kriterien prüfen und beurteilen', operatoren: ['beurteilen', 'prüfen', 'entscheiden'] },
  { k: 6, name: 'Erschaffen', beschreibung: 'eigene Lösungen nach Bedingungen entwerfen', operatoren: ['konstruieren', 'erfinden'] },
];

/** Taxonomiestufe (1–3) zum Denkprozess k (1–6). */
export function stufeVon(k) {
  if (k <= 2) return 1;
  if (k === 3) return 2;
  return 3;
}

export function stufe(s) {
  return STUFEN[s - 1];
}

export function prozess(k) {
  return PROZESSE[k - 1];
}

/** Kurzform für Chips und Druck, z. B. „•• mittel“. */
export function stufenText(s) {
  const st = STUFEN[s - 1];
  return `${st.zeichen} ${st.name}`;
}
