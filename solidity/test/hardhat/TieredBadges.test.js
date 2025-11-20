const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Tiered Badge System", function() {
    let triLaneSystem;
    let labBadge;
    let admin, alice, bob, carol, dave;

    beforeEach(async function() {
        [admin, alice, bob, carol, dave] = await ethers.getSigners();
        
        // Deploy TriLaneSystem (which deploys LabBadge)
        const TriLaneSystem = await ethers.getContractFactory("TriLaneSystem");
        triLaneSystem = await TriLaneSystem.deploy();
        await triLaneSystem.waitForDeployment();
        
        // Get LabBadge address
        const labBadgeAddress = await triLaneSystem.labBadge();
        labBadge = await ethers.getContractAt("LabBadge", labBadgeAddress);
    });

    describe("Badge Minting with Tiers", function() {
        it("Should mint badges with different tiers", async function() {
            // Admin issues BRONZE badge to Alice
            await triLaneSystem.issueLabBadge(
                alice.address,
                "literature_review",
                0  // BadgeLevel.BRONZE = 0
            );
            
            // Admin issues GOLD badge to Alice
            await triLaneSystem.issueLabBadge(
                alice.address,
                "compound_validation",
                2  // BadgeLevel.GOLD = 2
            );
            
            // Admin issues DIAMOND badge to Bob
            await triLaneSystem.issueLabBadge(
                bob.address,
                "breakthrough_discovery",
                4  // BadgeLevel.DIAMOND = 4
            );
            
            // Verify Alice has 2 badges
            const aliceBadges = await triLaneSystem.getContributorBadges(alice.address);
            expect(aliceBadges.length).to.equal(2);
            
            // Verify Bob has 1 badge
            const bobBadges = await triLaneSystem.getContributorBadges(bob.address);
            expect(bobBadges.length).to.equal(1);
        });

        it("Should only allow admin to issue badges", async function() {
            // Non-admin tries to issue badge
            await expect(
                triLaneSystem.connect(alice).issueLabBadge(
                    bob.address,
                    "fake_contribution",
                    0
                )
            ).to.be.revertedWith("Not authorized to issue badges");
        });

        it("Should correctly set badge tiers", async function() {
            // Issue badges with different tiers
            await triLaneSystem.issueLabBadge(alice.address, "task1", 0);  // BRONZE
            await triLaneSystem.issueLabBadge(bob.address, "task2", 2);    // GOLD
            await triLaneSystem.issueLabBadge(carol.address, "task3", 4);  // DIAMOND
            
            // Check tiers
            const aliceBadgeLevel = await triLaneSystem.getBadgeLevel(1);  // Token ID 1
            const bobBadgeLevel = await triLaneSystem.getBadgeLevel(2);    // Token ID 2
            const carolBadgeLevel = await triLaneSystem.getBadgeLevel(3);  // Token ID 3
            
            expect(aliceBadgeLevel).to.equal(0);  // BRONZE
            expect(bobBadgeLevel).to.equal(2);    // GOLD
            expect(carolBadgeLevel).to.equal(4);  // DIAMOND
        });
    });

    describe("Tier Points System", function() {
        it("Should return correct points for each tier", async function() {
            expect(await triLaneSystem.getTierPoints(0)).to.equal(10);    // BRONZE
            expect(await triLaneSystem.getTierPoints(1)).to.equal(50);    // SILVER
            expect(await triLaneSystem.getTierPoints(2)).to.equal(100);   // GOLD
            expect(await triLaneSystem.getTierPoints(3)).to.equal(500);   // PLATINUM
            expect(await triLaneSystem.getTierPoints(4)).to.equal(1000);  // DIAMOND
        });

        it("Should calculate reputation points correctly", async function() {
            // Alice: 1 BRONZE (10) + 1 GOLD (100) = 110 points
            await triLaneSystem.issueLabBadge(alice.address, "task1", 0);  // BRONZE
            await triLaneSystem.issueLabBadge(alice.address, "task2", 2);  // GOLD
            
            // Bob: 1 DIAMOND (1000) = 1000 points
            await triLaneSystem.issueLabBadge(bob.address, "task3", 4);  // DIAMOND
            
            // Carol: 2 SILVER (100) + 1 PLATINUM (500) = 600 points
            await triLaneSystem.issueLabBadge(carol.address, "task4", 1);  // SILVER
            await triLaneSystem.issueLabBadge(carol.address, "task5", 1);  // SILVER
            await triLaneSystem.issueLabBadge(carol.address, "task6", 3);  // PLATINUM
            
            // Check reputation
            const alicePoints = await triLaneSystem.getContributorReputation(alice.address);
            const bobPoints = await triLaneSystem.getContributorReputation(bob.address);
            const carolPoints = await triLaneSystem.getContributorReputation(carol.address);
            
            expect(alicePoints).to.equal(110);   // 10 + 100
            expect(bobPoints).to.equal(1000);    // 1000
            expect(carolPoints).to.equal(600);   // 50 + 50 + 500
        });
    });

    describe("Badge Counting by Tier", function() {
        it("Should count badges by tier correctly", async function() {
            // Alice gets multiple badges
            await triLaneSystem.issueLabBadge(alice.address, "task1", 0);  // BRONZE
            await triLaneSystem.issueLabBadge(alice.address, "task2", 0);  // BRONZE
            await triLaneSystem.issueLabBadge(alice.address, "task3", 2);  // GOLD
            await triLaneSystem.issueLabBadge(alice.address, "task4", 2);  // GOLD
            await triLaneSystem.issueLabBadge(alice.address, "task5", 4);  // DIAMOND
            
            // Count by tier
            const bronzeCount = await triLaneSystem.getContributorBadgesByTier(alice.address, 0);
            const silverCount = await triLaneSystem.getContributorBadgesByTier(alice.address, 1);
            const goldCount = await triLaneSystem.getContributorBadgesByTier(alice.address, 2);
            const platinumCount = await triLaneSystem.getContributorBadgesByTier(alice.address, 3);
            const diamondCount = await triLaneSystem.getContributorBadgesByTier(alice.address, 4);
            
            expect(bronzeCount).to.equal(2);
            expect(silverCount).to.equal(0);
            expect(goldCount).to.equal(2);
            expect(platinumCount).to.equal(0);
            expect(diamondCount).to.equal(1);
        });
    });

    describe("Contributor Statistics", function() {
        it("Should return complete contributor statistics", async function() {
            // Issue various badges to Alice
            await triLaneSystem.issueLabBadge(alice.address, "task1", 0);  // BRONZE - 10 points
            await triLaneSystem.issueLabBadge(alice.address, "task2", 1);  // SILVER - 50 points
            await triLaneSystem.issueLabBadge(alice.address, "task3", 1);  // SILVER - 50 points
            await triLaneSystem.issueLabBadge(alice.address, "task4", 2);  // GOLD - 100 points
            await triLaneSystem.issueLabBadge(alice.address, "task5", 4);  // DIAMOND - 1000 points
            
            // Get stats
            const stats = await triLaneSystem.getContributorStats(alice.address);
            
            expect(stats.totalBadges).to.equal(5);
            expect(stats.totalPoints).to.equal(1210);  // 10 + 50 + 50 + 100 + 1000
            expect(stats.bronzeCount).to.equal(1);
            expect(stats.silverCount).to.equal(2);
            expect(stats.goldCount).to.equal(1);
            expect(stats.platinumCount).to.equal(0);
            expect(stats.diamondCount).to.equal(1);
        });

        it("Should return zero stats for contributor with no badges", async function() {
            const stats = await triLaneSystem.getContributorStats(alice.address);
            
            expect(stats.totalBadges).to.equal(0);
            expect(stats.totalPoints).to.equal(0);
            expect(stats.bronzeCount).to.equal(0);
            expect(stats.silverCount).to.equal(0);
            expect(stats.goldCount).to.equal(0);
            expect(stats.platinumCount).to.equal(0);
            expect(stats.diamondCount).to.equal(0);
        });
    });

    describe("Leaderboard", function() {
        it("Should create a leaderboard sorted by reputation", async function() {
            // Issue badges to multiple contributors
            await triLaneSystem.issueLabBadge(alice.address, "task1", 2);   // GOLD (100)
            await triLaneSystem.issueLabBadge(bob.address, "task2", 4);     // DIAMOND (1000)
            await triLaneSystem.issueLabBadge(carol.address, "task3", 1);   // SILVER (50)
            await triLaneSystem.issueLabBadge(dave.address, "task4", 3);    // PLATINUM (500)
            
            // Get leaderboard
            const [addresses, points] = await triLaneSystem.getLeaderboard([
                alice.address,
                bob.address,
                carol.address,
                dave.address
            ]);
            
            // Should be sorted: Bob (1000), Dave (500), Alice (100), Carol (50)
            expect(addresses[0]).to.equal(bob.address);
            expect(points[0]).to.equal(1000);
            
            expect(addresses[1]).to.equal(dave.address);
            expect(points[1]).to.equal(500);
            
            expect(addresses[2]).to.equal(alice.address);
            expect(points[2]).to.equal(100);
            
            expect(addresses[3]).to.equal(carol.address);
            expect(points[3]).to.equal(50);
        });

        it("Should handle contributors with multiple badges in leaderboard", async function() {
            // Alice: 3 badges - 1 GOLD + 2 BRONZE = 120 points
            await triLaneSystem.issueLabBadge(alice.address, "task1", 2);  // GOLD
            await triLaneSystem.issueLabBadge(alice.address, "task2", 0);  // BRONZE
            await triLaneSystem.issueLabBadge(alice.address, "task3", 0);  // BRONZE
            
            // Bob: 2 badges - 1 PLATINUM + 1 SILVER = 550 points
            await triLaneSystem.issueLabBadge(bob.address, "task4", 3);  // PLATINUM
            await triLaneSystem.issueLabBadge(bob.address, "task5", 1);  // SILVER
            
            // Carol: 1 badge - 1 GOLD = 100 points
            await triLaneSystem.issueLabBadge(carol.address, "task6", 2);  // GOLD
            
            // Get leaderboard
            const [addresses, points] = await triLaneSystem.getLeaderboard([
                alice.address,
                bob.address,
                carol.address
            ]);
            
            // Should be sorted: Bob (550), Alice (120), Carol (100)
            expect(addresses[0]).to.equal(bob.address);
            expect(points[0]).to.equal(550);
            
            expect(addresses[1]).to.equal(alice.address);
            expect(points[1]).to.equal(120);
            
            expect(addresses[2]).to.equal(carol.address);
            expect(points[2]).to.equal(100);
        });
    });

    describe("Integration with Badge Info", function() {
        it("Should retrieve badge info with tier", async function() {
            // Issue a badge
            await triLaneSystem.issueLabBadge(
                alice.address,
                "compound_validation",
                2  // GOLD
            );
            
            // Get badge info
            const [contributor, contributionType, timestamp, ipAttribution] = 
                await triLaneSystem.getLabBadgeInfo(1);
            
            expect(contributor).to.equal(alice.address);
            expect(contributionType).to.equal("compound_validation");
            expect(ipAttribution).to.equal("");  // Empty initially
            
            // Get badge level
            const level = await triLaneSystem.getBadgeLevel(1);
            expect(level).to.equal(2);  // GOLD
        });

        it("Should work with IP attribution updates", async function() {
            // Issue badge
            await triLaneSystem.issueLabBadge(alice.address, "drug_discovery", 4);  // DIAMOND
            
            // Update with IP attribution
            await triLaneSystem.updateBadgeWithIPAttribution(1, "Patent #US12345");
            
            // Verify badge still has correct tier
            const level = await triLaneSystem.getBadgeLevel(1);
            expect(level).to.equal(4);  // DIAMOND
            
            // Verify IP attribution was added
            const [, , , ipAttribution] = await triLaneSystem.getLabBadgeInfo(1);
            expect(ipAttribution).to.equal("Patent #US12345");
        });
    });

    describe("Real-World Scenario", function() {
        it("Should handle a complete research project workflow", async function() {
            console.log("\n🔬 Cancer Drug Discovery Project");
            console.log("=====================================");
            
            // Dr. Alice (Lead Researcher) - Multiple contributions
            console.log("\n👩‍🔬 Dr. Alice (Lead Researcher):");
            await triLaneSystem.issueLabBadge(alice.address, "hypothesis_formulation", 1);  // SILVER
            console.log("  ✅ Badge #1: Hypothesis Formulation (SILVER - 50 pts)");
            
            await triLaneSystem.issueLabBadge(alice.address, "compound_synthesis", 2);  // GOLD
            console.log("  ✅ Badge #2: Compound Synthesis (GOLD - 100 pts)");
            
            await triLaneSystem.issueLabBadge(alice.address, "clinical_trial_design", 3);  // PLATINUM
            console.log("  ✅ Badge #3: Clinical Trial Design (PLATINUM - 500 pts)");
            
            await triLaneSystem.issueLabBadge(alice.address, "breakthrough_discovery", 4);  // DIAMOND
            console.log("  ✅ Badge #4: Breakthrough Discovery (DIAMOND - 1000 pts)");
            
            // Bob (Lab Technician) - Supporting work
            console.log("\n👨‍🔬 Bob (Lab Technician):");
            await triLaneSystem.issueLabBadge(bob.address, "lab_setup", 0);  // BRONZE
            console.log("  ✅ Badge #5: Lab Setup (BRONZE - 10 pts)");
            
            await triLaneSystem.issueLabBadge(bob.address, "sample_processing", 0);  // BRONZE
            console.log("  ✅ Badge #6: Sample Processing (BRONZE - 10 pts)");
            
            await triLaneSystem.issueLabBadge(bob.address, "data_collection", 1);  // SILVER
            console.log("  ✅ Badge #7: Data Collection (SILVER - 50 pts)");
            
            // Carol (Statistician) - Data analysis
            console.log("\n👩‍💼 Dr. Carol (Statistician):");
            await triLaneSystem.issueLabBadge(carol.address, "statistical_analysis", 2);  // GOLD
            console.log("  ✅ Badge #8: Statistical Analysis (GOLD - 100 pts)");
            
            // Get final stats
            console.log("\n📊 FINAL STATISTICS");
            console.log("=====================================");
            
            const aliceStats = await triLaneSystem.getContributorStats(alice.address);
            console.log(`\nDr. Alice:`);
            console.log(`  Total Badges: ${aliceStats.totalBadges}`);
            console.log(`  Reputation: ${aliceStats.totalPoints} points`);
            console.log(`  Diamond: ${aliceStats.diamondCount} | Platinum: ${aliceStats.platinumCount} | Gold: ${aliceStats.goldCount} | Silver: ${aliceStats.silverCount} | Bronze: ${aliceStats.bronzeCount}`);
            
            const bobStats = await triLaneSystem.getContributorStats(bob.address);
            console.log(`\nBob:`);
            console.log(`  Total Badges: ${bobStats.totalBadges}`);
            console.log(`  Reputation: ${bobStats.totalPoints} points`);
            console.log(`  Diamond: ${bobStats.diamondCount} | Platinum: ${bobStats.platinumCount} | Gold: ${bobStats.goldCount} | Silver: ${bobStats.silverCount} | Bronze: ${bobStats.bronzeCount}`);
            
            const carolStats = await triLaneSystem.getContributorStats(carol.address);
            console.log(`\nDr. Carol:`);
            console.log(`  Total Badges: ${carolStats.totalBadges}`);
            console.log(`  Reputation: ${carolStats.totalPoints} points`);
            console.log(`  Diamond: ${carolStats.diamondCount} | Platinum: ${carolStats.platinumCount} | Gold: ${carolStats.goldCount} | Silver: ${carolStats.silverCount} | Bronze: ${carolStats.bronzeCount}`);
            
            // Leaderboard
            console.log(`\n🏆 LEADERBOARD`);
            console.log("=====================================");
            const [addresses, points] = await triLaneSystem.getLeaderboard([
                alice.address,
                bob.address,
                carol.address
            ]);
            
            for (let i = 0; i < addresses.length; i++) {
                let name = "Unknown";
                if (addresses[i] === alice.address) name = "Dr. Alice";
                if (addresses[i] === bob.address) name = "Bob";
                if (addresses[i] === carol.address) name = "Dr. Carol";
                console.log(`  ${i + 1}. ${name}: ${points[i]} points`);
            }
            
            // Verify calculations
            expect(aliceStats.totalPoints).to.equal(1650);  // 50 + 100 + 500 + 1000
            expect(bobStats.totalPoints).to.equal(70);      // 10 + 10 + 50
            expect(carolStats.totalPoints).to.equal(100);   // 100
            
            // Verify leaderboard order
            expect(addresses[0]).to.equal(alice.address);  // Alice first
            expect(addresses[1]).to.equal(carol.address);  // Carol second
            expect(addresses[2]).to.equal(bob.address);    // Bob third
        });
    });
});

