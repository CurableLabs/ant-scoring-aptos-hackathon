// Test file for CleanDeployReady.sol
// Tests the tri-lane tokenomics system

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CleanDeployReady Contract", function() {
    let cleanDeployReady;
    let owner;
    let researcher;
    let holder;

    // Deploy contract before each test
    beforeEach(async function() {
        // Get test accounts
        [owner, researcher, holder] = await ethers.getSigners();

        // Deploy the contract
        const CleanDeployReady = await ethers.getContractFactory("CleanDeployReady");
        cleanDeployReady = await CleanDeployReady.deploy();
        await cleanDeployReady.waitForDeployment();
    });

    // ========================================
    // DEPLOYMENT TESTS
    // ========================================
    
    describe("Deployment", function() {
        it("Should deploy successfully", async function() {
            // Check that contract has an address
            expect(await cleanDeployReady.getAddress()).to.be.properAddress;
        });

        it("Should set the correct admin", async function() {
            // Check that deployer is the admin
            expect(await cleanDeployReady.admin()).to.equal(owner.address);
        });

        it("Should initialize with zero supply", async function() {
            // Check that all token supplies start at 0
            expect(await cleanDeployReady.labCreditsIssued()).to.equal(0);
            expect(await cleanDeployReady.cureTotalSupply()).to.equal(0);
            expect(await cleanDeployReady.subdaoCount()).to.equal(0);
        });

        it("Should set correct stake lock period (365 days)", async function() {
            // Check that time lock is 365 days
            const oneYear = 365n * 24n * 60n * 60n; // 365 days in seconds
            expect(await cleanDeployReady.stakeLockPeriod()).to.equal(oneYear);
        });
    });

    // ========================================
    // LANE 1: LAB CREDITS
    // ========================================
    
    describe("Lane 1: Lab Credits", function() {
        it("Should issue a lab credit to researcher", async function() {
            // Issue lab credit
            await cleanDeployReady.connect(researcher).issueLabCredit("Cancer Cure Discovery");
            
            // Check that supply increased
            expect(await cleanDeployReady.labCreditsIssued()).to.equal(1);
            
            // Check researcher's lab credit
            const labCredit = await cleanDeployReady.labCredits(researcher.address);
            expect(labCredit.ipTitle).to.equal("Cancer Cure Discovery");
            expect(labCredit.timestamp).to.be.gt(0);
        });

        it("Should revert if researcher tries to issue duplicate lab credit", async function() {
            // Issue first lab credit
            await cleanDeployReady.connect(researcher).issueLabCredit("Cancer Cure");
            
            // Try to issue second lab credit (should fail)
            await expect(
                cleanDeployReady.connect(researcher).issueLabCredit("Diabetes Cure")
            ).to.be.revertedWithCustomError(cleanDeployReady, "LabCreditAlreadyExists");
        });

        it("Should revert if IP title is empty", async function() {
            // Try to issue lab credit with empty title
            await expect(
                cleanDeployReady.connect(researcher).issueLabCredit("")
            ).to.be.revertedWithCustomError(cleanDeployReady, "InvalidAmount");
        });
    });

    // ========================================
    // LANE 2: CURE TOKENS
    // ========================================
    
    describe("Lane 2: CURE Tokens", function() {
        it("Should acquire CURE tokens", async function() {
            // Acquire 1000 CURE tokens
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            
            // Check balance
            const [balance, staked, phase] = await cleanDeployReady.getCUREBalance(holder.address);
            expect(balance).to.equal(1000);
            expect(staked).to.equal(0);
            expect(phase).to.equal(1); // Phase 1 by default
        });

        it("Should revert if amount is 0", async function() {
            // Try to acquire 0 tokens
            await expect(
                cleanDeployReady.connect(holder).acquireCURETokens(0)
            ).to.be.revertedWithCustomError(cleanDeployReady, "InvalidAmount");
        });

        it("Should stake CURE tokens on research", async function() {
            // First acquire tokens
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            
            // Stake 500 tokens
            await cleanDeployReady.connect(holder).stakeCUREOnResearch(500);
            
            // Check balances
            const [balance, staked, phase] = await cleanDeployReady.getCUREBalance(holder.address);
            expect(balance).to.equal(500);  // 1000 - 500
            expect(staked).to.equal(500);
        });

        it("Should revert if staking more than balance", async function() {
            // Acquire 1000 tokens
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            
            // Try to stake 1500 (more than balance)
            await expect(
                cleanDeployReady.connect(holder).stakeCUREOnResearch(1500)
            ).to.be.revertedWithCustomError(cleanDeployReady, "InsufficientBalance");
        });

        it("Should set unlock time when staking", async function() {
            // Acquire and stake
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            await cleanDeployReady.connect(holder).stakeCUREOnResearch(500);
            
            // Check unlock time is set (should be in future)
            const unlockTime = await cleanDeployReady.getUnlockTime(holder.address);
            expect(unlockTime).to.be.gt(0);
        });

        it("Should not allow unstaking before lock period", async function() {
            // Acquire and stake
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            await cleanDeployReady.connect(holder).stakeCUREOnResearch(500);
            
            // Try to unstake immediately (should fail)
            await expect(
                cleanDeployReady.connect(holder).unstakeCURE(100)
            ).to.be.revertedWithCustomError(cleanDeployReady, "StakeLocked");
        });

        it("Should allow unstaking after time lock (simulated)", async function() {
            // Acquire and stake
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            await cleanDeployReady.connect(holder).stakeCUREOnResearch(500);
            
            // Fast forward time by 366 days
            await ethers.provider.send("evm_increaseTime", [366 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");
            
            // Unstake should work now
            await cleanDeployReady.connect(holder).unstakeCURE(100);
            
            // Check balances
            const [balance, staked, phase] = await cleanDeployReady.getCUREBalance(holder.address);
            expect(balance).to.equal(600);  // 500 + 100
            expect(staked).to.equal(400);   // 500 - 100
        });
    });

    // ========================================
    // LANE 3: SUB-DAOS
    // ========================================
    
    describe("Lane 3: Sub-DAOs", function() {
        it("Should create a SubDAO", async function() {
            // Create SubDAO
            await cleanDeployReady.connect(researcher).createSubDAO(1000000);
            
            // Check total SubDAOs
            expect(await cleanDeployReady.subdaoCount()).to.equal(1);
            
            // Check SubDAO info
            const subDAO = await cleanDeployReady.subDAOTokens(researcher.address);
            expect(subDAO.tokenSupply).to.equal(1000000);
            expect(subDAO.bondingActive).to.equal(true); // Contract sets this to true by default
        });

        it("Should revert if supply is 0", async function() {
            // Try to create SubDAO with 0 supply
            await expect(
                cleanDeployReady.connect(researcher).createSubDAO(0)
            ).to.be.revertedWithCustomError(cleanDeployReady, "InvalidAmount");
        });
    });

    // ========================================
    // ADMIN FUNCTIONS
    // ========================================
    
    describe("Admin Functions", function() {
        it("Should allow owner to activate Phase 2", async function() {
            // First holder needs to acquire CURE tokens
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            
            // Owner activates phase 2 for holder
            await cleanDeployReady.connect(owner).activatePhase2(holder.address);
            
            // Check phase is activated
            const [balance, staked, phase] = await cleanDeployReady.getCUREBalance(holder.address);
            expect(phase).to.equal(2);
        });

        it("Should allow owner to toggle bonding curve", async function() {
            // First create a SubDAO
            await cleanDeployReady.connect(researcher).createSubDAO(1000000);
            
            // Owner toggles bonding curve to false
            await cleanDeployReady.connect(owner).toggleBondingCurve(researcher.address, false);
            
            // Check bonding curve is now inactive
            const subDAO = await cleanDeployReady.getSubDAOInfo(researcher.address);
            expect(subDAO.bondingActive).to.equal(false);
        });

        it("Should allow owner to update stake lock period", async function() {
            // Update to 180 days
            const newLockPeriod = 180n * 24n * 60n * 60n;
            await cleanDeployReady.connect(owner).updateStakeLockPeriod(newLockPeriod);
            
            // Check new lock period
            expect(await cleanDeployReady.stakeLockPeriod()).to.equal(newLockPeriod);
        });

        it("Should revert if non-owner tries admin functions", async function() {
            // First holder needs to acquire CURE tokens
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            
            // Non-owner tries to activate phase 2
            await expect(
                cleanDeployReady.connect(researcher).activatePhase2(holder.address)
            ).to.be.revertedWithCustomError(cleanDeployReady, "NotAdmin");
        });
    });

    // ========================================
    // VIEW FUNCTIONS
    // ========================================
    
    describe("View Functions", function() {
        it("Should return system stats", async function() {
            // Create some activity
            await cleanDeployReady.connect(researcher).issueLabCredit("Test");
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            await cleanDeployReady.connect(researcher).createSubDAO(1000000);
            
            // Get system stats (returns tuple: labCreditsIssued, cureTotalSupply, subdaoCount)
            const [labCreditsIssued, cureTotalSupply, subdaoCount] = await cleanDeployReady.getSystemStats();
            expect(labCreditsIssued).to.equal(1);
            expect(cureTotalSupply).to.equal(1000);
            expect(subdaoCount).to.equal(1);
        });

        it("Should check if user can unstake", async function() {
            // Before staking - should return true
            expect(await cleanDeployReady.canUnstake(holder.address)).to.equal(true);
            
            // After staking - should return false
            await cleanDeployReady.connect(holder).acquireCURETokens(1000);
            await cleanDeployReady.connect(holder).stakeCUREOnResearch(500);
            expect(await cleanDeployReady.canUnstake(holder.address)).to.equal(false);
        });
    });
});

