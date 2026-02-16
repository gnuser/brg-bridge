import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ERC20_ABI } from '../config/contracts';
import { maxUint256 } from 'viem';

export function useApproveToken() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function approve(
    tokenAddress: `0x${string}`,
    spender: `0x${string}`,
    _amount?: bigint,
  ): Promise<`0x${string}`> {
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, maxUint256], // Approve max for convenience
    });
    setTxHash(hash);
    return hash;
  }

  return {
    approve,
    isApproving: isWriting || isConfirming,
    txHash,
  };
}
