'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './AppHeader';
import { SidebarNav } from './SidebarNav';
import { ExplanationDrawer } from '../explain/ExplanationDrawer';
import { ApprovalModal } from '../approval/ApprovalModal';
import { InspectBrainModal } from '../explain/InspectBrainModal';
import { KeyboardShortcuts } from '../common/KeyboardShortcuts';
import { wsService } from '../../lib/ws';

import { useAppStore } from '../../lib/store';

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePortal = pathname?.startsWith('/field') || pathname?.startsWith('/station');
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);
  const activeEmergencyDetails = useAppStore((s) => s.activeEmergencyDetails);
  const resolveEmergency = useAppStore((s) => s.resolveEmergency);
  const resetEmergency = useAppStore((s) => s.resetEmergency);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);

  // Connect WebSocket on client mount
  useEffect(() => {
    wsService.connect();
    return () => {
      wsService.disconnect();
    };
  }, []);

  if (isStandalonePortal) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased font-sans">
        <div className="flex-1">{children}</div>
        <ExplanationDrawer />
        <ApprovalModal />
        <InspectBrainModal />
        <KeyboardShortcuts />
      </div>
    );
  }

  const displayedEmergencies =
    activeEmergencies.length > 0
      ? activeEmergencies
      : activeEmergencyDetails
      ? [activeEmergencyDetails]
      : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased selection:bg-[#0F2D6B] selection:text-white font-sans">
      <AppHeader />

      {/* Multiple Concurrent Emergencies Alert Banner */}
      {isEmergencyActive && displayedEmergencies.length > 0 && (
        <div className="bg-rose-50 text-rose-950 px-4 py-2.5 border-b-2 border-rose-500 shadow-sm z-30 shrink-0 font-mono text-xs animate-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-rose-200">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-extrabold text-rose-900 text-xs tracking-wider">
                  ⚠️ GROUND DEFERRAL RE-OPTIMIZATION RADAR:
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[11px] shadow-xs">
                  {displayedEmergencies.length} ACTIVE {displayedEmergencies.length === 1 ? 'GROUND DEFERRAL' : 'GROUND DEFERRALS'}
                </span>
                <span className="text-[11px] text-rose-800 hidden lg:inline">
                  • Autonomous Schedule Recovery • VIP Passenger Trains Fully Shielded
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetEmergency}
                className="px-3 py-1 rounded bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold transition text-[11px] shadow-xs"
                title="Clear all active ground deferrals across all corridors"
              >
                Clear All Deferrals ({displayedEmergencies.length})
              </button>
            </div>
          </div>

          {/* Active Emergencies Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 pt-2">
            {displayedEmergencies.map((emg) => (
              <div
                key={emg.id || emg.tokenNumber}
                className="bg-white border border-rose-200 rounded-lg p-2.5 flex items-center justify-between space-x-2 text-[11px] hover:border-rose-400 transition shadow-xs"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-bold text-rose-700 text-[11px]">{emg.tokenNumber}</span>
                    <span className="text-slate-300 font-bold">•</span>
                    <span className="text-slate-900 font-bold">{emg.corridor}</span>
                  </div>
                  <p className="text-slate-700 truncate">
                    {emg.stationName} (km {emg.kmPost}) —{' '}
                    <span className="text-rose-800 font-semibold">{emg.defectType.replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Window: <b>{emg.durationMinutes}m</b> • Dept: <b>{emg.department}</b>
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => setSelectedSection(emg.corridor)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 transition"
                    title={`Inspect corridor ${emg.corridor}`}
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => resolveEmergency(emg.id || emg.tokenNumber)}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition shadow-xs flex items-center space-x-1"
                    title={`Resolve emergency notice ${emg.tokenNumber}`}
                  >
                    <span>✓ Resolve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F8FAFC] custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Global Drawers & Modals */}
      <ExplanationDrawer />
      <ApprovalModal />
      <InspectBrainModal />
      <KeyboardShortcuts />
    </div>
  );
}
