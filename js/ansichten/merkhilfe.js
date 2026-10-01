// merkhilfe.js – Merkhilfe eines Themas (eine druckbare Seite)

import { THEMEN, themaNachId } from '../themen/index.js';
import { icon } from '../kern/icons.js';
import { esc } from '../kern/darstellung.js';
import { drucke } from '../ui/drucken.js';

export function merkhilfe(main, id) {
  const t = themaNachId(id) || THEMEN[0];
  document.title = `Merkhilfe ${t.kurz} · Digitaltechnik`;
  const inhalt = t.merkhilfe();
  main.innerHTML = `<nav class="brotkrumen" aria-label="Pfad"><a href="#/lernen">Lernen</a><span>›</span><a href="#/lernen/${t.id}">${esc(t.kurz)}</a><span>›</span><span>Merkhilfe</span></nav>
<header class="seitenkopf mit-aktion"><div><p class="kicker">Merkhilfe</p><h1>${esc(t.titel)}</h1><p class="lead">Das Wichtigste auf einer Seite – zum Nachschlagen und Ausdrucken.</p></div>
<button type="button" class="btn primaer" data-m="drucken">${icon('drucken')}<span>Drucken</span></button></header>
<div class="merkhilfe-rahmen karte-flaeche">${inhalt}</div>`;
  main.querySelector('[data-m="drucken"]').addEventListener('click', () => {
    drucke(`<div class="druckblatt merkhilfe-blatt"><header class="d-kopf"><div class="d-zeile"><span>Merkhilfe · DP1ET · DITEC1</span><span>Digitaltechnik</span></div><h1 class="d-titel">${esc(t.titel)}</h1></header>${inhalt}</div>`, `Merkhilfe ${t.kurz}`);
  });
}
