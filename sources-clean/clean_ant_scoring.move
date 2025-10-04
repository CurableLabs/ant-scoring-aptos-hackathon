/// Clean ANT Scoring System - Production Ready
module ant_scoring::clean_ant_scoring {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::timestamp;
    
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
    
    /// Complete proposal score
    struct ProposalScore has store, copy, drop {
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
        final_score: u8,
        is_passing: bool,
        is_fulfilled: bool,
        scorer_count: u64,
        timestamp: u64,
    }
    
    /// Research Proposal
    struct Proposal has key, store {
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
    
    /// System state
    struct ANTScoringState has key {
        owner: address,
        proposal_counter: u64,
        authorized_scorers: vector<address>,
        passing_threshold: u8, // Default 80%
        active_proposal_count: u64,
    }
    
    /// Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_NOT_AUTHORIZED_SCORER: u64 = 2;
    const E_PROPOSAL_NOT_FOUND: u64 = 3;
    const E_ALREADY_SCORED: u64 = 4;
    const E_INVALID_SCORE: u64 = 5;
    const E_PROPOSAL_NOT_PASSING: u64 = 6;
    const E_ALREADY_FULFILLED: u64 = 7;
    
    /// ANT Scoring weights (multiplied by 100 for precision)
    const WEIGHT_SCIENTIFIC_MERIT: u64 = 40;
    const WEIGHT_FEASIBILITY: u64 = 25;
    const WEIGHT_COMMUNITY_ALIGNMENT: u64 = 20;
    const WEIGHT_RESOURCE_EFFICIENCY: u64 = 10;
    const WEIGHT_OPEN_SCIENCE: u64 = 5;
    
    /// Initialize the ANT scoring system
    public entry fun initialize(owner: &signer) {
        let owner_addr = signer::address_of(owner);
        
        move_to(owner, ANTScoringState {
            owner: owner_addr,
            proposal_counter: 0,
            authorized_scorers: vector::empty(),
            passing_threshold: 80,
            active_proposal_count: 0,
        });
    }
    
    /// Submit a research proposal
    public entry fun submit_proposal(
        submitter: &signer,
        title: String,
        description: String,
        ipfs_hash: String,
    ) acquires ANTScoringState {
        let submitter_addr = signer::address_of(submitter);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        
        state.proposal_counter = state.proposal_counter + 1;
        state.active_proposal_count = state.active_proposal_count + 1;
        
        let empty_scores = ProposalScore {
            scientific_merit: ScientificMeritScores { novelty: 0, biological_plausibility: 0, prior_evidence: 0 },
            feasibility: FeasibilityScores { technical_viability: 0, data_quality: 0, clarity_of_protocol: 0 },
            community_alignment: CommunityAlignmentScores { mission_fit: 0, dao_engagement: 0 },
            resource_efficiency: ResourceEfficiencyScores { cost_effectiveness: 0, agentic_resource_use: 0 },
            open_science: OpenScienceScores { data_protocol_sharing: 0, collaborative_potential: 0 },
            final_score: 0,
            is_passing: false,
            is_fulfilled: false,
            scorer_count: 0,
            timestamp: timestamp::now_seconds(),
        };
        
        let proposal = Proposal {
            id: state.proposal_counter,
            submitter: submitter_addr,
            title,
            description,
            ipfs_hash,
            scores: empty_scores,
            scorers: vector::empty(),
            is_active: true,
            submission_time: timestamp::now_seconds(),
        };
        
        move_to(submitter, proposal);
    }
    
    /// Score a proposal (authorized scorers only)
    public entry fun score_proposal(
        scorer: &signer,
        proposal_owner: address,
        scientific_merit: ScientificMeritScores,
        feasibility: FeasibilityScores,
        community_alignment: CommunityAlignmentScores,
        resource_efficiency: ResourceEfficiencyScores,
        open_science: OpenScienceScores,
    ) acquires ANTScoringState, Proposal {
        let scorer_addr = signer::address_of(scorer);
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        
        // Verify scorer is authorized
        assert!(vector::contains(&state.authorized_scorers, &scorer_addr), E_NOT_AUTHORIZED_SCORER);
        
        // Verify proposal exists and scorer hasn't scored before
        assert!(exists<Proposal>(proposal_owner), E_PROPOSAL_NOT_FOUND);
        let proposal = borrow_global_mut<Proposal>(proposal_owner);
        assert!(!vector::contains(&proposal.scorers, &scorer_addr), E_ALREADY_SCORED);
        
        // Validate all scores are between 0-100
        validate_scores(&scientific_merit, &feasibility, &community_alignment, &resource_efficiency, &open_science);
        
        // Add scorer to list
        vector::push_back(&mut proposal.scorers, scorer_addr);
        
        // Calculate weighted final score
        let final_score = calculate_final_score(
            &scientific_merit, 
            &feasibility, 
            &community_alignment, 
            &resource_efficiency, 
            &open_science
        );
        
        // Update scores (averaging with existing scores)
        if (proposal.scores.scorer_count == 0) {
            proposal.scores = ProposalScore {
                scientific_merit,
                feasibility,
                community_alignment,
                resource_efficiency,
                open_science,
                final_score,
                is_passing: final_score >= state.passing_threshold,
                is_fulfilled: false,
                scorer_count: 1,
                timestamp: timestamp::now_seconds(),
            };
        } else {
            // Average with existing scores
            proposal.scores = average_scores(
                &proposal.scores,
                scientific_merit,
                feasibility,
                community_alignment,
                resource_efficiency,
                open_science,
                final_score
            );
            proposal.scores.is_passing = proposal.scores.final_score >= state.passing_threshold;
        };
    }
    
    /// Fulfill a passing proposal
    public entry fun fulfill_proposal(
        fulfiller: &signer,
        proposal_owner: address,
    ) acquires Proposal {
        let _fulfiller_addr = signer::address_of(fulfiller);
        
        assert!(exists<Proposal>(proposal_owner), E_PROPOSAL_NOT_FOUND);
        let proposal = borrow_global_mut<Proposal>(proposal_owner);
        
        assert!(proposal.scores.is_passing, E_PROPOSAL_NOT_PASSING);
        assert!(!proposal.scores.is_fulfilled, E_ALREADY_FULFILLED);
        
        proposal.scores.is_fulfilled = true;
        proposal.is_active = false;
    }
    
    /// Admin functions
    public entry fun add_authorized_scorer(
        owner: &signer,
        new_scorer: address,
    ) acquires ANTScoringState {
        let owner_addr = signer::address_of(owner);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        assert!(owner_addr == state.owner, E_NOT_OWNER);
        
        if (!vector::contains(&state.authorized_scorers, &new_scorer)) {
            vector::push_back(&mut state.authorized_scorers, new_scorer);
        };
    }
    
    public entry fun remove_authorized_scorer(
        owner: &signer,
        scorer: address,
    ) acquires ANTScoringState {
        let owner_addr = signer::address_of(owner);
        let state = borrow_global_mut<ANTScoringState>(@ant_scoring);
        assert!(owner_addr == state.owner, E_NOT_OWNER);
        
        let (found, index) = vector::index_of(&state.authorized_scorers, &scorer);
        if (found) {
            vector::remove(&mut state.authorized_scorers, index);
        };
    }
    
    /// Helper functions
    fun validate_scores(
        scientific: &ScientificMeritScores,
        feasibility: &FeasibilityScores,
        community: &CommunityAlignmentScores,
        resource: &ResourceEfficiencyScores,
        open_science: &OpenScienceScores,
    ) {
        // Validate scientific merit scores
        assert!(scientific.novelty <= 100, E_INVALID_SCORE);
        assert!(scientific.biological_plausibility <= 100, E_INVALID_SCORE);
        assert!(scientific.prior_evidence <= 100, E_INVALID_SCORE);
        
        // Validate feasibility scores
        assert!(feasibility.technical_viability <= 100, E_INVALID_SCORE);
        assert!(feasibility.data_quality <= 100, E_INVALID_SCORE);
        assert!(feasibility.clarity_of_protocol <= 100, E_INVALID_SCORE);
        
        // Validate community alignment scores
        assert!(community.mission_fit <= 100, E_INVALID_SCORE);
        assert!(community.dao_engagement <= 100, E_INVALID_SCORE);
        
        // Validate resource efficiency scores
        assert!(resource.cost_effectiveness <= 100, E_INVALID_SCORE);
        assert!(resource.agentic_resource_use <= 100, E_INVALID_SCORE);
        
        // Validate open science scores
        assert!(open_science.data_protocol_sharing <= 100, E_INVALID_SCORE);
        assert!(open_science.collaborative_potential <= 100, E_INVALID_SCORE);
    }
    
    fun calculate_final_score(
        scientific: &ScientificMeritScores,
        feasibility: &FeasibilityScores,
        community: &CommunityAlignmentScores,
        resource: &ResourceEfficiencyScores,
        open_science: &OpenScienceScores,
    ): u8 {
        let scientific_avg = ((scientific.novelty as u64) + (scientific.biological_plausibility as u64) + (scientific.prior_evidence as u64)) / 3;
        let feasibility_avg = ((feasibility.technical_viability as u64) + (feasibility.data_quality as u64) + (feasibility.clarity_of_protocol as u64)) / 3;
        let community_avg = ((community.mission_fit as u64) + (community.dao_engagement as u64)) / 2;
        let resource_avg = ((resource.cost_effectiveness as u64) + (resource.agentic_resource_use as u64)) / 2;
        let open_science_avg = ((open_science.data_protocol_sharing as u64) + (open_science.collaborative_potential as u64)) / 2;
        
        let weighted_score = (
            scientific_avg * WEIGHT_SCIENTIFIC_MERIT +
            feasibility_avg * WEIGHT_FEASIBILITY +
            community_avg * WEIGHT_COMMUNITY_ALIGNMENT +
            resource_avg * WEIGHT_RESOURCE_EFFICIENCY +
            open_science_avg * WEIGHT_OPEN_SCIENCE
        ) / 100;
        
        (weighted_score as u8)
    }
    
    fun average_scores(
        existing: &ProposalScore,
        new_scientific: ScientificMeritScores,
        new_feasibility: FeasibilityScores,
        new_community: CommunityAlignmentScores,
        new_resource: ResourceEfficiencyScores,
        new_open_science: OpenScienceScores,
        new_final: u8,
    ): ProposalScore {
        let count = existing.scorer_count;
        let new_count = count + 1;
        
        ProposalScore {
            scientific_merit: ScientificMeritScores {
                novelty: (((existing.scientific_merit.novelty as u64) * count + (new_scientific.novelty as u64)) / new_count as u8),
                biological_plausibility: (((existing.scientific_merit.biological_plausibility as u64) * count + (new_scientific.biological_plausibility as u64)) / new_count as u8),
                prior_evidence: (((existing.scientific_merit.prior_evidence as u64) * count + (new_scientific.prior_evidence as u64)) / new_count as u8),
            },
            feasibility: FeasibilityScores {
                technical_viability: (((existing.feasibility.technical_viability as u64) * count + (new_feasibility.technical_viability as u64)) / new_count as u8),
                data_quality: (((existing.feasibility.data_quality as u64) * count + (new_feasibility.data_quality as u64)) / new_count as u8),
                clarity_of_protocol: (((existing.feasibility.clarity_of_protocol as u64) * count + (new_feasibility.clarity_of_protocol as u64)) / new_count as u8),
            },
            community_alignment: CommunityAlignmentScores {
                mission_fit: (((existing.community_alignment.mission_fit as u64) * count + (new_community.mission_fit as u64)) / new_count as u8),
                dao_engagement: (((existing.community_alignment.dao_engagement as u64) * count + (new_community.dao_engagement as u64)) / new_count as u8),
            },
            resource_efficiency: ResourceEfficiencyScores {
                cost_effectiveness: (((existing.resource_efficiency.cost_effectiveness as u64) * count + (new_resource.cost_effectiveness as u64)) / new_count as u8),
                agentic_resource_use: (((existing.resource_efficiency.agentic_resource_use as u64) * count + (new_resource.agentic_resource_use as u64)) / new_count as u8),
            },
            open_science: OpenScienceScores {
                data_protocol_sharing: (((existing.open_science.data_protocol_sharing as u64) * count + (new_open_science.data_protocol_sharing as u64)) / new_count as u8),
                collaborative_potential: (((existing.open_science.collaborative_potential as u64) * count + (new_open_science.collaborative_potential as u64)) / new_count as u8),
            },
            final_score: (((existing.final_score as u64) * count + (new_final as u64)) / new_count as u8),
            is_passing: false, // Will be set by caller
            is_fulfilled: existing.is_fulfilled,
            scorer_count: new_count,
            timestamp: timestamp::now_seconds(),
        }
    }
    
    /// View functions
    #[view]
    public fun get_system_info(): (address, u64, u64, u8) acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        (state.owner, state.proposal_counter, state.active_proposal_count, state.passing_threshold)
    }
    
    #[view]
    public fun get_proposal_info(proposal_owner: address): (u64, String, String, String, u8, bool, bool, u64) acquires Proposal {
        let proposal = borrow_global<Proposal>(proposal_owner);
        (proposal.id, proposal.title, proposal.description, proposal.ipfs_hash, 
         proposal.scores.final_score, proposal.scores.is_passing, proposal.scores.is_fulfilled, proposal.scores.scorer_count)
    }
    
    #[view]
    public fun is_authorized_scorer(scorer: address): bool acquires ANTScoringState {
        let state = borrow_global<ANTScoringState>(@ant_scoring);
        vector::contains(&state.authorized_scorers, &scorer)
    }
}
