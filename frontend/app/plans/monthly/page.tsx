'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore, LogEntry } from '../../../lib/store';
import {
  CalendarRange,
  CalendarDays,
  FileCheck,
  Zap,
  Clock,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Sparkles,
  Download,
  Info,
  Layers,
  ArrowRight,
  Train,
  Check,
  Building2,
  TrendingDown,
} from 'lucide-react';

interface MonthlyWeekPlan {
  weekNumber: number;
  title: string;
  dateRange: string;
  focusArea: string;
  corridorKey: string;
  possessionCount: number;
  fusedMegaBlocks: number;
  downtimeSavedMinutes: number;
  blocks: Array<{
    id: string;
    corridor: string;
    department: 'Engineering' | 'TRD' | 'Signal & Telecom' | 'Joint (Eng + TRD)' | 'Joint (Eng + S&T)';
    workType: string;
    machine: string;
    timeWindow: string;
    durationMinutes: number;
    savingsMinutes: number;
    priority: number;
    protectionNotice: string;
  }>;
}

const SWR_MONTHLY_WEEKS: MonthlyWeekPlan[] = [
  {
    weekNumber: 1,
    title: 'Week 1: SBC-MYS High-Speed Intercity Track Renewal & Deep Screening',
    dateRange: '01 Sep – 07 Sep 2026',
    focusArea: 'SBC-MYS (KSR Bengaluru - Mysuru High-Speed Trunk)',
    corridorKey: 'SBC-MYS',
    possessionCount: 8,
    fusedMegaBlocks: 4,
    downtimeSavedMinutes: 165,
    blocks: [
      {
        id: 'M-SWR-W1-01',
        corridor: 'SBC-MYS',
        department: 'Joint (Eng + TRD)',
        workType: 'Ballast Deep Screening & 25kV Catenary Re-tensioning (km 92-108)',
        machine: 'BCM-14 High Output Ballast Cleaner + 8-Wheeler Tower Car',
        timeWindow: '00:30 – 04:30 IST',
        durationMinutes: 240,
        savingsMinutes: 60,
        priority: 98.4,
        protectionNotice: 'Protected: 20607 SBC-MYS Vande Bharat & 16535 Golgumbaz Express',
      },
      {
        id: 'M-SWR-W1-02',
        corridor: 'SBC-MYS',
        department: 'Engineering',
        workType: 'Complete Track Renewal (CTR) & Dynamic Stabilizing (km 45-55)',
        machine: '09-3X Dynamic Continuous Action Tamper + DGS-62N',
        timeWindow: '01:00 – 04:00 IST',
        durationMinutes: 180,
        savingsMinutes: 35,
        priority: 94.2,
        protectionNotice: 'Caution Order: PSR 30 km/h applied automatically at Ramanagara',
      },
      {
        id: 'M-SWR-W1-03',
        corridor: 'SBC-MYS',
        department: 'Signal & Telecom',
        workType: 'Electronic Interlocking (EI) & Dual MSDAC Axle Counter Testing',
        machine: 'S&T Route Verification Inspection Trolley',
        timeWindow: '01:30 – 04:00 IST',
        durationMinutes: 150,
        savingsMinutes: 30,
        priority: 91.0,
        protectionNotice: 'Block Proving by Axle Counter (BPAC) re-verified at Channapatna',
      },
      {
        id: 'M-SWR-W1-04',
        corridor: 'SBC-MYS',
        department: 'Joint (Eng + S&T)',
        workType: 'Turnout Point Machine Renewal & Thick Web Switch Overhaul (km 12-18)',
        machine: 'Unimat 08-4S Switch & Turnout Tamper',
        timeWindow: '00:45 – 04:15 IST',
        durationMinutes: 210,
        savingsMinutes: 40,
        priority: 95.1,
        protectionNotice: 'Kengeri Yard Down line isolated, Up Main line kept live for coaching rakes',
      },
    ],
  },
  {
    weekNumber: 2,
    title: 'Week 2: SBC-UBL Northern Trunk Consolidation (Tumakuru - Arsikere - Hubballi)',
    dateRange: '08 Sep – 14 Sep 2026',
    focusArea: 'SBC-UBL (Bengaluru - Hubballi Mainline)',
    corridorKey: 'SBC-UBL',
    possessionCount: 7,
    fusedMegaBlocks: 3,
    downtimeSavedMinutes: 140,
    blocks: [
      {
        id: 'M-SWR-W2-01',
        corridor: 'SBC-UBL',
        department: 'Engineering',
        workType: 'High Output Plain Track Tamping & Dynamic Track Stabilizing (km 165-174)',
        machine: 'CSM-09 Continuous Action Tamper + DGS Stabilizer',
        timeWindow: '00:30 – 04:30 IST',
        durationMinutes: 240,
        savingsMinutes: 45,
        priority: 93.6,
        protectionNotice: 'Birur Jn loop line kept open for non-stop coal freight rakes',
      },
      {
        id: 'M-SWR-W2-02',
        corridor: 'SBC-UBL',
        department: 'Joint (Eng + TRD)',
        workType: '25kV Catenary Wire Re-tensioning & Contact Dropper Replacement',
        machine: '09-3X Dynamic Tamper + 4-Wheeler Tower Car',
        timeWindow: '01:00 – 04:30 IST',
        durationMinutes: 210,
        savingsMinutes: 55,
        priority: 96.0,
        protectionNotice: 'Davangere sub-station feeder isolated with earth-rod safety verification',
      },
      {
        id: 'M-SWR-W2-03',
        corridor: 'SBC-UBL',
        department: 'Signal & Telecom',
        workType: 'Automatic Block Signaling (ABS) Continuous Track Circuit Verification',
        machine: 'S&T Signal Calibration Unit Van S&T-04',
        timeWindow: '01:15 – 04:45 IST',
        durationMinutes: 210,
        savingsMinutes: 40,
        priority: 90.2,
        protectionNotice: 'Haveri - Hubballi auto-signals clamped and safe-padlocked',
      },
      {
        id: 'M-SWR-W2-04',
        corridor: 'SBC-UBL',
        department: 'Engineering',
        workType: 'Glued Insulated Rail Joint (GJ) Replacement & Flash Butt Welding',
        machine: 'Mobile Flash Butt Welding Plant FBWP-03',
        timeWindow: '01:00 – 04:00 IST',
        durationMinutes: 180,
        savingsMinutes: 35,
        priority: 92.8,
        protectionNotice: 'Tumakuru Yard USFD digital flaw detection certified',
      },
    ],
  },
  {
    weekNumber: 3,
    title: 'Week 3: SBC-YPR-BAY Heavy Mineral Freight & Ballari Ore Corridor',
    dateRange: '15 Sep – 21 Sep 2026',
    focusArea: 'SBC-YPR-BAY (Yesvantpur - Ballari - Toranagallu)',
    corridorKey: 'SBC-YPR-BAY',
    possessionCount: 9,
    fusedMegaBlocks: 4,
    downtimeSavedMinutes: 185,
    blocks: [
      {
        id: 'M-SWR-W3-01',
        corridor: 'SBC-YPR-BAY',
        department: 'Joint (Eng + TRD)',
        workType: 'Heavy Axle Load Track Renewal & 25kV Catenary Upgradation (km 280-295)',
        machine: 'BCM-14 High Output Cleaner + 8-Wheeler Tower Car',
        timeWindow: '00:00 – 04:30 IST',
        durationMinutes: 270,
        savingsMinutes: 75,
        priority: 97.8,
        protectionNotice: 'Toranagallu JSW steel plant freight paths preserved without siding stall',
      },
      {
        id: 'M-SWR-W3-02',
        corridor: 'SBC-YPR-BAY',
        department: 'Joint (Eng + S&T)',
        workType: 'Switch Expansion Joint (SEJ) Realignment & Point Motor Tuning (km 6-12)',
        machine: 'Hydraulic Rail Stressor & Point Testing Rig',
        timeWindow: '01:00 – 04:00 IST',
        durationMinutes: 180,
        savingsMinutes: 35,
        priority: 94.0,
        protectionNotice: 'Yesvantpur North Yard coaching yard entry maintained via Chord Line',
      },
      {
        id: 'M-SWR-W3-03',
        corridor: 'SBC-YPR-BAY',
        department: 'Engineering',
        workType: 'Shoulder Ballast Cleaning & De-stressing of Long Welded Rails (LWR)',
        machine: 'FRM-80 Shoulder Ballast Cleaner',
        timeWindow: '01:30 – 04:30 IST',
        durationMinutes: 180,
        savingsMinutes: 40,
        priority: 91.5,
        protectionNotice: 'Chikjajur - Rayadurg single line rail temperature monitored',
      },
      {
        id: 'M-SWR-W3-04',
        corridor: 'SBC-YPR-BAY',
        department: 'Signal & Telecom',
        workType: 'Route Relay Interlocking (RRI) Modernization & Signal Lamp Checks',
        machine: 'RRI Diagnostic Van S&T-02',
        timeWindow: '01:30 – 04:30 IST',
        durationMinutes: 180,
        savingsMinutes: 35,
        priority: 89.6,
        protectionNotice: 'Hosapete Jn freight classification yard routes confirmed',
      },
    ],
  },
  {
    weekNumber: 4,
    title: 'Week 4: MYS-SMET & Hassan Link Malnad & Shimoga Regional Line Overhaul',
    dateRange: '22 Sep – 30 Sep 2026',
    focusArea: 'MYS-SMET (Mysuru - Hassan - Shivamogga Town)',
    corridorKey: 'MYS-SMET',
    possessionCount: 8,
    fusedMegaBlocks: 3,
    downtimeSavedMinutes: 130,
    blocks: [
      {
        id: 'M-SWR-W4-01',
        corridor: 'MYS-SMET',
        department: 'Engineering',
        workType: 'Plain Track Tamping & Deep Ballast Consolidation (km 110-122)',
        machine: 'CSM-09 Continuous Action Tamper',
        timeWindow: '00:30 – 04:30 IST',
        durationMinutes: 240,
        savingsMinutes: 50,
        priority: 95.3,
        protectionNotice: 'Shivamogga - Bengaluru Janshatabdi corridor safeguarded',
      },
      {
        id: 'M-SWR-W4-02',
        corridor: 'MYS-SMET',
        department: 'TRD',
        workType: 'Ghat Section Catenary Inspection & Silicon Insulator High-Pressure Washing',
        machine: 'TRD Ghat Tower Car + High Pressure Jet Rig',
        timeWindow: '01:00 – 04:30 IST',
        durationMinutes: 210,
        savingsMinutes: 45,
        priority: 91.7,
        protectionNotice: 'Sakleshpur Ghat incline banker engine path cleared',
      },
      {
        id: 'M-SWR-W4-03',
        corridor: 'MYS-SMET',
        department: 'Joint (Eng + S&T)',
        workType: 'Block Proving by Axle Counter (BPAC) System Upgrade & Turnout Check',
        machine: 'S&T Route Verification Trolley',
        timeWindow: '01:00 – 04:00 IST',
        durationMinutes: 180,
        savingsMinutes: 35,
        priority: 88.2,
        protectionNotice: 'Mysuru North Yard Chamundi Express rake maintenance window honored',
      },
    ],
  },
];

export default function MonthlyPlanPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [sanctionSuccess, setSanctionSuccess] = useState<boolean>(false);
  const [sanctionToken, setSanctionToken] = useState<string>('');

  const addAuditEntry = useAppStore((s) => s.addAuditEntry);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);

  const currentWeekData =
    SWR_MONTHLY_WEEKS.find((w) => w.weekNumber === selectedWeek) || SWR_MONTHLY_WEEKS[0];

  const filteredBlocks = currentWeekData.blocks.filter((b) => {
    if (departmentFilter === 'ALL') return true;
    if (departmentFilter === 'JOINT') return b.department.startsWith('Joint');
    return b.department === departmentFilter;
  });

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Week',
      'Block ID',
      'Corridor',
      'Department',
      'Work Type',
      'Machine Rake',
      'Time Window',
      'Duration (Mins)',
      'Savings (Mins)',
      'Priority',
      'Safety Protection Notice',
    ];

    const rows: string[][] = [];
    SWR_MONTHLY_WEEKS.forEach((w) => {
      w.blocks.forEach((b) => {
        rows.push([
          'September 2026',
          `Week ${w.weekNumber}`,
          b.id,
          b.corridor,
          b.department,
          `"${b.workType}"`,
          `"${b.machine}"`,
          `"${b.timeWindow}"`,
          b.durationMinutes.toString(),
          b.savingsMinutes.toString(),
          b.priority.toString(),
          `"${b.protectionNotice}"`,
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SWR_Karnataka_Monthly_Corridor_Master_Schedule_Sep2026.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct DRM Sanction handler
  const handleSanctionMonthlyMemo = () => {
    const token = `DRM-SWR-SEP26-${Math.floor(1000 + Math.random() * 9000)}`;
    setSanctionToken(token);
    setSanctionSuccess(true);

    addAuditEntry({
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' IST',
      device_role: 'SECTION_CONTROLLER',
      action_type: 'BLOCK_SANCTIONED',
      token_id: token,
      corridor: 'SWR Karnataka Network (SBC-MYS/UBL/BAY/SMET)',
      station: 'HQ Control SBC',
      department: 'Joint (Eng + TRD + S&T)',
      title: '30-Day Monthly Corridor Master Schedule Officially Sanctioned by DRM',
      summary:
        'Divisional Railway Manager (SWR) sanctioned 32 monthly possessions across 4 key Karnataka corridors. Fused 14 Mega-Blocks, saving 620 mins downtime while guaranteeing zero VIP passenger delays.',
    });

    setTimeout(() => {
      setSanctionSuccess(false);
    }, 6000);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Header with Weekly/Monthly Tab Switcher & SWR Division Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-xs">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wide">
                Monthly Corridor Master Plan (30-Day Strategic Horizon)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0F2D6B] border border-blue-200">
                SWR KARNATAKA
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              South Western Railway • Bengaluru (SBC), Mysuru (MYS), Hubballi (UBL) • September 2026 Master Cycle
            </p>
          </div>
        </div>

        {/* Schedule View Toggle Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <Link
            href="/plans/weekly"
            className="px-3 py-1.5 rounded-md font-bold text-slate-600 hover:text-slate-900 transition flex items-center space-x-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
            <span>Weekly Schedule (7 Days)</span>
          </Link>
          <Link
            href="/plans/monthly"
            className="px-3 py-1.5 rounded-md font-bold bg-[#0F2D6B] text-white shadow-xs flex items-center space-x-1.5"
          >
            <CalendarRange className="w-3.5 h-3.5 text-white" />
            <span>Monthly Master (30 Days)</span>
          </Link>
        </div>

        {/* Action Buttons: Export CSV & Sanction DRM Memo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            title="Download full 30-day SWR schedule as CSV"
          >
            <Download className="w-4 h-4 text-[#0F2D6B]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSanctionMonthlyMemo}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs flex items-center space-x-2 transition shadow-xs"
          >
            <FileCheck className="w-4 h-4" />
            <span>Sanction DRM Memo</span>
          </button>
        </div>
      </div>

      {/* Sanction Success Alert */}
      {sanctionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-slate-900">
                30-Day Monthly Corridor Schedule Approved & Signed by DRM!
              </p>
              <p className="text-[11px] text-emerald-800">
                Official Sanction Token: <span className="font-mono font-bold text-slate-900">{sanctionToken}</span> • Recorded in statutory Train Control Log Book
              </p>
            </div>
          </div>
          <Link
            href="/audit"
            className="px-2.5 py-1 bg-emerald-600 rounded text-[10px] font-bold text-white hover:bg-emerald-700 transition"
          >
            View in Log Book →
          </Link>
        </div>
      )}

      {/* 2. Monthly Cumulative KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Total SWR Possessions</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-slate-900">32 Blocks</span>
            <span className="text-[10px] text-slate-500">across 4 corridors</span>
          </div>
          <p className="text-[10px] text-blue-700 flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>100% Night Windows (00:00–05:00)</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Fused Mega-Blocks</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-purple-700">14 Joint Packages</span>
          </div>
          <p className="text-[10px] text-purple-700 flex items-center space-x-1 font-semibold">
            <Zap className="w-3 h-3 text-purple-600" />
            <span>Track + OHE + S&T Bundled</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Downtime Saved</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-emerald-700">+620 Minutes</span>
            <span className="text-[10px] text-slate-500">(10.3 Hours freed)</span>
          </div>
          <p className="text-[10px] text-emerald-700 flex items-center space-x-1 font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>₹48.6 Lakhs Operational Savings</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold">Punctuality Assurance</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl font-bold text-emerald-700">99.8%</span>
            <span className="text-[10px] text-slate-500">Punctuality Index</span>
          </div>
          <p className="text-[10px] text-emerald-700 flex items-center space-x-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>0 Vande Bharat / Intercity Delays</span>
          </p>
        </div>
      </div>

      {/* 3. Operational Logic & AI Shadow Packing Architecture Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* IR Operations Explanation */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 lg:col-span-1 shadow-xs">
          <div className="flex items-center space-x-2 text-[#0F2D6B]">
            <Info className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              How Monthly Planning Operates in IR
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            In Indian Railways, monthly planning forms the <span className="text-slate-900 font-bold">Divisional Master Gazette</span> approved by CPTM and DRM. 
            Heavy track machines (BCMs, CSM tampers, Tower Wagons) require inter-divisional rake movement schedules 30 days in advance.
          </p>
          <div className="space-y-1.5 pt-2 text-[10px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Translates to Weekly Tactical Plans & Daily T/351 Disconnections</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
              <span>Synchronizes power blocks with overhead traction sub-stations</span>
            </div>
          </div>
        </div>

        {/* Shadow Bundling Comparison Card */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 lg:col-span-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-800">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                RailBlock AI Multi-Department Shadow Auto-Packer
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              70% Track Closure Reduction
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 space-y-1.5">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Legacy Sequential Method</span>
              <div className="space-y-1 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>Track Tamping:</span>
                  <span className="text-slate-500">00:30–03:30 (180m)</span>
                </div>
                <div className="flex justify-between">
                  <span>OHE Wire Repair:</span>
                  <span className="text-slate-500">04:00–07:00 (180m)</span>
                </div>
                <div className="flex justify-between">
                  <span>Signal Axle Counter:</span>
                  <span className="text-slate-500">08:00–10:30 (150m)</span>
                </div>
                <div className="pt-1.5 border-t border-rose-200 flex justify-between font-bold text-rose-800">
                  <span>Total Line Downtime:</span>
                  <span>510 mins (3 closures, 8 delays)</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">RailBlock AI Fused Mega-Block</span>
              <div className="space-y-1 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>Single Fused Window:</span>
                  <span className="text-emerald-850 font-bold text-slate-900">00:30–04:30 (240m)</span>
                </div>
                <div className="flex justify-between">
                  <span>Co-located Machines:</span>
                  <span className="text-slate-500">Tamper + Tower Car + S&T</span>
                </div>
                <div className="flex justify-between">
                  <span>Passenger Impact:</span>
                  <span className="text-emerald-700 font-bold">Zero trains delayed</span>
                </div>
                <div className="pt-1.5 border-t border-emerald-200 flex justify-between font-bold text-emerald-800">
                  <span>Net Savings:</span>
                  <span>+270 mins downtime saved/event</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4-Week Strategic Calendar Matrix Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            30-Day Master Schedule: Select Operating Week
          </span>
          <span className="text-[10px] text-slate-500">September 2026 SWR Karnataka Division</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SWR_MONTHLY_WEEKS.map((week) => {
            const isSelected = week.weekNumber === selectedWeek;
            return (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 shadow-xs ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#0F2D6B] ring-2 ring-[#0F2D6B]/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Week {week.weekNumber}</span>
                    <span className="text-[10px] text-[#0F2D6B] font-bold px-1.5 py-0.2 rounded bg-blue-100/70 border border-blue-200">
                      {week.dateRange}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-700 line-clamp-1">{week.focusArea}</h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{week.possessionCount} Possessions</span>
                  <span className="text-purple-700 font-bold">+{week.downtimeSavedMinutes}m saved</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Week Detail & Master Possession Packages */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        {/* Week Header & Department Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentWeekData.title}</h3>
            <p className="text-[11px] text-slate-500">
              Dates: {currentWeekData.dateRange} • Focus Corridor: <span className="text-[#0F2D6B] font-bold">{currentWeekData.focusArea}</span>
            </p>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Filter Dept:</span>
            {['ALL', 'JOINT', 'Engineering', 'Signal & Telecom', 'TRD'].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                  departmentFilter === dept
                    ? 'bg-[#0F2D6B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
              >
                {dept === 'JOINT' ? '⚡ Joint Mega-Blocks' : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Possession Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBlocks.map((block) => {
            const isJoint = block.department.startsWith('Joint');
            return (
              <div
                key={block.id}
                className={`p-4 rounded-xl border transition space-y-2.5 ${
                  isJoint
                    ? 'bg-purple-50/40 border-purple-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{block.id}</span>
                    <span className="text-[10px] text-[#0F2D6B] font-bold">[{block.corridor}]</span>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-sans font-bold border ${
                      isJoint
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : block.department === 'Engineering'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : block.department === 'TRD'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {block.department}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800">{block.workType}</h4>
                  <p className="text-[10px] text-slate-600 flex items-center space-x-1">
                    <Wrench className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Machine Rake: {block.machine}</span>
                  </p>
                  <p className="text-[10px] text-slate-600 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-slate-700">{block.protectionNotice}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                  <span className="flex items-center space-x-1 text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {block.timeWindow} ({block.durationMinutes}m window)
                    </span>
                  </span>

                  {block.savingsMinutes > 0 && (
                    <span className="text-purple-800 font-bold px-2 py-0.5 rounded bg-purple-100 border border-purple-200">
                      +{block.savingsMinutes}m saved
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
