/// Clean Minimal Tri-Lane Token System - Production Ready
module ant_scoring::clean_minimal_tri_lane {
    use std::signer;
    use std::timestamp;
    
    /// System state
    struct TriLaneState has key {
        lab_credits_issued: u64,
        cure_total_supply: u64,
        subdao_count: u64,
        admin: address,
    }
    
    /// Lab Credit (Lane 1)
    struct LabCredit has key {
        credit_id: u64,
        inventor: address,
        timestamp: u64,
    }
    
    /// CURE Holder (Lane 2)
    struct CUREHolder has key {
        balance: u64,
        staked: u64,
        phase: u8,
    }
    
    /// Sub-DAO (Lane 3) 
    struct SubDAO has key {
        dao_id: u64,
        token_supply: u64,
        is_active: bool,
    }
    
    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_INVALID_AMOUNT: u64 = 3;
    const E_ALREADY_EXISTS: u64 = 4;
    
    /// Initialize system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, TriLaneState {
            lab_credits_issued: 0,
            cure_total_supply: 0,
            subdao_count: 0,
            admin: admin_addr,
        });
    }
    
    /// Issue Lab Credit (Lane 1)
    public entry fun issue_lab_credit(inventor: &signer) acquires TriLaneState {
        let inventor_addr = signer::address_of(inventor);
        assert!(!exists<LabCredit>(inventor_addr), E_ALREADY_EXISTS);
        
        let state = borrow_global_mut<TriLaneState>(@ant_scoring);
        state.lab_credits_issued = state.lab_credits_issued + 1;
        
        move_to(inventor, LabCredit {
            credit_id: state.lab_credits_issued,
            inventor: inventor_addr,
            timestamp: timestamp::now_seconds(),
        });
    }
    
    /// Buy CURE tokens (Lane 2)
    public entry fun buy_cure_tokens(buyer: &signer, amount: u64) acquires TriLaneState, CUREHolder {
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let buyer_addr = signer::address_of(buyer);
        let state = borrow_global_mut<TriLaneState>(@ant_scoring);
        state.cure_total_supply = state.cure_total_supply + amount;
        
        if (!exists<CUREHolder>(buyer_addr)) {
            move_to(buyer, CUREHolder {
                balance: amount,
                staked: 0,
                phase: 1,
            });
        } else {
            let holder = borrow_global_mut<CUREHolder>(buyer_addr);
            holder.balance = holder.balance + amount;
        };
    }
    
    /// Stake CURE tokens
    public entry fun stake_cure_tokens(staker: &signer, amount: u64) acquires CUREHolder {
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let staker_addr = signer::address_of(staker);
        let holder = borrow_global_mut<CUREHolder>(staker_addr);
        assert!(holder.balance >= amount, E_INSUFFICIENT_BALANCE);
        
        holder.balance = holder.balance - amount;
        holder.staked = holder.staked + amount;
    }
    
    /// Create Sub-DAO (Lane 3)
    public entry fun create_subdao(creator: &signer, initial_supply: u64) acquires TriLaneState {
        assert!(initial_supply > 0, E_INVALID_AMOUNT);
        
        let creator_addr = signer::address_of(creator);
        assert!(!exists<SubDAO>(creator_addr), E_ALREADY_EXISTS);
        
        let state = borrow_global_mut<TriLaneState>(@ant_scoring);
        state.subdao_count = state.subdao_count + 1;
        
        move_to(creator, SubDAO {
            dao_id: state.subdao_count,
            token_supply: initial_supply,
            is_active: true,
        });
    }
    
    /// View functions
    #[view]
    public fun get_system_state(): (u64, u64, u64) acquires TriLaneState {
        let state = borrow_global<TriLaneState>(@ant_scoring);
        (state.lab_credits_issued, state.cure_total_supply, state.subdao_count)
    }
    
    #[view]
    public fun get_lab_credit_info(inventor: address): (u64, u64) acquires LabCredit {
        let credit = borrow_global<LabCredit>(inventor);
        (credit.credit_id, credit.timestamp)
    }
    
    #[view]
    public fun get_cure_holder_info(holder: address): (u64, u64, u8) acquires CUREHolder {
        let holder_info = borrow_global<CUREHolder>(holder);
        (holder_info.balance, holder_info.staked, holder_info.phase)
    }
    
    #[view]
    public fun get_subdao_info(creator: address): (u64, u64, bool) acquires SubDAO {
        let subdao = borrow_global<SubDAO>(creator);
        (subdao.dao_id, subdao.token_supply, subdao.is_active)
    }
}
