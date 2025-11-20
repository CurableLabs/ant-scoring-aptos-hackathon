// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {TriLaneSystem} from "../../contracts/CleanDeploy.sol";
import {LabBadge} from "../../contracts/LabBadge.sol";
import {RoyaltyDistribution} from "../../contracts/RoyaltyDistribution.sol";

/// @title TriLaneSystem Test Suite (Updated for Badge System)
/// @notice Tests for badge NFTs, royalties, CURE tokens, and Sub-DAOs
contract TriLaneSystemTest is Test {
    TriLaneSystem public triLane;
    LabBadge public labBadge;
    RoyaltyDistribution public royaltyDist;
    
    address public admin;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public {
        admin = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        triLane = new TriLaneSystem();
        labBadge = triLane.labBadge();
        royaltyDist = triLane.royaltyDistribution();
    }

    // ========== CONSTRUCTOR TESTS ==========

    function testConstructorInitialization() public view {
        assertEq(triLane.admin(), admin, "Admin should be deployer");
        assertEq(labBadge.totalSupply(), 0, "Badge supply should be 0");
        assertEq(triLane.cureTotalSupply(), 0, "CURE supply should be 0");
        assertEq(triLane.subdaoCounter(), 0, "SubDAO counter should be 0");
    }

    function testConstructorDeploysBadgeAndRoyaltyContracts() public view {
        assertTrue(address(labBadge) != address(0), "LabBadge should be deployed");
        assertTrue(address(royaltyDist) != address(0), "RoyaltyDist should be deployed");
    }

    // ========== BADGE ISSUANCE TESTS ==========

    function testIssueLabBadge() public {
        uint256 tokenId = triLane.issueLabBadge(
            user1,
            "compound_validation",
            LabBadge.BadgeLevel.GOLD
        );
        
        assertEq(tokenId, 1, "First badge should be ID 1");
        assertEq(labBadge.totalSupply(), 1, "Total supply should be 1");
        assertEq(labBadge.ownerOf(1), user1, "User1 should own badge");
    }

    function testIssueMultipleBadges() public {
        triLane.issueLabBadge(user1, "work1", LabBadge.BadgeLevel.BRONZE);
        triLane.issueLabBadge(user2, "work2", LabBadge.BadgeLevel.SILVER);
        triLane.issueLabBadge(user1, "work3", LabBadge.BadgeLevel.GOLD);
        
        assertEq(labBadge.totalSupply(), 3, "Should have 3 badges");
        
        uint256[] memory user1Badges = triLane.getContributorBadges(user1);
        assertEq(user1Badges.length, 2, "User1 should have 2 badges");
    }

    function testCannotTransferBadge() public {
        uint256 tokenId = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        
        vm.prank(user1);
        vm.expectRevert(LabBadge.TransferNotAllowed.selector);
        labBadge.transferFrom(user1, user2, tokenId);
    }

    // ========== BADGE TIER TESTS ==========

    function testBadgeTiers() public {
        uint256 bronze = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.BRONZE);
        uint256 silver = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.SILVER);
        uint256 gold = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        uint256 platinum = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.PLATINUM);
        uint256 diamond = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.DIAMOND);
        
        assertEq(uint(triLane.getBadgeLevel(bronze)), uint(LabBadge.BadgeLevel.BRONZE));
        assertEq(uint(triLane.getBadgeLevel(silver)), uint(LabBadge.BadgeLevel.SILVER));
        assertEq(uint(triLane.getBadgeLevel(gold)), uint(LabBadge.BadgeLevel.GOLD));
        assertEq(uint(triLane.getBadgeLevel(platinum)), uint(LabBadge.BadgeLevel.PLATINUM));
        assertEq(uint(triLane.getBadgeLevel(diamond)), uint(LabBadge.BadgeLevel.DIAMOND));
    }

    function testBadgePoints() public view {
        assertEq(triLane.getTierPoints(LabBadge.BadgeLevel.BRONZE), 10);
        assertEq(triLane.getTierPoints(LabBadge.BadgeLevel.SILVER), 50);
        assertEq(triLane.getTierPoints(LabBadge.BadgeLevel.GOLD), 100);
        assertEq(triLane.getTierPoints(LabBadge.BadgeLevel.PLATINUM), 500);
        assertEq(triLane.getTierPoints(LabBadge.BadgeLevel.DIAMOND), 1000);
    }

    // ========== REPUTATION TESTS ==========

    function testGetContributorReputation() public {
        triLane.issueLabBadge(user1, "work1", LabBadge.BadgeLevel.BRONZE);  // 10
        triLane.issueLabBadge(user1, "work2", LabBadge.BadgeLevel.GOLD);    // 100
        triLane.issueLabBadge(user1, "work3", LabBadge.BadgeLevel.DIAMOND); // 1000
        
        uint256 reputation = triLane.getContributorReputation(user1);
        assertEq(reputation, 1110, "Total reputation should be 1110");
    }

    function testGetContributorStats() public {
        triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.BRONZE);
        triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.BRONZE);
        triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        
        (
            uint256 totalBadges,
            uint256 totalPoints,
            uint256 bronzeCount,
            ,
            uint256 goldCount,
            ,
        ) = triLane.getContributorStats(user1);
        
        assertEq(totalBadges, 3);
        assertEq(totalPoints, 120); // 10 + 10 + 100
        assertEq(bronzeCount, 2);
        assertEq(goldCount, 1);
    }

    // ========== ROYALTY TESTS ==========

    function testCreateRoyaltyPool() public {
        uint256 badge1 = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        uint256 badge2 = triLane.issueLabBadge(user2, "work", LabBadge.BadgeLevel.SILVER);
        
        uint256[] memory badges = new uint256[](2);
        badges[0] = badge1;
        badges[1] = badge2;
        
        uint256 poolId = triLane.createRoyaltyPool("Patent #US12345", badges);
        assertEq(poolId, 1, "First pool should be ID 1");
    }

    function testDepositAndClaimRoyalties() public {
        uint256 badge1 = triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = new uint256[](1);
        badges[0] = badge1;
        
        uint256 poolId = triLane.createRoyaltyPool("Patent", badges);
        
        // Deposit royalties
        triLane.depositRoyalties{value: 1 ether}(poolId);
        
        // Claim royalties
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        triLane.claimRoyalties(poolId, badge1);
        
        assertEq(user1.balance, balanceBefore + 1 ether, "Should receive full royalty");
    }

    // ========== CURE TOKEN TESTS ==========

    function testAcquireCURETokens() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        (uint256 balance, , uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(balance, 1000, "Balance should be 1000");
        assertEq(phase, 1, "Phase should be 1");
    }

    function testStakeCURETokens() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(500);
        vm.stopPrank();
        
        (uint256 balance, uint256 staked, ) = triLane.getCUREHolder(user1);
        assertEq(balance, 500, "Balance should be 500");
        assertEq(staked, 500, "Staked should be 500");
    }

    function testUnstakeCURETokensTimelock() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(500);
        
        // Try to unstake immediately (should fail)
        vm.expectRevert("Must wait 365 days before unstaking");
        triLane.unstakeCURETokens(100);
        
        vm.stopPrank();
    }

    function testUnstakeCURETokensAfterTimelock() public {
        vm.startPrank(user1);
        triLane.acquireCURETokens(1000);
        triLane.stakeCURETokens(500);
        vm.stopPrank();
        
        // Fast forward 365 days
        vm.warp(block.timestamp + 365 days);
        
        vm.prank(user1);
        triLane.unstakeCURETokens(200);
        
        (uint256 balance, uint256 staked, ) = triLane.getCUREHolder(user1);
        assertEq(balance, 700, "Balance should be 700");
        assertEq(staked, 300, "Staked should be 300");
    }

    // ========== SUB-DAO TESTS ==========

    function testCreateSubDAO() public {
        vm.prank(user1);
        triLane.createSubDAO(10000);
        
        (uint256 daoId, uint256 tokenSupply, bool bondingActive) = triLane.getSubDAO(1);
        assertEq(daoId, 1, "DAO ID should be 1");
        assertEq(tokenSupply, 10000, "Token supply should be 10000");
        assertTrue(bondingActive, "Bonding should be active");
    }

    function testToggleBondingCurve() public {
        vm.prank(user1);
        triLane.createSubDAO(10000);
        
        triLane.toggleBondingCurve(1, false);
        
        (, , bool bondingActive) = triLane.getSubDAO(1);
        assertFalse(bondingActive, "Bonding should be inactive");
    }

    // ========== ADMIN TESTS ==========

    function testActivatePhase2() public {
        vm.prank(user1);
        triLane.acquireCURETokens(1000);
        
        triLane.activatePhase2(user1);
        
        (, , uint8 phase) = triLane.getCUREHolder(user1);
        assertEq(phase, 2, "Phase should be 2");
    }

    function testAuthorizeBadgeIssuer() public {
        triLane.authorizeBadgeIssuer(user2);
        assertTrue(triLane.authorizedIssuers(user2), "User2 should be authorized");
        
        triLane.revokeBadgeIssuer(user2);
        assertFalse(triLane.authorizedIssuers(user2), "User2 should be revoked");
    }

    // ========== VIEW FUNCTION TESTS ==========

    function testGetSystemStats() public {
        triLane.issueLabBadge(user1, "work", LabBadge.BadgeLevel.GOLD);
        
        vm.prank(user1);
        triLane.acquireCURETokens(500);
        
        vm.prank(user2);
        triLane.createSubDAO(1000);
        
        (uint256 badgeSupply, uint256 cureSupply, uint256 subdaoCount) = triLane.getSystemStats();
        assertEq(badgeSupply, 1, "Badge supply should be 1");
        assertEq(cureSupply, 500, "CURE supply should be 500");
        assertEq(subdaoCount, 1, "SubDAO count should be 1");
    }
}
