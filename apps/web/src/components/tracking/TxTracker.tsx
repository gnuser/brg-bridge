import { useTxTracking } from '../../hooks/useTxTracking';
import { shortenTxHash } from '../../lib/format';

interface TxTrackerProps {
  txHash: `0x${string}`;
  srcChainName: string;
  dstChainName: string;
  amount: string;
  srcChainId?: number;
  dstChainId?: number;
  userAddress?: `0x${string}`;
}

const STATUS_STEPS = ['pending', 'confirming', 'inflight', 'delivered'] as const;

export function TxTracker({ txHash, srcChainName, dstChainName, amount, srcChainId, dstChainId, userAddress }: TxTrackerProps) {
  const { status, lzScanUrl } = useTxTracking(txHash, srcChainId, dstChainId, userAddress);

  const currentStep = STATUS_STEPS.indexOf(status === 'failed' ? 'pending' : status);

  return (
    <div className="bg-bridge-card rounded-xl p-4 border border-bridge-border">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        Bridging {amount} BRG: {srcChainName} → {dstChainName}
      </h3>

      <div className="space-y-2">
        {STATUS_STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const labels: Record<string, string> = {
            pending: `Submitted (${shortenTxHash(txHash)})`,
            confirming: `Confirming on ${srcChainName}...`,
            inflight: 'Verifying (DVN)',
            delivered: `Delivered to ${dstChainName}`,
          };

          return (
            <div key={step} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  isDone
                    ? 'bg-green-400'
                    : isActive
                      ? 'bg-bridge-primary animate-pulse'
                      : 'bg-gray-600'
                }`}
              />
              <span
                className={isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-gray-600'}
              >
                {labels[step]}
              </span>
            </div>
          );
        })}

        {status === 'failed' && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Transaction failed
          </div>
        )}
      </div>

      {lzScanUrl && (
        <a
          href={lzScanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-xs text-bridge-primary hover:text-bridge-secondary transition-colors"
        >
          View on LayerZero Scan →
        </a>
      )}
    </div>
  );
}
