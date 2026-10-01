// pruefung.js – Prüfungstraining für Schülerinnen und Schüler: einstellen, schreiben, auswerten

import { THEMEN, pool } from '../themen/index.js';
import { TAXONOMIE } from '../kern/taxonomie.js';
import { pruefeAufgabe } from '../kern/pruefen.js';
import { stellePruefungZusammen, VORLAGEN } from '../kern/pruefungsplan.js';
import { neuerStartwert } from '../kern/varianten.js';
import { lies, schreibe, entferne } from '../kern/speicher.js';
import { icon } from '../kern/icons.js';
import { esc } from '../kern/darstellung.js';
import { karteHTML, liesAntworten, setzeAntworten, zeigeAuswertung, fmtP } from '../ui/aufgabenkarte.js';

const SCHLUESSEL = 'pruefung';

function zusammenstellen(z) {
  return stellePruefungZusammen({ pool: pool(z.auswahl), plan: VORLAGEN[z.vorlage].plan, neueZahlen: z.neueZahlen, startwert: z.startwert });
}

const uidVon = (i) => `p${i + 1}`;

function zeitText(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function planText(plan) {
  return TAXONOMIE.filter((t) => plan[t.k]).map((t) => `K${t.k}×${plan[t.k]}`).join(' · ');
}

/* ------------------------------------------------------------------ */
/* 1. Einstellungen                                                    */
/* ------------------------------------------------------------------ */

function einstellung(main, neu) {
  document.title = 'Prüfungstraining · Digitaltechnik';
  main.innerHTML = `<header class="seitenkopf"><h1>Prüfungstraining</h1>
<p class="lead">Teste dich wie in der echten Prüfung: gemischte Aufgaben auf allen Taxonomiestufen – ohne Rückmeldung bis zur Abgabe. Rechne auf Papier mit.</p></header>
<form class="pruefung-einstellung karte-flaeche">
<fieldset class="vorlagen"><legend>Umfang</legend>${Object.entries(VORLAGEN).map(([id, v]) => {
    const n = Object.values(v.plan).reduce((a, b) => a + b, 0);
    return `<label class="vorlage-karte"><input type="radio" name="vorlage" value="${id}"${id === 'standard' ? ' checked' : ''}><span class="vk-inhalt"><b>${v.name}</b><span>${n} Aufgaben · ca. ${v.dauer} min</span><small>${planText(v.plan)}</small></span></label>`;
  }).join('')}</fieldset>
<fieldset class="kapitelwahl"><legend>Inhalte</legend>${THEMEN.map((t) => `<div class="kw-thema"><label class="kw-titel"><input type="checkbox" data-thema="${t.id}" checked> <b>${esc(t.titel)}</b></label><div class="chips-wahl">${t.kapitel
    .map((k) => `<label class="chip-check"><input type="checkbox" name="kap" value="${t.id}:${k.id}" checked><span>${k.id} · ${esc(k.kurz)}</span></label>`)
    .join('')}</div></div>`).join('')}</fieldset>
<fieldset class="optionen"><legend>Optionen</legend>
<label><input type="checkbox" name="neueZahlen" checked> Neue Zahlen – die Rechenaufgaben haben andere Werte als in den Übungen</label>
<label><input type="checkbox" name="zeit" checked> Zeit anzeigen</label></fieldset>
<p class="pruefung-info" aria-live="polite"></p>
<button type="submit" class="btn primaer gross">${icon('play')}<span>Prüfung starten</span></button>
</form>`;
  const form = main.querySelector('form');
  const info = main.querySelector('.pruefung-info');
  function auswahl() {
    const a = {};
    form.querySelectorAll('input[name="kap"]:checked').forEach((c) => {
      const [t, k] = c.value.split(':');
      (a[t] ||= []).push(k);
    });
    return a;
  }
  function vorschau() {
    const z = { vorlage: form.vorlage.value, auswahl: auswahl(), neueZahlen: true, startwert: 1 };
    const p = zusammenstellen(z);
    const fehlt = Object.entries(p.fehlend).map(([k, n]) => `${n}× K${k}`).join(', ');
    info.innerHTML = p.aufgaben.length
      ? `${p.aufgaben.length} Aufgaben · etwa ${fmtP(p.punkte)} Punkte${fehlt ? ` · <span class="warnung">In den gewählten Kapiteln fehlen ${fehlt}.</span>` : ''}`
      : '<span class="warnung">Bitte mindestens ein Kapitel wählen.</span>';
    form.querySelector('[type="submit"]').disabled = !p.aufgaben.length;
  }
  form.addEventListener('change', (e) => {
    if (e.target.dataset.thema) {
      form.querySelectorAll(`input[name="kap"][value^="${e.target.dataset.thema}:"]`).forEach((c) => { c.checked = e.target.checked; });
    }
    vorschau();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const z = {
      zustand: 'laeuft', vorlage: form.vorlage.value, auswahl: auswahl(), neueZahlen: form.neueZahlen.checked,
      zeit: form.zeit.checked, startwert: neuerStartwert(), beginn: Date.now(), ende: null, antworten: {},
    };
    schreibe(SCHLUESSEL, z, 'sitzung');
    neu();
  });
  vorschau();
}

/* ------------------------------------------------------------------ */
/* 2. Prüfung schreiben                                                */
/* ------------------------------------------------------------------ */

function istBeantwortet(ant) {
  return Object.values(ant || {}).some((w) => (Array.isArray(w) ? w.length : w !== null && w !== undefined && String(w).trim() !== ''));
}

function schreiben(main, z, neu) {
  document.title = 'Prüfung läuft · Digitaltechnik';
  const p = zusammenstellen(z);
  const dauer = VORLAGEN[z.vorlage].dauer * 60000;
  main.innerHTML = `<div class="ansicht"><div class="pruefung-leiste" role="region" aria-label="Prüfungsstatus">
<div class="pl-titel"><b>${VORLAGEN[z.vorlage].name}</b><span>${p.aufgaben.length} Aufgaben · ${fmtP(p.punkte)} P</span></div>
${z.zeit ? `<div class="pl-zeit">${icon('uhr')}<span data-zeit>00:00</span><small>/ ${zeitText(dauer)}</small></div>` : ''}
<div class="pl-stand"><span data-beantwortet>0</span> / ${p.aufgaben.length} beantwortet</div>
<button type="button" class="btn primaer" data-pr="abgeben">${icon('haken')}<span>Abgeben</span></button></div>
<p class="neben pruefung-regel">Während der Prüfung gibt es keine Rückmeldung und keine Lösungen. Deine Antworten bleiben erhalten, auch wenn du die Seite neu lädst.</p>
<div class="karten-liste pruefung-liste">${p.aufgaben.map((a, i) => karteHTML(a, { modus: 'pruefung', uid: uidVon(i), nummer: `Aufgabe ${i + 1}` })).join('')}</div>
<div class="knopfzeile mittig"><button type="button" class="btn primaer gross" data-pr="abgeben">${icon('haken')}<span>Abgeben und auswerten</span></button><button type="button" class="btn leise" data-pr="abbrechen">Abbrechen</button></div></div>`;
  const ansicht = main.querySelector('.ansicht');

  const liste = main.querySelector('.pruefung-liste');
  p.aufgaben.forEach((a, i) => {
    const k = document.getElementById(`karte-${uidVon(i)}`);
    if (z.antworten[uidVon(i)]) setzeAntworten(k, a, z.antworten[uidVon(i)]);
  });
  const zaehle = () => {
    const n = p.aufgaben.filter((a, i) => istBeantwortet(z.antworten[uidVon(i)])).length;
    main.querySelector('[data-beantwortet]').textContent = n;
    return n;
  };
  let warte = null;
  const merke = (karte) => {
    const i = Number(karte.dataset.uid.slice(1)) - 1;
    z.antworten[karte.dataset.uid] = liesAntworten(karte, p.aufgaben[i]);
    clearTimeout(warte);
    warte = setTimeout(() => schreibe(SCHLUESSEL, z, 'sitzung'), 250);
    zaehle();
  };
  liste.addEventListener('input', (e) => { const k = e.target.closest('.karte'); if (k) merke(k); });
  liste.addEventListener('change', (e) => { const k = e.target.closest('.karte'); if (k) merke(k); });
  liste.addEventListener('click', (e) => {
    const s = e.target.closest('.schalter');
    if (!s) return;
    s.setAttribute('aria-pressed', s.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    merke(s.closest('.karte'));
  });
  liste.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input[type="text"]')) e.preventDefault(); });
  zaehle();

  let takt = null;
  if (z.zeit) {
    const anzeige = main.querySelector('[data-zeit]');
    const tick = () => {
      const vergangen = Date.now() - z.beginn;
      anzeige.textContent = zeitText(vergangen);
      anzeige.parentElement.classList.toggle('ueberzogen', vergangen > dauer);
    };
    tick();
    takt = setInterval(tick, 1000);
  }

  ansicht.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pr]');
    if (!b) return;
    if (b.dataset.pr === 'abbrechen') {
      if (!confirm('Prüfungstraining abbrechen? Deine Antworten gehen verloren.')) return;
      entferne(SCHLUESSEL, 'sitzung');
      neu();
    }
    if (b.dataset.pr === 'abgeben') {
      liste.querySelectorAll('.karte').forEach(merke);
      const offen = p.aufgaben.length - zaehle();
      if (offen && !confirm(`${offen} ${offen === 1 ? 'Aufgabe ist' : 'Aufgaben sind'} noch ohne Antwort. Trotzdem abgeben?`)) return;
      z.zustand = 'fertig';
      z.ende = Date.now();
      schreibe(SCHLUESSEL, z, 'sitzung');
      neu();
    }
  });
  return () => clearInterval(takt);
}

/* ------------------------------------------------------------------ */
/* 3. Auswertung                                                       */
/* ------------------------------------------------------------------ */

function urteil(prozent) {
  if (prozent >= 90) return 'Ausgezeichnet – du beherrschst die Inhalte sicher.';
  if (prozent >= 75) return 'Gut gemacht – nur noch wenige Lücken.';
  if (prozent >= 50) return 'Solide Grundlage. Übe gezielt die Stufen und Kapitel mit wenigen Punkten.';
  return 'Noch nicht sicher. Wiederhole die Lektionen und übe die Aufgaben der schwachen Stufen.';
}

function auswertung(main, z, neu) {
  document.title = 'Ergebnis · Prüfungstraining · Digitaltechnik';
  const p = zusammenstellen(z);
  const erg = p.aufgaben.map((a, i) => pruefeAufgabe(a, z.antworten[uidVon(i)] || {}, 'pruefung'));
  const punkte = erg.reduce((s, r) => s + r.punkte, 0);
  const max = p.punkte;
  const prozent = max ? Math.round((punkte / max) * 100) : 0;
  const jeStufe = TAXONOMIE.map((t) => {
    const idx = p.aufgaben.map((a, i) => (a.k === t.k ? i : -1)).filter((i) => i >= 0);
    const pm = idx.reduce((s, i) => s + p.aufgaben[i].punkte, 0);
    const pe = idx.reduce((s, i) => s + erg[i].punkte, 0);
    return { t, pm, pe };
  }).filter((x) => x.pm);
  const schwach = jeStufe.filter((x) => x.pe / x.pm < 0.6);
  const dauer = z.ende && z.beginn ? zeitText(z.ende - z.beginn) : '–';
  main.innerHTML = `<div class="ansicht"><header class="seitenkopf"><p class="kicker">Prüfungstraining · Auswertung</p><h1>Dein Ergebnis</h1></header>
<section class="pr-ergebnis karte-flaeche">
<div class="ring gross" style="--anteil:${prozent}"><b>${prozent} %</b><small>${fmtP(punkte)} / ${fmtP(max)} P</small></div>
<div class="ergebnis-text"><p class="ergebnis-urteil">${urteil(prozent)}</p>
<p>${fmtP(punkte)} von ${fmtP(max)} Punkten · auf der 60er-Skala ${Math.round((punkte / max) * 60)} / 60 · Zeit ${dauer}</p>
<div class="ls-stufen gross">${jeStufe.map((x) => `<div class="ls-stufe" title="K${x.t.k} ${x.t.name}"><span class="chip chip-k k${x.t.k}">K${x.t.k}</span><span class="mini-balken"><span style="width:${Math.round((x.pe / x.pm) * 100)}%"></span></span><small>${fmtP(x.pe)}/${fmtP(x.pm)} P</small></div>`).join('')}</div>
${schwach.length ? `<p class="empfehlung">${icon('tipp')} Übe besonders: ${schwach.map((x) => `<a href="#/ueben/${THEMEN[0].id}?k=${x.t.k}">K${x.t.k} ${x.t.name}</a>`).join(', ')}</p>` : ''}
</div></section>
<div class="knopfzeile"><button type="button" class="btn primaer" data-pr="neu">${icon('neu')}<span>Neue Prüfung</span></button><button type="button" class="btn" data-pr="drucken">${icon('drucken')}<span>Ergebnis drucken</span></button></div>
<h2>Die Aufgaben im Einzelnen</h2>
<div class="karten-liste">${p.aufgaben.map((a, i) => karteHTML(a, { modus: 'pruefung', uid: uidVon(i), nummer: `Aufgabe ${i + 1}` })).join('')}</div></div>`;
  p.aufgaben.forEach((a, i) => zeigeAuswertung(document.getElementById(`karte-${uidVon(i)}`), a, z.antworten[uidVon(i)] || {}));
  main.querySelector('.ansicht').addEventListener('click', (e) => {
    const b = e.target.closest('[data-pr], [data-aktion="auswertung-loesung"]');
    if (!b) return;
    if (b.dataset.aktion === 'auswertung-loesung') {
      const box = b.closest('.karte').querySelector('.karte-loesung');
      box.hidden = !box.hidden;
      b.setAttribute('aria-expanded', String(!box.hidden));
      return;
    }
    if (b.dataset.pr === 'neu') {
      entferne(SCHLUESSEL, 'sitzung');
      neu();
    }
    if (b.dataset.pr === 'drucken') window.print();
  });
}

export function pruefung(main) {
  const neu = () => {
    window.scrollTo(0, 0);
    aufraeumen?.();
    aufraeumen = pruefung(main);
  };
  let aufraeumen = null;
  const z = lies(SCHLUESSEL, null, 'sitzung');
  if (z && z.zustand === 'laeuft') aufraeumen = schreiben(main, z, neu);
  else if (z && z.zustand === 'fertig') auswertung(main, z, neu);
  else einstellung(main, neu);
  return () => aufraeumen?.();
}
