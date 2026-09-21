'use client';

import React from 'react';
import Link from 'next/link';
import { IncomingDemandsSection } from '../../../components/cockpit/IncomingDemandsSection';
import { ArrowLeft, Inbox, Radio, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../../lib/store';

export default function CockpitRequestsPage() {
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;
  const activeCount = fieldRequests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'SANCTIONED' || r.status === 'DISCONNECTED'
  ).length;

  return (
    <div className="space-y-4 select-none max-w-7xl mx-auto">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            href="/cockpit"
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-900 transition flex items-center space-x-1.5 text-xs font-mono font-bold shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#0F2D6B]" />
            <span>Return to Cockpit Radar</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div>
            <h1 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Inbox className="w-5 h-5 text-[#0F2D6B]" />
              <span>Section Controller — Field Demands Desk (Form T/351)</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Review field requisitions, inspect track defect photos, select Pareto profiles, and allocate sanctioned possession blocks.
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Master Reset */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-bold flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span>{pendingCount} Pending Demands</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center space-x-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{activeCount} Active on Track</span>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  'Clear all incoming field demands and reset demands desk state?'
                )
              ) {
                useAppStore.getState().resetToZero();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-mono font-bold text-xs flex items-center space-x-1.5 shadow-2xs transition cursor-pointer"
            title="Reset Demands Desk: Clear pending requisitions and local status"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demands Desk</span>
          </button>
        </div>
      </div>

      {/* Main Demands Management Section */}
      <IncomingDemandsSection />
    </div>
  );
}
