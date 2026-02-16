interface FeeQuoteProps {
  feeFormatted: string | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function FeeQuote({ feeFormatted, isLoading, error }: FeeQuoteProps) {
  return (
    <div className="flex items-center justify-between text-sm py-2">
      <span className="text-gray-400">Estimated Fee</span>
      <span className="font-mono text-gray-300">
        {isLoading ? (
          <span className="animate-pulse">Calculating...</span>
        ) : error ? (
          <span className="text-red-400">Unable to estimate</span>
        ) : feeFormatted ? (
          feeFormatted
        ) : (
          '—'
        )}
      </span>
    </div>
  );
}
