import { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import type { SimulationStore } from '@/types/simulation';

interface InsightsProps {
  store: SimulationStore;
}

type Filter = 'live' | 'p0' | 'pressure';
type Timeframe = '1m' | '5m' | '15m' | '1h';

export default function Insights({ store }: InsightsProps) {
  const [filter, setFilter] = useState<Filter>('live');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');

  const maxPoints = timeframe === '1m' ? 60 : timeframe === '5m' ? 60 : timeframe === '15m' ? 60 : 60;
  const data = store.telemetry.slice(-maxPoints);

  const filterConfig = {
    live: { label: 'Live Flow', primary: 'ingestion', color: '#FF7700', unit: 'e/min' },
    p0: { label: 'P0 Payment Flow', primary: 'p0Latency', color: '#10B981', unit: 'ms' },
    pressure: { label: 'System Pressure', primary: 'queuePressure', color: '#F59E0B', unit: '%' },
  };

  const cfg = filterConfig[filter];

  const headlineValue = data.length > 0 ? data[data.length - 1][cfg.primary as keyof typeof data[0]] : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Headline metric + filter */}
      <div className="card-elevated p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
            <div className="text-5xl font-extrabold text-white tabular-nums tracking-tight" style={{ textShadow: `0 0 30px ${cfg.color}40` }}>
              {typeof headlineValue === 'number' ? headlineValue.toLocaleString() : headlineValue}
              <span className="text-xl text-slate-500 font-medium ml-2">{cfg.unit}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterConfig) as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === f
                    ? 'bg-flame-500/15 text-flame-400 border border-flame-500/30'
                    : 'bg-ink-700/40 text-slate-500 border border-transparent hover:text-white'
                }`}
              >
                {filterConfig[f].label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe toggles */}
        <div className="flex gap-1 mb-4">
          {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                timeframe === tf
                  ? 'bg-ink-600/60 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Main chart */}
        <div className="h-[280px]">
          {filter === 'live' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingestionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7700" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#FF7700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #282A31',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#6B7280' }}
                  itemStyle={{ color: '#FF7700' }}
                />
                <Area
                  type="monotone"
                  dataKey="ingestion"
                  stroke="#FF7700"
                  strokeWidth={2}
                  fill="url(#ingestionGrad)"
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {filter === 'p0' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #282A31',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#6B7280' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <ReferenceLine y={2840} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'SLA Target 2,840ms', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="p0Latency" name="AdaptQ P0 Latency" stroke="#10B981" strokeWidth={2.5} dot={false} animationDuration={300} />
                <Line type="monotone" dataKey="naiveLatency" name="Naive Pipeline Latency" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 4" animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {filter === 'pressure' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
                <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #282A31',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#6B7280' }}
                  itemStyle={{ color: '#F59E0B' }}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Critical 70%', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }} />
                <Area
                  type="monotone"
                  dataKey="queuePressure"
                  name="Queue Pressure"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#pressureGrad)"
                  dot={false}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparative latency overlay */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-flowmind-500" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Comparative Latency: AdaptQ vs Naive FIFO</h3>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="time" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #282A31',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#6B7280' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="p0Latency" name="AdaptQ AI Latency" stroke="#10B981" strokeWidth={2.5} dot={false} animationDuration={300} />
              <Line type="monotone" dataKey="naiveLatency" name="Naive Pipeline Latency" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="5 5" animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
