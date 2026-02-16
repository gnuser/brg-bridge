// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Script, console } from "forge-std/Script.sol";
import { BridgeToken } from "../src/BridgeToken.sol";

/// @title Deploy BridgeToken with faucet function
/// @notice Deploys a new BridgeToken to the current chain. Use for Sepolia testnet.
/// @dev Run: source .env && forge script script/DeployBridgeToken.s.sol \
///          --rpc-url $RPC_SEPOLIA --broadcast --private-key 0x$PRIVATE_KEY
contract DeployBridgeToken is Script {
    function run() external {
        address deployer = msg.sender;

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast();

        BridgeToken token = new BridgeToken(deployer);

        vm.stopBroadcast();

        console.log("BridgeToken deployed at:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Initial supply:", token.totalSupply());
        console.log("FAUCET_AMOUNT:", token.FAUCET_AMOUNT());
    }
}
