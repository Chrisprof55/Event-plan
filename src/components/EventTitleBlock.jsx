import { CalendarDays } from 'lucide-react';
import { InlineEditableDates, InlineEditablePax, InlineEditableText } from './InlineEdit';
import { formatEventDate, formatEventDateRange } from '../utils/eventDates';

export function EventTitleBlock({
  event,
  onUpdate,
  size = 'card',
  showPax = true,
  showNumberAtBottom = true,
}) {
  if (!event) return null;

  const title = event.eventName || event.clientName || '';
  const startDate = formatEventDate(event.eventDate);
  const rangeLabel = formatEventDateRange(event.eventDate, event.endDate);
  const isDetail = size === 'detail';

  return (
    <div className={`flex min-w-0 flex-1 flex-col ${isDetail ? 'gap-1.5' : 'gap-1'}`}>
      <InlineEditableText
        value={title}
        placeholder="+ Add nome"
        onSave={(value) => onUpdate?.({ eventName: value })}
        className={`block w-full leading-tight text-slate-900 ${
          isDetail ? 'text-2xl font-bold sm:text-3xl' : 'text-2xl font-bold leading-snug'
        }`}
        as="div"
      />

      {startDate && (
        <p
          className={`flex items-center gap-1.5 font-medium text-slate-700 ${
            isDetail ? 'text-base' : 'text-sm'
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          {rangeLabel || startDate}
        </p>
      )}

      {!startDate && onUpdate && (
        <span className="flex items-center gap-1 text-sm text-slate-600">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <InlineEditableDates
            eventDate={event.eventDate}
            endDate={event.endDate}
            dateLabel={null}
            onSave={(dates) => onUpdate(dates)}
          />
        </span>
      )}

      {showPax && onUpdate && (
        <div className="mt-0.5">
          <InlineEditablePax
            value={event.pax}
            onSave={(value) => onUpdate({ pax: value ?? '' })}
          />
        </div>
      )}

      {showNumberAtBottom && (
        <div className="mt-auto pt-1">
          {event.eventNumber ? (
            onUpdate ? (
              <InlineEditableText
                value={event.eventNumber}
                placeholder="+ Add ID"
                onSave={(value) => onUpdate({ eventNumber: value })}
                className="text-xs font-mono text-slate-400"
                emptyClassName="text-xs italic text-slate-400"
                inputClassName="min-h-8 rounded border border-slate-200 px-2 text-xs font-mono"
              />
            ) : (
              <p className="text-xs font-mono text-slate-400">{event.eventNumber}</p>
            )
          ) : onUpdate ? (
            <InlineEditableText
              value=""
              placeholder="+ Add ID"
              onSave={(value) => onUpdate({ eventNumber: value })}
              className="text-xs font-mono text-slate-400"
              emptyClassName="text-xs italic text-slate-400"
              inputClassName="min-h-8 rounded border border-slate-200 px-2 text-xs font-mono"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
