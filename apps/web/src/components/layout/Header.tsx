import { ConnectButton } from '../wallet/ConnectButton';

export function Header() {
  return (
    <header className="border-b border-bridge-border px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-bridge-primary">BRG</span>
          <span className="text-lg text-gray-300">Bridge</span>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
