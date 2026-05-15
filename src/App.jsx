import { useState } from 'react';
import Dashboard from './views/Dashboard';
import EventDetail from './views/EventDetail';
import ItemsList from './views/ItemsList';
import QuickNoteDetail from './views/QuickNoteDetail';

function App() {
  const [route, setRoute] = useState({ type: 'dashboard' });

  if (route.type === 'items') {
    return (
      <ItemsList
        onBack={() => setRoute({ type: 'dashboard' })}
        onSelectEvent={(id) => setRoute({ type: 'event', id })}
        onSelectNote={(id) => {
          if (id) setRoute({ type: 'note', id });
        }}
      />
    );
  }

  if (route.type === 'event') {
    return (
      <EventDetail
        eventId={route.id}
        onBack={() => setRoute({ type: 'dashboard' })}
      />
    );
  }

  if (route.type === 'note') {
    return (
      <QuickNoteDetail
        noteId={route.id}
        onBack={() => setRoute({ type: 'dashboard' })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Dashboard
        onSelectEvent={(id) => setRoute({ type: 'event', id })}
        onSelectNote={(id) => {
          if (id) setRoute({ type: 'note', id });
        }}
        onOpenItemsList={() => setRoute({ type: 'items' })}
      />
    </div>
  );
}

export default App;
