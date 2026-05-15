import { CalendarDays, CalendarRange, LayoutDashboard, LayoutList, Plus } from 'lucide-react';

function TabButton({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 transition active:scale-95 ${
        active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} aria-hidden />
      <span className={`text-[10px] font-medium sm:text-[11px] ${active ? 'font-semibold' : ''}`}>
        {label}
      </span>
    </button>
  );
}

export default function BottomNav({ activeTab, onTabChange, onAddClick }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-200/90 bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-md"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex max-w-lg items-end gap-0 px-0.5 pt-2">
        <TabButton
          active={activeTab === 'dashboard'}
          label="Painel"
          icon={LayoutDashboard}
          onClick={() => onTabChange('dashboard')}
        />

        <TabButton
          active={activeTab === 'agenda'}
          label="Eventos"
          icon={CalendarDays}
          onClick={() => onTabChange('agenda')}
        />

        <div className="flex w-12 shrink-0 justify-center sm:w-14">
          <button
            type="button"
            onClick={onAddClick}
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-amber-50/90 transition hover:bg-slate-800 active:scale-95"
            aria-label="Adicionar"
          >
            <Plus className="h-7 w-7 stroke-[2.5]" aria-hidden />
          </button>
        </div>

        <TabButton
          active={activeTab === 'calendar'}
          label="Semana"
          icon={CalendarRange}
          onClick={() => onTabChange('calendar')}
        />

        <TabButton
          active={activeTab === 'items'}
          label="Items"
          icon={LayoutList}
          onClick={() => onTabChange('items')}
        />
      </div>
    </nav>
  );
}
