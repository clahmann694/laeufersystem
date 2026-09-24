import { Basics } from './components/Basics';
import { Buddy } from './components/Buddy';
import { ChapterNav, SiteNav } from './components/SiteNav';
import { MyPosition } from './components/MyPosition';
import { Trainer } from './components/Trainer';
import { ContentProvider, EditBar, Editable, useContent } from './content/ContentProvider';
import { CHAPTERS, hrefOf, useChapter } from './router';

/** Bilder aus public/ – mit Basispfad, damit GitHub Pages sie findet */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const SOURCES = [
  { org: 'FIVB', title: 'Official Volleyball Rules 2025–2028 (PDF)', href: 'https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf' },
  { org: 'Regel 7.4', title: 'Positionen – FIVB-Original 2025–2028, Seite 25 (Füße: 7.4.3)', href: 'https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf#page=27' },
  { org: 'Regel 7.5', title: 'Positionsfehler und Konsequenzen', href: 'https://www.volleyballer.de/regeln/regel.php?Kapitel=7.5' },
  { org: '2025', title: 'Regeländerungen: kein Aufstellungsfehler mehr für die Aufschlagmannschaft', href: 'https://www.volleyballer.de/regeln/regelaenderungen/' },
  { org: 'Libera', title: 'Was die Libera darf und was nicht', href: 'https://www.volleyballer.de/regeln/libero/' },
];

export default function App() {
  return (
    <ContentProvider>
      <Page />
      <EditBar />
    </ContentProvider>
  );
}

/** Ein Kapitel pro Ansicht: Startseite mit Kacheln, dann Grundlagen / Trainer / Regeln */
function Page() {
  const chapter = useChapter();
  return (
    <div className="min-h-full bg-navy-900 text-white overflow-x-hidden flex flex-col">
      <SiteNav crest={asset('wappen.png')} chapter={chapter} />
      <main className="flex-1">
        {chapter === 'start' && <Home />}
        {chapter === 'grundlagen' && (
          <>
            <Basics />
            <div className="light bg-paper text-navy-900">
              <ChapterNav chapter="grundlagen" />
            </div>
          </>
        )}
        {chapter === 'trainer' && (
          <>
            <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-6 sm:py-10">
              <TrainerHead />
              <Trainer />
            </section>
            <ChapterNav chapter="trainer" />
          </>
        )}
        {chapter === 'position' && (
          <>
            <MyPosition />
            <ChapterNav chapter="position" />
          </>
        )}
        {chapter === 'regeln' && (
          <>
            <Rules />
            <div className="light bg-ice text-navy-900">
              <ChapterNav chapter="regeln" />
            </div>
          </>
        )}
      </main>

      <footer className="bg-navy-950">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <span className="font-black tracking-[0.2em] uppercase text-white/70">VSG Kleinsteinbach</span>
          <p className="text-white/50">
            Gebaut zum Sehen, Laufen, Verstehen.{' '}
            <a href={`?edit=1${window.location.hash}`} className="text-white/30 hover:text-amber-300" title="Inhalte bearbeiten">
              ✎
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Startseite: Titel, die Buddys und die Kapitel als Kacheln – ohne Scrollen */
function Home() {
  const { content, editing, update } = useContent();
  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-8 sm:pt-14 pb-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-center">
      <div>
        <p className="eyebrow text-vsg-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vsg-400" />
          <Editable value={content.hero.eyebrow} onChange={v => update(d => void (d.hero.eyebrow = v))} />
        </p>
        <h1 className="headline mt-4 text-[clamp(2.6rem,8vw,6rem)]">
          <Editable value={content.hero.title1} onChange={v => update(d => void (d.hero.title1 = v))} />
          {(editing || content.hero.title2) && (
            <>
              <br />
              <Editable className="text-vsg-300" value={content.hero.title2} onChange={v => update(d => void (d.hero.title2 = v))} />
            </>
          )}
        </h1>
        <Editable
          as="p"
          className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70"
          value={content.hero.intro}
          onChange={v => update(d => void (d.hero.intro = v))}
        />

        <ol className="mt-6 sm:mt-8 grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CHAPTERS.map(c => (
            <li key={c.id}>
              <a
                href={hrefOf(c.id)}
                className="group h-full rounded-[22px] bg-white/5 border border-white/10 p-4 sm:p-5 hover:bg-white/10 hover:border-vsg-400/60 transition grid grid-cols-[auto_minmax(0,1fr)_auto] sm:block items-center gap-x-4"
              >
                <span className="row-span-2 w-9 h-9 rounded-full bg-vsg-500 text-white grid place-content-center font-black">{c.n}</span>
                <span className="sm:mt-4 block text-lg sm:text-xl font-bold">{c.label}</span>
                <span className="row-span-2 col-start-3 sm:hidden text-xl text-vsg-300">→</span>
                <Editable
                  as="span"
                  className="col-start-2 sm:mt-1.5 block text-sm leading-snug sm:leading-relaxed text-white/60"
                  value={content.home[c.id]}
                  onChange={v => update(d => void (d.home[c.id] = v))}
                />
                <span className="hidden sm:block mt-4 text-sm font-bold text-vsg-300 group-hover:text-vsg-200">Öffnen →</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <MascotCard src={asset('mascots/team.png')} bubble={content.hero.bubble} caption={content.hero.caption} />
    </section>
  );
}

function Rules() {
  const { content, update } = useContent();
  return (
    <section className="light bg-ice text-navy-900">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-16 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className="eyebrow text-navy-900/50">04 · Regeln</p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            Regelbasis &amp;
            <br />
            Einordnung
          </h2>
          <Buddy
            name="elefant-sitzt"
            say={content.buddies.regeln}
            onSay={v => update(d => void (d.buddies.regeln = v))}
            side="right"
            className="mt-8 h-32 sm:h-44"
          />
        </div>
        <div>
          <Editable as="p" className="text-lg leading-relaxed text-navy-900/80" value={content.regeln.intro} onChange={v => update(d => void (d.regeln.intro = v))} />
          <ul className="mt-8 border-t border-navy-900/20">
            {SOURCES.map(s => (
              <li key={s.title} className="border-b border-navy-900/20">
                <a href={s.href} target="_blank" rel="noreferrer" className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 py-5 group">
                  <span className="eyebrow">{s.org}</span>
                  <span className="font-bold group-hover:text-vsg-700 transition">{s.title}</span>
                  <span className="text-xl">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Die drei Buddys freistehend, mit Sprechblase und Namensschild */
function MascotCard({ src, bubble, caption }: { src: string; bubble: string; caption: string }) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-sm mx-auto lg:max-w-none">
      {/* weicher Lichtschein statt Kartenrahmen */}
      <div className="absolute inset-x-6 bottom-4 top-16 rounded-full bg-vsg-500/25 blur-3xl" aria-hidden />
      <img src={src} alt="Die Läufer-Buddys: Kuh, Volleyball und Elefant" className="relative w-full h-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)]" />
      <div className="absolute -top-2 left-0 rounded-2xl rounded-bl-md bg-navy-950 text-white border border-white/15 px-4 py-3 shadow-dot">
        <p className="text-[10px] font-black tracking-[0.2em] text-vsg-300">1 → 6</p>
        <p className="mt-1 text-sm font-bold leading-tight max-w-[11rem]">{bubble}</p>
      </div>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-vsg-500 text-white px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase shadow-dot">
        {caption}
      </p>
    </div>
  );
}

/** Kopf des Trainer-Kapitels mit springendem Ball */
function TrainerHead() {
  const { content, update } = useContent();
  return (
    <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow text-vsg-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-vsg-400" /> 02 · Trainer
        </p>
        <h1 className="headline mt-3 text-[clamp(2rem,5vw,3.5rem)]">Läufer I–VI</h1>
      </div>
      <Buddy
        name="ball-springt"
        say={content.buddies.trainer}
        onSay={v => update(d => void (d.buddies.trainer = v))}
        className="shrink-0 h-24 sm:h-32"
      />
    </div>
  );
}
