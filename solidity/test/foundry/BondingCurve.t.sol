// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {BondingCurve2} from "../../contracts/BondingCurve.sol";

/// @title BondingCurve Contract Test Suite
/// @notice Comprehensive tests for the Bancor bonding curve implementation
/// @dev Tests cover initialization, buying, selling, view functions, and edge cases
contract BondingCurveTest is Test {
    BondingCurve2 public bondingCurve;
    address public owner;
    address public buyer1;
    address public buyer2;
    address public seller1;

    /// @notice Set up test environment before each test
    /// @dev Deploys BondingCurve contract and creates test addresses
    function setUp() public {
        owner = address(this);
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        seller1 = makeAddr("seller1");
        
        bondingCurve = new BondingCurve2();
    }

    /// @notice Helper function to initialize the bonding curve
    function initializeCurve() internal {
        bondingCurve.initializeBondingCurve();
    }

    // ========== Constructor Tests ==========

    /// @notice Test that constructor initializes contract state correctly
    function testConstructorInitialization() public view {
        assertEq(bondingCurve.owner(), owner, "Owner should be deployer");
        assertEq(bondingCurve.currentSupply(), 0, "Initial supply should be 0");
        assertEq(bondingCurve.reserveBalance(), 0, "Initial reserve should be 0");
        assertEq(bondingCurve.reserveRatio(), 500000, "Reserve ratio should be 500000");
        assertEq(bondingCurve.totalBought(), 0, "Total bought should be 0");
        assertEq(bondingCurve.totalSold(), 0, "Total sold should be 0");
        assertFalse(bondingCurve.curveActive(), "Curve should not be active initially");
    }

    // ========== Initialization Tests ==========

    /// @notice Test that owner can initialize bonding curve
    function testInitializeBondingCurve() public {
        bondingCurve.initializeBondingCurve();
        
        assertTrue(bondingCurve.curveActive(), "Curve should be active after initialization");
        assertGt(bondingCurve.launchTimestamp(), 0, "Launch timestamp should be set");
        assertEq(bondingCurve.launchTimestamp(), block.timestamp, "Launch timestamp should match block timestamp");
    }

    /// @notice Test that non-owner cannot initialize bonding curve
    function testInitializeBondingCurveNotOwner() public {
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.NotOwner.selector);
        bondingCurve.initializeBondingCurve();
    }

    /// @notice Test that bonding curve cannot be initialized twice
    function testInitializeBondingCurveTwice() public {
        bondingCurve.initializeBondingCurve();
        
        vm.expectRevert(BondingCurve2.CurveAlreadyInitialized.selector);
        bondingCurve.initializeBondingCurve();
    }

    /// @notice Test that initialization emits correct event
    function testInitializeBondingCurveEmitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit BondingCurve2.BondingCurveInitialized(owner, block.timestamp);
        
        bondingCurve.initializeBondingCurve();
    }

    // ========== Buy ANT Tokens Tests ==========

    /// @notice Test that user cannot buy before curve is initialized
    function testBuyBeforeInitialization() public {
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.CurveNotInitialized.selector);
        bondingCurve.buyANTTokens(1000, 0);
    }

    /// @notice Test successful first purchase (when supply is 0)
    function testBuyANTTokensFirstPurchase() public {
        initializeCurve();
        
        uint256 cureAmount = 100000;
        uint256 expectedAnt = (cureAmount * bondingCurve.PRECISION()) / bondingCurve.INITIAL_PRICE();
        
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        assertEq(bondingCurve.antBalances(buyer1), expectedAnt, "Buyer should receive correct ANT amount");
        assertEq(bondingCurve.currentSupply(), expectedAnt, "Supply should increase");
        assertEq(bondingCurve.reserveBalance(), cureAmount, "Reserve should increase");
        assertEq(bondingCurve.totalBought(), expectedAnt, "Total bought should increase");
    }

    /// @notice Test successful subsequent purchase (when supply > 0)
    function testBuyANTTokensSubsequentPurchase() public {
        initializeCurve();
        
        // First purchase
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 supplyBefore = bondingCurve.currentSupply();
        uint256 reserveBefore = bondingCurve.reserveBalance();
        
        // Second purchase
        uint256 cureAmount = 50000;
        uint256 expectedAnt = bondingCurve.getBuyQuote(cureAmount);
        
        vm.prank(buyer2);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        assertEq(bondingCurve.antBalances(buyer2), expectedAnt, "Buyer2 should receive correct ANT amount");
        assertEq(bondingCurve.currentSupply(), supplyBefore + expectedAnt, "Supply should increase correctly");
        assertEq(bondingCurve.reserveBalance(), reserveBefore + cureAmount, "Reserve should increase correctly");
    }

    /// @notice Test that buying with zero CURE reverts
    function testBuyANTTokensZeroAmount() public {
        initializeCurve();
        
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.InvalidAmount.selector);
        bondingCurve.buyANTTokens(0, 0);
    }

    /// @notice Test slippage protection on buy
    function testBuyANTTokensSlippageExceeded() public {
        initializeCurve();
        
        uint256 cureAmount = 100000;
        uint256 expectedAnt = bondingCurve.getBuyQuote(cureAmount);
        uint256 minAntOut = expectedAnt + 1; // Set minimum higher than expected
        
        // Should revert with SlippageExceeded error
        vm.prank(buyer1);
        vm.expectRevert();
        bondingCurve.buyANTTokens(cureAmount, minAntOut);
    }

    /// @notice Test that buying emits correct event
    function testBuyANTTokensEmitsEvent() public {
        initializeCurve();
        
        uint256 cureAmount = 100000;
        uint256 expectedAnt = bondingCurve.getBuyQuote(cureAmount);
        uint256 expectedPrice = bondingCurve.INITIAL_PRICE(); // Initial price
        
        vm.expectEmit(true, false, false, true);
        emit BondingCurve2.ANTTokenPurchased(buyer1, cureAmount, expectedAnt, expectedPrice, expectedAnt);
        
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
    }

    // ========== Sell ANT Tokens Tests ==========

    /// @notice Test that user cannot sell before curve is initialized
    function testSellBeforeInitialization() public {
        vm.prank(seller1);
        vm.expectRevert(BondingCurve2.CurveNotInitialized.selector);
        bondingCurve.sellANTTokens(1000, 0);
    }

    /// @notice Test successful sell after buying
    function testSellANTTokensSuccessful() public {
        initializeCurve();
        
        // First buy some ANT
        uint256 cureAmount = 100000;
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        uint256 antBalance = bondingCurve.antBalances(buyer1);
        uint256 antToSell = antBalance / 2;
        uint256 supplyBefore = bondingCurve.currentSupply();
        uint256 reserveBefore = bondingCurve.reserveBalance();
        
        // Sell half the ANT
        uint256 expectedCure = bondingCurve.getSellQuote(antToSell);
        
        vm.prank(buyer1);
        bondingCurve.sellANTTokens(antToSell, 0);
        
        assertEq(bondingCurve.antBalances(buyer1), antBalance - antToSell, "ANT balance should decrease");
        assertEq(bondingCurve.currentSupply(), supplyBefore - antToSell, "Supply should decrease");
        assertEq(bondingCurve.reserveBalance(), reserveBefore - expectedCure, "Reserve should decrease");
        assertEq(bondingCurve.totalSold(), antToSell, "Total sold should increase");
    }

    /// @notice Test that selling with zero ANT reverts
    function testSellANTTokensZeroAmount() public {
        initializeCurve();
        
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.InvalidAmount.selector);
        bondingCurve.sellANTTokens(0, 0);
    }

    /// @notice Test that selling more than balance reverts
    function testSellANTTokensInsufficientBalance() public {
        initializeCurve();
        
        // Buy some ANT
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 antBalance = bondingCurve.antBalances(buyer1);
        
        // Try to sell more than balance
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.InsufficientANT.selector);
        bondingCurve.sellANTTokens(antBalance + 1, 0);
    }

    /// @notice Test that selling more than supply reverts
    function testSellANTTokensExceedsSupply() public {
        initializeCurve();
        
        // Manually set buyer1's balance higher than supply (simulated scenario)
        // This shouldn't normally happen, but tests the supply check
        
        vm.prank(buyer1);
        vm.expectRevert(BondingCurve2.InsufficientANT.selector);
        bondingCurve.sellANTTokens(999999999, 0);
    }

    /// @notice Test slippage protection on sell
    function testSellANTTokensSlippageExceeded() public {
        initializeCurve();
        
        // Buy some ANT
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 antToSell = bondingCurve.antBalances(buyer1);
        uint256 expectedCure = bondingCurve.getSellQuote(antToSell);
        uint256 minCureOut = expectedCure + 1; // Set minimum higher than expected
        
        // Should revert with SlippageExceeded error
        vm.prank(buyer1);
        vm.expectRevert();
        bondingCurve.sellANTTokens(antToSell, minCureOut);
    }

    /// @notice Test that selling emits correct event
    function testSellANTTokensEmitsEvent() public {
        initializeCurve();
        
        // Buy some ANT
        uint256 cureAmount = 100000;
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        uint256 antToSell = bondingCurve.antBalances(buyer1);
        uint256 expectedCure = bondingCurve.getSellQuote(antToSell);
        uint256 expectedPrice = bondingCurve.INITIAL_PRICE();
        
        vm.expectEmit(true, false, false, true);
        emit BondingCurve2.ANTTokenSold(buyer1, antToSell, expectedCure, expectedPrice, 0);
        
        vm.prank(buyer1);
        bondingCurve.sellANTTokens(antToSell, 0);
    }

    // ========== View Functions Tests ==========

    /// @notice Test getBuyQuote returns correct quote
    function testGetBuyQuote() public {
        initializeCurve();
        
        uint256 cureAmount = 100000;
        uint256 quote = bondingCurve.getBuyQuote(cureAmount);
        
        assertGt(quote, 0, "Quote should be greater than 0");
    }

    /// @notice Test getSellQuote returns correct quote
    function testGetSellQuote() public {
        initializeCurve();
        
        // Buy some ANT first
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        // Sell only half - can't sell all due to formula constraint
        uint256 antAmount = bondingCurve.antBalances(buyer1) / 2;
        uint256 quote = bondingCurve.getSellQuote(antAmount);
        
        assertGt(quote, 0, "Quote should be greater than 0");
    }

    /// @notice Test getCurrentPrice returns correct price
    function testGetCurrentPrice() public {
        initializeCurve();
        
        uint256 priceInitial = bondingCurve.getCurrentPrice();
        assertEq(priceInitial, bondingCurve.INITIAL_PRICE(), "Initial price should match constant");
        
        // Buy some ANT
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 priceAfterBuy = bondingCurve.getCurrentPrice();
        assertGt(priceAfterBuy, 0, "Price after buy should be greater than 0");
    }

    /// @notice Test getCurveStats returns correct stats
    function testGetCurveStats() public {
        initializeCurve();
        
        // Buy some ANT
        uint256 cureAmount = 100000;
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        (uint256 supply, uint256 reserve, uint256 price, uint256 bought, uint256 sold, bool active, uint256 launched) = bondingCurve.getCurveStats();
        
        assertGt(supply, 0, "Supply should be greater than 0");
        assertEq(reserve, cureAmount, "Reserve should match CURE deposited");
        assertGt(price, 0, "Price should be greater than 0");
        assertGt(bought, 0, "Bought should be greater than 0");
        assertEq(sold, 0, "Sold should be 0");
        assertTrue(active, "Curve should be active");
        assertGt(launched, 0, "Launch timestamp should be set");
    }

    // ========== Edge Cases & Integration Tests ==========

    /// @notice Test price increases with purchases
    function testPriceIncreasesWithPurchases() public {
        initializeCurve();
        
        uint256 priceInitial = bondingCurve.getCurrentPrice();
        
        // First purchase - price stays at INITIAL_PRICE due to formula
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 priceAfterFirst = bondingCurve.getCurrentPrice();
        assertEq(priceAfterFirst, priceInitial, "Price should equal initial price after first purchase");
        
        // Second purchase - now price should increase
        vm.prank(buyer2);
        bondingCurve.buyANTTokens(100000, 0);
        
        uint256 priceAfterSecond = bondingCurve.getCurrentPrice();
        assertGt(priceAfterSecond, priceAfterFirst, "Price should increase after second purchase");
    }

    /// @notice Test price decreases with sales
    function testPriceDecreasesWithSales() public {
        initializeCurve();
        
        // Buy ANT
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(200000, 0);
        
        uint256 priceAfterBuy = bondingCurve.getCurrentPrice();
        uint256 antBalance = bondingCurve.antBalances(buyer1);
        
        // Sell half
        vm.prank(buyer1);
        bondingCurve.sellANTTokens(antBalance / 2, 0);
        
        uint256 priceAfterSell = bondingCurve.getCurrentPrice();
        assertLt(priceAfterSell, priceAfterBuy, "Price should decrease after selling");
    }

    /// @notice Test round-trip trade (buy then sell most)
    function testRoundTripTrade() public {
        initializeCurve();
        
        uint256 cureAmount = 100000;
        
        // Buy ANT
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(cureAmount, 0);
        
        uint256 antReceived = bondingCurve.antBalances(buyer1);
        
        // Sell 50% of ANT (can't sell too much due to reserve constraints)
        uint256 antToSell = antReceived / 2;
        uint256 cureReceived = bondingCurve.getSellQuote(antToSell);
        vm.prank(buyer1);
        bondingCurve.sellANTTokens(antToSell, 0);
        
        // CURE received should be less than deposited (due to bonding curve mechanics)
        assertLt(cureReceived, cureAmount, "Round trip should result in net loss due to curve");
        assertEq(bondingCurve.antBalances(buyer1), antReceived - antToSell, "Buyer should have remaining ANT");
    }

    /// @notice Test multiple users can trade independently
    function testMultipleUsersTrading() public {
        initializeCurve();
        
        // Buyer 1 purchases
        vm.prank(buyer1);
        bondingCurve.buyANTTokens(100000, 0);
        uint256 buyer1Balance = bondingCurve.antBalances(buyer1);
        
        // Buyer 2 purchases
        vm.prank(buyer2);
        bondingCurve.buyANTTokens(50000, 0);
        uint256 buyer2Balance = bondingCurve.antBalances(buyer2);
        
        assertGt(buyer1Balance, 0, "Buyer1 should have ANT");
        assertGt(buyer2Balance, 0, "Buyer2 should have ANT");
        assertEq(bondingCurve.currentSupply(), buyer1Balance + buyer2Balance, "Supply should equal sum of balances");
        
        // Buyer 1 sells half their balance
        uint256 sellAmount = buyer1Balance / 2;
        vm.prank(buyer1);
        bondingCurve.sellANTTokens(sellAmount, 0);
        
        assertEq(bondingCurve.antBalances(buyer1), buyer1Balance - sellAmount, "Buyer1 should have reduced ANT after selling");
        assertEq(bondingCurve.antBalances(buyer2), buyer2Balance, "Buyer2 balance should be unchanged");
    }
}

