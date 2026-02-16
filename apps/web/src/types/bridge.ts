export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  lzEid: number;
  lzTestnetEid: number;
  explorerUrl: string;
  contractType: 'adapter' | 'oft';
}

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  addresses: Record<number, `0x${string}`>;
}

export interface BridgeParams {
  srcChainId: number;
  dstChainId: number;
  amount: bigint;
  recipientAddress: `0x${string}`;
  fee: bigint;
}

export type TxStatus = 'pending' | 'confirming' | 'inflight' | 'delivered' | 'failed';

export interface BridgeTx {
  txHash: `0x${string}`;
  srcChainId: number;
  dstChainId: number;
  amount: string;
  timestamp: number;
  status: TxStatus;
}
