// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CUREToken} from "../../contracts/CUREToken.sol";

/// @title CUREToken Contract Test Suite
/// @notice Comprehensive tests for the CURE ERC20 token
/// @dev Tests cover ERC20 functionality, minting, burning, pause, and admin functions
contract CURETokenTest is Test {
    CUREToken public cureToken;
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint256 constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10 million CURE

    /// @notice Set up test environment before each test
    /// @dev Deploys CUREToken contract and creates test addresses
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        cureToken = new CUREToken();
    }

    // ========== Constructor Tests ==========

    /// @notice Test that constructor initializes contract state correctly
    function testConstructorInitialization() public view {
        assertEq(cureToken.name(), "CURE Token", "Token name should be CURE Token");
        assertEq(cureToken.symbol(), "CURE", "Token symbol should be CURE");
        assertEq(cureToken.decimals(), 18, "Decimals should be 18");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY, "Total supply should be 10 million");
        assertEq(cureToken.balanceOf(owner), INITIAL_SUPPLY, "Owner should have initial supply");
        assertEq(cureToken.owner(), owner, "Owner should be deployer");
        assertFalse(cureToken.paused(), "Contract should not be paused");
    }

    // ========== Transfer Tests ==========

    /// @notice Test successful token transfer
    function testTransfer() public {
        uint256 transferAmount = 1000 * 10**18;
        
        cureToken.transfer(user1, transferAmount);
        
        assertEq(cureToken.balanceOf(user1), transferAmount, "User1 should receive tokens");
        assertEq(cureToken.balanceOf(owner), INITIAL_SUPPLY - transferAmount, "Owner balance should decrease");
    }

    /// @notice Test transfer to zero address reverts
    function testTransferToZeroAddress() public {
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.transfer(address(0), 1000);
    }

    /// @notice Test transfer of zero amount reverts
    function testTransferZeroAmount() public {
        vm.expectRevert(CUREToken.InvalidAmount.selector);
        cureToken.transfer(user1, 0);
    }

    /// @notice Test transfer with insufficient balance reverts
    function testTransferInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert(CUREToken.InsufficientBalance.selector);
        cureToken.transfer(user2, 1000);
    }

    /// @notice Test transfer emits correct event
    function testTransferEmitsEvent() public {
        uint256 amount = 1000 * 10**18;
        
        vm.expectEmit(true, true, false, true);
        emit CUREToken.Transfer(owner, user1, amount);
        
        cureToken.transfer(user1, amount);
    }

    // ========== Approval Tests ==========

    /// @notice Test successful approval
    function testApprove() public {
        uint256 approvalAmount = 5000 * 10**18;
        
        bool success = cureToken.approve(user1, approvalAmount);
        
        assertTrue(success, "Approval should succeed");
        assertEq(cureToken.allowance(owner, user1), approvalAmount, "Allowance should be set");
    }

    /// @notice Test approve to zero address reverts
    function testApproveZeroAddress() public {
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.approve(address(0), 1000);
    }

    /// @notice Test approval emits correct event
    function testApproveEmitsEvent() public {
        uint256 amount = 5000 * 10**18;
        
        vm.expectEmit(true, true, false, true);
        emit CUREToken.Approval(owner, user1, amount);
        
        cureToken.approve(user1, amount);
    }

    // ========== TransferFrom Tests ==========

    /// @notice Test successful transferFrom
    function testTransferFrom() public {
        uint256 amount = 3000 * 10**18;
        
        // Owner approves user1 to spend tokens
        cureToken.approve(user1, amount);
        
        // User1 transfers from owner to user2
        vm.prank(user1);
        bool success = cureToken.transferFrom(owner, user2, amount);
        
        assertTrue(success, "TransferFrom should succeed");
        assertEq(cureToken.balanceOf(user2), amount, "User2 should receive tokens");
        assertEq(cureToken.balanceOf(owner), INITIAL_SUPPLY - amount, "Owner balance should decrease");
        assertEq(cureToken.allowance(owner, user1), 0, "Allowance should be consumed");
    }

    /// @notice Test transferFrom with zero address reverts
    function testTransferFromZeroAddress() public {
        cureToken.approve(user1, 1000);
        
        vm.startPrank(user1);
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.transferFrom(address(0), user2, 1000);
        vm.stopPrank();
    }

    /// @notice Test transferFrom with zero amount reverts
    function testTransferFromZeroAmount() public {
        cureToken.approve(user1, 1000);
        
        vm.prank(user1);
        vm.expectRevert(CUREToken.InvalidAmount.selector);
        cureToken.transferFrom(owner, user2, 0);
    }

    /// @notice Test transferFrom with insufficient allowance reverts
    function testTransferFromInsufficientAllowance() public {
        cureToken.approve(user1, 1000 * 10**18);
        
        vm.prank(user1);
        vm.expectRevert(CUREToken.InsufficientAllowance.selector);
        cureToken.transferFrom(owner, user2, 2000 * 10**18);
    }

    /// @notice Test transferFrom with insufficient balance reverts
    function testTransferFromInsufficientBalance() public {
        // Transfer most tokens away first
        cureToken.transfer(user2, INITIAL_SUPPLY - 100);
        
        // Approve more than what's left
        cureToken.approve(user1, 1000);
        
        vm.prank(user1);
        vm.expectRevert(CUREToken.InsufficientBalance.selector);
        cureToken.transferFrom(owner, user2, 1000);
    }

    // ========== Minting Tests ==========

    /// @notice Test owner can mint tokens
    function testMint() public {
        uint256 mintAmount = 1000 * 10**18;
        
        cureToken.mint(user1, mintAmount);
        
        assertEq(cureToken.balanceOf(user1), mintAmount, "User1 should receive minted tokens");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY + mintAmount, "Total supply should increase");
    }

    /// @notice Test non-owner cannot mint tokens
    function testMintNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(CUREToken.NotOwner.selector);
        cureToken.mint(user2, 1000);
    }

    /// @notice Test mint to zero address reverts
    function testMintZeroAddress() public {
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.mint(address(0), 1000);
    }

    /// @notice Test mint zero amount reverts
    function testMintZeroAmount() public {
        vm.expectRevert(CUREToken.InvalidAmount.selector);
        cureToken.mint(user1, 0);
    }

    /// @notice Test mint emits correct events
    function testMintEmitsEvents() public {
        uint256 amount = 1000 * 10**18;
        
        vm.expectEmit(true, false, false, true);
        emit CUREToken.Mint(user1, amount);
        
        cureToken.mint(user1, amount);
    }

    // ========== Burning Tests ==========

    /// @notice Test successful burn
    function testBurn() public {
        uint256 burnAmount = 1000 * 10**18;
        uint256 initialBalance = cureToken.balanceOf(owner);
        
        cureToken.burn(burnAmount);
        
        assertEq(cureToken.balanceOf(owner), initialBalance - burnAmount, "Balance should decrease");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY - burnAmount, "Total supply should decrease");
    }

    /// @notice Test burn zero amount reverts
    function testBurnZeroAmount() public {
        vm.expectRevert(CUREToken.InvalidAmount.selector);
        cureToken.burn(0);
    }

    /// @notice Test burn with insufficient balance reverts
    function testBurnInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert(CUREToken.InsufficientBalance.selector);
        cureToken.burn(1000);
    }

    /// @notice Test burn emits correct events
    function testBurnEmitsEvents() public {
        uint256 amount = 1000 * 10**18;
        
        vm.expectEmit(true, false, false, true);
        emit CUREToken.Burn(owner, amount);
        
        cureToken.burn(amount);
    }

    /// @notice Test successful burnFrom
    function testBurnFrom() public {
        uint256 burnAmount = 2000 * 10**18;
        
        // Owner approves user1 to burn tokens
        cureToken.approve(user1, burnAmount);
        
        vm.prank(user1);
        cureToken.burnFrom(owner, burnAmount);
        
        assertEq(cureToken.balanceOf(owner), INITIAL_SUPPLY - burnAmount, "Owner balance should decrease");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY - burnAmount, "Total supply should decrease");
        assertEq(cureToken.allowance(owner, user1), 0, "Allowance should be consumed");
    }

    /// @notice Test burnFrom with zero address reverts
    function testBurnFromZeroAddress() public {
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.burnFrom(address(0), 1000);
    }

    /// @notice Test burnFrom with insufficient allowance reverts
    function testBurnFromInsufficientAllowance() public {
        cureToken.approve(user1, 1000);
        
        vm.prank(user1);
        vm.expectRevert(CUREToken.InsufficientAllowance.selector);
        cureToken.burnFrom(owner, 2000);
    }

    // ========== Pause Tests ==========

    /// @notice Test owner can pause contract
    function testPause() public {
        cureToken.pause();
        
        assertTrue(cureToken.paused(), "Contract should be paused");
    }

    /// @notice Test non-owner cannot pause
    function testPauseNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(CUREToken.NotOwner.selector);
        cureToken.pause();
    }

    /// @notice Test pause emits event
    function testPauseEmitsEvent() public {
        vm.expectEmit(true, false, false, false);
        emit CUREToken.Paused(owner);
        
        cureToken.pause();
    }

    /// @notice Test transfer fails when paused
    function testTransferWhenPaused() public {
        cureToken.pause();
        
        vm.expectRevert(CUREToken.ContractPaused.selector);
        cureToken.transfer(user1, 1000);
    }

    /// @notice Test transferFrom fails when paused
    function testTransferFromWhenPaused() public {
        cureToken.approve(user1, 1000);
        cureToken.pause();
        
        vm.prank(user1);
        vm.expectRevert(CUREToken.ContractPaused.selector);
        cureToken.transferFrom(owner, user2, 1000);
    }

    /// @notice Test owner can unpause contract
    function testUnpause() public {
        cureToken.pause();
        cureToken.unpause();
        
        assertFalse(cureToken.paused(), "Contract should not be paused");
    }

    /// @notice Test unpause emits event
    function testUnpauseEmitsEvent() public {
        cureToken.pause();
        
        vm.expectEmit(true, false, false, false);
        emit CUREToken.Unpaused(owner);
        
        cureToken.unpause();
    }

    /// @notice Test transfer succeeds after unpause
    function testTransferAfterUnpause() public {
        cureToken.pause();
        cureToken.unpause();
        
        bool success = cureToken.transfer(user1, 1000 * 10**18);
        assertTrue(success, "Transfer should succeed after unpause");
    }

    // ========== Ownership Tests ==========

    /// @notice Test owner can transfer ownership
    function testTransferOwnership() public {
        cureToken.transferOwnership(user1);
        
        assertEq(cureToken.owner(), user1, "New owner should be user1");
    }

    /// @notice Test non-owner cannot transfer ownership
    function testTransferOwnershipNotOwner() public {
        vm.prank(user1);
        vm.expectRevert(CUREToken.NotOwner.selector);
        cureToken.transferOwnership(user2);
    }

    /// @notice Test transfer ownership to zero address reverts
    function testTransferOwnershipZeroAddress() public {
        vm.expectRevert(CUREToken.InvalidAddress.selector);
        cureToken.transferOwnership(address(0));
    }

    /// @notice Test transfer ownership emits event
    function testTransferOwnershipEmitsEvent() public {
        vm.expectEmit(true, true, false, false);
        emit CUREToken.OwnershipTransferred(owner, user1);
        
        cureToken.transferOwnership(user1);
    }

    /// @notice Test new owner has admin privileges
    function testNewOwnerHasAdminPrivileges() public {
        cureToken.transferOwnership(user1);
        
        vm.prank(user1);
        cureToken.mint(user2, 1000 * 10**18);
        
        assertEq(cureToken.balanceOf(user2), 1000 * 10**18, "New owner should be able to mint");
    }

    // ========== View Function Tests ==========

    /// @notice Test getAllowance returns correct allowance
    function testGetAllowance() public {
        uint256 amount = 5000 * 10**18;
        cureToken.approve(user1, amount);
        
        uint256 allowanceValue = cureToken.getAllowance(owner, user1);
        assertEq(allowanceValue, amount, "Allowance should match");
    }

    /// @notice Test getBalance returns correct balance
    function testGetBalance() public {
        uint256 amount = 2000 * 10**18;
        cureToken.transfer(user1, amount);
        
        uint256 balance = cureToken.getBalance(user1);
        assertEq(balance, amount, "Balance should match");
    }

    // ========== Integration Tests ==========

    /// @notice Test complex token flow
    function testComplexTokenFlow() public {
        // Owner transfers to user1
        cureToken.transfer(user1, 5000 * 10**18);
        
        // User1 approves user2
        vm.prank(user1);
        cureToken.approve(user2, 3000 * 10**18);
        
        // User2 transfers from user1 to user3
        vm.prank(user2);
        cureToken.transferFrom(user1, user3, 2000 * 10**18);
        
        // User3 burns some tokens
        vm.prank(user3);
        cureToken.burn(500 * 10**18);
        
        // Verify final balances
        assertEq(cureToken.balanceOf(user1), 3000 * 10**18, "User1 balance should be 3000");
        assertEq(cureToken.balanceOf(user3), 1500 * 10**18, "User3 balance should be 1500 after burn");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY - 500 * 10**18, "Total supply should decrease by burned amount");
    }

    /// @notice Test multiple users with independent balances
    function testMultipleUsersIndependent() public {
        cureToken.transfer(user1, 1000 * 10**18);
        cureToken.transfer(user2, 2000 * 10**18);
        cureToken.transfer(user3, 3000 * 10**18);
        
        assertEq(cureToken.balanceOf(user1), 1000 * 10**18, "User1 balance independent");
        assertEq(cureToken.balanceOf(user2), 2000 * 10**18, "User2 balance independent");
        assertEq(cureToken.balanceOf(user3), 3000 * 10**18, "User3 balance independent");
        assertEq(cureToken.totalSupply(), INITIAL_SUPPLY, "Total supply unchanged");
    }
}

