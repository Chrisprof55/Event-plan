import { useEffect, useMemo, useState } from 'react';
import { Loader2, MessageSquarePlus, Trash2, X } from 'lucide-react';
import TimeSelect from './TimeSelect';
import { formatDishDateWithWeekday } from '../utils/dishes';
import { getEventAllowedDateInputs } from '../utils/eventDates';
import { getNoteText } from '../utils/planEntries';

const inputClassName =
  'min-h-12 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-amber-400 focus:ring-2 disabled:opacity-50';

const noteClassName =
  'min-h-[4.5rem] w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-amber-400 focus:ring-2';

export default function DishEditModal({
  open,
  dish,
  attachedNotes = [],
  event,
  saving = false,
  onClose,
  onSave,
  onRemoveNote,
  onAddNote,
}) {
  const allowedDates = useMemo(() => getEventAllowedDateInputs(event), [event]);
  const restrictDates = allowedDates.length > 0;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [name, setName] = useState('');
  const [noteDrafts, setNoteDrafts] = useState([]);

  useEffect(() => {
    if (!open || !dish) return;
    setDate(dish.date ?? '');
    setTime(dish.time ?? '');
    setLocation(dish.location ?? '');
    setQuantity(String(dish.quantity ?? 1));
    setName(dish.name ?? '');
    setNoteDrafts(
      attachedNotes.map((note) => ({ id: note.id, text: getNoteText(note) })),
    );
  }, [open, dish, attachedNotes]);

  useEffect(() => {
    if (!open || !restrictDates) return;
    setDate((prev) => (allowedDates.includes(prev) ? prev : allowedDates[0]));
  }, [open, restrictDates, allowedDates]);

  if (!open || !dish) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await onSave?.({
      dishId: dish.id,
      date,
      time,
      location,
      name: trimmedName,
      quantity: quantity.replace(/\D/g, '') || '1',
      noteUpdates: noteDrafts.map((n) => ({ id: n.id, text: n.text.trim() })),
    });
    onClose?.();
  };

  const updateNoteDraft = (id, text) => {
    setNoteDrafts((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const handleRemoveNote = async (noteId) => {
    const confirmed = window.confirm('Eliminar esta nota?');
    if (!confirmed) return;
    await onRemoveNote?.(noteId);
    setNoteDrafts((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-edit-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-200 bg-post-it shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-amber-200/80 p-5 pb-4">
          <div>
            <h2 id="dish-edit-title" className="text-xl font-semibold text-slate-900">
              Editar item
            </h2>
            <p className="mt-1 text-sm text-slate-600">{dish.name || 'Prato'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="overflow-y-auto p-5 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Data</span>
                {restrictDates ? (
                  <select
                    value={allowedDates.includes(date) ? date : allowedDates[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClassName}
                    disabled={saving}
                  >
                    {allowedDates.map((value) => (
                      <option key={value} value={value}>
                        {formatDishDateWithWeekday(value)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClassName}
                    disabled={saving}
                  />
                )}
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Hora</span>
                <TimeSelect value={time} onChange={setTime} disabled={saving} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Localização</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pasteleria"
                  className={inputClassName}
                  disabled={saving}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="w-full sm:w-24">
                <span className="mb-1 block text-xs font-medium text-slate-600">Qtd</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/\D/g, '') || '1')}
                  className={`${inputClassName} text-center font-bold`}
                  disabled={saving}
                />
              </label>
              <label className="min-w-0 flex-1">
                <span className="mb-1 block text-xs font-medium text-slate-600">Prato/Item</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                  disabled={saving}
                  required
                />
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">Notas deste item</span>
                {onAddNote && (
                  <button
                    type="button"
                    onClick={() => onAddNote(dish)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-amber-100"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden />
                    Adicionar nota
                  </button>
                )}
              </div>

              {noteDrafts.length === 0 ? (
                <p className="rounded-xl border border-dashed border-amber-300/70 bg-white/50 px-3 py-4 text-center text-sm text-slate-500">
                  Sem notas neste item.
                </p>
              ) : (
                <ul className="space-y-2">
                  {noteDrafts.map((note) => (
                    <li key={note.id} className="relative">
                      <textarea
                        value={note.text}
                        onChange={(e) => updateNoteDraft(note.id, e.target.value)}
                        rows={2}
                        className={noteClassName}
                        disabled={saving}
                        placeholder="Nota…"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNote(note.id)}
                        className="absolute right-2 top-2 rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Eliminar nota"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
