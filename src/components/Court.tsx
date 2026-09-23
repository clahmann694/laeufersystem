import { Player, Point, ROLE_COLOR, TEAM, ZONE_CENTER, isFrontRow, targetOf, zoneOf } from '../data/volleyball';

interface Props {
  rotation: number;
  /** false = Aufstellung beim Aufschlag, true = Positionen nach dem Aufschlag */
  afterServe: boolean;
  highlightId: string | null;
  onSelect: (id: string | null) => void;
}

/** Spielfeldhälfte von oben, Netz oben. 900 × 900 Einheiten = 9 × 9 Meter. */
export function Court({ rotation, afterServe, highlightId, onSelect }: Props) {
  const placed = TEAM.map(player => {
    const zone = zoneOf(player, rotation);
    const from = ZONE_CENTER[zone];
    const to = targetOf(player, zone);
    return { player, zone, from, to, at: afterServe ? to : from };
  });

  return (
    <svg viewBox="-70 -110 1040 1090" className="w-full h-auto select-none" role="img" aria-label={`Spielfeld, Rotation ${rotation}`}>
      {/* Netz */}
      <g>
        <line x1={-60} y1={-40} x2={960} y2={-40} stroke="#e2e8f0" strokeWidth={10} />
        <text x={450} y={-62} textAnchor="middle" className="fill-slate-300" fontSize={34}>
          Netz
        </text>
      </g>

      {/* Feld */}
      <rect x={0} y={0} width={900} height={300} fill="#e8853a" />
      <rect x={0} y={300} width={900} height={600} fill="#c96a28" />
      <rect x={0} y={0} width={900} height={900} fill="none" stroke="#fff" strokeWidth={6} />
      <line x1={0} y1={300} x2={900} y2={300} stroke="#fff" strokeWidth={6} />
      <text x={880} y={288} textAnchor="end" className="fill-white/55" fontSize={26}>
        3-Meter-Linie
      </text>

      {/* Zonennummern */}
      {(Object.keys(ZONE_CENTER) as unknown as Array<keyof typeof ZONE_CENTER>).map(z => {
        const zone = Number(z) as 1 | 2 | 3 | 4 | 5 | 6;
        const c = ZONE_CENTER[zone];
        return (
          <text key={zone} x={c.x} y={isFrontRow(zone) ? 268 : 862} textAnchor="middle" className="fill-white/45" fontSize={64} fontWeight={700}>
            {zone}
          </text>
        );
      })}

      {/* Laufwege */}
      {afterServe &&
        placed.map(({ player, from, to }) => {
          const dim = highlightId !== null && highlightId !== player.id;
          return (
            <line
              key={`w-${player.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={ROLE_COLOR[player.role]}
              strokeWidth={player.role === 'zuspieler' ? 9 : 5}
              strokeDasharray="18 14"
              opacity={dim ? 0.15 : 0.85}
            />
          );
        })}

      {/* Spieler */}
      {placed.map(({ player, zone, at }) => (
        <PlayerDot
          key={player.id}
          player={player}
          at={at}
          zone={zone}
          dim={highlightId !== null && highlightId !== player.id}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}

function PlayerDot({
  player,
  at,
  zone,
  dim,
  onSelect,
}: {
  player: Player;
  at: Point;
  zone: number;
  dim: boolean;
  onSelect: (id: string | null) => void;
}) {
  return (
    <g
      transform={`translate(${at.x} ${at.y})`}
      style={{ transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
      opacity={dim ? 0.3 : 1}
      onClick={() => onSelect(dim ? player.id : null)}
    >
      <title>{`${player.name} – Zone ${zone}`}</title>
      <circle r={58} fill={ROLE_COLOR[player.role]} stroke="#fff" strokeWidth={6} />
      <text textAnchor="middle" y={16} fontSize={44} fontWeight={800} className="fill-white">
        {player.short}
      </text>
    </g>
  );
}
