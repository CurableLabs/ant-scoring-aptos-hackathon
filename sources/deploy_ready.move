/// Deployable ANT Scoring System for Demo
module ant_scoring::deploy_ready {
    use std::signer;
    
    /// Lab Credit - Non-transferable IP proof  
    struct LabCredit has key {
        credit_id: u64,
        inventor: address,
        ip_title: vector<u8>,
        timestamp: u64,
    }
    
    /// CURE Token holder info
    struct CUREHolder has key {
        balance: u64,
        staked: u64,
        phase: u8, // 1=fixed, 2=dynamic
    }
    
    /// Sub-DAO token
    struct SubDAOToken has key {
        dao_id: u64,
        token_supply: u64,
        bonding_active: bool,
    }
    
    /// System state
    struct TriLaneSystem has key {
        lab_credits_issued: u64,
        cure_total_supply: u64,
        subdao_count: u64,
        admin: address,
    }
    
    /// Initialize the tri-lane system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, TriLaneSystem {
            lab_credits_issued: 0,
            cure_total_supply: 0,
            subdao_count: 0,
            admin: admin_addr,
        });
    }
    
    /// Lane 1: Issue Lab Credit (Non-transferable)
    public entry fun issue_lab_credit(
        inventor: &signer,
        ip_title: vector<u8>,
    ) acquires TriLaneSystem {
        let inventor_addr = signer::address_of(inventor);
        let system = borrow_global_mut<TriLaneSystem>(@ant_scoring);
        
        system.lab_credits_issued = system.lab_credits_issued + 1;
        
        let lab_credit = LabCredit {
            credit_id: system.lab_credits_issued,
            inventor: inventor_addr,
            ip_title,
            timestamp: 1695686400, // Demo timestamp
        };
        
        move_to(inventor, lab_credit);
    }
    
    /// Lane 2: Acquire CURE tokens
    public entry fun acquire_cure_tokens(
        buyer: &signer,
        amount: u64,
    ) acquires TriLaneSystem {
        let buyer_addr = signer::address_of(buyer);
        let system = borrow_global_mut<TriLaneSystem>(@ant_scoring);
        
        system.cure_total_supply = system.cure_total_supply + amount;
        
        if (!exists<CUREHolder>(buyer_addr)) {
            move_to(buyer, CUREHolder {
                balance: amount,
                staked: 0,
                phase: 1, // Start in Phase 1
            });
        } else {
            let holder = borrow_global_mut<CUREHolder>(buyer_addr);
            holder.balance = holder.balance + amount;
        };
    }
    
    /// Lane 2: Stake CURE on research
    public entry fun stake_cure_on_research(
        staker: &signer,
        stake_amount: u64,
    ) acquires CUREHolder {
        let staker_addr = signer::address_of(staker);
        let holder = borrow_global_mut<CUREHolder>(staker_addr);
        
        assert!(holder.balance >= stake_amount, 1);
        
        holder.balance = holder.balance - stake_amount;
        holder.staked = holder.staked + stake_amount;
    }
    
    /// Lane 3: Create Sub-DAO
    public entry fun create_subdao(
        creator: &signer,
        initial_supply: u64,
    ) acquires TriLaneSystem {
        let creator_addr = signer::address_of(creator);
        let system = borrow_global_mut<TriLaneSystem>(@ant_scoring);
        
        system.subdao_count = system.subdao_count + 1;
        
        let subdao_token = SubDAOToken {
            dao_id: system.subdao_count,
            token_supply: initial_supply,
            bonding_active: true,
        };
        
        move_to(creator, subdao_token);
    }
    
    /// Trigger Phase 2 (Dynamic pricing)
    public entry fun activate_phase_2(
        admin: &signer,
        holder: address,
    ) acquires TriLaneSystem, CUREHolder {
        let admin_addr = signer::address_of(admin);
        let system = borrow_global<TriLaneSystem>(@ant_scoring);
        assert!(admin_addr == system.admin, 2);
        
        let cure_holder = borrow_global_mut<CUREHolder>(holder);
        cure_holder.phase = 2; // Enable dynamic pricing
    }
    
    /// View functions
    #[view]
    public fun get_system_stats(): (u64, u64, u64) acquires TriLaneSystem {
        let system = borrow_global<TriLaneSystem>(@ant_scoring);
        (system.lab_credits_issued, system.cure_total_supply, system.subdao_count)
    }
    
    #[view]
    public fun get_lab_credit(inventor: address): (u64, vector<u8>) acquires LabCredit {
        let credit = borrow_global<LabCredit>(inventor);
        (credit.credit_id, credit.ip_title)
    }
    
    #[view]
    public fun get_cure_balance(holder: address): (u64, u64, u8) acquires CUREHolder {
        let holder_info = borrow_global<CUREHolder>(holder);
        (holder_info.balance, holder_info.staked, holder_info.phase)
    }
}





