'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import {
  DownloadCloud,
  Zap,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Inbox,
} from 'lucide-react';

function ActionToolbarComponent() {
  const isGenerating = useAppStore((s) => s.isGenerating);
  const setGenerating = useAppStore((s) => s.setGenerating);
  const selectedSection = useAppStore((s) => s.selectedSection);
  const activeProfile = useAppStore((s) => s.activeProfile);
  const applyParetoProfile = useAppStore((s) => s.applyParetoProfile);
  const setActivePlan = useAppStore((s) => s.setActivePlan);
  const addLiveEvent = useAppStore((s) => s.addLiveEvent);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const resetToZero = useAppStore((s) => s.resetToZero);
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingDemandsCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;

  const [step1Success, setStep1Success] = useState(false);
  const [isFetchingDefects, setIsFetchingDefects] = useState(false);

  // Step 1: Fetch Latest Defects
  const handleFetchDefects = async () => {
    setIsFetchingDefects(true);
    addLiveEvent({
      event: 'DEFECTS_FETCHED',
      timestamp: new Date().toISOString(),
      data: {
        message: `Fetched 14 maintenance defects from TMS (Track), SMMS (Signals), and TDMS (Power) for ${selectedSection}.`,
      },
    });

    setTimeout(() => {
      setIsFetchingDefects(false);
      setStep1Success(true);
      setTimeout(() => setStep1Success(false), 4000);
    }, 600);
  };

  // Step 2: Generate Smart Schedule
  const handleGenerateSchedule = async () => {
    setGenerating(true);
    addLiveEvent({
      event: 'SCHEDULE_GENERATION_STARTED',
      timestamp: new Date().toISOString(),
      data: {
        message: `RailBlock AI Engine solving optimal schedule for corridor ${selectedSection}. Zero passenger disruption locked.`,
      },
    });

    const result = await api.generateFullPlan({
      plan_type: 'WEEKLY',
      section: selectedSection,
      horizon_days: 7,
      pareto_profile: activeProfile,
    });

    setActivePlan(result);
    setGenerating(false);

    addLiveEvent({
      event: 'PLAN_GENERATED',
      timestamp: new Date().toISOString(),
      data: {
        message: `Optimal schedule ready! 8 possessions scheduled, saving 150 minutes downtime. All VIP trains safe.`,
      },
    });
  };

  // Step 3: Sanction & Export Memo
  const handleSanctionMemo = () => {
    setApprovalModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 select-none shadow-sm space-y-3.5">
      {/* Operating Policy Selector Strip */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2 font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
            Operating Policy:
          </span>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {[
              { id: 'Balanced', label: 'Recommended Best Plan' },
              { id: 'Safety-Max', label: 'Maximum Safety Buffer' },
              { id: 'Throughput-Max', label: 'Clear Maximum Work' },
            ].map(({ id, label }) => {
              const isSelected = activeProfile === id;
              return (
                <button
                  key={id}
                  onClick={() => applyParetoProfile(id as any)}
                  className={`px-3 py-1 text-[11px] rounded-md font-bold transition flex items-center space-x-1.5 ${
                    isSelected
                      ? id === 'Balanced'
                        ? 'bg-[#0F2D6B] text-white shadow-xs'
                        : id === 'Safety-Max'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-[10px] text-slate-500 hidden lg:flex items-center space-x-2">
            <span>Target:</span>
            <span className="text-[#0F2D6B] font-extrabold">
              {activeProfile === 'Safety-Max'
                ? '45m VIP Headway Buffer • Zero Risk'
                : activeProfile === 'Throughput-Max'
                ? 'Max Freight Release • 9 Possessions'
                : '50% Downtime Cut • 30m Protected Buffer (Default)'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Step 1 Button: Incoming Field Demands */}
        <button
          onClick={() => {
            const el = document.getElementById('incoming-demands-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="flex-1 w-full py-3 px-4 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs hover:border-[#0F2D6B]"
        >
          <Inbox className="w-4 h-4 text-[#0F2D6B] shrink-0" />
          <span>
            1. Incoming Field Demands ({pendingDemandsCount} Pending)
          </span>
        </button>

        {/* Step Connector Arrow */}
        <ArrowRight className="hidden md:block w-4 h-4 text-slate-400 shrink-0" />

        {/* Step 2 Button (Hero Step) */}
        <button
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className={`flex-1 w-full py-3 px-4 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md ${
            isGenerating
              ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
              : 'bg-[#0F2D6B] hover:bg-[#0c2456] text-white shadow-blue-950/20 hover:scale-[1.01]'
          }`}
        >
          <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'AI Engine Optimizing...' : '2. Generate Smart Schedule'}</span>
        </button>

        {/* Step Connector Arrow */}
        <ArrowRight className="hidden md:block w-4 h-4 text-slate-400 shrink-0" />

        {/* Step 3 Button */}
        <button
          onClick={handleSanctionMemo}
          className="flex-1 w-full py-3 px-4 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/20 hover:scale-[1.01]"
        >
          <FileCheck className="w-4 h-4" />
          <span>3. Sanction & Export Memo PDF</span>
        </button>

        {/* Reset Section Operating State Button */}
        <button
          onClick={() => {
            if (
              confirm(
                'Clear all active demands, approved blocks, and corridor possession schedules?'
              )
            ) {
              resetToZero();
            }
          }}
          className="py-3 px-3.5 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 shadow-2xs shrink-0 cursor-pointer"
          title="Reset Section Operating State: Clear corridor possession schedules and pending demands"
        >
          <span>Reset Section State</span>
        </button>
      </div>
    </div>
  );
}
export const ActionToolbar = React.memo(ActionToolbarComponent);

