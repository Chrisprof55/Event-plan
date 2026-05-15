import { dateToInputValue } from './eventFields';

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** YYYY-MM-DD values from event card start → end (inclusive). */
export function getEventAllowedDateInputs(event) {
  if (!event?.eventDate) return [];

  const start = startOfDay(event.eventDate);
  const endRaw = event.endDate ? startOfDay(event.endDate) : start;
  const end = endRaw < start ? start : endRaw;

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(dateToInputValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatEventDate(date) {
  if (!date) return null;
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDayMonth(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatEventDateRange(start, end) {
  if (!start) return null;
  if (!end || dayKey(start) === dayKey(end)) {
    return formatEventDate(start);
  }
  return `${formatDayMonth(start)} - ${formatDayMonth(end)}`;
}

export function hasValidPax(pax) {
  return pax != null && pax > 0;
}
