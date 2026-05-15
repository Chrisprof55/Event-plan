import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import TimeSelect from './TimeSelect';
import { formatDishDateWithWeekday } from '../utils/dishes';
import { canAddEntry } from '../utils/entry';
import { getEventAllowedDateInputs } from '../utils/eventDates';
import { dateToInputValue } from '../utils/eventFields';

const inputClassName =
  'min-h-12 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-amber-400 focus:ring-2 disabled:opacity-50';

export const NEW_EVENT_VALUE = '__new__';
export const INBOX_EVENT_VALUE = '__inbox__';

export default function NovoItemForm({
  eventId,
  event,
  events = [],
  saving,
  creatingEvent = false,
  onAddEntry,
  onEventChange,
  onCreateEvent,
  showEventPicker = false,
  attachToDish = null,
}) {
  const noteRef = useRef(null);
  const defaultDate = dateToInputValue(event?.eventDate);
  const isInbox = !eventId;

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [createError, setCreateError] = useState(null);

  const attachMode = Boolean(attachToDish?.id);
  const fieldsEnabled = Boolean(eventId || showEventPicker || attachMode);

  const allowedDates = useMemo(
    () => (eventId && event ? getEventAllowedDateInputs(event) : []),
    [eventId, event],
  );
  const restrictToEventDates =
    Boolean(eventId && event && allowedDates.length > 0 && !attachMode);

  useEffect(() => {
    if (restrictToEventDates) {
      setDate((prev) => (allowedDates.includes(prev) ? prev : allowedDates[0]));
      return;
    }
    if (defaultDate) setDate((prev) => prev || defaultDate);
  }, [defaultDate, restrictToEventDates, allowedDates]);

  const resetItemFields = useCallback(() => {
    setQuantity('1');
    setName('');
    setNote('');
  }, []);

  const focusNote = useCallback(() => {
    requestAnimationFrame(() => noteRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!attachToDish) return;
    setDate(attachToDish.date ?? '');
    setTime(attachToDish.time ?? '');
    setLocation(attachToDish.location ?? '');
    setName('');
    setNote('');
  }, [attachToDish]);

  const validEntry = canAddEntry({
    name,
    note,
    date,
    attachToDishId: attachToDish?.id,
  });
  const busy = saving || creatingEvent;
  const disabled = busy || !validEntry || !onAddEntry;

  const submitEntry = useCallback(async () => {
    const added = await onAddEntry?.({
      name: attachMode ? '' : name,
      quantity,
      date,
      time,
      location,
      note,
      attachToDishId: attachToDish?.id,
    });
    if (added) {
      resetItemFields();
      focusNote();
    }
  }, [
    name,
    quantity,
    date,
    time,
    location,
    note,
    attachMode,
    attachToDish?.id,
    onAddEntry,
    resetItemFields,
    focusNote,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitEntry();
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submitEntry();
    }
  };

  const showNewEventForm =
    creatingNew || (showEventPicker && !eventId && events.length === 0);

  const selectValue = creatingNew
    ? NEW_EVENT_VALUE
    : isInbox
      ? INBOX_EVENT_VALUE
      : (eventId ?? '');

  const handleEventSelect = (value) => {
    setCreateError(null);
    if (value === NEW_EVENT_VALUE) {
      setCreatingNew(true);
      onEventChange?.(null);
      return;
    }
    if (value === INBOX_EVENT_VALUE) {
      setCreatingNew(false);
      setNewEventName('');
      onEventChange?.(null);
      return;
    }
    setCreatingNew(false);
    setNewEventName('');
    onEventChange?.(value || null);
  };

  const handleCreateEvent = async () => {
    const trimmed = newEventName.trim();
    if (!trimmed || !onCreateEvent) return;

    setCreateError(null);
    try {
      const newId = await onCreateEvent({
        eventName: trimmed,
        eventDate: date,
      });
      setCreatingNew(false);
      setNewEventName('');
      onEventChange?.(newId);
    } catch (err) {
      setCreateError(err.message ?? 'Não foi possível criar o evento.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {attachMode && (
        <p className="rounded-lg border border-amber-200/80 bg-white/70 px-3 py-2 text-sm text-slate-700">
          Nota para: <strong>{attachToDish.name}</strong>
        </p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Data</span>
          {restrictToEventDates ? (
            <select
              value={allowedDates.includes(date) ? date : allowedDates[0]}
              onChange={(e) => setDate(e.target.value)}
              className={inputClassName}
              disabled={!fieldsEnabled}
            >
              {allowedDates.map((value) => (
                <option key={value} value={value}>
                  {formatDishDateWithWeekday(value)}
                </option>
              ))}
            </select>
          ) : eventId && event && allowedDates.length === 0 ? (
            <>
              <select className={inputClassName} disabled>
                <option>Sem datas no evento</option>
              </select>
              <p className="mt-1 text-xs text-amber-800">
                Defina as datas no cartão do evento antes de adicionar itens.
              </p>
            </>
          ) : (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClassName}
              disabled={!fieldsEnabled}
            />
          )}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Hora</span>
          <TimeSelect value={time} onChange={setTime} disabled={!fieldsEnabled} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Localização</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Rooftop Terrace"
            className={inputClassName}
            disabled={!fieldsEnabled}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Nota</span>
        <textarea
          ref={noteRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleNoteKeyDown}
          rows={3}
          placeholder="Instruções, pedidos, observações…"
          className={`${inputClassName} min-h-[5.5rem] resize-y`}
          disabled={!fieldsEnabled}
        />
        <p className="mt-1 text-xs text-slate-500">
          {attachMode
            ? 'Nota para este prato. ⌘/Ctrl+Enter para adicionar.'
            : 'Basta data e nota (sem hora/local = nota geral do evento). Prato opcional. ⌘/Ctrl+Enter.'}
        </p>
      </label>

      {!attachMode && (
      <div className="rounded-xl border border-dashed border-amber-300/70 bg-white/40 px-3 py-3">
        <p className="mb-2 text-xs font-medium text-slate-500">Prato (opcional)</p>
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
              disabled={!fieldsEnabled}
            />
          </label>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-xs font-medium text-slate-600">Prato/Item</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pastel de Nata"
              autoComplete="off"
              className={inputClassName}
              disabled={!fieldsEnabled}
            />
          </label>
        </div>
      </div>
      )}

      {showEventPicker && !attachMode && (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Associar a evento (opcional)
            </span>
            <select
              value={selectValue}
              onChange={(e) => handleEventSelect(e.target.value)}
              className={inputClassName}
              disabled={creatingEvent}
            >
              <option value={INBOX_EVENT_VALUE}>Nota rápida — sem evento</option>
              <option value="" disabled hidden>
                Selecione…
              </option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.eventName || ev.eventNumber || 'Sem nome'}
                </option>
              ))}
              <option value={NEW_EVENT_VALUE}>+ Novo evento…</option>
            </select>
          </label>

          {showNewEventForm && (
            <div className="space-y-2 rounded-xl border border-amber-300/80 bg-white/70 p-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  Nome do Evento
                </span>
                <input
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="Fora advisors - Brunch"
                  className={inputClassName}
                  disabled={creatingEvent}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateEvent();
                    }
                  }}
                />
              </label>
              {createError && <p className="text-sm text-red-600">{createError}</p>}
              <button
                type="button"
                onClick={handleCreateEvent}
                disabled={creatingEvent || !newEventName.trim()}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {creatingEvent ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Criar evento
              </button>
            </div>
          )}

          {isInbox && !creatingNew && (
            <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-slate-600">
              Fica no mural como nota rápida. Pode converter em evento mais tarde — as notas
              passam com o evento.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
        Adicionar Item
      </button>
    </form>
  );
}
