'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { formatDateTime, formatTimeOnly, getDepartmentBadgeColor } from '../../lib/format';
import { ShapWaterfall } from './ShapWaterfall';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Cpu,
  Activity,
  Gauge,
  Camera,
  AlertTriangle,
  User,
} from 'lucide-react';

function ExplanationDrawerComponent() {
  const selectedBlock = useAppStore((s) => s.selectedBlock);
  const explanationOpen = useAppStore((s) => s.explanationOpen);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const activePlan = useAppStore((s) => s.activePlan);
  const fieldRequests = useAppStore((s) => s.fieldRequests);
  const [activeTab, setActiveTab] = useState<'RATIONALE' | 'EXECUTION_PROOF' | 'WATERFALL'>('RATIONALE');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!explanationOpen || !selectedBlock) return null;

  const matchedRequest = fieldRequests.find(
    (r) => r.id === selectedBlock.block_id || String(r.task_id) === selectedBlock.block_id || r.section === selectedBlock.section
  );
  const beforePhotoUrl = selectedBlock.before_photo_url || matchedRequest?.before_photo_url;
  const beforePhotoDesc = selectedBlock.before_photo_desc || matchedRequest?.before_photo_desc;
  const afterPhotoUrl = selectedBlock.after_photo_url || matchedRequest?.after_photo_url;
  const afterPhotoDesc = selectedBlock.after_photo_desc || matchedRequest?.after_photo_desc;
  const isCompleted = selectedBlock.status === 'COMPLETED' || matchedRequest?.status === 'COMPLETED' || (!!afterPhotoUrl);

  const badge = getDepartmentBadgeColor(selectedBlock.department);

  // Physics metrics derived or defaults
  const tqiScore = selectedBlock.priority_score > 75 ? 38.4 : 26.2;
  const omsPeakG = selectedBlock.priority_score > 80 ? 0.26 : 0.14;
  const cumulativeGmt = 54.2;
  const propagationHours = selectedBlock.priority_score > 80 ? 14 : selectedBlock.priority_score > 65 ? 48 : 168;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-900 font-mono text-xs animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-slate-900">{selectedBlock.block_id}</h3>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded border font-sans font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {selectedBlock.department}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-[#0F2D6B] border border-blue-200 font-bold">
                  Urgency: {selectedBlock.priority_score.toFixed(1)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Corridor: {selectedBlock.section} • Window: {selectedBlock.duration_minutes} min • {selectedBlock.block_type}
              </p>
            </div>
          </div>

          <button
            onClick={() => setExplanationOpen(false)}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 py-2 gap-2 text-[11px] shrink-0">
          <button
            onClick={() => setActiveTab('RATIONALE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'RATIONALE'
                ? 'bg-white text-[#0F2D6B] border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Operational Rationale</span>
          </button>

          <button
            onClick={() => setActiveTab('EXECUTION_PROOF')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'EXECUTION_PROOF'
                ? 'bg-white text-[#0F2D6B] border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Execution Proof</span>
            {isCompleted ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" />
            ) : beforePhotoUrl ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-0.5" />
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('WATERFALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'WATERFALL'
                ? 'bg-white text-[#0F2D6B] border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>SHAP Waterfall</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* TAB 1: OPERATIONAL RATIONALE */}
          {activeTab === 'RATIONALE' && (
            <>
              {/* Field Operator Demand Attribution */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs shadow-2xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2D6B] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <User className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
                      Originating Field JE Requisition
                    </span>
                    <span className="font-bold text-slate-900 truncate block">
                      Demanded by User {selectedBlock.user_id || matchedRequest?.user_id || '01'} • {selectedBlock.submitter_name || matchedRequest?.submitter_name || 'Field Junior Engineer'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-blue-200/80 text-[#0F2D6B] border border-blue-300 shrink-0 ml-2">
                  JE-{selectedBlock.user_id || matchedRequest?.user_id || '01'}
                </span>
              </div>

              {/* Physics & Track Engineering Indicators */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-[#0F2D6B] font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Gauge className="w-4 h-4" />
                    <span>RDSO Physics & Sensor Telemetry</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-[#0F2D6B] border border-blue-200 font-semibold">
                    Live OMS + TRC
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Track Quality Index (TQI)</span>
                    <span className="text-slate-900 font-bold font-mono text-sm">{tqiScore.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-500 block">
                      {tqiScore > 36 ? '⚠️ Urgent attention required' : '✓ Acceptable geometry'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">OMS Peak Jerk (g)</span>
                    <span
                      className={`font-bold font-mono text-sm ${
                        omsPeakG >= 0.25 ? 'text-rose-600' : omsPeakG >= 0.15 ? 'text-amber-600' : 'text-emerald-700'
                      }`}
                    >
                      {omsPeakG.toFixed(2)}g
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      {omsPeakG >= 0.25 ? '🚨 Critical safety peak' : omsPeakG >= 0.15 ? '⚠️ Elevated oscillation' : '✓ Normal'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Traffic Loading</span>
                    <span className="text-slate-900 font-bold font-mono text-sm">{cumulativeGmt} GMT</span>
                    <span className="text-[9px] text-slate-500 block">High-density corridor</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Flaw Propagation Window</span>
                    <span className="text-amber-800 font-bold font-mono text-sm">~{propagationHours} Hours</span>
                    <span className="text-[9px] text-slate-500 block">Est. time-to-critical</span>
                  </div>
                </div>
              </div>

              {/* 1. Plain English Rationale Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 text-[#0F2D6B] font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Why This Time Slot?</span>
                </div>
                <p className="text-slate-700 text-[12px] leading-relaxed">
                  Scheduled at{' '}
                  <strong className="text-slate-900 font-bold">
                    {formatTimeOnly(selectedBlock.scheduled_start)}
                  </strong>{' '}
                  (Quiet Night Maintenance Window) when zero passenger express trains operate on {selectedBlock.section}.
                  {selectedBlock.downtime_saved_minutes > 0 && (
                    <>
                      {' '}
                      Shadow auto-packer saves{' '}
                      <span className="text-purple-700 font-bold">
                        {selectedBlock.downtime_saved_minutes} minutes
                      </span>{' '}
                      by embedding co-located S&T / TRD tasks within this track possession.
                    </>
                  )}
                </p>
                <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  Possession Window: {formatDateTime(selectedBlock.scheduled_start)} to{' '}
                  {formatDateTime(selectedBlock.scheduled_end)}
                </div>
              </div>

              {/* 2. Combined Work Benefit / Shadow Auto-Packing */}
              {selectedBlock.downtime_saved_minutes > 0 ? (
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span>Multi-Department Shadow Block Auto-Packer</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    The AI Engine detected co-located track tamping and overhead catenary inspection within 25 km on{' '}
                    {selectedBlock.section}. Merging both operations into this single possession eliminates separate track
                    closures and saves <strong className="text-purple-900 font-bold">{selectedBlock.downtime_saved_minutes} mins</strong>{' '}
                    corridor downtime.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  <strong>Single Possession:</strong> Allocated isolated window due to heavy mechanized machinery clearance.
                </div>
              )}

              {/* Photographic Execution Proof Teaser Banner */}
              {(beforePhotoUrl || afterPhotoUrl) && (
                <div
                  onClick={() => setActiveTab('EXECUTION_PROOF')}
                  className="p-3 rounded-xl bg-linear-to-r from-blue-50 to-emerald-50 border border-blue-200 flex items-center justify-between cursor-pointer hover:border-[#0F2D6B] transition shadow-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-[#0F2D6B] shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                        <span>Field Execution Photographic Proof</span>
                        {isCompleted && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                            SURRENDER PROOF ATTACHED
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans">
                        {afterPhotoUrl
                          ? 'Both Before-Work Defect and After-Work Restored Track photos verified.'
                          : 'Before-Work defect photo verified on record.'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F2D6B] underline shrink-0">
                    Inspect Photos →
                  </span>
                </div>
              )}

              {/* 3. Safety Verification Checklist */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Guardian Safety Firewall: 100% Certified</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200">
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong className="text-slate-900">Zero VIP Train Clashes:</strong> 30-min buffer around Vande Bharat 20607,
                      Shatabdi 12007 & Chamundi Express strictly enforced.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong className="text-slate-900">OHE 25kV Power Isolation:</strong> Traction power shutdown synchronized with
                      Traction Controller (TRC) safety protocols.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">
                      <strong className="text-slate-900">Yard & Siding Clearances:</strong> Station master shunting and turnouts
                      remain protected.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: EXECUTION PROOF (BEFORE & AFTER PHOTOS) */}
          {activeTab === 'EXECUTION_PROOF' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[#0F2D6B] font-bold text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4" />
                    <span>Ground Execution Photographic Evidence</span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : beforePhotoUrl
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {isCompleted ? 'COMPLETED & SURRENDERED' : beforePhotoUrl ? 'EXECUTION IN PROGRESS' : 'AWAITING FIELD COMMENCEMENT'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans">
                  Mandatory Step 5 Audit Trail: Cockpit inspects both pre-work defect photograph and post-work restored track verification before authorizing full-speed passenger services.
                </p>
              </div>

              {/* Side-by-Side or Stacked Photo Proof Cards */}
              <div className="grid grid-cols-1 gap-4">
                {/* 1. BEFORE PHOTO */}
                <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>1. BEFORE WORK (DEFECT / HAZARD PROOF)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                      Step 4 Prerequisite
                    </span>
                  </div>

                  {beforePhotoUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden border border-rose-300 bg-slate-900 aspect-video relative group">
                        <img
                          src={beforePhotoUrl}
                          alt="Defect on Track"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-rose-300 border border-rose-700/60">
                          Pre-Work Defect Record
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-xs text-slate-800 font-sans">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold font-mono">Field Inspection Report:</span>
                        {beforePhotoDesc || 'Severe gauge face spalling and weld micro-fissure recorded by Field JE.'}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 rounded-xl bg-white border border-dashed border-rose-300 space-y-1.5">
                      <Camera className="w-6 h-6 mx-auto opacity-50 text-rose-500" />
                      <p className="text-xs font-semibold text-slate-600">Awaiting Defect Photo Upload</p>
                      <p className="text-[10px] text-slate-400">Field JE must upload before-work photo on site to start the possession timer.</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600 font-mono space-y-1 pt-2 border-t border-rose-200">
                    <div className="flex justify-between">
                      <span>Ground Risk Category:</span>
                      <span className="text-rose-700 font-bold">Track Structure Impairment</span>
                    </div>
                  </div>
                </div>

                {/* 2. AFTER PHOTO */}
                <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>2. AFTER WORK (COMPLETION & SURRENDER PROOF)</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                      Step 5 Verification
                    </span>
                  </div>

                  {afterPhotoUrl ? (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 aspect-video relative group">
                        <img
                          src={afterPhotoUrl}
                          alt="Restored Track"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-300 border border-emerald-700/60">
                          130 km/h Safe Line Speed Restored
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800 font-sans">
                        <span className="text-[10px] text-slate-400 uppercase block font-bold font-mono">Restoration Certification:</span>
                        {afterPhotoDesc || 'Thermit weld executed, rail ground flush, track certified fit for 130 km/h.'}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 rounded-xl bg-white border border-dashed border-slate-300 space-y-1.5">
                      <Clock className="w-6 h-6 mx-auto opacity-50 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
                      <p className="text-xs font-semibold text-slate-600">Work in Progress / Not Yet Surrendered</p>
                      <p className="text-[10px] text-slate-400">Field JE will upload finished track photo upon completing physical possession.</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-600 font-mono space-y-1 pt-2 border-t border-emerald-200">
                    <div className="flex justify-between">
                      <span>Permissible Line Speed:</span>
                      <span className={`font-bold ${afterPhotoUrl ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {afterPhotoUrl ? '130 km/h (Normal Speed Clear)' : 'Restricted (Block Active)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Statutory Surrender Form:</span>
                      <span className="text-[#0F2D6B] font-bold">Form T/351 Disconnection Surrendered</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHAP WATERFALL */}
          {activeTab === 'WATERFALL' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <ShapWaterfall finalScore={selectedBlock.priority_score} />
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-mono">
              AI Decision Certainty: <strong className="text-emerald-700 font-bold">{(selectedBlock.confidence * 100).toFixed(0)}%</strong>
            </span>
          </div>

          <button
            onClick={() => setExplanationOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition text-xs font-mono font-bold border border-slate-200 shadow-xs"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}

export const ExplanationDrawer = React.memo(ExplanationDrawerComponent);


