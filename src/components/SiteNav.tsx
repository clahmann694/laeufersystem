import { CHAPTERS, Chapter, hrefOf } from '../router';
import { Buddy, BuddyName } from './Buddy';

/** Am Kapitelende winkt jedes Mal ein anderer Buddy */
const OUTRO: Record<string, BuddyName> = {
  grundlagen: 'elefant-winkt',
  trainer: 'ball-jubelt',
  position: 'kuh-jubelt',
  regeln: 'elefant-hallo',
};

/** Schmale, mitlaufende Leiste: Wappen (zurück zur Übersicht) und die drei Kapitel */
export function SiteNav({ crest, chapter }: { crest: string; chapter: Chapter }) {
  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
        <a href={hrefOf('start')} className="flex items-center gap-2.5 shrink-0" title="Zur Übersicht">
          <img src={crest} alt="Wappen VSG Kleinsteinbach" className="h-9 w-auto drop-shadow" />
          <span className="leading-tight hidden md:block">
            <span className="block text-xs font-black tracking-[0.2em] uppercase">VSG Kleinsteinbach</span>
            <span className="block text-[11px] text-white/50">Läufersystem lernen</span>
          </span>
        </a>
        <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm font-bold">
          {CHAPTERS.map(c => {
            const on = chapter === c.id;
            return (
              <a
                key={c.id}
                href={hrefOf(c.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 text-[13px] sm:text-sm whitespace-nowrap transition ${
                  on ? 'bg-vsg-300 text-navy-900' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className={`hidden sm:grid w-5 h-5 rounded-full place-content-center text-[10px] ${on ? 'bg-navy-900 text-white' : 'bg-white/10'}`}>
                  {c.n}
                </span>
                <span className="sm:hidden">{c.short}</span>
                <span className="hidden sm:inline">{c.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

/** Am Ende eines Kapitels: zurück und weiter */
export function ChapterNav({ chapter }: { chapter: Exclude<Chapter, 'start'> }) {
  const i = CHAPTERS.findIndex(c => c.id === chapter);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  return (
    <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8 flex items-center justify-between gap-3 text-sm font-bold">
      <a href={prev ? hrefOf(prev.id) : hrefOf('start')} className="rounded-2xl border border-current/20 px-4 py-3 opacity-80 hover:opacity-100">
        ← {prev ? prev.label : 'Übersicht'}
      </a>
      <Buddy name={OUTRO[chapter]} className="h-16 sm:h-24 ml-auto -my-2" />
      {next ? (
        <a href={hrefOf(next.id)} className="rounded-2xl bg-vsg-500 text-white px-5 py-3 hover:bg-vsg-600">
          Weiter: {next.label} →
        </a>
      ) : (
        <a href={hrefOf('start')} className="rounded-2xl bg-vsg-500 text-white px-5 py-3 hover:bg-vsg-600">
          Zur Übersicht →
        </a>
      )}
    </div>
  );
}
