import { useEffect, useMemo, useState } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { migrateEntriesList } from '../utils/planEntries';
import { buildChronologicalList } from '../utils/chronologicalItems';

function normalizeDetailsDoc(data) {
  const rawDishes = Array.isArray(data?.dishes) ? data.dishes : [];
  const legacyNotes = Array.isArray(data?.notes) ? data.notes : [];
  return {
    dishes: migrateEntriesList(rawDishes),
    notes: legacyNotes,
  };
}

export function useAllPlanItems(events, inboxItems) {
  const [eventDetailsById, setEventDetailsById] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    setDetailsLoading(true);

    const unsubscribe = onSnapshot(
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
      },
      (err) => {
        setDetailsError(err);
        setDetailsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const items = useMemo(
    () => buildChronologicalList(events, eventDetailsById, inboxItems),
    [events, eventDetailsById, inboxItems],
  );

  return {
    items,
    loading: detailsLoading,
    error: detailsError,
  };
}
