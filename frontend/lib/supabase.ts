import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aufnxqyaqmsmsziptbcc.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_v09zkikHTjc97wZyyn0okQ_p4lTiMDA';

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http'));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return client;
}

// Global broadcast channel for RailBlock 3-Device Cloud Sync
const CHANNEL_NAME = 'railblock-telemetry-cloud';

export async function publishCloudEvent(event: string, data: any): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const channel = sb.channel(CHANNEL_NAME);
    await channel.send({
      type: 'broadcast',
      event,
      payload: {
        ...data,
        cloud_timestamp: new Date().toISOString(),
      },
    });
    return true;
  } catch (err) {
    console.warn('[Supabase Cloud] Broadcast error:', err);
    return false;
  }
}

export function subscribeCloudEvents(
  onEvent: (event: string, data: any) => void,
  onStatus?: (status: string) => void
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  const channel = sb.channel(CHANNEL_NAME);
  channel
    .on('broadcast', { event: '*' }, (payload: any) => {
      if (payload && payload.event) {
        onEvent(payload.event, payload.payload || {});
      }
    })
    .subscribe((status: string) => {
      console.log('[Supabase Cloud Realtime] Status:', status);
      if (onStatus) onStatus(status);
    });


  return () => {
    try {
      channel.unsubscribe();
    } catch {}
  };
}
