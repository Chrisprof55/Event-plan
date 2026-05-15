export function buildEntryDisplayName(name, note) {
  const trimmedName = (name ?? '').trim();
  const trimmedNote = (note ?? '').trim();
  if (trimmedName) return trimmedName;
  if (trimmedNote) {
    const firstLine = trimmedNote.split('\n')[0].trim();
    return firstLine.slice(0, 80) || 'Nota';
  }
  return '';
}

export function canAddEntry({ name, note, date, attachToDishId }) {
  if (attachToDishId) return Boolean((note ?? '').trim());
  const hasName = Boolean((name ?? '').trim());
  const hasNote = Boolean((note ?? '').trim());
  if (!hasName && !hasNote) return false;
  if (hasNote && !hasName && !(date ?? '').trim()) return false;
  return true;
}

export function getInboxItemTitle(item) {
  if (!item) return 'Sem nome';
  const name = (item.name ?? '').trim();
  const note = (item.note ?? '').trim();
  if (name && name !== 'Nota') return name;
  if (note) return note.split('\n')[0].trim().slice(0, 80) || 'Nota';
  return 'Sem nome';
}

export function shouldShowInboxNoteBody(item) {
  const note = (item?.note ?? '').trim();
  if (!note) return false;
  const title = getInboxItemTitle(item);
  return note !== title && note.includes('\n');
}
