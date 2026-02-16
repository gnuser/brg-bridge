// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

/// @title BridgeOFT
/// @notice Burn/mint synthetic BRG on remote chains (Arbitrum, Base, Optimism).
/// @dev Tokens are minted when receiving cross-chain messages, burned when sending.
///      No initial supply — tokens only exist when bridged from Ethereum.
contract BridgeOFT is OFT {
    /// @notice Deploy a BridgeOFT instance on a remote chain.
    /// @param _name Token name (should match "BridgeToken" for consistency).
    /// @param _symbol Token symbol (should match "BRG" for consistency).
    /// @param _lzEndpoint Address of the LayerZero EndpointV2 on this chain.
    /// @param _delegate Address that receives OApp ownership and LayerZero delegate rights.
    constructor(string memory _name, string memory _symbol, address _lzEndpoint, address _delegate)
        OFT(_name, _symbol, _lzEndpoint, _delegate)
        Ownable(_delegate)
    { }
}
