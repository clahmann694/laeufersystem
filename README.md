# Läufersystem lernen · VSG Kleinsteinbach

Eine Website, auf der man das Volleyball-Läufersystem (5-1) visuell nachvollziehen kann:
Wo stehe ich beim gegnerischen Aufschlag, und wer nimmt an?

## Was drin ist

- Spielfeldhälfte von oben mit den sechs Zonen, 3-Meter-Linie und Wechselzone
- Alle sechs Rotationen durchschaltbar (im Uhrzeigersinn, wie im Spiel), benannt als Läufer I–VI
  nach der Zone der Zuspielerin – wie in den Trainingsdiagrammen des Vereins
- Design in den Vereinsfarben der VSG Kleinsteinbach (Cyan auf Marineblau)
- Drei Phasen:
  1. **Grundaufstellung** – alle in ihrer Rotationszone, die Libera schon für die hintere Mitte
  2. **Annahmeriegel** – 3er-Annahme (A1, A2, L), Rest stellungsregelkonform versteckt; die
     Spielerinnen gleiten dorthin
  3. **Erklärung** – orange Linien wie in den Vereinsdiagrammen zeigen die Stellungsregel-Paare,
     die diese Aufstellung erzwingen; rechts steht zu jeder Linie ein Satz
- **▶ Ablauf** gleitet automatisch von der Grundaufstellung in den Annahmeriegel
- **Meine Position**: eigene Figur wählen (Z, A1, A2, M1, M2, D, L) → Trainer aus dieser Sicht:
  eigene Zone je Rotation, was man tut (annehmen / verstecken / Bank), nur die eigenen Linien
- Einzelne Spielerinnen antippen, um nur deren Weg zu sehen
- Ein Kapitel pro Ansicht (Hash-Routing): Startseite mit drei Kacheln, dann `#/grundlagen`,
  `#/trainer`, `#/regeln`; Stände im Trainer verlinkbar: `?r=3&p=annahme#/trainer`
  (Phasen: `grund`, `annahme`, `erklaerung`)
- **Grundlagen** vor dem Trainer: acht Regeln als Schritte (eine pro Schritt, große Skizze,
  Weiter/Zurück, Pfeiltasten) – Zonen & Rotation, Aufschlagkontakt, Links-rechts-Reihenfolge,
  Paare 4+5/3+6/2+1, Füße, Vorder-/Hinterfeld, 5-1, warum Z läuft
- Schmale, mitlaufende Kapitel-Navigation; auf dem Handy bleibt im Trainer die
  Rotationswahl beim Scrollen oben
- Legende (Z = Zuspiel, A1 = Außen 1, …) direkt unter den Grundregeln; Regelbasis mit Quellen
  (FIVB 2025–2028, volleyballer.de)
- Vereinswappen und drei Maskottchen in `public/`

## Inhalte selbst bearbeiten

Alle Texte, Positionen und Linien liegen in `src/data/content.json`. Die Seite hat einen
Bearbeitungsmodus – aufrufbar über `?edit=1` (vor dem `#`, z. B. `/?edit=1#/trainer`) (oder das kleine ✎ im Footer):

- **Texte**: anklicken und direkt tippen (Hero, Grundregel-Karten, Phasentexte, Rollen, Regelhinweis …).
  In Regeltexten macht `**so**` den Text fett.
- **Positionen**: im Trainer in den Phasen „Annahmeriegel" und „Erklärung" die Figuren mit der Maus ziehen.
- **Linien**: in der Phase „Erklärung" pro Linie wer/links-von-oder-vor/wen wählen, Satz eintippen,
  Linien hinzufügen, löschen oder nach oben schieben.
- Der Entwurf bleibt im Browser gespeichert (LocalStorage), auch nach dem Neuladen.
- **Speichern**: „content.json exportieren" lädt die Datei herunter → nach `src/data/content.json`
  kopieren, `npm run build`, deployen. Danach „Verwerfen" oder Browserdaten löschen, damit der
  alte Entwurf nicht die neue Datei überdeckt.

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:3000
npm run type-check
npm run build
```

## Nächste Schritte

- Bewegungsabläufe nach dem Aufschlag (Z ans Netz, Angriff) und Abwehrordnung
- Stellungsfehler (Übergreifen) anzeigen und erklären
- Weitere Systeme: 4-2 und 6-2
- Kurze Erklärtexte je Rotation
