import { useState, useEffect, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import type { TxStatus } from '../types/bridge';
import { getLzScanUrl } from '../lib/layerzero';
import { getGuidFromTx, checkDeliveryOnDst } from '../lib/lzStatus';
import { updateTxStatus } from '../lib/storage';
import { config } from '../config/wagmi';
import { getPublicClient } from 'wagmi/actions';
import { BRIDGE_CONTRACTS } from '../config/contracts';

const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet';

export function useTxTracking(
  txHash: `0x${string}` | undefined,
  srcChainId?: number,
  dstChainId?: number,
  _userAddress?: `0x${string}`,
) {
  const [status, setStatus] = useState<TxStatus>('pending');
  const [dstTxHash] = useState<`0x${string}` | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [guid, setGuid] = useState<`0x${string}` | null>(null);

  const srcClient = usePublicClient({ chainId: srcChainId });
  const lzScanUrl = txHash ? getLzScanUrl(txHash, isTestnet) : undefined;

  const pollStatus = useCallback(async () => {
    if (!txHash) return;

    try {
      setIsLoading(true);

      // Step 1: Check source tx receipt + extract guid
      if (status === 'pending' && srcClient && srcChainId) {
        const srcContract = BRIDGE_CONTRACTS[srcChainId];
        if (!srcContract) return;

        const extractedGuid = await getGuidFromTx(srcClient, txHash, srcContract);
        if (extractedGuid === null) {
          // Receipt not available or tx reverted
          try {
            const receipt = await srcClient.getTransactionReceipt({ hash: txHash });
            if (receipt.status === 'reverted') {
              setStatus('failed');
              updateTxStatus(txHash, 'failed');
            }
          } catch {
            // Receipt not available yet
          }
          return;
        }

        setGuid(extractedGuid);
        setStatus('inflight');
        updateTxStatus(txHash, 'inflight');
      }

      // Step 2: Check destination chain for OFTReceived event
      if ((status === 'inflight' || status === 'confirming') && guid && dstChainId) {
        const dstContract = BRIDGE_CONTRACTS[dstChainId];
        if (!dstContract) return;

        const dstClient = getPublicClient(config, {
          chainId: dstChainId as (typeof config)['chains'][number]['id'],
        });
        if (!dstClient) return;

        const delivered = await checkDeliveryOnDst(dstClient, dstContract, guid);
        if (delivered) {
          setStatus('delivered');
          updateTxStatus(txHash, 'delivered');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [txHash, status, srcClient, srcChainId, dstChainId, guid]);

  useEffect(() => {
    if (!txHash) return;
    if (status === 'delivered' || status === 'failed') return;

    pollStatus();
    const interval = setInterval(pollStatus, 10_000);
    return () => clearInterval(interval);
  }, [txHash, status, pollStatus]);

  return { status, lzScanUrl, dstTxHash, isLoading };
}
