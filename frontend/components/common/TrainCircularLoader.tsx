'use client';

import React, { useId } from 'react';

interface TrainCircularLoaderProps {
  size?: number | string;
  speed?: number; // duration in seconds per orbit, default 5.5s
  label?: string;
  className?: string;
}

export function TrainCircularLoader({
  size = 280,
  speed = 5.5,
  label,
  className = '',
}: TrainCircularLoaderProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '_');

  const dim = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        {/* STATIC TRACK ASSEMBLY SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          fill="none"
          viewBox="0 0 500 500"
        >
          <defs>
            <radialGradient cx="50%" cy="50%" id={`centerGrad_${id}`} r="50%">
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="85%" stopColor="#f8fafc" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.9" />
            </radialGradient>
            <linearGradient id={`pulseGrad_${id}`} x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bedding Base Ring */}
          <circle cx="250" cy="250" fill={`url(#centerGrad_${id})`} r="214" />
          <circle
            cx="250"
            cy="250"
            opacity="0.6"
            r="218"
            stroke="#cbd5e1"
            strokeDasharray="3 6"
            strokeWidth="0.8"
          />

          {/* Precision Ballast Trough Edges */}
          <circle cx="250" cy="250" r="202" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="162" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Radial Ties / Sleepers */}
          <circle
            cx="250"
            cy="250"
            opacity="0.55"
            r="182"
            stroke="#94a3b8"
            strokeDasharray="2 7"
            strokeLinecap="butt"
            strokeWidth="20"
          />
          <circle
            cx="250"
            cy="250"
            opacity="0.45"
            r="182"
            stroke="#64748b"
            strokeDasharray="1 18"
            strokeLinecap="butt"
            strokeWidth="20"
          />

          {/* High-Tensile Steel Rail Pair (Outer & Inner) */}
          <circle cx="250" cy="250" r="190" stroke="#475569" strokeWidth="2.5" />
          <circle cx="250" cy="250" opacity="0.7" r="190" stroke="#f1f5f9" strokeWidth="0.8" />
          <circle cx="250" cy="250" r="174" stroke="#475569" strokeWidth="2.5" />
          <circle cx="250" cy="250" opacity="0.7" r="174" stroke="#f1f5f9" strokeWidth="0.8" />

          {/* Center Induction Guideway Strip */}
          <circle
            cx="250"
            cy="250"
            opacity="0.5"
            r="182"
            stroke="#0ea5e9"
            strokeDasharray="1 5"
            strokeWidth="1.5"
          />

          {/* Illuminated Traveling Signal Wave along Track */}
          <g className="animate-train-radar">
            <path
              d="M 250,58 A 192 192 0 0 1 386,114"
              fill="none"
              stroke={`url(#pulseGrad_${id})`}
              strokeLinecap="round"
              strokeWidth="4.5"
            />
            <circle cx="386" cy="114" fill="#0284c7" r="3" />
            <circle cx="386" cy="114" opacity="0.6" r="6" stroke="#38bdf8" strokeWidth="1" />
          </g>

          {/* Cardinal Sensor Checkpoints */}
          <circle cx="250" cy="58" fill="#0ea5e9" r="3" />
          <circle cx="442" cy="250" fill="#94a3b8" r="2.5" />
          <circle cx="250" cy="442" fill="#94a3b8" r="2.5" />
          <circle cx="58" cy="250" fill="#94a3b8" r="2.5" />
        </svg>

        {/* CONTINUOUS ROTATING TRAIN SVG LAYER */}
        <svg
          className="absolute inset-0 w-full h-full animate-train-orbit origin-center pointer-events-none"
          fill="none"
          viewBox="0 0 500 500"
          style={
            {
              '--train-speed': `${speed}s`,
              '--wheel-speed': `${speed * 0.05}s`,
            } as React.CSSProperties
          }
        >
          <defs>
            {/* Forward Headlight Projector Beam */}
            <linearGradient id={`headlight_${id}`} x1="0%" x2="100%" y1="50%" y2="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Kinetic Wake Stream */}
            <linearGradient id={`wake_${id}`} x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
            </linearGradient>

            {/* Window Glow */}
            <linearGradient id={`window_${id}`} x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>

            {/* Train Drop Shadow */}
            <filter height="120%" id={`shadow_${id}`} width="120%" x="-10%" y="-10%">
              <feDropShadow
                dx="0"
                dy="4"
                floodColor="#0f172a"
                floodOpacity="0.22"
                stdDeviation="3"
              />
            </filter>
          </defs>

          {/* Kinetic Energy Wake behind Train */}
          <g opacity="0.9">
            <path
              d="M 250,68 A 182 182 0 0 0 176,86"
              fill="none"
              stroke={`url(#wake_${id})`}
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="M 250,65 A 185 185 0 0 0 190,80"
              fill="none"
              opacity="0.6"
              stroke={`url(#wake_${id})`}
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </g>

          {/* 1. TRAILING PASSENGER COACH C (Angle: -23°) */}
          <g filter={`url(#shadow_${id})`} transform="rotate(-23, 250, 250)">
            <rect fill="#0f172a" height="22" rx="4" stroke="#020617" strokeWidth="1.2" width="46" x="227" y="57" />
            <rect fill="#334155" height="2" rx="0.8" width="38" x="231" y="58" />
            {/* Windows */}
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7" x="232" y="63" />
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7" x="241" y="63" />
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7" x="250" y="63" />
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7" x="259" y="63" />
            {/* Speed Stripes */}
            <rect fill="#0ea5e9" height="2" width="44" x="228" y="71.5" />
            <rect fill="#06b6d4" height="0.8" width="44" x="228" y="73.8" />
            {/* Bogie Wheels */}
            <g className="animate-train-wheel" style={{ transformOrigin: '232px 81px' }}>
              <circle cx="232" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="232" x2="232" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="229.5" x2="234.5" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '238px 81px' }}>
              <circle cx="238" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="238" x2="238" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="235.5" x2="240.5" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '262px 81px' }}>
              <circle cx="262" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="262" x2="262" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="259.5" x2="264.5" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '268px 81px' }}>
              <circle cx="268" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="268" x2="268" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="265.5" x2="270.5" y1="81" y2="81" />
            </g>
          </g>

          {/* Articulated Coupler 1 */}
          <g transform="rotate(-12.5, 250, 250)">
            <path d="M 247,60 L 253,60 L 252,77 L 248,77 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          </g>

          {/* 2. MIDDLE PASSENGER COACH B (Angle: -6.5°) */}
          <g filter={`url(#shadow_${id})`} transform="rotate(-6.5, 250, 250)">
            <rect fill="#0f172a" height="22" rx="4" stroke="#020617" strokeWidth="1.2" width="48" x="226" y="57" />
            <rect fill="#475569" height="2" rx="0.5" width="16" x="230" y="56" />
            <rect fill="#475569" height="2" rx="0.5" width="16" x="249" y="56" />
            {/* Windows */}
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7.5" x="231" y="63" />
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7.5" x="241" y="63" />
            <rect fill={`url(#window_${id})`} height="6" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7.5" x="251" y="63" />
            <rect fill="#38bdf8" height="6" opacity="0.95" rx="1.5" stroke="#0284c7" strokeWidth="0.5" width="7.5" x="261" y="63" />
            {/* Speed Stripes */}
            <rect fill="#0ea5e9" height="2" width="46" x="227" y="71.5" />
            <rect fill="#06b6d4" height="0.8" width="46" x="227" y="73.8" />
            {/* Bogie Wheels */}
            <g className="animate-train-wheel" style={{ transformOrigin: '231.5px 81px' }}>
              <circle cx="231.5" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="231.5" x2="231.5" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="229" x2="234" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '237.5px 81px' }}>
              <circle cx="237.5" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="237.5" x2="237.5" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="235" x2="240" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '263.5px 81px' }}>
              <circle cx="263.5" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="263.5" x2="263.5" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="261" x2="266" y1="81" y2="81" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '269.5px 81px' }}>
              <circle cx="269.5" cy="81" fill="#020617" r="3.8" stroke="#64748b" strokeWidth="1" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="269.5" x2="269.5" y1="78.5" y2="83.5" />
              <line stroke="#38bdf8" strokeWidth="0.8" x1="267" x2="272" y1="81" y2="81" />
            </g>
          </g>

          {/* Articulated Coupler 2 */}
          <g transform="rotate(5.5, 250, 250)">
            <path d="M 247,60 L 253,60 L 252,77 L 248,77 Z" fill="#334155" stroke="#1e293b" strokeWidth="1" />
          </g>

          {/* 3. LEAD HIGH-SPEED BULLET LOCOMOTIVE (Angle: +17°) */}
          <g filter={`url(#shadow_${id})`} transform="rotate(17, 250, 250)">
            {/* Pantograph */}
            <rect fill="#475569" height="2" rx="0.5" width="8" x="232" y="54" />
            <path d="M 233.5,54 L 230,48 L 236,44 L 242,48 L 238.5,54" fill="none" stroke="#0ea5e9" strokeLinejoin="round" strokeWidth="1.1" />
            <line stroke="#e2e8f0" strokeLinecap="round" strokeWidth="1.5" x1="233" x2="244" y1="44" y2="44" />

            {/* Aerodynamic Bullet Hull */}
            <path d="M 224,79 L 224,59.5 Q 224,57 227.5,57 L 254,57 Q 275,57.5 284,72 L 284,79 Z" fill="#090d16" stroke="#020617" strokeWidth="1.3" />
            <path d="M 252,58.5 Q 270,59.5 281,73 L 268,73 Q 256,64 248,61 Z" fill="#0284c7" />
            <path d="M 254,60 Q 268,61 278,72 L 273,72 Q 263,65 252,62 Z" fill="#38bdf8" opacity="0.8" />

            {/* Cockpit Windshield */}
            <path d="M 256,60 L 273,69 L 259,69 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
            <polygon fill="#e0f2fe" opacity="0.9" points="258,61 270,68 261,68" />

            {/* Cabin Windows */}
            <rect fill={`url(#window_${id})`} height="5.5" rx="1.2" stroke="#0284c7" strokeWidth="0.5" width="7" x="230" y="63" />
            <rect fill={`url(#window_${id})`} height="5.5" rx="1.2" stroke="#0284c7" strokeWidth="0.5" width="7" x="240" y="63" />

            {/* Dynamic Speed Stripes */}
            <path d="M 225,72 L 279,72 L 275,74.5 L 225,74.5 Z" fill="#0ea5e9" />
            <path d="M 225,75 L 274,75 L 271,76.2 L 225,76.2 Z" fill="#06b6d4" />

            {/* Triple Bogie Wheelsets */}
            <rect fill="#1e293b" height="2" width="28" x="227" y="78.5" />
            <g className="animate-train-wheel" style={{ transformOrigin: '231px 81.5px' }}>
              <circle cx="231" cy="81.5" fill="#020617" r="4.2" stroke="#94a3b8" strokeWidth="1.1" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="231" x2="231" y1="78.5" y2="84.5" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="228" x2="234" y1="81.5" y2="81.5" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '242px 81.5px' }}>
              <circle cx="242" cy="81.5" fill="#020617" r="4.2" stroke="#94a3b8" strokeWidth="1.1" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="242" x2="242" y1="78.5" y2="84.5" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="239" x2="245" y1="81.5" y2="81.5" />
            </g>
            <g className="animate-train-wheel" style={{ transformOrigin: '253px 81.5px' }}>
              <circle cx="253" cy="81.5" fill="#020617" r="4.2" stroke="#94a3b8" strokeWidth="1.1" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="253" x2="253" y1="78.5" y2="84.5" />
              <line stroke="#38bdf8" strokeWidth="0.9" x1="250" x2="256" y1="81.5" y2="81.5" />
            </g>

            {/* High-Intensity Dual LED Headlights */}
            <circle cx="282.5" cy="74" fill="#ffffff" r="2.2" />
            <circle cx="282.5" cy="74" opacity="0.8" r="3.5" stroke="#38bdf8" strokeWidth="0.8" />

            {/* Forward Headlight Cone Beam */}
            <polygon fill={`url(#headlight_${id})`} opacity="0.7" points="284,74 330,62 334,86" />
          </g>
        </svg>
      </div>

      {label && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs font-mono text-slate-600 font-semibold">
          <span>{label}</span>
          <span className="inline-flex text-cyan-600 font-bold">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse delay-100">.</span>
            <span className="animate-pulse delay-200">.</span>
          </span>
        </div>
      )}
    </div>
  );
}
