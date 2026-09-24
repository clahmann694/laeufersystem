import { useEffect, useState } from 'react';
import { Court, RULE_COLOR } from './Court';
import { LIBERO, MIDDLE_ID, PHASE_ORDER, Phase, ROLE_COLOR, SETTER, TEAM, benchedMiddle, frontMiddle, resolveFocus, constraintText, figureById, isFrontRow, laeuferOf, personalTask, textOn, zoneOf, zoneOfFigure } from '../data/volleyball';
import { Editable, useContent } from '../content/ContentProvider';
import { exactRule, personalPhaseText, simpleRule } from '../data/personal';

/** Pause zwischen zwei Phasen beim automatischen Ablauf */
const STEP_MS = 1500;

/** Startzustand aus der URL, z. B. ?r=3&p=annahme – zum Verlinken einzelner Stände */
function initialFromUrl(): { rotation: number; phase: Phase } {
  const params = new URLSearchParams(window.location.search);
  const r = Number(params.get('r'));
  const p = params.get('p') as Phase | null;
  return {
    rotation: r >= 1 && r <= 6 ? r : 1,
    phase: p && PHASE_ORDER.includes(p) ? p : 'grund',
  };
}

/** `focusId`: Trainer aus Sicht einer Figur (Kapitel "Meine Position") */
export function Trainer({ focusId }: { focusId?: string } = {}) {
  const { content, editing, update } = useContent();
  const [rotation, setRotation] = useState(() => initialFromUrl().rotation);
  const [phase, setPhase] = useState<Phase>(() => initialFromUrl().phase);
  const [playing, setPlaying] = useState(false);
  const [selectedId, setHighlightId] = useState<string | null>(null);
  // Mit Fokus ist die eigene Figur immer hervorgehoben
  // "m" = beide Mitten: es zählt die, die in dieser Rotation auf dem Feld steht
  const actualId = focusId ? resolveFocus(focusId, rotation) : undefined;
  const highlightId = actualId ?? selectedId;
  const isMiddle = focusId === MIDDLE_ID;
  const prevRotation = ((rotation + 4) % 6) + 1;
  /** Beim Mitte-Modus: hat gerade die Person gewechselt? */
  const swapped = isMiddle && frontMiddle(prevRotation).id !== frontMiddle(rotation).id;

  // Ablauf: aus der Grundaufstellung in den Annahmeriegel gleiten, dann die Erklärung
  useEffect(() => {
    if (!playing) return;
    const next = PHASE_ORDER[PHASE_ORDER.indexOf(phase) + 1];
    if (!next) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setPhase(next), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, phase]);

  const chooseRotation = (r: number) => {
    setPlaying(false);
    setRotation(((r - 1 + 6) % 6) + 1);
    setPhase('grund');
  };

  const choosePhase = (p: Phase) => {
    setPlaying(false);
    setPhase(p);
  };

  const play = () => {
    setHighlightId(null);
    setPhase('grund');
    setPlaying(true);
  };

  const key = String(rotation);
  const setterZone = zoneOf(SETTER, rotation);
  const setterFront = isFrontRow(setterZone);
  const phases = content.trainer.phases;
  const current = phases[phase];
  const stepIndex = PHASE_ORDER.indexOf(phase) + 1;
  const allConstraints = content.constraints[key] ?? [];
  const constraints = actualId ? allConstraints.filter(c => c.a === actualId || c.b === actualId) : allConstraints;
  const me = actualId ? figureById(actualId) : null;
  const task = actualId ? personalTask(actualId, rotation) : null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Feld-Panel */}
      <div className="rounded-[28px] bg-navy-800 border border-white/10 shadow-panel p-5 sm:p-7">
        {/* Auf dem Handy bleibt die Rotationswahl beim Scrollen unter der Leiste kleben */}
        <div className="sticky top-14 z-20 -mx-5 sm:mx-0 px-5 sm:px-0 py-2 sm:py-0 bg-navy-800/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-white/50 mb-3">Rotation wählen</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(r => (
                <button
                  key={r}
                  onClick={() => chooseRotation(r)}
                  aria-pressed={r === rotation}
                  className={`relative w-11 h-11 rounded-full font-bold transition ${
                    r === rotation ? 'bg-vsg-500 text-white shadow-dot' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {r}
                  {focusId && (
                    <span className="block -mt-0.5 text-[9px] font-bold opacity-70">
                      {isMiddle ? frontMiddle(r).short : `Z${zoneOfFigure(focusId, r)}`}
                    </span>
                  )}
                  {isMiddle && frontMiddle(((r + 4) % 6) + 1).id !== frontMiddle(r).id && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-navy-950 text-[11px] font-black grid place-content-center" title="Personenwechsel">
                      ⇄
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Editable
              as="span"
              value={content.trainer.badge}
              onChange={v => update(d => void (d.trainer.badge = v))}
              className="hidden sm:inline-block rounded-full border border-amber-300/60 text-amber-200 px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase"
            />
            <span className="inline-flex items-center gap-2 text-white/70 text-xs font-bold tracking-[0.2em] uppercase">
              <span className="w-8 h-8 rounded-full bg-white/10 grid place-content-center">↑</span>
              Netz
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Court rotation={rotation} phase={phase} highlightId={highlightId} onSelect={setHighlightId} onlyFor={actualId} alsoHighlight={swapped ? benchedMiddle(rotation).id : undefined} />
        </div>

        {/* Phasen */}
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {PHASE_ORDER.map((id, i) => {
            const active = id === phase;
            // Im Bearbeitungsmodus kein <button>: darin lässt sich der Text sonst nicht tippen
            const Tag = editing ? 'div' : 'button';
            return (
              <Tag
                key={id}
                role="button"
                onClick={() => choosePhase(id)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${
                  active ? 'bg-paper text-navy-900 shadow-dot' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full grid place-content-center text-[11px] ${
                    active ? 'bg-vsg-500 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  {i + 1}
                </span>
                <Editable value={phases[id].label} onChange={v => update(d => void (d.trainer.phases[id].label = v))} />
              </Tag>
            );
          })}
          <button
            onClick={play}
            disabled={playing}
            className="rounded-2xl px-6 py-3.5 bg-vsg-400 text-navy-900 text-sm font-black tracking-[0.18em] uppercase hover:bg-vsg-300 transition disabled:opacity-60"
          >
            {playing ? '… läuft' : '▶ Ablauf'}
          </button>
        </div>
      </div>

      {/* Info-Karte */}
      <aside className="light rounded-[28px] bg-paper text-navy-900 shadow-panel p-7 flex flex-col">
        <p className="eyebrow text-navy-900/60">Rotation {rotation} / 6</p>
        <h2 className="headline text-5xl mt-3">Läufer {laeuferOf(rotation)}</h2>
        <p className="mt-2 text-sm font-semibold text-navy-900/60">
          {setterFront ? 'Z im Vorderfeld · zwei Angreiferinnen am Netz' : 'Z im Hinterfeld · drei Angreiferinnen am Netz'}
        </p>

        {swapped && (
          <div key={rotation} className="swap-alert mt-6 rounded-2xl bg-amber-400 text-navy-950 p-4 flex gap-3 items-start">
            <span className="shrink-0 w-11 h-11 rounded-full bg-navy-950 text-amber-300 grid place-content-center text-xl font-black">⇄</span>
            <div className="min-w-0">
              <p className="eyebrow">Personenwechsel</p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed">
                {benchedMiddle(rotation).short} rotiert nach hinten und geht auf die Bank – die Libera übernimmt. Jetzt spielst du als{' '}
                <strong>{frontMiddle(rotation).short}</strong> vorne in Zone {zoneOfFigure(frontMiddle(rotation).id, rotation)}.
              </p>
            </div>
          </div>
        )}

        {me && task && actualId ? (
          /* Meine Position: persönliche Erklärung statt allgemeinem Phasentext */
          <div className="mt-6 rounded-2xl bg-navy-900 text-white p-4 sm:p-5 flex gap-3">
            <span
              className="shrink-0 w-11 h-11 rounded-full grid place-content-center text-sm font-black"
              style={{ background: ROLE_COLOR[me.role], color: textOn(me.role) }}
            >
              Du
            </span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-vsg-300">
                {current.title} · {me.short} · Zone {zoneOfFigure(me.id, rotation)}
                {task.status === 'annahme' ? ' · Annahme' : task.status === 'bank' ? ' · Bank' : ''}
              </p>
              <Editable
                as="p"
                className="mt-2 text-[15px] leading-relaxed text-white/90"
                value={personalPhaseText(actualId, rotation, phase, content)}
                onChange={v =>
                  update(d => {
                    d.personal ??= {};
                    d.personal[actualId] ??= {};
                    d.personal[actualId][key] ??= {};
                    d.personal[actualId][key][phase] = v;
                  })
                }
              />
            </div>
          </div>
        ) : (
          <div className="mt-7 pt-7 border-t border-navy-900/10 flex gap-4">
            <span className="shrink-0 w-11 h-11 rounded-full bg-vsg-400 text-white grid place-content-center font-black">{stepIndex}</span>
            <div className="min-w-0 flex-1">
              <Editable as="p" className="eyebrow text-navy-900" value={current.title} onChange={v => update(d => void (d.trainer.phases[phase].title = v))} />
              <Editable
                as="p"
                className="mt-2 text-[15px] leading-relaxed text-navy-900/75"
                value={current.text}
                onChange={v => update(d => void (d.trainer.phases[phase].text = v))}
              />
            </div>
          </div>
        )}

        {/* Erklärung: ein Satz je Linie im Feld */}
        {phase === 'erklaerung' && (
          <ol className="mt-6 space-y-3">
            {constraints.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-2xl bg-navy-900 border-2 p-4" style={{ borderColor: RULE_COLOR }}>
                <span
                  className="shrink-0 w-7 h-7 rounded-full grid place-content-center text-sm font-black text-navy-950"
                  style={{ background: RULE_COLOR }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 text-sm leading-relaxed text-white/80">
                  {editing && !focusId ? (
                    <ConstraintForm rotation={rotation} index={i} />
                  ) : (
                    actualId ? (
                      <>
                        <strong className="block text-white text-[15px]">Achte darauf: {simpleRule(c, actualId)}</strong>
                        <span className="block mt-1.5 text-white/80">{exactRule(c, actualId)}</span>
                      </>
                    ) : (
                      <>
                        <strong className="text-white">{constraintText(c, rotation)}</strong> {c.why}
                      </>
                    )
                  )}
                </div>
              </li>
            ))}
            {editing && !focusId && (
              <li>
                <button
                  onClick={() => update(d => void (d.constraints[key] = [...(d.constraints[key] ?? []), { a: 'z', b: 'a1', kind: 'left', why: '' }]))}
                  className="w-full rounded-2xl border-2 border-dashed border-amber-400 text-amber-700 px-4 py-3 text-sm font-bold hover:bg-amber-100"
                >
                  + Linie hinzufügen
                </button>
              </li>
            )}
          </ol>
        )}

        <button onClick={() => chooseRotation(rotation + 1)} className="mt-auto pt-6 group">
          <span className="flex items-center justify-between rounded-2xl bg-navy-900 text-white px-6 py-4 font-bold group-hover:bg-navy-800 transition">
            Nächste Rotation
            <span className="text-vsg-400 text-xl">→</span>
          </span>
        </button>
      </aside>
    </div>
  );
}


/** Formular für eine Linie im Bearbeitungsmodus: wer, Regelart, Erklärung */
function ConstraintForm({ rotation, index }: { rotation: number; index: number }) {
  const { content, update } = useContent();
  const key = String(rotation);
  const c = content.constraints[key][index];
  // Wählbar sind alle auf dem Feld: die fünf Spielerinnen plus Libera, ohne die Mitte auf der Bank
  const onCourt = [...TEAM.filter(p => p.id !== benchedMiddle(rotation).id), LIBERO];
  const select = 'rounded-lg border border-amber-300 bg-white text-navy-900 px-2 py-1 text-sm font-bold';
  const edit = (mutate: (c: (typeof content.constraints)[string][number]) => void) => update(d => mutate(d.constraints[key][index]));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select className={select} value={c.a} onChange={e => edit(x => void (x.a = e.target.value))}>
          {onCourt.map(f => (
            <option key={f.id} value={f.id}>
              {f.short}
            </option>
          ))}
        </select>
        <select className={select} value={c.kind} onChange={e => edit(x => void (x.kind = e.target.value as 'left' | 'front'))}>
          <option value="left">muss links bleiben von</option>
          <option value="front">muss vor (näher am Netz) stehen als</option>
        </select>
        <select className={select} value={c.b} onChange={e => edit(x => void (x.b = e.target.value))}>
          {onCourt.map(f => (
            <option key={f.id} value={f.id}>
              {f.short}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="w-full rounded-lg border border-amber-300 bg-white text-navy-900 px-2 py-1 text-sm"
        rows={2}
        placeholder="Was folgt daraus für die Aufstellung?"
        value={c.why}
        onChange={e => edit(x => void (x.why = e.target.value))}
      />
      <div className="flex gap-2 text-xs font-bold">
        <button
          disabled={index === 0}
          onClick={() => update(d => void d.constraints[key].splice(index - 1, 2, d.constraints[key][index], d.constraints[key][index - 1]))}
          className="rounded-lg bg-white text-navy-900 px-2 py-1 disabled:opacity-40"
        >
          ↑ früher
        </button>
        <button
          onClick={() => update(d => void d.constraints[key].splice(index, 1))}
          className="ml-auto rounded-lg bg-red-100 text-red-700 px-2 py-1 hover:bg-red-200"
        >
          Linie löschen
        </button>
      </div>
    </div>
  );
}
