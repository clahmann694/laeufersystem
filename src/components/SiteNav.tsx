import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'grundlagen', n: 1, label: 'Grundlagen' },
  { id: 'trainer', n: 2, label: 'Trainer' },
  { id: 'regeln', n: 3, label: 'Regeln' },
];

/** Welcher Abschnitt ist gerade im Blick? Für die Hervorhebung in der Leiste. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    // Ein Abschnitt zählt als aktiv, sobald er das obere Drittel des Bildschirms berührt
    const io = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
        else if (window.scrollY < 200) setActive(null);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const IDS = SECTIONS.map(s => s.id);

/** Schmale, mitlaufende Leiste mit Wappen und den nummerierten Abschnitten */
export function SiteNav({ crest }: { crest: string }) {
  const active = useActiveSection(IDS);
  return (
    <header className="sticky top-0 z-40 bg-navy-900/85 backdrop-blur border-b border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img src={crest} alt="Wappen VSG Kleinsteinbach" className="h-9 w-auto drop-shadow" />
          <span className="leading-tight hidden md:block">
            <span className="block text-xs font-black tracking-[0.2em] uppercase">VSG Kleinsteinbach</span>
            <span className="block text-[11px] text-white/50">Läufersystem lernen</span>
          </span>
        </a>
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar rounded-full border border-white/10 bg-white/5 p-1 text-sm font-bold">
          {SECTIONS.map(s => {
            const on = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={on ? 'true' : undefined}
                className={`flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 whitespace-nowrap transition ${
                  on ? 'bg-vsg-300 text-navy-900' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className={`w-5 h-5 rounded-full grid place-content-center text-[10px] ${on ? 'bg-navy-900 text-white' : 'bg-white/10'}`}>
                  {s.n}
                </span>
                <span>{s.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
