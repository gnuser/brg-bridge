import { SUPPORTED_CHAINS } from '../../config/chains';

interface ChainSelectorProps {
  label: string;
  selectedChainId: number | undefined;
  disabledChainId: number | undefined;
  onChange: (chainId: number) => void;
}

export function ChainSelector({
  label,
  selectedChainId,
  disabledChainId,
  onChange,
}: ChainSelectorProps) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2">
        {SUPPORTED_CHAINS.map((chain) => {
          const isSelected = chain.chainId === selectedChainId;
          const isDisabled = chain.chainId === disabledChainId;

          return (
            <button
              key={chain.chainId}
              onClick={() => !isDisabled && onChange(chain.chainId)}
              disabled={isDisabled}
              className={`
                flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-bridge-primary text-white'
                    : isDisabled
                      ? 'bg-bridge-dark text-gray-600 cursor-not-allowed'
                      : 'bg-bridge-dark text-gray-300 hover:bg-bridge-border cursor-pointer'
                }
              `}
              aria-label={`Select ${chain.name} as ${label.toLowerCase()}`}
            >
              {chain.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
