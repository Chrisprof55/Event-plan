export function dateToInputValue(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function eventToFormValues(event) {
  if (!event) {
    return {
      eventNumber: '',
      eventName: '',
      eventDate: '',
      endDate: '',
      pax: '',
    };
  }

  return {
    eventNumber: event.eventNumber ?? '',
    eventName: event.eventName || event.clientName || '',
    eventDate: dateToInputValue(event.eventDate),
    endDate: dateToInputValue(event.endDate),
    pax: event.pax != null ? String(event.pax) : '',
  };
}
