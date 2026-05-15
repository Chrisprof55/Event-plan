import { usePlanData } from '../context/PlanDataProvider';

export function useInboxItems() {
  const {
    inboxItems: items,
    inboxLoading: loading,
    inboxError: error,
    inboxSaving: saving,
    addInboxEntry,
    addInboxEntries,
    updateInboxItem,
    removeInboxItem,
    assignInboxToEvent,
    convertInboxToNewEvent,
  } = usePlanData();

  return {
    items,
    loading,
    error,
    saving,
    addItem: addInboxEntry,
    addEntry: addInboxEntry,
    addEntries: addInboxEntries,
    addNoteToItem: async (dishId, fields) => {
      const trimmed = (fields?.note ?? '').trim();
      if (!trimmed || !dishId) return false;
      const dish = items.find((entry) => entry.id === dishId);
      const id = await addInboxEntry({
        note: trimmed,
        date: fields?.date ?? dish?.date,
        time: fields?.time ?? dish?.time,
        location: fields?.location ?? dish?.location,
        attachToDishId: dishId,
      });
      return Boolean(id);
    },
    updateItem: updateInboxItem,
    removeItem: removeInboxItem,
    assignToEvent: assignInboxToEvent,
    convertToNewEvent: convertInboxToNewEvent,
  };
}
