// druck.js – druckfertige Blätter: Prüfung (Aufgaben- und Lösungsblatt), Lösungsschlüssel, Taxonomie-Matrix

import { esc, z, htmlDip, htmlAddition, htmlSubtraktion } from '../kern/darstellung.js';
import { nachBasis, auffuellen, wegAddition, wegSubtraktion } from '../kern/zahlen.js';
import { stufe, TAXONOMIE, NIVEAU } from '../kern/taxonomie.js';
import { verteilung } from '../kern/pruefungsplan.js';
import { feldName, fmtP, vorBreite } from './aufgabenkarte.js';

const ohneDetails = (html) => String(html).replace(/<details[\s\S]*?<\/details>/g, '');

export function datumText(iso) {
  if (!iso) return '';
  const [j, m, t] = iso.split('-');
  return `${t}.${m}.${j}`;
}

/* ------------------------------------------------------------------ */
/* Antwortbereiche                                                     */
/* ------------------------------------------------------------------ */

function loesungsText(f) {
  if (f.art === 'zahl') {
    let s = nachBasis(f.loesung, f.basis);
    if (f.stellen) s = auffuellen(s, f.stellen);
    return z(s, f.basis);
  }
  if (f.art === 'wahl' || f.art === 'liste') return f.optionen[f.loesung].text;
  return '';
}

function zahlBox(f, mitLoesung) {
  if (f.basis === 2 && f.stellen) {
    const s = mitLoesung ? auffuellen(nachBasis(f.loesung, 2), f.stellen) : ' '.repeat(f.stellen);
    return `<span class="d-ziffern">${[...s].map((c) => `<span class="d-ziffer">${c.trim() ? c : ''}</span>`).join('')}</span><sub>2</sub>`;
  }
  const breite = f.basis === 2 ? 11 : f.basis === 16 ? 6 : 7;
  return `<span class="d-box" style="--breite:${breite}">${mitLoesung ? `<span class="d-eintrag">${loesungsText(f)}</span>` : ''}</span>${mitLoesung ? '' : `<sub>${f.basis}</sub>`}`;
}

function schriftlichesRaster(a, mitLoesung) {
  const { a: x, b: y } = a.param;
  if (mitLoesung) return a.typ === 'addition' ? htmlAddition(wegAddition(x, y)) : htmlSubtraktion(wegSubtraktion(x, y));
  const breite = Math.max(x.length, y.length) + (a.typ === 'addition' ? 1 : 0);
  const reihe = (zeichen, s) => `<tr><th>${zeichen}</th>${s.padStart(breite, ' ').split('').map((c) => `<td>${c.trim()}</td>`).join('')}</tr>`;
  const leer = (label, klasse) => `<tr class="${klasse}"><th>${label}</th>${'<td></td>'.repeat(breite)}</tr>`;
  return `<table class="d-schriftlich">${reihe('', x)}${reihe(a.typ === 'addition' ? '+' : '−', y)}${leer(a.typ === 'addition' ? 'Ü' : 'E', 'd-klein')}${leer('=', 'd-summe')}</table>`;
}

function druckFelder(a, mitLoesung) {
  if (a.typ === 'addition' || a.typ === 'subtraktion') {
    return `${schriftlichesRaster(a, mitLoesung)}${mitLoesung ? `<p class="d-ergebnis">Ergebnis: ${loesungsText(a.felder[0])}</p>` : ''}`;
  }
  if (a.layout && a.layout.art === 'tabelle') {
    const felder = Object.fromEntries(a.felder.map((f) => [f.id, f]));
    return `<table class="d-tabelle"><thead><tr>${a.layout.kopf.map((k) => `<th>${k}</th>`).join('')}</tr></thead><tbody>${a.layout.zeilen
      .map((zeile) => `<tr>${zeile.map((c) => (c.t ? `<td class="gegeben">${c.t}</td>` : `<td class="d-leer">${mitLoesung ? loesungsText(felder[c.f]) : ''}</td>`)).join('')}</tr>`)
      .join('')}</tbody></table>`;
  }
  return a.felder.map((f, i) => {
    switch (f.art) {
      case 'zahl':
        return `<div class="d-feld">${f.vor ? `<span class="d-vor">${f.vor}</span>` : ''}${zahlBox(f, mitLoesung)}${f.nach ? `<span class="d-nach">${f.nach}</span>` : ''}</div>`;
      case 'wahl':
      case 'mehrfach': {
        const richtig = f.art === 'wahl' ? [f.loesung] : f.loesung;
        return `<div class="d-feld d-wahl">${f.vor ? `<p class="d-vor">${f.vor}</p>` : ''}<ul>${f.optionen
          .map((o, j) => `<li><span class="d-kasten">${mitLoesung && richtig.includes(j) ? '✗' : ''}</span>${o.text}</li>`)
          .join('')}</ul>${f.art === 'mehrfach' && !mitLoesung ? '<p class="d-klein-hinweis">Mehrere Antworten möglich.</p>' : ''}</div>`;
      }
      case 'liste':
        return `<div class="d-feld">${f.vor ? `<span class="d-vor">${f.vor}</span>` : ''}<span class="d-box" style="--breite:3">${mitLoesung ? `<span class="d-eintrag">${esc(f.optionen[f.loesung].text)}</span>` : ''}</span>${f.nach ? `<span class="d-nach">${f.nach}</span>` : ''}</div>`;
      case 'bits':
        if (f.stil === 'dip') return `<div class="d-feld">${htmlDip(f.anzahl, mitLoesung ? f.loesung.map((b) => b + 1) : [])}${mitLoesung ? '' : '<p class="d-klein-hinweis">Male die Schalter aus, die auf ON stehen müssen.</p>'}</div>`;
        return `<div class="d-feld d-sps">${[...Array(f.anzahl).keys()].reverse().map((b) => `<span class="d-sps-bit"><span class="d-kasten">${mitLoesung && f.loesung.includes(b) ? '1' : ''}</span>${esc(f.beschriftung(b))}</span>`).join('')}</div>`;
      default:
        return `<div class="d-feld">${feldName(a, f, i)}</div>`;
    }
  }).join('');
}

function rechenwegZeilen(a) {
  if (a.typ === 'addition' || a.typ === 'subtraktion') return 0;
  if (a.typ === 'umwandlung') return 3 + a.niveau * 2;
  if (a.k >= 4 && a.felder.some((f) => f.art === 'zahl')) return 5;
  if (a.k >= 4) return 3;
  return 0;
}

/* ------------------------------------------------------------------ */
/* Prüfungsblatt                                                       */
/* ------------------------------------------------------------------ */

export function taxonomieTabelleHTML(aufgaben) {
  const v = verteilung(aufgaben);
  const zeilen = TAXONOMIE.map((t) => {
    const p = v.punkteJeStufe[t.k];
    return `<tr><td><span class="chip chip-k k${t.k}">K${t.k}</span> ${t.name}</td><td>${v.anzahlJeStufe[t.k]}</td><td>${fmtP(p)}</td><td>${v.summe ? Math.round((p / v.summe) * 100) : 0} %</td></tr>`;
  }).join('');
  const kapitel = Object.entries(v.punkteJeKapitel).map(([k, p]) => `${esc(k)}: ${fmtP(p)} P`).join(' · ');
  return `<table class="taxonomie-tabelle"><thead><tr><th>Taxonomiestufe</th><th>Aufgaben</th><th>Punkte</th><th>Anteil</th></tr></thead><tbody>${zeilen}</tbody><tfoot><tr><th>Summe</th><th>${aufgaben.length}</th><th>${fmtP(v.summe)}</th><th>100 %</th></tr></tfoot></table><p class="d-klein-hinweis">Punkte je Kapitel: ${kapitel}</p>`;
}

export function pruefungsblattHTML(aufgaben, kopf, { loesung = false, taxonomieZeigen = true, gruppe = '' } = {}) {
  const v = verteilung(aufgaben);
  const kopfHTML = `<header class="d-kopf">
<div class="d-zeile"><span class="d-schule">${esc(kopf.schule)}</span><span>${esc(kopf.klasse)} · ${esc(kopf.modul)}</span><span>${esc(datumText(kopf.datum))}</span></div>
<h1 class="d-titel">${esc(kopf.titel)}${gruppe ? ` <span class="d-gruppe">Gruppe ${esc(gruppe)}</span>` : ''}${loesung ? ' <span class="d-marke">Lösung</span>' : ''}</h1>
<div class="d-zeile d-felder"><span>Name: <span class="d-linie lang">${loesung ? '' : ''}</span></span><span>Punkte: <span class="d-linie kurz"></span> / ${fmtP(v.summe)}</span><span>Note: <span class="d-linie kurz"></span></span></div>
<div class="d-info">Dauer: ${esc(String(kopf.dauer))} min · Hilfsmittel: ${esc(kopf.hilfsmittel)} · ${aufgaben.length} Aufgaben · Kennung ${esc(String(kopf.startwert))}${gruppe ? esc(gruppe) : ''}</div>
${kopf.hinweis ? `<p class="d-hinweis">${esc(kopf.hinweis)}</p>` : ''}
</header>`;
  const teile = aufgaben.map((a, i) => {
    const st = stufe(a.k);
    const zeilen = loesung ? 0 : rechenwegZeilen(a);
    return `<section class="d-aufgabe">
<div class="d-a-kopf"><b>Aufgabe ${i + 1}</b><span class="d-a-meta">${taxonomieZeigen ? `K${a.k} ${st.name} · ` : ''}${fmtP(a.punkte)} P${loesung ? ` · ${esc(a.schluessel)}${a.variante ? ' (neue Zahlen)' : ''}` : ''}</span></div>
<div class="d-a-frage">${a.frage}</div>
<div class="d-a-antwort" style="${vorBreite(a)}">${druckFelder(a, loesung)}</div>
${zeilen ? `<div class="d-rechenweg" style="--zeilen:${zeilen}"><span>${a.k >= 4 ? 'Rechenweg / Begründung' : 'Rechenweg'}</span></div>` : ''}
${loesung ? `<div class="d-a-loesung">${a.regel ? '<p><i>Mehrere Lösungen möglich – jede Lösung, die alle Bedingungen erfüllt, ist richtig.</i></p>' : ''}${ohneDetails(a.loesung)}</div>` : ''}
</section>`;
  }).join('');
  const schluss = loesung ? `<section class="d-uebersicht"><h2>Taxonomie-Übersicht</h2>${taxonomieTabelleHTML(aufgaben)}</section>` : '';
  return `<div class="druckblatt${loesung ? ' ist-loesung' : ''}">${kopfHTML}${teile}${schluss}</div>`;
}

/* ------------------------------------------------------------------ */
/* Lösungsschlüssel und Taxonomie-Matrix                               */
/* ------------------------------------------------------------------ */

export function matrixHTML(thema) {
  const zaehle = (kap, k) => thema.aufgaben.filter((a) => a.kap === kap && a.k === k).length;
  const kopf = TAXONOMIE.map((t) => `<th title="${t.name}"><span class="chip chip-k k${t.k}">K${t.k}</span></th>`).join('');
  const zeilen = thema.kapitel.map((kap) => {
    const zellen = TAXONOMIE.map((t) => {
      const n = zaehle(kap.id, t.k);
      return `<td class="${n ? 'voll' : 'leer'}">${n || '·'}</td>`;
    }).join('');
    const summe = thema.aufgaben.filter((a) => a.kap === kap.id).length;
    return `<tr><th scope="row">${kap.id} · ${esc(kap.kurz)}</th>${zellen}<td class="summe">${summe}</td></tr>`;
  }).join('');
  const fuss = TAXONOMIE.map((t) => `<td>${thema.aufgaben.filter((a) => a.k === t.k).length}</td>`).join('');
  return `<div class="tabelle-scroll"><table class="matrix"><thead><tr><th>Kapitel</th>${kopf}<th>Σ</th></tr></thead><tbody>${zeilen}</tbody><tfoot><tr><th>Summe</th>${fuss}<td class="summe">${thema.aufgaben.length}</td></tr></tfoot></table></div>`;
}

export function loesungsschluesselHTML(thema) {
  const zeilen = thema.aufgaben.map((a) => {
    const werte = a.felder.map((f, i) => {
      const name = a.felder.length > 1 ? `<span class="ls-feld">${feldName(a, f, i)}</span> ` : '';
      let wert;
      if (f.art === 'mehrfach') wert = f.loesung.map((j) => f.optionen[j].text).join(' · ');
      else if (f.art === 'bits') wert = f.loesung.slice().sort((x, y) => (f.stil === 'dip' ? x - y : y - x)).map((b) => esc(f.beschriftung(b))).join(', ');
      else wert = loesungsText(f);
      return `<div class="ls-wert">${name}${wert}</div>`;
    }).join('');
    return `<tr><td class="ls-nr">${a.nr}</td><td>${a.kap}</td><td><span class="chip chip-k k${a.k}">K${a.k}</span></td><td class="niveau n${a.niveau}">${NIVEAU[a.niveau].zeichen}</td><td>${fmtP(a.punkte)}</td><td class="ls-titel">${esc(a.titel)}</td><td>${a.regel ? '<i>Beispiel (mehrere Lösungen):</i>' : ''}${werte}</td></tr>`;
  }).join('');
  return `<div class="tabelle-scroll"><table class="schluessel"><thead><tr><th>Nr.</th><th>Kap.</th><th>Stufe</th><th>Niveau</th><th>P</th><th>Aufgabe</th><th>Lösung</th></tr></thead><tbody>${zeilen}</tbody></table></div>`;
}
