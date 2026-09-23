# Läufersystem lernen

Eine Website, auf der man das Volleyball-Läufersystem visuell nachvollziehen kann:
Wo stehe ich beim Aufschlag, und wohin laufe ich danach?

## Was drin ist

- Spielfeldhälfte von oben mit den sechs Zonen und der 3-Meter-Linie
- Alle sechs Rotationen durchschaltbar (im Uhrzeigersinn, wie im Spiel)
- Umschalter **Aufstellung** ↔ **Nach dem Aufschlag** mit eingezeichneten Laufwegen
- Einzelne Spieler antippen, um nur deren Weg zu sehen
- Aufstellung im **5-1-System** (ein Zuspieler)

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:3000
npm run type-check
npm run build
```

## Nächste Schritte

- Stellungsfehler (Übergreifen) anzeigen und erklären
- Weitere Systeme: 4-2 und 6-2
- Annahmeriegel (wer nimmt an) getrennt von der Angriffsposition
- Libero
- Kurze Erklärtexte je Rotation
