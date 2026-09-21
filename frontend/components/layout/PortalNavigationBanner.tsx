'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Train,
  Sparkles,
  RotateCcw,
  Radio,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function PortalNavigationBanner() {
  const pathname = usePathname();
  const setInspectBrainModalOpen = useAppStore((s) => s.setInspectBrainModalOpen);
  const resetToZero = useAppStore((s) => s.resetToZero);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingDemandsCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const portals = [
    {
      id: 'cockpit',
      name: 'Section Controller Cockpit',
      shortName: 'Cockpit Radar',
      href: '/cockpit',
      icon: LayoutDashboard,
      role: 'Section Controller',
      badge: 'RADAR',
    },
    {
      id: 'requests',
      name: 'Field Demands Desk',
      shortName: 'Demands Desk',
      href: '/cockpit/requests',
      icon: Inbox,
      role: 'Sanction Authority',
      badge: pendingDemandsCount > 0 ? `${pendingDemandsCount} PENDING` : 'ALL CLEAR',
      badgePulse: pendingDemandsCount > 0,
    },
    {
      id: 'field',
      name: 'Field JE Mobile Terminal',
      shortName: 'Field JE Portal',
      href: '/field/request',
      icon: Wrench,
      role: 'Junior Engineer (Track/S&T/TRD)',
      badge: 'GPS & QR',
    },
    {
      id: 'station',
      name: 'Station Master Terminal',
      shortName: 'Station Master',
      href: '/station',
      icon: Train,
      role: 'Station Master Operating Desk',
      badge: 'SIL-4 CLAMP',
    },
  ];

  const handleReset = () => {
    if (
      confirm(
        '🚨 Trigger MASTER RESET? This will clear all blocks, requests, and schedules across Section Controller, Station Master, and Field JE.'
      )
    ) {
      resetToZero();
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 px-3 py-1.5 border-b border-slate-200 shadow-xs select-none sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        {/* Left: Branding & Core Portal Tabs */}
        <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5">
          <div className="flex items-center space-x-2 shrink-0 pr-2.5 border-r border-slate-200">
            <div className="w-6 h-6 rounded-md bg-[#0F2D6B] flex items-center justify-center text-white font-black shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-blue-200" />
            </div>
            <span className="font-extrabold text-[#0F2D6B] tracking-wider text-xs hidden lg:inline">
              RAILBLOCK AI
            </span>
          </div>

          {/* 4 Navigation Portals */}
          <div className="flex items-center space-x-1">
            {portals.map((p) => {
              const isActive =
                p.href === '/cockpit'
                  ? pathname === '/cockpit'
                  : pathname === p.href || (p.href !== '/cockpit' && pathname?.startsWith(p.href));
              const Icon = p.icon;

              return (
                <Link
                  key={p.id}
                  href={p.href}
                  className={`px-2.5 py-1 rounded-lg flex items-center space-x-1.5 transition whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-[#0F2D6B] text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 font-medium'
                  }`}
                  title={`${p.name} (${p.role})`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-bold">{p.shortName}</span>
                  {p.badge && (
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.2 rounded shrink-0 hidden sm:inline ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : p.badgePulse
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {p.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Inspect 6 AI Agents, IST Clock & Master Reset */}
        <div className="flex items-center space-x-2 shrink-0 ml-auto">
          {/* Inspect 6 AI Agents button */}
          <button
            onClick={() => setInspectBrainModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold transition flex items-center space-x-1 text-[11px] shadow-2xs cursor-pointer"
            title="Inspect all 6 verified AI agents: Sentinel, Priority, Fusion, CP-SAT, Interlocking, Emergency"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">6 AI Agents</span>
            <span className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-black">6/6 ACTIVE</span>
          </button>

          {/* Clock */}
          <div className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded bg-white text-slate-700 text-[11px] border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-[#0F2D6B]" />
            <span suppressHydrationWarning className="font-semibold">{timeStr}</span>
          </div>

          {/* Master Reset Button */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-[11px] flex items-center space-x-1 transition shadow-2xs cursor-pointer"
            title="Wipe and reset all 3 portals to zero state"
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span className="hidden sm:inline">Reset 3 Portals</span>
          </button>
        </div>
      </div>
    </div>
  );
}
