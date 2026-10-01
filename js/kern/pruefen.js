// pruefen.js – Antworten lesen, bewerten und typische Fehler erkennen (ohne DOM)

import {
  ZIFFERN, nachBasis, vonBasis, ohneFuehrendeNullen, auffuellen, zifferWert,
  wegDivisionsrest, wegAddition, wegSubtraktion, einsen,
} from './zahlen.js';

const ZAHLWORT = { 2: 'Dualzahl', 10: 'Dezimalzahl', 16: 'Hexadezimalzahl' };
const IDX = { 2: '₂', 10: '₁₀', 16: '₁₆' };

/**
 * Liest eine eingetippte Zahl. Großzügig bei der Schreibweise (Leerzeichen,
 * führende Nullen, 0x/0b, Index am Ende), streng bei den Ziffern.
 * Ergebnis: { ok, wert, ziffern } oder { ok:false, leer?, meldung }
 */
export function leseZahl(eingabe, basis) {
  let s = String(eingabe ?? '').trim();
  if (!s) return { ok: false, leer: true, meldung: 'Bitte gib eine Antwort ein.' };
  s = s.replace(/[₀-₉]+$/, ''); // Index ₂ ₁₆ ₁₀
  s = s.replace(/\s*\((?:2|10|16)\)$/, '').replace(/_(?:2|10|16)$/, '');
  if (basis === 16) s = s.replace(/^(?:0x|#|\$|&h)/i, '').replace(/h$/i, '');
  if (basis === 2) s = s.replace(/^0b/i, '');
  if (/^[-−–]/.test(s)) return { ok: false, meldung: 'Hier gibt es nur positive ganze Zahlen – bitte ohne Minuszeichen.' };
  s = s.replace(/[\s   ._'’]/g, '');
  if (!s) return { ok: false, leer: true, meldung: 'Bitte gib eine Antwort ein.' };
  if (s.includes(',')) return { ok: false, meldung: 'Bitte nur ganze Zahlen eingeben (ohne Komma).' };
  s = s.toUpperCase();
  for (const z of s) {
    const w = ZIFFERN.indexOf(z);
    if (w >= 0 && w < basis) continue;
    return { ok: false, meldung: ungueltigeZiffer(z, basis) };
  }
  return { ok: true, ziffern: s, wert: vonBasis(s, basis) };
}

function ungueltigeZiffer(z, basis) {
  if (z === 'O') return '„O“ ist ein Buchstabe – meinst du die Ziffer 0?';
  if ((z === 'I' || z === 'L') && basis !== 16) return `„${z}“ ist ein Buchstabe – meinst du die Ziffer 1?`;
  if (basis === 2) {
    if (/[2-9]/.test(z)) return `Im Dualsystem gibt es nur die Ziffern 0 und 1 – „${z}“ kommt nicht vor.`;
    return 'Eine Dualzahl besteht nur aus den Ziffern 0 und 1.';
  }
  if (basis === 10) {
    if (/[A-F]/.test(z)) return 'Gesucht ist eine Dezimalzahl – sie besteht nur aus den Ziffern 0 bis 9.';
    return `Das Zeichen „${z}“ gehört nicht in eine Dezimalzahl.`;
  }
  if (/[G-Z]/.test(z)) return `„${z}“ ist keine Hexadezimalziffer. Erlaubt sind 0–9 und A–F.`;
  return `Das Zeichen „${z}“ ist hier nicht erlaubt.`;
}

/* ------------------------------------------------------------------ */
/* Diagnose typischer Fehler                                           */
/* ------------------------------------------------------------------ */

function rueckwaerts(s) {
  return [...String(s)].reverse().join('');
}

function genauEineStelleAnders(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d === 1;
}

/** Liefert eine Erklärung, warum eine (gültige, aber falsche) Zahl falsch sein könnte – oder ''. */
export function diagnose(feld, gelesen) {
  const d = feld.diag || {};
  const basis = feld.basis;
  const soll = feld.loesung;
  const sollText = nachBasis(soll, basis);
  const ist = gelesen.wert;
  const istText = ohneFuehrendeNullen(gelesen.ziffern);

  // 1. Richtiger Wert, aber im falschen Zahlensystem hingeschrieben
  if (basis !== 10 && /^[0-9]+$/.test(istText) && parseInt(istText, 10) === soll) {
    return `Das ist der Dezimalwert. Gesucht ist die ${ZAHLWORT[basis]} – wandle noch um.`;
  }
  if (basis === 10 && /^[01]+$/.test(istText) && istText.length > 1 && parseInt(istText, 2) === soll) {
    return 'Das ist noch die Dualzahl. Gesucht ist ihr Wert im Dezimalsystem.';
  }
  if (basis === 10 && parseInt(istText, 16) === soll && d.von === 16) {
    return 'Das ist noch die Hexadezimalzahl. Gesucht ist ihr Wert im Dezimalsystem.';
  }

  // 2. Ziffern in umgekehrter Reihenfolge (nur dual/hex – dort ist das ein typischer Fehler)
  if (basis !== 10 && istText.length > 1 && (vonBasis(rueckwaerts(gelesen.ziffern), basis) === soll || istText === ohneFuehrendeNullen(rueckwaerts(sollText)))) {
    if (d.von === 10) {
      return 'Die Reste stehen in der falschen Reihenfolge. Beim Divisionsrestverfahren liest du die Reste von unten nach oben – der erste Rest ist die Stelle ganz rechts.';
    }
    return 'Die Ziffern stehen in umgekehrter Reihenfolge. Die Stelle mit dem kleinsten Stellenwert steht ganz rechts.';
  }

  // 3. Dual/Hex → Dezimal
  if (basis === 10 && (d.von === 2 || d.von === 16) && d.text) {
    const b = d.von;
    if (ist === vonBasis(rueckwaerts(d.text), b)) {
      return `Du hast die Stellenwerte von links nach rechts vergeben. Der kleinste Stellenwert (${b}⁰ = 1) gehört zur Ziffer ganz rechts.`;
    }
    if (ist === soll * b) {
      return `Dein Ergebnis ist ${b === 2 ? 'doppelt' : '16-mal'} so groß: Die Stelle ganz rechts hat den Stellenwert ${b}⁰ = 1, nicht ${b}¹ = ${b}.`;
    }
    if (b === 16) {
      const mitZehnern = [...d.text].reduce((a, z) => a * 10 + zifferWert(z), 0);
      if (ist === mitZehnern) {
        return 'Du hast mit Zehnerpotenzen gerechnet. Im Hexadezimalsystem sind die Stellenwerte 16⁰ = 1, 16¹ = 16, 16² = 256, 16³ = 4096.';
      }
    }
    const diff = ist - soll;
    if (b === 2) {
      const bits = d.text;
      const gewichtVon = (pos) => 2 ** pos;
      for (let i = 0; i < bits.length; i++) {
        const pos = bits.length - 1 - i;
        if (bits[i] === '1' && diff === -gewichtVon(pos)) return 'Ein Summand fehlt: Prüfe, ob du alle Stellenwerte addiert hast, unter denen eine 1 steht.';
        if (bits[i] === '0' && diff === gewichtVon(pos)) return 'Du hast einen Stellenwert addiert, unter dem eine 0 steht. Nur Stellen mit einer 1 zählen.';
      }
      if (ist === bits.length) return 'Du hast die Stellen gezählt. Gesucht ist der Wert: Addiere die Stellenwerte der Einsen.';
    } else {
      for (let pos = 0; pos < d.text.length; pos++) {
        const g = 16 ** pos;
        if (diff !== 0 && diff % g === 0 && Math.abs(diff / g) <= 15) {
          return 'Bei einer Stelle stimmt das Produkt Ziffernwert · Stellenwert nicht. Prüfe besonders die Buchstaben (A = 10, B = 11, C = 12, D = 13, E = 14, F = 15).';
        }
      }
    }
  }

  // 4. Dezimal → Dual
  if (d.von === 10 && basis === 2) {
    if (istText === ohneFuehrendeNullen(sollText.slice(1)) && sollText.length > 1) {
      return 'Die vorderste Stelle fehlt. Vergiss den letzten Rest nicht – auch bei 1 : 2 = 0 Rest 1 wird die 1 notiert.';
    }
    if (istText === sollText.slice(0, -1)) {
      return 'Die Stelle ganz rechts fehlt – das ist der erste Rest deiner Rechnung.';
    }
  }

  // 5. Dezimal → Hex: Reste ab 10 nicht als Buchstaben geschrieben
  if (d.von === 10 && basis === 16 && Number.isFinite(d.n)) {
    const reste = wegDivisionsrest(d.n, 16).zeilen.map((z) => String(z.rest));
    if (istText === [...reste].reverse().join('')) {
      return 'Reste von 10 bis 15 schreibt man im Hexadezimalsystem als Buchstaben: 10 = A, 11 = B, 12 = C, 13 = D, 14 = E, 15 = F. Jeder Rest ist genau eine Hex-Ziffer.';
    }
    if (istText === reste.join('')) {
      return 'Zwei Fehler: Reste ab 10 werden zu Buchstaben (A–F), und die Reste liest man von unten nach oben.';
    }
  }

  // 6. Hex → Dual: Tetraden nicht mit Nullen aufgefüllt
  if (d.von === 16 && basis === 2 && d.text) {
    const ohne = [...d.text].map((h) => zifferWert(h).toString(2)).join('');
    if (istText === ohneFuehrendeNullen(ohne)) {
      return 'Jede Hex-Ziffer wird zu genau vier Bit. Fülle jede Gruppe vorne mit Nullen auf, z. B. 2 = 0010.';
    }
  }

  // 7. Dual → Hex: Vierergruppen von links gebildet
  if (d.von === 2 && basis === 16 && d.text && d.text.length % 4 !== 0) {
    const gruppen = d.text.match(/.{1,4}/g);
    const l1 = gruppen.map((g) => ZIFFERN[parseInt(g, 2)]).join('');
    const l2 = gruppen.map((g) => ZIFFERN[parseInt(g.padEnd(4, '0'), 2)]).join('');
    if (istText === ohneFuehrendeNullen(l1) || istText === ohneFuehrendeNullen(l2)) {
      return 'Du hast die Vierergruppen von links gebildet. Gruppiere immer von rechts (beim kleinsten Stellenwert) und fülle links mit Nullen auf.';
    }
  }

  // 8. Addition
  if (d.op === '+') {
    const x = parseInt(d.a, 2);
    const y = parseInt(d.b, 2);
    const breite = Math.max(d.a.length, d.b.length);
    if (ist === (x ^ y) && (x & y) !== 0) {
      return 'Du hast die Überträge vergessen: 1 + 1 = 10₂ – schreibe 0 und übertrage 1 in die nächste Stelle.';
    }
    if (soll >= 2 ** breite && ist === soll - 2 ** breite) {
      return 'Der letzte Übertrag fehlt: Das Ergebnis kann eine Stelle länger sein als die Summanden.';
    }
    if (ist === x - y || ist === y - x) return 'Hier wird addiert, nicht subtrahiert.';
  }

  // 9. Subtraktion
  if (d.op === '−') {
    const x = parseInt(d.a, 2);
    const y = parseInt(d.b, 2);
    if (ist === (x ^ y) && (~x & y) !== 0) {
      return 'Du hast die Entleihungen vergessen: Bei 0 − 1 entleihst du eine 1 aus der nächsten Stelle (10₂ − 1 = 1) und ziehst sie dort zusätzlich ab. Mach die Probe: Ergebnis + Subtrahend = Minuend.';
    }
    if (ist === x + y) return 'Hier wird subtrahiert, nicht addiert.';
    return genauEineStelleAnders(istText, sollText)
      ? 'Fast! Genau ein Bit ist falsch. Mach die Probe: Ergebnis + Subtrahend muss den Minuenden ergeben.'
      : 'Mach die Probe: Ergebnis + Subtrahend muss den Minuenden ergeben – so findest du den Fehler.';
  }

  // 10. Allgemein
  if (genauEineStelleAnders(istText, sollText)) {
    return basis === 2 ? 'Fast! Genau ein Bit ist falsch. Prüfe deine Rechnung Stelle für Stelle.' : 'Fast! Genau eine Ziffer ist falsch.';
  }
  if (soll > 0 && (ist > soll * 4 || ist * 4 < soll)) {
    return ist > soll ? 'Dein Ergebnis ist viel zu groß. Überschlage zuerst die Größenordnung.' : 'Dein Ergebnis ist viel zu klein. Überschlage zuerst die Größenordnung.';
  }
  return '';
}

/* ------------------------------------------------------------------ */
/* Felder prüfen                                                        */
/* ------------------------------------------------------------------ */

/**
 * Prüft ein einzelnes Feld.
 * status: 'richtig' | 'format' (Wert stimmt, Schreibweise nicht) | 'falsch' | 'ungueltig' | 'leer'
 */
export function pruefeFeld(feld, wert) {
  switch (feld.art) {
    case 'zahl': {
      const r = leseZahl(wert, feld.basis);
      if (!r.ok) return { status: r.leer ? 'leer' : 'ungueltig', meldung: r.meldung };
      if (r.wert === feld.loesung) {
        if (feld.stellen && r.ziffern.length !== feld.stellen) {
          const richtig = auffuellen(nachBasis(feld.loesung, feld.basis), feld.stellen);
          return {
            status: 'format',
            meldung: `Der Wert stimmt! Gefordert sind aber genau ${feld.stellen} Stellen${
              r.ziffern.length < feld.stellen ? ' – ergänze führende Nullen' : ''
            }: ${richtig.length > 4 && feld.basis === 2 ? richtig.replace(/(?=(?:\d{4})+$)/g, ' ').trim() : richtig}${IDX[feld.basis]}.`,
          };
        }
        return { status: 'richtig' };
      }
      return { status: 'falsch', meldung: diagnose(feld, r) };
    }
    case 'wahl':
    case 'liste': {
      if (wert === null || wert === undefined || wert === '') return { status: 'leer', meldung: 'Bitte wähle eine Antwort.' };
      const i = Number(wert);
      if (i === feld.loesung) return { status: 'richtig', meldung: feld.optionen[i]?.hinweis || '' };
      return { status: 'falsch', meldung: feld.optionen[i]?.hinweis || '' };
    }
    case 'mehrfach':
    case 'bits': {
      const gewaehlt = new Set((wert || []).map(Number));
      const soll = new Set(feld.loesung);
      if (gewaehlt.size === 0 && feld.loesung.length > 0) {
        return { status: 'leer', meldung: feld.art === 'bits' ? 'Bitte tippe die passenden Schalter an.' : 'Bitte wähle mindestens eine Antwort.' };
      }
      let fehlend = 0;
      let zuviel = 0;
      soll.forEach((x) => { if (!gewaehlt.has(x)) fehlend++; });
      gewaehlt.forEach((x) => { if (!soll.has(x)) zuviel++; });
      if (!fehlend && !zuviel) return { status: 'richtig' };
      const teile = [];
      if (zuviel) teile.push(zuviel === 1 ? 'eine Auswahl ist zu viel' : `${zuviel} Auswahlen sind zu viel`);
      if (fehlend) teile.push(fehlend === 1 ? 'eine fehlt noch' : `${fehlend} fehlen noch`);
      const satz = teile.join(', ');
      return { status: 'falsch', meldung: satz.charAt(0).toUpperCase() + satz.slice(1) + '.' };
    }
    default:
      return { status: 'ungueltig', meldung: 'Unbekannte Feldart.' };
  }
}

/* ------------------------------------------------------------------ */
/* Regeln für offene Aufgaben (K6: mehrere richtige Lösungen)           */
/* ------------------------------------------------------------------ */

function bin(feld, wert) {
  const r = leseZahl(wert, 2);
  return r;
}

export const REGELN = {
  /** Zwei n-Bit-Summanden mit vorgegebener Summe und Übertrag in jeder Stelle. */
  summeUebertraege(aufgabe, antworten) {
    const { summe, bits } = aufgabe.regel;
    const [f1, f2] = aufgabe.felder;
    const a = bin(f1, antworten[f1.id]);
    const b = bin(f2, antworten[f2.id]);
    const erg = {};
    for (const [f, r] of [[f1, a], [f2, b]]) {
      if (!r.ok) erg[f.id] = { status: r.leer ? 'leer' : 'ungueltig', meldung: r.meldung };
      else if (ohneFuehrendeNullen(r.ziffern).length > bits) erg[f.id] = { status: 'falsch', meldung: `Jeder Summand darf höchstens ${bits} Bit haben.` };
    }
    if (Object.keys(erg).length) return fehlendeErgaenzen(aufgabe, erg);
    const s = a.wert + b.wert;
    const ue = wegAddition(auffuellen(nachBasis(a.wert, 2), bits), auffuellen(nachBasis(b.wert, 2), bits));
    const ueberall = ue.spalten.every((c) => c.aus === 1);
    if (s !== summe) {
      return beide(aufgabe, 'falsch', `Die Summe ist ${nachBasis(s, 2)}₂ (= ${s}), verlangt ist ${nachBasis(summe, 2)}₂ (= ${summe}).`);
    }
    if (!ueberall) {
      const ohne = ue.spalten.filter((c) => !c.aus).map((c) => `2${'⁰¹²³⁴⁵⁶⁷'[c.pos]}`);
      return beide(aufgabe, 'falsch', `Die Summe stimmt, aber in ${ohne.length === 1 ? 'der Stelle' : 'den Stellen'} ${ohne.join(', ')} entsteht kein Übertrag.`);
    }
    return beide(aufgabe, 'richtig', 'Summe und Überträge stimmen – eine gültige Lösung!');
  },

  /** Subtraktion zweier n-Bit-Zahlen mit genau k Entleihungen. */
  subtraktionEntleihungen(aufgabe, antworten) {
    const { bits, entleihungen } = aufgabe.regel;
    const [fm, fs, fd] = aufgabe.felder;
    const m = bin(fm, antworten[fm.id]);
    const s = bin(fs, antworten[fs.id]);
    const dd = bin(fd, antworten[fd.id]);
    const erg = {};
    for (const [f, r] of [[fm, m], [fs, s], [fd, dd]]) {
      if (!r.ok) erg[f.id] = { status: r.leer ? 'leer' : 'ungueltig', meldung: r.meldung };
    }
    if (Object.keys(erg).length) return fehlendeErgaenzen(aufgabe, erg);
    const aus = {};
    if (ohneFuehrendeNullen(m.ziffern).length !== bits) {
      aus[fm.id] = { status: 'falsch', meldung: `Der Minuend soll eine ${bits}-Bit-Zahl sein (vorderstes Bit 1, also ${2 ** (bits - 1)} bis ${2 ** bits - 1}).` };
    }
    if (ohneFuehrendeNullen(s.ziffern).length > bits) {
      aus[fs.id] = { status: 'falsch', meldung: `Der Subtrahend darf höchstens ${bits} Bit haben.` };
    } else if (s.wert >= m.wert) {
      aus[fs.id] = { status: 'falsch', meldung: 'Der Subtrahend muss kleiner als der Minuend sein.' };
    }
    if (Object.keys(aus).length) {
      if (!aus[fm.id]) aus[fm.id] = { status: 'richtig', meldung: '' };
      if (!aus[fs.id]) aus[fs.id] = { status: 'richtig', meldung: '' };
      aus[fd.id] = m.wert >= s.wert && dd.wert === m.wert - s.wert
        ? { status: 'richtig', meldung: 'Die Differenz ist richtig gerechnet.' }
        : { status: 'falsch', meldung: '' };
      return aus;
    }
    const weg = wegSubtraktion(auffuellen(nachBasis(m.wert, 2), bits), auffuellen(nachBasis(s.wert, 2), bits));
    if (weg.entleihungen !== entleihungen) {
      const t = `Bei deiner Aufgabe wird ${weg.entleihungen === 0 ? 'gar nicht' : weg.entleihungen === 1 ? 'nur einmal' : weg.entleihungen + '-mal'} entliehen – verlangt ist genau ${entleihungen === 1 ? 'einmal' : entleihungen === 2 ? 'zweimal' : entleihungen + '-mal'}.`;
      return {
        [fm.id]: { status: 'falsch', meldung: t },
        [fs.id]: { status: 'falsch', meldung: '' },
        [fd.id]: dd.wert === m.wert - s.wert ? { status: 'richtig', meldung: 'Die Differenz ist richtig gerechnet.' } : { status: 'falsch', meldung: 'Auch die Differenz stimmt nicht.' },
      };
    }
    if (dd.wert !== m.wert - s.wert) {
      return {
        [fm.id]: { status: 'richtig', meldung: '' },
        [fs.id]: { status: 'richtig', meldung: `Gute Aufgabe – genau ${entleihungen}-mal entliehen.` },
        [fd.id]: { status: 'falsch', meldung: 'Die Differenz ist falsch gerechnet. Mach die Probe: Differenz + Subtrahend = Minuend.' },
      };
    }
    return beide(aufgabe, 'richtig', `Eine gültige Aufgabe mit genau ${entleihungen} Entleihungen – und richtig gerechnet!`);
  },

  /** n-Bit-Zahl mit vorgegebener Anzahl Einsen, größer als eine Grenze, dazu die Hex-Darstellung. */
  bitmuster(aufgabe, antworten) {
    const { bits, einsen: k, groesserAls } = aufgabe.regel;
    const [fb, fh] = aufgabe.felder;
    const b = leseZahl(antworten[fb.id], 2);
    const h = leseZahl(antworten[fh.id], 16);
    const erg = {};
    if (!b.ok) erg[fb.id] = { status: b.leer ? 'leer' : 'ungueltig', meldung: b.meldung };
    if (!h.ok) erg[fh.id] = { status: h.leer ? 'leer' : 'ungueltig', meldung: h.meldung };
    if (Object.keys(erg).length) return fehlendeErgaenzen(aufgabe, erg);
    const aus = {};
    const probleme = [];
    if (b.ziffern.length !== bits && ohneFuehrendeNullen(b.ziffern).length <= bits) probleme.push(`Schreibe die Zahl mit genau ${bits} Bit.`);
    if (ohneFuehrendeNullen(b.ziffern).length > bits) probleme.push(`Die Zahl hat mehr als ${bits} Bit.`);
    if (einsen(b.wert) !== k) probleme.push(`Deine Zahl hat ${einsen(b.wert)} Einsen – verlangt sind genau ${k}.`);
    if (!(b.wert > groesserAls)) probleme.push(`${nachBasis(b.wert, 2)}₂ = ${b.wert} ist nicht größer als ${groesserAls}.`);
    aus[fb.id] = probleme.length ? { status: 'falsch', meldung: probleme.join(' ') } : { status: 'richtig', meldung: `${b.wert}₁₀ – passt!` };
    aus[fh.id] = h.wert === b.wert
      ? { status: 'richtig', meldung: '' }
      : { status: 'falsch', meldung: `Die Hex-Zahl passt nicht zu deiner Dualzahl (${nachBasis(b.wert, 16)}₁₆ wäre richtig).` };
    return aus;
  },
};

function beide(aufgabe, status, meldung) {
  const erg = {};
  aufgabe.felder.forEach((f, i) => {
    erg[f.id] = { status, meldung: i === aufgabe.felder.length - 1 ? meldung : '' };
  });
  return erg;
}

function fehlendeErgaenzen(aufgabe, erg, rest = 'offen') {
  aufgabe.felder.forEach((f) => {
    if (!erg[f.id]) erg[f.id] = { status: rest, meldung: '' };
  });
  return erg;
}

/* ------------------------------------------------------------------ */
/* Ganze Aufgabe prüfen und bewerten                                    */
/* ------------------------------------------------------------------ */

function rundeHalb(x) {
  return Math.round(x * 2) / 2;
}

/**
 * antworten: { [feldId]: wert }
 * modus 'ueben': ungültige oder fehlende Eingaben zählen nicht als Versuch.
 * modus 'pruefung': leere Felder ergeben 0 Punkte.
 * Ergebnis: { status, felder: {id: {status, meldung}}, punkte, max, zaehlt }
 */
export function pruefeAufgabe(aufgabe, antworten, modus = 'ueben') {
  let felder;
  if (aufgabe.regel) {
    felder = REGELN[aufgabe.regel.name](aufgabe, antworten);
  } else {
    felder = {};
    for (const f of aufgabe.felder) felder[f.id] = pruefeFeld(f, antworten[f.id]);
  }
  const liste = aufgabe.felder.map((f) => felder[f.id]);
  const max = aufgabe.punkte;
  const ungueltig = liste.some((r) => r.status === 'ungueltig');
  const leer = liste.filter((r) => r.status === 'leer').length;

  if (modus === 'ueben') {
    if (ungueltig) return { status: 'ungueltig', felder, punkte: 0, max, zaehlt: false };
    if (leer === liste.length) return { status: 'leer', felder, punkte: 0, max, zaehlt: false };
    if (leer > 0) return { status: 'unvollstaendig', felder, punkte: 0, max, zaehlt: false };
  }

  const anteil = 1 / liste.length;
  let summe = 0;
  for (const r of liste) {
    if (r.status === 'richtig') summe += anteil;
    else if (r.status === 'format') summe += anteil / 2;
  }
  const punkte = rundeHalb(summe * max);
  const alleRichtig = liste.every((r) => r.status === 'richtig');
  const etwas = liste.some((r) => r.status === 'richtig' || r.status === 'format');
  const status = alleRichtig ? 'richtig' : etwas ? 'teilweise' : 'falsch';
  return { status, felder, punkte, max, zaehlt: true };
}

/** Kurzform der Lösung eines Feldes als Text (für Lösungsschlüssel und Lehrermodus). */
export function feldLoesungText(feld) {
  switch (feld.art) {
    case 'zahl': {
      let s = nachBasis(feld.loesung, feld.basis);
      if (feld.stellen) s = auffuellen(s, feld.stellen);
      if (feld.basis === 2 && s.length > 4) s = s.replace(/(?=(?:[01]{4})+$)/g, ' ').trim();
      return s + IDX[feld.basis];
    }
    case 'wahl':
    case 'liste':
      return feld.optionen[feld.loesung].text;
    case 'mehrfach':
      return feld.loesung.map((i) => feld.optionen[i].text).join(', ');
    case 'bits':
      return feld.loesung.slice().sort((a, b) => b - a).map((i) => feld.beschriftung(i)).join(', ');
    default:
      return '';
  }
}

/** Musterantworten einer Aufgabe (für Tests und den Lehrermodus „Lösung eintragen“). */
export function musterAntworten(aufgabe) {
  const a = {};
  for (const f of aufgabe.felder) {
    if (f.art === 'zahl') {
      let s = nachBasis(f.loesung, f.basis);
      if (f.stellen) s = auffuellen(s, f.stellen);
      a[f.id] = s;
    } else if (f.art === 'mehrfach' || f.art === 'bits') {
      a[f.id] = f.loesung.slice();
    } else {
      a[f.id] = f.loesung;
    }
  }
  return a;
}
