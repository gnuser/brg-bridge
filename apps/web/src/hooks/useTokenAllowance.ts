import { useReadContract } from 'wagmi';
import { ERC20_ABI } from '../config/contracts';

export function useTokenAllowance(params: {
  tokenAddress: `0x${string}` | undefined;
  ownerAddress: `0x${string}` | undefined;
  spenderAddress: `0x${string}` | undefined;
  chainId: number | undefined;
}) {
  const { tokenAddress, ownerAddress, spenderAddress, chainId } = params;

  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    chainId,
    query: {
      enabled: !!tokenAddress && !!ownerAddress && !!spenderAddress,
      refetchInterval: 30_000,
    },
  });

  const allowance = (data as bigint) ?? 0n;

  return {
    allowance,
    needsApproval: (amount: bigint) => allowance < amount,
    isLoading,
    refetch,
  };
}
