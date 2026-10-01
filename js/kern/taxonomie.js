// taxonomie.js – Taxonomiestufen und Niveaus (gelten für alle Themen des Kompendiums)
//
// Lernzieltaxonomie nach Bloom, überarbeitet von Anderson & Krathwohl (2001):
// K1 Erinnern · K2 Verstehen · K3 Anwenden · K4 Analysieren · K5 Bewerten · K6 Erschaffen.
// Die Stufe beschreibt den Denkprozess, nicht die Schwierigkeit – dafür gibt es das Niveau.

export const TAXONOMIE = [
  {
    k: 1, name: 'Erinnern', frage: 'Was weiß ich?',
    beschreibung: 'Begriffe, Fakten und Regeln wiedergeben.',
    operatoren: ['nennen', 'angeben', 'aufzählen'],
    beispiel: 'Gib die Zweierpotenzen 2⁰ bis 2⁷ an.',
  },
  {
    k: 2, name: 'Verstehen', frage: 'Kann ich es erklären?',
    beschreibung: 'Zusammenhänge erklären, Begriffe zuordnen, Regeln deuten.',
    operatoren: ['erklären', 'beschreiben', 'zuordnen', 'weiterzählen'],
    beispiel: 'Erkläre, warum 1₂ + 1₂ einen Übertrag ergibt.',
  },
  {
    k: 3, name: 'Anwenden', frage: 'Kann ich das Verfahren ausführen?',
    beschreibung: 'Ein gelerntes Verfahren in einer bekannten Situation sicher ausführen.',
    operatoren: ['umwandeln', 'berechnen', 'addieren', 'subtrahieren'],
    beispiel: 'Wandle 156₁₀ in eine Dualzahl um.',
  },
  {
    k: 4, name: 'Analysieren', frage: 'Durchschaue ich die Struktur?',
    beschreibung: 'Zahlen und Rechnungen untersuchen, vergleichen, Fehler finden, Umkehraufgaben lösen.',
    operatoren: ['untersuchen', 'vergleichen', 'ermitteln', 'bestimmen'],
    beispiel: 'Bestimme x in x + 0110₂ = 1 0011₂.',
  },
  {
    k: 5, name: 'Bewerten', frage: 'Kann ich begründet urteilen?',
    beschreibung: 'Lösungen und Aussagen nach Kriterien prüfen, beurteilen und Lösungswege auswählen.',
    operatoren: ['beurteilen', 'prüfen', 'entscheiden'],
    beispiel: 'Prüfe Pauls Ergebnis mit einer Probe und beurteile es.',
  },
  {
    k: 6, name: 'Erschaffen', frage: 'Kann ich selbst etwas entwickeln?',
    beschreibung: 'Eigene Lösungen oder Aufgaben entwerfen, die vorgegebene Bedingungen erfüllen.',
    operatoren: ['konstruieren', 'entwerfen', 'erfinden'],
    beispiel: 'Erfinde eine Subtraktion mit genau zwei Entleihungen.',
  },
];

export const NIVEAU = {
  1: { name: 'Basis', zeichen: '●○○' },
  2: { name: 'Standard', zeichen: '●●○' },
  3: { name: 'Experte', zeichen: '●●●' },
};

export function stufe(k) {
  return TAXONOMIE[k - 1];
}
