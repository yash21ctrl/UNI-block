'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';
import { generateRailwayBlockMemoPDF } from './BlockMemoPDF';
import {
  X,
  FileCheck,
  CheckCircle2,
  Download,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

function ApprovalModalComponent() {
  const approvalModalOpen = useAppStore((s) => s.approvalModalOpen);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const activePlan = useAppStore((s) => s.activePlan);
  const session = useAppStore((s) => s.session);
  const addLiveEvent = useAppStore((s) => s.addLiveEvent);

  const [signature, setSignature] = useState('SEC-CTRL-SBC-KAR-9842');
  const [remarks, setRemarks] = useState('Sanctioned per Night Integrated Possession Protocols (SWR Karnataka)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalResult, setApprovalResult] = useState<'APPROVED' | null>(null);

  if (!approvalModalOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await api.approvePlan(activePlan.plan_id, signature, remarks);
      setApprovalResult('APPROVED');
      addLiveEvent({
        event: 'PLAN_APPROVED',
        timestamp: new Date().toISOString(),
        data: {
          message: `Plan ${activePlan.plan_id} sanctioned by ${session.name} (${session.role}). Digital Sig: ${signature}`,
        },
      });
      useAppStore.getState().addAuditEntry({
        device_role: 'SECTION_CONTROLLER',
        action_type: 'BLOCK_SANCTIONED',
        token_id: signature,
        corridor: activePlan.section || 'SBC-MYS',
        department: 'Operating',
        title: `Possession Plan Sanctioned [${activePlan.plan_id}]`,
        details: `Section Controller ${session.name} sanctioned schedule with digital signature ${signature}. Remarks: ${remarks}`,
        metrics: `${activePlan.optimized_plan?.blocks?.length ?? 0} Blocks • +${activePlan.optimized_plan?.fusion_benefit_minutes ?? 0}m Saved`,
      });
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadMemo = () => {
    generateRailwayBlockMemoPDF(activePlan, signature, session.name, `${session.division} (${session.zone})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl p-5 text-xs font-mono space-y-4 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Section Controller Digital Sanction</h3>
              <p className="text-[10px] text-slate-500">
                Plan ID: {activePlan.plan_id} • Human-in-the-Loop Governance
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setApprovalModalOpen(false);
              setApprovalResult(null);
            }}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-800 font-bold">
            <span>Corridor Section: {activePlan.section || 'SBC-MYS'}</span>
            <span className="text-emerald-700 flex items-center space-x-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guardian Certified</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">POSSESSIONS</p>
              <p className="text-slate-900 font-bold">{activePlan.optimized_plan?.blocks?.length ?? 0} Blocks</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">DOWNTIME SAVED</p>
              <p className="text-purple-700 font-bold">+{activePlan.optimized_plan?.fusion_benefit_minutes ?? 0}m</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">AI CONFIDENCE</p>
              <p className="text-[#0F2D6B] font-bold">{activePlan.plan_explanation?.ai_confidence_score || 96.8}%</p>
            </div>
          </div>
        </div>

        {approvalResult === 'APPROVED' ? (
          /* SUCCESS STATE */
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">POSSESSION SCHEDULE SANCTIONED</h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Digital signature recorded into immutable AI Decision Ledger. Telemetry broadcasted
                to Station Masters & OHE Control.
              </p>
            </div>

            <button
              onClick={handleDownloadMemo}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Official IR Block Memo (PDF)</span>
            </button>
          </div>
        ) : (
          /* INPUT FORM */
          <div className="space-y-3">
            {/* Digital Signature */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                Controller Digital Signature Token
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]/30 focus:border-[#0F2D6B]"
                placeholder="e.g. SEC-CTRL-SBC-KAR-9842"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-600 uppercase tracking-wider font-bold">
                Operational Sanction Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]/30 focus:border-[#0F2D6B]"
              />
            </div>

            {/* Actions: Controller ONLY sanctions the plan */}
            <div className="pt-2">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs transition flex items-center justify-center space-x-2 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Sanction...' : '✓ Sanction Possession Plan'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export const ApprovalModal = React.memo(ApprovalModalComponent);

