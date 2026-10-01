// lehrer.js – Lehrerzugang: Passwort prüfen (PBKDF2 + AES-GCM), Anmeldestatus, Einstellungen
//
// Das Passwort steht NICHT in diesem Repository. Hier liegt nur ein Tresor (js/tresor.js),
// den man mit dem richtigen Passwort entschlüsseln kann. Erzeugt wird er im privaten
// Repository „digitaltechnik-lehrer“ mit passwort-setzen.py.

import { TRESOR } from '../tresor.js';
import { lies, schreibe, entferne } from './speicher.js';

const SCHLUESSEL = 'lehrer';
let zustand = null; // entschlüsselter Inhalt oder null

function b64(s) {
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}

/** Gleiche Regel wie in passwort-setzen.py: Leerraum am Rand weg, Kleinbuchstaben. */
export function normalisiere(passwort) {
  return String(passwort).normalize('NFC').trim().toLowerCase();
}

export function tresorVorhanden() {
  return !!(TRESOR && TRESOR.ct);
}

/** Entschlüsselt den Tresor. Liefert den Inhalt oder null bei falschem Passwort. */
export async function entsperre(passwort) {
  if (!globalThis.crypto || !crypto.subtle) {
    throw new Error('Der Lehrerzugang braucht eine sichere Verbindung (https).');
  }
  const kodiert = new TextEncoder().encode(normalisiere(passwort));
  const basis = await crypto.subtle.importKey('raw', kodiert, 'PBKDF2', false, ['deriveKey']);
  const schluessel = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64(TRESOR.salt), iterations: TRESOR.iter, hash: 'SHA-256' },
    basis,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
  try {
    const klar = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(TRESOR.iv) }, schluessel, b64(TRESOR.ct));
    return JSON.parse(new TextDecoder().decode(klar));
  } catch {
    return null;
  }
}

export async function anmelden(passwort, angemeldetBleiben = false) {
  const inhalt = await entsperre(passwort);
  if (!inhalt || inhalt.rolle !== 'lehrer') return false;
  zustand = inhalt;
  schreibe(SCHLUESSEL, inhalt, 'sitzung');
  if (angemeldetBleiben) schreibe(SCHLUESSEL, inhalt, 'lokal');
  return true;
}

export function abmelden() {
  zustand = null;
  entferne(SCHLUESSEL, 'sitzung');
  entferne(SCHLUESSEL, 'lokal');
}

export function istLehrer() {
  if (zustand) return true;
  const gespeichert = lies(SCHLUESSEL, null, 'sitzung') || lies(SCHLUESSEL, null, 'lokal');
  // Ein gespeicherter Inhalt gilt nur, wenn er zum aktuellen Tresor gehört (neues Passwort → abgemeldet)
  if (gespeichert && gespeichert.rolle === 'lehrer' && gespeichert.tresor === TRESOR.kennung) {
    zustand = gespeichert;
    return true;
  }
  return false;
}

export function lehrerInhalt() {
  return istLehrer() ? zustand : null;
}

/** Einstellung „Lösungen in den Übungen sofort zeigen“ (nur wirksam, wenn angemeldet). */
export function loesungenDirekt() {
  return istLehrer() && lies('lehrer-loesungen', true) !== false;
}

export function setzeLoesungenDirekt(an) {
  schreibe('lehrer-loesungen', !!an);
}
