import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MultiChainBalance } from './components/balance/MultiChainBalance';
import { BridgeForm } from './components/bridge/BridgeForm';
import { FaucetButton } from './components/faucet/FaucetButton';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Cross-Chain Bridge</h1>
            <p className="text-gray-400">
              Bridge BRG tokens across Ethereum, Arbitrum, Base, and Optimism
            </p>
          </div>

          <FaucetButton />
          <MultiChainBalance />
          <BridgeForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
