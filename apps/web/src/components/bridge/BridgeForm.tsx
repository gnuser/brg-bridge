import { useState, useMemo } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { ChainSelector } from './ChainSelector';
import { AmountInput } from './AmountInput';
import { FeeQuote } from './FeeQuote';
import { BridgeButton } from './BridgeButton';
import { TxTracker } from '../tracking/TxTracker';
import { useMultiChainBalances } from '../../hooks/useMultiChainBalances';
import { useQuote } from '../../hooks/useQuote';
import { useTokenAllowance } from '../../hooks/useTokenAllowance';
import { useApproveToken } from '../../hooks/useApproveToken';
import { useBridge } from '../../hooks/useBridge';
import { SUPPORTED_CHAINS, getChainConfig } from '../../config/chains';
import { BRIDGE_CONTRACTS, TOKEN_ADDRESS } from '../../config/contracts';

export function BridgeForm() {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [srcChainId, setSrcChainId] = useState<number | undefined>(SUPPORTED_CHAINS[0]?.chainId);
  const [dstChainId, setDstChainId] = useState<number | undefined>(SUPPORTED_CHAINS[1]?.chainId);
  const [amount, setAmount] = useState('');
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const { balances } = useMultiChainBalances(address);
  const srcBalance = srcChainId ? (balances[srcChainId] ?? 0n) : 0n;

  const parsedAmount = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n;
    } catch {
      return 0n;
    }
  }, [amount]);

  const {
    fee,
    feeFormatted,
    isLoading: isQuoteLoading,
    error: quoteError,
  } = useQuote({
    srcChainId,
    dstChainId,
    amount: parsedAmount,
    userAddress: address,
  });

  const srcChainConfig = srcChainId ? getChainConfig(srcChainId) : undefined;
  const isAdapterChain = srcChainConfig?.contractType === 'adapter';

  const { needsApproval: checkNeedsApproval } = useTokenAllowance({
    tokenAddress: isAdapterChain ? TOKEN_ADDRESS : undefined,
    ownerAddress: address,
    spenderAddress: srcChainId ? BRIDGE_CONTRACTS[srcChainId] : undefined,
    chainId: srcChainId,
  });

  const needsApproval = isAdapterChain && parsedAmount > 0n && checkNeedsApproval(parsedAmount);

  const { approve, isApproving } = useApproveToken();
  const { bridge, isBridging } = useBridge();

  const handleSwapChains = () => {
    const temp = srcChainId;
    setSrcChainId(dstChainId);
    setDstChainId(temp);
  };

  const handleApprove = async () => {
    if (!srcChainId) return;
    await approve(TOKEN_ADDRESS, BRIDGE_CONTRACTS[srcChainId]);
  };

  const handleBridge = async () => {
    if (!srcChainId || !dstChainId || !address || !fee) return;

    // Switch chain if needed
    if (walletChainId !== srcChainId) {
      switchChain({ chainId: srcChainId });
      return;
    }

    const hash = await bridge({
      srcChainId,
      dstChainId,
      amount: parsedAmount,
      recipientAddress: address,
      fee,
    });

    setLastTxHash(hash);
    setAmount('');
  };

  // Determine disabled state
  const noWallet = !address;
  const wrongChain = walletChainId !== srcChainId;
  const noAmount = parsedAmount === 0n;
  const insufficientBalance = parsedAmount > srcBalance;
  const noFee = !fee && !isQuoteLoading;

  const disabled = noWallet || noAmount || insufficientBalance || noFee;
  const disabledReason = noWallet
    ? 'Connect Wallet'
    : noAmount
      ? 'Enter Amount'
      : insufficientBalance
        ? 'Insufficient Balance'
        : wrongChain
          ? `Switch to ${srcChainConfig?.name}`
          : undefined;

  const srcName = srcChainConfig?.name ?? '';
  const dstName = dstChainId ? (getChainConfig(dstChainId)?.name ?? '') : '';

  return (
    <div className="space-y-4">
      <div className="bg-bridge-card rounded-xl p-5 border border-bridge-border space-y-4">
        <ChainSelector
          label="From"
          selectedChainId={srcChainId}
          disabledChainId={dstChainId}
          onChange={setSrcChainId}
        />

        <div className="flex justify-center">
          <button
            onClick={handleSwapChains}
            className="p-2 rounded-lg bg-bridge-dark hover:bg-bridge-border transition-colors text-gray-400 hover:text-white"
            aria-label="Swap source and destination chains"
          >
            ↕
          </button>
        </div>

        <ChainSelector
          label="To"
          selectedChainId={dstChainId}
          disabledChainId={srcChainId}
          onChange={setDstChainId}
        />

        <AmountInput value={amount} onChange={setAmount} balance={srcBalance} />

        <FeeQuote feeFormatted={feeFormatted} isLoading={isQuoteLoading} error={quoteError} />

        <BridgeButton
          needsApproval={needsApproval}
          isApproving={isApproving}
          isBridging={isBridging}
          disabled={disabled}
          disabledReason={disabledReason}
          srcChainName={srcName}
          dstChainName={dstName}
          onApprove={handleApprove}
          onBridge={handleBridge}
        />
      </div>

      {lastTxHash && (
        <TxTracker
          txHash={lastTxHash}
          srcChainName={srcName}
          dstChainName={dstName}
          amount={amount}
          srcChainId={srcChainId}
          dstChainId={dstChainId}
          userAddress={address}
        />
      )}
    </div>
  );
}
