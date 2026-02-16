interface BridgeButtonProps {
  needsApproval: boolean;
  isApproving: boolean;
  isBridging: boolean;
  disabled: boolean;
  disabledReason?: string;
  srcChainName: string;
  dstChainName: string;
  onApprove: () => void;
  onBridge: () => void;
}

export function BridgeButton({
  needsApproval,
  isApproving,
  isBridging,
  disabled,
  disabledReason,
  srcChainName,
  dstChainName,
  onApprove,
  onBridge,
}: BridgeButtonProps) {
  if (needsApproval) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-400 text-center">
          Step 1 of 2: Approve BRG for bridging
        </div>
        <button
          onClick={onApprove}
          disabled={disabled || isApproving}
          className="w-full bg-bridge-primary hover:bg-bridge-secondary disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
          aria-label="Approve BRG tokens"
        >
          {isApproving ? 'Approving...' : 'Approve BRG'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onBridge}
      disabled={disabled || isBridging}
      className="w-full bg-bridge-primary hover:bg-bridge-secondary disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
      aria-label={`Bridge tokens from ${srcChainName} to ${dstChainName}`}
    >
      {isBridging
        ? 'Bridging...'
        : disabled && disabledReason
          ? disabledReason
          : `Bridge to ${dstChainName}`}
    </button>
  );
}
