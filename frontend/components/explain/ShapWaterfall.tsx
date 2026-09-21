'use client';

import React from 'react';
import { TopFeature } from '../../lib/types';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface ShapWaterfallProps {
  baseValue?: number;
  finalScore: number;
  features?: TopFeature[];
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  baseValue = 48.0,
  finalScore,
  features = [],
}) => {
  // Default realistic features if none passed or empty
  const displayFeatures =
    features.length > 0
      ? features
      : [
          {
            feature: 'oms_peak_acceleration_g',
            shap_value: 16.4,
            direction: 'INCREASES_URGENCY',
            value: 0.22,
          },
          {
            feature: 'severity',
            shap_value: 14.8,
            direction: 'INCREASES_URGENCY',
            value: 4,
          },
          {
            feature: 'tqi',
            shap_value: 11.2,
            direction: 'INCREASES_URGENCY',
            value: 36.5,
          },
          {
            feature: 'cumulative_gmt',
            shap_value: 7.6,
            direction: 'INCREASES_URGENCY',
            value: 52.0,
          },
          {
            feature: 'night_possession_slot',
            shap_value: -12.0,
            direction: 'DECREASES_URGENCY',
            value: '01:00-04:30',
          },
        ];

  // Calculate cumulative steps
  let currentVal = baseValue;
  const steps = displayFeatures.map((f) => {
    const start = currentVal;
    const change = f.shap_value;
    currentVal = Math.max(0, Math.min(100, currentVal + change));
    const isPositive = change >= 0;
    const label = f.feature
      .replace(/_/g, ' ')
      .replace('oms peak acceleration g', 'OMS Track Jerk (g)')
      .replace('tqi', 'Track Quality Index')
      .replace('cumulative gmt', 'Cumulative GMT Traffic')
      .replace('severity', 'Defect Severity')
      .replace('log overdue days', 'Overdue Days Backlog');

    return {
      label,
      change,
      start,
      end: currentVal,
      isPositive,
      value: f.value,
    };
  });

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2 text-[#0F2D6B] font-bold text-xs">
          <Activity className="w-4 h-4" />
          <span>SHAP Feature Attribution Waterfall</span>
        </div>
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="flex items-center space-x-1 text-slate-500">
            <span>Base:</span> <strong className="text-slate-900">{baseValue.toFixed(1)}</strong>
          </span>
          <span className="text-slate-400">➔</span>
          <span className="flex items-center space-x-1">
            <span className="text-slate-500">Score:</span>{' '}
            <strong className="text-[#0F2D6B] font-bold text-xs">{finalScore.toFixed(1)} / 100</strong>
          </span>
        </div>
      </div>

      {/* Waterfall Bars Container */}
      <div className="space-y-2 pt-1">
        {/* Base line */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
          <span className="font-sans">Base Model Prior (Mean IR Network Urgency)</span>
          <span className="font-bold text-slate-800">{baseValue.toFixed(1)} pts</span>
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const widthPct = Math.min(100, Math.max(8, Math.abs(step.change) * 2.2));
          return (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition group"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-sans font-medium text-slate-800 capitalize flex items-center space-x-1.5 truncate">
                  {step.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span className="truncate">{step.label}</span>
                </span>
                <span
                  className={`font-bold text-[11px] shrink-0 ml-2 ${
                    step.isPositive ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {step.isPositive ? `+${step.change.toFixed(1)}` : step.change.toFixed(1)} pts
                </span>
              </div>

              {/* Graphical Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    step.isPositive
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              {step.value !== undefined && (
                <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                  <span>Measured Sensor Value:</span>
                  <span className="font-bold text-slate-800">
                    {typeof step.value === 'number' ? step.value.toFixed(2) : String(step.value)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Final Total Bar */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between mt-2">
          <span className="text-xs font-bold text-[#0F2D6B]">Final Predicted Urgency</span>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-[#0F2D6B] rounded-full"
                style={{ width: `${Math.min(100, finalScore)}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-[#0F2D6B] font-mono">{finalScore.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
