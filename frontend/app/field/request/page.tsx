'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { submitFieldDemand, completeWork, FieldDemandPayload } from '../../../lib/api';
import { useAppStore, FieldBlockRequest, createSpecializedRailBlockToken, resetLocalState, isFieldRequestMatch } from '../../../lib/store';
import { getNearestStation, RailwayStationInfo, ALL_STATION_DESKS } from '../../../lib/stations';
import { ALL_KARNATAKA_CORRIDORS } from '../../../lib/karnatakaGis';
import { JEUserProfile, DEFAULT_JE_USERS, getJEUser } from '../../../lib/users';
import { getDepartmentBadgeColor, isBlockFused, getFusionDepartmentPill } from '../../../lib/format';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Camera,
  QrCode,
  ShieldCheck,
  Check,
  RotateCcw,
  FileText,
  AlertTriangle,
  Zap,
  Radio,
  Timer,
  CheckSquare,
  ArrowRight,
  ChevronRight,
  Compass,
  PhoneCall,
  PlusCircle,
  Layers,
  MapPin,
  Sparkles,
  Hourglass,
  Send,
  Upload,
  User,
  UserCheck,
  LogOut,
  KeyRound,
  Building2,
  HardHat,
  Eye,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  X,
} from 'lucide-react';

const DEFECT_PHOTO_PRESETS = [
  {
    id: 'usfd-fracture',
    title: 'USFD Internal Rail Crack (IMR)',
    tag: 'PRIORITY DEFECT',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Internal transverse fatigue crack detected via ultrasonic flaw detector trolley.',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'point-machine',
    title: 'Worn Turnout Point Machine',
    tag: 'S&T CAUTION',
    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Switch blade gap > 4mm at turnout point. Motor re-sleeving and detector calibration required.',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'catenary-wire',
    title: 'Slack 25kV Catenary Dropper',
    tag: 'TRD POWER HAZARD',
    tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Overhead traction contact wire height deviation detected.',
    url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
  },
];

const COMPLETION_PHOTO_PRESETS = [
  {
    id: 'restored-rail',
    title: 'Restored & Tamped Rail Track',
    desc: 'Flash-butt weld executed, ultrasonic flaw test certified, ballast shoulder dynamic tamped to 130 km/h standard.',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'aligned-switch',
    title: 'Point Machine Aligned & Tested',
    desc: 'Switch motor aligned, lock bar tested, electronic interlocking route proven safe.',
    url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=800&q=80',
  },
];

// Authentic Scannable QR Code Canvas Component
function RealQrCodeCanvas({ payload, tokenCode }: { payload: string; tokenCode: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && payload) {
      QRCode.toCanvas(canvasRef.current, payload, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'L',
      }).catch((err) => console.error('QR rendering error:', err));
    }
  }, [payload]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded" />
      </div>
      <div className="flex flex-col items-center gap-1 w-full max-w-[280px] text-center">
        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
          AUTHENTIC RAILBLOCK SPECIALIZED PERMIT
        </span>
        <span className="font-mono text-xs font-bold tracking-widest text-slate-800">
          *{tokenCode}*
        </span>
      </div>
    </div>
  );
}

export default function FieldRequestPage() {
  // Multi-User Tenant State (Operators: 01, 02, 03, 04, or custom ID)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [operatorInputId, setOperatorInputId] = useState<string>('');
  const [isLoginMounted, setIsLoginMounted] = useState<boolean>(false);

  // Step 1 Form Inputs
  const [department, setDepartment] = useState<'Engineering' | 'Signal & Telecom' | 'Traction Distribution'>('Engineering');
  const [workerName, setWorkerName] = useState('P. Ramesh');
  const [workerRole, setWorkerRole] = useState('Junior Engineer (JE / P-Way)');
  const [employeeId, setEmployeeId] = useState('IR-JE-01');

  // Location & Window Details
  const [section, setSection] = useState('SBC-MYS');
  const [kmFrom, setKmFrom] = useState(105.0);
  const [kmTo, setKmTo] = useState(108.0);
  const [duration, setDuration] = useState(120);
  const [workNature, setWorkNature] = useState('Through Rail Renewal (TRR) & Weld Testing');
  const [workDescription, setWorkDescription] = useState('USFD rail crack renewal and track tamping required near Mandya Yard.');

  // Active Request Tracking (Persisted in localStorage with user isolation)
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 Defect Photo (Captured during initial Form T/351 requisition)
  const [requisitionPhotoUrl, setRequisitionPhotoUrl] = useState<string>('');
  const [requisitionPhotoDesc, setRequisitionPhotoDesc] = useState<string>('');
  const requisitionFileInputRef = useRef<HTMLInputElement>(null);

  // Store Connections
  const fieldRequests = useAppStore((s) => s.fieldRequests || []);
  const updateFieldRequestPhotos = useAppStore((s) => s.updateFieldRequestPhotos);
  const verifyFieldRequestQR = useAppStore((s) => s.verifyFieldRequestQR);
  const completeFieldRequest = useAppStore((s) => s.completeFieldRequest);

  // Dynamically calculate nearest station based on KM
  const nearestStation: RailwayStationInfo = getNearestStation(section, kmFrom);

  // Helper to load profile defaults for a given user ID
  const applyUserProfile = (userId: string) => {
    const profile = getJEUser(userId);
    setWorkerName(profile.name);
    setWorkerRole(profile.role);
    setEmployeeId(profile.employeeId);
    setDepartment(profile.department);
    setSection(profile.section);
    setKmFrom(profile.defaultKmFrom);
    setKmTo(profile.defaultKmTo);
    setWorkNature(profile.workNatureDefault);
    setWorkDescription(profile.workDescriptionDefault);
  };

  // Switch or Select User ID
  const handleSelectUser = (id: string) => {
    const cleanId = id.trim().padStart(2, '0');
    setCurrentUserId(cleanId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('railblock_je_user_id', cleanId);
      // ONLY load this exact user's active request - NEVER fall back to another user!
      const userReq = localStorage.getItem(`railblock_field_active_req_id_${cleanId}`);
      setActiveRequestId(userReq || null);
    }
    // Clean all local photo & form states when switching user
    setRequisitionPhotoUrl('');
    setRequisitionPhotoDesc('');
    setWorkPhotoUrl('');
    setWorkPhotoDesc('');
    setCompletionPhotoUrl('');
    setCompletionPhotoDesc('');
    setIsWorkDoneModalOpen(false);
    setExtensionNotice(null);
    applyUserProfile(cleanId);
  };

  const handleLogoutUser = () => {
    setCurrentUserId(null);
    setActiveRequestId(null);
    setRequisitionPhotoUrl('');
    setRequisitionPhotoDesc('');
    setWorkPhotoUrl('');
    setWorkPhotoDesc('');
    setCompletionPhotoUrl('');
    setCompletionPhotoDesc('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('railblock_je_user_id');
    }
  };

  const handleUniversalReset = () => {
    if (typeof window !== 'undefined') {
      if (
        confirm(
          'Are you sure you want to reset ALL requests and blocks across Field JE, Station Master, and Cockpit?'
        )
      ) {
        resetLocalState();
        setActiveRequestId(null);
        ['01', '02', '03', '04'].forEach((id) => {
          localStorage.removeItem(`railblock_field_active_req_id_${id}`);
        });
        localStorage.removeItem('railblock_field_active_req_id');
        setRequisitionPhotoUrl('');
        setRequisitionPhotoDesc('');
        setWorkPhotoUrl('');
        setWorkPhotoDesc('');
        setCompletionPhotoUrl('');
        setCompletionPhotoDesc('');
        setIsWorkDoneModalOpen(false);
        setExtensionNotice(null);
        useAppStore.setState({ fieldRequests: [] });
        if (currentUserId) {
          applyUserProfile(currentUserId);
        }
      }
    }
  };

  // Helper to persist active request strictly per current user
  const updateActiveRequest = (reqId: string | null) => {
    setActiveRequestId(reqId);
    if (typeof window !== 'undefined' && currentUserId) {
      if (reqId) {
        localStorage.setItem(`railblock_field_active_req_id_${currentUserId}`, reqId);
      } else {
        localStorage.removeItem(`railblock_field_active_req_id_${currentUserId}`);
      }
    }
  };

  // Restore user session and activeRequestId from localStorage ONLY on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('railblock_je_user_id');
      if (savedUser) {
        setCurrentUserId(savedUser);
        applyUserProfile(savedUser);
        const savedId = localStorage.getItem(`railblock_field_active_req_id_${savedUser}`);
        if (savedId) {
          setActiveRequestId(savedId);
        }
      }
      setIsLoginMounted(true);
    }
  }, []);

  // Handle Global System Reset
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSystemReset = () => {
      setActiveRequestId(null);
      ['01', '02', '03', '04'].forEach((id) => {
        localStorage.removeItem(`railblock_field_active_req_id_${id}`);
      });
      localStorage.removeItem('railblock_field_active_req_id');
      setRequisitionPhotoUrl('');
      setRequisitionPhotoDesc('');
      setWorkPhotoUrl('');
      setWorkPhotoDesc('');
      setCompletionPhotoUrl('');
      setCompletionPhotoDesc('');
      setIsWorkDoneModalOpen(false);
      setExtensionNotice(null);
      useAppStore.setState({ fieldRequests: [] });
      if (currentUserId) {
        applyUserProfile(currentUserId);
      }
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
  }, [currentUserId]);

  // Real-time synchronization listener for Station Master verification & auto-advancing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndSyncRequests = () => {
      try {
        const raw = localStorage.getItem('railblock_field_requests_v3');
        if (raw) {
          const parsed: FieldBlockRequest[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            useAppStore.setState({ fieldRequests: parsed });

            // If an active request is currently being tracked, keep it synced strictly per user
            const effectiveUser = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('railblock_je_user_id') : null) || '01';
            const activeId =
              (typeof window !== 'undefined' ? localStorage.getItem(`railblock_field_active_req_id_${effectiveUser}`) : null) ||
              (typeof window !== 'undefined' ? localStorage.getItem('railblock_field_active_req_id') : null) ||
              activeRequestId;

            if (activeId) {
              const match = parsed.find(
                (r) =>
                  (!effectiveUser || !r.user_id || r.user_id === effectiveUser) &&
                  (r.id === activeId ||
                    r.sanctioned_block_id === activeId ||
                    r.qr_token === activeId ||
                    r.worker_memo_code?.includes(activeId))
              );

              if (match) {
                if (activeRequestId !== match.id) {
                  setActiveRequestId(match.id);
                }
              }
            }
          }
        }
      } catch (err) {}
    };

    // 1. BroadcastChannel for zero-latency instant wakeup
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('railblock_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SM_DISCONNECTION_GRANTED' || event.data?.type === 'FIELD_REQUESTS_UPDATED') {
          if (event.data?.type === 'SM_DISCONNECTION_GRANTED') {
            const grantedId = event.data.targetId || event.data.req_id || event.data.token;
            if (grantedId) {
              useAppStore.getState().updateFieldRequestStatus(grantedId, 'IN_PROGRESS', {
                sm_verified: true,
                sm_verifier_id: event.data.smName || 'Station Master',
                work_started_at: new Date().toISOString(),
              });
            } else if (activeRequestId) {
              useAppStore.getState().updateFieldRequestStatus(activeRequestId, 'IN_PROGRESS', {
                sm_verified: true,
                sm_verifier_id: event.data.smName || 'Station Master',
                work_started_at: new Date().toISOString(),
              });
            }
          }
          checkAndSyncRequests();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      };
    } catch (e) {}

    // 2. Storage event for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'railblock_field_requests_v3' ||
        (currentUserId && e.key === `railblock_field_active_req_id_${currentUserId}`) ||
        e.key === 'railblock_je_user_id'
      ) {
        checkAndSyncRequests();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('railblock_field_requests_updated', checkAndSyncRequests);
    window.addEventListener('railblock_sm_disconnection_granted', checkAndSyncRequests);

    // 3. Fast polling timer every 800ms while on the page
    const timer = setInterval(checkAndSyncRequests, 800);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('railblock_field_requests_updated', checkAndSyncRequests);
      window.removeEventListener('railblock_sm_disconnection_granted', checkAndSyncRequests);
      clearInterval(timer);
    };
  }, [activeRequestId, currentUserId]);

  // Current Active Request from Store (strictly scoped to current user, resilient to missing/re-hydrated user_id)
  const currentRequest = activeRequestId
    ? fieldRequests.find(
        (r) =>
          isFieldRequestMatch(r, activeRequestId) &&
          (!currentUserId || !r.user_id || r.user_id === currentUserId)
      ) ||
      (typeof window !== 'undefined'
        ? (() => {
            try {
              const raw = localStorage.getItem('railblock_field_requests_v3');
              if (raw) {
                const list: FieldBlockRequest[] = JSON.parse(raw);
                return (
                  list.find(
                    (r) =>
                      isFieldRequestMatch(r, activeRequestId) &&
                      (!currentUserId || !r.user_id || r.user_id === currentUserId)
                  ) || null
                );
              }
            } catch (e) {}
            return null;
          })()
        : null)
    : null;

  // Track Work / Defect Photo (Uploaded AFTER Station Master Permission)
  const [workPhotoUrl, setWorkPhotoUrl] = useState<string>('');
  const [workPhotoDesc, setWorkPhotoDesc] = useState<string>('');
  const workFileInputRef = useRef<HTMLInputElement>(null);
  // Separate ref for the "Replace Photo" button in Step 4B to avoid duplicate ref conflict
  const workReplaceFileInputRef = useRef<HTMLInputElement>(null);

  // Completion Restored Track Photo (Uploaded when finishing work)
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('');
  const [completionPhotoDesc, setCompletionPhotoDesc] = useState<string>('');
  const completionFileInputRef = useRef<HTMLInputElement>(null);

  // Live Possession Countdown Timer
  const [timeLeftSec, setTimeLeftSec] = useState<number>(duration * 60);
  const [extensionNotice, setExtensionNotice] = useState<string | null>(null);
  const [statutoryChecked, setStatutoryChecked] = useState<boolean>(true);
  const [isSurrendering, setIsSurrendering] = useState<boolean>(false);
  const [isWorkDoneModalOpen, setIsWorkDoneModalOpen] = useState<boolean>(false);

  // Keep workPhotoUrl & completionPhotoUrl synced with currentRequest if already saved
  useEffect(() => {
    if (currentRequest?.before_photo_url && !workPhotoUrl) {
      setWorkPhotoUrl(currentRequest.before_photo_url);
      setWorkPhotoDesc(currentRequest.before_photo_desc || 'Track Work Photo');
    }
    if (currentRequest?.after_photo_url && !completionPhotoUrl) {
      setCompletionPhotoUrl(currentRequest.after_photo_url);
      setCompletionPhotoDesc(currentRequest.after_photo_desc || 'Completion Photo');
    }
  }, [currentRequest?.before_photo_url, currentRequest?.after_photo_url]);

  // Countdown timer ticks down strictly when possession is actively IN_PROGRESS AND Before Photo is uploaded!
  useEffect(() => {
    if (!currentRequest || (currentRequest.status !== 'IN_PROGRESS' && currentRequest.status !== 'DISCONNECTED')) return;
    if (!currentRequest.before_photo_url && !workPhotoUrl) return; // Strict gating per CORE_APP_FLOW.md
    const timer = setInterval(() => {
      setTimeLeftSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentRequest?.status, currentRequest?.before_photo_url, workPhotoUrl]);

  const formatCountdown = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs
      .toString()
      .padStart(2, '0')}s`;
  };

  const totalWindowSec = (currentRequest?.duration_minutes || duration) * 60;
  const elapsedSec = Math.max(0, totalWindowSec - timeLeftSec);
  const progressPercent = Math.min(100, Math.max(5, Math.round((elapsedSec / totalWindowSec) * 100)));

  // Real Image File Upload via FileReader
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'requisition' | 'work' | 'completion') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'requisition') {
        setRequisitionPhotoUrl(dataUrl);
        setRequisitionPhotoDesc(`Defect Evidence: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      } else if (type === 'work') {
        setWorkPhotoUrl(dataUrl);
        setWorkPhotoDesc(`Track Evidence: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        if (currentRequest) {
          updateFieldRequestPhotos(currentRequest.id, {
            before_photo_url: dataUrl,
            before_photo_desc: `Track Evidence: ${file.name}`,
          });
        }
      } else {
        // BUG FIX: persist after_photo to store so completion gallery renders it
        const desc = `Restored Proof: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        setCompletionPhotoUrl(dataUrl);
        setCompletionPhotoDesc(desc);
        if (currentRequest) {
          updateFieldRequestPhotos(currentRequest.id, {
            after_photo_url: dataUrl,
            after_photo_desc: desc,
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // STEP 1: Submit Form T/351 Requisition
  const handleSubmitDemand = async (e?: React.FormEvent, autoSanction: boolean = false) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const effectiveUser = currentUserId || (typeof window !== 'undefined' ? localStorage.getItem('railblock_je_user_id') : null) || '01';
    if (!currentUserId) setCurrentUserId(effectiveUser);

    const fullSubmitterTitle = `${workerName || 'Er. Field JE'}, ${workerRole} (${employeeId || 'IR-EMP'})`;
    const targetNearest = getNearestStation(section, kmFrom);
    const uniqueNum = Math.floor(10000 + Math.random() * 89999);
    const reqId = `REQ-${uniqueNum}`;
    const qrToken = `QR-SWR-JE-${uniqueNum}-${targetNearest.code}`;
    const memoCode = `MEMO-SWR-${targetNearest.code}-2026-${uniqueNum}`;

    const payload: FieldDemandPayload = {
      department,
      section,
      km_from: Number(kmFrom),
      km_to: Number(kmTo),
      duration_minutes: Number(duration),
      reason: `[${workNature}] ${workDescription}`,
      submitter_name: fullSubmitterTitle,
    };
    (payload as any).user_id = effectiveUser;

    let res: any = null;
    try {
      res = await submitFieldDemand(payload);
    } catch (err) {
      console.warn('Backend demand submit fallback:', err);
    }

    const finalTaskId = res?.task_id || uniqueNum;
    const finalReqId = res?.task_id ? `REQ-${res.task_id}` : reqId;
    const finalQrToken = res?.task_id ? `QR-SWR-JE-${res.task_id}-${targetNearest.code}` : qrToken;
    const finalMemoCode = res?.task_id ? `MEMO-SWR-${targetNearest.code}-2026-${res.task_id}` : memoCode;

    const initialBeforePhoto = requisitionPhotoUrl || '';
    const initialBeforeDesc = requisitionPhotoDesc || (requisitionPhotoUrl ? `Track Defect: ${workNature}` : '');

    const newRequest: FieldBlockRequest = {
      id: finalReqId,
      task_id: finalTaskId,
      department,
      section,
      km_range: `KM ${Number(kmFrom).toFixed(1)} - ${Number(kmTo).toFixed(1)}`,
      km_from: Number(kmFrom),
      km_to: Number(kmTo),
      duration_minutes: Number(duration),
      reason: `[${workNature}] ${workDescription}`,
      submitter_name: fullSubmitterTitle,
      user_id: effectiveUser,
      employee_id: employeeId || 'IR-JE-01',
      worker_role: workerRole,
      priority_score: res?.priority_score || (department === 'Engineering' ? 89.5 : 84.0),
      timestamp: new Date().toISOString(),
      status: autoSanction ? 'SANCTIONED' : 'PENDING_SANCTION',
      worker_memo_code: finalMemoCode,
      qr_token: finalQrToken,
      before_photo_url: initialBeforePhoto || undefined,
      before_photo_desc: initialBeforeDesc || undefined,
      nearest_station_code: targetNearest.code,
      nearest_station_name: targetNearest.name,
    };

    // 1. Immediately persist active request ID to avoid any race condition
    if (typeof window !== 'undefined') {
      localStorage.setItem(`railblock_field_active_req_id_${effectiveUser}`, finalReqId);
      localStorage.setItem('railblock_field_active_req_id', finalReqId);
      localStorage.setItem('railblock_je_user_id', effectiveUser);
      localStorage.removeItem('railblock_clean_zero_mode');
    }
    setActiveRequestId(finalReqId);

    // 2. Save to store & persistence
    useAppStore.getState().addFieldRequest(newRequest);

    if (autoSanction) {
      await useAppStore.getState().sanctionFieldRequest(finalReqId);
    }

    setTimeLeftSec(duration * 60);

    if (initialBeforePhoto) {
      setWorkPhotoUrl(initialBeforePhoto);
      setWorkPhotoDesc(initialBeforeDesc);
    }

    useAppStore.getState().addAuditEntry({
      device_role: 'FIELD_JE',
      action_type: 'DEMAND_SUBMITTED',
      token_id: finalQrToken,
      corridor: section,
      station: `${targetNearest.name} (${targetNearest.code})`,
      department,
      title: `Field Requisition Submitted [${finalReqId}]`,
      details: `${fullSubmitterTitle} requested ${duration}m block for ${workNature}. Target SM: ${targetNearest.name} (${targetNearest.code}, KM ${targetNearest.km.toFixed(1)}).`,
      metrics: `KM ${Number(kmFrom).toFixed(1)} - ${Number(kmTo).toFixed(1)} • Target SM: ${targetNearest.code}`,
    });

    setIsSubmitting(false);
  };

  // Extension Request during live work
  const handleRequestExtension = () => {
    setTimeLeftSec((prev) => prev + 15 * 60);
    setExtensionNotice('+15 Minutes Possession Extension Requested & Dispatched to Section Controller.');
    setTimeout(() => setExtensionNotice(null), 5000);

    useAppStore.getState().addAuditEntry({
      device_role: 'FIELD_JE',
      action_type: 'DEMAND_SUBMITTED',
      token_id: currentRequest?.qr_token || 'QR-SWR-JE-7842',
      corridor: section,
      station: nearestStation.name,
      department,
      title: 'Possession Extension Requested (+15 Min)',
      details: `Field Worker ${currentRequest?.submitter_name || workerName} requested +15m extension.`,
      metrics: '+15m Possession Extension',
    });
  };

  // Surrender Track with Completion Photo
  const handleSurrender = () => {
    if (!statutoryChecked) {
      alert('Please confirm the mandatory statutory safety declaration before track surrender.');
      return;
    }
    if (!activeRequestId) return;
    setIsSurrendering(true);

    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    const finalCompletionPhoto = completionPhotoUrl || COMPLETION_PHOTO_PRESETS[0].url;
    const finalCompletionDesc = completionPhotoDesc || COMPLETION_PHOTO_PRESETS[0].desc;

    setTimeout(() => {
      completeFieldRequest(activeRequestId, finalCompletionPhoto, finalCompletionDesc);
      setIsSurrendering(false);

      const targetBlockId = currentRequest?.sanctioned_block_id || activeRequestId;

      // Notify backend of block completion
      completeWork({
        block_id: targetBlockId,
        after_photo_url: finalCompletionPhoto,
        after_photo_desc: finalCompletionDesc,
      }).catch((err) => console.warn('Complete work API failed:', err));

      useAppStore.getState().addLiveEvent({
        event: 'WORK_COMPLETED',
        timestamp: new Date().toISOString(),
        data: {
          block_id: targetBlockId,
          after_photo_url: finalCompletionPhoto,
          after_photo_desc: finalCompletionDesc,
          message: `✅ Track restored and certified safe for 130 km/h speed. Form T/351 closed on ${section} (${nearestStation.name}).`,
        },
      });

      useAppStore.getState().addAuditEntry({
        device_role: 'FIELD_JE',
        action_type: 'SLOT_SANCTIONED',
        token_id: `CLEAR-${activeRequestId}-SURRENDER`,
        corridor: section,
        station: nearestStation.name,
        department,
        title: 'Track Handover & Block Surrendered with Restored Track Proof',
        details: `Field Worker ${currentRequest?.submitter_name || workerName} completed work. Restored track certified safe for 130 km/h line speed. Form T/351 closed.`,
        metrics: 'Track Cleared • Caution Order Lifted • Safe Line Speed Certified',
      });

      // BUG FIX: Keep activeRequestId so Step 5 completion screen can display
      // the before/after photos — but do NOT clear it (workflowStep derives from
      // currentRequest.status which is now 'COMPLETED', mapping to step 5).
      // Only clear user-specific storage so a fresh session won't auto-resume it.
      if (typeof window !== 'undefined' && currentUserId) {
        localStorage.removeItem(`railblock_field_active_req_id_${currentUserId}`);
        localStorage.removeItem('railblock_field_active_req_id');
      }
    }, 900);
  };

  // Active Workflow Step Determination
  const workflowStep = !currentRequest
    ? 1
    : currentRequest.status === 'PENDING_SANCTION'
    ? 2
    : currentRequest.status === 'SANCTIONED'
    ? 3
    : currentRequest.status === 'IN_PROGRESS' || currentRequest.status === 'DISCONNECTED'
    ? 4
    : 5; // COMPLETED

  const hasBeforePhoto = Boolean(currentRequest?.before_photo_url || workPhotoUrl);

  // Multi-User Tenant Login Gate
  if (isLoginMounted && !currentUserId) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Top Railway Banner */}
          <div className="bg-[#0F2D6B] text-white p-6 relative">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
                <HardHat className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-blue-200 uppercase">
                    INDIAN RAILWAYS • SOUTH WESTERN RAILWAY
                  </span>
                </div>
                <h1 className="text-xl font-black tracking-tight">Field Junior Engineer Operating Terminal</h1>
              </div>
            </div>
            <p className="text-xs text-blue-100 font-mono">
              Multi-Tenant Architecture • Select or enter your 2-Digit Field Operator ID to begin an independent possession session.
            </p>
          </div>

          {/* Body Selection Area */}
          <div className="p-6 space-y-6">
            {/* Quick 1-Tap Registered Operator Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                  Select Registered Operator ID:
                </label>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  Independent Sessions
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(DEFAULT_JE_USERS).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0F2D6B] hover:bg-blue-50/40 transition flex items-center space-x-3 text-left group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 shadow-xs ${user.avatarColor}`}>
                      <span className="text-[9px] opacity-80 leading-none">JE</span>
                      <span className="leading-tight">{user.id}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#0F2D6B] truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0 ml-1">
                          {user.stationCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.role}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{user.department} • {user.employeeId}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase font-semibold">
                OR ENTER CUSTOM OPERATOR ID
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Custom User ID Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (operatorInputId.trim()) {
                  handleSelectUser(operatorInputId.trim());
                }
              }}
              className="space-y-3"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-slate-700">
                  Custom Operator ID (e.g. 05, 12, 99):
                </label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      value={operatorInputId}
                      onChange={(e) => setOperatorInputId(e.target.value)}
                      placeholder="e.g. 05"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0F2D6B]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!operatorInputId.trim()}
                    className="px-5 py-2 rounded-xl bg-[#0F2D6B] hover:bg-blue-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono text-xs font-bold transition shadow-xs cursor-pointer flex items-center space-x-1.5 shrink-0"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-start space-x-2 text-[11px] text-slate-600 font-mono">
                <ShieldCheck className="w-4 h-4 text-[#0F2D6B] shrink-0 mt-0.5" />
                <p>
                  Each Operator ID manages independent block demands, countdown clocks, and before/after photo records with zero cross-device collision.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-16 selection:bg-blue-600 selection:text-white">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-900 truncate tracking-tight">
                  RailBlock AI
                </span>
                <span className="px-1.5 py-0.5 bg-blue-600 text-white font-mono text-[10px] font-bold rounded uppercase">
                  {department.slice(0, 3)} / FIELD
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider truncate">
                Form T/351 Field Operating Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full"
              title="Trackside GPS Differential Lock (RTK Active)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-emerald-700">GPS D-LOC</span>
            </div>

            <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
              <div className="px-2 py-1 rounded-lg bg-[#0F2D6B] text-white font-mono font-black text-xs shadow-xs" title={`Logged in as Field Operator JE-${currentUserId || '01'}`}>
                JE-{currentUserId || '01'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate">
                  {workerName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono leading-tight truncate">
                  {workerRole} ({employeeId})
                </span>
              </div>
              <button
                onClick={handleLogoutUser}
                className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer text-xs font-mono font-bold flex items-center space-x-1 ml-1"
                title="Switch Operator ID / Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Switch ID</span>
              </button>
              <button
                onClick={handleUniversalReset}
                className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-400 text-rose-700 transition cursor-pointer text-xs font-mono font-bold flex items-center space-x-1 ml-1"
                title="Universal Reset: Clear all blocks and requests across all 3 portals"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Reset All</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Active Demand Selector / Reset Bar */}
        {fieldRequests.filter((r) => !currentUserId || r.user_id === currentUserId).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-slate-500 shrink-0 font-bold">My Active Requisitions:</span>
              <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
                {fieldRequests
                  .filter((r) => !currentUserId || r.user_id === currentUserId)
                  .map((req) => (
                  <button
                    key={req.id}
                    onClick={() => updateActiveRequest(req.id)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition shrink-0 flex items-center space-x-1.5 ${
                      activeRequestId === req.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-300 text-slate-950">
                      JE-{req.user_id || '01'}
                    </span>
                    <span>{req.id}</span>
                    <span className="opacity-75 font-normal">({req.status})</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                updateActiveRequest(null);
                setRequisitionPhotoUrl('');
                setRequisitionPhotoDesc('');
                setWorkPhotoUrl('');
                setWorkPhotoDesc('');
                setCompletionPhotoUrl('');
                setCompletionPhotoDesc('');
              }}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition shrink-0 cursor-pointer"
            >
              + New Form T/351 Requisition
            </button>
          </div>
        )}

        {/* Operating Progress Workflow Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">
              CORE_APP_FLOW.md — 5-Step Possession Procedure
            </span>
            <span className="text-xs font-mono font-bold text-blue-700">
              {workflowStep === 1 && 'Step 1: Department Requisition (Form T/351)'}
              {workflowStep === 2 && 'Step 2: Awaiting Cockpit Sanction (Permit QR Locked)'}
              {workflowStep === 3 && 'Step 3: Permit QR Unlocked (Ready for SM Scan)'}
              {workflowStep === 4 && (!hasBeforePhoto ? 'Step 4A: Upload Before Photo to Start Timer' : 'Step 4B: Active Work & Timer')}
              {workflowStep === 5 && 'Step 5: Completion & Proof • Track Surrendered'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
            <div
              className={`p-2 rounded-lg border text-center ${
                workflowStep > 1
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : workflowStep === 1
                  ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block truncate">1. Requisition</span>
            </div>

            <div
              className={`p-2 rounded-lg border text-center ${
                workflowStep > 2
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : workflowStep === 2
                  ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block truncate">2. Awaiting Sanction</span>
            </div>

            <div
              className={`p-2 rounded-lg border text-center ${
                workflowStep > 3
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : workflowStep === 3
                  ? 'bg-blue-50 border-blue-400 text-blue-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block truncate">3. Unlocked QR</span>
            </div>

            <div
              className={`p-2 rounded-lg border text-center ${
                workflowStep > 4
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : workflowStep === 4
                  ? 'bg-purple-50 border-purple-400 text-purple-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block truncate">4. Timer & Work</span>
            </div>

            <div
              className={`p-2 rounded-lg border text-center ${
                workflowStep === 5
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="block truncate">5. Completed</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STAGE 1: ASK FOR BLOCK REQUISITION (NO PHOTO FORCED FIRST!)               */}
        {/* ========================================================================= */}
        {workflowStep === 1 && (
          <form onSubmit={handleSubmitDemand} className="space-y-4">
            {/* Step 1A: Department & Worker Identification */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Department & Worker Identity
                </h3>
              </div>

              {/* Department Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Railway Department:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'Engineering',
                      label: 'Engineering (P-Way)',
                      sub: 'Track, Rails & Ballast',
                      dotColor: 'bg-emerald-500',
                      selectedClass: 'bg-emerald-600 border-emerald-600 text-white shadow-md ring-2 ring-emerald-300',
                      unselectedClass: 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/60',
                    },
                    {
                      id: 'Signal & Telecom',
                      label: 'Signal & Telecom (S&T)',
                      sub: 'Point Machines, Axle Counters',
                      dotColor: 'bg-blue-500',
                      selectedClass: 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-300',
                      unselectedClass: 'bg-blue-50/50 border-blue-200 text-blue-900 hover:bg-blue-100/60',
                    },
                    {
                      id: 'Traction Distribution',
                      label: 'Electrical (TRD)',
                      sub: '25kV OHE Catenary & Mast',
                      dotColor: 'bg-amber-500',
                      selectedClass: 'bg-amber-600 border-amber-600 text-white shadow-md ring-2 ring-amber-300',
                      unselectedClass: 'bg-amber-50/50 border-amber-200 text-amber-900 hover:bg-amber-100/60',
                    },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDepartment(d.id as any)}
                      className={`py-3 px-3 rounded-xl border text-center transition font-semibold text-xs flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                        department === d.id ? d.selectedClass : d.unselectedClass
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${department === d.id ? 'bg-white' : d.dotColor}`} />
                        <span className="font-bold text-xs">{d.label}</span>
                      </div>
                      <span className={`text-[10px] block font-normal ${department === d.id ? 'text-white/90' : 'opacity-75'}`}>{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Worker Name, Role, and ID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Worker / Engineer Name
                  </label>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Designation / Role
                  </label>
                  <select
                    value={workerRole}
                    onChange={(e) => setWorkerRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Junior Engineer (JE)">Junior Engineer (JE)</option>
                    <option value="Senior Section Engineer (SSE)">Senior Section Engineer (SSE)</option>
                    <option value="Track Maintainer In-Charge">Track Maintainer In-Charge</option>
                    <option value="Signal Maintainer (ESM)">Signal Maintainer (ESM)</option>
                    <option value="OHE Linesman">OHE Linesman (TRD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Railway Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. IR-58291"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 1B: Location & Nearest Station Master Detection */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  Corridor Location & Nearest Station Master
                </h3>
              </div>

              {/* Quick Station Pre-fill (159 Stations) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    ⚡ Quick Station Pre-fill (All 159 Karnataka Stations)
                  </label>
                  <span className="text-[10px] font-mono text-blue-600 font-bold">Instant KM Autofill</span>
                </div>
                <select
                  onChange={(e) => {
                    const stnCode = e.target.value;
                    if (!stnCode) return;
                    const found = ALL_STATION_DESKS.find((s) => s.code === stnCode);
                    if (found) {
                      if (found.section) setSection(found.section);
                      const parsedKm = parseFloat(found.km.replace(/[^\d.]/g, '')) || 0;
                      setKmFrom(parsedKm);
                      setKmTo(+(parsedKm + 2.0).toFixed(1));
                    }
                  }}
                  defaultValue=""
                  className="w-full bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 text-xs text-[#0F2D6B] font-bold focus:border-[#0F2D6B] focus:outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    -- Select Station to Auto-fill Corridor &amp; KM Range --
                  </option>
                  {['Bengaluru', 'Mysuru', 'Hubballi', 'Konkan Railway', 'Kalaburagi', 'Guntakal'].map((div) => {
                    const stns = ALL_STATION_DESKS.filter(
                      (s) => s.division === div || (div === 'Konkan Railway' && s.division?.includes('Konkan'))
                    );
                    if (stns.length === 0) return null;
                    return (
                      <optgroup key={div} label={`${div} Division (${stns.length} Stations)`}>
                        {stns.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name} ({s.code} • {s.km})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Corridor Selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Railway Corridor Section
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
                >
                  {ALL_KARNATAKA_CORRIDORS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} ({c.name} • {c.total_km} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Chainage Limits (KM From & KM To) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Kilometer Post Chainage Limits
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono block">From KM Post</span>
                    <input
                      type="number"
                      step="0.1"
                      value={kmFrom}
                      onChange={(e) => setKmFrom(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold font-mono text-slate-900 mt-1"
                      required
                    />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 font-mono block">To KM Post</span>
                    <input
                      type="number"
                      step="0.1"
                      value={kmTo}
                      onChange={(e) => setKmTo(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-bold font-mono text-slate-900 mt-1"
                      required
                    />
                  </div>
                </div>

                {/* DYNAMIC NEAREST STATION MASTER BADGE */}
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start space-x-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="min-w-0 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-900">
                        Nearest Interlocking Authority: Station Master @ {nearestStation.name} ({nearestStation.code})
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-200 text-blue-900 text-[10px] font-bold">
                        {nearestStation.sm_id}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700/90 mt-0.5">
                      Station chainage at KM {nearestStation.km.toFixed(1)} • Memo will be routed directly to this Station Master.
                    </p>
                  </div>
                </div>
              </div>

              {/* Possession Duration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Requested Block Duration (Minutes)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[60, 90, 120, 180, 240].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`py-2 px-2 rounded-lg border text-center font-mono text-xs font-semibold transition ${
                        duration === dur
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {dur} Min
                    </button>
                  ))}
                </div>
              </div>

              {/* Nature of Work & Reason */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Nature of Maintenance Work
                  </label>
                  <input
                    type="text"
                    value={workNature}
                    onChange={(e) => setWorkNature(e.target.value)}
                    placeholder="e.g. Through Rail Renewal (TRR), Point Overhaul, OHE Tensioning"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Work Description & Justification (Form T/351)
                  </label>
                  <textarea
                    rows={2}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    placeholder="Describe the track condition and reason for requesting this possession window..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-sans focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* STEP 1 DEFECT PHOTO UPLOAD / REAL CAMERA CAPTURE */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                    <Camera className="w-4 h-4 text-blue-700" />
                    <span>Attach Ground Track Defect Photo (Optional / On-Site)</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">
                    {requisitionPhotoUrl ? '✓ Photo Attached' : 'Camera or Presets Available'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  Take a photo of the rail crack, switch blade gap, or catenary defect on site with your camera, or select a defect preset.
                </p>

                {/* Hidden File Input for Step 1 Photo */}
                <input
                  ref={requisitionFileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'requisition')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => requisitionFileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-blue-300 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{requisitionPhotoUrl ? 'Retake / Change Photo' : '📸 Take Photo with Camera / Upload'}</span>
                  </button>

                  <div className="flex items-center space-x-1.5 overflow-x-auto">
                    {DEFECT_PHOTO_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setRequisitionPhotoUrl(p.url);
                          setRequisitionPhotoDesc(p.title);
                        }}
                        className={`p-2 rounded-lg border text-left text-[11px] transition cursor-pointer shrink-0 ${
                          requisitionPhotoUrl === p.url
                            ? 'bg-blue-100 border-blue-400 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="truncate max-w-[140px] font-semibold">{p.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {requisitionPhotoUrl && (
                  <div className="rounded-xl border border-blue-300 bg-white p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-blue-200">
                        <img src={requisitionPhotoUrl} alt="Defect" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-blue-900 block truncate">
                          {requisitionPhotoDesc || 'Defect Evidence Attached'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Ready to transmit with Form T/351</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRequisitionPhotoUrl('');
                        setRequisitionPhotoDesc('');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[10px] font-bold transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Triggers */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    {isSubmitting
                      ? 'Transmitting Form T/351 to Section Controller Cockpit...'
                      : 'Submit Block Requisition to Section Controller (Form T/351)'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmitDemand(undefined, true)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-2xs"
                  title="Submit and immediately sanction in one tap for rapid field testing"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>⚡ 1-Click Fast Track: Submit & Sanction Directly (Jump to Step 3 QR Permit)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: AWAITING COCKPIT CONFIRMATION & SANCTION (LOCKED / BLURRED QR)   */}
        {/* ========================================================================= */}
        {workflowStep === 2 && currentRequest && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-amber-300 p-5 shadow-xs space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Hourglass className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Requisition Transmitted • Awaiting Cockpit Sanction
                  </h3>
                  <p className="text-xs text-slate-500">
                    Form T/351 is currently queued at the Central Section Controller Cockpit.
                  </p>
                </div>
              </div>

              {/* Summary of submitted demand */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Demand ID</span>
                  <span className="font-bold text-slate-900">{currentRequest.id}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Department</span>
                  <span className="font-bold text-blue-700">{currentRequest.department}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Track Span</span>
                  <span className="font-bold text-slate-900">{currentRequest.km_range}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Window Time</span>
                  <span className="font-bold text-slate-900">{currentRequest.duration_minutes} Mins</span>
                </div>
              </div>

              {/* Nearest SM target info */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-mono text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">
                    Assigned Nearest Station: {nearestStation.name} ({nearestStation.code})
                  </span>
                  <span className="text-[11px] text-blue-700 block">
                    Memo will be dispatched to Station Master ID: {nearestStation.sm_id}
                  </span>
                </div>
                <div className="px-2.5 py-1 bg-blue-100/70 border border-blue-200 text-[#0F2D6B] font-mono font-bold text-xs rounded flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting Section Sanction</span>
                </div>
              </div>

              {/* LOCKED / BLURRED QR CODE PER CORE_APP_FLOW.md STEP 1 */}
              <div className="relative rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-6 flex flex-col items-center justify-center overflow-hidden">
                {/* Blurred QR Matrix */}
                <div className="filter blur-md opacity-40 select-none pointer-events-none transition-all duration-500 scale-95">
                  <RealQrCodeCanvas
                    payload={createSpecializedRailBlockToken(currentRequest)}
                    tokenCode={currentRequest.qr_token || `QR-SWR-JE-LOCKED`}
                  />
                </div>

                {/* Centered Lock Overlay Card */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] text-center space-y-2.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xl border-2 border-amber-300 animate-pulse">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-amber-500 text-white font-mono text-xs font-black rounded-full uppercase tracking-wider shadow-sm inline-block">
                      QR CODE LOCKED • AWAITING CONTROLLER SANCTION
                    </span>
                    <p className="text-xs font-semibold text-slate-900 max-w-sm bg-white/95 px-3.5 py-2 rounded-xl border border-amber-300 shadow-md">
                      Form T/351 requisition submitted. This QR code is <strong>locked and inactive</strong>. The instant Section Controller sanctions the block in the Cockpit, it will <strong>automatically unlock</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Advance / Sanction Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (currentRequest) {
                      await useAppStore.getState().sanctionFieldRequest(currentRequest.id);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0F2D6B] hover:bg-[#0c2456] text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Verify Sanction &amp; Receive Permit (Form T/351)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: COCKPIT SANCTIONED -> SCANNABLE QR MEMO GENERATED & DISPLAYED    */}
        {/* ========================================================================= */}
        {workflowStep === 3 && currentRequest && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-xs font-bold tracking-wider uppercase">
                    Official Form T/351 Electronic Permit
                  </span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-mono text-[10px] font-bold rounded">
                  SANCTIONED BY COCKPIT
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Permit Token Code
                    </span>
                    <span className="text-xl font-mono font-bold text-blue-700">
                      {currentRequest.qr_token || `QR-SWR-JE-7842-${nearestStation.code}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Target Interlocking Station
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {nearestStation.name} ({nearestStation.code}) • {nearestStation.sm_id}
                    </span>
                  </div>
                </div>

                {/* Department & Fusion Status Strip */}
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                      getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).bg
                    } ${getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).text} ${
                      getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).border
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).accent
                      }`}
                    />
                    <span>{currentRequest.department}</span>
                  </span>

                  {isBlockFused(currentRequest) && (
                    <>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 text-white font-black text-xs shadow-xs border border-amber-300">
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>[⚡ FUSED JOINT BLOCK]</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
                        {getFusionDepartmentPill(currentRequest.department)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black font-mono">
                        +{currentRequest.downtime_saved_minutes || 30}m Saved via Integrated Possession
                      </span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Sanctioned Window</span>
                        <span className="font-bold text-slate-900">{currentRequest.duration_minutes} Minutes</span>
                        <span className="text-[10px] text-emerald-600 block font-semibold">
                          Allocated by Controller
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">Corridor & Section</span>
                        <span className="font-bold text-slate-900">{currentRequest.section}</span>
                        <span className="text-[10px] text-slate-500 block">{currentRequest.km_range}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg col-span-2">
                        <span className="text-[10px] text-slate-500 block">Authorized Field Worker</span>
                        <span className="font-bold text-slate-900 truncate block">
                          {currentRequest.submitter_name}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <QrCode className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Present to Nearest Station Master:</span>
                      </div>
                      <p className="leading-relaxed font-sans">
                        Take this screen to <strong>Station Master @ {nearestStation.name} ({nearestStation.code})</strong>. The Station Master will scan this QR code on the Station Terminal (<code>/station</code>) to apply signal clamp interlocking and grant physical track disconnection.
                      </p>
                    </div>
                  </div>

                  {/* Guaranteed Scannable Authentic QR Code Canvas */}
                  <RealQrCodeCanvas
                    payload={createSpecializedRailBlockToken(currentRequest)}
                    tokenCode={currentRequest.qr_token || `QR-SWR-JE-7842-${nearestStation.code}`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const smTitle = `Station Master (${nearestStation.name})`;
                      useAppStore.getState().updateFieldRequestStatus(currentRequest.id, 'IN_PROGRESS', {
                        sm_verified: true,
                        sm_verifier_id: smTitle,
                        work_started_at: new Date().toISOString(),
                      });
                      try {
                        const bc = new BroadcastChannel('railblock_channel');
                        bc.postMessage({
                          type: 'SM_DISCONNECTION_GRANTED',
                          targetId: currentRequest.id,
                          token: currentRequest.qr_token,
                          smName: smTitle,
                          station: nearestStation.code,
                          timestamp: new Date().toISOString(),
                        });
                        bc.close();
                      } catch (e) {}
                      window.dispatchEvent(
                        new CustomEvent('railblock_sm_disconnection_granted', {
                          detail: { targetId: currentRequest.id, token: currentRequest.qr_token, smName: smTitle },
                        })
                      );
                    }}
                    className="py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-2xs cursor-pointer shrink-0"
                    title="Acknowledge Station Master Disconnection Token Clearance"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Confirm Ground Disconnection Clearance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: EXECUTION & TIMER (BEFORE PHOTO FIRST -> TIMER STARTS)           */}
        {/* ========================================================================= */}
        {workflowStep === 4 && currentRequest && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                  <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Permission Granted by Station Master • Track Disconnected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold rounded border border-emerald-300">
                    25kV OHE ISOLATED
                  </span>
                </div>
              </div>

              {/* Department & Fusion Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                      getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).bg
                    } ${getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).text} ${
                      getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).border
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        getDepartmentBadgeColor(currentRequest.department, isBlockFused(currentRequest)).accent
                      }`}
                    />
                    <span>{currentRequest.department}</span>
                  </span>

                  {isBlockFused(currentRequest) && (
                    <>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-600 text-white font-black text-xs shadow-xs border border-amber-300">
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>[⚡ FUSED JOINT BLOCK]</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
                        {getFusionDepartmentPill(currentRequest.department)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black font-mono">
                        +{currentRequest.downtime_saved_minutes || 30}m Saved
                      </span>
                    </>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-600">
                  <span>Loc: <strong className="text-slate-900">{currentRequest.km_range}</strong></span>
                  <span className="mx-1.5">&bull;</span>
                  <span>Station: <strong className="text-slate-900">{nearestStation.code}</strong></span>
                </div>
              </div>

              {/* GATED LIVE COUNTDOWN TIMER */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Remaining Possession Window Time
                  </span>
                  {hasBeforePhoto ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>TIMER ACTIVE</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                      TIMER STANDBY (GATED ON DEFECT PHOTO)
                    </span>
                  )}
                </div>

                <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight">
                  {hasBeforePhoto ? formatCountdown(timeLeftSec) : '--h --m --s'}
                </div>

                <p className="text-xs text-slate-500 font-mono">
                  {hasBeforePhoto
                    ? `Allocated: ${currentRequest.duration_minutes} Mins • T-Minus ${Math.ceil(timeLeftSec / 60)} min remaining`
                    : `Allocated: ${currentRequest.duration_minutes} Mins • Timer begins immediately once Before Photo is recorded below.`}
                </p>

                <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-300">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: hasBeforePhoto ? `${progressPercent}%` : '0%' }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-1">
                  <span>{hasBeforePhoto ? `${progressPercent}% Window Elapsed` : 'Waiting for on-track photo verification'}</span>
                  {hasBeforePhoto && (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Audible warning at 15m</span>
                    </span>
                  )}
                </div>
              </div>

              {extensionNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{extensionNotice}</span>
                </div>
              )}

              {/* ----------------------------------------------------------------- */}
              {/* STEP 4A: MANDATORY BEFORE / DEFECT PHOTO (IF NOT YET UPLOADED)    */}
              {/* ----------------------------------------------------------------- */}
              {!hasBeforePhoto ? (
                <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                      <Camera className="w-5 h-5 text-amber-700" />
                      <h4>Step 4: Upload Before / Defect Photo to Start Work &amp; Timer</h4>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed font-sans">
                      Per Indian Railways Safety Protocol, physical track work cannot commence and the possession timer will not begin until on-ground defect photo evidence is recorded.
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={workFileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'work')}
                  />

                  {/* Upload Button */}
                  <button
                    type="button"
                    onClick={() => workFileInputRef.current?.click()}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-amber-400 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>Capture On-Track Defect Photo with Camera or Upload Image</span>
                  </button>

                  {/* Quick presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-800">
                      Or Select Ground Defect Preset:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {DEFECT_PHOTO_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setWorkPhotoUrl(p.url);
                            setWorkPhotoDesc(`Defect Evidence: ${p.title}`);
                            if (currentRequest) {
                              updateFieldRequestPhotos(currentRequest.id, {
                                before_photo_url: p.url,
                                before_photo_desc: p.title,
                              });
                            }
                          }}
                          className="p-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-left text-xs transition cursor-pointer"
                        >
                          <p className="font-semibold line-clamp-1 text-slate-800">{p.title}</p>
                          <span className="text-[10px] text-amber-700 font-mono">Use Preset &rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ----------------------------------------------------------------- */
                /* STEP 4B: WORK ACTIVE, TIMER RUNNING & "WORK DONE" CTA             */
                /* ----------------------------------------------------------------- */
                <div className="space-y-4">
                  {/* Before Photo Verification Badge & Thumbnail */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-blue-300">
                        <img
                          src={workPhotoUrl}
                          alt="Before Defect Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Before Photo Recorded • Work in Progress</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-mono truncate">
                          {workPhotoDesc || 'On-Track Defect Evidence Captured'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => workReplaceFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition shrink-0 cursor-pointer"
                    >
                      Replace Photo
                    </button>
                  </div>

                  {/* Hidden File Input for Replace — SEPARATE REF to avoid duplicate ref bug */}
                  <input
                    ref={workReplaceFileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'work')}
                  />

                  {/* Extension & Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleRequestExtension}
                      className="p-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      <span>Request +15m Extension</span>
                    </button>

                    {/* PRIMARY STEP 5 TRIGGER: WORK DONE */}
                    <button
                      type="button"
                      onClick={() => setIsWorkDoneModalOpen(true)}
                      className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center space-x-2 transition shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>WORK DONE (Upload Finished Photo)</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* STEP 5 MODAL: UPLOAD AFTER PHOTO & SURRENDER TRACK                   */}
            {/* =================================================================== */}
            {isWorkDoneModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
                  {/* Modal Header */}
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Step 5: Completion &amp; Proof — Hand Over Track
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500">
                          Form T/351 Track Surrender &bull; 130 km/h Speed Certification
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWorkDoneModalOpen(false)}
                      className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 block">
                        Upload After / Finished Photo (Restored Track Proof):
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Record photographic proof of the finished rail weld, tamped ballast, or calibrated signal machine.
                      </p>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={completionFileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'completion')}
                    />

                    {/* Upload Button */}
                    <button
                      type="button"
                      onClick={() => completionFileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <span>
                        {completionPhotoUrl ? 'Take / Upload Different Restored Track Photo' : 'Capture Restored Track Photo with Camera or Upload File'}
                      </span>
                    </button>

                    {/* Completion Presets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {COMPLETION_PHOTO_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const presetDesc = `Restored Proof: ${p.title}`;
                            setCompletionPhotoUrl(p.url);
                            setCompletionPhotoDesc(presetDesc);
                            // BUG FIX: persist preset after_photo to store
                            if (currentRequest) {
                              updateFieldRequestPhotos(currentRequest.id, {
                                after_photo_url: p.url,
                                after_photo_desc: presetDesc,
                              });
                            }
                          }}
                          className={`p-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                            completionPhotoUrl === p.url
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <p className="font-semibold line-clamp-1">{p.title}</p>
                          <span className="text-[10px] text-emerald-600 font-mono">Select Proof &rarr;</span>
                        </button>
                      ))}
                    </div>

                    {/* HIGH RESOLUTION CLEAR PHOTO PREVIEW (PHOTO 2) */}
                    {completionPhotoUrl && (
                      <div className="rounded-xl border-2 border-emerald-500 overflow-hidden bg-slate-950 shadow-md space-y-2 p-3">
                        <div className="flex items-center justify-between text-xs text-white">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-bold font-mono">After Photo Attached</span>
                          </div>
                        </div>

                        <div className="relative w-full h-44 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 p-1">
                          <img
                            src={completionPhotoUrl}
                            alt="Restored Track"
                            className="max-h-full w-auto max-w-full object-contain rounded"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800">
                          <span className="truncate">{completionPhotoDesc || 'Restored Track Proof Captured on Site'}</span>
                          <span className="text-emerald-400 shrink-0 ml-2">IRS 130 km/h Certified</span>
                        </div>
                      </div>
                    )}

                    {/* Mandatory Statutory Declaration */}
                    <label className="flex items-start space-x-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={statutoryChecked}
                        onChange={(e) => setStatutoryChecked(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-slate-300 accent-blue-600 mt-0.5 shrink-0"
                      />
                      <div className="text-xs text-slate-700 leading-snug">
                        <strong className="text-slate-900">Statutory Declaration:</strong> Track is clear of all men, tools, welding rigs and cylinders. Repaired rail section inspected and certified safe for 130 km/h regular passenger &amp; freight traffic.
                      </div>
                    </label>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWorkDoneModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                    >
                      Back to Work
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkDoneModalOpen(false);
                        handleSurrender();
                      }}
                      disabled={isSurrendering}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>{isSurrendering ? 'Transmitting Handover...' : 'Submit & Surrender Track'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: FINISHED & CERTIFIED SAFE                                        */}
        {/* ========================================================================= */}
        {workflowStep === 5 && (
          <div className="bg-white rounded-xl border border-emerald-300 p-6 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">
                Track Handed Over & Possession Finished!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Full line speed (130 km/h) certified. Both Before & After photo evidence transmitted to Section Controller Cockpit and Station Master Diary.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-w-md mx-auto flex justify-between">
              <span>Permit Closed: {currentRequest?.id}</span>
              <span className="text-emerald-600 font-bold">130 km/h Certified Safe</span>
            </div>

            {/* Side-by-side Before & After Evidence Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2 text-left">
              {/* Photo 1: Defect / Work Photo */}
              <div className="rounded-xl border border-blue-300 bg-white p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span>1. On-Track Defect Photo</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">BEFORE</span>
                </div>
                {currentRequest?.before_photo_url || workPhotoUrl ? (
                  <div className="h-44 w-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                    <img
                      src={currentRequest?.before_photo_url || workPhotoUrl}
                      alt="Work Evidence"
                      className="h-full w-auto max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-44 w-full bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    No photo attached
                  </div>
                )}
                <p className="text-[11px] text-slate-600 truncate font-mono">
                  {currentRequest?.before_photo_desc || workPhotoDesc || 'Defect Evidence'}
                </p>
              </div>

              {/* Photo 2: Restored Track Proof */}
              <div className="rounded-xl border border-emerald-300 bg-white p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>2. Restored Track Photo</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">AFTER</span>
                </div>
                {currentRequest?.after_photo_url || completionPhotoUrl ? (
                  <div className="h-44 w-full bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 border border-slate-800">
                    <img
                      src={currentRequest?.after_photo_url || completionPhotoUrl}
                      alt="Completion Proof"
                      className="h-full w-auto max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-44 w-full bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    No photo attached
                  </div>
                )}
                <p className="text-[11px] text-slate-600 truncate font-mono">
                  {currentRequest?.after_photo_desc || completionPhotoDesc || 'Restored Track Proof'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => {
                  setActiveRequestId(null);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('railblock_field_active_req_id');
                    if (currentUserId) {
                      localStorage.removeItem(`railblock_field_active_req_id_${currentUserId}`);
                    }
                  }
                  setWorkPhotoUrl('');
                  setWorkPhotoDesc('');
                  setCompletionPhotoUrl('');
                  setCompletionPhotoDesc('');
                  setRequisitionPhotoUrl('');
                  setRequisitionPhotoDesc('');
                }}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                + File New Form T/351 Requisition
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
