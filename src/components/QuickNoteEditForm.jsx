import { useEffect, useState } from 'react';
import TimeSelect from './TimeSelect';
import { buildEntryDisplayName } from '../utils/entry';

const inputClassName =
  'min-h-12 w-full rounded-xl border border-amber-200 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-amber-400 focus:ring-2';

export default function QuickNoteEditForm({ item, saving, onUpdate }) {
  const [note, setNote] = useState(item?.note ?? '');
  const [name, setName] = useState(item?.name ?? '');
  const [date, setDate] = useState(item?.date ?? '');
  const [time, setTime] = useState(item?.time ?? '');
  const [location, setLocation] = useState(item?.location ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));

  useEffect(() => {
    if (!item) return;
    setNote(item.note ?? '');
    setName(item.name ?? '');
    setDate(item.date ?? '');
    setTime(item.time ?? '');
    setLocation(item.location ?? '');
    setQuantity(String(item.quantity ?? 1));
  }, [item]);

  const save = (fields) => {
    if (!item) return;
    const next = { ...item, ...fields };
    if ('name' in fields || 'note' in fields) {
      onUpdate(item.id, {
        ...fields,
        name: buildEntryDisplayName(
          'name' in fields ? fields.name : next.name,
          'note' in fields ? fields.note : next.note,
        ),
      });
      return;
    }
    onUpdate(item.id, fields);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-post-it p-4 shadow-md">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Data</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => save({ date })}
            disabled={saving}
            className={inputClassName}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Hora</span>
          <TimeSelect
            value={time}
            onChange={(value) => {
              setTime(value);
              save({ time: value });
            }}
            disabled={saving}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Localização</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onBlur={() => save({ location })}
            disabled={saving}
            placeholder="Rooftop Terrace"
            className={inputClassName}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">Nota</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => save({ note })}
          rows={4}
          placeholder="Instruções, pedidos, observações…"
          disabled={saving}
          className={`${inputClassName} min-h-[6rem] resize-y`}
        />
      </label>

      <div className="rounded-xl border border-dashed border-amber-300/70 bg-white/40 px-3 py-3">
        <p className="mb-2 text-xs font-medium text-slate-500">Prato (opcional)</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="w-full sm:w-32">
            <span className="mb-1 block text-xs font-medium text-slate-600">Qtd</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, '') || '1')}
              onBlur={() => save({ quantity })}
              disabled={saving}
              className={`${inputClassName} text-center font-bold`}
            />
          </label>
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-xs font-medium text-slate-600">Prato/Item</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => save({ name })}
              disabled={saving}
              placeholder="Pastel de Nata"
              className={inputClassName}
            />
          </label>
        </div>
      </div>

      {saving && <p className="text-xs text-slate-400">A guardar…</p>}
    </div>
  );
}
