import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { BRIDGE_CONTRACTS, OFT_ABI } from '../config/contracts';
import { getLzEid } from '../config/chains';
import { addressToBytes32, buildLzReceiveOptions } from '../lib/layerzero';
import { addTxToHistory } from '../lib/storage';
import type { BridgeParams } from '../types/bridge';

export function useBridge() {
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);

  const { writeContractAsync, isPending } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function bridge(params: BridgeParams): Promise<`0x${string}`> {
    setError(null);

    try {
      const contractAddress = BRIDGE_CONTRACTS[params.srcChainId];
      if (!contractAddress) throw new Error('No contract for source chain');

      const sendParam = {
        dstEid: getLzEid(params.dstChainId),
        to: addressToBytes32(params.recipientAddress),
        amountLD: params.amount,
        minAmountLD: params.amount,
        extraOptions: buildLzReceiveOptions(),
        composeMsg: '0x' as `0x${string}`,
        oftCmd: '0x' as `0x${string}`,
      };

      const messagingFee = {
        nativeFee: params.fee,
        lzTokenFee: 0n,
      };

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: OFT_ABI,
        functionName: 'send',
        args: [sendParam, messagingFee, params.recipientAddress],
        value: params.fee,
      });

      setTxHash(hash);

      // Save to localStorage
      addTxToHistory({
        txHash: hash,
        srcChainId: params.srcChainId,
        dstChainId: params.dstChainId,
        amount: params.amount.toString(),
        timestamp: Date.now(),
        status: 'pending',
      });

      return hash;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bridge transaction failed');
      setError(error);
      throw error;
    }
  }

  return {
    bridge,
    isBridging: isPending || isConfirming,
    txHash,
    error,
  };
}
