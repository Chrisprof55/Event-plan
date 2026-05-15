import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { buildChronologicalList } from '../utils/chronologicalItems';
import { buildEntryDisplayName } from '../utils/entry';
import {
  createEntriesFromAdd,
  filterEntriesAfterRemove,
  isNoteEntry,
  migrateEntriesList,
} from '../utils/planEntries';
import {
  buildEventPayload,
  normalizeEvent,
  sortEvents,
} from '../hooks/useEvents';

const INBOX_DOC_ID = 'main';
const PlanDataContext = createContext(null);

function inboxItemId(item, index) {
  if (item.id) return item.id;
  const created = item.createdAt;
  const stamp =
    typeof created === 'string'
      ? created
      : created?.toDate?.()?.toISOString?.() ?? `idx-${index}`;
  return `legacy-${stamp}-${String(item.name ?? '').slice(0, 40)}`;
}

function normalizeInboxItem(item, index) {
  return {
    ...item,
    id: inboxItemId(item, index),
    date: item.date ?? item.data ?? '',
    time: item.time ?? item.hora ?? '',
    location: item.location ?? item.local ?? item.localizacao ?? item.section ?? '',
  };
}

function normalizeDetailsDoc(data) {
  const rawDishes = Array.isArray(data?.dishes) ? data.dishes : [];
  const legacyNotes = Array.isArray(data?.notes) ? data.notes : [];
  return {
    dishes: migrateEntriesList(rawDishes),
    notes: legacyNotes,
  };
}

export function PlanDataProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  const [inboxItems, setInboxItems] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState(null);
  const [inboxSaving, setInboxSaving] = useState(false);

  const [eventDetailsById, setEventDetailsById] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubs = [
      onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          const next = snapshot.docs.map((docSnap) =>
            normalizeEvent(docSnap.id, docSnap.data()),
          );
          setEvents(sortEvents(next));
          setEventsLoading(false);
          setEventsError(null);
          setReady(true);
        },
        (err) => {
          setEventsError(err);
          setEventsLoading(false);
          setReady(true);
        },
      ),
      onSnapshot(
        doc(db, 'inbox', INBOX_DOC_ID),
        (snapshot) => {
          const raw = snapshot.exists() ? snapshot.data().items : [];
          const normalized = Array.isArray(raw)
            ? raw.map((entry, index) => normalizeInboxItem(entry, index))
            : [];
          setInboxItems(migrateEntriesList(normalized));
          setInboxLoading(false);
          setInboxError(null);
          setReady(true);
        },
        (err) => {
          setInboxError(err);
          setInboxLoading(false);
          setReady(true);
        },
      ),
      onSnapshot(
        collectionGroup(db, 'details'),
        (snapshot) => {
          const next = {};
          for (const docSnap of snapshot.docs) {
            const eventId = docSnap.ref.parent.parent?.id;
            if (!eventId || docSnap.id !== 'main') continue;
            next[eventId] = normalizeDetailsDoc(docSnap.data());
          }
          setEventDetailsById(next);
          setDetailsLoading(false);
          setDetailsError(null);
          setReady(true);
        },
        (err) => {
          setDetailsError(err);
          setDetailsLoading(false);
          setReady(true);
        },
      ),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, []);

  const chronologicalItems = useMemo(
    () => buildChronologicalList(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  const addEvent = useCallback(async ({ eventNumber, eventName, eventDate, endDate, pax }) => {
    const trimmedName = (eventName ?? '').trim();
    if (!trimmedName && !eventDate) {
      throw new Error('Indique pelo menos o nome do evento ou a data de início.');
    }
    const docRef = await addDoc(collection(db, 'events'), {
      ...buildEventPayload({ eventNumber, eventName, eventDate, endDate, pax }),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }, []);

  const updateEvent = useCallback(async (eventId, fields) => {
    if (!eventId) return;
    await updateDoc(doc(db, 'events', eventId), buildEventPayload(fields));
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'details', 'main')).catch(() => {});
    await deleteDoc(doc(db, 'events', eventId));
  }, []);

  const persistInbox = useCallback(async (nextItems) => {
    setInboxSaving(true);
    try {
      await setDoc(
        doc(db, 'inbox', INBOX_DOC_ID),
        { items: nextItems, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } finally {
      setInboxSaving(false);
    }
  }, []);

  const addInboxEntry = useCallback(
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
      await persistInbox([...inboxItems, ...created]);
      return created[0]?.id ?? null;
    },
    [inboxItems, persistInbox],
  );

  const updateInboxItem = useCallback(
    async (itemId, fields) => {
      const next = inboxItems.map((item) => {
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
      await persistInbox(next);
    },
    [inboxItems, persistInbox],
  );

  const removeInboxItem = useCallback(
    async (itemId) => {
      await persistInbox(filterEntriesAfterRemove(inboxItems, itemId));
    },
    [inboxItems, persistInbox],
  );

  const assignInboxToEvent = useCallback(
    async (itemId, eventId) => {
      const item = inboxItems.find((entry) => entry.id === itemId);
      if (!item || !eventId) return;

      setInboxSaving(true);
      try {
        const detailsRef = doc(db, 'events', eventId, 'details', 'main');
        const snapshot = await getDoc(detailsRef);
        const data = snapshot.exists() ? snapshot.data() : {};
        const dishes = Array.isArray(data.dishes) ? data.dishes : [];
        const toAdd = createEntriesFromAdd({
          name: item.name,
          quantity: item.quantity,
          date: item.date,
          time: item.time,
          location: item.location,
          note: (item.note ?? item.text ?? '').trim(),
        });

        await setDoc(
          detailsRef,
          { dishes: [...dishes, ...toAdd], detailsUpdatedAt: serverTimestamp() },
          { merge: true },
        );
        await persistInbox(inboxItems.filter((entry) => entry.id !== itemId));
      } finally {
        setInboxSaving(false);
      }
    },
    [inboxItems, persistInbox],
  );

  const value = useMemo(
    () => ({
      ready,
      events,
      eventsLoading,
      eventsError,
      inboxItems,
      inboxLoading,
      inboxError,
      inboxSaving,
      eventDetailsById,
      detailsLoading,
      detailsError,
      chronologicalItems,
      addEvent,
      updateEvent,
      deleteEvent,
      addInboxEntry,
      updateInboxItem,
      removeInboxItem,
      assignInboxToEvent,
    }),
    [
      ready,
      events,
      eventsLoading,
      eventsError,
      inboxItems,
      inboxLoading,
      inboxError,
      inboxSaving,
      eventDetailsById,
      detailsLoading,
      detailsError,
      chronologicalItems,
      addEvent,
      updateEvent,
      deleteEvent,
      addInboxEntry,
      updateInboxItem,
      removeInboxItem,
      assignInboxToEvent,
    ],
  );

  return <PlanDataContext.Provider value={value}>{children}</PlanDataContext.Provider>;
}

export function usePlanData() {
  const ctx = useContext(PlanDataContext);
  if (!ctx) {
    throw new Error('usePlanData must be used within PlanDataProvider');
  }
  return ctx;
}
