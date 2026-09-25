import { Buddy } from './Buddy';
import { Trainer } from './Trainer';
import { Editable, useContent } from '../content/ContentProvider';
import { LIBERO, MIDDLE, MIDDLE_ID, ROLE_COLOR, TEAM, figureById, textOn } from '../data/volleyball';
import { useSubPath } from '../router';

/** Mitten zusammengefasst: beide lernen beide Läufe, gewechselt wird beim Rotieren */
const FIGURES = [...TEAM.filter(p => p.role !== 'mittelblocker'), MIDDLE, LIBERO];

/**
 * Kapitel "Meine Position": erst die eigene Figur wählen, dann der Trainer aus ihrer Sicht.
 * Die Wahl steht in der URL (#/position/a1), damit man sich den Link merken kann.
 */
export function MyPosition() {
  const { content, update } = useContent();
  const sub = useSubPath();
  // alte Links auf m1/m2 landen bei der gemeinsamen Mitte
  const id = sub === 'm1' || sub === 'm2' ? MIDDLE_ID : sub;
  const chosen = id === MIDDLE_ID ? MIDDLE : id && FIGURES.some(f => f.id === id) ? figureById(id) : null;

  if (!chosen) {
    return (
      <section className="max-w-[1000px] mx-auto px-5 sm:px-8 py-8 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div>
            <p className="eyebrow text-vsg-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-vsg-400" /> Meine Position
            </p>
            <h1 className="headline mt-4 text-[clamp(2.2rem,6vw,4.5rem)]">
              <Editable value={content.position.title} onChange={v => update(d => void (d.position.title = v))} />
            </h1>
          </div>
          <Buddy
            name="kuh-herz"
            say={content.buddies.position}
            onSay={v => update(d => void (d.buddies.position = v))}
            className="self-end shrink-0 h-28 sm:h-48"
          />
        </div>
        <Editable
          as="p"
          className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-navy-900/70"
          value={content.position.intro}
          onChange={v => update(d => void (d.position.intro = v))}
        />
        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {FIGURES.map(f => (
            <li key={f.id}>
              <a
                href={`#/position/${f.id}`}
                className="flex items-center gap-3 rounded-2xl bg-paper-card border border-navy-900/10 shadow-sm p-3 sm:p-4 hover:border-vsg-400 hover:shadow-md transition"
              >
                <span
                  className="shrink-0 w-12 h-12 rounded-full grid place-content-center text-sm font-black shadow-dot"
                  style={{ background: ROLE_COLOR[f.role], color: textOn(f.role) }}
                >
                  {f.short}
                </span>
                <span className="font-bold">{f.name}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-navy-900/55">
          Außen gibt es doppelt: A1 steht in Rotation 1 vorne, A2 hinten. Die Mitten lernen beide Läufe – im Trainer
          wechselst du automatisch zwischen M1 und M2.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-[1400px] mx-auto px-5 sm:px-8 py-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-full grid place-content-center text-sm font-black"
            style={{ background: ROLE_COLOR[chosen.role], color: textOn(chosen.role) }}
          >
            {chosen.short}
          </span>
          <div>
            <p className="eyebrow text-navy-900/55">Dein Läufersystem als</p>
            <p className="text-xl font-bold">{chosen.name}</p>
          </div>
        </div>
        <Buddy
          name="ball-daumen"
          say={content.buddies.positionChosen}
          onSay={v => update(d => void (d.buddies.positionChosen = v))}
          className="hidden md:flex h-24 ml-auto"
        />
        <a href="#/position" className="rounded-2xl border border-navy-900/15 bg-paper-card px-4 py-2.5 text-sm font-bold text-navy-900/80 hover:text-navy-900">
          Andere Position wählen
        </a>
      </div>
      {/* key: beim Wechsel der Figur frisch in Rotation 1 starten */}
      <Trainer key={chosen.id} focusId={chosen.id} />
    </section>
  );
}
