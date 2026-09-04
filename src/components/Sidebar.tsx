import { NAV_ITEMS, type ViewId } from './navConfig';
import type { SimulationStore } from '@/types/simulation';

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
  store: SimulationStore;
}

export default function Sidebar({ activeView, onViewChange, store }: SidebarProps) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-ink-900/95 border-r border-ink-600/40 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-flame-500/20 blur-md" />
          <div className="relative w-10 h-10 rounded-full bg-ink-950 border-2 border-flame-500/60 flex items-center justify-center shadow-lg shadow-flame-500/20">
            <span className="text-white font-extrabold text-lg">Q</span>
          </div>
        </div>
        <div>
          <h1 className="text-white font-extrabold text-lg leading-none tracking-tight">AdaptQ</h1>
          <p className="text-slate-500 text-[10px] font-medium mt-0.5 uppercase tracking-wider">Pipeline Command</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-flame-500/10 border border-flame-500/30 text-white'
                  : 'border border-transparent text-slate-500 hover:text-white hover:bg-ink-700/40'
              }`}
            >
              <Icon
                size={18}
                className={active ? 'text-flame-400' : 'text-slate-500 group-hover:text-slate-300'}
              />
              <div className="text-left">
                <div className="text-sm font-semibold leading-none">{item.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{item.description}</div>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-flame-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-4 border-t border-ink-600/40">
        <div className="card px-3 py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${store.surgeActive ? 'bg-flame-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs font-semibold text-white">
              {store.surgeActive ? '20× SURGE ACTIVE' : 'SYSTEM OPTIMAL'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <div>Uptime: {Math.floor(store.uptime / 60)}m {store.uptime % 60}s</div>
            <div>FlowMind Actions: {store.flowMindActions}</div>
            <div>P0 Protected: {store.paymentsProtected.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
