const INTENSITY_STYLES = [
  {
    test: (d) => d.load === 0,
    cell: 'bg-amber-50 text-slate-400 ring-amber-100',
    bar: 'bg-amber-100',
  },
  {
    test: (d) => d.intensity <= 0.33,
    cell: 'bg-amber-200 text-slate-700 ring-amber-200',
    bar: 'bg-amber-300',
  },
  {
    test: (d) => d.intensity <= 0.66,
    cell: 'bg-amber-400 text-slate-900 ring-amber-300',
    bar: 'bg-amber-500',
  },
  {
    test: () => true,
    cell: 'bg-amber-700 text-white ring-amber-600',
    bar: 'bg-amber-800',
  },
];

function styleForDay(day) {
  return INTENSITY_STYLES.find((s) => s.test(day)) ?? INTENSITY_STYLES[0];
}

export default function WeekHeatStrip({ days, selectedDateKey, onSelectDay }) {
  if (!days?.length) return null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const styles = styleForDay(day);
          const selected = selectedDateKey === day.dateKey;
          const barHeight = day.load === 0 ? 4 : Math.max(20, Math.round(day.intensity * 56));

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onSelectDay?.(day.dateKey)}
              className={`flex flex-col items-center rounded-xl px-0.5 pb-1.5 pt-2 ring-1 transition active:scale-95 ${
                styles.cell
              } ${selected ? 'ring-2 ring-slate-900 ring-offset-1' : ''} ${
                day.isToday && !selected ? 'ring-amber-500' : ''
              }`}
              aria-label={`${day.shortLabel}, ${day.load} atividades`}
              aria-pressed={selected}
            >
              <span className="text-[10px] font-semibold uppercase leading-none opacity-90">
                {day.weekday}
              </span>
              <span className="mt-0.5 text-sm font-bold leading-none tabular-nums">{day.dayNum}</span>
              <span
                className={`mt-2 w-5 rounded-full ${styles.bar}`}
                style={{ height: `${barHeight}px` }}
                aria-hidden
              />
              <span className="mt-1 text-[10px] font-medium tabular-nums opacity-90">{day.load}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
        <span>Menos</span>
        <div className="flex flex-1 items-center gap-0.5">
          <span className="h-2 flex-1 rounded-full bg-amber-100" />
          <span className="h-2 flex-1 rounded-full bg-amber-300" />
          <span className="h-2 flex-1 rounded-full bg-amber-500" />
          <span className="h-2 flex-1 rounded-full bg-amber-800" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}
