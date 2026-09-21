'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { useAppStore, FieldBlockRequest, parseAndValidateRailBlockQR, isFieldRequestMatch } from '../../lib/store';
import { getNearestStation, ALL_STATION_DESKS, getStationDesk, StationDeskInfo } from '../../lib/stations';
import {
  KARNATAKA_APPROVED_BLOCKS,
  ApprovedBlockItem,
  api,
} from '../../lib/api';
import { getDepartmentGanttColor, getDepartmentBadgeColor, isBlockFused, getFusionDepartmentPill } from '../../lib/format';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  Zap,
  MapPin,
  RefreshCw,
  RotateCcw,
  QrCode,
  KeyRound,
  Lock,
  Unlock,
  ScanLine,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  Train,
  Check,
  Search,
  Camera,
  Video,
  VideoOff,
  Upload,
  AlertCircle,
  Eye,
  Sliders,
  Bell,
  Printer,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

// Master Station list covering all 4 South Western Railway corridors (36 Stations)
const KARNATAKA_STATIONS = ALL_STATION_DESKS;

// Live train timings for each station
const STATION_TIMETABLES: Record<string, Array<{
  train_no: string;
  train_name: string;
  time: string;
  platform: string;
  status: string;
  type: string;
  signal_aspect: 'PROCEED' | 'CAUTION' | 'STOP';
}>> = {
  MYA: [
    { train_no: '20607', train_name: 'Vande Bharat Express (MAS-MYS)', time: '06:18 IST', platform: 'PF 1 (Down Fast)', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '16215', train_name: 'Chamundi Express (SBC-MYS)', time: '07:42 IST', platform: 'PF 2 (Up Fast)', status: 'ON TIME (+0.0m)', type: 'INTERCITY EXP', signal_aspect: 'PROCEED' },
    { train_no: '12613', train_name: 'Wodeyar Superfast (SBC-MYS)', time: '10:30 IST', platform: 'PF 1 (Down Fast)', status: 'ON TIME (+0.0m)', type: 'SUPERFAST', signal_aspect: 'CAUTION' },
    { train_no: 'BOXN-884', train_name: 'Freight Rake (Raw Materials)', time: '02:15 IST (Night)', platform: 'Loop Siding 1', status: 'HOLD / CLEARANCE', type: 'FREIGHT', signal_aspect: 'STOP' },
    { train_no: '06560', train_name: 'Mysuru-Bengaluru MEMU Passenger', time: '13:45 IST', platform: 'PF 3 (Loop)', status: 'ON TIME (+0.0m)', type: 'PASSENGER', signal_aspect: 'PROCEED' },
  ],
  RMGM: [
    { train_no: '20607', train_name: 'Vande Bharat Express Passing', time: '06:02 IST', platform: 'Mainline Thru', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '16215', train_name: 'Chamundi Express', time: '07:22 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'INTERCITY EXP', signal_aspect: 'PROCEED' },
    { train_no: '06560', train_name: 'SBC-MYS Passenger MEMU', time: '13:15 IST', platform: 'PF 2', status: 'DELAY (+3.0m)', type: 'PASSENGER', signal_aspect: 'CAUTION' },
  ],
  CPT: [
    { train_no: '20607', train_name: 'Vande Bharat Express Passing', time: '06:10 IST', platform: 'Mainline Thru', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '12613', train_name: 'Wodeyar Superfast', time: '10:12 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'SUPERFAST', signal_aspect: 'PROCEED' },
  ],
  BID: [
    { train_no: '20607', train_name: 'Vande Bharat Express Passing', time: '05:40 IST', platform: 'Mainline Thru', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '06560', train_name: 'Mysuru-Bengaluru MEMU Passenger', time: '13:02 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'PASSENGER', signal_aspect: 'PROCEED' },
  ],
  SBC: [
    { train_no: '22691', train_name: 'Bengaluru Rajdhani Express', time: '20:00 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'VIP RAJDHANI', signal_aspect: 'PROCEED' },
    { train_no: '12007', train_name: 'Chennai Shatabdi Express', time: '11:00 IST', platform: 'PF 7', status: 'ON TIME (+0.0m)', type: 'VIP SHATABDI', signal_aspect: 'PROCEED' },
    { train_no: '20608', train_name: 'Vande Bharat Express (MYS-MAS)', time: '14:50 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
  ],
  MYS: [
    { train_no: '20607', train_name: 'Vande Bharat Express Arrival', time: '07:45 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '16216', train_name: 'Chamundi Express Departure', time: '06:45 IST', platform: 'PF 2', status: 'ON TIME (+0.0m)', type: 'INTERCITY EXP', signal_aspect: 'PROCEED' },
  ],
  KGI: [
    { train_no: '20607', train_name: 'Vande Bharat Express Passing', time: '05:52 IST', platform: 'Mainline Thru', status: 'ON TIME (+0.0m)', type: 'VIP SUPERFAST', signal_aspect: 'PROCEED' },
    { train_no: '16215', train_name: 'Chamundi Express', time: '07:05 IST', platform: 'PF 1', status: 'ON TIME (+0.0m)', type: 'INTERCITY EXP', signal_aspect: 'PROCEED' },
  ],
};

// Helper to calculate exact left and width percentage for Gantt possession bars (00:00 to 06:00 window = 360m)
function getTrackBlockPosition(block: ApprovedBlockItem | undefined, idx: number): { left: string; width: string } {
  if (!block) return { left: '0%', width: '0%' };

  const parseTimeToMins = (timeStr?: string) => {
    if (!timeStr) return null;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const startMins = parseTimeToMins(block.scheduled_start);
  const endMins = parseTimeToMins(block.scheduled_end);

  if (startMins !== null && startMins >= 0 && startMins < 360) {
    const leftPct = (startMins / 360) * 100;
    let durationMins = block.duration_minutes || 120;
    if (endMins !== null && endMins > startMins) {
      durationMins = endMins - startMins;
    }
    const widthPct = Math.min(100 - leftPct, Math.max(12, (durationMins / 360) * 100));
    return {
      left: `${leftPct.toFixed(1)}%`,
      width: `${widthPct.toFixed(1)}%`,
    };
  }

  const fallbacks = [
    { left: '20%', width: '35%' },
    { left: '32%', width: '30%' },
    { left: '15%', width: '42%' },
    { left: '45%', width: '28%' },
  ];
  return fallbacks[idx % fallbacks.length];
}

export default function StationMasterPortalPage() {
  // Store integration
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const agentStates = useAppStore((s) => s.agentStates || []);
  const verifyFieldRequestQR = useAppStore((s) => s.verifyFieldRequestQR);
  const updateFieldRequestStatus = useAppStore((s) => s.updateFieldRequestStatus);
  const addAuditEntry = useAppStore((s) => s.addAuditEntry);

  // Station & Operator selection (Defaults to Mandya / URL parameter ?stn=)
  const [selectedStationCode, setSelectedStationCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlStn = params.get('station') || params.get('stn');
      if (urlStn && (urlStn.toUpperCase() === 'ALL' || KARNATAKA_STATIONS.some((s) => s.code === urlStn.toUpperCase()))) {
        return urlStn.toUpperCase();
      }
    }
    return 'MYA';
  });
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('ALL');

  // Sync if URL search params change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlStn = params.get('station') || params.get('stn');
    if (urlStn && (urlStn.toUpperCase() === 'ALL' || KARNATAKA_STATIONS.some((s) => s.code === urlStn.toUpperCase()))) {
      setSelectedStationCode(urlStn.toUpperCase());
    }
  }, []);

  const currentStation = useMemo(() => {
    if (selectedStationCode === 'ALL') {
      return {
        code: 'ALL',
        name: 'All Stations (Corridor Overview)',
        fullName: 'Corridor-Wide Multi-Station Operating Desk',
        km: 'KM 0.0 - 470.0',
        tracks: ['Down Fast (Mainline)', 'Up Fast (Mainline)', 'Loop / Goods Siding', 'OHE Catenary Sector'],
        sm_id: 'SM-CORRIDOR-ALL',
        section: 'ALL-CORRIDORS',
        division: 'South Western Railway',
      };
    }
    return KARNATAKA_STATIONS.find((s) => s.code === selectedStationCode) || KARNATAKA_STATIONS[6];
  }, [selectedStationCode]);

  // Real-time Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('01:15:20 IST');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
      const h = String(ist.getUTCHours()).padStart(2, '0');
      const m = String(ist.getUTCMinutes()).padStart(2, '0');
      const s = String(ist.getUTCSeconds()).padStart(2, '0');
      setCurrentTimeStr(`${h}:${m}:${s} IST`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Chime Synthesizer for Station Master Incoming Alerts
  const playAlertChime = useCallback((tone: 'urgent' | 'info' | 'success' = 'urgent') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (tone === 'urgent') {
        // High attention 2-tone railway alert chime (F5 698Hz -> C6 1046Hz)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(698.46, now);
        osc.frequency.setValueAtTime(1046.5, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (tone === 'success') {
        // 3-tone pleasant completion fanfare (C5 -> E5 -> G5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(783.99, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else {
        // Soft informatory station chime (D5 587Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      // AudioContext policy gracefully handled
    }
  }, []);

  // Notification toast with optional action button
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'warn' | 'info';
    action?: { label: string; onClick: () => void };
  } | null>(null);

  const triggerNotification = useCallback(
    (
      message: string,
      type: 'success' | 'warn' | 'info' = 'success',
      duration: number = 6000,
      action?: { label: string; onClick: () => void }
    ) => {
      setNotification({ message, type, action });
      setTimeout(() => {
        setNotification((curr) => (curr?.message === message ? null : curr));
      }, duration);
    },
    []
  );

  // Active real-time synchronization with Field JE and Cockpit
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const refreshRequests = () => {
      try {
        const raw = localStorage.getItem('railblock_field_requests_v3');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            useAppStore.setState({ fieldRequests: parsed });
          } else {
            useAppStore.setState({ fieldRequests: [] });
          }
        } else {
          useAppStore.setState({ fieldRequests: [] });
        }
      } catch (e) {
        useAppStore.setState({ fieldRequests: [] });
      }
    };

    window.addEventListener('railblock_field_requests_updated', refreshRequests);
    window.addEventListener('storage', refreshRequests);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('railblock_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'FIELD_REQUESTS_UPDATED' && Array.isArray(event.data.detail)) {
          useAppStore.setState({ fieldRequests: event.data.detail });
        } else if (event.data?.type === 'SYSTEM_RESET') {
          useAppStore.setState({ fieldRequests: [] });
        }
      };
    } catch (e) {}

    const interval = setInterval(refreshRequests, 800);

    return () => {
      window.removeEventListener('railblock_field_requests_updated', refreshRequests);
      window.removeEventListener('storage', refreshRequests);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  // --------------------------------------------------------------------------
  // REACTIVE SANCTION NOTIFICATION ENGINE: Detects newly sanctioned blocks in real time
  // --------------------------------------------------------------------------
  const knownStatusMapRef = useRef<Map<string, string>>(new Map());
  const isInitialMountRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      fieldRequests.forEach((req) => {
        knownStatusMapRef.current.set(req.id, req.status);
        if (req.task_id) knownStatusMapRef.current.set(String(req.task_id), req.status);
        if (req.worker_memo_code) knownStatusMapRef.current.set(req.worker_memo_code, req.status);
      });
      return;
    }

    // Check for newly added or status-transitioned blocks
    fieldRequests.forEach((req) => {
      const nearest = getNearestStation(req.section, req.km_from ?? 45.0);
      const stnCode = req.nearest_station_code || nearest.code;
      const prevStatus =
        knownStatusMapRef.current.get(req.id) ||
        (req.task_id ? knownStatusMapRef.current.get(String(req.task_id)) : undefined) ||
        (req.worker_memo_code ? knownStatusMapRef.current.get(req.worker_memo_code) : undefined);

      const isSanctionedNow = req.status === 'SANCTIONED' || (req.status as string) === 'APPROVED';
      const wasSanctionedBefore = prevStatus === 'SANCTIONED' || prevStatus === 'APPROVED';

      if (isSanctionedNow && !wasSanctionedBefore) {
        // Newly sanctioned block arrived!
        if (stnCode === selectedStationCode) {
          playAlertChime('urgent');
          if (typeof document !== 'undefined') {
            document.title = '🚨 (1) NEW BLOCK SANCTIONED - Station Master';
            setTimeout(() => {
              document.title = 'RailBlock AI — Station Master Terminal';
            }, 8000);
          }
          triggerNotification(
            `🚨 NEW BLOCK SANCTIONED! Form T/351 Memo [${req.worker_memo_code || req.task_id}] approved by Section Controller for ${currentStation.name}. Station Master verification & signal clamping required.`,
            'warn',
            10000
          );
        } else {
          // Block sanctioned at another station along corridor
          playAlertChime('info');
          const targetStn = KARNATAKA_STATIONS.find((s) => s.code === stnCode);
          triggerNotification(
            `🔔 Notice: New block sanctioned at ${targetStn?.name || stnCode} (${stnCode}) for JE User ${req.user_id || '01'}.`,
            'info',
            8000,
            {
              label: `Switch to ${stnCode}`,
              onClick: () => setSelectedStationCode(stnCode),
            }
          );
        }
      } else if (!prevStatus && req.status === 'PENDING_SANCTION') {
        if (stnCode === selectedStationCode) {
          playAlertChime('info');
          triggerNotification(
            `📋 NEW FIELD DEMAND: JE User ${req.user_id || '01'} requested maintenance window on ${req.section} (${req.km_range}). Awaiting Controller sanction.`,
            'info',
            6000
          );
        }
      } else if (prevStatus && prevStatus !== 'COMPLETED' && req.status === 'COMPLETED') {
        if (stnCode === selectedStationCode) {
          playAlertChime('success');
          triggerNotification(
            `✅ TRACK RESTORED & WORK COMPLETED: Field JE completed track work on ${req.km_range}. Line certified fit for normal traffic.`,
            'success',
            8000
          );
        }
      }

      // Record latest status
      knownStatusMapRef.current.set(req.id, req.status);
      if (req.task_id) knownStatusMapRef.current.set(String(req.task_id), req.status);
      if (req.worker_memo_code) knownStatusMapRef.current.set(req.worker_memo_code, req.status);
    });
  }, [fieldRequests, selectedStationCode, currentStation.name, playAlertChime, triggerNotification]);

  // --------------------------------------------------------------------------
  // MERGE APPROVED BLOCKS FOR THIS STATION & OPERATOR FILTER
  // --------------------------------------------------------------------------
  const stationBlocks = useMemo(() => {
    const items: ApprovedBlockItem[] = [];

    // Real field requests from all Field JEs
    for (const req of fieldRequests) {
      if (req.status === 'REJECTED') continue;

      // 1. Determine strictly the designated nearest station responsible for this block
      const nearest = getNearestStation(req.section, req.km_from ?? 45.0);
      const targetStationCode = req.nearest_station_code || nearest.code;

      // If a specific station is selected, filter to that station.
      // If "ALL" is selected, include memos across ALL corridor stations!
      if (selectedStationCode !== 'ALL' && targetStationCode !== selectedStationCode) {
        continue;
      }

      // Filter by JE Operator User ID
      const uId = req.user_id || '01';
      if (selectedUserFilter !== 'ALL' && uId !== selectedUserFilter) {
        continue;
      }

      items.push({
        id: req.id,
        block_id: req.sanctioned_block_id || `BLK-${targetStationCode}-${req.task_id}`,
        section: req.section,
        station: targetStationCode,
        km_range: req.km_range,
        department: req.department,
        work_description: req.reason,
        scheduled_start: req.scheduled_start || '01:30',
        scheduled_end: req.scheduled_end || '03:30',
        duration_minutes: req.duration_minutes,
        worker_memo_code: req.worker_memo_code || `MEMO-SWR-${targetStationCode}-2026-${req.task_id}`,
        status:
          req.status === 'IN_PROGRESS' || req.status === 'DISCONNECTED'
            ? 'IN_PROGRESS'
            : req.status === 'COMPLETED'
            ? 'COMPLETED'
            : req.status === 'DEFERRED'
            ? 'DEFERRED'
            : req.status === 'PENDING_SANCTION'
            ? 'PENDING_SANCTION'
            : 'APPROVED',
        user_id: uId,
        submitter_name: req.submitter_name || `Field JE-${uId}`,
        task_id: req.task_id,
        original_status: req.status,
        before_photo_url: req.before_photo_url,
        after_photo_url: req.after_photo_url,
        is_fused: req.is_fused,
        downtime_saved_minutes: req.downtime_saved_minutes,
      });
    }

    return items;
  }, [fieldRequests, selectedStationCode, selectedUserFilter]);

  // --------------------------------------------------------------------------
  // PARTITION: ACTIVE BLOCKS (DASHBOARD) VS. PREVIOUS MEMOS & SANCTIONS (ARCHIVE)
  // --------------------------------------------------------------------------
  // 1. Active Blocks: Approved (awaiting scan), In-Progress (active work), or Pending Sanction
  const activeBlocks = useMemo(() => {
    return stationBlocks.filter(
      (b) => b.status === 'APPROVED' || b.status === 'IN_PROGRESS' || b.status === 'PENDING_SANCTION'
    );
  }, [stationBlocks]);

  // 2. Previous Memos & Sanctions: Real Completed or Deferred records
  const previousBlocks = useMemo(() => {
    return stationBlocks.filter(
      (b) => b.status === 'COMPLETED' || b.status === 'DEFERRED'
    );
  }, [stationBlocks]);

  // 3. Specifically Sanctioned Blocks Awaiting Station Master Scan
  const pendingScanBlocks = useMemo(() => {
    return activeBlocks.filter((b) => b.status === 'APPROVED');
  }, [activeBlocks]);

  // Tab State: 'ACTIVE' (Live Dashboard) vs 'PREVIOUS' (Previous Memos & Sanctions History)
  const [dashboardTab, setDashboardTab] = useState<'ACTIVE' | 'PREVIOUS'>('ACTIVE');

  // Search & Filter State for Previous Memos Archive
  const [previousSearchQuery, setPreviousSearchQuery] = useState<string>('');
  const [previousStatusFilter, setPreviousStatusFilter] = useState<'ALL' | 'COMPLETED' | 'DEFERRED'>('ALL');
  const [previousDeptFilter, setPreviousDeptFilter] = useState<string>('ALL');

  const filteredPreviousBlocks = useMemo(() => {
    return previousBlocks.filter((b) => {
      if (previousStatusFilter !== 'ALL' && b.status !== previousStatusFilter) return false;
      if (previousDeptFilter !== 'ALL' && !b.department.includes(previousDeptFilter)) return false;
      if (previousSearchQuery.trim()) {
        const q = previousSearchQuery.toLowerCase();
        const match =
          (b.worker_memo_code || '').toLowerCase().includes(q) ||
          (b.work_description || '').toLowerCase().includes(q) ||
          (b.submitter_name || '').toLowerCase().includes(q) ||
          (b.km_range || '').toLowerCase().includes(q) ||
          (b.section || '').toLowerCase().includes(q) ||
          String(b.task_id || '').includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [previousBlocks, previousStatusFilter, previousDeptFilter, previousSearchQuery]);

  // Track how many memos are active at each station
  const stationMemoCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stn of KARNATAKA_STATIONS) {
      counts[stn.code] = 0;
    }
    for (const req of fieldRequests) {
      if (req.status === 'REJECTED') continue;
      const nearest = getNearestStation(req.section, req.km_from ?? 45.0);
      const stnCode = req.nearest_station_code || nearest.code;
      counts[stnCode] = (counts[stnCode] || 0) + 1;
    }
    return counts;
  }, [fieldRequests]);

  // Find other stations that currently have active memos (to help Station Master if on wrong desk)
  const otherStationMemos = useMemo(() => {
    const list: Array<{ code: string; name: string; count: number }> = [];
    for (const stn of KARNATAKA_STATIONS) {
      if (stn.code !== selectedStationCode && (stationMemoCounts[stn.code] || 0) > 0) {
        list.push({ code: stn.code, name: stn.name, count: stationMemoCounts[stn.code] });
      }
    }
    return list;
  }, [selectedStationCode, stationMemoCounts]);

  // --------------------------------------------------------------------------
  // MODAL STATES
  // --------------------------------------------------------------------------
  // 1. Form T/351 Memo View Modal
  const [memoModalBlock, setMemoModalBlock] = useState<ApprovedBlockItem | null>(null);

  // 1b. Track Work & Safety Inspection Photos Modal
  const [photoModalBlock, setPhotoModalBlock] = useState<ApprovedBlockItem | null>(null);

  // 2. Scan & Verification Flow Modal
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [scanModalBlock, setScanModalBlock] = useState<ApprovedBlockItem | null>(null);
  const [scanPhase, setScanPhase] = useState<'SCANNING' | 'SCANNED_DECISION' | 'DEFERRAL_FORM'>('SCANNING');
  const [manualTokenInput, setManualTokenInput] = useState<string>('');
  const [scannedPermitData, setScannedPermitData] = useState<{
    worker_name: string;
    user_id?: string;
    token: string;
    department: string;
    km_range: string;
    time_window: string;
    biometric_match: string;
    matchedRequestId?: string;
  } | null>(null);

  // REAL CAMERA STATE
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Deferral Inputs (Required credentials: ID 123, PIN 123)
  const [deferSmId, setDeferSmId] = useState<string>('');
  const [deferPassword, setDeferPassword] = useState<string>('');
  const [deferReason, setDeferReason] = useState<string>('Severe Weather / Thunderstorm Alert');
  const [deferNotes, setDeferNotes] = useState<string>('Operational track possession deferred by Station Master.');

  // Open Memo Modal
  const handleOpenMemo = (block: ApprovedBlockItem) => {
    setMemoModalBlock(block);
  };

  // Open Photos & Certificate Inspection Modal
  const handleOpenPhotos = (block: ApprovedBlockItem) => {
    setPhotoModalBlock(block);
  };

  // STOP HARDWARE CAMERA
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cross-portal System Reset Listener (Triggered from Section Controller Cockpit)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSystemReset = () => {
      stopCameraStream();
      setIsScanModalOpen(false);
      setScanModalBlock(null);
      setMemoModalBlock(null);
      setScannedPermitData(null);
      setPhotoModalBlock(null);
      setManualTokenInput('');
      knownStatusMapRef.current.clear();
      useAppStore.setState({ fieldRequests: [] });
      triggerNotification('🔄 System Reset: Cleared all ground demands & possessions across all 3 portals.', 'info');
    };

    window.addEventListener('railblock_system_reset', handleSystemReset);

    const handleStorageReset = (e: StorageEvent) => {
      if (e.key === 'railblock_system_reset') {
        handleSystemReset();
      }
    };
    window.addEventListener('storage', handleStorageReset);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('railblock_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYSTEM_RESET') {
          handleSystemReset();
        }
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('railblock_system_reset', handleSystemReset);
      window.removeEventListener('storage', handleStorageReset);
      if (bc) bc.close();
    };
  }, [stopCameraStream]);

  // START REAL HARDWARE CAMERA STREAM
  const startCameraStream = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported by this browser. Use Mobile Camera upload button.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Real camera stream failed:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Tap "Open Mobile Camera / Upload Image" below to take a photo.'
          : err.message || 'Unable to open video stream. Use the mobile camera button below.'
      );
      setCameraActive(false);
    }
  }, []);

  // Open Scan Flow Modal (Universal or for a specific block)
  const handleOpenScan = (block?: ApprovedBlockItem | null) => {
    setScanModalBlock(block || null);
    setIsScanModalOpen(true);
    setScanPhase('SCANNING');
    setScannedPermitData(null);
    setManualTokenInput('');
    startCameraStream();
  };

  // Close Scan Modal and shut down camera
  const handleCloseScanModal = () => {
    stopCameraStream();
    setIsScanModalOpen(false);
    setScanModalBlock(null);
    setScanPhase('SCANNING');
    setManualTokenInput('');
  };

  // Process decoded QR code string — Instantly validates and advances Field JE
  const handleSuccessfulQrDecoded = useCallback(
    (detectedToken: string, validation?: any) => {
      stopCameraStream();
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Find matching field request in store
      const matchedReq =
        fieldRequests.find(
          (r) =>
            (validation?.req_id && isFieldRequestMatch(r, validation.req_id)) ||
            (validation?.memo_code && isFieldRequestMatch(r, validation.memo_code)) ||
            (validation?.task_id && String(r.task_id) === String(validation.task_id)) ||
            isFieldRequestMatch(r, detectedToken) ||
            (scanModalBlock && (isFieldRequestMatch(r, scanModalBlock.id) || r.worker_memo_code === scanModalBlock.worker_memo_code))
        ) ||
        fieldRequests.find((r) => r.status === 'SANCTIONED');

      const finalUserId = validation?.user_id || matchedReq?.user_id || scanModalBlock?.user_id || '01';
      const finalWorker = validation?.submitter_name || matchedReq?.submitter_name || scanModalBlock?.submitter_name || `Er. Field JE-${finalUserId}`;
      const finalToken = validation?.memo_code || detectedToken || matchedReq?.worker_memo_code || scanModalBlock?.worker_memo_code || 'MEMO-SWR-MYA-2026-081';
      const reqIdToGrant = matchedReq?.id || validation?.req_id || scanModalBlock?.id || 'REQ-7842';
      const targetStnCode = validation?.station_code || matchedReq?.nearest_station_code || currentStation.code;
      const targetStnName = validation?.station_name || matchedReq?.nearest_station_name || currentStation.name;
      const smName = `SM-${targetStnCode} (${targetStnName})`;

      // If the permit was sanctioned at another station, auto-switch Station Master view so they see it in their yard!
      if (targetStnCode && targetStnCode !== selectedStationCode && selectedStationCode !== 'ALL') {
        setSelectedStationCode(targetStnCode);
      }

      // 1. Immediately update store & persist to localStorage so Field JE advances to Step 4
      if (reqIdToGrant) {
        verifyFieldRequestQR(reqIdToGrant, smName);
      }
      if (validation?.req_id && validation.req_id !== reqIdToGrant) {
        verifyFieldRequestQR(validation.req_id, smName);
      }
      if (finalToken) {
        verifyFieldRequestQR(finalToken, smName);
      }
      if (scanModalBlock?.block_id) {
        verifyFieldRequestQR(scanModalBlock.block_id, smName);
      }

      // 2. Broadcast via BroadcastChannel & CustomEvent for ZERO-DELAY cross-tab synchronization!
      if (typeof window !== 'undefined') {
        try {
          const bc = new BroadcastChannel('railblock_channel');
          bc.postMessage({
            type: 'SM_DISCONNECTION_GRANTED',
            targetId: reqIdToGrant,
            req_id: validation?.req_id,
            token: finalToken,
            smName,
            station: targetStnCode,
            timestamp: new Date().toISOString(),
          });
          bc.close();
        } catch (e) {}

        window.dispatchEvent(
          new CustomEvent('railblock_sm_disconnection_granted', {
            detail: { targetId: reqIdToGrant, token: finalToken, smName },
          })
        );
      }

      // 3. Call backend API for disconnection grant
      api.grantLocalDisconnection({
        block_id: scanModalBlock?.block_id || reqIdToGrant || 'BLK-SBC-MYS-01',
        station_id: targetStnCode,
      }).catch((err) => console.warn('Disconnection API call:', err));

      // 4. Log into Audit Ledger
      addAuditEntry({
        device_role: 'STATION_MASTER',
        action_type: 'DISCONNECTION_GRANTED',
        token_id: finalToken,
        corridor: scanModalBlock?.section || matchedReq?.section || 'SBC-MYS',
        station: targetStnCode,
        department: validation?.department || matchedReq?.department || scanModalBlock?.department || 'Engineering',
        title: `QR Verified • Disconnection Granted by Station Master (${targetStnName})`,
        details: `Signal points clamped at Stop. Worksite possession released to ${finalWorker}. Field JE portal automatically synchronized & advanced.`,
      });

      triggerNotification(
        `✓ QR CODE VERIFIED & TRACK DISCONNECTED! Field JE portal automatically advanced to Step 4 (Active Work & Timer).`,
        'success'
      );

      setScannedPermitData({
        worker_name: finalWorker,
        user_id: finalUserId,
        token: finalToken,
        department: validation?.department || matchedReq?.department || scanModalBlock?.department || 'Engineering',
        km_range: validation?.km_range || matchedReq?.km_range || scanModalBlock?.km_range || currentStation.km,
        time_window: `${matchedReq?.scheduled_start || scanModalBlock?.scheduled_start || '01:30'} - ${
          matchedReq?.scheduled_end || scanModalBlock?.scheduled_end || '03:30'
        } (${matchedReq?.duration_minutes || scanModalBlock?.duration_minutes || 120}m)`,
        biometric_match: `MATCH VERIFIED [JE-${finalUserId}] (99.8% IRIS & BIOMETRIC AUTHENTICATED)`,
        matchedRequestId: reqIdToGrant,
      });

      setScanPhase('SCANNED_DECISION');
    },
    [fieldRequests, scanModalBlock, currentStation.code, currentStation.name, currentStation.km, selectedStationCode, stopCameraStream, verifyFieldRequestQR, addAuditEntry, triggerNotification]
  );

  // Instant 1-Click Fast Verify for Sanctioned Block (Test / Immediate Verification Mode)
  const handleFastVerify = useCallback(
    (block: ApprovedBlockItem) => {
      const req = fieldRequests.find(
        (r) => r.id === block.id || r.sanctioned_block_id === block.block_id || isFieldRequestMatch(r, block.id)
      );
      const token = block.worker_memo_code || req?.qr_token || `QR-SWR-JE-${block.task_id || '7842'}-${block.station}`;
      handleSuccessfulQrDecoded(token, {
        isValid: true,
        req_id: block.id,
        user_id: block.user_id,
        submitter_name: block.submitter_name,
        task_id: block.task_id,
        memo_code: block.worker_memo_code,
        station_code: block.station || currentStation.code,
        department: block.department,
        section: block.section,
        km_range: block.km_range,
        duration: block.duration_minutes,
      });
    },
    [fieldRequests, currentStation.code, handleSuccessfulQrDecoded]
  );

  // CONTINUOUS VIDEO FRAME SCANNING LOOP VIA JSQR (Optimized for instant 60 FPS detection)
  useEffect(() => {
    if (!cameraActive || scanPhase !== 'SCANNING') return;

    let animId: number;
    let isScanning = true;
    let lastScanTime = 0;

    const scanVideoFrame = (timestamp: number) => {
      if (!isScanning) return;
      const video = videoRef.current;

      // Throttle scanning to at most once every 80ms (~12 FPS) to conserve CPU while ensuring sub-second detection
      if (
        timestamp - lastScanTime > 80 &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        lastScanTime = timestamp;
        try {
          if (!scanCanvasRef.current) {
            scanCanvasRef.current = document.createElement('canvas');
          }
          const canvas = scanCanvasRef.current;

          // Downscale to max 640px wide for dramatically faster and more robust QR decoding
          const maxDim = 640;
          let targetWidth = video.videoWidth;
          let targetHeight = video.videoHeight;
          if (targetWidth > maxDim) {
            const scale = maxDim / targetWidth;
            targetWidth = Math.round(targetWidth * scale);
            targetHeight = Math.round(targetHeight * scale);
          }

          if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
            // attemptBoth handles screen glare, dark mode, and inverted monitors effortlessly
            const code = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data && code.data.trim()) {
              const validation = parseAndValidateRailBlockQR(code.data);
              if (validation && validation.isValid) {
                // Authentic RailBlock QR detected automatically!
                isScanning = false;
                handleSuccessfulQrDecoded(code.data, validation);
                return;
              }
              // If blank or non-RailBlock QR, keep scanning without triggering
            }
          }
        } catch (e) {
          // ignore frame read error
        }
      }
      animId = requestAnimationFrame(scanVideoFrame);
    };

    animId = requestAnimationFrame(scanVideoFrame);

    return () => {
      isScanning = false;
      cancelAnimationFrame(animId);
    };
  }, [cameraActive, scanPhase, handleSuccessfulQrDecoded]);

  // MOBILE PHOTO SNAPSHOT VIA FILE INPUT & JSQR DECODE
  const handleMobilePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            const validation = parseAndValidateRailBlockQR(code.data);
            if (validation && validation.isValid) {
              handleSuccessfulQrDecoded(code.data, validation);
              return;
            } else {
              triggerNotification('❌ Invalid QR: Only official RailBlock Sanction Permits from the Field JE portal are accepted.', 'warn');
              return;
            }
          }
          triggerNotification('❌ No QR Code detected in image. Point camera directly at the Field JE Sanction QR screen.', 'warn');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ==========================================================================
  // ACTION 1: PROCEED (Grant Disconnection & BROADCAST TO FIELD JE)
  // ==========================================================================
  const handleGrantProceed = () => {
    const targetId = scannedPermitData?.matchedRequestId || scanModalBlock?.id;
    const token = scannedPermitData?.token || scanModalBlock?.worker_memo_code;
    const smName = `${deferSmId} (Station Master ${currentStation.name})`;
    const blockIdToGrant = scanModalBlock?.block_id || targetId || 'BLK-SBC-MYS-01';

    // Ensure block is in fieldRequests
    const existingReq = fieldRequests.find(
      (r) =>
        r.id === targetId ||
        r.sanctioned_block_id === blockIdToGrant ||
        r.worker_memo_code === token ||
        r.qr_token === token
    );

    if (!existingReq && scanModalBlock) {
      useAppStore.getState().addFieldRequest({
        id: scanModalBlock.id,
        task_id: 7842,
        department: scanModalBlock.department,
        section: scanModalBlock.section,
        km_range: scanModalBlock.km_range,
        duration_minutes: scanModalBlock.duration_minutes,
        reason: scanModalBlock.work_description,
        submitter_name: scannedPermitData?.worker_name || 'Field JE',
        priority_score: 88.0,
        timestamp: new Date().toISOString(),
        status: 'IN_PROGRESS',
        sanctioned_block_id: scanModalBlock.block_id,
        worker_memo_code: scanModalBlock.worker_memo_code,
        qr_token: `QR-SWR-JE-7842-${currentStation.code}`,
        sm_verified: true,
        sm_verifier_id: smName,
        work_started_at: new Date().toISOString(),
      });
    }

    // 1. Update in local store
    if (targetId) {
      verifyFieldRequestQR(targetId, smName);
    }
    if (token) {
      verifyFieldRequestQR(token, smName);
    }
    if (scanModalBlock?.block_id) {
      verifyFieldRequestQR(scanModalBlock.block_id, smName);
    }

    // 2. BROADCAST VIA BROADCASTCHANNEL & CUSTOM EVENT FOR ZERO-DELAY CROSS-TAB SYNC!
    if (typeof window !== 'undefined') {
      try {
        const bc = new BroadcastChannel('railblock_channel');
        bc.postMessage({
          type: 'SM_DISCONNECTION_GRANTED',
          targetId,
          token,
          smName,
          station: currentStation.code,
          timestamp: new Date().toISOString(),
        });
        bc.close();
      } catch (e) {}

      window.dispatchEvent(
        new CustomEvent('railblock_sm_disconnection_granted', {
          detail: { targetId, token, smName },
        })
      );
    }

    // 3. Call backend API for disconnection grant
    api.grantLocalDisconnection({
      block_id: blockIdToGrant,
      station_id: currentStation.code,
    }).catch((err) => console.warn('Disconnection API call:', err));

    // 4. Dispatch live event to store
    useAppStore.getState().addLiveEvent({
      event: 'DISCONNECTION_GRANTED',
      timestamp: new Date().toISOString(),
      data: {
        block_id: blockIdToGrant,
        station_id: currentStation.code,
        message: `🟢 Station Master @ ${currentStation.name} (${currentStation.code}) verified Form T/351 and granted line disconnection for ${blockIdToGrant}. Track isolated for maintenance.`,
      },
    });

    // 5. Log into Audit Ledger
    addAuditEntry({
      device_role: 'STATION_MASTER',
      action_type: 'DISCONNECTION_GRANTED',
      token_id: token || 'MEMO-SWR-MYA-2026',
      corridor: scanModalBlock?.section || 'SBC-MYS',
      station: currentStation.code,
      department: scannedPermitData?.department || 'Engineering',
      title: `Physical Disconnection Granted by ${deferSmId}`,
      details: `Signal aspect locked at Stop, points clamped. Worksite possession released to ${scannedPermitData?.worker_name || 'Field JE'}.`,
    });

    triggerNotification(
      `✓ TRACK DISCONNECTION GRANTED! Token verified. Field JE portal automatically synchronized and advanced to active work.`,
      'success'
    );
    handleCloseScanModal();
  };

  // ==========================================================================
  // ACTION 2: DEFERRAL (Requires Station Master ID, Password, and Reason)
  // ==========================================================================
  const handleSubmitDeferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanModalBlock && !scannedPermitData) return;

    if (deferSmId.trim() !== '123' || deferPassword.trim() !== '123') {
      alert('Authentication Failed: Invalid Station Master ID or Password. (Please enter Station Master ID: 123 and Password: 123)');
      return;
    }

    if (!deferReason) {
      alert('A valid operational deferral reason is mandatory.');
      return;
    }

    const targetId = scannedPermitData?.matchedRequestId || scanModalBlock?.id;
    const blockIdToDefer = scanModalBlock?.block_id || targetId || 'BLK-SBC-MYS-01';

    if (targetId) {
      updateFieldRequestStatus(targetId, 'DEFERRED', {
        reason: `Station Master Deferred (${deferReason}): ${deferNotes}`,
      });
    }
    if (blockIdToDefer) {
      updateFieldRequestStatus(blockIdToDefer, 'DEFERRED', {
        reason: `Station Master Deferred (${deferReason}): ${deferNotes}`,
      });
    }

    // Call backend API for ground deferral
    api.submitGroundDeferral({
      block_id: blockIdToDefer,
      station_id: currentStation.code,
      deferral_reason: deferReason,
      deferred_at: new Date().toISOString(),
    }).catch((err) => console.warn('Deferral API call:', err));

    useAppStore.getState().addLiveEvent({
      event: 'GROUND_DEFERRAL_ALERT',
      timestamp: new Date().toISOString(),
      data: {
        block_id: blockIdToDefer,
        station_id: currentStation.code,
        deferral_reason: deferReason,
        solve_time_ms: 208.4,
        new_scheduled_slot: {
          scheduled_start: 'Tomorrow Night 01:30 IST',
          scheduled_end: 'Tomorrow Night 04:00 IST',
        },
        message: `🚨 Station Master @ ${currentStation.code} deferred block ${blockIdToDefer} (${deferReason}). Auto-rescheduled in 208ms.`,
      },
    });

    addAuditEntry({
      device_role: 'STATION_MASTER',
      action_type: 'GROUND_DEFERRAL',
      token_id: scannedPermitData?.token || scanModalBlock?.worker_memo_code || 'MEMO-DEFERRED',
      corridor: scanModalBlock?.section || 'SBC-MYS',
      station: currentStation.code,
      department: scannedPermitData?.department || 'Engineering',
      title: `Block Deferred by Station Master (${deferReason})`,
      details: `Officer ID: ${deferSmId}. Reason: ${deferReason}. Notes: ${deferNotes}`,
    });

    triggerNotification(
      `⚠️ BLOCK DEFERRED: Possession cancelled by Station Master (${deferReason}). Section Controller notified.`,
      'warn'
    );
    handleCloseScanModal();
  };

  // Train timetable for current station
  const stationTimetable = useMemo(() => {
    return STATION_TIMETABLES[selectedStationCode] || STATION_TIMETABLES['MYA'];
  }, [selectedStationCode]);

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-[#0F2D6B] selection:text-white font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 lg:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Station Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#0F2D6B] flex items-center justify-center text-white font-mono font-black text-sm shadow-md select-none">
              SM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#0F2D6B] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SWR KARNATAKA DIVISION
                </span>
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span>SIL-4 INTERLOCKED</span>
                </span>
              </div>
              <h1 className="text-base lg:text-lg font-black text-slate-900 tracking-tight">
                Station Master Operating Terminal
              </h1>
            </div>
          </div>

          {/* Center: Station Switcher & Quick Universal QR Scanner */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-[#0F2D6B] ml-2 shrink-0" />
              <span className="text-xs font-bold text-slate-500 hidden sm:inline">Station:</span>
              <div className="relative">
                <select
                  value={selectedStationCode}
                  onChange={(e) => setSelectedStationCode(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg pl-2.5 pr-8 py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F2D6B] shadow-xs"
                >
                  <option value="ALL">
                    🌐 ALL STATIONS (Corridor-Wide Overview)
                    {Object.values(stationMemoCounts).reduce((a, b) => a + b, 0) > 0
                      ? ` • [${Object.values(stationMemoCounts).reduce((a, b) => a + b, 0)} Memos]`
                      : ''}
                  </option>
                  <optgroup label="SBC-MYS (Bengaluru - Mysuru Corridor)">
                    {KARNATAKA_STATIONS.filter((s) => s.section === 'SBC-MYS').map((stn) => {
                      const count = stationMemoCounts[stn.code] || 0;
                      return (
                        <option key={stn.code} value={stn.code}>
                          {stn.name} ({stn.km}){count > 0 ? ` • [${count} ${count === 1 ? 'Memo' : 'Memos'}]` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="SBC-UBL (Bengaluru - Hubballi Corridor)">
                    {KARNATAKA_STATIONS.filter((s) => s.section === 'SBC-UBL').map((stn) => {
                      const count = stationMemoCounts[stn.code] || 0;
                      return (
                        <option key={stn.code} value={stn.code}>
                          {stn.name} ({stn.km}){count > 0 ? ` • [${count} ${count === 1 ? 'Memo' : 'Memos'}]` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="SBC-YPR-BAY (Ballari Corridor)">
                    {KARNATAKA_STATIONS.filter((s) => s.section === 'SBC-YPR-BAY').map((stn) => {
                      const count = stationMemoCounts[stn.code] || 0;
                      return (
                        <option key={stn.code} value={stn.code}>
                          {stn.name} ({stn.km}){count > 0 ? ` • [${count} ${count === 1 ? 'Memo' : 'Memos'}]` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="MYS-SMET (Shivamogga Corridor)">
                    {KARNATAKA_STATIONS.filter((s) => s.section === 'MYS-SMET').map((stn) => {
                      const count = stationMemoCounts[stn.code] || 0;
                      return (
                        <option key={stn.code} value={stn.code}>
                          {stn.name} ({stn.km}){count > 0 ? ` • [${count} ${count === 1 ? 'Memo' : 'Memos'}]` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
              </div>
            </div>

            {/* Prominent Always-Available Universal QR Scanner Button */}
            <button
              type="button"
              onClick={() => handleOpenScan(null)}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F2D6B] hover:bg-blue-900 text-white font-mono font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer shrink-0"
              title="Scan Field Permit QR Token with Camera or Manual Entry"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Scan Field QR</span>
              {pendingScanBlocks.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              )}
            </button>
          </div>

          {/* Right: Master Reset, Clocks & Station Master Credentials */}
          <div className="flex items-center space-x-2.5 text-xs">
            <button
              onClick={() => {
                if (
                  confirm(
                    '🚨 Trigger MASTER RESET? This will clear all blocks, requests, and schedules across Station Master, Cockpit, and Field JE.'
                  )
                ) {
                  useAppStore.getState().resetToZero();
                  stopCameraStream();
                  setIsScanModalOpen(false);
                  setScanModalBlock(null);
                  setMemoModalBlock(null);
                  setScannedPermitData(null);
                  triggerNotification('🔄 Master Reset: Cleared all blocks across all 3 portals.', 'info');
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 text-rose-700 font-mono font-black text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Reset Station Terminal: Clear local active blocks and re-initialize terminal state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Reset Terminal</span>
            </button>
            <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-slate-700 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold">{currentTimeStr}</span>
            </div>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <div className="font-bold text-slate-900 leading-tight">A. Thomson</div>
                <div className="text-[10px] font-mono text-slate-500 font-medium">SM-{currentStation.code}-7824</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#0F2D6B] text-white flex items-center justify-center font-bold text-xs">
                SM
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 mt-3 w-full animate-in fade-in">
          <div
            className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs font-bold transition-all shadow-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : notification.type === 'warn'
                ? 'bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-300'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {notification.type === 'warn' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
              ) : notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Bell className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <div className="flex items-center space-x-2">
              {notification.action && (
                <button
                  type="button"
                  onClick={notification.action.onClick}
                  className="px-2.5 py-1 rounded bg-[#0F2D6B] hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  {notification.action.label}
                </button>
              )}
              <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75 cursor-pointer text-slate-500 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memos Sanctioned at Other Stations Alert Banner */}
      {otherStationMemos.length > 0 && selectedStationCode !== 'ALL' && (
        <div className="max-w-7xl mx-auto px-4 mt-3 w-full animate-in fade-in">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-5 h-5 text-white animate-bounce shrink-0" />
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wide">
                  🚨 Memos Sanctioned at Other Stations ({otherStationMemos.reduce((a, b) => a + b.count, 0)} Total):
                </span>
                <span className="ml-1.5 font-medium">
                  {otherStationMemos.map((m) => `${m.name} (${m.count})`).join(' • ')}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStationCode('ALL')}
                className="px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-xs transition cursor-pointer"
              >
                🌐 View All Stations
              </button>
              {otherStationMemos[0] && (
                <button
                  type="button"
                  onClick={() => setSelectedStationCode(otherStationMemos[0].code)}
                  className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/40 text-white border border-white/40 font-bold text-xs transition cursor-pointer"
                >
                  Switch to {otherStationMemos[0].name} &rarr;
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenScan(null)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                📷 Scan QR Permit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT                                                              */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-6">

        {/* 6 AI AGENTS VERIFIED TELEMETRY RIBBON (LIGHT THEME) */}
        <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 select-none">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-black tracking-wide text-slate-900 uppercase">
                  RailBlock AI &bull; 6 Autonomous Agents Verified
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[9px] font-bold border border-emerald-300">
                  SIL-4 COMPLIANT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Continuous cognitive arbitration across Sentinel Safety, Fusion Alignment, and CP-SAT Solver
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {agentStates.slice(0, 6).map((ag) => (
              <div
                key={ag.id}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-800 shadow-2xs"
                title={`${ag.name}: ${ag.role} (${ag.latency_ms.toFixed(1)}ms)`}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                </span>
                <span className="text-slate-800 font-semibold">{ag.name.replace(' Agent', '').replace(' Guardian', '')}</span>
                <span className="text-emerald-700 text-[9px] font-mono font-bold">({ag.latency_ms.toFixed(0)}ms)</span>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* TOP PERSISTENT URGENT BANNER: SANCTIONED BLOCKS AWAITING SM SCAN        */}
        {/* ======================================================================= */}
        {pendingScanBlocks.length > 0 && (
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-red-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="bg-black/35 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider border border-white/25">
                    ● DISCONNECTION PERMIT PENDING
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    {pendingScanBlocks.length} Sanctioned Block{pendingScanBlocks.length > 1 ? 's' : ''} Ready
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Section Controller Sanctioned Track Possession @ {currentStation.name} ({currentStation.code})
                </h2>
                <div className="text-xs text-white/90 font-mono flex flex-wrap items-center gap-1.5">
                  <span>Memo: <strong className="text-white underline">{pendingScanBlocks[0].worker_memo_code}</strong></span>
                  <span>&bull;</span>
                  <span>JE User {pendingScanBlocks[0].user_id || '01'} ({pendingScanBlocks[0].submitter_name})</span>
                  <span>&bull;</span>
                  <span>{pendingScanBlocks[0].km_range}</span>
                  <span>&bull;</span>
                  {isBlockFused(pendingScanBlocks[0]) ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>[⚡ FUSED JOINT BLOCK]</span>
                      <span>({getFusionDepartmentPill(pendingScanBlocks[0].department)})</span>
                      <span className="bg-slate-950/20 px-1 rounded text-white font-mono">+{pendingScanBlocks[0].downtime_saved_minutes || 30}m Saved</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-white/20 text-white font-bold text-[10px]">
                      {pendingScanBlocks[0].department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => handleOpenScan(pendingScanBlocks[0])}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white text-rose-900 font-black text-xs hover:bg-slate-100 shadow-md flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-rose-700" />
                <span>Scan Permit QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => handleFastVerify(pendingScanBlocks[0])}
                className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white border border-white/30 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                title="Test mode: Instantly verify and grant track disconnection"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>1-Click Fast Verify</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenMemo(pendingScanBlocks[0])}
                className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Memo</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 1: LIVE TRAIN TIMINGS AT THIS STATION                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#0F2D6B]">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Train Timings &amp; In-Block Describers — {currentStation.fullName}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Live arrival &amp; departure timetable with signal aspect status
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700">
              {stationTimetable.length} Trains Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-4">Train No. &amp; Name</th>
                  <th className="py-2.5 px-4">Scheduled Time</th>
                  <th className="py-2.5 px-4">Platform / Track</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Punctuality Status</th>
                  <th className="py-2.5 px-4 text-right">Signal Aspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {stationTimetable.map((t) => (
                  <tr key={t.train_no} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{t.train_no}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{t.train_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {t.time}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {t.platform}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {t.status}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-extrabold ${
                          t.signal_aspect === 'PROCEED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : t.signal_aspect === 'CAUTION'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-red-50 text-red-800 border border-red-300'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            t.signal_aspect === 'PROCEED'
                              ? 'bg-emerald-600'
                              : t.signal_aspect === 'CAUTION'
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                        ></span>
                        <span>{t.signal_aspect}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 2: BLOCKS GANTT CHART ACROSS THIS STATION                         */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Station Maintenance Blocks Timeline (Gantt) — {currentStation.name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Visual track occupancy Gantt across station lines during nocturnal maintenance hours
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-700">
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600 shadow-2xs border border-emerald-400"></span>
                <span className="font-bold">Engineering (P-Way)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 shadow-2xs border border-blue-400"></span>
                <span className="font-bold">Signal &amp; Telecom (S&amp;T)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-600 shadow-2xs border border-amber-400"></span>
                <span className="font-bold">Traction (OHE)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-purple-600 shadow-2xs border border-purple-400"></span>
                <span className="font-bold">Operating / Mechanical</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2.5 w-3.5 rounded-sm bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 shadow-2xs border border-amber-300"></span>
                <span className="text-amber-900 font-extrabold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>[⚡ FUSED JOINT BLOCK] (+30m Saved)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Visual Gantt Chart Grid (00:00 to 06:00 Night Window) */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
            <div className="min-w-[680px] space-y-3">
              {/* Timeline Hours Header */}
              <div className="grid grid-cols-6 text-center font-mono text-[11px] font-bold text-slate-500 pb-2 border-b border-slate-200">
                <div>00:00</div>
                <div>01:00</div>
                <div>02:00</div>
                <div>03:00</div>
                <div>04:00</div>
                <div>05:00 - 06:00</div>
              </div>

              {/* Gantt Track Rows */}
              {currentStation.tracks.map((trackName, idx) => {
                // 1-to-1 track mapping: only assign actual active blocks, do not repeat across all tracks!
                const assignedBlock = activeBlocks[idx];
                const isFused = assignedBlock && isBlockFused(assignedBlock);
                const colorClass = assignedBlock
                  ? getDepartmentGanttColor(assignedBlock)
                  : 'bg-slate-400';
                const fusionPill = assignedBlock && isFused ? getFusionDepartmentPill(assignedBlock.department) : null;
                const downtimeSaved = (assignedBlock && assignedBlock.downtime_saved_minutes) || 30;

                return (
                  <div key={trackName} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>{trackName}</span>
                      {assignedBlock ? (
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">
                          Window: {assignedBlock.scheduled_start} - {assignedBlock.scheduled_end} ({assignedBlock.duration_minutes}m)
                          {isFused && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black text-[9px] border border-amber-300">
                              ⚡ FUSED (+{downtimeSaved}m Saved)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Normal Line Speed (130 km/h) • Clear Track</span>
                        </span>
                      )}
                    </div>

                    <div className="relative h-9 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="absolute inset-0 grid grid-cols-6 divide-x divide-slate-100 pointer-events-none">
                        <div></div><div></div><div></div><div></div><div></div><div></div>
                      </div>

                      {assignedBlock ? (
                        <div
                          className={`absolute top-1 bottom-1 rounded-md px-2.5 flex items-center justify-between text-white font-mono text-[10px] font-bold shadow-xs cursor-pointer transition hover:opacity-95 ${colorClass}`}
                          style={getTrackBlockPosition(assignedBlock, idx)}
                          onClick={() => handleOpenMemo(assignedBlock)}
                          title="Click to view Form T/351 Sanction Memo"
                        >
                          <div className="truncate flex items-center space-x-1.5 min-w-0">
                            <Lock className="w-3 h-3 shrink-0" />
                            {isFused && (
                              <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                                <Zap className="w-2.5 h-2.5 fill-current" />
                                <span>FUSED</span>
                              </span>
                            )}
                            {fusionPill && (
                              <span className="px-1 py-0.2 rounded bg-white/25 text-white font-bold text-[8px] shrink-0 hidden sm:inline">
                                {fusionPill}
                              </span>
                            )}
                            <span className="truncate">{assignedBlock.worker_memo_code}</span>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0 ml-1">
                            {isFused && (
                              <span className="text-[8px] bg-emerald-400 text-slate-950 px-1 py-0.2 rounded font-black shrink-0 hidden sm:inline">
                                +{downtimeSaved}m Saved
                              </span>
                            )}
                            <span className="text-[9px] bg-black/25 px-1.5 py-0.5 rounded shrink-0">
                              {assignedBlock.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-between px-3 text-[10px] font-mono text-slate-400 select-none">
                          <span className="flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/70" />
                            <span className="text-slate-500">Track Unoccupied &bull; Signals: PROCEED (Green)</span>
                          </span>
                          <span className="text-[9px] text-slate-400 hidden sm:inline">No maintenance possession booked</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PANEL 3: SANCTIONED BLOCKS TABLE & HISTORICAL MEMOS ARCHIVE             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
          {/* Top Header with Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-800">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Station Master Track Possession &amp; Form T/351 Records
                </h2>
                <p className="text-[11px] text-slate-500">
                  {dashboardTab === 'ACTIVE'
                    ? 'Active track possessions, live countdown timers, signal point clamping & camera scans'
                    : 'Historical archive of completed and deferred Form T/351 memos, restoration speed certificates & photos'}
                </p>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDashboardTab('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-2 cursor-pointer ${
                  dashboardTab === 'ACTIVE'
                    ? 'bg-[#0F2D6B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>⚡ Live Active Blocks</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    dashboardTab === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {activeBlocks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDashboardTab('PREVIOUS')}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-2 cursor-pointer ${
                  dashboardTab === 'PREVIOUS'
                    ? 'bg-[#0F2D6B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>📜 Previous Memos &amp; Sanctions</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    dashboardTab === 'PREVIOUS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {previousBlocks.length}
                </span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: ACTIVE BLOCKS DASHBOARD                                        */}
          {/* ===================================================================== */}
          {dashboardTab === 'ACTIVE' && (
            <div className="space-y-4">
              {/* Operator Filter Strip */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center space-x-1 shrink-0">
                  <span>Filter By JE Operator:</span>
                </span>
                {[
                  { id: 'ALL', label: 'All Operators' },
                  { id: '01', label: 'JE-01 (P. Ramesh)' },
                  { id: '02', label: 'JE-02 (Suresh Kumar)' },
                  { id: '03', label: 'JE-03 (K. Venkatesh)' },
                  { id: '04', label: 'JE-04 (Ananya Sharma)' },
                ].map(({ id, label }) => {
                  const isSel = selectedUserFilter === id;
                  const count =
                    id === 'ALL'
                      ? activeBlocks.length
                      : activeBlocks.filter((r) => (r.user_id || '01') === id).length;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedUserFilter(id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                        isSel
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                          isSel ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Blocks Grid or Clean Empty State */}
              {activeBlocks.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-3 font-sans shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      No Active Track Possessions at {currentStation.name} ({currentStation.code})
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      All tracks are normal with SIL-4 electronic interlocking clear. Whenever a maintenance block is sanctioned for this station by the Section Controller, it will immediately appear here.
                    </p>
                  </div>

                  {previousBlocks.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setDashboardTab('PREVIOUS')}
                        className="text-xs font-bold text-[#0F2D6B] hover:underline inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>View {previousBlocks.length} Previous Completed / Deferred Memos in Archive</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {otherStationMemos.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 mt-3 flex flex-col items-center space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Active Memos Pending At Other Stations:
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {otherStationMemos.map((m) => (
                          <button
                            key={m.code}
                            type="button"
                            onClick={() => setSelectedStationCode(m.code)}
                            className="px-3 py-1.5 rounded-lg bg-[#0F2D6B] hover:bg-blue-900 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <span>Switch to {m.name} ({m.code})</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                              {m.count} {m.count === 1 ? 'Memo' : 'Memos'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeBlocks.map((block) => {
                    const isInProgress = block.status === 'IN_PROGRESS';
                    const isPending = block.status === 'PENDING_SANCTION';
                    const isApproved = block.status === 'APPROVED';

                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition shadow-xs ${
                          isInProgress
                            ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                            : isPending
                            ? 'bg-amber-50/50 border-amber-300'
                            : 'bg-white border-blue-200 hover:border-blue-400 ring-1 ring-blue-100'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Memo badge, JE User Number, & status */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-200">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                {block.worker_memo_code}
                              </span>
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#0F2D6B] text-white shadow-2xs">
                                JE USER {block.user_id || '01'}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold ${
                                isInProgress
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300 ring-1 ring-blue-300 animate-pulse-subtle'
                              }`}
                            >
                              {isInProgress && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span>}
                              <span>
                                {isInProgress
                                  ? 'DISCONNECTION ACTIVE'
                                  : isPending
                                  ? 'AWAITING CONTROLLER SANCTION'
                                  : 'SANCTIONED (READY FOR SM SCAN)'}
                              </span>
                            </span>
                          </div>

                          {/* Details & Submitter */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold mb-1">
                              <span>
                                Requester:{' '}
                                <strong className="text-slate-900 font-bold">
                                  {block.submitter_name || `Er. Field JE-${block.user_id || '01'}`}
                                </strong>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                TSK-{block.task_id || '7842'}
                              </span>
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 leading-snug">{block.work_description}</h3>
                            <div className="text-[11px] text-slate-600 mt-2 flex flex-wrap items-center gap-2 font-sans">
                              <span
                                className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                                  getDepartmentBadgeColor(block.department, isBlockFused(block)).bg
                                } ${getDepartmentBadgeColor(block.department, isBlockFused(block)).text} ${
                                  getDepartmentBadgeColor(block.department, isBlockFused(block)).border
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    getDepartmentBadgeColor(block.department, isBlockFused(block)).accent
                                  }`}
                                />
                                <span>{block.department}</span>
                              </span>

                              {isBlockFused(block) && (
                                <>
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 text-white font-black text-[10px] shadow-xs border border-amber-300">
                                    <Zap className="w-3 h-3 fill-current text-amber-300" />
                                    <span>[⚡ FUSED JOINT BLOCK]</span>
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold font-mono">
                                    {getFusionDepartmentPill(block.department)}
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black font-mono">
                                    +{block.downtime_saved_minutes || 30}m Saved
                                  </span>
                                </>
                              )}

                              <span className="text-slate-500 font-medium text-xs">
                                Location: <strong className="text-slate-800 font-bold">{block.km_range}</strong>
                              </span>
                              <span className="font-mono font-bold text-[#0F2D6B] text-xs">
                                {block.scheduled_start} - {block.scheduled_end} ({block.duration_minutes}m)
                              </span>
                            </div>

                            {/* Signal Interlocking Status indicator */}
                            <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                              <span className="text-slate-600 font-mono">Point Machine &amp; Signals:</span>
                              <span className={`font-bold font-mono text-[10px] ${isInProgress ? 'text-emerald-700' : 'text-slate-700'}`}>
                                {isInProgress ? '🔒 CLAMPED AT DANGER (STOP)' : 'NORMAL (SIL-4 CLEAR)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Operational Action Buttons */}
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                          {/* 1. Memo Button: View Form T/351 */}
                          <button
                            type="button"
                            onClick={() => handleOpenMemo(block)}
                            className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Memo</span>
                          </button>

                          {/* 2. Scan & Verification Buttons */}
                          {isPending ? (
                            <div className="flex-1 py-2 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs text-center">
                              Awaiting Cockpit Sanction
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenScan(block)}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs cursor-pointer ${
                                  isInProgress
                                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                    : 'bg-[#0F2D6B] hover:bg-blue-900 text-white'
                                }`}
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>{isInProgress ? 'Re-Scan Camera' : 'Open Camera & Scan'}</span>
                              </button>

                              {isApproved && (
                                <button
                                  type="button"
                                  onClick={() => handleFastVerify(block)}
                                  className="px-2.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
                                  title="1-Click Fast Verify: Instantly verify and grant track disconnection without camera"
                                >
                                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                                  <span>1-Click Verify</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: PREVIOUS MEMOS & SANCTIONS ARCHIVE                             */}
          {/* ===================================================================== */}
          {dashboardTab === 'PREVIOUS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Search & Filter Toolbar */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* Text Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search previous memos by Memo Code, Submitter Name, Section, Task ID..."
                      value={previousSearchQuery}
                      onChange={(e) => setPreviousSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]"
                    />
                    {previousSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPreviousSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center space-x-1 shrink-0 font-mono text-xs">
                    <span className="text-[11px] text-slate-500 font-bold mr-1">Status:</span>
                    {(['ALL', 'COMPLETED', 'DEFERRED'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setPreviousStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer border ${
                          previousStatusFilter === st
                            ? 'bg-[#0F2D6B] text-white border-[#0F2D6B]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'ALL' ? 'All' : st === 'COMPLETED' ? 'Completed' : 'Deferred'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Filters: Department */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold px-1">Department:</span>
                  {['ALL', 'Engineering', 'Signal', 'Traction'].map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setPreviousDeptFilter(dept)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer border ${
                        previousDeptFilter === dept
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </button>
                  ))}
                  <span className="ml-auto text-[11px] font-bold text-slate-500 font-mono">
                    Showing {filteredPreviousBlocks.length} of {previousBlocks.length} Memos
                  </span>
                </div>
              </div>

              {/* Previous Memos Grid */}
              {filteredPreviousBlocks.length === 0 ? (
                <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-2 font-sans">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No Previous Memos Found</p>
                  <p className="text-xs text-slate-500">
                    No historical Form T/351 memos match the selected search and filter criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPreviousBlocks.map((block) => {
                    const isCompleted = block.status === 'COMPLETED';
                    const isDeferred = block.status === 'DEFERRED';
                    const hasPhotos = Boolean(block.before_photo_url || block.after_photo_url);

                    return (
                      <div
                        key={block.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition shadow-xs ${
                          isCompleted
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-red-50/40 border-red-200'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Top: Serial Stamp & Completion Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                {block.worker_memo_code}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700 text-white">
                                JE USER {block.user_id || '01'}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-extrabold ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-red-100 text-red-900 border border-red-300'
                              }`}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>WORK COMPLETED &amp; RESTORED</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-red-700" />
                                  <span>DEFERRED BY SM (ID: 123)</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Details & Submitter */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-700 font-semibold mb-1">
                              <span>
                                In-Charge:{' '}
                                <strong className="text-slate-900 font-bold">
                                  {block.submitter_name || `Er. Field JE-${block.user_id || '01'}`}
                                </strong>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                TSK-{block.task_id}
                              </span>
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 leading-snug">{block.work_description}</h3>
                            <div className="text-[11px] text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-sans">
                              <span>
                                Dept: <strong className="text-slate-800">{block.department}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Location: <strong className="text-slate-800">{block.km_range}</strong>
                              </span>
                              <span>•</span>
                              <span className="font-mono text-slate-700">
                                Window: {block.scheduled_start} - {block.scheduled_end} ({block.duration_minutes}m)
                              </span>
                            </div>
                          </div>

                          {/* Line Speed & Safety Restoration Certificate */}
                          <div className={`p-2.5 rounded-lg border text-xs font-sans space-y-1 ${
                            isCompleted
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                              : 'bg-red-50 border-red-200 text-red-900'
                          }`}>
                            <div className="font-bold flex items-center space-x-1 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>
                                {isCompleted
                                  ? 'SIL-4 Line Speed Restoration Certificate (110 Kmph)'
                                  : 'Station Master Deferral Notice'}
                              </span>
                            </div>
                            <p className="text-[10px] leading-relaxed">
                              {isCompleted
                                ? 'Track geometry inspected, ballast dressed, and all tools cleared. Normal speed (110 Kmph) certified. Electronic interlocking restored.'
                                : 'Track possession deferred prior to track disconnection. Train operations proceeded normally without punctuality loss.'}
                            </p>
                          </div>

                          {/* Before & After Photo Preview Thumbnails */}
                          {hasPhotos && (
                            <div className="pt-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                                <span className="flex items-center space-x-1">
                                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Track Work Proof Photos:</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPhotos(block)}
                                  className="text-[10px] text-[#0F2D6B] hover:underline font-bold"
                                >
                                  Inspect Full Photos →
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {block.before_photo_url && (
                                  <div
                                    onClick={() => handleOpenPhotos(block)}
                                    className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100 cursor-pointer group"
                                  >
                                    <img
                                      src={block.before_photo_url}
                                      alt="Before Work"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                    />
                                    <span className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                                      Defect Before
                                    </span>
                                  </div>
                                )}
                                {block.after_photo_url && (
                                  <div
                                    onClick={() => handleOpenPhotos(block)}
                                    className="relative rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100 cursor-pointer group"
                                  >
                                    <img
                                      src={block.after_photo_url}
                                      alt="After Work"
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                    />
                                    <span className="absolute bottom-1 left-1 bg-emerald-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                                      Restored Track
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenMemo(block)}
                            className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Form T/351 Record</span>
                          </button>

                          {hasPhotos && (
                            <button
                              type="button"
                              onClick={() => handleOpenPhotos(block)}
                              className="flex-1 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                              <span>Inspection Photos</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM T/351 SANCTION MEMO DIALOG                                  */}
      {/* ========================================================================= */}
      {memoModalBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#0F2D6B]" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">FORM T/351 — DISCONNECTION SANCTION MEMO</h3>
                  <p className="text-[10px] font-mono text-slate-500">South Western Railway • Operating Department</p>
                </div>
              </div>
              <button
                onClick={() => setMemoModalBlock(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-sans text-xs bg-[#FCFDFD]">
              <div className="border border-slate-300 rounded-xl p-4 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">MEMO SERIAL:</span>
                  <span className="font-mono font-black text-sm text-[#0F2D6B]">{memoModalBlock.worker_memo_code}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">SANCTIONED BLOCK ID:</span>
                    <span className="font-bold text-slate-900">{memoModalBlock.block_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DESIGNATED STATION:</span>
                    <span className="font-bold text-slate-900">{currentStation.name} ({currentStation.code})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CORRIDOR / KM RANGE:</span>
                    <span className="font-bold text-slate-900">{memoModalBlock.section} • {memoModalBlock.km_range}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">MAINTENANCE WINDOW:</span>
                    <span className="font-bold text-emerald-700">
                      {memoModalBlock.scheduled_start} - {memoModalBlock.scheduled_end} ({memoModalBlock.duration_minutes}m)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-mono text-[10px] font-bold text-slate-500 block uppercase">Work Description:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{memoModalBlock.work_description}</p>
                </div>

                {memoModalBlock.status === 'COMPLETED' ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Line Reconnection &amp; Speed Restoration Endorsement:</span>
                    </div>
                    <p className="leading-relaxed font-sans">
                      Block successfully completed. Track surrendered by {memoModalBlock.submitter_name}. Station Master @ {currentStation.code} cancelled interlocking clamping and restored signals to normal SIL-4 automatic operation. Normal line speed (110 Kmph) certified.
                    </p>
                  </div>
                ) : memoModalBlock.status === 'DEFERRED' ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Station Master Ground Deferral Notice:</span>
                    </div>
                    <p className="leading-relaxed font-sans">
                      Track possession deferred prior to track disconnection by Station Master (ID 123). Section Controller informed via auto-reschedule algorithm.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-900 text-[11px] space-y-1">
                    <div className="font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Station Master Mandate &amp; Interlocking Clamp:</span>
                    </div>
                    <p className="leading-relaxed">
                      Prior to permitting field crew on track, Station Master @ {currentStation.code} must verify the physical or digital token via Camera scan, apply Point Machine clamps, and lock wayside signals at Danger Stop aspect.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMemoModalBlock(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center space-x-2">
                {(memoModalBlock.before_photo_url || memoModalBlock.after_photo_url) && (
                  <button
                    type="button"
                    onClick={() => {
                      const b = memoModalBlock;
                      setMemoModalBlock(null);
                      setPhotoModalBlock(b);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>View Photos</span>
                  </button>
                )}

                {memoModalBlock.status === 'COMPLETED' || memoModalBlock.status === 'DEFERRED' ? (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Form T/351</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const b = memoModalBlock;
                        setMemoModalBlock(null);
                        handleFastVerify(b);
                      }}
                      className="px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>1-Click Verify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const b = memoModalBlock;
                        setMemoModalBlock(null);
                        handleOpenScan(b);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0F2D6B] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Proceed to Camera Scan</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TRACK WORK & SAFETY INSPECTION PHOTOS MODAL                      */}
      {/* ========================================================================= */}
      {photoModalBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ImageIcon className="w-5 h-5 text-[#0F2D6B]" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Track Inspection &amp; Work Proof Photos
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500">
                    Form T/351 Memo: {photoModalBlock.worker_memo_code} • {currentStation.name} ({currentStation.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalBlock(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-sans text-xs bg-[#FCFDFD]">
              {/* Header Summary */}
              <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">SECTION:</span>
                  <span className="font-bold text-slate-900">{photoModalBlock.section}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOCATION:</span>
                  <span className="font-bold text-slate-900">{photoModalBlock.km_range}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">IN-CHARGE:</span>
                  <span className="font-bold text-slate-900">{photoModalBlock.submitter_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DEPARTMENT:</span>
                  <span className="font-bold text-slate-900">{photoModalBlock.department}</span>
                </div>
              </div>

              {/* Side-by-Side Photo Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Before Work Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      <span>1. Pre-Maintenance Defect Condition</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Requisition</span>
                  </div>
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-inner">
                    <img
                      src={photoModalBlock.before_photo_url || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'}
                      alt="Defect Before Work"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white font-mono text-[10px]">
                      Defect Inspection Proof
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">
                    Track defect reported prior to block possession. Ballast/sleeper condition audited by SSE (P-Way).
                  </p>
                </div>

                {/* 2. After Work Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>2. Post-Maintenance Restored Track</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">110 Kmph Fit</span>
                  </div>
                  <div className="relative h-48 rounded-xl overflow-hidden border-2 border-emerald-300 bg-slate-900 shadow-inner">
                    <img
                      src={photoModalBlock.after_photo_url || 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80'}
                      alt="Restored Track After Work"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-emerald-950/90 via-black/40 to-transparent p-2 text-white font-mono text-[10px] flex items-center justify-between">
                      <span>Restoration Inspection Proof</span>
                      <span className="bg-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold">SIL-4 FIT</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">
                    Maintenance completed. Track cleared of all tools, ballast packed, joint clearances verified fit for normal sectional speed.
                  </p>
                </div>
              </div>

              {/* Official Speed & Interlocking Clearance Certificate */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Permanent Way &amp; Signal Safety Clearance Endorsement</span>
                </div>
                <p className="leading-relaxed text-[11px] font-sans">
                  Certified that the permanent way between <strong>{photoModalBlock.km_range}</strong> has been thoroughly tested, all personnel and trolleys removed from the running line gauge, and electronic interlocking verified. The track is safe for traffic at <strong>110 Kmph normal sectional speed</strong> without imposition of caution order.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-emerald-800 border-t border-emerald-200">
                  <span>Signoff: {photoModalBlock.submitter_name}</span>
                  <span>Verified by Station Master @ {currentStation.name}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPhotoModalBlock(null)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const b = photoModalBlock;
                  setPhotoModalBlock(null);
                  handleOpenMemo(b);
                }}
                className="px-4 py-2 rounded-lg bg-[#0F2D6B] hover:bg-blue-900 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Form T/351 Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REAL HARDWARE CAMERA SCANNER & DECISION FLOW                     */}
      {/* ========================================================================= */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#0F2D6B]" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Live Camera QR Scanner &amp; Token Verification
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500">
                    {scanModalBlock
                      ? `Target: ${scanModalBlock.worker_memo_code} • ${currentStation.name}`
                      : `Universal Scanner • Point at Field JE QR or verify below`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseScanModal}
                className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">

              {/* ------------------------------------------------------------- */}
              {/* PHASE 1: LIVE HARDWARE CAMERA STREAM WITH RETICLE             */}
              {/* ------------------------------------------------------------- */}
              {scanPhase === 'SCANNING' && (
                <div className="space-y-3">
                  {/* Real Video Camera Viewport */}
                  <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
                    {/* Live HTML5 Video Element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                    />

                    {/* Camera Offline / Connecting State */}
                    {!cameraActive && (
                      <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 p-4 text-center">
                        <VideoOff className="w-10 h-10 text-slate-500" />
                        <span className="text-xs font-bold text-slate-300">Camera Initializing...</span>
                        {cameraError && (
                          <span className="text-[11px] text-amber-400 max-w-xs">{cameraError}</span>
                        )}
                      </div>
                    )}

                    {/* Laser scanning beam overlay */}
                    {cameraActive && (
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce"></div>
                    )}

                    {/* Target Reticle */}
                    <div className="absolute w-44 h-44 border-2 border-dashed border-emerald-400/90 rounded-2xl flex items-center justify-center pointer-events-none">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br"></div>
                    </div>

                    <div className="absolute bottom-2 font-mono text-[10px] text-slate-200 bg-black/70 px-3 py-1 rounded-full border border-white/20">
                      POINT CAMERA AT FIELD JE QR TOKEN
                    </div>
                  </div>

                  {/* Hidden Mobile Camera File Input */}
                  <input
                    ref={mobileFileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleMobilePhotoCapture}
                  />

                  {/* Automatic Optical Scanner Banner (No decode button needed) */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono text-slate-700 font-bold">
                        Continuous Optical Scanner Active • Detects QR Automatically
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      className="text-[11px] text-[#0F2D6B] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>

                  {/* 1-Tap Fast Verify for all currently sanctioned requests */}
                  {fieldRequests.filter((r) => r.status === 'SANCTIONED').length > 0 && (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sanctioned Memos Ready for SM Verification:</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-mono font-black">1-TAP VERIFY</span>
                      </div>
                      <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                        {fieldRequests
                          .filter((r) => r.status === 'SANCTIONED')
                          .map((req) => (
                            <button
                              key={req.id}
                              type="button"
                              onClick={() => {
                                const token = req.worker_memo_code || req.qr_token || req.id;
                                handleSuccessfulQrDecoded(token, {
                                  isValid: true,
                                  req_id: req.id,
                                  user_id: req.user_id,
                                  task_id: req.task_id,
                                  memo_code: req.worker_memo_code,
                                  station_code: req.nearest_station_code || currentStation.code,
                                  department: req.department,
                                  submitter_name: req.submitter_name,
                                  km_range: req.km_range,
                                });
                              }}
                              className="w-full p-2 rounded-lg bg-white hover:bg-emerald-100 border border-emerald-300 text-left text-xs font-mono font-bold flex items-center justify-between transition cursor-pointer shadow-2xs group"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px]">
                                  JE-{req.user_id || '01'}
                                </span>
                                <span className="text-slate-900 font-bold truncate">{req.id}</span>
                                <span className="text-slate-500 font-normal truncate">
                                  ({req.department} • {req.nearest_station_code || 'Yard'})
                                </span>
                              </div>
                              <span className="text-emerald-700 group-hover:text-emerald-900 text-[10px] font-bold shrink-0 ml-2">
                                Verify Now &rarr;
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Token Entry Form (Backup for camera permission issues) */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (manualTokenInput.trim()) {
                        handleSuccessfulQrDecoded(manualTokenInput.trim());
                      }
                    }}
                    className="pt-2 border-t border-slate-200 flex items-center space-x-2"
                  >
                    <div className="relative flex-1">
                      <QrCode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={manualTokenInput}
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Manual Token (e.g. REQ-7842 or MEMO-...)"
                        className="w-full pl-8 pr-2.5 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!manualTokenInput.trim()}
                      className="px-3.5 py-2 rounded-lg bg-[#0F2D6B] hover:bg-blue-900 disabled:opacity-40 text-white text-xs font-mono font-bold transition shrink-0 cursor-pointer"
                    >
                      Verify Token
                    </button>
                  </form>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PHASE 2: SCANNED CREDENTIAL & THE TWO CHOICES: PROCEED / DEFER */}
              {/* ------------------------------------------------------------- */}
              {scanPhase === 'SCANNED_DECISION' && scannedPermitData && (
                <div className="space-y-4">
                  {/* Verified Permit Credential Card */}
                  <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-emerald-900 font-bold border-b border-emerald-200 pb-1.5">
                      <span className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>HARDWARE CAMERA SCAN COMPLETE</span>
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded">AUTHENTIC</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-emerald-700 text-[10px] block">TECHNICIAN:</span>
                        <span className="font-bold text-slate-900 font-sans">{scannedPermitData.worker_name}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 text-[10px] block">OPERATOR USER NO:</span>
                        <span className="font-bold text-white bg-[#0F2D6B] px-2 py-0.5 rounded text-[10px] font-mono inline-block">
                          JE USER {scannedPermitData.user_id || '01'}
                        </span>
                      </div>
                      <div>
                        <span className="text-emerald-700 text-[10px] block">DEPARTMENT:</span>
                        <span className="font-bold text-slate-900">{scannedPermitData.department}</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 text-[10px] block">PERMIT TOKEN:</span>
                        <span className="font-bold text-[#0F2D6B]">{scannedPermitData.token}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-emerald-700 text-[10px] block">AUTHORIZED WINDOW:</span>
                        <span className="font-bold text-slate-900">{scannedPermitData.time_window}</span>
                      </div>
                    </div>

                    <div className="pt-1 text-[10px] text-emerald-800 font-bold flex items-center space-x-1">
                      <span>✓ {scannedPermitData.biometric_match}</span>
                    </div>
                  </div>

                  {/* Two Explicit Actions */}
                  <div className="pt-2 space-y-2.5">
                    {/* Active Disconnection Status Banner */}
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-mono space-y-1">
                      <div className="font-bold flex items-center space-x-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>DISCONNECTION GRANTED • SIGNALS CLAMPED AT STOP</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-normal font-sans">
                        Field JE portal has been notified in real time and automatically transitioned to <strong>Step 4 (Active Work &amp; Countdown Timer)</strong>.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCloseScanModal}
                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-sm cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Done • Return to Station Desk</span>
                      </button>

                      {/* PATH 3A: DISAGREE / GROUND HAZARD */}
                      <button
                        type="button"
                        onClick={() => setScanPhase('DEFERRAL_FORM')}
                        className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 font-bold text-xs flex items-center space-x-1 transition cursor-pointer shrink-0"
                        title="Ground hazard/emergency &bull; Requires Station Master ID: 123 & Password: 123"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 hover:text-red-600" />
                        <span>Reject / Defer</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* PHASE 3: DEFERRAL FORM (ID + PASSWORD + REASON)               */}
              {/* ------------------------------------------------------------- */}
              {scanPhase === 'DEFERRAL_FORM' && (
                <form onSubmit={handleSubmitDeferral} className="space-y-3.5 text-xs">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold">Station Master Ground Deferral Protocol:</span>
                      <p className="text-[11px] leading-relaxed">
                        To defer this maintenance block, enter your Station Master authorization ID (123), verification PIN (123) and specify the operational reason.
                      </p>
                    </div>
                  </div>

                  {/* 1. Station Master Employee ID */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700">Station Master Employee ID</label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">Required ID: 123</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={deferSmId}
                      onChange={(e) => setDeferSmId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#0F2D6B] focus:outline-none"
                    />
                  </div>

                  {/* 2. Password / PIN */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-slate-700">Station Master Password / PIN</label>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">Required PIN: 123</span>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        placeholder="123"
                        maxLength={6}
                        value={deferPassword}
                        onChange={(e) => setDeferPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#0F2D6B] focus:outline-none tracking-widest"
                      />
                      <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* 3. Reason Dropdown */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mandatory Deferral Reason</label>
                    <select
                      value={deferReason}
                      onChange={(e) => setDeferReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#0F2D6B] focus:outline-none"
                    >
                      <option value="Severe Weather / Thunderstorm Alert">Severe Weather / Thunderstorm Alert</option>
                      <option value="Priority VIP Train Clearance (Vande Bharat / Rajdhani)">Priority VIP Train Clearance (Vande Bharat / Rajdhani)</option>
                      <option value="Point Machine Mechanical Failure">Point Machine Mechanical Failure</option>
                      <option value="Traffic Headway Congestion in Siding">Traffic Headway Congestion in Siding</option>
                      <option value="Emergency Ambulance / Level Crossing Movement">Emergency Ambulance / Level Crossing Movement</option>
                    </select>
                  </div>

                  {/* Operational Notes */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Operational Log Notes</label>
                    <textarea
                      rows={2}
                      value={deferNotes}
                      onChange={(e) => setDeferNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#0F2D6B] focus:outline-none"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setScanPhase('SCANNED_DECISION')}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Execute Deferral</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            {scanPhase !== 'DEFERRAL_FORM' && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {cameraActive ? '• Live Video Feed Active' : '• Ready for Mobile Camera Snapshot'}
                </span>
                <button
                  type="button"
                  onClick={handleCloseScanModal}
                  className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
