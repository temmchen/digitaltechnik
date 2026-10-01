// widgets.js – Thema Zahlensysteme: interaktive Werkzeuge der Lektionen (Zähler, Bit-Labor, Rechenwege Schritt für Schritt)

import {
  nachBasis, auffuellen, wegDivisionsrest, wegStellenwert, wegHexZuDual, wegDualZuHex,
  wegAddition, wegSubtraktion, ohneFuehrendeNullen,
} from '../../kern/zahlen.js';
import {
  z, esc, dez, pot, htmlDivisionsrest, htmlStellenwert, htmlHexZuDual, htmlDualZuHex, htmlAddition,
  htmlSubtraktion, textAdditionSpalte, textSubtraktionSpalte, htmlProbeSubtraktion, htmlDezimalProbe,
} from '../../kern/darstellung.js';
import { leseZahl } from '../../kern/pruefen.js';
import { icon } from '../../kern/icons.js';

const BEWEGUNG_REDUZIERT = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function kopf(titel, hinweis = '') {
  return `<div class="w-kopf"><span class="w-titel">${titel}</span>${hinweis ? `<span class="w-hinweis">${hinweis}</span>` : ''}</div>`;
}

function knopf(aktion, text, sym = '', extra = '') {
  return `<button type="button" class="btn klein${extra ? ' ' + extra : ''}" data-a="${aktion}">${sym ? icon(sym) : ''}<span>${text}</span></button>`;
}

/* ------------------------------------------------------------------ */
/* Zähl-Maschine                                                       */
/* ------------------------------------------------------------------ */

function zaehler(el) {
  let n = 0;
  let alt = 0;
  let takt = null;
  el.innerHTML = `${kopf('Zähl-Maschine', 'dieselbe Zahl in drei Systemen')}
<div class="zaehler">
  <div class="z-reihe b10"><span class="z-name">Dezimal</span><span class="z-ziffern" data-z="10"></span></div>
  <div class="z-reihe b2"><span class="z-name">Dual</span><span class="z-ziffern" data-z="2"></span></div>
  <div class="z-reihe b16"><span class="z-name">Hex</span><span class="z-ziffern" data-z="16"></span></div>
</div>
<div class="w-steuerung">${knopf('minus', '−1')}${knopf('plus', '+1', '', 'primaer')}${knopf('auto', 'Automatisch zählen', 'play')}${knopf('null', 'Auf 0', 'reset')}</div>
<p class="w-meldung" aria-live="polite"></p>`;
  const stellen = { 10: 3, 2: 8, 16: 2 };
  const meldung = el.querySelector('.w-meldung');
  function zeichne() {
    for (const b of [10, 2, 16]) {
      const s = b === 10 ? String(n).padStart(3, '0') : auffuellen(nachBasis(n, b), stellen[b]);
      const sa = b === 10 ? String(alt).padStart(3, '0') : auffuellen(nachBasis(alt, b), stellen[b]);
      const html = [...s].map((c, i) => {
        const geaendert = c !== sa[i];
        const fuehrend = s.slice(0, i + 1).replace(/0/g, '') === '' && i < s.length - 1;
        return `<span class="z-ziffer${geaendert ? ' neu' : ''}${fuehrend ? ' fuehrend' : ''}${b === 2 && i === 3 ? ' trenner' : ''}">${c}</span>`;
      }).join('');
      el.querySelector(`[data-z="${b}"]`).innerHTML = html;
    }
    const einsenWeg = n > alt && (alt & 1) === 1;
    if (n === 0 && alt === 255) meldung.textContent = 'Überlauf: Nach 255 (1111 1111₂ = FF₁₆) beginnt ein 8-Bit-Zähler wieder bei 0.';
    else if (einsenWeg && n - alt === 1) {
      const kette = nachBasis(alt, 2).match(/1*$/)[0].length;
      meldung.textContent = `Übertrag im Dualsystem: ${kette === 1 ? 'Die rechte 1 wird' : `Die ${kette} rechten Einsen werden`} zu 0, links davon entsteht eine 1.`;
    } else if (n - alt === 1 && (alt & 15) === 15) meldung.textContent = 'Übertrag im Hexadezimalsystem: Nach F kommt 10.';
    else meldung.textContent = '';
  }
  function setze(neu) {
    alt = n;
    n = (neu + 256) % 256;
    zeichne();
  }
  function stoppe() {
    if (takt) clearInterval(takt);
    takt = null;
    const k = el.querySelector('[data-a="auto"]');
    k.innerHTML = `${icon('play')}<span>Automatisch zählen</span>`;
  }
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    if (a === 'plus') setze(n + 1);
    if (a === 'minus') setze(n - 1);
    if (a === 'null') { stoppe(); setze(0); }
    if (a === 'auto') {
      if (takt) { stoppe(); return; }
      takt = setInterval(() => {
        if (!el.isConnected) { stoppe(); return; }
        setze(n + 1);
      }, BEWEGUNG_REDUZIERT ? 1200 : 800);
      e.target.closest('[data-a]').innerHTML = `${icon('pause')}<span>Anhalten</span>`;
    }
  });
  zeichne();
}

/* ------------------------------------------------------------------ */
/* Bit-Labor                                                           */
/* ------------------------------------------------------------------ */

function bitlabor(el) {
  const bits = Number(el.dataset.bits || 8);
  let wert = 0b10110110 & (2 ** bits - 1);
  let ziel = null;
  let knoepfe = '';
  for (let i = bits - 1; i >= 0; i--) {
    knoepfe += `<button type="button" class="bit" data-i="${i}" aria-pressed="false" aria-label="Bit ${i}, Stellenwert ${2 ** i}">
<span class="bit-pot">${pot(2, i)}</span><span class="bit-lampe" aria-hidden="true"></span><span class="bit-ziffer">0</span><span class="bit-wert">${dez(2 ** i)}</span></button>`;
  }
  el.innerHTML = `${kopf('Bit-Labor', `${bits} Schalter = ${bits} Bit`)}
<div class="bits" style="--anzahl:${bits}">${knoepfe}</div>
<div class="bit-rechnung" aria-live="polite"></div>
<div class="w-steuerung">${knopf('aus', 'Alle aus')}${knopf('an', 'Alle an')}${knopf('ziel', 'Aufgabe: Zahl einstellen', 'ziel', 'primaer')}</div>
<p class="w-meldung" aria-live="polite"></p>`;
  const meldung = el.querySelector('.w-meldung');
  function zeichne() {
    el.querySelectorAll('.bit').forEach((k) => {
      const an = (wert >> Number(k.dataset.i)) & 1;
      k.classList.toggle('an', !!an);
      k.setAttribute('aria-pressed', an ? 'true' : 'false');
      k.querySelector('.bit-ziffer').textContent = an;
    });
    const terme = [];
    for (let i = bits - 1; i >= 0; i--) if ((wert >> i) & 1) terme.push(dez(2 ** i));
    const dual = auffuellen(nachBasis(wert, 2), bits);
    el.querySelector('.bit-rechnung').innerHTML = `<div class="br-summe">${terme.length ? terme.join(' + ') : '0'} = <b>${dez(wert)}</b></div>
<div class="br-zahlen">${z(dual, 2)} = ${z(String(wert), 10)} = ${z(nachBasis(wert, 16), 16)}</div>`;
    if (ziel !== null) {
      meldung.innerHTML = wert === ziel
        ? `${icon('haken')} <b>Geschafft!</b> ${z(String(ziel), 10)} = ${z(dual, 2)}. ${knopf('ziel', 'Nächste Zahl', 'pfeil')}`
        : `Stelle die Zahl <b>${ziel}</b> ein. ${wert > ziel ? 'Noch zu groß.' : 'Noch zu klein.'}`;
      meldung.classList.toggle('erfolg', wert === ziel);
    }
  }
  el.addEventListener('click', (e) => {
    const bit = e.target.closest('.bit');
    if (bit) {
      wert ^= 1 << Number(bit.dataset.i);
      zeichne();
      return;
    }
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'aus') wert = 0;
    if (a === 'an') wert = 2 ** bits - 1;
    if (a === 'ziel') {
      let neu;
      do neu = 1 + Math.floor(Math.random() * (2 ** bits - 1)); while (neu === ziel);
      ziel = neu;
      wert = 0;
    }
    if (a) zeichne();
  });
  zeichne();
}

/* ------------------------------------------------------------------ */
/* Divisionsrest-Maschine                                              */
/* ------------------------------------------------------------------ */

function division(el) {
  const basis = Number(el.dataset.basis || 2);
  let n = Number(el.dataset.start || 45);
  let sichtbar = 0;
  el.innerHTML = `${kopf(`Divisionsrest-Maschine (÷ ${basis})`, basis === 2 ? 'Dezimal → Dual' : 'Dezimal → Hexadezimal')}
<div class="w-eingabe"><label>Dezimalzahl <input type="text" inputmode="numeric" autocomplete="off" value="${n}" maxlength="5" aria-label="Dezimalzahl"></label>
${knopf('schritt', 'Nächster Schritt', 'schritt', 'primaer')}${knopf('alle', 'Alle Schritte')}${knopf('neu', 'Von vorn', 'reset')}</div>
<p class="w-meldung" aria-live="polite"></p><div class="w-ausgabe"></div>`;
  const ausgabe = el.querySelector('.w-ausgabe');
  const meldung = el.querySelector('.w-meldung');
  const feld = el.querySelector('input');
  function zeichne() {
    const weg = wegDivisionsrest(n, basis);
    ausgabe.innerHTML = htmlDivisionsrest(weg, { sichtbar });
    if (sichtbar === 0) meldung.textContent = `Tippe auf „Nächster Schritt“: ${n} wird durch ${basis} geteilt.`;
    else if (sichtbar < weg.zeilen.length) {
      const zl = weg.zeilen[sichtbar - 1];
      meldung.textContent = `${zl.dividend} : ${basis} = ${zl.quotient} Rest ${zl.rest}${basis === 16 && zl.rest > 9 ? ` → Hex-Ziffer ${zl.ziffer}` : ''}. Weiter mit ${zl.quotient}.`;
    } else meldung.textContent = `Fertig: Der Quotient ist 0. Jetzt die Reste von unten nach oben lesen → ${weg.ergebnis}.`;
  }
  function lies() {
    const r = leseZahl(feld.value, 10);
    if (!r.ok || r.wert > 65535) {
      meldung.textContent = r.ok ? 'Bitte eine Zahl bis 65 535 eingeben.' : r.meldung;
      return false;
    }
    if (r.wert !== n) { n = r.wert; sichtbar = 0; }
    return true;
  }
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a || !lies()) return;
    const max = wegDivisionsrest(n, basis).zeilen.length;
    if (a === 'schritt') sichtbar = Math.min(max, sichtbar + 1);
    if (a === 'alle') sichtbar = max;
    if (a === 'neu') sichtbar = 0;
    zeichne();
  });
  feld.addEventListener('input', () => { if (lies()) zeichne(); });
  feld.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.querySelector('[data-a="schritt"]').click(); }
  });
  zeichne();
}

/* ------------------------------------------------------------------ */
/* Stellenwerttafel                                                    */
/* ------------------------------------------------------------------ */

function stellenwert(el) {
  const basis = Number(el.dataset.basis || 2);
  const start = el.dataset.start || (basis === 2 ? '1011' : '2AF');
  const max = basis === 2 ? 16 : 4;
  el.innerHTML = `${kopf(`Stellenwerttafel (Basis ${basis})`, basis === 2 ? 'Dual → Dezimal' : 'Hexadezimal → Dezimal')}
<div class="w-eingabe"><label>${basis === 2 ? 'Dualzahl' : 'Hexadezimalzahl'} <input type="text" inputmode="${basis === 16 ? 'text' : 'numeric'}" autocapitalize="characters" autocomplete="off" spellcheck="false" value="${start}" maxlength="${max + 4}" aria-label="Zahl eingeben"></label></div>
<p class="w-meldung" aria-live="polite"></p><div class="w-ausgabe"></div>`;
  const feld = el.querySelector('input');
  const ausgabe = el.querySelector('.w-ausgabe');
  const meldung = el.querySelector('.w-meldung');
  function zeichne() {
    const r = leseZahl(feld.value, basis);
    if (!r.ok) { meldung.textContent = r.leer ? 'Gib eine Zahl ein.' : r.meldung; return; }
    const s = ohneFuehrendeNullen(r.ziffern);
    if (s.length > max) { meldung.textContent = `Bitte höchstens ${max} Stellen.`; return; }
    meldung.textContent = '';
    ausgabe.innerHTML = htmlStellenwert(wegStellenwert(s, basis));
  }
  feld.addEventListener('input', zeichne);
  zeichne();
}

/* ------------------------------------------------------------------ */
/* Tetraden-Brücke                                                     */
/* ------------------------------------------------------------------ */

function tetraden(el) {
  let richtung = 'h2d';
  el.innerHTML = `${kopf('Tetraden-Brücke', '1 Hex-Ziffer = 4 Bit')}
<div class="w-eingabe">
  <div class="segment" role="radiogroup" aria-label="Richtung">
    <button type="button" class="seg aktiv" data-r="h2d" role="radio" aria-checked="true">Hex → Dual</button>
    <button type="button" class="seg" data-r="d2h" role="radio" aria-checked="false">Dual → Hex</button>
  </div>
  <label><span class="t-label">Hexadezimalzahl</span> <input type="text" autocapitalize="characters" autocomplete="off" spellcheck="false" value="${esc(el.dataset.start || '2D7')}" aria-label="Zahl eingeben"></label>
</div>
<p class="w-meldung" aria-live="polite"></p><div class="w-ausgabe"></div>`;
  const feld = el.querySelector('input');
  const ausgabe = el.querySelector('.w-ausgabe');
  const meldung = el.querySelector('.w-meldung');
  function zeichne() {
    const basis = richtung === 'h2d' ? 16 : 2;
    const r = leseZahl(feld.value, basis);
    if (!r.ok) { meldung.textContent = r.leer ? 'Gib eine Zahl ein.' : r.meldung; return; }
    const s = ohneFuehrendeNullen(r.ziffern);
    if ((basis === 16 && s.length > 4) || (basis === 2 && s.length > 16)) { meldung.textContent = 'Bitte höchstens 4 Hex-Ziffern bzw. 16 Bit.'; return; }
    meldung.textContent = '';
    ausgabe.innerHTML = basis === 16 ? htmlHexZuDual(wegHexZuDual(s)) : htmlDualZuHex(wegDualZuHex(s));
  }
  el.addEventListener('click', (e) => {
    const seg = e.target.closest('.seg');
    if (!seg || seg.dataset.r === richtung) return;
    const basisAlt = richtung === 'h2d' ? 16 : 2;
    const r = leseZahl(feld.value, basisAlt);
    richtung = seg.dataset.r;
    el.querySelectorAll('.seg').forEach((s) => {
      s.classList.toggle('aktiv', s === seg);
      s.setAttribute('aria-checked', s === seg ? 'true' : 'false');
    });
    el.querySelector('.t-label').textContent = richtung === 'h2d' ? 'Hexadezimalzahl' : 'Dualzahl';
    feld.inputMode = richtung === 'h2d' ? 'text' : 'numeric';
    if (r.ok) feld.value = nachBasis(r.wert, richtung === 'h2d' ? 16 : 2);
    zeichne();
  });
  feld.addEventListener('input', zeichne);
  zeichne();
}

/* ------------------------------------------------------------------ */
/* Rechenwerk: Addition und Subtraktion Spalte für Spalte              */
/* ------------------------------------------------------------------ */

function rechenwerk(el, op) {
  let a = el.dataset.a || '1011';
  let b = el.dataset.b || '0110';
  let bis = 0;
  const istAdd = op === '+';
  el.innerHTML = `${kopf(istAdd ? 'Rechenwerk: Addition' : 'Rechenwerk: Subtraktion', 'Spalte für Spalte von rechts')}
<div class="w-eingabe">
  <label>${istAdd ? '1. Summand' : 'Minuend'} <input type="text" inputmode="numeric" autocomplete="off" data-w="a" value="${a}" maxlength="16"></label>
  <label>${istAdd ? '2. Summand' : 'Subtrahend'} <input type="text" inputmode="numeric" autocomplete="off" data-w="b" value="${b}" maxlength="16"></label>
</div>
<div class="w-steuerung">${knopf('schritt', 'Nächste Spalte', 'schritt', 'primaer')}${knopf('alle', 'Alle Spalten')}${knopf('neu', 'Von vorn', 'reset')}${knopf('zufall', 'Neue Zahlen', 'zufall')}</div>
<p class="w-meldung" aria-live="polite"></p><div class="w-ausgabe"></div><div class="w-nachher"></div>`;
  const ausgabe = el.querySelector('.w-ausgabe');
  const nachher = el.querySelector('.w-nachher');
  const meldung = el.querySelector('.w-meldung');
  const fa = el.querySelector('[data-w="a"]');
  const fb = el.querySelector('[data-w="b"]');
  function weg() {
    const breite = Math.max(a.length, b.length);
    return istAdd ? wegAddition(auffuellen(a, breite), auffuellen(b, breite)) : wegSubtraktion(auffuellen(a, breite), auffuellen(b, breite));
  }
  function lies() {
    const ra = leseZahl(fa.value, 2);
    const rb = leseZahl(fb.value, 2);
    if (!ra.ok || !rb.ok) { meldung.textContent = (!ra.ok ? ra : rb).meldung; return false; }
    if (ra.ziffern.length > 16 || rb.ziffern.length > 16) { meldung.textContent = 'Bitte höchstens 16 Bit.'; return false; }
    if (!istAdd && rb.wert > ra.wert) { meldung.textContent = 'Der Minuend muss mindestens so groß sein wie der Subtrahend (nur positive Ergebnisse).'; return false; }
    if (ra.ziffern !== a || rb.ziffern !== b) { a = ra.ziffern; b = rb.ziffern; bis = 0; }
    return true;
  }
  function zeichne() {
    const w = weg();
    const n = w.spalten.length;
    ausgabe.innerHTML = istAdd
      ? htmlAddition(w, { bis, aktiv: bis > 0 && bis <= n ? bis - 1 : -1 })
      : htmlSubtraktion(w, { bis, aktiv: bis > 0 && bis <= n ? bis - 1 : -1 });
    if (bis === 0) {
      meldung.innerHTML = 'Tippe auf „Nächste Spalte“. Gerechnet wird von rechts nach links.';
      nachher.innerHTML = '';
    } else {
      const c = w.spalten[bis - 1];
      meldung.innerHTML = istAdd ? textAdditionSpalte(c) : textSubtraktionSpalte(c);
      if (bis >= n) {
        if (istAdd && w.endUebertrag) meldung.innerHTML += '<br>Der letzte Übertrag wird zur neuen vordersten Stelle.';
        const erg = ohneFuehrendeNullen(w.ergebnis);
        nachher.innerHTML = `<p class="rw-ergebnis">${z(ohneFuehrendeNullen(a), 2)} ${istAdd ? '+' : '−'} ${z(ohneFuehrendeNullen(b), 2)} = ${z(erg, 2)}</p>${istAdd ? '' : htmlProbeSubtraktion(w)}${htmlDezimalProbe(a, b, istAdd ? '+' : '−')}`;
      } else nachher.innerHTML = '';
    }
  }
  el.addEventListener('click', (e) => {
    const k = e.target.closest('[data-a]')?.dataset.a;
    if (!k) return;
    if (k === 'zufall') {
      const breite = 4 + Math.floor(Math.random() * 5);
      let x = Math.floor(Math.random() * 2 ** breite);
      let y = Math.floor(Math.random() * 2 ** breite);
      if (!istAdd && y > x) [x, y] = [y, x];
      fa.value = auffuellen(nachBasis(x, 2), breite);
      fb.value = auffuellen(nachBasis(y, 2), breite);
    }
    if (!lies()) return;
    const n = weg().spalten.length;
    if (k === 'schritt') bis = Math.min(n, bis + 1);
    if (k === 'alle') bis = n;
    if (k === 'neu' || k === 'zufall') bis = 0;
    zeichne();
  });
  for (const f of [fa, fb]) f.addEventListener('input', () => { if (lies()) zeichne(); });
  zeichne();
}

export const WIDGETS = {
  zaehler,
  bitlabor,
  division,
  stellenwert,
  tetraden,
  addition: (el) => rechenwerk(el, '+'),
  subtraktion: (el) => rechenwerk(el, '−'),
};
