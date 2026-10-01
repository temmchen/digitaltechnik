// felder.js – Bausteine für Antwortfelder (gelten für alle Themen)

/** Zahlenfeld: Eingabe einer Zahl im System `basis` (2, 10 oder 16). */
export function zahlFeld(basis, loesung, { vor = '', nach = '', stellen = 0, diag = null, label = '' } = {}) {
  return { art: 'zahl', basis, loesung, vor, nach, stellen, diag, label };
}

/** Einfachauswahl. optionen: [[text, hinweis?], …] – richtig ist der Index. */
export function wahlFeld(optionen, richtig, { vor = '' } = {}) {
  return {
    art: 'wahl', loesung: richtig, vor,
    optionen: optionen.map((o) => (Array.isArray(o) ? { text: o[0], hinweis: o[1] || '' } : { text: o, hinweis: '' })),
  };
}

/** Auswahlliste (Dropdown), z. B. <, =, >. */
export function listeFeld(optionen, richtig, { vor = '', nach = '' } = {}) {
  return { art: 'liste', loesung: richtig, vor, nach, optionen: optionen.map((t) => ({ text: t, hinweis: '' })) };
}

/** Mehrfachauswahl: richtig = Liste der Indizes. */
export function mehrfachFeld(optionen, richtig, { vor = '' } = {}) {
  return { art: 'mehrfach', loesung: richtig, vor, optionen: optionen.map((t) => ({ text: t, hinweis: '' })) };
}

/**
 * Schalterleiste (DIP-Schalter, SPS-Eingänge). richtig = Liste der Bitnummern (0 = Bit mit Wert 1).
 * stil 'dip': Schalter 1 links (wie am Gerät); stil 'sps': Bit 7 links (wie beim Schreiben).
 */
export function bitsFeld(anzahl, richtig, beschriftung, { vor = '', stil = 'dip' } = {}) {
  return { art: 'bits', anzahl, loesung: richtig, beschriftung, vor, stil };
}

/** Felder durchnummerieren (f1, f2, …). */
export function nummeriere(felder) {
  return felder.map((f, i) => ({ id: `f${i + 1}`, ...f }));
}
