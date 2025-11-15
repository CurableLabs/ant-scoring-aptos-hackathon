// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ANTScoring} from "../src/ANTScoring.sol";

/// @title ANTScoring Contract Test Suite
/// @author Molecular Discovery DAO
/// @notice Comprehensive test suite for the ANTScoring proposal scoring system
/// @dev Tests cover: submission, authorization, scoring logic, fulfillment, views, and events
contract ANTScoringTest is Test {
    // ============ STATE VARIABLES ============
    
    /// @notice The ANTScoring contract instance being tested
    ANTScoring public antScoring;
    
    /// @notice Test address representing the contract owner/admin
    address public owner;
    
    /// @notice Test address representing an authorized scorer/judge
    address public scorer1;
    
    /// @notice Test address representing a second authorized scorer/judge
    address public scorer2;
    
    /// @notice Test address representing a regular user who submits proposals
    address public submitter1;

    // ============ SETUP FUNCTION ============
    
    /// @notice Set up function that runs before each test
    /// @dev Initializes test addresses and deploys a fresh ANTScoring contract
    function setUp() public {
        owner =  address(this);
        scorer1 = makeAddr("scorer1");
        scorer2 = makeAddr("scorer2");
        submitter1 = makeAddr("submitter1");
    
        antScoring = new ANTScoring();
    }
    
    // ============ HELPER FUNCTIONS ============
    
    /// @notice Helper to create valid sample scores for testing
    function createSampleScores() internal pure returns (
        ANTScoring.ScientificMeritScores memory,
        ANTScoring.FeasibilityScores memory,
        ANTScoring.CommunityAlignmentScores memory,
        ANTScoring.ResourceEfficiencyScores memory,
        ANTScoring.OpenScienceScores memory
    ) {
        ANTScoring.ScientificMeritScores memory scientificMerit = ANTScoring.ScientificMeritScores({
            novelty: 80,
            biologicalPlausibility: 75,
            priorEvidence: 70
        });
        
        ANTScoring.FeasibilityScores memory feasibility = ANTScoring.FeasibilityScores({
            technicalViability: 85,
            dataQuality: 80,
            clarityOfProtocol: 90
        });
        
        ANTScoring.CommunityAlignmentScores memory communityAlignment = ANTScoring.CommunityAlignmentScores({
            missionFit: 95,
            daoEngagement: 85
        });
        
        ANTScoring.ResourceEfficiencyScores memory resourceEfficiency = ANTScoring.ResourceEfficiencyScores({
            costEffectiveness: 75,
            agenticResourceUse: 80
        });
        
        ANTScoring.OpenScienceScores memory openScience = ANTScoring.OpenScienceScores({
            dataProtocolSharing: 90,
            collaborativePotential: 85
        });
        
        return (scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
    }
    
    /// @notice Helper to submit a test proposal
    function submitTestProposal() internal returns (uint256) {
        vm.prank(submitter1);
        antScoring.submitProposal("Test Proposal", "Test Description", "QmTest");
        return 1; // Returns first proposal ID
    }

    // ============ SUBMISSION TESTS ============
    
    /// @notice Test that a user can successfully submit a proposal
    /// @dev Verifies proposal ID, title, and description are stored correctly
    function testSubmitProposal() public {
        // Arrange: Setup test data
        string memory title = "New Cancer Drug Research";
        string memory description = "Testing Compound XYZ-125";
        string memory ipfsHash = "QmXyZ1234567890abcdefghijklmnopqrstuvwxyz";

        // Act: Call the function to submit the proposal
        vm.prank(submitter1);
        antScoring.submitProposal(title, description, ipfsHash);

        // Assert: Check the proposal was submitted successfully
        (
            uint256 id,
            string memory retTitle,
            string memory retDesc,
            , // skip ipfsHash
            , // skip finalScore
            , // skip isPassing
            , // skip isFulfilled
              // skip scorerCount
        ) = antScoring.getProposalInfo(1);

        assertEq(id, 1, "Proposal ID should be 1");
        assertEq(retTitle, title, "Title should match submitted title");
        assertEq(retDesc, description, "Description should match submitted description");
    }

    // ============ ACCESS CONTROL TESTS ============
    
    /// @notice Test that the owner can add an authorized scorer
    /// @dev Verifies the scorer is authorized after being added
    function testAddAuthorizedScorer() public {
        // Act: Owner adds a new scorer
        antScoring.addAuthorizedScorer(scorer1);
        
        // Assert: Verify scorer1 is now authorized
        bool isAuthorized = antScoring.isAuthorizedScorer(scorer1);
        assertTrue(isAuthorized, "Scorer1 should be authorized");
    }
    
    /// @notice Test that non-owner cannot add authorized scorers
    /// @dev Should revert with "Only owner can call this function"
    function testAddAuthorizedScorerNotOwner() public {
        // Arrange: Use a non-owner address
        vm.prank(submitter1);
        
        // Act & Assert: Expect the call to revert
        vm.expectRevert("Only owner can call this function");
        antScoring.addAuthorizedScorer(scorer1);
    }
    
    /// @notice Test that the owner can remove an authorized scorer
    /// @dev Verifies the scorer is no longer authorized after removal
    function testRemoveAuthorizedScorer() public {
        // Arrange: First add a scorer
        antScoring.addAuthorizedScorer(scorer1);
        assertTrue(antScoring.isAuthorizedScorer(scorer1), "Scorer1 should be authorized");
        
        // Act: Remove the scorer
        antScoring.removeAuthorizedScorer(scorer1);
        
        // Assert: Verify scorer1 is no longer authorized
        bool isAuthorized = antScoring.isAuthorizedScorer(scorer1);
        assertFalse(isAuthorized, "Scorer1 should not be authorized");
    }
    
    // ============ SCORING TESTS ============
    
    /// @notice Test that an authorized scorer can successfully score a proposal
    /// @dev Verifies the final score is calculated and stored
    function testScoreProposal() public {
        // Arrange: Submit proposal and authorize scorer
        uint256 proposalId = submitTestProposal();
        antScoring.addAuthorizedScorer(scorer1);
        
        (
            ANTScoring.ScientificMeritScores memory scientificMerit,
            ANTScoring.FeasibilityScores memory feasibility,
            ANTScoring.CommunityAlignmentScores memory communityAlignment,
            ANTScoring.ResourceEfficiencyScores memory resourceEfficiency,
            ANTScoring.OpenScienceScores memory openScience
        ) = createSampleScores();
        
        // Act: Scorer1 scores the proposal
        vm.prank(scorer1);
        antScoring.scoreProposal(proposalId, scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
        
        // Assert: Verify proposal was scored (finalScore > 0)
        (,,,, uint8 finalScore,,,) = antScoring.getProposalInfo(proposalId);
        assertTrue(finalScore > 0, "Final score should be greater than 0");
    }
    
    /// @notice Test that unauthorized users cannot score proposals
    /// @dev Should revert with "Only authorized scorers can call this function"
    function testScoreProposalUnauthorized() public{
        // Arrange: Submit proposal but DON'T authorize scorer
        uint256 proposalId = submitTestProposal();
        
        (
            ANTScoring.ScientificMeritScores memory scientificMerit,
            ANTScoring.FeasibilityScores memory feasibility,
            ANTScoring.CommunityAlignmentScores memory communityAlignment,
            ANTScoring.ResourceEfficiencyScores memory resourceEfficiency,
            ANTScoring.OpenScienceScores memory openScience
        ) = createSampleScores();
        
        // Act & Assert: Unauthorized scorer tries to score - should revert
        vm.prank(scorer1);
        vm.expectRevert("Only authorized scorers can call this function");
        antScoring.scoreProposal(proposalId, scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
    }
    
    /// @notice Test that a scorer cannot score the same proposal twice
    /// @dev Should revert with "Scorer has already scored proposal" on second attempt
    function testScoreProposalTwice() public {
        // Arrange: Submit proposal, authorize scorer, score once
        uint256 proposalId = submitTestProposal();
        antScoring.addAuthorizedScorer(scorer1);
        
        (
            ANTScoring.ScientificMeritScores memory scientificMerit,
            ANTScoring.FeasibilityScores memory feasibility,
            ANTScoring.CommunityAlignmentScores memory communityAlignment,
            ANTScoring.ResourceEfficiencyScores memory resourceEfficiency,
            ANTScoring.OpenScienceScores memory openScience
        ) = createSampleScores();
        
        // First score (should succeed)
        vm.prank(scorer1);
        antScoring.scoreProposal(proposalId, scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
        
        // Act & Assert: Try to score again - should revert
        vm.prank(scorer1);
        vm.expectRevert("Scorer has already scored proposal");
        antScoring.scoreProposal(proposalId, scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
    }
    
    /// @notice Test that multiple scorers' scores are averaged correctly
    /// @dev Two scorers give scores of 80 and 60, average should be 70
    function testScoreProposalCalculatesAverage() public {
        // Arrange: Submit proposal, authorize 2 scorers
        uint256 proposalId = submitTestProposal();
        antScoring.addAuthorizedScorer(scorer1);
        antScoring.addAuthorizedScorer(scorer2);
        
        // Scorer1 gives scores of 80
        ANTScoring.ScientificMeritScores memory scientificMerit1 = ANTScoring.ScientificMeritScores({
            novelty: 80,
            biologicalPlausibility: 80,
            priorEvidence: 80
        });
        ANTScoring.FeasibilityScores memory feasibility1 = ANTScoring.FeasibilityScores({
            technicalViability: 80,
            dataQuality: 80,
            clarityOfProtocol: 80
        });
        ANTScoring.CommunityAlignmentScores memory communityAlignment1 = ANTScoring.CommunityAlignmentScores({
            missionFit: 80,
            daoEngagement: 80
        });
        ANTScoring.ResourceEfficiencyScores memory resourceEfficiency1 = ANTScoring.ResourceEfficiencyScores({
            costEffectiveness: 80,
            agenticResourceUse: 80
        });
        ANTScoring.OpenScienceScores memory openScience1 = ANTScoring.OpenScienceScores({
            dataProtocolSharing: 80,
            collaborativePotential: 80
        });
        
        // Scorer2 gives scores of 60
        ANTScoring.ScientificMeritScores memory scientificMerit2 = ANTScoring.ScientificMeritScores({
            novelty: 60,
            biologicalPlausibility: 60,
            priorEvidence: 60
        });
        ANTScoring.FeasibilityScores memory feasibility2 = ANTScoring.FeasibilityScores({
            technicalViability: 60,
            dataQuality: 60,
            clarityOfProtocol: 60
        });
        ANTScoring.CommunityAlignmentScores memory communityAlignment2 = ANTScoring.CommunityAlignmentScores({
            missionFit: 60,
            daoEngagement: 60
        });
        ANTScoring.ResourceEfficiencyScores memory resourceEfficiency2 = ANTScoring.ResourceEfficiencyScores({
            costEffectiveness: 60,
            agenticResourceUse: 60
        });
        ANTScoring.OpenScienceScores memory openScience2 = ANTScoring.OpenScienceScores({
            dataProtocolSharing: 60,
            collaborativePotential: 60
        });
        
        // Act: Both scorers score the proposal
        vm.prank(scorer1);
        antScoring.scoreProposal(proposalId, scientificMerit1, feasibility1, communityAlignment1, resourceEfficiency1, openScience1);
        
        vm.prank(scorer2);
        antScoring.scoreProposal(proposalId, scientificMerit2, feasibility2, communityAlignment2, resourceEfficiency2, openScience2);
        
        // Assert: Average should be 70 (80+60)/2
        (,,,, uint8 finalScore,,,) = antScoring.getProposalInfo(proposalId);
        assertEq(finalScore, 70, "Average score should be 70");
    }
    
    // ============ BUSINESS LOGIC TESTS ============
    
    /// @notice Test that a proposal can be marked as fulfilled
    /// @dev Verifies the proposal's fulfilled status is updated correctly
    function testFulfillProposal() public {
        // Arrange: Submit and score a proposal to make it passing
        uint256 proposalId = submitTestProposal();
        antScoring.addAuthorizedScorer(scorer1);
        
        (
            ANTScoring.ScientificMeritScores memory scientificMerit,
            ANTScoring.FeasibilityScores memory feasibility,
            ANTScoring.CommunityAlignmentScores memory communityAlignment,
            ANTScoring.ResourceEfficiencyScores memory resourceEfficiency,
            ANTScoring.OpenScienceScores memory openScience
        ) = createSampleScores();
        
        vm.prank(scorer1);
        antScoring.scoreProposal(proposalId, scientificMerit, feasibility, communityAlignment, resourceEfficiency, openScience);
        
        // Act: Fulfill the proposal
        vm.prank(submitter1);
        antScoring.fulfillProposal(proposalId);
        
        // Assert: Verify proposal is marked as fulfilled
        (,,,,, bool isPassing, bool isFulfilled,) = antScoring.getProposalInfo(proposalId);
        assertTrue(isPassing, "Proposal should be passing");
        assertTrue(isFulfilled, "Proposal should be fulfilled");
    }
    
    // ============ VIEW FUNCTION TESTS ============
    
    /// @notice Test that getSystemInfo returns correct system statistics
    /// @dev Verifies owner, proposal counts, and passing threshold
    function testGetSystemInfo() public {
        // Arrange: Submit 2 proposals
        submitTestProposal();
        vm.prank(submitter1);
        antScoring.submitProposal("Proposal 2", "Description 2", "QmTest2");
        
        // Act: Get system info (returns: owner, proposalCounter, activeProposalCount, passingThreshold)
        (address systemOwner, uint256 totalProposals, uint256 activeProposals, uint8 threshold) = antScoring.getSystemInfo();
        
        // Assert: Verify counts
        assertEq(systemOwner, owner, "Owner should match");
        assertEq(totalProposals, 2, "Total proposals should be 2");
        assertEq(activeProposals, 2, "Active proposals should be 2");
        assertEq(threshold, 70, "Passing threshold should be 70");
    }
    
    /// @notice Test that getProposalInfo returns complete proposal details
    /// @dev Verifies all proposal fields including metadata and status
    function testGetProposalInfo() public {
        // Arrange: Submit a proposal
        vm.prank(submitter1);
        antScoring.submitProposal("Cancer Research", "Description", "QmHash123");
        
        // Act: Get proposal info
        (
            uint256 id,
            string memory title,
            string memory description,
            string memory ipfsHash,
            uint8 finalScore,
            bool isPassing,
            bool isFulfilled,
            uint64 scorerCount
        ) = antScoring.getProposalInfo(1);
        
        // Assert: Verify proposal data
        assertEq(id, 1, "Proposal ID should be 1");
        assertEq(title, "Cancer Research", "Title should match");
        assertEq(description, "Description", "Description should match");
        assertEq(ipfsHash, "QmHash123", "IPFS hash should match");
        assertEq(finalScore, 0, "Initial score should be 0");
        assertFalse(isPassing, "Should not be passing initially");
        assertFalse(isFulfilled, "Should not be fulfilled initially");
        assertEq(scorerCount, 0, "Should have 0 scorers initially");
    }
    
    /// @notice Test that isAuthorizedScorer correctly returns authorization status
    /// @dev Tests adding, checking, and removing scorer authorization
    function testIsAuthorizedScorer() public {
        // Assert: Initially not authorized
        assertFalse(antScoring.isAuthorizedScorer(scorer1), "Scorer1 should not be authorized initially");
        
        // Act: Add scorer
        antScoring.addAuthorizedScorer(scorer1);
        
        // Assert: Now authorized
        assertTrue(antScoring.isAuthorizedScorer(scorer1), "Scorer1 should be authorized after adding");
        
        // Act: Remove scorer
        antScoring.removeAuthorizedScorer(scorer1);
        
        // Assert: No longer authorized
        assertFalse(antScoring.isAuthorizedScorer(scorer1), "Scorer1 should not be authorized after removing");
    }
    
    // ============ EVENT EMISSION TESTS ============
    
    /// @notice Test that submitting a proposal emits the ProposalSubmitted event
    /// @dev Verifies event parameters: proposalId, submitter, title, and timestamp
    function testSubmitProposalEmitsEvent() public {
        // Arrange: Setup test data
        string memory title = "Test Proposal";
        string memory description = "Test Description";
        string memory ipfsHash = "QmTest";
        
        // Act & Assert: Expect ProposalSubmitted event (proposalId, submitter, title, timestamp)
        vm.expectEmit(true, true, false, false);
        emit ANTScoring.ProposalSubmitted(1, submitter1, title, block.timestamp);
        
        vm.prank(submitter1);
        antScoring.submitProposal(title, description, ipfsHash);
    }
}
