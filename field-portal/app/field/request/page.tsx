'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { submitFieldDemand, FieldDemandPayload } from '../../../lib/api';
import { Wrench, CheckCircle2, ArrowLeft, Send, Sparkles, AlertCircle, Clock } from 'lucide-react';

export default function FieldRequestPage() {
  const [department, setDepartment] = useState<'Engineering' | 'Signal & Telecom' | 'Traction Distribution'>('Engineering');
  const [section, setSection] = useState('SBC-MYS');
  const [kmFrom, setKmFrom] = useState(105.0);
  const [kmTo, setKmTo] = useState(108.0);
  const [duration, setDuration] = useState(120);
  const [reasonCategory, setReasonCategory] = useState('Through Rail Renewal (TRR)');
  const [customRemarks, setCustomRemarks] = useState('USFD flaw detected near Mandya outer home signal. Flaw category IMR.');
  const [submitterName, setSubmitterName] = useState('P. Ramesh, JE (P-Way/Mandya)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: FieldDemandPayload = {
      department,
      section,
      km_from: Number(kmFrom),
      km_to: Number(kmTo),
      duration_minutes: Number(duration),
      reason: `[${reasonCategory}] ${customRemarks}`,
      submitter_name: submitterName,
    };

    try {
      const res = await submitFieldDemand(payload);
      setSubmittedResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Terminal Hub</span>
        </Link>
        <span className="text-[11px] font-mono text-cyan-400">
          FIELD JE MODULE • FORM T/351-DEMAND
        </span>
      </div>

      {/* Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-400 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white">
            Field Junior Engineer Block Demand Form
          </h1>
          <p className="text-xs text-slate-400">
            Submit required track, signaling, or 25kV traction maintenance block demand to Bengaluru Divisional Control Office.
          </p>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submittedResponse && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/70 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>BLOCK DEMAND REGISTERED SUCCESSFULLY</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600">
              TASK ID: TSK-{submittedResponse.task_id}
            </span>
          </div>
          <p className="text-xs text-slate-200">
            {submittedResponse.message}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-emerald-300 font-mono border-t border-emerald-800/40">
            <span>Priority Urgency Score: <b>{submittedResponse.priority_score}/100</b></span>
            <span>•</span>
            <span>Corridor: <b>{submittedResponse.section}</b></span>
            <span>•</span>
            <span>Transmitted via WebSockets to Bengaluru Central Cockpit</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setSubmittedResponse(null)}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              + Submit Another Block Demand
            </button>
          </div>
        </div>
      )}

      {/* Demand Form */}
      {!submittedResponse && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg text-xs">
          {/* Submitter Info */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
              Field Officer / Junior Engineer:
            </label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Department Selector */}
          <div>
            <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Department:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Engineering', label: 'Civil Track (P-Way)', color: 'border-blue-500 bg-blue-950/40 text-blue-300' },
                { id: 'Signal & Telecom', label: 'Signal & Telecom (S&T)', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                { id: 'Traction Distribution', label: 'Traction 25kV (TRD)', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDepartment(d.id as any)}
                  className={`p-2.5 rounded-lg border text-center font-bold text-xs transition ${
                    department === d.id ? d.color + ' ring-1 ring-white/20' : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corridor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                Corridor Section:
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="SBC-MYS">SBC-MYS (Bengaluru - Mysuru, 138 km)</option>
                <option value="SBC-UBL">SBC-UBL (Bengaluru - Hubballi, 470 km)</option>
                <option value="SBC-YPR-BAY">SBC-YPR-BAY (Bengaluru - Ballari, 340 km)</option>
                <option value="MYS-SMET">MYS-SMET (Mysuru - Shivamogga, 210 km)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                Requested Duration:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value={60}>60 minutes (Short Window)</option>
                <option value={90}>90 minutes (Standard)</option>
                <option value={120}>120 minutes (2 Hours - Recommended)</option>
                <option value={180}>180 minutes (3 Hours - Heavy Machine)</option>
                <option value={240}>240 minutes (4 Hours - Mega Block)</option>
              </select>
            </div>
          </div>

          {/* KM Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                From Kilometer:
              </label>
              <input
                type="number"
                step="0.1"
                value={kmFrom}
                onChange={(e) => setKmFrom(Number(e.target.value))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                To Kilometer:
              </label>
              <input
                type="number"
                step="0.1"
                value={kmTo}
                onChange={(e) => setKmTo(Number(e.target.value))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Reason Category & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                Primary Maintenance Category:
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="Through Rail Renewal (TRR)">Through Rail Renewal (TRR) / Welding</option>
                <option value="Switch & Point Machine Overhaul">Switch & Point Machine Overhaul</option>
                <option value="OHE Catenary Wire Dropper Adjustment">OHE Catenary Wire Dropper Adjustment (Power Block)</option>
                <option value="Continuous Track Tamping (CSM)">Continuous Track Tamping (CSM Machine)</option>
                <option value="Digital Axle Counter Calibration">Digital Axle Counter Calibration</option>
                <option value="USFD Rail Defect Repair">USFD Rail Defect Repair (Flaw IMR/OBS)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                Field Diagnostic Remarks:
              </label>
              <textarea
                rows={3}
                value={customRemarks}
                onChange={(e) => setCustomRemarks(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                placeholder="Describe ground observation, defect severity, equipment gang required..."
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-black font-extrabold uppercase tracking-wider text-xs transition shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 fill-black" />
              <span>{isSubmitting ? 'Transmitting to Bengaluru Control...' : '📝 Submit Block Demand to Bengaluru Control'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
