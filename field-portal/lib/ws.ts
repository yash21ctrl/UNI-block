// WebSocket Client for Field Portal (Port 3001)

export type WebSocketCallback = (event: any) => void;

function getFieldWsUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.hostname}:8000/api/v1/ws/updates`;
  }
  return 'ws://localhost:8000/api/v1/ws/updates';
}

export class FieldWebSocketManager {
  private socket: WebSocket | null = null;
  private listeners: Set<WebSocketCallback> = new Set();
  private reconnectTimeout: any = null;
  private url?: string;

  constructor(url?: string) {
    this.url = url;
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    try {
      const targetUrl = this.url || getFieldWsUrl();
      this.socket = new WebSocket(targetUrl);

      this.socket.onopen = () => {
        console.log('[Field-WS] Connected to RailBlock Central Event Bus');
      };

      this.socket.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          this.listeners.forEach((callback) => callback(parsed));
        } catch (e) {
          console.warn('[Field-WS] Received unparseable message:', msg.data);
        }
      };

      this.socket.onclose = () => {
        console.log('[Field-WS] Connection closed, retrying in 3s...');
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[Field-WS] Socket error:', err);
        if (this.socket) this.socket.close();
      };
    } catch (err) {
      console.warn('[Field-WS] Initialization failed:', err);
      this.scheduleReconnect();
    }
  }

  public subscribe(callback: WebSocketCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
  }
}

export const fieldWsManager = new FieldWebSocketManager();
