import { useMemo } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';
import { useAllPlanItems } from '../hooks/useAllPlanItems';
import {
  rowDateHeading,
  rowDateKey,
  rowKindLabel,
  rowMetaLine,
  rowTitle,
} from '../utils/chronologicalItems';

function groupItemsByDate(items) {
  const groups = [];
  for (const item of items) {
    const dateKey = rowDateKey(item);
    const last = groups[groups.length - 1];
    if (!last || last.dateKey !== dateKey) {
      groups.push({ dateKey, items: [item] });
    } else {
      last.items.push(item);
    }
  }
  return groups;
}

function NoteChildRow({ row, onSelectEvent, onSelectNote }) {
  const handleClick = () => {
    if (row.source === 'inbox') onSelectNote?.(row.entryId);
    else onSelectEvent?.(row.eventId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-start gap-2 border-l-2 border-amber-300/70 py-2 pl-3 pr-2 text-left transition hover:bg-amber-50/60"
    >
      <span className="mt-0.5 shrink-0 text-xs text-amber-800/50" aria-hidden>
        ↳
      </span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-slate-600">{rowTitle(row)}</span>
    </button>
  );
}

function ListRow({ row, onSelectEvent, onSelectNote }) {
  const handleClick = () => {
    if (row.source === 'inbox') onSelectNote?.(row.entryId);
    else onSelectEvent?.(row.eventId);
  };

  const isNote = rowKindLabel(row) === 'Nota';
  const meta = rowMetaLine(row);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-amber-50/50 active:bg-amber-50/80"
    >
      <span
        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          isNote ? 'bg-post-it/80 text-slate-600' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {rowKindLabel(row)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-slate-900">{rowTitle(row)}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{row.eventLabel}</span>
        {meta && <span className="mt-0.5 block text-xs text-slate-400">{meta}</span>}
      </span>
    </button>
  );
}

function ItemBlock({ item, onSelectEvent, onSelectNote }) {
  const hasChildren = item.children?.length > 0;

  return (
    <div className="border-b border-amber-200/60 last:border-b-0">
      <ListRow row={item} onSelectEvent={onSelectEvent} onSelectNote={onSelectNote} />
      {hasChildren && (
        <div className="bg-amber-50/25 pb-1 pl-6 pr-2">
          {item.children.map((child) => (
            <NoteChildRow
              key={child.id}
              row={child}
              onSelectEvent={onSelectEvent}
              onSelectNote={onSelectNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ItemsList({ onBack, onSelectEvent, onSelectNote }) {
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const { items: inboxItems, loading: inboxLoading, error: inboxError } = useInboxItems();
  const { items, loading: detailsLoading, error: detailsError } = useAllPlanItems(
    events,
    inboxItems,
  );

  const dateGroups = useMemo(() => groupItemsByDate(items), [items]);

  const loading = eventsLoading || inboxLoading || detailsLoading;
  const error = eventsError || inboxError || detailsError;

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1.5rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="touch-target mt-0.5 flex shrink-0 items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white active:scale-[0.98]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Bairro Alto Hotel
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Itens e notas</h1>
            <p className="mt-0.5 text-xs text-slate-500">Todos os pratos e notas · ordem cronológica</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-24">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>A carregar…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os itens.
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-amber-300 bg-white/60 px-4 py-10 text-center text-slate-500">
            Nenhum item ou nota registado.
          </p>
        )}

        {!loading && !error && dateGroups.length > 0 && (
          <div className="space-y-5">
            {dateGroups.map((group) => (
              <section key={group.dateKey || '__no_date__'}>
                <h2 className="mb-1 border-b border-amber-300/80 pb-1 text-sm font-bold text-slate-800">
                  {rowDateHeading(group.dateKey)}
                </h2>
                <div className="overflow-hidden rounded-xl border border-amber-200/80 bg-white shadow-sm">
                  {group.items.map((item) => (
                    <ItemBlock
                      key={item.id}
                      item={item}
                      onSelectEvent={onSelectEvent}
                      onSelectNote={onSelectNote}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
