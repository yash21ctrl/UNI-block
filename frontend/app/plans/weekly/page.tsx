'use client';

import React from 'react';
import Link from 'next/link';
import { useAppStore } from '../../../lib/store';
import { ParetoExplorer } from '../../../components/pareto/ParetoExplorer';
import { BlockGantt } from '../../../components/gantt/BlockGantt';
import { formatDateTime, getDepartmentBadgeColor } from '../../../lib/format';
import {
  CalendarDays,
  CalendarRange,
  FileCheck,
  Zap,
  Sparkles,
  Download,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function WeeklyPlanPage() {
  const activePlan = useAppStore((s) => s.activePlan);
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock);
  const setExplanationOpen = useAppStore((s) => s.setExplanationOpen);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);

  const blocks = activePlan?.optimized_plan?.blocks || [];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-wide">
              Weekly Master Corridor Possession Schedule
            </h1>
            <p className="text-[11px] text-slate-500">
              Plan ID: {activePlan.plan_id} • 7-Day Horizon • CP-SAT Constrained
            </p>
          </div>
        </div>

        {/* Schedule View Toggle Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <Link
            href="/plans/weekly"
            className="px-3 py-1.5 rounded-md font-bold bg-[#0F2D6B] text-white shadow-xs flex items-center space-x-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 text-white" />
            <span>Weekly Schedule (7 Days)</span>
          </Link>
          <Link
            href="/plans/monthly"
            className="px-3 py-1.5 rounded-md font-bold text-slate-600 hover:text-slate-900 transition flex items-center space-x-1.5"
          >
            <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
            <span>Monthly Master (30 Days)</span>
          </Link>
        </div>

        <button
          onClick={() => setApprovalModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs flex items-center space-x-2 transition shadow-xs"
        >
          <FileCheck className="w-4 h-4" />
          <span>Sanction / Export Memo</span>
        </button>
      </div>

      {/* Pareto Multi-Objective Explorer */}
      <ParetoExplorer />

      {/* Full-Width Interactive Gantt */}
      <BlockGantt />

      {/* Detailed Possession Blocks Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Scheduled Possessions Breakdown ({blocks.length})
          </h3>
          <span className="text-[10px] text-slate-500">Click any row to open AI Explainability</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-2.5 px-3">Block ID</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Scheduled Start (UTC)</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Fusion Benefit</th>
                <th className="py-2.5 px-3">AI Confidence</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blocks.map((blk) => {
                const badge = getDepartmentBadgeColor(blk.department);
                return (
                  <tr
                    key={blk.block_id}
                    onClick={() => {
                      setSelectedBlock(blk);
                      setExplanationOpen(true);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                      {blk.downtime_saved_minutes > 0 && (
                        <Zap className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>{blk.block_id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#0F2D6B] font-bold">{blk.section}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-sans font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {blk.department}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">
                      {formatDateTime(blk.scheduled_start)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{blk.duration_minutes}m</td>
                    <td className="py-2.5 px-3">
                      {blk.downtime_saved_minutes > 0 ? (
                        <span className="text-purple-800 font-bold px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">
                          +{blk.downtime_saved_minutes}m
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{(blk.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlock(blk);
                          setExplanationOpen(true);
                        }}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-[#0F2D6B] transition"
                        title="Explain Block"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
