// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {TriLaneSystem} from "../../contracts/CleanDeploy.sol";

/// @title TriLaneSystem Contract Test Suite
/// @notice Comprehensive tests for the three-lane system (Lab Credits, CURE Tokens, Sub-DAOs)
/// @dev Tests cover all three lanes, admin functions, view functions, and edge cases
contract TriLaneSystemTest is Test {
    TriLaneSystem public triLane;
    address public admin;
    address public user1;
    address public user2;
    address public user3;

    /// @notice Set up test environment before each test
    /// @dev Deploys TriLaneSystem contract and creates test addresses
    function setUp() public {
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        triLane = new TriLaneSystem();
    }

    // ========== Constructor Tests ==========

    /// @notice Test that constructor initializes contract state correctly
    function testConstructorInitialization() public view {
        assertEq(triLane.admin(), admin, "Admin should be deployer");
        assertEq(triLane.labCreditCounter(), 0, "Lab credit counter should be 0");
        assertEq(triLane.cureTotalSupply(), 0, "CURE total supply should be 0");
        assertEq(triLane.subdaoCounter(), 0, "SubDAO counter should be 0");
    }

    // ========== Lane 1: Lab Credit Tests ==========

    /// @notice Test successful lab credit issuance
    function testIssueLabCredit() public {
        string memory ipTitle = "Novel Cancer Treatment Protocol";
        
        vm.prank(user1);
        triLane.issueLabCredit(ipTitle);
        
        assertEq(triLane.labCreditCounter(), 1, "Lab credit counter should be 1");
        
        (uint256 creditId, address inventor, string memory title, uint256 timestamp) = triLane.getLabCredit(1);
        assertEq(creditId, 1, "Credit ID should be 1");
        assertEq(inventor, user1, "Inventor should be user1");
        assertEq(title, ipTitle, "IP title should match");
        assertGt(timestamp, 0, "Timestamp should be set");
    }

    /// @notice Test multiple lab credits from same inventor
    function testIssueMultipleLabCredits() public {
        vm.startPrank(user1);
        triLane.issueLabCredit("Protocol A");
        triLane.issueLabCredit("Protocol B");
        triLane.issueLabCredit("Protocol C");
        vm.stopPrank();
        
        assertEq(triLane.labCreditCounter(), 3, "Lab credit counter should be 3");
        
        (uint256 creditId1, address inventor1, , ) = triLane.getLabCredit(1);
        (uint256 creditId2, address inventor2, , ) = triLane.getLabCredit(2);
        (uint256 creditId3, address inventor3, , ) = triLane.getLabCredit(3);
        
        assertEq(creditId1, 1, "First credit ID should be 1");
        assertEq(creditId2, 2, "Second credit ID should be 2");
        assertEq(creditId3, 3, "Third credit ID should be 3");
        assertEq(inventor1, user1, "All credits should be from user1");
        assertEq(inventor2, user1, "All credits should be from user1");
        assertEq(inventor3, user1, "All credits should be from user1");
    }

    /// @notice Test lab credit issuance emits correct event
    function testIssueLabCreditEmitsEvent() public {
        string memory ipTitle = "New Treatment";
        
        vm.expectEmit(true, true, false, true);
        emit TriLaneSystem.LabCreditIssued(1, user1, ipTitle, block.timestamp);
        
        vm.prank(user1);
        triLane.issueLabCredit(ipTitle);
    }

    // ========== Lane 2: CURE Token Acquisition Tests ==========

    /// @notice Test first-time CURE token acquisition
    function testAcquireCURETokensFirstTime() public {
        uint256 amount = 1000;
        
        vm.prank(user1);
        triLane.acquireCURETokens(amount);
        
        (uint256 balance, uint256 staked, uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(balance, amount, "Balance should be 1000");
        assertEq(staked, 0, "Staked should be 0");
        assertEq(phase, 1, "Phase should be 1 (fixed)");
        assertEq(triLane.cureTotalSupply(), amount, "Total supply should increase");
    }

    /// @notice Test subsequent CURE token acquisition
    function testAcquireCURETokensSubsequent() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.acquireCURETokens(500);
        triLane.acquireCURETokens(300);
        vm.stopPrank();
        
        (uint256 balance, , ) = triLane.getCUREHolder(user1);
        assertEq(balance, 1800, "Balance should be sum of acquisitions");
        assertEq(triLane.cureTotalSupply(), 1800, "Total supply should match");
    }

    /// @notice Test zero amount acquisition reverts
    function testAcquireCURETokensZeroAmount() public {
        vm.prank(user1);
        vm.expectRevert("Invalid amount");
        triLane.acquireCURETokens(0);
    }

    /// @notice Test CURE token acquisition emits correct event
    function testAcquireCURETokensEmitsEvent() public {
        uint256 amount = 1000;
        
        vm.expectEmit(true, false, false, true);
        emit TriLaneSystem.CURETokensAcquired(user1, amount, block.timestamp);
        
        vm.prank(user1);
        triLane.acquireCURETokens(amount);
    }

    // ========== Lane 2: CURE Token Staking Tests ==========

    /// @notice Test successful CURE token staking
    function testStakeCURETokens() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        (uint256 balance, uint256 staked, ) = triLane.getCUREHolder(user1);
        assertEq(balance, 400, "Balance should be 400 after staking");
        assertEq(staked, 600, "Staked should be 600");
    }

    /// @notice Test staking with zero amount reverts
    function testStakeCURETokensZeroAmount() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        
        vm.expectRevert("Invalid amount");
        triLane.stakeCURETokens(0);
        vm.stopPrank();
    }

    /// @notice Test staking with insufficient balance reverts
    function testStakeCURETokensInsufficientBalance() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        
        vm.expectRevert("Insufficient balance");
        triLane.stakeCURETokens(1001);
        vm.stopPrank();
    }

    /// @notice Test staking before acquiring tokens reverts with insufficient balance
    function testStakeCURETokensNoPhase() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        triLane.stakeCURETokens(100);
    }

    /// @notice Test CURE token staking emits correct event
    function testStakeCURETokensEmitsEvent() public {
        uint256 amount = 500;
        
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        
        vm.expectEmit(true, false, false, true);
        emit TriLaneSystem.CURETokensStaked(user1, amount, block.timestamp);
        
        triLane.stakeCURETokens(amount);
        vm.stopPrank();
    }

    // ========== Lane 2: CURE Token Unstaking Tests ==========

    /// @notice Test successful CURE token unstaking after 365 days
    function testUnstakeCURETokensAfter365Days() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        // Fast forward 365 days
        vm.warp(block.timestamp + 365 days);
        
        vm.prank(user1);
        triLane.unstakeCURETokens(300);
        
        (uint256 balance, uint256 staked, ) = triLane.getCUREHolder(user1);
        assertEq(balance, 700, "Balance should be 400 + 300 = 700");
        assertEq(staked, 300, "Staked should be 600 - 300 = 300");
    }

    /// @notice Test unstaking before 365 days reverts
    function testUnstakeCURETokensBefore365Days() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        // Only fast forward 364 days (1 day short)
        vm.warp(block.timestamp + 364 days);
        
        vm.prank(user1);
        vm.expectRevert("Must wait 365 days before unstaking");
        triLane.unstakeCURETokens(300);
    }

    /// @notice Test unstaking with zero amount reverts
    function testUnstakeCURETokensZeroAmount() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 365 days);
        
        vm.prank(user1);
        vm.expectRevert("Invalid amount");
        triLane.unstakeCURETokens(0);
    }

    /// @notice Test unstaking more than staked balance reverts
    function testUnstakeCURETokensInsufficientStaked() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 365 days);
        
        vm.prank(user1);
        vm.expectRevert("Insufficient staked balance");
        triLane.unstakeCURETokens(601);
    }

    /// @notice Test CURE token unstaking emits correct event
    function testUnstakeCURETokensEmitsEvent() public {
        uint256 amount = 300;
        
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(600);
        vm.stopPrank();
        
        vm.warp(block.timestamp + 365 days);
        
        vm.expectEmit(true, false, false, true);
        emit TriLaneSystem.CURETokensUnstaked(user1, amount, block.timestamp);
        
        vm.prank(user1);
        triLane.unstakeCURETokens(amount);
    }

    /// @notice Test timestamp updates correctly on restaking
    function testStakingUpdatesTimestamp() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(300);
        vm.stopPrank();
        
        // Fast forward 100 days and stake more
        vm.warp(block.timestamp + 100 days);
        
        vm.prank(user1);
        triLane.stakeCURETokens(200);
        
        uint256 secondStakeTime = block.timestamp;
        
        // Try to unstake after 265 days from second stake (365 days from first)
        vm.warp(secondStakeTime + 265 days);
        
        // Should fail because timestamp was updated on second stake
        vm.prank(user1);
        vm.expectRevert("Must wait 365 days before unstaking");
        triLane.unstakeCURETokens(100);
    }

    // ========== Lane 3: Sub-DAO Tests ==========

    /// @notice Test successful Sub-DAO creation
    function testCreateSubDAO() public {
        uint256 initialSupply = 1000000;
        
        vm.prank(user1);
        triLane.createSubDAO(initialSupply);
        
        assertEq(triLane.subdaoCounter(), 1, "SubDAO counter should be 1");
        
        (uint256 daoId, uint256 tokenSupply, bool bondingActive) = triLane.getSubDAO(1);
        assertEq(daoId, 1, "DAO ID should be 1");
        assertEq(tokenSupply, initialSupply, "Token supply should match");
        assertTrue(bondingActive, "Bonding curve should be active by default");
    }

    /// @notice Test multiple Sub-DAO creation
    function testCreateMultipleSubDAOs() public {
        vm.prank(user1);
        triLane.createSubDAO(1000000);
        
        vm.prank(user2);
        triLane.createSubDAO(2000000);
        
        vm.prank(user3);
        triLane.createSubDAO(3000000);
        
        assertEq(triLane.subdaoCounter(), 3, "SubDAO counter should be 3");
    }

    /// @notice Test Sub-DAO creation with zero supply reverts
    function testCreateSubDAOZeroSupply() public {
        vm.prank(user1);
        vm.expectRevert("Invalid amount");
        triLane.createSubDAO(0);
    }

    /// @notice Test Sub-DAO creation emits correct event
    function testCreateSubDAOEmitsEvent() public {
        uint256 initialSupply = 1000000;
        
        vm.expectEmit(true, true, false, true);
        emit TriLaneSystem.SubDAOCreated(user1, 1, initialSupply, true);
        
        vm.prank(user1);
        triLane.createSubDAO(initialSupply);
    }

    // ========== Admin Function Tests ==========

    /// @notice Test admin can activate Phase 2
    function testActivatePhase2() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        triLane.activatePhase2(user1);
        
        (, , uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(phase, 2, "Phase should be 2 (dynamic)");
    }

    /// @notice Test non-admin cannot activate Phase 2
    function testActivatePhase2NotAdmin() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        vm.prank(user2);
        vm.expectRevert("Only admin can perform this action");
        triLane.activatePhase2(user1);
    }

    /// @notice Test cannot activate Phase 2 if already in Phase 2
    function testActivatePhase2AlreadyPhase2() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        triLane.activatePhase2(user1);
        
        vm.expectRevert("CURE tokens must be in phase 1 to be activated");
        triLane.activatePhase2(user1);
    }

    /// @notice Test Phase 2 activation emits correct event
    function testActivatePhase2EmitsEvent() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        vm.expectEmit(true, false, false, true);
        emit TriLaneSystem.Phase2Activated(user1, block.timestamp);
        
        triLane.activatePhase2(user1);
    }

    /// @notice Test admin can toggle bonding curve
    function testToggleBondingCurve() public {
        vm.prank(user1);
        triLane.createSubDAO(1000000);
        
        // Toggle off
        triLane.toggleBondingCurve(1, false);
        
        (, , bool bondingActive) = triLane.getSubDAO(1);
        assertFalse(bondingActive, "Bonding curve should be inactive");
        
        // Toggle back on
        triLane.toggleBondingCurve(1, true);
        
        (, , bondingActive) = triLane.getSubDAO(1);
        assertTrue(bondingActive, "Bonding curve should be active");
    }

    /// @notice Test non-admin cannot toggle bonding curve
    function testToggleBondingCurveNotAdmin() public {
        vm.prank(user1);
        triLane.createSubDAO(1000000);
        
        vm.prank(user2);
        vm.expectRevert("Only admin can perform this action");
        triLane.toggleBondingCurve(1, false);
    }

    /// @notice Test cannot toggle bonding curve to same state
    function testToggleBondingCurveSameState() public {
        vm.prank(user1);
        triLane.createSubDAO(1000000);
        
        vm.expectRevert("Bonding curve already in this state");
        triLane.toggleBondingCurve(1, true);
    }

    /// @notice Test bonding curve toggle emits correct event
    function testToggleBondingCurveEmitsEvent() public {
        vm.prank(user1);
        triLane.createSubDAO(1000000);
        
        vm.expectEmit(true, false, false, true);
        emit TriLaneSystem.BondingCurveToggled(1, false);
        
        triLane.toggleBondingCurve(1, false);
    }

    // ========== View Function Tests ==========

    /// @notice Test getSystemStats returns correct stats
    function testGetSystemStats() public {
        vm.prank(user1);
        triLane.issueLabCredit("Protocol A");
        
        vm.prank(user2);
        triLane.acquireCURETokens(1000);
        
        vm.prank(user3);
        triLane.createSubDAO(1000000);
        
        (uint256 labCredits, uint256 cureSupply, uint256 subdaos) = triLane.getSystemStats();
        assertEq(labCredits, 1, "Lab credits should be 1");
        assertEq(cureSupply, 1000, "CURE supply should be 1000");
        assertEq(subdaos, 1, "SubDAOs should be 1");
    }

    /// @notice Test getCUREHolder for non-existent holder
    function testGetCUREHolderNonExistent() public view {
        (uint256 balance, uint256 staked, uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(balance, 0, "Balance should be 0");
        assertEq(staked, 0, "Staked should be 0");
        assertEq(phase, 0, "Phase should be 0 (not initialized)");
    }

    // ========== Integration Tests ==========

    /// @notice Test full user journey through all three lanes
    function testFullUserJourney() public {
        vm.startPrank(user1);
        
        // Lane 1: Issue lab credit
        triLane.issueLabCredit("Revolutionary Treatment");
        
        // Lane 2: Acquire and stake CURE tokens
        triLane.acquireCURETokens(5000);
        triLane.stakeCURETokens(3000);
        
        // Lane 3: Create Sub-DAO
        triLane.createSubDAO(10000000);
        
        vm.stopPrank();
        
        // Verify all actions
        assertEq(triLane.labCreditCounter(), 1, "Lab credit created");
        (uint256 balance, uint256 staked, uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(balance, 2000, "Balance correct");
        assertEq(staked, 3000, "Staked correct");
        assertEq(phase, 1, "Phase 1");
        assertEq(triLane.subdaoCounter(), 1, "SubDAO created");
        
        // Admin activates Phase 2
        triLane.activatePhase2(user1);
        (, , phase) = triLane.getCUREHolder(user1);
        assertEq(phase, 2, "Now in Phase 2");
        
        // Fast forward and unstake
        vm.warp(block.timestamp + 365 days);
        vm.prank(user1);
        triLane.unstakeCURETokens(1000);
        
        (balance, staked, ) = triLane.getCUREHolder(user1);
        assertEq(balance, 3000, "Balance after unstaking");
        assertEq(staked, 2000, "Staked after unstaking");
    }

    /// @notice Test multiple users can use system independently
    function testMultipleUsersIndependently() public {
        // User 1 journey
        vm.startPrank(user1);
        triLane.issueLabCredit("Protocol 1");
        triLane.acquireCURETokens(1000);
        vm.stopPrank();
        
        // User 2 journey
        vm.startPrank(user2);
        triLane.issueLabCredit("Protocol 2");
        triLane.acquireCURETokens(2000);
        triLane.createSubDAO(5000000);
        vm.stopPrank();
        
        // User 3 journey
        vm.startPrank(user3);
        triLane.acquireCURETokens(3000);
        triLane.stakeCURETokens(2000);
        vm.stopPrank();
        
        // Verify independence
        (uint256 balance1, , ) = triLane.getCUREHolder(user1);
        (uint256 balance2, , ) = triLane.getCUREHolder(user2);
        (uint256 balance3, uint256 staked3, ) = triLane.getCUREHolder(user3);
        
        assertEq(balance1, 1000, "User1 balance independent");
        assertEq(balance2, 2000, "User2 balance independent");
        assertEq(balance3, 1000, "User3 balance independent");
        assertEq(staked3, 2000, "User3 staked independent");
        assertEq(triLane.cureTotalSupply(), 6000, "Total supply is sum");
    }
}

