import { X } from 'lucide-react';
import NovoItemForm from './NovoItemForm';

export default function NovoItemModal({
  open,
  onClose,
  eventId,
  event,
  events = [],
  saving,
  creatingEvent = false,
  onAddEntry,
  onEventChange,
  onCreateEvent,
  showEventPicker = false,
  attachToDish = null,
  defaultMode = 'dish',
}) {
  if (!open) return null;

  const eventLabel = event?.eventName || event?.eventNumber;
  const isInbox = !eventId && showEventPicker;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="novo-item-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-200 bg-post-it shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-amber-200/80 p-5 pb-4">
          <div>
            <h2 id="novo-item-title" className="text-xl font-semibold text-slate-900">
              {attachToDish
                ? 'Nota no item'
                : defaultMode === 'note'
                  ? 'Nova nota'
                  : 'Novo item'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {attachToDish
                ? `Para: ${attachToDish.name}`
                : defaultMode === 'note'
                  ? eventLabel
                    ? `Nota em: ${eventLabel}`
                    : 'Nota rápida — evento opcional'
                  : eventLabel
                    ? `A adicionar a: ${eventLabel}`
                    : isInbox
                      ? 'Prato — evento opcional'
                      : 'Data, hora e prato'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center rounded-lg text-slate-500 hover:bg-amber-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 pt-4">
          <NovoItemForm
            eventId={eventId}
            event={event}
            events={events}
            saving={saving}
            creatingEvent={creatingEvent}
            onAddEntry={onAddEntry}
            onEventChange={onEventChange}
            onCreateEvent={onCreateEvent}
            showEventPicker={showEventPicker && !attachToDish}
            attachToDish={attachToDish}
            defaultMode={defaultMode}
          />
        </div>
      </div>
    </div>
  );
}
