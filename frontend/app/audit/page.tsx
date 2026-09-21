'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore, LogEntry } from '../../lib/store';
import { formatDateTime } from '../../lib/format';
import {
  FileCheck,
  ShieldCheck,
  Cpu,
  UserCheck,
  Search,
  Filter,
  Lock,
  Download,
  Trash2,
  Radio,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Tablet,
  Copy,
  Check,
} from 'lucide-react';

export default function AuditLedgerPage() {
  const auditLog = useAppStore((s) => s.auditLog);
  const clearAuditLog = useAppStore((s) => s.clearAuditLog);
  const session = useAppStore((s) => s.session);

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'FIELD_JE' | 'SECTION_CONTROLLER' | 'STATION_MASTER' | 'AI_ENGINE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredEntries = useMemo(() => {
    return auditLog.filter((entry) => {
      const matchesRole = roleFilter === 'ALL' || entry.device_role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entry.token_id?.toLowerCase().includes(q) ||
        entry.corridor?.toLowerCase().includes(q) ||
        entry.station?.toLowerCase().includes(q) ||
        entry.title?.toLowerCase().includes(q) ||
        entry.details?.toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [auditLog, roleFilter, searchQuery]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'Device Role', 'Action Type', 'Token ID', 'Corridor', 'Station', 'Department', 'Title', 'Operational Details', 'Metrics', 'SHA-256 Hash'];
    const rows = filteredEntries.map((e) => [
      `"${e.timestamp}"`,
      `"${e.device_role}"`,
      `"${e.action_type}"`,
      `"${e.token_id}"`,
      `"${e.corridor}"`,
      `"${e.station || ''}"`,
      `"${e.department}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      `"${(e.metrics || '').replace(/"/g, '""')}"`,
      `"${e.sha256}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RailBlock_SWR_LogBook_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Official SWR Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2D6B] shrink-0 shadow-xs">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-wide">
                Central Train Control & Station Decision Log Book
              </h1>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold inline-flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>LIVE CLOUD SYNCHRONIZED</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              South Western Railway • Karnataka Division • Form T/351 Statutory Audit Trail • SR 4.15 Regulatory Compliance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0F2D6B] border border-blue-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            title="Download full register as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Official Log (CSV)</span>
          </button>
          <button
            onClick={clearAuditLog}
            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-xs"
            title="Clear current diary session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Origin Role Filter Tabs & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Role Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Log Entries', icon: FileCheck },
              { id: 'FIELD_JE', label: '📱 Field JE (T/351 Demands)', icon: Smartphone },
              { id: 'SECTION_CONTROLLER', label: '💻 Controller Sanctions', icon: Laptop },
              { id: 'STATION_MASTER', label: '📟 Station Master Diary', icon: Tablet },
              { id: 'AI_ENGINE', label: '🧠 AI Optimization Core', icon: Cpu },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = roleFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-[#0F2D6B] text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Recorded Decisions: <b className="text-[#0F2D6B] font-bold">{filteredEntries.length}</b> / {auditLog.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search log book by Token (e.g. MEMO-SWR-..., FORM-T351-...), Station (Mandya, SBC), Corridor, or details..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]/30 focus:border-[#0F2D6B] font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Log Book Chronological Ledger */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 space-y-2 shadow-xs">
            <FileCheck className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No decisions match your filter criteria.</p>
            <p className="text-xs text-slate-500">
              Actions taken on the Field JE mobile terminal, Controller Cockpit, or Station Master terminal will appear here in real time.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isJE = entry.device_role === 'FIELD_JE';
            const isController = entry.device_role === 'SECTION_CONTROLLER';
            const isSM = entry.device_role === 'STATION_MASTER';

            const cardBorder = isJE
              ? 'border-l-4 border-l-amber-500 bg-white border border-slate-200'
              : isController
              ? 'border-l-4 border-l-emerald-600 bg-white border border-slate-200'
              : isSM
              ? 'border-l-4 border-l-[#0F2D6B] bg-white border border-slate-200'
              : 'border-l-4 border-l-purple-600 bg-white border border-slate-200';

            const roleBadge = isJE ? (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] flex items-center space-x-1">
                <Smartphone className="w-3 h-3" />
                <span>FIELD JE • FORM T/351</span>
              </span>
            ) : isController ? (
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center space-x-1">
                <Laptop className="w-3 h-3" />
                <span>CONTROLLER SANCTION DESK</span>
              </span>
            ) : isSM ? (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0F2D6B] border border-blue-200 font-bold text-[10px] flex items-center space-x-1">
                <Tablet className="w-3 h-3" />
                <span>STATION MASTER DIARY</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-bold text-[10px] flex items-center space-x-1">
                <Cpu className="w-3 h-3" />
                <span>AI SAFETY GUARDIAN</span>
              </span>
            );

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl transition shadow-xs space-y-2.5 text-xs ${cardBorder}`}
              >
                {/* Top Strip: Role Badge + Token + Time */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    {roleBadge}
                    {entry.corridor && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {entry.corridor} {entry.station ? `• ${entry.station}` : ''}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      [{entry.department}]
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDateTime(entry.timestamp)}</span>
                  </div>
                </div>

                {/* Main Content: Title & Details */}
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center space-x-2">
                    <span>{entry.title}</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    {entry.details}
                  </p>
                </div>

                {/* Metrics Callout Strip */}
                {entry.metrics && (
                  <div className="px-2.5 py-1 rounded bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 font-mono">
                    📊 <span className="font-semibold">{entry.metrics}</span>
                  </div>
                )}

                {/* Bottom Footer: Official Token + SHA-256 Seal */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Official Token:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-bold font-mono">
                      {entry.token_id}
                    </span>
                    <button
                      onClick={() => handleCopy(entry.token_id)}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                      title="Copy token to clipboard"
                    >
                      {copiedToken === entry.token_id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">Cryptographic Hash:</span>
                    <span className="text-slate-600 truncate max-w-[200px]" title={entry.sha256}>
                      {entry.sha256.slice(0, 24)}...
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
