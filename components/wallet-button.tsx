'use client';

import { useState } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';

export function WalletButton() {
  const { isAuthenticated, userProfile, requestUserAuth } = usePiAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await requestUserAuth();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <button 
        disabled 
        className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg opacity-50 cursor-not-allowed"
      >
        Initializing...
      </button>
    );
  }

  const displayName = userProfile?.username || 'Connect Wallet';
  const isConnected = !!userProfile?.username;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleConnectWallet}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer ${
          isConnected
            ? 'text-green-600 bg-green-50 border border-green-200'
            : 'text-primary-foreground bg-primary'
        }`}
      >
        {isLoading ? 'Requesting Permission...' : displayName}
      </button>
      
      {error && (
        <p className="text-xs text-red-500 max-w-xs text-right">{error}</p>
      )}
    </div>
  );
}
