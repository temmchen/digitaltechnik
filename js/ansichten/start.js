// start.js – Startseite des Kompendiums: Themen, Lernstand, Taxonomiestufen, Arbeitsweise

import { THEMEN, ALLE_AUFGABEN } from '../themen/index.js';
import { TAXONOMIE } from '../kern/taxonomie.js';
import { statistik } from '../kern/fortschritt.js';
import { icon } from '../kern/icons.js';
import { esc, z } from '../kern/darstellung.js';
import { datumText } from '../ui/druck.js';

function themaKarte(t, i) {
  const st = statistik(t.aufgaben);
  const anteil = Math.round((st.richtig / st.gesamt) * 100);
  return `<article class="thema-karte">
<div class="thema-kopf"><span class="thema-symbol" aria-hidden="true">${esc(t.symbol)}</span><div><p class="kicker">Thema ${i + 1}</p><h3>${esc(t.titel)}</h3></div></div>
<p>${esc(t.beschreibung)}</p>
<p class="thema-meta">${t.lektionen.length} Lektionen · ${t.aufgaben.length} Aufgaben · ${t.kapitel.length} Kapitel · Stand ${datumText(t.stand)}</p>
<div class="balken" role="img" aria-label="${st.richtig} von ${st.gesamt} Aufgaben gelöst"><span style="width:${anteil}%"></span></div>
<p class="thema-stand">${st.richtig} von ${st.gesamt} Aufgaben gelöst</p>
<div class="knopfzeile"><a class="btn primaer" href="#/lernen/${t.id}">${icon('lernen')}<span>Lektionen</span></a><a class="btn" href="#/ueben/${t.id}">${icon('ueben')}<span>Üben</span></a><a class="btn leise" href="#/merkhilfe/${t.id}">${icon('merke')}<span>Merkhilfe</span></a></div>
</article>`;
}

export function start(main) {
  document.title = 'Digitaltechnik · Kompendium DP1ET';
  const st = statistik(ALLE_AUFGABEN);
  const jeStufe = TAXONOMIE.map((t) => ALLE_AUFGABEN.filter((a) => a.k === t.k).length);
  const erstes = THEMEN[0];
  const bearbeitet = st.gesamt - st.offen;
  const lernstand = bearbeitet
    ? `<section class="lernstand-kurz karte-flaeche"><div class="ring" style="--anteil:${Math.round((st.richtig / st.gesamt) * 100)}"><b>${st.richtig}</b><small>von ${st.gesamt}</small></div>
<div><h2 class="h3">Dein Lernstand</h2><p>${st.richtig} Aufgaben gelöst${st.ersterVersuch ? `, davon ${st.ersterVersuch} beim ersten Versuch` : ''}. ${st.falsch + st.teilweise ? `${st.falsch + st.teilweise} angefangen, ` : ''}${st.offen} noch offen.</p>
<a class="btn primaer" href="#/ueben">${icon('ueben')}<span>Weiter üben</span></a></div></section>`
    : '';
  main.innerHTML = `
<section class="held">
  <div class="held-text">
    <p class="kicker">Kompendium · Klasse DP1ET · Modul DITEC1</p>
    <h1>Grundlagen der Digitaltechnik</h1>
    <p class="lead">Schritt für Schritt erklärt – mit interaktiven Werkzeugen, ${ALLE_AUFGABEN.length} Aufgaben auf sechs Taxonomiestufen und einem Prüfungstraining.</p>
    <div class="knopfzeile">
      <a class="btn primaer gross" href="#/lernen/${erstes.id}/1">${icon('lernen')}<span>Mit Lektion 1 starten</span></a>
      <a class="btn gross" href="#/ueben">${icon('ueben')}<span>Aufgaben üben</span></a>
      <a class="btn gross leise" href="#/pruefung">${icon('pruefung')}<span>Prüfungstraining</span></a>
    </div>
  </div>
  <div class="held-bild" aria-hidden="true">
    <div class="hb-zeile"><span class="hb-label">Dezimal</span>${z('45', 10)}</div>
    <div class="hb-zeile"><span class="hb-label">Dual</span>${z('101101', 2)}</div>
    <div class="hb-zeile"><span class="hb-label">Hex</span>${z('2D', 16)}</div>
    <div class="hb-bits">${'101101'.padStart(8, '0').split('').map((b, i) => `<span class="hb-bit${b === '1' ? ' an' : ''}"><i></i><small>${2 ** (7 - i)}</small></span>`).join('')}</div>
  </div>
</section>
${lernstand}
<section class="abschnitt">
  <h2>Themen des Kompendiums</h2>
  <p class="neben">Das Kompendium wächst im Laufe des Semesters – jedes Thema mit Lektionen, Aufgaben und Merkhilfe.</p>
  <div class="themen-gitter">${THEMEN.map(themaKarte).join('')}
    <div class="thema-karte geplant"><span class="thema-symbol leer" aria-hidden="true">+</span><p>Weitere Themen folgen im Laufe des Semesters.</p></div>
  </div>
</section>
<section class="abschnitt" id="taxonomie">
  <h2>Sechs Taxonomiestufen</h2>
  <p>Jede Aufgabe trägt eine <b>Taxonomiestufe</b> (K1 bis K6, nach Bloom). Sie sagt, welche Denkleistung verlangt ist – nicht, wie schwer die Aufgabe ist. Dafür gibt es das <b>Niveau</b> (●○○ Basis, ●●○ Standard, ●●● Experte). In der Prüfung findest du dieselben Stufen wieder. Das fett gedruckte Verb im Aufgabentext (der <b>Operator</b>) verrät die Stufe.</p>
  <ol class="treppe">${TAXONOMIE.map((t, i) => `<li class="stufe k${t.k}" style="--h:${i}"><div class="stufe-kopf"><span class="chip chip-k k${t.k}">K${t.k}</span><b>${t.name}</b></div><p class="stufe-frage">${t.frage}</p><p class="stufe-text">${t.beschreibung}</p><p class="stufe-op">${t.operatoren.join(' · ')}</p><p class="stufe-anzahl">${jeStufe[i]} Aufgaben</p></li>`).join('')}</ol>
</section>
<section class="abschnitt">
  <h2>So arbeitest du mit dieser Seite</h2>
  <ol class="arbeitsweise">
    <li>${icon('lernen')}<div><b>Lektion lesen</b><p>Merksätze, Musterbeispiele und Werkzeuge zum Ausprobieren.</p></div></li>
    <li>${icon('ueben')}<div><b>Selbst rechnen</b><p>Erst deine eigene Antwort eingeben – danach kannst du die Lösung mit Rechenweg ansehen.</p></div></li>
    <li>${icon('tipp')}<div><b>Aus Fehlern lernen</b><p>Die Rückmeldung erkennt typische Fehler und sagt dir, wo es hakt.</p></div></li>
    <li>${icon('pruefung')}<div><b>Prüfung trainieren</b><p>Gemischte Aufgaben auf allen Stufen, mit Zeit und Punkten.</p></div></li>
  </ol>
  <p class="neben">Dein Lernstand bleibt nur in diesem Browser gespeichert – es werden keine Daten verschickt.</p>
</section>`;
}
