import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { usePlanData } from '../context/PlanDataProvider';

function toDate(value) {
  return value?.toDate?.() ?? null;
}

export function normalizeEventNumber(value) {
  if (value == null) return '';
  return String(value).trim();
}

export function normalizePax(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) return null;
  return parsed;
}

export function parseDateInput(dateString) {
  if (!dateString) return null;
  return Timestamp.fromDate(new Date(`${dateString}T12:00:00`));
}

export function normalizeEvent(id, data) {
  return {
    id,
    eventNumber: normalizeEventNumber(
      data.eventNumber ?? data.numeroEvento ?? data.numEvento,
    ),
    eventName: data.eventName ?? data.nomeEvento ?? data.nomeDoEvento ?? '',
    clientName: data.clientName ?? data.nomeCliente ?? '',
    pax: normalizePax(data.pax ?? data.numPax ?? data.pessoas),
    grandTotal: data.grandTotal ?? data.totalGeral ?? null,
    eventDate: toDate(data.eventDate) ?? toDate(data.dataEvento),
    endDate: toDate(data.endDate) ?? toDate(data.dataFim),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
    pdfUrl: data.pdfUrl ?? null,
    pdfStoragePath: data.pdfStoragePath ?? null,
    pdfFileName: data.pdfFileName ?? null,
  };
}

export function sortEvents(events) {
  return [...events].sort((a, b) => {
    const aUpdated = a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0;
    const bUpdated = b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 0;
    if (bUpdated !== aUpdated) return bUpdated - aUpdated;

    const aLabel = a.eventNumber || a.eventName || '';
    const bLabel = b.eventNumber || b.eventName || '';
    return bLabel.localeCompare(aLabel, 'pt');
  });
}

export function buildEventPayload(fields) {
  const payload = { updatedAt: serverTimestamp() };

  if ('eventNumber' in fields) {
    const trimmed = normalizeEventNumber(fields.eventNumber);
    payload.eventNumber = trimmed ? trimmed.toUpperCase() : null;
  }
  if ('eventName' in fields) {
    payload.eventName = (fields.eventName ?? '').trim();
  }
  if ('eventDate' in fields) {
    payload.eventDate = parseDateInput(fields.eventDate);
  }
  if ('endDate' in fields) {
    payload.endDate = parseDateInput(fields.endDate);
  }
  if ('pax' in fields) {
    payload.pax = normalizePax(fields.pax);
  }
  if ('pdfUrl' in fields) payload.pdfUrl = fields.pdfUrl ?? null;
  if ('pdfStoragePath' in fields) payload.pdfStoragePath = fields.pdfStoragePath ?? null;
  if ('pdfFileName' in fields) payload.pdfFileName = fields.pdfFileName ?? null;

  return payload;
}

export function useEvents() {
  const {
    events,
    eventsLoading: loading,
    eventsError: error,
    addEvent,
    updateEvent,
    deleteEvent,
  } = usePlanData();

  return { events, loading, error, addEvent, updateEvent, deleteEvent };
}

export function useEvent(eventId) {
  const { events, eventsLoading: loading, eventsError: error, updateEvent, deleteEvent } =
    usePlanData();
  const event = events.find((item) => item.id === eventId) ?? null;

  return { event, loading, error, updateEvent, deleteEvent };
}
