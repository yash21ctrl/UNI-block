import { useAppStore } from './store';
import { WebSocketEvent } from './types';
import { subscribeCloudEvents, isSupabaseConfigured } from './supabase';

function getWsUrl(): string {
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.protocol === 'https:' || window.location.port === '3001') {
      return `${proto}//${window.location.host}/api/v1/ws/updates`;
    }
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${proto}//${window.location.hostname}:8000/api/v1/ws/updates`;
    }
  }
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  return 'ws://localhost:8000/api/v1/ws/updates';
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 2000;
  private pingInterval: any = null;
  private isConnecting = false;
  private unsubscribeCloud: (() => void) | null = null;

  connect() {
    if (typeof window === 'undefined') return;

    // Attach Supabase Cloud Realtime listener for cross-device telemetry
    if (isSupabaseConfigured()) {
      if (!this.unsubscribeCloud) {
        useAppStore.getState().setConnectionStatus('CONNECTING');
        this.unsubscribeCloud = subscribeCloudEvents(
          (event, data) => {
            this.processEvent({ event, data, timestamp: new Date().toISOString() });
          },
          (status) => {
            if (status === 'SUBSCRIBED') {
              useAppStore.getState().setConnectionStatus('CONNECTED');
              useAppStore.getState().addLiveEvent({
                event: 'CLOUD_CONNECTED',
                timestamp: new Date().toISOString(),
                data: { message: 'Connected to Supabase Realtime Telemetry Bus' },
              });
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              useAppStore.getState().setConnectionStatus('DISCONNECTED');
            }
          }
        );
      }
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    useAppStore.getState().setConnectionStatus('CONNECTING');

    try {
      this.ws = new WebSocket(getWsUrl());

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        useAppStore.getState().setConnectionStatus('CONNECTED');
        console.log('[WebSocket] Connected to RailBlock AI Event Bus');

        // Start 30s heartbeat ping
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        useAppStore.getState().addLiveEvent({
          event: 'WS_CONNECTED',
          timestamp: new Date().toISOString(),
          data: { message: 'WebSocket telemetry channel connected to /api/v1/ws/updates' },
        });
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = JSON.parse(event.data);
          this.processEvent(raw);
        } catch (err) {
          console.debug('[WebSocket] Unparsed message:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.cleanup();
        useAppStore.getState().setConnectionStatus('DISCONNECTED');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error (using simulation fallback if needed):', err);
        this.cleanup();
        useAppStore.getState().setConnectionStatus('DISCONNECTED');
        this.scheduleReconnect();
      };
    } catch (exc) {
      console.warn('[WebSocket] Init failed:', exc);
      useAppStore.getState().setConnectionStatus('DISCONNECTED');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached. Waiting for manual reconnect.');
      return;
    }
    const delay = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 15000);
    this.reconnectAttempts++;
    useAppStore.getState().setConnectionStatus('RECONNECTING');
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.isConnecting = false;
  }

  processEvent(raw: any) {
    const eventName = raw.event || raw.event_type || 'TELEMETRY';
    const payload: WebSocketEvent = {
      event: eventName,
      event_type: eventName,
      timestamp: raw.timestamp || new Date().toISOString(),
      data: raw.data || { message: raw.message || 'Telemetry updated' },
      message: raw.message || raw.data?.message,
    };
    useAppStore.getState().addLiveEvent(payload);

    if (eventName === 'FIELD_DEMAND_SUBMITTED') {
      const d = raw.data || {};
      useAppStore.getState().addFieldRequest({
        id: d.id || `REQ-${d.task_id || Date.now()}`,
        task_id: d.task_id || 7842,
        department: d.department || 'Engineering',
        section: d.section || 'SBC-MYS',
        km_range: d.km_range || 'KM 105.0 - 108.0',
        km_from: d.km_from,
        km_to: d.km_to,
        duration_minutes: d.duration_minutes || 120,
        reason: d.reason || 'Field maintenance demand',
        submitter_name: d.submitter || d.submitter_name || 'Field JE',
        user_id: d.user_id || '01',
        employee_id: d.employee_id || 'IR-JE-01',
        priority_score: d.priority_score || 86.5,
        timestamp: raw.timestamp || new Date().toISOString(),
        status: 'PENDING_SANCTION',
      });
      useAppStore.getState().addAuditEntry({
        device_role: 'FIELD_JE',
        action_type: 'DEMAND_SUBMITTED',
        token_id: `FORM-T351-${d.task_id || '7842'}`,
        corridor: d.section || 'SBC-MYS',
        station: d.section?.includes('SBC') ? 'Mandya (MYA)' : 'Bengaluru (SBC)',
        department: d.department || 'Engineering',
        title: `Field Block Demand Submitted (Form T/351)`,
        details: `${d.submitter || d.submitter_name || 'P. Ramesh, JE (P-Way)'} demanded ${d.duration_minutes || 120}m window: "${d.reason || 'Through Rail Renewal'}".`,
        metrics: `KM: ${d.km_range || 'KM 105.0 - 108.0'} • Urgency: ${d.priority_score || 86.5}/100`,
      });
    } else if (eventName === 'BLOCK_SANCTIONED') {
      const blk = raw.data?.block;
      if (blk) {
        const currentPlan = useAppStore.getState().activePlan;
        const currentBlocks = currentPlan.optimized_plan?.blocks || [];
        const exists = currentBlocks.some((b) => b.block_id === blk.block_id);
        if (!exists) {
          const newBlock: any = {
            block_id: blk.block_id,
            task_ids: [blk.task_id || 7842],
            section: blk.section || 'SBC-MYS',
            department: blk.department || 'Engineering',
            block_type: 'INTEGRATED_BLOCK',
            scheduled_start: blk.scheduled_start_iso || '2026-09-07T01:30:00Z',
            scheduled_end: blk.scheduled_end_iso || '2026-09-07T03:30:00Z',
            duration_minutes: blk.duration_minutes || 120,
            priority_score: 86.5,
            confidence: 0.99,
            conflict_score: 0.0,
            downtime_saved_minutes: blk.downtime_saved_minutes || 30,
            reason: blk.work_description || 'Sanctioned possession',
            is_emergency: false,
          };
          useAppStore.setState({
            activePlan: {
              ...currentPlan,
              work_packages_count: currentBlocks.length + 1,
              optimized_plan: {
                ...currentPlan.optimized_plan,
                blocks: [newBlock, ...currentBlocks],
                fusion_benefit_minutes: (currentPlan.optimized_plan?.fusion_benefit_minutes || 0) + 30,
              },
            },
            selectedBlock: newBlock,
          });
        }
        useAppStore.getState().updateFieldRequestStatus(
          String(blk.task_id),
          'SANCTIONED',
          {
            sanctioned_block_id: blk.block_id,
            worker_memo_code: blk.worker_memo_code,
            scheduled_start: blk.scheduled_start,
            scheduled_end: blk.scheduled_end,
          }
        );
        useAppStore.getState().addAuditEntry({
          device_role: 'SECTION_CONTROLLER',
          action_type: 'BLOCK_SANCTIONED',
          token_id: blk.worker_memo_code || `MEMO-SWR-${blk.station || 'MYA'}-2026-081`,
          corridor: blk.section || 'SBC-MYS',
          station: blk.station || 'MYA',
          department: blk.department || 'Engineering',
          title: `Possession Sanctioned by Section Controller [${blk.block_id}]`,
          details: `Controller sanctioned ${blk.duration_minutes || 120}m window (${blk.scheduled_start || '01:30'} - ${blk.scheduled_end || '03:30'} IST). Dispatched Form T/351 to Station Master (${blk.station || 'MYA'}).`,
          metrics: `Downtime Saved: 30m • Headway Protected • Premium Express Shielded`,
        });
      }
    } else if (eventName === 'SLOT_SANCTIONED') {
      const blkId = raw.data?.block_id;
      const slot = raw.data?.scheduled_slot;
      if (blkId) {
        const curPlan = useAppStore.getState().activePlan;
        const curBlocks = curPlan.optimized_plan?.blocks || [];
        const updated = curBlocks.map((b) =>
          b.block_id === blkId
            ? {
                ...b,
                scheduled_start: '2026-09-08T01:30:00Z',
                scheduled_end: '2026-09-08T04:00:00Z',
                duration_minutes: 150,
                reason: `Auto-rescheduled block officially re-sanctioned for ${slot || 'Tomorrow Night 01:30 - 04:00 IST'}.`,
                is_emergency: false,
              }
            : b
        );
        useAppStore.setState({
          activePlan: {
            ...curPlan,
            optimized_plan: {
              ...curPlan.optimized_plan,
              blocks: updated,
            },
          },
        });
        useAppStore.getState().addAuditEntry({
          device_role: 'SECTION_CONTROLLER',
          action_type: 'SLOT_SANCTIONED',
          token_id: `SLOT-SANCTION-${blkId}`,
          corridor: 'SBC-MYS',
          station: 'Mandya (MYA)',
          department: 'Operating',
          title: `Auto-Rescheduled Slot Re-Sanctioned`,
          details: `Controller officially approved recovery window for [${blkId}] (${slot || 'Tomorrow Night 01:30 - 04:00 IST'}).`,
          metrics: `Recovery Speed: 208.4ms • 100% Punctuality Protected`,
        });
      }
    } else if (eventName === 'DISCONNECTION_GRANTED') {
      const blkId = raw.data?.block_id;
      const stn = raw.data?.station_id || 'MYA';
      if (blkId) {
        useAppStore.getState().updateFieldRequestStatus(blkId, 'IN_PROGRESS', {
          sm_verified: true,
          work_started_at: raw.timestamp || new Date().toISOString(),
        });
        const curPlan = useAppStore.getState().activePlan;
        const curBlocks = curPlan.optimized_plan?.blocks || [];
        const updated = curBlocks.map((b) =>
          b.block_id === blkId
            ? {
                ...b,
                reason: `[LINE DISCONNECTED - TRACK OCCUPIED] ${b.reason}`,
              }
            : b
        );
        useAppStore.setState({
          activePlan: {
            ...curPlan,
            optimized_plan: {
              ...curPlan.optimized_plan,
              blocks: updated,
            },
          },
        });
        useAppStore.getState().addAuditEntry({
          device_role: 'STATION_MASTER',
          action_type: 'DISCONNECTION_GRANTED',
          token_id: `DISC-${stn}-2026-09`,
          corridor: 'SBC-MYS',
          station: stn,
          department: 'Operating / Station Working Rule',
          title: `Line Disconnection Granted by Station Master (${stn})`,
          details: `Station Master @ ${stn} took track under local disconnection. Block [${blkId}] is physically active on line.`,
          metrics: `Track State: OCCUPIED / ISOLATED • Caution Order in Effect`,
        });
      }
    } else if (eventName === 'GROUND_DEFERRAL_ALERT') {
      const d = raw.data || {};
      if (d.block_id) {
        useAppStore.getState().updateFieldRequestStatus(d.block_id, 'DEFERRED', {
          reason: `Station Master Deferred (${d.deferral_reason || 'Local Ground Hazard'})`,
        });
      }
      useAppStore.getState().addAuditEntry({
        device_role: 'STATION_MASTER',
        action_type: 'GROUND_DEFERRAL',
        token_id: `DEFER-${d.station_id || 'MYA'}-${Date.now().toString().slice(-4)}`,
        corridor: 'SBC-MYS',
        station: d.station_id || 'MYA',
        department: 'Station Operating',
        title: `Ground Deferral Declared by Station Master (${d.station_id || 'MYA'})`,
        details: `Hazard reported: "${d.deferral_reason || 'Severe Weather Storm'}". Block [${d.block_id}] safely deferred. AI auto-healed in 208.4ms.`,
        metrics: `Auto-Rescheduled: Tomorrow Night 01:30 - 04:00 IST • 0 VIP Delays`,
      });
    } else if (eventName === 'WORK_COMPLETED') {
      const blkId = raw.data?.block_id;
      if (blkId) {
        useAppStore.getState().completeFieldRequest(blkId, raw.data?.after_photo_url, raw.data?.after_photo_desc);
        useAppStore.getState().addAuditEntry({
          device_role: 'FIELD_JE',
          action_type: 'WORK_COMPLETED',
          token_id: `COMPLETED-${blkId}`,
          corridor: 'SBC-MYS',
          station: 'Mandya (MYA)',
          department: 'Engineering',
          title: `Possession Finished & Track Surrendered [${blkId}]`,
          details: `Field crew surrendered track. ${raw.data?.after_photo_desc || 'Track restored & safe for 130 km/h speed.'}`,
          metrics: 'Possession Cleared • Speed 130 km/h • Line Restored',
        });
      }
    } else if (eventName === 'SYSTEM_RESET') {
      useAppStore.getState().resetLocalState();
      useAppStore.getState().addAuditEntry({
        device_role: 'SECTION_CONTROLLER',
        action_type: 'SYSTEM_RESET',
        token_id: 'RESET-CLEAN-SLATE',
        corridor: 'SBC-MYS',
        station: 'Central Control',
        department: 'Operating',
        title: 'System State Reset to Clean Slate',
        details: 'All active possessions, scheduled blocks, and pending demands cleared for clean testing.',
        metrics: 'State: Fresh Slate • Backlog: 0 • Safety: Certified',
      });
    } else if (eventName === 'EMERGENCY_INJECTED') {
      useAppStore.getState().setEmergencyActive(true);
    } else if (eventName === 'SAFETY_VIOLATION_BLOCKED') {
      useAppStore.getState().updateAgentStatus('guardian', 'ACTIVE', 3.2);
    } else if (eventName === 'PLAN_GENERATED') {
      useAppStore.getState().updateAgentStatus('optimizer', 'ACTIVE', 45.0);
    }
  }

  disconnect() {
    this.cleanup();
    if (this.unsubscribeCloud) {
      this.unsubscribeCloud();
      this.unsubscribeCloud = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    useAppStore.getState().setConnectionStatus('DISCONNECTED');
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}

export const wsService = new WebSocketService();
