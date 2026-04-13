'use client';

/**
 * Global Pi SDK initialization state
 * Tracks whether Pi SDK is fully loaded and initialized
 */

let piInitialized = false;
let piInitializing = false;
let initializationPromise: Promise<void> | null = null;
let initializationResolve: (() => void) | null = null;

/**
 * Check if Pi.pay() is available and ready
 */
export function isPiPayReady(): boolean {
  const piPayReady = piInitialized && typeof window?.Pi?.pay === 'function';
  console.log('[v0] isPiPayReady check:', {
    piInitialized,
    windowPiExists: typeof window?.Pi !== 'undefined',
    piPayExists: typeof window?.Pi?.pay === 'function',
    result: piPayReady,
  });
  return piPayReady;
}

/**
 * Wait for Pi SDK to be fully initialized
 * Returns a promise that resolves when Pi.pay() is ready
 */
export async function waitForPiInitialization(timeoutMs = 30000): Promise<void> {
  const startTime = Date.now();

  // If already initialized, resolve immediately
  if (piInitialized && typeof window?.Pi?.pay === 'function') {
    console.log('[v0] Pi SDK already initialized, returning immediately');
    return Promise.resolve();
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    console.log('[v0] Initialization already in progress, joining existing promise');
    try {
      await initializationPromise;
      return;
    } catch (e) {
      console.log('[v0] Previous initialization attempt failed, will retry');
    }
  }

  console.log(`[v0] Starting waitForPiInitialization (timeout: ${timeoutMs}ms)`);

  // Create a new promise for this initialization attempt
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      // Check if Pi.pay is now available
      if (typeof window?.Pi?.pay === 'function') {
        console.log(`[v0] Pi.pay() became available after ${elapsed}ms`);
        piInitialized = true;
        clearInterval(checkInterval);
        if (initializationResolve) {
          initializationResolve();
        }
        resolve();
        return;
      }

      // Check for timeout
      if (elapsed > timeoutMs) {
        clearInterval(checkInterval);
        console.error(`[v0] Pi SDK initialization timeout after ${elapsed}ms`);
        console.error('[v0] Pi state at timeout:', {
          windowPiExists: typeof window?.Pi !== 'undefined',
          piPayExists: typeof window?.Pi?.pay === 'function',
          piInitialized,
          piInitializing,
          windowPiMethods: typeof window?.Pi !== 'undefined' ? Object.keys(window.Pi || {}) : 'N/A',
        });
        reject(
          new Error(
            `Pi SDK initialization timeout. Pi.pay() was not available within ${timeoutMs}ms. ` +
            'Please ensure the app is running in Pi Browser or Developer Portal.',
          ),
        );
      }
    }, 100); // Check every 100ms
  });
}

/**
 * Mark Pi SDK as initialized
 * Called by PiAuthProvider after Pi.init() completes successfully
 */
export function markPiAsInitialized(): void {
  console.log('[v0] markPiAsInitialized called - Pi SDK is now ready');
  piInitialized = true;
  piInitializing = false;
  if (initializationResolve) {
    initializationResolve();
  }
}

/**
 * Mark Pi SDK as initializing
 * Called by PiAuthProvider when starting Pi.init()
 */
export function markPiAsInitializing(): void {
  console.log('[v0] markPiAsInitializing called - starting Pi SDK initialization');
  piInitializing = true;
  
  // Create initialization promise if not already created
  if (!initializationPromise) {
    initializationPromise = new Promise((resolve) => {
      initializationResolve = resolve;
    });
  }
}

/**
 * Reset Pi SDK state (for testing/debugging)
 */
export function resetPiState(): void {
  console.log('[v0] Resetting Pi SDK state');
  piInitialized = false;
  piInitializing = false;
  initializationPromise = null;
  initializationResolve = null;
}
