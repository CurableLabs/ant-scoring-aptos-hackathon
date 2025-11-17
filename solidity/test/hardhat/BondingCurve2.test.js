// Test file for BondingCurve2.sol
// Tests the ANT Token Bonding Curve system

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BondingCurve2 Contract", function() {
    let bondingCurve;
    let owner;
    let buyer1;
    let buyer2;
    let seller;

    // Deploy contract before each test
    beforeEach(async function() {
        // Get test accounts
        [owner, buyer1, buyer2, seller] = await ethers.getSigners();

        // Deploy the contract
        const BondingCurve2 = await ethers.getContractFactory("BondingCurve2");
        bondingCurve = await BondingCurve2.deploy();
        await bondingCurve.waitForDeployment();
    });

    // ========================================
    // DEPLOYMENT TESTS
    // ========================================
    
    describe("Deployment", function() {
        it("Should deploy successfully", async function() {
            expect(await bondingCurve.getAddress()).to.be.properAddress;
        });

        it("Should set the correct owner", async function() {
            expect(await bondingCurve.owner()).to.equal(owner.address);
        });

        it("Should initialize with zero supply and reserve", async function() {
            expect(await bondingCurve.currentSupply()).to.equal(0);
            expect(await bondingCurve.reserveBalance()).to.equal(0);
        });

        it("Should set correct constants", async function() {
            expect(await bondingCurve.RESERVE_RATIO()).to.equal(500000); // 50%
            expect(await bondingCurve.PRECISION()).to.equal(1000000);
            expect(await bondingCurve.MAX_SUPPLY()).to.equal(10000000000000n); // 10M scaled
            expect(await bondingCurve.INITIAL_PRICE()).to.equal(100000);
        });

        it("Should not be active initially", async function() {
            expect(await bondingCurve.curveActive()).to.equal(false);
        });

        it("Should not be paused initially", async function() {
            expect(await bondingCurve.paused()).to.equal(false);
        });
    });

    // ========================================
    // INITIALIZATION TESTS
    // ========================================
    
    describe("Initialization", function() {
        it("Should allow owner to initialize bonding curve", async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
            
            expect(await bondingCurve.curveActive()).to.equal(true);
            expect(await bondingCurve.launchTimestamp()).to.be.gt(0);
        });

        it("Should revert if non-owner tries to initialize", async function() {
            await expect(
                bondingCurve.connect(buyer1).initializeBondingCurve()
            ).to.be.revertedWithCustomError(bondingCurve, "NotOwner");
        });

        it("Should revert if initialized twice", async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
            
            await expect(
                bondingCurve.connect(owner).initializeBondingCurve()
            ).to.be.revertedWithCustomError(bondingCurve, "CurveAlreadyInitialized");
        });

        it("Should emit BondingCurveInitialized event", async function() {
            await expect(bondingCurve.connect(owner).initializeBondingCurve())
                .to.emit(bondingCurve, "BondingCurveInitialized");
        });
    });

    // ========================================
    // BUYING ANT TOKENS
    // ========================================
    
    describe("Buying ANT Tokens", function() {
        beforeEach(async function() {
            // Initialize curve before tests
            await bondingCurve.connect(owner).initializeBondingCurve();
        });

        it("Should buy ANT tokens successfully", async function() {
            const cureAmount = 1000000n;
            const minAntOut = 0n;
            
            await bondingCurve.connect(buyer1).buyANTTokens(cureAmount, minAntOut);
            
            const balance = await bondingCurve.getANTBalance(buyer1.address);
            expect(balance).to.be.gt(0);
            expect(await bondingCurve.currentSupply()).to.be.gt(0);
            expect(await bondingCurve.reserveBalance()).to.equal(cureAmount);
        });

        it("Should revert if curve not initialized", async function() {
            // Deploy new contract without initializing
            const BondingCurve2 = await ethers.getContractFactory("BondingCurve2");
            const newCurve = await BondingCurve2.deploy();
            await newCurve.waitForDeployment();
            
            await expect(
                newCurve.connect(buyer1).buyANTTokens(1000000, 0)
            ).to.be.revertedWithCustomError(newCurve, "CurveNotInitialized");
        });

        it("Should revert if amount is 0", async function() {
            await expect(
                bondingCurve.connect(buyer1).buyANTTokens(0, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "InvalidAmount");
        });

        it("Should revert if slippage exceeded", async function() {
            const cureAmount = 1000000n;
            const minAntOut = 999999999999n; // Unrealistically high expectation
            
            await expect(
                bondingCurve.connect(buyer1).buyANTTokens(cureAmount, minAntOut)
            ).to.be.revertedWithCustomError(bondingCurve, "SlippageExceeded");
        });

        it("Should increase price as more tokens are bought", async function() {
            // First purchase
            await bondingCurve.connect(buyer1).buyANTTokens(1000000, 0);
            const price1 = await bondingCurve.getCurrentPrice();
            
            // Second purchase
            await bondingCurve.connect(buyer2).buyANTTokens(1000000, 0);
            const price2 = await bondingCurve.getCurrentPrice();
            
            expect(price2).to.be.gt(price1);
        });

        it("Should update totalBought correctly", async function() {
            const cureAmount = 1000000n;
            await bondingCurve.connect(buyer1).buyANTTokens(cureAmount, 0);
            
            const totalBought = await bondingCurve.totalBought();
            expect(totalBought).to.be.gt(0);
        });

        it("Should emit ANTTokenPurchased event", async function() {
            const cureAmount = 1000000n;
            
            await expect(bondingCurve.connect(buyer1).buyANTTokens(cureAmount, 0))
                .to.emit(bondingCurve, "ANTTokenPurchased");
        });

        it("Should revert if max supply exceeded", async function() {
            const hugeCureAmount = ethers.parseEther("1000000000"); // Huge amount
            
            await expect(
                bondingCurve.connect(buyer1).buyANTTokens(hugeCureAmount, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "MaxSupplyExceeded");
        });
    });

    // ========================================
    // SELLING ANT TOKENS
    // ========================================
    
    describe("Selling ANT Tokens", function() {
        beforeEach(async function() {
            // Initialize and buy some tokens first
            await bondingCurve.connect(owner).initializeBondingCurve();
            await bondingCurve.connect(seller).buyANTTokens(10000000, 0);
        });

        it("Should sell ANT tokens successfully", async function() {
            const initialBalance = await bondingCurve.getANTBalance(seller.address);
            const sellAmount = initialBalance / 2n;
            
            await bondingCurve.connect(seller).sellANTTokens(sellAmount, 0);
            
            const newBalance = await bondingCurve.getANTBalance(seller.address);
            expect(newBalance).to.equal(initialBalance - sellAmount);
        });

        it("Should revert if amount is 0", async function() {
            await expect(
                bondingCurve.connect(seller).sellANTTokens(0, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "InvalidAmount");
        });

        it("Should revert if insufficient ANT balance", async function() {
            const balance = await bondingCurve.getANTBalance(seller.address);
            const tooMuch = balance + 1000n;
            
            await expect(
                bondingCurve.connect(seller).sellANTTokens(tooMuch, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "InsufficientANT");
        });

        it("Should revert if slippage exceeded", async function() {
            const balance = await bondingCurve.getANTBalance(seller.address);
            const sellAmount = balance / 2n;
            const minCureOut = ethers.parseEther("1000000"); // Unrealistically high
            
            await expect(
                bondingCurve.connect(seller).sellANTTokens(sellAmount, minCureOut)
            ).to.be.revertedWithCustomError(bondingCurve, "SlippageExceeded");
        });

        it("Should decrease supply when selling", async function() {
            const initialSupply = await bondingCurve.currentSupply();
            const balance = await bondingCurve.getANTBalance(seller.address);
            const sellAmount = balance / 2n;
            
            await bondingCurve.connect(seller).sellANTTokens(sellAmount, 0);
            
            const newSupply = await bondingCurve.currentSupply();
            expect(newSupply).to.equal(initialSupply - sellAmount);
        });

        it("Should update totalSold correctly", async function() {
            const balance = await bondingCurve.getANTBalance(seller.address);
            const sellAmount = balance / 2n;
            
            await bondingCurve.connect(seller).sellANTTokens(sellAmount, 0);
            
            const totalSold = await bondingCurve.totalSold();
            expect(totalSold).to.equal(sellAmount);
        });

        it("Should emit ANTTokenSold event", async function() {
            const balance = await bondingCurve.getANTBalance(seller.address);
            const sellAmount = balance / 2n;
            
            await expect(bondingCurve.connect(seller).sellANTTokens(sellAmount, 0))
                .to.emit(bondingCurve, "ANTTokenSold");
        });
    });

    // ========================================
    // TRANSFER FUNCTIONS
    // ========================================
    
    describe("ANT Token Transfers", function() {
        beforeEach(async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
            await bondingCurve.connect(buyer1).buyANTTokens(10000000, 0);
        });

        it("Should transfer ANT tokens successfully", async function() {
            const balance = await bondingCurve.getANTBalance(buyer1.address);
            const transferAmount = balance / 2n;
            
            await bondingCurve.connect(buyer1).transferANT(buyer2.address, transferAmount);
            
            expect(await bondingCurve.getANTBalance(buyer1.address)).to.equal(balance - transferAmount);
            expect(await bondingCurve.getANTBalance(buyer2.address)).to.equal(transferAmount);
        });

        it("Should revert if transferring to zero address", async function() {
            await expect(
                bondingCurve.connect(buyer1).transferANT(ethers.ZeroAddress, 1000)
            ).to.be.revertedWithCustomError(bondingCurve, "InvalidAddress");
        });

        it("Should revert if transferring 0 amount", async function() {
            await expect(
                bondingCurve.connect(buyer1).transferANT(buyer2.address, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "InvalidAmount");
        });

        it("Should revert if insufficient balance", async function() {
            const balance = await bondingCurve.getANTBalance(buyer1.address);
            
            await expect(
                bondingCurve.connect(buyer1).transferANT(buyer2.address, balance + 1n)
            ).to.be.revertedWithCustomError(bondingCurve, "InsufficientANT");
        });

        it("Should emit ANTTransferred event", async function() {
            const transferAmount = 1000n;
            
            await expect(bondingCurve.connect(buyer1).transferANT(buyer2.address, transferAmount))
                .to.emit(bondingCurve, "ANTTransferred")
                .withArgs(buyer1.address, buyer2.address, transferAmount);
        });
    });

    // ========================================
    // ADMIN FUNCTIONS
    // ========================================
    
    describe("Admin Functions", function() {
        beforeEach(async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
        });

        it("Should allow owner to pause", async function() {
            await bondingCurve.connect(owner).pause();
            expect(await bondingCurve.paused()).to.equal(true);
        });

        it("Should allow owner to unpause", async function() {
            await bondingCurve.connect(owner).pause();
            await bondingCurve.connect(owner).unpause();
            expect(await bondingCurve.paused()).to.equal(false);
        });

        it("Should revert if non-owner tries to pause", async function() {
            await expect(
                bondingCurve.connect(buyer1).pause()
            ).to.be.revertedWithCustomError(bondingCurve, "NotOwner");
        });

        it("Should prevent buying when paused", async function() {
            await bondingCurve.connect(owner).pause();
            
            await expect(
                bondingCurve.connect(buyer1).buyANTTokens(1000000, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "ContractPaused");
        });

        it("Should prevent selling when paused", async function() {
            await bondingCurve.connect(buyer1).buyANTTokens(10000000, 0);
            await bondingCurve.connect(owner).pause();
            
            await expect(
                bondingCurve.connect(buyer1).sellANTTokens(1000, 0)
            ).to.be.revertedWithCustomError(bondingCurve, "ContractPaused");
        });

        it("Should allow owner to transfer ownership", async function() {
            await bondingCurve.connect(owner).transferOwnership(buyer1.address);
            expect(await bondingCurve.owner()).to.equal(buyer1.address);
        });

        it("Should revert if transferring ownership to zero address", async function() {
            await expect(
                bondingCurve.connect(owner).transferOwnership(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(bondingCurve, "InvalidAddress");
        });

        it("Should emit OwnershipTransferred event", async function() {
            await expect(bondingCurve.connect(owner).transferOwnership(buyer1.address))
                .to.emit(bondingCurve, "OwnershipTransferred")
                .withArgs(owner.address, buyer1.address);
        });
    });

    // ========================================
    // VIEW FUNCTIONS
    // ========================================
    
    describe("View Functions", function() {
        beforeEach(async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
            await bondingCurve.connect(buyer1).buyANTTokens(10000000, 0);
        });

        it("Should return buy quote", async function() {
            const quote = await bondingCurve.getBuyQuote(1000000);
            expect(quote).to.be.gt(0);
        });

        it("Should return sell quote", async function() {
            const quote = await bondingCurve.getSellQuote(1000);
            expect(quote).to.be.gt(0);
        });

        it("Should return current price", async function() {
            const price = await bondingCurve.getCurrentPrice();
            expect(price).to.be.gt(0);
        });

        it("Should return comprehensive curve stats", async function() {
            const [supply, reserve, price, bought, sold, active, launched] = 
                await bondingCurve.getCurveStats();
            
            expect(supply).to.be.gt(0);
            expect(reserve).to.be.gt(0);
            expect(price).to.be.gt(0);
            expect(bought).to.be.gt(0);
            expect(sold).to.equal(0);
            expect(active).to.equal(true);
            expect(launched).to.be.gt(0);
        });

        it("Should return ANT balance for address", async function() {
            const balance = await bondingCurve.getANTBalance(buyer1.address);
            expect(balance).to.be.gt(0);
        });

        it("Should return initial price when supply is 0", async function() {
            // Deploy new contract
            const BondingCurve2 = await ethers.getContractFactory("BondingCurve2");
            const newCurve = await BondingCurve2.deploy();
            await newCurve.waitForDeployment();
            await newCurve.initializeBondingCurve();
            
            const price = await newCurve.getCurrentPrice();
            expect(price).to.equal(100000); // INITIAL_PRICE
        });
    });

    // ========================================
    // BONDING CURVE MATH TESTS
    // ========================================
    
    describe("Bonding Curve Mathematics", function() {
        beforeEach(async function() {
            await bondingCurve.connect(owner).initializeBondingCurve();
        });

        it("Should have initial price for first purchase", async function() {
            const quote = await bondingCurve.getBuyQuote(1000000);
            expect(quote).to.equal((1000000n * 1000000n) / 100000n);
        });

        it("Should maintain price consistency (buy then sell)", async function() {
            // Buy tokens
            await bondingCurve.connect(buyer1).buyANTTokens(10000000, 0);
            const antBalance = await bondingCurve.getANTBalance(buyer1.address);
            
            // Get sell quote for half
            const sellQuote = await bondingCurve.getSellQuote(antBalance / 2n);
            
            // Sell half
            await bondingCurve.connect(buyer1).sellANTTokens(antBalance / 2n, 0);
            
            // Reserve should have decreased
            expect(await bondingCurve.reserveBalance()).to.be.lt(10000000);
        });
    });
});

