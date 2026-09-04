import { useState, useEffect } from 'react';
import { useSimulationStore } from '@/hooks/useSimulation';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import Dashboard from '@/components/Dashboard';
import Insights from '@/components/Insights';
import FlowMindStudio from '@/components/FlowMindStudio';
import Benchmark from '@/components/Benchmark';
import SimulationStudio from '@/components/SimulationStudio';
import AskFlowMindModal from '@/components/AskFlowMindModal';
import type { ViewId } from '@/components/navConfig';

function App() {
  const store = useSimulationStore();
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !askOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setAskOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [askOpen]);

  return (
    <div className="min-h-screen ambient-bg flex">
      <Sidebar activeView={activeView} onViewChange={setActiveView} store={store} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar store={store} onAskFlowMind={() => setAskOpen(true)} />
        <main className="flex-1 p-6 overflow-x-hidden">
          {activeView === 'dashboard' && <Dashboard store={store} />}
          {activeView === 'insights' && <Insights store={store} />}
          {activeView === 'flowmind' && <FlowMindStudio store={store} />}
          {activeView === 'benchmark' && <Benchmark store={store} />}
          {activeView === 'simulation' && <SimulationStudio store={store} />}
        </main>
      </div>
      <AskFlowMindModal store={store} isOpen={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}

export default App;
