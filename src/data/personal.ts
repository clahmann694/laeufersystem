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
  parts.push('Genau diese Spielerinnen bestimmen, wie weit du dich im Annahmeriegel bewegen darfst.');
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

/** Wie weit darf ich? Kurzform für den Annahme-Text, z. B. "so nah ans Netz, wie es A1 erlaubt …" */
function limitSentence(c: Constraint, meId: string, rotation: number): string {
  const o = who(figureById(c.a === meId ? c.b : c.a), rotation);
  if (c.kind === 'left') {
    return c.a === meId
      ? `Du gehst so weit nach rechts, wie es ${o} erlaubt: dein linker Fuß nicht weiter rechts als ihr rechter Fuß.`
      : `Du gehst so weit nach links, wie es ${o} erlaubt: dein rechter Fuß nicht weiter links als ihr linker Fuß.`;
  }
  return c.a === meId
    ? `Du gehst so weit nach hinten, wie es ${o} erlaubt: dein vorderer Fuß nicht weiter hinten als ihr hinterer Fuß.`
    : `Du stellst dich so nah ans Netz, wie es ${o} erlaubt: dein hinterer Fuß nicht weiter vorne als ihr vorderer Fuß.`;
}

function annahmeText(id: string, rotation: number, content: Content): string {
  const limits = (content.constraints[String(rotation)] ?? [])
    .filter(c => c.a === id || c.b === id)
    .map(c => limitSentence(c, id, rotation))
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
    return `Du nimmst nicht an. ${move} Dein Ziel ist das Zuspielfenster am Netz zwischen Zone 3 und 2 – deshalb stehst du so nah daran, wie es deine Nachbarinnen erlauben, und läufst los, sobald die Gegnerin den Ball schlägt.`;
  }
  return front
    ? `Du nimmst nicht an. ${move} Mach dem Riegel Platz und halte dich vorne für den Angriff bereit.`
    : `Du nimmst nicht an. ${move} Stell dich hinter den Riegel, damit die Annehmenden freie Bahn haben.`;
}

/** Eine Linie als Du-Satz mit dem genauen Fuß-Maß nach FIVB 7.4.3 */
export function youSentence(c: Constraint, meId: string, rotation: number): string {
  const other = figureById(c.a === meId ? c.b : c.a);
  const o = who(other, rotation);
  if (c.kind === 'left') {
    return c.a === meId
      ? `Du darfst nach rechts rücken, bis dein linker Fuß auf Höhe des rechten Fußes von ${o} ist – weiter nicht.`
      : `Du darfst nach links rücken, bis dein rechter Fuß auf Höhe des linken Fußes von ${o} ist – weiter nicht.`;
  }
  return c.a === meId
    ? `Du darfst nach hinten rücken, bis dein vorderer Fuß auf Höhe des hinteren Fußes von ${o} ist – weiter nicht.`
    : `Du darfst so nah ans Netz, bis dein hinterer Fuß auf Höhe des vorderen Fußes von ${o} ist – weiter nach vorne nicht.`;
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
    ? 'Die orangen Linien zeigen, wo deine Grenzen sind. Bis dorthin darfst du gehen – aber nicht weiter, sonst ist es ein Stellungsfehler.'
    : 'In dieser Rotation begrenzt dich keine der entscheidenden Linien direkt. Du hast Spielraum – aber tausch nie die Reihenfolge mit deinen Nachbarinnen.';
}
