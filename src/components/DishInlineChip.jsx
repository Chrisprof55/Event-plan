import { MessageSquarePlus, X } from 'lucide-react';

export default function DishInlineChip({
  dish,
  highlighted,
  onEdit,
  onRemove,
  onAddNoteToItem,
}) {
  const label = `${dish.quantity ?? 1} ${dish.name ?? ''}`.trim();

  return (
    <span
      className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2 py-1 shadow-sm ${
        highlighted ? 'ring-2 ring-amber-400/60' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onEdit?.(dish)}
        className="cursor-pointer rounded px-0.5 text-left transition hover:bg-amber-100/70"
        title="Editar data, hora, local e notas"
      >
        <span className="font-bold text-slate-900">{dish.quantity}</span>{' '}
        <span className="font-medium text-slate-800">{dish.name}</span>
      </button>
      {onAddNoteToItem && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddNoteToItem(dish);
          }}
          className="rounded p-0.5 text-slate-400 transition hover:bg-amber-100 hover:text-amber-900"
          aria-label="Adicionar nota a este item"
          title="Adicionar nota"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
        </button>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(dish.id);
        }}
        className="rounded p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        aria-label="Eliminar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}
