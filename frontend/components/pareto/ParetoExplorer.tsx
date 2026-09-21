'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  Scale,
  Zap,
  CheckCircle2,
} from 'lucide-react';

function ParetoExplorerComponent() {
  const activeProfile = useAppStore((s) => s.activeProfile);
  const applyParetoProfile = useAppStore((s) => s.applyParetoProfile);

  const profiles = [
    {
      name: 'Safety-Max' as const,
      icon: ShieldCheck,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      badge: 'MAX SAFETY',
      desc: 'Extends headway buffers to 45 min around all passenger trains. Zero delay risk.',
      downtimeHrs: 24.0,
      bufferMin: 45,
      delayRisk: '0.2%',
      fusionSavings: 120,
    },
    {
      name: 'Balanced' as const,
      icon: Scale,
      color: 'border-blue-200 bg-blue-50 text-[#0F2D6B]',
      badge: 'RECOMMENDED',
      desc: 'Optimal 50% downtime reduction while strictly preserving 30-min premium train safety.',
      downtimeHrs: 22.0,
      bufferMin: 35,
      delayRisk: '0.6%',
      fusionSavings: 150,
    },
    {
      name: 'Throughput-Max' as const,
      icon: TrendingUp,
      color: 'border-purple-200 bg-purple-50 text-purple-800',
      badge: 'MAX FREIGHT',
      desc: 'Maximizes freight slot release by compacting possessions. Highest fusion density.',
      downtimeHrs: 19.6,
      bufferMin: 30,
      delayRisk: '1.8%',
      fusionSavings: 190,
    },
  ];

  const handleApply = (profile: 'Safety-Max' | 'Throughput-Max' | 'Balanced') => {
    applyParetoProfile(profile);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 select-none font-mono text-xs shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#0F2D6B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Pareto Multi-Objective Frontier
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">Google OR-Tools CP-SAT</span>
      </div>

      {/* 3 Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {profiles.map((p) => {
          const isSelected = activeProfile === p.name;
          const Icon = p.icon;

          return (
            <div
              key={p.name}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#0F2D6B] bg-blue-50/50 ring-2 ring-[#0F2D6B]/30 shadow-xs'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Icon className="w-4 h-4 text-[#0F2D6B]" />
                    <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${p.color}`}>
                    {p.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">{p.desc}</p>
              </div>

              {/* Metrics Table */}
              <div className="space-y-1.5 border-t border-slate-200/80 pt-2 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Total Downtime:</span>
                  <span className="text-slate-900 font-bold">{p.downtimeHrs} hrs</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Fusion Savings:</span>
                  <span className="text-purple-700 font-bold">+{p.fusionSavings} min</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Headway Buffer:</span>
                  <span className="text-emerald-700 font-bold">{p.bufferMin} min</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Passenger Delay Risk:</span>
                  <span className="text-slate-800 font-bold">{p.delayRisk}</span>
                </div>
              </div>

              <button
                onClick={() => handleApply(p.name)}
                className={`w-full py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${
                  isSelected
                    ? 'bg-[#0F2D6B] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {isSelected ? 'ACTIVE PLAN' : 'APPLY THIS PLAN'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export const ParetoExplorer = React.memo(ParetoExplorerComponent);

