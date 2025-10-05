#!/usr/bin/env npx ts-node

/**
 * Tri-Lane Token Architecture Demo
 * Shows seamless integration of Lab Credits → PDcure → Sub-DAO tokens
 */

import { ANTScoringHelper, ScoreInput } from './antScoringUtils';
import TriLaneIntegration from './tri-lane-integration';

async function runTriLaneDemo() {
    console.clear();
    
    // Initialize systems
    const config = {
        moduleAddress: "0x1", // Demo address
        nodeUrl: "https://fullnode.devnet.aptoslabs.com/v1",
        network: "devnet" as const
    };
    
    // Create mock ANT helper for demo
    const antHelper = {
        calculateFinalScore: (scores: ScoreInput): number => {
            const weights = {
                scientific_merit: 40,
                feasibility: 25,
                community_alignment: 20,
                resource_efficiency: 10,
                open_science: 5
            };

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

            const finalScore = (scientificMeritAvg * weights.scientific_merit +
                               feasibilityAvg * weights.feasibility +
                               communityAlignmentAvg * weights.community_alignment +
                               resourceEfficiencyAvg * weights.resource_efficiency +
                               openScienceAvg * weights.open_science) / 100;

            return Math.round(finalScore);
        }
    } as ANTScoringHelper;
    const triLane = new TriLaneIntegration(antHelper);

    // Run complete workflow
    await triLane.runCompleteWorkflow();
}

// Run demo
runTriLaneDemo().catch(console.error);
