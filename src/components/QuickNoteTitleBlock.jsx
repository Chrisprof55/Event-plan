import { CalendarDays } from 'lucide-react';
import { InlineEditableText } from './InlineEdit';
import {
  formatDishDateWithWeekday,
  getDishLocation,
  getDishTime,
} from '../utils/dishes';
import { getInboxItemTitle, shouldShowInboxNoteBody } from '../utils/entry';

export function QuickNoteTitleBlock({
  item,
  onUpdate,
  events,
  onAssign,
  size = 'card',
  preview = false,
}) {
  if (!item) return null;

  const isDetail = size === 'detail';
  const dateLabel = item.date ? formatDishDateWithWeekday(item.date) : null;
  const time = getDishTime(item);
  const location = getDishLocation(item);
  const slotLabel = [time, location].filter(Boolean).join(' · ');
  const titleClass = isDetail
    ? 'text-2xl font-bold leading-tight text-slate-900 sm:text-3xl'
    : 'text-2xl font-bold leading-snug text-slate-900';
  const title = getInboxItemTitle(item);
  const showNoteBody = shouldShowInboxNoteBody(item);

  return (
    <div className={`flex min-w-0 flex-1 flex-col ${isDetail ? 'gap-2' : 'gap-1.5'}`}>
      {preview ? (
        <h2 className={titleClass}>{title}</h2>
      ) : (
        <InlineEditableText
          value={item.name}
          placeholder="+ Add prato ou nota"
          onSave={(value) => onUpdate?.({ name: value })}
          className={`block w-full ${titleClass}`}
          as="div"
        />
      )}

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
        <p className={`whitespace-pre-wrap text-slate-600 ${isDetail ? 'text-sm' : 'text-xs'} line-clamp-3`}>
          {item.note}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-mono text-slate-400">Nota rápida</span>
        {!preview && onAssign && events?.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const eventId = e.target.value;
              if (eventId) onAssign(item.id, eventId);
              e.target.value = '';
            }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[9rem] rounded border border-amber-200/80 bg-white/80 px-1.5 py-0.5 text-xs text-slate-600 outline-none"
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
      </div>
    </div>
  );
}
