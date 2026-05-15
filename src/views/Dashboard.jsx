import { useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import EventFormModal from '../components/EventFormModal';
import NovoItemModal from '../components/NovoItemModal';
import QuickNoteCard from '../components/QuickNoteCard';
import { EventTitleBlock } from '../components/EventTitleBlock';
import { useEventDetails } from '../hooks/useEventDetails';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';
import { buildDashboardCards } from '../utils/dashboardCards';

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
      style={{ transform: index % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.35deg)' }}
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

export default function Dashboard({ onSelectEvent, onSelectNote }) {
  const { events, loading, error, addEvent, updateEvent } = useEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [highlightInboxId, setHighlightInboxId] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const [itemEventId, setItemEventId] = useState(null);
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [creatingEventForItem, setCreatingEventForItem] = useState(false);

  const itemEvent = useMemo(
    () => events.find((ev) => ev.id === itemEventId) ?? null,
    [events, itemEventId],
  );

  const { addEntry, saving: itemSaving } = useEventDetails(itemEventId);
  const {
    items: inboxItems,
    saving: inboxSaving,
    addItem: addInboxItemRaw,
    updateItem: updateInboxItem,
    removeItem: removeInboxItem,
    assignToEvent,
  } = useInboxItems();

  const dashboardCards = useMemo(
    () => buildDashboardCards(events, inboxItems),
    [events, inboxItems],
  );

  const openCreateModal = () => {
    setFormError(null);
    setFormKey((key) => key + 1);
    setModalOpen(true);
  };

  const openNovoItemModal = (eventId = null) => {
    setItemEventId(eventId);
    setNovoItemOpen(true);
  };

  const addInboxItem = async (fields) => {
    const newId = await addInboxItemRaw(fields);
    if (newId) {
      setHighlightInboxId(newId);
      setTimeout(() => setHighlightInboxId(null), 3000);
    }
    return Boolean(newId);
  };

  const handleAddEntry = async (payload) => {
    if (itemEventId) return addEntry(payload);
    return addInboxItem(payload);
  };

  const handleFormSubmit = async (fields) => {
    setSaving(true);
    setFormError(null);
    try {
      const newId = await addEvent(fields);
      setModalOpen(false);
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 3000);
      setFormKey((key) => key + 1);
    } catch (err) {
      setFormError(err.message ?? 'Não foi possível guardar o evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineUpdate = async (eventId, fields) => {
    try {
      await updateEvent(eventId, fields);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = (event) => {
    openNovoItemModal(event.id);
  };

  const handleCreateEventForItem = async ({ eventName, eventDate, pax }) => {
    setCreatingEventForItem(true);
    try {
      const newId = await addEvent({
        eventName,
        eventDate,
        eventNumber: '',
        endDate: '',
        pax: pax ?? '',
      });
      setItemEventId(newId);
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 3000);
      return newId;
    } finally {
      setCreatingEventForItem(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Bairro Alto Hotel
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Eventos</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Notas e eventos no mesmo mural · duplo clique para editar
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => openNovoItemModal()}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Novo Item</span>
              <span className="sm:hidden">Item</span>
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Novo Evento</span>
              <span className="sm:hidden">Evento</span>
            </button>
          </div>
        </div>
      </header>

      <section className="flex-1 px-4 py-4 pb-24">
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
            <p className="font-medium text-slate-800">Sem eventos</p>
            <p className="mt-2 text-sm">
              Use &quot;Novo Item&quot; para uma nota rápida ou &quot;Novo Evento&quot;.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {dashboardCards.map((card, index) => (
            <li key={card.key}>
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
          ))}
        </ul>
      </section>

      <EventFormModal
        key={formKey}
        open={modalOpen}
        mode="create"
        initialEvent={null}
        saving={saving}
        error={formError}
        onClose={() => !saving && setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <NovoItemModal
        open={novoItemOpen}
        onClose={() => setNovoItemOpen(false)}
        eventId={itemEventId}
        event={itemEvent}
        events={events}
        saving={itemSaving || inboxSaving}
        creatingEvent={creatingEventForItem}
        onAddEntry={handleAddEntry}
        onEventChange={setItemEventId}
        onCreateEvent={handleCreateEventForItem}
        showEventPicker
      />
    </div>
  );
}
