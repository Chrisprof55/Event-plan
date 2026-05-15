import { useMemo } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import WeekHeatStrip from '../components/WeekHeatStrip';
import { usePlanData } from '../context/PlanDataProvider';
import { buildUpcomingDashboardItems, buildDashboardNotes } from '../utils/dashboardGlance';
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
        <span className="mt-0.5 block text-xs text-slate-500">{item.dateLabel}</span>
        <span className="mt-0.5 block text-xs text-slate-600">
          {item.eventLabel}
          {item.location ? ` · ${item.location}` : ''}
        </span>
      </span>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
    </button>
  );
}

function NoteRow({ note, onSelectEvent, onSelectNote }) {
  const openNote = () => {
    if (note.isInbox) onSelectNote?.(note.entryId);
    else onSelectEvent?.(note.eventId);
  };

  const openEventLink = (e) => {
    e.stopPropagation();
    if (note.isInbox) onSelectNote?.(note.entryId);
    else if (note.eventId) onSelectEvent?.(note.eventId);
  };

  return (
    <article className="rounded-xl border border-amber-200/70 bg-post-it p-3 shadow-sm">
      <button type="button" onClick={openNote} className="w-full text-left">
        <p className="line-clamp-3 text-sm leading-snug text-slate-800">{note.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {note.dateLabel}
          {note.time ? ` · ${note.time}` : ''}
          {note.location ? ` · ${note.location}` : ''}
        </p>
        {note.attachedDishTitle && (
          <p className="mt-1 text-xs text-slate-600">No prato: {note.attachedDishTitle}</p>
        )}
      </button>
      <button
        type="button"
        onClick={openEventLink}
        className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-amber-200/80 transition hover:bg-white"
      >
        {note.linkLabel}
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </article>
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

  const notes = useMemo(
    () => buildDashboardNotes(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  const loading = !ready && (eventsLoading || inboxLoading || detailsLoading);
  const error = eventsError || inboxError || detailsError;

  return (
    <div className="flex min-h-dvh flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bairro Alto Hotel
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Painel</h1>
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
            Não foi possível carregar o painel.
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
                  {upcomingItems.map((item, index) => (
                    <UpcomingItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onSelectEvent={onSelectEvent}
                      onSelectNote={onSelectNote}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Notas</h2>
              {notes.length === 0 ? (
                <p className="rounded-xl border border-dashed border-amber-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
                  Sem notas futuras.
                </p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((note) => (
                    <li key={note.id}>
                      <NoteRow
                        note={note}
                        onSelectEvent={onSelectEvent}
                        onSelectNote={onSelectNote}
                      />
                    </li>
                  ))}
                </ul>
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
