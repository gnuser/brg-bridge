import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { BRIDGE_CONTRACTS, OFT_ABI } from '../config/contracts';
import { getLzEid } from '../config/chains';
import { addressToBytes32, buildLzReceiveOptions } from '../lib/layerzero';
import { useMemo } from 'react';

export function useQuote(params: {
  srcChainId: number | undefined;
  dstChainId: number | undefined;
  amount: bigint;
  userAddress: `0x${string}` | undefined;
}) {
  const { srcChainId, dstChainId, amount, userAddress } = params;

  const sendParam = useMemo(() => {
    if (!srcChainId || !dstChainId || !userAddress || amount === 0n) return undefined;
    return {
      dstEid: getLzEid(dstChainId),
      to: addressToBytes32(userAddress),
      amountLD: amount,
      minAmountLD: amount,
      extraOptions: buildLzReceiveOptions(),
      composeMsg: '0x' as `0x${string}`,
      oftCmd: '0x' as `0x${string}`,
    };
  }, [srcChainId, dstChainId, amount, userAddress]);

  const contractAddress = srcChainId ? BRIDGE_CONTRACTS[srcChainId] : undefined;

  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: OFT_ABI,
    functionName: 'quoteSend',
    args: sendParam ? [sendParam, false] : undefined,
    chainId: srcChainId,
    query: {
      enabled: !!sendParam && !!contractAddress,
    },
  });

  const fee = data ? (data as { nativeFee: bigint }).nativeFee : undefined;
  const feeFormatted = fee ? `${formatEther(fee)} ETH` : undefined;

  return { fee, feeFormatted, isLoading, error: error as Error | null };
}
