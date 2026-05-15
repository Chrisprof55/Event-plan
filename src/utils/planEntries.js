import { buildEntryDisplayName } from './entry';
import {
  formatDishDateWithWeekday,
  formatSlotLabel,
  getDishDate,
  getDishLocation,
  getDishTime,
  sortDishesByDateAndTime,
} from './dishes';

const ATTACHED_NOTE_SUFFIX = '-attached-note';

export function getNoteText(entry) {
  return (entry.text ?? entry.note ?? '').trim();
}

export function isNoteEntry(entry) {
  if (entry?.entryType === 'note') return true;
  if (entry?.entryType === 'dish') return false;
  const text = getNoteText(entry);
  const name = (entry?.name ?? '').trim();
  if (!text) return false;
  if (!name) return true;
  return name === buildEntryDisplayName('', text) || name === 'Nota';
}

export function isDishEntry(entry) {
  if (entry?.entryType === 'note') return false;
  const name = (entry?.name ?? '').trim();
  return Boolean(name);
}

export function isEventScopeNote(entry) {
  return isNoteEntry(entry) && !entry.attachedDishId && !getDishTime(entry) && !getDishLocation(entry);
}

export function resolveEntryRemoveId(entryId) {
  if (typeof entryId !== 'string') return { targetId: entryId, stripLegacyNoteFromDish: false };
  if (entryId.endsWith(ATTACHED_NOTE_SUFFIX)) {
    return {
      targetId: entryId.slice(0, -ATTACHED_NOTE_SUFFIX.length),
      stripLegacyNoteFromDish: true,
    };
  }
  return { targetId: entryId, stripLegacyNoteFromDish: false };
}

export function normalizePlanEntry(raw) {
  const date = (raw.date ?? raw.data ?? '').trim();
  const time = (raw.time ?? raw.hora ?? '').trim();
  const location = (raw.location ?? raw.local ?? raw.localizacao ?? raw.section ?? '').trim();
  const createdAt = raw.createdAt ?? new Date().toISOString();

  if (raw.entryType === 'note') {
    return {
      ...raw,
      entryType: 'note',
      text: getNoteText(raw),
      date,
      time,
      location,
      attachedDishId: raw.attachedDishId ?? null,
      createdAt,
    };
  }

  if (raw.entryType === 'dish') {
    return {
      ...raw,
      entryType: 'dish',
      name: (raw.name ?? '').trim(),
      quantity: Math.max(1, Number(raw.quantity) || 1),
      date,
      time,
      location,
      createdAt,
    };
  }

  const text = getNoteText(raw);
  const name = (raw.name ?? '').trim();

  if (text && isNoteEntry(raw)) {
    return {
      id: raw.id,
      entryType: 'note',
      text,
      date,
      time,
      location,
      attachedDishId: raw.attachedDishId ?? null,
      createdAt,
    };
  }

  return {
    ...raw,
    entryType: 'dish',
    name: name || buildEntryDisplayName('', text),
    quantity: Math.max(1, Number(raw.quantity) || 1),
    date,
    time,
    location,
    createdAt,
  };
}

/** One row per stored item — no synthetic duplicate post-its. */
export function migrateEntriesList(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const out = [];

  for (const raw of list) {
    if (raw.entryType === 'note') {
      out.push(normalizePlanEntry(raw));
      continue;
    }

    const legacyNote = (raw.note ?? '').trim();
    const name = (raw.name ?? '').trim();
    const normalized = normalizePlanEntry(raw);

    if (legacyNote && (!name || name === buildEntryDisplayName('', legacyNote))) {
      out.push({
        id: raw.id,
        entryType: 'note',
        text: legacyNote,
        date: normalized.date,
        time: normalized.time,
        location: normalized.location,
        attachedDishId: raw.attachedDishId ?? null,
        createdAt: normalized.createdAt,
      });
      continue;
    }

    const dish = { ...normalized, entryType: 'dish' };
    delete dish.note;
    delete dish.text;
    out.push(dish);

    if (legacyNote && name && name !== buildEntryDisplayName('', legacyNote)) {
      const existing = out.find(
        (e) => e.entryType === 'note' && e.attachedDishId === raw.id && getNoteText(e) === legacyNote,
      );
      if (!existing) {
        out.push({
          id: `${raw.id}${ATTACHED_NOTE_SUFFIX}`,
          entryType: 'note',
          text: legacyNote,
          date: normalized.date,
          time: normalized.time,
          location: normalized.location,
          attachedDishId: raw.id,
          createdAt: normalized.createdAt,
        });
      }
    }
  }

  return out;
}

export function mergeLegacyNotesAsEntries(migrated, legacyNotes) {
  const list = Array.isArray(migrated) ? migrated : [];
  const legacy = Array.isArray(legacyNotes) ? legacyNotes : [];
  if (legacy.length === 0) return list;

  const ids = new Set(list.map((e) => e.id));
  const texts = new Set(list.filter(isNoteEntry).map((e) => getNoteText(e)));

  const converted = legacy
    .filter((n) => {
      if (!n?.id || ids.has(n.id)) return false;
      const text = (n.text ?? '').trim();
      if (text && texts.has(text)) return false;
      return true;
    })
    .map((n) =>
      normalizePlanEntry({
        id: n.id,
        entryType: 'note',
        text: n.text,
        date: '',
        time: '',
        location: '',
        createdAt: n.createdAt,
      }),
    );

  return [...list, ...converted];
}

export function prepareEntriesForDisplay(entries, legacyNotes) {
  return mergeLegacyNotesAsEntries(migrateEntriesList(entries), legacyNotes);
}

/** @deprecated use prepareEntriesForDisplay */
export function expandEntriesForDisplay(entries) {
  return migrateEntriesList(entries);
}

export function createEntriesFromAdd({ name, quantity, date, time, location, note, attachToDishId }) {
  const trimmedName = (name ?? '').trim();
  const trimmedNote = (note ?? '').trim();
  const d = (date ?? '').trim();
  const t = (time ?? '').trim();
  const l = (location ?? '').trim();
  const createdAt = new Date().toISOString();
  const entries = [];

  if (attachToDishId && trimmedNote) {
    entries.push({
      id: crypto.randomUUID(),
      entryType: 'note',
      text: trimmedNote,
      date: d,
      time: t,
      location: l,
      attachedDishId: attachToDishId,
      createdAt,
    });
    return entries;
  }

  if (trimmedName) {
    const dishId = crypto.randomUUID();
    entries.push({
      id: dishId,
      entryType: 'dish',
      name: trimmedName,
      quantity: Math.max(1, Number(quantity) || 1),
      date: d,
      time: t,
      location: l,
      createdAt,
    });
    if (trimmedNote) {
      entries.push({
        id: crypto.randomUUID(),
        entryType: 'note',
        text: trimmedNote,
        date: d,
        time: t,
        location: l,
        attachedDishId: dishId,
        createdAt,
      });
    }
  } else if (trimmedNote) {
    entries.push({
      id: crypto.randomUUID(),
      entryType: 'note',
      text: trimmedNote,
      date: d,
      time: t,
      location: l,
      attachedDishId: null,
      createdAt,
    });
  }

  return entries;
}

export function filterEntriesAfterRemove(entries, entryId) {
  const { targetId, stripLegacyNoteFromDish } = resolveEntryRemoveId(entryId);

  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => {
      if (entry.id === entryId || entry.id === targetId) return false;
      if (entry.attachedDishId === entryId || entry.attachedDishId === targetId) return false;
      return true;
    })
    .map((entry) => {
      if (!stripLegacyNoteFromDish || entry.id !== targetId) return entry;
      const next = { ...entry };
      delete next.note;
      delete next.text;
      return next;
    });
}

function partitionSlotItems(items) {
  const dishes = [];
  const slotNotes = [];
  const attachedByDish = {};

  for (const item of items) {
    if (isNoteEntry(item)) {
      if (item.attachedDishId) {
        (attachedByDish[item.attachedDishId] ??= []).push(item);
      } else if (!isEventScopeNote(item)) {
        slotNotes.push(item);
      }
    } else if (isDishEntry(item)) {
      dishes.push(item);
    }
  }

  return { dishes, slotNotes, attachedByDish };
}

export function groupPlanByDate(entries) {
  const sorted = sortDishesByDateAndTime(entries);
  const byDate = new Map();

  for (const entry of sorted) {
    const date = getDishDate(entry);
    if (!byDate.has(date)) {
      byDate.set(date, {
        date,
        dateLabel: formatDishDateWithWeekday(date),
        eventNotes: [],
        slotItems: [],
      });
    }
    const group = byDate.get(date);
    if (isEventScopeNote(entry)) {
      group.eventNotes.push(entry);
    } else {
      group.slotItems.push(entry);
    }
  }

  return [...byDate.values()].map((group) => {
    const slots = [];
    for (const entry of group.slotItems) {
      const time = getDishTime(entry);
      const location = getDishLocation(entry);
      const last = slots[slots.length - 1];
      if (!last || last.time !== time || last.location !== location) {
        slots.push({
          time,
          location,
          label: formatSlotLabel(time, location),
          items: [entry],
        });
      } else {
        last.items.push(entry);
      }
    }

    return {
      date: group.date,
      dateLabel: group.dateLabel,
      eventNotes: group.eventNotes,
      slots: slots.map((slot) => {
        const { dishes, slotNotes, attachedByDish } = partitionSlotItems(slot.items);
        return { ...slot, dishes, slotNotes, attachedByDish };
      }),
    };
  });
}
