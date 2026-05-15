import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { buildEntryDisplayName } from '../utils/entry';
import {
  createEntriesFromAdd,
  filterEntriesAfterRemove,
  isNoteEntry,
  migrateEntriesList,
} from '../utils/planEntries';

const INBOX_DOC_ID = 'main';

function inboxItemId(item, index) {
  if (item.id) return item.id;
  const created = item.createdAt;
  const stamp =
    typeof created === 'string'
      ? created
      : created?.toDate?.()?.toISOString?.() ?? `idx-${index}`;
  return `legacy-${stamp}-${String(item.name ?? '').slice(0, 40)}`;
}

function normalizeItem(item, index) {
  return {
    ...item,
    id: inboxItemId(item, index),
    date: item.date ?? item.data ?? '',
    time: item.time ?? item.hora ?? '',
    location: item.location ?? item.local ?? item.localizacao ?? item.section ?? '',
  };
}

export function useInboxItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ref = doc(db, 'inbox', INBOX_DOC_ID);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const raw = snapshot.exists() ? snapshot.data().items : [];
        const normalized = Array.isArray(raw)
          ? raw.map((entry, index) => normalizeItem(entry, index))
          : [];
        setItems(migrateEntriesList(normalized));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const persist = useCallback(async (nextItems) => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'inbox', INBOX_DOC_ID),
        { items: nextItems, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } finally {
      setSaving(false);
    }
  }, []);

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
      if (created.length === 0) return null;

      await persist([...items, ...created]);
      return created[0]?.id ?? null;
    },
    [items, persist],
  );

  const addItem = addEntry;

  const addNoteToItem = useCallback(
    async (dishId, { note, date, time, location }) => {
      const trimmed = (note ?? '').trim();
      if (!trimmed || !dishId) return false;

      const dish = items.find((entry) => entry.id === dishId);
      const id = await addEntry({
        note: trimmed,
        date: date ?? dish?.date,
        time: time ?? dish?.time,
        location: location ?? dish?.location,
        attachToDishId: dishId,
      });
      return Boolean(id);
    },
    [items, addEntry],
  );

  const updateItem = useCallback(
    async (itemId, fields) => {
      const next = items.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, ...fields };
        if (isNoteEntry(item) || item.entryType === 'note') {
          if ('text' in fields) updated.text = (fields.text ?? '').trim();
          updated.entryType = 'note';
        } else {
          if ('quantity' in fields) {
            updated.quantity = Math.max(1, Number(fields.quantity) || 1);
          }
          if ('name' in fields) updated.name = (fields.name ?? '').trim();
          if ('note' in fields) {
            updated.note = (fields.note ?? '').trim();
            updated.name = buildEntryDisplayName(updated.name, updated.note);
          }
        }
        if ('date' in fields) updated.date = (fields.date ?? '').trim();
        if ('time' in fields) updated.time = (fields.time ?? '').trim();
        if ('location' in fields) updated.location = (fields.location ?? '').trim();
        return updated;
      });
      await persist(next);
    },
    [items, persist],
  );

  const removeItem = useCallback(
    async (itemId) => {
      await persist(filterEntriesAfterRemove(items, itemId));
    },
    [items, persist],
  );

  const assignToEvent = useCallback(
    async (itemId, eventId) => {
      const item = items.find((entry) => entry.id === itemId);
      if (!item || !eventId) return;

      setSaving(true);
      try {
        const detailsRef = doc(db, 'events', eventId, 'details', 'main');
        const snapshot = await getDoc(detailsRef);
        const data = snapshot.exists() ? snapshot.data() : {};
        const dishes = Array.isArray(data.dishes) ? data.dishes : [];
        const noteText = (item.note ?? item.text ?? '').trim();
        const name = (item.name ?? '').trim();
        const toAdd = createEntriesFromAdd({
          name,
          quantity: item.quantity,
          date: item.date,
          time: item.time,
          location: item.location,
          note: noteText,
        });

        await setDoc(
          detailsRef,
          {
            dishes: [...dishes, ...toAdd],
            detailsUpdatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        await persist(items.filter((entry) => entry.id !== itemId));
      } finally {
        setSaving(false);
      }
    },
    [items, persist],
  );

  return {
    items,
    loading,
    error,
    saving,
    addItem,
    addEntry,
    addNoteToItem,
    updateItem,
    removeItem,
    assignToEvent,
  };
}
