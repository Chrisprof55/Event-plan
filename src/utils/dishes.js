import { formatEventDate } from './eventDates';

function parseTimeMinutes(time) {
  const match = String(time ?? '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function parseDateSortKey(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!trimmed) return '9999-99-99';
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export function getDishDate(dish) {
  return (dish.date ?? dish.data ?? '').trim();
}

export function getDishTime(dish) {
  return (dish.time ?? dish.hora ?? '').trim();
}

export function getDishLocation(dish) {
  return (dish.location ?? dish.local ?? dish.localizacao ?? dish.section ?? '').trim();
}

export function getDishNote(dish) {
  return (dish.note ?? '').trim();
}

/** Shown beside the item chip — avoids duplicating the title when note-only. */
export function getDishNoteBeside(dish) {
  const note = getDishNote(dish);
  const name = (dish.name ?? '').trim();
  if (!note) return null;
  if (note === name) return null;
  const firstLine = note.split('\n')[0].trim();
  if (name && firstLine === name) {
    const rest = note.slice(firstLine.length).trim();
    return rest || null;
  }
  return note;
}

export function mergeLegacyNotesAsDishes(dishes, notes) {
  const list = Array.isArray(dishes) ? dishes : [];
  const legacy = Array.isArray(notes) ? notes : [];
  if (legacy.length === 0) return list;

  const ids = new Set(list.map((d) => d.id));
  const converted = legacy
    .filter((n) => n?.id && !ids.has(n.id))
    .map((n) => {
      const text = (n.text ?? '').trim();
      const firstLine = text.split('\n')[0].trim().slice(0, 80) || 'Nota';
      return {
        id: n.id,
        name: firstLine,
        note: text,
        quantity: 1,
        date: '',
        time: '',
        location: '',
        createdAt: n.createdAt ?? new Date().toISOString(),
      };
    });

  return [...list, ...converted];
}

function parseIsoDate(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDishDateLabel(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!trimmed) return null;
  const parsed = parseIsoDate(trimmed);
  if (parsed) return formatEventDate(parsed);
  return trimmed;
}

export function formatDishDateWithWeekday(dateStr) {
  const trimmed = String(dateStr ?? '').trim();
  if (!trimmed) return 'Sem data';
  const parsed = parseIsoDate(trimmed);
  if (parsed) {
    return new Intl.DateTimeFormat('pt-PT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }
  return trimmed;
}

export function formatSlotLabel(time, location) {
  const timeLabel = time || '—';
  const loc = location?.trim();

  if (timeLabel === '—' && !loc) return 'Sem hora · Sem local';
  if (timeLabel === '—') return loc;
  if (!loc) return timeLabel;
  return `${timeLabel} · ${loc}`;
}

/** @deprecated use formatSlotLabel with date section headers */
export function formatGroupLabel(date, time, location) {
  const dateLabel = formatDishDateWithWeekday(date);
  return `${dateLabel} · ${formatSlotLabel(time, location)}`;
}

export function sortDishesByDateAndTime(dishes) {
  return [...dishes].sort((a, b) => {
    const dateDiff = parseDateSortKey(getDishDate(a)).localeCompare(parseDateSortKey(getDishDate(b)));
    if (dateDiff !== 0) return dateDiff;

    const timeDiff = parseTimeMinutes(getDishTime(a)) - parseTimeMinutes(getDishTime(b));
    if (timeDiff !== 0) return timeDiff;

    const locA = getDishLocation(a);
    const locB = getDishLocation(b);
    if (locA !== locB) return locA.localeCompare(locB, 'pt');

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function groupDishesByDateAndTime(dishes) {
  const sorted = sortDishesByDateAndTime(dishes);
  const groups = [];

  for (const dish of sorted) {
    const date = getDishDate(dish);
    const time = getDishTime(dish);
    const location = getDishLocation(dish);
    const last = groups[groups.length - 1];

    if (!last || last.date !== date || last.time !== time || last.location !== location) {
      groups.push({
        date,
        time,
        location,
        label: formatGroupLabel(date, time, location),
        items: [dish],
      });
    } else {
      last.items.push(dish);
    }
  }

  return groups;
}

export function groupDishesByDate(dishes) {
  const sorted = sortDishesByDateAndTime(dishes);
  const dateGroups = [];

  for (const dish of sorted) {
    const date = getDishDate(dish);
    const time = getDishTime(dish);
    const location = getDishLocation(dish);

    let dateGroup = dateGroups[dateGroups.length - 1];
    if (!dateGroup || dateGroup.date !== date) {
      dateGroup = {
        date,
        dateLabel: formatDishDateWithWeekday(date),
        slots: [],
      };
      dateGroups.push(dateGroup);
    }

    const lastSlot = dateGroup.slots[dateGroup.slots.length - 1];
    if (!lastSlot || lastSlot.time !== time || lastSlot.location !== location) {
      dateGroup.slots.push({
        time,
        location,
        label: formatSlotLabel(time, location),
        items: [dish],
      });
    } else {
      lastSlot.items.push(dish);
    }
  }

  return dateGroups;
}

/** @deprecated use groupDishesByDate */
export function groupDishesByAnchor(dishes) {
  return groupDishesByDateAndTime(dishes);
}
