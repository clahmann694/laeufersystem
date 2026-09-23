import { useState } from 'react';
import { Court } from './components/Court';
import { ROLE_COLOR, ROLE_LABEL, TEAM, isFrontRow, zoneOf } from './data/volleyball';

export default function App() {
  const [rotation, setRotation] = useState(1);
  const [afterServe, setAfterServe] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const step = (delta: number) => setRotation(r => ((r - 1 + delta + 6) % 6) + 1);

  return (
    <div className="min-h-full bg-vsg-navy-900 text-white">
      <header className="border-b border-white/10 px-4 py-4">
        <h1 className="text-xl font-bold">Läufersystem lernen</h1>
        <p className="text-sm text-slate-400">Volleyball 5-1: Wo stehe ich – und wohin laufe ich?</p>
      </header>

      <main className="max-w-5xl mx-auto p-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section>
          <Court rotation={rotation} afterServe={afterServe} highlightId={highlightId} onSelect={setHighlightId} />
        </section>

        <aside className="space-y-5">
          {/* Rotation */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <h2 className="font-bold">Rotation {rotation} von 6</h2>
            <p className="mt-1 text-sm text-slate-400">
              Nach jedem gewonnenen Aufschlagrecht dreht die Mannschaft im Uhrzeigersinn weiter.
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => step(-1)} className="flex-1 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
                ← zurück
              </button>
              <button onClick={() => step(1)} className="flex-1 py-2.5 rounded-lg bg-vsg-blue hover:bg-vsg-cyan font-semibold">
                weiter →
              </button>
            </div>
          </div>

          {/* Phase */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <h2 className="font-bold">Spielsituation</h2>
            <div className="mt-3 flex rounded-lg bg-white/10 p-1 text-sm font-medium">
              <button
                onClick={() => setAfterServe(false)}
                className={`flex-1 py-2 rounded-md ${!afterServe ? 'bg-vsg-cyan text-white' : 'text-slate-300'}`}
              >
                Aufstellung
              </button>
              <button
                onClick={() => setAfterServe(true)}
                className={`flex-1 py-2 rounded-md ${afterServe ? 'bg-vsg-cyan text-white' : 'text-slate-300'}`}
              >
                Nach dem Aufschlag
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {afterServe
                ? 'Sobald der Ball geschlagen ist, darf jeder laufen. Die gestrichelten Linien zeigen die Wege – der Zuspieler läuft ans Netz.'
                : 'Beim Aufschlag muss jeder in seiner Zone stehen. Zone 1 schlägt auf.'}
            </p>
          </div>

          {/* Mannschaft */}
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <h2 className="font-bold">Mannschaft</h2>
            <ul className="mt-3 space-y-1.5">
              {TEAM.map(player => {
                const zone = zoneOf(player, rotation);
                const active = highlightId === player.id;
                return (
                  <li key={player.id}>
                    <button
                      onClick={() => setHighlightId(active ? null : player.id)}
                      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-left ${active ? 'bg-white/15' : 'hover:bg-white/5'}`}
                    >
                      <span
                        className="w-7 h-7 rounded-full grid place-content-center text-xs font-bold shrink-0"
                        style={{ background: ROLE_COLOR[player.role] }}
                      >
                        {player.short}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm truncate">{ROLE_LABEL[player.role]}</span>
                        <span className="block text-xs text-slate-400">
                          Zone {zone} · {isFrontRow(zone) ? 'vorne' : 'hinten'}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-slate-500">Auf einen Spieler tippen, um nur dessen Weg zu sehen.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
