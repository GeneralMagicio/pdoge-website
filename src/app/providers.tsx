'use client';

import { ReactNode, useEffect, useState } from 'react';
import { WagmiProvider, createConfig, http, useWalletClient } from 'wagmi';
import { mainnet, sepolia, polygon } from 'wagmi/chains';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';

// Minimal connectors (Injected-only) if no WalletConnect project id present
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { BrowserProvider, Signer } from 'ethers';
import { WalletClient } from 'viem';

const chains = [mainnet, sepolia, polygon] as const;

const transports = chains.reduce((acc, chain) => {
  acc[chain.id] = http();
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

export async function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient
  if (!chain) {
    throw new Error('Chain not found')
  };
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new BrowserProvider(transport, network)
  const signer = await provider.getSigner(account?.address)

  return signer
}

export function useSigner() {
  const { data: walletClient } = useWalletClient()

  const [signer, setSigner] = useState<Signer | undefined>(undefined)
  useEffect(() => {
    async function getSigner() {
      if (!walletClient) return

      const tmpSigner = await walletClientToSigner(walletClient)

      setSigner(tmpSigner)
    }

    void getSigner()
  }, [walletClient])
  return signer
}

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [injectedWallet],
  },
], {
  appName: 'PolyDoge',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
});

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports,
  ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <AuthProvider>
            {children}
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


