export function buildTimeSlots({ startHour = 6, endHour = 24, stepMinutes = 30 } = {}) {
  const slots = [];
  for (let minutes = startHour * 60; minutes < endHour * 60; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

export const TIME_SLOT_OPTIONS = buildTimeSlots();
