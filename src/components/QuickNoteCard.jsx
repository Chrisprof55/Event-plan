import { Trash2 } from 'lucide-react';
import { QuickNoteTitleBlock } from './QuickNoteTitleBlock';

export default function QuickNoteCard({
  item,
  index,
  highlighted,
  onSelect,
  onRemove,
}) {
  const tint = index % 2 === 0 ? 'bg-post-it' : 'bg-post-it-blue';

  const handleOpen = () => {
    if (item?.id) onSelect?.(item.id);
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={handleOpen}
        className={`flex min-h-[7rem] w-full cursor-pointer rounded-2xl border border-amber-200/70 p-4 pr-12 text-left shadow-md transition hover:shadow-lg active:scale-[0.99] ${tint} ${
          highlighted ? 'ring-2 ring-slate-900/25' : ''
        }`}
        style={{ transform: index % 2 === 0 ? 'rotate(-0.4deg)' : 'rotate(0.35deg)' }}
      >
        <QuickNoteTitleBlock item={item} preview />

        <span className="pointer-events-none absolute bottom-3 right-4 text-xs font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
          Toque para editar
        </span>

        {highlighted && (
          <span className="pointer-events-none absolute bottom-3 left-4 text-xs font-medium text-slate-600">
            Toque para abrir
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 opacity-40 transition hover:bg-white/90 hover:text-red-600 hover:opacity-100 group-hover:opacity-70"
        aria-label="Eliminar nota"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
