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
/// ANT Token Bonding Curve Implementation
module ant_scoring::bonding_curve {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_std::math64;

    /// Error codes
    const E_INSUFFICIENT_CURE: u64 = 200;
    const E_INSUFFICIENT_ANT: u64 = 201;
    const E_SLIPPAGE_EXCEEDED: u64 = 202;
    const E_CURVE_NOT_INITIALIZED: u64 = 203;
    const E_INVALID_AMOUNT: u64 = 204;

    /// Constants
    const RESERVE_RATIO: u64 = 500000; // 50% reserve ratio (scaled by 1M)
    const PRECISION: u64 = 1000000; // 1M for calculations
    const MAX_SUPPLY: u64 = 10000000000000; // 10M ANT (scaled by 1M)
    const INITIAL_PRICE: u64 = 100000; // 0.1 CURE per ANT (scaled)

    /// ANT Token structure
    struct ANTToken has key {}

    /// Bonding curve state
    struct BondingCurveState has key {
        current_supply: u64,      // Current ANT supply (scaled)
        reserve_balance: u64,     // CURE in reserve (scaled)
        reserve_ratio: u64,       // Reserve ratio (scaled)
        total_bought: u64,        // Total ANT tokens bought
        total_sold: u64,          // Total ANT tokens sold
        curve_active: bool,       // Is curve active for trading
        launch_timestamp: u64,    // When curve was launched
    }

    /// Trade event
    #[event]
    struct TokenPurchased has drop, store {
        buyer: address,
        cure_amount: u64,
        ant_received: u64,
        new_price: u64,
        new_supply: u64,
    }

    #[event]
    struct TokenSold has drop, store {
        seller: address,
        ant_amount: u64,
        cure_received: u64,
        new_price: u64,
        new_supply: u64,
    }

    /// Initialize the bonding curve
    public entry fun initialize_bonding_curve(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Initialize ANT token
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<ANTToken>(
            admin,
            b"ANT Token",
            b"ANT", 
            8, // decimals
            true, // monitor_supply
        );

        // Store capabilities (in real implementation, store securely)
        move_to(admin, MintCapability { mint_cap });
        move_to(admin, BurnCapability { burn_cap });

        // Initialize bonding curve state
        let state = BondingCurveState {
            current_supply: 0,
            reserve_balance: 0,
            reserve_ratio: RESERVE_RATIO,
            total_bought: 0,
            total_sold: 0,
            curve_active: true,
            launch_timestamp: timestamp::now_microseconds(),
        };

        move_to(admin, state);
        coin::destroy_freeze_cap(freeze_cap);
    }

    /// Buy ANT tokens with CURE
    public entry fun buy_ant_tokens(
        buyer: &signer,
        cure_amount: u64,
        min_ant_out: u64, // Slippage protection
    ) acquires BondingCurveState, MintCapability {
        let buyer_addr = signer::address_of(buyer);
        let state = borrow_global_mut<BondingCurveState>(@ant_scoring);
        let mint_cap = &borrow_global<MintCapability>(@ant_scoring).mint_cap;

        assert!(state.curve_active, E_CURVE_NOT_INITIALIZED);
        assert!(cure_amount > 0, E_INVALID_AMOUNT);

        // Calculate ANT tokens to mint using bonding curve formula
        let ant_to_mint = calculate_purchase_amount(
            state.current_supply,
            state.reserve_balance,
            cure_amount
        );

        assert!(ant_to_mint >= min_ant_out, E_SLIPPAGE_EXCEEDED);
        assert!(state.current_supply + ant_to_mint <= MAX_SUPPLY, E_INSUFFICIENT_ANT);

        // TODO: Transfer CURE from buyer to contract
        // This requires actual CURE token integration

        // Update state
        state.current_supply = state.current_supply + ant_to_mint;
        state.reserve_balance = state.reserve_balance + cure_amount;
        state.total_bought = state.total_bought + ant_to_mint;

        // Mint ANT tokens to buyer
        let ant_coins = coin::mint(ant_to_mint, mint_cap);
        coin::deposit(buyer_addr, ant_coins);

        // Calculate new price
        let new_price = calculate_current_price(state.current_supply, state.reserve_balance);

        event::emit(TokenPurchased {
            buyer: buyer_addr,
            cure_amount,
            ant_received: ant_to_mint,
            new_price,
            new_supply: state.current_supply,
        });
    }

    /// Sell ANT tokens for CURE
    public entry fun sell_ant_tokens(
        seller: &signer,
        ant_amount: u64,
        min_cure_out: u64, // Slippage protection
    ) acquires BondingCurveState, BurnCapability {
        let seller_addr = signer::address_of(seller);
        let state = borrow_global_mut<BondingCurveState>(@ant_scoring);
        let burn_cap = &borrow_global<BurnCapability>(@ant_scoring).burn_cap;

        assert!(state.curve_active, E_CURVE_NOT_INITIALIZED);
        assert!(ant_amount > 0, E_INVALID_AMOUNT);
        assert!(ant_amount <= state.current_supply, E_INSUFFICIENT_ANT);

        // Calculate CURE to return using reverse bonding curve
        let cure_to_return = calculate_sale_amount(
            state.current_supply,
            state.reserve_balance,
            ant_amount
        );

        assert!(cure_to_return >= min_cure_out, E_SLIPPAGE_EXCEEDED);
        assert!(cure_to_return <= state.reserve_balance, E_INSUFFICIENT_CURE);

        // Burn ANT tokens from seller
        let ant_coins = coin::withdraw<ANTToken>(seller, ant_amount);
        coin::burn(ant_coins, burn_cap);

        // TODO: Transfer CURE to seller
        // This requires actual CURE token integration

        // Update state
        state.current_supply = state.current_supply - ant_amount;
        state.reserve_balance = state.reserve_balance - cure_to_return;
        state.total_sold = state.total_sold + ant_amount;

        // Calculate new price
        let new_price = calculate_current_price(state.current_supply, state.reserve_balance);

        event::emit(TokenSold {
            seller: seller_addr,
            ant_amount,
            cure_received: cure_to_return,
            new_price,
            new_supply: state.current_supply,
        });
    }

    /// Calculate tokens to mint for purchase (Bancor formula)
    fun calculate_purchase_amount(
        supply: u64,
        reserve: u64,
        cure_deposit: u64,
    ): u64 {
        if (supply == 0) {
            // Initial purchase - use initial price
            return (cure_deposit * PRECISION) / INITIAL_PRICE
        };

        // Bancor formula: tokens_out = supply * ((1 + cure_in/reserve)^reserve_ratio - 1)
        // Simplified for gas efficiency: tokens_out ≈ (cure_in * supply) / (reserve + cure_in/2)
        let numerator = cure_deposit * supply;
        let denominator = reserve + cure_deposit / 2;
        
        if (denominator == 0) {
            return 0
        };

        (numerator / denominator)
    }

    /// Calculate CURE to return for sale (reverse Bancor)
    fun calculate_sale_amount(
        supply: u64,
        reserve: u64,
        ant_to_burn: u64,
    ): u64 {
        if (supply == 0 || supply <= ant_to_burn) {
            return 0
        };

        // Reverse Bancor: cure_out = reserve * (1 - (1 - tokens_in/supply)^(1/reserve_ratio))
        // Simplified: cure_out ≈ (tokens_in * reserve) / (supply - tokens_in/2)
        let numerator = ant_to_burn * reserve;
        let denominator = supply - ant_to_burn / 2;
        
        if (denominator == 0) {
            return 0
        };

        (numerator / denominator)
    }

    /// Calculate current token price
    fun calculate_current_price(supply: u64, reserve: u64): u64 {
        if (supply == 0) {
            return INITIAL_PRICE
        };

        // Price = reserve / supply (in CURE per ANT)
        (reserve * PRECISION) / supply
    }

    /// Get quote for buying ANT tokens
    #[view]
    public fun get_buy_quote(cure_amount: u64): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_purchase_amount(state.current_supply, state.reserve_balance, cure_amount)
    }

    /// Get quote for selling ANT tokens
    #[view]
    public fun get_sell_quote(ant_amount: u64): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_sale_amount(state.current_supply, state.reserve_balance, ant_amount)
    }

    /// Get current price
    #[view]
    public fun get_current_price(): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_current_price(state.current_supply, state.reserve_balance)
    }

    /// Get bonding curve stats
    #[view]
    public fun get_curve_stats(): (u64, u64, u64, u64, u64) acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        (
            state.current_supply,
            state.reserve_balance,
            state.total_bought,
            state.total_sold,
            calculate_current_price(state.current_supply, state.reserve_balance)
        )
    }

    /// Capability structs
    struct MintCapability has key {
        mint_cap: coin::MintCapability<ANTToken>,
    }

    struct BurnCapability has key {
        burn_cap: coin::BurnCapability<ANTToken>,
    }
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
/// ANT Token Bonding Curve Implementation
module ant_scoring::bonding_curve {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_std::math64;

    /// Error codes
    const E_INSUFFICIENT_CURE: u64 = 200;
    const E_INSUFFICIENT_ANT: u64 = 201;
    const E_SLIPPAGE_EXCEEDED: u64 = 202;
    const E_CURVE_NOT_INITIALIZED: u64 = 203;
    const E_INVALID_AMOUNT: u64 = 204;

    /// Constants
    const RESERVE_RATIO: u64 = 500000; // 50% reserve ratio (scaled by 1M)
    const PRECISION: u64 = 1000000; // 1M for calculations
    const MAX_SUPPLY: u64 = 10000000000000; // 10M ANT (scaled by 1M)
    const INITIAL_PRICE: u64 = 100000; // 0.1 CURE per ANT (scaled)

    /// ANT Token structure
    struct ANTToken has key {}

    /// Bonding curve state
    struct BondingCurveState has key {
        current_supply: u64,      // Current ANT supply (scaled)
        reserve_balance: u64,     // CURE in reserve (scaled)
        reserve_ratio: u64,       // Reserve ratio (scaled)
        total_bought: u64,        // Total ANT tokens bought
        total_sold: u64,          // Total ANT tokens sold
        curve_active: bool,       // Is curve active for trading
        launch_timestamp: u64,    // When curve was launched
    }

    /// Trade event
    #[event]
    struct TokenPurchased has drop, store {
        buyer: address,
        cure_amount: u64,
        ant_received: u64,
        new_price: u64,
        new_supply: u64,
    }

    #[event]
    struct TokenSold has drop, store {
        seller: address,
        ant_amount: u64,
        cure_received: u64,
        new_price: u64,
        new_supply: u64,
    }

    /// Initialize the bonding curve
    public entry fun initialize_bonding_curve(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Initialize ANT token
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<ANTToken>(
            admin,
            b"ANT Token",
            b"ANT", 
            8, // decimals
            true, // monitor_supply
        );

        // Store capabilities (in real implementation, store securely)
        move_to(admin, MintCapability { mint_cap });
        move_to(admin, BurnCapability { burn_cap });

        // Initialize bonding curve state
        let state = BondingCurveState {
            current_supply: 0,
            reserve_balance: 0,
            reserve_ratio: RESERVE_RATIO,
            total_bought: 0,
            total_sold: 0,
            curve_active: true,
            launch_timestamp: timestamp::now_microseconds(),
        };

        move_to(admin, state);
        coin::destroy_freeze_cap(freeze_cap);
    }

    /// Buy ANT tokens with CURE
    public entry fun buy_ant_tokens(
        buyer: &signer,
        cure_amount: u64,
        min_ant_out: u64, // Slippage protection
    ) acquires BondingCurveState, MintCapability {
        let buyer_addr = signer::address_of(buyer);
        let state = borrow_global_mut<BondingCurveState>(@ant_scoring);
        let mint_cap = &borrow_global<MintCapability>(@ant_scoring).mint_cap;

        assert!(state.curve_active, E_CURVE_NOT_INITIALIZED);
        assert!(cure_amount > 0, E_INVALID_AMOUNT);

        // Calculate ANT tokens to mint using bonding curve formula
        let ant_to_mint = calculate_purchase_amount(
            state.current_supply,
            state.reserve_balance,
            cure_amount
        );

        assert!(ant_to_mint >= min_ant_out, E_SLIPPAGE_EXCEEDED);
        assert!(state.current_supply + ant_to_mint <= MAX_SUPPLY, E_INSUFFICIENT_ANT);

        // TODO: Transfer CURE from buyer to contract
        // This requires actual CURE token integration

        // Update state
        state.current_supply = state.current_supply + ant_to_mint;
        state.reserve_balance = state.reserve_balance + cure_amount;
        state.total_bought = state.total_bought + ant_to_mint;

        // Mint ANT tokens to buyer
        let ant_coins = coin::mint(ant_to_mint, mint_cap);
        coin::deposit(buyer_addr, ant_coins);

        // Calculate new price
        let new_price = calculate_current_price(state.current_supply, state.reserve_balance);

        event::emit(TokenPurchased {
            buyer: buyer_addr,
            cure_amount,
            ant_received: ant_to_mint,
            new_price,
            new_supply: state.current_supply,
        });
    }

    /// Sell ANT tokens for CURE
    public entry fun sell_ant_tokens(
        seller: &signer,
        ant_amount: u64,
        min_cure_out: u64, // Slippage protection
    ) acquires BondingCurveState, BurnCapability {
        let seller_addr = signer::address_of(seller);
        let state = borrow_global_mut<BondingCurveState>(@ant_scoring);
        let burn_cap = &borrow_global<BurnCapability>(@ant_scoring).burn_cap;

        assert!(state.curve_active, E_CURVE_NOT_INITIALIZED);
        assert!(ant_amount > 0, E_INVALID_AMOUNT);
        assert!(ant_amount <= state.current_supply, E_INSUFFICIENT_ANT);

        // Calculate CURE to return using reverse bonding curve
        let cure_to_return = calculate_sale_amount(
            state.current_supply,
            state.reserve_balance,
            ant_amount
        );

        assert!(cure_to_return >= min_cure_out, E_SLIPPAGE_EXCEEDED);
        assert!(cure_to_return <= state.reserve_balance, E_INSUFFICIENT_CURE);

        // Burn ANT tokens from seller
        let ant_coins = coin::withdraw<ANTToken>(seller, ant_amount);
        coin::burn(ant_coins, burn_cap);

        // TODO: Transfer CURE to seller
        // This requires actual CURE token integration

        // Update state
        state.current_supply = state.current_supply - ant_amount;
        state.reserve_balance = state.reserve_balance - cure_to_return;
        state.total_sold = state.total_sold + ant_amount;

        // Calculate new price
        let new_price = calculate_current_price(state.current_supply, state.reserve_balance);

        event::emit(TokenSold {
            seller: seller_addr,
            ant_amount,
            cure_received: cure_to_return,
            new_price,
            new_supply: state.current_supply,
        });
    }

    /// Calculate tokens to mint for purchase (Bancor formula)
    fun calculate_purchase_amount(
        supply: u64,
        reserve: u64,
        cure_deposit: u64,
    ): u64 {
        if (supply == 0) {
            // Initial purchase - use initial price
            return (cure_deposit * PRECISION) / INITIAL_PRICE
        };

        // Bancor formula: tokens_out = supply * ((1 + cure_in/reserve)^reserve_ratio - 1)
        // Simplified for gas efficiency: tokens_out ≈ (cure_in * supply) / (reserve + cure_in/2)
        let numerator = cure_deposit * supply;
        let denominator = reserve + cure_deposit / 2;
        
        if (denominator == 0) {
            return 0
        };

        (numerator / denominator)
    }

    /// Calculate CURE to return for sale (reverse Bancor)
    fun calculate_sale_amount(
        supply: u64,
        reserve: u64,
        ant_to_burn: u64,
    ): u64 {
        if (supply == 0 || supply <= ant_to_burn) {
            return 0
        };

        // Reverse Bancor: cure_out = reserve * (1 - (1 - tokens_in/supply)^(1/reserve_ratio))
        // Simplified: cure_out ≈ (tokens_in * reserve) / (supply - tokens_in/2)
        let numerator = ant_to_burn * reserve;
        let denominator = supply - ant_to_burn / 2;
        
        if (denominator == 0) {
            return 0
        };

        (numerator / denominator)
    }

    /// Calculate current token price
    fun calculate_current_price(supply: u64, reserve: u64): u64 {
        if (supply == 0) {
            return INITIAL_PRICE
        };

        // Price = reserve / supply (in CURE per ANT)
        (reserve * PRECISION) / supply
    }

    /// Get quote for buying ANT tokens
    #[view]
    public fun get_buy_quote(cure_amount: u64): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_purchase_amount(state.current_supply, state.reserve_balance, cure_amount)
    }

    /// Get quote for selling ANT tokens
    #[view]
    public fun get_sell_quote(ant_amount: u64): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_sale_amount(state.current_supply, state.reserve_balance, ant_amount)
    }

    /// Get current price
    #[view]
    public fun get_current_price(): u64 acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        calculate_current_price(state.current_supply, state.reserve_balance)
    }

    /// Get bonding curve stats
    #[view]
    public fun get_curve_stats(): (u64, u64, u64, u64, u64) acquires BondingCurveState {
        let state = borrow_global<BondingCurveState>(@ant_scoring);
        (
            state.current_supply,
            state.reserve_balance,
            state.total_bought,
            state.total_sold,
            calculate_current_price(state.current_supply, state.reserve_balance)
        )
    }

    /// Capability structs
    struct MintCapability has key {
        mint_cap: coin::MintCapability<ANTToken>,
    }

    struct BurnCapability has key {
        burn_cap: coin::BurnCapability<ANTToken>,
    }
}
>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
