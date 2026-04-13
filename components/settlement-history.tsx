'use client';

import { useState } from 'react';
import { useSettlements } from '@/hooks/use-settlements';
import { StatusBadge } from './status-badge';

export function SettlementHistory() {
  const { settlements, updateStatus, deleteSettlement } = useSettlements();
  const [feedback, setFeedback] = useState<{ id: string; message: string } | null>(null);

  const handleMarkAsPaid = (id: string) => {
    updateStatus(id, 'paid');
    setFeedback({ id, message: 'Marked as Paid' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: string) => {
    deleteSettlement(id);
    setFeedback({ id, message: 'Settlement Deleted' });
    setTimeout(() => setFeedback(null), 3000);
  };

  if (settlements.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-center text-muted-foreground">No settlements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {settlements.map((settlement) => (
        <div
          key={settlement.id}
          className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <p className="font-semibold text-card-foreground">{settlement.reference}</p>
              <p className="text-xs text-muted-foreground mt-1">{settlement.purpose}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-bold text-primary">{settlement.amount.toFixed(2)} π</p>
                <StatusBadge status={settlement.status || 'pending'} size="sm" />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground">
              ID: <span className="font-mono text-primary">{settlement.id}</span>
            </p>
            {settlement.transactionId && (
              <p className="text-xs text-muted-foreground mt-1">
                Txn: <span className="font-mono text-primary">{settlement.transactionId}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {settlement.updatedAt ? new Date(settlement.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            {settlement.status === 'pending' && (
              <button
                onClick={() => handleMarkAsPaid(settlement.id)}
                className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
              >
                Mark as Paid
              </button>
            )}
            <button
              onClick={() => handleDelete(settlement.id)}
              className="flex-1 text-xs bg-destructive/20 hover:bg-destructive/30 text-destructive px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>

          {feedback?.id === settlement.id && (
            <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium mt-2">
              {feedback.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
