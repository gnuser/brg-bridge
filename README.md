# BRG Bridge

Cross-chain ERC20 token bridge using [LayerZero V2](https://layerzero.network/) OFT standard. Bridges BRG tokens between Ethereum, Arbitrum, Base, and Optimism — 12 directional pathways with dual-DVN verification.

**Live demo:** [bridge-app-erc.pages.dev](https://bridge-app-erc.pages.dev) (testnet)

## Architecture

```
Ethereum (Home Chain)              L2 Chains (Arbitrum, Base, Optimism)
┌──────────────────┐              ┌──────────────────┐
│  BridgeToken     │              │   BridgeOFT      │
│  (ERC20 - BRG)   │              │   (burn/mint)    │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
┌────────┴─────────┐                       │
│ BridgeOFTAdapter │ ◄── LayerZero V2 ──►  │
│  (lock/unlock)   │     EndpointV2        │
└──────────────────┘                       │
```

**Lock-and-mint model:**
- Ethereum: `BridgeOFTAdapter` locks ERC20 tokens when bridging out, unlocks when bridging back
- L2s: `BridgeOFT` mints synthetic tokens on receive, burns on send
- Total supply always conserved: locked on Ethereum = minted across L2s

All 12 directional pathways are wired (not just hub-and-spoke):

```
Ethereum ↔ Arbitrum    Arbitrum ↔ Base      Arbitrum ↔ Optimism
Ethereum ↔ Base        Base ↔ Optimism
Ethereum ↔ Optimism
```

## Contracts

Three Solidity contracts — the OFT standard does the heavy lifting:

### BridgeToken.sol (Ethereum only)

```solidity
contract BridgeToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 1_000 * 10 ** 18;

    constructor(address _initialOwner) ERC20("BridgeToken", "BRG") Ownable(_initialOwner) {
        _mint(_initialOwner, 1_000_000 * 10 ** decimals());
    }

    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
```

Standard ERC20, 1M initial supply. `faucet()` is for testnet (remove before mainnet).

### BridgeOFTAdapter.sol (Ethereum only)

```solidity
contract BridgeOFTAdapter is OFTAdapter {
    constructor(address _token, address _lzEndpoint, address _delegate)
        OFTAdapter(_token, _lzEndpoint, _delegate)
        Ownable(_delegate)
    { }
}
```

Wraps the ERC20. Locks on `send()`, unlocks on receive. All logic is in the inherited `OFTAdapter`.

### BridgeOFT.sol (Each L2)

```solidity
contract BridgeOFT is OFT {
    constructor(string memory _name, string memory _symbol, address _lzEndpoint, address _delegate)
        OFT(_name, _symbol, _lzEndpoint, _delegate)
        Ownable(_delegate)
    { }
}
```

Full ERC20 + LayerZero receiver. Mints on receive, burns on send.

## DVN Security

Dual-DVN verification — both must independently confirm every message:

| DVN | Address |
|-----|---------|
| LayerZero Labs | `0x589dEDbD617F7E266a090e916B2a37dDc4e3b0C4` |
| Google Cloud | `0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc` |

Block confirmations: 15 for Ethereum, 5 for L2s.

## Deployed Addresses (Testnet)

| Chain | Contract | Address |
|-------|----------|---------|
| Sepolia | BridgeToken | `0x2F774239ca92404C3Cf9D2363a2e2624Af19dA60` |
| Sepolia | BridgeOFTAdapter | `0xECC80fc532b80F0Fa9D160F90921EE7b94374e16` |
| Arb Sepolia | BridgeOFT | `0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9` |
| Base Sepolia | BridgeOFT | `0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9` |
| Opt Sepolia | BridgeOFT | `0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9` |

## Quick Start

### Contracts

```bash
cd contracts
npm install --legacy-peer-deps
forge install foundry-rs/forge-std --no-commit

# Build
forge build

# Test (9 unit + 8 cross-chain integration)
forge test -vvv

# Deploy to testnet
cp .env.example .env  # set PRIVATE_KEY
npx hardhat lz:deploy --network sepolia --tags BridgeToken,BridgeOFTAdapter
npx hardhat lz:deploy --network arbitrum-sepolia --tags BridgeOFT
npx hardhat lz:deploy --network base-sepolia --tags BridgeOFT
npx hardhat lz:deploy --network optimism-sepolia --tags BridgeOFT

# Wire all 12 pathways
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

### Frontend

```bash
cd apps/web
npm install

cp .env.example .env  # set VITE_WALLETCONNECT_PROJECT_ID

# Dev server
npm run dev

# Production build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist/ --project-name=bridge-app --branch=main
```

## Frontend Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build | Vite 5 |
| Web3 | wagmi 2 + viem 2 + Web3Modal |
| Styling | Tailwind CSS 3 |
| State | TanStack Query |
| Hosting | Cloudflare Pages |

### Key Hooks

- **`useBridge`** — Constructs `SendParam`, calls `send()` on OFT/OFTAdapter
- **`useQuote`** — Calls `quoteSend()` for real-time fee estimation
- **`useMultiChainBalances`** — Batch `balanceOf` across all 4 chains (30s polling)
- **`useTokenAllowance` / `useApproveToken`** — ERC20 approval flow (Ethereum only)
- **`useTxTracking`** — Polls LayerZero Scan API for cross-chain delivery status

## Project Structure

```
contracts/
  src/                  BridgeToken.sol, BridgeOFTAdapter.sol, BridgeOFT.sol
  script/               Foundry deploy scripts
  test/foundry/         Unit + integration tests
  deploy/               Hardhat deploy configs
  layerzero.config.ts   12-pathway peer config with DVN settings
  hardhat.config.ts     Network configs (4 testnets + 4 mainnets)

apps/web/
  src/
    components/
      bridge/           BridgeForm, ChainSelector, AmountInput, FeeQuote, BridgeButton
      balance/          MultiChainBalance (4-chain view)
      tracking/         TxTracker, TxHistory
      faucet/           FaucetButton (testnet only)
      wallet/           ConnectButton
      layout/           Header, Footer
    config/             chains.ts, contracts.ts, wagmi.ts
    hooks/              useBridge, useQuote, useMultiChainBalances, ...
    lib/                layerzero utils, formatting, localStorage
    types/              TypeScript types
```

## LayerZero V2 Gotchas

- Use **legacy Type 1 options** (`0x0001` + uint256 gas) for `extraOptions` — Type 3 requires ULN config not set on testnets
- **LZ Scan API doesn't index small testnet projects** — verify delivery on-chain via `OFTSent`/`OFTReceived` events
- Always call `quoteSend()` before `send()` — the native fee must be passed as `msg.value`
- `VITE_` env vars are baked into JS at build time — use a backend proxy for mainnet RPCs
- DVN addresses must be **sorted ascending** in the config array

## Blog Post

Detailed code walkthrough: [Building a Cross-Chain Token Bridge with LayerZero V2](https://cryptocj.org/posts/building-cross-chain-bridge-layerzero-v2/)

## License

MIT
