import { useMemo } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import WeekHeatStrip from '../components/WeekHeatStrip';
import { usePlanData } from '../context/PlanDataProvider';
import {
  buildUpcomingDashboardItems,
  buildDashboardNotes,
  groupDashboardNotes,
  groupUpcomingByDate,
} from '../utils/dashboardGlance';
import { buildWeekHeatLoad } from '../utils/weekGlance';

function TimeBadge({ time }) {
  if (!time) {
    return <span className="w-11 shrink-0 text-right text-xs text-slate-300">··</span>;
  }
  return (
    <span className="w-11 shrink-0 text-right text-sm font-bold tabular-nums text-slate-900">
      {time}
    </span>
  );
}

const VISIBLE_UPCOMING_ROWS = 3;
const VISIBLE_NOTE_ROWS = 2;
const NOTES_LIST_MAX_HEIGHT = '11.25rem';

function UpcomingItemRow({ item, index, onSelectEvent, onSelectNote }) {
  const handleClick = () => {
    if (item.source === 'inbox') onSelectNote?.(item.entryId);
    else onSelectEvent?.(item.eventId);
  };

  const shaded = index % 2 === 1;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-2 px-3 py-3 text-left transition hover:brightness-[0.98] active:brightness-95 ${
        shaded ? 'bg-amber-50/90' : 'bg-white'
      }`}
    >
      <TimeBadge time={item.time} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-slate-900">{item.title}</span>
        <span className="mt-0.5 block text-xs text-slate-600">
          {item.eventLabel}
          {item.location ? ` · ${item.location}` : ''}
        </span>
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
    </button>
  );
}

function NoteGroupRow({ group, index, onSelectEvent, onSelectNote }) {
  const handleClick = () => {
    if (group.isInbox) onSelectNote?.(group.entryId);
    else onSelectEvent?.(group.eventId);
  };

  const shaded = index % 2 === 1;
  const meta = [group.dateLabel, group.time, group.location].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-2 px-3 py-3 text-left transition hover:brightness-[0.98] active:brightness-95 ${
        shaded ? 'bg-amber-50/90' : 'bg-white'
      }`}
    >
      <TimeBadge time={group.time} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-slate-900">{group.title}</span>
        {group.subtitle && (
          <span className="mt-0.5 block text-xs text-slate-600 line-clamp-2">{group.subtitle}</span>
        )}
        {meta && (
          <span className="mt-0.5 block text-xs text-slate-500">{meta}</span>
        )}
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
    </button>
  );
}

export default function PlanDashboard({
  contentClassName = '',
  onSelectDay,
  onSelectEvent,
  onSelectNote,
}) {
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

  const heatDays = useMemo(
    () => buildWeekHeatLoad(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  const upcomingItems = useMemo(
    () => buildUpcomingDashboardItems(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  const upcomingDateGroups = useMemo(
    () => groupUpcomingByDate(upcomingItems),
    [upcomingItems],
  );

  const noteGroups = useMemo(() => {
    const notes = buildDashboardNotes(events, eventDetailsById, inboxItems);
    return groupDashboardNotes(notes);
  }, [events, eventDetailsById, inboxItems]);

  const loading = !ready && (eventsLoading || inboxLoading || detailsLoading);
  const error = eventsError || inboxError || detailsError;

  return (
    <div className="flex min-h-dvh flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bairro Alto Hotel
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-500">Próximos items e notas</p>
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
            Não foi possível carregar o dashboard.
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-5">
            <section className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Próximos items</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {upcomingItems.length === 0
                  ? 'Por ordem cronológica'
                  : upcomingItems.length > VISIBLE_UPCOMING_ROWS
                    ? `${upcomingItems.length} items · deslize para ver mais`
                    : `${upcomingItems.length} item${upcomingItems.length === 1 ? '' : 's'}`}
              </p>
              {upcomingItems.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-amber-200 px-4 py-8 text-center text-sm text-slate-500">
                  Sem items futuros. Use + para adicionar.
                </p>
              ) : (
                <div
                  className="mt-3 max-h-[16.75rem] overflow-y-auto overscroll-contain rounded-xl border border-amber-200/80 [-webkit-overflow-scrolling:touch]"
                  aria-label="Lista de próximos items"
                >
                  {(() => {
                    let rowIndex = 0;
                    return upcomingDateGroups.map((group) => (
                      <section key={group.dateKey || '__no_date__'}>
                        <h3 className="sticky top-0 z-10 border-b border-amber-300/80 bg-amber-50/95 px-3 py-2 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md">
                          {group.heading}
                        </h3>
                        {group.items.map((item) => {
                          const index = rowIndex;
                          rowIndex += 1;
                          return (
                            <UpcomingItemRow
                              key={item.id}
                              item={item}
                              index={index}
                              onSelectEvent={onSelectEvent}
                              onSelectNote={onSelectNote}
                            />
                          );
                        })}
                      </section>
                    ));
                  })()}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Notas</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {noteGroups.length === 0
                  ? 'Por evento'
                  : noteGroups.length > VISIBLE_NOTE_ROWS
                    ? `${noteGroups.length} notas · deslize para ver mais`
                    : `${noteGroups.length} nota${noteGroups.length === 1 ? '' : 's'}`}
              </p>
              {noteGroups.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-amber-200 px-4 py-8 text-center text-sm text-slate-500">
                  Sem notas futuras.
                </p>
              ) : (
                <div
                  className="mt-3 overflow-y-auto overscroll-contain rounded-xl border border-amber-200/80 [-webkit-overflow-scrolling:touch]"
                  style={{ maxHeight: NOTES_LIST_MAX_HEIGHT }}
                  aria-label="Lista de notas"
                >
                  {noteGroups.map((group, index) => (
                    <NoteGroupRow
                      key={group.id}
                      group={group}
                      index={index}
                      onSelectEvent={onSelectEvent}
                      onSelectNote={onSelectNote}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Semana</h2>
              <p className="mt-0.5 text-xs text-slate-500">Toque num dia para ver detalhes</p>
              <div className="mt-3">
                <WeekHeatStrip days={heatDays} onSelectDay={onSelectDay} />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
