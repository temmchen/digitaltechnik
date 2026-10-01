# Digitaltechnik · Kompendium DP1ET

**Lern- und Übungsseite für die Grundlagen der Digitaltechnik** – Klasse DP1ET, Modul DITEC1
(Lycée Technique d’Ettelbruck). Die Seite wächst im Laufe des Semesters zu einem Kompendium:
Jedes Thema bringt Lektionen, Aufgaben und eine Merkhilfe mit.

👉 **https://temmchen.github.io/digitaltechnik/**

<img src="qr-code.png" alt="QR-Code zur Webseite" width="180">

`qr-code.png` / `qr-code.svg` = derselbe QR-Code wie auf der Seite (Taste **Q**), zum Ausdrucken oder für Folien.

## Thema 1 – Zahlensysteme und Dualarithmetik

Umwandeln zwischen **Dezimal-, Dual- und Hexadezimalsystem** in allen Richtungen, Jonglieren
zwischen den Systemen, **Addition** und **Subtraktion** von Dualzahlen. Nur positive ganze Zahlen.

| Lektion | Inhalt | Aufgaben |
| --- | --- | --- |
| 1 Stellenwertsysteme | Basis, Ziffern, Stellenwert, Bit/Nibble/Byte, MSB/LSB, Wertebereich, Zähl-Maschine | A1–A10 |
| 2 Dual → Dezimal | Stellenwertmethode, Bit-Labor, Verdopplungsmethode | B1–B12 |
| 3 Dezimal → Dual | Divisionsrestverfahren, Zweierpotenzen-Methode, feste Bitbreite, Probe | C1–C12 |
| 4 Hexadezimal → Dezimal | Ziffern A–F, Sechzehnerpotenzen, Schreibweisen (0x, h, 16#) | D1–D10 |
| 5 Dezimal → Hexadezimal | Divisionsrest mit 16, Rest mit dem Taschenrechner, Umweg über dual | E1–E10 |
| 6 Hexadezimal ↔ Dual | Tetraden (8-4-2-1), Tetraden-Brücke, SPS-Eingangsbyte | F1–F12 |
| 7 Addition | Regeln, schriftliches Verfahren, Überlauf, Volladdierer | G1–G12 |
| 8 Subtraktion | Entleihung, schriftliches Verfahren, Probe durch Addition | H1–H12 |
| 9 Jonglieren | Umwandlungsdreieck, geschicktester Weg, DIP-Schalter, SPS, Farbcodes, Prüfungsstrategie | I1–I10 |

Jede Lektion hat Lernziele mit Taxonomiestufe, Merkkästen, Musterbeispiele, typische Fehler
und interaktive Werkzeuge (Zähl-Maschine, Bit-Labor, Divisionsrest-Maschine, Stellenwerttafel,
Tetraden-Brücke, Rechenwerk für Addition und Subtraktion – jeweils Schritt für Schritt).
Die Zahlensysteme haben feste Farben (Dezimal blau, Dual grün, Hexadezimal orange), immer
zusammen mit dem Index.

### 100 Aufgaben auf drei Taxonomiestufen

Wie in den ELTEC-/MINT-Skripten und in den Prüfungen: **• leicht**, **•• mittel**, **••• schwer**
(Anforderungsbereiche I–III, Farben grün/orange/rot). Zusätzlich trägt jede Aufgabe ihren
**Denkprozess** nach Bloom (überarbeitet von Anderson & Krathwohl). Der **Operator** steht fett im
Aufgabentext. Bewusst ohne „K1 … K6“, weil K-Nummern die Kompetenzen eines Moduls bezeichnen.

| Taxonomiestufe | Denkprozesse | Operatoren | Aufgaben |
| --- | --- | --- | ---: |
| • leicht – Wissen und Verstehen (AFB I) | Erinnern 10, Verstehen 10 | nennen, angeben, erklären, zuordnen | 20 |
| •• mittel – Anwenden (AFB II) | Anwenden 58 | umwandeln, berechnen, addieren, subtrahieren | 58 |
| ••• schwer – Analysieren, Bewerten, Transfer (AFB III) | Analysieren 12, Bewerten 7, Erschaffen 3 | untersuchen, bestimmen, beurteilen, konstruieren | 22 |

- **Erst die eigene Antwort, dann die Lösung:** Die Lösung mit Rechenweg wird erst freigeschaltet,
  wenn eine gültige Antwort geprüft wurde. Ungültige Eingaben (z. B. eine 2 im Dualsystem) zählen
  nicht als Versuch.
- **Rückmeldung zu typischen Fehlern**, z. B. Reste falsch herum gelesen, letzter Rest vergessen,
  Stellenwerte von links vergeben, mit Zehnerpotenzen gerechnet, Reste 10–15 nicht als A–F
  geschrieben, Tetraden von links gebildet, Überträge oder Entleihungen vergessen.
- **Neue Zahlen:** Jede Rechenaufgabe lässt sich mit neuen Zahlen gleicher Art und Schwierigkeit
  beliebig oft üben.
- **Lernstand** mit Aufgabenraster und Fortschritt je Taxonomiestufe – nur in diesem Browser gespeichert.

### Prüfungstraining

Kurztest (8 Aufgaben), Prüfung (14 Aufgaben, 45 min: 5 leicht, 7 mittel, 2 schwer – nach Punkten etwa 25 / 50 / 25 %) oder große
Prüfung (22 Aufgaben) nach festem Taxonomie-Plan, wahlweise mit neuen Zahlen und Zeitanzeige. Keine Rückmeldung bis zur Abgabe;
danach Punkte, Prozent, 60er-Skala, Auswertung je Stufe und jede Aufgabe mit Lösung.

### Lehrerbereich (mit Passwort)

- Lösungen in „Üben“ sofort sichtbar, „Musterlösung eintragen“ zum Vorführen am Beamer
- **Prüfung erstellen:** Aufgaben je Taxonomiestufe (leicht/mittel/schwer, Denkprozesse gemischt) und Kapitel, neue Zahlen per Startwert,
  Gruppe B (andere Zahlen, gemischte Antworten), Aufgaben einzeln ersetzen, druckfertiges
  **Aufgabenblatt** (Antwortkästchen, Raster für den Rechenweg, schriftliche Rechnungen) und
  **Lösungsblatt** mit Rechenwegen und Taxonomie-Übersicht (A4, „Als PDF sichern“)
- **Lösungsschlüssel** aller Aufgaben mit Taxonomie-Matrix
- **Didaktische Hinweise** (verschlüsselt)

Das Passwort steht **nicht** in diesem Repository. Hier liegt nur `js/tresor.js` mit verschlüsselten
Daten (PBKDF2-SHA256 mit 600 000 Iterationen, AES-256-GCM); der Browser entschlüsselt sie mit dem
richtigen Passwort. Passwort und Werkzeuge liegen im privaten Repository `temmchen/digitaltechnik-lehrer`.
Hinweis: Eine statische Webseite kann Lösungen nicht absolut verbergen – das Passwort schützt den
Lehrerbereich vor dem normalen Zugriff.

## Im Unterricht

- **QR-Code** bildschirmfüllend: Knopf oben rechts oder Taste **Q**
- **Schriftgröße** für den Beamer: Knopf **Aa** (normal → groß → Beamer) oder Adresse mit `?beamer=1`
- **Hell/Dunkel** per Knopf (ohne Wahl wie das System)
- Direkte Adressen, z. B. `#/lernen/zahlensysteme/3`, `#/ueben/zahlensysteme?kap=C&k=3`,
  `#/ueben/zahlensysteme/37`, `#/pruefung`, `#/merkhilfe/zahlensysteme`, `#/lehrer`
- Auf dem Handy: Safari → Teilen → „Zum Home-Bildschirm“

## Technik

Reine ES-Module ohne Build und ohne Abhängigkeiten, keine externen Schriften oder Dienste.

| Pfad | Aufgabe |
| --- | --- |
| `js/kern/` | Rechnen und Rechenwege (`zahlen.js`, `darstellung.js`), Antworten prüfen und Fehlerdiagnose (`pruefen.js`), Taxonomie, Feldbausteine, Varianten, Prüfungsplan, Lernstand, Lehrerzugang |
| `js/themen/` | die Themen des Kompendiums; `index.js` ist das Register |
| `js/themen/zahlensysteme/` | Thema 1: `thema.js`, `aufgaben.js` (100 Aufgaben), `typen.js` (Umwandlung, Addition, Subtraktion mit Generator), `lektionen.js`, `widgets.js` |
| `js/ui/` | Aufgabenkarte, Druckblätter, Drucken, Werkzeuge einsetzen |
| `js/ansichten/` | Start, Lernen, Üben, Prüfung, Lehrer, Merkhilfe |
| `js/app.js` | Navigation, Router, Hell/Dunkel, Schriftgröße, QR-Code |
| `js/tresor.js` | verschlüsselter Lehrerzugang (wird im privaten Repo erzeugt) |
| `css/app.css` | Erscheinungsbild, Dunkelmodus, Druck (A4) |

Tests (JavaScriptCore, auf jedem Mac vorhanden):

```bash
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc -m tests/run.mjs
```

Sie prüfen alle Umwandlungen und Rechenwege (u. a. alle Additionen und Subtraktionen bis 255),
die Fehlerdiagnosen, jede der 100 Musterlösungen, alle Lösungen der offenen Aufgaben (Erschaffen), die Varianten,
die Prüfungszusammenstellung und das HTML aller Lektionen.

Lokal ansehen (ES-Module brauchen einen Webserver):

```bash
python3 -m http.server 8000
```

## Neues Thema hinzufügen

1. Ordner `js/themen/<id>/` anlegen, z. B. `logikgatter`.
2. `thema.js` nach dem Vorbild von `zahlensysteme/thema.js`: `id`, `kuerzel` (Präfix der
   Aufgabenschlüssel, z. B. `LG` → `LG-12`), `symbol`, `titel`, `kurz`, `beschreibung`, `stand`,
   `kapitel` (A, B, … mit `lektion`), `lektionen`, `aufgaben`, `merkhilfe()`, optional `widgets`.
3. Aufgaben mit den Bausteinen aus `js/kern/felder.js` (`zahlFeld`, `wahlFeld`, `listeFeld`,
   `mehrfachFeld`, `bitsFeld`) schreiben. Jede Aufgabe braucht `kap`, `k` (Denkprozess 1–6: Erinnern,
   Verstehen → leicht; Anwenden → mittel; Analysieren, Bewerten, Erschaffen → schwer), `niveau` (1–3,
   Platz für den Rechenweg), `punkte`, `titel`, `frage` (Operator fett), `felder`, `tipp`, `loesung`.
   Rechenaufgaben können mit `erzeugeVariante(r)` neue Zahlen liefern; offene Aufgaben mit mehreren
   richtigen Lösungen prüft eine Regel in `REGELN` (`js/kern/pruefen.js`).
4. Thema in `js/themen/index.js` in die Liste `THEMEN` eintragen.
5. Tests laufen lassen (`inhalt.test.mjs` prüft jedes Thema automatisch) und README ergänzen.

Start, Lernen, Üben, Prüfungstraining, Prüfungsgenerator, Lösungsschlüssel und Taxonomie-Matrix
übernehmen das neue Thema ohne weitere Änderung.

## Datenschutz

Keine Anmeldung für Schülerinnen und Schüler, keine Cookies, keine Statistik, keine externen
Ressourcen. Der Lernstand liegt nur im Browser (`localStorage`, Namensraum `digitaltechnik.`).

---

## Section française

**Compendium d’électronique numérique pour la classe DP1ET (module DITEC1, LTEtt).**
Premier thème : les systèmes de numération décimal, binaire et hexadécimal – conversions dans tous
les sens, addition et soustraction binaires (nombres entiers positifs uniquement).

- 9 leçons avec objectifs, encadrés « à retenir », exemples résolus et outils interactifs
- 100 exercices répartis sur trois niveaux taxonomiques (facile • / moyen •• / difficile •••, avec le
  processus cognitif de Bloom révisée) ;
  la solution détaillée n’apparaît qu’après une première réponse ; les erreurs typiques sont
  reconnues et expliquées ; « nouveaux nombres » pour s’entraîner sans fin
- Entraînement à l’examen avec barème et évaluation par niveau taxonomique
- Espace enseignant protégé par mot de passe (le mot de passe ne se trouve pas dans ce dépôt) :
  solutions immédiates, générateur d’épreuves (groupes A/B, feuilles d’énoncé et de corrigé A4),
  corrigé complet avec matrice taxonomique

Interface en allemand. Code source sous licence MIT.

## Lizenz

MIT – © 2026 Tom Bleyer
