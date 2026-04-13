"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { markPiAsInitializing, markPiAsInitialized } from "@/lib/pi-sdk-ready";
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types";

interface UserProfile {
  username?: string;
  walletAddress?: string;
  piUid?: string;
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  userProfile: UserProfile | null;
  reinitialize: () => Promise<void>;
  requestUserAuth: () => Promise<UserProfile | null>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.Pi !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

const loadSDKLite = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.SDKLite !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_LITE_URL) {
      reject(new Error("SDKLite URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_LITE_URL;
    script.async = true;

    script.onload = () => {
      console.log("SDKLite script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load SDKLite script");
      reject(new Error("Failed to load SDKLite script"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      console.log('[v0] Fetching user profile from SDK...');
      
      // Try to get user profile from SDK state - this might be set during login
      try {
        const stateData = await sdkInstance.state.get("user_profile");
        console.log('[v0] State data retrieved:', stateData);
        
        if (stateData?.blob?.username) {
          const profile: UserProfile = {
            username: stateData.blob.username as string,
            piUid: (stateData.blob.piUid as string) || undefined,
            walletAddress: (stateData.blob.walletAddress as string) || undefined,
          };
          setUserProfile(profile);
          console.log('[v0] User profile set from state blob:', profile);
          return;
        }
      } catch (e) {
        console.log('[v0] Could not fetch user_profile state:', e);
      }

      // If no profile found in state, that's OK - it will be fetched when button is clicked
      console.log('[v0] No profile in state yet, will fetch on button click');
    } catch (e) {
      console.error('[v0] Error fetching user profile:', e);
    }
  };

  const fetchProducts = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      const { products } = await sdkInstance.state.products();
      setProducts(products);
    } catch (e) {
      console.error("Failed to load products:", e);
      setProducts([]);
    }
  };

  const requestUserAuth = async (): Promise<UserProfile | null> => {
    try {
      // Primary method: Call Pi.authenticate() with scopes to show permission popup
      if (typeof window.Pi !== 'undefined' && typeof window.Pi.authenticate === 'function') {
        try {
          console.log('[v0] requestUserAuth: Calling Pi.authenticate with username and payments scopes...');
          const result = await window.Pi.authenticate(['username', 'payments']);
          console.log('[v0] requestUserAuth: Pi.authenticate() returned:', result);
          console.log('[v0] requestUserAuth: Result type:', typeof result);
          console.log('[v0] requestUserAuth: Result keys:', result ? Object.keys(result) : 'null/undefined');

          // Try to extract username from different possible structures
          let username: string | undefined;
          let uid: string | undefined;

          // Direct properties
          if (result?.username) {
            username = result.username;
            uid = result.uid;
          }
          // Nested in auth property
          else if (result?.auth?.username) {
            username = result.auth.username;
            uid = result.auth.uid;
          }
          // Nested in user property
          else if (result?.user?.username) {
            username = result.user.username;
            uid = result.user.uid;
          }
          // Check if result itself is the username (unlikely but possible)
          else if (typeof result === 'string') {
            username = result;
          }

          console.log('[v0] requestUserAuth: Extracted username:', username);

          if (username) {
            const profile: UserProfile = {
              username,
              piUid: uid,
            };
            setUserProfile(profile);
            console.log('[v0] requestUserAuth: User authenticated successfully:', profile);
            
            // Store in SDK state for future reference
            if (sdk) {
              try {
                await sdk.state.set('user_profile', {
                  username: profile.username,
                  piUid: profile.piUid,
                });
              } catch (e) {
                console.log('[v0] requestUserAuth: Could not save profile to state:', e);
              }
            }
            
            return profile;
          } else {
            console.log('[v0] requestUserAuth: Could not extract username from result:', result);
            throw new Error('Pi.authenticate() returned but username could not be extracted');
          }
        } catch (e) {
          console.log('[v0] requestUserAuth: Pi.authenticate() error:', e);
          throw new Error(`Authentication failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else {
        console.log('[v0] requestUserAuth: Pi.authenticate not available');
        console.log('[v0] requestUserAuth: window.Pi type:', typeof window.Pi);
        if (typeof window.Pi !== 'undefined') {
          console.log('[v0] requestUserAuth: Available Pi methods:', Object.keys(window.Pi));
        }
        throw new Error('Pi.authenticate method not available in Pi Browser');
      }
    } catch (err) {
      console.error('[v0] requestUserAuth error:', err);
      throw err;
    }
  };

  const initialize = async () => {
    setHasError(false);
    setRestoredPurchases(null);
    try {
      setAuthMessage("Loading Pi SDK...");
      await loadPiSDK();
      
      setAuthMessage("Initializing Pi Network...");
      markPiAsInitializing();
      console.log('[v0] Calling Pi.init()...');
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });
      console.log('[v0] Pi.init() completed successfully');
      markPiAsInitialized();
      
      setAuthMessage("Loading SDKLite...");
      await loadSDKLite();

      setAuthMessage("Initializing SDKLite...");
      const sdkInstance = await window.SDKLite.init();
      
      setAuthMessage("Logging in...");
      
      // Attempt login with a timeout to prevent hanging in Sandbox
      let success = false;
      try {
        const loginPromise = sdkInstance.login();
        const timeoutPromise = new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(false), 5000); // 5 second timeout
        });
        success = await Promise.race([loginPromise, timeoutPromise]);
      } catch (e) {
        console.warn("[PiAuth] Login error (will continue anyway):", e);
        success = false;
      }

      // Continue even if login fails/times out - allows app to load in Sandbox
      setSdk(sdkInstance);
      setIsAuthenticated(true);
      
      // Try to fetch profile and products, but don't block on them
      try {
        await fetchUserProfile(sdkInstance);
      } catch (e) {
        console.log("[PiAuth] Could not fetch user profile:", e);
      }
      
      try {
        await fetchProducts(sdkInstance);
      } catch (e) {
        console.log("[PiAuth] Could not fetch products:", e);
      }

      try {
        const { purchases } = await sdkInstance.state.restore();
        setRestoredPurchases(purchases);
        console.log("[PiAuth] Purchases restored", purchases);
      } catch (e) {
        console.log("[PiAuth] Could not restore purchases:", e);
        setRestoredPurchases([]);
      }
    } catch (err) {
      console.error("SDKLite initialization failed:", err);
      setHasError(true);
      setAuthMessage(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    userProfile,
    reinitialize: initialize,
    requestUserAuth,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
