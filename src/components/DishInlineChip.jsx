import { useEffect, useRef, useState } from 'react';
import { MessageSquarePlus, X } from 'lucide-react';

const fieldClass =
  'rounded border border-amber-300/80 bg-white px-1.5 py-0.5 text-sm outline-none ring-amber-400 focus:ring-1';

const selectClass =
  'max-w-[7.5rem] rounded border border-amber-200/80 bg-white px-1 py-0.5 text-xs text-slate-600 outline-none';

function MiniField({ value, onSave, className, inputMode = 'text', widthClass = 'w-14' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const ref = useRef(null);

  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  const start = (e) => {
    e.stopPropagation();
    setDraft(String(value ?? ''));
    setEditing(true);
  };

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== String(value ?? '').trim()) await onSave(next);
  };

  if (editing) {
    return (
      <input
        ref={ref}
        type="text"
        inputMode={inputMode}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            setDraft(String(value ?? ''));
            setEditing(false);
          }
        }}
        className={`${fieldClass} ${widthClass} ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      className={`cursor-text rounded px-0.5 transition hover:bg-amber-100/70 ${className}`}
    >
      {value}
    </button>
  );
}

export default function DishInlineChip({
  dish,
  highlighted,
  onUpdate,
  onRemove,
  onAddNoteToItem,
  events,
  onAssignEvent,
}) {
  return (
    <span
      className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2 py-1 shadow-sm ${
        highlighted ? 'ring-2 ring-amber-400/60' : ''
      }`}
    >
      <MiniField
        value={dish.quantity}
        inputMode="numeric"
        onSave={(v) => onUpdate(dish.id, { quantity: v.replace(/\D/g, '') || '1' })}
        className="font-bold text-slate-900"
        widthClass="w-12"
      />
      <MiniField
        value={dish.name}
        onSave={(v) => onUpdate(dish.id, { name: v })}
        className="font-medium text-slate-800"
        widthClass="min-w-[6rem]"
      />
      {onAddNoteToItem && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddNoteToItem(dish);
          }}
          className="rounded p-0.5 text-slate-400 transition hover:bg-amber-100 hover:text-amber-900"
          aria-label="Adicionar nota a este item"
          title="Adicionar nota"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </button>
      )}
      {onAssignEvent && events?.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const targetId = e.target.value;
            if (targetId) onAssignEvent(dish.id, targetId);
            e.target.value = '';
          }}
          onClick={(e) => e.stopPropagation()}
          className={selectClass}
          aria-label="Associar a evento"
        >
          <option value="">→ evento</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.eventName || ev.eventNumber || 'Sem nome'}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(dish.id);
        }}
        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Eliminar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
