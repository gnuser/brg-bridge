import { formatTokenAmount } from '../../lib/format';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance: bigint;
  decimals?: number;
}

export function AmountInput({ value, onChange, balance, decimals = 18 }: AmountInputProps) {
  const handleMax = () => {
    const formatted = formatTokenAmount(balance, decimals, decimals);
    onChange(formatted);
  };

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">Amount</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d*\.?\d*$/.test(val)) {
              onChange(val);
            }
          }}
          placeholder="0.0"
          className="w-full bg-bridge-dark border border-bridge-border rounded-lg px-4 py-3 text-lg font-mono text-white placeholder-gray-600 focus:outline-none focus:border-bridge-primary"
          aria-label="Bridge amount"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-sm text-gray-400 font-medium">BRG</span>
          <button
            onClick={handleMax}
            className="text-xs text-bridge-primary hover:text-bridge-secondary font-medium transition-colors"
          >
            MAX
          </button>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-500">Balance: {formatTokenAmount(balance)} BRG</div>
    </div>
  );
}
