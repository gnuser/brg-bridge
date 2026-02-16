// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";

/// @title Wire peers between BridgeOFTAdapter (Sepolia) and BridgeOFTs (L2 testnets)
/// @notice Sets the adapter's peers to L2 OFTs. Run separately per chain.
/// @dev Usage:
///   Sepolia (set 3 L2 peers on adapter):
///     forge script script/WirePeers.s.sol:WireAdapterPeers --rpc-url $RPC_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY
///   Arb Sepolia (update adapter peer on OFT):
///     forge script script/WirePeers.s.sol:WireArbPeer --rpc-url $RPC_ARBITRUM_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY
///   Base Sepolia:
///     forge script script/WirePeers.s.sol:WireBasePeer --rpc-url $RPC_BASE_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY
///   Opt Sepolia:
///     forge script script/WirePeers.s.sol:WireOptPeer --rpc-url $RPC_OPTIMISM_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY

interface IOApp {
    function setPeer(uint32 _eid, bytes32 _peer) external;
}

// ── Addresses ──────────────────────────────────────────────────────
// New BridgeOFTAdapter on Sepolia (references new BridgeToken with faucet)
address constant ADAPTER = 0xECC80fc532b80F0Fa9D160F90921EE7b94374e16;
// BridgeOFT on all L2 testnets (unchanged)
address constant OFT_L2 = 0x4dBBdC8CE1267c170E5aB37831cdC9870f386Dc9;

// ── LayerZero Endpoint IDs (testnet) ───────────────────────────────
uint32 constant EID_SEPOLIA = 40161;
uint32 constant EID_ARB_SEPOLIA = 40231;
uint32 constant EID_BASE_SEPOLIA = 40245;
uint32 constant EID_OPT_SEPOLIA = 40232;

/// @notice Helper: convert address to bytes32 (left-padded)
function addressToBytes32(address _addr) pure returns (bytes32) {
    return bytes32(uint256(uint160(_addr)));
}

/// @notice Set all 3 L2 peers on the new Sepolia adapter
contract WireAdapterPeers is Script {
    function run() external {
        vm.startBroadcast();

        bytes32 oftPeer = addressToBytes32(OFT_L2);

        IOApp(ADAPTER).setPeer(EID_ARB_SEPOLIA, oftPeer);
        console.log("Set peer: Adapter -> Arb Sepolia");

        IOApp(ADAPTER).setPeer(EID_BASE_SEPOLIA, oftPeer);
        console.log("Set peer: Adapter -> Base Sepolia");

        IOApp(ADAPTER).setPeer(EID_OPT_SEPOLIA, oftPeer);
        console.log("Set peer: Adapter -> Opt Sepolia");

        vm.stopBroadcast();
    }
}

/// @notice Update Arb Sepolia OFT to recognize new adapter
contract WireArbPeer is Script {
    function run() external {
        vm.startBroadcast();
        IOApp(OFT_L2).setPeer(EID_SEPOLIA, addressToBytes32(ADAPTER));
        console.log("Set peer: Arb OFT -> new Sepolia Adapter");
        vm.stopBroadcast();
    }
}

/// @notice Update Base Sepolia OFT to recognize new adapter
contract WireBasePeer is Script {
    function run() external {
        vm.startBroadcast();
        IOApp(OFT_L2).setPeer(EID_SEPOLIA, addressToBytes32(ADAPTER));
        console.log("Set peer: Base OFT -> new Sepolia Adapter");
        vm.stopBroadcast();
    }
}

/// @notice Update Opt Sepolia OFT to recognize new adapter
contract WireOptPeer is Script {
    function run() external {
        vm.startBroadcast();
        IOApp(OFT_L2).setPeer(EID_SEPOLIA, addressToBytes32(ADAPTER));
        console.log("Set peer: Opt OFT -> new Sepolia Adapter");
        vm.stopBroadcast();
    }
}
