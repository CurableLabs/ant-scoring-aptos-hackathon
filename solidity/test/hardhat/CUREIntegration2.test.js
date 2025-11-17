// Test file for CUREIntegration2.sol
// Tests the CURE Token Integration for ANT Scoring system

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CUREIntegration Contract", function() {
    let cureIntegration;
    let owner;
    let scorer1;
    let scorer2;
    let researcher;

    // Helper to advance time in tests
    async function advanceTime(seconds) {
        await ethers.provider.send("evm_increaseTime", [seconds]);
        await ethers.provider.send("evm_mine");
    }

    // Deploy contract before each test
    beforeEach(async function() {
        // Get test accounts
        [owner, scorer1, scorer2, researcher] = await ethers.getSigners();

        // Deploy the contract
        const CUREIntegration = await ethers.getContractFactory("CUREIntegration");
        cureIntegration = await CUREIntegration.deploy();
        await cureIntegration.waitForDeployment();
    });

    // ========================================
    // DEPLOYMENT TESTS
    // ========================================
    
    describe("Deployment", function() {
        it("Should deploy successfully", async function() {
            expect(await cureIntegration.getAddress()).to.be.properAddress;
        });

        it("Should set the correct owner", async function() {
            expect(await cureIntegration.owner()).to.equal(owner.address);
        });

        it("Should initialize with zero state", async function() {
            expect(await cureIntegration.totalCureStaked()).to.equal(0);
            expect(await cureIntegration.totalScorers()).to.equal(0);
            expect(await cureIntegration.proposalCounter()).to.equal(0);
            expect(await cureIntegration.communityTreasury()).to.equal(0);
            expect(await cureIntegration.rewardPool()).to.equal(0);
        });

        it("Should set correct constants", async function() {
            const minStake = ethers.parseEther("1000");
            const proposalFee = ethers.parseEther("10");
            const accuracyBonus = ethers.parseEther("50");
            const votingPeriod = 7 * 24 * 60 * 60; // 7 days in seconds

            expect(await cureIntegration.MIN_SCORER_STAKE()).to.equal(minStake);
            expect(await cureIntegration.PROPOSAL_FEE()).to.equal(proposalFee);
            expect(await cureIntegration.ACCURACY_BONUS_RATE()).to.equal(accuracyBonus);
            expect(await cureIntegration.VOTING_PERIOD()).to.equal(votingPeriod);
        });

        it("Should not be paused initially", async function() {
            expect(await cureIntegration.paused()).to.equal(false);
        });
    });

    // ========================================
    // SCORER STAKING TESTS
    // ========================================
    
    describe("Scorer Staking", function() {
        const minStake = ethers.parseEther("1000");

        it("Should allow staking to become scorer", async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.stakedAmount).to.equal(minStake);
            expect(stake.votingPower).to.equal(minStake); // 1:1 ratio
            expect(stake.accuracyScore).to.equal(100); // Starts at 100
            expect(await cureIntegration.totalScorers()).to.equal(1);
            expect(await cureIntegration.totalCureStaked()).to.equal(minStake);
        });

        it("Should revert if staking less than minimum", async function() {
            const lessThanMin = ethers.parseEther("999");
            
            await expect(
                cureIntegration.connect(scorer1).stakeToBeScorer(lessThanMin)
            ).to.be.revertedWithCustomError(cureIntegration, "InsufficientStake");
        });

        it("Should allow multiple scorers to stake", async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            await cureIntegration.connect(scorer2).stakeToBeScorer(minStake);
            
            expect(await cureIntegration.totalScorers()).to.equal(2);
            expect(await cureIntegration.totalCureStaked()).to.equal(minStake * 2n);
        });

        it("Should emit ScorerStaked event", async function() {
            await expect(cureIntegration.connect(scorer1).stakeToBeScorer(minStake))
                .to.emit(cureIntegration, "ScorerStaked")
                .withArgs(scorer1.address, minStake, minStake);
        });

        it("Should allow increasing stake", async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            
            const additionalStake = ethers.parseEther("500");
            await cureIntegration.connect(scorer1).increaseStake(additionalStake);
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.stakedAmount).to.equal(minStake + additionalStake);
        });

        it("Should revert if increasing stake by 0", async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            
            await expect(
                cureIntegration.connect(scorer1).increaseStake(0)
            ).to.be.revertedWithCustomError(cureIntegration, "InsufficientStake");
        });
    });

    // ========================================
    // SCORER UNSTAKING TESTS
    // ========================================
    
    describe("Scorer Unstaking", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
        });

        it("Should allow scorer to unstake", async function() {
            await cureIntegration.connect(scorer1).unstakeScorer();
            
            expect(await cureIntegration.totalScorers()).to.equal(0);
            expect(await cureIntegration.totalCureStaked()).to.equal(0);
        });

        it("Should revert if non-scorer tries to unstake", async function() {
            await expect(
                cureIntegration.connect(scorer2).unstakeScorer()
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should emit ScorerUnstaked event", async function() {
            await expect(cureIntegration.connect(scorer1).unstakeScorer())
                .to.emit(cureIntegration, "ScorerUnstaked")
                .withArgs(scorer1.address, minStake);
        });

        it("Should delete scorer data after unstaking", async function() {
            await cureIntegration.connect(scorer1).unstakeScorer();
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.stakedAmount).to.equal(0);
        });
    });

    // ========================================
    // PROPOSAL FEE TESTS
    // ========================================
    
    describe("Proposal Fees", function() {
        it("Should pay proposal fee", async function() {
            const fee = await cureIntegration.connect(researcher).payProposalFee();
            
            expect(await cureIntegration.communityTreasury()).to.equal(
                ethers.parseEther("10")
            );
        });

        it("Should return correct fee amount", async function() {
            const tx = await cureIntegration.connect(researcher).payProposalFee();
            const receipt = await tx.wait();
            
            expect(await cureIntegration.communityTreasury()).to.equal(
                ethers.parseEther("10")
            );
        });
    });

    // ========================================
    // GOVERNANCE PROPOSAL TESTS
    // ========================================
    
    describe("Governance Proposals", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
        });

        it("Should create governance proposal", async function() {
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Change Weights",
                "Update scientific merit weight",
                40, 20, 20, 10, 10 // Weights that sum to 100
            );
            
            expect(await cureIntegration.proposalCounter()).to.equal(1);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.proposalId).to.equal(1);
            expect(proposal.proposer).to.equal(scorer1.address);
            expect(proposal.title).to.equal("Change Weights");
            expect(proposal.status).to.equal(0); // Active
        });

        it("Should revert if non-scorer tries to create proposal", async function() {
            await expect(
                cureIntegration.connect(researcher).createGovernanceProposal(
                    "Test", "Description", 20, 20, 20, 20, 20
                )
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should revert if weights don't sum to 100", async function() {
            await expect(
                cureIntegration.connect(scorer1).createGovernanceProposal(
                    "Bad Weights", "Invalid", 30, 30, 30, 30, 30 // Sums to 150
                )
            ).to.be.revertedWithCustomError(cureIntegration, "InvalidWeights");
        });

        it("Should emit GovernanceProposalCreated event", async function() {
            await expect(
                cureIntegration.connect(scorer1).createGovernanceProposal(
                    "Test", "Description", 20, 20, 20, 20, 20
                )
            ).to.emit(cureIntegration, "GovernanceProposalCreated");
        });

        it("Should set voting period correctly", async function() {
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test", "Description", 20, 20, 20, 20, 20
            );
            
            const proposal = await cureIntegration.proposals(1);
            const expectedEnd = (await ethers.provider.getBlock('latest')).timestamp + (7 * 24 * 60 * 60);
            
            expect(proposal.votingEnds).to.be.closeTo(expectedEnd, 5); // Within 5 seconds
        });
    });

    // ========================================
    // VOTING TESTS
    // ========================================
    
    describe("Proposal Voting", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            await cureIntegration.connect(scorer2).stakeToBeScorer(minStake);
            
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test", "Description", 20, 20, 20, 20, 20
            );
        });

        it("Should allow scorer to vote", async function() {
            await cureIntegration.connect(scorer2).voteOnProposal(1, true);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.cureVotesFor).to.equal(minStake);
        });

        it("Should record votes against", async function() {
            await cureIntegration.connect(scorer2).voteOnProposal(1, false);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.cureVotesAgainst).to.equal(minStake);
        });

        it("Should revert if non-scorer tries to vote", async function() {
            await expect(
                cureIntegration.connect(researcher).voteOnProposal(1, true)
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should revert if voting twice", async function() {
            await cureIntegration.connect(scorer2).voteOnProposal(1, true);
            
            await expect(
                cureIntegration.connect(scorer2).voteOnProposal(1, true)
            ).to.be.revertedWithCustomError(cureIntegration, "AlreadyVoted");
        });

        it("Should revert if proposal doesn't exist", async function() {
            await expect(
                cureIntegration.connect(scorer1).voteOnProposal(999, true)
            ).to.be.revertedWithCustomError(cureIntegration, "ProposalNotFound");
        });

        it("Should revert if voting period ended", async function() {
            // Fast forward past voting period (7 days)
            await advanceTime(8 * 24 * 60 * 60);
            
            await expect(
                cureIntegration.connect(scorer2).voteOnProposal(1, true)
            ).to.be.revertedWithCustomError(cureIntegration, "VotingEnded");
        });

        it("Should emit ProposalVoted event", async function() {
            await expect(cureIntegration.connect(scorer2).voteOnProposal(1, true))
                .to.emit(cureIntegration, "ProposalVoted")
                .withArgs(1, scorer2.address, true, minStake);
        });
    });

    // ========================================
    // PROPOSAL FINALIZATION TESTS
    // ========================================
    
    describe("Proposal Finalization", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            await cureIntegration.connect(scorer2).stakeToBeScorer(minStake);
            
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test", "Description", 20, 20, 20, 20, 20
            );
        });

        it("Should finalize proposal with more votes for", async function() {
            await cureIntegration.connect(scorer1).voteOnProposal(1, true);
            await cureIntegration.connect(scorer2).voteOnProposal(1, true);
            
            // Fast forward past voting period
            await advanceTime(8 * 24 * 60 * 60);
            
            await cureIntegration.connect(owner).finalizeProposal(1);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.status).to.equal(1); // Passed
        });

        it("Should finalize proposal with more votes against", async function() {
            await cureIntegration.connect(scorer1).voteOnProposal(1, false);
            await cureIntegration.connect(scorer2).voteOnProposal(1, false);
            
            // Fast forward past voting period
            await advanceTime(8 * 24 * 60 * 60);
            
            await cureIntegration.connect(owner).finalizeProposal(1);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.status).to.equal(2); // Rejected
        });

        it("Should revert if voting still active", async function() {
            await expect(
                cureIntegration.connect(owner).finalizeProposal(1)
            ).to.be.revertedWithCustomError(cureIntegration, "VotingStillActive");
        });

        it("Should revert if already finalized", async function() {
            await advanceTime(8 * 24 * 60 * 60);
            await cureIntegration.connect(owner).finalizeProposal(1);
            
            await expect(
                cureIntegration.connect(owner).finalizeProposal(1)
            ).to.be.revertedWithCustomError(cureIntegration, "ProposalAlreadyFinalized");
        });

        it("Should emit ProposalFinalized event", async function() {
            await advanceTime(8 * 24 * 60 * 60);
            
            await expect(cureIntegration.connect(owner).finalizeProposal(1))
                .to.emit(cureIntegration, "ProposalFinalized");
        });
    });

    // ========================================
    // PROPOSAL CANCELLATION TESTS
    // ========================================
    
    describe("Proposal Cancellation", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test", "Description", 20, 20, 20, 20, 20
            );
        });

        it("Should allow proposer to cancel their proposal", async function() {
            await cureIntegration.connect(scorer1).cancelProposal(1);
            
            const proposal = await cureIntegration.proposals(1);
            expect(proposal.status).to.equal(3); // Cancelled
        });

        it("Should revert if non-proposer tries to cancel", async function() {
            await cureIntegration.connect(scorer2).stakeToBeScorer(minStake);
            
            await expect(
                cureIntegration.connect(scorer2).cancelProposal(1)
            ).to.be.revertedWithCustomError(cureIntegration, "NotProposer");
        });

        it("Should emit ProposalCancelled event", async function() {
            await expect(cureIntegration.connect(scorer1).cancelProposal(1))
                .to.emit(cureIntegration, "ProposalCancelled")
                .withArgs(1, scorer1.address);
        });
    });

    // ========================================
    // REWARDS TESTS
    // ========================================
    
    describe("Scorer Rewards", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
        });

        it("Should allow owner to reward accurate scorer", async function() {
            const bonusAmount = ethers.parseEther("50");
            
            await cureIntegration.connect(owner).rewardAccurateScorer(scorer1.address, bonusAmount);
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.rewardsEarned).to.equal(bonusAmount);
            expect(await cureIntegration.rewardPool()).to.equal(bonusAmount);
        });

        it("Should revert if rewarding non-scorer", async function() {
            await expect(
                cureIntegration.connect(owner).rewardAccurateScorer(researcher.address, 100)
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should allow scorer to claim rewards", async function() {
            const bonusAmount = ethers.parseEther("50");
            await cureIntegration.connect(owner).rewardAccurateScorer(scorer1.address, bonusAmount);
            
            await cureIntegration.connect(scorer1).claimRewards();
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.rewardsEarned).to.equal(0);
        });

        it("Should revert if no rewards to claim", async function() {
            await expect(
                cureIntegration.connect(scorer1).claimRewards()
            ).to.be.revertedWithCustomError(cureIntegration, "NoRewardsAvailable");
        });

        it("Should emit RewardsClaimed event", async function() {
            const bonusAmount = ethers.parseEther("50");
            await cureIntegration.connect(owner).rewardAccurateScorer(scorer1.address, bonusAmount);
            
            await expect(cureIntegration.connect(scorer1).claimRewards())
                .to.emit(cureIntegration, "RewardsClaimed")
                .withArgs(scorer1.address, bonusAmount);
        });

        it("Should emit CURERewardPaid event", async function() {
            const bonusAmount = ethers.parseEther("50");
            
            await expect(
                cureIntegration.connect(owner).rewardAccurateScorer(scorer1.address, bonusAmount)
            ).to.emit(cureIntegration, "CURERewardPaid");
        });
    });

    // ========================================
    // ACCURACY SCORE TESTS
    // ========================================
    
    describe("Accuracy Score Updates", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
        });

        it("Should allow owner to update accuracy score", async function() {
            await cureIntegration.connect(owner).updateScorerAccuracy(scorer1.address, 95);
            
            const stake = await cureIntegration.scorerStakes(scorer1.address);
            expect(stake.accuracyScore).to.equal(95);
        });

        it("Should revert if accuracy score > 100", async function() {
            await expect(
                cureIntegration.connect(owner).updateScorerAccuracy(scorer1.address, 101)
            ).to.be.revertedWithCustomError(cureIntegration, "InvalidAccuracy");
        });

        it("Should revert if updating non-scorer", async function() {
            await expect(
                cureIntegration.connect(owner).updateScorerAccuracy(researcher.address, 90)
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should emit AccuracyUpdated event", async function() {
            await expect(
                cureIntegration.connect(owner).updateScorerAccuracy(scorer1.address, 95)
            ).to.emit(cureIntegration, "AccuracyUpdated");
        });
    });

    // ========================================
    // ADMIN FUNCTIONS TESTS
    // ========================================
    
    describe("Admin Functions", function() {
        it("Should allow owner to pause", async function() {
            await cureIntegration.connect(owner).pause();
            expect(await cureIntegration.paused()).to.equal(true);
        });

        it("Should allow owner to unpause", async function() {
            await cureIntegration.connect(owner).pause();
            await cureIntegration.connect(owner).unpause();
            expect(await cureIntegration.paused()).to.equal(false);
        });

        it("Should revert if non-owner tries to pause", async function() {
            await expect(
                cureIntegration.connect(scorer1).pause()
            ).to.be.revertedWithCustomError(cureIntegration, "NotOwner");
        });

        it("Should prevent staking when paused", async function() {
            await cureIntegration.connect(owner).pause();
            
            await expect(
                cureIntegration.connect(scorer1).stakeToBeScorer(ethers.parseEther("1000"))
            ).to.be.revertedWithCustomError(cureIntegration, "ContractPaused");
        });

        it("Should prevent voting when paused", async function() {
            const minStake = ethers.parseEther("1000");
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test", "Desc", 20, 20, 20, 20, 20
            );
            
            await cureIntegration.connect(owner).pause();
            
            await expect(
                cureIntegration.connect(scorer1).voteOnProposal(1, true)
            ).to.be.revertedWithCustomError(cureIntegration, "ContractPaused");
        });

        it("Should allow owner to transfer ownership", async function() {
            await cureIntegration.connect(owner).transferOwnership(scorer1.address);
            expect(await cureIntegration.owner()).to.equal(scorer1.address);
        });

        it("Should revert if transferring to zero address", async function() {
            await expect(
                cureIntegration.connect(owner).transferOwnership(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(cureIntegration, "InvalidAddress");
        });

        it("Should emit OwnershipTransferred event", async function() {
            await expect(cureIntegration.connect(owner).transferOwnership(scorer1.address))
                .to.emit(cureIntegration, "OwnershipTransferred")
                .withArgs(owner.address, scorer1.address);
        });
    });

    // ========================================
    // VIEW FUNCTIONS TESTS
    // ========================================
    
    describe("View Functions", function() {
        const minStake = ethers.parseEther("1000");

        beforeEach(async function() {
            await cureIntegration.connect(scorer1).stakeToBeScorer(minStake);
        });

        it("Should return scorer stake information", async function() {
            const stake = await cureIntegration.getScorerStake(scorer1.address);
            expect(stake.stakedAmount).to.equal(minStake);
            expect(stake.votingPower).to.equal(minStake);
            expect(stake.accuracyScore).to.equal(100);
        });

        it("Should revert if getting non-scorer stake", async function() {
            await expect(
                cureIntegration.getScorerStake(researcher.address)
            ).to.be.revertedWithCustomError(cureIntegration, "NotAuthorizedScorer");
        });

        it("Should return governance proposal details", async function() {
            await cureIntegration.connect(scorer1).createGovernanceProposal(
                "Test Title", "Test Description", 20, 20, 20, 20, 20
            );
            
            const proposal = await cureIntegration.getGovernanceProposal(1);
            expect(proposal.title).to.equal("Test Title");
            expect(proposal.description).to.equal("Test Description");
        });

        it("Should revert if getting non-existent proposal", async function() {
            await expect(
                cureIntegration.getGovernanceProposal(999)
            ).to.be.revertedWithCustomError(cureIntegration, "ProposalNotFound");
        });

        it("Should return integration statistics", async function() {
            const [totalStaked, totalScorers, treasury, pool] = 
                await cureIntegration.getIntegrationStats();
            
            expect(totalStaked).to.equal(minStake);
            expect(totalScorers).to.equal(1);
            expect(treasury).to.equal(0);
            expect(pool).to.equal(0);
        });
    });
});

