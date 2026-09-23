import { Basics } from './components/Basics';
import { SiteNav } from './components/SiteNav';
import { Trainer } from './components/Trainer';
import { ContentProvider, EditBar, Editable, useContent } from './content/ContentProvider';

/** Bilder aus public/ – mit Basispfad, damit GitHub Pages sie findet */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const SOURCES = [
  { org: 'FIVB', title: 'Official Volleyball Rules 2025–2028 (PDF)', href: 'https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf' },
  { org: 'Regel 7.4', title: 'Positionen – deutscher Regeltext', href: 'https://www.volleyballer.de/regeln/regel.php?Kapitel=7.4' },
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

function Page() {
  const { content, editing, update } = useContent();
  return (
    <div className="min-h-full bg-navy-900 text-white overflow-x-hidden">
      <SiteNav crest={asset('wappen.png')} />

      {/* Hero */}
      <section id="top" className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_460px] items-center">
        <div>
          <p className="eyebrow text-vsg-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vsg-400" />
            <Editable value={content.hero.eyebrow} onChange={v => update(d => void (d.hero.eyebrow = v))} />
          </p>
          <h1 className="headline mt-6 text-[clamp(3rem,9vw,7.5rem)]">
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
            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/70"
            value={content.hero.intro}
            onChange={v => update(d => void (d.hero.intro = v))}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#grundlagen" className="rounded-full bg-vsg-300 text-navy-900 px-6 py-3 font-bold hover:bg-vsg-200 transition">
              Grundlagen lesen
            </a>
            <a href="#trainer" className="rounded-full border border-white/20 px-6 py-3 font-bold text-white/80 hover:text-white hover:border-white/40 transition">
              Direkt zum Trainer
            </a>
          </div>
        </div>
        <MascotCard src={asset('mascots/team.png')} bubble={content.hero.bubble} caption={content.hero.caption} tint="from-vsg-500/40" />
      </section>

      {/* Grundlagen */}
      <Basics mascot={asset('mascots/kuh.png')} />

      {/* Trainer */}
      <section id="trainer" className="scroll-mt-14 max-w-[1400px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <p className="eyebrow text-white/70 flex items-center gap-2 mb-10">
          <span className="text-white/40 mr-6">02</span>
          <span className="w-2 h-2 rounded-full bg-vsg-400" /> Trainer · Läufer I–VI
        </p>
        <Trainer />
      </section>

      {/* Regeln */}
      <section id="regeln" className="scroll-mt-14 light bg-ice text-navy-900">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-24 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="eyebrow text-navy-900/50">03</p>
            <h2 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Regelbasis &amp;
              <br />
              Einordnung
            </h2>
            <img
              src={asset('mascots/elefant.png')}
              alt="Elefanten-Maskottchen"
              className="mt-10 h-56 w-auto rounded-[26px] border border-navy-900/10 shadow-panel"
            />
          </div>
          <div>
            <Editable as="p" className="text-lg leading-relaxed text-navy-900/80" value={content.regeln.intro} onChange={v => update(d => void (d.regeln.intro = v))} />
            <ul className="mt-10 border-t border-navy-900/20">
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

      {/* Fußzeile */}
      <footer className="bg-navy-950">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={asset('wappen.png')} alt="" className="h-10 w-auto" />
            <span className="text-sm font-black tracking-[0.2em] uppercase">VSG Kleinsteinbach</span>
          </div>
          <p className="text-sm text-white/50">
            Gebaut zum Sehen, Laufen, Verstehen.{' '}
            <a href="?edit=1" className="text-white/30 hover:text-amber-300" title="Inhalte bearbeiten">
              ✎
            </a>
          </p>
          <a href="#top" className="text-sm font-bold text-vsg-300 hover:text-vsg-200">
            Zurück aufs Feld ↑
          </a>
        </div>
      </footer>
    </div>
  );
}

function MascotCard({ src, bubble, caption, tint }: { src: string; bubble: string; caption: string; tint: string }) {
  return (
    <div
      className={`relative w-full max-w-md mx-auto lg:max-w-none rounded-[28px] overflow-hidden bg-gradient-to-b ${tint} to-white/5 border border-white/10 shadow-panel aspect-square`}
    >
      <img src={src} alt="Maskottchen" className="absolute inset-x-0 bottom-0 w-full h-[88%] object-contain object-bottom px-4 drop-shadow-2xl" />
      <div className="absolute top-5 left-5 rounded-2xl bg-navy-950/90 text-white border border-white/15 px-4 py-3 shadow-dot backdrop-blur">
        <p className="text-[10px] font-black tracking-[0.2em] text-vsg-300">1 → 6</p>
        <p className="mt-1 text-sm font-bold leading-tight max-w-[11rem]">{bubble}</p>
      </div>
      <p className="absolute bottom-5 left-5 rounded-full bg-vsg-500 text-white px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase shadow-dot">
        {caption}
      </p>
    </div>
  );
}
