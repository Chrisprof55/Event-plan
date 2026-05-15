import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import EventPlanLog from '../components/EventPlanLog';
import NovoItemModal from '../components/NovoItemModal';
import PlanDetailHeader from '../components/PlanDetailHeader';
import { QuickNoteTitleBlock } from '../components/QuickNoteTitleBlock';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';

const selectClassName =
  'min-h-12 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-amber-400 focus:ring-2';

export default function QuickNoteDetail({ noteId, onBack }) {
  const { events } = useEvents();
  const {
    items,
    loading,
    saving,
    addEntry,
    updateItem,
    removeItem,
    assignToEvent,
  } = useInboxItems();

  const [deleting, setDeleting] = useState(false);
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [attachToDish, setAttachToDish] = useState(null);

  const focusItem = useMemo(
    () => items.find((entry) => entry.id === noteId) ?? null,
    [items, noteId],
  );

  const handleDelete = async () => {
    const label = focusItem?.name || 'esta nota';
    const confirmed = window.confirm(`Eliminar "${label}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await removeItem(noteId);
      onBack();
    } finally {
      setDeleting(false);
    }
  };

  const handleAssign = async (eventId) => {
    if (!focusItem || !eventId) return;
    await assignToEvent(focusItem.id, eventId);
    onBack();
  };

  const openAttachNote = (dish) => {
    setAttachToDish(dish);
    setNovoItemOpen(true);
  };

  const closeNovoItem = () => {
    setNovoItemOpen(false);
    setAttachToDish(null);
  };

  const titleBlock = useMemo(
    () => (
      <>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
          Nota rápida
        </p>
        {focusItem ? (
          <QuickNoteTitleBlock
            item={focusItem}
            onUpdate={(fields) => updateItem(focusItem.id, fields)}
            events={events}
            onAssign={assignToEvent}
            size="detail"
          />
        ) : (
          <h1 className="text-2xl font-bold text-slate-900">Notas rápidas</h1>
        )}
      </>
    ),
    [focusItem, events, updateItem, assignToEvent],
  );

  const assignExtra =
    events.length > 0 && focusItem ? (
      <div className="rounded-xl border border-amber-200/80 bg-white/70 px-4 py-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Associar nota focada a evento
          </span>
          <select
            value=""
            onChange={(e) => {
              const eventId = e.target.value;
              if (eventId) handleAssign(eventId);
            }}
            className={selectClassName}
          >
            <option value="">Selecione um evento…</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.eventName || ev.eventNumber || 'Sem nome'}
              </option>
            ))}
          </select>
        </label>
      </div>
    ) : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-amber-50/40 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span>A carregar…</span>
      </div>
    );
  }

  if (!focusItem) {
    return (
      <div className="flex min-h-screen flex-col bg-amber-50/40 px-5 py-8 sm:px-6">
        <p className="text-slate-600">Nota não encontrada.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm font-semibold text-slate-800 underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/40">
      <PlanDetailHeader
        onBack={onBack}
        titleBlock={titleBlock}
        onAddItem={() => setNovoItemOpen(true)}
        onDelete={handleDelete}
        deleteDisabled={deleting}
        deleting={deleting}
        extra={assignExtra}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 lg:px-8 lg:py-6">
        <EventPlanLog
          entries={items}
          highlightId={noteId}
          onUpdateEntry={updateItem}
          onRemoveEntry={removeItem}
          onAddNoteToItem={openAttachNote}
          emptyMessage="Nenhum item. Use + para adicionar."
        />
      </main>

      <NovoItemModal
        open={novoItemOpen}
        onClose={closeNovoItem}
        saving={saving}
        onAddEntry={addEntry}
        showEventPicker
        events={events}
        attachToDish={attachToDish}
      />
    </div>
  );
}
