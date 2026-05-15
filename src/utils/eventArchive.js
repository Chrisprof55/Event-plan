import { dateToInputValue } from './eventFields';

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Last calendar day the event is considered active (inclusive). */
export function getEventEndDate(event) {
  if (!event?.eventDate) return null;
  const end =
    event.endDate && event.endDate >= event.eventDate ? event.endDate : event.eventDate;
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  return endDay;
}

/** Active on the agenda: no end date yet, or end date is today or later. */
export function isEventUpcoming(event) {
  const endDay = getEventEndDate(event);
  if (!endDay) return true;
  return endDay >= startOfToday();
}

export function isEventArchived(event) {
  return !isEventUpcoming(event);
}

export function eventEndSortKey(event) {
  const endDay = getEventEndDate(event);
  if (!endDay) return Number.MIN_SAFE_INTEGER;
  return endDay.getTime();
}

export function eventEndDateKey(event) {
  const endDay = getEventEndDate(event);
  return endDay ? dateToInputValue(endDay) : '';
}

export function partitionEvents(events) {
  const active = [];
  const archived = [];

  for (const event of Array.isArray(events) ? events : []) {
    if (isEventArchived(event)) archived.push(event);
    else active.push(event);
  }

  archived.sort((a, b) => eventEndSortKey(b) - eventEndSortKey(a));

  return { activeEvents: active, archivedEvents: archived };
}
