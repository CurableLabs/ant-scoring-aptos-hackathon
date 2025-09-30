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
/// ANT (Algorithmic Network Triage) Scoring System for Aptos
/// A decentralized proposal evaluation and funding system for CurableDAO
module ant_scoring::ant_scoring {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_std::smart_table::{Self, SmartTable};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;
    const E_PROPOSAL_NOT_FOUND: u64 = 3;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 4;
    const E_ALREADY_SCORED: u64 = 5;
    const E_INVALID_SCORE: u64 = 6;
    const E_NOT_PASSING: u64 = 7;
    const E_ALREADY_FULFILLED: u64 = 8;
    const E_NOT_OWNER: u64 = 9;

    /// Constants
    const PASSING_THRESHOLD: u8 = 80;
    const MAX_SCORE: u8 = 100;

    /// Scoring weights (out of 100)
    const SCIENTIFIC_MERIT_WEIGHT: u8 = 40;
    const FEASIBILITY_WEIGHT: u8 = 25;
    const COMMUNITY_ALIGNMENT_WEIGHT: u8 = 20;
    const RESOURCE_EFFICIENCY_WEIGHT: u8 = 10;
    const OPEN_SCIENCE_WEIGHT: u8 = 5;

    /// Scientific Merit Scores
    struct ScientificMeritScores has store, copy, drop {
        novelty: u8,
        biological_plausibility: u8,
        prior_evidence: u8,
    }

    /// Feasibility Scores
    struct FeasibilityScores has store, copy, drop {
        technical_viability: u8,
        data_quality: u8,
        clarity_of_protocol: u8,
    }

    /// Community Alignment Scores
    struct CommunityAlignmentScores has store, copy, drop {
        mission_fit: u8,
        dao_engagement: u8,
    }

    /// Resource Efficiency Scores
    struct ResourceEfficiencyScores has store, copy, drop {
        cost_effectiveness: u8,
        agentic_resource_use: u8,
    }

    /// Open Science Scores
    struct OpenScienceScores has store, copy, drop {
        data_protocol_sharing: u8,
        collaborative_potential: u8,
    }

    /// Proposal Score structure
    struct ProposalScore has store, copy, drop {
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
        final_score: u8,
        is_passing: bool,
        is_fulfilled: bool,
        timestamp: u64,
        scorer_count: u64,
    }

    /// Proposal structure
    struct Proposal has store {
        id: u64,
        submitter: address,
        title: String,
        description: String,
        ipfs_hash: String,
        scores: ProposalScore,
        scorers: vector<address>,
        is_active: bool,
        submission_time: u64,
    }

    /// Global state resource
    struct ANTScoringState has key {
        owner: address,
        curable_dao: address,
        proposal_counter: u64,
        proposals: Table<u64, Proposal>,
        authorized_scorers: SmartTable<address, bool>,
        active_proposals: vector<u64>,
        passing_proposals: vector<u64>,
        scored_proposals: Table<address, vector<u64>>, // scorer -> proposal_ids
    }

    /// Events
    #[event]
    struct ProposalSubmitted has drop, store {
        proposal_id: u64,
        submitter: address,
        title: String,
    }

    #[event]
    struct ProposalScored has drop, store {
        proposal_id: u64,
        scorer: address,
        final_score: u8,
        is_passing: bool,
    }

    #[event]
    struct ProposalFulfilled has drop, store {
        proposal_id: u64,
        fulfiller: address,
        final_score: u8,
    }

    #[event]
    struct ScorerAuthorized has drop, store {
        scorer: address,
    }

    #[event]
    struct ScorerRevoked has drop, store {
        scorer: address,
    }

    /// Initialize the ANT scoring system
    public entry fun initialize(account: &signer, curable_dao: address) {
        let owner = signer::address_of(account);
        
        let state = ANTScoringState {
            owner,
            curable_dao,
            proposal_counter: 0,
            proposals: table::new(),
            authorized_scorers: smart_table::new(),
            active_proposals: vector::empty(),
            passing_proposals: vector::empty(),
            scored_proposals: table::new(),
        };

        // Owner is initially authorized to score
        smart_table::add(&mut state.authorized_scorers, owner, true);
        
        move_to(account, state);
    }

    /// Submit a new proposal
    public entry fun submit_proposal(
        account: &signer,
        title: String,
        description: String,
        ipfs_hash: String,
    ) acquires ANTScoringState {
        let submitter = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        state.proposal_counter = state.proposal_counter + 1;
        let proposal_id = state.proposal_counter;

        let proposal = Proposal {
            id: proposal_id,
            submitter,
            title: title,
            description: description,
            ipfs_hash,
            scores: ProposalScore {
                scientific_merit: ScientificMeritScores { novelty: 0, biological_plausibility: 0, prior_evidence: 0 },
                feasibility: FeasibilityScores { technical_viability: 0, data_quality: 0, clarity_of_protocol: 0 },
                community_alignment: CommunityAlignmentScores { mission_fit: 0, dao_engagement: 0 },
                resource_efficiency: ResourceEfficiencyScores { cost_effectiveness: 0, agentic_resource_use: 0 },
                open_science: OpenScienceScores { data_protocol_sharing: 0, collaborative_potential: 0 },
                final_score: 0,
                is_passing: false,
                is_fulfilled: false,
                timestamp: timestamp::now_microseconds(),
                scorer_count: 0,
            },
            scorers: vector::empty(),
            is_active: true,
            submission_time: timestamp::now_microseconds(),
        };

        table::add(&mut state.proposals, proposal_id, proposal);
        vector::push_back(&mut state.active_proposals, proposal_id);

        event::emit(ProposalSubmitted {
            proposal_id,
            submitter,
            title: title,
        });
    }

    /// Score a proposal
    public entry fun score_proposal(
        account: &signer,
        proposal_id: u64,
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
    ) acquires ANTScoringState {
        let scorer = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);

        // Validate scorer authorization
        assert!(smart_table::contains(&state.authorized_scorers, scorer), E_NOT_AUTHORIZED);
        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);

        let proposal = table::borrow_mut(&mut state.proposals, proposal_id);
        assert!(proposal.is_active, E_PROPOSAL_NOT_ACTIVE);

        // Check if already scored by this address
        assert!(!vector::contains(&proposal.scorers, &scorer), E_ALREADY_SCORED);

        // Validate score ranges
        validate_scores(&scientific_merit, &feasibility, &community_alignment, &resource_efficiency, &open_science);

        // Update scores with averaging
        update_proposal_scores(proposal, scientific_merit, feasibility, community_alignment, resource_efficiency, open_science);

        // Calculate final score
        let final_score = calculate_final_score(&proposal.scores);
        proposal.scores.final_score = final_score;
        proposal.scores.is_passing = final_score >= PASSING_THRESHOLD;
        proposal.scores.timestamp = timestamp::now_microseconds();

        // Add scorer
        vector::push_back(&mut proposal.scorers, scorer);
        proposal.scores.scorer_count = proposal.scores.scorer_count + 1;

        // Track scored proposals for this scorer
        if (!table::contains(&state.scored_proposals, scorer)) {
            table::add(&mut state.scored_proposals, scorer, vector::empty());
        };
        let scored_list = table::borrow_mut(&mut state.scored_proposals, scorer);
        vector::push_back(scored_list, proposal_id);

        // Add to passing proposals if meets threshold
        if (proposal.scores.is_passing && !vector::contains(&state.passing_proposals, &proposal_id)) {
            vector::push_back(&mut state.passing_proposals, proposal_id);
        };

        event::emit(ProposalScored {
            proposal_id,
            scorer,
            final_score,
            is_passing: proposal.scores.is_passing,
        });
    }

    /// Fulfill a passing proposal
    public entry fun fulfill_proposal(
        account: &signer,
        proposal_id: u64,
    ) acquires ANTScoringState {
        let fulfiller = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);

        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        let proposal = table::borrow_mut(&mut state.proposals, proposal_id);
        
        assert!(proposal.is_active, E_PROPOSAL_NOT_ACTIVE);
        assert!(proposal.scores.is_passing, E_NOT_PASSING);
        assert!(!proposal.scores.is_fulfilled, E_ALREADY_FULFILLED);

        proposal.scores.is_fulfilled = true;

        event::emit(ProposalFulfilled {
            proposal_id,
            fulfiller,
            final_score: proposal.scores.final_score,
        });
    }

    /// Authorize a scorer (owner only)
    public entry fun authorize_scorer(
        account: &signer,
        scorer: address,
    ) acquires ANTScoringState {
        let owner = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        assert!(owner == state.owner, E_NOT_OWNER);
        
        smart_table::upsert(&mut state.authorized_scorers, scorer, true);

        event::emit(ScorerAuthorized { scorer });
    }

    /// Revoke scorer authorization (owner only)
    public entry fun revoke_scorer(
        account: &signer,
        scorer: address,
    ) acquires ANTScoringState {
        let owner = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        assert!(owner == state.owner, E_NOT_OWNER);
        
        smart_table::upsert(&mut state.authorized_scorers, scorer, false);

        event::emit(ScorerRevoked { scorer });
    }

    /// Helper functions

    fun validate_scores(
        scientific_merit: &ScientificMeritScores,
        feasibility: &FeasibilityScores,
        community_alignment: &CommunityAlignmentScores,
        resource_efficiency: &ResourceEfficiencyScores,
        open_science: &OpenScienceScores,
    ) {
        // Validate scientific merit scores
        assert!(scientific_merit.novelty <= MAX_SCORE, E_INVALID_SCORE);
        assert!(scientific_merit.biological_plausibility <= MAX_SCORE, E_INVALID_SCORE);
        assert!(scientific_merit.prior_evidence <= MAX_SCORE, E_INVALID_SCORE);

        // Validate feasibility scores
        assert!(feasibility.technical_viability <= MAX_SCORE, E_INVALID_SCORE);
        assert!(feasibility.data_quality <= MAX_SCORE, E_INVALID_SCORE);
        assert!(feasibility.clarity_of_protocol <= MAX_SCORE, E_INVALID_SCORE);

        // Validate community alignment scores
        assert!(community_alignment.mission_fit <= MAX_SCORE, E_INVALID_SCORE);
        assert!(community_alignment.dao_engagement <= MAX_SCORE, E_INVALID_SCORE);

        // Validate resource efficiency scores
        assert!(resource_efficiency.cost_effectiveness <= MAX_SCORE, E_INVALID_SCORE);
        assert!(resource_efficiency.agentic_resource_use <= MAX_SCORE, E_INVALID_SCORE);

        // Validate open science scores
        assert!(open_science.data_protocol_sharing <= MAX_SCORE, E_INVALID_SCORE);
        assert!(open_science.collaborative_potential <= MAX_SCORE, E_INVALID_SCORE);
    }

    fun update_proposal_scores(
        proposal: &mut Proposal,
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
    ) {
        let scorer_count = proposal.scores.scorer_count + 1;

        if (proposal.scores.scorer_count > 0) {
            // Average with existing scores
            let existing_count = proposal.scores.scorer_count;

            // Scientific Merit averaging
            proposal.scores.scientific_merit.novelty = ((proposal.scores.scientific_merit.novelty as u64 * existing_count + scientific_merit.novelty as u64) / scorer_count) as u8;
            proposal.scores.scientific_merit.biological_plausibility = ((proposal.scores.scientific_merit.biological_plausibility as u64 * existing_count + scientific_merit.biological_plausibility as u64) / scorer_count) as u8;
            proposal.scores.scientific_merit.prior_evidence = ((proposal.scores.scientific_merit.prior_evidence as u64 * existing_count + scientific_merit.prior_evidence as u64) / scorer_count) as u8;

            // Feasibility averaging
            proposal.scores.feasibility.technical_viability = ((proposal.scores.feasibility.technical_viability as u64 * existing_count + feasibility.technical_viability as u64) / scorer_count) as u8;
            proposal.scores.feasibility.data_quality = ((proposal.scores.feasibility.data_quality as u64 * existing_count + feasibility.data_quality as u64) / scorer_count) as u8;
            proposal.scores.feasibility.clarity_of_protocol = ((proposal.scores.feasibility.clarity_of_protocol as u64 * existing_count + feasibility.clarity_of_protocol as u64) / scorer_count) as u8;

            // Community Alignment averaging
            proposal.scores.community_alignment.mission_fit = ((proposal.scores.community_alignment.mission_fit as u64 * existing_count + community_alignment.mission_fit as u64) / scorer_count) as u8;
            proposal.scores.community_alignment.dao_engagement = ((proposal.scores.community_alignment.dao_engagement as u64 * existing_count + community_alignment.dao_engagement as u64) / scorer_count) as u8;

            // Resource Efficiency averaging
            proposal.scores.resource_efficiency.cost_effectiveness = ((proposal.scores.resource_efficiency.cost_effectiveness as u64 * existing_count + resource_efficiency.cost_effectiveness as u64) / scorer_count) as u8;
            proposal.scores.resource_efficiency.agentic_resource_use = ((proposal.scores.resource_efficiency.agentic_resource_use as u64 * existing_count + resource_efficiency.agentic_resource_use as u64) / scorer_count) as u8;

            // Open Science averaging
            proposal.scores.open_science.data_protocol_sharing = ((proposal.scores.open_science.data_protocol_sharing as u64 * existing_count + open_science.data_protocol_sharing as u64) / scorer_count) as u8;
            proposal.scores.open_science.collaborative_potential = ((proposal.scores.open_science.collaborative_potential as u64 * existing_count + open_science.collaborative_potential as u64) / scorer_count) as u8;
        } else {
            // First scorer, set directly
            proposal.scores.scientific_merit = scientific_merit;
            proposal.scores.feasibility = feasibility;
            proposal.scores.community_alignment = community_alignment;
            proposal.scores.resource_efficiency = resource_efficiency;
            proposal.scores.open_science = open_science;
        };
    }

    fun calculate_final_score(scores: &ProposalScore): u8 {
        // Calculate averages for each category
        let scientific_merit_avg = (scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3;
        let feasibility_avg = (scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3;
        let community_alignment_avg = (scores.community_alignment.mission_fit + scores.community_alignment.dao_engagement) / 2;
        let resource_efficiency_avg = (scores.resource_efficiency.cost_effectiveness + scores.resource_efficiency.agentic_resource_use) / 2;
        let open_science_avg = (scores.open_science.data_protocol_sharing + scores.open_science.collaborative_potential) / 2;

        // Apply weights and calculate final score
        let weighted_score = (
            (scientific_merit_avg as u64 * SCIENTIFIC_MERIT_WEIGHT as u64) +
            (feasibility_avg as u64 * FEASIBILITY_WEIGHT as u64) +
            (community_alignment_avg as u64 * COMMUNITY_ALIGNMENT_WEIGHT as u64) +
            (resource_efficiency_avg as u64 * RESOURCE_EFFICIENCY_WEIGHT as u64) +
            (open_science_avg as u64 * OPEN_SCIENCE_WEIGHT as u64)
        ) / 100;

        (weighted_score as u8)
    }

    /// View functions

    #[view]
    public fun get_proposal(proposal_id: u64): Proposal acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        *table::borrow(&state.proposals, proposal_id)
    }

    #[view]
    public fun get_active_proposals(): vector<u64> acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.active_proposals
    }

    #[view]
    public fun get_passing_proposals(): vector<u64> acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.passing_proposals
    }

    #[view]
    public fun is_authorized_scorer(scorer: address): bool acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        if (smart_table::contains(&state.authorized_scorers, scorer)) {
            *smart_table::borrow(&state.authorized_scorers, scorer)
        } else {
            false
        }
    }

    #[view]
    public fun get_proposal_count(): u64 acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.proposal_counter
    }
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
/// ANT (Algorithmic Network Triage) Scoring System for Aptos
/// A decentralized proposal evaluation and funding system for CurableDAO
module ant_scoring::ant_scoring {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_std::smart_table::{Self, SmartTable};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;
    const E_PROPOSAL_NOT_FOUND: u64 = 3;
    const E_PROPOSAL_NOT_ACTIVE: u64 = 4;
    const E_ALREADY_SCORED: u64 = 5;
    const E_INVALID_SCORE: u64 = 6;
    const E_NOT_PASSING: u64 = 7;
    const E_ALREADY_FULFILLED: u64 = 8;
    const E_NOT_OWNER: u64 = 9;

    /// Constants
    const PASSING_THRESHOLD: u8 = 80;
    const MAX_SCORE: u8 = 100;

    /// Scoring weights (out of 100)
    const SCIENTIFIC_MERIT_WEIGHT: u8 = 40;
    const FEASIBILITY_WEIGHT: u8 = 25;
    const COMMUNITY_ALIGNMENT_WEIGHT: u8 = 20;
    const RESOURCE_EFFICIENCY_WEIGHT: u8 = 10;
    const OPEN_SCIENCE_WEIGHT: u8 = 5;

    /// Scientific Merit Scores
    struct ScientificMeritScores has store, copy, drop {
        novelty: u8,
        biological_plausibility: u8,
        prior_evidence: u8,
    }

    /// Feasibility Scores
    struct FeasibilityScores has store, copy, drop {
        technical_viability: u8,
        data_quality: u8,
        clarity_of_protocol: u8,
    }

    /// Community Alignment Scores
    struct CommunityAlignmentScores has store, copy, drop {
        mission_fit: u8,
        dao_engagement: u8,
    }

    /// Resource Efficiency Scores
    struct ResourceEfficiencyScores has store, copy, drop {
        cost_effectiveness: u8,
        agentic_resource_use: u8,
    }

    /// Open Science Scores
    struct OpenScienceScores has store, copy, drop {
        data_protocol_sharing: u8,
        collaborative_potential: u8,
    }

    /// Proposal Score structure
    struct ProposalScore has store, copy, drop {
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
        final_score: u8,
        is_passing: bool,
        is_fulfilled: bool,
        timestamp: u64,
        scorer_count: u64,
    }

    /// Proposal structure
    struct Proposal has store {
        id: u64,
        submitter: address,
        title: String,
        description: String,
        ipfs_hash: String,
        scores: ProposalScore,
        scorers: vector<address>,
        is_active: bool,
        submission_time: u64,
    }

    /// Global state resource
    struct ANTScoringState has key {
        owner: address,
        curable_dao: address,
        proposal_counter: u64,
        proposals: Table<u64, Proposal>,
        authorized_scorers: SmartTable<address, bool>,
        active_proposals: vector<u64>,
        passing_proposals: vector<u64>,
        scored_proposals: Table<address, vector<u64>>, // scorer -> proposal_ids
    }

    /// Events
    #[event]
    struct ProposalSubmitted has drop, store {
        proposal_id: u64,
        submitter: address,
        title: String,
    }

    #[event]
    struct ProposalScored has drop, store {
        proposal_id: u64,
        scorer: address,
        final_score: u8,
        is_passing: bool,
    }

    #[event]
    struct ProposalFulfilled has drop, store {
        proposal_id: u64,
        fulfiller: address,
        final_score: u8,
    }

    #[event]
    struct ScorerAuthorized has drop, store {
        scorer: address,
    }

    #[event]
    struct ScorerRevoked has drop, store {
        scorer: address,
    }

    /// Initialize the ANT scoring system
    public entry fun initialize(account: &signer, curable_dao: address) {
        let owner = signer::address_of(account);
        
        let state = ANTScoringState {
            owner,
            curable_dao,
            proposal_counter: 0,
            proposals: table::new(),
            authorized_scorers: smart_table::new(),
            active_proposals: vector::empty(),
            passing_proposals: vector::empty(),
            scored_proposals: table::new(),
        };

        // Owner is initially authorized to score
        smart_table::add(&mut state.authorized_scorers, owner, true);
        
        move_to(account, state);
    }

    /// Submit a new proposal
    public entry fun submit_proposal(
        account: &signer,
        title: String,
        description: String,
        ipfs_hash: String,
    ) acquires ANTScoringState {
        let submitter = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        state.proposal_counter = state.proposal_counter + 1;
        let proposal_id = state.proposal_counter;

        let proposal = Proposal {
            id: proposal_id,
            submitter,
            title: title,
            description: description,
            ipfs_hash,
            scores: ProposalScore {
                scientific_merit: ScientificMeritScores { novelty: 0, biological_plausibility: 0, prior_evidence: 0 },
                feasibility: FeasibilityScores { technical_viability: 0, data_quality: 0, clarity_of_protocol: 0 },
                community_alignment: CommunityAlignmentScores { mission_fit: 0, dao_engagement: 0 },
                resource_efficiency: ResourceEfficiencyScores { cost_effectiveness: 0, agentic_resource_use: 0 },
                open_science: OpenScienceScores { data_protocol_sharing: 0, collaborative_potential: 0 },
                final_score: 0,
                is_passing: false,
                is_fulfilled: false,
                timestamp: timestamp::now_microseconds(),
                scorer_count: 0,
            },
            scorers: vector::empty(),
            is_active: true,
            submission_time: timestamp::now_microseconds(),
        };

        table::add(&mut state.proposals, proposal_id, proposal);
        vector::push_back(&mut state.active_proposals, proposal_id);

        event::emit(ProposalSubmitted {
            proposal_id,
            submitter,
            title: title,
        });
    }

    /// Score a proposal
    public entry fun score_proposal(
        account: &signer,
        proposal_id: u64,
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
    ) acquires ANTScoringState {
        let scorer = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);

        // Validate scorer authorization
        assert!(smart_table::contains(&state.authorized_scorers, scorer), E_NOT_AUTHORIZED);
        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);

        let proposal = table::borrow_mut(&mut state.proposals, proposal_id);
        assert!(proposal.is_active, E_PROPOSAL_NOT_ACTIVE);

        // Check if already scored by this address
        assert!(!vector::contains(&proposal.scorers, &scorer), E_ALREADY_SCORED);

        // Validate score ranges
        validate_scores(&scientific_merit, &feasibility, &community_alignment, &resource_efficiency, &open_science);

        // Update scores with averaging
        update_proposal_scores(proposal, scientific_merit, feasibility, community_alignment, resource_efficiency, open_science);

        // Calculate final score
        let final_score = calculate_final_score(&proposal.scores);
        proposal.scores.final_score = final_score;
        proposal.scores.is_passing = final_score >= PASSING_THRESHOLD;
        proposal.scores.timestamp = timestamp::now_microseconds();

        // Add scorer
        vector::push_back(&mut proposal.scorers, scorer);
        proposal.scores.scorer_count = proposal.scores.scorer_count + 1;

        // Track scored proposals for this scorer
        if (!table::contains(&state.scored_proposals, scorer)) {
            table::add(&mut state.scored_proposals, scorer, vector::empty());
        };
        let scored_list = table::borrow_mut(&mut state.scored_proposals, scorer);
        vector::push_back(scored_list, proposal_id);

        // Add to passing proposals if meets threshold
        if (proposal.scores.is_passing && !vector::contains(&state.passing_proposals, &proposal_id)) {
            vector::push_back(&mut state.passing_proposals, proposal_id);
        };

        event::emit(ProposalScored {
            proposal_id,
            scorer,
            final_score,
            is_passing: proposal.scores.is_passing,
        });
    }

    /// Fulfill a passing proposal
    public entry fun fulfill_proposal(
        account: &signer,
        proposal_id: u64,
    ) acquires ANTScoringState {
        let fulfiller = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);

        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        let proposal = table::borrow_mut(&mut state.proposals, proposal_id);
        
        assert!(proposal.is_active, E_PROPOSAL_NOT_ACTIVE);
        assert!(proposal.scores.is_passing, E_NOT_PASSING);
        assert!(!proposal.scores.is_fulfilled, E_ALREADY_FULFILLED);

        proposal.scores.is_fulfilled = true;

        event::emit(ProposalFulfilled {
            proposal_id,
            fulfiller,
            final_score: proposal.scores.final_score,
        });
    }

    /// Authorize a scorer (owner only)
    public entry fun authorize_scorer(
        account: &signer,
        scorer: address,
    ) acquires ANTScoringState {
        let owner = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        assert!(owner == state.owner, E_NOT_OWNER);
        
        smart_table::upsert(&mut state.authorized_scorers, scorer, true);

        event::emit(ScorerAuthorized { scorer });
    }

    /// Revoke scorer authorization (owner only)
    public entry fun revoke_scorer(
        account: &signer,
        scorer: address,
    ) acquires ANTScoringState {
        let owner = signer::address_of(account);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        assert!(owner == state.owner, E_NOT_OWNER);
        
        smart_table::upsert(&mut state.authorized_scorers, scorer, false);

        event::emit(ScorerRevoked { scorer });
    }

    /// Helper functions

    fun validate_scores(
        scientific_merit: &ScientificMeritScores,
        feasibility: &FeasibilityScores,
        community_alignment: &CommunityAlignmentScores,
        resource_efficiency: &ResourceEfficiencyScores,
        open_science: &OpenScienceScores,
    ) {
        // Validate scientific merit scores
        assert!(scientific_merit.novelty <= MAX_SCORE, E_INVALID_SCORE);
        assert!(scientific_merit.biological_plausibility <= MAX_SCORE, E_INVALID_SCORE);
        assert!(scientific_merit.prior_evidence <= MAX_SCORE, E_INVALID_SCORE);

        // Validate feasibility scores
        assert!(feasibility.technical_viability <= MAX_SCORE, E_INVALID_SCORE);
        assert!(feasibility.data_quality <= MAX_SCORE, E_INVALID_SCORE);
        assert!(feasibility.clarity_of_protocol <= MAX_SCORE, E_INVALID_SCORE);

        // Validate community alignment scores
        assert!(community_alignment.mission_fit <= MAX_SCORE, E_INVALID_SCORE);
        assert!(community_alignment.dao_engagement <= MAX_SCORE, E_INVALID_SCORE);

        // Validate resource efficiency scores
        assert!(resource_efficiency.cost_effectiveness <= MAX_SCORE, E_INVALID_SCORE);
        assert!(resource_efficiency.agentic_resource_use <= MAX_SCORE, E_INVALID_SCORE);

        // Validate open science scores
        assert!(open_science.data_protocol_sharing <= MAX_SCORE, E_INVALID_SCORE);
        assert!(open_science.collaborative_potential <= MAX_SCORE, E_INVALID_SCORE);
    }

    fun update_proposal_scores(
        proposal: &mut Proposal,
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
    ) {
        let scorer_count = proposal.scores.scorer_count + 1;

        if (proposal.scores.scorer_count > 0) {
            // Average with existing scores
            let existing_count = proposal.scores.scorer_count;

            // Scientific Merit averaging
            proposal.scores.scientific_merit.novelty = ((proposal.scores.scientific_merit.novelty as u64 * existing_count + scientific_merit.novelty as u64) / scorer_count) as u8;
            proposal.scores.scientific_merit.biological_plausibility = ((proposal.scores.scientific_merit.biological_plausibility as u64 * existing_count + scientific_merit.biological_plausibility as u64) / scorer_count) as u8;
            proposal.scores.scientific_merit.prior_evidence = ((proposal.scores.scientific_merit.prior_evidence as u64 * existing_count + scientific_merit.prior_evidence as u64) / scorer_count) as u8;

            // Feasibility averaging
            proposal.scores.feasibility.technical_viability = ((proposal.scores.feasibility.technical_viability as u64 * existing_count + feasibility.technical_viability as u64) / scorer_count) as u8;
            proposal.scores.feasibility.data_quality = ((proposal.scores.feasibility.data_quality as u64 * existing_count + feasibility.data_quality as u64) / scorer_count) as u8;
            proposal.scores.feasibility.clarity_of_protocol = ((proposal.scores.feasibility.clarity_of_protocol as u64 * existing_count + feasibility.clarity_of_protocol as u64) / scorer_count) as u8;

            // Community Alignment averaging
            proposal.scores.community_alignment.mission_fit = ((proposal.scores.community_alignment.mission_fit as u64 * existing_count + community_alignment.mission_fit as u64) / scorer_count) as u8;
            proposal.scores.community_alignment.dao_engagement = ((proposal.scores.community_alignment.dao_engagement as u64 * existing_count + community_alignment.dao_engagement as u64) / scorer_count) as u8;

            // Resource Efficiency averaging
            proposal.scores.resource_efficiency.cost_effectiveness = ((proposal.scores.resource_efficiency.cost_effectiveness as u64 * existing_count + resource_efficiency.cost_effectiveness as u64) / scorer_count) as u8;
            proposal.scores.resource_efficiency.agentic_resource_use = ((proposal.scores.resource_efficiency.agentic_resource_use as u64 * existing_count + resource_efficiency.agentic_resource_use as u64) / scorer_count) as u8;

            // Open Science averaging
            proposal.scores.open_science.data_protocol_sharing = ((proposal.scores.open_science.data_protocol_sharing as u64 * existing_count + open_science.data_protocol_sharing as u64) / scorer_count) as u8;
            proposal.scores.open_science.collaborative_potential = ((proposal.scores.open_science.collaborative_potential as u64 * existing_count + open_science.collaborative_potential as u64) / scorer_count) as u8;
        } else {
            // First scorer, set directly
            proposal.scores.scientific_merit = scientific_merit;
            proposal.scores.feasibility = feasibility;
            proposal.scores.community_alignment = community_alignment;
            proposal.scores.resource_efficiency = resource_efficiency;
            proposal.scores.open_science = open_science;
        };
    }

    fun calculate_final_score(scores: &ProposalScore): u8 {
        // Calculate averages for each category
        let scientific_merit_avg = (scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3;
        let feasibility_avg = (scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3;
        let community_alignment_avg = (scores.community_alignment.mission_fit + scores.community_alignment.dao_engagement) / 2;
        let resource_efficiency_avg = (scores.resource_efficiency.cost_effectiveness + scores.resource_efficiency.agentic_resource_use) / 2;
        let open_science_avg = (scores.open_science.data_protocol_sharing + scores.open_science.collaborative_potential) / 2;

        // Apply weights and calculate final score
        let weighted_score = (
            (scientific_merit_avg as u64 * SCIENTIFIC_MERIT_WEIGHT as u64) +
            (feasibility_avg as u64 * FEASIBILITY_WEIGHT as u64) +
            (community_alignment_avg as u64 * COMMUNITY_ALIGNMENT_WEIGHT as u64) +
            (resource_efficiency_avg as u64 * RESOURCE_EFFICIENCY_WEIGHT as u64) +
            (open_science_avg as u64 * OPEN_SCIENCE_WEIGHT as u64)
        ) / 100;

        (weighted_score as u8)
    }

    /// View functions

    #[view]
    public fun get_proposal(proposal_id: u64): Proposal acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        assert!(table::contains(&state.proposals, proposal_id), E_PROPOSAL_NOT_FOUND);
        *table::borrow(&state.proposals, proposal_id)
    }

    #[view]
    public fun get_active_proposals(): vector<u64> acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.active_proposals
    }

    #[view]
    public fun get_passing_proposals(): vector<u64> acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.passing_proposals
    }

    #[view]
    public fun is_authorized_scorer(scorer: address): bool acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        if (smart_table::contains(&state.authorized_scorers, scorer)) {
            *smart_table::borrow(&state.authorized_scorers, scorer)
        } else {
            false
        }
    }

    #[view]
    public fun get_proposal_count(): u64 acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        state.proposal_counter
    }
}
>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
