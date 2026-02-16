/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_NETWORK_MODE: 'testnet' | 'mainnet';
  readonly VITE_RPC_ETHEREUM: string;
  readonly VITE_RPC_ARBITRUM: string;
  readonly VITE_RPC_BASE: string;
  readonly VITE_RPC_OPTIMISM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
