import {
  mainnet,
  arbitrum,
  base,
  optimism,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  optimismSepolia,
} from 'wagmi/chains';
import type { ChainConfig } from '../types/bridge';

const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet';

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    chainId: isTestnet ? sepolia.id : mainnet.id,
    name: 'Ethereum',
    shortName: 'ETH',
    lzEid: 30101,
    lzTestnetEid: 40161,
    explorerUrl: isTestnet ? 'https://sepolia.etherscan.io' : 'https://etherscan.io',
    contractType: 'adapter',
  },
  {
    chainId: isTestnet ? arbitrumSepolia.id : arbitrum.id,
    name: 'Arbitrum',
    shortName: 'ARB',
    lzEid: 30110,
    lzTestnetEid: 40231,
    explorerUrl: isTestnet ? 'https://sepolia.arbiscan.io' : 'https://arbiscan.io',
    contractType: 'oft',
  },
  {
    chainId: isTestnet ? baseSepolia.id : base.id,
    name: 'Base',
    shortName: 'BASE',
    lzEid: 30184,
    lzTestnetEid: 40245,
    explorerUrl: isTestnet ? 'https://sepolia.basescan.org' : 'https://basescan.org',
    contractType: 'oft',
  },
  {
    chainId: isTestnet ? optimismSepolia.id : optimism.id,
    name: 'Optimism',
    shortName: 'OP',
    lzEid: 30111,
    lzTestnetEid: 40232,
    explorerUrl: isTestnet
      ? 'https://sepolia-optimism.etherscan.io'
      : 'https://optimistic.etherscan.io',
    contractType: 'oft',
  },
];

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((c) => c.chainId === chainId);
}

export function getLzEid(chainId: number): number {
  const chain = getChainConfig(chainId);
  if (!chain) throw new Error(`Unsupported chain: ${chainId}`);
  return isTestnet ? chain.lzTestnetEid : chain.lzEid;
}

export const wagmiChains = isTestnet
  ? ([sepolia, arbitrumSepolia, baseSepolia, optimismSepolia] as const)
  : ([mainnet, arbitrum, base, optimism] as const);
