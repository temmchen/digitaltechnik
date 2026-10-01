// lernen.js – Lektionen: Übersicht aller Themen, Lektionsliste eines Themas, einzelne Lektion

import { THEMEN, themaNachId } from '../themen/index.js';
import { stufe, stufeVon, prozess } from '../kern/taxonomie.js';
import { statistik } from '../kern/fortschritt.js';
import { icon } from '../kern/icons.js';
import { esc } from '../kern/darstellung.js';
import { montiereWidgets } from '../ui/widgets.js';

function lektionKarte(t, l) {
  const aufgaben = t.aufgaben.filter((a) => a.kap === l.kap);
  const st = statistik(aufgaben);
  return `<a class="lektion-karte" href="#/lernen/${t.id}/${l.nr}">
<span class="lk-nr">${l.nr}</span>
<span class="lk-text"><b>${esc(l.titel)}</b><small>${esc(l.untertitel)}</small></span>
<span class="lk-meta">${icon('uhr')} ${l.dauer} min · ${aufgaben.length} Aufgaben${st.richtig ? ` · <span class="lk-stand">${st.richtig}/${aufgaben.length} gelöst</span>` : ''}</span>
</a>`;
}

function themaBlock(t, i) {
  return `<section class="abschnitt">
<div class="abschnitt-kopf"><div><p class="kicker">Thema ${i + 1}</p><h2>${esc(t.titel)}</h2></div><a class="btn leise" href="#/merkhilfe/${t.id}">${icon('merke')}<span>Merkhilfe</span></a></div>
<div class="lektionen-liste">${t.lektionen.map((l) => lektionKarte(t, l)).join('')}</div>
</section>`;
}

export function lernenUebersicht(main) {
  document.title = 'Lernen · Digitaltechnik';
  main.innerHTML = `<header class="seitenkopf"><h1>Lernen</h1><p class="lead">Alle Lektionen des Kompendiums. Jede Lektion endet mit den passenden Übungsaufgaben.</p></header>${THEMEN.map(themaBlock).join('')}`;
}

export function themaLektionen(main, id) {
  const t = themaNachId(id);
  if (!t) return lernenUebersicht(main);
  document.title = `${t.kurz} · Lernen · Digitaltechnik`;
  main.innerHTML = `<nav class="brotkrumen" aria-label="Pfad"><a href="#/lernen">Lernen</a><span>›</span><span>${esc(t.kurz)}</span></nav>
<header class="seitenkopf"><p class="kicker">Thema ${THEMEN.indexOf(t) + 1}</p><h1>${esc(t.titel)}</h1><p class="lead">${esc(t.beschreibung)}</p></header>
<div class="lektionen-liste">${t.lektionen.map((l) => lektionKarte(t, l)).join('')}</div>`;
}

function slug(text, i) {
  return `abschnitt-${i + 1}-${text.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}`;
}

export function lektion(main, id, nr) {
  const t = themaNachId(id);
  const l = t && t.lektionen.find((x) => x.nr === nr);
  if (!l) return themaLektionen(main, id);
  document.title = `Lektion ${l.nr}: ${l.titel} · Digitaltechnik`;
  const idx = t.lektionen.indexOf(l);
  const vorher = t.lektionen[idx - 1];
  const nachher = t.lektionen[idx + 1];
  const kap = t.kapitel.find((k) => k.id === l.kap);
  const aufgaben = t.aufgaben.filter((a) => a.kap === l.kap);
  const st = statistik(aufgaben);
  const stufen = [...new Set(aufgaben.map((a) => stufeVon(a.k)))].sort();
  main.innerHTML = `<div class="lektion-raster">
<aside class="lektion-seite" aria-label="Inhalt der Lektion">
  <p class="seite-titel">In dieser Lektion</p><ol class="toc"></ol>
  <p class="seite-titel">${esc(t.kurz)}</p>
  <ol class="toc-lektionen">${t.lektionen.map((x) => `<li${x.nr === l.nr ? ' class="aktiv"' : ''}><a href="#/lernen/${t.id}/${x.nr}"><span>${x.nr}</span> ${esc(x.titel)}</a></li>`).join('')}</ol>
</aside>
<article class="lektion">
  <nav class="brotkrumen" aria-label="Pfad"><a href="#/lernen">Lernen</a><span>›</span><a href="#/lernen/${t.id}">${esc(t.kurz)}</a><span>›</span><span>Lektion ${l.nr}</span></nav>
  <header class="lektion-kopf"><p class="kicker">Lektion ${l.nr} von ${t.lektionen.length} · ca. ${l.dauer} min · Kapitel ${l.kap}</p><h1>${esc(l.titel)}</h1><p class="lead">${esc(l.untertitel)}</p></header>
  <div class="box ziele"><div class="box-kopf">${icon('ziel')}<span>Lernziele – nach dieser Lektion kannst du …</span></div><ul class="ziel-liste">${l.ziele
    .map(([text, k]) => { const st = stufe(stufeVon(k)); return `<li><span class="chip chip-stufe s${st.s}" title="Taxonomiestufe ${st.s} – ${st.name}: ${st.titel}">${st.zeichen} ${prozess(k).name}</span><span>${text}</span></li>`; })
    .join('')}</ul></div>
  <div class="lektion-inhalt">${l.inhalt}</div>
  <section class="jetzt-ueben">
    <div><p class="kicker">Jetzt üben</p><h2 class="h3">Kapitel ${l.kap}: ${esc(kap ? kap.titel : '')}</h2>
    <p>${aufgaben.length} Aufgaben auf den Stufen ${stufen.map((s) => `<span class="chip chip-stufe s${s}">${stufe(s).zeichen} ${stufe(s).name}</span>`).join(' ')}${st.richtig ? ` · ${st.richtig} schon gelöst` : ''}</p></div>
    <a class="btn primaer gross" href="#/ueben/${t.id}?kap=${l.kap}">${icon('ueben')}<span>Aufgaben lösen</span></a>
  </section>
  <nav class="lektion-nav" aria-label="Weitere Lektionen">
    ${vorher ? `<a class="btn" href="#/lernen/${t.id}/${vorher.nr}">${icon('zurueck')}<span>Lektion ${vorher.nr}: ${esc(vorher.titel)}</span></a>` : '<span></span>'}
    ${nachher ? `<a class="btn primaer" href="#/lernen/${t.id}/${nachher.nr}"><span>Lektion ${nachher.nr}: ${esc(nachher.titel)}</span>${icon('vor')}</a>` : `<a class="btn primaer" href="#/pruefung"><span>Zum Prüfungstraining</span>${icon('vor')}</a>`}
  </nav>
</article></div>`;

  // Inhaltsverzeichnis aus den Zwischenüberschriften
  const toc = main.querySelector('.toc');
  main.querySelectorAll('.lektion-inhalt h2').forEach((h, i) => {
    h.id = slug(h.textContent, i);
    toc.insertAdjacentHTML('beforeend', `<li><button type="button" class="link-knopf" data-ziel="${h.id}">${esc(h.textContent)}</button></li>`);
  });
  toc.addEventListener('click', (e) => {
    const k = e.target.closest('[data-ziel]');
    if (k) document.getElementById(k.dataset.ziel)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  montiereWidgets(main);
}
