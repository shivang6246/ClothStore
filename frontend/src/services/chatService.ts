import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const fallbackWsUrl = isLocalhost
  ? 'http://localhost:8080/ws'
  : 'https://clothstore-7jwr.onrender.com/ws';

const WS_BASE = configuredApiUrl 
  ? `${configuredApiUrl.replace(/\/$/, '')}/ws`
  : fallbackWsUrl;

class ChatService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected = false;
  private onConnectCallbacks: (() => void)[] = [];

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.client?.active) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_BASE),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        onConnect: () => {
          this.connected = true;
          this.onConnectCallbacks.forEach((cb) => cb());
          this.onConnectCallbacks = [];
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          this.connected = false;
          reject(new Error(frame.headers['message'] || 'STOMP connection error'));
        },

        onDisconnect: () => {
          this.connected = false;
        },

        onWebSocketClose: () => {
          this.connected = false;
        },
      });

      this.client.activate();
    });
  }

  subscribe(destination: string, callback: (msg: any) => void): string {
    if (!this.client || !this.connected) {
      console.warn('ChatService: not connected, queuing subscription for', destination);
      const subId = `pending-${Date.now()}`;
      this.onConnectCallbacks.push(() => {
        this._doSubscribe(destination, callback, subId);
      });
      return subId;
    }
    const subId = `sub-${Date.now()}`;
    this._doSubscribe(destination, callback, subId);
    return subId;
  }

  private _doSubscribe(destination: string, callback: (msg: any) => void, subId: string) {
    if (!this.client) return;
    const sub = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        callback(body);
      } catch {
        callback(message.body);
      }
    });
    this.subscriptions.set(subId, sub);
  }

  unsubscribe(subId: string) {
    const sub = this.subscriptions.get(subId);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(subId);
    }
  }

  sendMessage(destination: string, body: any) {
    if (!this.client || !this.connected) {
      console.error('ChatService: cannot send, not connected');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance
const chatService = new ChatService();
export default chatService;
