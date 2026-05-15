import { useState } from 'react';
import { X } from 'lucide-react';
import { eventToFormValues } from '../utils/eventFields';

const inputClassName =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-slate-400 focus:ring-2';

export default function EventFormModal({ open, mode, initialEvent, saving, error, onClose, onSubmit }) {
  const initial = eventToFormValues(initialEvent);
  const [eventNumber, setEventNumber] = useState(initial.eventNumber);
  const [eventName, setEventName] = useState(initial.eventName);
  const [eventDate, setEventDate] = useState(initial.eventDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [pax, setPax] = useState(initial.pax);

  if (!open) return null;

  const isEdit = mode === 'edit';
  const canSave = Boolean(eventName.trim() || eventDate);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({ eventNumber, eventName, eventDate, endDate, pax });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-amber-200 bg-post-it p-5 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="event-form-title" className="text-xl font-semibold text-slate-900">
              {isEdit ? 'Editar Evento' : 'Novo Evento'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isEdit
                ? 'Ajuste qualquer campo — as alterações sincronizam de imediato.'
                : 'Nome e data bastam. Os restantes campos são opcionais.'}
            </p>
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

        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Num. Evento</span>
            <input
              type="text"
              value={eventNumber}
              onChange={(e) => setEventNumber(e.target.value)}
              placeholder="EVENT1984 (opcional)"
              autoComplete="off"
              className={`${inputClassName} font-mono uppercase`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Nome do Evento</span>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Fora advisors - Brunch"
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Data do Evento</span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Data de Fim <span className="font-normal text-slate-400">(opcional)</span>
            </span>
            <input
              type="date"
              value={endDate}
              min={eventDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Pax</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pax}
              onChange={(e) => setPax(e.target.value.replace(/\D/g, ''))}
              placeholder="10 (opcional)"
              className={inputClassName}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !canSave}
            className="min-h-12 flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'A guardar…' : isEdit ? 'Guardar' : 'Criar Evento'}
          </button>
        </div>
      </form>
    </div>
  );
}
