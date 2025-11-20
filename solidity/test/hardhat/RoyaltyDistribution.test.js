const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Royalty Distribution System", function() {
    let triLaneSystem;
    let royaltyDistribution;
    let labBadge;
    let admin, alice, bob, carol, royaltyPayer;

    beforeEach(async function() {
        [admin, alice, bob, carol, royaltyPayer] = await ethers.getSigners();
        
        // Deploy TriLaneSystem
        const TriLaneSystem = await ethers.getContractFactory("TriLaneSystem");
        triLaneSystem = await TriLaneSystem.deploy();
        await triLaneSystem.waitForDeployment();
        
        // Get contract addresses
        const labBadgeAddress = await triLaneSystem.labBadge();
        const royaltyDistributionAddress = await triLaneSystem.royaltyDistribution();
        
        labBadge = await ethers.getContractAt("LabBadge", labBadgeAddress);
        royaltyDistribution = await ethers.getContractAt("RoyaltyDistribution", royaltyDistributionAddress);
    });

    describe("Royalty Pool Creation", function() {
        beforeEach(async function() {
            // Issue badges to contributors
            await triLaneSystem.issueLabBadge(alice.address, "compound_validation", 2);  // Badge #1 - GOLD (100 pts)
            await triLaneSystem.issueLabBadge(bob.address, "clinical_trial", 3);         // Badge #2 - PLATINUM (500 pts)
            await triLaneSystem.issueLabBadge(carol.address, "data_analysis", 1);        // Badge #3 - SILVER (50 pts)
        });

        it("Should create a royalty pool with eligible badges", async function() {
            const tx = await triLaneSystem.createRoyaltyPool(
                "Patent #US12345",
                [1, 2]  // Alice and Bob's badges
            );
            
            const receipt = await tx.wait();
            expect(receipt).to.not.be.undefined;
            
            // Check pool info
            const [ipId, totalDeposited, totalClaimed, available, badgeCount] = 
                await triLaneSystem.getRoyaltyPoolInfo(1);
            
            expect(ipId).to.equal("Patent #US12345");
            expect(totalDeposited).to.equal(0);
            expect(badgeCount).to.equal(2);
        });

        it("Should only allow admin to create pools", async function() {
            await expect(
                triLaneSystem.connect(alice).createRoyaltyPool("Patent #123", [1])
            ).to.be.revertedWith("Not authorized to create pools");
        });

        it("Should track which pools a badge is eligible for", async function() {
            // Create two pools
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2]);
            await triLaneSystem.createRoyaltyPool("Patent #US67890", [1, 3]);
            
            // Check Alice's badge (should be in both pools)
            const alicePools = await triLaneSystem.getBadgeRoyaltyPools(1);
            expect(alicePools.length).to.equal(2);
            expect(alicePools[0]).to.equal(1);
            expect(alicePools[1]).to.equal(2);
            
            // Check Bob's badge (only in first pool)
            const bobPools = await triLaneSystem.getBadgeRoyaltyPools(2);
            expect(bobPools.length).to.equal(1);
            expect(bobPools[0]).to.equal(1);
        });
    });

    describe("Royalty Deposits", function() {
        beforeEach(async function() {
            // Issue badges and create pool
            await triLaneSystem.issueLabBadge(alice.address, "compound_validation", 2);  // GOLD
            await triLaneSystem.issueLabBadge(bob.address, "clinical_trial", 3);         // PLATINUM
            
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2]);
        });

        it("Should accept royalty deposits", async function() {
            const depositAmount = ethers.parseEther("10");
            
            await triLaneSystem.connect(royaltyPayer).depositRoyalties(1, {
                value: depositAmount
            });
            
            const [, totalDeposited, , available] = await triLaneSystem.getRoyaltyPoolInfo(1);
            expect(totalDeposited).to.equal(depositAmount);
            expect(available).to.equal(depositAmount);
        });

        it("Should allow multiple deposits", async function() {
            await triLaneSystem.connect(royaltyPayer).depositRoyalties(1, {
                value: ethers.parseEther("5")
            });
            
            await triLaneSystem.connect(royaltyPayer).depositRoyalties(1, {
                value: ethers.parseEther("3")
            });
            
            const [, totalDeposited] = await triLaneSystem.getRoyaltyPoolInfo(1);
            expect(totalDeposited).to.equal(ethers.parseEther("8"));
        });
    });

    describe("Royalty Share Calculation", function() {
        it("Should calculate shares based on badge tier points", async function() {
            // Alice: GOLD (100 points)
            // Bob: PLATINUM (500 points)
            // Total: 600 points
            
            await triLaneSystem.issueLabBadge(alice.address, "work1", 2);  // GOLD
            await triLaneSystem.issueLabBadge(bob.address, "work2", 3);    // PLATINUM
            
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2]);
            
            // Deposit 6 ETH
            await triLaneSystem.depositRoyalties(1, {
                value: ethers.parseEther("6")
            });
            
            // Calculate shares
            const aliceShare = await triLaneSystem.calculateRoyaltyShare(1, 1);
            const bobShare = await triLaneSystem.calculateRoyaltyShare(1, 2);
            
            // Alice should get 100/600 = 1/6 of 6 ETH = 1 ETH
            expect(aliceShare).to.equal(ethers.parseEther("1"));
            
            // Bob should get 500/600 = 5/6 of 6 ETH = 5 ETH
            expect(bobShare).to.equal(ethers.parseEther("5"));
        });

        it("Should handle equal tier badges", async function() {
            // Both GOLD badges (100 points each)
            await triLaneSystem.issueLabBadge(alice.address, "work1", 2);  // GOLD
            await triLaneSystem.issueLabBadge(bob.address, "work2", 2);    // GOLD
            
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2]);
            
            await triLaneSystem.depositRoyalties(1, {
                value: ethers.parseEther("10")
            });
            
            // Should split equally
            const aliceShare = await triLaneSystem.calculateRoyaltyShare(1, 1);
            const bobShare = await triLaneSystem.calculateRoyaltyShare(1, 2);
            
            expect(aliceShare).to.equal(ethers.parseEther("5"));
            expect(bobShare).to.equal(ethers.parseEther("5"));
        });

        it("Should handle mixed tiers correctly", async function() {
            // Alice: BRONZE (10 points)
            // Bob: SILVER (50 points)
            // Carol: DIAMOND (1000 points)
            // Total: 1060 points
            
            await triLaneSystem.issueLabBadge(alice.address, "work1", 0);   // BRONZE
            await triLaneSystem.issueLabBadge(bob.address, "work2", 1);     // SILVER
            await triLaneSystem.issueLabBadge(carol.address, "work3", 4);   // DIAMOND
            
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2, 3]);
            
            await triLaneSystem.depositRoyalties(1, {
                value: ethers.parseEther("1060")  // Makes math easy
            });
            
            const aliceShare = await triLaneSystem.calculateRoyaltyShare(1, 1);
            const bobShare = await triLaneSystem.calculateRoyaltyShare(1, 2);
            const carolShare = await triLaneSystem.calculateRoyaltyShare(1, 3);
            
            // Alice: 10/1060 * 1060 = 10 ETH
            expect(aliceShare).to.equal(ethers.parseEther("10"));
            
            // Bob: 50/1060 * 1060 = 50 ETH
            expect(bobShare).to.equal(ethers.parseEther("50"));
            
            // Carol: 1000/1060 * 1060 = 1000 ETH
            expect(carolShare).to.equal(ethers.parseEther("1000"));
        });
    });

    describe("Claiming Royalties", function() {
        beforeEach(async function() {
            // Setup: Alice (GOLD), Bob (PLATINUM)
            await triLaneSystem.issueLabBadge(alice.address, "work1", 2);  // GOLD - 100 pts
            await triLaneSystem.issueLabBadge(bob.address, "work2", 3);    // PLATINUM - 500 pts
            
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1, 2]);
            
            // Deposit 6 ETH
            await triLaneSystem.depositRoyalties(1, {
                value: ethers.parseEther("6")
            });
        });

        it("Should allow badge owners to claim royalties", async function() {
            const balanceBefore = await ethers.provider.getBalance(alice.address);
            
            const tx = await triLaneSystem.connect(alice).claimRoyalties(1, 1);
            const receipt = await tx.wait();
            
            const balanceAfter = await ethers.provider.getBalance(alice.address);
            
            // Alice should receive 1 ETH (minus gas)
            const expectedReceived = ethers.parseEther("1");
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const actualReceived = balanceAfter - balanceBefore + gasUsed;
            
            expect(actualReceived).to.be.closeTo(expectedReceived, ethers.parseEther("0.001"));
        });

        it("Should prevent non-owners from claiming", async function() {
            await expect(
                triLaneSystem.connect(bob).claimRoyalties(1, 1)  // Bob tries to claim Alice's badge
            ).to.be.revertedWithCustomError(royaltyDistribution, "NotBadgeOwner");
        });

        it("Should prevent double claiming", async function() {
            // First claim succeeds
            await triLaneSystem.connect(alice).claimRoyalties(1, 1);
            
            // Second claim fails
            await expect(
                triLaneSystem.connect(alice).claimRoyalties(1, 1)
            ).to.be.revertedWithCustomError(royaltyDistribution, "AlreadyClaimed");
        });

        it("Should update pool stats after claim", async function() {
            const [, , , availableBefore] = await triLaneSystem.getRoyaltyPoolInfo(1);
            
            await triLaneSystem.connect(alice).claimRoyalties(1, 1);
            
            const [, totalDeposited, totalClaimed, availableAfter] = 
                await triLaneSystem.getRoyaltyPoolInfo(1);
            
            expect(totalDeposited).to.equal(ethers.parseEther("6"));
            expect(totalClaimed).to.equal(ethers.parseEther("1"));
            expect(availableAfter).to.equal(ethers.parseEther("5"));
        });
    });

    describe("Multiple Royalty Claims", function() {
        it("Should allow claiming from multiple pools at once", async function() {
            // Issue badge to Alice
            await triLaneSystem.issueLabBadge(alice.address, "major_work", 4);  // DIAMOND
            
            // Create 3 different pools, all with Alice's badge
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1]);
            await triLaneSystem.createRoyaltyPool("Patent #US67890", [1]);
            await triLaneSystem.createRoyaltyPool("Patent #US11111", [1]);
            
            // Deposit to all pools
            await triLaneSystem.depositRoyalties(1, { value: ethers.parseEther("5") });
            await triLaneSystem.depositRoyalties(2, { value: ethers.parseEther("3") });
            await triLaneSystem.depositRoyalties(3, { value: ethers.parseEther("2") });
            
            const balanceBefore = await ethers.provider.getBalance(alice.address);
            
            // Claim from all pools at once
            const tx = await triLaneSystem.connect(alice).claimMultipleRoyalties(
                [1, 2, 3],    // Pool IDs
                [1, 1, 1]     // Badge ID (same badge for all)
            );
            const receipt = await tx.wait();
            
            const balanceAfter = await ethers.provider.getBalance(alice.address);
            
            // Should receive 5 + 3 + 2 = 10 ETH total (minus gas)
            const expectedReceived = ethers.parseEther("10");
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const actualReceived = balanceAfter - balanceBefore + gasUsed;
            
            expect(actualReceived).to.be.closeTo(expectedReceived, ethers.parseEther("0.001"));
        });
    });

    describe("Unclaimed Royalties Tracking", function() {
        it("Should track unclaimed royalties for a badge", async function() {
            // Issue badges
            await triLaneSystem.issueLabBadge(alice.address, "work", 2);  // GOLD
            
            // Create pool
            await triLaneSystem.createRoyaltyPool("Patent #US12345", [1]);
            
            // Initially zero
            expect(await triLaneSystem.getUnclaimedRoyalties(1)).to.equal(0);
            
            // Deposit royalties
            await triLaneSystem.depositRoyalties(1, {
                value: ethers.parseEther("5")
            });
            
            // Should show 5 ETH unclaimed
            expect(await triLaneSystem.getUnclaimedRoyalties(1)).to.equal(ethers.parseEther("5"));
            
            // After claiming, should be zero
            await triLaneSystem.connect(alice).claimRoyalties(1, 1);
            expect(await triLaneSystem.getUnclaimedRoyalties(1)).to.equal(0);
        });

        it("Should track total unclaimed for contributor with multiple badges", async function() {
            // Alice gets 2 badges
            await triLaneSystem.issueLabBadge(alice.address, "work1", 2);  // GOLD
            await triLaneSystem.issueLabBadge(alice.address, "work2", 3);  // PLATINUM
            
            // Create separate pools
            await triLaneSystem.createRoyaltyPool("Patent #1", [1]);
            await triLaneSystem.createRoyaltyPool("Patent #2", [2]);
            
            // Deposit to both
            await triLaneSystem.depositRoyalties(1, { value: ethers.parseEther("3") });
            await triLaneSystem.depositRoyalties(2, { value: ethers.parseEther("7") });
            
            // Total unclaimed for Alice should be 10 ETH
            const totalUnclaimed = await triLaneSystem.getContributorUnclaimedRoyalties(alice.address);
            expect(totalUnclaimed).to.equal(ethers.parseEther("10"));
        });
    });

    describe("Real-World Scenario: Drug Discovery Royalties", function() {
        it("Should distribute royalties fairly for a drug discovery project", async function() {
            console.log("\n💊 Drug Discovery Project - Royalty Distribution");
            console.log("====================================================");
            
            // Issue badges based on contributions
            console.log("\n🏅 BADGES ISSUED:");
            await triLaneSystem.issueLabBadge(alice.address, "breakthrough_discovery", 4);  // Badge #1 - DIAMOND (1000 pts)
            console.log("  Dr. Alice: DIAMOND badge (1000 pts) - Breakthrough Discovery");
            
            await triLaneSystem.issueLabBadge(bob.address, "clinical_trial_design", 3);    // Badge #2 - PLATINUM (500 pts)
            console.log("  Dr. Bob: PLATINUM badge (500 pts) - Clinical Trial Design");
            
            await triLaneSystem.issueLabBadge(carol.address, "data_analysis", 2);           // Badge #3 - GOLD (100 pts)
            console.log("  Dr. Carol: GOLD badge (100 pts) - Data Analysis");
            
            // Total points: 1600
            
            // Create royalty pool for the approved drug
            console.log("\n💰 PATENT GRANTED: Patent #US-COVID-2024");
            await triLaneSystem.createRoyaltyPool("Patent #US-COVID-2024", [1, 2, 3]);
            
            // First year royalties: $50M = 50 ETH (for simulation)
            console.log("\n📈 Year 1: Drug approved, $50M in royalties");
            const year1Royalties = ethers.parseEther("50");
            await triLaneSystem.connect(royaltyPayer).depositRoyalties(1, {
                value: year1Royalties
            });
            
            // Calculate shares
            console.log("\n💵 ROYALTY DISTRIBUTION:");
            
            // Dr. Alice: 1000/1600 = 62.5% = 31.25 ETH
            const aliceShare = await triLaneSystem.calculateRoyaltyShare(1, 1);
            console.log(`  Dr. Alice: ${ethers.formatEther(aliceShare)} ETH (${(1000/1600*100).toFixed(1)}%)`);
            
            // Dr. Bob: 500/1600 = 31.25% = 15.625 ETH
            const bobShare = await triLaneSystem.calculateRoyaltyShare(1, 2);
            console.log(`  Dr. Bob: ${ethers.formatEther(bobShare)} ETH (${(500/1600*100).toFixed(1)}%)`);
            
            // Dr. Carol: 100/1600 = 6.25% = 3.125 ETH
            const carolShare = await triLaneSystem.calculateRoyaltyShare(1, 3);
            console.log(`  Dr. Carol: ${ethers.formatEther(carolShare)} ETH (${(100/1600*100).toFixed(1)}%)`);
            
            // Verify calculations
            expect(aliceShare).to.equal(ethers.parseEther("31.25"));
            expect(bobShare).to.equal(ethers.parseEther("15.625"));
            expect(carolShare).to.equal(ethers.parseEther("3.125"));
            
            // Everyone claims
            console.log("\n✅ CLAIMS PROCESSED:");
            
            const aliceBalanceBefore = await ethers.provider.getBalance(alice.address);
            await triLaneSystem.connect(alice).claimRoyalties(1, 1);
            const aliceBalanceAfter = await ethers.provider.getBalance(alice.address);
            console.log(`  Dr. Alice claimed ${ethers.formatEther(aliceShare)} ETH ✓`);
            
            await triLaneSystem.connect(bob).claimRoyalties(1, 2);
            console.log(`  Dr. Bob claimed ${ethers.formatEther(bobShare)} ETH ✓`);
            
            await triLaneSystem.connect(carol).claimRoyalties(1, 3);
            console.log(`  Dr. Carol claimed ${ethers.formatEther(carolShare)} ETH ✓`);
            
            // Verify pool is depleted
            const [, , totalClaimed, availableAfter] = await triLaneSystem.getRoyaltyPoolInfo(1);
            console.log(`\n📊 POOL STATUS:`);
            console.log(`  Total Deposited: ${ethers.formatEther(year1Royalties)} ETH`);
            console.log(`  Total Claimed: ${ethers.formatEther(totalClaimed)} ETH`);
            console.log(`  Remaining: ${ethers.formatEther(availableAfter)} ETH`);
            
            expect(totalClaimed).to.equal(year1Royalties);
            expect(availableAfter).to.equal(0);
            
            console.log("\n✅ All royalties distributed fairly!");
        });
    });
});

