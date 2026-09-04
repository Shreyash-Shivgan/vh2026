import { useState } from 'react';
import { FlaskConical, Zap, ServerCrash, FileStack, FileText, Download, Cpu, Timer, Gauge } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';

interface SimulationStudioProps {
  store: SimulationStore;
}

export default function SimulationStudio({ store }: SimulationStudioProps) {
  const [rcaReport, setRcaReport] = useState<string | null>(null);

  const handleGenerateRCA = () => {
    setRcaReport(store.generateRCA());
  };

  const handleDownload = () => {
    if (!rcaReport) return;
    const blob = new Blob([rcaReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adaptq-rca-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Control panel */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-5">
            <FlaskConical size={16} className="text-flame-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Chaos Engineering Controls</h2>
          </div>

          <div className="space-y-5">
            {/* Ingestion rate slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-flame-400" />
                  <span className="text-xs font-semibold text-white">Ingestion Rate</span>
                </div>
                <span className="text-sm font-mono font-bold text-flame-400 tabular-nums">
                  {store.ingestionRate.toLocaleString()} e/min
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={25000}
                step={500}
                value={store.ingestionRate}
                onChange={(e) => store.setIngestionRate(Number(e.target.value))}
                className="w-full accent-flame-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1,000</span>
                <span>25,000</span>
              </div>
            </div>

            {/* Worker concurrency slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Worker Concurrency</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                  {store.workerConcurrency} workers
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={16}
                step={1}
                value={store.workerConcurrency}
                onChange={(e) => store.setWorkerConcurrency(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2</span>
                <span>16</span>
              </div>
            </div>

            {/* Latency injection slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer size={14} className="text-amber-400" />
                  <span className="text-xs font-semibold text-white">Latency Injection</span>
                </div>
                <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                  {store.latencyInjection} ms
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={store.latencyInjection}
                onChange={(e) => store.setLatencyInjection(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0ms</span>
                <span>500ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset scenarios */}
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={16} className="text-flame-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Preset Scenarios</h2>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => store.triggerScenario('Flash Sale 20× Spike')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-flame-500/5 border border-flame-500/20 hover:border-flame-500/40 hover:bg-flame-500/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-flame-500/10 border border-flame-500/20 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-flame-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Flash Sale 20× Spike</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Simulate 20,000 e/min surge with dynamic routing</div>
              </div>
            </button>

            <button
              onClick={() => store.triggerScenario('Worker Node Degradation')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <ServerCrash size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Worker Node Degradation</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Reduce workers to 3, inject 200ms latency</div>
              </div>
            </button>

            <button
              onClick={() => store.triggerScenario('Log Explosion')}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <FileStack size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Log Explosion</div>
                <div className="text-[11px] text-slate-500 mt-0.5">P3 log volume increases 15×, aggressive shedding</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* RCA Report */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-flowmind-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Incident Post-Mortem Generator</h2>
          </div>
          <div className="flex gap-2">
            {rcaReport && (
              <button onClick={handleDownload} className="pill-btn-ghost text-xs">
                <Download size={14} />
                Download
              </button>
            )}
            <button onClick={handleGenerateRCA} className="pill-btn-primary text-xs">
              <FileText size={14} />
              Generate RCA Report
            </button>
          </div>
        </div>
        {rcaReport ? (
          <div className="bg-ink-950/60 rounded-xl p-4 border border-ink-600/30 overflow-x-auto max-h-[500px] overflow-y-auto">
            <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{rcaReport}</pre>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            Click "Generate RCA Report" to create a formatted post-mortem with root causes and mitigation logs.
          </div>
        )}
      </div>
    </div>
  );
}
