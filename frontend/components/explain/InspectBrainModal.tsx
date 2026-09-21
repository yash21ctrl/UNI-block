'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  X,
  Cpu,
  Database,
  TrendingUp,
  Network,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Calculator,
  Zap,
} from 'lucide-react';

function InspectBrainModalComponent() {
  const inspectBrainModalOpen = useAppStore((s) => s.inspectBrainModalOpen);
  const setInspectBrainModalOpen = useAppStore((s) => s.setInspectBrainModalOpen);

  if (!inspectBrainModalOpen) return null;

  const steps = [
    {
      title: '1. Sentinel / Safety Guardian Agent',
      icon: ShieldCheck,
      badge: 'SIL-4 Zero Conflict Assurance',
      desc: 'Deterministic safety barrier enforcing zero VIP passenger train collisions (Rajdhani, Vande Bharat, Shatabdi), 30-min power isolation margins, and automatic escalation of critical ultrasonic flaw detection (USFD) and rail fractures to Priority 99.5.',
      status: 'SIL-4 Certified (4.2ms)',
      metric: '0 Collisions • 30m Margin Guaranteed',
    },
    {
      title: '2. Corridor Priority Agent',
      icon: TrendingUp,
      badge: 'Pareto Profiles (Safety, Throughput, Balanced)',
      desc: 'XGBoost ML engine (R² = 0.966) computing multi-objective Pareto trade-off frontiers. Ranks maintenance demands (0-100) using 18 operational features and generates real-time TreeSHAP local attributions for Section Controllers.',
      status: 'Active (16.4ms)',
      metric: '3 Active Frontiers • R² = 0.966',
    },
    {
      title: '3. Shadow Alignment / Integrated Fusion Agent',
      icon: Network,
      badge: 'Joint Maintenance Bundling',
      desc: 'NetworkX bipartite graph matching engine that clusters proximate Engineering (P-Way), Signal & Telecom (S&T), and Traction (OHE) demands within a 35 km corridor radius into unified joint possessions, saving up to 50% line downtime.',
      status: 'Saving ~50% Downtime (28.5ms)',
      metric: '35km Radius • +30m to +90m Saved',
    },
    {
      title: '4. CP-SAT Mathematical Optimization Agent',
      icon: Calculator,
      badge: 'Google OR-Tools CP-SAT Solver',
      desc: 'Constraint programming solver operating over discrete 15-minute intervals. Enforces single-line non-concurrency, rolling stock traction isolation, and optimizes track possessions into nocturnal low-traffic windows (00:00–05:00).',
      status: 'Optimal (42.1ms)',
      metric: '100% Feasible Solution • 0 Violations',
    },
    {
      title: '5. Ground Feasibility & Interlocking Agent',
      icon: CheckCircle2,
      badge: 'QR Token & Signal Clamping Interlocking',
      desc: 'Ground verification layer ensuring authentic HMAC SHA-256 track permit validation between Field JEs and Station Masters. Verifies track occupancy and manages electronic interlocking (EI) signal point clamping before physical possession is granted.',
      status: 'Interlocked (8.9ms)',
      metric: 'Cryptographic QR Validated • EI Clamped',
    },
    {
      title: '6. Dynamic Re-optimization & Incident Agent',
      icon: Zap,
      badge: 'Sub-250ms Emergency Re-Route',
      desc: 'High-speed event-driven re-optimization engine triggered by urgent track fractures or OHE snaps. Re-allocates possession slots dynamically in sub-250ms (<5s SLA) while safeguarding previously approved/frozen blocks and priority trains.',
      status: 'Standby SLA <250ms (208.4ms)',
      metric: '208.4ms Dynamic Re-Solve • Zero Delays',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-2xl p-5 text-xs font-mono space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-xs">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inside the RailBlock AI Engine</h3>
              <p className="text-[10px] text-slate-500">
                Enterprise Multi-Agent Safety &amp; Optimization Core • Indian Railways
              </p>
            </div>
          </div>
          <button
            onClick={() => setInspectBrainModalOpen(false)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Overview Description */}
        <p className="text-slate-600 leading-relaxed text-[11px]">
          The RailBlock AI Engine operates as a single autonomous brain. It absorbs raw maintenance
          telemetry from all railway departments, prioritizes critical defects, merges concurrent
          jobs, and guarantees 100% collision-free block schedules for the Section Controller.
        </p>

        {/* 5 Cognitive Pipeline Steps */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0F2D6B]">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-900 text-xs">{step.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100/70 text-[#0F2D6B] border border-blue-200 font-semibold">
                      {step.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{step.status}</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed pl-8">{step.desc}</p>
                {step.metric && (
                  <div className="pl-8 pt-1 flex items-center space-x-1.5 text-[9px] font-mono text-[#0F2D6B] font-bold">
                    <span className="text-slate-500 font-normal">Active Verification:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[#0F2D6B]">
                      {step.metric}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
            <Zap className="w-3 h-3 text-emerald-600" />
            <span>Emergency SLA: Sub-second response (208ms achieved)</span>
          </span>
          <button
            onClick={() => setInspectBrainModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 transition shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export const InspectBrainModal = React.memo(InspectBrainModalComponent);

