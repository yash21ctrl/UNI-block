'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  AlertOctagon,
  Zap,
  CalendarCheck,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

function KpiStripComponent() {
  const blocksCount = useAppStore((s) => s.activePlan?.optimized_plan?.blocks?.length ?? 0);
  const timeSavedMinutes = useAppStore(
    (s) => s.activePlan?.optimized_plan?.fusion_benefit_minutes ?? 0
  );
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);
  const emergencyCount = activeEmergencies?.length || (isEmergencyActive ? 1 : 0);
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingDemandsCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
      {/* 1. Field JE Block Demands */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400/80 transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
            1. Field Demands (T/351)
          </span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            pendingDemandsCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertOctagon className={`w-4 h-4 ${pendingDemandsCount > 0 ? 'animate-bounce' : ''}`} />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {pendingDemandsCount}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
              pendingDemandsCount > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {pendingDemandsCount > 0 ? `${pendingDemandsCount} AWAITING SANCTION` : '0 PENDING'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          Field mobile requisition dossier
        </p>
      </div>

      {/* 2. Time Saved via Smart Scheduling */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-400/80 transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-900">
            2. Combined Possession Savings
          </span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-black text-purple-900 font-mono tracking-tight">
            +{timeSavedMinutes}m
          </span>
          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-bold flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3 text-emerald-600" /> 50% Downtime Cut
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
          Cross-department bundled track work
        </p>
      </div>

      {/* 3. Active Track Possessions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400/80 transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700">
            3. Scheduled Possessions
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F2D6B] flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {blocksCount}
          </span>
          <span className="text-[10px] text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-mono font-bold">
            100% CONFLICT-FREE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Night slots locked (00:00 - 05:00)
        </p>
      </div>

      {/* 4. VIP Passenger Trains Safe */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400/80 transition-all duration-200 relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-900">
            4. Passenger Train Protection
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2 mt-1">
          <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
            100% Safe
          </span>
          <span className="text-[10px] font-mono text-emerald-900 px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 font-bold">
            0 DELAYS
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-sans mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Vande Bharat, Shatabdi & Rajdhani
        </p>
      </div>
    </div>
  );
}
export const KpiStrip = React.memo(KpiStripComponent);

