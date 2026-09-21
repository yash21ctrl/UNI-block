'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { formatTimeOnly } from '../../lib/format';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Trash2,
  Radio,
} from 'lucide-react';

function LiveAlertFeedComponent() {
  const liveEvents = useAppStore((s) => s.liveEvents);
  const clearLiveEvents = useAppStore((s) => s.clearLiveEvents);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getEventBadge = (event?: string) => {
    const safeEvent = String(event || 'TELEMETRY').toUpperCase();
    switch (safeEvent) {
      case 'EMERGENCY_INJECTED':
      case 'EMERGENCY_TRIGGERED':
        return {
          icon: AlertTriangle,
          color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold',
          label: 'EMERGENCY',
        };
      case 'SAFETY_VIOLATION_BLOCKED':
        return {
          icon: ShieldAlert,
          color: 'text-amber-800 bg-amber-50 border-amber-200 font-bold',
          label: 'GUARDIAN BLOCK',
        };
      case 'PLAN_APPROVED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold',
          label: 'SANCTIONED',
        };
      case 'PLAN_GENERATED':
        return {
          icon: Zap,
          color: 'text-[#0F2D6B] bg-blue-50 border-blue-200 font-bold',
          label: 'CP-SAT PLAN',
        };
      default:
        return {
          icon: Radio,
          color: 'text-slate-700 bg-slate-100 border-slate-200 font-bold',
          label: safeEvent.replace(/_/g, ' '),
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 select-none flex flex-col h-[360px] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-[#0F2D6B]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Live Telemetry Feed
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {liveEvents.length} events
          </span>
          <button
            onClick={clearLiveEvents}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md hover:bg-slate-100"
            title="Clear Feed"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {liveEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
            Awaiting real-time WebSocket events...
          </div>
        ) : (
          liveEvents.map((evt, idx) => {
            const evtName = evt.event || evt.event_type || 'TELEMETRY';
            const badge = getEventBadge(evtName);
            const Icon = badge.icon;
            const message =
              evt.data?.message ||
              evt.message ||
              (typeof evt.data === 'string' ? evt.data : JSON.stringify(evt.data || ''));

            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-1 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono border ${badge.color}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                      <span>{badge.label}</span>
                    </span>
                  </div>
                  <span suppressHydrationWarning className="text-[9px] font-mono text-slate-400 font-bold">
                    {mounted ? formatTimeOnly(evt.timestamp) : '--:--'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 font-mono leading-relaxed line-clamp-2">
                  {message}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export const LiveAlertFeed = React.memo(LiveAlertFeedComponent);

