#!/bin/bash
set -euo pipefail

# Load private key
source .env

# Contract addresses
ADAPTER="0xE13fe9644FFE15Fad35f22B5c9E9E86e2133e21c"  # Sepolia OFTAdapter
ARB_OFT="0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9"   # Arb Sepolia OFT
BASE_OFT="0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9"  # Base Sepolia OFT
OPT_OFT="0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9"   # Opt Sepolia OFT

# Testnet EIDs
EID_SEPOLIA=40161
EID_ARB=40231
EID_BASE=40245
EID_OPT=40232

# RPC URLs
RPC_SEP="${RPC_SEPOLIA:-https://ethereum-sepolia-rpc.publicnode.com}"
RPC_ARB="${RPC_ARBITRUM_SEPOLIA:-https://sepolia-rollup.arbitrum.io/rpc}"
RPC_BASE="${RPC_BASE_SEPOLIA:-https://sepolia.base.org}"
RPC_OPT="${RPC_OPTIMISM_SEPOLIA:-https://sepolia.optimism.io}"

# Convert address to bytes32
to_bytes32() {
    echo "0x000000000000000000000000${1:2}"
}

ADAPTER_B32=$(to_bytes32 "$ADAPTER")
ARB_OFT_B32=$(to_bytes32 "$ARB_OFT")
BASE_OFT_B32=$(to_bytes32 "$BASE_OFT")
OPT_OFT_B32=$(to_bytes32 "$OPT_OFT")

SIG="setPeer(uint32,bytes32)"

echo "=== Wiring Sepolia OFTAdapter ==="
echo "  → setPeer(ARB=$EID_ARB)"
cast send "$ADAPTER" "$SIG" "$EID_ARB" "$ARB_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_SEP"
echo "  → setPeer(BASE=$EID_BASE)"
cast send "$ADAPTER" "$SIG" "$EID_BASE" "$BASE_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_SEP"
echo "  → setPeer(OPT=$EID_OPT)"
cast send "$ADAPTER" "$SIG" "$EID_OPT" "$OPT_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_SEP"

echo ""
echo "=== Wiring Arbitrum Sepolia OFT ==="
echo "  → setPeer(SEP=$EID_SEPOLIA)"
cast send "$ARB_OFT" "$SIG" "$EID_SEPOLIA" "$ADAPTER_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_ARB"
echo "  → setPeer(BASE=$EID_BASE)"
cast send "$ARB_OFT" "$SIG" "$EID_BASE" "$BASE_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_ARB"
echo "  → setPeer(OPT=$EID_OPT)"
cast send "$ARB_OFT" "$SIG" "$EID_OPT" "$OPT_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_ARB"

echo ""
echo "=== Wiring Base Sepolia OFT ==="
echo "  → setPeer(SEP=$EID_SEPOLIA)"
cast send "$BASE_OFT" "$SIG" "$EID_SEPOLIA" "$ADAPTER_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_BASE"
echo "  → setPeer(ARB=$EID_ARB)"
cast send "$BASE_OFT" "$SIG" "$EID_ARB" "$ARB_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_BASE"
echo "  → setPeer(OPT=$EID_OPT)"
cast send "$BASE_OFT" "$SIG" "$EID_OPT" "$OPT_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_BASE"

echo ""
echo "=== Wiring Optimism Sepolia OFT ==="
echo "  → setPeer(SEP=$EID_SEPOLIA)"
cast send "$OPT_OFT" "$SIG" "$EID_SEPOLIA" "$ADAPTER_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_OPT"
echo "  → setPeer(ARB=$EID_ARB)"
cast send "$OPT_OFT" "$SIG" "$EID_ARB" "$ARB_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_OPT"
echo "  → setPeer(BASE=$EID_BASE)"
cast send "$OPT_OFT" "$SIG" "$EID_BASE" "$BASE_OFT_B32" --private-key "$PRIVATE_KEY" --rpc-url "$RPC_OPT"

echo ""
echo "=== All 12 pathways wired ==="
