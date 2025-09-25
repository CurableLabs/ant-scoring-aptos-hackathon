#!/usr/bin/env ts-node

/**
 * ANT Scoring System - CLI Demo (No Blockchain Required)
 * 
 * This is a standalone demo that showcases the ANT scoring algorithm and workflow
 * without requiring actual blockchain deployment. Perfect for quick demonstrations!
 */

import * as fs from 'fs';
import * as readline from 'readline';

interface ScoreInput {
    scientific_merit: { novelty: number; biological_plausibility: number; prior_evidence: number };
    feasibility: { technical_viability: number; data_quality: number; clarity_of_protocol: number };
    community_alignment: { mission_fit: number; dao_engagement: number };
    resource_efficiency: { cost_effectiveness: number; agentic_resource_use: number };
    open_science: { data_protocol_sharing: number; collaborative_potential: number };
}

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

class ANTCLIDemo {
    private demoData: any;
    private rl: readline.Interface;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        // Load demo data
        try {
            const data = fs.readFileSync('./demo-data.json', 'utf8');
            this.demoData = JSON.parse(data);
        } catch (error) {
            console.error('Could not load demo-data.json:', error);
            process.exit(1);
        }
    }

    private printHeader(title: string, color: string = colors.cyan) {
        console.log(`\n${color}${'='.repeat(70)}${colors.reset}`);
        console.log(`${color}${colors.bright}${title.toUpperCase().padStart((70 + title.length) / 2)}${colors.reset}`);
        console.log(`${color}${'='.repeat(70)}${colors.reset}\n`);
    }

    private calculateFinalScore(scores: ScoreInput): number {
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

    private async waitForEnter(message: string = "Press Enter to continue..."): Promise<void> {
        return new Promise((resolve) => {
            this.rl.question(`${colors.yellow}${message}${colors.reset} `, () => {
                resolve();
            });
        });
    }

    private async showMainMenu(): Promise<string> {
        console.log(`${colors.bright}🎯 ANT Scoring System - Interactive Demo${colors.reset}\n`);
        console.log(`${colors.cyan}Choose a demo mode:${colors.reset}`);
        console.log(`${colors.bright}1.${colors.reset} Full Automated Demo (3 proposals, multiple scorers)`);
        console.log(`${colors.bright}2.${colors.reset} Interactive Scoring (score a proposal yourself)`);
        console.log(`${colors.bright}3.${colors.reset} Algorithm Explorer (test different score combinations)`);
        console.log(`${colors.bright}4.${colors.reset} Benchmark Test (80% threshold analysis)`);
        console.log(`${colors.bright}5.${colors.reset} Exit`);

        return new Promise((resolve) => {
            this.rl.question(`\n${colors.yellow}Enter your choice (1-5): ${colors.reset}`, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    private async runFullDemo(): Promise<void> {
        this.printHeader("🚀 Full Automated Demo");
        
        console.log(`${colors.bright}This demo shows the complete ANT scoring workflow:${colors.reset}`);
        console.log(`${colors.cyan}• 3 research proposals from different domains${colors.reset}`);
        console.log(`${colors.cyan}• Multiple expert scorers evaluate each proposal${colors.reset}`);
        console.log(`${colors.cyan}• Scores are averaged and compared to 80% threshold${colors.reset}`);
        console.log(`${colors.cyan}• Automatic funding for qualifying proposals${colors.reset}\n`);

        await this.waitForEnter();

        const proposals = this.demoData.proposals.slice(0, 3);
        const scorers = this.demoData.scorers.slice(0, 3);

        // Predefined scoring scenarios
        const scoringData = [
            // CRISPR proposal - HIGH QUALITY (should pass)
            [
                { scientific_merit: { novelty: 92, biological_plausibility: 88, prior_evidence: 85 }, feasibility: { technical_viability: 82, data_quality: 90, clarity_of_protocol: 88 }, community_alignment: { mission_fit: 95, dao_engagement: 85 }, resource_efficiency: { cost_effectiveness: 78, agentic_resource_use: 82 }, open_science: { data_protocol_sharing: 90, collaborative_potential: 95 } },
                { scientific_merit: { novelty: 88, biological_plausibility: 92, prior_evidence: 82 }, feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 90 }, community_alignment: { mission_fit: 90, dao_engagement: 88 }, resource_efficiency: { cost_effectiveness: 80, agentic_resource_use: 85 }, open_science: { data_protocol_sharing: 85, collaborative_potential: 90 } },
                { scientific_merit: { novelty: 90, biological_plausibility: 85, prior_evidence: 88 }, feasibility: { technical_viability: 88, data_quality: 85, clarity_of_protocol: 85 }, community_alignment: { mission_fit: 92, dao_engagement: 82 }, resource_efficiency: { cost_effectiveness: 75, agentic_resource_use: 80 }, open_science: { data_protocol_sharing: 88, collaborative_potential: 92 } }
            ],
            // AI Drug Discovery - BORDERLINE (should barely pass)
            [
                { scientific_merit: { novelty: 80, biological_plausibility: 82, prior_evidence: 78 }, feasibility: { technical_viability: 85, data_quality: 88, clarity_of_protocol: 82 }, community_alignment: { mission_fit: 85, dao_engagement: 80 }, resource_efficiency: { cost_effectiveness: 82, agentic_resource_use: 88 }, open_science: { data_protocol_sharing: 80, collaborative_potential: 85 } },
                { scientific_merit: { novelty: 82, biological_plausibility: 78, prior_evidence: 80 }, feasibility: { technical_viability: 88, data_quality: 85, clarity_of_protocol: 85 }, community_alignment: { mission_fit: 82, dao_engagement: 85 }, resource_efficiency: { cost_effectiveness: 85, agentic_resource_use: 85 }, open_science: { data_protocol_sharing: 85, collaborative_potential: 80 } },
                { scientific_merit: { novelty: 78, biological_plausibility: 80, prior_evidence: 82 }, feasibility: { technical_viability: 82, data_quality: 90, clarity_of_protocol: 88 }, community_alignment: { mission_fit: 88, dao_engagement: 78 }, resource_efficiency: { cost_effectiveness: 88, agentic_resource_use: 82 }, open_science: { data_protocol_sharing: 82, collaborative_potential: 88 } }
            ],
            // Microbiome - LOW QUALITY (should fail)
            [
                { scientific_merit: { novelty: 72, biological_plausibility: 68, prior_evidence: 65 }, feasibility: { technical_viability: 70, data_quality: 75, clarity_of_protocol: 72 }, community_alignment: { mission_fit: 78, dao_engagement: 72 }, resource_efficiency: { cost_effectiveness: 68, agentic_resource_use: 70 }, open_science: { data_protocol_sharing: 75, collaborative_potential: 78 } },
                { scientific_merit: { novelty: 68, biological_plausibility: 70, prior_evidence: 72 }, feasibility: { technical_viability: 72, data_quality: 68, clarity_of_protocol: 75 }, community_alignment: { mission_fit: 72, dao_engagement: 68 }, resource_efficiency: { cost_effectiveness: 70, agentic_resource_use: 72 }, open_science: { data_protocol_sharing: 70, collaborative_potential: 75 } },
                { scientific_merit: { novelty: 70, biological_plausibility: 72, prior_evidence: 68 }, feasibility: { technical_viability: 68, data_quality: 70, clarity_of_protocol: 70 }, community_alignment: { mission_fit: 75, dao_engagement: 75 }, resource_efficiency: { cost_effectiveness: 72, agentic_resource_use: 68 }, open_science: { data_protocol_sharing: 72, collaborative_potential: 70 } }
            ]
        ];

        let totalFunding = 0;
        let passingCount = 0;

        for (let i = 0; i < proposals.length; i++) {
            const proposal = proposals[i];
            
            console.log(`\n${colors.magenta}${colors.bright}📋 PROPOSAL ${i + 1}/${proposals.length}${colors.reset}`);
            console.log(`${colors.bright}Title: ${proposal.title}${colors.reset}`);
            console.log(`${colors.cyan}Researcher: ${proposal.researcher} (${proposal.institution})${colors.reset}`);
            console.log(`${colors.cyan}Description: ${proposal.description}${colors.reset}`);
            console.log(`${colors.cyan}Funding Requested: $${parseInt(proposal.funding_requested).toLocaleString()}${colors.reset}`);

            await this.waitForEnter("Press Enter to start scoring...");

            let totalScore = 0;
            const individualScores = [];

            for (let j = 0; j < scorers.length; j++) {
                const scorer = scorers[j];
                const scores = scoringData[i][j];
                const individualScore = this.calculateFinalScore(scores);
                
                individualScores.push(individualScore);
                totalScore += individualScore;

                console.log(`\n${colors.yellow}🔬 Scoring by ${scorer.name}${colors.reset}`);
                console.log(`${colors.cyan}   Specialty: ${scorer.specialty}${colors.reset}`);
                
                // Show detailed breakdown
                console.log(`${colors.bright}   Scientific Merit (40%):${colors.reset} Novelty=${scores.scientific_merit.novelty}, Bio=${scores.scientific_merit.biological_plausibility}, Evidence=${scores.scientific_merit.prior_evidence}`);
                console.log(`${colors.bright}   Feasibility (25%):${colors.reset} Tech=${scores.feasibility.technical_viability}, Data=${scores.feasibility.data_quality}, Protocol=${scores.feasibility.clarity_of_protocol}`);
                console.log(`${colors.bright}   Community (20%):${colors.reset} Mission=${scores.community_alignment.mission_fit}, DAO=${scores.community_alignment.dao_engagement}`);
                console.log(`${colors.bright}   Resources (10%):${colors.reset} Cost=${scores.resource_efficiency.cost_effectiveness}, Agentic=${scores.resource_efficiency.agentic_resource_use}`);
                console.log(`${colors.bright}   Open Science (5%):${colors.reset} Sharing=${scores.open_science.data_protocol_sharing}, Collab=${scores.open_science.collaborative_potential}`);
                
                const scoreColor = individualScore >= 80 ? colors.green : colors.red;
                console.log(`${colors.bright}   Individual Score: ${scoreColor}${individualScore}%${colors.reset}`);
            }

            const averageScore = Math.round(totalScore / scorers.length);
            const passed = averageScore >= 80;
            
            console.log(`\n${colors.bright}📊 FINAL RESULTS${colors.reset}`);
            console.log(`${colors.bright}Individual Scores: ${individualScores.join('%, ')}%${colors.reset}`);
            console.log(`${colors.bright}Average Score: ${averageScore}%${colors.reset}`);
            
            if (passed) {
                passingCount++;
                const fundingAmount = this.calculateFunding(averageScore);
                totalFunding += fundingAmount;
                console.log(`${colors.green}${colors.bright}✅ PASSES! Automatic funding approved${colors.reset}`);
                console.log(`${colors.green}💰 Funding Amount: ${fundingAmount.toLocaleString()} APT${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ FAILS - Below 80% threshold${colors.reset}`);
                console.log(`${colors.red}📝 Needs ${80 - averageScore}% improvement for funding${colors.reset}`);
            }

            console.log(`${colors.cyan}${'─'.repeat(60)}${colors.reset}`);
        }

        // Final summary
        console.log(`\n${colors.bright}🎉 DEMO COMPLETE - SUMMARY${colors.reset}`);
        console.log(`${colors.cyan}Total Proposals: ${proposals.length}${colors.reset}`);
        console.log(`${colors.green}Passing Proposals: ${passingCount}${colors.reset}`);
        console.log(`${colors.red}Failed Proposals: ${proposals.length - passingCount}${colors.reset}`);
        console.log(`${colors.green}Total Funding Allocated: ${totalFunding.toLocaleString()} APT${colors.reset}`);
        console.log(`${colors.bright}Success Rate: ${Math.round(passingCount / proposals.length * 100)}%${colors.reset}`);

        await this.waitForEnter();
    }

    private calculateFunding(score: number): number {
        const baseFunding = 10000;
        if (score >= 95) return baseFunding * 2.0;
        if (score >= 90) return baseFunding * 1.5;
        if (score >= 85) return baseFunding * 1.2;
        return baseFunding;
    }

    private async runInteractiveScoring(): Promise<void> {
        this.printHeader("🎯 Interactive Scoring Demo");
        
        console.log(`${colors.bright}Score a research proposal yourself!${colors.reset}\n`);
        
        const proposal = this.demoData.proposals[0]; // Use first proposal
        console.log(`${colors.cyan}Proposal: ${proposal.title}${colors.reset}`);
        console.log(`${colors.cyan}Researcher: ${proposal.researcher}${colors.reset}`);
        console.log(`${colors.cyan}Description: ${proposal.description}${colors.reset}\n`);

        console.log(`${colors.bright}Please score each dimension (0-100):${colors.reset}\n`);

        const scores: ScoreInput = {
            scientific_merit: { novelty: 0, biological_plausibility: 0, prior_evidence: 0 },
            feasibility: { technical_viability: 0, data_quality: 0, clarity_of_protocol: 0 },
            community_alignment: { mission_fit: 0, dao_engagement: 0 },
            resource_efficiency: { cost_effectiveness: 0, agentic_resource_use: 0 },
            open_science: { data_protocol_sharing: 0, collaborative_potential: 0 }
        };

        // Collect scores interactively
        scores.scientific_merit.novelty = await this.getScore("Scientific Merit - Novelty (How original is this approach?)");
        scores.scientific_merit.biological_plausibility = await this.getScore("Scientific Merit - Biological Plausibility (How credible is the mechanism?)");
        scores.scientific_merit.prior_evidence = await this.getScore("Scientific Merit - Prior Evidence (How strong is the supporting data?)");
        
        scores.feasibility.technical_viability = await this.getScore("Feasibility - Technical Viability (Can this be executed with current tools?)");
        scores.feasibility.data_quality = await this.getScore("Feasibility - Data Quality (How robust are the datasets?)");
        scores.feasibility.clarity_of_protocol = await this.getScore("Feasibility - Protocol Clarity (How clear is the methodology?)");
        
        scores.community_alignment.mission_fit = await this.getScore("Community Alignment - Mission Fit (Does this address important problems?)");
        scores.community_alignment.dao_engagement = await this.getScore("Community Alignment - DAO Engagement (Is there community involvement potential?)");
        
        scores.resource_efficiency.cost_effectiveness = await this.getScore("Resource Efficiency - Cost Effectiveness (Is this a lean path to value?)");
        scores.resource_efficiency.agentic_resource_use = await this.getScore("Resource Efficiency - Agentic Resource Use (Will it use AI/computational tools effectively?)");
        
        scores.open_science.data_protocol_sharing = await this.getScore("Open Science - Data/Protocol Sharing (Will results be accessible?)");
        scores.open_science.collaborative_potential = await this.getScore("Open Science - Collaborative Potential (Can others build upon this work?)");

        const finalScore = this.calculateFinalScore(scores);
        
        console.log(`\n${colors.bright}🎯 YOUR SCORING RESULTS${colors.reset}`);
        console.log(`${colors.cyan}Final Score: ${finalScore}%${colors.reset}`);
        
        if (finalScore >= 80) {
            console.log(`${colors.green}✅ PASSES! This proposal meets the funding threshold${colors.reset}`);
            console.log(`${colors.green}💰 Funding: ${this.calculateFunding(finalScore).toLocaleString()} APT${colors.reset}`);
        } else {
            console.log(`${colors.red}❌ FAILS - Below 80% threshold${colors.reset}`);
            console.log(`${colors.yellow}💡 Needs ${80 - finalScore}% improvement${colors.reset}`);
        }

        await this.waitForEnter();
    }

    private async getScore(prompt: string): Promise<number> {
        return new Promise((resolve) => {
            const askScore = () => {
                this.rl.question(`${colors.yellow}${prompt} (0-100): ${colors.reset}`, (answer) => {
                    const score = parseInt(answer);
                    if (isNaN(score) || score < 0 || score > 100) {
                        console.log(`${colors.red}Please enter a number between 0 and 100${colors.reset}`);
                        askScore();
                    } else {
                        resolve(score);
                    }
                });
            };
            askScore();
        });
    }

    private async runAlgorithmExplorer(): Promise<void> {
        this.printHeader("🧮 Algorithm Explorer");
        
        console.log(`${colors.bright}Test how different score combinations affect the final result!${colors.reset}\n`);
        
        const testScenarios = [
            {
                name: "Perfect Research",
                scores: { scientific_merit: { novelty: 95, biological_plausibility: 95, prior_evidence: 95 }, feasibility: { technical_viability: 95, data_quality: 95, clarity_of_protocol: 95 }, community_alignment: { mission_fit: 95, dao_engagement: 95 }, resource_efficiency: { cost_effectiveness: 95, agentic_resource_use: 95 }, open_science: { data_protocol_sharing: 95, collaborative_potential: 95 } }
            },
            {
                name: "High Scientific Merit, Low Feasibility",
                scores: { scientific_merit: { novelty: 95, biological_plausibility: 90, prior_evidence: 88 }, feasibility: { technical_viability: 60, data_quality: 65, clarity_of_protocol: 70 }, community_alignment: { mission_fit: 85, dao_engagement: 80 }, resource_efficiency: { cost_effectiveness: 70, agentic_resource_use: 75 }, open_science: { data_protocol_sharing: 80, collaborative_potential: 85 } }
            },
            {
                name: "Mediocre All Around",
                scores: { scientific_merit: { novelty: 75, biological_plausibility: 75, prior_evidence: 75 }, feasibility: { technical_viability: 75, data_quality: 75, clarity_of_protocol: 75 }, community_alignment: { mission_fit: 75, dao_engagement: 75 }, resource_efficiency: { cost_effectiveness: 75, agentic_resource_use: 75 }, open_science: { data_protocol_sharing: 75, collaborative_potential: 75 } }
            },
            {
                name: "Exactly at Threshold (80%)",
                scores: { scientific_merit: { novelty: 80, biological_plausibility: 80, prior_evidence: 80 }, feasibility: { technical_viability: 80, data_quality: 80, clarity_of_protocol: 80 }, community_alignment: { mission_fit: 80, dao_engagement: 80 }, resource_efficiency: { cost_effectiveness: 80, agentic_resource_use: 80 }, open_science: { data_protocol_sharing: 80, collaborative_potential: 80 } }
            }
        ];

        for (const scenario of testScenarios) {
            console.log(`${colors.cyan}${colors.bright}📊 Testing: ${scenario.name}${colors.reset}`);
            
            const finalScore = this.calculateFinalScore(scenario.scores);
            const passColor = finalScore >= 80 ? colors.green : colors.red;
            const passText = finalScore >= 80 ? "PASSES" : "FAILS";
            
            console.log(`${colors.bright}Result: ${passColor}${finalScore}% - ${passText}${colors.reset}`);
            console.log(`${colors.cyan}Breakdown:${colors.reset}`);
            console.log(`  • Scientific Merit: ${Math.round((scenario.scores.scientific_merit.novelty + scenario.scores.scientific_merit.biological_plausibility + scenario.scores.scientific_merit.prior_evidence) / 3)}% (weight: 40%)`);
            console.log(`  • Feasibility: ${Math.round((scenario.scores.feasibility.technical_viability + scenario.scores.feasibility.data_quality + scenario.scores.feasibility.clarity_of_protocol) / 3)}% (weight: 25%)`);
            console.log(`  • Community Alignment: ${Math.round((scenario.scores.community_alignment.mission_fit + scenario.scores.community_alignment.dao_engagement) / 2)}% (weight: 20%)`);
            console.log(`  • Resource Efficiency: ${Math.round((scenario.scores.resource_efficiency.cost_effectiveness + scenario.scores.resource_efficiency.agentic_resource_use) / 2)}% (weight: 10%)`);
            console.log(`  • Open Science: ${Math.round((scenario.scores.open_science.data_protocol_sharing + scenario.scores.open_science.collaborative_potential) / 2)}% (weight: 5%)`);
            console.log();
        }

        await this.waitForEnter();
    }

    private async runBenchmarkTest(): Promise<void> {
        this.printHeader("📈 Benchmark Test - 80% Threshold Analysis");
        
        console.log(`${colors.bright}Analyzing what it takes to reach the 80% funding threshold...${colors.reset}\n`);

        const benchmarks = [
            { threshold: 79, label: "Just Below Threshold" },
            { threshold: 80, label: "Minimum Passing" },
            { threshold: 85, label: "Good Quality" },
            { threshold: 90, label: "Excellent" },
            { threshold: 95, label: "Outstanding" }
        ];

        for (const benchmark of benchmarks) {
            console.log(`${colors.cyan}${colors.bright}🎯 Target Score: ${benchmark.threshold}% (${benchmark.label})${colors.reset}`);
            
            // Generate example scores that would achieve this target
            const exampleScores = this.generateScoresForTarget(benchmark.threshold);
            const actualScore = this.calculateFinalScore(exampleScores);
            
            console.log(`${colors.bright}Sample score combination:${colors.reset}`);
            console.log(`  Scientific Merit: N=${exampleScores.scientific_merit.novelty}, B=${exampleScores.scientific_merit.biological_plausibility}, E=${exampleScores.scientific_merit.prior_evidence}`);
            console.log(`  Feasibility: T=${exampleScores.feasibility.technical_viability}, D=${exampleScores.feasibility.data_quality}, C=${exampleScores.feasibility.clarity_of_protocol}`);
            console.log(`  Community: M=${exampleScores.community_alignment.mission_fit}, D=${exampleScores.community_alignment.dao_engagement}`);
            console.log(`  Resources: C=${exampleScores.resource_efficiency.cost_effectiveness}, A=${exampleScores.resource_efficiency.agentic_resource_use}`);
            console.log(`  Open Science: S=${exampleScores.open_science.data_protocol_sharing}, C=${exampleScores.open_science.collaborative_potential}`);
            
            const scoreColor = actualScore >= 80 ? colors.green : colors.red;
            const status = actualScore >= 80 ? "✅ FUNDED" : "❌ NOT FUNDED";
            console.log(`${colors.bright}Actual Score: ${scoreColor}${actualScore}% ${status}${colors.reset}`);
            
            if (actualScore >= 80) {
                console.log(`${colors.green}💰 Funding: ${this.calculateFunding(actualScore).toLocaleString()} APT${colors.reset}`);
            }
            console.log();
        }

        await this.waitForEnter();
    }

    private generateScoresForTarget(target: number): ScoreInput {
        // Generate realistic score combinations for different target levels
        const baseScores = {
            79: { sm: 75, f: 78, ca: 82, re: 75, os: 80 },
            80: { sm: 80, f: 80, ca: 80, re: 80, os: 80 },
            85: { sm: 88, f: 82, ca: 85, re: 78, os: 85 },
            90: { sm: 92, f: 88, ca: 90, re: 85, os: 90 },
            95: { sm: 95, f: 95, ca: 95, re: 95, os: 95 }
        };

        const base = baseScores[target as keyof typeof baseScores] || baseScores[80];
        
        return {
            scientific_merit: { 
                novelty: base.sm, 
                biological_plausibility: base.sm + 2, 
                prior_evidence: base.sm - 2 
            },
            feasibility: { 
                technical_viability: base.f, 
                data_quality: base.f + 3, 
                clarity_of_protocol: base.f - 1 
            },
            community_alignment: { 
                mission_fit: base.ca, 
                dao_engagement: base.ca - 3 
            },
            resource_efficiency: { 
                cost_effectiveness: base.re, 
                agentic_resource_use: base.re + 5 
            },
            open_science: { 
                data_protocol_sharing: base.os, 
                collaborative_potential: base.os + 2 
            }
        };
    }

    async run(): Promise<void> {
        console.clear();
        
        this.printHeader("🏆 ANT Scoring System - CLI Demo", colors.magenta);
        
        console.log(`${colors.bright}Welcome to the ANT (Algorithmic Network Triage) CLI Demo!${colors.reset}`);
        console.log(`${colors.cyan}Built for Aptos Ctrl+MOVE Hackathon - Track: New Financial Products${colors.reset}`);
        console.log(`${colors.cyan}Creating the future of decentralized research funding! 🧬⚡${colors.reset}\n`);

        while (true) {
            const choice = await this.showMainMenu();
            
            switch (choice) {
                case '1':
                    await this.runFullDemo();
                    break;
                case '2':
                    await this.runInteractiveScoring();
                    break;
                case '3':
                    await this.runAlgorithmExplorer();
                    break;
                case '4':
                    await this.runBenchmarkTest();
                    break;
                case '5':
                    console.log(`\n${colors.green}Thank you for exploring the ANT Scoring System! 🎉${colors.reset}`);
                    console.log(`${colors.cyan}Deploy to Aptos: npm run deploy:devnet${colors.reset}`);
                    console.log(`${colors.cyan}Run full demo: npm run demo${colors.reset}\n`);
                    this.rl.close();
                    return;
                default:
                    console.log(`${colors.red}Invalid choice. Please enter 1-5.${colors.reset}\n`);
            }
        }
    }
}

// Main execution
async function main() {
    const demo = new ANTCLIDemo();
    await demo.run();
}

if (require.main === module) {
    main().catch(console.error);
}

export { ANTCLIDemo };
