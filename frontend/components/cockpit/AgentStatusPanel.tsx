'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  Cpu,
  ShieldCheck,
  TrendingUp,
  Network,
  Calculator,
  Lock,
  Zap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const AGENT_ICONS: Record<string, any> = {
  guardian: ShieldCheck,
  priority: TrendingUp,
  fusion: Network,
  optimizer: Calculator,
  interlocking: Lock,
  emergency: Zap,
};

export function AgentStatusPanel() {
  const { agentStates, setInspectBrainModalOpen } = useAppStore();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 select-none shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-[#0F2D6B]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            6 Specialized AI Agents
          </h3>
        </div>
        <button
          onClick={() => setInspectBrainModalOpen(true)}
          className="text-[10px] font-mono text-emerald-800 font-bold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition flex items-center space-x-1 cursor-pointer"
          title="Click to inspect all 6 AI agents in detail"
        >
          <span>6/6 VERIFIED</span>
          <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
        </button>
      </div>

      <div className="space-y-2">
        {agentStates.map((agent) => {
          const Icon = AGENT_ICONS[agent.id] || Cpu;
          const isActive = agent.status === 'ACTIVE';
          const isProcessing = agent.status === 'PROCESSING';

          return (
            <div
              key={agent.id}
              onClick={() => setInspectBrainModalOpen(true)}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100/70 transition flex items-center justify-between group cursor-pointer"
              title={`Click to inspect ${agent.name}`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2D6B] group-hover:bg-[#0F2D6B] group-hover:text-white transition shrink-0 shadow-2xs">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs font-bold text-slate-900 truncate">{agent.name}</span>
                    <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
                      ({agent.latency_ms.toFixed(1)}ms)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{agent.role}</p>
                </div>
              </div>

              {/* Pulsing Status Light */}
              <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                <span className="relative flex h-2 w-2">
                  {isActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  {isProcessing && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isActive ? 'bg-emerald-500' : isProcessing ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  />
                </span>
                <span
                  className={`text-[9px] font-mono font-bold ${
                    isActive ? 'text-emerald-700' : isProcessing ? 'text-amber-700' : 'text-slate-500'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
