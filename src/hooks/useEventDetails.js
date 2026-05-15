import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { withWriteTimeout } from '../utils/firestoreWrite';
import {
  createEntriesFromAdd,
  filterEntriesAfterRemove,
  isNoteEntry,
  migrateEntriesList,
  resolveEntryRemoveId,
} from '../utils/planEntries';

const DETAILS_DOC_ID = 'main';

const EMPTY_DETAILS = {
  dishes: [],
  notes: [],
  specialInstructions: '',
};

function normalizeDish(dish) {
  return {
    ...dish,
    date: dish.date ?? dish.data ?? '',
    time: dish.time ?? dish.hora ?? '',
    location: dish.location ?? dish.local ?? dish.localizacao ?? dish.section ?? '',
    note: (dish.note ?? '').trim(),
  };
}

function normalizeDetails(data) {
  const rawDishes = Array.isArray(data?.dishes) ? data.dishes.map(normalizeDish) : [];
  const legacyNotes = Array.isArray(data?.notes) ? data.notes : [];
  return {
    dishes: migrateEntriesList(rawDishes),
    notes: legacyNotes,
    specialInstructions: data?.specialInstructions ?? '',
  };
}

export function useEventDetails(eventId) {
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [loadedForEventId, setLoadedForEventId] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loading = Boolean(eventId) && loadedForEventId !== eventId;

  const detailsRef = useRef(details);
  detailsRef.current = details;

  useEffect(() => {
    if (!eventId) {
      setDetails(EMPTY_DETAILS);
      setLoadedForEventId(null);
      return undefined;
    }

    setLoadedForEventId(null);
    setError(null);

    const ref = doc(db, 'events', eventId, 'details', DETAILS_DOC_ID);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setDetails(snapshot.exists() ? normalizeDetails(snapshot.data()) : EMPTY_DETAILS);
        setLoadedForEventId(eventId);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoadedForEventId(eventId);
      },
    );

    return unsubscribe;
  }, [eventId]);

  const persist = useCallback(
    async (nextDetails) => {
      if (!eventId) return;

      setDetails(nextDetails);
      setSaving(true);
      setError(null);
      try {
        const ref = doc(db, 'events', eventId, 'details', DETAILS_DOC_ID);
        await withWriteTimeout(
          setDoc(
            ref,
            {
              ...nextDetails,
              detailsUpdatedAt: serverTimestamp(),
            },
            { merge: true },
          ),
        );
      } catch (err) {
        setError(err);
        setDetails(detailsRef.current);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [eventId],
  );

  const addDish = useCallback(
    async ({ name, quantity, date, time, location }) => {
      const trimmedName = (name ?? '').trim();
      if (!trimmedName) return false;

      const dish = {
        id: crypto.randomUUID(),
        name: trimmedName,
        quantity: Math.max(1, Number(quantity) || 1),
        date: (date ?? '').trim(),
        time: (time ?? '').trim(),
        location: (location ?? '').trim(),
        createdAt: new Date().toISOString(),
      };

      const nextDetails = {
        ...details,
        dishes: [...details.dishes, dish],
      };

      await persist(nextDetails);
      return true;
    },
    [details, persist],
  );

  const addEntry = useCallback(
    async ({ name, quantity, date, time, location, note, attachToDishId }) => {
      const created = createEntriesFromAdd({
        name,
        quantity,
        date,
        time,
        location,
        note,
        attachToDishId,
      });
      if (created.length === 0) return false;

      await persist({
        ...details,
        dishes: [...details.dishes, ...created],
      });
      return true;
    },
    [details, persist],
  );

  const addNoteToItem = useCallback(
    async (dishId, { note, date, time, location }) => {
      const trimmed = (note ?? '').trim();
      if (!trimmed || !dishId) return false;

      const dish = details.dishes.find((entry) => entry.id === dishId);
      return addEntry({
        note: trimmed,
        date: date ?? dish?.date,
        time: time ?? dish?.time,
        location: location ?? dish?.location,
        attachToDishId: dishId,
      });
    },
    [details.dishes, addEntry],
  );

  const applyEntryFields = (entry, fields) => {
    const next = { ...entry, ...fields };
    if (isNoteEntry(entry) || entry.entryType === 'note') {
      if ('text' in fields) next.text = (fields.text ?? '').trim();
      next.entryType = 'note';
    } else {
      if ('quantity' in fields) {
        next.quantity = Math.max(1, Number(fields.quantity) || 1);
      }
      if ('name' in fields) next.name = (fields.name ?? '').trim();
    }
    if ('date' in fields) next.date = (fields.date ?? '').trim();
    if ('time' in fields) next.time = (fields.time ?? '').trim();
    if ('location' in fields) next.location = (fields.location ?? '').trim();
    return next;
  };

  const updateEntry = useCallback(
    async (entryId, fields) => {
      const dishes = details.dishes.map((entry) =>
        entry.id === entryId ? applyEntryFields(entry, fields) : entry,
      );
      await persist({ ...details, dishes });
    },
    [details, persist],
  );

  const updateDishAnchor = useCallback(
    async (dishId, fields, noteUpdates = []) => {
      const anchor = {};
      if ('date' in fields) anchor.date = (fields.date ?? '').trim();
      if ('time' in fields) anchor.time = (fields.time ?? '').trim();
      if ('location' in fields) anchor.location = (fields.location ?? '').trim();

      const noteById = new Map(noteUpdates.map((n) => [n.id, n]));

      const dishes = details.dishes.map((entry) => {
        if (entry.id === dishId) {
          return applyEntryFields(entry, fields);
        }
        if (entry.attachedDishId === dishId) {
          const notePatch = noteById.get(entry.id);
          return applyEntryFields(
            { ...entry, ...anchor },
            notePatch ? { text: notePatch.text } : {},
          );
        }
        return entry;
      });

      await persist({ ...details, dishes });
    },
    [details, persist],
  );

  const removeEntry = useCallback(
    async (entryId) => {
      const dishes = filterEntriesAfterRemove(details.dishes, entryId);
      const { targetId } = resolveEntryRemoveId(entryId);
      const notes = details.notes.filter(
        (n) => n.id !== entryId && n.id !== targetId,
      );

      await persist({ ...details, dishes, notes });
    },
    [details, persist],
  );

  const updateDish = updateEntry;
  const removeDish = removeEntry;

  const addNote = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return false;

      const note = {
        id: crypto.randomUUID(),
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      const nextDetails = {
        ...details,
        notes: [note, ...details.notes],
      };

      await persist(nextDetails);
      return true;
    },
    [details, persist],
  );

  const removeNote = useCallback(
    async (noteId) => {
      const nextDetails = {
        ...details,
        notes: details.notes.filter((note) => note.id !== noteId),
      };
      await persist(nextDetails);
    },
    [details, persist],
  );

  const updateSpecialInstructions = useCallback(
    async (specialInstructions) => {
      const nextDetails = { ...details, specialInstructions };
      await persist(nextDetails);
    },
    [details, persist],
  );

  return {
    details,
    loading,
    error,
    saving,
    addDish,
    addEntry,
    addNoteToItem,
    updateEntry,
    updateDishAnchor,
    removeEntry,
    updateDish,
    removeDish,
    addNote,
    removeNote,
    updateSpecialInstructions,
  };
}
