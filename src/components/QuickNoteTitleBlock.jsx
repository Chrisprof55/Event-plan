import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, Plus } from 'lucide-react';
import { InlineEditableText } from './InlineEdit';
import {
  formatDishDateWithWeekday,
  getDishLocation,
  getDishTime,
} from '../utils/dishes';
import {
  getInboxItemTitle,
  getInboxNoteBody,
  shouldShowInboxNoteBody,
} from '../utils/entry';

const iconBtnClass =
  'flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200/90 bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 active:scale-95 disabled:opacity-40';

export function QuickNoteTitleBlock({
  item,
  onUpdate,
  size = 'card',
  preview = false,
  activeEvents = [],
  onCreateEvent,
  onAssignToEvent,
  filingBusy = false,
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!assignOpen) return undefined;
    const close = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setAssignOpen(false);
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [assignOpen]);

  if (!item) return null;

  const isDetail = size === 'detail';
  const showFilingActions = isDetail && !preview && (onCreateEvent || onAssignToEvent);
  const dateLabel = item.date ? formatDishDateWithWeekday(item.date) : null;
  const time = getDishTime(item);
  const location = getDishLocation(item);
  const slotLabel = [time, location].filter(Boolean).join(' · ');
  const titleClass = isDetail
    ? 'text-2xl font-bold leading-tight text-slate-900 sm:text-3xl'
    : 'text-2xl font-bold leading-snug text-slate-900';
  const title = getInboxItemTitle(item);
  const showNoteBody = shouldShowInboxNoteBody(item);
  const noteBody = getInboxNoteBody(item);
  const canCreateEvent = Boolean((item.name ?? '').trim() || title !== 'Sem nome');

  const handleAssign = (eventId) => {
    setAssignOpen(false);
    onAssignToEvent?.(eventId);
  };

  return (
    <div className={`flex min-w-0 flex-1 flex-col ${isDetail ? 'gap-2' : 'gap-1.5'}`}>
      <div className="flex items-start gap-1.5">
        {preview ? (
          <h2 className={`min-w-0 flex-1 ${titleClass}`}>{title}</h2>
        ) : (
          <InlineEditableText
            value={item.name ?? ''}
            placeholder="Nome da nota"
            onSave={(value) => onUpdate?.({ name: value })}
            className={`min-w-0 flex-1 ${titleClass}`}
            as="div"
          />
        )}

        {showFilingActions && (
          <div
            ref={popoverRef}
            className="relative flex shrink-0 items-center gap-0.5 pt-0.5"
          >
            {onCreateEvent && (
              <button
                type="button"
                onClick={onCreateEvent}
                disabled={filingBusy || !canCreateEvent}
                className={iconBtnClass}
                aria-label="Criar evento com este nome"
                title="Criar evento"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              </button>
            )}

            {onAssignToEvent && (
              <>
                <button
                  type="button"
                  onClick={() => setAssignOpen((open) => !open)}
                  disabled={filingBusy}
                  className={`${iconBtnClass} ${assignOpen ? 'border-amber-400 bg-amber-50 text-slate-900' : ''}`}
                  aria-label="Enviar para evento"
                  aria-expanded={assignOpen}
                  title="Enviar para evento"
                >
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                </button>

                {assignOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1.5 w-[min(16rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-amber-200/90 bg-white shadow-lg"
                    role="listbox"
                    aria-label="Eventos ativos"
                  >
                    {activeEvents.length === 0 ? (
                      <p className="px-3 py-3 text-sm text-slate-500">Sem eventos ativos</p>
                    ) : (
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {activeEvents.map((ev) => (
                          <li key={ev.id}>
                            <button
                              type="button"
                              role="option"
                              onClick={() => handleAssign(ev.id)}
                              className="flex w-full px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition hover:bg-amber-50 active:bg-amber-100"
                            >
                              {ev.eventName || ev.eventNumber || 'Sem nome'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {dateLabel && (
        <p
          className={`flex items-center gap-1.5 font-medium text-slate-700 ${
            isDetail ? 'text-base' : 'text-sm'
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          {dateLabel}
        </p>
      )}

      {slotLabel && (
        <p className={`font-medium text-slate-700 ${isDetail ? 'text-base' : 'text-sm'}`}>
          {slotLabel}
        </p>
      )}

      {item.quantity > 1 && (
        <p className="text-xs font-bold text-amber-900">{item.quantity} un.</p>
      )}

      {showNoteBody && (
        <p
          className={`whitespace-pre-wrap text-slate-600 ${isDetail ? 'text-sm' : 'text-xs'} line-clamp-3`}
        >
          {noteBody}
        </p>
      )}

      <div className="mt-auto pt-1">
        <span className="text-xs font-mono text-slate-400">Nota rápida</span>
      </div>
    </div>
  );
}
