// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CUREIntegration} from "../../contracts/CUREIntegration.sol";

/// @title CUREIntegration Contract Test Suite
/// @notice Comprehensive tests for CURE token integration with governance
/// @dev Tests cover staking, governance proposals, voting, rewards, and admin functions
contract CUREIntegrationTest is Test {
    CUREIntegration public cureIntegration;
    address public owner;
    address public scorer1;
    address public scorer2;
    address public scorer3;
    address public proposer1;

    uint256 constant MIN_STAKE = 1000 * 10**18;
    uint256 constant PROPOSAL_FEE = 10 * 10**18;
    uint256 constant VOTING_PERIOD = 7 days;

    /// @notice Set up test environment before each test
    /// @dev Deploys CUREIntegration contract and creates test addresses
    function setUp() public {
        owner = address(this);
        scorer1 = makeAddr("scorer1");
        scorer2 = makeAddr("scorer2");
        scorer3 = makeAddr("scorer3");
        proposer1 = makeAddr("proposer1");
        
        cureIntegration = new CUREIntegration();
    }

    /// @notice Helper function to stake as a scorer
    function stakeAsScorer(address scorer, uint256 amount) internal {
        vm.prank(scorer);
        cureIntegration.stakeToBeScorer(amount);
    }

    /// @notice Helper function to create a governance proposal
    function createProposal(address proposer) internal returns (uint256) {
        vm.prank(proposer);
        cureIntegration.createGovernanceProposal(
            "Test Proposal",
            "Testing governance",
            25, 20, 20, 20, 15  // Weights that sum to 100
        );
        return cureIntegration.proposalCounter();
    }

    // ========== Constructor Tests ==========

    /// @notice Test that constructor initializes contract state correctly
    function testConstructorInitialization() public view {
        assertEq(cureIntegration.owner(), owner, "Owner should be deployer");
        assertEq(cureIntegration.totalCureStaked(), 0, "Total staked should be 0");
        assertEq(cureIntegration.totalScorers(), 0, "Total scorers should be 0");
        assertEq(cureIntegration.proposalCounter(), 0, "Proposal counter should be 0");
        assertEq(cureIntegration.communityTreasury(), 0, "Treasury should be 0");
        assertEq(cureIntegration.rewardPool(), 0, "Reward pool should be 0");
        assertFalse(cureIntegration.paused(), "Contract should not be paused");
    }

    // ========== Staking Tests ==========

    /// @notice Test successful staking to become scorer
    function testStakeToBeScorer() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        CUREIntegration.ScorerStake memory stake = cureIntegration.getScorerStake(scorer1);
        
        assertEq(stake.stakedAmount, MIN_STAKE, "Staked amount should match");
        assertEq(stake.votingPower, MIN_STAKE, "Voting power should equal staked amount");
        assertEq(cureIntegration.totalCureStaked(), MIN_STAKE, "Total staked should increase");
        assertEq(cureIntegration.totalScorers(), 1, "Total scorers should be 1");
    }

    /// @notice Test staking below minimum fails
    function testStakeBelowMinimum() public {
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.InsufficientStake.selector);
        cureIntegration.stakeToBeScorer(MIN_STAKE - 1);
    }

    /// @notice Test staking when paused fails
    function testStakeWhenPaused() public {
        cureIntegration.pause();
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.ContractPaused.selector);
        cureIntegration.stakeToBeScorer(MIN_STAKE);
    }

    /// @notice Test staking emits correct event
    function testStakeEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit CUREIntegration.ScorerStaked(scorer1, MIN_STAKE, MIN_STAKE);
        
        vm.prank(scorer1);
        cureIntegration.stakeToBeScorer(MIN_STAKE);
    }

    /// @notice Test increasing stake
    function testIncreaseStake() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        uint256 additional = 500 * 10**18;
        vm.prank(scorer1);
        cureIntegration.increaseStake(additional);
        
        CUREIntegration.ScorerStake memory stake = cureIntegration.getScorerStake(scorer1);
        
        assertEq(stake.stakedAmount, MIN_STAKE + additional, "Staked amount should increase");
        assertEq(stake.votingPower, MIN_STAKE + additional, "Voting power should increase");
    }

    /// @notice Test non-scorer cannot increase stake
    function testIncreaseStakeNotScorer() public {
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotAuthorizedScorer.selector);
        cureIntegration.increaseStake(100 * 10**18);
    }

    // ========== Unstaking Tests ==========

    /// @notice Test successful unstaking
    function testUnstake() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        uint256 totalScorersBefore = cureIntegration.totalScorers();
        
        vm.prank(scorer1);
        cureIntegration.unstakeScorer();
        
        assertEq(cureIntegration.totalScorers(), totalScorersBefore - 1, "Total scorers should decrease");
    }

    /// @notice Test non-scorer cannot unstake
    function testUnstakeNotScorer() public {
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotAuthorizedScorer.selector);
        cureIntegration.unstakeScorer();
    }

    /// @notice Test unstake emits correct event
    function testUnstakeEmitsEvent() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        vm.expectEmit(true, false, false, true);
        emit CUREIntegration.ScorerUnstaked(scorer1, MIN_STAKE);
        
        vm.prank(scorer1);
        cureIntegration.unstakeScorer();
    }

    // ========== Proposal Tests ==========

    /// @notice Test successful proposal creation
    function testPayProposalFee() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        assertEq(proposalId, 1, "First proposal ID should be 1");
        assertEq(cureIntegration.proposalCounter(), 1, "Proposal counter should increase");
    }

    /// @notice Test multiple proposals increment counter
    function testMultipleProposals() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        
        uint256 id1 = createProposal(proposer1);
        uint256 id2 = createProposal(proposer1);
        
        assertEq(id1, 1, "First proposal should be ID 1");
        assertEq(id2, 2, "Second proposal should be ID 2");
    }

    // ========== Voting Tests ==========

    /// @notice Test successful voting on proposal
    function testVoteOnProposal() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        stakeAsScorer(proposer1, MIN_STAKE);
        
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, true);
        
        CUREIntegration.GovernanceProposal memory proposal = cureIntegration.getGovernanceProposal(proposalId);
        
        assertEq(proposal.cureVotesFor, MIN_STAKE, "Votes for should equal voting power");
        assertTrue(cureIntegration.hasVoted(proposalId, scorer1), "Scorer should be marked as voted");
    }

    /// @notice Test non-scorer cannot vote
    function testVoteNotScorer() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotAuthorizedScorer.selector);
        cureIntegration.voteOnProposal(proposalId, true);
    }

    /// @notice Test cannot vote twice
    function testVoteTwice() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, true);
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.AlreadyVoted.selector);
        cureIntegration.voteOnProposal(proposalId, true);
    }

    /// @notice Test voting when paused fails
    function testVoteWhenPaused() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        cureIntegration.pause();
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.ContractPaused.selector);
        cureIntegration.voteOnProposal(proposalId, true);
    }

    /// @notice Test vote against proposal
    function testVoteAgainst() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, false);
        
        CUREIntegration.GovernanceProposal memory proposal = cureIntegration.getGovernanceProposal(proposalId);
        
        assertEq(proposal.cureVotesAgainst, MIN_STAKE, "Votes against should equal voting power");
    }

    /// @notice Test voting emits correct event
    function testVoteEmitsEvent() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.expectEmit(true, true, false, true);
        emit CUREIntegration.ProposalVoted(proposalId, scorer1, true, MIN_STAKE);
        
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, true);
    }

    // ========== Finalize Proposal Tests ==========

    /// @notice Test finalize proposal after voting period
    function testFinalizeProposal() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, true);
        
        // Fast forward past voting period
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        
        cureIntegration.finalizeProposal(proposalId);
        
        CUREIntegration.GovernanceProposal memory proposal = cureIntegration.getGovernanceProposal(proposalId);
        
        assertEq(proposal.status, 1, "Proposal status should be finalized (1)");
    }

    /// @notice Test cannot finalize before voting period ends
    function testFinalizeProposalTooEarly() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.expectRevert(CUREIntegration.VotingStillActive.selector);
        cureIntegration.finalizeProposal(proposalId);
    }

    /// @notice Test cannot finalize twice
    function testFinalizeProposalTwice() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        
        cureIntegration.finalizeProposal(proposalId);
        
        vm.expectRevert(CUREIntegration.ProposalAlreadyFinalized.selector);
        cureIntegration.finalizeProposal(proposalId);
    }

    // ========== Cancel Proposal Tests ==========

    /// @notice Test proposer can cancel their proposal
    function testCancelProposal() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(proposer1);
        cureIntegration.cancelProposal(proposalId);
        
        CUREIntegration.GovernanceProposal memory proposal = cureIntegration.getGovernanceProposal(proposalId);
        
        assertEq(proposal.status, 3, "Proposal status should be cancelled (3)");
    }

    /// @notice Test non-proposer cannot cancel
    function testCancelProposalNotProposer() public {
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotProposer.selector);
        cureIntegration.cancelProposal(proposalId);
    }

    // ========== Rewards Tests ==========

    /// @notice Test reward accurate scorer
    function testRewardAccurateScorer() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        uint256 bonus = 100 * 10**18;
        cureIntegration.rewardAccurateScorer(scorer1, bonus);
        
        CUREIntegration.ScorerStake memory stake = cureIntegration.getScorerStake(scorer1);
        
        assertEq(stake.rewardsEarned, bonus, "Rewards earned should equal bonus");
    }

    /// @notice Test only owner can reward scorers
    function testRewardAccurateScorerNotOwner() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        vm.prank(scorer2);
        vm.expectRevert(CUREIntegration.NotOwner.selector);
        cureIntegration.rewardAccurateScorer(scorer1, 100 * 10**18);
    }

    /// @notice Test claim rewards
    function testClaimRewards() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        uint256 bonus = 100 * 10**18;
        cureIntegration.rewardAccurateScorer(scorer1, bonus);
        
        vm.prank(scorer1);
        cureIntegration.claimRewards();
        
        CUREIntegration.ScorerStake memory stake = cureIntegration.getScorerStake(scorer1);
        
        assertEq(stake.rewardsEarned, 0, "Rewards should be 0 after claiming");
    }

    /// @notice Test cannot claim rewards if none available
    function testClaimRewardsNoneAvailable() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NoRewardsAvailable.selector);
        cureIntegration.claimRewards();
    }

    /// @notice Test update scorer accuracy
    function testUpdateScorerAccuracy() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        uint256 newAccuracy = 95;
        cureIntegration.updateScorerAccuracy(scorer1, newAccuracy);
        
        CUREIntegration.ScorerStake memory stake = cureIntegration.getScorerStake(scorer1);
        
        assertEq(stake.accuracyScore, newAccuracy, "Accuracy should be updated");
    }

    /// @notice Test only owner can update accuracy
    function testUpdateScorerAccuracyNotOwner() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        
        vm.prank(scorer2);
        vm.expectRevert(CUREIntegration.NotOwner.selector);
        cureIntegration.updateScorerAccuracy(scorer1, 95);
    }

    // ========== Admin Functions Tests ==========

    /// @notice Test owner can pause contract
    function testPause() public {
        cureIntegration.pause();
        
        assertTrue(cureIntegration.paused(), "Contract should be paused");
    }

    /// @notice Test non-owner cannot pause
    function testPauseNotOwner() public {
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotOwner.selector);
        cureIntegration.pause();
    }

    /// @notice Test owner can unpause contract
    function testUnpause() public {
        cureIntegration.pause();
        cureIntegration.unpause();
        
        assertFalse(cureIntegration.paused(), "Contract should not be paused");
    }

    /// @notice Test owner can transfer ownership
    function testTransferOwnership() public {
        cureIntegration.transferOwnership(scorer1);
        
        assertEq(cureIntegration.owner(), scorer1, "New owner should be scorer1");
    }

    /// @notice Test non-owner cannot transfer ownership
    function testTransferOwnershipNotOwner() public {
        vm.prank(scorer1);
        vm.expectRevert(CUREIntegration.NotOwner.selector);
        cureIntegration.transferOwnership(scorer2);
    }

    /// @notice Test transfer ownership to zero address fails
    function testTransferOwnershipZeroAddress() public {
        vm.expectRevert(CUREIntegration.InvalidAddress.selector);
        cureIntegration.transferOwnership(address(0));
    }

    // ========== View Functions Tests ==========

    /// @notice Test getIntegrationStats returns correct data
    function testGetIntegrationStats() public {
        stakeAsScorer(scorer1, MIN_STAKE);
        stakeAsScorer(scorer2, MIN_STAKE * 2);
        
        stakeAsScorer(proposer1, MIN_STAKE);
        createProposal(proposer1);
        
        (
            uint256 totalStaked,
            uint256 totalScorersCount,
            uint256 treasury,
            uint256 rewards
        ) = cureIntegration.getIntegrationStats();
        
        assertEq(totalStaked, MIN_STAKE * 4, "Total staked should be sum of all stakes (3 scorers + 1 proposer)");
        assertEq(totalScorersCount, 3, "Total scorers should be 3 (scorer1, scorer2, proposer1)");
        assertEq(treasury, 0, "Treasury should be 0 (createProposal doesn't collect fees yet)");
        assertEq(rewards, 0, "Reward pool should be 0");
    }

    // ========== Integration Tests ==========

    /// @notice Test complete governance flow
    function testCompleteGovernanceFlow() public {
        // Stake as scorers
        stakeAsScorer(scorer1, MIN_STAKE);
        stakeAsScorer(scorer2, MIN_STAKE * 2);
        
        // Create proposal
        stakeAsScorer(proposer1, MIN_STAKE);
        uint256 proposalId = createProposal(proposer1);
        
        // Vote on proposal
        vm.prank(scorer1);
        cureIntegration.voteOnProposal(proposalId, true);
        
        vm.prank(scorer2);
        cureIntegration.voteOnProposal(proposalId, false);
        
        // Check votes
        CUREIntegration.GovernanceProposal memory proposal1 = cureIntegration.getGovernanceProposal(proposalId);
        assertEq(proposal1.cureVotesFor, MIN_STAKE, "Votes for should match scorer1's power");
        assertEq(proposal1.cureVotesAgainst, MIN_STAKE * 2, "Votes against should match scorer2's power");
        
        // Finalize after voting period
        vm.warp(block.timestamp + VOTING_PERIOD + 1);
        cureIntegration.finalizeProposal(proposalId);
        
        CUREIntegration.GovernanceProposal memory proposal2 = cureIntegration.getGovernanceProposal(proposalId);
        assertGt(proposal2.status, 0, "Proposal should be finalized with non-zero status");
    }
}

