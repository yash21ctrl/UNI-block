'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { MapFilterType, MapLayerType } from './InnerTwinMap';

interface DigitalTwinMapProps {
  height?: string;
  onSectionSelect?: (sectionCode: string) => void;
  filter?: MapFilterType;
  layerType?: MapLayerType;
  focusSection?: string | null;
}

import { TrainCircularLoader } from '../common/TrainCircularLoader';

const DynamicInnerMap = dynamic(() => import('./InnerTwinMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full bg-[#080C14] border border-surface-border rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs"
      style={{ minHeight: '420px' }}
    >
      <TrainCircularLoader
        size={200}
        speed={5.0}
        label="Initializing Karnataka Digital Twin GIS Network"
      />
    </div>
  ),
});

export function DigitalTwinMap(props: DigitalTwinMapProps) {
  return <DynamicInnerMap {...props} />;
}
