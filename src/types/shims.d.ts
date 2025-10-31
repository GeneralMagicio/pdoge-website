/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporary type shims until packages are installed locally

declare module '@rainbow-me/rainbowkit' {
  export const RainbowKitProvider: (props: any) => JSX.Element;
  export const getDefaultWallets: any;
  export const darkTheme: any;
  export const connectorsForWallets: any;
  export function useConnectModal(): { openConnectModal?: () => void };
}

declare module '@rainbow-me/rainbowkit/wallets' {
  export const injectedWallet: any;
}

declare module '@rainbow-me/rainbowkit/styles.css';

declare module '@ethereum-attestation-service/eas-sdk' {
  export class EAS {
    constructor(address: string);
    connect(signer: unknown): void;
    attest(args: unknown): Promise<{ wait(): Promise<string> }>;
  }
}


