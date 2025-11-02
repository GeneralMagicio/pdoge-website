"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { axiosInstance, getBackendUrl } from '@/app/lib/api';

type AuthContextValue = {
  address?: `0x${string}`;
  isConnected: boolean;
  accessToken: string | null;
  isSignedIn: boolean;
  statusLabel: 'Connect Wallet' | 'Connected' | 'Signed In';
  connectWallet: () => Promise<void>;
  signIn: () => Promise<boolean>;
  ensureSignedIn: () => Promise<boolean>;
  signOut: () => void;
};

export const accessTokenKey = 'pdoge_access_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem(accessTokenKey);
      setAccessToken(token);
    } catch {
      // ignore
    }
  }, []);

  // If wallet disconnects, clear signed-in state
  useEffect(() => {
    if (!isConnected) {
      setAccessToken(null);
      try { localStorage.removeItem(accessTokenKey); } catch { /* ignore */ }
    }
  }, [isConnected]);

  const isSignedIn = !!(isConnected && accessToken);

  const statusLabel: AuthContextValue['statusLabel'] = isSignedIn
    ? 'Signed In'
    : isConnected
      ? 'Connected'
      : 'Connect Wallet';

  const connectWallet = useCallback(async () => {
    if (isConnected) return;
    if (openConnectModal) openConnectModal();
  }, [isConnected, openConnectModal]);

  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      if (!isConnected || !address) {
        if (openConnectModal) openConnectModal();
        return false;
      }
      const base = getBackendUrl();
      if (!base) throw new Error('Backend URL is not configured');

      const reqRes = await axiosInstance.post('/auth/request-message', { address });
      const message = (reqRes?.data?.message || '').toString();
      if (!message) throw new Error('Invalid sign-in message');

      const signature = await signMessageAsync({ message });

      const verifyRes = await axiosInstance.post('/auth/verify', { address, signature });
      const token = (verifyRes?.data?.accessToken || '').toString();
      if (!token) throw new Error('No access token received');

      setAccessToken(token);
      try { localStorage.setItem(accessTokenKey, token); } catch { /* ignore */ }
      return true;
    } catch {
      // optionally surface error UI elsewhere
      return false;
    }
  }, [address, isConnected, openConnectModal, signMessageAsync]);

  const ensureSignedIn = useCallback(async () => {
    if (!isConnected) {
      if (openConnectModal) openConnectModal();
      return false;
    }
    if (!accessToken) {
      const ok = await signIn();
      return ok;
    }
    return true;
  }, [accessToken, isConnected, openConnectModal, signIn]);

  const signOut = useCallback(() => {
    setAccessToken(null);
    try { localStorage.removeItem(accessTokenKey); } catch { /* ignore */ }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    address,
    isConnected,
    accessToken,
    isSignedIn,
    statusLabel,
    connectWallet,
    signIn,
    ensureSignedIn,
    signOut,
  }), [address, isConnected, accessToken, isSignedIn, statusLabel, connectWallet, signIn, ensureSignedIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


