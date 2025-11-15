// Test file for CUREToken.sol
// Tests the ERC20 CURE token

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CUREToken Contract", function() {
    let cureToken;
    let owner;
    let user1;
    let user2;
    let spender;

    const INITIAL_SUPPLY = ethers.parseEther("10000000"); // 10 million CURE

    // Deploy contract before each test
    beforeEach(async function() {
        [owner, user1, user2, spender] = await ethers.getSigners();

        const CUREToken = await ethers.getContractFactory("CUREToken");
        cureToken = await CUREToken.deploy();
        await cureToken.waitForDeployment();
    });

    // ========================================
    // DEPLOYMENT TESTS
    // ========================================
    
    describe("Deployment", function() {
        it("Should deploy successfully", async function() {
            expect(await cureToken.getAddress()).to.be.properAddress;
        });

        it("Should have correct token metadata", async function() {
            expect(await cureToken.name()).to.equal("CURE Token");
            expect(await cureToken.symbol()).to.equal("CURE");
            expect(await cureToken.decimals()).to.equal(18);
        });

        it("Should set correct owner", async function() {
            expect(await cureToken.owner()).to.equal(owner.address);
        });

        it("Should mint initial supply to owner", async function() {
            expect(await cureToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
            expect(await cureToken.totalSupply()).to.equal(INITIAL_SUPPLY);
        });

        it("Should not be paused initially", async function() {
            expect(await cureToken.paused()).to.equal(false);
        });
    });

    // ========================================
    // TRANSFER TESTS
    // ========================================
    
    describe("Transfers", function() {
        it("Should transfer tokens successfully", async function() {
            const amount = ethers.parseEther("1000");
            
            await cureToken.connect(owner).transfer(user1.address, amount);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(amount);
            expect(await cureToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
        });

        it("Should emit Transfer event", async function() {
            const amount = ethers.parseEther("1000");
            
            await expect(cureToken.connect(owner).transfer(user1.address, amount))
                .to.emit(cureToken, "Transfer")
                .withArgs(owner.address, user1.address, amount);
        });

        it("Should revert if transferring to zero address", async function() {
            await expect(
                cureToken.connect(owner).transfer(ethers.ZeroAddress, 1000)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");
        });

        it("Should revert if transferring 0 amount", async function() {
            await expect(
                cureToken.connect(owner).transfer(user1.address, 0)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAmount");
        });

        it("Should revert if insufficient balance", async function() {
            const amount = ethers.parseEther("1000");
            
            await expect(
                cureToken.connect(user1).transfer(user2.address, amount)
            ).to.be.revertedWithCustomError(cureToken, "InsufficientBalance");
        });

        it("Should handle multiple transfers", async function() {
            const amount1 = ethers.parseEther("1000");
            const amount2 = ethers.parseEther("500");
            
            await cureToken.connect(owner).transfer(user1.address, amount1);
            await cureToken.connect(user1).transfer(user2.address, amount2);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(amount1 - amount2);
            expect(await cureToken.balanceOf(user2.address)).to.equal(amount2);
        });
    });

    // ========================================
    // APPROVAL & ALLOWANCE TESTS
    // ========================================
    
    describe("Approvals & Allowances", function() {
        it("Should approve spender successfully", async function() {
            const amount = ethers.parseEther("1000");
            
            await cureToken.connect(owner).approve(spender.address, amount);
            
            expect(await cureToken.allowance(owner.address, spender.address)).to.equal(amount);
        });

        it("Should emit Approval event", async function() {
            const amount = ethers.parseEther("1000");
            
            await expect(cureToken.connect(owner).approve(spender.address, amount))
                .to.emit(cureToken, "Approval")
                .withArgs(owner.address, spender.address, amount);
        });

        it("Should revert if approving zero address", async function() {
            await expect(
                cureToken.connect(owner).approve(ethers.ZeroAddress, 1000)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");
        });

        it("Should allow updating allowance", async function() {
            const amount1 = ethers.parseEther("1000");
            const amount2 = ethers.parseEther("2000");
            
            await cureToken.connect(owner).approve(spender.address, amount1);
            await cureToken.connect(owner).approve(spender.address, amount2);
            
            expect(await cureToken.allowance(owner.address, spender.address)).to.equal(amount2);
        });
    });

    // ========================================
    // TRANSFERFROM TESTS
    // ========================================
    
    describe("TransferFrom", function() {
        const approvalAmount = ethers.parseEther("1000");
        const transferAmount = ethers.parseEther("500");

        beforeEach(async function() {
            await cureToken.connect(owner).approve(spender.address, approvalAmount);
        });

        it("Should transfer tokens on behalf of owner", async function() {
            await cureToken.connect(spender).transferFrom(owner.address, user1.address, transferAmount);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(transferAmount);
            expect(await cureToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - transferAmount);
        });

        it("Should reduce allowance after transferFrom", async function() {
            await cureToken.connect(spender).transferFrom(owner.address, user1.address, transferAmount);
            
            expect(await cureToken.allowance(owner.address, spender.address))
                .to.equal(approvalAmount - transferAmount);
        });

        it("Should emit Transfer event", async function() {
            await expect(
                cureToken.connect(spender).transferFrom(owner.address, user1.address, transferAmount)
            ).to.emit(cureToken, "Transfer")
             .withArgs(owner.address, user1.address, transferAmount);
        });

        it("Should revert if insufficient allowance", async function() {
            const tooMuch = approvalAmount + 1n;
            
            await expect(
                cureToken.connect(spender).transferFrom(owner.address, user1.address, tooMuch)
            ).to.be.revertedWithCustomError(cureToken, "InsufficientAllowance");
        });

        it("Should revert if from has insufficient balance", async function() {
            await cureToken.connect(user1).approve(spender.address, ethers.parseEther("1000"));
            
            await expect(
                cureToken.connect(spender).transferFrom(user1.address, user2.address, ethers.parseEther("100"))
            ).to.be.revertedWithCustomError(cureToken, "InsufficientBalance");
        });

        it("Should revert if transferring to/from zero address", async function() {
            await expect(
                cureToken.connect(spender).transferFrom(ethers.ZeroAddress, user1.address, 100)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");

            await expect(
                cureToken.connect(spender).transferFrom(owner.address, ethers.ZeroAddress, 100)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");
        });
    });

    // ========================================
    // MINTING TESTS
    // ========================================
    
    describe("Minting", function() {
        it("Should allow owner to mint tokens", async function() {
            const mintAmount = ethers.parseEther("1000");
            
            await cureToken.connect(owner).mint(user1.address, mintAmount);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(mintAmount);
            expect(await cureToken.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
        });

        it("Should emit Mint and Transfer events", async function() {
            const mintAmount = ethers.parseEther("1000");
            
            await expect(cureToken.connect(owner).mint(user1.address, mintAmount))
                .to.emit(cureToken, "Mint")
                .withArgs(user1.address, mintAmount)
                .and.to.emit(cureToken, "Transfer")
                .withArgs(ethers.ZeroAddress, user1.address, mintAmount);
        });

        it("Should revert if non-owner tries to mint", async function() {
            await expect(
                cureToken.connect(user1).mint(user2.address, 1000)
            ).to.be.revertedWithCustomError(cureToken, "NotOwner");
        });

        it("Should revert if minting to zero address", async function() {
            await expect(
                cureToken.connect(owner).mint(ethers.ZeroAddress, 1000)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");
        });

        it("Should revert if minting 0 amount", async function() {
            await expect(
                cureToken.connect(owner).mint(user1.address, 0)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAmount");
        });
    });

    // ========================================
    // BURNING TESTS
    // ========================================
    
    describe("Burning", function() {
        beforeEach(async function() {
            // Give user1 some tokens
            await cureToken.connect(owner).transfer(user1.address, ethers.parseEther("1000"));
        });

        it("Should allow burning own tokens", async function() {
            const burnAmount = ethers.parseEther("500");
            const initialBalance = await cureToken.balanceOf(user1.address);
            const initialSupply = await cureToken.totalSupply();
            
            await cureToken.connect(user1).burn(burnAmount);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
            expect(await cureToken.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should emit Burn and Transfer events", async function() {
            const burnAmount = ethers.parseEther("500");
            
            await expect(cureToken.connect(user1).burn(burnAmount))
                .to.emit(cureToken, "Burn")
                .withArgs(user1.address, burnAmount)
                .and.to.emit(cureToken, "Transfer")
                .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
        });

        it("Should revert if burning more than balance", async function() {
            const balance = await cureToken.balanceOf(user1.address);
            
            await expect(
                cureToken.connect(user1).burn(balance + 1n)
            ).to.be.revertedWithCustomError(cureToken, "InsufficientBalance");
        });

        it("Should revert if burning 0 amount", async function() {
            await expect(
                cureToken.connect(user1).burn(0)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAmount");
        });
    });

    // ========================================
    // BURNFROM TESTS
    // ========================================
    
    describe("BurnFrom", function() {
        const approvalAmount = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureToken.connect(owner).transfer(user1.address, ethers.parseEther("2000"));
            await cureToken.connect(user1).approve(spender.address, approvalAmount);
        });

        it("Should allow burning tokens with allowance", async function() {
            const burnAmount = ethers.parseEther("500");
            
            await cureToken.connect(spender).burnFrom(user1.address, burnAmount);
            
            expect(await cureToken.balanceOf(user1.address)).to.equal(ethers.parseEther("1500"));
        });

        it("Should reduce allowance after burnFrom", async function() {
            const burnAmount = ethers.parseEther("500");
            
            await cureToken.connect(spender).burnFrom(user1.address, burnAmount);
            
            expect(await cureToken.allowance(user1.address, spender.address))
                .to.equal(approvalAmount - burnAmount);
        });

        it("Should emit Burn and Transfer events", async function() {
            const burnAmount = ethers.parseEther("500");
            
            await expect(cureToken.connect(spender).burnFrom(user1.address, burnAmount))
                .to.emit(cureToken, "Burn")
                .withArgs(user1.address, burnAmount);
        });

        it("Should revert if insufficient allowance", async function() {
            await expect(
                cureToken.connect(spender).burnFrom(user1.address, approvalAmount + 1n)
            ).to.be.revertedWithCustomError(cureToken, "InsufficientAllowance");
        });
    });

    // ========================================
    // PAUSE TESTS
    // ========================================
    
    describe("Pause Functionality", function() {
        it("Should allow owner to pause", async function() {
            await cureToken.connect(owner).pause();
            expect(await cureToken.paused()).to.equal(true);
        });

        it("Should allow owner to unpause", async function() {
            await cureToken.connect(owner).pause();
            await cureToken.connect(owner).unpause();
            expect(await cureToken.paused()).to.equal(false);
        });

        it("Should revert if non-owner tries to pause", async function() {
            await expect(
                cureToken.connect(user1).pause()
            ).to.be.revertedWithCustomError(cureToken, "NotOwner");
        });

        it("Should prevent transfers when paused", async function() {
            await cureToken.connect(owner).pause();
            
            await expect(
                cureToken.connect(owner).transfer(user1.address, 1000)
            ).to.be.revertedWithCustomError(cureToken, "ContractPaused");
        });

        it("Should prevent transferFrom when paused", async function() {
            await cureToken.connect(owner).approve(spender.address, 1000);
            await cureToken.connect(owner).pause();
            
            await expect(
                cureToken.connect(spender).transferFrom(owner.address, user1.address, 100)
            ).to.be.revertedWithCustomError(cureToken, "ContractPaused");
        });

        it("Should emit Paused and Unpaused events", async function() {
            await expect(cureToken.connect(owner).pause())
                .to.emit(cureToken, "Paused")
                .withArgs(owner.address);

            await expect(cureToken.connect(owner).unpause())
                .to.emit(cureToken, "Unpaused")
                .withArgs(owner.address);
        });
    });

    // ========================================
    // OWNERSHIP TESTS
    // ========================================
    
    describe("Ownership", function() {
        it("Should allow owner to transfer ownership", async function() {
            await cureToken.connect(owner).transferOwnership(user1.address);
            expect(await cureToken.owner()).to.equal(user1.address);
        });

        it("Should emit OwnershipTransferred event", async function() {
            await expect(cureToken.connect(owner).transferOwnership(user1.address))
                .to.emit(cureToken, "OwnershipTransferred")
                .withArgs(owner.address, user1.address);
        });

        it("Should revert if non-owner tries to transfer ownership", async function() {
            await expect(
                cureToken.connect(user1).transferOwnership(user2.address)
            ).to.be.revertedWithCustomError(cureToken, "NotOwner");
        });

        it("Should revert if transferring to zero address", async function() {
            await expect(
                cureToken.connect(owner).transferOwnership(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(cureToken, "InvalidAddress");
        });

        it("Should allow new owner to use owner functions", async function() {
            await cureToken.connect(owner).transferOwnership(user1.address);
            
            await cureToken.connect(user1).mint(user2.address, ethers.parseEther("100"));
            expect(await cureToken.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
        });
    });

    // ========================================
    // VIEW FUNCTIONS TESTS
    // ========================================
    
    describe("View Functions", function() {
        it("Should return correct balance", async function() {
            expect(await cureToken.getBalance(owner.address)).to.equal(INITIAL_SUPPLY);
        });

        it("Should return correct allowance", async function() {
            const amount = ethers.parseEther("1000");
            await cureToken.connect(owner).approve(spender.address, amount);
            
            expect(await cureToken.getAllowance(owner.address, spender.address)).to.equal(amount);
        });
    });

    // ========================================
    // INTEGRATION SCENARIOS
    // ========================================
    
    describe("Integration Scenarios", function() {
        it("Should support full ERC20 workflow", async function() {
            // Mint tokens
            await cureToken.connect(owner).mint(user1.address, ethers.parseEther("1000"));
            
            // User1 approves user2
            await cureToken.connect(user1).approve(user2.address, ethers.parseEther("500"));
            
            // User2 transfers on behalf of user1
            await cureToken.connect(user2).transferFrom(
                user1.address,
                spender.address,
                ethers.parseEther("300")
            );
            
            // Check final balances
            expect(await cureToken.balanceOf(spender.address)).to.equal(ethers.parseEther("300"));
            expect(await cureToken.balanceOf(user1.address)).to.equal(ethers.parseEther("700"));
        });

        it("Should handle large supply correctly", async function() {
            const largeAmount = ethers.parseEther("1000000");
            
            await cureToken.connect(owner).mint(user1.address, largeAmount);
            await cureToken.connect(user1).transfer(user2.address, largeAmount / 2n);
            
            expect(await cureToken.balanceOf(user2.address)).to.equal(largeAmount / 2n);
        });
    });
});

