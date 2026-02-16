// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Test } from "forge-std/Test.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";
import { MessagingFee } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { SendParam } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { TestHelperOz5 } from "@layerzerolabs/test-devtools-evm-foundry/contracts/TestHelperOz5.sol";

import { BridgeToken } from "../../src/BridgeToken.sol";
import { BridgeOFTAdapter } from "../../src/BridgeOFTAdapter.sol";
import { BridgeOFT } from "../../src/BridgeOFT.sol";

contract CrossChainBridgeTest is TestHelperOz5 {
    using OptionsBuilder for bytes;

    // Endpoint IDs for 4 simulated chains
    uint32 constant ETH_EID = 1;
    uint32 constant ARB_EID = 2;
    uint32 constant BASE_EID = 3;
    uint32 constant OPT_EID = 4;

    // Contracts
    BridgeToken public token;
    BridgeOFTAdapter public adapter;
    BridgeOFT public arbOft;
    BridgeOFT public baseOft;
    BridgeOFT public optOft;

    // Users
    address public deployer = address(this);
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    uint256 constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;
    uint256 constant BRIDGE_AMOUNT = 100 * 10 ** 18;

    function setUp() public override {
        super.setUp();

        // Set up 4 mock LayerZero endpoints
        setUpEndpoints(4, LibraryType.UltraLightNode);

        // Deploy BridgeToken on "Ethereum" (endpoint 1)
        token = new BridgeToken(deployer);

        // Deploy OFTAdapter on "Ethereum"
        adapter = BridgeOFTAdapter(
            _deployOApp(
                type(BridgeOFTAdapter).creationCode, abi.encode(address(token), address(endpoints[ETH_EID]), deployer)
            )
        );

        // Deploy OFT on "Arbitrum"
        arbOft = BridgeOFT(
            _deployOApp(
                type(BridgeOFT).creationCode, abi.encode("BridgeToken", "BRG", address(endpoints[ARB_EID]), deployer)
            )
        );

        // Deploy OFT on "Base"
        baseOft = BridgeOFT(
            _deployOApp(
                type(BridgeOFT).creationCode, abi.encode("BridgeToken", "BRG", address(endpoints[BASE_EID]), deployer)
            )
        );

        // Deploy OFT on "Optimism"
        optOft = BridgeOFT(
            _deployOApp(
                type(BridgeOFT).creationCode, abi.encode("BridgeToken", "BRG", address(endpoints[OPT_EID]), deployer)
            )
        );

        // Wire all 4 contracts together (sets peers for all 12 pathways)
        address[] memory oapps = new address[](4);
        oapps[0] = address(adapter);
        oapps[1] = address(arbOft);
        oapps[2] = address(baseOft);
        oapps[3] = address(optOft);
        this.wireOApps(oapps);

        // Fund Alice with ETH for gas/fees and BRG tokens
        vm.deal(alice, 100 ether);
        token.transfer(alice, BRIDGE_AMOUNT * 5);
        vm.prank(alice);
        token.approve(address(adapter), type(uint256).max);
    }

    // ── Helper ──

    function _buildOptions() internal pure returns (bytes memory) {
        return OptionsBuilder.newOptions().addExecutorLzReceiveOption(200_000, 0);
    }

    function _buildSendParam(uint32 dstEid, address to, uint256 amount) internal pure returns (SendParam memory) {
        return SendParam({
            dstEid: dstEid,
            to: bytes32(uint256(uint160(to))),
            amountLD: amount,
            minAmountLD: amount,
            extraOptions: _buildOptions(),
            composeMsg: "",
            oftCmd: ""
        });
    }

    // ── Tests ──

    function test_bridge_eth_to_arb() public {
        SendParam memory sendParam = _buildSendParam(ARB_EID, alice, BRIDGE_AMOUNT);
        MessagingFee memory fee = adapter.quoteSend(sendParam, false);

        uint256 tokenBefore = token.balanceOf(alice);

        vm.prank(alice);
        adapter.send{ value: fee.nativeFee }(sendParam, fee, payable(alice));

        // Tokens locked in adapter
        assertEq(token.balanceOf(alice), tokenBefore - BRIDGE_AMOUNT);
        assertEq(token.balanceOf(address(adapter)), BRIDGE_AMOUNT);

        // Simulate DVN verification + delivery
        verifyPackets(ARB_EID, addressToBytes32(address(arbOft)));

        // Tokens minted on Arbitrum
        assertEq(arbOft.balanceOf(alice), BRIDGE_AMOUNT);
    }

    function test_bridge_arb_to_eth() public {
        // First bridge to Arbitrum
        _bridgeToArb(alice, BRIDGE_AMOUNT);

        // Now bridge back to Ethereum
        SendParam memory sendParam = _buildSendParam(ETH_EID, alice, BRIDGE_AMOUNT);
        MessagingFee memory fee = arbOft.quoteSend(sendParam, false);

        vm.prank(alice);
        arbOft.send{ value: fee.nativeFee }(sendParam, fee, payable(alice));

        // Tokens burned on Arbitrum
        assertEq(arbOft.balanceOf(alice), 0);

        // Simulate delivery back to Ethereum
        verifyPackets(ETH_EID, addressToBytes32(address(adapter)));

        // Tokens unlocked on Ethereum
        assertEq(token.balanceOf(alice), BRIDGE_AMOUNT * 5); // Back to original
    }

    function test_bridge_l2_to_l2() public {
        // Bridge ETH → ARB first
        _bridgeToArb(alice, BRIDGE_AMOUNT);

        // Bridge ARB → BASE (L2 to L2, no Ethereum hop)
        SendParam memory sendParam = _buildSendParam(BASE_EID, alice, BRIDGE_AMOUNT);
        MessagingFee memory fee = arbOft.quoteSend(sendParam, false);

        vm.prank(alice);
        arbOft.send{ value: fee.nativeFee }(sendParam, fee, payable(alice));

        assertEq(arbOft.balanceOf(alice), 0);

        verifyPackets(BASE_EID, addressToBytes32(address(baseOft)));

        assertEq(baseOft.balanceOf(alice), BRIDGE_AMOUNT);
    }

    function test_bridge_roundtrip() public {
        // ETH → ARB
        _bridgeToArb(alice, BRIDGE_AMOUNT);
        assertEq(arbOft.balanceOf(alice), BRIDGE_AMOUNT);

        // ARB → BASE
        _bridgeFromOft(arbOft, BASE_EID, baseOft, alice, BRIDGE_AMOUNT);
        assertEq(baseOft.balanceOf(alice), BRIDGE_AMOUNT);
        assertEq(arbOft.balanceOf(alice), 0);

        // BASE → OPT
        _bridgeFromOft(baseOft, OPT_EID, optOft, alice, BRIDGE_AMOUNT);
        assertEq(optOft.balanceOf(alice), BRIDGE_AMOUNT);
        assertEq(baseOft.balanceOf(alice), 0);

        // OPT → ETH
        SendParam memory sendParam = _buildSendParam(ETH_EID, alice, BRIDGE_AMOUNT);
        MessagingFee memory fee = optOft.quoteSend(sendParam, false);
        vm.prank(alice);
        optOft.send{ value: fee.nativeFee }(sendParam, fee, payable(alice));
        verifyPackets(ETH_EID, addressToBytes32(address(adapter)));

        // Back on Ethereum with original balance
        assertEq(token.balanceOf(alice), BRIDGE_AMOUNT * 5);
        assertEq(optOft.balanceOf(alice), 0);
    }

    function test_bridge_preserves_total_supply() public {
        _bridgeToArb(alice, BRIDGE_AMOUNT);

        // Total supply should still be 1M (locked in adapter + rest with deployer/alice)
        uint256 ethSupply = token.totalSupply();
        uint256 arbSupply = arbOft.totalSupply();

        // All minted OFT tokens should equal tokens locked in adapter
        assertEq(arbSupply, token.balanceOf(address(adapter)));
        assertEq(ethSupply, INITIAL_SUPPLY); // ERC20 supply unchanged
    }

    function test_quote_returns_nonzero_fee() public view {
        SendParam memory sendParam = _buildSendParam(ARB_EID, alice, BRIDGE_AMOUNT);
        MessagingFee memory fee = adapter.quoteSend(sendParam, false);
        assertGt(fee.nativeFee, 0);
    }

    function test_bridge_exceeds_balance_reverts() public {
        uint256 tooMuch = BRIDGE_AMOUNT * 100; // More than Alice has
        SendParam memory sendParam = _buildSendParam(ARB_EID, alice, tooMuch);

        // Alice doesn't have enough BRG tokens, send should revert
        vm.prank(alice);
        vm.expectRevert();
        adapter.send{ value: 1 ether }(sendParam, MessagingFee(1 ether, 0), payable(alice));
    }

    function test_only_owner_can_set_peer() public {
        vm.prank(alice);
        vm.expectRevert();
        adapter.setPeer(ARB_EID, bytes32(uint256(uint160(address(arbOft)))));
    }

    // ── Internal Helpers ──

    function _bridgeToArb(address user, uint256 amount) internal {
        SendParam memory sendParam = _buildSendParam(ARB_EID, user, amount);
        MessagingFee memory fee = adapter.quoteSend(sendParam, false);
        vm.prank(user);
        adapter.send{ value: fee.nativeFee }(sendParam, fee, payable(user));
        verifyPackets(ARB_EID, addressToBytes32(address(arbOft)));
    }

    function _bridgeFromOft(BridgeOFT fromOft, uint32 dstEid, BridgeOFT toOft, address user, uint256 amount) internal {
        SendParam memory sendParam = _buildSendParam(dstEid, user, amount);
        MessagingFee memory fee = fromOft.quoteSend(sendParam, false);
        vm.prank(user);
        fromOft.send{ value: fee.nativeFee }(sendParam, fee, payable(user));
        verifyPackets(dstEid, addressToBytes32(address(toOft)));
    }
}
