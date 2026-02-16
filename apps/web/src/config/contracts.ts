// ============================================================================
// CONTRACT ADDRESSES — Deployed to testnet 2026-02-14
// ============================================================================

const isTestnet = import.meta.env.VITE_NETWORK_MODE === 'testnet';

// Bridge contract addresses per chain (OFTAdapter on ETH, OFT on L2s)
export const BRIDGE_CONTRACTS: Record<number, `0x${string}`> = isTestnet
  ? {
      // ── Testnet (Sepolia + L2 testnets) — deployed 2026-02-14 ──
      11155111: '0xECC80fc532b80F0Fa9D160F90921EE7b94374e16', // Sepolia: BridgeOFTAdapter (v2 for faucet token)
      421614: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', // Arb Sepolia: BridgeOFT
      84532: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', // Base Sepolia: BridgeOFT
      11155420: '0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9', // Opt Sepolia: BridgeOFT
    }
  : {
      // ── Mainnet — deploy when ready ──
      1: '0x0000000000000000000000000000000000000000', // Ethereum: BridgeOFTAdapter
      42161: '0x0000000000000000000000000000000000000000', // Arbitrum: BridgeOFT
      8453: '0x0000000000000000000000000000000000000000', // Base: BridgeOFT
      10: '0x0000000000000000000000000000000000000000', // Optimism: BridgeOFT
    };

// BridgeToken ERC20 address (Ethereum only — used for approval on adapter chain + faucet)
export const TOKEN_ADDRESS: `0x${string}` = isTestnet
  ? '0x2F774239ca92404C3Cf9D2363a2e2624Af19dA60' // Sepolia: BridgeToken (v2 with faucet)
  : '0x0000000000000000000000000000000000000000'; // Mainnet: BridgeToken — deploy when ready

// ============================================================================
// ABIs — these are stable and don't need updating after deployment
// ============================================================================

// Minimal ERC20 ABI for balance, allowance, and approve
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

// Minimal faucet ABI for testnet minting
export const FAUCET_ABI = [
  {
    type: 'function',
    name: 'faucet',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

// Minimal OFT/OFTAdapter ABI for balanceOf, send, and quoteSend
export const OFT_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'send',
    inputs: [
      {
        name: '_sendParam',
        type: 'tuple',
        components: [
          { name: 'dstEid', type: 'uint32' },
          { name: 'to', type: 'bytes32' },
          { name: 'amountLD', type: 'uint256' },
          { name: 'minAmountLD', type: 'uint256' },
          { name: 'extraOptions', type: 'bytes' },
          { name: 'composeMsg', type: 'bytes' },
          { name: 'oftCmd', type: 'bytes' },
        ],
      },
      {
        name: '_fee',
        type: 'tuple',
        components: [
          { name: 'nativeFee', type: 'uint256' },
          { name: 'lzTokenFee', type: 'uint256' },
        ],
      },
      { name: '_refundAddress', type: 'address' },
    ],
    outputs: [
      {
        name: 'receipt',
        type: 'tuple',
        components: [
          { name: 'guid', type: 'bytes32' },
          { name: 'nonce', type: 'uint64' },
          {
            name: 'fee',
            type: 'tuple',
            components: [
              { name: 'nativeFee', type: 'uint256' },
              { name: 'lzTokenFee', type: 'uint256' },
            ],
          },
        ],
      },
      {
        name: 'oftReceipt',
        type: 'tuple',
        components: [
          { name: 'amountSentLD', type: 'uint256' },
          { name: 'amountReceivedLD', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'quoteSend',
    inputs: [
      {
        name: '_sendParam',
        type: 'tuple',
        components: [
          { name: 'dstEid', type: 'uint32' },
          { name: 'to', type: 'bytes32' },
          { name: 'amountLD', type: 'uint256' },
          { name: 'minAmountLD', type: 'uint256' },
          { name: 'extraOptions', type: 'bytes' },
          { name: 'composeMsg', type: 'bytes' },
          { name: 'oftCmd', type: 'bytes' },
        ],
      },
      { name: '_payInLzToken', type: 'bool' },
    ],
    outputs: [
      {
        name: 'fee',
        type: 'tuple',
        components: [
          { name: 'nativeFee', type: 'uint256' },
          { name: 'lzTokenFee', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;
