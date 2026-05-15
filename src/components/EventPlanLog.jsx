import { useMemo } from 'react';
import DishInlineChip from './DishInlineChip';
import NotePostIt from './NotePostIt';
import { groupPlanByDate, prepareEntriesForDisplay } from '../utils/planEntries';

export default function EventPlanLog({
  entries,
  legacyNotes = [],
  highlightId,
  onUpdateEntry,
  onRemoveEntry,
  onAddNoteToItem,
  emptyMessage,
  events,
  onAssignDish,
}) {
  const dateGroups = useMemo(
    () => groupPlanByDate(prepareEntriesForDisplay(entries, legacyNotes)),
    [entries, legacyNotes],
  );

  const hasContent =
    entries.length > 0 || (Array.isArray(legacyNotes) && legacyNotes.length > 0);

  if (!hasContent) {
    return (
      <p className="rounded-2xl border border-dashed border-amber-300 bg-white/60 px-4 py-10 text-center text-base text-slate-500">
        {emptyMessage ?? 'Nenhum item adicionado.'}
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {dateGroups.map((dateGroup) => (
        <li key={dateGroup.date || '__no_date__'}>
          <h3 className="mb-3 border-b border-amber-300/80 pb-1 text-base font-bold text-slate-900">
            {dateGroup.dateLabel}
          </h3>

          {dateGroup.eventNotes.length > 0 && (
            <ul className="mb-4 space-y-2">
              {dateGroup.eventNotes.map((note, i) => (
                <li key={note.id}>
                  <NotePostIt
                    entry={note}
                    index={i}
                    highlighted={highlightId === note.id}
                    onUpdate={onUpdateEntry}
                    onRemove={onRemoveEntry}
                  />
                </li>
              ))}
            </ul>
          )}

          <ul className="space-y-3">
            {dateGroup.slots.map((slot) => (
              <li
                key={`${dateGroup.date}-${slot.time}-${slot.location}`}
                className="space-y-2"
              >
                <p className="text-sm font-semibold text-slate-700">{slot.label}</p>

                {slot.slotNotes.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {slot.slotNotes.map((note, i) => (
                      <li key={note.id} className="min-w-[10rem] flex-1 sm:max-w-md">
                        <NotePostIt
                          entry={note}
                          index={i}
                          highlighted={highlightId === note.id}
                          onUpdate={onUpdateEntry}
                          onRemove={onRemoveEntry}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {slot.dishes.length > 0 && (
                  <ul className="space-y-2">
                    {slot.dishes.map((dish) => (
                      <li key={dish.id} className="space-y-1.5">
                        <div className="flex flex-wrap items-start gap-2">
                          <DishInlineChip
                            dish={dish}
                            highlighted={highlightId === dish.id}
                            onUpdate={onUpdateEntry}
                            onRemove={onRemoveEntry}
                            onAddNoteToItem={onAddNoteToItem}
                            events={events}
                            onAssignEvent={onAssignDish}
                          />
                          {(slot.attachedByDish[dish.id] ?? []).map((note, i) => (
                            <NotePostIt
                              key={note.id}
                              entry={note}
                              index={i}
                              highlighted={highlightId === note.id}
                              onUpdate={onUpdateEntry}
                              onRemove={onRemoveEntry}
                              compact
                            />
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
