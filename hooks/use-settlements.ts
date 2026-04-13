import { useEffect, useState, useCallback } from 'react';
import { settlementStorage, type StoredSettlement } from '@/lib/settlement-storage';

export function useSettlements() {
  const [settlements, setSettlements] = useState<StoredSettlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSettlements(settlementStorage.getAll());
    setLoading(false);

    const unsubscribe = settlementStorage.subscribe((updated) => {
      setSettlements(updated);
    });

    return unsubscribe;
  }, []);

  const saveSettlement = useCallback((settlement: StoredSettlement) => {
    settlementStorage.saveSettlement(settlement);
  }, []);

  const updateStatus = useCallback((id: string, status: string) => {
    settlementStorage.updateStatus(id, status);
  }, []);

  const deleteSettlement = useCallback((id: string) => {
    settlementStorage.deleteSettlement(id);
  }, []);

  const clearAll = useCallback(() => {
    settlementStorage.clearAll();
  }, []);

  return {
    settlements,
    loading,
    saveSettlement,
    updateStatus,
    deleteSettlement,
    clearAll,
  };
}
