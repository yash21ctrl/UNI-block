'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAppStore } from '../../../lib/store';
import { BlockGantt } from '../../../components/gantt/BlockGantt';
import {
  FileCheck,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function PlanInspectPage() {
  const params = useParams();
  const planId = params?.id ? String(params.id) : 'PLAN-DEFAULT';
  const { activePlan, setApprovalModalOpen } = useAppStore();

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-lg border border-surface-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Corridor Schedule: {planId}
            </h1>
            <p className="text-[11px] text-slate-400">
              Corridor: {activePlan.section || 'NDLS-AGC'} • Status: {activePlan.optimized_plan.solve_status}
            </p>
          </div>
        </div>

        <button
          onClick={() => setApprovalModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-wider text-xs flex items-center space-x-2 transition shadow-md shadow-emerald-950"
        >
          <FileCheck className="w-4 h-4" />
          <span>Sanction / Export Memo</span>
        </button>
      </div>

      <BlockGantt />
    </div>
  );
}
