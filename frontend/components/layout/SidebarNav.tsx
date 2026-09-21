'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { CORRIDORS } from '../../lib/constants';
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  CalendarRange,
  FileCheck,
  Zap,
  Inbox,
  Sparkles,
  Wrench,
  Train,
} from 'lucide-react';

const DISPATCH_ITEMS = [
  {
    label: 'Mission Cockpit Radar',
    href: '/cockpit',
    icon: LayoutDashboard,
    shortcut: 'C',
    badge: 'RADAR',
  },
  {
    label: 'Field Demands Desk',
    href: '/cockpit/requests',
    icon: Inbox,
    shortcut: 'D',
    badge: 'T/351',
  },
];

const CORRIDOR_ITEMS = [
  {
    label: 'Live Railway GIS Twin',
    href: '/twin',
    icon: MapPin,
    shortcut: 'R',
    badge: 'LIVE',
  },
  {
    label: 'Conflict Detection Radar',
    href: '/conflicts',
    icon: Zap,
    shortcut: 'X',
    badge: 'SIL-4',
  },
  {
    label: 'Weekly Possessions',
    href: '/plans/weekly',
    icon: CalendarDays,
    shortcut: 'W',
    badge: '7-DAY',
  },
  {
    label: 'Monthly Master Plan',
    href: '/plans/monthly',
    icon: CalendarRange,
    shortcut: '30D',
    badge: '30-DAY',
  },
  {
    label: 'AI Decision Ledger',
    href: '/audit',
    icon: FileCheck,
    shortcut: 'A',
    badge: 'IMMUT',
  },
];

function SidebarNavComponent() {
  const pathname = usePathname();
  const selectedSection = useAppStore((s) => s.selectedSection);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);
  const setInspectBrainModalOpen = useAppStore((s) => s.setInspectBrainModalOpen);
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const pendingDemandsCount = fieldRequests.filter((r) => r.status === 'PENDING_SANCTION').length;

  const renderNavGroup = (title: string, items: typeof DISPATCH_ITEMS) => (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-extrabold mb-1.5">
        {title}
      </p>
      {items.map((item) => {
        const isExact = item.href === '/cockpit';
        const isActive = isExact
          ? pathname === item.href
          : pathname === item.href || (item.href !== '/cockpit' && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-blue-50 text-[#0F2D6B] font-bold border-l-4 border-[#0F2D6B] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F2D6B]' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>

            <div className="flex items-center space-x-1.5">
              {item.href === '/cockpit/requests' && pendingDemandsCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  {pendingDemandsCount}
                </span>
              ) : item.badge ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {item.badge}
                </span>
              ) : null}
              {item.shortcut && (
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                  {item.shortcut}
                </kbd>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between select-none shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="p-3 space-y-6">
        {/* Section Selector */}
        <div className="space-y-1.5 px-2">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-extrabold flex items-center justify-between">
            <span>Active Corridor</span>
            <span className="text-[#0F2D6B] font-bold">SWR (Karnataka)</span>
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-[#0F2D6B] transition shadow-2xs cursor-pointer"
          >
            {CORRIDORS.map((c) => (
              <option key={c.section_code} value={c.section_code}>
                {c.section_code} ({c.section_name})
              </option>
            ))}
          </select>
        </div>

        {/* Section Dispatch Console Group */}
        {renderNavGroup('Section Dispatch Console', DISPATCH_ITEMS)}

        {/* Corridor Operations & Safety Group */}
        {renderNavGroup('Corridor Operations & Safety', CORRIDOR_ITEMS)}
      </div>

      {/* Footer System Status & Shortcuts Hint */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Unified AI Engine</span>
            </span>
            <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">ONLINE</span>
          </div>

          <button
            onClick={() => setInspectBrainModalOpen(true)}
            className="w-full py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0F2D6B] font-mono text-[10px] font-bold flex items-center justify-center space-x-1.5 transition shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-[#0F2D6B]" />
            <span>Inspect AI Engine</span>
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between px-1">
          <span>Shortcuts:</span>
          <span className="text-slate-600 font-semibold">[G] Plan • [D] Demands • [A] Sign</span>
        </div>
      </div>
    </aside>
  );
}
export const SidebarNav = React.memo(SidebarNavComponent);
