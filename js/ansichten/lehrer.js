// lehrer.js – Lehrerbereich: Anmeldung, Übersicht, Prüfung erstellen, Lösungsschlüssel, Hinweise

import { THEMEN, pool } from '../themen/index.js';
import { TAXONOMIE } from '../kern/taxonomie.js';
import { stellePruefungZusammen, ersetzeAufgabe, parallelGruppe, VORLAGEN, verfuegbar, summePunkte } from '../kern/pruefungsplan.js';
import { neuerStartwert } from '../kern/varianten.js';
import { anmelden, abmelden, istLehrer, lehrerInhalt, tresorVorhanden, loesungenDirekt, setzeLoesungenDirekt } from '../kern/lehrer.js';
import { lies, schreibe } from '../kern/speicher.js';
import { icon } from '../kern/icons.js';
import { esc } from '../kern/darstellung.js';
import { fmtP } from '../ui/aufgabenkarte.js';
import { pruefungsblattHTML, taxonomieTabelleHTML, matrixHTML, loesungsschluesselHTML, datumText } from '../ui/druck.js';
import { drucke } from '../ui/drucken.js';

const REITER = [
  ['uebersicht', 'Übersicht', 'start'],
  ['pruefung', 'Prüfung erstellen', 'pruefung'],
  ['schluessel', 'Lösungsschlüssel', 'liste'],
  ['hinweise', 'Didaktische Hinweise', 'tipp'],
];

/* ------------------------------------------------------------------ */
/* Anmeldung                                                           */
/* ------------------------------------------------------------------ */

function anmeldung(main, weiter) {
  document.title = 'Lehrerbereich · Digitaltechnik';
  main.innerHTML = `<header class="seitenkopf"><p class="kicker">Lehrerbereich</p><h1>Anmelden</h1>
<p class="lead">Mit dem Lehrerpasswort siehst du alle Lösungen sofort, stellst Prüfungen nach Taxonomiestufen zusammen und druckst Lösungsschlüssel.</p></header>
<form class="anmelden karte-flaeche" autocomplete="on">
<label for="lehrer-pw">Lehrerpasswort</label>
<div class="pw-zeile"><input type="password" id="lehrer-pw" name="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required><button type="button" class="btn leise" data-pw-zeigen aria-label="Passwort anzeigen" title="Passwort anzeigen">${icon('auge')}</button></div>
<label class="check"><input type="checkbox" id="lehrer-bleiben"> Auf diesem Gerät angemeldet bleiben (nur am eigenen Rechner)</label>
<button type="submit" class="btn primaer">${icon('offen')}<span>Anmelden</span></button>
<p class="anmelde-meldung" role="status" aria-live="polite"></p>
</form>
<p class="neben">Das Passwort steht im privaten Repository „digitaltechnik-lehrer“. Es wird weder gespeichert noch übertragen: Die Seite entschlüsselt damit nur einen Tresor in diesem Browser.</p>`;
  const form = main.querySelector('form');
  const meldung = main.querySelector('.anmelde-meldung');
  const feld = main.querySelector('#lehrer-pw');
  if (!tresorVorhanden()) meldung.textContent = 'Auf dieser Seite ist noch kein Lehrerzugang eingerichtet.';
  main.querySelector('[data-pw-zeigen]').addEventListener('click', () => {
    feld.type = feld.type === 'password' ? 'text' : 'password';
    feld.focus();
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const knopf = form.querySelector('[type="submit"]');
    knopf.disabled = true;
    meldung.className = 'anmelde-meldung';
    meldung.textContent = 'Prüfe …';
    try {
      const ok = await anmelden(feld.value, main.querySelector('#lehrer-bleiben').checked);
      if (ok) {
        feld.value = '';
        document.dispatchEvent(new CustomEvent('lehrer-geaendert'));
        weiter();
        return;
      }
      meldung.className = 'anmelde-meldung fehler';
      meldung.textContent = 'Das Passwort stimmt nicht.';
      form.classList.remove('wackeln');
      void form.offsetWidth;
      form.classList.add('wackeln');
      feld.select();
    } catch (err) {
      meldung.className = 'anmelde-meldung fehler';
      meldung.textContent = err.message || 'Anmeldung nicht möglich.';
    } finally {
      knopf.disabled = false;
    }
  });
  feld.focus();
}

/* ------------------------------------------------------------------ */
/* Übersicht                                                           */
/* ------------------------------------------------------------------ */

function uebersicht(box) {
  box.innerHTML = `<div class="lehrer-gitter">
<section class="karte-flaeche"><h2 class="h3">${icon('auge')} Übungen</h2>
<label class="schalter-option"><input type="checkbox" data-l="direkt"${loesungenDirekt() ? ' checked' : ''}> Lösungen in „Üben“ sofort zeigen</label>
<p class="neben">Schülerinnen und Schüler sehen eine Lösung erst nach einem eigenen Versuch. Im Lehrermodus stehen alle Lösungen sofort da; mit „Musterlösung eintragen“ lässt sich eine Aufgabe am Beamer vorführen.</p>
<a class="btn" href="#/ueben">${icon('ueben')}<span>Zu den Aufgaben</span></a></section>
<section class="karte-flaeche"><h2 class="h3">${icon('pruefung')} Prüfung erstellen</h2>
<p>Aufgaben nach Taxonomiestufen und Kapiteln zusammenstellen – mit neuen Zahlen, Gruppe A/B und druckfertigem Aufgaben- und Lösungsblatt.</p>
<a class="btn primaer" href="#/lehrer/pruefung">${icon('pruefung')}<span>Prüfung erstellen</span></a></section>
<section class="karte-flaeche"><h2 class="h3">${icon('qr')} Klasse einladen</h2>
<p>Den QR-Code am Beamer zeigen (Taste <kbd>Q</kbd>) – die Klasse öffnet die Seite auf dem Handy.</p>
<button type="button" class="btn" data-l="qr">${icon('qr')}<span>QR-Code zeigen</span></button></section>
</div>
${THEMEN.map((t) => `<section class="abschnitt"><h2>Taxonomie-Matrix · ${esc(t.titel)}</h2><p class="neben">Anzahl der Aufgaben je Kapitel und Taxonomiestufe.</p>${matrixHTML(t)}</section>`).join('')}`;
  box.querySelector('[data-l="direkt"]').addEventListener('change', (e) => setzeLoesungenDirekt(e.target.checked));
  box.querySelector('[data-l="qr"]').addEventListener('click', () => document.dispatchEvent(new CustomEvent('qr-zeigen')));
}

/* ------------------------------------------------------------------ */
/* Prüfung erstellen                                                   */
/* ------------------------------------------------------------------ */

let generator = null; // { einstellungen, a: [], b: [] | null, blatt: 'a-aufgaben' }

function heute() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function standardEinstellungen() {
  return {
    schule: 'Lycée Technique d’Ettelbruck', klasse: 'DP1ET', modul: 'DITEC1',
    titel: THEMEN.length === 1 ? `Prüfung: ${THEMEN[0].kurz}` : 'Prüfung Digitaltechnik',
    datum: heute(), dauer: 45, hilfsmittel: 'keine', hinweis: 'Rechenweg angeben. Jede Zahl mit Index (Basis) schreiben.',
    vorlage: 'standard', plan: { ...VORLAGEN.standard.plan },
    auswahl: Object.fromEntries(THEMEN.map((t) => [t.id, t.kapitel.map((k) => k.id)])),
    neueZahlen: true, gruppeB: false, taxonomie: true, startwert: neuerStartwert(),
  };
}

function erstelleForm(box) {
  const e = generator.einstellungen;
  const v = verfuegbar(pool(e.auswahl));
  box.innerHTML = `<form class="generator karte-flaeche" novalidate>
<fieldset><legend>Kopf des Blattes</legend><div class="formular-gitter">
<label>Schule <input name="schule" value="${esc(e.schule)}"></label>
<label>Klasse <input name="klasse" value="${esc(e.klasse)}"></label>
<label>Modul <input name="modul" value="${esc(e.modul)}"></label>
<label class="breit">Titel <input name="titel" value="${esc(e.titel)}"></label>
<label>Datum <input type="date" name="datum" value="${esc(e.datum)}"></label>
<label>Dauer (min) <input type="number" name="dauer" min="5" max="240" value="${e.dauer}"></label>
<label>Hilfsmittel <input name="hilfsmittel" value="${esc(e.hilfsmittel)}"></label>
<label class="breit">Hinweis auf dem Blatt <input name="hinweis" value="${esc(e.hinweis)}"></label>
</div></fieldset>
<fieldset><legend>Aufgaben je Taxonomiestufe</legend>
<div class="vorlage-wahl">${Object.entries(VORLAGEN).map(([id, vl]) => `<button type="button" class="chip-knopf" data-vorlage="${id}" aria-pressed="${e.vorlage === id}">${vl.name} · ${vl.dauer} min</button>`).join('')}</div>
<div class="stufen-eingabe">${TAXONOMIE.map((t) => `<label class="stufe-feld"><span class="chip chip-k k${t.k}">K${t.k}</span><span class="sf-name">${t.name}</span><input type="number" name="k${t.k}" min="0" max="${v[t.k]}" value="${e.plan[t.k] || 0}"><small>von ${v[t.k]}</small></label>`).join('')}</div>
</fieldset>
<fieldset><legend>Inhalte</legend>${THEMEN.map((t) => `<div class="kw-thema"><b>${esc(t.titel)}</b><div class="chips-wahl">${t.kapitel
    .map((k) => `<label class="chip-check"><input type="checkbox" name="kap" value="${t.id}:${k.id}"${(e.auswahl[t.id] || []).includes(k.id) ? ' checked' : ''}><span>${k.id} · ${esc(k.kurz)}</span></label>`)
    .join('')}</div></div>`).join('')}</fieldset>
<fieldset><legend>Optionen</legend><div class="optionen">
<label><input type="checkbox" name="neueZahlen"${e.neueZahlen ? ' checked' : ''}> Neue Zahlen (Rechenaufgaben mit anderen Werten als in den Übungen)</label>
<label><input type="checkbox" name="gruppeB"${e.gruppeB ? ' checked' : ''}> Gruppe B erzeugen (gleiche Aufgaben, andere Zahlen, gemischte Antworten)</label>
<label><input type="checkbox" name="taxonomie"${e.taxonomie ? ' checked' : ''}> Taxonomiestufen auf dem Aufgabenblatt anzeigen</label>
<label class="startwert">Startwert <input type="number" name="startwert" min="1" max="99999" value="${e.startwert}"> <button type="button" class="btn leise klein" data-g="wuerfeln">${icon('zufall')}<span>neu</span></button></label>
</div></fieldset>
<div class="knopfzeile"><button type="submit" class="btn primaer gross">${icon('pruefung')}<span>Prüfung zusammenstellen</span></button></div>
</form>
<div class="generator-ergebnis"></div>`;
  const form = box.querySelector('form');
  const lesen = () => {
    const f = form.elements;
    const auswahl = {};
    form.querySelectorAll('input[name="kap"]:checked').forEach((c) => {
      const [t, k] = c.value.split(':');
      (auswahl[t] ||= []).push(k);
    });
    Object.assign(e, {
      schule: f.schule.value, klasse: f.klasse.value, modul: f.modul.value, titel: f.titel.value, datum: f.datum.value,
      dauer: Number(f.dauer.value) || 45, hilfsmittel: f.hilfsmittel.value, hinweis: f.hinweis.value, auswahl,
      neueZahlen: f.neueZahlen.checked, gruppeB: f.gruppeB.checked, taxonomie: f.taxonomie.checked,
      startwert: Number(f.startwert.value) || 1,
      plan: Object.fromEntries(TAXONOMIE.map((t) => [t.k, Math.max(0, Number(f[`k${t.k}`].value) || 0)])),
    });
    schreibe('lehrer-generator', e);
  };
  form.addEventListener('click', (ev) => {
    const vl = ev.target.closest('[data-vorlage]');
    if (vl) {
      lesen();
      e.vorlage = vl.dataset.vorlage;
      e.plan = { ...VORLAGEN[e.vorlage].plan };
      e.dauer = VORLAGEN[e.vorlage].dauer;
      erstelleForm(box);
      return;
    }
    if (ev.target.closest('[data-g="wuerfeln"]')) {
      form.elements.startwert.value = neuerStartwert();
    }
  });
  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'kap') {
      lesen();
      const v2 = verfuegbar(pool(e.auswahl));
      TAXONOMIE.forEach((t) => {
        const inp = form.elements[`k${t.k}`];
        inp.max = v2[t.k];
        inp.nextElementSibling.textContent = `von ${v2[t.k]}`;
      });
    }
  });
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    lesen();
    const p = stellePruefungZusammen({ pool: pool(e.auswahl), plan: e.plan, neueZahlen: e.neueZahlen, startwert: e.startwert });
    generator.a = p.aufgaben;
    generator.fehlend = p.fehlend;
    generator.b = e.gruppeB ? parallelGruppe(p.aufgaben, e.startwert + 50000) : null;
    generator.blatt = 'a-aufgaben';
    zeigeErgebnis(box.querySelector('.generator-ergebnis'));
    box.querySelector('.generator-ergebnis').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  if (generator.a && generator.a.length) zeigeErgebnis(box.querySelector('.generator-ergebnis'));
}

function kopfDaten() {
  const e = generator.einstellungen;
  return { ...e, startwert: e.startwert };
}

function blattHTML(art) {
  const e = generator.einstellungen;
  const [gruppe, teil] = art.split('-');
  const liste = gruppe === 'b' ? generator.b : generator.a;
  return pruefungsblattHTML(liste, kopfDaten(), {
    loesung: teil === 'loesung',
    taxonomieZeigen: teil === 'loesung' || e.taxonomie,
    gruppe: generator.b ? gruppe.toUpperCase() : '',
  });
}

function zeigeErgebnis(ziel) {
  const e = generator.einstellungen;
  const a = generator.a;
  const fehlt = Object.entries(generator.fehlend || {}).map(([k, n]) => `${n}× K${k}`).join(', ');
  const blaetter = [['a-aufgaben', generator.b ? 'Aufgabenblatt A' : 'Aufgabenblatt'], ['a-loesung', generator.b ? 'Lösungsblatt A' : 'Lösungsblatt']];
  if (generator.b) blaetter.push(['b-aufgaben', 'Aufgabenblatt B'], ['b-loesung', 'Lösungsblatt B']);
  ziel.innerHTML = `<section class="karte-flaeche generator-zusammenfassung">
<h2 class="h3">${a.length} Aufgaben · ${fmtP(summePunkte(a))} Punkte · Startwert ${e.startwert}</h2>
${fehlt ? `<p class="warnung">In den gewählten Kapiteln gibt es zu wenige Aufgaben: es fehlen ${fehlt}.</p>` : ''}
<div class="zusammenfassung-gitter"><div>${taxonomieTabelleHTML(a)}</div>
<ol class="auswahl-liste">${a.map((x, i) => `<li><span class="al-nr">${i + 1}</span><span class="chip chip-k k${x.k}">K${x.k}</span><span class="al-titel">${esc(x.titel)}<small>${esc(x.schluessel)}${x.variante ? ' · neue Zahlen' : ''} · ${fmtP(x.punkte)} P</small></span><button type="button" class="btn leise klein" data-ersetze="${i}" title="Durch eine andere Aufgabe derselben Stufe ersetzen">${icon('neu')}<span>ersetzen</span></button></li>`).join('')}</ol></div>
</section>
<div class="blatt-wahl" role="tablist">${blaetter.map(([id, t]) => `<button type="button" role="tab" class="chip-knopf" data-blatt="${id}" aria-pressed="${generator.blatt === id}">${t}</button>`).join('')}
<button type="button" class="btn primaer" data-g="drucken">${icon('drucken')}<span>Dieses Blatt drucken</span></button></div>
<p class="neben">Tipp: Im Druckdialog „Als PDF sichern“ wählen. Kopf- und Fußzeilen des Browsers ausschalten.</p>
<div class="blatt-vorschau">${blattHTML(generator.blatt)}</div>`;
  ziel.querySelector('.blatt-wahl').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-blatt]');
    if (b) {
      generator.blatt = b.dataset.blatt;
      ziel.querySelectorAll('[data-blatt]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      ziel.querySelector('.blatt-vorschau').innerHTML = blattHTML(generator.blatt);
    }
    if (ev.target.closest('[data-g="drucken"]')) {
      const name = blaetter.find(([id]) => id === generator.blatt)[1];
      drucke(blattHTML(generator.blatt), `${e.klasse} ${e.titel} ${name} ${datumText(e.datum)}`);
    }
  });
  ziel.querySelector('.auswahl-liste').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-ersetze]');
    if (!b) return;
    const i = Number(b.dataset.ersetze);
    const stw = e.startwert * 31 + Date.now() % 100000;
    generator.a = ersetzeAufgabe(generator.a, i, { pool: pool(e.auswahl), neueZahlen: e.neueZahlen, startwert: stw });
    if (generator.b) generator.b = parallelGruppe(generator.a, e.startwert + 50000);
    zeigeErgebnis(ziel);
  });
}

function pruefungErstellen(box) {
  if (!generator) {
    generator = { einstellungen: { ...standardEinstellungen(), ...(lies('lehrer-generator', null) || {}) }, a: [], b: null, blatt: 'a-aufgaben' };
    generator.einstellungen.datum = heute();
  }
  erstelleForm(box);
}

/* ------------------------------------------------------------------ */
/* Lösungsschlüssel und Hinweise                                       */
/* ------------------------------------------------------------------ */

function schluessel(box) {
  box.innerHTML = THEMEN.map((t) => `<section class="abschnitt" data-thema="${t.id}">
<div class="abschnitt-kopf"><h2>${esc(t.titel)}</h2><button type="button" class="btn" data-drucke="${t.id}">${icon('drucken')}<span>Drucken</span></button></div>
${matrixHTML(t)}${loesungsschluesselHTML(t)}</section>`).join('');
  box.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-drucke]');
    if (!b) return;
    const t = THEMEN.find((x) => x.id === b.dataset.drucke);
    drucke(`<div class="druckblatt schluessel-blatt"><header class="d-kopf"><div class="d-zeile"><span>Lösungsschlüssel</span><span>DP1ET · DITEC1</span></div><h1 class="d-titel">${esc(t.titel)}</h1></header>${matrixHTML(t)}${loesungsschluesselHTML(t)}</div>`, `Lösungsschlüssel ${t.kurz}`);
  });
}

function hinweise(box) {
  const inhalt = lehrerInhalt();
  box.innerHTML = `<div class="hinweise karte-flaeche">${inhalt && inhalt.hinweise ? inhalt.hinweise : '<p>Keine Hinweise hinterlegt.</p>'}</div>`;
}

/* ------------------------------------------------------------------ */

export function lehrer(main, reiter = 'uebersicht') {
  const neu = () => lehrer(main, reiter);
  if (!istLehrer()) return anmeldung(main, neu);
  const aktiv = REITER.some(([id]) => id === reiter) ? reiter : 'uebersicht';
  document.title = `${REITER.find(([id]) => id === aktiv)[1]} · Lehrerbereich · Digitaltechnik`;
  main.innerHTML = `<header class="seitenkopf mit-aktion"><div><p class="kicker">Lehrerbereich</p><h1>${REITER.find(([id]) => id === aktiv)[1]}</h1></div>
<button type="button" class="btn leise" data-l="abmelden">${icon('abmelden')}<span>Abmelden</span></button></header>
<nav class="reiter" aria-label="Bereiche">${REITER.map(([id, t, s]) => `<a href="#/lehrer/${id}" class="reiter-link${id === aktiv ? ' aktiv' : ''}"${id === aktiv ? ' aria-current="page"' : ''}>${icon(s)}<span>${t}</span></a>`).join('')}</nav>
<div class="reiter-inhalt"></div>`;
  main.querySelector('[data-l="abmelden"]').addEventListener('click', () => {
    abmelden();
    document.dispatchEvent(new CustomEvent('lehrer-geaendert'));
    generator = null;
    neu();
  });
  const box = main.querySelector('.reiter-inhalt');
  ({ uebersicht, pruefung: pruefungErstellen, schluessel, hinweise })[aktiv](box);
}
