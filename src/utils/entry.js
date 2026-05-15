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

export function canAddEntry({ name, note, date, attachToDishId, quickNote }) {
  if (attachToDishId) return Boolean((note ?? '').trim());
  if (quickNote) return Boolean((name ?? '').trim());
  const hasName = Boolean((name ?? '').trim());
  const hasNote = Boolean((note ?? '').trim());
  if (!hasName && !hasNote) return false;
  if (hasNote && !hasName && !(date ?? '').trim()) return false;
  return true;
}

export function getInboxItemTitle(item) {
  if (!item) return 'Sem nome';
  const name = (item.name ?? '').trim();
  const note = (item.note ?? item.text ?? '').trim();
  if (item.entryType === 'note' && name) return name;
  if (name && name !== 'Nota') return name;
  if (note) return note.split('\n')[0].trim().slice(0, 80) || 'Nota';
  return 'Sem nome';
}

export function getInboxNoteBody(item) {
  return (item?.note ?? item?.text ?? '').trim();
}

export function shouldShowInboxNoteBody(item) {
  const body = getInboxNoteBody(item);
  if (!body) return false;
  const title = getInboxItemTitle(item);
  return body !== title;
}
