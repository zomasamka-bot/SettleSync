'use client';

/**
 * Pi SDK Diagnostics
 * Comprehensive checking of Pi SDK availability and status
 */

export interface PiDiagnostics {
  piExists: boolean;
  piPayExists: boolean;
  piInitExists: boolean;
  piAuthenticateExists: boolean;
  piMethods: string[];
  windowType: string;
  isInBrowser: boolean;
  piPayType: string;
  timestamp: number;
}

/**
 * Run comprehensive diagnostics on Pi SDK
 */
export function runPiDiagnostics(): PiDiagnostics {
  const diagnostics: PiDiagnostics = {
    piExists: typeof window?.Pi !== 'undefined',
    piPayExists: typeof window?.Pi?.pay === 'function',
    piInitExists: typeof window?.Pi?.init === 'function',
    piAuthenticateExists: typeof window?.Pi?.authenticate === 'function',
    piMethods: typeof window?.Pi !== 'undefined' ? Object.keys(window.Pi || {}) : [],
    windowType: typeof window,
    isInBrowser: typeof window !== 'undefined',
    piPayType: typeof window?.Pi?.pay,
    timestamp: Date.now(),
  };

  return diagnostics;
}

/**
 * Log comprehensive diagnostics to console
 */
export function logPiDiagnostics(): PiDiagnostics {
  const diags = runPiDiagnostics();
  
  console.group('[v0] Pi SDK Diagnostics');
  console.log('Pi Object Exists:', diags.piExists);
  console.log('Pi.pay() Exists:', diags.piPayExists);
  console.log('Pi.init() Exists:', diags.piInitExists);
  console.log('Pi.authenticate() Exists:', diags.piAuthenticateExists);
  console.log('Available Pi Methods:', diags.piMethods);
  console.log('Window Type:', diags.windowType);
  console.log('Is in Browser:', diags.isInBrowser);
  console.log('Pi.pay Type:', diags.piPayType);
  console.log('Full Diagnostics:', diags);
  console.groupEnd();
  
  return diags;
}

/**
 * Check if we're in a Pi environment
 */
export function isPiEnvironment(): boolean {
  const diags = runPiDiagnostics();
  return diags.isInBrowser && diags.piExists && diags.piPayExists;
}

/**
 * Get human-readable status message
 */
export function getPiStatusMessage(): string {
  const diags = runPiDiagnostics();

  if (!diags.isInBrowser) {
    return 'Not running in a browser environment';
  }

  if (!diags.piExists) {
    return 'Pi SDK not loaded. Try refreshing the page.';
  }

  if (diags.piMethods.length === 0) {
    return 'Pi object is empty. SDK may not be properly initialized.';
  }

  if (!diags.piPayExists) {
    const methods = diags.piMethods.join(', ');
    return `Pi.pay() not available. Available methods: ${methods}`;
  }

  return 'Pi SDK is ready for payments';
}
