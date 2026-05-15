export function buildDashboardCards(events, inboxItems) {
  const cards = [
    ...inboxItems.map((item) => ({
      key: `note-${item.id}`,
      type: 'note',
      item,
      sortTime: new Date(item.createdAt).getTime() || 0,
    })),
    ...events.map((event) => ({
      key: `event-${event.id}`,
      type: 'event',
      event,
      sortTime: event.updatedAt?.getTime() ?? event.createdAt?.getTime() ?? 0,
    })),
  ];

  return cards.sort((a, b) => b.sortTime - a.sortTime);
}
