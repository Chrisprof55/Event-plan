import {
  formatDishDateWithWeekday,
  formatSlotLabel,
  getDishDate,
  getDishLocation,
  getDishTime,
  sortDishesByDateAndTime,
} from './dishes';
import { getInboxItemTitle } from './entry';
import {
  getNoteText,
  isDishEntry,
  isNoteEntry,
  prepareEntriesForDisplay,
} from './planEntries';

function buildFlatRows(events, eventDetailsById, inboxItems) {
  const rows = [];

  for (const item of Array.isArray(inboxItems) ? inboxItems : []) {
    rows.push({
      id: `inbox-${item.id}`,
      entryId: item.id,
      source: 'inbox',
      eventId: null,
      eventLabel: 'Nota rápida',
      entry: item,
    });
  }

  for (const event of Array.isArray(events) ? events : []) {
    const details = eventDetailsById[event.id];
    if (!details) continue;

    const entries = prepareEntriesForDisplay(details.dishes, details.notes);
    const eventLabel = event.eventName || event.eventNumber || 'Sem nome';

    for (const entry of entries) {
      rows.push({
        id: `${event.id}-${entry.id}`,
        entryId: entry.id,
        source: 'event',
        eventId: event.id,
        eventLabel,
        entry,
      });
    }
  }

  return rows;
}

function sortRows(rows) {
  const tagged = rows.map((row) => ({ ...row.entry, __rowId: row.id }));
  const sorted = sortDishesByDateAndTime(tagged);
  const byRowId = new Map(rows.map((row) => [row.id, row]));
  return sorted.map((entry) => byRowId.get(entry.__rowId)).filter(Boolean);
}

/** Flat rows — legacy / simple consumers. */
export function buildChronologicalRows(events, eventDetailsById, inboxItems) {
  return sortRows(buildFlatRows(events, eventDetailsById, inboxItems));
}

/** Top-level items with attached notes nested under dishes. */
export function buildChronologicalList(events, eventDetailsById, inboxItems) {
  const flat = buildFlatRows(events, eventDetailsById, inboxItems);
  const attachedByDish = new Map();
  const topLevel = [];

  for (const row of flat) {
    const attachedId = row.entry.attachedDishId;
    if (isNoteEntry(row.entry) && attachedId) {
      const list = attachedByDish.get(attachedId) ?? [];
      list.push(row);
      attachedByDish.set(attachedId, list);
    } else {
      topLevel.push(row);
    }
  }

  const sortAttached = (notes) =>
    [...notes].sort((a, b) =>
      (a.entry.createdAt ?? '').localeCompare(b.entry.createdAt ?? ''),
    );

  return sortRows(topLevel).map((row) => ({
    ...row,
    children: sortAttached(attachedByDish.get(row.entryId) ?? []),
  }));
}

export function rowDateKey(row) {
  return getDishDate(row.entry);
}

export function rowKindLabel(row) {
  return isNoteEntry(row.entry) ? 'Nota' : 'Prato';
}

export function rowTitle(row) {
  const entry = row.entry;
  if (isDishEntry(entry)) {
    const qty = entry.quantity > 1 ? `${entry.quantity}× ` : '';
    return `${qty}${(entry.name ?? '').trim() || 'Sem nome'}`;
  }
  const text = getNoteText(entry);
  return text.split('\n')[0].trim().slice(0, 120) || getInboxItemTitle(entry);
}

export function rowTimeLabel(row) {
  return getDishTime(row.entry) || null;
}

export function rowLocationLabel(row) {
  return getDishLocation(row.entry) || null;
}

export function rowMetaLine(row) {
  const time = getDishTime(row.entry);
  const location = getDishLocation(row.entry);
  const slot = formatSlotLabel(time, location);
  if (slot === 'Sem hora · Sem local') return null;
  return slot;
}

export function rowDateHeading(dateKey) {
  return dateKey ? formatDishDateWithWeekday(dateKey) : 'Sem data';
}

function rowTimeSortKey(row) {
  const match = String(getDishTime(row.entry) ?? '')
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Group key when event + room (location) are set — event items only. */
export function eventRoomGroupKey(row) {
  if (row.source !== 'event' || !row.eventId) return null;
  const location = getDishLocation(row.entry);
  if (!location) return null;
  return `${row.eventId}::${location.toLowerCase()}`;
}

/**
 * Within a single date, merge rows that share event + room into one block (2+ items).
 * Returns { type: 'single', row } | { type: 'group', eventLabel, location, rows[] }.
 */
export function groupListRowsByEventRoom(rows) {
  const buckets = new Map();

  for (const row of rows) {
    const key = eventRoomGroupKey(row);
    if (!key) continue;
    const bucket = buckets.get(key) ?? {
      key,
      eventLabel: row.eventLabel,
      location: getDishLocation(row.entry),
      rows: [],
    };
    bucket.rows.push(row);
    buckets.set(key, bucket);
  }

  const groupedKeys = new Set(
    [...buckets.entries()].filter(([, b]) => b.rows.length >= 2).map(([k]) => k),
  );

  const blocks = [];
  const placedGroups = new Set();

  for (const row of rows) {
    const key = eventRoomGroupKey(row);
    if (key && groupedKeys.has(key)) {
      if (!placedGroups.has(key)) {
        placedGroups.add(key);
        const bucket = buckets.get(key);
        const sorted = [...bucket.rows].sort(
          (a, b) => rowTimeSortKey(a) - rowTimeSortKey(b) || a.id.localeCompare(b.id),
        );
        blocks.push({
          type: 'group',
          id: `group-${key}`,
          eventLabel: bucket.eventLabel,
          location: bucket.location,
          rows: sorted,
        });
      }
      continue;
    }
    blocks.push({ type: 'single', id: row.id, row });
  }

  return blocks;
}
