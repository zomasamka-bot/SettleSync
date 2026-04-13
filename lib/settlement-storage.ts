import type { SettlementData } from './settlement-types';

export interface StoredSettlement extends SettlementData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'settlesync_settlements';
const BROADCAST_CHANNEL_NAME = 'settlesync_channel';

class SettlementStorage {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Array<(settlements: StoredSettlement[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'settlement_updated') {
            this.notifyListeners();
          }
        };
      } catch (e) {
        console.log('[v0] BroadcastChannel not supported, using localStorage fallback');
      }
    }
  }

  subscribe(listener: (settlements: StoredSettlement[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const settlements = this.getAll();
    this.listeners.forEach(listener => listener(settlements));
  }

  private broadcast(type: string) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type });
    }
  }

  saveSettlement(settlement: StoredSettlement): void {
    const settlements = this.getAll();
    const index = settlements.findIndex(s => s.id === settlement.id);
    
    if (index >= 0) {
      settlements[index] = { ...settlement, updatedAt: new Date().toISOString() };
    } else {
      settlements.push({
        ...settlement,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
    this.broadcast('settlement_updated');
    this.notifyListeners();
  }

  getAll(): StoredSettlement[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[v0] Failed to parse settlements from localStorage', e);
      return [];
    }
  }

  getById(id: string): StoredSettlement | undefined {
    return this.getAll().find(s => s.id === id);
  }

  updateStatus(id: string, status: string): void {
    const settlement = this.getById(id);
    if (settlement) {
      this.saveSettlement({ ...settlement, status } as StoredSettlement);
    }
  }

  deleteSettlement(id: string): void {
    const settlements = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settlements));
    this.broadcast('settlement_updated');
    this.notifyListeners();
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.broadcast('settlement_updated');
    this.notifyListeners();
  }
}

export const settlementStorage = new SettlementStorage();
