import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  SimulationState,
  SimulationStore,
  AuditEntry,
  TelemetryPoint,
  QueueTierState,
  SafetyRule,
  FlowMindPhase,
} from '@/types/simulation';

const MAX_TELEMETRY = 60;
const MAX_AUDIT = 50;

function createInitialQueueTiers(surge: boolean): QueueTierState[] {
  return [
    {
      tier: 'P0',
      label: 'Payments & Checkout',
      mode: 'Streaming',
      batch: '1',
      shed: '0%',
      sla: 100,
      depth: surge ? 12 : 3,
      throughput: surge ? 4200 : 210,
      latency: surge ? 48 : 22,
      color: '#EF4444',
      accent: 'red',
    },
    {
      tier: 'P1',
      label: 'Inventory & Cart',
      mode: surge ? 'Adaptive Batching' : 'Micro-Batching',
      batch: surge ? '250–500' : '50–100',
      shed: '0%',
      sla: 99.9,
      depth: surge ? 3400 : 180,
      throughput: surge ? 8800 : 440,
      latency: surge ? 180 : 65,
      color: '#F59E0B',
      accent: 'amber',
    },
    {
      tier: 'P2',
      label: 'User Clicks & Telemetry',
      mode: surge ? 'Deferred' : 'Buffered',
      batch: surge ? '500–1000' : '100–200',
      shed: surge ? '0%' : '0%',
      sla: 95,
      depth: surge ? 6200 : 240,
      throughput: surge ? 5200 : 260,
      latency: surge ? 1200 : 400,
      color: '#3B82F6',
      accent: 'blue',
    },
    {
      tier: 'P3',
      label: 'Debug & System Logs',
      mode: surge ? 'Controlled Shedding' : 'Sampled',
      batch: surge ? '1000' : '200',
      shed: surge ? '75%' : '25%',
      sla: 90,
      depth: surge ? 8400 : 120,
      throughput: surge ? 1800 : 90,
      latency: surge ? 3000 : 800,
      color: '#6B7280',
      accent: 'slate',
    },
  ];
}

function createSafetyRules(): SafetyRule[] {
  return [
    { id: 1, rule: 'P0 Payments/Orders CANNOT be shed or sampled', description: 'Strict veto on any proposal where P0 delivery < 100%', status: 'pass' },
    { id: 2, rule: 'Max batch size ceiling ≤ 1,000 items', description: 'No proposal may exceed 1,000 items per batch', status: 'pass' },
    { id: 3, rule: 'Max deferral window ≤ 60 seconds', description: 'Deferred items must drain within 60s SLA', status: 'pass' },
    { id: 4, rule: 'Max shedding rate ≤ 90%', description: 'At least 10% minimal sample must be preserved', status: 'pass' },
  ];
}

function makeAuditEntry(
  phase: FlowMindPhase,
  action: string,
  rationale: string,
  before: Record<string, string | number>,
  after: Record<string, string | number>,
): AuditEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    phase,
    action,
    rationale,
    before,
    after,
  };
}

export function useSimulationStore(): SimulationStore {
  const [surgeActive, setSurgeActive] = useState(false);
  const [ingestionRate, setIngestionRate] = useState(1000);
  const [workerConcurrency, setWorkerConcurrency] = useState(8);
  const [latencyInjection, setLatencyInjection] = useState(0);
  const [flowMindPhase, setFlowMindPhase] = useState<FlowMindPhase>('VERIFY');
  const [flowMindActions, setFlowMindActions] = useState(0);
  const [p0EventsLost, setP0EventsLost] = useState(0);
  const [p0EventsTotal, setP0EventsTotal] = useState(0);
  const [p0Latency, setP0Latency] = useState(22);
  const [naiveLatency, setNaiveLatency] = useState(45);
  const [queuePressure, setQueuePressure] = useState(12);
  const [paymentsProtected, setPaymentsProtected] = useState(0);
  const [ordersProtected, setOrdersProtected] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [uptime, setUptime] = useState(0);
  const [flowMindStrategy, setFlowMindStrategy] = useState('Steady-State Micro-Batching');
  const [flowMindObjective, setFlowMindObjective] = useState('Maintain baseline throughput with minimal overhead');

  const surgeRef = useRef(false);
  const actionsRef = useRef(0);
  const phaseIndexRef = useRef(5);
  const tickCountRef = useRef(0);

  surgeRef.current = surgeActive;

  const baseIngestionRate = 1000;
  const surgeIngestionRate = 20000;

  const queueTiers = createInitialQueueTiers(surgeActive);
  const safetyRules = createSafetyRules();

  const systemStatus = surgeActive ? 'SURGE' : queuePressure > 60 ? 'WARNING' : 'OPTIMAL';

  const toggleSurge = useCallback(() => {
    setSurgeActive((prev) => {
      const next = !prev;
      if (next) {
        setIngestionRate(surgeIngestionRate);
        setFlowMindStrategy('Dynamic Batching + Log Shedding');
        setFlowMindObjective('Protect P0 Payments & mitigate queue pressure');
        setQueuePressure(78);
        setP0Latency(48);
        setNaiveLatency(2840);
        actionsRef.current += 5;
        setFlowMindActions(actionsRef.current);
        setFlowMindPhase('EXECUTE');
        phaseIndexRef.current = 4;

        setAuditLog((log) => [
          makeAuditEntry(
            'OBSERVE',
            'Traffic surge detected: 20× spike',
            'Ingestion rate jumped from 1,000 to 20,000 e/min. Queue pressure rising to 78%.',
            { ingestion: '1,000 e/min', queuePressure: '12%', p0Latency: '22ms' },
            { ingestion: '20,000 e/min', queuePressure: '78%', p0Latency: '48ms' },
          ),
          makeAuditEntry(
            'ANALYZE',
            'Head-of-line blocking risk identified on P0',
            'Naive FIFO pipeline would drop 42% of P0 payments under sustained surge.',
            { naiveDropRate: '0%', naiveLatency: '45ms' },
            { naiveDropRate: '42% projected', naiveLatency: '2,840ms projected' },
          ),
          makeAuditEntry(
            'PROPOSE',
            'Propose: Dynamic batching + P3 log shedding',
            'Increase P1 batch to 250–500, defer P2 to 30s window, shed P3 at 75% sampling.',
            { p1Batch: '50–100', p2Mode: 'Buffered', p3Shed: '25%' },
            { p1Batch: '250–500', p2Mode: 'Deferred', p3Shed: '75%' },
          ),
          makeAuditEntry(
            'VALIDATE',
            'SafetyGuard validated all 4 rules',
            'P0 SLA maintained at 100%, batch ≤ 1,000, deferral ≤ 60s, shed ≤ 90%.',
            { rulesPassed: 4, p0Sla: '100%' },
            { rulesPassed: 4, p0Sla: '100%' },
          ),
          makeAuditEntry(
            'EXECUTE',
            'Applied adaptive routing policy',
            'P0 streaming preserved, P1 batched, P2 deferred, P3 shed at 75%.',
            { strategy: 'Steady-State Micro-Batching' },
            { strategy: 'Dynamic Batching + Log Shedding' },
          ),
          ...log,
        ].slice(0, MAX_AUDIT));
      } else {
        setIngestionRate(baseIngestionRate);
        setFlowMindStrategy('Steady-State Micro-Batching');
        setFlowMindObjective('Maintain baseline throughput with minimal overhead');
        setQueuePressure(12);
        setP0Latency(22);
        setNaiveLatency(45);
        actionsRef.current += 2;
        setFlowMindActions(actionsRef.current);
        setFlowMindPhase('VERIFY');
        phaseIndexRef.current = 5;

        setAuditLog((log) => [
          makeAuditEntry(
            'OBSERVE',
            'Traffic normalizing: surge subsided',
            'Ingestion rate returning to 1,000 e/min. Draining deferred queues.',
            { ingestion: '20,000 e/min', queuePressure: '78%' },
            { ingestion: '1,000 e/min', queuePressure: '12%' },
          ),
          makeAuditEntry(
            'EXECUTE',
            'Restored steady-state defaults',
            'P2 deferred queue drained, P3 shedding reduced to 25%, batch sizes normalized.',
            { p1Batch: '250–500', p2Mode: 'Deferred', p3Shed: '75%' },
            { p1Batch: '50–100', p2Mode: 'Buffered', p3Shed: '25%' },
          ),
          ...log,
        ].slice(0, MAX_AUDIT));
      }
      return next;
    });
  }, []);

  const setIngestionRateHandler = useCallback((rate: number) => {
    setIngestionRate(rate);
    if (rate > 15000) {
      setSurgeActive(true);
      surgeRef.current = true;
      setFlowMindStrategy('Dynamic Batching + Log Shedding');
      setFlowMindObjective('Protect P0 Payments & mitigate queue pressure');
      setQueuePressure(Math.min(95, 40 + (rate / 25000) * 50));
      setP0Latency(40 + (rate / 25000) * 20);
      setNaiveLatency(500 + (rate / 25000) * 2500);
    } else if (rate > 5000) {
      setQueuePressure(30 + (rate / 20000) * 40);
      setP0Latency(30 + (rate / 20000) * 20);
      setNaiveLatency(100 + (rate / 20000) * 2000);
    } else {
      setSurgeActive(false);
      surgeRef.current = false;
      setFlowMindStrategy('Steady-State Micro-Batching');
      setFlowMindObjective('Maintain baseline throughput with minimal overhead');
      setQueuePressure(10 + (rate / 5000) * 15);
      setP0Latency(22 + (rate / 5000) * 10);
      setNaiveLatency(45 + (rate / 5000) * 50);
    }
  }, []);

  const triggerScenario = useCallback((scenario: string) => {
    switch (scenario) {
      case 'Flash Sale 20× Spike':
        if (!surgeRef.current) toggleSurge();
        break;
      case 'Worker Node Degradation':
        setWorkerConcurrency(3);
        setLatencyInjection(200);
        setQueuePressure((p) => Math.min(92, p + 20));
        setAuditLog((log) => [
          makeAuditEntry(
            'OBSERVE',
            'Worker node degradation detected',
            '2 of 8 worker nodes became unresponsive. Effective concurrency reduced to 3.',
            { workers: 8, latency: '0ms injected' },
            { workers: 3, latency: '200ms injected' },
          ),
          ...log,
        ].slice(0, MAX_AUDIT));
        actionsRef.current += 2;
        setFlowMindActions(actionsRef.current);
        break;
      case 'Log Explosion':
        setIngestionRateHandler(18000);
        setAuditLog((log) => [
          makeAuditEntry(
            'OBSERVE',
            'Log volume explosion detected',
            'P3 debug log volume increased 15×. Initiating aggressive shedding to protect P0–P2.',
            { p3Shed: '25%', p3Depth: '120' },
            { p3Shed: '85%', p3Depth: '8,400' },
          ),
          ...log,
        ].slice(0, MAX_AUDIT));
        actionsRef.current += 3;
        setFlowMindActions(actionsRef.current);
        break;
    }
  }, [toggleSurge, setIngestionRateHandler]);

  const rollbackAuditEntry = useCallback((id: string) => {
    setAuditLog((log) =>
      log.map((e) => (e.id === id ? { ...e, rolledBack: !e.rolledBack } : e)),
    );
  }, []);

  const generateRCA = useCallback(() => {
    const ts = new Date().toISOString();
    const peakRate = surgeActive ? '20,000' : ingestionRate.toLocaleString();
    const report = `# AdaptQ Incident Post-Mortem — RCA Report

**Generated:** ${ts}
**Incident:** ${surgeActive ? '20× Flash Traffic Surge' : 'Baseline Assessment'}
**Peak Ingestion:** ${peakRate} events/min
**Duration:** ${Math.floor(uptime / 60)}m ${uptime % 60}s
**Severity:** P0 — Critical

## Executive Summary
Under a ${surgeActive ? '20×' : '1×'} traffic surge, AdaptQ's FlowMind AI agent autonomously detected rising queue pressure and enacted dynamic batching with P3 log shedding. SafetyGuard validated all 4 immutable safety rules. **Zero P0 events were lost.**

## Root Cause Analysis
1. **Trigger:** Flash sale event caused ingestion to spike from 1,000 to ${peakRate} e/min
2. **Risk:** Naive FIFO pipeline would have dropped 42% of P0 payments due to Head-Of-Line blocking
3. **Naive projected latency:** ${Math.round(naiveLatency)}ms (SLA: 2,840ms)
4. **AdaptQ actual latency:** ${p0Latency}ms

## Autonomous Mitigation Actions
${auditLog.slice(0, 10).map((e, i) => `${i + 1}. **[${e.phase}]** ${e.action} — ${e.rationale}`).join('\n')}

## SafetyGuard Validation
- Rule 1: P0 Payments/Orders — ✅ 100% delivered (zero shedding)
- Rule 2: Batch size ceiling — ✅ Max batch 1,000
- Rule 3: Deferral window — ✅ Max 30s (≤ 60s limit)
- Rule 4: Shedding rate — ✅ 75% (≤ 90% limit)

## Impact Metrics
| Metric | Naive Pipeline | AdaptQ |
|--------|---------------|--------|
| P0 Events Lost | 4,281 (42%) | **0** |
| Payment Latency | ${Math.round(naiveLatency)}ms | **${p0Latency}ms** |
| MTTR | 18–35 min | **< 3s** |
| Priority Awareness | None (FIFO) | P0–P3 Tiered |

## Conclusion
AdaptQ maintained 100% P0 SLA throughout the incident. FlowMind executed ${flowMindActions} autonomous adaptations with zero SafetyGuard violations. No manual intervention was required.
`;
    return report;
  }, [surgeActive, ingestionRate, uptime, naiveLatency, p0Latency, auditLog, flowMindActions]);

  const askFlowMind = useCallback((query: string): string => {
    const q = query.toLowerCase().trim();
    if (q.includes('payment') || q.includes('safe')) {
      return `✅ **Payments are fully protected.** P0 SLA is at 100% — ${paymentsProtected.toLocaleString()} payments and ${ordersProtected.toLocaleString()} orders have been delivered with zero loss. Current P0 latency is ${p0Latency}ms (well under the 2,840ms SLA target). SafetyGuard Rule 1 strictly vetoes any proposal that would shed or sample P0 events.`;
    }
    if (q.includes('log') && q.includes('batch')) {
      return `P3 debug logs are currently in ${surgeActive ? 'Controlled Shedding at 75%' : 'Sampled at 25%'} mode. Under surge conditions, FlowMind increases P3 shedding to reduce worker overhead, freeing capacity for P0–P2 processing. This is validated by SafetyGuard Rule 4 (≤ 90% max shed, 10% minimum sample preserved).`;
    }
    if (q.includes('spike') || q.includes('surge') || q.includes('20x') || q.includes('trigger')) {
      if (!surgeRef.current) toggleSurge();
      return `🔄 **20× surge triggered.** Ingestion rate jumped to 20,000 e/min. FlowMind has transitioned to Dynamic Batching + Log Shedding. P0 latency held at ${p0Latency}ms. Queue pressure at ${Math.round(queuePressure)}%. All SafetyGuard rules passing.`;
    }
    if (q.includes('health') || q.includes('status') || q.includes('system')) {
      return `📊 **System Health Report**\n• Status: ${systemStatus}\n• Ingestion: ${ingestionRate.toLocaleString()} e/min\n• Queue Pressure: ${Math.round(queuePressure)}%\n• P0 Latency: ${p0Latency}ms\n• Active Strategy: ${flowMindStrategy}\n• FlowMind Actions: ${flowMindActions}\n• Workers: ${workerConcurrency} concurrent\n• Uptime: ${Math.floor(uptime / 60)}m ${uptime % 60}s`;
    }
    if (q.includes('queue')) {
      return `Current queue depths:\n• P0 (Payments): ${queueTiers[0].depth.toLocaleString()} items — Streaming\n• P1 (Inventory): ${queueTiers[1].depth.toLocaleString()} items — ${queueTiers[1].mode}\n• P2 (Telemetry): ${queueTiers[2].depth.toLocaleString()} items — ${queueTiers[2].mode}\n• P3 (Logs): ${queueTiers[3].depth.toLocaleString()} items — ${queueTiers[3].mode}`;
    }
    if (q.includes('latency')) {
      return `Latency comparison:\n• AdaptQ P0 latency: **${p0Latency}ms** (SLA: 2,840ms)\n• Naive pipeline latency: **${Math.round(naiveLatency)}ms**\n• AdaptQ is ${Math.round((1 - p0Latency / naiveLatency) * 100)}% faster than the naive FIFO approach.`;
    }
    return `I'm FlowMind, your autonomous pipeline AI. I can answer questions about payment safety, queue depths, latency, system health, and active strategies. Try asking "Are payments safe?" or "System health status".`;
  }, [paymentsProtected, ordersProtected, p0Latency, surgeActive, queuePressure, systemStatus, ingestionRate, flowMindStrategy, flowMindActions, workerConcurrency, uptime, queueTiers, naiveLatency, toggleSurge]);

  // Main tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      tickCountRef.current += 1;
      setUptime((u) => u + 1);

      // Accumulate P0 events
      const ratePerSec = ingestionRate / 60;
      const p0Fraction = 0.21;
      const p0ThisTick = Math.round(ratePerSec * p0Fraction);
      setP0EventsTotal((t) => t + p0ThisTick);
      setPaymentsProtected((p) => p + Math.round(p0ThisTick * 0.6));
      setOrdersProtected((o) => o + Math.round(p0ThisTick * 0.4));
      // P0 events lost is ALWAYS 0 — that's the whole point

      // Cycle FlowMind phases
      const phases: FlowMindPhase[] = ['OBSERVE', 'ANALYZE', 'PROPOSE', 'VALIDATE', 'EXECUTE', 'VERIFY'];
      if (tickCountRef.current % 3 === 0) {
        phaseIndexRef.current = (phaseIndexRef.current + 1) % phases.length;
        setFlowMindPhase(phases[phaseIndexRef.current]);
      }

      // Jitter metrics slightly for realism
      setP0Latency((l) => {
        const base = surgeActive ? 48 : 22;
        const jitter = (Math.random() - 0.5) * 6;
        return Math.max(15, Math.round(base + jitter));
      });
      setNaiveLatency((l) => {
        const base = surgeActive ? 2840 : 45;
        const jitter = (Math.random() - 0.5) * (surgeActive ? 200 : 10);
        return Math.max(30, Math.round(base + jitter));
      });
      setQueuePressure((qp) => {
        const base = surgeActive ? 78 : 12;
        const jitter = (Math.random() - 0.5) * (surgeActive ? 8 : 4);
        return Math.max(5, Math.min(98, Math.round(base + jitter)));
      });

      // Push telemetry point
      setTelemetry((prev) => {
        const now = Date.now();
        const point: TelemetryPoint = {
          time: new Date(now).toLocaleTimeString('en-US', { hour12: false }),
          timestamp: now,
          ingestion: ingestionRate,
          p0Latency: surgeActive ? 48 + Math.round((Math.random() - 0.5) * 6) : 22 + Math.round((Math.random() - 0.5) * 4),
          naiveLatency: surgeActive ? 2840 + Math.round((Math.random() - 0.5) * 200) : 45 + Math.round((Math.random() - 0.5) * 10),
          queuePressure: surgeActive ? 78 + Math.round((Math.random() - 0.5) * 8) : 12 + Math.round((Math.random() - 0.5) * 4),
          flowmindActions: actionsRef.current,
        };
        return [...prev, point].slice(-MAX_TELEMETRY);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ingestionRate, surgeActive]);

  const state: SimulationState = {
    surgeActive,
    ingestionRate,
    baseIngestionRate,
    surgeIngestionRate,
    workerConcurrency,
    latencyInjection,
    systemStatus,
    flowMindPhase,
    flowMindStrategy,
    flowMindObjective,
    flowMindActions,
    p0EventsLost,
    p0EventsTotal,
    p0Latency,
    naiveLatency,
    queuePressure,
    paymentsProtected,
    ordersProtected,
    queueTiers,
    auditLog,
    safetyRules,
    telemetry,
    uptime,
  };

  return {
    ...state,
    toggleSurge,
    setIngestionRate: setIngestionRateHandler,
    setWorkerConcurrency,
    setLatencyInjection,
    triggerScenario,
    rollbackAuditEntry,
    generateRCA,
    askFlowMind,
    tick: () => {},
  };
}
