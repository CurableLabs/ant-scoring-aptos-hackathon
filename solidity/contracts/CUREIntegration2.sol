// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CUREIntegration - CURE Token Integration for ANT Scoring
 * @notice Connects CURE token economy with research scoring system
 * @dev Converted from clean_cure_integration.move (Aptos)
 
 * 
 * @author Curable Labs Team
 * @custom:conversion-date November 12, 2025
 */
contract CUREIntegration {
    
    // Constants
    uint256 public constant MIN_SCORER_STAKE = 1000 * 10**18;     // 1000 CURE minimum to be scorer
    uint256 public constant PROPOSAL_FEE = 10 * 10**18;           // 10 CURE to submit proposal
    uint256 public constant ACCURACY_BONUS_RATE = 50 * 10**18;   // 50 CURE bonus for accurate scoring
    uint256 public constant VOTING_PERIOD = 7 days;               // 7 days voting period
    

    

    // State Variable
    address public owner;                // Contract owner
    uint256 public totalCureStaked;      // Total CURE staked by all scorers
    uint256 public totalScorers;         // Total number of scorers
    uint256 public proposalCounter;      // Counter for proposal IDs
    uint256 public communityTreasury;    // CURE collected from proposal fees
    uint256 public rewardPool;           // CURE allocated for rewards
    bool public paused;                  // Emergency pause state




    // Structs
    struct ScorerStake {
        uint256 stakedAmount;
        uint256 votingPower;
        uint256 rewardsEarned;
        uint256 accuracyScore;
        uint256 lastRewardClaim;
    }



    struct GovernanceProposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        uint8 newScientificMeritWeight;
        uint8 newFeasibilityWeight;
        uint8 newCommunityWeight;
        uint8 newResourceWeight;
        uint8 newOpenScienceWeight;
        uint256 cureVotesFor;
        uint256 cureVotesAgainst;
        uint256 votingEnds;
        uint8 status;
    }

    


    // Mappings
    mapping(address => ScorerStake) public scorerStakes;
    mapping(uint256 => GovernanceProposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;


    // Events
    event ScorerStaked(
        address indexed scorer,
        uint256 amount,
        uint256 newVotingPower
    );

    event GovernanceProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string title
    );

    event CURERewardPaid(
        address indexed scorer,
        uint256 amount,
        string reason
    );

    event ProposalVoted(
        uint256 indexed proposalId,
        address indexed voter,
        bool voteFor,
        uint256 votingPower
    );

    event ScorerUnstaked(
        address indexed scorer,
        uint256 amount
    );

    event ProposalFinalized(
        uint256 indexed proposalId,
        uint8 finalStatus
    );

    event RewardsClaimed(
        address indexed scorer,
        uint256 amount
    );

    event AccuracyUpdated(
        address indexed scorer,
        uint256 oldAccuracy,
        uint256 newAccuracy,
        uint256 newVotingPower
    );

    event StakeIncreased(
        address indexed scorer,
        uint256 additionalAmount,
        uint256 newVotingPower
    );

    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed proposer
    );

    event Paused(address indexed by);
    event Unpaused(address indexed by);
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );


    // Custom Errors
    error InsufficientStake();
    error NotAuthorizedScorer();
    error ProposalNotFound();
    error InsufficientCURE();
    error InvalidWeights();
    error ProposalNotActive();
    error VotingEnded();
    error AlreadyVoted();
    error NotOwner();
    error NoRewardsAvailable();
    error InvalidAccuracy();
    error NotProposer();
    error ProposalAlreadyFinalized();
    error VotingStillActive();
    error ContractPaused();
    error InvalidAddress();



    // Modifiers
    modifier onlyOwner() {
        if(msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyScorer() {
        if(scorerStakes[msg.sender].stakedAmount == 0) revert NotAuthorizedScorer();
        _;
    }

    modifier whenNotPaused() {
        if(paused) revert ContractPaused();
        _;
    }



    // Constructor
    constructor() {
        owner = msg.sender;
        totalCureStaked = 0;
        totalScorers = 0;
        proposalCounter = 0;
        communityTreasury = 0;
        rewardPool = 0;
        paused = false;
    }




    // ========== CORE FUNCTIONS ==========
    
    // Stake CURE tokens to become authorized scorer
    // stakeAmount = Amount of CURE to stake
    function stakeToBeScorer(uint256 stakeAmount) external whenNotPaused {
        if(stakeAmount < MIN_SCORER_STAKE) revert InsufficientStake();
        
        // TODO: Transfer CURE from scorer (needs CURE token integration)
        
        uint256 votingPower = calculateVotingPower(stakeAmount);
        
        scorerStakes[msg.sender] = ScorerStake({
            stakedAmount: stakeAmount,
            votingPower: votingPower,
            rewardsEarned: 0,
            accuracyScore: 100,
            lastRewardClaim: block.timestamp
        });
        
        totalCureStaked += stakeAmount;
        totalScorers += 1;
        
        emit ScorerStaked(msg.sender, stakeAmount, votingPower);
    }

        

    // Pay proposal fee (for researchers submitting proposals)
    // Returns: Amount paid
    function payProposalFee() external returns (uint256) {
        // TODO: Transfer CURE from researcher (needs CURE token integration)
        communityTreasury += PROPOSAL_FEE;
        return PROPOSAL_FEE;
    }

    


    // Create governance proposal to change scoring weights
    function createGovernanceProposal(
        string memory title,
        string memory description,
        uint8 newScientificMeritWeight,
        uint8 newFeasibilityWeight,
        uint8 newCommunityWeight,
        uint8 newResourceWeight,
        uint8 newOpenScienceWeight
    ) external onlyScorer {
        // Verify weights sum to 100
        uint8 totalWeight = newScientificMeritWeight + newFeasibilityWeight + 
                           newCommunityWeight + newResourceWeight + newOpenScienceWeight;
        if(totalWeight != 100) revert InvalidWeights();
        
        proposalCounter += 1;
        uint256 proposalId = proposalCounter;
        
        proposals[proposalId] = GovernanceProposal({
            proposalId: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            newScientificMeritWeight: newScientificMeritWeight,
            newFeasibilityWeight: newFeasibilityWeight,
            newCommunityWeight: newCommunityWeight,
            newResourceWeight: newResourceWeight,
            newOpenScienceWeight: newOpenScienceWeight,
            cureVotesFor: 0,
            cureVotesAgainst: 0,
            votingEnds: block.timestamp + VOTING_PERIOD,
            status: 0
        });
        
        emit GovernanceProposalCreated(proposalId, msg.sender, title);
    }

        

    // Vote on governance proposal with CURE voting power
    function voteOnProposal(uint256 proposalId, bool voteFor) external onlyScorer whenNotPaused {
        if(proposals[proposalId].proposalId == 0) revert ProposalNotFound();
        if(proposals[proposalId].status != 0) revert ProposalNotActive();
        if(block.timestamp >= proposals[proposalId].votingEnds) revert VotingEnded();
        if(hasVoted[proposalId][msg.sender]) revert AlreadyVoted();
        
        uint256 votingPower = scorerStakes[msg.sender].votingPower;
        
        if(voteFor) {
            proposals[proposalId].cureVotesFor += votingPower;
        } else {
            proposals[proposalId].cureVotesAgainst += votingPower;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        
        emit ProposalVoted(proposalId, msg.sender, voteFor, votingPower);
    }



    // Reward accurate scorer with CURE tokens (owner only)
    function rewardAccurateScorer(address scorer, uint256 bonusAmount) external onlyOwner {
        if(scorerStakes[scorer].stakedAmount == 0) revert NotAuthorizedScorer();
        
        scorerStakes[scorer].rewardsEarned += bonusAmount;
        rewardPool += bonusAmount;
        
        emit CURERewardPaid(scorer, bonusAmount, "Accurate scoring bonus");
    }


    // ========== PRODUCTION FEATURES ==========

    // FEATURE 1: Unstake CURE tokens and stop being scorer
    function unstakeScorer() external onlyScorer {
        uint256 stakedAmount = scorerStakes[msg.sender].stakedAmount;
        
        // TODO: Transfer CURE back to scorer (needs CURE token integration)
        
        delete scorerStakes[msg.sender];
        totalCureStaked -= stakedAmount;
        totalScorers -= 1;
        
        emit ScorerUnstaked(msg.sender, stakedAmount);
    }


    // FEATURE 2: Finalize/Execute proposal after voting period ends
    function finalizeProposal(uint256 proposalId) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        
        if(proposal.proposalId == 0) revert ProposalNotFound();
        if(proposal.status != 0) revert ProposalAlreadyFinalized();
        if(block.timestamp < proposal.votingEnds) revert VotingStillActive();
        
        // Determine result based on votes
        if(proposal.cureVotesFor > proposal.cureVotesAgainst) {
            proposal.status = 1; // Passed
            // TODO: Actually apply the new weights to ANTScoring contract
        } else {
            proposal.status = 2; // Rejected
        }
        
        emit ProposalFinalized(proposalId, proposal.status);
    }


    // FEATURE 3: Claim accumulated rewards
    function claimRewards() external onlyScorer {
        uint256 rewards = scorerStakes[msg.sender].rewardsEarned;
        if(rewards == 0) revert NoRewardsAvailable();
        
        scorerStakes[msg.sender].rewardsEarned = 0;
        scorerStakes[msg.sender].lastRewardClaim = block.timestamp;
        
        // TODO: Transfer CURE rewards to scorer (needs CURE token integration)
        
        emit RewardsClaimed(msg.sender, rewards);
    }


    // FEATURE 4: Update scorer's accuracy score (owner only)
    function updateScorerAccuracy(address scorer, uint256 newAccuracy) external onlyOwner {
        if(newAccuracy > 100) revert InvalidAccuracy();
        if(scorerStakes[scorer].stakedAmount == 0) revert NotAuthorizedScorer();
        
        uint256 oldAccuracy = scorerStakes[scorer].accuracyScore;
        scorerStakes[scorer].accuracyScore = newAccuracy;
        
        // Recalculate voting power based on new accuracy
        uint256 newPower = calculateVotingPower(scorerStakes[scorer].stakedAmount);
        scorerStakes[scorer].votingPower = newPower;
        
        emit AccuracyUpdated(scorer, oldAccuracy, newAccuracy, newPower);
    }


    // FEATURE 5: Increase stake amount (add more CURE)
    function increaseStake(uint256 additionalAmount) external onlyScorer whenNotPaused {
        if(additionalAmount == 0) revert InsufficientStake();
        
        // TODO: Transfer additional CURE from scorer (needs CURE token integration)
        
        scorerStakes[msg.sender].stakedAmount += additionalAmount;
        uint256 newPower = calculateVotingPower(scorerStakes[msg.sender].stakedAmount);
        scorerStakes[msg.sender].votingPower = newPower;
        
        totalCureStaked += additionalAmount;
        
        emit StakeIncreased(msg.sender, additionalAmount, newPower);
    }


    // FEATURE 6: Cancel your own proposal (before it's finalized)
    function cancelProposal(uint256 proposalId) external {
        GovernanceProposal storage proposal = proposals[proposalId];
        
        if(proposal.proposalId == 0) revert ProposalNotFound();
        if(proposal.proposer != msg.sender) revert NotProposer();
        if(proposal.status != 0) revert ProposalAlreadyFinalized();
        
        proposal.status = 3; // Cancelled
        
        emit ProposalCancelled(proposalId, msg.sender);
    }


    // FEATURE 7: Emergency pause (owner only)
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }


    // FEATURE 8: Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        if(newOwner == address(0)) revert InvalidAddress();
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }


    // ========== HELPER FUNCTIONS ==========
    
    // Calculate voting power based on stake amount
    function calculateVotingPower(uint256 stakeAmount) internal pure returns (uint256) {
        return stakeAmount;
    }


    // ========== VIEW FUNCTIONS ==========
    
    // Get scorer stake information
    function getScorerStake(address scorer) external view returns (ScorerStake memory) {
        if(scorerStakes[scorer].stakedAmount == 0) revert NotAuthorizedScorer();
        return scorerStakes[scorer];
    }

    // Get governance proposal details
    function getGovernanceProposal(uint256 proposalId) external view returns (GovernanceProposal memory) {
        if(proposals[proposalId].proposalId == 0) revert ProposalNotFound();
        return proposals[proposalId];
    }

    // Get integration statistics
    function getIntegrationStats() external view returns (
        uint256 _totalCureStaked,
        uint256 _totalScorers,
        uint256 _communityTreasury,
        uint256 _rewardPool
    ) {
        return (totalCureStaked, totalScorers, communityTreasury, rewardPool);
    }

    
}
    


    



    



    
    

    


    


