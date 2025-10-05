#!/usr/bin/env ts-node
"use strict";
/**
 * ANT Scoring System Demo for Aptos Ctrl+MOVE Hackathon
 *
 * This demo showcases the complete workflow of the ANT (Algorithmic Network Triage)
 * scoring system - a novel DeFi primitive for decentralized research funding.
 *
 * Features demonstrated:
 * - Proposal submission and management
 * - Multi-dimensional scoring (5 categories)
 * - Multi-scorer evaluation and averaging
 * - 80% threshold automatic fulfillment
 * - Real-time scoring calculations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTScoringDemo = void 0;
const antScoringUtils_1 = require("./antScoringUtils");
// Demo configuration
const DEMO_CONFIG = {
    nodeUrl: "https://fullnode.devnet.aptoslabs.com/v1",
    network: "devnet",
    moduleAddress: "0x1234567890abcdef", // This would be your deployed address
};
// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};
class ANTScoringDemo {
    constructor() {
        // Create demo accounts
        this.accounts = {
            deployer: new AptosAccount(),
            researchers: [
                new AptosAccount(), // Dr. Alice Chen
                new AptosAccount(), // Dr. Bob Rodriguez  
                new AptosAccount(), // Dr. Carol Kim
            ],
            scorers: [
                new AptosAccount(), // Prof. David Miller
                new AptosAccount(), // Dr. Emily Johnson
                new AptosAccount(), // Dr. Frank Zhang
            ]
        };
        this.helper = new antScoringUtils_1.ANTScoringHelper(DEMO_CONFIG, this.accounts.deployer);
    }
    /**
     * Print formatted header
     */
    printHeader(title, color = colors.cyan) {
        console.log(`\n${color}${'='.repeat(60)}${colors.reset}`);
        console.log(`${color}${colors.bright}${title.toUpperCase().padStart((60 + title.length) / 2)}${colors.reset}`);
        console.log(`${color}${'='.repeat(60)}${colors.reset}\n`);
    }
    /**
     * Print proposal details
     */
    printProposal(id, title, researcher, description) {
        console.log(`${colors.blue}📋 Proposal #${id}${colors.reset}`);
        console.log(`${colors.bright}Title:${colors.reset} ${title}`);
        console.log(`${colors.bright}Researcher:${colors.reset} ${researcher}`);
        console.log(`${colors.bright}Description:${colors.reset} ${description}`);
        console.log(`${colors.bright}Address:${colors.reset} ${this.accounts.researchers[id - 1]?.address().hex().slice(0, 10)}...`);
    }
    /**
     * Print scoring details
     */
    printScoring(scorer, scores, finalScore) {
        console.log(`\n${colors.yellow}🔬 Scoring by ${scorer}${colors.reset}`);
        console.log(`${colors.bright}Scientific Merit (40%):${colors.reset}`);
        console.log(`  • Novelty: ${scores.scientific_merit.novelty}%`);
        console.log(`  • Biological Plausibility: ${scores.scientific_merit.biological_plausibility}%`);
        console.log(`  • Prior Evidence: ${scores.scientific_merit.prior_evidence}%`);
        console.log(`${colors.bright}Feasibility (25%):${colors.reset}`);
        console.log(`  • Technical Viability: ${scores.feasibility.technical_viability}%`);
        console.log(`  • Data Quality: ${scores.feasibility.data_quality}%`);
        console.log(`  • Protocol Clarity: ${scores.feasibility.clarity_of_protocol}%`);
        console.log(`${colors.bright}Community Alignment (20%):${colors.reset}`);
        console.log(`  • Mission Fit: ${scores.community_alignment.mission_fit}%`);
        console.log(`  • DAO Engagement: ${scores.community_alignment.dao_engagement}%`);
        console.log(`${colors.bright}Resource Efficiency (10%):${colors.reset}`);
        console.log(`  • Cost Effectiveness: ${scores.resource_efficiency.cost_effectiveness}%`);
        console.log(`  • Agentic Resource Use: ${scores.resource_efficiency.agentic_resource_use}%`);
        console.log(`${colors.bright}Open Science (5%):${colors.reset}`);
        console.log(`  • Data/Protocol Sharing: ${scores.open_science.data_protocol_sharing}%`);
        console.log(`  • Collaborative Potential: ${scores.open_science.collaborative_potential}%`);
        const passColor = finalScore >= 80 ? colors.green : colors.red;
        const passText = finalScore >= 80 ? "✅ PASSES" : "❌ FAILS";
        console.log(`\n${colors.bright}Final Score: ${passColor}${finalScore}% ${passText}${colors.reset}`);
    }
    /**
     * Simulate proposal submission
     */
    async simulateProposalSubmission() {
        this.printHeader("🚀 PROPOSAL SUBMISSION PHASE");
        const proposals = [
            {
                title: "CRISPR-Cas9 Gene Therapy for Alzheimer's Disease",
                researcher: "Dr. Alice Chen",
                description: "Novel approach using CRISPR-Cas9 to edit APOE4 variants in brain cells, with preliminary mouse studies showing 40% reduction in amyloid plaques and improved cognitive function.",
                ipfs: "QmAlzheimer12345"
            },
            {
                title: "AI-Powered Drug Discovery for Rare Cancers",
                researcher: "Dr. Bob Rodriguez",
                description: "Machine learning platform combining genomics data with chemical libraries to identify novel therapeutic targets for pediatric sarcomas, validated in 3 cell lines.",
                ipfs: "QmCancerAI67890"
            },
            {
                title: "Microbiome Engineering for Diabetes Prevention",
                researcher: "Dr. Carol Kim",
                description: "Engineered probiotic consortium designed to regulate glucose metabolism through targeted microbiome modification, with promising results in diabetic mouse models.",
                ipfs: "QmMicrobiome999"
            }
        ];
        const proposalIds = [];
        for (let i = 0; i < proposals.length; i++) {
            const proposal = proposals[i];
            console.log(`${colors.bright}Submitting Proposal ${i + 1}/3...${colors.reset}`);
            this.printProposal(i + 1, proposal.title, proposal.researcher, proposal.description);
            // Simulate proposal submission
            console.log(`${colors.green}✅ Proposal submitted successfully!${colors.reset}`);
            console.log(`${colors.cyan}📋 Proposal ID: ${i + 1}${colors.reset}`);
            console.log(`${colors.cyan}📝 IPFS Hash: ${proposal.ipfs}${colors.reset}`);
            console.log(`${colors.cyan}⏰ Status: Active and ready for scoring${colors.reset}\n`);
            proposalIds.push(i + 1);
            // Add delay for demo effect
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log(`${colors.green}${colors.bright}🎉 All proposals submitted and ready for evaluation!${colors.reset}`);
        return proposalIds;
    }
    /**
     * Simulate scoring phase
     */
    async simulateScoring(proposalIds) {
        this.printHeader("🔬 SCORING PHASE - MULTI-DIMENSIONAL EVALUATION");
        const scorers = [
            { name: "Prof. David Miller", specialty: "Biotech & Gene Therapy" },
            { name: "Dr. Emily Johnson", specialty: "AI/ML in Healthcare" },
            { name: "Dr. Frank Zhang", specialty: "Microbiome Research" }
        ];
        // Scoring scenarios for each proposal
        const scoringScenarios = [
            {
                // Proposal 1: CRISPR - Should PASS (high quality)
                scores: [
                    {
                        scientific_merit: { novelty: 92, biological_plausibility: 88, prior_evidence: 85 },
                        feasibility: { technical_viability: 80, data_quality: 90, clarity_of_protocol: 92 },
                        community_alignment: { mission_fit: 95, dao_engagement: 85 },
                        resource_efficiency: { cost_effectiveness: 75, agentic_resource_use: 80 },
                        open_science: { data_protocol_sharing: 90, collaborative_potential: 95 }
                    },
                    {
                        scientific_merit: { novelty: 88, biological_plausibility: 92, prior_evidence: 82 },
                        feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 90 },
                        community_alignment: { mission_fit: 90, dao_engagement: 88 },
                        resource_efficiency: { cost_effectiveness: 80, agentic_resource_use: 85 },
                        open_science: { data_protocol_sharing: 85, collaborative_potential: 90 }
                    },
                    {
                        scientific_merit: { novelty: 90, biological_plausibility: 85, prior_evidence: 88 },
                        feasibility: { technical_viability: 88, data_quality: 85, clarity_of_protocol: 88 },
                        community_alignment: { mission_fit: 92, dao_engagement: 82 },
                        resource_efficiency: { cost_effectiveness: 78, agentic_resource_use: 82 },
                        open_science: { data_protocol_sharing: 88, collaborative_potential: 92 }
                    }
                ]
            },
            {
                // Proposal 2: AI Drug Discovery - Should PASS (borderline)
                scores: [
                    {
                        scientific_merit: { novelty: 85, biological_plausibility: 80, prior_evidence: 75 },
                        feasibility: { technical_viability: 90, data_quality: 85, clarity_of_protocol: 88 },
                        community_alignment: { mission_fit: 88, dao_engagement: 82 },
                        resource_efficiency: { cost_effectiveness: 85, agentic_resource_use: 90 },
                        open_science: { data_protocol_sharing: 80, collaborative_potential: 85 }
                    },
                    {
                        scientific_merit: { novelty: 80, biological_plausibility: 85, prior_evidence: 78 },
                        feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 85 },
                        community_alignment: { mission_fit: 85, dao_engagement: 80 },
                        resource_efficiency: { cost_effectiveness: 80, agentic_resource_use: 85 },
                        open_science: { data_protocol_sharing: 85, collaborative_potential: 80 }
                    },
                    {
                        scientific_merit: { novelty: 82, biological_plausibility: 78, prior_evidence: 80 },
                        feasibility: { technical_viability: 88, data_quality: 90, clarity_of_protocol: 82 },
                        community_alignment: { mission_fit: 82, dao_engagement: 85 },
                        resource_efficiency: { cost_effectiveness: 88, agentic_resource_use: 88 },
                        open_science: { data_protocol_sharing: 82, collaborative_potential: 88 }
                    }
                ]
            },
            {
                // Proposal 3: Microbiome - Should FAIL (below threshold)
                scores: [
                    {
                        scientific_merit: { novelty: 75, biological_plausibility: 70, prior_evidence: 68 },
                        feasibility: { technical_viability: 72, data_quality: 75, clarity_of_protocol: 78 },
                        community_alignment: { mission_fit: 80, dao_engagement: 75 },
                        resource_efficiency: { cost_effectiveness: 70, agentic_resource_use: 75 },
                        open_science: { data_protocol_sharing: 78, collaborative_potential: 80 }
                    },
                    {
                        scientific_merit: { novelty: 70, biological_plausibility: 75, prior_evidence: 72 },
                        feasibility: { technical_viability: 75, data_quality: 70, clarity_of_protocol: 75 },
                        community_alignment: { mission_fit: 75, dao_engagement: 70 },
                        resource_efficiency: { cost_effectiveness: 68, agentic_resource_use: 70 },
                        open_science: { data_protocol_sharing: 75, collaborative_potential: 78 }
                    },
                    {
                        scientific_merit: { novelty: 72, biological_plausibility: 68, prior_evidence: 70 },
                        feasibility: { technical_viability: 70, data_quality: 72, clarity_of_protocol: 70 },
                        community_alignment: { mission_fit: 72, dao_engagement: 78 },
                        resource_efficiency: { cost_effectiveness: 72, agentic_resource_use: 68 },
                        open_science: { data_protocol_sharing: 70, collaborative_potential: 75 }
                    }
                ]
            }
        ];
        const finalScores = [];
        for (let proposalIndex = 0; proposalIndex < proposalIds.length; proposalIndex++) {
            const proposalId = proposalIds[proposalIndex];
            console.log(`\n${colors.magenta}${colors.bright}📊 Evaluating Proposal #${proposalId}${colors.reset}`);
            console.log(`${colors.bright}Multiple expert scorers are now evaluating this proposal...${colors.reset}`);
            let cumulativeScore = 0;
            let scorerCount = 0;
            for (let scorerIndex = 0; scorerIndex < scorers.length; scorerIndex++) {
                const scorer = scorers[scorerIndex];
                const scores = scoringScenarios[proposalIndex].scores[scorerIndex];
                const individualScore = this.helper.calculateFinalScore(scores);
                this.printScoring(scorer.name, scores, individualScore);
                cumulativeScore += individualScore;
                scorerCount++;
                console.log(`${colors.cyan}📝 Score submitted to blockchain...${colors.reset}`);
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            const averageScore = Math.round(cumulativeScore / scorerCount);
            finalScores.push(averageScore);
            console.log(`\n${colors.bright}📈 FINAL AVERAGED SCORE${colors.reset}`);
            console.log(`${colors.bright}Scorer Count: ${scorerCount}${colors.reset}`);
            console.log(`${colors.bright}Individual Scores: ${finalScores.slice(-1)[0] === averageScore ?
                scoringScenarios[proposalIndex].scores.map((_, i) => this.helper.calculateFinalScore(scoringScenarios[proposalIndex].scores[i])).join('%, ') + '%' : ''}${colors.reset}`);
            const passColor = averageScore >= 80 ? colors.green : colors.red;
            const passText = averageScore >= 80 ? "✅ PASSES 80% THRESHOLD" : "❌ BELOW 80% THRESHOLD";
            console.log(`${colors.bright}Average Final Score: ${passColor}${averageScore}% ${passText}${colors.reset}`);
            if (averageScore >= 80) {
                console.log(`${colors.green}🎉 Proposal qualified for automatic fulfillment!${colors.reset}`);
            }
            else {
                console.log(`${colors.red}📋 Proposal needs improvement to meet funding threshold${colors.reset}`);
            }
            console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}`);
        }
        return finalScores;
    }
    /**
     * Simulate fulfillment phase
     */
    async simulateFulfillment(proposalIds, finalScores) {
        this.printHeader("💰 FULFILLMENT PHASE - AUTOMATIC FUNDING");
        const passingProposals = proposalIds.filter((_, index) => finalScores[index] >= 80);
        const failingProposals = proposalIds.filter((_, index) => finalScores[index] < 80);
        if (passingProposals.length === 0) {
            console.log(`${colors.red}❌ No proposals met the 80% threshold for automatic fulfillment${colors.reset}`);
            return;
        }
        console.log(`${colors.green}${colors.bright}🎯 ${passingProposals.length} proposal(s) qualified for funding!${colors.reset}\n`);
        for (const proposalId of passingProposals) {
            const scoreIndex = proposalIds.indexOf(proposalId);
            const score = finalScores[scoreIndex];
            console.log(`${colors.green}💰 Fulfilling Proposal #${proposalId}${colors.reset}`);
            console.log(`${colors.bright}Final Score: ${score}%${colors.reset}`);
            console.log(`${colors.bright}Funding Amount: ${this.calculateFundingAmount(score)} APT${colors.reset}`);
            console.log(`${colors.cyan}🔄 Processing automatic fulfillment...${colors.reset}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`${colors.green}✅ Proposal fulfilled successfully!${colors.reset}`);
            console.log(`${colors.green}💸 Funds transferred to researcher${colors.reset}`);
            console.log(`${colors.green}📊 Research milestone tracking initiated${colors.reset}\n`);
        }
        if (failingProposals.length > 0) {
            console.log(`${colors.yellow}⚠️  ${failingProposals.length} proposal(s) did not meet the threshold:${colors.reset}`);
            for (const proposalId of failingProposals) {
                const scoreIndex = proposalIds.indexOf(proposalId);
                const score = finalScores[scoreIndex];
                console.log(`${colors.red}   • Proposal #${proposalId}: ${score}% (needs ${80 - score}% more)${colors.reset}`);
            }
            console.log(`${colors.yellow}💡 These proposals can be resubmitted after improvements${colors.reset}\n`);
        }
    }
    /**
     * Calculate funding amount based on score
     */
    calculateFundingAmount(score) {
        // Base funding scales with score above 80%
        const baseFunding = 10000; // 10k APT base
        const bonusMultiplier = (score - 80) * 0.1; // 10% bonus per point above 80%
        return baseFunding * (1 + bonusMultiplier);
    }
    /**
     * Display summary statistics
     */
    async displaySummary(proposalIds, finalScores) {
        this.printHeader("📊 DEMO SUMMARY & STATISTICS");
        const passingCount = finalScores.filter(score => score >= 80).length;
        const avgScore = finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length;
        const totalFunding = finalScores
            .filter(score => score >= 80)
            .reduce((total, score) => total + this.calculateFundingAmount(score), 0);
        console.log(`${colors.bright}📈 EVALUATION RESULTS${colors.reset}`);
        console.log(`${colors.cyan}Total Proposals: ${proposalIds.length}${colors.reset}`);
        console.log(`${colors.green}Passing Proposals: ${passingCount} (${Math.round(passingCount / proposalIds.length * 100)}%)${colors.reset}`);
        console.log(`${colors.red}Below Threshold: ${proposalIds.length - passingCount}${colors.reset}`);
        console.log(`${colors.bright}Average Score: ${Math.round(avgScore)}%${colors.reset}`);
        console.log(`${colors.bright}Success Rate: ${Math.round(passingCount / proposalIds.length * 100)}%${colors.reset}`);
        console.log(`\n${colors.bright}💰 FUNDING ALLOCATED${colors.reset}`);
        console.log(`${colors.green}Total Funding: ${totalFunding.toLocaleString()} APT${colors.reset}`);
        console.log(`${colors.green}Average per Project: ${Math.round(totalFunding / Math.max(passingCount, 1)).toLocaleString()} APT${colors.reset}`);
        console.log(`\n${colors.bright}🏆 HACKATHON FEATURES DEMONSTRATED${colors.reset}`);
        console.log(`${colors.green}✅ Novel DeFi Primitive: Algorithmic research funding${colors.reset}`);
        console.log(`${colors.green}✅ Multi-dimensional Evaluation: 5-category ANT scoring${colors.reset}`);
        console.log(`${colors.green}✅ Decentralized Scoring: Multiple independent evaluators${colors.reset}`);
        console.log(`${colors.green}✅ Automated Fulfillment: 80% threshold system${colors.reset}`);
        console.log(`${colors.green}✅ Transparent Process: All actions on-chain${colors.reset}`);
        console.log(`${colors.green}✅ Move Language Safety: Resource-oriented programming${colors.reset}`);
        console.log(`${colors.green}✅ Fair Averaging: Multi-scorer consensus mechanism${colors.reset}`);
        console.log(`\n${colors.bright}🔗 BLOCKCHAIN BENEFITS${colors.reset}`);
        console.log(`${colors.cyan}• Immutable scoring records${colors.reset}`);
        console.log(`${colors.cyan}• Transparent funding decisions${colors.reset}`);
        console.log(`${colors.cyan}• Automated execution (no human intervention)${colors.reset}`);
        console.log(`${colors.cyan}• Global accessibility${colors.reset}`);
        console.log(`${colors.cyan}• Reduced operational costs${colors.reset}`);
    }
    /**
     * Run the complete demo
     */
    async run() {
        try {
            console.clear();
            this.printHeader("🏆 ANT SCORING SYSTEM - APTOS CTRL+MOVE HACKATHON DEMO", colors.magenta);
            console.log(`${colors.bright}Welcome to the ANT (Algorithmic Network Triage) Scoring System Demo!${colors.reset}`);
            console.log(`${colors.cyan}This demonstrates a revolutionary DeFi primitive for decentralized research funding.${colors.reset}\n`);
            console.log(`${colors.bright}🎯 Track: New Financial Products${colors.reset}`);
            console.log(`${colors.bright}🏗️  Platform: Aptos Blockchain${colors.reset}`);
            console.log(`${colors.bright}⚡ Language: Move${colors.reset}`);
            console.log(`${colors.bright}🧬 Partner: CurableDAO${colors.reset}\n`);
            console.log(`${colors.yellow}Press Enter to begin the demo...${colors.reset}`);
            // Wait for user input in a real demo
            // process.stdin.once('data', () => {});
            await new Promise(resolve => setTimeout(resolve, 3000));
            // Phase 1: Proposal Submission
            const proposalIds = await this.simulateProposalSubmission();
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Phase 2: Scoring
            const finalScores = await this.simulateScoring(proposalIds);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Phase 3: Fulfillment
            await this.simulateFulfillment(proposalIds, finalScores);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Summary
            await this.displaySummary(proposalIds, finalScores);
            console.log(`\n${colors.green}${colors.bright}🎉 DEMO COMPLETE! Thank you for exploring the ANT Scoring System!${colors.reset}\n`);
            console.log(`${colors.bright}Next Steps:${colors.reset}`);
            console.log(`${colors.cyan}1. Deploy to Aptos devnet: npm run deploy:devnet${colors.reset}`);
            console.log(`${colors.cyan}2. Submit your first proposal${colors.reset}`);
            console.log(`${colors.cyan}3. Authorize scorers and start evaluation${colors.reset}`);
            console.log(`${colors.cyan}4. Watch automatic fulfillment in action!${colors.reset}\n`);
        }
        catch (error) {
            console.error(`${colors.red}Demo error:${colors.reset}`, error);
        }
    }
}
exports.ANTScoringDemo = ANTScoringDemo;
// Run demo if called directly
async function main() {
    const demo = new ANTScoringDemo();
    await demo.run();
}
if (require.main === module) {
    main();
}
