// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {LabBadge} from "../../contracts/LabBadge.sol";

/// @title LabBadge Test Suite
/// @notice Tests for NFT badge system with tiers and reputation
contract LabBadgeTest is Test {
    LabBadge public labBadge;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        labBadge = new LabBadge();
    }

    // ========== CONSTRUCTOR TESTS ==========

    function testConstructorInitialization() public view {
        assertEq(labBadge.name(), "LAB Research Badge");
        assertEq(labBadge.symbol(), "LAB");
        assertEq(labBadge.totalSupply(), 0);
        assertEq(labBadge.owner(), owner);
    }

    function testTierPointsInitialized() public view {
        assertEq(labBadge.getTierPoints(LabBadge.BadgeLevel.BRONZE), 10);
        assertEq(labBadge.getTierPoints(LabBadge.BadgeLevel.SILVER), 50);
        assertEq(labBadge.getTierPoints(LabBadge.BadgeLevel.GOLD), 100);
        assertEq(labBadge.getTierPoints(LabBadge.BadgeLevel.PLATINUM), 500);
        assertEq(labBadge.getTierPoints(LabBadge.BadgeLevel.DIAMOND), 1000);
    }

    // ========== MINTING TESTS ==========

    function testMintBadge() public {
        bytes memory credentials = abi.encode(
            user1,
            "compound_validation",
            block.timestamp,
            ""
        );
        
        uint256 tokenId = labBadge.mintBadge(user1, credentials, LabBadge.BadgeLevel.GOLD);
        
        assertEq(tokenId, 1, "First token should be ID 1");
        assertEq(labBadge.totalSupply(), 1);
        assertEq(labBadge.ownerOf(1), user1);
    }

    function testMintMultipleBadges() public {
        bytes memory cred1 = abi.encode(user1, "work1", block.timestamp, "");
        bytes memory cred2 = abi.encode(user2, "work2", block.timestamp, "");
        bytes memory cred3 = abi.encode(user1, "work3", block.timestamp, "");
        
        labBadge.mintBadge(user1, cred1, LabBadge.BadgeLevel.BRONZE);
        labBadge.mintBadge(user2, cred2, LabBadge.BadgeLevel.SILVER);
        labBadge.mintBadge(user1, cred3, LabBadge.BadgeLevel.GOLD);
        
        assertEq(labBadge.totalSupply(), 3);
    }

    function testMintEmitsEvent() public {
        bytes memory credentials = abi.encode(user1, "work", block.timestamp, "");
        
        vm.expectEmit(true, true, false, true);
        emit LabBadge.BadgeMinted(1, user1, credentials);
        
        labBadge.mintBadge(user1, credentials, LabBadge.BadgeLevel.GOLD);
    }

    function testMintBadgeNotOwner() public {
        bytes memory credentials = abi.encode(user1, "work", block.timestamp, "");
        
        vm.prank(user1);
        vm.expectRevert();
        labBadge.mintBadge(user1, credentials, LabBadge.BadgeLevel.GOLD);
    }

    function testMintBadgeInvalidCredentials() public {
        bytes memory emptyCredentials = "";
        
        vm.expectRevert(LabBadge.InvalidCredentials.selector);
        labBadge.mintBadge(user1, emptyCredentials, LabBadge.BadgeLevel.GOLD);
    }

    function testMintBadgeZeroAddress() public {
        bytes memory credentials = abi.encode(user1, "work", block.timestamp, "");
        
        vm.expectRevert(LabBadge.InvalidCredentials.selector);
        labBadge.mintBadge(address(0), credentials, LabBadge.BadgeLevel.GOLD);
    }

    // ========== BADGE LEVEL TESTS ==========

    function testGetBadgeLevel() public {
        bytes memory credentials = abi.encode(user1, "work", block.timestamp, "");
        
        uint256 tokenId = labBadge.mintBadge(user1, credentials, LabBadge.BadgeLevel.PLATINUM);
        
        assertEq(uint(labBadge.getBadgeLevel(tokenId)), uint(LabBadge.BadgeLevel.PLATINUM));
    }

    function testGetBadgeLevelNonExistent() public {
        vm.expectRevert(LabBadge.BadgeNotFound.selector);
        labBadge.getBadgeLevel(999);
    }

    // ========== CREDENTIALS TESTS ==========

    function testGetCredentials() public {
        bytes memory credentials = abi.encode(
            user1,
            "compound_validation",
            block.timestamp,
            ""
        );
        
        uint256 tokenId = labBadge.mintBadge(user1, credentials, LabBadge.BadgeLevel.GOLD);
        bytes memory retrieved = labBadge.getCredentials(tokenId);
        
        assertEq(keccak256(credentials), keccak256(retrieved));
    }

    function testUpdateCredentials() public {
        bytes memory oldCred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, oldCred, LabBadge.BadgeLevel.GOLD);
        
        bytes memory newCred = abi.encode(user1, "work", block.timestamp, "Patent #US12345");
        labBadge.updateCredentials(tokenId, newCred);
        
        bytes memory retrieved = labBadge.getCredentials(tokenId);
        assertEq(keccak256(newCred), keccak256(retrieved));
    }

    function testUpdateCredentialsEmitsEvent() public {
        bytes memory oldCred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, oldCred, LabBadge.BadgeLevel.GOLD);
        
        bytes memory newCred = abi.encode(user1, "work", block.timestamp, "Patent");
        
        vm.expectEmit(true, false, false, false);
        emit LabBadge.CredentialsUpdated(tokenId, oldCred, newCred);
        
        labBadge.updateCredentials(tokenId, newCred);
    }

    function testUpdateCredentialsNotOwner() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        bytes memory newCred = abi.encode(user1, "work", block.timestamp, "New");
        
        vm.prank(user1);
        vm.expectRevert();
        labBadge.updateCredentials(tokenId, newCred);
    }

    // ========== CONTRIBUTOR TRACKING TESTS ==========

    function testGetContributorBadges() public {
        bytes memory cred1 = abi.encode(user1, "work1", block.timestamp, "");
        bytes memory cred2 = abi.encode(user1, "work2", block.timestamp, "");
        bytes memory cred3 = abi.encode(user1, "work3", block.timestamp, "");
        
        labBadge.mintBadge(user1, cred1, LabBadge.BadgeLevel.BRONZE);
        labBadge.mintBadge(user1, cred2, LabBadge.BadgeLevel.SILVER);
        labBadge.mintBadge(user1, cred3, LabBadge.BadgeLevel.GOLD);
        
        uint256[] memory badges = labBadge.getContributorBadges(user1);
        assertEq(badges.length, 3);
        assertEq(badges[0], 1);
        assertEq(badges[1], 2);
        assertEq(badges[2], 3);
    }

    function testGetContributorPoints() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.BRONZE);   // 10
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);     // 100
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.DIAMOND);  // 1000
        
        uint256 points = labBadge.getContributorPoints(user1);
        assertEq(points, 1110);
    }

    function testGetBadgeCountByTier() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.BRONZE);
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.BRONZE);
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        assertEq(labBadge.getBadgeCountByTier(user1, LabBadge.BadgeLevel.BRONZE), 2);
        assertEq(labBadge.getBadgeCountByTier(user1, LabBadge.BadgeLevel.SILVER), 0);
        assertEq(labBadge.getBadgeCountByTier(user1, LabBadge.BadgeLevel.GOLD), 3);
    }

    // ========== SOULBOUND TESTS ==========

    function testCannotTransferBadge() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        vm.prank(user1);
        vm.expectRevert(LabBadge.TransferNotAllowed.selector);
        labBadge.transferFrom(user1, user2, tokenId);
    }

    function testCannotApproveTransfer() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        vm.prank(user1);
        // Approve should work, but transfer will fail
        labBadge.approve(user2, tokenId);
        
        vm.prank(user2);
        vm.expectRevert(LabBadge.TransferNotAllowed.selector);
        labBadge.transferFrom(user1, user3, tokenId);
    }

    // ========== EXISTS TESTS ==========

    function testExists() public {
        bytes memory cred = abi.encode(user1, "work", block.timestamp, "");
        uint256 tokenId = labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        assertTrue(labBadge.exists(tokenId));
        assertFalse(labBadge.exists(999));
    }

    // ========== MULTIPLE CONTRIBUTORS TEST ==========

    function testMultipleContributorsIndependent() public {
        bytes memory cred = abi.encode(address(0), "work", block.timestamp, "");
        
        // User1 gets 2 badges
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.BRONZE);
        labBadge.mintBadge(user1, cred, LabBadge.BadgeLevel.GOLD);
        
        // User2 gets 1 badge
        labBadge.mintBadge(user2, cred, LabBadge.BadgeLevel.DIAMOND);
        
        // User3 gets 3 badges
        labBadge.mintBadge(user3, cred, LabBadge.BadgeLevel.SILVER);
        labBadge.mintBadge(user3, cred, LabBadge.BadgeLevel.SILVER);
        labBadge.mintBadge(user3, cred, LabBadge.BadgeLevel.PLATINUM);
        
        assertEq(labBadge.getContributorBadges(user1).length, 2);
        assertEq(labBadge.getContributorBadges(user2).length, 1);
        assertEq(labBadge.getContributorBadges(user3).length, 3);
        
        assertEq(labBadge.getContributorPoints(user1), 110);   // 10 + 100
        assertEq(labBadge.getContributorPoints(user2), 1000);  // 1000
        assertEq(labBadge.getContributorPoints(user3), 600);   // 50 + 50 + 500
    }
}

