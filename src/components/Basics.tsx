import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LIBERO, ROLE_COLOR, TEAM, textOn } from '../data/volleyball';
import { Editable, useContent } from '../content/ContentProvider';
import { Buddy } from './Buddy';

const SKETCHES = [RotationSketch, MomentSketch, LeftRightSketch, PairsSketch, FeetSketch, FrontBackSketch, FiveOneSketch, WhyRunSketch];

/**
 * Die Grundregeln, die man braucht, um das Läufersystem zu verstehen –
 * jede mit einer kleinen Skizze. Quellen: FIVB-Regeln 2025–2028, Regel 7.4 / 7.5 / 13.2 / 19.
 */
export function Basics() {
  const { content, editing, update } = useContent();
  const b = content.basics;
  return (
    <section className="light bg-paper text-navy-900">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_auto] items-end">
          <div className="max-w-3xl">
            <p className="eyebrow text-navy-900/70 flex items-center gap-2">
              <span className="text-navy-900/40 mr-6">01</span>
              <span className="w-2 h-2 rounded-full bg-vsg-400" /> Grundlagen
            </p>
            <h2 className="headline mt-6 text-[clamp(2.6rem,7vw,6rem)]">
              <Editable value={b.title1} onChange={v => update(d => void (d.basics.title1 = v))} />
              {(editing || b.title2) && (
                <>
                  <br />
                  <Editable className="text-vsg-700" value={b.title2} onChange={v => update(d => void (d.basics.title2 = v))} />
                </>
              )}
            </h2>
            <Editable as="p" className="mt-8 text-lg leading-relaxed text-navy-900/70" value={b.intro} onChange={v => update(d => void (d.basics.intro = v))} />
          </div>
          <Buddy
            name="kuh-sitzt"
            say={content.buddies.grundlagen}
            onSay={v => update(d => void (d.buddies.grundlagen = v))}
            className="h-36 sm:h-52 lg:h-64 justify-self-end"
          />
        </div>

        <RuleStepper />
        <Legend />
      </div>
    </section>
  );
}

/** Eine Regel pro Schritt: Skizze groß, Weiter/Zurück, Punkte 1–8, Pfeiltasten */
function RuleStepper() {
  const { content, editing, update } = useContent();
  const rules = content.basics.rules;
  const [step, setStep] = useState(() => Math.max(0, Math.min(7, Number(new URLSearchParams(window.location.search).get('regel') || 1) - 1)));
  const last = rules.length - 1;
  const card = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const go = (i: number) => {
    const next = Math.max(0, Math.min(last, i));
    setStep(next);
    // Auf dem Handy: die Karte wieder ganz nach oben holen, damit Skizze und Knöpfe im Blick bleiben
    const top = card.current?.getBoundingClientRect().top ?? 0;
    if (next !== step && top < 56) card.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'ArrowRight') go(step + 1);
      if (e.key === 'ArrowLeft') go(step - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Wischen nach links/rechts blättert
  const onTouchStart = (e: React.TouchEvent) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY });
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current || editing) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(step + (dx < 0 ? 1 : -1));
  };

  const rule = rules[step];
  const Sketch = SKETCHES[step] ?? WhyRunSketch;
  const controls = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => go(step - 1)}
        disabled={step === 0}
        className="rounded-2xl border border-navy-900/15 px-4 py-2.5 md:py-3 font-bold text-navy-900/80 hover:bg-navy-900/5 disabled:opacity-30"
      >
        ← <span className="hidden sm:inline">Zurück</span>
      </button>
      <div className="flex gap-1.5" role="tablist" aria-label="Regeln">
        {rules.map((r, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === step}
            aria-label={`Regel ${i + 1}: ${r.title}`}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all ${i === step ? 'w-7 bg-vsg-500' : 'w-2.5 bg-navy-900/20 hover:bg-navy-900/40'}`}
          />
        ))}
      </div>
      {step < last ? (
        <button onClick={() => go(step + 1)} className="rounded-2xl bg-navy-900 text-white px-5 py-2.5 md:py-3 font-bold hover:bg-navy-800">
          Weiter →
        </button>
      ) : (
        <a href="#/trainer" className="rounded-2xl bg-vsg-500 text-white px-4 py-2.5 md:py-3 font-bold hover:bg-vsg-600 text-sm sm:text-base">
          <span className="hidden sm:inline">
            <Editable value={content.basics.cta} onChange={v => update(d => void (d.basics.cta = v))} />
          </span>
          <span className="sm:hidden">Zum Trainer</span> ↓
        </a>
      )}
    </div>
  );

  return (
    <div
      ref={card}
      className="mt-8 md:mt-12 scroll-mt-16 rounded-[26px] bg-paper-card border border-navy-900/10 shadow-sm overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(280px,5fr)_minmax(0,7fr)]">
        <div className="bg-navy-900 p-3 md:p-8 grid place-content-center">
          <div className="w-full max-w-[250px] md:max-w-[420px] mx-auto">
            <Sketch />
          </div>
        </div>
        <div className="p-4 md:p-10 flex flex-col">
          {/* Handy: Steuerung direkt unter der Skizze, damit man ohne Scrollen blättern kann */}
          <div className="md:hidden pb-4 mb-4 border-b border-navy-900/10">{controls}</div>
          <p className="eyebrow text-navy-900/50">
            Regel {step + 1} von {rules.length}
          </p>
          <h3 className="mt-2 md:mt-3 text-xl md:text-3xl font-semibold tracking-tight">
            <Editable value={rule.title} onChange={v => update(d => void (d.basics.rules[step].title = v))} />
          </h3>
          <Editable
            as="p"
            richText
            className="mt-3 md:mt-4 text-[15px] md:text-[17px] leading-relaxed text-navy-900/75"
            value={rule.text}
            onChange={v => update(d => void (d.basics.rules[step].text = v))}
          />
          <div className="hidden md:block mt-auto pt-8">{controls}</div>
        </div>
      </div>
    </div>
  );
}

/** Wer ist wer: die farbigen Kürzel aus dem Trainer und ihre Rolle */
function Legend() {
  return (
    <div className="mt-8">
      <p className="eyebrow text-navy-900/50 mb-4">Legende · so heißen die Figuren im Trainer</p>
      <ul className="flex flex-wrap gap-3">
        {[...TEAM, LIBERO].map(f => (
          <li key={f.id} className="flex items-center gap-3 rounded-full bg-paper-card border border-navy-900/10 pl-1.5 pr-5 py-1.5">
            <span
              className="w-10 h-10 rounded-full grid place-content-center text-xs font-black"
              style={{ background: ROLE_COLOR[f.role], color: textOn(f.role) }}
            >
              {f.short}
            </span>
            <span className="font-bold">{f.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Skizzen: Feldhälfte 300 × 300, Netz oben, 3-m-Linie bei y = 100 ---------- */

const ZONE_XY: Record<number, [number, number]> = { 4: [50, 55], 3: [150, 55], 2: [250, 55], 5: [50, 200], 6: [150, 200], 1: [250, 200] };

function Sketch({ children, label, viewBox = '-14 -34 328 364' }: { children: ReactNode; label?: string; viewBox?: string }) {
  return (
    <svg viewBox={viewBox} className="w-full h-auto" role="img" aria-label={label}>
      <defs>
        <marker id="mini-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8fd8f6" />
        </marker>
      </defs>
      <rect x={-10} y={-26} width={320} height={8} fill="#fff" />
      <rect x={0} y={0} width={300} height={100} fill="#5fb5e3" />
      <rect x={0} y={100} width={300} height={200} fill="#3f9fd4" />
      <line x1={0} y1={100} x2={300} y2={100} stroke="#fff" strokeWidth={2.5} />
      <rect x={0} y={0} width={300} height={300} fill="none" stroke="#fff" strokeWidth={3} />
      {children}
    </svg>
  );
}

function ZoneNumbers({ dim }: { dim?: boolean }) {
  return (
    <>
      {Object.entries(ZONE_XY).map(([z, [x, y]]) => (
        <text key={z} x={x} y={y + 12} textAnchor="middle" fill="#fff" fillOpacity={dim ? 0.25 : 0.45} fontSize={34} fontWeight={900}>
          {z}
        </text>
      ))}
    </>
  );
}

function Dot({ x, y, label, color = '#fff', text = '#0b1a27', r = 17 }: { x: number; y: number; label: string; color?: string; text?: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={color} stroke="#0b1a27" strokeWidth={2.5} />
      <text y={5} textAnchor="middle" fill={text} fontSize={15} fontWeight={900}>
        {label}
      </text>
    </g>
  );
}

function Caption({ y = 322, children }: { y?: number; children: ReactNode }) {
  return (
    <text x={150} y={y} textAnchor="middle" fill="#8fd8f6" fontSize={13} fontWeight={800} letterSpacing={1.5}>
      {children}
    </text>
  );
}

function RotationSketch() {
  const cycle = [1, 6, 5, 4, 3, 2, 1];
  return (
    <Sketch label="Rotation im Uhrzeigersinn">
      <ZoneNumbers />
      {cycle.slice(0, -1).map((z, i) => {
        const [x1, y1] = ZONE_XY[z];
        const [x2, y2] = ZONE_XY[cycle[i + 1]];
        // Pfeile etwas kürzen, damit sie nicht in die Zahlen laufen
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const k = 30 / len;
        return (
          <line
            key={z}
            x1={x1 + dx * k}
            y1={y1 + dy * k}
            x2={x2 - dx * k}
            y2={y2 - dy * k}
            stroke="#8fd8f6"
            strokeWidth={4}
            strokeLinecap="round"
            markerEnd="url(#mini-arrow)"
          />
        );
      })}
      <circle cx={250} cy={200} r={34} fill="none" stroke="#f7e26b" strokeWidth={3} strokeDasharray="6 5" />
      <Caption>IM UHRZEIGERSINN DREHEN</Caption>
    </Sketch>
  );
}

function MomentSketch() {
  return (
    <Sketch label="Ordnung gilt beim Aufschlagkontakt">
      <ZoneNumbers dim />
      {Object.entries(ZONE_XY).map(([z, [x, y]]) => (
        <circle key={z} cx={x} cy={y} r={16} fill="#fff" fillOpacity={0.9} stroke="#0b1a27" strokeWidth={2} />
      ))}
      {/* Ball kommt von der anderen Seite */}
      <circle cx={225} cy={-14} r={9} fill="#f7e26b" stroke="#0b1a27" strokeWidth={2} />
      <path d="M 225 -14 Q 190 40 150 110" fill="none" stroke="#f7e26b" strokeWidth={3} strokeDasharray="5 6" />
      <g transform="translate(150 150)">
        <rect x={-92} y={-16} width={184} height={32} rx={16} fill="#0b1a27" fillOpacity={0.85} />
        <text y={5} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={800} letterSpacing={1}>
          JETZT muss es stimmen
        </text>
      </g>
      <Caption>DANACH: ALLE FREI (7.4.4)</Caption>
    </Sketch>
  );
}

function LeftRightSketch() {
  return (
    <Sketch label="Reihenfolge von links nach rechts">
      <ZoneNumbers dim />
      {/* vorne: alle drei links zusammengedrängt, Reihenfolge stimmt */}
      <Dot x={40} y={55} label="4" />
      <Dot x={82} y={62} label="3" />
      <Dot x={124} y={50} label="2" />
      <text x={165} y={60} fill="#7ef0b0" fontSize={22} fontWeight={900}>
        ✓
      </text>
      {/* hinten: 6 links von 5 – Fehler */}
      <Dot x={100} y={200} label="6" color="#f0507a" text="#fff" />
      <Dot x={150} y={210} label="5" color="#f0507a" text="#fff" />
      <Dot x={250} y={200} label="1" />
      <text x={125} y={172} textAnchor="middle" fill="#f0507a" fontSize={22} fontWeight={900}>
        ✗
      </text>
      <line x1={40} y1={88} x2={124} y2={88} stroke="#8fd8f6" strokeWidth={3} markerEnd="url(#mini-arrow)" />
      <Caption>NUR DIE REIHENFOLGE ZÄHLT</Caption>
    </Sketch>
  );
}

function PairsSketch() {
  const pairs: [number, number][] = [
    [4, 5],
    [3, 6],
    [2, 1],
  ];
  const pos: Record<number, [number, number]> = { 4: [50, 150], 5: [50, 250], 3: [150, 40], 6: [150, 120], 2: [250, 60], 1: [250, 200] };
  return (
    <Sketch label="Paare vorne–hinten">
      <ZoneNumbers dim />
      {pairs.map(([f, b]) => (
        <line key={f} x1={pos[f][0]} y1={pos[f][1]} x2={pos[b][0]} y2={pos[b][1]} stroke="#8fd8f6" strokeWidth={3} strokeDasharray="5 5" />
      ))}
      {Object.entries(pos).map(([z, [x, y]]) => (
        <Dot key={z} x={x} y={y} label={z} color={Number(z) === 4 || Number(z) === 6 ? '#f7e26b' : '#fff'} />
      ))}
      <text x={85} y={140} fill="#f7e26b" fontSize={12} fontWeight={700}>
        4 tiefer als 6 –
      </text>
      <text x={85} y={155} fill="#f7e26b" fontSize={12} fontWeight={700}>
        trotzdem ok
      </text>
      <Caption>4 VOR 5 · 3 VOR 6 · 2 VOR 1</Caption>
    </Sketch>
  );
}

/** Ein Fußabdruck: Sohle plus Zehen, Spitze zeigt zum Netz. `side` spiegelt für den linken Fuß. */
function Foot({ x, y, side, color }: { x: number; y: number; side: 'left' | 'right'; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${side === 'left' ? -1 : 1} 1)`} fill={color} stroke="#0b1a27" strokeWidth={1.5}>
      <path d="M -6 -4 C -6 -13 3 -15 6 -9 C 8 -5 7 2 6 7 C 5 13 6 18 2 20 C -3 22 -6 17 -6 11 C -7 5 -8 0 -6 -4 Z" />
      <circle cx={-6} cy={-16} r={2.6} />
      <circle cx={-1.5} cy={-18} r={2.2} />
      <circle cx={2.5} cy={-17.5} r={1.9} />
      <circle cx={6} cy={-16} r={1.7} />
      <circle cx={9} cy={-14} r={1.5} />
    </g>
  );
}

/**
 * Animation zu Regel 5: Die 3 steht fest, die 4 rückt von links immer weiter nach rechts.
 * Erlaubt, solange der linke Fuß der 4 nicht rechts vom rechten Fuß der 3 ist (FIVB 7.4.3.2).
 */
function FeetSketch() {
  const THREE_LEFT = 118;
  const THREE_RIGHT = 144; // Grenze
  const START = 40;
  const END = 196;
  const [x, setX] = useState(START); // linker Fuß der 4
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setX(THREE_RIGHT);
      return;
    }
    let pos = START;
    let pause = 0;
    const t = setInterval(() => {
      if (pause > 0) {
        pause--;
        return;
      }
      pos += 2;
      // kurz innehalten genau an der Grenze und am Ende
      if (pos === THREE_RIGHT) pause = 20;
      if (pos > END) {
        pos = START;
        pause = 12;
      }
      setX(pos);
    }, 40);
    return () => clearInterval(t);
  }, []);
  const ok = x <= THREE_RIGHT;
  const color = ok ? '#7ef0b0' : '#f0507a';
  return (
    <Sketch label="Nur die Füße zählen – Animation" viewBox="4 -30 226 214">
      {/* Status */}
      <g transform="translate(117 128)">
        <rect x={-80} y={-15} width={160} height={30} rx={15} fill="#0b1a27" stroke={color} strokeWidth={2} />
        <text y={6} textAnchor="middle" fill={color} fontSize={15} fontWeight={900}>
          {ok ? (x === THREE_RIGHT ? '✓ gleichauf – erlaubt' : '✓ erlaubt') : '✗ Stellungsfehler'}
        </text>
      </g>
      {/* Grenze: rechter Fuß der 3 */}
      <line x1={THREE_RIGHT} y1={4} x2={THREE_RIGHT} y2={98} stroke="#fff" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="5 5" />
      {/* 4 (oben), wandert */}
      <Foot x={x} y={30} side="left" color={ok ? '#fff' : '#f0507a'} />
      <Foot x={x + 26} y={29} side="right" color="#fff" />
      <text x={x - 16} y={36} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={900}>
        4
      </text>
      {/* 3 (unten), steht fest */}
      <Foot x={THREE_LEFT} y={76} side="left" color="#8fd8f6" />
      <Foot x={THREE_RIGHT} y={75} side="right" color="#8fd8f6" />
      <text x={THREE_RIGHT + 24} y={82} textAnchor="middle" fill="#8fd8f6" fontSize={16} fontWeight={900}>
        3
      </text>
      <text x={117} y={160} textAnchor="middle" fill="#fff" fillOpacity={0.9} fontSize={10.5}>
        Bis der linke Fuß der 4 am rechten
      </text>
      <text x={117} y={174} textAnchor="middle" fill="#fff" fillOpacity={0.9} fontSize={10.5}>
        Fuß der 3 vorbei ist: erlaubt
      </text>
    </Sketch>
  );
}

function FrontBackSketch() {
  return (
    <Sketch label="Vorderfeld und Hinterfeld">
      <rect x={0} y={0} width={300} height={100} fill="#7ef0b0" fillOpacity={0.18} />
      <ZoneNumbers dim />
      <text x={150} y={40} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={800} letterSpacing={1}>
        ANGRIFF + BLOCK
      </text>
      <text x={150} y={58} textAnchor="middle" fill="#fff" fillOpacity={0.8} fontSize={12}>
        über Netzhöhe erlaubt
      </text>
      <text x={150} y={150} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={800} letterSpacing={1}>
        HINTERFELD
      </text>
      <text x={150} y={168} textAnchor="middle" fill="#fff" fillOpacity={0.8} fontSize={12}>
        Angriff nur mit Absprung hinter 3 m
      </text>
      <Dot x={150} y={230} label="L" color={ROLE_COLOR.libero} />
      <text x={150} y={268} textAnchor="middle" fill="#fff" fillOpacity={0.8} fontSize={12}>
        Libera: nur hinten, kein Block
      </text>
      <text x={292} y={92} textAnchor="end" fill="#fff" fillOpacity={0.7} fontSize={11}>
        3-m-Linie
      </text>
      <Caption>WER VORNE IST, DARF ANGREIFEN</Caption>
    </Sketch>
  );
}

function FiveOneSketch() {
  const order: [number, string, string][] = [
    [1, 'Z', ROLE_COLOR.zuspieler],
    [2, 'A1', ROLE_COLOR.aussen],
    [3, 'M1', ROLE_COLOR.mittelblocker],
    [4, 'D', ROLE_COLOR.diagonal],
    [5, 'A2', ROLE_COLOR.aussen],
    [6, 'L', ROLE_COLOR.libero],
  ];
  return (
    <Sketch label="5-1: Z und D gegenüber">
      <ZoneNumbers dim />
      <line x1={250} y1={200} x2={50} y2={55} stroke="#f0507a" strokeWidth={3} strokeDasharray="6 5" />
      {order.map(([z, label, color]) => (
        <Dot key={z} x={ZONE_XY[z][0]} y={ZONE_XY[z][1]} label={label} color={color} text={label === 'L' ? '#0b1a27' : '#fff'} r={19} />
      ))}
      <Caption>Z UND D IMMER GEGENÜBER</Caption>
    </Sketch>
  );
}

function WhyRunSketch() {
  return (
    <Sketch label="Warum die Zuspielerin läuft">
      <ZoneNumbers dim />
      {/* Ziel: Zuspielfenster am Netz rechts der Mitte */}
      <rect x={165} y={4} width={70} height={30} rx={8} fill="none" stroke="#f0507a" strokeWidth={2.5} strokeDasharray="5 4" />
      <text x={200} y={-6} textAnchor="middle" fill="#f0507a" fontSize={12} fontWeight={800}>
        Ziel: immer hier
      </text>
      {/* Grundposition regelkonform, aber schon nah am Weg */}
      <path d="M 268 232 L 208 30" fill="none" stroke="#f0507a" strokeWidth={4} strokeLinecap="round" strokeDasharray="8 7" markerEnd="url(#mini-arrow)" />
      <Dot x={268} y={232} label="Z" color={ROLE_COLOR.zuspieler} text="#fff" r={19} />
      <Dot x={225} y={205} label="A1" color={ROLE_COLOR.aussen} text="#fff" />
      <Dot x={150} y={200} label="L" color={ROLE_COLOR.libero} />
      <Dot x={60} y={200} label="A2" color={ROLE_COLOR.aussen} text="#fff" />
      <Dot x={150} y={105} label="M1" color={ROLE_COLOR.mittelblocker} text="#fff" />
      <Dot x={28} y={105} label="D" color={ROLE_COLOR.diagonal} text="#fff" />
      <Caption>RICHTIG STEHEN, SOFORT LAUFEN</Caption>
    </Sketch>
  );
}
