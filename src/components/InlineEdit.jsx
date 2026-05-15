import { useEffect, useRef, useState } from 'react';

const fieldInputClass =
  'w-full min-w-0 rounded-lg border border-amber-300/80 bg-white/90 px-2 py-1.5 text-inherit outline-none ring-amber-400 focus:ring-2';

export function InlineEditableText({
  value,
  placeholder,
  onSave,
  className = '',
  emptyClassName = 'text-amber-800/60 italic',
  inputClassName = fieldInputClass,
  as = 'span',
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = (event) => {
    event.stopPropagation();
    setDraft(value ?? '');
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value ?? '');
    setEditing(false);
  };

  const commit = async () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== (value ?? '').trim()) {
      await onSave(next);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') cancel();
        }}
        className={inputClassName}
      />
    );
  }

  const Tag = as;
  const isEmpty = !(value ?? '').trim();

  return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={isEmpty ? startEdit : undefined}
      onDoubleClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') startEdit(e);
      }}
      className={`cursor-text rounded px-0.5 transition hover:bg-amber-100/50 ${isEmpty ? emptyClassName : className}`}
    >
      {isEmpty ? placeholder : value}
    </Tag>
  );
}

export function InlineEditablePax({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value != null ? String(value) : '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = (event) => {
    event.stopPropagation();
    setDraft(value != null ? String(value) : '');
    setEditing(true);
  };

  const commit = async () => {
    setEditing(false);
    const parsed = draft === '' ? null : Number(draft);
    if (parsed !== value) await onSave(parsed);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
          if (e.key === 'Escape') {
            setDraft(value != null ? String(value) : '');
            setEditing(false);
          }
        }}
        className={`${fieldInputClass} w-16 text-center font-bold`}
      />
    );
  }

  if (value == null || value <= 0) {
    return (
      <button
        type="button"
        onClick={startEdit}
        className="text-xs font-medium italic text-amber-800/60 transition hover:text-amber-900"
      >
        + Add Pax
      </button>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={startEdit}
      onClick={(e) => e.stopPropagation()}
      className="cursor-text text-xs font-bold text-amber-900 transition hover:bg-amber-100/50"
    >
      {value} Pax
    </button>
  );
}

export function InlineEditableDates({ eventDate, endDate, onSave, dateLabel }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const openEdit = (event) => {
    event.stopPropagation();
    setStart(
      eventDate
        ? `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
        : '',
    );
    setEnd(
      endDate
        ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
        : '',
    );
    setEditing(true);
  };

  const commit = async () => {
    setEditing(false);
    await onSave({ eventDate: start, endDate: end });
  };

  if (editing) {
    return (
      <div
        className="flex flex-wrap items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className={`${fieldInputClass} w-auto text-sm`}
        />
        <input
          type="date"
          value={end}
          min={start || undefined}
          onChange={(e) => setEnd(e.target.value)}
          className={`${fieldInputClass} w-auto text-sm`}
          placeholder="Fim"
        />
        <button
          type="button"
          onClick={commit}
          className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
        >
          OK
        </button>
      </div>
    );
  }

  if (!dateLabel) {
    return (
      <button
        type="button"
        onClick={openEdit}
        className="text-sm italic text-amber-800/60 transition hover:text-amber-900"
      >
        + Add data
      </button>
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={openEdit}
      onClick={(e) => e.stopPropagation()}
      className="flex cursor-text items-center gap-1 text-sm text-slate-700 transition hover:bg-amber-100/50"
    >
      {dateLabel}
    </button>
  );
}
