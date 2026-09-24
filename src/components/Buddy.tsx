import { Editable } from '../content/ContentProvider';

/** Die freigestellten Maskottchen in public/buddies/ */
export type BuddyName =
  | 'kuh-winkt' | 'kuh-sitzt' | 'kuh-jubelt' | 'kuh-liegt' | 'kuh-herz'
  | 'ball-winkt' | 'ball-springt' | 'ball-sitzt' | 'ball-daumen' | 'ball-jubelt'
  | 'elefant-winkt' | 'elefant-sitzt' | 'elefant-tanzt' | 'elefant-kichert' | 'elefant-hallo';

interface Props {
  name: BuddyName;
  /** Sprechblase; leer = keine Blase */
  say?: string;
  onSay?: (text: string) => void;
  /** Blase links oder rechts von der Figur */
  side?: 'left' | 'right';
  className?: string;
}

/**
 * Ein Maskottchen als Begleiter: freigestellt, mit weichem Schatten und optionaler
 * Sprechblase. Die Blase ist dunkel mit heller Schrift, damit sie auch bei
 * Dark-Mode-Erweiterungen lesbar bleibt.
 */
export function Buddy({ name, say, onSay, side = 'left', className = '' }: Props) {
  const src = `${import.meta.env.BASE_URL}buddies/${name}.png`;
  return (
    <div className={`relative flex items-end gap-2 ${side === 'right' ? 'flex-row' : 'flex-row-reverse'} ${className}`}>
      <img src={src} alt="" aria-hidden className="buddy shrink-0 h-full w-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]" />
      {say !== undefined && (
        <div
          className={`relative min-w-0 self-start mt-1 max-w-[11rem] sm:max-w-[13rem] rounded-2xl bg-navy-950 text-white border border-white/15 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-bold leading-snug shadow-dot ${
            side === 'right' ? 'rounded-bl-md' : 'rounded-br-md'
          }`}
        >
          {onSay ? <Editable value={say} onChange={onSay} /> : say}
        </div>
      )}
    </div>
  );
}
