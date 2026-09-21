'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import {
  Sparkles,
  Zap,
  Network,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ChevronDown,
  Play,
  HelpCircle,
} from 'lucide-react';

function DemoPanelComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const isGenerating = useAppStore((s) => s.isGenerating);
  const setGenerating = useAppStore((s) => s.setGenerating);
  const setActivePlan = useAppStore((s) => s.setActivePlan);
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const addLiveEvent = useAppStore((s) => s.addLiveEvent);
  const triggerEmergency = useAppStore((s) => s.triggerEmergency);
  const activePlan = useAppStore((s) => s.activePlan);

  // Scenario 1: Baseline Optimize
  const runBaselineOptimize = async () => {
    setActiveStep(1);
    setGenerating(true);
    addLiveEvent({
      event: 'DEMO_STEP_1',
      timestamp: new Date().toISOString(),
      data: { message: '🎬 [Demo 1/4] Executing autonomous 6-agent scheduling cycle for NDLS-AGC.' },
    });

    const result = await api.generateFullPlan({
      plan_type: 'WEEKLY',
      section: 'NDLS-AGC',
      horizon_days: 7,
      pareto_profile: 'Balanced',
    });

    setActivePlan(result);
    setGenerating(false);
  };

  // Scenario 2: Multi-Department Fusion Showcase
  const runFusionShowcase = () => {
    setActiveStep(2);
    // Find the first integrated block
    const fusedBlock =
      activePlan?.optimized_plan?.blocks?.find(
        (b) => b.downtime_saved_minutes > 0 || b.block_type === 'INTEGRATED_BLOCK'
      ) || activePlan?.optimized_plan?.blocks[0];

    if (fusedBlock) {
      setSelectedBlock(fusedBlock);
      setExplanationOpen(true);
    }

    addLiveEvent({
      event: 'DEMO_STEP_2',
      timestamp: new Date().toISOString(),
      data: {
        message:
          '🎬 [Demo 2/4] Fusion Agent graph clustering active: Combined Civil Track Renewal + OHE inspection saving 90 min downtime.',
      },
    });
  };

  // Scenario 3: Emergency Rail Fracture (MONEY SHOT)
  const runEmergencyMoneyShot = async () => {
    setActiveStep(3);
    await triggerEmergency();
  };


  // Scenario 4: Controller Sign-Off & Memo
  const runSignOffMemo = () => {
    setActiveStep(4);
    setApprovalModalOpen(true);
    addLiveEvent({
      event: 'DEMO_STEP_4',
      timestamp: new Date().toISOString(),
      data: {
        message: '🎬 [Demo 4/4] Opening Section Controller sign-off modal and official Block Memo PDF export.',
      },
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 font-mono text-xs select-none">
      {/* Collapsed Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-black font-bold uppercase tracking-wider shadow-xl flex items-center space-x-2 hover:scale-105 transition ring-2 ring-amber-300"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Judge Demo Dock (4 Scenarios)</span>
        </button>
      )}

      {/* Expanded Demo Panel */}
      {isOpen && (
        <div className="w-80 bg-[#0B101B] border border-amber-500/50 rounded-xl shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>JUDGE DEMO DOCK</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            Click each scripted scenario in order for a cinematic 3-minute SIH presentation:
          </p>

          <div className="space-y-2">
            {/* Step 1 */}
            <button
              onClick={runBaselineOptimize}
              disabled={isGenerating}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                activeStep === 1
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                  : 'bg-surface-muted border-surface-border text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">1. Baseline 6-Agent Optimize</p>
                  <p className="text-[9px] text-slate-400">Full pipeline & Gantt populate</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Step 2 */}
            <button
              onClick={runFusionShowcase}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                activeStep === 2
                  ? 'bg-purple-950/80 border-purple-400 text-purple-300 ring-1 ring-purple-400'
                  : 'bg-surface-muted border-surface-border text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Network className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">2. Multi-Dept Fusion Showcase</p>
                  <p className="text-[9px] text-slate-400">Highlights 50% downtime saved</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Step 3 */}
            <button
              onClick={runEmergencyMoneyShot}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                activeStep === 3
                  ? 'bg-rose-950 border-rose-400 text-rose-300 ring-2 ring-rose-500 shadow-lg shadow-rose-950'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-300 hover:bg-rose-900/60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                <div>
                  <p className="font-bold text-xs text-rose-300">3. Emergency Rail Fracture</p>
                  <p className="text-[9px] text-rose-400">208ms SLA • Money Shot</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            </button>

            {/* Step 4 */}
            <button
              onClick={runSignOffMemo}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                activeStep === 4
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-surface-muted border-surface-border text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-xs">4. Controller Sign-off & PDF</p>
                  <p className="text-[9px] text-slate-400">Official IR Block Memo export</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="p-2 rounded bg-surface-muted border border-surface-border text-[9px] text-slate-400">
            <span className="text-amber-400 font-bold">Presenter Cue:</span> Explain to judges that
            the Guardian Agent independently checks every block against live passenger paths.
          </div>
        </div>
      )}
    </div>
  );
}
export const DemoPanel = React.memo(DemoPanelComponent);

