'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { api } from '../../lib/api';

export function KeyboardShortcuts() {
  const router = useRouter();
  const isGenerating = useAppStore((s) => s.isGenerating);
  const setGenerating = useAppStore((s) => s.setGenerating);
  const setActivePlan = useAppStore((s) => s.setActivePlan);
  const addLiveEvent = useAppStore((s) => s.addLiveEvent);
  const setApprovalModalOpen = useAppStore((s) => s.setApprovalModalOpen);
  const triggerEmergency = useAppStore((s) => s.triggerEmergency);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // [G] Generate Plan
      if (key === 'g' && !isGenerating) {
        e.preventDefault();
        setGenerating(true);
        addLiveEvent({
          event: 'PIPELINE_INITIATED',
          timestamp: new Date().toISOString(),
          data: { message: '[Keyboard G] Triggered full 6-agent scheduling cycle.' },
        });

        const result = await api.generateFullPlan({
          plan_type: 'WEEKLY',
          section: 'NDLS-AGC',
          horizon_days: 7,
          pareto_profile: 'Balanced',
        });
        setActivePlan(result);
        setGenerating(false);
      }

      // [E] Emergency Injection
      else if (key === 'e') {
        e.preventDefault();
        triggerEmergency();
      }

      // [A] Open Approval Modal
      else if (key === 'a') {
        e.preventDefault();
        setApprovalModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, router, setGenerating, setActivePlan, addLiveEvent, setApprovalModalOpen, triggerEmergency]);

  return null;
}
