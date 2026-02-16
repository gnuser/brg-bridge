// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";
import { BridgeOFTAdapter } from "../src/BridgeOFTAdapter.sol";

/// @title Deploy BridgeOFTAdapter pointing to the new BridgeToken (with faucet)
/// @notice Deploys a new OFTAdapter on Sepolia referencing the updated BridgeToken.
/// @dev Run: source .env && forge script script/DeployBridgeOFTAdapter.s.sol \
///          --rpc-url $RPC_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY
contract DeployBridgeOFTAdapter is Script {
    // New BridgeToken with faucet (deployed on Sepolia)
    address constant BRIDGE_TOKEN = 0x2F774239ca92404C3Cf9D2363a2e2624Af19dA60;
    // LayerZero EndpointV2 on Sepolia
    address constant LZ_ENDPOINT = 0x6EDCE65403992e310A62460808c4b910D972f10f;

    function run() external {
        address deployer = msg.sender;

        console.log("Deployer:", deployer);
        console.log("BridgeToken:", BRIDGE_TOKEN);
        console.log("LZ Endpoint:", LZ_ENDPOINT);

        vm.startBroadcast();

        BridgeOFTAdapter adapter = new BridgeOFTAdapter(BRIDGE_TOKEN, LZ_ENDPOINT, deployer);

        vm.stopBroadcast();

        console.log("BridgeOFTAdapter deployed at:", address(adapter));
    }
}
