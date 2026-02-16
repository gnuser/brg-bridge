import { formatEther, formatUnits } from 'viem';

export function formatTokenAmount(amount: bigint, decimals = 18, maxDecimals = 4): string {
  const formatted = formatUnits(amount, decimals);
  const parts = formatted.split('.');
  if (parts.length === 1) return formatted;
  return `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
}

export function formatFee(fee: bigint): string {
  return `${formatEther(fee)} ETH`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function shortenTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
