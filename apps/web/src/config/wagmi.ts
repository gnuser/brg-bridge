import { createConfig, http } from 'wagmi';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { wagmiChains } from './chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: wagmiChains,
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
    coinbaseWallet({ appName: 'BRG Bridge' }),
  ],
  transports: Object.fromEntries(
    wagmiChains.map((chain) => [
      chain.id,
      http(
        chain.id === wagmiChains[0].id
          ? import.meta.env.VITE_RPC_ETHEREUM
          : chain.id === wagmiChains[1].id
            ? import.meta.env.VITE_RPC_ARBITRUM
            : chain.id === wagmiChains[2].id
              ? import.meta.env.VITE_RPC_BASE
              : import.meta.env.VITE_RPC_OPTIMISM,
      ),
    ]),
  ) as Record<number, ReturnType<typeof http>>,
});
