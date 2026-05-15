import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getNoteText, isEventScopeNote } from '../utils/planEntries';

const fieldClass =
  'w-full resize-none rounded-lg border border-amber-300/60 bg-white/50 px-2 py-1.5 text-sm text-slate-800 outline-none ring-amber-400 focus:ring-1';

export default function NotePostIt({
  entry,
  index = 0,
  highlighted,
  onUpdate,
  onRemove,
  compact = false,
}) {
  const text = getNoteText(entry);
  const eventWide = isEventScopeNote(entry);
  const tint = index % 2 === 0 ? 'bg-post-it' : 'bg-post-it-blue';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const ref = useRef(null);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== text) await onUpdate?.(entry.id, { text: next });
  };

  return (
    <article
      className={`group relative ${compact ? 'max-w-sm' : 'w-full'} rounded-2xl border border-amber-200/70 p-3 shadow-md transition ${tint} ${
        highlighted ? 'ring-2 ring-slate-900/20' : ''
      }`}
      style={{ transform: index % 2 === 0 ? 'rotate(-0.5deg)' : 'rotate(0.4deg)' }}
    >
      {eventWide && (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900/70">
          Nota geral do evento
        </p>
      )}

      {editing ? (
        <textarea
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          rows={compact ? 2 : 3}
          className={fieldClass}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="block w-full whitespace-pre-wrap text-left text-sm leading-relaxed text-slate-800"
        >
          {text || 'Nota vazia'}
        </button>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.(entry.id);
        }}
        className="absolute right-2 top-2 z-10 rounded p-1 text-slate-400 opacity-70 transition hover:bg-white/80 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Eliminar nota"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </article>
  );
}
