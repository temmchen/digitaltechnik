// darstellung.js – HTML-Bausteine für Zahlen und Rechenwege (reine Zeichenketten, ohne DOM)

import {
  ZIFFERN, hoch, gruppieren, wegAddition, nachBasis,
} from './zahlen.js';

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const SCHMAL = ' '; // schmales geschütztes Leerzeichen (Tausender, DIN 1333)

/** Dezimalzahl mit Tausendergruppen ab 10 000: 48879 → „48 879“. */
export function dez(n) {
  const s = String(n);
  if (s.length < 5) return s;
  return gruppieren(s, 3, SCHMAL);
}

/** Ziffernfolge zur Anzeige gruppieren (dual in Vierergruppen, dezimal in Tausendern). */
export function anzeige(text, basis) {
  const s = String(text).toUpperCase();
  if (basis === 2) return s.length > 4 ? gruppieren(s, 4, SCHMAL) : s;
  if (basis === 10) return dez(s);
  return s;
}

/** Zahl mit Index, farbig nach System: z('101101', 2) → 10 1101₂ */
export function z(text, basis, { gruppiert = true, klasse = '' } = {}) {
  const s = String(text).toUpperCase();
  const inhalt = gruppiert ? anzeige(s, basis) : s;
  return `<span class="z b${basis}${klasse ? ' ' + klasse : ''}">${esc(inhalt)}<sub>${basis}</sub></span>`;
}

/** Zahl (Number) in einem System mit Index. */
export function zn(n, basis, opt) {
  return z(nachBasis(n, basis), basis, opt);
}

/** Potenz, z. B. pot(2, 7) → 2⁷ */
export function pot(basis, exponent) {
  return `${basis}${hoch(exponent)}`;
}

function zeile(zellen, tag = 'td') {
  return `<tr>${zellen.map((c) => (typeof c === 'string' ? `<${tag}>${c}</${tag}>` : `<${tag}${c.a ? ' ' + c.a : ''}>${c.t}</${tag}>`)).join('')}</tr>`;
}

/* ----------------------------- Divisionsrest ----------------------------- */

export function htmlDivisionsrest(weg, { sichtbar = Infinity, ergebnisZeigen = true } = {}) {
  const b = weg.basis;
  const n = weg.zeilen.length;
  const zeigen = Math.min(sichtbar, n);
  const mitRestrechnung = b === 16;
  const kopf = ['Division', 'Ergebnis', mitRestrechnung ? 'Rest berechnen' : null, 'Rest', b === 16 ? 'Hex-Ziffer' : 'Bit']
    .filter(Boolean);
  let rumpf = '';
  weg.zeilen.forEach((zl, i) => {
    const verdeckt = i >= zeigen;
    const zellen = [
      `${dez(zl.dividend)} : ${b}`,
      `= ${dez(zl.quotient)}`,
    ];
    if (mitRestrechnung) zellen.push(`<span class="neben">${dez(zl.dividend)} − ${dez(zl.quotient)}·16 = ${zl.rest}</span>`);
    zellen.push(`Rest ${zl.rest}`);
    const ziffer = b === 16 && zl.rest > 9 ? `${zl.ziffer} <span class="neben">(${zl.rest})</span>` : zl.ziffer;
    zellen.push({ t: `<b class="ziffer b${b}">${ziffer}</b>`, a: 'class="ziffernspalte"' });
    if (i === 0) {
      zellen.push({
        t: `<span class="pfeil-hoch" aria-hidden="true"></span><span class="pfeil-text">von unten nach oben lesen</span>`,
        a: `class="leserichtung" rowspan="${n}"`,
      });
    }
    rumpf += `<tr class="${verdeckt ? 'verdeckt' : ''}${i === n - 1 ? ' letzte' : ''}">${zellen
      .map((c) => (typeof c === 'string' ? `<td>${c}</td>` : `<td ${c.a}>${c.t}</td>`))
      .join('')}</tr>`;
  });
  const fertig = zeigen >= n;
  const ergebnis = fertig && ergebnisZeigen
    ? `<p class="rw-ergebnis">${z(String(weg.n), 10)} = ${z(weg.ergebnis, b)}</p>`
    : '';
  return `<div class="rw rw-division${fertig ? ' fertig' : ''}">
  <div class="tabelle-scroll"><table class="rechentabelle">
    <thead>${zeile(kopf, 'th').replace('</tr>', '<th class="leserichtung-kopf"></th></tr>')}</thead>
    <tbody>${rumpf}</tbody>
  </table></div>
  ${ergebnis}
</div>`;
}

/* ----------------------------- Stellenwert ----------------------------- */

export function htmlStellenwert(weg, { ergebnisZeigen = true } = {}) {
  const b = weg.basis;
  const hatBuchstaben = b === 16 && weg.stellen.some((s) => s.wert > 9);
  const k = (st) => `class="${st.wert ? 'an' : 'aus'}"`;
  const reihe = (titel, f, extra = '') =>
    `<tr${extra}><th scope="row">${titel}</th>${weg.stellen.map((st) => `<td ${k(st)}>${f(st)}</td>`).join('')}</tr>`;
  let t = '<div class="tabelle-scroll"><table class="stellentafel">';
  t += reihe('Stellenwert', (st) => pot(b, st.pos));
  t += reihe('', (st) => dez(st.gewicht), ' class="gewichte"');
  t += reihe(b === 2 ? 'Bit' : 'Ziffer', (st) => `<b class="ziffer b${b}">${st.ziffer}</b>`, ' class="ziffern"');
  if (hatBuchstaben) t += reihe('Ziffernwert', (st) => String(st.wert));
  t += reihe(b === 2 ? 'Wert' : 'Ziffernwert · Stellenwert', (st) => (st.wert ? dez(st.produkt) : '0'), ' class="produkte"');
  t += '</table></div>';

  const terme = weg.stellen.filter((st) => st.wert > 0);
  let rechnung;
  if (terme.length === 0) {
    rechnung = '0';
  } else if (b === 2) {
    rechnung = terme.map((st) => dez(st.gewicht)).join(' + ') + ' = ' + dez(weg.summe);
  } else {
    const teil1 = terme.map((st) => `${st.wert}·${dez(st.gewicht)}`).join(' + ');
    const teil2 = terme.map((st) => dez(st.produkt)).join(' + ');
    rechnung = terme.length > 1 ? `${teil1} = ${teil2} = ${dez(weg.summe)}` : `${teil1} = ${dez(weg.summe)}`;
  }
  const ergebnis = ergebnisZeigen ? `<p class="rw-ergebnis">${z(weg.text, b)} = ${z(String(weg.summe), 10)}</p>` : '';
  return `<div class="rw rw-stellenwert">${t}<p class="rw-rechnung">${rechnung}</p>${ergebnis}</div>`;
}

/* ----------------------------- Zweierpotenzen ----------------------------- */

export function htmlZweierpotenzen(weg, { ergebnisZeigen = true } = {}) {
  let rumpf = '';
  for (const s of weg.schritte) {
    rumpf += `<tr class="${s.passt ? 'an' : 'aus'}"><td>${pot(2, s.pos)} = ${dez(s.gewicht)}</td><td>${
      s.passt ? `${dez(s.vorher)} ≥ ${dez(s.gewicht)} → passt` : `${dez(s.vorher)} &lt; ${dez(s.gewicht)} → passt nicht`
    }</td><td><b class="ziffer b2">${s.passt ? 1 : 0}</b></td><td>${
      s.passt ? `${dez(s.vorher)} − ${dez(s.gewicht)} = ${dez(s.nachher)}` : `bleibt ${dez(s.nachher)}`
    }</td></tr>`;
  }
  const ergebnis = ergebnisZeigen ? `<p class="rw-ergebnis">${z(String(weg.n), 10)} = ${z(weg.ergebnis, 2)}</p>` : '';
  return `<div class="rw rw-zweier"><div class="tabelle-scroll"><table class="rechentabelle">
  <thead><tr><th>Zweierpotenz</th><th>Passt sie in den Rest?</th><th>Bit</th><th>Neuer Rest</th></tr></thead>
  <tbody>${rumpf}</tbody></table></div>
  <p class="neben">Die Bits von oben nach unten gelesen ergeben die Dualzahl.</p>${ergebnis}</div>`;
}

/* ----------------------------- Tetraden ----------------------------- */

function nibbleWert(bits) {
  const teile = [];
  [8, 4, 2, 1].forEach((g, i) => {
    if (bits[i] === '1') teile.push(g);
  });
  const summe = teile.reduce((a, b) => a + b, 0);
  if (teile.length === 0) return '0';
  return teile.length === 1 ? String(summe) : `${teile.join('+')} = ${summe}`;
}

export function htmlHexZuDual(weg, { ergebnisZeigen = true } = {}) {
  const spalten = weg.gruppen
    .map(
      (g) => `<div class="tetrade"><div class="t-hex"><b class="ziffer b16">${g.hex}</b>${
        g.wert > 9 ? `<span class="neben"> = ${g.wert}</span>` : ''
      }</div><div class="t-pfeil" aria-hidden="true">↓</div><div class="t-bits"><b class="ziffer b2">${g.bits}</b></div><div class="t-wert neben">${nibbleWert(g.bits)}</div></div>`,
    )
    .join('');
  const ohne = weg.voll !== weg.ergebnis
    ? ` = ${z(weg.ergebnis, 2)} <span class="neben">(führende Nullen weggelassen)</span>`
    : '';
  const ergebnis = ergebnisZeigen
    ? `<p class="rw-ergebnis">${z(weg.hex, 16)} = ${z(weg.voll, 2)}${ohne}</p>`
    : '';
  return `<div class="rw rw-tetraden"><div class="tetraden">${spalten}</div>${ergebnis}</div>`;
}

export function htmlDualZuHex(weg, { ergebnisZeigen = true } = {}) {
  const auff = weg.ergaenzt
    ? `<p class="neben">Von rechts in Vierergruppen teilen, links ${weg.ergaenzt === 1 ? 'eine Null' : weg.ergaenzt + ' Nullen'} ergänzen: ${z(weg.bin, 2)} → ${z(weg.aufgefuellt, 2)}</p>`
    : `<p class="neben">Von rechts in Vierergruppen teilen: ${z(weg.aufgefuellt, 2)}</p>`;
  const spalten = weg.gruppen
    .map(
      (g) => `<div class="tetrade"><div class="t-bits"><b class="ziffer b2">${g.bits}</b></div><div class="t-wert neben">${nibbleWert(g.bits)}</div><div class="t-pfeil" aria-hidden="true">↓</div><div class="t-hex"><b class="ziffer b16">${g.hex}</b></div></div>`,
    )
    .join('');
  const ergebnis = ergebnisZeigen ? `<p class="rw-ergebnis">${z(weg.bin, 2)} = ${z(weg.ergebnis, 16)}</p>` : '';
  return `<div class="rw rw-tetraden">${auff}<div class="tetraden">${spalten}</div>${ergebnis}</div>`;
}

/* ----------------------------- Addition ----------------------------- */

/**
 * Schriftliche Addition. Überträge stehen (wie im Heft) klein unter dem
 * zweiten Summanden in der Spalte, in die sie hineingetragen werden.
 * bis = Anzahl der schon gerechneten Spalten (für die Schritt-für-Schritt-Ansicht),
 * aktiv = Stelle, die gerade hervorgehoben ist.
 */
export function htmlAddition(weg, { bis = Infinity, aktiv = -1, beschriftung = true } = {}) {
  const breite = weg.breite + 1;
  const sp = weg.spalten;
  const fertig = bis >= sp.length;
  const zelle = (pos, inhalt, extra = '') =>
    `<td class="sp${pos === aktiv ? ' aktiv' : ''}${extra}">${inhalt}</td>`;
  const reihe = (label, f, klasse = '') => {
    let h = `<tr class="${klasse}"><th scope="row">${label}</th>`;
    for (let pos = breite - 1; pos >= 0; pos--) h += f(pos);
    return h + '</tr>';
  };
  const a = (pos) => (pos < weg.breite ? weg.a[weg.breite - 1 - pos] : '');
  const b = (pos) => (pos < weg.breite ? weg.b[weg.breite - 1 - pos] : '');
  const ue = (pos) => {
    if (pos === 0) return '';
    const quelle = sp[pos - 1];
    return pos - 1 < bis && quelle && quelle.aus ? '1' : '';
  };
  const erg = (pos) => {
    if (pos < weg.breite) return pos < bis ? String(sp[pos].s) : '';
    return fertig && weg.endUebertrag ? '1' : '';
  };
  let t = '<div class="tabelle-scroll"><table class="schriftlich" aria-label="Schriftliche Addition">';
  t += reihe('', (pos) => zelle(pos, a(pos)));
  t += reihe('+', (pos) => zelle(pos, b(pos)));
  t += reihe(beschriftung ? '<span class="neben">Übertrag</span>' : '', (pos) => zelle(pos, ue(pos), ' klein'), 'uebertraege');
  t += reihe('=', (pos) => zelle(pos, erg(pos), ' ergebnis'), 'summe');
  t += '</table></div>';
  return `<div class="rw rw-schriftlich">${t}</div>`;
}

const BIN = (s) => `<span class="z b2">${s}<sub>2</sub></span>`;

/** Erklärung Spalte für Spalte (von rechts nach links). */
export function textAdditionSpalte(c) {
  const terme = [c.a, c.b];
  if (c.ein) terme.push(`${c.ein} <span class="neben">(Übertrag)</span>`);
  const links = terme.join(' + ');
  const summe = c.summe;
  const alsDual = summe >= 2 ? ` = ${BIN(summe.toString(2))}` : '';
  const tun = c.aus ? `schreibe <b>${c.s}</b>, Übertrag <b>1</b> in die nächste Stelle` : `schreibe <b>${c.s}</b>`;
  return `Stelle ${pot(2, c.pos)}: ${links} = ${summe}${alsDual} → ${tun}`;
}

export function htmlAdditionErklaerung(weg) {
  const li = weg.spalten.map((c) => `<li>${textAdditionSpalte(c)}</li>`);
  if (weg.endUebertrag) li.push('<li>Der letzte Übertrag wird zur neuen, vordersten Stelle des Ergebnisses.</li>');
  return `<ol class="spaltenliste">${li.join('')}</ol>`;
}

/* ----------------------------- Subtraktion ----------------------------- */

export function htmlSubtraktion(weg, { bis = Infinity, aktiv = -1, beschriftung = true } = {}) {
  const breite = weg.breite;
  const sp = weg.spalten;
  const zelle = (pos, inhalt, extra = '') =>
    `<td class="sp${pos === aktiv ? ' aktiv' : ''}${extra}">${inhalt}</td>`;
  const reihe = (label, f, klasse = '') => {
    let h = `<tr class="${klasse}"><th scope="row">${label}</th>`;
    for (let pos = breite - 1; pos >= 0; pos--) h += f(pos);
    return h + '</tr>';
  };
  const a = (pos) => weg.a[breite - 1 - pos];
  const b = (pos) => weg.b[breite - 1 - pos];
  const ent = (pos) => {
    if (pos === 0) return '';
    const quelle = sp[pos - 1];
    return pos - 1 < bis && quelle && quelle.aus ? '1' : '';
  };
  const erg = (pos) => (pos < bis ? String(sp[pos].d) : '');
  let t = '<div class="tabelle-scroll"><table class="schriftlich" aria-label="Schriftliche Subtraktion">';
  t += reihe('', (pos) => zelle(pos, a(pos)));
  t += reihe('−', (pos) => zelle(pos, b(pos)));
  t += reihe(beschriftung ? '<span class="neben">Entleihung</span>' : '', (pos) => zelle(pos, ent(pos), ' klein'), 'uebertraege');
  t += reihe('=', (pos) => zelle(pos, erg(pos), ' ergebnis'), 'summe');
  t += '</table></div>';
  return `<div class="rw rw-schriftlich">${t}</div>`;
}

export function textSubtraktionSpalte(c) {
  const entl = c.ein ? ` − 1 <span class="neben">(Entleihung)</span>` : '';
  const direkt = c.a - c.b - c.ein;
  if (direkt >= 0) {
    return `Stelle ${pot(2, c.pos)}: ${c.a} − ${c.b}${entl} = ${c.d} → schreibe <b>${c.d}</b>`;
  }
  const geliehen = c.a === 0 ? BIN('10') : BIN('11');
  return `Stelle ${pot(2, c.pos)}: ${c.a} − ${c.b}${entl} geht nicht → eine 1 von der nächsten Stelle entleihen (zählt hier 2): ${geliehen} − ${c.b}${entl} = ${c.d} → schreibe <b>${c.d}</b>, Entleihung <b>1</b> in die nächste Stelle`;
}

export function htmlSubtraktionErklaerung(weg) {
  return `<ol class="spaltenliste">${weg.spalten.map((c) => `<li>${textSubtraktionSpalte(c)}</li>`).join('')}</ol>`;
}

/** Probe zur Subtraktion: Differenz + Subtrahend = Minuend. */
export function htmlProbeSubtraktion(weg) {
  const probe = wegAddition(weg.ergebnis, weg.b);
  const ok = parseInt(probe.ergebnis, 2) === parseInt(weg.a, 2);
  return `<div class="probe"><p><b>Probe</b> (Differenz + Subtrahend = Minuend):</p>${htmlAddition(probe, { beschriftung: false })}<p>${
    ok ? `✓ ${z(probe.ergebnis.replace(/^0+(?=.)/, ''), 2)} ist der Minuend – die Rechnung stimmt.` : '✗ Die Probe geht nicht auf.'
  }</p></div>`;
}

/** Probe im Dezimalsystem für Addition/Subtraktion. */
export function htmlDezimalProbe(a, b, op) {
  const x = parseInt(a, 2);
  const y = parseInt(b, 2);
  const e = op === '+' ? x + y : x - y;
  return `<p class="probe-dez"><b>Kontrolle im Dezimalsystem:</b> ${z(a.replace(/^0+(?=.)/, ''), 2)} ${op} ${z(b.replace(/^0+(?=.)/, ''), 2)} → ${dez(x)} ${op} ${dez(y)} = ${dez(e)} und ${z(nachBasis(e, 2), 2)} = ${z(String(e), 10)} ✓</p>`;
}

/**
 * DIP-Schalterblock wie am DMX-Gerät: Schalter 1 links (Wert 1), Schalter n rechts (Wert 2^(n−1)).
 * an = Nummern der Schalter, die auf ON stehen.
 */
export function htmlDip(anzahl, an, { werte = true } = {}) {
  const ein = new Set(an);
  let h = `<div class="dip" role="img" aria-label="DIP-Schalter, auf ON: ${an.length ? an.join(', ') : 'keiner'}"><div class="dip-on">ON ▲</div><div class="dip-reihe">`;
  for (let i = 1; i <= anzahl; i++) {
    h += `<div class="dip-schalter${ein.has(i) ? ' ein' : ''}"><span class="dip-gehaeuse"><span class="dip-hebel"></span></span><span class="dip-nr">${i}</span>${
      werte ? `<span class="dip-wert">${2 ** (i - 1)}</span>` : ''
    }</div>`;
  }
  return h + '</div></div>';
}

/** Hex-Lerntabelle 0–F als HTML. */
export function htmlHexTabelle({ kompakt = false } = {}) {
  let h = `<div class="tabelle-scroll"><table class="hextabelle${kompakt ? ' kompakt' : ''}"><thead><tr><th>Dezimal</th><th>Hex</th><th>Dual (8-4-2-1)</th></tr></thead><tbody>`;
  for (let i = 0; i < 16; i++) {
    h += `<tr><td class="b10">${i}</td><td class="b16"><b>${ZIFFERN[i]}</b></td><td class="b2 mono">${i.toString(2).padStart(4, '0')}</td></tr>`;
  }
  return h + '</tbody></table></div>';
}

/** Tabelle der Zweierpotenzen. */
export function htmlZweierTabelle(bis = 16) {
  let k = '';
  let w = '';
  for (let i = 0; i <= bis; i++) {
    k += `<th>${pot(2, i)}</th>`;
    w += `<td>${dez(2 ** i)}</td>`;
  }
  return `<div class="tabelle-scroll"><table class="potenztabelle"><tr>${k}</tr><tr>${w}</tr></table></div>`;
}

export function htmlSechzehnerTabelle(bis = 4) {
  let k = '';
  let w = '';
  for (let i = 0; i <= bis; i++) {
    k += `<th>${pot(16, i)}</th>`;
    w += `<td>${dez(16 ** i)}</td>`;
  }
  return `<div class="tabelle-scroll"><table class="potenztabelle"><tr>${k}</tr><tr>${w}</tr></table></div>`;
}
