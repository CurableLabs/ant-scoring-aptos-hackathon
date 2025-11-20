// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RoyaltyDistribution} from "../../contracts/RoyaltyDistribution.sol";
import {LabBadge} from "../../contracts/LabBadge.sol";

/// @title RoyaltyDistribution Test Suite
/// @notice Tests for automated royalty distribution system
contract RoyaltyDistributionTest is Test {
    RoyaltyDistribution public royaltyDist;
    LabBadge public labBadge;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public {
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy LabBadge first
        labBadge = new LabBadge();
        
        // Deploy RoyaltyDistribution
        royaltyDist = new RoyaltyDistribution(address(labBadge));
        
        // Fund test addresses
        vm.deal(admin, 100 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }

    // ========== CONSTRUCTOR TESTS ==========

    function testConstructorInitialization() public view {
        assertEq(royaltyDist.admin(), admin);
        assertEq(address(royaltyDist.labBadge()), address(labBadge));
        assertEq(royaltyDist.poolCounter(), 0);
    }

    // ========== CREATE POOL TESTS ==========

    function testCreateRoyaltyPool() public {
        // Mint badges
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        uint256 badge2 = labBadge.mintBadge(user2, cred, LabBadge.BadgeLevel.SILVER);
        
        uint256[] memory badges = new uint256[](2);
        badges[0] = badge1;
        badges[1] = badge2;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent #US12345", badges);
        
        assertEq(poolId, 1);
        assertEq(royaltyDist.poolCounter(), 1);
    }

    function testCreateRoyaltyPoolEmitsEvent() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        vm.expectEmit(true, false, false, false);
        emit RoyaltyDistribution.RoyaltyPoolCreated(1, "Patent", badges);
        
        royaltyDist.createRoyaltyPool("Patent", badges);
    }

    function testCreateRoyaltyPoolNotAdmin() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        vm.prank(user1);
        vm.expectRevert(RoyaltyDistribution.OnlyAdmin.selector);
        royaltyDist.createRoyaltyPool("Patent", badges);
    }

    function testCreateRoyaltyPoolEmptyBadges() public {
        uint256[] memory badges = new uint256[](0);
        
        vm.expectRevert(RoyaltyDistribution.InvalidBadgeList.selector);
        royaltyDist.createRoyaltyPool("Patent", badges);
    }

    // ========== DEPOSIT ROYALTIES TESTS ==========

    function testDepositRoyalties() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
        
        (,uint256 totalDeposited,,,) = royaltyDist.getPoolInfo(poolId);
        assertEq(totalDeposited, 1 ether);
    }

    function testDepositRoyaltiesEmitsEvent() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        
        vm.expectEmit(true, false, false, true);
        emit RoyaltyDistribution.RoyaltiesDeposited(poolId, 1 ether, admin);
        
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
    }

    // ========== CLAIM ROYALTIES TESTS ==========

    function testClaimRoyalties() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
        
        uint256 balanceBefore = user1.balance;
        
        vm.prank(user1);
        royaltyDist.claimRoyalties(poolId, badge1, user1);
        
        assertEq(user1.balance, balanceBefore + 1 ether);
    }

    function testClaimRoyaltiesProportional() public {
        bytes memory cred = abi.encode(address(0), "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);    // 100 points
        uint256 badge2 = labBadge.mintBadge(user2, cred, LabBadge.BadgeLevel.SILVER);  // 50 points
        // Total: 150 points
        
        uint256[] memory badges = new uint256[](2);
        badges[0] = badge1;
        badges[1] = badge2;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 3 ether}(poolId);
        
        uint256 user1BalanceBefore = user1.balance;
        uint256 user2BalanceBefore = user2.balance;
        
        vm.prank(user1);
        royaltyDist.claimRoyalties(poolId, badge1, user1);
        
        vm.prank(user2);
        royaltyDist.claimRoyalties(poolId, badge2, user2);
        
        // User1: 100/150 * 3 ether = 2 ether
        // User2: 50/150 * 3 ether = 1 ether
        assertEq(user1.balance, user1BalanceBefore + 2 ether);
        assertEq(user2.balance, user2BalanceBefore + 1 ether);
    }

    function testClaimRoyaltiesEmitsEvent() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
        
        vm.expectEmit(true, true, true, true);
        emit RoyaltyDistribution.RoyaltiesClaimed(poolId, badge1, user1, 1 ether);
        
        vm.prank(user1);
        royaltyDist.claimRoyalties(poolId, badge1, user1);
    }

    function testClaimRoyaltiesNotBadgeOwner() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
        
        vm.prank(user2);
        vm.expectRevert(RoyaltyDistribution.NotBadgeOwner.selector);
        royaltyDist.claimRoyalties(poolId, badge1, user2);
    }

    function testClaimRoyaltiesAlreadyClaimed() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 1 ether}(poolId);
        
        vm.prank(user1);
        royaltyDist.claimRoyalties(poolId, badge1, user1);
        
        vm.prank(user1);
        vm.expectRevert(RoyaltyDistribution.AlreadyClaimed.selector);
        royaltyDist.claimRoyalties(poolId, badge1, user1);
    }

    // ========== CALCULATE ROYALTY TESTS ==========

    function testCalculateRoyaltyShare() public {
        bytes memory cred = abi.encode(address(0), "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);    // 100
        uint256 badge2 = labBadge.mintBadge(user2, cred, LabBadge.BadgeLevel.SILVER);  // 50
        
        uint256[] memory badges = new uint256[](2);
        badges[0] = badge1;
        badges[1] = badge2;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 3 ether}(poolId);
        
        uint256 share1 = royaltyDist.calculateRoyaltyShare(poolId, badge1);
        uint256 share2 = royaltyDist.calculateRoyaltyShare(poolId, badge2);
        
        assertEq(share1, 2 ether); // 100/150 * 3
        assertEq(share2, 1 ether); // 50/150 * 3
    }

    // ========== MULTIPLE CLAIMS TEST ==========

    function testClaimMultipleRoyalties() public {
        bytes memory cred = abi.encode(address(0), "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        uint256 badge2 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.SILVER);
        
        // Pool 1
        uint256[] memory badges1 = new uint256[](1);
        badges1[0] = badge1;
        uint256 poolId1 = royaltyDist.createRoyaltyPool("Patent1", badges1);
        royaltyDist.depositRoyalties{value: 1 ether}(poolId1);
        
        // Pool 2
        uint256[] memory badges2 = new uint256[](1);
        badges2[0] = badge2;
        uint256 poolId2 = royaltyDist.createRoyaltyPool("Patent2", badges2);
        royaltyDist.depositRoyalties{value: 2 ether}(poolId2);
        
        uint256[] memory poolIds = new uint256[](2);
        poolIds[0] = poolId1;
        poolIds[1] = poolId2;
        
        uint256[] memory badgeIds = new uint256[](2);
        badgeIds[0] = badge1;
        badgeIds[1] = badge2;
        
        uint256 balanceBefore = user1.balance;
        
        vm.prank(user1);
        royaltyDist.claimMultipleRoyalties(poolIds, badgeIds, user1);
        
        assertEq(user1.balance, balanceBefore + 3 ether);
    }

    // ========== VIEW FUNCTIONS TESTS ==========

    function testGetUnclaimedRoyalties() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        royaltyDist.depositRoyalties{value: 5 ether}(poolId);
        
        uint256 unclaimed = royaltyDist.getUnclaimedRoyalties(badge1);
        assertEq(unclaimed, 5 ether);
    }

    function testGetBadgePools() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        royaltyDist.createRoyaltyPool("Patent1", badges);
        royaltyDist.createRoyaltyPool("Patent2", badges);
        
        uint256[] memory pools = royaltyDist.getBadgePools(badge1);
        assertEq(pools.length, 2);
        assertEq(pools[0], 1);
        assertEq(pools[1], 2);
    }

    function testGetPoolInfo() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent #US12345", badges);
        royaltyDist.depositRoyalties{value: 10 ether}(poolId);
        
        (
            string memory ipId,
            uint256 totalDeposited,
            uint256 totalClaimed,
            uint256 availableRoyalties,
            uint256 eligibleBadgeCount
        ) = royaltyDist.getPoolInfo(poolId);
        
        assertEq(ipId, "Patent #US12345");
        assertEq(totalDeposited, 10 ether);
        assertEq(totalClaimed, 0);
        assertEq(availableRoyalties, 10 ether);
        assertEq(eligibleBadgeCount, 1);
    }

    // ========== ADMIN FUNCTIONS TESTS ==========

    function testClosePool() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 badge1 = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = royaltyDist.createRoyaltyPool("Patent", badges);
        
        vm.expectEmit(true, false, false, false);
        emit RoyaltyDistribution.PoolClosed(poolId);
        
        royaltyDist.closePool(poolId);
    }

    // ========== RECEIVE FUNCTION TEST ==========

    function testReceiveEther() public {
        uint256 balanceBefore = address(royaltyDist).balance;
        
        (bool success,) = address(royaltyDist).call{value: 1 ether}("");
        assertTrue(success);
        
        assertEq(address(royaltyDist).balance, balanceBefore + 1 ether);
    }
}

