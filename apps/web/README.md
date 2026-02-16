# Bridge Frontend

React + Vite frontend for the BRG cross-chain token bridge. Supports bridging between Ethereum, Arbitrum, Base, and Optimism via LayerZero V2.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Type-check
npx tsc --noEmit

# Lint
npx eslint src/

# Format check
npx prettier --check "src/**/*.{ts,tsx}"
```

## Configuration

### 1. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | Get from https://cloud.walletconnect.com |
| `VITE_NETWORK_MODE` | Yes | `testnet` or `mainnet` |
| `VITE_RPC_ETHEREUM` | No | Custom RPC for Ethereum/Sepolia |
| `VITE_RPC_ARBITRUM` | No | Custom RPC for Arbitrum |
| `VITE_RPC_BASE` | No | Custom RPC for Base |
| `VITE_RPC_OPTIMISM` | No | Custom RPC for Optimism |

### 2. Contract Addresses (After Deployment)

After deploying contracts, update `src/config/contracts.ts` with the real deployed addresses:

```typescript
// Replace the 0x000...000 placeholders with actual deployed addresses

// BRIDGE_CONTRACTS — testnet section:
11155111: '0x<YOUR_SEPOLIA_ADAPTER>',     // Sepolia BridgeOFTAdapter
421614:   '0x<YOUR_ARB_SEPOLIA_OFT>',     // Arbitrum Sepolia BridgeOFT
84532:    '0x<YOUR_BASE_SEPOLIA_OFT>',    // Base Sepolia BridgeOFT
11155420: '0x<YOUR_OPT_SEPOLIA_OFT>',     // Optimism Sepolia BridgeOFT

// TOKEN_ADDRESS — testnet:
'0x<YOUR_SEPOLIA_BRIDGETOKEN>'            // Sepolia BridgeToken ERC20
```

The contract addresses come from the Hardhat deploy output. See `contracts/README.md` for deploy instructions.

### 3. Chain IDs Reference

| Network | Chain ID | Contract |
|---------|----------|----------|
| Sepolia | 11155111 | BridgeOFTAdapter |
| Arb Sepolia | 421614 | BridgeOFT |
| Base Sepolia | 84532 | BridgeOFT |
| Opt Sepolia | 11155420 | BridgeOFT |
| Ethereum | 1 | BridgeOFTAdapter |
| Arbitrum | 42161 | BridgeOFT |
| Base | 8453 | BridgeOFT |
| Optimism | 10 | BridgeOFT |

## Deploy to IPFS

```bash
# Build production bundle
npm run build

# Option A: Fleek CLI
npx fleek sites deploy --out dist/

# Option B: Pinata
# Upload the dist/ folder via https://app.pinata.cloud

# Option C: web3.storage
# Upload via https://web3.storage
```

## Project Structure

```
src/
├── components/
│   ├── balance/          MultiChainBalance — shows BRG across 4 chains
│   ├── bridge/           BridgeForm, ChainSelector, AmountInput, FeeQuote, BridgeButton
│   ├── layout/           Header, Footer
│   ├── tracking/         TxTracker (live status), TxHistory (localStorage)
│   └── wallet/           ConnectButton
├── config/
│   ├── chains.ts         Supported chains with LZ endpoint IDs
│   ├── contracts.ts      Contract addresses + ABIs (UPDATE AFTER DEPLOY)
│   └── wagmi.ts          wagmi v2 configuration
├── hooks/
│   ├── useMultiChainBalances.ts   Batch balanceOf across 4 chains
│   ├── useQuote.ts                quoteSend fee estimation
│   ├── useTokenAllowance.ts       ERC20 allowance check
│   ├── useApproveToken.ts         ERC20 approve tx
│   ├── useBridge.ts               Execute bridge (send tx)
│   └── useTxTracking.ts           Poll LayerZero Scan API for status
├── lib/
│   ├── layerzero.ts       LZ options encoding, address utils, scan URLs
│   ├── format.ts          Number/address formatting helpers
│   └── storage.ts         localStorage CRUD for tx history
├── types/
│   └── bridge.ts          TypeScript types for the bridge domain
├── App.tsx                Root layout
├── main.tsx               React entry point
└── index.css              Tailwind base styles
```

## Tech Stack

- **React 18** + **TypeScript 5**
- **Vite 5** — build tool
- **wagmi v2** + **viem v2** — Ethereum interaction
- **TanStack Query** — async state management
- **Tailwind CSS** — styling
- **WalletConnect v2** — wallet connection
