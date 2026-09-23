/**
 * Modell des Läufersystems (5-1: ein Zuspieler) mit Libera.
 *
 * Zonen auf dem eigenen Feld, Blick zum Netz (Netz oben):
 *
 *        Netz
 *   4  |  3  |  2      vorne  (Angriffszone, bis 3-Meter-Linie)
 *   ---+-----+---
 *   5  |  6  |  1      hinten
 *
 * Gedreht wird im Uhrzeigersinn: 1 → 6 → 5 → 4 → 3 → 2 → 1.
 * Gezeigt wird immer nur das annehmende Team.
 */

export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

export type Role = 'zuspieler' | 'mittelblocker' | 'aussen' | 'diagonal' | 'libero';

/** Eine Figur auf dem Feld oder an der Seitenlinie */
export interface Figure {
  id: string;
  /** Kürzel auf dem Trikot-Kreis */
  short: string;
  name: string;
  role: Role;
}

/** Eine der sechs Spielerinnen, die mitrotieren */
export interface Player extends Figure {
  /** Zone in Rotation 1 – daraus ergibt sich alles Weitere */
  startZone: Zone;
}

export interface Point {
  x: number;
  y: number;
}

/** Reihenfolge, in der gedreht wird */
export const ROTATION_CYCLE: Zone[] = [1, 6, 5, 4, 3, 2];

/** Mittelpunkt jeder Zone im Koordinatensystem des Spielfelds (900 × 900 = 9 × 9 m) */
export const ZONE_CENTER: Record<Zone, Point> = {
  4: { x: 150, y: 160 },
  3: { x: 450, y: 160 },
  2: { x: 750, y: 160 },
  5: { x: 150, y: 640 },
  6: { x: 450, y: 640 },
  1: { x: 750, y: 640 },
};

/** Ersatzbank rechts neben dem Feld: hier sitzt die Mitte, die die Libera ersetzt */
export const BENCH: Point = { x: 1050, y: 800 };

/** Vorne = Angriffszone (Zonen 2, 3, 4); nur von dort darf über dem Netz angegriffen werden */
export function isFrontRow(zone: Zone): boolean {
  return zone === 2 || zone === 3 || zone === 4;
}

/** Wo steht diese Spielerin in der angegebenen Rotation? (rotation 1…6) */
export function zoneOf(player: Player, rotation: number): Zone {
  const start = ROTATION_CYCLE.indexOf(player.startZone);
  return ROTATION_CYCLE[(start + rotation - 1) % ROTATION_CYCLE.length];
}

/**
 * Standardaufstellung im 5-1 (Läufer I): Zuspiel – Außen – Mitte – Diagonal – Außen – Mitte.
 * Zuspielerin und Diagonal stehen sich immer gegenüber. Die Reihenfolge entspricht dem
 * Trainings-Diagramm des Vereins (Spielerin 1 = Z, 2 = Außen, 3 = Mitte, 4 = Diagonal, …).
 */
export const TEAM: Player[] = [
  { id: 'z', short: 'Z', name: 'Zuspiel', role: 'zuspieler', startZone: 1 },
  { id: 'a1', short: 'A1', name: 'Außen 1', role: 'aussen', startZone: 2 },
  { id: 'm1', short: 'M1', name: 'Mitte 1', role: 'mittelblocker', startZone: 3 },
  { id: 'd', short: 'D', name: 'Diagonal', role: 'diagonal', startZone: 4 },
  { id: 'a2', short: 'A2', name: 'Außen 2', role: 'aussen', startZone: 5 },
  { id: 'm2', short: 'M2', name: 'Mitte 2', role: 'mittelblocker', startZone: 6 },
];

export const LIBERO: Figure = { id: 'l', short: 'L', name: 'Libera', role: 'libero' };

/** Die Zuspielerin – die Hauptfigur des Läufersystems */
export const SETTER = TEAM.find(p => p.role === 'zuspieler')!;

/** Die Mittelblockerin, die in dieser Rotation hinten stünde und deshalb von der Libera ersetzt wird */
export function benchedMiddle(rotation: number): Player {
  return TEAM.find(p => p.role === 'mittelblocker' && !isFrontRow(zoneOf(p, rotation)))!;
}

const ROMAN: Record<Zone, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI' };

/** "Läufer I … VI" – benannt nach der Zone, in der die Zuspielerin steht */
export function laeuferOf(rotation: number): string {
  return ROMAN[zoneOf(SETTER, rotation)];
}

/** Diese drei nehmen immer an (3er-Riegel) */
export const RECEIVERS = ['a1', 'a2', 'l'];

/** Eine Stellungsregel, die in dieser Rotation die Aufstellung erzwingt */
export interface Constraint {
  /** `a` muss links von `b` bleiben bzw. vor `b` stehen */
  a: string;
  b: string;
  kind: 'left' | 'front';
  /** Was daraus für die Aufstellung folgt */
  why: string;
}

/** Figur zu einer Kennung – Team oder Libera */
export function figureById(id: string): Figure {
  return TEAM.find(p => p.id === id) ?? LIBERO;
}

/** Zone einer Figur in einer Rotation; die Libera erbt die Zone der ersetzten Mitte */
export function zoneOfFigure(id: string, rotation: number): Zone {
  const f = figureById(id);
  return f.id === 'l' ? zoneOf(benchedMiddle(rotation), rotation) : zoneOf(f as Player, rotation);
}

/** Was diese Figur in dieser Rotation bei der gegnerischen Annahme tut – für "Meine Position" */
export function personalTask(id: string, rotation: number): { status: 'annahme' | 'bank' | 'frei'; text: string } {
  const f = figureById(id);
  if (f.role === 'mittelblocker' && benchedMiddle(rotation).id === id) {
    return { status: 'bank', text: 'Du stehst hinten – die Libera spielt für dich. Du wartest auf der Ersatzbank, bis du wieder nach vorne rotierst.' };
  }
  if (RECEIVERS.includes(id)) {
    return { status: 'annahme', text: 'Du nimmst an: Du bist Teil des 3er-Riegels mit der zweiten Außen und der Libera.' };
  }
  const front = isFrontRow(zoneOfFigure(id, rotation));
  if (f.role === 'zuspieler') {
    return {
      status: 'frei',
      text: front
        ? 'Du nimmst nicht an. Du stehst vorne – bleib regelkonform, aber so nah wie möglich am Zuspielfenster rechts der Mitte.'
        : 'Du nimmst nicht an. Versteck dich hinter deiner Partnerin, so nah wie erlaubt an deinem Weg, und lauf beim Aufschlag ans Netz.',
    };
  }
  return {
    status: 'frei',
    text: front
      ? 'Du nimmst nicht an. Bleib aus dem Riegel raus und mach dich vorne für den Angriff bereit.'
      : 'Du nimmst nicht an. Stell dich hinter den Riegel, damit die Annehmenden freie Bahn haben.',
  };
}

/** Der Regelsatz zu einer Linie, z. B. "Z (Zone 4) muss links von M2 (Zone 3) bleiben." */
export function constraintText(c: Constraint, rotation: number): string {
  const a = figureById(c.a);
  const b = figureById(c.b);
  const zone = (f: Figure) => (f.id === 'l' ? zoneOf(benchedMiddle(rotation), rotation) : zoneOf(f as Player, rotation));
  return c.kind === 'left'
    ? `${a.short} (Zone ${zone(a)}) muss mit einem Fuß links von ${b.short} (Zone ${zone(b)}) bleiben.`
    : `${a.short} (Zone ${zone(a)}) muss mit einem Fuß näher am Netz stehen als ${b.short} (Zone ${zone(b)}).`;
}

export type Phase = 'grund' | 'annahme' | 'erklaerung';

/** Reihenfolge der Phasen; Texte dazu stehen in content.json */
export const PHASE_ORDER: Phase[] = ['grund', 'annahme', 'erklaerung'];

export interface Placement {
  figure: Figure;
  /** Rotationszone; die Libera erbt die Zone der ersetzten Mitte */
  zone: Zone;
  /** Grundposition in der Rotationszone – Start des eingezeichneten Laufwegs */
  base: Point;
  /** Aktuelle Position in dieser Phase */
  at: Point;
  onCourt: boolean;
  receives: boolean;
}

/**
 * Wer steht wo – in Rotation `rotation`, Phase `phase`.
 * Die Libera steht von Anfang an für die hintere Mitte auf dem Feld; die ersetzte
 * Mitte sitzt auf der Ersatzbank.
 */
export function lineup(rotation: number, phase: Phase, reception: Record<string, Point>): Placement[] {
  const benched = benchedMiddle(rotation);

  const place = (figure: Figure, zone: Zone): Placement => {
    const base = ZONE_CENTER[zone];
    const isBenched = figure.id === benched.id;
    const at = isBenched ? BENCH : phase === 'grund' ? base : reception[figure.id];
    return {
      figure,
      zone,
      base,
      at,
      onCourt: !isBenched,
      receives: phase !== 'grund' && RECEIVERS.includes(figure.id),
    };
  };

  return [...TEAM.map(player => place(player, zoneOf(player, rotation))), place(LIBERO, zoneOf(benched, rotation))];
}

export const ROLE_COLOR: Record<Role, string> = {
  zuspieler: '#f0507a',
  mittelblocker: '#5fd0b0',
  aussen: '#f28c3a',
  diagonal: '#7b5ef2',
  libero: '#f7e26b',
};

/** Die Libera ist hell – da braucht das Kürzel dunkle Schrift */
export function textOn(role: Role): string {
  return role === 'libero' ? '#0b1a27' : '#ffffff';
}

export const ROLE_LABEL: Record<Role, string> = {
  zuspieler: 'Zuspiel',
  mittelblocker: 'Mitte',
  aussen: 'Außen',
  diagonal: 'Diagonal',
  libero: 'Libera',
};

