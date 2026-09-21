'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { CORRIDORS } from '../../lib/constants';
import { DigitalTwinMap } from '../../components/twin/DigitalTwinMap';
import { SectionDrawer } from '../../components/twin/SectionDrawer';
import type { MapFilterType } from '../../components/twin/InnerTwinMap';
import {
  MapPin,
  Train,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function DigitalTwinPage() {
  const selectedSection = useAppStore((s) => s.selectedSection);
  const setSelectedSection = useAppStore((s) => s.setSelectedSection);
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencyDetails = useAppStore((s) => s.activeEmergencyDetails);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<MapFilterType>('ALL');
  const [focusSection, setFocusSection] = useState<string | null>(null);

  const activeEmergencyCount =
    activeEmergencies && activeEmergencies.length > 0
      ? activeEmergencies.length
      : isEmergencyActive
      ? 1
      : 0;

  const activeEmergencyCorridors = new Set(
    activeEmergencies && activeEmergencies.length > 0
      ? activeEmergencies.map((e) => e.corridor)
      : isEmergencyActive && activeEmergencyDetails
      ? [activeEmergencyDetails.corridor]
      : []
  );

  // Status Counts
  const runningCorridors = CORRIDORS.filter(
    (c) => c.status === 'CLEAR' && !activeEmergencyCorridors.has(c.section_code)
  );
  const maintenanceCorridors = CORRIDORS.filter((c) => c.status === 'POSSESSION_ACTIVE');
  const congestedCorridors = CORRIDORS.filter((c) => c.status === 'CONGESTED');

  const filteredList = CORRIDORS.filter((c) => {
    const isEmg = activeEmergencyCorridors.has(c.section_code);
    const isMaint = c.status === 'POSSESSION_ACTIVE';
    if (activeFilter === 'RUNNING') return !isMaint && !isEmg;
    if (activeFilter === 'MAINTENANCE') return isMaint;
    if (activeFilter === 'EMERGENCY') return isEmg;
    return true;
  });

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Page Header & Live Telemetry Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wide">
                Pan-Indian Railway GIS Network (NR, NCR, SR, SCR, SWR)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                LIVE GIS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {CORRIDORS.length} Corridors (12 North + 8 South) • {CORRIDORS.reduce((acc, c) => acc + c.total_km, 0).toLocaleString()} Total Track KM • Real-Time Occupancy & Multi-Agent Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Status KPI Strip (Running vs Maintenance vs Emergency) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Running Corridors Card */}
        <div
          onClick={() => setActiveFilter('RUNNING')}
          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-xs ${
            activeFilter === 'RUNNING'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Running / Clear Tracks</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-800">{runningCorridors.length}</span>
              <span className="text-[11px] text-slate-500">Corridors ({runningCorridors.reduce((acc, c) => acc + c.total_km, 0).toLocaleString()} km)</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Full Speed 130-160 km/h</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Train className="w-4 h-4" />
          </div>
        </div>

        {/* Maintenance Possessions Card */}
        <div
          onClick={() => setActiveFilter('MAINTENANCE')}
          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-xs ${
            activeFilter === 'MAINTENANCE'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/30'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Under Maintenance</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-800">{maintenanceCorridors.length}</span>
              <span className="text-[11px] text-slate-500">Possessions Active</span>
            </div>
            <p className="text-[10px] text-amber-700 mt-1 flex items-center space-x-1 font-semibold">
              <Wrench className="w-3 h-3 text-amber-600" />
              <span>AGC-JHS & PRYJ-DDU (PSR 30)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-700">
            <Wrench className="w-4 h-4" />
          </div>
        </div>

        {/* Congested Tracks */}
        <div
          onClick={() => setActiveFilter('ALL')}
          className="p-3.5 rounded-xl border bg-white hover:bg-slate-50 border-slate-200 cursor-pointer transition flex items-center justify-between shadow-xs"
        >
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Congested Traffic</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-bold text-[#0F2D6B]">{congestedCorridors.length}</span>
              <span className="text-[11px] text-slate-500">Section (NDLS-GZB)</span>
            </div>
            <p className="text-[10px] text-blue-700 mt-1 flex items-center space-x-1 font-semibold">
              <Activity className="w-3 h-3 text-blue-600" />
              <span>210 daily trains running</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B]">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {/* Safety & Asset Availability Card */}
        <div className="p-3.5 rounded-xl border bg-white hover:bg-slate-50 border-slate-200 transition flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Asset Availability</p>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-xl font-bold text-emerald-800">99.4%</span>
              <span className="text-[11px] text-slate-500">Target Met</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 flex items-center space-x-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Zero Conflict • Headway Shield</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-bold transition ${
              activeFilter === 'ALL'
                ? 'bg-[#0F2D6B] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Tracks ({CORRIDORS.length})
          </button>
          <button
            onClick={() => setActiveFilter('RUNNING')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 ${
              activeFilter === 'RUNNING'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>🟢 Running Tracks ({runningCorridors.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('MAINTENANCE')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 ${
              activeFilter === 'MAINTENANCE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>🟡 Under Maintenance ({maintenanceCorridors.length})</span>
          </button>
          {activeEmergencyCount > 0 && (
            <button
              onClick={() => setActiveFilter('EMERGENCY')}
              className={`px-3 py-1.5 rounded-md font-bold transition flex items-center space-x-1.5 ${
                activeFilter === 'EMERGENCY'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:text-rose-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>🚨 Emergency Slots ({activeEmergencyCount})</span>
            </button>
          )}
        </div>

        {/* Quick Camera Focus Buttons */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-[10px] text-slate-500 hidden sm:inline">Focus:</span>
          <button
            onClick={() => {
              setSelectedSection('NDLS-AGC');
              setFocusSection('NDLS-AGC');
              setDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition"
            title="Focus on Delhi-Agra High-Speed line"
          >
            🚄 NDLS-AGC (Main)
          </button>
          <button
            onClick={() => {
              setSelectedSection('MAS-SBC');
              setFocusSection('MAS-SBC');
              setDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition"
            title="Focus on Chennai-Bengaluru Line"
          >
            🌴 MAS-SBC (South)
          </button>
          <button
            onClick={() => {
              setSelectedSection('ERS-TVC');
              setFocusSection('ERS-TVC');
              setDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition"
            title="Focus on Kerala Coastal Line"
          >
            🌴 ERS-TVC (South)
          </button>
          <button
            onClick={() => {
              setSelectedSection('AGC-JHS');
              setFocusSection('AGC-JHS');
              setDrawerOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-bold transition"
            title="Focus on active maintenance possession"
          >
            🔧 AGC-JHS (Maint)
          </button>
        </div>
      </div>

      {/* 4. Main GIS Map & Corridor Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Box (8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Interactive Railway GIS Engine (No External API Keys Required)
              </span>
            </div>
            <span className="text-[10px] text-slate-500">CartoDB / OSM / Esri Tile Sets</span>
          </div>

          <DigitalTwinMap
            height="580px"
            filter={activeFilter}
            focusSection={focusSection}
            onSectionSelect={(sec) => {
              setSelectedSection(sec);
              setDrawerOpen(true);
            }}
          />
        </div>

        {/* Right Details Drawer (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          {drawerOpen ? (
            <SectionDrawer
              sectionCode={selectedSection}
              onClose={() => setDrawerOpen(false)}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  Network Corridors ({filteredList.length})
                </span>
                <span className="text-[10px] text-[#0F2D6B] font-bold">Click to Inspect</span>
              </div>

              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredList.map((c) => {
                  const isEmg = activeEmergencyCorridors.has(c.section_code);
                  const isMaint = c.status === 'POSSESSION_ACTIVE';

                  return (
                    <button
                      key={c.section_code}
                      onClick={() => {
                        setSelectedSection(c.section_code);
                        setFocusSection(c.section_code);
                        setDrawerOpen(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex justify-between items-center ${
                        c.section_code === selectedSection
                          ? 'bg-blue-50/80 border-[#0F2D6B] ring-1 ring-[#0F2D6B]/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-slate-900">{c.section_code}</p>
                          {isEmg ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              EMERGENCY
                            </span>
                          ) : isMaint ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              MAINTENANCE
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              RUNNING
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{c.section_name}</p>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs text-[#0F2D6B] font-bold">{c.total_km} km</span>
                        <p className="text-[9px] text-slate-500">{c.daily_trains} trains/day</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
