import { Zap, Mic } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';

interface TopBarProps {
  store: SimulationStore;
  onAskFlowMind: () => void;
}

export default function TopBar({ store, onAskFlowMind }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-md border-b border-ink-600/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Status pill */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            store.surgeActive
              ? 'bg-flame-500/15 text-flame-400 border border-flame-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${store.surgeActive ? 'bg-flame-500 animate-pulse' : 'bg-emerald-500'}`} />
          {store.surgeActive ? '20× SURGE ACTIVE' : 'SYSTEM OPTIMAL'}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="font-mono">{store.ingestionRate.toLocaleString()}</span>
          <span>e/min</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Ask FlowMind */}
        <button
          onClick={onAskFlowMind}
          className="pill-btn-ghost group"
          title="Ask FlowMind (Press / to open)"
        >
          <Mic size={16} className="text-flowmind-400 group-hover:text-flowmind-300" />
          <span className="hidden sm:inline">Ask FlowMind</span>
        </button>

        {/* Surge toggle */}
        <button
          onClick={store.toggleSurge}
          className={`pill-btn transition-all duration-300 ${
            store.surgeActive
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/30'
              : 'bg-flame-500 text-white hover:bg-flame-400 hover:shadow-flame-500/30'
          } hover:shadow-lg`}
        >
          <Zap size={16} className={store.surgeActive ? '' : 'animate-pulse'} />
          {store.surgeActive ? 'Recover to Normal' : 'Simulate 20× Spike'}
        </button>
      </div>
    </header>
  );
}
