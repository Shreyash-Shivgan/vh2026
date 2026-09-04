export type FlowMindPhase = 'OBSERVE' | 'ANALYZE' | 'PROPOSE' | 'VALIDATE' | 'EXECUTE' | 'VERIFY';
export type SystemStatus = 'OPTIMAL' | 'WARNING' | 'SURGE';
export type PriorityTier = 'P0' | 'P1' | 'P2' | 'P3';

export interface QueueTierState {
  tier: PriorityTier;
  label: string;
  mode: string;
  batch: string;
  shed: string;
  sla: number;
  depth: number;
  throughput: number;
  latency: number;
  color: string;
  accent: string;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  phase: FlowMindPhase;
  action: string;
  rationale: string;
  before: Record<string, string | number>;
  after: Record<string, string | number>;
  rolledBack?: boolean;
}

export interface SafetyRule {
  id: number;
  rule: string;
  description: string;
  status: 'pass' | 'violated';
}

export interface TelemetryPoint {
  time: string;
  timestamp: number;
  ingestion: number;
  p0Latency: number;
  naiveLatency: number;
  queuePressure: number;
  flowmindActions: number;
}

export interface SimulationState {
  surgeActive: boolean;
  ingestionRate: number;
  baseIngestionRate: number;
  surgeIngestionRate: number;
  workerConcurrency: number;
  latencyInjection: number;
  systemStatus: SystemStatus;
  flowMindPhase: FlowMindPhase;
  flowMindStrategy: string;
  flowMindObjective: string;
  flowMindActions: number;
  p0EventsLost: number;
  p0EventsTotal: number;
  p0Latency: number;
  naiveLatency: number;
  queuePressure: number;
  paymentsProtected: number;
  ordersProtected: number;
  queueTiers: QueueTierState[];
  auditLog: AuditEntry[];
  safetyRules: SafetyRule[];
  telemetry: TelemetryPoint[];
  uptime: number;
}

export interface SimulationActions {
  toggleSurge: () => void;
  setIngestionRate: (rate: number) => void;
  setWorkerConcurrency: (n: number) => void;
  setLatencyInjection: (ms: number) => void;
  triggerScenario: (scenario: string) => void;
  rollbackAuditEntry: (id: string) => void;
  generateRCA: () => string;
  askFlowMind: (query: string) => string;
  tick: () => void;
}

export type SimulationStore = SimulationState & SimulationActions;
