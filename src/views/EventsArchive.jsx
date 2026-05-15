import { useMemo } from 'react';
import { Archive, ChevronLeft, Loader2 } from 'lucide-react';
import { EventTitleBlock } from '../components/EventTitleBlock';
import { useEvents } from '../hooks/useEvents';
import { eventEndDateKey } from '../utils/eventArchive';
import { formatDishDateWithWeekday } from '../utils/dishes';

function ArchivedEventCard({ event, onSelect, onUpdate }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(event.id);
        }
      }}
      className="w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-sm transition hover:bg-white hover:shadow-md active:scale-[0.99]"
    >
      <EventTitleBlock
        event={event}
        onUpdate={(fields) => onUpdate(event.id, fields)}
        size="card"
      />
    </article>
  );
}

export default function EventsArchive({
  contentClassName = '',
  onBack,
  onSelectEvent,
}) {
  const { archivedEvents, loading, error, updateEvent } = useEvents();

  const grouped = useMemo(() => {
    const groups = [];
    for (const event of archivedEvents) {
      const dateKey = eventEndDateKey(event) || '__no_date__';
      const last = groups[groups.length - 1];
      if (!last || last.dateKey !== dateKey) {
        groups.push({ dateKey, events: [event] });
      } else {
        last.events.push(event);
      }
    }
    return groups;
  }, [archivedEvents]);

  const handleInlineUpdate = async (eventId, fields) => {
    try {
      await updateEvent(eventId, fields);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50/80">
      <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Eventos
          </button>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Archive className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Bairro Alto Hotel
              </p>
              <h1 className="mt-0.5 text-2xl font-semibold text-slate-900">Arquivo</h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Eventos passados · saem da agenda automaticamente
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className={`mx-auto w-full max-w-3xl flex-1 px-4 py-4 ${contentClassName}`}>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>A carregar…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar o arquivo.
          </div>
        )}

        {!loading && !error && archivedEvents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center text-slate-600">
            <p className="font-medium text-slate-800">Arquivo vazio</p>
            <p className="mt-2 text-sm">
              Os eventos aparecem aqui no dia seguinte ao fim da data (ou intervalo) definido.
            </p>
          </div>
        )}

        <ul className="space-y-5">
          {grouped.map((group) => (
            <li key={group.dateKey}>
              <h2 className="mb-2 border-b border-slate-200 pb-1 text-sm font-bold text-slate-700">
                {group.dateKey === '__no_date__'
                  ? 'Sem data'
                  : formatDishDateWithWeekday(group.dateKey)}
              </h2>
              <ul className="space-y-3">
                {group.events.map((event) => (
                  <li key={event.id}>
                    <ArchivedEventCard
                      event={event}
                      onSelect={onSelectEvent}
                      onUpdate={handleInlineUpdate}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
