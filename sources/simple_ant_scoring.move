<<<<<<< Updated upstream
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
/// Simple ANT Scoring System for Deployment Demo
module ant_scoring::simple_ant_scoring {
    use std::signer;
    use std::string::{Self, String};
    
    /// Simple proposal structure
    struct Proposal has key, store, copy, drop {
        id: u64,
        title: String,
        submitter: address,
        score: u64,
        is_funded: bool,
    }
    
    /// System state
    struct ScoringSystem has key {
        proposal_counter: u64,
        admin: address,
    }
    
    /// Initialize the scoring system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, ScoringSystem {
            proposal_counter: 0,
            admin: admin_addr,
        });
    }
    
    /// Submit a proposal
    public entry fun submit_proposal(
        submitter: &signer,
        title: String,
    ) acquires ScoringSystem {
        let submitter_addr = signer::address_of(submitter);
        let system = borrow_global_mut<ScoringSystem>(@ant_scoring);
        
        system.proposal_counter = system.proposal_counter + 1;
        
        let proposal = Proposal {
            id: system.proposal_counter,
            title,
            submitter: submitter_addr,
            score: 0,
            is_funded: false,
        };
        
        move_to(submitter, proposal);
    }
    
    /// Score a proposal
    public entry fun score_proposal(
        scorer: &signer,
        proposal_owner: address,
        score: u64,
    ) acquires Proposal {
        assert!(exists<Proposal>(proposal_owner), 1);
        
        let proposal = borrow_global_mut<Proposal>(proposal_owner);
        proposal.score = score;
        
        // Auto-fund if score >= 80
        if (score >= 80) {
            proposal.is_funded = true;
        };
    }
    
    /// View functions
    #[view]
    public fun get_proposal(owner: address): Proposal acquires Proposal {
        *borrow_global<Proposal>(owner)
    }
    
    #[view]
    public fun get_system_stats(): u64 acquires ScoringSystem {
        let system = borrow_global<ScoringSystem>(@ant_scoring);
        system.proposal_counter
    }
}





<<<<<<< Updated upstream

=======
/// Simple ANT Scoring System for Deployment Demo
module ant_scoring::simple_ant_scoring {
    use std::signer;
    use std::string::{Self, String};
    
    /// Simple proposal structure
    struct Proposal has key, store, copy, drop {
        id: u64,
        title: String,
        submitter: address,
        score: u64,
        is_funded: bool,
    }
    
    /// System state
    struct ScoringSystem has key {
        proposal_counter: u64,
        admin: address,
    }
    
    /// Initialize the scoring system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, ScoringSystem {
            proposal_counter: 0,
            admin: admin_addr,
        });
    }
    
    /// Submit a proposal
    public entry fun submit_proposal(
        submitter: &signer,
        title: String,
    ) acquires ScoringSystem {
        let submitter_addr = signer::address_of(submitter);
        let system = borrow_global_mut<ScoringSystem>(@ant_scoring);
        
        system.proposal_counter = system.proposal_counter + 1;
        
        let proposal = Proposal {
            id: system.proposal_counter,
            title,
            submitter: submitter_addr,
            score: 0,
            is_funded: false,
        };
        
        move_to(submitter, proposal);
    }
    
    /// Score a proposal
    public entry fun score_proposal(
        scorer: &signer,
        proposal_owner: address,
        score: u64,
    ) acquires Proposal {
        assert!(exists<Proposal>(proposal_owner), 1);
        
        let proposal = borrow_global_mut<Proposal>(proposal_owner);
        proposal.score = score;
        
        // Auto-fund if score >= 80
        if (score >= 80) {
            proposal.is_funded = true;
        };
    }
    
    /// View functions
    #[view]
    public fun get_proposal(owner: address): Proposal acquires Proposal {
        *borrow_global<Proposal>(owner)
    }
    
    #[view]
    public fun get_system_stats(): u64 acquires ScoringSystem {
        let system = borrow_global<ScoringSystem>(@ant_scoring);
        system.proposal_counter
    }
}





>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
