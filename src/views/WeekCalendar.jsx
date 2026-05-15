import { useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { usePlanData } from '../context/PlanDataProvider';
import { buildWeekGlance } from '../utils/weekGlance';

function TimeBadge({ time }) {
  if (!time) {
    return (
      <span className="w-11 shrink-0 text-right text-xs text-slate-300" aria-hidden>
        ··
      </span>
    );
  }
  return (
    <span className="w-11 shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
      {time}
    </span>
  );
}

function DaySection({ day, sectionRef, onSelectEvent, onSelectNote }) {
  return (
    <section
      ref={sectionRef}
      id={`week-day-${day.dateKey}`}
      className={`scroll-mt-36 rounded-2xl border shadow-sm ${
        day.isToday
          ? 'border-amber-400/80 bg-post-it ring-1 ring-amber-300/50'
          : 'border-amber-200/80 bg-white'
      }`}
    >
      <header className="border-b border-amber-200/70 px-4 py-3">
        <h2 className="text-sm font-bold capitalize text-slate-900">{day.heading}</h2>
      </header>

      <div className="px-2 py-2">
        {day.isEmpty ? (
          <p className="px-2 py-4 text-center text-sm text-slate-400">Nada planeado</p>
        ) : (
          <ul className="space-y-1">
            {day.events.map((event) => (
              <li key={`ev-${event.id}`}>
                <button
                  type="button"
                  onClick={() => onSelectEvent?.(event.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition hover:bg-amber-50/80 active:bg-amber-50"
                >
                  <span
                    className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-slate-900"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {event.label}
                    </span>
                    {event.pax != null && event.pax > 0 && (
                      <span className="text-xs text-slate-500">{event.pax} pax</span>
                    )}
                  </span>
                </button>
              </li>
            ))}

            {day.items.map((item) => {
              const handleClick = () => {
                if (item.source === 'inbox') onSelectNote?.(item.entryId);
                else onSelectEvent?.(item.eventId);
              };

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={handleClick}
                    className="flex w-full items-start gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-amber-50/60 active:bg-amber-50"
                  >
                    <TimeBadge time={item.time} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug text-slate-900">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {item.eventLabel}
                        {item.location ? ` · ${item.location}` : ''}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function WeekCalendar({
  contentClassName = '',
  focusDateKey = null,
  onFocusConsumed,
  onSelectEvent,
  onSelectNote,
}) {
  const dayRefs = useRef({});
  const {
    events,
    eventDetailsById,
    inboxItems,
    eventsLoading,
    inboxLoading,
    detailsLoading,
    eventsError,
    inboxError,
    detailsError,
    ready,
  } = usePlanData();

  const days = useMemo(
    () => buildWeekGlance(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  const loading = !ready && (eventsLoading || inboxLoading || detailsLoading);
  const error = eventsError || inboxError || detailsError;

  useEffect(() => {
    if (!focusDateKey || loading) return;
    const el = dayRefs.current[focusDateKey];
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onFocusConsumed?.();
    });
  }, [focusDateKey, loading, days, onFocusConsumed]);

  return (
    <div className="flex min-h-dvh flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bairro Alto Hotel
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Próximos 7 dias</h1>
          <p className="mt-0.5 text-xs text-slate-500">Vista rápida · eventos e items por dia</p>
        </div>
      </header>

      <main className={`mx-auto w-full max-w-3xl flex-1 px-4 py-4 ${contentClassName}`}>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>A carregar…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar o calendário.
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {days.map((day) => (
              <DaySection
                key={day.dateKey}
                day={day}
                sectionRef={(el) => {
                  dayRefs.current[day.dateKey] = el;
                }}
                onSelectEvent={onSelectEvent}
                onSelectNote={onSelectNote}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
