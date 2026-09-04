import { LayoutDashboard, Activity, Bot, BarChart3, FlaskConical, type LucideIcon } from 'lucide-react';

export type ViewId = 'dashboard' | 'insights' | 'flowmind' | 'benchmark' | 'simulation';

interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, description: 'Live pipeline overview' },
  { id: 'insights', label: 'Live Insights', icon: Activity, description: 'Real-time telemetry charts' },
  { id: 'flowmind', label: 'FlowMind Studio', icon: Bot, description: 'AI agent state machine' },
  { id: 'benchmark', label: 'Benchmark', icon: BarChart3, description: 'Naive vs AdaptQ comparison' },
  { id: 'simulation', label: 'Simulation Studio', icon: FlaskConical, description: 'Chaos engineering controls' },
];
