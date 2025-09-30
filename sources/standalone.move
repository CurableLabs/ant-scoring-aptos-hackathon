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
/// Standalone Tri-Lane System - No External Dependencies
module ant_scoring::standalone {
    struct TriLane has key {
        credits: u64,
        cure: u64, 
        daos: u64,
    }
    
    public entry fun init(admin: &signer) {
        move_to(admin, TriLane { credits: 0, cure: 0, daos: 0 });
    }
    
    public entry fun issue_credit(user: &signer) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.credits = state.credits + 1;
    }
    
    public entry fun buy_cure(user: &signer, amount: u64) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.cure = state.cure + amount;
    }
    
    public entry fun create_dao(user: &signer) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.daos = state.daos + 1;
    }
    
    #[view]
    public fun get_stats(): (u64, u64, u64) acquires TriLane {
        let state = borrow_global<TriLane>(@ant_scoring);
        (state.credits, state.cure, state.daos)
    }
}





<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

=======
/// Standalone Tri-Lane System - No External Dependencies
module ant_scoring::standalone {
    struct TriLane has key {
        credits: u64,
        cure: u64, 
        daos: u64,
    }
    
    public entry fun init(admin: &signer) {
        move_to(admin, TriLane { credits: 0, cure: 0, daos: 0 });
    }
    
    public entry fun issue_credit(user: &signer) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.credits = state.credits + 1;
    }
    
    public entry fun buy_cure(user: &signer, amount: u64) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.cure = state.cure + amount;
    }
    
    public entry fun create_dao(user: &signer) acquires TriLane {
        let state = borrow_global_mut<TriLane>(@ant_scoring);
        state.daos = state.daos + 1;
    }
    
    #[view]
    public fun get_stats(): (u64, u64, u64) acquires TriLane {
        let state = borrow_global<TriLane>(@ant_scoring);
        (state.credits, state.cure, state.daos)
    }
}





>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
