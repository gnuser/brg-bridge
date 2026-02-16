import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { TOKEN_ADDRESS, FAUCET_ABI } from '../../config/contracts';
import { useMultiChainBalances } from '../../hooks/useMultiChainBalances';
import { shortenTxHash } from '../../lib/format';
import { SUPPORTED_CHAINS } from '../../config/chains';

const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet';

// Sepolia chain ID — faucet only works on the home chain
const SEPOLIA_CHAIN_ID = 11155111;

export function FaucetButton() {
  // Never render in non-testnet mode
  if (!isTestnet) return null;

  return <FaucetButtonInner />;
}

function FaucetButtonInner() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { refetch } = useMultiChainBalances(address);
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: lastTxHash,
    query: {
      enabled: !!lastTxHash,
    },
  });

  // Refetch balances when tx confirms
  if (isSuccess && lastTxHash) {
    refetch();
  }

  const sepoliaChain = SUPPORTED_CHAINS.find((c) => c.chainId === SEPOLIA_CHAIN_ID);
  const explorerUrl = sepoliaChain?.explorerUrl ?? 'https://sepolia.etherscan.io';

  const isMinting = isWritePending || isConfirming;
  const isWrongChain = chainId !== SEPOLIA_CHAIN_ID;

  const handleMint = () => {
    if (!address) return;

    if (isWrongChain) {
      switchChain({ chainId: SEPOLIA_CHAIN_ID });
      return;
    }

    setLastTxHash(undefined);
    writeContract(
      {
        address: TOKEN_ADDRESS,
        abi: FAUCET_ABI,
        functionName: 'faucet',
        chainId: SEPOLIA_CHAIN_ID,
      },
      {
        onSuccess: (hash) => {
          setLastTxHash(hash);
        },
      },
    );
  };

  const handleMintAgain = () => {
    setLastTxHash(undefined);
    handleMint();
  };

  return (
    <div className="bg-bridge-card rounded-xl p-4 border border-amber-500/30">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-400 text-lg" aria-hidden="true">
          {'\uD83D\uDEB0'}
        </span>
        <h3 className="text-sm font-medium text-amber-400">Testnet Faucet</h3>
        <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
          Sepolia
        </span>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Mint 1,000 BRG test tokens to your wallet for testing the bridge.
      </p>

      {!address ? (
        <button
          disabled
          className="w-full bg-gray-700 text-gray-500 font-medium py-2.5 rounded-lg text-sm cursor-not-allowed"
          aria-label="Connect wallet to use faucet"
        >
          Connect Wallet to Mint
        </button>
      ) : isWrongChain ? (
        <button
          onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          aria-label="Switch to Sepolia network"
        >
          Switch to Sepolia
        </button>
      ) : (
        <button
          onClick={isSuccess ? handleMintAgain : handleMint}
          disabled={isMinting}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          aria-label="Mint 1000 test BRG tokens"
        >
          {isMinting
            ? isConfirming
              ? 'Confirming...'
              : 'Minting...'
            : isSuccess
              ? 'Mint Again'
              : 'Mint 1,000 Test BRG'}
        </button>
      )}

      {isSuccess && lastTxHash && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
          <span aria-hidden="true">{'\u2713'}</span>
          <span>Minted!</span>
          <a
            href={`${explorerUrl}/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300 ml-1"
          >
            {shortenTxHash(lastTxHash)}
          </a>
        </div>
      )}
    </div>
  );
}
