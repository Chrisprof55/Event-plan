import { useMemo } from 'react';
import { Loader2, Plus } from 'lucide-react';
import QuickNoteCard from '../components/QuickNoteCard';
import { EventTitleBlock } from '../components/EventTitleBlock';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';
import { formatDishDateWithWeekday } from '../utils/dishes';
import { dateToInputValue } from '../utils/eventFields';
import { buildDashboardCards } from '../utils/dashboardCards';

function cardDateKey(card) {
  if (card.type === 'event') {
    return card.event.eventDate ? dateToInputValue(card.event.eventDate) : '';
  }
  return (card.item.date ?? '').trim();
}

function EventCard({ event, index, highlighted, itemTarget, onSelect, onUpdate, onQuickAdd }) {
  const tint = index % 2 === 0 ? 'bg-post-it' : 'bg-post-it-blue';

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
      className={`group relative flex min-h-[7rem] w-full cursor-pointer rounded-2xl border border-amber-200/70 p-4 pr-12 shadow-md transition hover:shadow-lg active:scale-[0.99] ${tint} ${
        highlighted ? 'ring-2 ring-slate-900/25' : ''
      } ${itemTarget ? 'ring-2 ring-amber-400/80' : ''}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onQuickAdd(event);
        }}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 opacity-40 transition hover:bg-white/90 hover:text-slate-800 hover:opacity-100 group-hover:opacity-70"
        aria-label="Adicionar item a este evento"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <EventTitleBlock
        event={event}
        onUpdate={(fields) => onUpdate(event.id, fields)}
        size="card"
      />

      {highlighted && (
        <p className="absolute bottom-3 right-4 text-xs font-medium text-slate-600">
          Toque para abrir
        </p>
      )}
    </article>
  );
}

export default function Dashboard({
  contentClassName = '',
  onSelectEvent,
  onSelectNote,
  onOpenNovoItem,
  highlightId,
  highlightInboxId,
  itemEventId,
  novoItemOpen,
}) {
  const { events, loading, error, updateEvent } = useEvents();
  const {
    items: inboxItems,
    updateItem: updateInboxItem,
    removeItem: removeInboxItem,
  } = useInboxItems();

  const dashboardCards = useMemo(
    () => buildDashboardCards(events, inboxItems),
    [events, inboxItems],
  );

  const handleInlineUpdate = async (eventId, fields) => {
    try {
      await updateEvent(eventId, fields);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = (event) => {
    onOpenNovoItem?.(event.id, 'dish');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bairro Alto Hotel
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Eventos</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Próximos eventos e notas · ordem cronológica
          </p>
        </div>
      </header>

      <section className={`flex-1 px-4 py-4 ${contentClassName}`}>
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>A carregar eventos…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os eventos. Verifique a ligação ao Firebase.
          </div>
        )}

        {!loading && !error && dashboardCards.length === 0 && (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-post-it px-6 py-12 text-center text-slate-600 shadow-sm">
            <p className="font-medium text-slate-800">Nada agendado</p>
            <p className="mt-2 text-sm">
              Toque em <strong>+</strong> para adicionar um item, nota ou evento.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {dashboardCards.map((card, index) => {
            const dateKey = cardDateKey(card);
            const prevKey = index > 0 ? cardDateKey(dashboardCards[index - 1]) : null;
            const showDateHeading = dateKey !== prevKey;

            return (
              <li key={card.key} className="space-y-2">
                {showDateHeading && (
                  <h2 className="border-b border-amber-300/80 pb-1 text-sm font-bold text-slate-800">
                    {dateKey ? formatDishDateWithWeekday(dateKey) : 'Sem data'}
                  </h2>
                )}
                {card.type === 'note' ? (
                  <QuickNoteCard
                    item={card.item}
                    index={index}
                    highlighted={highlightInboxId === card.item.id}
                    onSelect={onSelectNote}
                    onRemove={removeInboxItem}
                  />
                ) : (
                  <EventCard
                    event={card.event}
                    index={index}
                    highlighted={highlightId === card.event.id}
                    itemTarget={itemEventId === card.event.id && novoItemOpen}
                    onSelect={onSelectEvent}
                    onUpdate={handleInlineUpdate}
                    onQuickAdd={handleQuickAdd}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
