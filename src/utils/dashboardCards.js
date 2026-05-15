import { isEventUpcoming, startOfToday } from './eventArchive';

function parseItemDate(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return new Date(`${trimmed}T12:00:00`);
}

function isNoteUpcoming(item) {
  const itemDate = parseItemDate(item.date);
  if (!itemDate) return true;
  const day = new Date(itemDate);
  day.setHours(0, 0, 0, 0);
  return day >= startOfToday();
}

function eventSortKey(event) {
  if (event.eventDate) return event.eventDate.getTime();
  return Number.MAX_SAFE_INTEGER;
}

function noteSortKey(item) {
  const itemDate = parseItemDate(item.date);
  if (itemDate) return itemDate.getTime();
  const created = item.createdAt ? new Date(item.createdAt).getTime() : 0;
  return created || Number.MAX_SAFE_INTEGER;
}

/** Events + quick notes, upcoming only, soonest first. */
export function buildDashboardCards(events, inboxItems) {
  const cards = [
    ...(Array.isArray(inboxItems) ? inboxItems : [])
      .filter(isNoteUpcoming)
      .map((item) => ({
        key: `note-${item.id}`,
        type: 'note',
        item,
        sortKey: noteSortKey(item),
      })),
    ...(Array.isArray(events) ? events : [])
      .filter(isEventUpcoming)
      .map((event) => ({
        key: `event-${event.id}`,
        type: 'event',
        event,
        sortKey: eventSortKey(event),
      })),
  ];

  return cards.sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
    if (a.type !== b.type) return a.type === 'event' ? -1 : 1;
    return a.key.localeCompare(b.key);
  });
}

export { parseItemDate, isNoteUpcoming };
export { startOfToday, isEventUpcoming } from './eventArchive';
