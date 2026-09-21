'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import { wsService } from '../../lib/ws';
import {
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Clock,
  RotateCw,
  AlertTriangle,
  Sparkles,
  User,
} from 'lucide-react';

function AppHeaderComponent() {
  const session = useAppStore((s) => s.session);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const isEmergencyActive = useAppStore((s) => s.isEmergencyActive);
  const activeEmergencies = useAppStore((s) => s.activeEmergencies);
  const setInspectBrainModalOpen = useAppStore((s) => s.setInspectBrainModalOpen);
  const resetToZero = useAppStore((s) => s.resetToZero);

  const [timeString, setTimeString] = useState('');
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);



  const handleReconnect = async () => {
    setIsReconnecting(true);
    wsService.disconnect();
    setTimeout(() => {
      wsService.connect();
      setIsReconnecting(false);
    }, 1000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-xs px-4 flex items-center justify-between z-30 sticky top-0 select-none">
      {/* Left: Branding & Section Controller Identity */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0F2D6B] flex items-center justify-center shadow-sm text-white font-mono font-black text-sm">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 tracking-tight text-base">RAILBLOCK AI</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-[#0F2D6B] border border-blue-200 font-mono">
                SWR v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono hidden sm:block">
              Section Controller Cockpit • SWR Karnataka Division
            </p>
          </div>
        </div>

        {/* Unified RailBlock AI Engine Status */}
        <div className="hidden md:flex items-center space-x-3 pl-4 border-l border-slate-200">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
            <span className="font-bold tracking-wide">AI Engine: Online (SIL-4)</span>
          </div>

          <button
            onClick={() => setInspectBrainModalOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-[#0F2D6B] hover:text-[#0c2456] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition flex items-center space-x-1.5 shadow-2xs"
            title="Inspect unified multi-agent cognitive architecture"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F2D6B]" />
            <span>Inspect AI Engine</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Reconnect, WS Pill, Clock, Reset, User Profile */}
      <div className="flex items-center space-x-2.5">
        {/* Reconnect Backend */}
        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          title="Reconnect to Backend / WebSocket"
        >
          <RotateCw className={`w-4 h-4 ${isReconnecting ? 'animate-spin text-[#0F2D6B]' : ''}`} />
        </button>

        {/* WebSocket Connection Pill */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            connectionStatus === 'CONNECTED'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
              : connectionStatus === 'RECONNECTING'
              ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
              : 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-600 animate-pulse'
                : connectionStatus === 'RECONNECTING'
                ? 'bg-amber-600 animate-ping'
                : 'bg-rose-600'
            }`}
          />
          <span className="hidden md:inline">{connectionStatus}</span>
        </div>

        {/* Clock */}
        <div className="hidden xl:flex items-center space-x-1.5 text-slate-700 font-mono text-xs px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#0F2D6B]" />
          <span suppressHydrationWarning className="font-bold">{timeString}</span>
        </div>

        {/* Reset Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => resetToZero()}
            className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold bg-slate-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition flex items-center space-x-1 shadow-2xs"
            title="Re-initialize Section Controller Corridor State"
          >
            <span>🔄 Reset State</span>
          </button>
        </div>

        {/* User Session */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden 2xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{session.name}</p>
            <p className="text-[10px] text-[#0F2D6B] font-mono font-bold leading-tight mt-0.5">{session.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
export const AppHeader = React.memo(AppHeaderComponent);

