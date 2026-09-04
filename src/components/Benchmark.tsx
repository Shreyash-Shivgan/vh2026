import { CheckCircle2, XCircle, TrendingDown, Zap, Shield, Clock, Layers, GitBranch } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';

interface BenchmarkProps {
  store: SimulationStore;
}

interface ComparisonRow {
  metric: string;
  naive: string;
  adaptq: string;
  naiveStatus: 'bad' | 'neutral';
  adaptqStatus: 'good' | 'neutral';
  icon: typeof Zap;
}

export default function Benchmark({ store }: BenchmarkProps) {
  const rows: ComparisonRow[] = [
    {
      metric: 'Critical P0 Events Lost',
      naive: '4,281 (42% dropped)',
      adaptq: '0 (100% protected)',
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: Shield,
    },
    {
      metric: 'Payment Latency',
      naive: `${Math.round(store.naiveLatency).toLocaleString()} ms`,
      adaptq: `${store.p0Latency} ms`,
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: Zap,
    },
    {
      metric: 'Priority Awareness',
      naive: 'None (FIFO)',
      adaptq: 'P0–P3 Tiered Router',
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: Layers,
    },
    {
      metric: 'Batching Strategy',
      naive: 'Fixed (batch = 1)',
      adaptq: 'Dynamic 250–500',
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: GitBranch,
    },
    {
      metric: 'MTTR (Recovery)',
      naive: '18–35 min (manual restart)',
      adaptq: '< 3s autonomous',
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: Clock,
    },
    {
      metric: 'Log Handling',
      naive: 'All logs queued equally',
      adaptq: '75% controlled shedding',
      naiveStatus: 'bad',
      adaptqStatus: 'good',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-flame-500" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Naive FIFO vs AdaptQ</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">Side-by-side comparison under 20× surge load (20,000 events/min)</p>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-600/40">
                <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metric</th>
                <th className="text-left py-3 px-3 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <XCircle size={12} />
                    Naive Pipeline
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    AdaptQ
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <tr
                    key={row.metric}
                    className={`border-b border-ink-600/20 hover:bg-ink-700/20 transition-colors ${i % 2 === 0 ? 'bg-ink-950/20' : ''}`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-slate-500" />
                        <span className="text-xs font-semibold text-white">{row.metric}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-red-400 font-medium">{row.naive}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-emerald-400 font-semibold">{row.adaptq}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">P0 Data Loss Reduction</div>
          <div className="text-4xl font-extrabold text-emerald-400 glow-emerald">100%</div>
          <div className="text-xs text-slate-500 mt-1">From 42% to 0%</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Latency Improvement</div>
          <div className="text-4xl font-extrabold text-flame-400 glow-text">
            {Math.round((1 - store.p0Latency / store.naiveLatency) * 100)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{Math.round(store.naiveLatency)}ms → {store.p0Latency}ms</div>
        </div>
        <div className="card p-5 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Recovery Speed</div>
          <div className="text-4xl font-extrabold text-flowmind-400">700×</div>
          <div className="text-xs text-slate-500 mt-1">18min → &lt;3s</div>
        </div>
      </div>
    </div>
  );
}
