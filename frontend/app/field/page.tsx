import Link from 'next/link';
import { Wrench, ShieldCheck, ArrowRight, Activity, Radio, ExternalLink } from 'lucide-react';

export default function FieldHomePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      {/* Title Hero */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>SOUTH WESTERN RAILWAY • KARNATAKA DIVISION</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Field & Station Master Operating Terminal
        </h1>
        <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
          Closed-loop maintenance permit execution portal connecting Field JEs, Station Masters, and the Bengaluru Divisional Central Cockpit.
        </p>
      </div>

      {/* Role Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Role 1: Field JE */}
        <Link
          href="/field/request"
          className="group block p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 transition shadow-lg text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
              Field Junior Engineer Portal
            </h2>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Submit new maintenance block demands for Engineering (Track), S&T (Signals), or TRD (25kV OHE). Directly ingests into AI Priority Scorer.
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400">
            <span>• Mandya / Ramanagara / SBC</span>
            <span>• Duration 60-180m</span>
          </div>
        </Link>

        {/* Role 2: Station Master */}
        <Link
          href="/station"
          className="group block p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 transition shadow-lg text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white group-hover:text-amber-300 transition">
              Station Master Terminal
            </h2>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Verify sanctioned block memos from Bengaluru DRM Control Office, grant local disconnection permits, or execute instant ground hazard deferrals (208ms auto-reschedule).
          </p>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-amber-400">
            <span>• Disconnection Permits</span>
            <span>• Emergency Deferral</span>
          </div>
        </Link>
      </div>

      {/* Controller Cockpit Quick Jump */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-slate-300">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Divisional Central Cockpit is running on <b>Port 3000</b> (Bengaluru DRM HQ)</span>
        </div>
        <Link
          href="/cockpit"
          className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold flex items-center space-x-1 transition"
        >
          <span>Open Cockpit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
