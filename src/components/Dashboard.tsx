import { TrendingUp, TrendingDown, Shield, Zap, Activity, Bot, Layers } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';
import PipelineCanvas from './PipelineCanvas';

interface DashboardProps {
  store: SimulationStore;
}

export default function Dashboard({ store }: DashboardProps) {
  const latencyDelta = store.surgeActive ? 26 : -2;
  const queueColor =
    store.queuePressure > 70 ? 'text-flame-400'
    : store.queuePressure > 40 ? 'text-amber-400'
    : 'text-emerald-400';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero telemetry banner + particle canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Particle canvas */}
        <div className="lg:col-span-2 card-elevated overflow-hidden relative h-[340px]">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-950/80 border border-ink-600/40">
              <Activity size={12} className="text-flame-400" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Pipeline Flow</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-950/80 border border-ink-600/40">
              <span className="text-[10px] font-mono text-flame-400 font-bold">
                {store.ingestionRate.toLocaleString()} e/min
              </span>
            </div>
          </div>
          <PipelineCanvas surgeActive={store.surgeActive} ingestionRate={store.ingestionRate} />
          <div className="absolute bottom-3 left-4 z-10 flex gap-3">
            {[
              { label: 'P0', color: '#EF4444' },
              { label: 'P1', color: '#F59E0B' },
              { label: 'P2', color: '#3B82F6' },
              { label: 'P3', color: '#6B7280' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.color}` }} />
                <span className="text-[10px] text-slate-400 font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero telemetry banner */}
        <div className="card-elevated p-5 flex flex-col justify-between glow-flame">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-flame-400" />
              <span className="text-[10px] font-bold text-flame-400 uppercase tracking-wider">Live Telemetry</span>
            </div>
            <div className="mb-4">
              <div className="text-slate-500 text-xs mb-1">Ingestion Rate</div>
              <div className="text-4xl font-extrabold text-white tabular-nums tracking-tight glow-text">
                {store.ingestionRate.toLocaleString()}
                <span className="text-lg text-slate-400 font-medium ml-1">e/min</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">FlowMind Strategy</span>
                <span className="text-xs font-semibold text-flame-400 px-2 py-0.5 rounded-full bg-flame-500/10 border border-flame-500/20">
                  {store.flowMindStrategy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Agent Phase</span>
                <span className="text-xs font-semibold text-flowmind-400 px-2 py-0.5 rounded-full bg-flowmind-500/10 border border-flowmind-500/20">
                  {store.flowMindPhase}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-ink-600/40">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Mitigation Controls</div>
            <button
              onClick={store.toggleSurge}
              className={`w-full pill-btn justify-center ${
                store.surgeActive
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-flame-500 text-white hover:bg-flame-400'
              }`}
            >
              <Zap size={14} />
              {store.surgeActive ? 'Recover to Normal' : 'Trigger 20× Surge'}
            </button>
          </div>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingestion rate */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center">
              <Activity size={16} className="text-flame-400" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              store.surgeActive ? 'bg-flame-500/10 text-flame-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {store.surgeActive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {store.surgeActive ? '+1900%' : 'STABLE'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Ingestion Rate</div>
          <div className="text-2xl metric-value">
            {store.ingestionRate.toLocaleString()}
            <span className="text-sm text-slate-500 font-medium ml-1">/min</span>
          </div>
        </div>

        {/* P0 latency */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
              <TrendingDown size={10} />
              -{latencyDelta}ms
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Critical P0 Latency</div>
          <div className="text-2xl metric-value text-emerald-400">
            {store.p0Latency}
            <span className="text-sm text-slate-500 font-medium ml-1">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">SLA target: 2,840ms</div>
        </div>

        {/* Queue pressure */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Layers size={16} className="text-amber-400" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              store.queuePressure > 70 ? 'bg-flame-500/10 text-flame-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {store.queuePressure > 70 ? 'HIGH' : 'NORMAL'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Queue Pressure</div>
          <div className={`text-2xl metric-value ${queueColor}`}>
            {store.queuePressure}
            <span className="text-sm text-slate-500 font-medium ml-1">%</span>
          </div>
          <div className="mt-2 h-1.5 bg-ink-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                store.queuePressure > 70 ? 'bg-flame-500' : store.queuePressure > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${store.queuePressure}%` }}
            />
          </div>
        </div>

        {/* FlowMind actions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-flowmind-500/10 border border-flowmind-500/20 flex items-center justify-center">
              <Bot size={16} className="text-flowmind-400" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-flowmind-500/10 text-flowmind-400">
              AUTONOMOUS
            </div>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">FlowMind Actions</div>
          <div className="text-2xl metric-value text-flowmind-400">
            {store.flowMindActions}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Autonomous adaptations</div>
        </div>
      </div>

      {/* Critical Shield HUD */}
      <div className="card-elevated p-5 glow-emerald-box">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-lg" />
              <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
                <Shield size={28} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold mb-1">Critical Shield HUD</div>
              <div className="text-3xl font-extrabold text-white glow-emerald">
                P0 EVENTS LOST: 0
              </div>
              <div className="text-sm text-emerald-400 font-semibold mt-1">100% PROTECTED</div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-ink-950/50 rounded-xl p-3 border border-ink-600/30">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Payments Protected</div>
              <div className="text-xl font-bold text-white tabular-nums">{store.paymentsProtected.toLocaleString()}</div>
            </div>
            <div className="bg-ink-950/50 rounded-xl p-3 border border-ink-600/30">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Orders Protected</div>
              <div className="text-xl font-bold text-white tabular-nums">{store.ordersProtected.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Queue Matrix */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-flame-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Priority Queue Matrix</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {store.queueTiers.map((tier) => (
            <div
              key={tier.tier}
              className="card p-4 hover:border-ink-500 transition-all duration-200 group"
              style={{ borderTopColor: tier.color, borderTopWidth: '2px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: tier.color + '20', color: tier.color, border: `1px solid ${tier.color}40` }}
                  >
                    {tier.tier}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{tier.label}</div>
                  </div>
                </div>
                <div
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tier.color + '15', color: tier.color }}
                >
                  {tier.sla}% SLA
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Mode</span>
                  <span className="text-white font-medium">{tier.mode}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Batch Size</span>
                  <span className="text-white font-mono">{tier.batch}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Shed Rate</span>
                  <span className="text-white font-mono">{tier.shed}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Queue Depth</span>
                  <span className="text-white font-mono tabular-nums">{tier.depth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Latency</span>
                  <span className="text-white font-mono tabular-nums">{tier.latency}ms</span>
                </div>
              </div>
              <div className="mt-3 h-1 bg-ink-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (tier.depth / 10000) * 100)}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
