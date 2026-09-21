'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../lib/store';
import { KpiStrip } from '../../components/cockpit/KpiStrip';
import { ActionToolbar } from '../../components/cockpit/ActionToolbar';
import { LiveAlertFeed } from '../../components/cockpit/LiveAlertFeed';
import { GroundEmergencyAlerts } from '../../components/cockpit/GroundEmergencyAlerts';
import { DigitalTwinMap } from '../../components/twin/DigitalTwinMap';
import { SectionDrawer } from '../../components/twin/SectionDrawer';
import { BlockGantt } from '../../components/gantt/BlockGantt';
import { formatTimeOnly, getDepartmentBadgeColor, isBlockFused, getFusionDepartmentPill } from '../../lib/format';
import { AgentStatusPanel } from '../../components/cockpit/AgentStatusPanel';
import {
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Info,
  Clock,
  Zap,
  Inbox,
  Radio,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export default function CockpitPage() {
  const selectedBlock = useAppStore((s) => s.selectedBlock);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const selectedSection = useAppStore((s) => s.selectedSection);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingDemandsCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;

  const [mapOpen, setMapOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');

  React.useEffect(() => {
    useAppStore.getState().fetchInitialState();
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isSelectedFused = selectedBlock ? isBlockFused(selectedBlock) : false;
  const blockBadge = selectedBlock ? getDepartmentBadgeColor(selectedBlock.department, isSelectedFused) : null;
  const fusionPill = isSelectedFused && selectedBlock ? getFusionDepartmentPill(selectedBlock.department) : null;

  return (
    <div className="space-y-4 select-none">
      {/* Top Mission Control Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200/80 text-[#0F2D6B] flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-[#0F2D6B] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                SWR Mission Control Cockpit
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0F2D6B] border border-blue-200 font-bold">
                CORRIDOR: {selectedSection}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Bengaluru City (SBC) — Mysuru (MYS) Dual-Track Mainline • 138.2 RKM
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* 6 AI Agents Online Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>6 Cognitive Agents Online</span>
          </div>

          {/* Live IST Operating Clock */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span suppressHydrationWarning>{liveTime || 'LIVE IST'}</span>
            <span className="text-[9px] text-slate-400">IST</span>
          </div>
        </div>
      </div>

      {/* 1. Top 4-Metric Clean KPI Strip */}
      <KpiStrip />

      {/* 2. Prominent 3-Step Action Bar */}
      <ActionToolbar />

      {/* 3. Streamlined Field Demands Quick-Access Banner */}
      <Link
        href="/cockpit/requests"
        className="p-4 rounded-xl bg-white border border-blue-200/80 hover:border-[#0F2D6B] text-slate-800 flex flex-wrap items-center justify-between gap-3 transition-all duration-200 shadow-xs hover:shadow-md group cursor-pointer"
      >
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-[#0F2D6B] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5 text-[#0F2D6B]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm">
                Field Maintenance Demands Desk (Form T/351)
              </span>
              {pendingDemandsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold animate-pulse">
                  {pendingDemandsCount} PENDING SANCTION
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold">
                  ALL SANCTIONED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              Review field engineer requisitions, inspect damage photo dossiers, and grant block slots.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#0F2D6B] hover:bg-[#0c2456] active:scale-[0.98] text-white font-bold text-xs shrink-0 transition-all shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none">
          <span>Review Demands & Allocate Blocks</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* 4. Main Operational Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / CENTER (8 cols): Digital Twin Map & Gantt Timeline */}
        <div className="lg:col-span-8 space-y-4">
          {/* Corridor Topology Radar (Collapsible) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F2D6B] animate-pulse" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                  Corridor Topology & Live Traffic Radar
                </h3>
                <span className="text-[10px] font-mono text-slate-500 font-bold">({selectedSection})</span>
              </div>
              <div className="flex items-center space-x-2">
                {mapOpen && (
                  <button
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    className="px-2.5 py-1 text-xs font-mono font-bold text-[#0F2D6B] hover:underline transition flex items-center space-x-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <span>{drawerOpen ? 'Hide Section Telemetry' : 'View Section Telemetry'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${drawerOpen ? 'rotate-90' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => setMapOpen(!mapOpen)}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-[0.98] border border-slate-300 text-xs font-mono font-bold text-slate-700 transition flex items-center space-x-1.5 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <span>{mapOpen ? 'Collapse Map' : 'Expand Radar Map'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${mapOpen ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>

            {mapOpen && (
              <div className="pt-2 animate-in fade-in duration-200 space-y-2">
                <DigitalTwinMap
                  height="240px"
                  onSectionSelect={(sec) => {
                    setSelectedSection(sec);
                    setDrawerOpen(true);
                  }}
                />

                {drawerOpen && (
                  <SectionDrawer
                    sectionCode={selectedSection}
                    onClose={() => setDrawerOpen(false)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Simplified Block Gantt Timeline */}
          <BlockGantt />
        </div>

        {/* RIGHT COLUMN (4 cols): Selected Block Details & Live Feed */}
        <div className="lg:col-span-4 space-y-4">
          {/* Block Possession Inspector Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3.5 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
                Selected Possession Details
              </span>
              {selectedBlock && (
                <span className="text-[11px] text-[#0F2D6B] font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedBlock.duration_minutes} min window
                </span>
              )}
            </div>

            {selectedBlock ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-extrabold text-base text-slate-900">{selectedBlock.block_id}</span>
                    {isSelectedFused && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-2xs border border-amber-500">
                        <Zap className="w-3 h-3 fill-current text-slate-950" />
                        <span>[⚡ FUSED JOINT BLOCK]</span>
                      </span>
                    )}
                    {fusionPill && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[9px]">
                        {fusionPill}
                      </span>
                    )}
                    {blockBadge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-sans font-bold ${blockBadge.bg} ${blockBadge.text} ${blockBadge.border}`}
                      >
                        {selectedBlock.department}
                      </span>
                    )}
                    {isSelectedFused && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold text-[9px] border border-emerald-300">
                        +{selectedBlock.downtime_saved_minutes || 30}m Saved
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Corridor: <span className="text-slate-900 font-bold">{selectedBlock.section}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span>Scheduled Time:</span>
                    <span suppressHydrationWarning className="text-[#0F2D6B] font-bold">
                      {formatTimeOnly(selectedBlock.scheduled_start)} – {formatTimeOnly(selectedBlock.scheduled_end)}
                    </span>
                  </div>
                  {(selectedBlock.downtime_saved_minutes > 0 || isSelectedFused) && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-1 border-t border-slate-200">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Combined Possession Savings:</span>
                      </span>
                      <span className="font-extrabold text-emerald-700">+{selectedBlock.downtime_saved_minutes || 30} min saved</span>
                    </div>
                  )}
                </div>

                {/* Plain-English Explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold">
                    Why was this time selected?
                  </span>
                  <p className="text-xs text-slate-700 italic leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                    "{selectedBlock.reason || 'Scheduled during low-traffic night window without passenger train disruption.'}"
                  </p>
                </div>

                {/* Plain-English Explain Button */}
                <button
                  onClick={() => setExplanationOpen(true)}
                  className="w-full py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-[0.99] border border-blue-200 text-[#0F2D6B] font-bold uppercase transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <Sparkles className="w-4 h-4 text-[#0F2D6B]" />
                  <span>Why This Schedule? (AI Explanation)</span>
                </button>

                {/* Quick Sanction Action */}
                <button
                  onClick={() => setApprovalModalOpen(true)}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold uppercase transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sanction This Possession</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 text-[#0F2D6B] flex items-center justify-center mx-auto">
                  <Layers className="w-5 h-5 opacity-70" />
                </div>
                <p className="font-sans text-xs text-slate-600 font-medium">
                  Select any block on the Gantt timeline to inspect AI reasoning, shadow slots, and digital sanction controls.
                </p>
              </div>
            )}
          </div>

          {/* 6 Specialized AI Agents Operational Telemetry Panel */}
          <AgentStatusPanel />

          {/* Live Incoming Ground Emergency Alerts (Station Master) */}
          <GroundEmergencyAlerts />

          {/* Live Alerts & Telemetry Feed */}
          <LiveAlertFeed />
        </div>
      </div>
    </div>
  );
}
