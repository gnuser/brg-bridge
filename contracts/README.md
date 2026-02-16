# Bridge Contracts

Cross-chain token bridge using LayerZero V2 OFT standard. Enables BRG token bridging between Ethereum, Arbitrum, Base, and Optimism.

## Architecture

```
Ethereum (Home Chain)         L2 Chains (Arbitrum, Base, Optimism)
┌─────────────────┐          ┌─────────────────┐
│  BridgeToken    │          │   BridgeOFT      │
│  (ERC20 - BRG)  │          │   (burn/mint)    │
└────────┬────────┘          └────────┬─────────┘
         │                            │
┌────────┴────────┐                   │
│ BridgeOFTAdapter│ ◄── LayerZero ──► │
│  (lock/unlock)  │     EndpointV2    │
└─────────────────┘                   │
```

- **BridgeToken.sol** — Standard ERC20 (1M supply, 18 decimals). Deployed on Ethereum only.
- **BridgeOFTAdapter.sol** — Locks BRG when bridging out, unlocks when bridging back. Deployed on Ethereum only.
- **BridgeOFT.sol** — Mints synthetic BRG when receiving, burns when sending. Deployed on each L2.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build with Foundry
forge build

# Run tests (17 tests: 9 unit + 8 cross-chain integration)
forge test -vvv

# Check formatting
forge fmt --check

# Run coverage
forge coverage --ir-minimum

# Run Slither
slither src/ --filter-paths "node_modules|lib"
```

## Deploy

### 1. Configure Environment

```bash
cp .env.example .env
# Set PRIVATE_KEY (without 0x prefix)
# Set RPC URLs (optional, defaults to public RPCs)
```

### 2. Deploy Contracts

```bash
# Ethereum / Sepolia: BridgeToken + BridgeOFTAdapter
npx hardhat lz:deploy --network sepolia --tags BridgeToken,BridgeOFTAdapter

# Arbitrum Sepolia: BridgeOFT
npx hardhat lz:deploy --network arbitrum-sepolia --tags BridgeOFT

# Base Sepolia: BridgeOFT
npx hardhat lz:deploy --network base-sepolia --tags BridgeOFT

# Optimism Sepolia: BridgeOFT
npx hardhat lz:deploy --network optimism-sepolia --tags BridgeOFT
```

### 3. Wire Peers (12 Pathways)

```bash
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

### 4. Verify Configuration

```bash
npx hardhat lz:oapp:config:get --oapp-config layerzero.config.ts
```

## DVN Configuration

| DVN | Address | Role |
|-----|---------|------|
| LayerZero Labs | `0x589dEDbD617F7E266a090e916B2a37dDc4e3b0C4` | Required |
| Google Cloud | `0xD56e4eAb23cb81f43168F9F45211Eb027b9aC7cc` | Required |

Confirmations: 15 blocks (Ethereum), 5 blocks (L2s).

## Networks

| Network | Hardhat Name | LZ Endpoint ID |
|---------|-------------|----------------|
| Sepolia | `sepolia` | `SEPOLIA_V2_TESTNET` |
| Arb Sepolia | `arbitrum-sepolia` | `ARBSEP_V2_TESTNET` |
| Base Sepolia | `base-sepolia` | `BASESEP_V2_TESTNET` |
| Opt Sepolia | `optimism-sepolia` | `OPTSEP_V2_TESTNET` |
| Ethereum | `ethereum` | `ETHEREUM_V2_MAINNET` |
| Arbitrum | `arbitrum` | `ARBITRUM_V2_MAINNET` |
| Base | `base` | `BASE_V2_MAINNET` |
| Optimism | `optimism` | `OPTIMISM_V2_MAINNET` |

## Key Addresses

- **LayerZero EndpointV2** (all chains): `0x1a44076050125825900e736c501f859c50fE728c`
