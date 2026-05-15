import { startOfToday } from './dashboardCards';
import { dateToInputValue } from './eventFields';
import { formatDishDateWithWeekday } from './dishes';
import {
  buildChronologicalRows,
  rowDateHeading,
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

export function groupUpcomingByDate(items) {
  const groups = [];
  for (const item of items) {
    const dateKey = item.dateKey ?? '';
    const last = groups[groups.length - 1];
    if (!last || last.dateKey !== dateKey) {
      groups.push({
        dateKey,
        heading: rowDateHeading(dateKey),
        items: [item],
      });
    } else {
      last.items.push(item);
    }
  }
  return groups;
}

/** Next dishes/items (excludes notes), soonest first. */
export function buildUpcomingDashboardItems(events, eventDetailsById, inboxItems) {
  const rows = buildChronologicalRows(events, eventDetailsById, inboxItems);

  return rows
    .filter((row) => isDishEntry(row.entry) && isUpcomingRow(row))
    .map((row) => mapRowBase(row));
}

function mapDashboardNote(row, dishTitleById) {
  const attachedId = row.entry.attachedDishId;
  const dishTitle = attachedId ? dishTitleById.get(attachedId) : null;

  return {
    ...mapRowBase(row),
    isInbox: row.source === 'inbox',
    attachedDishTitle: dishTitle,
    linkLabel:
      row.source === 'inbox' ? 'Nota rápida' : row.eventLabel || 'Ver evento',
  };
}

/** Upcoming notes (flat). */
export function buildDashboardNotes(events, eventDetailsById, inboxItems) {
  const rows = buildChronologicalRows(events, eventDetailsById, inboxItems);
  const dishTitleById = new Map();

  for (const row of rows) {
    if (isDishEntry(row.entry)) {
      dishTitleById.set(row.entryId, rowTitle(row));
    }
  }

  return rows
    .filter((row) => isNoteEntry(row.entry) && isUpcomingRow(row))
    .map((row) => mapDashboardNote(row, dishTitleById));
}

function noteGroupKey(note) {
  if (note.isInbox) return `inbox:${note.entryId}`;
  return `event:${note.eventId ?? note.id}`;
}

/** One dashboard row per event (inbox notes stay one row each). */
export function groupDashboardNotes(notes) {
  const groups = [];

  for (const note of notes) {
    const groupKey = noteGroupKey(note);
    const last = groups[groups.length - 1];

    if (last && last.groupKey === groupKey) {
      last.notes.push(note);
    } else {
      groups.push({
        id: groupKey,
        groupKey,
        eventId: note.eventId,
        isInbox: note.isInbox,
        entryId: note.entryId,
        eventLabel: note.eventLabel,
        linkLabel: note.linkLabel,
        dateKey: note.dateKey,
        dateLabel: note.dateLabel,
        notes: [note],
      });
    }
  }

  return groups.map((group) => {
    const count = group.notes.length;
    const first = group.notes[0];
    const titles = group.notes.map((n) => n.title).filter(Boolean);
    const uniqueTitles = [...new Set(titles)];

    return {
      ...group,
      time: first.time,
      location: first.location,
      title: group.isInbox
        ? first.title
        : group.eventLabel || first.eventLabel || 'Sem nome',
      subtitle:
        count > 1
          ? `${count} notas${uniqueTitles.length === 1 && uniqueTitles[0] ? ` · ${uniqueTitles[0]}` : ''}`
          : first.attachedDishTitle
            ? `No prato: ${first.attachedDishTitle}`
            : first.title !== group.eventLabel
              ? first.title
              : null,
    };
  });
}
