import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAllPlanItems } from '../hooks/useAllPlanItems';
import {
  groupListRowsByEventRoom,
  rowDateHeading,
  rowDateKey,
  rowLocationLabel,
  rowTimeLabel,
  rowTitle,
} from '../utils/chronologicalItems';

function TimeColumn({ time }) {
  if (time) {
    return (
      <span className="flex w-[3.25rem] shrink-0 flex-col items-end pt-0.5 tabular-nums">
        <span className="text-lg font-bold leading-none tracking-tight text-slate-900">{time}</span>
      </span>
    );
  }

  return (
    <span
      className="flex w-[3.25rem] shrink-0 items-start justify-end pt-1 text-sm font-medium text-slate-300"
      aria-hidden
    >
      ··
    </span>
  );
}

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
  return groups.map((group) => ({
    ...group,
    blocks: groupListRowsByEventRoom(group.items),
  }));
}

function NoteChildRow({ row, onSelectEvent, onSelectNote }) {
  const handleClick = () => {
    if (row.source === 'inbox') onSelectNote?.(row.entryId);
    else onSelectEvent?.(row.eventId);
  };

  const time = rowTimeLabel(row);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-start gap-2 border-l-2 border-amber-300/70 py-2 pl-2 pr-3 text-left transition hover:bg-amber-50/60"
    >
      {time ? (
        <span className="w-[3.25rem] shrink-0 text-right text-sm font-semibold tabular-nums text-slate-700">
          {time}
        </span>
      ) : (
        <span className="w-[3.25rem] shrink-0 text-right text-xs text-amber-800/40" aria-hidden>
          ↳
        </span>
      )}
      <span className="min-w-0 flex-1 text-sm leading-snug text-slate-600">{rowTitle(row)}</span>
    </button>
  );
}

function ListRow({ row, onSelectEvent, onSelectNote, grouped = false }) {
  const handleClick = () => {
    if (row.source === 'inbox') onSelectNote?.(row.entryId);
    else onSelectEvent?.(row.eventId);
  };

  const time = rowTimeLabel(row);
  const location = rowLocationLabel(row);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex w-full items-start gap-2 text-left transition hover:bg-amber-50/50 active:bg-amber-50/80 ${
        grouped ? 'px-3 py-2.5' : 'px-3 py-3'
      }`}
    >
      <TimeColumn time={time} />

      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-snug text-slate-900">{rowTitle(row)}</span>
        {!grouped && (
          <>
            <span className="mt-1 block text-xs text-slate-500">{row.eventLabel}</span>
            {location && (
              <span className="mt-0.5 block text-xs font-medium text-slate-600">{location}</span>
            )}
          </>
        )}
      </span>
    </button>
  );
}

function ItemBlock({ item, onSelectEvent, onSelectNote, grouped = false }) {
  const hasChildren = item.children?.length > 0;

  return (
    <div className={grouped ? '' : 'border-b border-amber-200/60 last:border-b-0'}>
      <ListRow
        row={item}
        grouped={grouped}
        onSelectEvent={onSelectEvent}
        onSelectNote={onSelectNote}
      />
      {hasChildren && (
        <div
          className={`bg-amber-50/25 pb-1 pl-6 pr-2 ${grouped ? 'border-t border-amber-100/80' : ''}`}
        >
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

function EventRoomGroup({ block, onSelectEvent, onSelectNote }) {
  return (
    <div className="border-b border-amber-200/60 last:border-b-0">
      <div className="border-b border-amber-200/70 bg-amber-50/60 px-3 py-2">
        <p className="text-sm font-semibold text-slate-900">{block.eventLabel}</p>
        <p className="text-xs font-medium text-slate-600">{block.location}</p>
      </div>
      <div className="divide-y divide-amber-100/90">
        {block.rows.map((row) => (
          <ItemBlock
            key={row.id}
            item={row}
            grouped
            onSelectEvent={onSelectEvent}
            onSelectNote={onSelectNote}
          />
        ))}
      </div>
    </div>
  );
}

function ListBlock({ block, onSelectEvent, onSelectNote }) {
  if (block.type === 'group') {
    return (
      <EventRoomGroup
        block={block}
        onSelectEvent={onSelectEvent}
        onSelectNote={onSelectNote}
      />
    );
  }
  return (
    <ItemBlock item={block.row} onSelectEvent={onSelectEvent} onSelectNote={onSelectNote} />
  );
}

export default function ItemsList({ contentClassName = '', onSelectEvent, onSelectNote }) {
  const { items, loading, error } = useAllPlanItems();

  const dateGroups = useMemo(() => groupItemsByDate(items), [items]);

  const showSpinner = loading && items.length === 0;

  return (
    <div className="flex min-h-dvh flex-col bg-amber-50/40">
      <header className="sticky top-0 z-10 border-b border-amber-200/80 bg-white/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Bairro Alto Hotel
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Items</h1>
          <p className="mt-0.5 text-xs text-slate-500">All dishes and notes · chronological</p>
        </div>
      </header>

      <main className={`mx-auto w-full max-w-3xl flex-1 px-4 py-4 ${contentClassName}`}>
        {showSpinner && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            <span>A carregar…</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar os items.
          </div>
        )}

        {!showSpinner && !error && items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-amber-300 bg-white/60 px-4 py-10 text-center text-slate-500">
            Nenhum item ou nota registado.
          </p>
        )}

        {!error && dateGroups.length > 0 && (
          <div
            className="space-y-5"
            style={{
              '--items-date-sticky-top':
                'calc(max(1rem, env(safe-area-inset-top, 0px)) + 5.25rem)',
            }}
          >
            {dateGroups.map((group) => (
              <section key={group.dateKey || '__no_date__'}>
                <h2
                  className="sticky z-20 -mx-4 mb-1 border-b border-amber-300/80 bg-amber-50/95 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md"
                  style={{ top: 'var(--items-date-sticky-top)' }}
                >
                  {rowDateHeading(group.dateKey)}
                </h2>
                <div className="overflow-hidden rounded-xl border border-amber-200/80 bg-white shadow-sm">
                  {group.blocks.map((block) => (
                    <ListBlock
                      key={block.id}
                      block={block}
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
