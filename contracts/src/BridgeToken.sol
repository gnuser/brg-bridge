// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BridgeToken (BRG)
/// @notice Standard ERC20 token for cross-chain bridging via LayerZero OFT.
/// @dev Deployed only on Ethereum (home chain). 1M initial supply, 18 decimals.
///      Includes a public faucet function for testnet use.
contract BridgeToken is ERC20, Ownable {
    /// @notice Maximum tokens mintable per faucet call (1000 BRG).
    uint256 public constant FAUCET_AMOUNT = 1_000 * 10 ** 18;

    /// @notice Deploy BridgeToken and mint the full initial supply to the owner.
    /// @param _initialOwner Address that receives the initial 1M BRG supply and contract ownership.
    constructor(address _initialOwner) ERC20("BridgeToken", "BRG") Ownable(_initialOwner) {
        _mint(_initialOwner, 1_000_000 * 10 ** decimals());
    }

    /// @notice Mint test tokens to the caller. Intended for testnet use only.
    /// @dev Mints exactly FAUCET_AMOUNT (1000 BRG) to msg.sender.
    ///      No access control or cooldown — any address can call repeatedly.
    ///      WARNING: Remove or restrict this function before mainnet deployment.
    function faucet() external {
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
