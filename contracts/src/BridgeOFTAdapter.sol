// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFTAdapter } from "@layerzerolabs/oft-evm/contracts/OFTAdapter.sol";

/// @title BridgeOFTAdapter
/// @notice Locks BRG tokens on Ethereum when bridging out, unlocks when bridging back.
/// @dev Deployed ONLY on Ethereum (home chain). Wraps the existing BridgeToken ERC20.
contract BridgeOFTAdapter is OFTAdapter {
    /// @notice Deploy the OFTAdapter for BridgeToken on Ethereum.
    /// @param _token Address of the BridgeToken ERC20 contract to wrap.
    /// @param _lzEndpoint Address of the LayerZero EndpointV2 on Ethereum.
    /// @param _delegate Address that receives OApp ownership and LayerZero delegate rights.
    constructor(address _token, address _lzEndpoint, address _delegate)
        OFTAdapter(_token, _lzEndpoint, _delegate)
        Ownable(_delegate)
    { }
}
