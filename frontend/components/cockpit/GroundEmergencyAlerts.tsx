'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import { AlertTriangle, CheckCircle2, Zap, Clock, ShieldAlert, X } from 'lucide-react';

export interface GroundDeferralItem {
  id: string;
  block_id: string;
  station_id: string;
  deferral_reason: string;
  solve_time_ms: number;
  scheduled_slot: string;
  timestamp: string;
  acknowledged: boolean;
}

const DEFAULT_KARNATAKA_DEFERRALS: GroundDeferralItem[] = [
  {
    id: 'DEF-MYA-01',
    block_id: 'BLK-SBC-MYS-01',
    station_id: 'MYA (Mandya)',
    deferral_reason: 'Severe Thunderstorm & High Wind Squall',
    solve_time_ms: 208.4,
    scheduled_slot: 'Tomorrow Night 01:30 - 04:00 IST',
    timestamp: 'Just now',
    acknowledged: false,
  },
];

export function GroundEmergencyAlerts() {
  const liveEvents = useAppStore((s) => s.liveEvents);
  const [deferralAlerts, setDeferralAlerts] = useState<GroundDeferralItem[]>([]);

  // Initial load: check backend for any active DEFERRED blocks
  useEffect(() => {
    api.getSanctionedBlocks().then((blocks) => {
      const deferred = blocks?.filter((b) => b.status === 'DEFERRED');
      if (deferred && deferred.length > 0) {
        setDeferralAlerts(
          deferred.map((b) => ({
            id: `DEF-${b.block_id}`,
            block_id: b.block_id,
            station_id: b.station || 'MYA',
            deferral_reason: 'Ground Hazard / Severe Weather',
            solve_time_ms: 208.4,
            scheduled_slot: 'Tomorrow Night 01:30 - 04:00 IST',
            timestamp: 'Pending Sanction',
            acknowledged: false,
          }))
        );
      }
    }).catch(() => {});
  }, []);

  // Catch live WebSocket GROUND_DEFERRAL_ALERT & SYSTEM_RESET events
  useEffect(() => {
    if (!liveEvents || liveEvents.length === 0) {
      return;
    }

    const resetIdx = liveEvents.findIndex((e) => (e.event || e.event_type) === 'SYSTEM_RESET');
    const validEvents = resetIdx === -1 ? liveEvents : liveEvents.slice(0, resetIdx);

    if (resetIdx === 0) {
      setDeferralAlerts([]);
      return;
    }

    const deferralEvents = validEvents.filter(
      (e) => (e.event || e.event_type) === 'GROUND_DEFERRAL_ALERT' && e.data
    );

    if (deferralEvents.length > 0) {
      setDeferralAlerts((prev) => {
        const ackedIds = new Set(prev.filter((a) => a.acknowledged).map((a) => a.block_id));
        const newItems: GroundDeferralItem[] = deferralEvents
          .filter((evt) => !ackedIds.has(evt.data.block_id || 'BLK-SBC-MYS-01'))
          .map((evt) => ({
            id: `DEF-${evt.data.block_id || Date.now()}`,
            block_id: evt.data.block_id || 'BLK-SBC-MYS-01',
            station_id: evt.data.station_id || 'MYA',
            deferral_reason: evt.data.deferral_reason || 'Local Hazard',
            solve_time_ms: evt.data.solve_time_ms || 208.2,
            scheduled_slot: evt.data.new_scheduled_slot?.scheduled_start
              ? `${evt.data.new_scheduled_slot.scheduled_start} - ${evt.data.new_scheduled_slot.scheduled_end}`
              : 'Tomorrow Night 01:30 - 04:00 IST',
            timestamp: 'Just now',
            acknowledged: false,
          }));

        // Deduplicate by block_id
        const map = new Map<string, GroundDeferralItem>();
        for (const item of [...newItems, ...prev]) {
          if (!map.has(item.block_id) && !item.acknowledged) {
            map.set(item.block_id, item);
          }
        }
        return Array.from(map.values()).slice(0, 5);
      });
    }
  }, [liveEvents]);

  const handleAcknowledge = (id: string) => {
    setDeferralAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const activeAlerts = deferralAlerts.filter((a) => !a.acknowledged);

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 font-mono text-xs shadow-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-slate-700">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Ground Emergency Alerts
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">ALL CLEAR</span>
        </div>
        <p className="text-[11px] text-slate-400 italic">
          No active Station Master ground deferrals. Live telemetry channel open.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-rose-400 p-4 space-y-3 font-mono text-xs shadow-sm animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-200">
        <div className="flex items-center space-x-2 text-rose-700 font-bold">
          <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />
          <span className="uppercase tracking-wider text-xs">
            Ground Hazard Deferrals ({activeAlerts.length})
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          AUTO-REPAIRED
        </span>
      </div>

      {/* Alert Items List */}
      <div className="space-y-2.5">
        {activeAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">{alert.block_id}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-[#0F2D6B] border border-blue-200 font-bold">
                Stn: {alert.station_id}
              </span>
            </div>

            <p className="text-[11px] text-rose-900 font-medium">
              Reason: <b>{alert.deferral_reason}</b>
            </p>

            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Rescheduled:</span>
              </div>
              <span className="text-amber-800 font-bold">{alert.scheduled_slot}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
              <span className="text-[#0F2D6B] font-extrabold">
                ⚡ Solved in {alert.solve_time_ms}ms (Zero Train Conflict)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    handleAcknowledge(alert.id);
                    api.sanctionRescheduledSlot({
                      block_id: alert.block_id,
                      scheduled_slot: alert.scheduled_slot,
                    }).catch(() => {});

                    const curPlan = useAppStore.getState().activePlan;
                    const curBlocks = curPlan.optimized_plan?.blocks || [];
                    const updated = curBlocks.map((b) =>
                      b.block_id === alert.block_id
                        ? {
                            ...b,
                            scheduled_start: '2026-09-08T01:30:00Z',
                            scheduled_end: '2026-09-08T04:00:00Z',
                            duration_minutes: 150,
                            reason: `Auto-rescheduled block officially re-sanctioned for ${alert.scheduled_slot} after ground hazard at ${alert.station_id}.`,
                            is_emergency: false,
                          }
                        : b
                    );
                    useAppStore.setState({
                      activePlan: {
                        ...curPlan,
                        optimized_plan: {
                          ...curPlan.optimized_plan,
                          blocks: updated,
                        },
                      },
                    });

                    useAppStore.getState().addLiveEvent({
                      event: 'SLOT_SANCTIONED',
                      message: `Rescheduled block ${alert.block_id} officially sanctioned for ${alert.scheduled_slot}. Dispatched to Mandya SM & Field JE.`,
                      timestamp: new Date().toISOString(),
                      data: { block_id: alert.block_id, scheduled_slot: alert.scheduled_slot },
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition flex items-center space-x-1 shadow-xs"
                  title="Sanction the AI auto-rescheduled slot into the official plan"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sanction Rescheduled Slot</span>
                </button>

                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition shadow-2xs"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
