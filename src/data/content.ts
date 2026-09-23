import defaults from './content.json';
import type { Constraint, Phase, Point } from './volleyball';

/**
 * Alles, was die Trainerin selbst bearbeiten kann, liegt in `content.json`.
 * Der Bearbeitungsmodus (`?edit=1`) ändert eine Kopie davon im Browser und
 * exportiert sie als neue `content.json`.
 */
export interface Content {
  hero: { eyebrow: string; title1: string; title2: string; intro: string; bubble: string; caption: string };
  /** Kurztexte der drei Kacheln auf der Startseite */
  home: { grundlagen: string; trainer: string; regeln: string };
  basics: { title1: string; title2: string; intro: string; cta: string; rules: { title: string; text: string }[] };
  trainer: { badge: string; phases: Record<Phase, { label: string; title: string; text: string }> };
  regeln: { intro: string };
  /** Annahmeformation je Rotation ("1"…"6") und Figur */
  reception: Record<string, Record<string, Point>>;
  /** Orange Linien je Rotation */
  constraints: Record<string, Constraint[]>;
}

export const DEFAULT_CONTENT = defaults as Content;

/** Unter diesem Schlüssel liegt der Entwurf im Browser */
export const DRAFT_KEY = 'laeufersystem-content-draft';
