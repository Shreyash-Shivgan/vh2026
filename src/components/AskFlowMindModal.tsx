import { useState, useEffect, useRef } from 'react';
import { Mic, X, Send, Bot } from 'lucide-react';
import type { SimulationStore } from '@/types/simulation';

interface AskFlowMindModalProps {
  store: SimulationStore;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CHIPS = [
  'Are payments safe?',
  'Why are logs being batched?',
  'Trigger 20x spike',
  'System health status',
];

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function AskFlowMindModal({ store, isOpen, onClose }: AskFlowMindModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "I'm FlowMind, your autonomous pipeline AI. I can answer questions about payment safety, queue depths, latency, system health, and active strategies. How can I help?",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sendQuery = (query: string) => {
    if (!query.trim()) return;
    const response = store.askFlowMind(query);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: query },
      { role: 'ai', content: response },
    ]);
    setInput('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl card-elevated glow-flowmind flex flex-col max-h-[80vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-600/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-flowmind-500/10 border border-flowmind-500/30 flex items-center justify-center">
              <Bot size={20} className="text-flowmind-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Ask FlowMind</div>
              <div className="text-[10px] text-slate-500">Autonomous AI Pipeline Assistant</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-ink-600/40 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-flame-500/15 border border-flame-500/20 text-white'
                    : 'bg-ink-700/40 border border-ink-600/30 text-slate-200'
                }`}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Bot size={12} className="text-flowmind-400" />
                    <span className="text-[10px] font-bold text-flowmind-400 uppercase tracking-wider">FlowMind</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick chips */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => sendQuery(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-ink-700/40 text-slate-400 border border-ink-600/30 hover:text-white hover:border-flowmind-500/30 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-ink-600/40 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-flowmind-500/10 border border-flowmind-500/20 flex items-center justify-center flex-shrink-0">
            <Mic size={16} className="text-flowmind-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendQuery(input);
            }}
            placeholder="Ask about payments, latency, queue health..."
            className="flex-1 bg-ink-950/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-flowmind-500/30 transition-all"
          />
          <button
            onClick={() => sendQuery(input)}
            className="w-9 h-9 rounded-xl bg-flowmind-500/20 border border-flowmind-500/30 flex items-center justify-center text-flowmind-400 hover:bg-flowmind-500/30 transition-all flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
