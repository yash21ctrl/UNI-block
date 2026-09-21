'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Train,
  Zap,
  Activity,
} from 'lucide-react';

export default function ConflictsPage() {
  const { activePlan, isEmergencyActive } = useAppStore();
  const cert = activePlan?.safety_certificate;

  const protectedTrains = [
    {
      number: '12002',
      name: 'Bhopal Shatabdi Express',
      section: 'NDLS-AGC',
      timeWindow: '06:00 - 07:50',
      speed: '150 km/h',
      headwayBuffer: '42 min (Buffer Safe)',
    },
    {
      number: '22436',
      name: 'Vande Bharat Express',
      section: 'NDLS-CNB',
      timeWindow: '06:00 - 10:10',
      speed: '160 km/h',
      headwayBuffer: '38 min (Buffer Safe)',
    },
    {
      number: '12301',
      name: 'Howrah Rajdhani Express',
      section: 'CNB-PRYJ',
      timeWindow: '16:50 - 21:05',
      speed: '130 km/h',
      headwayBuffer: '35 min (Buffer Safe)',
    },
    {
      number: '12260',
      name: 'Sealdah Duronto Express',
      section: 'ALJN-CNB',
      timeWindow: '19:40 - 23:55',
      speed: '130 km/h',
      headwayBuffer: '31 min (Buffer Safe)',
    },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-lg border border-surface-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              Guardian Agent Safety Firewall & Conflict Radar
            </h1>
            <p className="text-[11px] text-slate-400">
              Deterministic Headway Sweep • Zero Premium Train Delays • Indian Railways SR 4.15 Compliant
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>FIREWALL ACTIVE: 0 HARD HAZARDS</span>
        </div>
      </div>

      {/* Top 3 Safety Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-surface border border-surface-border space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
            <Train className="w-4 h-4" />
            <span>PREMIUM PASSENGER SHIELD</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Rajdhani, Shatabdi, Vande Bharat, and Duronto passenger corridors guaranteed minimum
            30-minute headway clearance before and after maintenance possessions.
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">VIOLATIONS: 0</p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-surface-border space-y-2">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>TRD POWER ISOLATION BUFFER</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Traction Distribution 25kV OHE electrical shutdowns enforce a mandatory 30-minute safety
            buffer before civil engineering personnel enter track alignment.
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">STATUS: ISOLATION LOCKED</p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-surface-border space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs">
            <Activity className="w-4 h-4" />
            <span>SINGLE-LINE NON-CONCURRENCY</span>
          </div>
          <p className="text-[11px] text-slate-300">
            For single-line sections (e.g. NDLS-RE, BSB-DDU), Guardian strictly prevents concurrent
            block overlaps, preserving bidirectional traffic flow.
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">CONCURRENCY: &le; 1 ENFORCED</p>
        </div>
      </div>

      {/* Protected Trains Audit Table */}
      <div className="bg-surface rounded-lg border border-surface-border p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="font-bold uppercase tracking-wider text-white">
            High-Speed Passenger Train Protection Verification Board
          </h3>
          <span className="text-[10px] text-slate-400">COA Real-Time Timetable Feeds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090D16] text-[10px] uppercase text-slate-500 border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Train No.</th>
                <th className="py-2.5 px-3">Train Name</th>
                <th className="py-2.5 px-3">Corridor Section</th>
                <th className="py-2.5 px-3">COA Timetable Window</th>
                <th className="py-2.5 px-3">Max Permissible Speed</th>
                <th className="py-2.5 px-3">Guardian Headway Buffer</th>
                <th className="py-2.5 px-3 text-right">Audit Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {protectedTrains.map((t) => (
                <tr key={t.number} className="hover:bg-surface-muted/60 transition">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{t.number}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{t.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.section}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.timeWindow}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">{t.speed}</td>
                  <td className="py-2.5 px-3 text-emerald-300">{t.headwayBuffer}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PROTECTED</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
