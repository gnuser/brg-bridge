import { useState, useEffect, useCallback } from 'react';
import { getTxHistory, clearTxHistory, updateTxStatus } from '../../lib/storage';
import { getChainConfig } from '../../config/chains';
import { shortenTxHash, formatTokenAmount } from '../../lib/format';
import { getLzScanUrl } from '../../lib/layerzero';
import { getGuidFromTx, checkDeliveryOnDst } from '../../lib/lzStatus';
import { config } from '../../config/wagmi';
import { getPublicClient } from 'wagmi/actions';
import { BRIDGE_CONTRACTS } from '../../config/contracts';
import type { BridgeTx } from '../../types/bridge';

const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet';

export function TxHistory() {
  const [transactions, setTransactions] = useState<BridgeTx[]>([]);

  const pollPendingTxs = useCallback(async () => {
    const history = getTxHistory();
    const pending = history.filter(
      (tx) => tx.status !== 'delivered' && tx.status !== 'failed',
    );

    for (const tx of pending) {
      try {
        const srcClient = getPublicClient(config, {
          chainId: tx.srcChainId as (typeof config)['chains'][number]['id'],
        });
        if (!srcClient) continue;

        const srcContract = BRIDGE_CONTRACTS[tx.srcChainId];
        if (!srcContract) continue;

        // Step 1: Get guid from source tx (also confirms receipt)
        const guid = await getGuidFromTx(srcClient, tx.txHash as `0x${string}`, srcContract);

        if (guid === null) {
          // Check if tx reverted
          try {
            const receipt = await srcClient.getTransactionReceipt({
              hash: tx.txHash as `0x${string}`,
            });
            if (receipt.status === 'reverted') {
              updateTxStatus(tx.txHash, 'failed');
            } else if (tx.status === 'pending') {
              updateTxStatus(tx.txHash, 'inflight');
            }
          } catch {
            // Receipt not available yet
          }
          continue;
        }

        // Source tx confirmed — at least inflight
        if (tx.status === 'pending') {
          updateTxStatus(tx.txHash, 'inflight');
        }

        // Step 2: Check destination for OFTReceived event
        const dstContract = BRIDGE_CONTRACTS[tx.dstChainId];
        if (!dstContract) continue;

        const dstClient = getPublicClient(config, {
          chainId: tx.dstChainId as (typeof config)['chains'][number]['id'],
        });
        if (!dstClient) continue;

        const delivered = await checkDeliveryOnDst(dstClient, dstContract, guid);
        if (delivered) {
          updateTxStatus(tx.txHash, 'delivered');
        }
      } catch {
        // Skip on errors
      }
    }

    setTransactions(getTxHistory());
  }, []);

  useEffect(() => {
    pollPendingTxs();
    const interval = setInterval(pollPendingTxs, 15_000);
    return () => clearInterval(interval);
  }, [pollPendingTxs]);

  if (transactions.length === 0) {
    return (
      <div className="bg-bridge-card rounded-xl p-4 border border-bridge-border">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Transaction History</h3>
        <p className="text-sm text-gray-600">No transactions yet</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400',
    confirming: 'text-yellow-400',
    inflight: 'text-blue-400',
    delivered: 'text-green-400',
    failed: 'text-red-400',
  };

  return (
    <div className="bg-bridge-card rounded-xl p-4 border border-bridge-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">Transaction History</h3>
        <button
          onClick={() => {
            clearTxHistory();
            setTransactions([]);
          }}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {transactions.slice(0, 10).map((tx) => {
          const src = getChainConfig(tx.srcChainId);
          const dst = getChainConfig(tx.dstChainId);
          return (
            <a
              key={tx.txHash}
              href={getLzScanUrl(tx.txHash, isTestnet)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-bridge-dark transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">
                  {src?.shortName} → {dst?.shortName}
                </span>
                <span className="font-mono text-gray-400">
                  {formatTokenAmount(BigInt(tx.amount))} BRG
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={statusColors[tx.status] || 'text-gray-400'}>{tx.status}</span>
                <span className="text-gray-600">{shortenTxHash(tx.txHash)}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
