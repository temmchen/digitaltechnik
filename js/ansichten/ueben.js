// ueben.js – Aufgaben üben: Lernstand, Aufgabenraster, Filter (Kapitel, Taxonomiestufe, Status), Karten

import { THEMEN, themaNachId } from '../themen/index.js';
import { STUFEN, stufeVon, prozess } from '../kern/taxonomie.js';
import * as F from '../kern/fortschritt.js';
import { variante, zufall } from '../kern/varianten.js';
import { istLehrer, loesungenDirekt, setzeLoesungenDirekt } from '../kern/lehrer.js';
import { icon } from '../kern/icons.js';
import { esc } from '../kern/darstellung.js';
import { karteHTML, bindeKarten, STATUS_TEXT } from '../ui/aufgabenkarte.js';

let variantenZaehler = 0;

function themenWahl(main) {
  document.title = 'Üben · Digitaltechnik';
  main.innerHTML = `<header class="seitenkopf"><h1>Üben</h1><p class="lead">Wähle ein Thema.</p></header>
<div class="themen-gitter">${THEMEN.map((t) => {
    const st = F.statistik(t.aufgaben);
    return `<a class="thema-karte klickbar" href="#/ueben/${t.id}"><div class="thema-kopf"><span class="thema-symbol">${esc(t.symbol)}</span><h3>${esc(t.titel)}</h3></div><p>${t.aufgaben.length} Aufgaben · ${st.richtig} gelöst</p></a>`;
  }).join('')}</div>`;
}

function lernstandHTML(t) {
  const st = F.statistik(t.aufgaben);
  const anteil = Math.round((st.richtig / st.gesamt) * 100);
  const stufen = STUFEN.map((s) => {
    const j = st.jeStufe[s.s];
    if (!j.gesamt) return '';
    return `<div class="ls-stufe" title="Stufe ${s.s} – ${s.name} (${s.titel}): ${j.richtig} von ${j.gesamt} gelöst"><span class="chip chip-stufe s${s.s}">${s.zeichen} ${s.name}</span><span class="mini-balken"><span style="width:${Math.round((j.richtig / j.gesamt) * 100)}%"></span></span><small>${j.richtig}/${j.gesamt}</small></div>`;
  }).join('');
  return `<div class="ring" style="--anteil:${anteil}"><b>${st.richtig}</b><small>von ${st.gesamt}</small></div>
<div class="ls-text"><p><b>${st.richtig} gelöst</b>${st.ersterVersuch ? ` (${st.ersterVersuch} beim ersten Versuch)` : ''} · ${st.teilweise + st.falsch} angefangen · ${st.gesehen} mit Lösung · ${st.offen} offen</p>
<div class="ls-stufen">${stufen}</div></div>`;
}

function rasterHTML(t) {
  return t.kapitel.map((k) => {
    const felder = t.aufgaben.filter((a) => a.kap === k.id).map((a) => {
      const s = F.anzeigeStatus(a.schluessel);
      return `<a class="raster-feld st-${s}" href="#/ueben/${t.id}/${a.nr}" data-schluessel="${a.schluessel}" title="Aufgabe ${a.nr}: ${esc(a.titel)} – ${STUFEN[stufeVon(a.k) - 1].name}, ${prozess(a.k).name} – ${STATUS_TEXT[s]}">${a.nr}</a>`;
    }).join('');
    return `<div class="raster-gruppe"><span class="raster-kap" title="${esc(k.titel)}">${k.id}</span>${felder}</div>`;
  }).join('');
}

function filterHTML(t, f) {
  const kap = `<button type="button" class="chip-knopf" data-filter="kap" data-wert="" aria-pressed="${!f.kap}">Alle</button>${t.kapitel
    .map((k) => `<button type="button" class="chip-knopf" data-filter="kap" data-wert="${k.id}" aria-pressed="${f.kap === k.id}" title="${esc(k.titel)}">${k.id} · ${esc(k.kurz)}</button>`)
    .join('')}`;
  const stufen = STUFEN.map((s) => `<button type="button" class="chip-knopf s-knopf s${s.s}" data-filter="stufe" data-wert="${s.s}" aria-pressed="${f.stufe.has(s.s)}" title="Stufe ${s.s}: ${s.titel} (${s.afb})">${s.zeichen} ${s.name}</button>`).join('');
  return `<div class="filter-gruppe"><span class="filter-titel">Kapitel</span><div class="chips-wahl">${kap}</div></div>
<div class="filter-zeile">
<div class="filter-gruppe"><span class="filter-titel">Taxonomie</span><div class="chips-wahl">${stufen}</div></div>
<div class="filter-gruppe"><label class="filter-titel" for="filter-status">Status</label><select id="filter-status" data-filter="status">
${[['', 'alle'], ['offen', 'noch offen'], ['nicht', 'noch nicht gelöst'], ['richtig', 'gelöst']].map(([w, t2]) => `<option value="${w}"${f.status === w ? ' selected' : ''}>${t2}</option>`).join('')}
</select></div></div>`;
}

function passt(a, f) {
  if (f.kap && a.kap !== f.kap) return false;
  if (f.stufe.size && !f.stufe.has(stufeVon(a.k))) return false;
  const s = F.anzeigeStatus(a.schluessel);
  if (f.status === 'offen' && s !== 'offen') return false;
  if (f.status === 'nicht' && s === 'richtig') return false;
  if (f.status === 'richtig' && s !== 'richtig') return false;
  return true;
}

export function ueben(main, { thema, nr, params }) {
  if (!thema && THEMEN.length > 1) return themenWahl(main);
  const t = themaNachId(thema) || THEMEN[0];
  document.title = `Üben · ${t.kurz} · Digitaltechnik`;
  const ziel = nr ? t.aufgaben.find((a) => a.nr === nr) : null;
  const filter = {
    kap: ziel ? ziel.kap : params.kap || '',
    stufe: new Set((params.stufe || '').split(',').filter(Boolean).map(Number).filter((x) => x >= 1 && x <= 3)),
    status: params.status || '',
  };
  const aktiv = new Map(); // uid → Aufgabe (auch Varianten)
  const lehrer = istLehrer();

  main.innerHTML = `<header class="seitenkopf mit-aktion"><div><p class="kicker">Üben · ${esc(t.kurz)}</p><h1>${t.aufgaben.length} Aufgaben</h1>
<p class="lead">Gib zuerst deine eigene Antwort ein und tippe auf <b>Prüfen</b>. Danach kannst du die Lösung mit dem Rechenweg ansehen.</p></div>
${lehrer ? `<label class="schalter-option lehrer-option"><input type="checkbox" data-lehrer="direkt"${loesungenDirekt() ? ' checked' : ''}> Lösungen sofort zeigen (Lehrermodus)</label>` : ''}</header>
<section class="lernstand karte-flaeche" aria-label="Dein Lernstand">${lernstandHTML(t)}<button type="button" class="btn leise klein" data-aktion-seite="zuruecksetzen">${icon('reset')}<span>Lernstand löschen</span></button></section>
<details class="raster-box"><summary>${icon('liste')} Alle Aufgaben auf einen Blick</summary><nav class="raster" aria-label="Alle Aufgaben">${rasterHTML(t)}</nav>
<p class="raster-legende"><span class="raster-feld st-richtig">✓</span> gelöst <span class="raster-feld st-teilweise">~</span> teilweise <span class="raster-feld st-falsch">✗</span> noch nicht gelöst <span class="raster-feld st-gesehen">?</span> Lösung angesehen <span class="raster-feld st-offen"> </span> offen</p></details>
<section class="filter karte-flaeche" aria-label="Aufgaben filtern">${filterHTML(t, filter)}</section>
<p class="filter-ergebnis" aria-live="polite"></p>
<div class="karten-liste"></div>`;

  const liste = main.querySelector('.karten-liste');
  const ergebnis = main.querySelector('.filter-ergebnis');

  function zeichneListe() {
    const auswahl = t.aufgaben.filter((a) => passt(a, filter));
    aktiv.clear();
    auswahl.forEach((a) => aktiv.set(a.schluessel, a));
    ergebnis.textContent = auswahl.length === t.aufgaben.length ? `Alle ${auswahl.length} Aufgaben` : `${auswahl.length} von ${t.aufgaben.length} Aufgaben`;
    liste.innerHTML = auswahl.length
      ? auswahl.map((a) => karteHTML(a)).join('')
      : '<p class="leer-hinweis">Keine Aufgabe passt zu diesem Filter.</p>';
  }

  function adresse() {
    const q = new URLSearchParams();
    if (filter.kap) q.set('kap', filter.kap);
    if (filter.stufe.size) q.set('stufe', [...filter.stufe].sort().join(','));
    if (filter.status) q.set('status', filter.status);
    const s = q.toString();
    history.replaceState(null, '', `#/ueben/${t.id}${s ? '?' + s : ''}`);
  }

  function aktualisiereFilterKnoepfe() {
    main.querySelectorAll('[data-filter="kap"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wert === filter.kap)));
    main.querySelectorAll('[data-filter="stufe"]').forEach((b) => b.setAttribute('aria-pressed', String(filter.stufe.has(Number(b.dataset.wert)))));
  }

  main.querySelector('.filter').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b || b.tagName === 'SELECT') return;
    const art = b.dataset.filter;
    if (art === 'kap') filter.kap = b.dataset.wert;
    else {
      const w = Number(b.dataset.wert);
      const menge = filter[art];
      if (menge.has(w)) menge.delete(w);
      else menge.add(w);
    }
    aktualisiereFilterKnoepfe();
    adresse();
    zeichneListe();
  });
  main.querySelector('#filter-status').addEventListener('change', (e) => {
    filter.status = e.target.value;
    adresse();
    zeichneListe();
  });

  main.querySelector('[data-aktion-seite="zuruecksetzen"]').addEventListener('click', () => {
    if (!confirm(`Lernstand für „${t.kurz}“ in diesem Browser löschen? Das kann nicht rückgängig gemacht werden.`)) return;
    F.zuruecksetzen(t.kuerzel);
    aktualisiereLernstand();
    zeichneListe();
  });

  const lehrerSchalter = main.querySelector('[data-lehrer="direkt"]');
  if (lehrerSchalter) {
    lehrerSchalter.addEventListener('change', () => {
      setzeLoesungenDirekt(lehrerSchalter.checked);
      zeichneListe();
    });
  }

  function aktualisiereLernstand() {
    const box = main.querySelector('.lernstand');
    const knopf = box.querySelector('[data-aktion-seite]');
    box.innerHTML = lernstandHTML(t);
    box.appendChild(knopf);
    main.querySelector('.raster').innerHTML = rasterHTML(t);
  }

  liste.addEventListener('fortschritt', aktualisiereLernstand);

  bindeKarten(liste, {
    finde: (uid) => aktiv.get(uid),
    neuerZufall: () => Date.now() + (variantenZaehler += 7919),
    ersetze: (karte, basis, startwert) => {
      const neu = startwert ? variante(basis, zufall(startwert)) : basis;
      const uid = neu.variante ? `${neu.schluessel}-v${++variantenZaehler}` : neu.schluessel;
      aktiv.delete(karte.dataset.uid);
      aktiv.set(uid, neu);
      karte.outerHTML = karteHTML(neu, { uid });
      const neueKarte = document.getElementById(`karte-${uid}`);
      neueKarte?.querySelector('input, select, button.schalter')?.focus({ preventScroll: true });
    },
  });

  zeichneListe();
  if (ziel) {
    const k = document.getElementById(`karte-${ziel.schluessel}`);
    if (k) {
      k.classList.add('hervorgehoben');
      requestAnimationFrame(() => k.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  }
}
