const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ANTScoring Contract", function() {
    let antScoring;
    let triLaneSystem;
    let owner, scorer1, scorer2, scorer3, proposer1, proposer2;

    beforeEach(async function() {
        [owner, scorer1, scorer2, scorer3, proposer1, proposer2] = await ethers.getSigners();
        
        // Deploy TriLaneSystem first (required for ANTScoring)
        const TriLaneSystem = await ethers.getContractFactory("TriLaneSystem");
        triLaneSystem = await TriLaneSystem.deploy();
        await triLaneSystem.waitForDeployment();
        
        // Deploy ANTScoring with TriLaneSystem address
        const ANTScoring = await ethers.getContractFactory("ANTScoring");
        antScoring = await ANTScoring.deploy(await triLaneSystem.getAddress());
        await antScoring.waitForDeployment();
        
        // Authorize ANTScoring to issue badges
        await triLaneSystem.authorizeBadgeIssuer(await antScoring.getAddress());
        
        // Authorize ANTScoring to create royalty pools
        await triLaneSystem.authorizePoolCreator(await antScoring.getAddress());
    });

    describe("Deployment", function() {
        it("Should set the correct owner", async function() {
            expect(await antScoring.owner()).to.equal(owner.address);
        });

        it("Should initialize counters to zero", async function() {
            expect(await antScoring.proposalCounter()).to.equal(0);
            expect(await antScoring.activeProposalCount()).to.equal(0);
        });

        it("Should set correct passing threshold", async function() {
            expect(await antScoring.passingThreshold()).to.equal(80);
        });

        it("Should have correct scoring weights", async function() {
            expect(await antScoring.SCIENTIFIC_MERIT_WEIGHT()).to.equal(40);
            expect(await antScoring.FEASIBILITY_WEIGHT()).to.equal(25);
            expect(await antScoring.COMMUNITY_ALIGNMENT_WEIGHT()).to.equal(20);
            expect(await antScoring.RESOURCE_EFFICIENCY_WEIGHT()).to.equal(10);
            expect(await antScoring.OPEN_SCIENCE_WEIGHT()).to.equal(5);
        });
    });

    describe("Authorized Scorers Management", function() {
        it("Should allow owner to add authorized scorer", async function() {
            await antScoring.addAuthorizedScorer(scorer1.address);
            expect(await antScoring.isAuthorizedScorer(scorer1.address)).to.be.true;
        });

        it("Should emit ScorerAdded event", async function() {
            await expect(antScoring.addAuthorizedScorer(scorer1.address))
                .to.emit(antScoring, "ScorerAdded")
                .withArgs(scorer1.address, owner.address);
        });

        it("Should not allow non-owner to add scorer", async function() {
            await expect(
                antScoring.connect(proposer1).addAuthorizedScorer(scorer1.address)
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("Should not allow adding zero address", async function() {
            await expect(
                antScoring.addAuthorizedScorer(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid scorer address");
        });

        it("Should not allow adding same scorer twice", async function() {
            await antScoring.addAuthorizedScorer(scorer1.address);
            await expect(
                antScoring.addAuthorizedScorer(scorer1.address)
            ).to.be.revertedWith("Scorer already authorized");
        });

        it("Should allow owner to remove authorized scorer", async function() {
            await antScoring.addAuthorizedScorer(scorer1.address);
            await antScoring.removeAuthorizedScorer(scorer1.address);
            expect(await antScoring.isAuthorizedScorer(scorer1.address)).to.be.false;
        });

        it("Should emit ScorerRemoved event", async function() {
            await antScoring.addAuthorizedScorer(scorer1.address);
            await expect(antScoring.removeAuthorizedScorer(scorer1.address))
                .to.emit(antScoring, "ScorerRemoved")
                .withArgs(scorer1.address, owner.address);
        });
    });

    describe("Proposal Submission", function() {
        it("Should allow anyone to submit a proposal", async function() {
            await antScoring.connect(proposer1).submitProposal(
                "Cancer Research Proposal",
                "A novel approach to cancer treatment",
                "QmTest123Hash"
            );

            expect(await antScoring.proposalCounter()).to.equal(1);
            expect(await antScoring.activeProposalCount()).to.equal(1);
        });

        it("Should emit ProposalSubmitted event", async function() {
            const tx = await antScoring.connect(proposer1).submitProposal(
                "Cancer Research Proposal",
                "Description",
                "QmTest123Hash"
            );
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            
            await expect(tx)
                .to.emit(antScoring, "ProposalSubmitted")
                .withArgs(1, proposer1.address, "Cancer Research Proposal", block.timestamp);
        });

        it("Should track user proposals", async function() {
            await antScoring.connect(proposer1).submitProposal(
                "Proposal 1",
                "Description 1",
                "QmHash1"
            );
            await antScoring.connect(proposer1).submitProposal(
                "Proposal 2",
                "Description 2",
                "QmHash2"
            );

            const userProposals = await antScoring.userProposals(proposer1.address, 0);
            expect(userProposals).to.equal(1);
        });

        it("Should initialize proposal with zero scores", async function() {
            await antScoring.connect(proposer1).submitProposal(
                "Test Proposal",
                "Description",
                "QmHash"
            );

            const [id, title, description, ipfsHash, finalScore, isPassing, isFulfilled, scorerCount] = 
                await antScoring.getProposalInfo(1);

            expect(finalScore).to.equal(0);
            expect(isPassing).to.be.false;
            expect(isFulfilled).to.be.false;
            expect(scorerCount).to.equal(0);
        });
    });

    describe("Proposal Scoring", function() {
        beforeEach(async function() {
            // Add authorized scorers
            await antScoring.addAuthorizedScorer(scorer1.address);
            await antScoring.addAuthorizedScorer(scorer2.address);
            
            // Submit a proposal
            await antScoring.connect(proposer1).submitProposal(
                "Test Proposal",
                "Description",
                "QmHash"
            );
        });

        it("Should allow authorized scorer to score proposal", async function() {
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 90, biologicalPlausibility: 85, priorEvidence: 88 },
                { technicalViability: 92, dataQuality: 87, clarityOfProtocol: 90 },
                { missionFit: 95, daoEngagement: 90 },
                { costEffectiveness: 88, agenticResourceUse: 85 },
                { dataProtocolSharing: 90, collaborativePotential: 92 }
            );

            const [, , , , finalScore, isPassing] = await antScoring.getProposalInfo(1);
            expect(finalScore).to.be.gt(0);
        });

        it("Should not allow non-authorized scorer to score", async function() {
            await expect(
                antScoring.connect(proposer2).scoreProposal(
                    1,
                    { novelty: 90, biologicalPlausibility: 85, priorEvidence: 88 },
                    { technicalViability: 92, dataQuality: 87, clarityOfProtocol: 90 },
                    { missionFit: 95, daoEngagement: 90 },
                    { costEffectiveness: 88, agenticResourceUse: 85 },
                    { dataProtocolSharing: 90, collaborativePotential: 92 }
                )
            ).to.be.revertedWith("Only authorized scorers can call this function");
        });

        it("Should not allow scorer to score same proposal twice", async function() {
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 90, biologicalPlausibility: 85, priorEvidence: 88 },
                { technicalViability: 92, dataQuality: 87, clarityOfProtocol: 90 },
                { missionFit: 95, daoEngagement: 90 },
                { costEffectiveness: 88, agenticResourceUse: 85 },
                { dataProtocolSharing: 90, collaborativePotential: 92 }
            );

            await expect(
                antScoring.connect(scorer1).scoreProposal(
                    1,
                    { novelty: 80, biologicalPlausibility: 75, priorEvidence: 78 },
                    { technicalViability: 82, dataQuality: 77, clarityOfProtocol: 80 },
                    { missionFit: 85, daoEngagement: 80 },
                    { costEffectiveness: 78, agenticResourceUse: 75 },
                    { dataProtocolSharing: 80, collaborativePotential: 82 }
                )
            ).to.be.revertedWith("Scorer has already scored proposal");
        });

        it("Should reject scores above 100", async function() {
            await expect(
                antScoring.connect(scorer1).scoreProposal(
                    1,
                    { novelty: 150, biologicalPlausibility: 85, priorEvidence: 88 },
                    { technicalViability: 92, dataQuality: 87, clarityOfProtocol: 90 },
                    { missionFit: 95, daoEngagement: 90 },
                    { costEffectiveness: 88, agenticResourceUse: 85 },
                    { dataProtocolSharing: 90, collaborativePotential: 92 }
                )
            ).to.be.revertedWith("Novelty score must be less than or equal to 100");
        });

        it("Should calculate weighted final score correctly", async function() {
            // High scores that should result in passing
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 90, biologicalPlausibility: 90, priorEvidence: 90 },  // Avg: 90, Weight: 40%
                { technicalViability: 90, dataQuality: 90, clarityOfProtocol: 90 },  // Avg: 90, Weight: 25%
                { missionFit: 90, daoEngagement: 90 },  // Avg: 90, Weight: 20%
                { costEffectiveness: 90, agenticResourceUse: 90 },  // Avg: 90, Weight: 10%
                { dataProtocolSharing: 90, collaborativePotential: 90 }  // Avg: 90, Weight: 5%
            );
            // Expected: (90*40 + 90*25 + 90*20 + 90*10 + 90*5) / 100 = 9000/100 = 90

            const [, , , , finalScore, isPassing] = await antScoring.getProposalInfo(1);
            expect(finalScore).to.equal(90);
            expect(isPassing).to.be.true;  // Should pass (>= 80)
        });

        it("Should average scores from multiple scorers", async function() {
            // First scorer gives 90s
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 90, biologicalPlausibility: 90, priorEvidence: 90 },
                { technicalViability: 90, dataQuality: 90, clarityOfProtocol: 90 },
                { missionFit: 90, daoEngagement: 90 },
                { costEffectiveness: 90, agenticResourceUse: 90 },
                { dataProtocolSharing: 90, collaborativePotential: 90 }
            );

            // Second scorer gives 80s
            await antScoring.connect(scorer2).scoreProposal(
                1,
                { novelty: 80, biologicalPlausibility: 80, priorEvidence: 80 },
                { technicalViability: 80, dataQuality: 80, clarityOfProtocol: 80 },
                { missionFit: 80, daoEngagement: 80 },
                { costEffectiveness: 80, agenticResourceUse: 80 },
                { dataProtocolSharing: 80, collaborativePotential: 80 }
            );

            // Average should be 85
            const [, , , , finalScore] = await antScoring.getProposalInfo(1);
            expect(finalScore).to.equal(85);
        });

        it("Should mark proposal as passing if score >= 80", async function() {
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 85, biologicalPlausibility: 85, priorEvidence: 85 },
                { technicalViability: 85, dataQuality: 85, clarityOfProtocol: 85 },
                { missionFit: 85, daoEngagement: 85 },
                { costEffectiveness: 85, agenticResourceUse: 85 },
                { dataProtocolSharing: 85, collaborativePotential: 85 }
            );

            const [, , , , finalScore, isPassing] = await antScoring.getProposalInfo(1);
            expect(isPassing).to.be.true;
        });

        it("Should mark proposal as not passing if score < 80", async function() {
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 70, biologicalPlausibility: 70, priorEvidence: 70 },
                { technicalViability: 70, dataQuality: 70, clarityOfProtocol: 70 },
                { missionFit: 70, daoEngagement: 70 },
                { costEffectiveness: 70, agenticResourceUse: 70 },
                { dataProtocolSharing: 70, collaborativePotential: 70 }
            );

            const [, , , , finalScore, isPassing] = await antScoring.getProposalInfo(1);
            expect(isPassing).to.be.false;
        });

        it("Should emit ProposalScored event", async function() {
            await expect(
                antScoring.connect(scorer1).scoreProposal(
                    1,
                    { novelty: 90, biologicalPlausibility: 90, priorEvidence: 90 },
                    { technicalViability: 90, dataQuality: 90, clarityOfProtocol: 90 },
                    { missionFit: 90, daoEngagement: 90 },
                    { costEffectiveness: 90, agenticResourceUse: 90 },
                    { dataProtocolSharing: 90, collaborativePotential: 90 }
                )
            ).to.emit(antScoring, "ProposalScored")
                .withArgs(1, scorer1.address, 90, true);
        });
    });

    describe("Proposal Fulfillment", function() {
        beforeEach(async function() {
            // Add scorer and submit proposal
            await antScoring.addAuthorizedScorer(scorer1.address);
            await antScoring.connect(proposer1).submitProposal(
                "Test Proposal",
                "Description",
                "QmHash"
            );

            // Score it with passing scores
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 90, biologicalPlausibility: 90, priorEvidence: 90 },
                { technicalViability: 90, dataQuality: 90, clarityOfProtocol: 90 },
                { missionFit: 90, daoEngagement: 90 },
                { costEffectiveness: 90, agenticResourceUse: 90 },
                { dataProtocolSharing: 90, collaborativePotential: 90 }
            );
        });

        it("Should allow submitter to fulfill passing proposal", async function() {
            await antScoring.connect(proposer1).fulfillProposal(1);
            
            const [, , , , , , isFulfilled] = await antScoring.getProposalInfo(1);
            expect(isFulfilled).to.be.true;
        });

        it("Should decrement active proposal count", async function() {
            const countBefore = await antScoring.activeProposalCount();
            await antScoring.connect(proposer1).fulfillProposal(1);
            const countAfter = await antScoring.activeProposalCount();
            
            expect(countAfter).to.equal(countBefore - 1n);
        });

        it("Should not allow non-submitter to fulfill", async function() {
            await expect(
                antScoring.connect(proposer2).fulfillProposal(1)
            ).to.be.revertedWith("Only submitter can fulfill proposal");
        });

        it("Should not allow fulfilling non-passing proposal", async function() {
            // Submit new proposal with low scores
            await antScoring.connect(proposer2).submitProposal(
                "Low Score Proposal",
                "Description",
                "QmHash2"
            );

            await antScoring.connect(scorer1).scoreProposal(
                2,
                { novelty: 50, biologicalPlausibility: 50, priorEvidence: 50 },
                { technicalViability: 50, dataQuality: 50, clarityOfProtocol: 50 },
                { missionFit: 50, daoEngagement: 50 },
                { costEffectiveness: 50, agenticResourceUse: 50 },
                { dataProtocolSharing: 50, collaborativePotential: 50 }
            );

            await expect(
                antScoring.connect(proposer2).fulfillProposal(2)
            ).to.be.revertedWith("Proposal not passed the threshold");
        });

        it("Should not allow fulfilling already fulfilled proposal", async function() {
            await antScoring.connect(proposer1).fulfillProposal(1);
            
            await expect(
                antScoring.connect(proposer1).fulfillProposal(1)
            ).to.be.revertedWith("Proposal already fulfilled");
        });

        it("Should emit ProposalFulfilled event", async function() {
            const tx = await antScoring.connect(proposer1).fulfillProposal(1);
            const receipt = await tx.wait();
            const block = await ethers.provider.getBlock(receipt.blockNumber);
            
            await expect(tx)
                .to.emit(antScoring, "ProposalFulfilled")
                .withArgs(1, proposer1.address, block.timestamp);
        });
    });

    describe("System Info", function() {
        it("Should return correct system info", async function() {
            await antScoring.connect(proposer1).submitProposal("Proposal 1", "Desc", "Hash");
            await antScoring.connect(proposer1).submitProposal("Proposal 2", "Desc", "Hash");

            const [ownerAddr, propCount, activeCount, threshold] = await antScoring.getSystemInfo();
            
            expect(ownerAddr).to.equal(owner.address);
            expect(propCount).to.equal(2);
            expect(activeCount).to.equal(2);
            expect(threshold).to.equal(80);
        });
    });

    describe("Real-World Scenario: Cancer Research Proposal", function() {
        it("Should handle complete proposal lifecycle", async function() {
            console.log("\n🔬 CANCER RESEARCH PROPOSAL SCENARIO");
            console.log("=" .repeat(50));

            // Setup: Add expert scorers
            await antScoring.addAuthorizedScorer(scorer1.address);
            await antScoring.addAuthorizedScorer(scorer2.address);
            await antScoring.addAuthorizedScorer(scorer3.address);
            console.log("\n✅ 3 Expert Scorers Authorized");

            // Submit proposal
            await antScoring.connect(proposer1).submitProposal(
                "Novel CRISPR Approach to Treat Lung Cancer",
                "A groundbreaking gene-editing technique targeting specific cancer mutations",
                "QmCancerResearch2024"
            );
            console.log("\n📝 Proposal Submitted:");
            console.log("   Title: Novel CRISPR Approach to Treat Lung Cancer");
            console.log("   Proposer:", proposer1.address);

            // Scorer 1: Very optimistic
            console.log("\n⭐ Scorer 1 Evaluation (Optimistic):");
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 95, biologicalPlausibility: 90, priorEvidence: 85 },
                { technicalViability: 92, dataQuality: 88, clarityOfProtocol: 90 },
                { missionFit: 95, daoEngagement: 92 },
                { costEffectiveness: 85, agenticResourceUse: 88 },
                { dataProtocolSharing: 90, collaborativePotential: 95 }
            );
            console.log("   Scientific Merit: High (novelty: 95)");
            console.log("   Feasibility: High (technical: 92)");
            console.log("   Community Fit: Excellent (95)");

            let [, , , , score1] = await antScoring.getProposalInfo(1);
            console.log("   → Score: " + score1);

            // Scorer 2: Moderate view
            console.log("\n⭐ Scorer 2 Evaluation (Moderate):");
            await antScoring.connect(scorer2).scoreProposal(
                1,
                { novelty: 85, biologicalPlausibility: 80, priorEvidence: 75 },
                { technicalViability: 82, dataQuality: 78, clarityOfProtocol: 80 },
                { missionFit: 85, daoEngagement: 82 },
                { costEffectiveness: 75, agenticResourceUse: 78 },
                { dataProtocolSharing: 80, collaborativePotential: 85 }
            );
            console.log("   Scientific Merit: Good (novelty: 85)");
            console.log("   Feasibility: Moderate (technical: 82)");
            console.log("   Community Fit: Good (85)");

            let [, , , , score2] = await antScoring.getProposalInfo(1);
            console.log("   → Average Score: " + score2);

            // Scorer 3: Conservative view
            console.log("\n⭐ Scorer 3 Evaluation (Conservative):");
            await antScoring.connect(scorer3).scoreProposal(
                1,
                { novelty: 80, biologicalPlausibility: 78, priorEvidence: 72 },
                { technicalViability: 80, dataQuality: 75, clarityOfProtocol: 78 },
                { missionFit: 82, daoEngagement: 80 },
                { costEffectiveness: 72, agenticResourceUse: 75 },
                { dataProtocolSharing: 78, collaborativePotential: 80 }
            );
            console.log("   Scientific Merit: Moderate (novelty: 80)");
            console.log("   Feasibility: Moderate (technical: 80)");
            console.log("   Community Fit: Good (82)");

            const [id, title, description, ipfsHash, finalScore, isPassing, isFulfilled, scorerCount] = 
                await antScoring.getProposalInfo(1);

            console.log("\n📊 FINAL RESULTS:");
            console.log("   Proposal ID:", id.toString());
            console.log("   Final Score:", finalScore.toString());
            console.log("   Scorers:", scorerCount.toString());
            console.log("   Status:", isPassing ? "✅ PASSING" : "❌ NOT PASSING");
            console.log("   Threshold: 80");

            expect(scorerCount).to.equal(3);
            expect(isPassing).to.be.true;

            // Fulfill proposal
            console.log("\n🎉 Proposal Fulfillment:");
            await antScoring.connect(proposer1).fulfillProposal(1);
            console.log("   ✅ Proposal marked as fulfilled");
            console.log("   ✅ Research can now proceed with funding");

            const [, , , , , , fulfilled] = await antScoring.getProposalInfo(1);
            expect(fulfilled).to.be.true;

            console.log("\n✅ Complete proposal lifecycle successful!");
        });
    });

    describe("Integration with Badge System", function() {
        beforeEach(async function() {
            await antScoring.addAuthorizedScorer(scorer1.address);
            
            // Submit and score proposal
            await antScoring.connect(proposer1).submitProposal(
                "Integrated Test Proposal",
                "Testing badge integration",
                "QmTestHash"
            );
            
            await antScoring.connect(scorer1).scoreProposal(
                1,
                { novelty: 92, biologicalPlausibility: 90, priorEvidence: 88 },
                { technicalViability: 90, dataQuality: 88, clarityOfProtocol: 90 },
                { missionFit: 92, daoEngagement: 90 },
                { costEffectiveness: 88, agenticResourceUse: 85 },
                { dataProtocolSharing: 90, collaborativePotential: 92 }
            );
        });

        it("Should automatically issue badge when proposal fulfilled", async function() {
            // Fulfill proposal
            await antScoring.connect(proposer1).fulfillProposal(1);
            
            // Check that badge was issued
            const badgeId = await antScoring.getProposalBadge(1);
            expect(badgeId).to.be.gt(0);
            
            // Verify badge exists in LabBadge contract
            const labBadgeAddress = await triLaneSystem.labBadge();
            const labBadge = await ethers.getContractAt("LabBadge", labBadgeAddress);
            
            const badgeOwner = await labBadge.ownerOf(badgeId);
            expect(badgeOwner).to.equal(proposer1.address);
        });

        it("Should issue correct badge tier based on score", async function() {
            // Score is ~89 → should get GOLD badge
            await antScoring.connect(proposer1).fulfillProposal(1);
            
            const badgeId = await antScoring.getProposalBadge(1);
            const labBadgeAddress = await triLaneSystem.labBadge();
            const labBadge = await ethers.getContractAt("LabBadge", labBadgeAddress);
            
            const badgeLevel = await labBadge.getBadgeLevel(badgeId);
            expect(badgeLevel).to.equal(2); // GOLD = 2 (score 85-89)
        });

        it("Should allow commercializing proposal and creating royalty pool", async function() {
            // Fulfill proposal first
            await antScoring.connect(proposer1).fulfillProposal(1);
            const badgeId = await antScoring.getProposalBadge(1);
            
            // Commercialize proposal
            await antScoring.commercializeProposal(
                1,
                "Patent #US-TEST-2024",
                [badgeId]
            );
            
            // Check royalty pool was created
            const poolId = await antScoring.getProposalRoyaltyPool(1);
            expect(poolId).to.be.gt(0);
            
            // Verify pool exists
            const [ipId, , , , badgeCount] = await triLaneSystem.getRoyaltyPoolInfo(poolId);
            expect(ipId).to.equal("Patent #US-TEST-2024");
            expect(badgeCount).to.equal(1);
        });

        it("Should not allow commercializing unfulfilled proposal", async function() {
            await expect(
                antScoring.commercializeProposal(1, "Patent #123", [1])
            ).to.be.revertedWith("Proposal not fulfilled");
        });

        it("Should not allow commercializing same proposal twice", async function() {
            await antScoring.connect(proposer1).fulfillProposal(1);
            const badgeId = await antScoring.getProposalBadge(1);
            
            await antScoring.commercializeProposal(1, "Patent #123", [badgeId]);
            
            await expect(
                antScoring.commercializeProposal(1, "Patent #456", [badgeId])
            ).to.be.revertedWith("Proposal already commercialized");
        });
    });
});

