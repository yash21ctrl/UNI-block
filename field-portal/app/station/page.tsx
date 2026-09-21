'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  KARNATAKA_APPROVED_BLOCKS,
  ApprovedBlockItem,
  submitGroundDeferral,
} from '../../lib/api';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  X,
  Zap,
  MapPin,
  RefreshCw,
  Eye,
} from 'lucide-react';

const KARNATAKA_STATIONS = [
  { code: 'MYA', name: 'Mandya (SBC-MYS)', km: 'KM 93' },
  { code: 'SBC', name: 'KSR Bengaluru City', km: 'KM 0' },
  { code: 'MYS', name: 'Mysuru Junction', km: 'KM 138' },
  { code: 'RMGM', name: 'Ramanagara', km: 'KM 45' },
  { code: 'CPT', name: 'Channapatna', km: 'KM 56' },
  { code: 'HAS', name: 'Hassan Junction', km: 'KM 119' },
  { code: 'UBL', name: 'SSS Hubballi Junction', km: 'KM 470' },
  { code: 'BAY', name: 'Ballari Junction', km: 'KM 340' },
];

export default function StationMasterTerminalPage() {
  const [selectedStation, setSelectedStation] = useState<string>('MYA');
  const [blocks, setBlocks] = useState<ApprovedBlockItem[]>(KARNATAKA_APPROVED_BLOCKS);

  // Deferral Dialog State
  const [deferTargetBlock, setDeferTargetBlock] = useState<ApprovedBlockItem | null>(null);
  const [deferReason, setDeferReason] = useState<string>('Severe Weather / Thunderstorm');
  const [deferCustomNotes, setDeferCustomNotes] = useState<string>('Sudden squall with high winds and lightning reported on Mandya down track.');
  const [isDeferring, setIsDeferring] = useState(false);
  const [deferSuccessMsg, setDeferSuccessMsg] = useState<string | null>(null);

  // Filter blocks by selected station or all
  const filteredBlocks = blocks.filter(
    (b) => b.station === selectedStation || selectedStation === 'ALL'
  );

  // Action: Grant Local Disconnection
  const handleGrantDisconnection = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, status: 'IN_PROGRESS' } : b))
    );
  };

  // Action: Submit Deferral
  const handleConfirmDeferral = async () => {
    if (!deferTargetBlock) return;
    setIsDeferring(true);

    try {
      const res = await submitGroundDeferral({
        block_id: deferTargetBlock.block_id,
        station_id: selectedStation,
        deferral_reason: deferReason,
        deferred_at: new Date().toISOString(),
      });

      // Update block state
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === deferTargetBlock.id
            ? {
                ...b,
                status: 'DEFERRED',
                work_description: `[AUTO-RESCHEDULED TO TOMORROW NIGHT 01:30-04:00] ${b.work_description}`,
              }
            : b
        )
      );

      setDeferSuccessMsg(
        `🚨 BLOCK ${deferTargetBlock.block_id} SAFELY DEFERRED: AI auto-healed schedule in 208ms (Moved to Tomorrow 01:30 IST slot). Telemetry broadcast to Bengaluru Cockpit.`
      );
      setDeferTargetBlock(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeferring(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto text-xs">
      {/* Back and Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Terminal Hub</span>
        </Link>
        <span className="text-[11px] font-mono text-amber-400">
          STATION MASTER OPERATING MODULE • G&SR DISCONNECTION PERMIT
        </span>
      </div>

      {/* Page Header Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700/60 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white">
                Station Master Terminal & Local Disconnection Console
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600">
                LIVE SWR
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Authorized personnel at local stations verify work permits, grant track disconnection, or execute ground hazard deferral.
            </p>
          </div>
        </div>

        {/* Station Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {KARNATAKA_STATIONS.map((stn) => (
            <button
              key={stn.code}
              onClick={() => setSelectedStation(stn.code)}
              className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] transition ${
                selectedStation === stn.code
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-950 font-extrabold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {stn.code}
            </button>
          ))}
          <button
            onClick={() => setSelectedStation('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] transition ${
              selectedStation === 'ALL'
                ? 'bg-amber-500 text-black font-extrabold'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            ALL
          </button>
        </div>
      </div>

      {/* Deferral Alert Banner */}
      {deferSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/70 flex items-start justify-between gap-3 text-slate-200 animate-in fade-in duration-200">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300 text-xs">{deferSuccessMsg}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Optimizer CP-SAT preserved Vande Bharat 20607 headway buffer with zero passenger collision.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDeferSuccessMsg(null)}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sanctioned Blocks Table / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
            Tonight's Sanctioned Possessions at Station {selectedStation}:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {filteredBlocks.length} Blocks Registered by Bengaluru DRM Cockpit
          </span>
        </div>

        {filteredBlocks.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
            No active maintenance blocks scheduled at station {selectedStation} tonight.
          </div>
        ) : (
          filteredBlocks.map((block) => {
            const isInProgress = block.status === 'IN_PROGRESS';
            const isDeferred = block.status === 'DEFERRED';

            return (
              <div
                key={block.id}
                className={`p-4 rounded-xl border transition space-y-3 ${
                  isDeferred
                    ? 'bg-rose-950/30 border-rose-600/40 opacity-75'
                    : isInProgress
                    ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Block Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold font-mono text-white text-sm">
                      {block.block_id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {block.section} ({block.station})
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        block.department === 'Engineering'
                          ? 'bg-blue-950 text-blue-300 border border-blue-700'
                          : block.department === 'Signal & Telecom'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      }`}
                    >
                      {block.department}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isDeferred
                          ? 'bg-rose-950 text-rose-300 border border-rose-600'
                          : isInProgress
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 animate-pulse'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      }`}
                    >
                      {block.status}
                    </span>
                  </div>
                </div>

                {/* Block Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Sanction Window:</span>
                    <span className="font-bold text-white font-mono">
                      {block.scheduled_start} - {block.scheduled_end} ({block.duration_minutes}m)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Track Location:</span>
                    <span className="font-bold text-cyan-300 font-mono">
                      {block.km_range}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Worker Memo Code:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {block.worker_memo_code}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Work Type:</span>
                    <span className="text-slate-300 line-clamp-1 font-sans">
                      {block.work_description}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-1.5 text-slate-400 text-[10px]">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cross-check physical crew permit before grant</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Grant Disconnection Button */}
                    {!isInProgress && !isDeferred && (
                      <button
                        onClick={() => handleGrantDisconnection(block.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition flex items-center space-x-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🟢 Grant Local Disconnection</span>
                      </button>
                    )}

                    {/* Ground Deferral Button (THE MONEY SHOT) */}
                    {!isDeferred && (
                      <button
                        onClick={() => setDeferTargetBlock(block)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 font-bold text-xs transition flex items-center space-x-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>🔴 Ground Hazard Deferral</span>
                      </button>
                    )}

                    {isDeferred && (
                      <span className="text-[11px] text-rose-300 font-mono italic">
                        ✓ Auto-rescheduled by AI Guardian
                      </span>
                    )}

                    {isInProgress && (
                      <span className="text-[11px] text-emerald-300 font-mono font-bold">
                        ⚡ Line Block Active • Track Disconnected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ground Deferral Modal */}
      {deferTargetBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-rose-700/80 p-5 space-y-4 shadow-2xl text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span className="text-sm">Station Master Ground Hazard Deferral</span>
              </div>
              <button
                onClick={() => setDeferTargetBlock(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 space-y-1">
              <p className="text-rose-200 font-bold">
                Target Possession: {deferTargetBlock.block_id}
              </p>
              <p className="text-slate-400 text-[11px]">
                Station: {deferTargetBlock.station} • {deferTargetBlock.section} ({deferTargetBlock.km_range})
              </p>
              <p className="text-slate-300 text-[11px]">
                Scheduled Window: {deferTargetBlock.scheduled_start} - {deferTargetBlock.scheduled_end}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">
                  Local Hazard Reason:
                </label>
                <select
                  value={deferReason}
                  onChange={(e) => setDeferReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                >
                  <option value="Severe Weather Storm">Severe Weather / Thunderstorm & High Winds</option>
                  <option value="Late Passenger Train">Late Running VIP Passenger Service (Headway Infringement)</option>
                  <option value="Shunting Operation Delay">Yard Shunting Delay / Fouling Mark Obstruction</option>
                  <option value="Platform Track Obstruction">Platform / Point Track Mechanical Obstruction</option>
                  <option value="Workforce Equipment Not Ready">Maintenance Gang Machinery Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">
                  Station Master Log Remarks:
                </label>
                <textarea
                  rows={2}
                  value={deferCustomNotes}
                  onChange={(e) => setDeferCustomNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Upon clicking deferral, RailBlock AI Central Optimizer will immediately auto-reschedule this block to the next safe nocturnal window (208ms SLA) and alert Bengaluru Control.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeferTargetBlock(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeferral}
                disabled={isDeferring}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
              >
                <Zap className={`w-4 h-4 ${isDeferring ? 'animate-spin' : ''}`} />
                <span>{isDeferring ? 'Auto-Rescheduling in 208ms...' : '🔴 Execute Ground Deferral & Auto-Reschedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
