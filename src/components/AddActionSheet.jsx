import { CalendarPlus, StickyNote, UtensilsCrossed, X } from 'lucide-react';

const ALL_ACTIONS = [
  {
    id: 'item',
    label: 'Item',
    description: 'Prato ou serviço',
    icon: UtensilsCrossed,
    tint: 'bg-white',
  },
  {
    id: 'note',
    label: 'Nota',
    description: 'Nota rápida ou no evento',
    eventDescription: 'Nota neste evento',
    icon: StickyNote,
    tint: 'bg-post-it',
  },
  {
    id: 'event',
    label: 'Evento',
    description: 'Novo evento na agenda',
    icon: CalendarPlus,
    tint: 'bg-post-it-blue',
  },
];

export default function AddActionSheet({ open, onClose, onSelect, eventLabel = null }) {
  if (!open) return null;

  const forEvent = Boolean(eventLabel);
  const actions = forEvent
    ? ALL_ACTIONS.filter((action) => action.id !== 'event')
    : ALL_ACTIONS;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-sheet-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar menu"
        onClick={onClose}
      />

      <div
        className="relative z-10 mx-auto w-full max-w-lg rounded-t-3xl border border-amber-200/80 bg-white px-4 pb-28 pt-4 shadow-2xl"
        style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="add-sheet-title" className="text-lg font-semibold text-slate-900">
              Adicionar
            </h2>
            {forEvent && (
              <p className="mt-0.5 truncate text-sm text-slate-600">Em: {eventLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2">
          {actions.map(({ id, label, description, eventDescription, icon: Icon, tint }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className="flex w-full items-center gap-4 rounded-2xl border border-amber-200/70 p-4 text-left transition active:scale-[0.98] hover:bg-amber-50/50"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tint} shadow-sm ring-1 ring-amber-200/60`}
                >
                  <Icon className="h-6 w-6 text-slate-700" strokeWidth={2} aria-hidden />
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{label}</span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    {forEvent && eventDescription ? eventDescription : description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
