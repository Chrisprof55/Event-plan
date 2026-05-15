function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
