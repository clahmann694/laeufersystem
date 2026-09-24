/**
 * Erklärungen für das Kapitel "Meine Position": in Du-Form, für eine Figur in einer Rotation.
 * Alles wird aus Zonen, Annahmepositionen und Linien berechnet; die Trainerin kann jeden
 * Text im Bearbeitungsmodus überschreiben (content.personal).
 */
import type { Content } from './content';
import {
  Constraint,
  Figure,
  LIBERO,
  Phase,
  RECEIVERS,
  TEAM,
  ZONE_CENTER,
  Zone,
  benchedMiddle,
  figureById,
  isFrontRow,
  zoneOfFigure,
} from './volleyball';

/** Wer steht in dieser Rotation in dieser Zone? (die Libera für die hintere Mitte) */
function atZone(zone: Zone, rotation: number): Figure {
  const benched = benchedMiddle(rotation);
  if (zoneOfFigure(benched.id, rotation) === zone) return LIBERO;
  return TEAM.find(p => p.id !== benched.id && zoneOfFigure(p.id, rotation) === zone)!;
}

const who = (f: Figure, rotation: number) => `${f.short} (${f.name}, Zone ${zoneOfFigure(f.id, rotation)})`;

/** Links → rechts je Reihe und die Vorne-hinten-Paare */
const ROW: Record<'front' | 'back', Zone[]> = { front: [4, 3, 2], back: [5, 6, 1] };
const PARTNER: Record<Zone, Zone> = { 4: 5, 3: 6, 2: 1, 5: 4, 6: 3, 1: 2 };

function grundText(id: string, rotation: number): string {
  const zone = zoneOfFigure(id, rotation);
  const front = isFrontRow(zone);
  const row = front ? ROW.front : ROW.back;
  const i = row.indexOf(zone);
  const left = row[i - 1];
  const right = row[i + 1];
  const partner = atZone(PARTNER[zone], rotation);
  const parts = [`Du stehst in Zone ${zone}, ${front ? 'vorne am Netz' : 'hinten'}.`];
  if (left && right) parts.push(`Links neben dir steht ${who(atZone(left, rotation), rotation)}, rechts ${who(atZone(right, rotation), rotation)}.`);
  else if (right) parts.push(`Du bist ganz links. Rechts neben dir steht ${who(atZone(right, rotation), rotation)}.`);
  else if (left) parts.push(`Du bist ganz rechts. Links neben dir steht ${who(atZone(left, rotation), rotation)}.`);
  parts.push(
    front
      ? `Hinter dir steht ${who(partner, rotation)} – sie muss beim Aufschlag hinter dir bleiben.`
      : `Vor dir steht ${who(partner, rotation)} – du musst beim Aufschlag hinter ihr bleiben.`
  );
  parts.push('Diese Spielerinnen bestimmen gleich, wohin du im Annahmeriegel darfst.');
  return parts.join(' ');
}

/** Richtung von der Grund- zur Annahmeposition in Worten */
function direction(id: string, rotation: number, content: Content): string | null {
  const to = content.reception[String(rotation)]?.[id];
  if (!to) return null;
  const from = ZONE_CENTER[zoneOfFigure(id, rotation)];
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const words: string[] = [];
  if (Math.abs(dy) > 40) words.push(dy < 0 ? 'nach vorne' : 'nach hinten');
  if (Math.abs(dx) > 40) words.push(dx < 0 ? 'nach links' : 'nach rechts');
  return words.length ? words.join(' und ') : null;
}

/** Kurzer Name für einfache Sätze, z. B. "A1 (Außen 1)" */
const short = (f: Figure) => `${f.short} (${f.name})`;

/** Die einfache Regel zu einer Linie: "Du darfst nicht vor A1 stehen." */
export function simpleRule(c: Constraint, meId: string): string {
  const o = short(figureById(c.a === meId ? c.b : c.a));
  if (c.kind === 'left') return c.a === meId ? `Du darfst nicht rechts von ${o} stehen.` : `Du darfst nicht links von ${o} stehen.`;
  return c.a === meId ? `Du darfst nicht hinter ${o} stehen.` : `Du darfst nicht vor ${o} stehen.`;
}

/** Das genaue Fuß-Maß dazu (FIVB 7.4.3, gleichauf ist erlaubt) */
export function exactRule(c: Constraint, meId: string): string {
  if (c.kind === 'left') {
    return c.a === meId
      ? 'Ganz genau: Dein linker Fuß darf nicht weiter rechts sein als ihr rechter Fuß. Gleichauf ist erlaubt.'
      : 'Ganz genau: Dein rechter Fuß darf nicht weiter links sein als ihr linker Fuß. Gleichauf ist erlaubt.';
  }
  return c.a === meId
    ? 'Ganz genau: Dein vorderer Fuß darf nicht weiter hinten sein als ihr hinterer Fuß. Gleichauf ist erlaubt.'
    : 'Ganz genau: Dein hinterer Fuß darf nicht weiter vorne sein als ihr vorderer Fuß. Gleichauf ist erlaubt.';
}

function annahmeText(id: string, rotation: number, content: Content): string {
  const limits = (content.constraints[String(rotation)] ?? [])
    .filter(c => c.a === id || c.b === id)
    .map(c => `Achte darauf: ${simpleRule(c, id)}`)
    .join(' ');
  return [annahmeCore(id, rotation, content), limits].filter(Boolean).join(' ');
}

function annahmeCore(id: string, rotation: number, content: Content): string {
  const f = figureById(id);
  const zone = zoneOfFigure(id, rotation);
  const front = isFrontRow(zone);
  const dir = direction(id, rotation, content);
  const move = dir ? `Du gehst von deiner Grundposition ${dir}.` : 'Du bleibst ungefähr auf deinem Platz.';
  if (RECEIVERS.includes(id)) {
    const mates = id === 'l' ? 'Die beiden Außen' : `${id === 'a1' ? 'A2' : 'A1'}, die Libera`;
    return `Du nimmst an: ${mates} und du – ihr bildet den 3er-Riegel. ${move} Stellt euch so, dass ihr zu dritt die Feldbreite abdeckt.`;
  }
  if (f.role === 'zuspieler') {
    return `Du nimmst nicht an. ${move} Stell dich so nah wie erlaubt an dein Ziel: das Netz zwischen Zone 3 und 2. Sobald die Gegnerin aufschlägt, läufst du dorthin.`;
  }
  return front
    ? `Du nimmst nicht an. ${move} Mach dem Riegel Platz und halte dich vorne für den Angriff bereit.`
    : `Du nimmst nicht an. ${move} Stell dich hinter den Riegel, damit die Annehmenden freie Bahn haben.`;
}

/** Der erklärende Text für eine Phase – überschrieben, falls die Trainerin einen eigenen hinterlegt hat */
export function personalPhaseText(id: string, rotation: number, phase: Phase, content: Content): string {
  const own = content.personal?.[id]?.[String(rotation)]?.[phase];
  if (own) return own;
  const f = figureById(id);
  if (f.role === 'mittelblocker' && benchedMiddle(rotation).id === id) {
    return `Du stehst eigentlich in Zone ${zoneOfFigure(id, rotation)} hinten – dort spielt die Libera für dich. Du wartest auf der Ersatzbank, bis du wieder nach vorne rotierst.`;
  }
  if (phase === 'grund') return grundText(id, rotation);
  if (phase === 'annahme') return annahmeText(id, rotation, content);
  const lines = (content.constraints[String(rotation)] ?? []).filter(c => c.a === id || c.b === id);
  return lines.length
    ? 'Die orangen Linien sind deine Grenzen. Bis zur Linie darfst du – darüber hinaus ist es ein Stellungsfehler.'
    : 'In dieser Rotation begrenzt dich keine der entscheidenden Linien direkt. Du hast Spielraum – aber tausch nie die Reihenfolge mit deinen Nachbarinnen.';
}
