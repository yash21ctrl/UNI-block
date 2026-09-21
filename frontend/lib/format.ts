import { format, parseISO } from 'date-fns';

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '--';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    return format(date, 'dd MMM yyyy HH:mm');
  } catch {
    return String(isoString);
  }
}

export function formatTimeOnly(isoString: string | null | undefined): string {
  if (!isoString) return '--';
  if (typeof isoString === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(isoString.trim())) {
    return isoString.trim().slice(0, 5);
  }
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    return format(date, 'HH:mm');
  } catch {
    return String(isoString);
  }
}

export function formatDateOnly(isoString: string | null | undefined): string {
  if (!isoString) return '--';
  try {
    const date = typeof isoString === 'string' ? parseISO(isoString) : new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    return format(date, 'dd MMM (EEE)');
  } catch {
    return String(isoString);
  }
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function isBlockFused(block: {
  department?: string;
  downtime_saved_minutes?: number;
  is_fused?: boolean;
}): boolean {
  if (!block) return false;
  if (block.is_fused) return true;
  if ((block.downtime_saved_minutes ?? 0) > 0) return true;
  const dept = (block.department || '').toLowerCase();
  return dept.includes('+') || dept.includes('fusion') || dept.includes('joint') || dept.includes('integrated');
}

export function getFusionDepartmentPill(dept: string): string {
  const lower = (dept || '').toLowerCase();
  const parts: string[] = [];
  if (lower.includes('eng') || lower.includes('civil') || lower.includes('track') || lower.includes('p-way')) {
    parts.push('P-WAY');
  }
  if (lower.includes('signal') || lower.includes('telecom') || lower.includes('s&t')) {
    parts.push('S&T');
  }
  if (lower.includes('traction') || lower.includes('trd') || lower.includes('ohe') || lower.includes('electrical')) {
    parts.push('TRD');
  }
  if (lower.includes('operating') || lower.includes('mech') || lower.includes('c&w')) {
    parts.push('C&W');
  }
  if (parts.length > 1) {
    return parts.join(' + ');
  }
  return dept || 'JOINT FUSION';
}

export function getDepartmentBadgeColor(
  dept: string,
  isFused?: boolean
): { bg: string; text: string; border: string; accent: string } {
  const lower = (dept || '').toLowerCase();
  if (isFused || lower.includes('+') || lower.includes('fusion') || lower.includes('joint') || lower.includes('integrated')) {
    return {
      bg: 'bg-gradient-to-r from-emerald-50 via-blue-50 to-amber-50',
      text: 'text-slate-950 font-bold',
      border: 'border-amber-400',
      accent: 'bg-amber-400',
    };
  }
  // 🟩 Engineering (P-Way): Emerald (#10b981)
  if (lower.includes('eng') || lower.includes('civil') || lower.includes('track') || lower.includes('p-way')) {
    return { bg: 'bg-emerald-50', text: 'text-emerald-800 font-bold', border: 'border-emerald-400', accent: 'bg-[#10b981]' };
  }
  // 🟦 Signal & Telecom (S&T): Royal Blue (#3b82f6)
  if (lower.includes('signal') || lower.includes('telecom') || lower.includes('s&t')) {
    return { bg: 'bg-blue-50', text: 'text-blue-800 font-bold', border: 'border-blue-400', accent: 'bg-[#3b82f6]' };
  }
  // 🟧 Traction / OHE (TRD): Amber (#f59e0b)
  if (lower.includes('traction') || lower.includes('trd') || lower.includes('ohe') || lower.includes('electrical')) {
    return { bg: 'bg-amber-50', text: 'text-amber-800 font-bold', border: 'border-amber-400', accent: 'bg-[#f59e0b]' };
  }
  // 🟪 Mechanical / C&W: Purple (#a855f7)
  if (lower.includes('operating') || lower.includes('mechanical') || lower.includes('mech') || lower.includes('c&w')) {
    return { bg: 'bg-purple-50', text: 'text-purple-800 font-bold', border: 'border-purple-400', accent: 'bg-[#a855f7]' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-800 font-bold', border: 'border-slate-300', accent: 'bg-slate-600' };
}

export function getDepartmentGanttColor(block: {
  department?: string;
  is_emergency?: boolean;
  block_id?: string;
  downtime_saved_minutes?: number;
  is_fused?: boolean;
}): string {
  if (block.is_emergency || (block.block_id && block.block_id.startsWith('EMG-'))) {
    return 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 border-rose-300 text-white animate-pulse shadow-lg ring-2 ring-rose-500';
  }
  // ⚡ Joint Block Fusion: Radiant gradient border, animated pulse
  if (isBlockFused(block)) {
    return 'bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 border-2 border-amber-300 text-white shadow-lg animate-pulse ring-2 ring-amber-400/80';
  }
  const dept = (block.department || '').toLowerCase();
  // 🟩 Engineering (P-Way): Emerald (#10b981)
  if (dept.includes('eng') || dept.includes('civil') || dept.includes('track') || dept.includes('p-way')) {
    return 'bg-[#10b981] hover:bg-emerald-600 border-emerald-400 text-white shadow-xs';
  }
  // 🟦 Signal & Telecom (S&T): Royal Blue (#3b82f6)
  if (dept.includes('signal') || dept.includes('telecom') || dept.includes('s&t')) {
    return 'bg-[#3b82f6] hover:bg-blue-600 border-blue-400 text-white shadow-xs';
  }
  // 🟧 Traction / OHE (TRD): Amber (#f59e0b)
  if (dept.includes('traction') || dept.includes('trd') || dept.includes('ohe') || dept.includes('electrical')) {
    return 'bg-[#f59e0b] hover:bg-amber-600 border-amber-400 text-white shadow-xs';
  }
  // 🟪 Mechanical / C&W: Purple (#a855f7)
  if (dept.includes('operating') || dept.includes('mechanical') || dept.includes('mech') || dept.includes('c&w')) {
    return 'bg-[#a855f7] hover:bg-purple-600 border-purple-400 text-white shadow-xs';
  }
  return 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-white shadow-xs';
}
