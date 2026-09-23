/**
 * Modell des Läufersystems (5-1: ein Zuspieler).
 *
 * Zonen auf dem eigenen Feld, Blick zum Netz (Netz oben):
 *
 *        Netz
 *   4  |  3  |  2      vorne  (Angriffszone, bis 3-Meter-Linie)
 *   ---+-----+---
 *   5  |  6  |  1      hinten
 *
 * Gedreht wird im Uhrzeigersinn: 1 → 6 → 5 → 4 → 3 → 2 → 1.
 * Wer in Zone 1 steht, hat Aufschlag.
 */

export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

export type Role = 'zuspieler' | 'mittelblocker' | 'aussen' | 'diagonal';

export interface Player {
  id: string;
  /** Kürzel auf dem Trikot-Kreis */
  short: string;
  name: string;
  role: Role;
  /** Zone in Rotation 1 – daraus ergibt sich alles Weitere */
  startZone: Zone;
}

export interface Point {
  x: number;
  y: number;
}

/** Reihenfolge, in der gedreht wird */
const ROTATION_CYCLE: Zone[] = [1, 6, 5, 4, 3, 2];

/** Mittelpunkt jeder Zone im Koordinatensystem des Spielfelds (900 × 900 = 9 × 9 m) */
export const ZONE_CENTER: Record<Zone, Point> = {
  4: { x: 150, y: 150 },
  3: { x: 450, y: 150 },
  2: { x: 750, y: 150 },
  5: { x: 150, y: 640 },
  6: { x: 450, y: 640 },
  1: { x: 750, y: 640 },
};

/** Vorne = Angriffszone (Zonen 2, 3, 4); nur von dort darf über dem Netz angegriffen werden */
export function isFrontRow(zone: Zone): boolean {
  return zone === 2 || zone === 3 || zone === 4;
}

/** Wo steht dieser Spieler in der angegebenen Rotation? (rotation 1…6) */
export function zoneOf(player: Player, rotation: number): Zone {
  const start = ROTATION_CYCLE.indexOf(player.startZone);
  return ROTATION_CYCLE[(start + rotation - 1) % ROTATION_CYCLE.length];
}

/**
 * Wohin läuft der Spieler nach dem Aufschlag?
 * Der Zuspieler läuft immer ans Netz rechts der Mitte – das ist der Kern
 * des Läufersystems. Alle anderen gehen auf ihre Angriffs- bzw.
 * Abwehrposition, je nachdem ob sie vorne oder hinten stehen.
 */
export function targetOf(player: Player, zone: Zone): Point {
  const front = isFrontRow(zone);
  switch (player.role) {
    case 'zuspieler':
      return { x: 650, y: 170 };
    case 'mittelblocker':
      return front ? { x: 450, y: 110 } : { x: 450, y: 730 };
    case 'aussen':
      return front ? { x: 140, y: 110 } : { x: 170, y: 650 };
    case 'diagonal':
      return front ? { x: 820, y: 110 } : { x: 800, y: 620 };
  }
}

/** Standardaufstellung im 5-1: Zuspieler und Diagonal stehen sich immer gegenüber. */
export const TEAM: Player[] = [
  { id: 'z', short: 'Z', name: 'Zuspieler', role: 'zuspieler', startZone: 1 },
  { id: 'm1', short: 'M1', name: 'Mittelblocker 1', role: 'mittelblocker', startZone: 2 },
  { id: 'a1', short: 'A1', name: 'Außen 1', role: 'aussen', startZone: 3 },
  { id: 'd', short: 'D', name: 'Diagonal', role: 'diagonal', startZone: 4 },
  { id: 'm2', short: 'M2', name: 'Mittelblocker 2', role: 'mittelblocker', startZone: 5 },
  { id: 'a2', short: 'A2', name: 'Außen 2', role: 'aussen', startZone: 6 },
];

export const ROLE_COLOR: Record<Role, string> = {
  zuspieler: '#009fe3',
  mittelblocker: '#10cc1c',
  aussen: '#fb6203',
  diagonal: '#8f0af0',
};

export const ROLE_LABEL: Record<Role, string> = {
  zuspieler: 'Zuspieler',
  mittelblocker: 'Mittelblocker',
  aussen: 'Außenangreifer',
  diagonal: 'Diagonalspieler',
};
