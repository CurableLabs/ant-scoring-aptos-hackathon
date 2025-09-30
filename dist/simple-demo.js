#!/usr/bin/env node
"use strict";
/**
 * ANT Scoring System - Simple Demo (Pure JavaScript)
 *
 * This demo works immediately without any complex setup!
 * Perfect for hackathon judging and quick demonstrations.
 */
const readline = require('readline');
const fs = require('fs');
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
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Load demo data
        try {
            const data = fs.readFileSync('./demo-data.json', 'utf8');
            this.demoData = JSON.parse(data);
        }
        catch (error) {
            console.log(`${colors.yellow}Note: demo-data.json not found, using built-in data${colors.reset}`);
            this.demoData = this.getBuiltInData();
        }
    }
    getBuiltInData() {
        return {
            proposals: [
                {
                    id: 1,
                    title: "CRISPR-Cas9 Gene Therapy for Alzheimer's Disease",
                    researcher: "Dr. Alice Chen",
                    institution: "Stanford University",
                    description: "Novel approach using CRISPR-Cas9 to edit APOE4 variants in brain cells. Preliminary studies show 40% reduction in amyloid plaques.",
                    funding_requested: "250000"
                },
                {
                    id: 2,
                    title: "AI-Powered Drug Discovery for Rare Cancers",
                    researcher: "Dr. Bob Rodriguez",
                    institution: "MIT",
                    description: "ML platform combining genomics with chemical libraries. Algorithm identified 12 potential drugs, 3 validated in cell culture.",
                    funding_requested: "180000"
                },
                {
                    id: 3,
                    title: "Microbiome Engineering for Diabetes Prevention",
                    researcher: "Dr. Carol Kim",
                    institution: "UCSF",
                    description: "Engineered probiotics for glucose regulation. 30% improvement in glucose tolerance in diabetic mice.",
                    funding_requested: "200000"
                }
            ],
            scorers: [
                { name: "Prof. David Miller", specialty: "Biotech & Gene Therapy" },
                { name: "Dr. Emily Johnson", specialty: "AI/ML in Healthcare" },
                { name: "Dr. Frank Zhang", specialty: "Microbiome Research" }
            ]
        };
    }
    printHeader(title, color = colors.cyan) {
        console.log(`\n${color}${'='.repeat(70)}${colors.reset}`);
        console.log(`${color}${colors.bright}${title.toUpperCase().padStart((70 + title.length) / 2)}${colors.reset}`);
        console.log(`${color}${'='.repeat(70)}${colors.reset}\n`);
    }
    calculateFinalScore(scores) {
        // ANT scoring weights
        const weights = {
            scientific_merit: 40,
            feasibility: 25,
            community_alignment: 20,
            resource_efficiency: 10,
            open_science: 5
        };
        // Calculate averages for each category
        const scientificMeritAvg = (scores.scientific_merit.novelty +
            scores.scientific_merit.biological_plausibility +
            scores.scientific_merit.prior_evidence) / 3;
        const feasibilityAvg = (scores.feasibility.technical_viability +
            scores.feasibility.data_quality +
            scores.feasibility.clarity_of_protocol) / 3;
        const communityAlignmentAvg = (scores.community_alignment.mission_fit +
            scores.community_alignment.dao_engagement) / 2;
        const resourceEfficiencyAvg = (scores.resource_efficiency.cost_effectiveness +
            scores.resource_efficiency.agentic_resource_use) / 2;
        const openScienceAvg = (scores.open_science.data_protocol_sharing +
            scores.open_science.collaborative_potential) / 2;
        // Apply weights and calculate final score
        const finalScore = (scientificMeritAvg * weights.scientific_merit +
            feasibilityAvg * weights.feasibility +
            communityAlignmentAvg * weights.community_alignment +
            resourceEfficiencyAvg * weights.resource_efficiency +
            openScienceAvg * weights.open_science) / 100;
        return Math.round(finalScore);
    }
    async waitForEnter(message = "Press Enter to continue...") {
        return new Promise((resolve) => {
            this.rl.question(`${colors.yellow}${message}${colors.reset} `, () => {
                resolve();
            });
        });
    }
    async runQuickDemo() {
        this.printHeader("🏆 ANT Scoring System - Hackathon Demo");
        console.log(`${colors.bright}Welcome to the ANT (Algorithmic Network Triage) Scoring System!${colors.reset}`);
        console.log(`${colors.cyan}🎯 Built for Aptos Ctrl+MOVE Hackathon - Track: New Financial Products${colors.reset}`);
        console.log(`${colors.cyan}🧬 Creating the future of decentralized research funding!${colors.reset}\n`);
        console.log(`${colors.bright}🔬 How ANT Scoring Works:${colors.reset}`);
        console.log(`${colors.cyan}1. Researchers submit proposals to the system${colors.reset}`);
        console.log(`${colors.cyan}2. Expert scorers evaluate across 5 dimensions${colors.reset}`);
        console.log(`${colors.cyan}3. AI calculates weighted final score (0-100%)${colors.reset}`);
        console.log(`${colors.cyan}4. Proposals ≥80% qualify for consideration!${colors.reset}\n`);
        await this.waitForEnter("Press Enter to see live scoring demo...");
        // Demo the three proposals
        const proposals = this.demoData.proposals.slice(0, 3);
        const scorers = this.demoData.scorers.slice(0, 3);
        // Predefined scoring scenarios 
        const scoringData = [
            // CRISPR - HIGH QUALITY (should pass ~89%)
            [
                { scientific_merit: { novelty: 92, biological_plausibility: 88, prior_evidence: 85 }, feasibility: { technical_viability: 82, data_quality: 90, clarity_of_protocol: 88 }, community_alignment: { mission_fit: 95, dao_engagement: 85 }, resource_efficiency: { cost_effectiveness: 78, agentic_resource_use: 82 }, open_science: { data_protocol_sharing: 90, collaborative_potential: 95 } },
                { scientific_merit: { novelty: 88, biological_plausibility: 92, prior_evidence: 82 }, feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 90 }, community_alignment: { mission_fit: 90, dao_engagement: 88 }, resource_efficiency: { cost_effectiveness: 80, agentic_resource_use: 85 }, open_science: { data_protocol_sharing: 85, collaborative_potential: 90 } },
                { scientific_merit: { novelty: 90, biological_plausibility: 85, prior_evidence: 88 }, feasibility: { technical_viability: 88, data_quality: 85, clarity_of_protocol: 85 }, community_alignment: { mission_fit: 92, dao_engagement: 82 }, resource_efficiency: { cost_effectiveness: 75, agentic_resource_use: 80 }, open_science: { data_protocol_sharing: 88, collaborative_potential: 92 } }
            ],
            // AI Drug Discovery - BORDERLINE (~81%)
            [
                { scientific_merit: { novelty: 80, biological_plausibility: 82, prior_evidence: 78 }, feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 82 }, community_alignment: { mission_fit: 85, dao_engagement: 80 }, resource_efficiency: { cost_effectiveness: 82, agentic_resource_use: 88 }, open_science: { data_protocol_sharing: 80, collaborative_potential: 85 } },
                { scientific_merit: { novelty: 82, biological_plausibility: 78, prior_evidence: 80 }, feasibility: { technical_viability: 88, data_quality: 85, clarity_of_protocol: 85 }, community_alignment: { mission_fit: 82, dao_engagement: 85 }, resource_efficiency: { cost_effectiveness: 85, agentic_resource_use: 85 }, open_science: { data_protocol_sharing: 85, collaborative_potential: 80 } },
                { scientific_merit: { novelty: 78, biological_plausibility: 80, prior_evidence: 82 }, feasibility: { technical_viability: 82, data_quality: 90, clarity_of_protocol: 88 }, community_alignment: { mission_fit: 88, dao_engagement: 78 }, resource_efficiency: { cost_effectiveness: 88, agentic_resource_use: 82 }, open_science: { data_protocol_sharing: 82, collaborative_potential: 88 } }
            ],
            // Microbiome - BELOW THRESHOLD (~72%)
            [
                { scientific_merit: { novelty: 72, biological_plausibility: 68, prior_evidence: 65 }, feasibility: { technical_viability: 70, data_quality: 75, clarity_of_protocol: 72 }, community_alignment: { mission_fit: 78, dao_engagement: 72 }, resource_efficiency: { cost_effectiveness: 68, agentic_resource_use: 70 }, open_science: { data_protocol_sharing: 75, collaborative_potential: 78 } },
                { scientific_merit: { novelty: 68, biological_plausibility: 70, prior_evidence: 72 }, feasibility: { technical_viability: 72, data_quality: 68, clarity_of_protocol: 75 }, community_alignment: { mission_fit: 72, dao_engagement: 68 }, resource_efficiency: { cost_effectiveness: 70, agentic_resource_use: 72 }, open_science: { data_protocol_sharing: 70, collaborative_potential: 75 } },
                { scientific_merit: { novelty: 70, biological_plausibility: 72, prior_evidence: 68 }, feasibility: { technical_viability: 68, data_quality: 70, clarity_of_protocol: 70 }, community_alignment: { mission_fit: 75, dao_engagement: 75 }, resource_efficiency: { cost_effectiveness: 72, agentic_resource_use: 68 }, open_science: { data_protocol_sharing: 72, collaborative_potential: 70 } }
            ]
        ];
        let qualifiedCount = 0;
        for (let i = 0; i < proposals.length; i++) {
            const proposal = proposals[i];
            console.log(`\n${colors.magenta}${colors.bright}📋 PROPOSAL ${i + 1}/${proposals.length}${colors.reset}`);
            console.log(`${colors.bright}${proposal.title}${colors.reset}`);
            console.log(`${colors.cyan}Researcher: ${proposal.researcher} (${proposal.institution})${colors.reset}`);
            console.log(`${colors.cyan}Requested: $${parseInt(proposal.funding_requested).toLocaleString()}${colors.reset}`);
            console.log(`${colors.cyan}${proposal.description}${colors.reset}`);
            await this.waitForEnter("Press Enter to see expert scoring...");
            let totalScore = 0;
            const individualScores = [];
            for (let j = 0; j < scorers.length; j++) {
                const scorer = scorers[j];
                const scores = scoringData[i][j];
                const individualScore = this.calculateFinalScore(scores);
                individualScores.push(individualScore);
                totalScore += individualScore;
                console.log(`\n${colors.yellow}🔬 ${scorer.name} (${scorer.specialty})${colors.reset}`);
                // Show key scores
                const smAvg = Math.round((scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3);
                const fAvg = Math.round((scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3);
                console.log(`${colors.cyan}   Scientific Merit: ${smAvg}% | Feasibility: ${fAvg}%${colors.reset}`);
                const scoreColor = individualScore >= 80 ? colors.green : colors.red;
                console.log(`${colors.bright}   Individual Score: ${scoreColor}${individualScore}%${colors.reset}`);
            }
            const averageScore = Math.round(totalScore / scorers.length);
            const qualified = averageScore >= 80;
            console.log(`\n${colors.bright}📊 FINAL RESULTS${colors.reset}`);
            console.log(`${colors.bright}Individual Scores: ${individualScores.join('%, ')}%${colors.reset}`);
            if (qualified) {
                qualifiedCount++;
                console.log(`${colors.green}${colors.bright}✅ AVERAGE: ${averageScore}% - QUALIFIES! Meets excellence threshold${colors.reset}`);
                console.log(`${colors.green}🏆 Status: Ready for advanced consideration${colors.reset}`);
            }
            else {
                console.log(`${colors.red}${colors.bright}❌ AVERAGE: ${averageScore}% - NEEDS IMPROVEMENT (Below 80% threshold)${colors.reset}`);
                console.log(`${colors.red}📝 Requires ${80 - averageScore}% improvement for qualification${colors.reset}`);
            }
            console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}`);
            if (i < proposals.length - 1) {
                await this.waitForEnter();
            }
        }
        // Final summary
        console.log(`\n${colors.bright}🎉 DEMO COMPLETE - SUMMARY${colors.reset}`);
        console.log(`${colors.cyan}Total Proposals Evaluated: ${proposals.length}${colors.reset}`);
        console.log(`${colors.green}✅ Qualified (≥80%): ${qualifiedCount}${colors.reset}`);
        console.log(`${colors.red}❌ Below Threshold: ${proposals.length - qualifiedCount}${colors.reset}`);
        console.log(`${colors.bright}📈 Success Rate: ${Math.round(qualifiedCount / proposals.length * 100)}%${colors.reset}`);
        console.log(`\n${colors.bright}🏆 ANT SYSTEM INNOVATIONS${colors.reset}`);
        console.log(`${colors.green}• Novel algorithmic evaluation framework${colors.reset}`);
        console.log(`${colors.green}• Multi-dimensional scientific assessment${colors.reset}`);
        console.log(`${colors.green}• 80% excellence threshold system${colors.reset}`);
        console.log(`${colors.green}• Decentralized scorer consensus${colors.reset}`);
        console.log(`${colors.green}• Transparent blockchain execution${colors.reset}`);
        await this.waitForEnter("\nPress Enter to finish demo...");
        console.log(`\n${colors.cyan}${colors.bright}🚀 Ready for Aptos Ctrl+MOVE Hackathon Submission!${colors.reset}`);
        console.log(`${colors.cyan}Built with Move language for safety and efficiency${colors.reset}`);
        console.log(`${colors.cyan}Creating the future of decentralized research evaluation! 🧬⚡${colors.reset}\n`);
    }
    async run() {
        console.clear();
        await this.runQuickDemo();
        this.rl.close();
    }
}
// Main execution
async function main() {
    const demo = new ANTScoringDemo();
    await demo.run();
}
if (require.main === module) {
    main().catch(console.error);
}
module.exports = { ANTScoringDemo };
