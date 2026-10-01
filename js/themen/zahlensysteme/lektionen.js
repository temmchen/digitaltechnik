// lektionen.js – Thema Zahlensysteme: die neun Lektionen (Theorie, Musterbeispiele, interaktive Werkzeuge)

import {
  wegDivisionsrest, wegStellenwert, wegZweierpotenzen, wegHexZuDual, wegDualZuHex,
  wegAddition, wegSubtraktion,
} from '../../kern/zahlen.js';
import {
  z, pot, htmlDivisionsrest, htmlStellenwert, htmlZweierpotenzen, htmlHexZuDual, htmlDualZuHex,
  htmlAddition, htmlAdditionErklaerung, htmlSubtraktion, htmlSubtraktionErklaerung, htmlProbeSubtraktion,
  htmlHexTabelle, htmlZweierTabelle, htmlSechzehnerTabelle, htmlDip,
} from '../../kern/darstellung.js';
import { icon } from '../../kern/icons.js';

const B = (s) => z(s, 2);
const D = (s) => z(String(s), 10);
const X = (s) => z(s, 16);

function box(art, titel, html) {
  const sym = { merke: 'merke', beispiel: 'beispiel', achtung: 'achtung', tipp: 'tipp', technik: 'technik', rechner: 'rechner', info: 'info' }[art];
  return `<div class="box ${art}"><div class="box-kopf">${icon(sym)}<span>${titel}</span></div><div class="box-inhalt">${html}</div></div>`;
}
const merke = (t, h) => box('merke', t, h);
const beispiel = (t, h) => box('beispiel', t, h);
const achtung = (t, h) => box('achtung', t, h);
const tipp = (t, h) => box('tipp', t, h);
const technik = (t, h) => box('technik', t, h);
const rechner = (t, h) => box('rechner', t, h);
const widget = (art, daten = {}) =>
  `<div class="widget" data-widget="${art}"${Object.entries(daten).map(([k, v]) => ` data-${k}="${v}"`).join('')}></div>`;

/* ------------------------------------------------------------------ */
/* Umwandlungsdreieck (SVG, aus Vektoren berechnet)                    */
/* ------------------------------------------------------------------ */

export function dreieckSVG() {
  const W = 184;
  const HH = 70;
  const K = {
    10: { x: 330, y: 62, name: 'Dezimal', info: 'Basis 10 · 0 … 9' },
    2: { x: 150, y: 334, name: 'Dual', info: 'Basis 2 · 0, 1' },
    16: { x: 510, y: 334, name: 'Hexadezimal', info: 'Basis 16 · 0 … F' },
  };
  const rand = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.min(dx ? (W / 2 + 10) / Math.abs(dx) : Infinity, dy ? (HH / 2 + 10) / Math.abs(dy) : Infinity);
    return { x: a.x + dx * t, y: a.y + dy * t };
  };
  const r = (v) => Math.round(v * 10) / 10;
  function linie(von, nach, versatz) {
    const p1 = rand(K[von], K[nach]);
    const p2 = rand(K[nach], K[von]);
    const l = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const nx = -(p2.y - p1.y) / l;
    const ny = (p2.x - p1.x) / l;
    return `<line x1="${r(p1.x + nx * versatz)}" y1="${r(p1.y + ny * versatz)}" x2="${r(p2.x + nx * versatz)}" y2="${r(p2.y + ny * versatz)}" class="dr-pfeil" marker-end="url(#dr-spitze)"/>`;
  }
  // Beschriftungen stehen außen, mit Richtungspfeil – so überdecken sie sich nie
  function text(x, y, anker, zeile, lektion) {
    return `<text x="${x}" y="${y}" text-anchor="${anker}" class="dr-text">${zeile}<tspan x="${x}" dy="16" class="dr-klein">Lektion ${lektion}</tspan></text>`;
  }
  const pfeil = (von, nach, versatz, beschriftung, lektion) =>
    `<a href="#/lernen/zahlensysteme/${lektion}" class="dr-link">${linie(von, nach, versatz)}${beschriftung}</a>`;
  const knoten = Object.entries(K).map(([b, k]) => `<g class="dr-knoten b${b}"><rect x="${k.x - W / 2}" y="${k.y - HH / 2}" width="${W}" height="${HH}" rx="14"/><text x="${k.x}" y="${k.y - 4}" text-anchor="middle" class="dr-name">${k.name}</text><text x="${k.x}" y="${k.y + 18}" text-anchor="middle" class="dr-info">${k.info}</text></g>`).join('');
  return `<figure class="dreieck"><svg viewBox="0 0 660 410" role="img" aria-labelledby="dr-titel">
<title id="dr-titel">Umwandlungsdreieck: Wege zwischen Dezimal-, Dual- und Hexadezimalsystem</title>
<defs><marker id="dr-spitze" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="dr-spitze"/></marker></defs>
${pfeil(10, 2, 12, text(186, 160, 'end', '↙ ÷ 2 · Reste', 3), 3)}
${pfeil(2, 10, 12, text(186, 218, 'end', '↗ · 2ⁿ · Stellenwerte', 2), 2)}
${pfeil(10, 16, -12, text(474, 160, 'start', '÷ 16 · Reste ↘', 5), 5)}
${pfeil(16, 10, -12, text(474, 218, 'start', '· 16ⁿ · Stellenwerte ↖', 4), 4)}
${pfeil(2, 16, -12, text(330, 290, 'middle', '4 Bit → 1 Hex-Ziffer', 6), 6)}
${pfeil(16, 2, -12, text(330, 378, 'middle', '1 Hex-Ziffer → 4 Bit', 6), 6)}
${knoten}
</svg><figcaption>Das Umwandlungsdreieck: Jeder Pfeil ist ein Verfahren. Tippe einen Pfeil an, um zur Lektion zu springen.</figcaption></figure>`;
}

/* ------------------------------------------------------------------ */
/* Lektionen                                                           */
/* ------------------------------------------------------------------ */

const ZAEHLTABELLE = (() => {
  let h = '<div class="tabelle-scroll"><table class="zaehltabelle"><thead><tr><th>Dezimal</th><th>Dual</th><th>Hex</th></tr></thead><tbody>';
  for (let i = 0; i <= 17; i++) {
    const neu = i > 0 && (i.toString(2).length > (i - 1).toString(2).length);
    h += `<tr${neu ? ' class="neue-stelle"' : ''}><td class="b10">${i}</td><td class="b2 mono">${i.toString(2)}</td><td class="b16 mono">${i.toString(16).toUpperCase()}</td></tr>`;
  }
  return h + '</tbody></table></div>';
})();

export const LEKTIONEN = [
  /* ---------------------------------------------------------------- 1 */
  {
    nr: 1,
    kap: 'A',
    titel: 'Stellenwertsysteme',
    untertitel: 'Wie Zahlen aufgebaut sind – und warum Computer nur 0 und 1 kennen',
    dauer: 25,
    ziele: [
      ['den Aufbau eines Stellenwertsystems (Basis, Ziffern, Stellenwert) erklären', 2],
      ['die Ziffern und die Kennzeichnung des Dezimal-, Dual- und Hexadezimalsystems angeben', 1],
      ['die Begriffe Bit, Nibble, Byte, MSB und LSB nennen', 1],
      ['den Wertebereich einer n-Bit-Zahl berechnen', 3],
    ],
    inhalt: `
<h2>Warum 0 und 1?</h2>
<p>Digitale Schaltungen unterscheiden nur <b>zwei Zustände</b>: Strom fließt oder fließt nicht, ein Kontakt ist offen oder geschlossen, eine Spannung ist da oder nicht. Diese zwei Zustände schreibt man als <b>0</b> und <b>1</b>.</p>
<div class="tabelle-scroll"><table class="info-tabelle">
<thead><tr><th>Zustand</th><th>Schalter</th><th>Spannung (z. B. SPS-Eingang)</th><th>Logik</th><th>Ziffer</th></tr></thead>
<tbody><tr><td>aus</td><td>offen</td><td>0 V</td><td>LOW</td><td class="mono b2"><b>0</b></td></tr>
<tr><td>ein</td><td>geschlossen</td><td>24 V</td><td>HIGH</td><td class="mono b2"><b>1</b></td></tr></tbody></table></div>
<p>Mit nur zwei Ziffern kann man trotzdem jede Zahl darstellen – im <b>Dualsystem</b> (auch Binärsystem). Um es zu verstehen, schauen wir zuerst genau auf das System, das wir täglich benutzen.</p>

<h2>Das Dezimalsystem genau angeschaut</h2>
<p>Im Dezimalsystem hat jede Stelle einen <b>Stellenwert</b>: Einer, Zehner, Hunderter … Jeder Stellenwert ist eine Potenz der <b>Basis 10</b>. Die Stellen zählt man <b>von rechts ab 0</b>.</p>
${htmlStellenwert(wegStellenwert('407', 10))}
${merke('Stellenwertsystem', `<ul>
<li>Die <b>Basis</b> b gibt an, wie viele Ziffern es gibt: die Ziffern 0 bis b − 1.</li>
<li>Jede Stelle hat den <b>Stellenwert</b> b<sup>Stellennummer</sup>; die Stelle ganz rechts hat die Nummer 0 (b⁰ = 1).</li>
<li>Wert der Zahl = Summe aller <b>Ziffer · Stellenwert</b>.</li></ul>`)}

<h2>Drei Zahlensysteme im Überblick</h2>
<div class="tabelle-scroll"><table class="info-tabelle systeme">
<thead><tr><th>System</th><th>Basis</th><th>Ziffern</th><th>Stellenwerte</th><th>Kennzeichnung</th></tr></thead>
<tbody>
<tr class="b10"><td><b>Dezimalsystem</b></td><td>10</td><td>0 … 9</td><td>1, 10, 100, 1000 …</td><td>${D(45)}</td></tr>
<tr class="b2"><td><b>Dualsystem</b> (Binärsystem)</td><td>2</td><td>0, 1</td><td>1, 2, 4, 8, 16 …</td><td>${B('101101')}, 0b101101</td></tr>
<tr class="b16"><td><b>Hexadezimalsystem</b></td><td>16</td><td>0 … 9, A … F</td><td>1, 16, 256, 4096 …</td><td>${X('2D')}, 0x2D, 2Dh</td></tr>
</tbody></table></div>
<p>Weil dieselben Ziffern in verschiedenen Systemen verschiedene Werte haben (10 kann zehn, zwei oder sechzehn bedeuten), schreibt man die <b>Basis als Index</b> dazu: ${D(10)} ≠ ${B('10')} ≠ ${X('10')}.</p>
${achtung('Index nie vergessen', `<p>${B('10')} = 2, aber ${X('10')} = 16. Ohne Index ist eine Zahl wie „10“ mehrdeutig – in der Prüfung gehört die Basis immer dazu.</p>`)}

<h2>Zählen in drei Systemen</h2>
<p>Zählen funktioniert überall gleich: Die rechte Stelle wird erhöht. Ist die größte Ziffer erreicht (9, 1 oder F), wird sie 0 und es entsteht ein <b>Übertrag</b> in die nächste Stelle – wie bei einem Kilometerzähler.</p>
${widget('zaehler')}
<details class="aufklapp"><summary>Zähltabelle 0 bis 17</summary>${ZAEHLTABELLE}<p class="neben">Markiert: Hier braucht die Dualzahl eine neue Stelle (bei 2, 4, 8, 16 – den Zweierpotenzen).</p></details>

<h2>Bit, Nibble, Byte</h2>
<div class="tabelle-scroll"><table class="info-tabelle">
<thead><tr><th>Begriff</th><th>Größe</th><th>Beispiel</th></tr></thead>
<tbody>
<tr><td><b>Bit</b> (binary digit)</td><td>1 Dualstelle</td><td class="mono">1</td></tr>
<tr><td><b>Nibble</b> (Tetrade, Halbbyte)</td><td>4 Bit = 1 Hex-Ziffer</td><td class="mono">1011</td></tr>
<tr><td><b>Byte</b></td><td>8 Bit = 2 Nibbles = 2 Hex-Ziffern</td><td class="mono">1011 0110</td></tr>
</tbody></table></div>
<p>Das Bit ganz links hat den größten Stellenwert: <b>MSB</b> (most significant bit, höchstwertiges Bit). Das Bit ganz rechts ist das <b>LSB</b> (least significant bit, niederwertigstes Bit).</p>

<h2>Wie viele Zahlen passen in n Bit?</h2>
<p>Jedes Bit hat 2 Zustände. Mit n Bit gibt es 2 · 2 · … · 2 = <b>2ⁿ</b> verschiedene Bitmuster. Weil man bei 0 beginnt, reicht der <b>Wertebereich von 0 bis 2ⁿ − 1</b>.</p>
<div class="tabelle-scroll"><table class="info-tabelle">
<thead><tr><th>Bit</th><th>Anzahl der Werte</th><th>Wertebereich</th></tr></thead>
<tbody><tr><td>1</td><td>2</td><td>0 … 1</td></tr><tr><td>4</td><td>16</td><td>0 … 15 (0 … F)</td></tr>
<tr><td>8</td><td>256</td><td>0 … 255 (00 … FF)</td></tr><tr><td>16</td><td>65 536</td><td>0 … 65 535 (0000 … FFFF)</td></tr></tbody></table></div>
${merke('Zweierpotenzen – auswendig lernen!', `${htmlZweierTabelle(10)}<p>Jede Zweierpotenz ist das Doppelte der vorherigen. Mit dieser Reihe rechnest du in fast jeder Aufgabe.</p>`)}

<h2>Die Landkarte für die nächsten Lektionen</h2>
<p>Zwischen den drei Systemen gibt es sechs Wege. Jeder Pfeil ist ein Verfahren, das du in den folgenden Lektionen lernst:</p>
${dreieckSVG()}
`,
  },

  /* ---------------------------------------------------------------- 2 */
  {
    nr: 2,
    kap: 'B',
    titel: 'Dual → Dezimal',
    untertitel: 'Die Stellenwertmethode',
    dauer: 20,
    ziele: [
      ['die Stellenwerte einer Dualzahl angeben', 1],
      ['Dualzahlen mit der Stellenwertmethode in Dezimalzahlen umwandeln', 3],
      ['typische Fehler in einer Umwandlung finden und beurteilen', 5],
    ],
    inhalt: `
<h2>Die Idee</h2>
<p>Jedes Bit hat einen Stellenwert: 1, 2, 4, 8, 16 … – von rechts nach links verdoppelt. Steht in einer Stelle eine <b>1</b>, zählt ihr Stellenwert mit. Steht dort eine <b>0</b>, zählt er nicht.</p>
${merke('Verfahren: Dual → Dezimal', `<ol>
<li>Schreibe die Stellenwerte <b>von rechts beginnend</b> (1, 2, 4, 8 …) über die Bits.</li>
<li>Addiere die Stellenwerte, unter denen eine <b>1</b> steht.</li>
<li>Schreibe das Ergebnis mit dem Index ₁₀.</li></ol>`)}
${beispiel(`Musterbeispiel: ${B('10110110')} in eine Dezimalzahl`, htmlStellenwert(wegStellenwert('10110110', 2)))}

<h2>Selbst ausprobieren: das Bit-Labor</h2>
<p>Tippe die Schalter an. Jede eingeschaltete Lampe steuert ihren Stellenwert zur Summe bei.</p>
${widget('bitlabor', { bits: 8 })}

<h2>Stellenwerttafel für jede Dualzahl</h2>
${widget('stellenwert', { basis: 2, start: '1011001' })}

${achtung('Typische Fehler', `<ul>
<li><b>Stellenwerte von links</b> vergeben: Der Stellenwert 1 gehört immer zur Ziffer <b>ganz rechts</b>.</li>
<li>Mit 2 statt mit <b>1</b> begonnen: Die rechte Stelle hat den Stellenwert 2⁰ = 1 – sonst wird das Ergebnis doppelt so groß.</li>
<li>Stellenwerte unter einer <b>0</b> mitaddiert.</li></ul>`)}
${tipp('Profi-Tipp: Verdoppeln und addieren', `<p>Von links nach rechts: Beginne mit 0. Für jedes Bit: bisherigen Wert <b>verdoppeln</b> und das Bit <b>addieren</b>.</p>
<p>${B('1011')}: 0·2 + 1 = 1 → 1·2 + 0 = 2 → 2·2 + 1 = 5 → 5·2 + 1 = <b>11</b>. Praktisch im Kopf, ganz ohne Tabelle.</p>`)}
`,
  },

  /* ---------------------------------------------------------------- 3 */
  {
    nr: 3,
    kap: 'C',
    titel: 'Dezimal → Dual',
    untertitel: 'Divisionsrestverfahren und Zweierpotenzen-Methode',
    dauer: 30,
    ziele: [
      ['die Leserichtung beim Divisionsrestverfahren erklären', 2],
      ['Dezimalzahlen mit dem Divisionsrestverfahren in Dualzahlen umwandeln', 3],
      ['eine Umwandlung mit der Zweierpotenzen-Methode ausführen und durch eine Probe kontrollieren', 3],
    ],
    inhalt: `
<h2>Methode 1: Divisionsrestverfahren</h2>
${merke('Verfahren: Dezimal → Dual (Divisionsrest)', `<ol>
<li>Teile die Zahl durch <b>2</b>. Notiere den Quotienten und den <b>Rest</b> (0 oder 1).</li>
<li>Teile den Quotienten wieder durch 2 – so lange, bis der Quotient <b>0</b> ist.</li>
<li>Lies die Reste <b>von unten nach oben</b>: Das ist die Dualzahl.</li></ol>`)}
${beispiel(`Musterbeispiel: ${D(45)} in eine Dualzahl`, htmlDivisionsrest(wegDivisionsrest(45, 2)))}
<p><b>Warum von unten nach oben?</b> Der erste Rest zeigt, ob die Zahl gerade (0) oder ungerade (1) ist – das entscheidet die Stelle 2⁰ ganz rechts. Jede Division durch 2 schiebt die Zahl um eine Stelle nach rechts; der nächste Rest ist das nächste Bit weiter links.</p>
<h3>Schritt für Schritt mit eigener Zahl</h3>
${widget('division', { basis: 2, start: 45 })}

<h2>Methode 2: Zweierpotenzen-Methode</h2>
${merke('Verfahren: Dezimal → Dual (Zweierpotenzen)', `<ol>
<li>Suche die <b>größte Zweierpotenz</b>, die in die Zahl passt → dort steht eine 1.</li>
<li>Ziehe sie ab und mache mit dem Rest weiter.</li>
<li>Jede Zweierpotenz, die nicht passt, bekommt eine 0 – bis hinunter zu 2⁰.</li></ol>`)}
${beispiel(`Musterbeispiel: ${D(45)} mit Zweierpotenzen`, htmlZweierpotenzen(wegZweierpotenzen(45)))}
${tipp('Welche Methode wann?', `<p>Die <b>Zweierpotenzen-Methode</b> ist schnell bei kleinen Zahlen und im Kopf – wenn du die Zweierpotenzen kennst. Das <b>Divisionsrestverfahren</b> funktioniert immer gleich und ist bei großen Zahlen sicherer.</p>`)}

<h2>Feste Bitbreite: führende Nullen</h2>
<p>In der Technik haben Zahlen oft eine feste Länge, z. B. ein Byte (8 Bit). Dann füllt man links mit Nullen auf: ${D(75)} = ${B('1001011')} = ${B('01001011')} als 8-Bit-Zahl. Führende Nullen ändern den Wert nicht.</p>

${achtung('Typische Fehler', `<ul>
<li>Reste <b>von oben nach unten</b> gelesen – dann steht die Zahl rückwärts.</li>
<li>Den <b>letzten Rest</b> vergessen (1 : 2 = 0 Rest <b>1</b>).</li>
<li>Bei der Zweierpotenzen-Methode die <b>Nullen</b> für nicht passende Potenzen vergessen.</li></ul>`)}
${merke('Probe', `<p>Wandle das Ergebnis mit der Stellenwertmethode zurück: ${B('101101')} = 32 + 8 + 4 + 1 = 45 ✓. Eine Probe entlarvt fast jeden Fehler.</p>`)}
`,
  },

  /* ---------------------------------------------------------------- 4 */
  {
    nr: 4,
    kap: 'D',
    titel: 'Hexadezimal → Dezimal',
    untertitel: 'Das Sechzehnersystem und seine Stellenwerte',
    dauer: 25,
    ziele: [
      ['die Hex-Ziffern A bis F mit ihren Werten angeben', 1],
      ['Schreibweisen für Hexadezimalzahlen erkennen', 1],
      ['Hexadezimalzahlen mit der Stellenwertmethode in Dezimalzahlen umwandeln', 3],
    ],
    inhalt: `
<h2>Warum noch ein System?</h2>
<p>Dualzahlen werden schnell lang und unübersichtlich. Das Hexadezimalsystem fasst je <b>4 Bit zu einer Ziffer</b> zusammen: ${B('1100101011111110')} = ${X('CAFE')}. Deshalb findest du Hexadezimalzahlen überall in der Technik:</p>
<ul class="praxisliste">
<li><b>Farbcodes</b> in Webseiten und Displays: #FF8800 (Rot FF, Grün 88, Blau 00)</li>
<li><b>Speicheradressen</b> und <b>Fehlercodes</b> in Datenblättern und Steuerungen</li>
<li><b>MAC-Adressen</b> von Netzwerkgeräten, z. B. 00:1A:2B:3C:4D:5E</li>
<li><b>SPS-Programmierung</b> (IEC 61131-3): 16#2F für hexadezimal, 2#0010_1111 für dual</li></ul>

<h2>16 Ziffern: 0 bis F</h2>
<p>Für die Werte 10 bis 15 nimmt man Buchstaben:</p>
${htmlHexTabelle()}
<h2>Stellenwerte: Potenzen von 16</h2>
${htmlSechzehnerTabelle(4)}
${merke('Verfahren: Hexadezimal → Dezimal', `<ol>
<li>Rechne Buchstaben in Zahlen um (A = 10 … F = 15).</li>
<li>Multipliziere jede Ziffer mit ihrem Stellenwert 1, 16, 256, 4096 … (von rechts).</li>
<li>Addiere alle Produkte.</li></ol>`)}
${beispiel(`Musterbeispiel: ${X('2AF')} in eine Dezimalzahl`, htmlStellenwert(wegStellenwert('2AF', 16)))}
<h3>Selbst ausprobieren</h3>
${widget('stellenwert', { basis: 16, start: '1C8' })}
${achtung('Typische Fehler', `<ul>
<li>Mit <b>Zehnerpotenzen</b> gerechnet statt mit 1, 16, 256 …</li>
<li>Buchstaben nicht umgerechnet oder verwechselt (B = 11, D = 13).</li>
<li>Stellen von links statt von rechts gezählt.</li></ul>`)}
${merke('Schreibweisen', `<p>${X('2F')} = (2F)₁₆ = <b>0x2F</b> (Programmierung) = <b>2Fh</b> (Datenblätter) = <b>16#2F</b> (SPS). Alles dieselbe Zahl: 47.</p>`)}
`,
  },

  /* ---------------------------------------------------------------- 5 */
  {
    nr: 5,
    kap: 'E',
    titel: 'Dezimal → Hexadezimal',
    untertitel: 'Divisionsrestverfahren mit 16',
    dauer: 25,
    ziele: [
      ['erklären, warum man durch die Basis des Zielsystems teilt', 2],
      ['Dezimalzahlen mit dem Divisionsrestverfahren in Hexadezimalzahlen umwandeln', 3],
      ['eine Umwandlung mit dem Taschenrechner kontrollieren', 3],
    ],
    inhalt: `
<h2>Gleiches Verfahren, andere Basis</h2>
<p>Das Divisionsrestverfahren funktioniert für jedes Zielsystem: Man teilt immer durch dessen <b>Basis</b>. Ins Hexadezimalsystem also durch <b>16</b>. Die Reste liegen zwischen 0 und 15 – jeder Rest ist <b>eine</b> Hex-Ziffer.</p>
${merke('Verfahren: Dezimal → Hexadezimal', `<ol>
<li>Teile die Zahl durch <b>16</b>, notiere Quotient und Rest.</li>
<li>Wiederhole mit dem Quotienten, bis er <b>0</b> ist.</li>
<li>Schreibe Reste von 10 bis 15 als <b>A bis F</b>.</li>
<li>Lies die Reste <b>von unten nach oben</b>.</li></ol>`)}
${beispiel(`Musterbeispiel: ${D(687)} in eine Hexadezimalzahl`, htmlDivisionsrest(wegDivisionsrest(687, 16)))}
${rechner('Den Rest mit dem Taschenrechner bestimmen', `<p>687 ÷ 16 = 42,9375 → der Quotient ist die ganze Zahl <b>42</b>.<br>Rest = 687 − 42 · 16 = 687 − 672 = <b>15</b> → F.</p>
<p>Kontrolle mit dem fx-991DE X: <b>MENU 3</b> (Basis-N), Zahl im Modus DEC eingeben (Taste x²), mit <b>=</b> bestätigen, dann <b>HEX</b> (Taste x▫) – das Ergebnis erscheint hexadezimal. Üben kannst du das im <a href="https://temmchen.github.io/fx991/" target="_blank" rel="noopener">fx-991DE X Trainer</a>.</p>
<p class="neben">In der Prüfung zählt der Rechenweg – der Taschenrechner dient nur zur Kontrolle.</p>`)}
<h3>Schritt für Schritt mit eigener Zahl</h3>
${widget('division', { basis: 16, start: 687 })}
<h2>Alternative: der Umweg über das Dualsystem</h2>
<p>Bei Zahlen bis 255 geht es oft schneller über das Dualsystem: erst ins Dualsystem, dann Vierergruppen bilden (Lektion 6).</p>
${beispiel(`${D(200)} über das Dualsystem`, `${htmlDivisionsrest(wegDivisionsrest(200, 2))}${htmlDualZuHex(wegDualZuHex('11001000'))}`)}
${achtung('Typische Fehler', `<ul>
<li>Reste ab 10 als zwei Ziffern geschrieben („11 14“ statt <b>BE</b>).</li>
<li>Reste von oben nach unten gelesen.</li>
<li>Den Rest falsch bestimmt: Der Nachkommateil 0,9375 ist <b>nicht</b> der Rest – erst Quotient · 16 abziehen.</li></ul>`)}
`,
  },

  /* ---------------------------------------------------------------- 6 */
  {
    nr: 6,
    kap: 'F',
    titel: 'Hexadezimal ↔ Dual',
    untertitel: 'Tetraden: der direkte Weg ohne Rechnen',
    dauer: 25,
    ziele: [
      ['die Tetraden der Hex-Ziffern 0 bis F angeben', 1],
      ['erklären, warum eine Hex-Ziffer genau 4 Bit entspricht', 2],
      ['zwischen Dual- und Hexadezimalsystem über Tetraden umwandeln', 3],
    ],
    inhalt: `
<h2>Der Trick: 16 = 2⁴</h2>
<p>Mit 4 Bit gibt es genau 2⁴ = 16 Bitmuster – genau so viele, wie es Hex-Ziffern gibt. Deshalb entspricht jede Hex-Ziffer <b>genau einer Tetrade</b> (4 Bit). Umwandeln heißt nur noch: Ziffer für Ziffer übersetzen.</p>
${merke('8-4-2-1: die Tetraden-Tabelle', htmlHexTabelle({ kompakt: true }))}
<h2>Hexadezimal → Dual</h2>
${merke('Verfahren: Hexadezimal → Dual', `<ol><li>Übersetze <b>jede</b> Hex-Ziffer einzeln in <b>vier</b> Bit (mit führenden Nullen!).</li><li>Schreibe die Tetraden aneinander.</li></ol>`)}
${beispiel(`Musterbeispiel: ${X('3C7')} in eine Dualzahl`, htmlHexZuDual(wegHexZuDual('3C7')))}
<h2>Dual → Hexadezimal</h2>
${merke('Verfahren: Dual → Hexadezimal', `<ol><li>Teile die Dualzahl <b>von rechts</b> in Vierergruppen.</li><li>Fülle die linke Gruppe mit Nullen auf.</li><li>Übersetze jede Gruppe in eine Hex-Ziffer.</li></ol>`)}
${beispiel(`Musterbeispiel: ${B('1011010111')} in eine Hexadezimalzahl`, htmlDualZuHex(wegDualZuHex('1011010111')))}
<h2>Selbst ausprobieren: die Tetraden-Brücke</h2>
${widget('tetraden', { start: '2D7' })}
${achtung('Typische Fehler', `<ul>
<li>Vierergruppen <b>von links</b> gebildet – dann stimmt jede Gruppe nicht mehr.</li>
<li>Bei Hex → Dual die Nullen weggelassen: 2 ist <b>0010</b>, nicht 10. Nur ganz vorne darf man Nullen weglassen.</li></ul>`)}
${technik('Aus der Praxis: ein SPS-Eingangsbyte', `<p>Eine SPS zeigt das Eingangsbyte EB0 als ${X('A6')}. In Tetraden: A = 1010, 6 = 0110 → ${B('10100110')}. Sofort sieht man: Die Eingänge E0.7, E0.5, E0.2 und E0.1 haben ein 1-Signal.</p>`)}
`,
  },

  /* ---------------------------------------------------------------- 7 */
  {
    nr: 7,
    kap: 'G',
    titel: 'Addition von Dualzahlen',
    untertitel: 'Schriftlich addieren mit Übertrag',
    dauer: 30,
    ziele: [
      ['die Additionsregeln des Dualsystems angeben', 1],
      ['erklären, wann ein Übertrag entsteht', 2],
      ['Dualzahlen schriftlich addieren und das Ergebnis kontrollieren', 3],
      ['einen Überlauf bei fester Bitbreite erkennen', 4],
    ],
    inhalt: `
<h2>Die vier Regeln</h2>
<div class="tabelle-scroll"><table class="regeltabelle gross">
<tr><td>0 + 0</td><td>= 0</td><td></td></tr>
<tr><td>0 + 1</td><td>= 1</td><td></td></tr>
<tr><td>1 + 1</td><td>= ${B('10')}</td><td>schreibe <b>0</b>, Übertrag <b>1</b></td></tr>
<tr><td>1 + 1 + 1</td><td>= ${B('11')}</td><td>schreibe <b>1</b>, Übertrag <b>1</b> (mit Übertrag aus der Nachbarstelle)</td></tr>
</table></div>
<p>Das ist dasselbe Prinzip wie 9 + 1 = 10 im Dezimalsystem: Passt die Summe nicht mehr in eine Stelle, wandert eine 1 als <b>Übertrag</b> in die nächste Stelle.</p>
${merke('Verfahren: schriftliche Addition', `<ol>
<li>Schreibe die Zahlen <b>rechtsbündig</b> untereinander.</li>
<li>Addiere <b>von rechts nach links</b> Stelle für Stelle – mit dem Übertrag aus der vorherigen Stelle.</li>
<li>Schreibe den Übertrag klein in die nächste Spalte.</li>
<li>Ein Übertrag aus der letzten Stelle wird zur neuen vordersten Stelle.</li></ol>`)}
${beispiel(`Musterbeispiel: ${B('1011')} + ${B('0110')}`, `${htmlAddition(wegAddition('1011', '0110'))}${htmlAdditionErklaerung(wegAddition('1011', '0110'))}<p><b>Probe im Dezimalsystem:</b> 11 + 6 = 17 = ${B('10001')} ✓</p>`)}
<h3>Das Rechenwerk: Spalte für Spalte</h3>
${widget('addition', { a: '01110111', b: '01011001' })}
<h2>Überlauf bei fester Bitbreite</h2>
<p>Register in Steuerungen und Prozessoren haben eine feste Breite, z. B. 8 Bit (0 bis 255). Ist die Summe größer, passt sie nicht mehr hinein: Es entsteht ein <b>Überlauf</b>. Das 9. Bit meldet der Prozessor als Übertragsbit (<i>Carry</i>).</p>
${beispiel('Überlauf', `${htmlAddition(wegAddition('11001000', '01010000'))}<p>200 + 80 = 280 &gt; 255 → im 8-Bit-Register bleibt nur ${B('00011000')} = 24 übrig.</p>`)}
${technik('So rechnet die Hardware: der Volladdierer', `<p>Für jede Stelle gibt es drei Eingänge (A, B, Übertrag C<sub>ein</sub>) und zwei Ausgänge (Summe S, Übertrag C<sub>aus</sub>). Genau diese Tabelle baut man mit Logikgattern als <b>Volladdierer</b>. Acht Volladdierer hintereinander bilden einen 8-Bit-Addierer.</p>
<div class="tabelle-scroll"><table class="wahrheitstabelle"><thead><tr><th>A</th><th>B</th><th>C<sub>ein</sub></th><th>S</th><th>C<sub>aus</sub></th></tr></thead><tbody>
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = i >> 2 & 1; const b = i >> 1 & 1; const c = i & 1; const s = a + b + c; return `<tr><td>${a}</td><td>${b}</td><td>${c}</td><td><b>${s % 2}</b></td><td><b>${s >= 2 ? 1 : 0}</b></td></tr>`; }).join('')}
</tbody></table></div>`)}
${achtung('Typische Fehler', `<ul>
<li>Übertrag vergessen (1 + 1 = 0 ohne Übertrag).</li>
<li>Eine <b>2</b> hingeschrieben – im Dualsystem gibt es keine 2: 1 + 1 = ${B('10')}.</li>
<li>Den letzten Übertrag vergessen: Das Ergebnis kann eine Stelle länger sein.</li>
<li>Zahlen nicht rechtsbündig untereinander geschrieben.</li></ul>`)}
`,
  },

  /* ---------------------------------------------------------------- 8 */
  {
    nr: 8,
    kap: 'H',
    titel: 'Subtraktion von Dualzahlen',
    untertitel: 'Schriftlich subtrahieren mit Entleihung',
    dauer: 30,
    ziele: [
      ['die Subtraktionsregeln des Dualsystems angeben', 1],
      ['erklären, was beim Entleihen passiert', 2],
      ['Dualzahlen schriftlich subtrahieren', 3],
      ['ein Ergebnis mit der Probe (Addition) prüfen und beurteilen', 5],
    ],
    inhalt: `
<p>Wir subtrahieren nur so, dass das Ergebnis positiv bleibt: Der <b>Minuend</b> (oben) ist mindestens so groß wie der <b>Subtrahend</b> (unten).</p>
<h2>Die Regeln</h2>
<div class="tabelle-scroll"><table class="regeltabelle gross">
<tr><td>0 − 0</td><td>= 0</td><td></td></tr>
<tr><td>1 − 0</td><td>= 1</td><td></td></tr>
<tr><td>1 − 1</td><td>= 0</td><td></td></tr>
<tr><td>0 − 1</td><td>= 1</td><td>mit <b>Entleihung</b>: ${B('10')} − 1 = 1</td></tr>
</table></div>
<h2>Was heißt Entleihen?</h2>
<p>Bei 0 − 1 reicht die Ziffer nicht. Man nimmt eine 1 aus der <b>nächsthöheren Stelle</b>. Diese Stelle ist doppelt so viel wert – die geliehene 1 zählt hier also als <b>2</b>: 2 − 1 = 1. Die Entleihung schreibt man klein in die nächste Spalte und <b>zieht sie dort zusätzlich ab</b>.</p>
<div class="tabelle-scroll"><table class="regeltabelle">
<thead><tr><th>Minuend − Subtrahend − Entleihung</th><th>Ergebnis</th><th>neue Entleihung</th></tr></thead>
<tbody>
<tr><td>1 − 0 − 1</td><td>0</td><td>nein</td></tr>
<tr><td>0 − 0 − 1</td><td>1 (${B('10')} − 1)</td><td>ja</td></tr>
<tr><td>1 − 1 − 1</td><td>1 (${B('11')} − 1 − 1)</td><td>ja</td></tr>
<tr><td>0 − 1 − 1</td><td>0 (${B('10')} − 1 − 1)</td><td>ja</td></tr>
</tbody></table></div>
${merke('Verfahren: schriftliche Subtraktion', `<ol>
<li>Minuend oben, Subtrahend <b>rechtsbündig</b> darunter.</li>
<li>Rechne <b>von rechts nach links</b>: Minuendziffer − Subtrahendziffer − Entleihung.</li>
<li>Wird das negativ, entleihe eine 1 (zählt 2) und notiere die Entleihung in der nächsten Spalte.</li>
<li>Mache die <b>Probe</b>: Differenz + Subtrahend = Minuend.</li></ol>`)}
${beispiel(`Musterbeispiel: ${B('11010')} − ${B('01011')}`, (() => { const w = wegSubtraktion('11010', '01011'); return `${htmlSubtraktion(w)}${htmlSubtraktionErklaerung(w)}${htmlProbeSubtraktion(w)}`; })())}
<h3>Das Rechenwerk: Spalte für Spalte</h3>
${widget('subtraktion', { a: '10110001', b: '01101111' })}
<h2>Sonderfall: eine Kette von Nullen</h2>
<p>Bei ${B('10000000')} − ${B('00000001')} wandert die Entleihung durch alle Nullen nach links – wie bei 1000 − 1 = 999 im Dezimalsystem:</p>
${htmlSubtraktion(wegSubtraktion('10000000', '00000001'))}
<p>Ergebnis: ${B('01111111')} = 127 ✓</p>
${achtung('Typische Fehler', `<ul>
<li>Die Entleihung vergessen oder in der nächsten Spalte nicht abgezogen.</li>
<li>In jeder Spalte einfach „größere minus kleinere Ziffer“ gerechnet.</li>
<li>Die Probe weggelassen – dabei findet sie jeden Rechenfehler.</li></ul>`)}
${tipp('Ausblick', '<p>Computer subtrahieren meist, indem sie eine Addition ausführen (Zweierkomplement). Das lernst du später zusammen mit den negativen Zahlen.</p>')}
`,
  },

  /* ---------------------------------------------------------------- 9 */
  {
    nr: 9,
    kap: 'I',
    titel: 'Jonglieren mit Zahlensystemen',
    untertitel: 'Strategien, Anwendungen und Prüfungstipps',
    dauer: 25,
    ziele: [
      ['für jede Umwandlung den geschicktesten Weg auswählen und begründen', 5],
      ['Zahlensysteme in technischen Anwendungen (DIP-Schalter, SPS, Farbcodes) nutzen', 3],
      ['Zahlen verschiedener Systeme vergleichen und ordnen', 4],
      ['Zahlen konstruieren, die vorgegebene Bedingungen erfüllen', 6],
    ],
    inhalt: `
<h2>Alle Wege auf einen Blick</h2>
${dreieckSVG()}
<div class="tabelle-scroll"><table class="info-tabelle">
<thead><tr><th>Von → nach</th><th>Geschicktester Weg</th></tr></thead>
<tbody>
<tr><td>Dual → Dezimal</td><td>Stellenwerte der Einsen addieren</td></tr>
<tr><td>Dezimal → Dual</td><td>Divisionsrest ÷ 2 (große Zahlen) oder Zweierpotenzen abziehen (kleine Zahlen)</td></tr>
<tr><td>Hex → Dezimal</td><td>Ziffer · 16ⁿ addieren</td></tr>
<tr><td>Dezimal → Hex</td><td>Divisionsrest ÷ 16 – oder bis 255 über das Dualsystem</td></tr>
<tr><td>Hex ↔ Dual</td><td>immer über Tetraden – nie über das Dezimalsystem</td></tr>
</tbody></table></div>

<h2>Anwendungen aus der Elektrotechnik</h2>
<h3>DIP-Schalter (z. B. DMX-Adresse eines Scheinwerfers)</h3>
<p>Jeder Schalter hat einen Stellenwert: Schalter 1 = 1, Schalter 2 = 2, Schalter 3 = 4 … Die Adresse ist die Summe der Schalter auf ON. <b>Achtung:</b> Am Gerät ist Schalter 1 meist <b>links</b> – also genau andersherum als beim Schreiben einer Dualzahl.</p>
${htmlDip(9, [1, 3, 6])}
<p class="neben">Schalter 1, 3 und 6 auf ON: 1 + 4 + 32 = Adresse 37 = ${B('000100101')}.</p>
<h3>SPS-Bytes</h3>
<p>Acht Eingänge einer SPS bilden ein Byte: E0.0 ist Bit 0 (LSB), E0.7 ist Bit 7 (MSB). In der Programmiersoftware erscheint das Byte oft hexadezimal, z. B. 16#A6 = ${B('10100110')}.</p>
<h3>Farben</h3>
<p>Eine Bildschirmfarbe besteht aus drei Bytes Rot, Grün, Blau: <span class="farbprobe" style="--farbe:#FF8800"></span> #FF8800 = Rot 255, Grün 136, Blau 0.</p>
<h3>Zeichen</h3>
<p>Auch Buchstaben sind gespeicherte Zahlen (ASCII): „A“ = 65 = ${X('41')} = ${B('01000001')}.</p>

<h2>So gehst du in der Prüfung vor</h2>
<ol class="schritte">
<li><b>Operator und Stufe lesen:</b> „Gib an“ (• leicht) verlangt nur das Ergebnis, „Erkläre“ (• leicht) einen kurzen Satz, „Wandle um“ (•• mittel) den vollständigen Rechenweg, „Untersuche“ und „Beurteile“ (••• schwer) eine begründete Antwort.</li>
<li><b>Zielsystem markieren:</b> In welchem System wird das Ergebnis verlangt? Mit wie vielen Bit?</li>
<li><b>Weg wählen</b> und den Rechenweg vollständig aufschreiben.</li>
<li><b>Probe</b> machen: zurückrechnen oder bei der Subtraktion addieren.</li>
<li><b>Index</b> an jede Zahl schreiben.</li></ol>
`,
  },
];

/** Inhalte der Merkhilfe (eine druckbare Seite). */
export function merkhilfeHTML() {
  return `
<div class="merkhilfe">
<section><h3>Zweierpotenzen</h3>${htmlZweierTabelle(16)}</section>
<section><h3>Sechzehnerpotenzen</h3>${htmlSechzehnerTabelle(4)}</section>
<section class="mh-hex"><h3>Hex-Ziffern und Tetraden</h3>${htmlHexTabelle({ kompakt: true })}</section>
<section><h3>Die sechs Wege</h3><ul class="mh-wege">
<li><b>Dual → Dez:</b> Stellenwerte der Einsen addieren</li>
<li><b>Dez → Dual:</b> fortgesetzt ÷ 2, Reste von unten nach oben</li>
<li><b>Hex → Dez:</b> Ziffer · 16ⁿ addieren (A = 10 … F = 15)</li>
<li><b>Dez → Hex:</b> fortgesetzt ÷ 16, Reste als 0 … F, von unten nach oben</li>
<li><b>Hex → Dual:</b> jede Ziffer → 4 Bit</li>
<li><b>Dual → Hex:</b> Vierergruppen von rechts → je 1 Ziffer</li></ul></section>
<section><h3>Addition</h3><p class="mono">0+0 = 0 · 0+1 = 1 · 1+1 = 10 · 1+1+1 = 11</p><p>Von rechts nach links, Übertrag in die nächste Spalte.</p></section>
<section><h3>Subtraktion</h3><p class="mono">0−0 = 0 · 1−0 = 1 · 1−1 = 0 · 0−1 = 1 (Entleihung)</p><p>Probe: Differenz + Subtrahend = Minuend.</p></section>
<section><h3>Wertebereich</h3><p>n Bit → 2ⁿ Werte, von 0 bis 2ⁿ − 1 · 8 Bit: 0 … 255 (00 … FF)</p></section>
<section><h3>Schreibweisen</h3><p>${B('101101')} = 0b101101 · ${X('2D')} = 0x2D = 2Dh = 16#2D · ${D(45)}</p></section>
</div>`;
}
