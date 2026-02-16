import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenAddress } from '../../lib/format';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 bg-bridge-card px-3 py-1.5 rounded-lg">
          {shortenAddress(address)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {connectors.slice(0, 3).map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-bridge-primary hover:bg-bridge-secondary text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
        </button>
      ))}
    </div>
  );
}
