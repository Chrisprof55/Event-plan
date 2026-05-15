import { useMemo, useState } from 'react';
import AddActionSheet from '../components/AddActionSheet';
import BottomNav from '../components/BottomNav';
import EventFormModal from '../components/EventFormModal';
import NovoItemModal from '../components/NovoItemModal';
import EventsAgenda from '../views/Dashboard';
import PlanDashboard from '../views/PlanDashboard';
import EventDetail from '../views/EventDetail';
import ItemsList from '../views/ItemsList';
import WeekCalendar from '../views/WeekCalendar';
import QuickNoteDetail from '../views/QuickNoteDetail';
import { useEventDetails } from '../hooks/useEventDetails';
import { useEvents } from '../hooks/useEvents';
import { useInboxItems } from '../hooks/useInboxItems';

const MAIN_BOTTOM_PAD = 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]';

export default function AppShell() {
  const [tab, setTab] = useState('dashboard');
  const [calendarFocusDate, setCalendarFocusDate] = useState(null);
  const [detailRoute, setDetailRoute] = useState(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventFormError, setEventFormError] = useState(null);
  const [eventFormKey, setEventFormKey] = useState(0);
  const [highlightId, setHighlightId] = useState(null);

  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [novoItemMode, setNovoItemMode] = useState('dish');
  const [itemEventId, setItemEventId] = useState(null);
  const [creatingEventForItem, setCreatingEventForItem] = useState(false);
  const [highlightInboxId, setHighlightInboxId] = useState(null);

  const { events, addEvent } = useEvents();
  const itemEvent = useMemo(
    () => events.find((ev) => ev.id === itemEventId) ?? null,
    [events, itemEventId],
  );
  const { addEntry, addEntries, saving: itemSaving } = useEventDetails(itemEventId);
  const {
    saving: inboxSaving,
    addItem: addInboxItemRaw,
    addEntries: addInboxEntries,
  } = useInboxItems();

  const openNovoItem = (eventId = null, mode = 'dish') => {
    setNovoItemMode(mode);
    setItemEventId(eventId);
    setNovoItemOpen(true);
  };

  const closeNovoItem = () => {
    setNovoItemOpen(false);
    setItemEventId(null);
  };

  const addInboxItem = async (fields) => {
    const newId = await addInboxItemRaw(fields);
    if (newId) {
      setHighlightInboxId(newId);
      setTimeout(() => setHighlightInboxId(null), 3000);
    }
    return Boolean(newId);
  };

  const handleAddEntry = async (payload) => {
    try {
      let ok = false;
      if (payload.batchItems?.length) {
        const batch = {
          date: payload.date,
          time: payload.time,
          location: payload.location,
          items: payload.batchItems,
        };
        if (itemEventId) {
          ok = await addEntries(batch);
        } else {
          ok = Boolean(await addInboxEntries(batch));
        }
      } else if (itemEventId) {
        ok = await addEntry(payload);
      } else {
        ok = Boolean(await addInboxItem(payload));
      }
      if (ok) closeNovoItem();
      return ok;
    } catch (err) {
      window.alert(err?.message ?? 'Não foi possível guardar o item.');
      return false;
    }
  };

  const handleCreateEventForItem = async ({ eventName, eventDate, pax }) => {
    setCreatingEventForItem(true);
    try {
      const newId = await addEvent({
        eventName,
        eventDate,
        eventNumber: '',
        endDate: '',
        pax: pax ?? '',
      });
      setItemEventId(newId);
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 3000);
      return newId;
    } finally {
      setCreatingEventForItem(false);
    }
  };

  const handleEventFormSubmit = async (fields) => {
    setEventSaving(true);
    setEventFormError(null);
    try {
      const newId = await addEvent(fields);
      setEventModalOpen(false);
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 3000);
      setEventFormKey((key) => key + 1);
      setTab('agenda');
    } catch (err) {
      setEventFormError(err.message ?? 'Não foi possível guardar o evento.');
    } finally {
      setEventSaving(false);
    }
  };

  const handleAddAction = (actionId) => {
    setAddSheetOpen(false);
    if (actionId === 'event') {
      setEventFormError(null);
      setEventFormKey((key) => key + 1);
      setEventModalOpen(true);
      return;
    }
    if (actionId === 'note') {
      openNovoItem(null, 'note');
      return;
    }
    openNovoItem(null, 'dish');
  };

  if (detailRoute?.type === 'event') {
    return (
      <EventDetail
        eventId={detailRoute.id}
        onBack={() => setDetailRoute(null)}
      />
    );
  }

  if (detailRoute?.type === 'note') {
    return (
      <QuickNoteDetail
        noteId={detailRoute.id}
        onBack={() => setDetailRoute(null)}
      />
    );
  }

  const goEvent = (id) => setDetailRoute({ type: 'event', id });
  const goNote = (id) => {
    if (id) setDetailRoute({ type: 'note', id });
  };

  const handleDashboardDaySelect = (dateKey) => {
    setCalendarFocusDate(dateKey);
    setTab('calendar');
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      {tab === 'dashboard' && (
        <PlanDashboard
          contentClassName={MAIN_BOTTOM_PAD}
          onSelectDay={handleDashboardDaySelect}
          onSelectEvent={goEvent}
          onSelectNote={goNote}
        />
      )}
      {tab === 'agenda' && (
        <EventsAgenda
          contentClassName={MAIN_BOTTOM_PAD}
          onSelectEvent={goEvent}
          onSelectNote={goNote}
          onOpenNovoItem={openNovoItem}
          highlightId={highlightId}
          highlightInboxId={highlightInboxId}
          itemEventId={itemEventId}
          novoItemOpen={novoItemOpen}
        />
      )}
      {tab === 'calendar' && (
        <WeekCalendar
          contentClassName={MAIN_BOTTOM_PAD}
          focusDateKey={calendarFocusDate}
          onFocusConsumed={() => setCalendarFocusDate(null)}
          onSelectEvent={goEvent}
          onSelectNote={goNote}
        />
      )}
      {tab === 'items' && (
        <ItemsList
          contentClassName={MAIN_BOTTOM_PAD}
          onSelectEvent={goEvent}
          onSelectNote={goNote}
        />
      )}

      <BottomNav
        activeTab={tab}
        onTabChange={setTab}
        onAddClick={() => setAddSheetOpen(true)}
      />

      <AddActionSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSelect={handleAddAction}
      />

      <EventFormModal
        key={eventFormKey}
        open={eventModalOpen}
        mode="create"
        initialEvent={null}
        saving={eventSaving}
        error={eventFormError}
        onClose={() => !eventSaving && setEventModalOpen(false)}
        onSubmit={handleEventFormSubmit}
      />

      <NovoItemModal
        open={novoItemOpen}
        onClose={closeNovoItem}
        eventId={itemEventId}
        event={itemEvent}
        events={events}
        saving={itemSaving || inboxSaving}
        creatingEvent={creatingEventForItem}
        onAddEntry={handleAddEntry}
        onEventChange={setItemEventId}
        onCreateEvent={handleCreateEventForItem}
        showEventPicker
        defaultMode={novoItemMode}
      />
    </div>
  );
}
