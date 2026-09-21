'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { CORRIDORS } from '../../lib/constants';
import { formatTimeOnly, getDepartmentBadgeColor } from '../../lib/format';
import {
  X,
  MapPin,
  Train,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Wrench,
  Gauge,
} from 'lucide-react';

interface SectionDrawerProps {
  sectionCode: string;
  onClose: () => void;
}

export function SectionDrawer({ sectionCode, onClose }: SectionDrawerProps) {
  const {
    activePlan,
    setSelectedBlock,
    setExplanationOpen,
    isEmergencyActive,
    activeEmergencyDetails,
    activeEmergencies,
    resolveEmergency,
    clearAllEmergencies,
  } = useAppStore();
  const corridor = CORRIDORS.find((c) => c.section_code === sectionCode) || CORRIDORS[0];

  const corridorEmergencies = (activeEmergencies || []).filter(
    (e) => e.corridor === corridor.section_code
  );
  const isEmergency =
    corridorEmergencies.length > 0 ||
    (isEmergencyActive && activeEmergencyDetails?.corridor === corridor.section_code);
  const isMaintenance = corridor.status === 'POSSESSION_ACTIVE';

  // Filter blocks for this section
  const sectionBlocks =
    activePlan?.optimized_plan?.blocks?.filter((b) => b.section === sectionCode) ||
    activePlan?.optimized_plan?.blocks ||
    [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 text-xs font-mono select-none shadow-xs">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900">{corridor.section_code}</h3>
              {isEmergency ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
                  🚨 EMERGENCY ({corridorEmergencies.length || 1})
                </span>
              ) : isMaintenance ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  🟡 MAINTENANCE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  🟢 RUNNING
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">{corridor.section_name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Operational Status Callout */}
      {isEmergency ? (
        <div className="space-y-2">
          {corridorEmergencies.length > 0 ? (
            corridorEmergencies.map((emg) => (
              <div
                key={emg.id || emg.tokenNumber}
                className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                    <span className="text-[11px]">
                      {emg.defectType.replace(/_/g, ' ')} AT {emg.stationName.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono bg-rose-100 px-1.5 py-0.5 rounded text-rose-800 border border-rose-300 font-bold">
                    {emg.tokenNumber}
                  </span>
                </div>
                <p className="text-[10px] text-rose-900 leading-relaxed">
                  Location: <b>{emg.stationName} (km {emg.kmPost})</b> • Window: <b>{emg.durationMinutes} min</b> locked in <b>208ms SLA</b>.
                </p>
                <button
                  onClick={() => resolveEmergency(emg.id || emg.tokenNumber)}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition shadow-xs"
                >
                  Resolve Notice {emg.tokenNumber}
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>CRITICAL USFD RAIL FRACTURE</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                Emergency possession active on this corridor. Automatic safety buffer applied.
              </p>
              <button
                onClick={() => clearAllEmergencies()}
                className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition shadow-xs"
              >
                Clear / Resolve Emergency
              </button>
            </div>
          )}
        </div>
      ) : isMaintenance ? (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1.5">
          <div className="flex items-center space-x-2 text-amber-800 font-bold">
            <Wrench className="w-4 h-4 text-amber-600" />
            <span>Active Engineering Track Possession</span>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Machine deployed: <b>09-3X Dynamic Tamper</b> • Corridor: <b>Headway Protected</b> • Window: <b>{corridor.block_window_start.slice(0, 5)} - {corridor.block_window_end.slice(0, 5)} IST</b>.
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Corridor Running at Full Line Capacity</span>
          </div>
          <p className="text-[11px] text-emerald-900">
            Speed: <b>130 - 160 km/h MPS</b> • Safe Headway: <b>30-min buffer active</b> • No speed restrictions.
          </p>
        </div>
      )}

      {/* Corridor Specifications Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Corridor Length</p>
          <p className="text-sm font-bold text-slate-900">{corridor.total_km} km</p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Track Type</p>
          <p className="text-sm font-bold text-[#0F2D6B]">
            {corridor.is_double_line ? 'Double Track Line' : 'Single Track Line'}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Daily Train Traffic</p>
          <p className="text-sm font-bold text-slate-900">
            {corridor.daily_trains} <span className="text-[10px] text-slate-500 font-normal">({corridor.goods_forecast} Freight)</span>
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Speed Limit (MPS)</p>
          <p className="text-sm font-bold text-emerald-700 flex items-center space-x-1">
            <Gauge className="w-3.5 h-3.5" />
            <span>{isMaintenance ? '30 km/h (PSR)' : '160 km/h (MPS)'}</span>
          </p>
        </div>
      </div>

      {/* Corridor Possessions */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between text-slate-900 font-bold">
          <span>Possession Schedule ({sectionBlocks.length})</span>
          <span className="text-[10px] text-[#0F2D6B] font-normal">Click to Inspect</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {sectionBlocks.length === 0 ? (
            <p className="text-slate-400 py-3 text-center">No blocks scheduled on this section.</p>
          ) : (
            sectionBlocks.map((blk) => {
              const badge = getDepartmentBadgeColor(blk.department);
              return (
                <div
                  key={blk.block_id}
                  onClick={() => {
                    setSelectedBlock(blk);
                    setExplanationOpen(true);
                  }}
                  className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-white cursor-pointer transition flex items-center justify-between group shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 group-hover:text-[#0F2D6B]">
                        {blk.block_id}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-sans font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {blk.department}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span suppressHydrationWarning>
                        {formatTimeOnly(blk.scheduled_start)} - {formatTimeOnly(blk.scheduled_end)} (
                        {blk.duration_minutes}m)
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    {blk.downtime_saved_minutes > 0 ? (
                      <span className="text-[10px] text-purple-800 font-bold px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">
                        +{blk.downtime_saved_minutes}m saved
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">P: {blk.priority_score.toFixed(0)}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
