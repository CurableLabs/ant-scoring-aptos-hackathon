<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
/// CURE Token Integration Module for ANT Scoring System
module ant_scoring::cure_integration {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_INSUFFICIENT_STAKE: u64 = 100;
    const E_NOT_AUTHORIZED_SCORER: u64 = 101;
    const E_PROPOSAL_NOT_FOUND: u64 = 102;
    const E_INSUFFICIENT_CURE: u64 = 103;

    /// Constants
    const MIN_SCORER_STAKE: u64 = 1000; // 1000 $CURE minimum to be scorer
    const PROPOSAL_FEE: u64 = 10; // 10 $CURE to submit proposal
    const ACCURACY_BONUS_RATE: u64 = 50; // 50 $CURE bonus for accurate scoring

    /// Scorer staking information
    struct ScorerStake has store {
        staked_amount: u64,
        voting_power: u64,
        rewards_earned: u64,
        accuracy_score: u64, // Out of 100
        last_reward_claim: u64,
    }

    /// Community governance proposal
    struct GovernanceProposal has store {
        proposal_id: u64,
        proposer: address,
        title: vector<u8>,
        description: vector<u8>,
        new_scientific_merit_weight: u8,
        new_feasibility_weight: u8,
        new_community_weight: u8,
        new_resource_weight: u8,
        new_open_science_weight: u8,
        cure_votes_for: u64,
        cure_votes_against: u64,
        voting_ends: u64,
        status: u8, // 0=active, 1=passed, 2=rejected, 3=expired
    }

    /// Global CURE integration state
    struct CUREIntegrationState has key {
        total_cure_staked: u64,
        total_scorers: u64,
        scorer_stakes: Table<address, ScorerStake>,
        governance_proposals: Table<u64, GovernanceProposal>,
        proposal_counter: u64,
        community_treasury: u64,
        reward_pool: u64,
    }

    /// Events
    #[event]
    struct ScorerStaked has drop, store {
        scorer: address,
        amount: u64,
        new_voting_power: u64,
    }

    #[event]
    struct GovernanceProposalCreated has drop, store {
        proposal_id: u64,
        proposer: address,
        title: vector<u8>,
    }

    #[event]
    struct CURERewardPaid has drop, store {
        scorer: address,
        amount: u64,
        reason: vector<u8>,
    }

    /// Initialize CURE integration
    public entry fun initialize_cure_integration(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        let state = CUREIntegrationState {
            total_cure_staked: 0,
            total_scorers: 0,
            scorer_stakes: table::new(),
            governance_proposals: table::new(),
            proposal_counter: 0,
            community_treasury: 0,
            reward_pool: 0,
        };

        move_to(admin, state);
    }

    /// Stake CURE tokens to become an authorized scorer
    public entry fun stake_to_become_scorer(
        scorer: &signer,
        stake_amount: u64,
    ) acquires CUREIntegrationState {
        let scorer_addr = signer::address_of(scorer);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        assert!(stake_amount >= MIN_SCORER_STAKE, E_INSUFFICIENT_STAKE);

        // TODO: Transfer CURE tokens from scorer to contract
        // This would require the actual CURE token contract integration

        let voting_power = calculate_voting_power(stake_amount);
        
        let scorer_stake = ScorerStake {
            staked_amount: stake_amount,
            voting_power,
            rewards_earned: 0,
            accuracy_score: 100, // Start with perfect accuracy
            last_reward_claim: timestamp::now_microseconds(),
        };

        table::add(&mut state.scorer_stakes, scorer_addr, scorer_stake);
        state.total_cure_staked = state.total_cure_staked + stake_amount;
        state.total_scorers = state.total_scorers + 1;

        event::emit(ScorerStaked {
            scorer: scorer_addr,
            amount: stake_amount,
            new_voting_power: voting_power,
        });
    }

    /// Pay CURE fee to submit research proposal
    public entry fun pay_proposal_fee(
        researcher: &signer,
    ): u64 acquires CUREIntegrationState {
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);
        
        // TODO: Transfer CURE tokens from researcher to contract
        state.community_treasury = state.community_treasury + PROPOSAL_FEE;
        
        PROPOSAL_FEE
    }

    /// Create governance proposal to change scoring weights
    public entry fun create_governance_proposal(
        proposer: &signer,
        title: vector<u8>,
        description: vector<u8>,
        new_scientific_merit_weight: u8,
        new_feasibility_weight: u8, 
        new_community_weight: u8,
        new_resource_weight: u8,
        new_open_science_weight: u8,
    ) acquires CUREIntegrationState {
        let proposer_addr = signer::address_of(proposer);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        // Verify proposer is staked scorer
        assert!(table::contains(&state.scorer_stakes, proposer_addr), E_NOT_AUTHORIZED_SCORER);

        // Verify weights sum to 100
        assert!(
            new_scientific_merit_weight + new_feasibility_weight + 
            new_community_weight + new_resource_weight + new_open_science_weight == 100,
            E_INVALID_WEIGHTS
        );

        state.proposal_counter = state.proposal_counter + 1;
        let proposal_id = state.proposal_counter;

        let proposal = GovernanceProposal {
            proposal_id,
            proposer: proposer_addr,
            title,
            description,
            new_scientific_merit_weight,
            new_feasibility_weight,
            new_community_weight,
            new_resource_weight,
            new_open_science_weight,
            cure_votes_for: 0,
            cure_votes_against: 0,
            voting_ends: timestamp::now_microseconds() + 604800000000, // 7 days
            status: 0, // Active
        };

        table::add(&mut state.governance_proposals, proposal_id, proposal);

        event::emit(GovernanceProposalCreated {
            proposal_id,
            proposer: proposer_addr,
            title,
        });
    }

    /// Vote on governance proposal with CURE voting power
    public entry fun vote_on_proposal(
        voter: &signer,
        proposal_id: u64,
        vote_for: bool, // true = for, false = against
    ) acquires CUREIntegrationState {
        let voter_addr = signer::address_of(voter);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        // Verify voter is staked scorer
        assert!(table::contains(&state.scorer_stakes, voter_addr), E_NOT_AUTHORIZED_SCORER);
        assert!(table::contains(&state.governance_proposals, proposal_id), E_PROPOSAL_NOT_FOUND);

        let scorer_stake = table::borrow(&state.scorer_stakes, voter_addr);
        let voting_power = scorer_stake.voting_power;

        let proposal = table::borrow_mut(&mut state.governance_proposals, proposal_id);
        assert!(proposal.status == 0, E_PROPOSAL_NOT_ACTIVE); // Must be active
        assert!(timestamp::now_microseconds() < proposal.voting_ends, E_VOTING_ENDED);

        if (vote_for) {
            proposal.cure_votes_for = proposal.cure_votes_for + voting_power;
        } else {
            proposal.cure_votes_against = proposal.cure_votes_against + voting_power;
        };
    }

    /// Reward accurate scorers with CURE tokens
    public entry fun reward_accurate_scorer(
        admin: &signer,
        scorer: address,
        bonus_amount: u64,
    ) acquires CUREIntegrationState {
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);
        
        assert!(table::contains(&state.scorer_stakes, scorer), E_NOT_AUTHORIZED_SCORER);
        
        let scorer_stake = table::borrow_mut(&mut state.scorer_stakes, scorer);
        scorer_stake.rewards_earned = scorer_stake.rewards_earned + bonus_amount;
        
        state.reward_pool = state.reward_pool + bonus_amount;

        event::emit(CURERewardPaid {
            scorer,
            amount: bonus_amount,
            reason: b"Accurate scoring bonus",
        });
    }

    /// Calculate voting power based on stake amount and accuracy
    fun calculate_voting_power(stake_amount: u64): u64 {
        // Base voting power is stake amount
        // Can be modified by accuracy multiplier later
        stake_amount
    }

    /// View functions
    #[view]
    public fun get_scorer_stake(scorer: address): ScorerStake acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        assert!(table::contains(&state.scorer_stakes, scorer), E_NOT_AUTHORIZED_SCORER);
        *table::borrow(&state.scorer_stakes, scorer)
    }

    #[view]
    public fun get_governance_proposal(proposal_id: u64): GovernanceProposal acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        assert!(table::contains(&state.governance_proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        *table::borrow(&state.governance_proposals, proposal_id)
    }

    #[view]
    public fun get_integration_stats(): (u64, u64, u64, u64) acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        (state.total_cure_staked, state.total_scorers, state.community_treasury, state.reward_pool)
    }

    // Error constants
    const E_INVALID_WEIGHTS: u64 = 104;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 105; 
    const E_VOTING_ENDED: u64 = 106;
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
/// CURE Token Integration Module for ANT Scoring System
module ant_scoring::cure_integration {
    use std::signer;
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_INSUFFICIENT_STAKE: u64 = 100;
    const E_NOT_AUTHORIZED_SCORER: u64 = 101;
    const E_PROPOSAL_NOT_FOUND: u64 = 102;
    const E_INSUFFICIENT_CURE: u64 = 103;

    /// Constants
    const MIN_SCORER_STAKE: u64 = 1000; // 1000 $CURE minimum to be scorer
    const PROPOSAL_FEE: u64 = 10; // 10 $CURE to submit proposal
    const ACCURACY_BONUS_RATE: u64 = 50; // 50 $CURE bonus for accurate scoring

    /// Scorer staking information
    struct ScorerStake has store {
        staked_amount: u64,
        voting_power: u64,
        rewards_earned: u64,
        accuracy_score: u64, // Out of 100
        last_reward_claim: u64,
    }

    /// Community governance proposal
    struct GovernanceProposal has store {
        proposal_id: u64,
        proposer: address,
        title: vector<u8>,
        description: vector<u8>,
        new_scientific_merit_weight: u8,
        new_feasibility_weight: u8,
        new_community_weight: u8,
        new_resource_weight: u8,
        new_open_science_weight: u8,
        cure_votes_for: u64,
        cure_votes_against: u64,
        voting_ends: u64,
        status: u8, // 0=active, 1=passed, 2=rejected, 3=expired
    }

    /// Global CURE integration state
    struct CUREIntegrationState has key {
        total_cure_staked: u64,
        total_scorers: u64,
        scorer_stakes: Table<address, ScorerStake>,
        governance_proposals: Table<u64, GovernanceProposal>,
        proposal_counter: u64,
        community_treasury: u64,
        reward_pool: u64,
    }

    /// Events
    #[event]
    struct ScorerStaked has drop, store {
        scorer: address,
        amount: u64,
        new_voting_power: u64,
    }

    #[event]
    struct GovernanceProposalCreated has drop, store {
        proposal_id: u64,
        proposer: address,
        title: vector<u8>,
    }

    #[event]
    struct CURERewardPaid has drop, store {
        scorer: address,
        amount: u64,
        reason: vector<u8>,
    }

    /// Initialize CURE integration
    public entry fun initialize_cure_integration(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        let state = CUREIntegrationState {
            total_cure_staked: 0,
            total_scorers: 0,
            scorer_stakes: table::new(),
            governance_proposals: table::new(),
            proposal_counter: 0,
            community_treasury: 0,
            reward_pool: 0,
        };

        move_to(admin, state);
    }

    /// Stake CURE tokens to become an authorized scorer
    public entry fun stake_to_become_scorer(
        scorer: &signer,
        stake_amount: u64,
    ) acquires CUREIntegrationState {
        let scorer_addr = signer::address_of(scorer);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        assert!(stake_amount >= MIN_SCORER_STAKE, E_INSUFFICIENT_STAKE);

        // TODO: Transfer CURE tokens from scorer to contract
        // This would require the actual CURE token contract integration

        let voting_power = calculate_voting_power(stake_amount);
        
        let scorer_stake = ScorerStake {
            staked_amount: stake_amount,
            voting_power,
            rewards_earned: 0,
            accuracy_score: 100, // Start with perfect accuracy
            last_reward_claim: timestamp::now_microseconds(),
        };

        table::add(&mut state.scorer_stakes, scorer_addr, scorer_stake);
        state.total_cure_staked = state.total_cure_staked + stake_amount;
        state.total_scorers = state.total_scorers + 1;

        event::emit(ScorerStaked {
            scorer: scorer_addr,
            amount: stake_amount,
            new_voting_power: voting_power,
        });
    }

    /// Pay CURE fee to submit research proposal
    public entry fun pay_proposal_fee(
        researcher: &signer,
    ): u64 acquires CUREIntegrationState {
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);
        
        // TODO: Transfer CURE tokens from researcher to contract
        state.community_treasury = state.community_treasury + PROPOSAL_FEE;
        
        PROPOSAL_FEE
    }

    /// Create governance proposal to change scoring weights
    public entry fun create_governance_proposal(
        proposer: &signer,
        title: vector<u8>,
        description: vector<u8>,
        new_scientific_merit_weight: u8,
        new_feasibility_weight: u8, 
        new_community_weight: u8,
        new_resource_weight: u8,
        new_open_science_weight: u8,
    ) acquires CUREIntegrationState {
        let proposer_addr = signer::address_of(proposer);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        // Verify proposer is staked scorer
        assert!(table::contains(&state.scorer_stakes, proposer_addr), E_NOT_AUTHORIZED_SCORER);

        // Verify weights sum to 100
        assert!(
            new_scientific_merit_weight + new_feasibility_weight + 
            new_community_weight + new_resource_weight + new_open_science_weight == 100,
            E_INVALID_WEIGHTS
        );

        state.proposal_counter = state.proposal_counter + 1;
        let proposal_id = state.proposal_counter;

        let proposal = GovernanceProposal {
            proposal_id,
            proposer: proposer_addr,
            title,
            description,
            new_scientific_merit_weight,
            new_feasibility_weight,
            new_community_weight,
            new_resource_weight,
            new_open_science_weight,
            cure_votes_for: 0,
            cure_votes_against: 0,
            voting_ends: timestamp::now_microseconds() + 604800000000, // 7 days
            status: 0, // Active
        };

        table::add(&mut state.governance_proposals, proposal_id, proposal);

        event::emit(GovernanceProposalCreated {
            proposal_id,
            proposer: proposer_addr,
            title,
        });
    }

    /// Vote on governance proposal with CURE voting power
    public entry fun vote_on_proposal(
        voter: &signer,
        proposal_id: u64,
        vote_for: bool, // true = for, false = against
    ) acquires CUREIntegrationState {
        let voter_addr = signer::address_of(voter);
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);

        // Verify voter is staked scorer
        assert!(table::contains(&state.scorer_stakes, voter_addr), E_NOT_AUTHORIZED_SCORER);
        assert!(table::contains(&state.governance_proposals, proposal_id), E_PROPOSAL_NOT_FOUND);

        let scorer_stake = table::borrow(&state.scorer_stakes, voter_addr);
        let voting_power = scorer_stake.voting_power;

        let proposal = table::borrow_mut(&mut state.governance_proposals, proposal_id);
        assert!(proposal.status == 0, E_PROPOSAL_NOT_ACTIVE); // Must be active
        assert!(timestamp::now_microseconds() < proposal.voting_ends, E_VOTING_ENDED);

        if (vote_for) {
            proposal.cure_votes_for = proposal.cure_votes_for + voting_power;
        } else {
            proposal.cure_votes_against = proposal.cure_votes_against + voting_power;
        };
    }

    /// Reward accurate scorers with CURE tokens
    public entry fun reward_accurate_scorer(
        admin: &signer,
        scorer: address,
        bonus_amount: u64,
    ) acquires CUREIntegrationState {
        let state = borrow_global_mut<CUREIntegrationState>(@ant_scoring);
        
        assert!(table::contains(&state.scorer_stakes, scorer), E_NOT_AUTHORIZED_SCORER);
        
        let scorer_stake = table::borrow_mut(&mut state.scorer_stakes, scorer);
        scorer_stake.rewards_earned = scorer_stake.rewards_earned + bonus_amount;
        
        state.reward_pool = state.reward_pool + bonus_amount;

        event::emit(CURERewardPaid {
            scorer,
            amount: bonus_amount,
            reason: b"Accurate scoring bonus",
        });
    }

    /// Calculate voting power based on stake amount and accuracy
    fun calculate_voting_power(stake_amount: u64): u64 {
        // Base voting power is stake amount
        // Can be modified by accuracy multiplier later
        stake_amount
    }

    /// View functions
    #[view]
    public fun get_scorer_stake(scorer: address): ScorerStake acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        assert!(table::contains(&state.scorer_stakes, scorer), E_NOT_AUTHORIZED_SCORER);
        *table::borrow(&state.scorer_stakes, scorer)
    }

    #[view]
    public fun get_governance_proposal(proposal_id: u64): GovernanceProposal acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        assert!(table::contains(&state.governance_proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        *table::borrow(&state.governance_proposals, proposal_id)
    }

    #[view]
    public fun get_integration_stats(): (u64, u64, u64, u64) acquires CUREIntegrationState {
        let state = borrow_global<CUREIntegrationState>(@ant_scoring);
        (state.total_cure_staked, state.total_scorers, state.community_treasury, state.reward_pool)
    }

    // Error constants
    const E_INVALID_WEIGHTS: u64 = 104;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 105; 
    const E_VOTING_ENDED: u64 = 106;
}
>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
