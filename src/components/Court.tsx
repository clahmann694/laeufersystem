import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { BENCH, Phase, Placement, ROLE_COLOR, ROLE_LABEL, ZONE_CENTER, Zone, isFrontRow, lineup, textOn } from '../data/volleyball';
import { useContent } from '../content/ContentProvider';

/** Orange wie im Vereins-Diagramm */
export const RULE_COLOR = '#f59e0b';

interface Props {
  rotation: number;
  phase: Phase;
  highlightId: string | null;
  onSelect: (id: string | null) => void;
}

const ZONES: Zone[] = [4, 3, 2, 5, 6, 1];

/**
 * Spielfeldhälfte von oben, Netz oben. 900 × 900 Einheiten = 9 × 9 m.
 * Rechts daneben die Wechselzone mit der Ersatzbank.
 * Im Bearbeitungsmodus lassen sich die Annahmepositionen mit der Maus ziehen.
 */
export function Court({ rotation, phase, highlightId, onSelect }: Props) {
  const { content, editing, update } = useContent();
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const placed = lineup(rotation, phase, content.reception[String(rotation)]);
  const constraints = content.constraints[String(rotation)] ?? [];
  const showRunways = phase === 'annahme';
  // Ziehen nur im Bearbeitungsmodus und nur für Annahmepositionen (Grundpositionen sind die Zonenmitten)
  const draggable = editing && phase !== 'grund';

  /** Mausposition → Feldkoordinaten */
  const toCourt = (e: ReactPointerEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.round(Math.min(900, Math.max(0, pt.x))), y: Math.round(Math.min(900, Math.max(0, pt.y))) };
  };

  const onDragMove = (e: ReactPointerEvent) => {
    if (!dragId) return;
    const p = toCourt(e);
    if (p) update(d => void (d.reception[String(rotation)][dragId] = p));
  };

  return (
    <svg
      ref={svgRef}
      viewBox="-30 -80 1190 1010"
      className="w-full h-auto select-none"
      role="img"
      aria-label={`Spielfeld, Rotation ${rotation}`}
      onPointerMove={onDragMove}
      onPointerUp={() => setDragId(null)}
      onPointerLeave={() => setDragId(null)}
    >
      <defs>
        <marker id="arrow-pink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f0507a" />
        </marker>
        <marker id="arrow-light" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
        </marker>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Netz mit Maschen-Andeutung */}
      <g>
        <rect x={-10} y={-44} width={920} height={14} fill="#ffffff" />
        {Array.from({ length: 46 }, (_, i) => (
          <line key={i} x1={i * 20} y1={-44} x2={i * 20} y2={-30} stroke="#9fd3ee" strokeWidth={2} />
        ))}
        <text x={450} y={-56} textAnchor="middle" fill="#ffffff" fillOpacity={0.7} fontSize={20} fontWeight={700} letterSpacing={5}>
          NETZ
        </text>
      </g>

      {/* Feld */}
      <rect x={0} y={0} width={900} height={300} fill="#5fb5e3" />
      <rect x={0} y={300} width={900} height={600} fill="#3f9fd4" />
      <line x1={0} y1={300} x2={900} y2={300} stroke="#ffffff" strokeWidth={5} />
      <line x1={300} y1={0} x2={300} y2={900} stroke="#ffffff" strokeWidth={2} strokeOpacity={0.35} />
      <line x1={600} y1={0} x2={600} y2={900} stroke="#ffffff" strokeWidth={2} strokeOpacity={0.35} />
      <rect x={0} y={0} width={900} height={900} fill="none" stroke="#ffffff" strokeWidth={6} />

      {/* Zonennummern, groß und blass */}
      {ZONES.map(zone => {
        const c = ZONE_CENTER[zone];
        return (
          <text
            key={zone}
            x={c.x - 60}
            y={isFrontRow(zone) ? 230 : 850}
            textAnchor="middle"
            fill="#ffffff"
            fillOpacity={0.22}
            fontSize={170}
            fontWeight={900}
            letterSpacing={-8}
          >
            {zone}
          </text>
        );
      })}

      {/* Wechselzone */}
      <g>
        <rect x={960} y={-44} width={180} height={944} rx={22} fill="#071522" fillOpacity={0.35} stroke="#ffffff" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="8 8" />
        <text x={1050} y={4} textAnchor="middle" fill="#ffffff" fillOpacity={0.8} fontSize={17} fontWeight={800} letterSpacing={3}>
          WECHSELZONE
        </text>
        <text x={1050} y={28} textAnchor="middle" fill="#ffffff" fillOpacity={0.45} fontSize={14}>
          Seitenlinie
        </text>
        <text x={1050} y={420} textAnchor="middle" fill="#ffffff" fillOpacity={0.45} fontSize={14}>
          <tspan x={1050}>Die Libera spielt</tspan>
          <tspan x={1050} dy={20}>für die hintere</tspan>
          <tspan x={1050} dy={20}>Mitte – die sitzt</tspan>
          <tspan x={1050} dy={20}>so lange hier.</tspan>
        </text>
        <circle cx={BENCH.x} cy={BENCH.y} r={54} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="6 8" />
        <text x={BENCH.x} y={BENCH.y - 74} textAnchor="middle" fill="#ffffff" fillOpacity={0.8} fontSize={15} fontWeight={800} letterSpacing={3}>
          ERSATZBANK
        </text>
      </g>

      {/* Laufwege von der Grundposition */}
      {showRunways &&
        placed
          .filter(p => p.onCourt && dist(p.base, p.at) > 40)
          .map(p => {
            const dim = highlightId !== null && highlightId !== p.figure.id;
            const setter = p.figure.role === 'zuspieler';
            return (
              <line
                key={`w-${p.figure.id}`}
                x1={p.base.x}
                y1={p.base.y}
                x2={p.at.x}
                y2={p.at.y}
                stroke={setter ? ROLE_COLOR.zuspieler : '#ffffff'}
                strokeWidth={setter ? 9 : 5}
                strokeLinecap="round"
                strokeDasharray="18 14"
                markerEnd={setter ? 'url(#arrow-pink)' : 'url(#arrow-light)'}
                opacity={dim ? 0.1 : setter ? 0.9 : 0.4}
                className="runway"
              />
            );
          })}

      {/* Stellungsregel-Linien: senkrecht = links/rechts, waagerecht = vorne/hinten */}
      {phase === 'erklaerung' &&
        constraints.map((c, i) => {
          const a = placed.find(p => p.figure.id === c.a)?.at;
          const b = placed.find(p => p.figure.id === c.b)?.at;
          if (!a || !b) return null;
          const vertical = c.kind === 'left';
          // Linie mittig zwischen beiden – oder, wenn sie eng stehen, wie im PDF direkt an der Fußkante von `a`
          const x1 = vertical ? Math.min((a.x + b.x) / 2, a.x + 58) : Math.min(a.x, b.x) - 80;
          const x2 = vertical ? x1 : Math.max(a.x, b.x) + 80;
          const y1 = vertical ? Math.min(a.y, b.y) - 80 : Math.min((a.y + b.y) / 2, a.y + 58);
          const y2 = vertical ? Math.max(a.y, b.y) + 80 : y1;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={RULE_COLOR} strokeWidth={7} strokeLinecap="round" opacity={0.9} />
              <circle cx={x1} cy={y1} r={22} fill={RULE_COLOR} stroke="#071522" strokeWidth={3} />
              <text x={x1} y={y1 + 8} textAnchor="middle" fill="#071522" fontSize={24} fontWeight={900}>
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* Figuren */}
      {placed.map(p => (
        <FigureDot
          key={p.figure.id}
          placement={p}
          dim={highlightId !== null && highlightId !== p.figure.id}
          dragging={dragId === p.figure.id}
          onSelect={onSelect}
          onDragStart={draggable && p.onCourt ? e => (e.currentTarget.setPointerCapture?.(e.pointerId), setDragId(p.figure.id)) : undefined}
        />
      ))}

      {/* Hinweis-Pille unten */}
      {phase === 'annahme' && (
        <g transform="translate(450 880)">
          <rect x={-150} y={-22} width={300} height={44} rx={22} fill="#071522" fillOpacity={0.85} />
          <circle cx={-120} cy={0} r={6} fill="#f0507a" />
          <text x={12} y={6} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={800} letterSpacing={2}>
            KONTAKT ZUR ANNAHME
          </text>
        </g>
      )}
      {draggable && (
        <text x={450} y={-8} textAnchor="middle" fill={RULE_COLOR} fontSize={18} fontWeight={800} letterSpacing={2}>
          ✎ FIGUREN MIT DER MAUS ZIEHEN
        </text>
      )}
    </svg>
  );
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function FigureDot({
  placement,
  dim,
  dragging,
  onSelect,
  onDragStart,
}: {
  placement: Placement;
  dim: boolean;
  dragging: boolean;
  onSelect: (id: string | null) => void;
  onDragStart?: (e: ReactPointerEvent<SVGGElement>) => void;
}) {
  const { figure, at, zone, onCourt, receives } = placement;
  const color = ROLE_COLOR[figure.role];
  return (
    <g
      // CSS-Transform statt SVG-Attribut: nur so animiert Safari die Bewegung
      className={`figure${dragging ? ' figure--dragging' : ''}`}
      style={{ transform: `translate(${at.x}px, ${at.y}px)`, cursor: onDragStart ? 'grab' : 'pointer' }}
      opacity={dim ? 0.3 : onCourt ? 1 : 0.85}
      onClick={() => !onDragStart && onSelect(dim ? figure.id : null)}
      onPointerDown={onDragStart}
    >
      <title>{`${figure.name} – ${onCourt ? `Zone ${zone}` : 'Wechselzone'}`}</title>
      {receives && (
        <>
          <circle r={66} fill="none" stroke="#f0507a" strokeWidth={3} strokeOpacity={0.7} />
          <text y={-80} textAnchor="middle" fill="#ffffff" fontSize={13} fontWeight={800} letterSpacing={2}>
            ANNAHME
          </text>
        </>
      )}
      <circle r={50} fill={color} stroke={onDragStart ? RULE_COLOR : '#fff'} strokeWidth={7} filter="url(#shadow)" />
      <text textAnchor="middle" y={11} fontSize={figure.short.length > 1 ? 30 : 34} fontWeight={900} fill={textOn(figure.role)}>
        {figure.short}
      </text>
      <g transform="translate(0 78)">
        <rect x={-46} y={-16} width={92} height={32} rx={8} fill="#071522" fillOpacity={0.9} />
        <text textAnchor="middle" y={5} fill="#fff" fontSize={16} fontWeight={700}>
          {onCourt ? ROLE_LABEL[figure.role] : 'wartet hier'}
        </text>
      </g>
    </g>
  );
}
