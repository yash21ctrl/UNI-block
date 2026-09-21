'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { CORRIDORS } from '../../lib/constants';
import { OptimizedBlock } from '../../lib/types';
import {
  formatTimeOnly,
  formatDateOnly,
  getDepartmentBadgeColor,
  getDepartmentGanttColor,
  isBlockFused,
  getFusionDepartmentPill,
} from '../../lib/format';
import {
  Clock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface BlockGanttProps {
  interactive?: boolean;
}

function BlockGanttComponent({ interactive = true }: BlockGanttProps) {
  const activePlan = useAppStore((s) => s.activePlan);
  const selectedBlock = useAppStore((s) => s.selectedBlock);
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);

  const [zoomMode, setZoomMode] = useState<'6h' | '24h' | '7d'>('24h');
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'NORTH' | 'SOUTH'>('ALL');
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'ENG' | 'SIGNAL' | 'TRD' | 'OPERATING' | 'FUSED'>('ALL');
  const [autoFollow, setAutoFollow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = React.useMemo(() => {
    if (zoneFilter === 'NORTH') {
      return CORRIDORS.filter((c) => !c.zone || c.zone.includes('NR') || c.zone.includes('NCR'));
    }
    if (zoneFilter === 'SOUTH') {
      return CORRIDORS.filter(
        (c) =>
          c.zone?.includes('SR') ||
          c.zone?.includes('SCR') ||
          c.zone?.includes('SWR') ||
          ['MAS-SBC', 'MAS-BZA', 'BZA-SC', 'SBC-MYS', 'MAS-CBE', 'CBE-PGT', 'ERS-TVC', 'RU-GTL'].includes(
            c.section_code
          )
      );
    }
    return CORRIDORS;
  }, [zoneFilter]);

  const blocks = activePlan?.optimized_plan?.blocks || [];

  // Generate 15-min time slots based on zoom mode
  const { totalSlots, slotWidth } = React.useMemo(() => {
    const total = zoomMode === '6h' ? 24 : zoomMode === '24h' ? 96 : 7 * 24;
    const width = zoomMode === '6h' ? 36 : zoomMode === '24h' ? 18 : 6;
    return { totalSlots: total, slotWidth: width };
  }, [zoomMode]);

  const timeLabels = React.useMemo(() => {
    return Array.from({ length: totalSlots }).map((_, i) => {
      const totalMinutes = i * 15;
      const hrs = Math.floor((totalMinutes / 60) % 24);
      const mins = totalMinutes % 60;
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    });
  }, [totalSlots]);

  // Calculate "NOW" playhead position
  const now = new Date();
  const currentMinutes = (now.getHours() * 60 + now.getMinutes()) % (24 * 60);
  const currentSlot = Math.floor(currentMinutes / 15);
  const nowLeft = currentSlot * slotWidth;

  // Auto-follow scroll effect
  useEffect(() => {
    if (autoFollow && containerRef.current) {
      containerRef.current.scrollLeft = Math.max(0, nowLeft - 200);
    }
  }, [autoFollow, nowLeft]);

  // Block positioning helper: parses scheduled_start or falls back to slot offset
  const getBlockStyle = (block: OptimizedBlock, idx: number) => {
    let startMinutes: number;
    if (block.scheduled_start) {
      const dt = new Date(block.scheduled_start);
      if (!isNaN(dt.getTime())) {
        startMinutes = (dt.getUTCHours() * 60 + dt.getUTCMinutes()) % (24 * 60);
      } else {
        startMinutes = (idx * 85 + 30) % (24 * 60);
      }
    } else {
      startMinutes = (idx * 85 + 30) % (24 * 60);
    }
    const durationMinutes = block.duration_minutes || 120;
    const startSlot = Math.floor(startMinutes / 15);
    const slotsSpan = Math.max(2, Math.ceil(durationMinutes / 15));

    const left = startSlot * slotWidth;
    const width = slotsSpan * slotWidth;

    return { left, width };
  };

  const getBlockColors = (block: OptimizedBlock) => {
    return getDepartmentGanttColor(block);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 select-none flex flex-col font-mono text-xs shadow-xs">
      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#0F2D6B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Corridor Possession Timeline (15-min Slot Grid)
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold">
            ({blocks.length} possessions across {sections.length} corridors)
          </span>
        </div>

        {/* Zone Selector & Zoom & Auto-follow controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zone Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(['ALL', 'NORTH', 'SOUTH'] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`px-2.5 py-0.5 text-[10px] rounded-md font-bold transition ${
                  zoneFilter === z
                    ? 'bg-[#0F2D6B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {z === 'ALL' ? 'All (20)' : z === 'NORTH' ? 'North (12)' : 'South (8)'}
              </button>
            ))}
          </div>

          {/* Auto-follow Now toggle */}
          <button
            onClick={() => setAutoFollow(!autoFollow)}
            className={`px-2.5 py-1 rounded-lg text-[10px] flex items-center space-x-1 border transition shadow-2xs ${
              autoFollow
                ? 'bg-blue-50 text-[#0F2D6B] border-blue-300 font-bold'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="Auto-center on current time"
          >
            <Navigation className={`w-3 h-3 ${autoFollow ? 'text-[#0F2D6B]' : ''}`} />
            <span>Auto-Follow</span>
          </button>

          {/* Zoom buttons */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            {(['6h', '24h', '7d'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setZoomMode(mode)}
                className={`px-2.5 py-0.5 text-[10px] rounded-md transition ${
                  zoomMode === mode
                    ? 'bg-[#0F2D6B] text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 px-1">
          <Layers className="w-3.5 h-3.5 text-[#0F2D6B]" />
          <span>Department Filter:</span>
        </span>
        {[
          { id: 'ALL', label: 'All Departments' },
          { id: 'ENG', label: '🟢 Engineering (P-Way)', color: 'bg-emerald-600 text-white' },
          { id: 'SIGNAL', label: '🔵 Signal & Telecom (S&T)', color: 'bg-blue-600 text-white' },
          { id: 'TRD', label: '🟠 Traction (OHE)', color: 'bg-amber-600 text-white' },
          { id: 'OPERATING', label: '🟣 Operating / Mech', color: 'bg-purple-600 text-white' },
          { id: 'FUSED', label: '⚡ Fused Blocks Only', color: 'bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 text-white' },
        ].map((d) => {
          const isSel = deptFilter === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDeptFilter(d.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                isSel
                  ? (d.color || 'bg-[#0F2D6B] text-white') + ' border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Selected Block Quick Action Bar */}
      {selectedBlock && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in shadow-2xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                selectedBlock.is_emergency
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-[#0F2D6B] animate-pulse'
              }`}
            />
            <div className="truncate">
              <span className="text-slate-700">
                Selected Block:{' '}
                <b className={selectedBlock.is_emergency ? 'text-rose-700' : 'text-slate-900'}>
                  {selectedBlock.block_id}
                </b>{' '}
                on <b className="text-[#0F2D6B]">{selectedBlock.section}</b> ({selectedBlock.department}) •{' '}
                <span suppressHydrationWarning className="text-slate-500 font-semibold">
                  {formatTimeOnly(selectedBlock.scheduled_start)} - {formatTimeOnly(selectedBlock.scheduled_end)} ({selectedBlock.duration_minutes}m)
                </span>
                {isBlockFused(selectedBlock) && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[9px] border border-amber-300">
                    ⚡ FUSED JOINT BLOCK (+{selectedBlock.downtime_saved_minutes || 30}m Saved)
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setExplanationOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0F2D6B] text-xs font-bold border border-blue-300 shadow-2xs flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F2D6B]" />
              <span>Inspect AI Explanation & SHAP</span>
            </button>
          </div>
        </div>
      )}

      {/* Gantt Canvas Container */}
      <div
        ref={containerRef}
        className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50 custom-scrollbar relative shadow-inner"
        style={{ maxHeight: '380px' }}
      >
        <div style={{ width: `${totalSlots * slotWidth + 140}px` }}>
          {/* Time Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-100 sticky top-0 z-20">
            <div className="w-[140px] px-3 py-2 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider shrink-0 border-r border-slate-200 bg-slate-100">
              CORRIDOR
            </div>
            <div className="flex">
              {timeLabels.map((lbl, idx) => {
                const isHour = idx % 4 === 0;
                return (
                  <div
                    key={idx}
                    className={`shrink-0 text-[9px] text-center border-r border-slate-200/80 py-1.5 ${
                      isHour ? 'font-bold text-slate-900 bg-slate-200/40' : 'text-slate-400'
                    }`}
                    style={{ width: `${slotWidth}px` }}
                  >
                    {isHour ? lbl : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corridor Rows */}
          <div className="relative">
            {/* "NOW" Vertical Playhead */}
            {mounted && (
              <div
                suppressHydrationWarning
                className="absolute top-0 bottom-0 z-10 pointer-events-none flex flex-col items-center"
                style={{ left: `${nowLeft + 140}px` }}
              >
                <div className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping -mt-1" />
                <div className="w-0.5 h-full bg-rose-600 shadow-sm shadow-rose-400" />
              </div>
            )}

            {sections.map((sec, secIdx) => {
              const secBlocks = blocks.filter((b) => {
                if (b.section !== sec.section_code) return false;
                if (deptFilter === 'ALL') return true;
                if (deptFilter === 'FUSED') return isBlockFused(b);
                const d = (b.department || '').toLowerCase();
                if (deptFilter === 'ENG') return d.includes('eng') || d.includes('track') || d.includes('p-way');
                if (deptFilter === 'SIGNAL') return d.includes('signal') || d.includes('s&t');
                if (deptFilter === 'TRD') return d.includes('traction') || d.includes('trd') || d.includes('ohe');
                if (deptFilter === 'OPERATING') return d.includes('operating') || d.includes('mech');
                return true;
              });
              const hasEmergency = activeEmergencies.some((e) => e.corridor === sec.section_code);
              const isEven = secIdx % 2 === 0;

              return (
                <div
                  key={sec.section_code}
                  className={`flex items-center border-b border-slate-200/80 hover:bg-blue-50/40 transition h-14 relative ${
                    isEven ? 'bg-white' : 'bg-slate-50/70'
                  }`}
                >
                  {/* Section Label */}
                  <div
                    onClick={() => setSelectedSection(sec.section_code)}
                    className="w-[140px] px-3 shrink-0 border-r border-slate-200 bg-white z-10 h-full flex flex-col justify-center cursor-pointer hover:bg-slate-50 transition shadow-2xs"
                    title={`Click to select corridor ${sec.section_code}`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-slate-900 text-xs">{sec.section_code}</span>
                      {hasEmergency && (
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">{sec.total_km} km • {sec.is_double_line ? 'Double' : 'Single'}</span>
                  </div>

                  {/* Grid Track Background */}
                  <div className="flex h-full w-full relative items-center">
                    {/* Background slot lines */}
                    {Array.from({ length: totalSlots }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full shrink-0 border-r ${
                          i % 4 === 0 ? 'border-slate-200' : 'border-slate-100'
                        }`}
                        style={{ width: `${slotWidth}px` }}
                      />
                    ))}

                    {/* Render Blocks */}
                    {secBlocks.map((blk, blkIdx) => {
                      const pos = getBlockStyle(blk, blkIdx);
                      const colorClass = getBlockColors(blk);
                      const isSelected = selectedBlock?.block_id === blk.block_id;
                      const isFused = isBlockFused(blk);
                      const fusionPill = isFused ? getFusionDepartmentPill(blk.department) : null;
                      const downtimeSaved = blk.downtime_saved_minutes || 30;

                      return (
                        <div
                          key={blk.block_id + blkIdx}
                          onClick={() => {
                            if (interactive) {
                              setSelectedBlock(blk);
                              setSelectedSection(blk.section);
                              setExplanationOpen(true);
                            }
                          }}
                          className={`absolute h-9 rounded-lg border text-[10px] font-mono px-2 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-xs z-10 ${colorClass} ${
                            isSelected ? 'ring-2 ring-[#0F2D6B] scale-[1.03] z-20 shadow-md' : ''
                          }`}
                          style={{
                            left: `${pos.left}px`,
                            width: `${pos.width}px`,
                          }}
                          title={
                            isFused
                              ? `⚡ [FUSED JOINT BLOCK]: ${blk.department} on ${blk.section}. Bundles multiple teams into 1 possession, saving +${downtimeSaved}m track downtime!`
                              : blk.user_id
                              ? `Demanded by User ${blk.user_id}${blk.submitter_name ? ` (${blk.submitter_name})` : ''} • ${blk.department} on ${blk.section} (${blk.duration_minutes}m)`
                              : blk.is_emergency
                              ? `🚨 EMERGENCY FIX on ${blk.section} (${blk.duration_minutes}m). Solved in 208ms. Premium trains protected.`
                              : `🔧 ${blk.department} on ${blk.section} (${blk.duration_minutes}m). Scheduled in low-traffic window.`
                          }
                        >
                          <div className="truncate flex items-center space-x-1 font-bold min-w-0">
                            {blk.user_id && (
                              <span className="px-1 py-0.2 rounded bg-black/35 text-[8px] font-black text-amber-200 shrink-0">
                                JE-{blk.user_id}
                              </span>
                            )}
                            {isFused && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                <span>FUSED</span>
                              </span>
                            )}
                            {fusionPill && (
                              <span className="px-1 py-0.5 rounded bg-white/20 text-white font-mono font-bold text-[8px] shrink-0 hidden md:inline">
                                {fusionPill}
                              </span>
                            )}
                            <span className="truncate text-white font-extrabold">{blk.block_id}</span>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0 pl-1 font-bold text-white text-[9px]">
                            {isFused && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[8px] shrink-0 hidden sm:inline">
                                +{downtimeSaved}m Saved
                              </span>
                            )}
                            <span className="opacity-90 hidden sm:inline font-mono">{blk.duration_minutes}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-700 pt-2 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded-sm bg-emerald-600 inline-block shadow-2xs border border-emerald-400" />
            <span className="font-bold text-slate-800">Engineering (P-Way)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded-sm bg-blue-600 inline-block shadow-2xs border border-blue-400" />
            <span className="font-bold text-slate-800">Signal &amp; Telecom (S&amp;T)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded-sm bg-amber-600 inline-block shadow-2xs border border-amber-400" />
            <span className="font-bold text-slate-800">Traction / Electrical (OHE)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded-sm bg-purple-600 inline-block shadow-2xs border border-purple-400" />
            <span className="font-bold text-slate-800">Operating / Mechanical</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-4 h-2.5 rounded-sm bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 inline-block shadow-2xs border-2 border-amber-300" />
            <span className="text-amber-900 font-extrabold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" />
              <span>[⚡ FUSED JOINT BLOCK] (+30m Saved)</span>
            </span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3.5 h-2.5 rounded-sm bg-rose-600 inline-block animate-pulse shadow-2xs border border-rose-300" />
            <span className="text-rose-700 font-bold">Emergency Possession</span>
          </span>
        </div>

        <div className="text-slate-500 text-[10px] font-mono font-medium">
          Tip: Click any block to view plain-language AI explanation
        </div>
      </div>
    </div>
  );
}
export const BlockGantt = React.memo(BlockGanttComponent);

