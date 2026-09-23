import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { Content, DEFAULT_CONTENT, DRAFT_KEY } from '../data/content';

interface ContentApi {
  content: Content;
  /** true, wenn die Seite über ?edit=1 geöffnet wurde */
  editing: boolean;
  /** true, wenn ein Entwurf vom Original abweicht */
  dirty: boolean;
  /** Inhalt ändern: `mutate` bekommt eine Kopie und darf sie direkt verändern */
  update: (mutate: (draft: Content) => void) => void;
  /** Entwurf verwerfen, zurück zur content.json */
  reset: () => void;
  /** Entwurf als content.json herunterladen */
  exportJson: () => void;
}

const Ctx = createContext<ContentApi | null>(null);

/** Kennung der eingebauten content.json – ändert sie sich, ist ein alter Entwurf hinfällig */
const BASE_STAMP = JSON.stringify(DEFAULT_CONTENT).length + ':' + JSON.stringify(DEFAULT_CONTENT).slice(0, 200);

function loadDraft(): Content | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { base: string; content: Content };
    if (saved.base !== BASE_STAMP) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return saved.content;
  } catch {
    return null;
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const editing = useMemo(() => new URLSearchParams(window.location.search).get('edit') === '1', []);
  // Der Entwurf gilt nur im Bearbeitungsmodus – die normale Ansicht zeigt immer die content.json
  const [content, setContent] = useState<Content>(() => (editing && loadDraft()) || DEFAULT_CONTENT);

  // Entwurf im Browser sichern, damit beim Neuladen nichts verloren geht
  useEffect(() => {
    if (!editing) return;
    try {
      if (content === DEFAULT_CONTENT) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({ base: BASE_STAMP, content }));
    } catch {
      /* z. B. privater Modus – dann eben ohne Zwischenspeicher */
    }
  }, [content, editing]);

  const update = useCallback((mutate: (draft: Content) => void) => {
    setContent(prev => {
      const draft = structuredClone(prev);
      mutate(draft);
      return draft;
    });
  }, []);

  const reset = useCallback(() => {
    if (confirm('Alle Änderungen verwerfen und die gespeicherte content.json wieder laden?')) setContent(DEFAULT_CONTENT);
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  const dirty = JSON.stringify(content) !== JSON.stringify(DEFAULT_CONTENT);

  return <Ctx.Provider value={{ content, editing, dirty, update, reset, exportJson }}>{children}</Ctx.Provider>;
}

export function useContent(): ContentApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useContent braucht einen ContentProvider');
  return api;
}

/** "**fett**" im Text → <b>; sonst reiner Text */
export function rich(text: string): ReactNode {
  const parts = text.split('**');
  return parts.map((part, i) => (i % 2 === 1 ? <b key={i}>{part}</b> : part));
}

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  as?: ElementType;
  className?: string;
  /** Text mit **fett**-Markierungen rendern */
  richText?: boolean;
}

/**
 * Ein Textbaustein: normal nur Anzeige, im Bearbeitungsmodus direkt tippbar.
 * Gespeichert wird beim Verlassen des Feldes.
 */
export function Editable({ value, onChange, as: Tag = 'span', className, richText }: EditableProps) {
  const { editing } = useContent();
  if (!editing) return <Tag className={className}>{richText ? rich(value) : value}</Tag>;
  return (
    <Tag
      className={`${className ?? ''} editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.innerText.replace(/\n{3,}/g, '\n\n').trim();
        if (next !== value) onChange(next);
      }}
    >
      {value}
    </Tag>
  );
}

/** Schwebende Leiste im Bearbeitungsmodus */
export function EditBar() {
  const { editing, dirty, reset, exportJson } = useContent();
  if (!editing) return null;
  const close = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.location.href = url.toString();
  };
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-2 rounded-2xl bg-amber-400 text-navy-950 px-4 py-3 shadow-panel text-sm font-bold">
      <span className="mr-2">✎ Bearbeitungsmodus{dirty ? ' · ungespeicherte Änderungen' : ''}</span>
      <button onClick={exportJson} className="rounded-xl bg-navy-950 text-white px-4 py-2 hover:bg-navy-800">
        content.json exportieren
      </button>
      <button onClick={reset} disabled={!dirty} className="rounded-xl bg-white/60 px-4 py-2 hover:bg-white disabled:opacity-40">
        Verwerfen
      </button>
      <button onClick={close} className="rounded-xl bg-white/60 px-4 py-2 hover:bg-white">
        Schließen
      </button>
    </div>
  );
}
