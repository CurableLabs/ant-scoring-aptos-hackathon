// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BondingCurve2 - ANT Token Bonding Curve
 * @notice Implements a Bancor-style bonding curve for ANT token trading
 * @dev Converted from clean_bonding_curve.move (Aptos)
 * 
 * FEATURES:
 * - Buy ANT tokens with CURE (price increases with supply)
 * - Sell ANT tokens for CURE (price decreases with supply)
 * - Automated market maker (always liquid, no order book)
 * - Slippage protection on all trades
 * - View functions for price quotes and statistics
 * 
 * BONDING CURVE MECHANICS:
 * - Uses Bancor formula (simplified for gas efficiency)
 * - 50% reserve ratio for price stability
 * - Starts from zero supply/reserve
 * - Max supply: 10M ANT tokens
 * - Initial price: 0.1 CURE per ANT
 * 
 * SECURITY:
 * - Owner-controlled initialization
 * - Custom errors for gas efficiency
 * - Comprehensive event logging
 * - Slippage protection prevents frontrunning
 * 
 * @author Curable Labs Team
 * @custom:conversion-date November 11, 2025
 */
contract BondingCurve2 {
    
    // State Variables
    address public owner;
    uint256 public currentSupply;        // Current ANT supply
    uint256 public reserveBalance;       // CURE in reserve
    uint256 public reserveRatio;         // Reserve ratio
    uint256 public totalBought;          // Total ANT tokens bought
    uint256 public totalSold;            // Total ANT tokens sold
    bool public curveActive;             // Is curve active for trading
    uint256 public launchTimestamp;      // When curve was launched

    // Constants
    uint256 public constant RESERVE_RATIO = 500000;        // 50% reserve ratio (scaled by 1M)
    uint256 public constant PRECISION = 1000000;           // 1M for calculations
    uint256 public constant MAX_SUPPLY = 10000000000000;   // 10M ANT (scaled by 1M)
    uint256 public constant INITIAL_PRICE = 100000; 
    


    // Mappings
    mapping(address => uint256) public antBalances;    // Track ANT token balances for each user       // 0.1 CURE per ANT (scaled)


    // Events
     event ANTTokenPurchased(
        address indexed buyer,
        uint256 cureAmount,
        uint256 antReceived,
        uint256 newPrice,
        uint256 newSupply
     );

     event ANTTokenSold(
        address indexed seller,
        uint256 antAmount,
        uint256 cureReceived,
        uint256 newPrice,
        uint256 newSupply
     );

     event BondingCurveInitialized(
        address indexed owner,
        uint256 timestamp

     );

    
    // Custom Errors
    error InsufficientCURE();
    error InsufficientANT();
    error SlippageExceeded(uint256 expected, uint256 actual);
    error CurveNotInitialized();
    error InvalidAmount();
    error CurveAlreadyInitialized();
    error NotOwner();
    error MaxSupplyExceeded();

    // Modifiers
     modifier onlyOwner()  {
        if(msg.sender != owner) revert NotOwner();
        _;}
 
    // Constructor
    constructor() {
        owner = msg.sender;              // Deployer becomes owner
        currentSupply = 0;               // Start with 0 ANT tokens
        reserveBalance = 0;              // Start with 0 CURE in reserve
        reserveRatio = RESERVE_RATIO;    // Set to 50% (500000)
        totalBought = 0;                 // No tokens bought yet
        totalSold = 0;                   // No tokens sold yet
        curveActive = false;             // Not active until initialized
    }

        // Initialize the bonding curve (owner only, runs once)
    function initializeBondingCurve() external onlyOwner {
        if(curveActive) revert CurveAlreadyInitialized();
    
        curveActive = true;                    // Activate trading
        launchTimestamp = block.timestamp;     // Record launch time
        
        emit BondingCurveInitialized(owner, block.timestamp);
    }


     
      // Buy ANT tokens with CURE (bonding curve pricing)
     // cureAmount = Amount of CURE to spend
    // minAntOut = Minimum ANT tokens expected (slippage protection)
    function buyANTTokens(uint256 cureAmount, uint256 minAntOut) external payable {
        if(!curveActive) revert CurveNotInitialized();
        if(cureAmount == 0) revert InvalidAmount();
        
        // Calculate how many ANT tokens to give using bonding curve formula
        uint256 antToMint = calculatePurchaseAmount(currentSupply, reserveBalance, cureAmount);
        
        // Check slippage protection
        if(antToMint < minAntOut) revert SlippageExceeded(minAntOut, antToMint);
        
        // Check max supply not exceeded
        uint256 newSupply = currentSupply + antToMint;
        if(newSupply > MAX_SUPPLY) revert MaxSupplyExceeded();
        
        // Update state
        currentSupply = newSupply;
        reserveBalance = reserveBalance + cureAmount;
        totalBought = totalBought + antToMint;
        antBalances[msg.sender] = antBalances[msg.sender] + antToMint;
        
        // Calculate new price
        uint256 newPrice = calculateCurrentPrice(currentSupply, reserveBalance);
        
        emit ANTTokenPurchased(msg.sender, cureAmount, antToMint, newPrice, newSupply);
    }

        // Sell ANT tokens for CURE (bonding curve pricing)
    // antAmount = Amount of ANT tokens to sell
    // minCureOut = Minimum CURE expected (slippage protection)
    function sellANTTokens(uint256 antAmount, uint256 minCureOut) external {
        if(!curveActive) revert CurveNotInitialized();
        if(antAmount == 0) revert InvalidAmount();
        if(antBalances[msg.sender] < antAmount) revert InsufficientANT();
        
        // Calculate how much CURE to return using bonding curve formula
        uint256 cureToReturn = calculateSaleAmount(currentSupply, reserveBalance, antAmount);
        
        // Check slippage protection
        if(cureToReturn < minCureOut) revert SlippageExceeded(minCureOut, cureToReturn);
        
        // Check reserve has enough CURE
        if(cureToReturn > reserveBalance) revert InsufficientCURE();
        
        // Update state
        currentSupply = currentSupply - antAmount;
        reserveBalance = reserveBalance - cureToReturn;
        totalSold = totalSold + antAmount;
        antBalances[msg.sender] = antBalances[msg.sender] - antAmount;
        
        // Calculate new price
        uint256 newPrice = calculateCurrentPrice(currentSupply, reserveBalance);
        
        // TODO: Transfer CURE to seller (needs CURE token integration)
        
        emit ANTTokenSold(msg.sender, antAmount, cureToReturn, newPrice, currentSupply);
    }




    // ========== HELPER FUNCTIONS (Internal Math) ==========
    
    // Calculate tokens to mint for purchase (Bancor formula)
    // supply = Current ANT supply
    // reserve = Current CURE in reserve
    // cureDeposit = Amount of CURE being deposited
    function calculatePurchaseAmount(
        uint256 supply,
        uint256 reserve,
        uint256 cureDeposit
    ) internal pure returns (uint256) {
        // If first purchase, use initial price
        if (supply == 0) {
            return (cureDeposit * PRECISION) / INITIAL_PRICE;
        }
        
        // Bancor formula (simplified for gas efficiency):
        // tokens_out ≈ (cure_in * supply) / (reserve + cure_in/2)
        uint256 numerator = cureDeposit * supply;
        uint256 denominator = reserve + cureDeposit / 2;
        
        if (denominator == 0) {
            return 0;
        }
        
        return numerator / denominator;
    }
    
    // Calculate CURE to return for sale (reverse Bancor)
    // supply = Current ANT supply
    // reserve = Current CURE in reserve
    // antToBurn = Amount of ANT being sold
    function calculateSaleAmount(
        uint256 supply,
        uint256 reserve,
        uint256 antToBurn
    ) internal pure returns (uint256) {
        // Safety checks
        if (supply == 0 || supply <= antToBurn) {
            return 0;
        }
        
        // Reverse Bancor formula (simplified):
        // cure_out ≈ (tokens_in * reserve) / (supply - tokens_in/2)
        uint256 numerator = antToBurn * reserve;
        uint256 denominator = supply - antToBurn / 2;
        
        if (denominator == 0) {
            return 0;
        }
        
        return numerator / denominator;
    }
    
    // Calculate current token price
    // supply = Current ANT supply
    // reserve = Current CURE in reserve
    function calculateCurrentPrice(uint256 supply, uint256 reserve) internal pure returns (uint256) {
        // If no supply yet, return initial price
        if (supply == 0) {
            return INITIAL_PRICE;
        }
        
        // Price = reserve / supply (in CURE per ANT)
        return (reserve * PRECISION) / supply;
    }    


    // ========== VIEW FUNCTIONS ==========
    
    // Get quote for buying ANT tokens
    // cureAmount = Amount of CURE user wants to spend
    // Returns: Amount of ANT tokens they would receive
    function getBuyQuote(uint256 cureAmount) external view returns (uint256) {
        return calculatePurchaseAmount(currentSupply, reserveBalance, cureAmount);
    }
    
    // Get quote for selling ANT tokens
    // antAmount = Amount of ANT tokens user wants to sell
    // Returns: Amount of CURE they would receive
    function getSellQuote(uint256 antAmount) external view returns (uint256) {
        return calculateSaleAmount(currentSupply, reserveBalance, antAmount);
    }
    
    // Get current ANT token price in CURE
    // Returns: Current price (CURE per ANT, scaled by PRECISION)
    function getCurrentPrice() external view returns (uint256) {
        return calculateCurrentPrice(currentSupply, reserveBalance);
    }
    
    // Get comprehensive bonding curve statistics
    // Returns: All key curve metrics in one call
    function getCurveStats() external view returns (
        uint256 supply,
        uint256 reserve,
        uint256 price,
        uint256 bought,
        uint256 sold,
        bool active,
        uint256 launched
    ) {
        return (
            currentSupply,
            reserveBalance,
            calculateCurrentPrice(currentSupply, reserveBalance),
            totalBought,
            totalSold,
            curveActive,
            launchTimestamp
        );
    }
    
    // Get ANT token balance for an address
    // account = Address to check balance for
    // Returns: ANT token balance
    function getANTBalance(address account) external view returns (uint256) {
        return antBalances[account];
    }
}
