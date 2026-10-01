// aufgabenkarte.js – eine Aufgabe als Karte: Felder, Prüfen, Tipp, Lösung
//
// Modi: 'ueben' (mit Rückmeldung; Lösung erst nach eigenem Versuch, für Lehrkräfte sofort),
//       'pruefung' (nur Felder), 'auswertung' (nach der Abgabe: Punkte, Markierungen, Lösung).

import { icon } from '../kern/icons.js';
import { esc, z } from '../kern/darstellung.js';
import { nachBasis, auffuellen } from '../kern/zahlen.js';
import { stufeVon, stufe, prozess } from '../kern/taxonomie.js';
import { pruefeAufgabe, musterAntworten } from '../kern/pruefen.js';
import { hatVarianten } from '../kern/varianten.js';
import { kapitelVon } from '../themen/index.js';
import * as F from '../kern/fortschritt.js';
import { istLehrer, loesungenDirekt } from '../kern/lehrer.js';

export const STATUS_TEXT = {
  offen: 'noch nicht bearbeitet',
  richtig: 'gelöst',
  teilweise: 'teilweise gelöst',
  falsch: 'noch nicht gelöst',
  gesehen: 'Lösung angesehen',
};

export const fmtP = (x) => String(x).replace('.', ',');

export function ohneTags(html) {
  return String(html)
    .replace(/<sub>(\d+)<\/sub>/g, ' (Basis $1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ */
/* Kopf: Kapitel, Taxonomiestufe, Denkprozess, Punkte                  */
/* ------------------------------------------------------------------ */

export function chipsHTML(a, { mitThema = false } = {}) {
  const kap = kapitelVon(a);
  const s = stufeVon(a.k);
  const st = stufe(s);
  const pr = prozess(a.k);
  return `${mitThema ? `<span class="chip chip-thema">${esc(a.kuerzel)}</span>` : ''}<span class="chip chip-kap" title="Kapitel ${a.kap}: ${esc(kap ? kap.titel : '')}">${a.kap} · ${esc(kap ? kap.kurz : '')}</span><span class="chip chip-stufe s${s}" title="Taxonomiestufe ${s} – ${st.name} (${st.afb}): ${st.titel}">${st.zeichen} ${st.name}</span><span class="chip chip-prozess" title="Denkprozess nach Bloom: ${pr.name} – ${esc(pr.beschreibung)}">${pr.name}</span><span class="chip chip-p" title="Punkte in der Prüfung">${fmtP(a.punkte)} P</span>`;
}

/* ------------------------------------------------------------------ */
/* Felder                                                              */
/* ------------------------------------------------------------------ */

const BASISWORT = { 2: 'Dualzahl', 10: 'Dezimalzahl', 16: 'Hexadezimalzahl' };

function tabellenBeschriftung(a) {
  const marken = {};
  if (!a.layout || a.layout.art !== 'tabelle') return marken;
  a.layout.zeilen.forEach((zeile, r) => {
    zeile.forEach((zelle, c) => {
      if (zelle.f) marken[zelle.f] = `${a.layout.kopf[c]} (Zeile ${r + 1})`;
    });
  });
  return marken;
}

/** Bezeichnung eines Feldes für Lösungen und Screenreader. */
export function feldName(a, f, i) {
  const t = tabellenBeschriftung(a);
  if (t[f.id]) return t[f.id];
  if (f.vor) return f.vor;
  if (f.art === 'bits') return f.stil === 'dip' ? 'Schalter auf ON' : 'Eingänge mit 1-Signal';
  if (f.art === 'wahl') return 'Antwort';
  return a.felder.length > 1 ? `Antwort ${i + 1}` : 'Antwort';
}

function zahlEingabe(f, name, { gesperrt = false, label = '' } = {}) {
  const modus = f.basis === 16 ? 'text' : 'numeric';
  const breite = f.basis === 2 ? (f.stellen ? f.stellen + 4 : 15) : f.basis === 16 ? 8 : 9;
  return `<span class="eingabe b${f.basis}" style="--zeichen:${breite}"><input type="text" name="${name}" id="${name}" inputmode="${modus}" autocomplete="off" autocorrect="off" autocapitalize="${f.basis === 16 ? 'characters' : 'off'}" spellcheck="false" enterkeyhint="done" aria-label="${esc(label)} – ${BASISWORT[f.basis]}"${gesperrt ? ' disabled' : ''}><sub aria-hidden="true">${f.basis}</sub></span>`;
}

function feldHTML(a, f, uid, i, { gesperrt = false } = {}) {
  const name = `${uid}-${f.id}`;
  const label = ohneTags(feldName(a, f, i));
  const meldung = `<p class="feld-meldung" data-meldung="${f.id}" aria-live="polite"></p>`;
  const dis = gesperrt ? ' disabled' : '';
  switch (f.art) {
    case 'zahl':
      return `<div class="feld feld-zahl" data-feld="${f.id}">${f.vor ? `<label class="feld-vor" for="${name}">${f.vor}</label>` : ''}${zahlEingabe(f, name, { gesperrt, label })}${f.nach ? `<span class="feld-nach">${f.nach}</span>` : ''}<span class="feld-symbol" aria-hidden="true"></span></div>${meldung}`;
    case 'wahl':
      return `<fieldset class="feld feld-wahl" data-feld="${f.id}"><legend class="feld-vor">${f.vor || 'Wähle die richtige Antwort:'}</legend>${f.optionen
        .map((o, j) => `<label class="option" data-option="${j}"><input type="radio" name="${name}" value="${j}"${dis}><span class="option-text">${o.text}</span></label>`)
        .join('')}</fieldset>${meldung}`;
    case 'liste':
      return `<div class="feld feld-liste" data-feld="${f.id}">${f.vor ? `<span class="feld-vor">${f.vor}</span>` : ''}<select name="${name}" aria-label="${esc(label)}"${dis}><option value="">…</option>${f.optionen
        .map((o, j) => `<option value="${j}">${esc(o.text)}</option>`)
        .join('')}</select>${f.nach ? `<span class="feld-nach">${f.nach}</span>` : ''}<span class="feld-symbol" aria-hidden="true"></span></div>${meldung}`;
    case 'mehrfach':
      return `<fieldset class="feld feld-mehrfach" data-feld="${f.id}"><legend class="feld-vor">${f.vor || 'Mehrere Antworten möglich:'}</legend>${f.optionen
        .map((o, j) => `<label class="option" data-option="${j}"><input type="checkbox" name="${name}" value="${j}"${dis}><span class="option-text">${o.text}</span></label>`)
        .join('')}</fieldset>${meldung}`;
    case 'bits': {
      const reihenfolge = [...Array(f.anzahl).keys()];
      if (f.stil !== 'dip') reihenfolge.reverse();
      const schalter = reihenfolge
        .map((bit) => `<button type="button" class="schalter" data-bit="${bit}" aria-pressed="false" aria-label="${esc(f.beschriftung(bit))}"${dis}><span class="schalter-gehaeuse"><span class="schalter-hebel"></span></span><span class="schalter-name">${f.stil === 'dip' ? bit + 1 : esc(f.beschriftung(bit))}</span>${f.stil === 'dip' ? `<span class="schalter-wert">${2 ** bit}</span>` : ''}</button>`)
        .join('');
      return `<div class="feld feld-bits" data-feld="${f.id}">${f.vor ? `<span class="feld-vor">${f.vor}</span>` : ''}<div class="schalterleiste stil-${f.stil}" role="group" aria-label="${esc(label)}">${f.stil === 'dip' ? '<span class="dip-on">ON ▲</span>' : ''}<div class="schalter-reihe">${schalter}</div></div></div>${meldung}`;
    }
    default:
      return '';
  }
}

function tabelleHTML(a, uid, opt) {
  const L = a.layout;
  const felder = Object.fromEntries(a.felder.map((f, i) => [f.id, [f, i]]));
  const kopf = `<tr>${L.kopf.map((k) => `<th scope="col">${k}</th>`).join('')}</tr>`;
  const rumpf = L.zeilen
    .map((zeile) => `<tr>${zeile
      .map((zelle) => {
        if (zelle.t) return `<td class="gegeben">${zelle.t}</td>`;
        const [f, i] = felder[zelle.f];
        const name = `${uid}-${f.id}`;
        return `<td><div class="feld feld-zahl kompakt" data-feld="${f.id}">${zahlEingabe(f, name, { gesperrt: opt.gesperrt, label: ohneTags(feldName(a, f, i)) })}<span class="feld-symbol" aria-hidden="true"></span></div></td>`;
      })
      .join('')}</tr>`)
    .join('');
  const meldungen = a.felder.map((f) => `<p class="feld-meldung" data-meldung="${f.id}" aria-live="polite"></p>`).join('');
  return `<div class="tabelle-scroll"><table class="eingabetabelle"><thead>${kopf}</thead><tbody>${rumpf}</tbody></table></div><div class="tabellen-meldungen">${meldungen}</div>`;
}

/** Breite der längsten Feldbeschriftung – damit die Eingabefelder einer Aufgabe bündig stehen. */
export function vorBreite(a) {
  const laengen = a.felder
    .filter((f) => (f.art === 'zahl' || f.art === 'liste') && f.vor)
    .map((f) => f.vor.replace(/<sub>.*?<\/sub>/g, '_').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ').length);
  if (laengen.length < 2) return '';
  return `--vor:${(Math.min(30, Math.max(...laengen)) * 0.6 + 0.6).toFixed(1)}em`;
}

export function felderHTML(a, uid, opt = {}) {
  if (a.layout && a.layout.art === 'tabelle') return tabelleHTML(a, uid, opt);
  return a.felder.map((f, i) => feldHTML(a, f, uid, i, opt)).join('');
}

/* ------------------------------------------------------------------ */
/* Karte                                                               */
/* ------------------------------------------------------------------ */

function kannLoesungSehen(a, karte = null) {
  if (istLehrer()) return true;
  if (a.variante) return !!(karte && karte.dataset.versucht);
  return F.versuche(a.schluessel) > 0;
}

function aktionenHTML(a) {
  const darf = kannLoesungSehen(a);
  const lehrer = istLehrer();
  return `<div class="karte-aktionen">
<button type="button" class="btn primaer" data-aktion="pruefen">${icon('haken')}<span>Prüfen</span></button>
<button type="button" class="btn" data-aktion="tipp" aria-expanded="false">${icon('tipp')}<span>Tipp</span></button>
<button type="button" class="btn" data-aktion="loesung" aria-expanded="false"${darf ? '' : ' disabled'} title="${darf ? 'Lösung mit Rechenweg zeigen' : 'Erst eine eigene Antwort prüfen'}">${icon('auge')}<span>Lösung</span></button>
${hatVarianten(a) ? `<button type="button" class="btn leise" data-aktion="variante" title="Dieselbe Aufgabe mit neuen Zahlen">${icon('zufall')}<span>Neue Zahlen</span></button>` : ''}
${a.variante ? `<button type="button" class="btn leise" data-aktion="original">${icon('zurueck')}<span>Originalaufgabe</span></button>` : ''}
${lehrer ? `<button type="button" class="btn leise lehrer-knopf" data-aktion="muster">${icon('ueben')}<span>Musterlösung eintragen</span></button>` : ''}
</div>${darf ? '' : '<p class="karte-regel">Die Lösung erscheint, sobald du eine eigene Antwort geprüft hast.</p>'}`;
}

export function karteHTML(a, { modus = 'ueben', uid = a.schluessel, nummer = null } = {}) {
  const status = modus === 'ueben' && !a.variante ? F.anzeigeStatus(a.schluessel) : 'offen';
  const titelNr = nummer ?? `Aufgabe ${a.nr}`;
  const direkt = modus === 'ueben' && loesungenDirekt();
  return `<article class="karte modus-${modus} st-${status}${a.variante ? ' ist-variante' : ''}" id="karte-${uid}" data-uid="${uid}" data-schluessel="${a.schluessel}">
<header class="karte-kopf">
  <h3 class="karte-titel"><span class="karte-nr">${titelNr}</span><span class="karte-name">${esc(a.titel)}</span></h3>
  <div class="karte-chips">${chipsHTML(a)}${a.variante ? '<span class="chip chip-var">neue Zahlen</span>' : ''}${modus === 'ueben' ? `<span class="status-marke" role="img" aria-label="${STATUS_TEXT[status]}" title="${STATUS_TEXT[status]}"></span>` : ''}</div>
</header>
<div class="karte-frage">${a.frage}</div>
<form class="karte-felder" novalidate autocomplete="off" data-uid="${uid}" style="${vorBreite(a)}">${felderHTML(a, uid)}</form>
${modus === 'ueben' ? aktionenHTML(a) : ''}
<div class="karte-rueckmeldung" aria-live="polite"></div>
<div class="karte-tipp" hidden><p>${icon('tipp')} ${a.tipp}</p></div>
<div class="karte-loesung"${direkt ? '' : ' hidden'}>${direkt ? loesungHTML(a) : ''}</div>
</article>`;
}

function loesungWertHTML(f) {
  switch (f.art) {
    case 'zahl': {
      let s = nachBasis(f.loesung, f.basis);
      if (f.stellen) s = auffuellen(s, f.stellen);
      return z(s, f.basis);
    }
    case 'wahl':
    case 'liste':
      return f.optionen[f.loesung].text;
    case 'mehrfach':
      return f.loesung.map((i) => f.optionen[i].text).join(' · ');
    case 'bits':
      return f.loesung.slice().sort((x, y) => (f.stil === 'dip' ? x - y : y - x)).map((i) => esc(f.beschriftung(i))).join(', ');
    default:
      return '';
  }
}

export function loesungHTML(a) {
  const antworten = a.felder
    .map((f, i) => `<li><span class="la-feld">${feldName(a, f, i)}</span> <b class="la-wert">${loesungWertHTML(f)}</b></li>`)
    .join('');
  const offen = a.regel ? '<p class="la-hinweis">Hier gibt es mehrere richtige Lösungen. Ein Beispiel:</p>' : '';
  return `<div class="loesung-box"><div class="loesung-kopf">${icon('auge')}<span>Lösung</span>${istLehrer() ? '<span class="chip chip-lehrer">Lehrermodus</span>' : ''}</div>${offen}<ul class="loesung-antworten">${antworten}</ul><div class="loesung-weg">${a.loesung}</div></div>`;
}

/* ------------------------------------------------------------------ */
/* Antworten lesen, setzen, markieren                                  */
/* ------------------------------------------------------------------ */

export function liesAntworten(karte, a) {
  const uid = karte.dataset.uid;
  const form = karte.querySelector('form');
  const ant = {};
  for (const f of a.felder) {
    const name = `${uid}-${f.id}`;
    if (f.art === 'zahl') ant[f.id] = form.querySelector(`input[name="${name}"]`)?.value ?? '';
    else if (f.art === 'wahl') {
      const c = form.querySelector(`input[name="${name}"]:checked`);
      ant[f.id] = c ? Number(c.value) : null;
    } else if (f.art === 'liste') {
      const v = form.querySelector(`select[name="${name}"]`)?.value ?? '';
      ant[f.id] = v === '' ? null : Number(v);
    } else if (f.art === 'mehrfach') ant[f.id] = [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((c) => Number(c.value));
    else if (f.art === 'bits') ant[f.id] = [...form.querySelectorAll(`[data-feld="${f.id}"] .schalter[aria-pressed="true"]`)].map((s) => Number(s.dataset.bit));
  }
  return ant;
}

export function setzeAntworten(karte, a, ant) {
  const uid = karte.dataset.uid;
  const form = karte.querySelector('form');
  for (const f of a.felder) {
    const name = `${uid}-${f.id}`;
    const w = ant[f.id];
    if (f.art === 'zahl') {
      const e = form.querySelector(`input[name="${name}"]`);
      if (e) e.value = w ?? '';
    } else if (f.art === 'wahl') {
      form.querySelectorAll(`input[name="${name}"]`).forEach((e) => { e.checked = Number(e.value) === w; });
    } else if (f.art === 'liste') {
      const e = form.querySelector(`select[name="${name}"]`);
      if (e) e.value = w === null || w === undefined ? '' : String(w);
    } else if (f.art === 'mehrfach') {
      form.querySelectorAll(`input[name="${name}"]`).forEach((e) => { e.checked = (w || []).includes(Number(e.value)); });
    } else if (f.art === 'bits') {
      form.querySelectorAll(`[data-feld="${f.id}"] .schalter`).forEach((s) => {
        s.setAttribute('aria-pressed', (w || []).includes(Number(s.dataset.bit)) ? 'true' : 'false');
      });
    }
  }
}

const FELD_KLASSEN = ['ok', 'falsch', 'format', 'leer', 'ungueltig'];

export function markiereFelder(karte, a, ergebnis) {
  for (const f of a.felder) {
    const r = ergebnis.felder[f.id] || { status: 'offen' };
    const feld = karte.querySelector(`.feld[data-feld="${f.id}"]`);
    const meldung = karte.querySelector(`[data-meldung="${f.id}"]`);
    if (feld) {
      feld.classList.remove(...FELD_KLASSEN);
      const k = { richtig: 'ok', falsch: 'falsch', format: 'format', leer: 'leer', ungueltig: 'ungueltig' }[r.status];
      if (k) feld.classList.add(k);
      feld.querySelectorAll('.option').forEach((o) => o.classList.remove('gewaehlt-ok', 'gewaehlt-falsch'));
      if (f.art === 'wahl' || f.art === 'mehrfach') {
        feld.querySelectorAll('.option').forEach((o) => {
          const input = o.querySelector('input');
          if (input.checked) o.classList.add(r.status === 'richtig' ? 'gewaehlt-ok' : 'gewaehlt-falsch');
        });
      }
    }
    if (meldung) {
      const text = r.meldung || '';
      meldung.className = `feld-meldung${text ? ' sichtbar' : ''} m-${r.status}`;
      const praefix = a.layout && a.layout.art === 'tabelle' && text ? `<b>${feldName(a, f, 0)}:</b> ` : '';
      meldung.innerHTML = text ? praefix + text : '';
    }
  }
}

export function setzeKartenStatus(karte, status) {
  karte.classList.remove('st-offen', 'st-richtig', 'st-teilweise', 'st-falsch', 'st-gesehen');
  karte.classList.add(`st-${status}`);
  const m = karte.querySelector('.status-marke');
  if (m) {
    m.setAttribute('aria-label', STATUS_TEXT[status]);
    m.title = STATUS_TEXT[status];
  }
}

/* ------------------------------------------------------------------ */
/* Aktionen im Übungsmodus                                             */
/* ------------------------------------------------------------------ */

function rueckmeldung(karte, art, html) {
  const rm = karte.querySelector('.karte-rueckmeldung');
  rm.className = `karte-rueckmeldung rm-${art}`;
  rm.innerHTML = html;
}

export function pruefeKarte(karte, a) {
  const ant = liesAntworten(karte, a);
  const erg = pruefeAufgabe(a, ant, 'ueben');
  markiereFelder(karte, a, erg);
  if (!erg.zaehlt) {
    const text = {
      ungueltig: 'Bitte korrigiere die markierte Eingabe – das zählt nicht als Versuch.',
      unvollstaendig: 'Bitte fülle alle Felder aus.',
      leer: 'Gib zuerst eine Antwort ein.',
    }[erg.status];
    rueckmeldung(karte, 'info', `${icon('info')}<span>${text}</span>`);
    return erg;
  }
  let versuche;
  let ersterRichtig;
  if (a.variante) {
    karte.dataset.versucht = '1';
    versuche = Number(karte.dataset.v || 0) + 1;
    karte.dataset.v = versuche;
    ersterRichtig = versuche === 1 && erg.status === 'richtig';
  } else {
    const e = F.vermerkeVersuch(a.schluessel, erg.status);
    versuche = e.v;
    ersterRichtig = e.e && versuche === 1;
    setzeKartenStatus(karte, F.anzeigeStatus(a.schluessel));
  }
  const richtigeFelder = a.felder.filter((f) => erg.felder[f.id].status === 'richtig').length;
  if (erg.status === 'richtig') {
    rueckmeldung(karte, 'richtig', `${icon('haken')}<span><b>Richtig!</b> ${ersterRichtig ? 'Gleich beim ersten Versuch – stark.' : 'Gut gemacht.'} <button type="button" class="link-knopf" data-aktion="loesung">Rechenweg ansehen</button></span>`);
  } else if (erg.status === 'teilweise') {
    rueckmeldung(karte, 'teilweise', `${icon('info')}<span><b>Teilweise richtig:</b> ${richtigeFelder} von ${a.felder.length} Antworten stimmen. Sieh dir die markierten Felder an.</span>`);
  } else {
    rueckmeldung(karte, 'falsch', `${icon('kreuz')}<span><b>Noch nicht richtig.</b> Lies die Hinweise und versuche es noch einmal – oder sieh dir die Lösung an.</span>`);
  }
  const knopf = karte.querySelector('[data-aktion="loesung"]');
  if (knopf) {
    knopf.disabled = false;
    knopf.title = 'Lösung mit Rechenweg zeigen';
  }
  karte.querySelector('.karte-regel')?.remove();
  karte.dispatchEvent(new CustomEvent('fortschritt', { bubbles: true, detail: { schluessel: a.schluessel, status: erg.status } }));
  return erg;
}

export function zeigeLoesung(karte, a, an = null) {
  const box = karte.querySelector('.karte-loesung');
  const knopf = karte.querySelector('.karte-aktionen [data-aktion="loesung"]');
  const sichtbar = an === null ? box.hidden : an;
  if (sichtbar && !kannLoesungSehen(a, karte)) return;
  if (sichtbar && !box.innerHTML.trim()) box.innerHTML = loesungHTML(a);
  box.hidden = !sichtbar;
  if (knopf) knopf.setAttribute('aria-expanded', sichtbar ? 'true' : 'false');
  if (sichtbar && !a.variante && !istLehrer()) {
    F.vermerkeLoesung(a.schluessel);
    setzeKartenStatus(karte, F.anzeigeStatus(a.schluessel));
    karte.dispatchEvent(new CustomEvent('fortschritt', { bubbles: true, detail: { schluessel: a.schluessel } }));
  }
  if (sichtbar) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

export function zeigeTipp(karte) {
  const box = karte.querySelector('.karte-tipp');
  box.hidden = !box.hidden;
  karte.querySelector('[data-aktion="tipp"]')?.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
}

export function trageMusterEin(karte, a) {
  setzeAntworten(karte, a, musterAntworten(a));
  const erg = pruefeAufgabe(a, musterAntworten(a), 'pruefung');
  markiereFelder(karte, a, erg);
  rueckmeldung(karte, 'info', `${icon('info')}<span>Musterlösung eingetragen (Lehrermodus – zählt nicht als Versuch).</span>`);
}

/**
 * Bindet alle Karten eines Containers (Ereignis-Delegation).
 * finde(uid) → aktuelle Aufgabe der Karte, ersetze(karte, neueAufgabe) tauscht die Karte aus.
 */
export function bindeKarten(container, { finde, ersetze, neuerZufall }) {
  container.addEventListener('click', (e) => {
    const schalter = e.target.closest('.schalter');
    if (schalter && !schalter.disabled && container.contains(schalter)) {
      schalter.setAttribute('aria-pressed', schalter.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      schalter.closest('.feld')?.classList.remove(...FELD_KLASSEN);
      return;
    }
    const knopf = e.target.closest('[data-aktion]');
    const karte = e.target.closest('.karte');
    if (!knopf || !karte || !container.contains(karte)) return;
    const a = finde(karte.dataset.uid);
    if (!a) return;
    switch (knopf.dataset.aktion) {
      case 'pruefen': pruefeKarte(karte, a); break;
      case 'tipp': zeigeTipp(karte); break;
      case 'loesung': zeigeLoesung(karte, a, knopf.classList.contains('link-knopf') ? true : null); break;
      case 'variante': if (ersetze && neuerZufall) ersetze(karte, a.original || a, neuerZufall()); break;
      case 'original': if (ersetze) ersetze(karte, a.original, null); break;
      case 'muster': trageMusterEin(karte, a); break;
      default: break;
    }
  });
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('.karte input[type="text"]')) return;
    e.preventDefault();
    const karte = e.target.closest('.karte');
    const a = finde(karte.dataset.uid);
    if (a && karte.classList.contains('modus-ueben')) pruefeKarte(karte, a);
  });
  container.addEventListener('input', (e) => {
    const feld = e.target.closest('.feld');
    if (feld) feld.classList.remove(...FELD_KLASSEN);
  });
  container.addEventListener('change', (e) => {
    const feld = e.target.closest('.feld');
    if (feld) feld.classList.remove(...FELD_KLASSEN);
  });
}

/* ------------------------------------------------------------------ */
/* Auswertung einer Prüfung                                            */
/* ------------------------------------------------------------------ */

export function zeigeAuswertung(karte, a, ant) {
  setzeAntworten(karte, a, ant);
  const erg = pruefeAufgabe(a, ant, 'pruefung');
  for (const r of Object.values(erg.felder)) {
    if (r.status === 'leer' || r.status === 'offen') {
      r.status = 'falsch';
      r.meldung = 'Keine Antwort.';
    }
  }
  markiereFelder(karte, a, erg);
  karte.querySelectorAll('input, select, .schalter').forEach((e) => { e.disabled = true; });
  karte.classList.remove('modus-pruefung');
  karte.classList.add('modus-auswertung', `erg-${erg.status}`);
  const kopf = karte.querySelector('.karte-chips');
  kopf.insertAdjacentHTML('beforeend', `<span class="chip chip-erg erg-${erg.status}">${fmtP(erg.punkte)} / ${fmtP(erg.max)} P</span>`);
  karte.querySelector('form').insertAdjacentHTML('afterend', `<div class="karte-aktionen"><button type="button" class="btn" data-aktion="auswertung-loesung" aria-expanded="false">${icon('auge')}<span>Lösung</span></button></div>`);
  karte.querySelector('.karte-loesung').innerHTML = loesungHTML(a);
  return erg;
}
