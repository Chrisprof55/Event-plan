import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import DishEditModal from '../components/DishEditModal';
import EventFormModal from '../components/EventFormModal';
import EventPlanLog from '../components/EventPlanLog';
import NovoItemModal from '../components/NovoItemModal';
import { getAttachedNotes } from '../utils/planEntries';
import PlanDetailHeader from '../components/PlanDetailHeader';
import { EventTitleBlock } from '../components/EventTitleBlock';
import { deleteStoredPdf, useEventPdf } from '../hooks/useEventPdf';
import { useEvent } from '../hooks/useEvents';
import { useEventDetails } from '../hooks/useEventDetails';

function formatGrandTotal(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  }
  return String(value);
}

export default function EventDetail({ eventId, onBack }) {
  const { event, loading: eventLoading, updateEvent, deleteEvent } = useEvent(eventId);
  const {
    details,
    loading: detailsLoading,
    error,
    saving,
    addEntry,
    addNoteToItem,
    updateEntry,
    updateDishAnchor,
    removeEntry,
  } = useEventDetails(eventId);
  const { uploadPdf, removePdf, uploading: pdfUploading } = useEventPdf(
    eventId,
    event,
    updateEvent,
  );

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [attachToDish, setAttachToDish] = useState(null);
  const [editingDish, setEditingDish] = useState(null);

  const editingAttachedNotes = useMemo(
    () => getAttachedNotes(details.dishes, editingDish?.id),
    [details.dishes, editingDish?.id],
  );

  const loading = eventLoading || detailsLoading;
  const grandTotalLabel = formatGrandTotal(event?.grandTotal);

  const handleEditSubmit = async (fields) => {
    setEditSaving(true);
    setEditError(null);
    try {
      await updateEvent(eventId, fields);
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err.message ?? 'Não foi possível guardar o evento.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    const label = event?.eventName || event?.eventNumber || 'este evento';
    const confirmed = window.confirm(
      `Eliminar "${label}"?\n\nEsta ação remove o evento e todos os itens associados. Não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteStoredPdf(event?.pdfStoragePath);
      await deleteEvent(eventId);
      onBack();
    } catch (err) {
      window.alert(err.message ?? 'Não foi possível eliminar o evento.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePdfRemove = async () => {
    const confirmed = window.confirm('Remover o PDF deste evento?');
    if (!confirmed) return;
    try {
      await removePdf();
    } catch (err) {
      window.alert(err.message ?? 'Não foi possível remover o PDF.');
    }
  };

  const openAttachNote = (dish) => {
    setEditingDish(null);
    setAttachToDish(dish);
    setNovoItemOpen(true);
  };

  const closeNovoItem = () => {
    setNovoItemOpen(false);
    setAttachToDish(null);
  };

  const handleDishSave = async ({ dishId, date, time, location, name, quantity, noteUpdates }) => {
    await updateDishAnchor(
      dishId,
      { date, time, location, name, quantity },
      noteUpdates,
    );
  };

  const handleAddNoteFromEdit = (dish) => {
    openAttachNote(dish);
  };

  const titleBlock = useMemo(
    () =>
      event ? (
        <EventTitleBlock event={event} onUpdate={(fields) => updateEvent(eventId, fields)} size="detail" />
      ) : (
        <p className="text-slate-500">A carregar…</p>
      ),
    [event, eventId, updateEvent],
  );

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/40">
      <PlanDetailHeader
        onBack={onBack}
        titleBlock={titleBlock}
        grandTotalLabel={grandTotalLabel}
        onAddItem={() => setNovoItemOpen(true)}
        onEdit={() => setEditModalOpen(true)}
        onDelete={handleDeleteEvent}
        addDisabled={!event}
        editDisabled={!event}
        deleteDisabled={!event || deleting}
        deleting={deleting}
        showPdf
        event={event}
        pdfUploading={pdfUploading}
        onPdfUpload={uploadPdf}
        onPdfRemove={handlePdfRemove}
      />

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-2 py-20 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>A carregar…</span>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-8">
          Erro ao carregar os detalhes do evento.
        </div>
      )}

      {!loading && (
        <EventPlanLog
          entries={details.dishes}
          legacyNotes={details.notes}
          onUpdateEntry={updateEntry}
          onRemoveEntry={removeEntry}
          onAddNoteToItem={openAttachNote}
          onEditDish={setEditingDish}
          pinEventNotesUnderHeader
          emptyMessage="Nenhum item. Use + para adicionar pratos ou notas."
        />
      )}

      <EventFormModal
        key={eventId}
        open={editModalOpen}
        mode="edit"
        initialEvent={event}
        saving={editSaving}
        error={editError}
        onClose={() => !editSaving && setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      <NovoItemModal
        open={novoItemOpen}
        onClose={closeNovoItem}
        eventId={eventId}
        event={event}
        saving={saving}
        onAddEntry={addEntry}
        attachToDish={attachToDish}
      />

      <DishEditModal
        open={Boolean(editingDish)}
        dish={editingDish}
        attachedNotes={editingAttachedNotes}
        event={event}
        saving={saving}
        onClose={() => setEditingDish(null)}
        onSave={handleDishSave}
        onRemoveNote={removeEntry}
        onAddNote={handleAddNoteFromEdit}
      />
    </div>
  );
}
