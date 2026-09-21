import React from 'react';
import { TrainCircularLoader } from '../components/common/TrainCircularLoader';

export default function Loading() {
  return (
    <div className="min-h-[65vh] w-full flex flex-col items-center justify-center p-6 select-none">
      <TrainCircularLoader
        size={260}
        speed={5.2}
        label="Connecting RailBlock AI Corridor Network"
      />
    </div>
  );
}
