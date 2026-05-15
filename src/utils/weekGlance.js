import { dateToInputValue } from './eventFields';
import { startOfToday } from './dashboardCards';
import {
  buildChronologicalList,
  rowDateKey,
  rowLocationLabel,
  rowTimeLabel,
  rowTitle,
} from './chronologicalItems';

function parseIsoDate(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getNext7DayKeys(from = startOfToday()) {
  const keys = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i += 1) {
    keys.push(dateToInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function eventOccursOnDay(event, dateKey) {
  if (!event?.eventDate || !dateKey) return false;
  const start = dateToInputValue(event.eventDate);
  const endRaw = event.endDate ? dateToInputValue(event.endDate) : start;
  const end = endRaw < start ? start : endRaw;
  return dateKey >= start && dateKey <= end;
}

export function formatWeekDayHeading(dateKey, isToday) {
  const parsed = parseIsoDate(dateKey);
  if (!parsed) return 'Sem data';
  const label = new Intl.DateTimeFormat('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(parsed);
  return isToday ? `${label} · Hoje` : label;
}

export function formatWeekDayShort(dateKey) {
  const parsed = parseIsoDate(dateKey);
  if (!parsed) return '—';
  return new Intl.DateTimeFormat('pt-PT', {
    weekday: 'short',
    day: 'numeric',
  }).format(parsed);
}

/** Load per day for heat strip (events + items count, normalized 0–1). */
export function buildWeekHeatLoad(events, eventDetailsById, inboxItems) {
  const days = buildWeekGlance(events, eventDetailsById, inboxItems);
  const counts = days.map((day) => ({
    dateKey: day.dateKey,
    isToday: day.isToday,
    shortLabel: day.shortLabel,
    eventCount: day.events.length,
    itemCount: day.items.length,
    load: day.events.length + day.items.length,
  }));
  const maxLoad = Math.max(1, ...counts.map((d) => d.load));

  return counts.map((day) => {
    const parsed = parseIsoDate(day.dateKey);
    const weekday = parsed
      ? new Intl.DateTimeFormat('pt-PT', { weekday: 'short' }).format(parsed).replace('.', '')
      : '—';
    const dayNum = parsed ? parsed.getDate() : '';

    return {
      ...day,
      weekday,
      dayNum,
      intensity: day.load / maxLoad,
      isBusiest: day.load > 0 && day.load === maxLoad,
    };
  });
}

/** Next 7 days with events and items for at-a-glance calendar. */
export function buildWeekGlance(events, eventDetailsById, inboxItems) {
  const todayKey = dateToInputValue(startOfToday());
  const dayKeys = getNext7DayKeys();
  const rows = buildChronologicalList(events, eventDetailsById, inboxItems);

  return dayKeys.map((dateKey) => {
    const dayEvents = (Array.isArray(events) ? events : [])
      .filter((event) => eventOccursOnDay(event, dateKey))
      .map((event) => ({
        id: event.id,
        label: event.eventName || event.eventNumber || 'Sem nome',
        pax: event.pax,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt'));

    const dayItems = rows
      .filter((row) => rowDateKey(row) === dateKey)
      .map((row) => ({
        id: row.id,
        entryId: row.entryId,
        source: row.source,
        eventId: row.eventId,
        eventLabel: row.eventLabel,
        time: rowTimeLabel(row),
        location: rowLocationLabel(row),
        title: rowTitle(row),
      }));

    return {
      dateKey,
      isToday: dateKey === todayKey,
      heading: formatWeekDayHeading(dateKey, dateKey === todayKey),
      shortLabel: formatWeekDayShort(dateKey),
      events: dayEvents,
      items: dayItems,
      isEmpty: dayEvents.length === 0 && dayItems.length === 0,
    };
  });
}
