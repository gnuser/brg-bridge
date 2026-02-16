// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.22;

import { Test } from "forge-std/Test.sol";
import { BridgeToken } from "../../src/BridgeToken.sol";

contract BridgeTokenTest is Test {
    BridgeToken public token;
    address public owner = address(0x1);
    address public user = address(0x2);

    function setUp() public {
        token = new BridgeToken(owner);
    }

    function test_name() public view {
        assertEq(token.name(), "BridgeToken");
    }

    function test_symbol() public view {
        assertEq(token.symbol(), "BRG");
    }

    function test_decimals() public view {
        assertEq(token.decimals(), 18);
    }

    function test_initial_supply() public view {
        assertEq(token.totalSupply(), 1_000_000 * 10 ** 18);
    }

    function test_initial_balance() public view {
        assertEq(token.balanceOf(owner), 1_000_000 * 10 ** 18);
    }

    function test_transfer() public {
        uint256 amount = 100 * 10 ** 18;
        vm.prank(owner);
        token.transfer(user, amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(token.balanceOf(owner), 1_000_000 * 10 ** 18 - amount);
    }

    function test_approve_and_transferFrom() public {
        uint256 amount = 50 * 10 ** 18;
        vm.prank(owner);
        token.approve(user, amount);
        assertEq(token.allowance(owner, user), amount);

        vm.prank(user);
        token.transferFrom(owner, user, amount);
        assertEq(token.balanceOf(user), amount);
    }

    function test_transfer_exceeds_balance_reverts() public {
        vm.prank(user);
        vm.expectRevert();
        token.transfer(owner, 1);
    }

    function test_owner() public view {
        assertEq(token.owner(), owner);
    }

    // ── Faucet Tests ──────────────────────────────────────────────────

    function test_faucet_amount_constant() public view {
        assertEq(token.FAUCET_AMOUNT(), 1_000 * 10 ** 18);
    }

    function test_faucet_mints_1000_tokens() public {
        uint256 balanceBefore = token.balanceOf(user);
        vm.prank(user);
        token.faucet();
        assertEq(token.balanceOf(user), balanceBefore + 1_000 * 10 ** 18);
    }

    function test_faucet_increases_total_supply() public {
        uint256 supplyBefore = token.totalSupply();
        vm.prank(user);
        token.faucet();
        assertEq(token.totalSupply(), supplyBefore + 1_000 * 10 ** 18);
    }

    function test_faucet_multiple_calls() public {
        vm.startPrank(user);
        token.faucet();
        token.faucet();
        token.faucet();
        vm.stopPrank();
        assertEq(token.balanceOf(user), 3_000 * 10 ** 18);
    }

    function test_faucet_any_address_can_call() public {
        address alice = address(0x10);
        address bob = address(0x20);

        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), 1_000 * 10 ** 18);

        vm.prank(bob);
        token.faucet();
        assertEq(token.balanceOf(bob), 1_000 * 10 ** 18);
    }

    function test_faucet_does_not_affect_owner_balance() public {
        uint256 ownerBalanceBefore = token.balanceOf(owner);
        vm.prank(user);
        token.faucet();
        assertEq(token.balanceOf(owner), ownerBalanceBefore);
    }

    function test_faucet_emits_transfer_event() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), user, 1_000 * 10 ** 18);
        vm.prank(user);
        token.faucet();
    }

    // Event declaration for expectEmit
    event Transfer(address indexed from, address indexed to, uint256 value);
}
