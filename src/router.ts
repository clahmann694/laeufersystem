import { useEffect, useState } from 'react';

/** Die Kapitel der Seite; `start` ist die Übersicht */
export type Chapter = 'start' | 'grundlagen' | 'trainer' | 'position' | 'regeln';

export const CHAPTERS: { id: Exclude<Chapter, 'start'>; n: number; label: string; short: string }[] = [
  { id: 'grundlagen', n: 1, label: 'Grundlagen', short: 'Basics' },
  { id: 'trainer', n: 2, label: 'Trainer', short: 'Trainer' },
  { id: 'position', n: 3, label: 'Meine Position', short: 'Ich' },
  { id: 'regeln', n: 4, label: 'Regeln', short: 'Regeln' },
];

/** Link auf ein Kapitel: Hash-Routing, damit GitHub Pages ohne Server-Konfiguration auskommt */
export function hrefOf(chapter: Chapter): string {
  return chapter === 'start' ? '#/' : `#/${chapter}`;
}

function readHash(): Chapter {
  const h = window.location.hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return CHAPTERS.some(c => c.id === h) ? (h as Chapter) : 'start';
}

/** Aktuelles Kapitel aus der URL; reagiert auf Zurück/Vor im Browser */
export function useChapter(): Chapter {
  const [chapter, setChapter] = useState<Chapter>(readHash);
  useEffect(() => {
    const onChange = () => {
      setChapter(readHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return chapter;
}

/** Zweiter Teil des Pfads, z. B. "a1" bei #/position/a1 */
export function useSubPath(): string | null {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[1] || null;
  const [sub, setSub] = useState<string | null>(read);
  useEffect(() => {
    const onChange = () => setSub(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return sub;
}
