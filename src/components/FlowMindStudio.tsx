import { Bot, Shield, CheckCircle2, AlertTriangle, RotateCcw, Eye, Brain, Lightbulb, CheckCheck, Play, CheckCircle } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';
import type { FlowMindPhase } from '@/types/simulation';

interface FlowMindStudioProps {
  store: SimulationStore;
}

const PHASES: FlowMindPhase[] = ['OBSERVE', 'ANALYZE', 'PROPOSE', 'VALIDATE', 'EXECUTE', 'VERIFY'];
const PHASE_ICONS = [Eye, Brain, Lightbulb, Shield, Play, CheckCheck];
const PHASE_COLORS = ['#6B7280', '#3B82F6', '#F59E0B', '#8B5CF6', '#FF7700', '#10B981'];

export default function FlowMindStudio({ store }: FlowMindStudioProps) {
  const activePhaseIndex = PHASES.indexOf(store.flowMindPhase);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* State machine stepper */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bot size={16} className="text-flowmind-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Autonomous Agent State Machine</h2>
          <span className="ml-auto text-[10px] font-bold text-flowmind-400 px-2 py-0.5 rounded-full bg-flowmind-500/10 border border-flowmind-500/20">
            ACTIVE
          </span>
        </div>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {PHASES.map((phase, i) => {
            const Icon = PHASE_ICONS[i];
            const isActive = i === activePhaseIndex;
            const isPast = i < activePhaseIndex;
            return (
              <div key={phase} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'border-2 scale-110'
                        : isPast
                        ? 'border border-ink-600/40'
                        : 'border border-ink-600/30 opacity-40'
                    }`}
                    style={{
                      backgroundColor: isActive ? PHASE_COLORS[i] + '20' : '#111827',
                      borderColor: isActive ? PHASE_COLORS[i] : undefined,
                      boxShadow: isActive ? `0 0 20px ${PHASE_COLORS[i]}40` : undefined,
                    }}
                  >
                    <Icon size={20} style={{ color: isActive || isPast ? PHASE_COLORS[i] : '#3A3D47' }} />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : isPast ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {phase}
                  </span>
                </div>
                {i < PHASES.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 rounded-full transition-all duration-300 ${
                      isPast ? 'bg-flowmind-500/40' : 'bg-ink-600/40'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active strategy card */}
        <div className="card-elevated p-5 glow-flowmind">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={16} className="text-flowmind-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Strategy</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Objective</div>
              <div className="text-base font-semibold text-white">{store.flowMindObjective}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Strategy</div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-flowmind-500/10 border border-flowmind-500/20 text-sm font-semibold text-flowmind-400">
                {store.flowMindStrategy}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ink-950/50 rounded-xl p-3 border border-ink-600/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Trigger Cause</div>
                <div className="text-sm text-white font-medium">
                  {store.surgeActive ? '20× traffic surge' : 'Baseline steady-state'}
                </div>
              </div>
              <div className="bg-ink-950/50 rounded-xl p-3 border border-ink-600/30">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Expected Impact</div>
                <div className="text-sm text-emerald-400 font-semibold">-{store.surgeActive ? 25 : 0}ms latency</div>
              </div>
            </div>
          </div>
        </div>

        {/* SafetyGuard Inspector */}
        <div className="card-elevated p-5 glow-emerald-box">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">SafetyGuard Inspector</h3>
            <span className="ml-auto text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              ALL RULES PASS
            </span>
          </div>
          <div className="space-y-2">
            {store.safetyRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-ink-950/40 border border-ink-600/30 hover:border-emerald-500/20 transition-all"
              >
                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Rule {rule.id}: {rule.rule}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{rule.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Audit Log */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Decision Audit Log</h3>
          <span className="ml-auto text-[10px] text-slate-500">{store.auditLog.length} entries</span>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {store.auditLog.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No audit entries yet. Trigger a 20× surge to see FlowMind in action.
            </div>
          )}
          {store.auditLog.map((entry) => {
            const phaseIdx = PHASES.indexOf(entry.phase);
            const phaseColor = PHASE_COLORS[phaseIdx];
            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  entry.rolledBack
                    ? 'bg-red-500/5 border-red-500/20 opacity-60'
                    : 'bg-ink-950/40 border-ink-600/30 hover:border-ink-500/40'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                  style={{ backgroundColor: phaseColor + '20', color: phaseColor, border: `1px solid ${phaseColor}40` }}
                >
                  {entry.phase.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{entry.action}</span>
                    {entry.rolledBack && (
                      <span className="text-[9px] font-bold text-red-400 px-1.5 py-0.5 rounded-full bg-red-500/10">
                        ROLLED BACK
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mb-1.5">{entry.rationale}</div>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {Object.entries(entry.before).map(([k, v]) => (
                      <span key={k} className="text-slate-500">
                        {k}: <span className="text-slate-400">{v}</span>
                      </span>
                    ))}
                    <span className="text-flame-400">→</span>
                    {Object.entries(entry.after).map(([k, v]) => (
                      <span key={k} className="text-slate-500">
                        {k}: <span className="text-emerald-400">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => store.rollbackAuditEntry(entry.id)}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                    entry.rolledBack
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-slate-500 hover:text-white hover:bg-ink-600/40'
                  }`}
                  title="Toggle Rollback Policy"
                >
                  {entry.rolledBack ? <AlertTriangle size={13} /> : <RotateCcw size={13} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
