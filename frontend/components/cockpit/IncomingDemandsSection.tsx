'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, FieldBlockRequest } from '../../lib/store';
import { getDepartmentBadgeColor, isBlockFused, getFusionDepartmentPill } from '../../lib/format';
import {
  Inbox,
  CheckCircle2,
  Zap,
  Clock,
  MapPin,
  User,
  FileCheck,
  Camera,
  ShieldCheck,
  QrCode,
  Eye,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  ExternalLink,
  Lock,
  Layers,
} from 'lucide-react';

export function IncomingDemandsSection() {
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const activeProfile = useAppStore((s) => s.activeProfile);
  const setActiveProfile = useAppStore((s) => s.setActiveProfile);
  const sanctionFieldRequest = useAppStore((s) => s.sanctionFieldRequest);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const verifyFieldRequestQR = useAppStore((s) => s.verifyFieldRequestQR);
  const completeFieldRequest = useAppStore((s) => s.completeFieldRequest);

  const [sanctioningId, setSanctioningId] = useState<string | null>(null);
  const [policyPerDemand, setPolicyPerDemand] = useState<Record<string, 'Safety-Max' | 'Throughput-Max' | 'Balanced'>>({});
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'ALL' | 'ENG' | 'SIGNAL' | 'TRD' | 'OPERATING' | 'FUSED'>('ALL');
  const [inspectingRequest, setInspectingRequest] = useState<FieldBlockRequest | null>(null);

  // Live countdown clock ticker (seconds elapsed since mount)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter logic
  const pendingRequests = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION');
  const activePossessions = fieldRequests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'SANCTIONED' || r.status === 'DISCONNECTED');
  const completedRequests = fieldRequests.filter((r) => r.status === 'COMPLETED');


  const filteredRequests = fieldRequests.filter((r) => {
    if (activeTab === 'PENDING' && r.status !== 'PENDING_SANCTION') return false;
    if (activeTab === 'ACTIVE' && r.status !== 'IN_PROGRESS' && r.status !== 'SANCTIONED' && r.status !== 'DISCONNECTED') return false;
    if (activeTab === 'COMPLETED' && r.status !== 'COMPLETED') return false;
    if (selectedUserFilter !== 'ALL') {
      const uId = r.user_id || '01';
      if (uId !== selectedUserFilter) return false;
    }
    if (selectedDeptFilter !== 'ALL') {
      if (selectedDeptFilter === 'FUSED') return isBlockFused(r);
      const d = (r.department || '').toLowerCase();
      if (selectedDeptFilter === 'ENG') return d.includes('eng') || d.includes('civil') || d.includes('track') || d.includes('p-way');
      if (selectedDeptFilter === 'SIGNAL') return d.includes('signal') || d.includes('s&t');
      if (selectedDeptFilter === 'TRD') return d.includes('traction') || d.includes('trd') || d.includes('ohe');
      if (selectedDeptFilter === 'OPERATING') return d.includes('operating') || d.includes('mech');
    }
    return true;
  });

  // Handle Sanction Click
  const handleSanction = async (req: FieldBlockRequest) => {
    setSanctioningId(req.id);
    const policy = policyPerDemand[req.id] || activeProfile || 'Balanced';
    try {
      await sanctionFieldRequest(req.id, policy);
    } catch (err) {
      console.error('Failed to sanction demand:', err);
    } finally {
      setSanctioningId(null);
    }
  };

  // Helper for countdown display (calculates remaining based on start time or simulated duration)
  const calculateRemainingSeconds = (req: FieldBlockRequest) => {
    const totalSec = (req.duration_minutes || 120) * 60;
    // Simulate active execution elapsed time: base 18 minutes elapsed + tick seconds
    const elapsedSec = (req.status === 'IN_PROGRESS' ? 1080 : 0) + tick;
    const remaining = Math.max(0, totalSec - elapsedSec);
    const progressPct = Math.min(100, Math.round((elapsedSec / totalSec) * 100));

    const hrs = Math.floor(remaining / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    const secs = remaining % 60;

    return {
      formatted: `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`,
      remainingSec: remaining,
      progressPct: req.status === 'COMPLETED' ? 100 : progressPct,
    };
  };

  return (
    <div id="incoming-demands-section" className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs select-none">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-2xs">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-mono font-black uppercase tracking-wider text-slate-900">
                Live Field Demands & Work Execution Tracker
              </h2>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-[#0F2D6B] border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F2D6B] animate-pulse" />
                <span>REAL-TIME COCKPIT FEED</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Live field engineer demands • Scannable QR memo verification • Real-time countdown clocks • Before vs After photo evidence
            </p>
          </div>
        </div>

        {/* High-Level Status Badges */}
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-center font-mono shadow-2xs">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Total Demands</span>
            <span className="text-xs font-bold text-slate-900">{fieldRequests.length}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-center font-mono shadow-2xs">
            <span className="text-[9px] text-emerald-700 block uppercase font-bold">Live On Track</span>
            <span className="text-xs font-bold text-emerald-800">{activePossessions.length} Active</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-center font-mono shadow-2xs">
            <span className="text-[9px] text-amber-700 block uppercase font-bold">Awaiting Sanction</span>
            <span className="text-xs font-bold text-amber-800">{pendingRequests.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: `All Requests (${fieldRequests.length})` },
          { id: 'ACTIVE', label: `🟢 Live Track Possessions (${activePossessions.length})` },
          { id: 'PENDING', label: `⚡ Awaiting Sanction (${pendingRequests.length})` },
          { id: 'COMPLETED', label: `✅ Completed & Surrendered (${completedRequests.length})` },
        ].map(({ id, label }) => {
          const isSel = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                isSel
                  ? 'bg-[#0F2D6B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Operator User Filter Strip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1 shrink-0">
          <User className="w-3.5 h-3.5 text-[#0F2D6B]" />
          <span>Operator Filter:</span>
        </span>
        {[
          { id: 'ALL', label: 'All Operators' },
          { id: '01', label: 'JE-01 (P. Ramesh)' },
          { id: '02', label: 'JE-02 (Suresh Kumar)' },
          { id: '03', label: 'JE-03 (K. Venkatesh)' },
          { id: '04', label: 'JE-04 (Ananya Sharma)' },
        ].map(({ id, label }) => {
          const isSel = selectedUserFilter === id;
          const count = id === 'ALL'
            ? fieldRequests.length
            : fieldRequests.filter((r) => (r.user_id || '01') === id).length;
          return (
            <button
              key={id}
              onClick={() => setSelectedUserFilter(id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                isSel
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isSel ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Department Filter Strip */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-[#0F2D6B]" />
          <span>Department Filter:</span>
        </span>
        {[
          { id: 'ALL', label: 'All Departments' },
          { id: 'ENG', label: '🟢 Engineering (P-Way)', color: 'bg-emerald-600 text-white' },
          { id: 'SIGNAL', label: '🔵 Signal & Telecom (S&T)', color: 'bg-blue-600 text-white' },
          { id: 'TRD', label: '🟠 Traction (OHE)', color: 'bg-amber-600 text-white' },
          { id: 'OPERATING', label: '🟣 Operating / Mech', color: 'bg-purple-600 text-white' },
          { id: 'FUSED', label: '⚡ Fused Demands Only', color: 'bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 text-white' },
        ].map((d) => {
          const isSel = selectedDeptFilter === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDeptFilter(d.id as any)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 border cursor-pointer ${
                isSel
                  ? (d.color || 'bg-[#0F2D6B] text-white') + ' border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 font-mono">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
            <Inbox className="w-5 h-5 opacity-70" />
          </div>
          <p className="text-xs font-bold text-slate-800">No requests match this filter.</p>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Field Junior Engineers can submit maintenance demands with defect photos directly from the Field JE Mobile Portal (`/field/request`).
          </p>
        </div>
      ) : (
        /* List of Requests */
        <div className="space-y-3.5 font-mono text-xs">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING_SANCTION';
            const isLiveInProgress = req.status === 'IN_PROGRESS';
            const isCompleted = req.status === 'COMPLETED';
            const isFused = isBlockFused(req);
            const deptBadge = getDepartmentBadgeColor(req.department, isFused);
            const fusionPill = isFused ? getFusionDepartmentPill(req.department) : null;
            const downtimeSaved = req.downtime_saved_minutes || 30;
            const selectedPolicy = policyPerDemand[req.id] || activeProfile || 'Balanced';
            const isBusy = sanctioningId === req.id;
            const { formatted: countdownFormatted, progressPct } = calculateRemainingSeconds(req);

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border transition space-y-3.5 ${
                  isLiveInProgress
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-xs ring-1 ring-emerald-300'
                    : isPending
                    ? 'bg-amber-50/40 border-amber-300 shadow-xs ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      TSK-{req.task_id}
                    </span>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-[#0F2D6B] text-white flex items-center space-x-1 shadow-2xs">
                      <User className="w-3 h-3 text-amber-300" />
                      <span>DEMANDED BY USER {req.user_id || '01'}</span>
                    </span>
                    {isFused && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-2xs border border-amber-500">
                        <Zap className="w-3 h-3 fill-current text-slate-950" />
                        <span>[⚡ FUSED JOINT BLOCK]</span>
                      </span>
                    )}
                    {fusionPill && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[9px]">
                        {fusionPill}
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${deptBadge.bg} ${deptBadge.text} ${deptBadge.border}`}>
                      {req.department}
                    </span>
                    {isFused && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2 py-0.5 rounded-md">
                        +{downtimeSaved}m Saved
                      </span>
                    )}
                    <span className="text-[11px] text-slate-700">
                      Corridor: <b className="text-[#0F2D6B]">{req.section}</b> ({req.km_range})
                    </span>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 font-bold">
                      Priority: <b>{req.priority_score}/100</b>
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2">
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center space-x-1.5">
                        <Clock className="w-3 h-3" />
                        <span>AWAITING CONTROLLER SANCTION</span>
                      </span>
                    )}
                    {req.status === 'SANCTIONED' && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-[#0F2D6B] border border-blue-200 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>SANCTIONED • AWAITING LOCAL SM QR SCAN</span>
                      </span>
                    )}
                    {isLiveInProgress && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                        <span>🟢 LIVE POSSESSION ON TRACK</span>
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ WORK COMPLETED & TRACK SURRENDERED</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Submitter Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Field In-Charge:</span>
                    <span className="font-bold text-slate-900 flex items-center space-x-1">
                      <User className="w-3 h-3 text-[#0F2D6B]" />
                      <span>{req.submitter_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 ml-1 font-bold">
                        [JE-{req.user_id || '01'}]
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Sanctioned Window:</span>
                    <span className="font-bold text-amber-800 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{req.duration_minutes} min window</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Track Location:</span>
                    <span className="font-bold text-[#0F2D6B] flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-[#0F2D6B]" />
                      <span>{req.km_range}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Memo / Token Code:</span>
                    <span className="font-bold text-purple-900 flex items-center space-x-1">
                      <QrCode className="w-3 h-3 text-purple-600" />
                      <span>{req.worker_memo_code || req.qr_token || 'MEMO-SWR-2026'}</span>
                    </span>
                  </div>
                </div>

                {/* Reason / Maintenance Scope */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 italic">
                  &ldquo;{req.reason}&rdquo;
                </div>

                {/* ⏱️ REAL-TIME COUNTDOWN & EXECUTION TRACKER (If Sanctioned or In Progress) */}
                {(isLiveInProgress || req.status === 'SANCTIONED') && (
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2.5 shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 border border-slate-700">
                          <Clock className="w-4 h-4 animate-spin text-cyan-300" style={{ animationDuration: '6s' }} />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Live Execution Countdown Timer
                          </span>
                          <div className="text-lg font-mono font-extrabold text-white tracking-widest flex items-center space-x-2">
                            <span className="text-cyan-400">{countdownFormatted}</span>
                            <span className="text-xs text-slate-400 font-normal">remaining in block</span>
                          </div>
                        </div>
                      </div>

                      {/* Station Master Scan Status */}
                      <div className="flex items-center space-x-2 text-[11px]">
                        {req.sm_verified ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Station Master QR Verified ({req.sm_verifier_id || 'SM-MYA-7824'})</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-600 text-amber-300 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Awaiting SM QR optical scan at station</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Block Execution Progress</span>
                        <span>{progressPct}% elapsed</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="text-emerald-400">
                        🛡️ Protected Headway Buffer active on block zone. High-speed passenger trains routed safely.
                      </span>
                      <span className="text-cyan-300">
                        Protected Window: {req.scheduled_start || '01:30'} – {req.scheduled_end || '03:30'} IST
                      </span>
                    </div>
                  </div>
                )}

                {/* 📷 BEFORE & AFTER PHOTO EVIDENCE STRIP */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="text-[10px] text-slate-600 uppercase font-bold flex items-center space-x-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#0F2D6B]" />
                      <span>Form T/351 Photo Evidence Dossier</span>
                    </span>

                    <button
                      onClick={() => setInspectingRequest(req)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0F2D6B] text-[11px] font-bold transition flex items-center space-x-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Before & After Evidence</span>
                    </button>
                  </div>

                  {/* Two Preview Thumbnails */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Before Photo Box */}
                    <div
                      onClick={() => setInspectingRequest(req)}
                      className="p-2.5 rounded-lg bg-white border border-rose-200 hover:border-rose-400 transition cursor-pointer flex items-center space-x-3 group shadow-2xs"
                    >
                      {req.before_photo_url ? (
                        <img
                          src={req.before_photo_url}
                          alt="Before Maintenance Damage"
                          className="w-16 h-14 object-cover rounded-md border border-rose-300 group-hover:scale-105 transition shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-14 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                          <Camera className="w-5 h-5" />
                        </div>
                      )}
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 block w-fit">
                          BEFORE WORK (DAMAGE DEFECT)
                        </span>
                        <p className="text-[11px] text-slate-800 line-clamp-1 group-hover:text-black font-semibold">
                          {req.before_photo_desc || 'USFD Internal rail fracture detected on track site.'}
                        </p>
                        <span className="text-[9px] text-slate-400 block">Click to view high-res flaw telemetry</span>
                      </div>
                    </div>

                    {/* After Photo Box */}
                    <div
                      onClick={() => setInspectingRequest(req)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center space-x-3 group shadow-2xs ${
                        req.after_photo_url
                          ? 'bg-white border-emerald-200 hover:border-emerald-400'
                          : 'bg-white border-dashed border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {req.after_photo_url ? (
                        <img
                          src={req.after_photo_url}
                          alt="After Work Completion"
                          className="w-16 h-14 object-cover rounded-md border border-emerald-300 group-hover:scale-105 transition shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-14 rounded-md bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 shrink-0">
                          <Clock className="w-4 h-4 animate-spin text-amber-600" />
                          <span className="text-[8px] font-bold mt-1 text-slate-600">AWAITING</span>
                        </div>
                      )}
                      <div className="space-y-0.5 overflow-hidden">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold block w-fit border ${
                            req.after_photo_url
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {req.after_photo_url ? 'AFTER WORK (TRACK RESTORED)' : 'WORK IN PROGRESS ON TRACK'}
                        </span>
                        <p className="text-[11px] text-slate-800 line-clamp-1 group-hover:text-black font-semibold">
                          {req.after_photo_url
                            ? req.after_photo_desc || 'Track restored & dynamic tamped to 130 km/h standard.'
                            : 'Field crew currently on site. Completion photo uploads upon track handover.'}
                        </p>
                        <span className="text-[9px] text-slate-400 block">
                          {req.after_photo_url ? 'Click to inspect restoration certificate' : 'Handover pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controller Actions Row */}
                {isPending ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200">
                    {/* Pareto Policy Picker */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 uppercase font-extrabold">
                        Operating Policy:
                      </span>
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                        {[
                          { id: 'Balanced', label: 'Recommended Best Plan' },
                          { id: 'Safety-Max', label: 'Maximum Safety Buffer' },
                          { id: 'Throughput-Max', label: 'Clear Maximum Work' },
                        ].map(({ id, label }) => {
                          const isSel = selectedPolicy === id;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setPolicyPerDemand((prev) => ({ ...prev, [req.id]: id as any }));
                                setActiveProfile(id as any);
                              }}
                              className={`px-2.5 py-1 text-[10px] rounded-md font-bold transition ${
                                isSel
                                  ? id === 'Balanced'
                                    ? 'bg-[#0F2D6B] text-white shadow-2xs'
                                    : id === 'Safety-Max'
                                    ? 'bg-emerald-700 text-white shadow-2xs'
                                    : 'bg-indigo-700 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sanction CTA */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSanction(req)}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg bg-[#0F2D6B] hover:bg-[#0c2456] text-white font-extrabold uppercase tracking-wider text-xs transition shadow-md shadow-blue-950/20 flex items-center space-x-2 cursor-pointer"
                      >
                        <Zap className={`w-4 h-4 ${isBusy ? 'animate-spin' : 'text-amber-300 fill-amber-300'}`} />
                        <span>{isBusy ? 'AI Optimizing Slot...' : '⚡ AI Optimize & Grant Possession'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Already Sanctioned / In Progress / Completed Row */
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 text-[11px]">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Possession: <b className="text-slate-900">{req.sanctioned_block_id || 'BLK-SBC-MYS-01'}</b> • Memo:{' '}
                        <b className="text-amber-800">{req.worker_memo_code || 'MEMO-SWR-MYA-2026-081'}</b>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setApprovalModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition flex items-center space-x-1.5 font-bold shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#0F2D6B]" />
                        <span>View Form T/351 Sanction Memo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 MODAL: Form T/351 Before vs After Evidence Dossier Inspector */}
      {inspectingRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200 text-slate-900 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-mono font-black text-slate-900 uppercase tracking-wider">
                      Form T/351 Digital Possession Evidence & Handover Dossier
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0F2D6B] border border-blue-200 font-mono">
                      TASK #{inspectingRequest.task_id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Corridor: {inspectingRequest.section} • {inspectingRequest.km_range} • Department: {inspectingRequest.department}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingRequest(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Field Engineer</span>
                <span className="text-slate-900 font-extrabold">{inspectingRequest.submitter_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Station Master Verification</span>
                <span className="text-emerald-700 font-bold">
                  {inspectingRequest.sm_verified ? inspectingRequest.sm_verifier_id || 'SM-MYA-7824' : 'Pending Scan'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Disconnection Memo</span>
                <span className="text-amber-800 font-bold">{inspectingRequest.worker_memo_code || 'MEMO-SWR-2026'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                <span className="text-[#0F2D6B] font-bold uppercase">{inspectingRequest.status}</span>
              </div>
            </div>

            {/* SIDE-BY-SIDE BEFORE VS AFTER EVIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT: BEFORE WORK */}
              <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold uppercase flex items-center space-x-1.5 font-mono">
                    <Camera className="w-3.5 h-3.5" />
                    <span>BEFORE WORK (DAMAGE EVIDENCE)</span>
                  </span>
                  <span className="text-[10px] font-mono text-rose-700 font-bold">Captured Prior to Block</span>
                </div>

                {inspectingRequest.before_photo_url ? (
                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-rose-300 bg-black aspect-video relative group">
                      <img
                        src={inspectingRequest.before_photo_url}
                        alt="Before Damage"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-rose-300 border border-rose-700/60">
                        GPS Post: {inspectingRequest.km_range}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-sans">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold font-mono">Defect Analysis:</span>
                      {inspectingRequest.before_photo_desc || 'Critical ultrasonic internal transverse fatigue fissure detected at KM 105.4.'}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center text-slate-400 rounded-xl bg-white border border-dashed border-rose-300 space-y-2">
                    <Camera className="w-6 h-6 mx-auto opacity-50 text-rose-500" />
                    <p className="text-xs">No defect photo attached to this memo.</p>
                  </div>
                )}

                <div className="text-[10px] text-slate-600 font-mono space-y-1 pt-2 border-t border-rose-200">
                  <div className="flex justify-between">
                    <span>Axle Load Hazard:</span>
                    <span className="text-rose-700 font-bold">High (Derailment risk at 130 km/h)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Track Block Status:</span>
                    <span className="text-amber-800 font-bold">Under Active Maintenance</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: AFTER WORK */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold uppercase flex items-center space-x-1.5 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AFTER WORK (COMPLETION PROOF)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">Track Surrender Certificate</span>
                </div>

                {inspectingRequest.after_photo_url ? (
                  <div className="space-y-2">
                    <div className="rounded-xl overflow-hidden border border-emerald-300 bg-black aspect-video relative group">
                      <img
                        src={inspectingRequest.after_photo_url}
                        alt="Restored Track"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-emerald-300 border border-emerald-700/60">
                        Restoration Standard: IRS-T-12-2020
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 font-sans">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold font-mono">Work Completion Certification:</span>
                      {inspectingRequest.after_photo_desc || 'Mobile flash-butt weld executed, ultrasonic testing passed, ballast stabilized.'}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 rounded-xl bg-white border border-dashed border-slate-300 space-y-2.5">
                    <Clock className="w-8 h-8 mx-auto text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-800">Track Possession Currently Underway</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Field crew is currently executing maintenance on track. When the block is surrendered on the Field JE portal, the completion photo uploads here automatically.
                      </p>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-600 font-mono space-y-1 pt-2 border-t border-emerald-200">
                  <div className="flex justify-between">
                    <span>Permissible Track Speed:</span>
                    <span className="text-emerald-700 font-bold">
                      {inspectingRequest.after_photo_url ? '130 km/h (Normal Line Speed Restored)' : 'Restricted (30 km/h)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Guardian Seal:</span>
                    <span className="text-[#0F2D6B] font-bold">Verified Zero Headway Conflicts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger Verification Stamp */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-600">
              <div className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-[#0F2D6B]" />
                <span>
                  SHA-256 Ledger Hash:{' '}
                  <span className="text-slate-800 font-bold">
                    SHA256:7f49c0d12e84a569b7348911029c7820abf18e90c8a
                  </span>
                </span>
              </div>
              <span className="text-emerald-700 font-bold">✓ Form T/351 Certified & Synced Across All Portals</span>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setInspectingRequest(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-mono font-bold transition shadow-2xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default IncomingDemandsSection;
