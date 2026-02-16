import { useReadContracts } from 'wagmi';
import { SUPPORTED_CHAINS } from '../config/chains';
import { BRIDGE_CONTRACTS, TOKEN_ADDRESS, ERC20_ABI, OFT_ABI } from '../config/contracts';

export function useMultiChainBalances(userAddress: `0x${string}` | undefined) {
  const contracts = SUPPORTED_CHAINS.map((chain) => ({
    address:
      chain.contractType === 'adapter'
        ? TOKEN_ADDRESS // ERC20 balanceOf on Ethereum
        : BRIDGE_CONTRACTS[chain.chainId], // OFT balanceOf on L2s
    abi: chain.contractType === 'adapter' ? ERC20_ABI : OFT_ABI,
    functionName: 'balanceOf' as const,
    args: userAddress ? [userAddress] : undefined,
    chainId: chain.chainId,
  }));

  const { data, isLoading, refetch } = useReadContracts({
    contracts: userAddress ? contracts : [],
    query: {
      enabled: !!userAddress,
      refetchInterval: 30_000,
    },
  });

  const balances: Record<number, bigint> = {};
  SUPPORTED_CHAINS.forEach((chain, i) => {
    const result = data?.[i];
    balances[chain.chainId] = result?.status === 'success' ? (result.result as bigint) : 0n;
  });

  return { balances, isLoading, refetch };
}
