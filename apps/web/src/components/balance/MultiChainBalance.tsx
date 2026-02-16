import { useAccount } from 'wagmi';
import { useMultiChainBalances } from '../../hooks/useMultiChainBalances';
import { SUPPORTED_CHAINS } from '../../config/chains';
import { formatTokenAmount } from '../../lib/format';

export function MultiChainBalance() {
  const { address } = useAccount();
  const { balances, isLoading } = useMultiChainBalances(address);

  if (!address) return null;

  const total = Object.values(balances).reduce((sum, b) => sum + b, 0n);

  return (
    <div className="bg-bridge-card rounded-xl p-4 border border-bridge-border">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Your BRG Balances</h3>
      <div className="grid grid-cols-4 gap-2">
        {SUPPORTED_CHAINS.map((chain) => (
          <div key={chain.chainId} className="text-center p-2 rounded-lg bg-bridge-dark">
            <div className="text-xs text-gray-400 mb-1">{chain.shortName}</div>
            <div className="text-sm font-mono">
              {isLoading ? '...' : formatTokenAmount(balances[chain.chainId] ?? 0n)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-bridge-border text-sm text-gray-400">
        Total: <span className="text-white font-mono">{formatTokenAmount(total)} BRG</span>
      </div>
    </div>
  );
}
