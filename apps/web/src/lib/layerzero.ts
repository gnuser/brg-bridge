import { pad, type Address } from 'viem';

// Build extraOptions for LZ send: 200k gas for lzReceive execution
// Manual encoding since we may not have the TS Options builder available
// Format: executorLzReceiveOption type 1, gas 200000, value 0
export function buildLzReceiveOptions(gasLimit = 200_000n): `0x${string}` {
  // Legacy options type 1: TYPE_1(uint16) + executionGas(uint256)
  const optionsType = '0001';
  const gas = gasLimit.toString(16).padStart(64, '0');

  return `0x${optionsType}${gas}` as `0x${string}`;
}

// Encode address to bytes32 for LayerZero peer format
export function addressToBytes32(address: Address): `0x${string}` {
  return pad(address, { size: 32 });
}

// LayerZero Scan URLs
export function getLzScanUrl(txHash: string, isTestnet = true): string {
  const base = isTestnet ? 'https://testnet.layerzeroscan.com' : 'https://layerzeroscan.com';
  return `${base}/tx/${txHash}`;
}

export function getLzScanApiUrl(txHash: string, _isTestnet = true): string {
  return `https://scan.layerzero-api.com/v1/messages/tx/${txHash}`;
}
