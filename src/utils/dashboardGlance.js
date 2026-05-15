import { startOfToday } from './dashboardCards';
import { dateToInputValue } from './eventFields';
import { formatDishDateWithWeekday } from './dishes';
import {
  buildChronologicalRows,
  rowDateKey,
  rowLocationLabel,
  rowTimeLabel,
  rowTitle,
} from './chronologicalItems';
import { isDishEntry, isNoteEntry } from './planEntries';

function isUpcomingRow(row) {
  const dateKey = rowDateKey(row);
  if (!dateKey) return true;
  const todayKey = dateToInputValue(startOfToday());
  return dateKey >= todayKey;
}

function mapRowBase(row) {
  const dateKey = rowDateKey(row);
  return {
    id: row.id,
    entryId: row.entryId,
    source: row.source,
    eventId: row.eventId,
    eventLabel: row.eventLabel,
    title: rowTitle(row),
    time: rowTimeLabel(row),
    location: rowLocationLabel(row),
    dateKey,
    dateLabel: dateKey ? formatDishDateWithWeekday(dateKey) : 'Sem data',
  };
}

/** Next dishes/items (excludes notes), soonest first. */
export function buildUpcomingDashboardItems(events, eventDetailsById, inboxItems) {
  const rows = buildChronologicalRows(events, eventDetailsById, inboxItems);

  return rows
    .filter((row) => isDishEntry(row.entry) && isUpcomingRow(row))
    .map((row) => mapRowBase(row));
}

/** Standalone and attached notes with event / inbox context. */
export function buildDashboardNotes(events, eventDetailsById, inboxItems, limit = 8) {
  const rows = buildChronologicalRows(events, eventDetailsById, inboxItems);
  const dishTitleById = new Map();

  for (const row of rows) {
    if (isDishEntry(row.entry)) {
      dishTitleById.set(row.entryId, rowTitle(row));
    }
  }

  return rows
    .filter((row) => isNoteEntry(row.entry) && isUpcomingRow(row))
    .slice(0, limit)
    .map((row) => {
      const attachedId = row.entry.attachedDishId;
      const dishTitle = attachedId ? dishTitleById.get(attachedId) : null;

      return {
        ...mapRowBase(row),
        isInbox: row.source === 'inbox',
        attachedDishTitle: dishTitle,
        linkLabel:
          row.source === 'inbox'
            ? 'Nota rápida'
            : row.eventLabel || 'Ver evento',
      };
    });
}
