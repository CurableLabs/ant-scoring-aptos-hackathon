// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BondingCurve
 * @notice Implements Bancor bonding curve for ANT token trading
 * @dev Allows buying ANT tokens with CURE and selling ANT back for CURE
 */
contract BondingCurve {
    //State Variables
    address public owner;
    uint256 public currentSupply;
    uint256 public reserveBalance;
    uint256 public reserveRatio;
    uint256 public totalBought;
    uint256 public totalSold;
    bool public curveActive;
    uint256 public launchTimestamp;
    
    //Mappings
    //ANT Token mapping
    mapping(address => uint256) public antBalances;

    //Error Codes
    string constant E_INSUFFICIENT_CURE = "Insufficient CURE balance";
    string constant E_INSUFFICIENT_ANT = "Insufficient ANT balance";
    string constant E_SLIPPAGE_EXCEEDED = "Slippage exceeded";
    string constant E_CURVE_NOT_INITIALIZED = "Bonding curve not initialized";
    string constant E_INVALID_AMOUNT = "Invalid amount";

    
    //Constants
    uint256 public constant RESERVE_RATIO = 500000;
    uint256 public constant PRECISION = 1000000;
    uint256 public constant MAX_SUPPLY = 10000000000000;
    uint256 public constant INITIAL_PRICE = 100000;
    
    //Events
    event ANTTokensPurchased(
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
        uint256 currentSupply
    );
    
    //Modifiers
    modifier onlyOwner(){
        require(msg.sender == owner, "ONLY OWNER CAN CALL THIS FUNCTION");
        _;
    }

    //Constructor
    constructor(){
        owner = msg.sender;
        currentSupply = 0;
        reserveBalance = 0;
        reserveRatio =  RESERVE_RATIO;
        totalBought = 0;
        totalSold = 0;
        curveActive = false;
    }
    
    //External Functions
    function initializeBondingCurve() external onlyOwner(){
        require(!curveActive, "CURVE ALREADY INITIALIZED");
        require(reserveRatio > 0 && reserveRatio == RESERVE_RATIO, "INVALID RESERVE RATIO");
        curveActive = true;
        launchTimestamp = block.timestamp;
        emit BondingCurveInitialized(owner, currentSupply);
    }

    //Buy ANT tokens with CURE
    function buyANTTokens( uint256 cureAmount, uint256 minAntOut) external {
        require(curveActive == true, "CURVE NOT ACTIVE");
        require(cureAmount > 0, "INVALID CURE AMOUNT");

        uint256 antReceived = calculatePurchaseAmount(
            currentSupply,
            reserveBalance,
            cureAmount
        );

        require(antReceived >= minAntOut, "SLIPPAGE EXCEEDED");
        require(currentSupply + antReceived <= MAX_SUPPLY, "INSUFFICIENT ANT");

        //Update state
        currentSupply += antReceived;
        reserveBalance += cureAmount;
        totalBought += antReceived;
        antBalances[msg.sender] += antReceived;

        //Calculate new price
        uint256 newPrice = calculateCurrentPrice(currentSupply, reserveBalance);
        uint256 newSupply = currentSupply;

        //Emit event
        emit ANTTokensPurchased(
            msg.sender,
            cureAmount,
            antReceived,
            newPrice,
            newSupply
        );
    }

    //Sell ANT tokens for CURE
    function sellAntTokens( uint256 antAmount, uint256 minCureOut) external {
        require(curveActive == true, "CURVE NOT ACTIVE");
        require(antAmount > 0, "INVALID ANT AMOUNT");
        require (antAmount <= currentSupply, "INSUFFICIENT ANT");
        require(antBalances[msg.sender] >= antAmount, "INSUFFICIENT ANT BALANCE");
        
        //Calculate CURE to return
        uint256 cureReceived = calculateSaleAmount(
            currentSupply,
            reserveBalance,
            antAmount
        );

        //Validate Slippage and Reserve Balance
        require(cureReceived >= minCureOut, "SLIPPAGE EXCEEDED");
        require(cureReceived <= reserveBalance, "INSUFFICIENT CURE");

        //Update State
        currentSupply -= antAmount;
        reserveBalance -= cureReceived;
        totalSold += antAmount;
        antBalances[msg.sender] -= antAmount;

        //Calculate new Price
        uint256 newPrice = calculateCurrentPrice(currentSupply, reserveBalance);

        emit ANTTokenSold(
            msg.sender,
            antAmount,
            cureReceived,
            newPrice,
            currentSupply
        );
    }   

    //Internal Helper Functions
    //Calculate tokens to mint for purchase (Bancor formula)
    function calculatePurchaseAmount(
        uint256 supply,
        uint256 reserve,
        uint256 cureDeposit
    ) internal pure returns(uint256){
        if (supply == 0 ){
            return((cureDeposit * PRECISION) / INITIAL_PRICE);
        }
        //Bancor formula: tokens_out = supply * ((1 + cure_in/reserve)^reserve_ratio - 1)
        //Simplified for gas efficiency: tokens_out ≈ (cure_in * supply) / (reserve + cure_in/2)
        uint256 numerator = cureDeposit * supply;
        uint256 denominator = reserve + cureDeposit/2;

        if (denominator == 0){
            return 0;
        }

        return (numerator / denominator);
    }

    //Calculate CURE to return for sale (reverse Bancor)
    function calculateSaleAmount(
        uint256 supply,
        uint256 reserve,
        uint256 antToBurn
    ) internal pure returns(uint256){
        if (supply == 0 || supply <= antToBurn){
            return 0;
        }
        //Reverse Bancor: cure_out = reserve * (1 - (1 - tokens_in/supply)^(1/reserve_ratio))
        //Simplified: cure_out ≈ (tokens_in * reserve) / (supply - tokens_in/2)
        uint256 numerator = antToBurn * reserve;
        uint256 denominator = supply - antToBurn/2;

        if (denominator == 0){
            return 0;
        }

        return (numerator / denominator);
    }

    //Calculate current token price
    function calculateCurrentPrice(
        uint256 supply,
        uint256 reserve
    ) internal pure returns(uint256){
        if (supply == 0){
            return INITIAL_PRICE;
        }
        //Price = reserve / supply (in CURE per ANT)
        return ((reserve * PRECISION) / supply);
    }
    
    //View Functions
    //Get quote for buying ANT tokens
    function getBuyQuote(uint256 cureAmount) external view returns(uint256){
        return calculatePurchaseAmount(currentSupply, reserveBalance, cureAmount);
    }
    //Get quote for selling ANT tokens
    function getSellQuote(uint256 antAmount) external view returns(uint256){
        return calculateSaleAmount(currentSupply, reserveBalance, antAmount);
    }
    //Get current price
    function getCurrentPrice() external view returns(uint256){
        return calculateCurrentPrice(currentSupply, reserveBalance);
    }
    //Get bonding curve stats
    function getCurveStats() external view returns(uint256, uint256, uint256, uint256, uint256){
        return (currentSupply, reserveBalance, totalBought, totalSold, calculateCurrentPrice(currentSupply, reserveBalance));
    }
}
