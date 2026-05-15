import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { formatDishDateLabel } from '../utils/dishes';

const fieldClass =
  'rounded-md border border-amber-300/80 bg-white px-2 py-1 outline-none ring-amber-400 focus:ring-2';

function InlineField({ value, onSave, className, inputMode = 'text', widthClass = 'w-full' }) {
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
      className={`cursor-text rounded px-1 text-left transition hover:bg-amber-100/60 ${className}`}
    >
      {value}
    </button>
  );
}

export default function DishTicketRow({ dish, onUpdate, onRemove }) {
  const dateLabel = formatDishDateLabel(dish.date) || 'Sem data';
  const location = (dish.location ?? '').trim();

  return (
    <li className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-white/80 px-3 py-2.5">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-semibold text-amber-900/80">{dateLabel}</p>
        {location && (
          <p className="text-xs text-slate-500">{location}</p>
        )}
        <div className="flex items-center gap-2">
          <InlineField
            value={dish.quantity}
            inputMode="numeric"
            onSave={(v) => onUpdate(dish.id, { quantity: v.replace(/\D/g, '') || '1' })}
            className="min-w-[2.5rem] text-center text-lg font-bold text-slate-900"
            widthClass="w-16"
          />
          <InlineField
            value={dish.name}
            onSave={(v) => onUpdate(dish.id, { name: v })}
            className="min-w-0 flex-1 text-base font-medium text-slate-800"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(dish.id)}
        className="touch-target flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
