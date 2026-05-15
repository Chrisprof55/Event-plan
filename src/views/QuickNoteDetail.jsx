import { useCallback, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import EventPlanLog from '../components/EventPlanLog';
import NovoItemModal from '../components/NovoItemModal';
import PlanDetailHeader from '../components/PlanDetailHeader';
import { QuickNoteTitleBlock } from '../components/QuickNoteTitleBlock';
import { getInboxItemTitle } from '../utils/entry';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';

export default function QuickNoteDetail({ noteId, onBack, onAssigned }) {
  const { activeEvents } = useEvents();
  const {
    items,
    loading,
    saving,
    addEntry,
    updateItem,
    removeItem,
    assignToEvent,
    convertToNewEvent,
  } = useInboxItems();

  const [deleting, setDeleting] = useState(false);
  const [filingBusy, setFilingBusy] = useState(false);
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [attachToDish, setAttachToDish] = useState(null);

  const focusItem = useMemo(
    () => items.find((entry) => entry.id === noteId) ?? null,
    [items, noteId],
  );

  const handleDelete = async () => {
    const label = getInboxItemTitle(focusItem) || 'esta nota';
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

  const finishFiling = (eventId) => {
    if (eventId) onAssigned?.(eventId);
    else onBack();
  };

  const handleAssign = useCallback(
    async (eventId) => {
      if (!focusItem || !eventId) return;
      setFilingBusy(true);
      try {
        await assignToEvent(focusItem.id, eventId);
        finishFiling(eventId);
      } catch (err) {
        window.alert(err?.message ?? 'Não foi possível associar a nota.');
      } finally {
        setFilingBusy(false);
      }
    },
    [focusItem, assignToEvent, onAssigned, onBack],
  );

  const handleCreateEventFromTitle = useCallback(async () => {
    if (!focusItem) return;
    const title = getInboxItemTitle(focusItem);
    if (!title || title === 'Sem nome') {
      window.alert('Dê um nome à nota antes de criar o evento.');
      return;
    }

    setFilingBusy(true);
    try {
      const eventId = await convertToNewEvent(focusItem.id);
      finishFiling(eventId);
    } catch (err) {
      window.alert(err?.message ?? 'Não foi possível criar o evento.');
    } finally {
      setFilingBusy(false);
    }
  }, [focusItem, convertToNewEvent, onAssigned, onBack]);

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
            size="detail"
            activeEvents={activeEvents}
            onCreateEvent={handleCreateEventFromTitle}
            onAssignToEvent={handleAssign}
            filingBusy={filingBusy}
          />
        ) : (
          <h1 className="text-2xl font-bold text-slate-900">Notas rápidas</h1>
        )}
      </>
    ),
    [focusItem, updateItem, activeEvents, filingBusy, handleCreateEventFromTitle, handleAssign],
  );

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
    <motion className="flex min-h-screen flex-col bg-amber-50/40">
      <PlanDetailHeader
        onBack={onBack}
        titleBlock={titleBlock}
        onAddItem={() => setNovoItemOpen(true)}
        onDelete={handleDelete}
        deleteDisabled={deleting}
        deleting={deleting}
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
        events={activeEvents}
        attachToDish={attachToDish}
      />
    </motion>
  );
}
