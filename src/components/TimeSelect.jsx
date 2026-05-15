import { TIME_SLOT_OPTIONS } from '../utils/timeSlots';

const selectClassName =
  'min-h-12 w-full appearance-none rounded-xl border border-amber-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-amber-400 focus:ring-2';

export default function TimeSelect({
  value,
  onChange,
  className = selectClassName,
  id,
  disabled = false,
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} disabled:opacity-50`}
      disabled={disabled}
    >
      <option value="">— Hora —</option>
      {TIME_SLOT_OPTIONS.map((slot) => (
        <option key={slot} value={slot}>
          {slot}
        </option>
      ))}
      {value && !TIME_SLOT_OPTIONS.includes(value) && (
        <option value={value}>{value}</option>
      )}
    </select>
  );
}
