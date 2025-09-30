<<<<<<< HEAD
#!/usr/bin/env node

/**
 * Tri-Lane Token Architecture - Working Demo
 * Shows seamless integration: Lab Credits → CURE/PDcure → Sub-DAO tokens
 */

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createHeader(title) {
    const line = '='.repeat(70);
    return `\n${colors.cyan}${line}${colors.reset}\n${colors.cyan}${colors.bright}${title.padStart((70 + title.length) / 2)}${colors.reset}\n${colors.cyan}${line}${colors.reset}`;
}

// ANT Scoring calculation
function calculateANTScore(scores) {
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

class TriLaneTokenSystem {
    constructor() {
        // System state
        this.state = {
            // Lane 1: Lab Credits
            total_lab_credits: 0,
            lab_credits: new Map(),
            inventor_credits: new Map(),
            
            // Lane 2: CURE/PDcure Tokens
            cure_phase: 1, // 1=fixed price, 2=dynamic
            cure_total_supply: 0,
            cure_holders: new Map(),
            community_staked: 0,
            validation_threshold: 80,
            phase_1_price: 0.10,
            
            // Lane 3: Sub-DAO Tokens
            subdaos: [],
            graduated_proposals: new Set(),
            
            // Integration
            proposal_stakings: new Map()
        };
    }

    // ===== LANE 1: LAB CREDITS (Non-transferable IP Custody) =====
    
    async issueLabCredit(inventor, ipTitle, ipDescription, ipHash) {
        const creditId = this.state.total_lab_credits + 1;
        const custodyProof = `CUSTODY_${creditId}_${Date.now().toString(36).toUpperCase()}`;
        
        const labCredit = {
            credit_id: creditId,
            inventor,
            ip_title: ipTitle,
            ip_description: ipDescription,
            ip_hash: ipHash,
            custody_proof: custodyProof,
            timestamp: Date.now(),
            provenance_locked: true
        };

        // Store in system
        this.state.lab_credits.set(creditId, labCredit);
        this.state.total_lab_credits++;
        
        if (!this.state.inventor_credits.has(inventor)) {
            this.state.inventor_credits.set(inventor, []);
        }
        this.state.inventor_credits.get(inventor).push(creditId);

        console.log(`\n${colors.blue}🧾 LAB CREDIT ISSUED${colors.reset}`);
        console.log(`   Credit ID: ${colors.bright}#${creditId}${colors.reset}`);
        console.log(`   Inventor: ${inventor}`);
        console.log(`   Title: ${ipTitle}`);
        console.log(`   Custody Proof: ${colors.yellow}${custodyProof}${colors.reset}`);
        console.log(`   ${colors.red}⚠️  NON-TRANSFERABLE - Immutable provenance record${colors.reset}`);
        
        return labCredit;
    }

    // ===== LANE 2: CURE/PDCURE TOKENS (Validation & Gating) =====
    
    async buyCURETokens(buyer, amount, kycVerified = true) {
        if (!kycVerified) {
            throw new Error("KYC verification required for CURE purchase");
        }

        const currentPrice = this.state.cure_phase === 1 ? this.state.phase_1_price : this.getDynamicPrice();
        const totalCost = amount * currentPrice;

        // Store holder balance
        if (!this.state.cure_holders.has(buyer)) {
            this.state.cure_holders.set(buyer, 0);
        }
        this.state.cure_holders.set(buyer, this.state.cure_holders.get(buyer) + amount);
        this.state.cure_total_supply += amount;

        console.log(`\n${colors.green}💎 CURE TOKEN PURCHASE${colors.reset}`);
        console.log(`   Buyer: ${buyer}`);
        console.log(`   Amount: ${amount.toLocaleString()} CURE`);
        console.log(`   Phase: ${this.state.cure_phase} (${this.state.cure_phase === 1 ? 'Fixed Price' : 'Dynamic Bonding Curve'})`);
        console.log(`   Price: $${currentPrice} per CURE`);
        console.log(`   Total Cost: $${totalCost.toLocaleString()}`);
        console.log(`   New Balance: ${this.state.cure_holders.get(buyer).toLocaleString()} CURE`);
        
        if (this.state.cure_phase === 1) {
            console.log(`   ${colors.yellow}⚠️  Phase 1: No selling allowed yet${colors.reset}`);
            console.log(`   ${colors.cyan}🔄 Dynamic pricing activates after AI validation${colors.reset}`);
        }

        return { success: true, balance: this.state.cure_holders.get(buyer) };
    }

    async stakeCUREOnProposal(staker, proposalId, stakeAmount) {
        const stakerBalance = this.state.cure_holders.get(staker) || 0;
        if (stakerBalance < stakeAmount) {
            throw new Error(`Insufficient CURE balance. Have: ${stakerBalance}, Need: ${stakeAmount}`);
        }

        // Update staking records
        if (!this.state.proposal_stakings.has(proposalId)) {
            this.state.proposal_stakings.set(proposalId, {
                proposal_id: proposalId,
                total_staked: 0,
                ant_score: 0,
                graduation_eligible: false,
                stakers: new Map()
            });
        }

        const staking = this.state.proposal_stakings.get(proposalId);
        staking.total_staked += stakeAmount;
        staking.stakers.set(staker, (staking.stakers.get(staker) || 0) + stakeAmount);
        
        this.state.community_staked += stakeAmount;

        console.log(`\n${colors.yellow}🎯 COMMUNITY STAKING${colors.reset}`);
        console.log(`   Staker: ${staker}`);
        console.log(`   Proposal: #${proposalId}`);
        console.log(`   Staked: ${stakeAmount.toLocaleString()} CURE`);
        console.log(`   Total Staked on Proposal: ${staking.total_staked.toLocaleString()} CURE`);
        console.log(`   System-wide Staked: ${this.state.community_staked.toLocaleString()} CURE`);

        return staking;
    }

    // ===== ANT SCORING INTEGRATION =====
    
    async processANTScoring(proposalId, scores) {
        console.log(`\n${createHeader("ANT AI SCORING AGENT EVALUATION")}`);
        console.log(`${colors.bright}Proposal #${proposalId} - Multi-dimensional Analysis${colors.reset}`);

        // Calculate detailed category scores
        const scientificMerit = Math.round((scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3);
        const feasibility = Math.round((scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3);
        const communityAlignment = Math.round((scores.community_alignment.mission_fit + scores.community_alignment.dao_engagement) / 2);
        const resourceEfficiency = Math.round((scores.resource_efficiency.cost_effectiveness + scores.resource_efficiency.agentic_resource_use) / 2);
        const openScience = Math.round((scores.open_science.data_protocol_sharing + scores.open_science.collaborative_potential) / 2);

        // Display detailed scoring
        console.log(`\n${colors.cyan}📊 DETAILED SCORING BREAKDOWN:${colors.reset}`);
        console.log(`   🔬 Scientific Merit (40% weight): ${colors.bright}${scientificMerit}%${colors.reset}`);
        console.log(`      • Novelty: ${scores.scientific_merit.novelty}%`);
        console.log(`      • Biological Plausibility: ${scores.scientific_merit.biological_plausibility}%`);
        console.log(`      • Prior Evidence: ${scores.scientific_merit.prior_evidence}%`);
        
        console.log(`   ⚙️  Feasibility (25% weight): ${colors.bright}${feasibility}%${colors.reset}`);
        console.log(`      • Technical Viability: ${scores.feasibility.technical_viability}%`);
        console.log(`      • Data Quality: ${scores.feasibility.data_quality}%`);
        console.log(`      • Protocol Clarity: ${scores.feasibility.clarity_of_protocol}%`);
        
        console.log(`   🤝 Community Alignment (20% weight): ${colors.bright}${communityAlignment}%${colors.reset}`);
        console.log(`      • Mission Fit: ${scores.community_alignment.mission_fit}%`);
        console.log(`      • DAO Engagement: ${scores.community_alignment.dao_engagement}%`);
        
        console.log(`   💰 Resource Efficiency (10% weight): ${colors.bright}${resourceEfficiency}%${colors.reset}`);
        console.log(`      • Cost Effectiveness: ${scores.resource_efficiency.cost_effectiveness}%`);
        console.log(`      • Agentic Resource Use: ${scores.resource_efficiency.agentic_resource_use}%`);
        
        console.log(`   🔓 Open Science (5% weight): ${colors.bright}${openScience}%${colors.reset}`);
        console.log(`      • Data/Protocol Sharing: ${scores.open_science.data_protocol_sharing}%`);
        console.log(`      • Collaborative Potential: ${scores.open_science.collaborative_potential}%`);

        // Calculate final ANT score
        const antScore = calculateANTScore(scores);
        
        console.log(`\n${colors.bright}🎯 FINAL ANT SCORE: ${antScore >= 80 ? colors.green : colors.red}${antScore}%${colors.reset}`);

        // Check graduation criteria
        const staking = this.state.proposal_stakings.get(proposalId);
        const meetsScoringThreshold = antScore >= this.state.validation_threshold;
        const meetsStakingThreshold = (staking?.total_staked || 0) >= 10000;

        console.log(`\n${colors.cyan}📋 VALIDATION CRITERIA CHECK:${colors.reset}`);
        console.log(`   ANT Score: ${antScore}% ${meetsScoringThreshold ? colors.green + '✅' : colors.red + '❌'} (≥${this.state.validation_threshold}% required)${colors.reset}`);
        console.log(`   Community Stake: ${(staking?.total_staked || 0).toLocaleString()} CURE ${meetsStakingThreshold ? colors.green + '✅' : colors.red + '❌'} (≥10,000 required)${colors.reset}`);

        const graduationEligible = meetsScoringThreshold && meetsStakingThreshold;

        if (graduationEligible) {
            // Update staking record
            if (staking) {
                staking.ant_score = antScore;
                staking.graduation_eligible = true;
            }

            console.log(`\n${colors.green}${colors.bright}🎉 VALIDATION PASSED! PROPOSAL GRADUATES TO LANE 3!${colors.reset}`);
            
            // Trigger Phase 2 transition for CURE tokens
            if (this.state.cure_phase === 1) {
                this.transitionToPhase2();
            }

            // Mark for Sub-DAO creation
            this.state.graduated_proposals.add(proposalId);
            
        } else {
            console.log(`\n${colors.red}❌ VALIDATION REQUIREMENTS NOT MET${colors.reset}`);
            console.log(`${colors.yellow}📝 Proposal needs improvement or more community support${colors.reset}`);
        }

        return { antScore, graduationEligible };
    }

    transitionToPhase2() {
        this.state.cure_phase = 2;
        console.log(`\n${colors.magenta}${colors.bright}🚀 CURE TOKEN PHASE TRANSITION!${colors.reset}`);
        console.log(`   ${colors.green}✅ Phase 2 Activated: Dynamic Bonding Curve Pricing${colors.reset}`);
        console.log(`   ${colors.green}✅ Selling Now Enabled${colors.reset}`);
        console.log(`   ${colors.cyan}📈 Price Updates Real-time Based on Supply/Demand${colors.reset}`);
    }

    // ===== LANE 3: SUB-DAO TOKENS (Activation & Campaigns) =====
    
    async createSubDAO(daoName, focusArea, graduatedProposalIds) {
        const daoId = this.state.subdaos.length + 1;

        console.log(`\n${createHeader("SUB-DAO CREATION (LANE 3)")}`);
        console.log(`${colors.bright}Creating decentralized research governance entity${colors.reset}`);

        const subDAO = {
            dao_id: daoId,
            dao_name: daoName,
            focus_area: focusArea,
            graduated_proposals: graduatedProposalIds,
            bonding_curve_active: false,
            token_supply: 0,
            current_price: 0.01,
            token_symbol: this.generateDAOTokenSymbol(daoName)
        };

        this.state.subdaos.push(subDAO);

        console.log(`\n${colors.blue}🏛️  SUB-DAO DETAILS:${colors.reset}`);
        console.log(`   DAO ID: #${daoId}`);
        console.log(`   Name: ${colors.bright}${daoName}${colors.reset}`);
        console.log(`   Focus Area: ${focusArea}`);
        console.log(`   Token Symbol: ${colors.yellow}${subDAO.token_symbol}${colors.reset}`);
        console.log(`   Graduated Proposals: ${graduatedProposalIds.join(', ')}`);
        console.log(`   Status: ${colors.cyan}Ready for token launch${colors.reset}`);

        return subDAO;
    }

    async launchSubDAOToken(daoId, initialPrice = 0.01) {
        const subDAO = this.state.subdaos.find(dao => dao.dao_id === daoId);
        if (!subDAO) {
            throw new Error(`Sub-DAO #${daoId} not found`);
        }

        subDAO.bonding_curve_active = true;
        subDAO.current_price = initialPrice;

        console.log(`\n${colors.magenta}${colors.bright}🚀 SUB-DAO TOKEN LAUNCH!${colors.reset}`);
        console.log(`\n${colors.cyan}📈 BONDING CURVE ACTIVATION:${colors.reset}`);
        console.log(`   Token: ${colors.yellow}${colors.bright}${subDAO.token_symbol}${colors.reset}`);
        console.log(`   DAO: ${subDAO.dao_name}`);
        console.log(`   Focus: ${subDAO.focus_area}`);
        console.log(`   Initial Price: $${initialPrice}`);
        console.log(`   Pricing Model: Dynamic Bonding Curve`);

        console.log(`\n${colors.green}✅ LIVE FEATURES:${colors.reset}`);
        console.log(`   💰 Community Crowdfunding: Active`);
        console.log(`   🗳️  Decentralized Governance: Active`);
        console.log(`   📊 Milestone Tracking: Active`);
        console.log(`   🔬 Research Funding: Ready`);
        console.log(`   📈 Price Discovery: Real-time`);

        return {
            success: true,
            token_symbol: subDAO.token_symbol,
            initial_price: initialPrice
        };
    }

    // ===== SYSTEM STATUS & INTEGRATION =====
    
    displaySystemStatus() {
        console.log(`\n${createHeader("TRI-LANE TOKEN SYSTEM - COMPLETE STATUS")}`);
        
        // Lane 1 Status
        console.log(`\n${colors.blue}🧾 LANE 1: LAB CREDITS (Provenance & IP Custody)${colors.reset}`);
        console.log(`   Total Credits Issued: ${colors.bright}${this.state.total_lab_credits}${colors.reset}`);
        console.log(`   Nature: ${colors.red}Non-transferable, immutable audit trail${colors.reset}`);
        console.log(`   Purpose: Inventor recognition + proof of custody`);
        console.log(`   Integration: ✅ Connected to Lane 2 validation`);

        // Lane 2 Status  
        console.log(`\n${colors.green}💎 LANE 2: CURE TOKENS (Validation & Community Gating)${colors.reset}`);
        console.log(`   Current Phase: ${colors.bright}${this.state.cure_phase === 1 ? 'Phase 1 (Fixed Price: $0.10)' : 'Phase 2 (Dynamic Bonding Curve)'}${colors.reset}`);
        console.log(`   Total Supply: ${colors.bright}${this.state.cure_total_supply.toLocaleString()}${colors.reset} CURE`);
        console.log(`   Holders: ${this.state.cure_holders.size}`);
        console.log(`   Community Staked: ${colors.bright}${this.state.community_staked.toLocaleString()}${colors.reset} CURE`);
        console.log(`   KYC Required: ${colors.yellow}Yes${colors.reset}`);
        console.log(`   Selling Allowed: ${this.state.cure_phase === 2 ? colors.green + 'Yes (Phase 2)' : colors.red + 'No (Phase 1)'}`);
        console.log(`   Integration: ✅ Connected to ANT scoring + Lane 3 graduation`);

        // Lane 3 Status
        console.log(`\n${colors.magenta}🏛️  LANE 3: SUB-DAO TOKENS (Campaigns & Governance)${colors.reset}`);
        console.log(`   Active Sub-DAOs: ${colors.bright}${this.state.subdaos.length}${colors.reset}`);
        console.log(`   Graduated Proposals: ${colors.bright}${this.state.graduated_proposals.size}${colors.reset}`);
        
        if (this.state.subdaos.length > 0) {
            this.state.subdaos.forEach(dao => {
                console.log(`\n   ${colors.cyan}• ${dao.dao_name}${colors.reset}`);
                console.log(`     Focus: ${dao.focus_area}`);
                console.log(`     Token: ${colors.yellow}${dao.token_symbol}${colors.reset}`);
                console.log(`     Bonding Curve: ${dao.bonding_curve_active ? colors.green + 'Active ✅' : colors.yellow + 'Preparing 🔄'}`);
                console.log(`     Current Price: $${dao.current_price}`);
            });
        } else {
            console.log(`   ${colors.gray}No Sub-DAOs created yet${colors.reset}`);
        }

        // System Integration Status
        console.log(`\n${colors.bright}🔗 SYSTEM INTEGRATION STATUS:${colors.reset}`);
        console.log(`   ANT Scoring: ${colors.green}Connected ✅${colors.reset}`);
        console.log(`   Validation Threshold: ${this.state.validation_threshold}% ANT score`);
        console.log(`   Phase Transitions: ${this.state.cure_phase === 2 ? colors.green + 'Activated ✅' : colors.yellow + 'Pending validation 🔄'}`);
        console.log(`   Token Flow: Lab Credits → CURE → Sub-DAO tokens`);
        console.log(`   Cross-tier Communication: ${colors.green}Seamless ✅${colors.reset}`);

        // Key Metrics
        console.log(`\n${colors.cyan}📊 KEY METRICS:${colors.reset}`);
        console.log(`   IP Assets Protected: ${this.state.total_lab_credits}`);
        console.log(`   Community Engaged: ${this.state.cure_holders.size} CURE holders`);
        console.log(`   Research Validated: ${this.state.graduated_proposals.size} proposals`);
        console.log(`   Governance Active: ${this.state.subdaos.filter(dao => dao.bonding_curve_active).length} Sub-DAOs`);
    }

    // Helper methods
    getDynamicPrice() {
        const basePrice = 0.15;
        const supplyMultiplier = this.state.cure_total_supply / 100000;
        return basePrice * (1 + supplyMultiplier * 0.1);
    }

    generateDAOTokenSymbol(daoName) {
        const words = daoName.split(' ').filter(word => word.length > 2);
        const symbol = words.map(word => word.substring(0, 2).toUpperCase()).join('');
        return symbol.length > 6 ? symbol.substring(0, 6) : symbol;
    }
}

// ===== COMPLETE WORKFLOW DEMONSTRATION =====

async function runCompleteTriLaneDemo() {
    console.clear();
    console.log(`${createHeader("ANT TRI-LANE TOKENOMICS - COMPLETE INTEGRATION DEMO")}`);
    console.log(`${colors.bright}🧬 Seamless Token Flow: Lab Credits → CURE → Sub-DAO tokens${colors.reset}`);
    console.log(`${colors.cyan}Built for Aptos Ctrl+MOVE Hackathon - Revolutionary Research Funding${colors.reset}`);

    const system = new TriLaneTokenSystem();

    // ===== STEP 1: IP SUBMISSION (LANE 1) =====
    console.log(`\n${createHeader("STEP 1: INVENTOR IP SUBMISSION (LANE 1)")}`);
    console.log(`${colors.bright}Researcher submits breakthrough IP for custody and validation${colors.reset}`);
    
    await sleep(1000);
    
    const labCredit = await system.issueLabCredit(
        "Dr. Sarah Chen (0x123...inventor)",
        "CRISPR-Cas9 Gene Therapy for Parkinson's Disease",
        "Revolutionary approach targeting alpha-synuclein aggregation using CRISPR base editing. Preliminary studies in transgenic mice show 60% reduction in protein clumps and restored motor function.",
        "QmParkinsonCRISPR2024_breakthrough_data"
    );

    await sleep(2000);

    // ===== STEP 2: COMMUNITY VALIDATION (LANE 2) =====
    console.log(`\n${createHeader("STEP 2: COMMUNITY VALIDATION & STAKING (LANE 2)")}`);
    console.log(`${colors.bright}Community acquires CURE tokens and stakes on promising research${colors.reset}`);

    await sleep(1000);

    // Community members buy CURE tokens
    await system.buyCURETokens("Dr. Michael Zhang (0x456...community1)", 15000, true);
    await sleep(800);
    await system.buyCURETokens("Prof. Lisa Johnson (0x789...community2)", 8000, true);
    await sleep(800);
    await system.buyCURETokens("Research Institute (0xabc...institution)", 25000, true);
    await sleep(800);
    await system.buyCURETokens("Biotech Investor (0xdef...investor)", 12000, true);

    await sleep(1500);

    // Community stakes on the research proposal
    console.log(`\n${colors.yellow}${colors.bright}🎯 COMMUNITY STAKING ON RESEARCH PROPOSAL${colors.reset}`);
    await system.stakeCUREOnProposal("Dr. Michael Zhang (0x456...community1)", 1, 5000);
    await sleep(500);
    await system.stakeCUREOnProposal("Prof. Lisa Johnson (0x789...community2)", 1, 3000);
    await sleep(500);
    await system.stakeCUREOnProposal("Research Institute (0xabc...institution)", 1, 8000);
    await sleep(500);
    await system.stakeCUREOnProposal("Biotech Investor (0xdef...investor)", 1, 4000);

    await sleep(2000);

    // ===== STEP 3: ANT AI SCORING EVALUATION =====
    console.log(`\n${createHeader("STEP 3: ANT AI SCORING EVALUATION")}`);
    console.log(`${colors.bright}Advanced AI agent evaluates research across 5 dimensions${colors.reset}`);

    await sleep(1500);

    // High-quality research scores that should pass validation
    const researchScores = {
        scientific_merit: { 
            novelty: 94, 
            biological_plausibility: 89, 
            prior_evidence: 87 
        },
        feasibility: { 
            technical_viability: 88, 
            data_quality: 92, 
            clarity_of_protocol: 90 
        },
        community_alignment: { 
            mission_fit: 96, 
            dao_engagement: 88 
        },
        resource_efficiency: { 
            cost_effectiveness: 85, 
            agentic_resource_use: 87 
        },
        open_science: { 
            data_protocol_sharing: 92, 
            collaborative_potential: 89 
        }
    };

    const { antScore, graduationEligible } = await system.processANTScoring(1, researchScores);

    await sleep(2500);

    // ===== STEP 4: SUB-DAO CREATION & TOKEN LAUNCH (LANE 3) =====
    if (graduationEligible) {
        console.log(`\n${createHeader("STEP 4: SUB-DAO CREATION & TOKEN LAUNCH (LANE 3)")}`);
        console.log(`${colors.bright}Validated research graduates to decentralized governance and crowdfunding${colors.reset}`);

        await sleep(1000);

        const subDAO = await system.createSubDAO(
            "Parkinson's Research Collective",
            "Parkinson's Disease & Neurodegeneration",
            [1]
        );

        await sleep(1500);

        await system.launchSubDAOToken(subDAO.dao_id, 0.008);

        await sleep(2000);
    }

    // ===== FINAL SYSTEM STATUS =====
    console.log(`\n${createHeader("FINAL SYSTEM STATUS")}`);
    system.displaySystemStatus();

    // ===== COMPLETION SUMMARY =====
    console.log(`\n${createHeader("TRI-LANE INTEGRATION DEMONSTRATION COMPLETE!")}`);
    
    console.log(`\n${colors.green}${colors.bright}🎉 SUCCESSFULLY DEMONSTRATED:${colors.reset}`);
    console.log(`   ${colors.blue}Lane 1:${colors.reset} ✅ Lab Credit issued (non-transferable IP custody)`);
    console.log(`   ${colors.green}Lane 2:${colors.reset} ✅ CURE token validation & community staking`);
    console.log(`   ${colors.magenta}Lane 3:${colors.reset} ✅ Sub-DAO token launched with bonding curve`);
    
    console.log(`\n${colors.cyan}${colors.bright}🔗 SEAMLESS INTEGRATION ACHIEVED:${colors.reset}`);
    console.log(`   • ${colors.yellow}Token Flow:${colors.reset} Lab Credits → CURE → Sub-DAO tokens`);
    console.log(`   • ${colors.yellow}Validation:${colors.reset} ANT AI scoring triggers phase transitions`);
    console.log(`   • ${colors.yellow}Governance:${colors.reset} Community staking enables research funding`);
    console.log(`   • ${colors.yellow}Economics:${colors.reset} Bonding curves ensure fair price discovery`);
    
    console.log(`\n${colors.bright}🚀 PRODUCTION READY FEATURES:${colors.reset}`);
    console.log(`   💡 IP Provenance Protection`);
    console.log(`   🤝 Community-Driven Validation`);
    console.log(`   🧠 AI-Powered Quality Assessment`);
    console.log(`   🏛️  Decentralized Research Governance`);
    console.log(`   💰 Dynamic Funding Mechanisms`);
    console.log(`   📈 Transparent Price Discovery`);
    
    console.log(`\n${colors.magenta}${colors.bright}🎯 READY FOR APTOS CTRL+MOVE HACKATHON SUBMISSION!${colors.reset}`);
    console.log(`${colors.cyan}Revolutionary tri-lane tokenomics creating the future of research funding! 🧬⚡${colors.reset}\n`);
}

// Run the complete demo
runCompleteTriLaneDemo().catch(console.error);






=======
#!/usr/bin/env node

/**
 * Tri-Lane Token Architecture - Working Demo
 * Shows seamless integration: Lab Credits → CURE/PDcure → Sub-DAO tokens
 */

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createHeader(title) {
    const line = '='.repeat(70);
    return `\n${colors.cyan}${line}${colors.reset}\n${colors.cyan}${colors.bright}${title.padStart((70 + title.length) / 2)}${colors.reset}\n${colors.cyan}${line}${colors.reset}`;
}

// ANT Scoring calculation
function calculateANTScore(scores) {
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

class TriLaneTokenSystem {
    constructor() {
        // System state
        this.state = {
            // Lane 1: Lab Credits
            total_lab_credits: 0,
            lab_credits: new Map(),
            inventor_credits: new Map(),
            
            // Lane 2: CURE/PDcure Tokens
            cure_phase: 1, // 1=fixed price, 2=dynamic
            cure_total_supply: 0,
            cure_holders: new Map(),
            community_staked: 0,
            validation_threshold: 80,
            phase_1_price: 0.10,
            
            // Lane 3: Sub-DAO Tokens
            subdaos: [],
            graduated_proposals: new Set(),
            
            // Integration
            proposal_stakings: new Map()
        };
    }

    // ===== LANE 1: LAB CREDITS (Non-transferable IP Custody) =====
    
    async issueLabCredit(inventor, ipTitle, ipDescription, ipHash) {
        const creditId = this.state.total_lab_credits + 1;
        const custodyProof = `CUSTODY_${creditId}_${Date.now().toString(36).toUpperCase()}`;
        
        const labCredit = {
            credit_id: creditId,
            inventor,
            ip_title: ipTitle,
            ip_description: ipDescription,
            ip_hash: ipHash,
            custody_proof: custodyProof,
            timestamp: Date.now(),
            provenance_locked: true
        };

        // Store in system
        this.state.lab_credits.set(creditId, labCredit);
        this.state.total_lab_credits++;
        
        if (!this.state.inventor_credits.has(inventor)) {
            this.state.inventor_credits.set(inventor, []);
        }
        this.state.inventor_credits.get(inventor).push(creditId);

        console.log(`\n${colors.blue}🧾 LAB CREDIT ISSUED${colors.reset}`);
        console.log(`   Credit ID: ${colors.bright}#${creditId}${colors.reset}`);
        console.log(`   Inventor: ${inventor}`);
        console.log(`   Title: ${ipTitle}`);
        console.log(`   Custody Proof: ${colors.yellow}${custodyProof}${colors.reset}`);
        console.log(`   ${colors.red}⚠️  NON-TRANSFERABLE - Immutable provenance record${colors.reset}`);
        
        return labCredit;
    }

    // ===== LANE 2: CURE/PDCURE TOKENS (Validation & Gating) =====
    
    async buyCURETokens(buyer, amount, kycVerified = true) {
        if (!kycVerified) {
            throw new Error("KYC verification required for CURE purchase");
        }

        const currentPrice = this.state.cure_phase === 1 ? this.state.phase_1_price : this.getDynamicPrice();
        const totalCost = amount * currentPrice;

        // Store holder balance
        if (!this.state.cure_holders.has(buyer)) {
            this.state.cure_holders.set(buyer, 0);
        }
        this.state.cure_holders.set(buyer, this.state.cure_holders.get(buyer) + amount);
        this.state.cure_total_supply += amount;

        console.log(`\n${colors.green}💎 CURE TOKEN PURCHASE${colors.reset}`);
        console.log(`   Buyer: ${buyer}`);
        console.log(`   Amount: ${amount.toLocaleString()} CURE`);
        console.log(`   Phase: ${this.state.cure_phase} (${this.state.cure_phase === 1 ? 'Fixed Price' : 'Dynamic Bonding Curve'})`);
        console.log(`   Price: $${currentPrice} per CURE`);
        console.log(`   Total Cost: $${totalCost.toLocaleString()}`);
        console.log(`   New Balance: ${this.state.cure_holders.get(buyer).toLocaleString()} CURE`);
        
        if (this.state.cure_phase === 1) {
            console.log(`   ${colors.yellow}⚠️  Phase 1: No selling allowed yet${colors.reset}`);
            console.log(`   ${colors.cyan}🔄 Dynamic pricing activates after AI validation${colors.reset}`);
        }

        return { success: true, balance: this.state.cure_holders.get(buyer) };
    }

    async stakeCUREOnProposal(staker, proposalId, stakeAmount) {
        const stakerBalance = this.state.cure_holders.get(staker) || 0;
        if (stakerBalance < stakeAmount) {
            throw new Error(`Insufficient CURE balance. Have: ${stakerBalance}, Need: ${stakeAmount}`);
        }

        // Update staking records
        if (!this.state.proposal_stakings.has(proposalId)) {
            this.state.proposal_stakings.set(proposalId, {
                proposal_id: proposalId,
                total_staked: 0,
                ant_score: 0,
                graduation_eligible: false,
                stakers: new Map()
            });
        }

        const staking = this.state.proposal_stakings.get(proposalId);
        staking.total_staked += stakeAmount;
        staking.stakers.set(staker, (staking.stakers.get(staker) || 0) + stakeAmount);
        
        this.state.community_staked += stakeAmount;

        console.log(`\n${colors.yellow}🎯 COMMUNITY STAKING${colors.reset}`);
        console.log(`   Staker: ${staker}`);
        console.log(`   Proposal: #${proposalId}`);
        console.log(`   Staked: ${stakeAmount.toLocaleString()} CURE`);
        console.log(`   Total Staked on Proposal: ${staking.total_staked.toLocaleString()} CURE`);
        console.log(`   System-wide Staked: ${this.state.community_staked.toLocaleString()} CURE`);

        return staking;
    }

    // ===== ANT SCORING INTEGRATION =====
    
    async processANTScoring(proposalId, scores) {
        console.log(`\n${createHeader("ANT AI SCORING AGENT EVALUATION")}`);
        console.log(`${colors.bright}Proposal #${proposalId} - Multi-dimensional Analysis${colors.reset}`);

        // Calculate detailed category scores
        const scientificMerit = Math.round((scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3);
        const feasibility = Math.round((scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3);
        const communityAlignment = Math.round((scores.community_alignment.mission_fit + scores.community_alignment.dao_engagement) / 2);
        const resourceEfficiency = Math.round((scores.resource_efficiency.cost_effectiveness + scores.resource_efficiency.agentic_resource_use) / 2);
        const openScience = Math.round((scores.open_science.data_protocol_sharing + scores.open_science.collaborative_potential) / 2);

        // Display detailed scoring
        console.log(`\n${colors.cyan}📊 DETAILED SCORING BREAKDOWN:${colors.reset}`);
        console.log(`   🔬 Scientific Merit (40% weight): ${colors.bright}${scientificMerit}%${colors.reset}`);
        console.log(`      • Novelty: ${scores.scientific_merit.novelty}%`);
        console.log(`      • Biological Plausibility: ${scores.scientific_merit.biological_plausibility}%`);
        console.log(`      • Prior Evidence: ${scores.scientific_merit.prior_evidence}%`);
        
        console.log(`   ⚙️  Feasibility (25% weight): ${colors.bright}${feasibility}%${colors.reset}`);
        console.log(`      • Technical Viability: ${scores.feasibility.technical_viability}%`);
        console.log(`      • Data Quality: ${scores.feasibility.data_quality}%`);
        console.log(`      • Protocol Clarity: ${scores.feasibility.clarity_of_protocol}%`);
        
        console.log(`   🤝 Community Alignment (20% weight): ${colors.bright}${communityAlignment}%${colors.reset}`);
        console.log(`      • Mission Fit: ${scores.community_alignment.mission_fit}%`);
        console.log(`      • DAO Engagement: ${scores.community_alignment.dao_engagement}%`);
        
        console.log(`   💰 Resource Efficiency (10% weight): ${colors.bright}${resourceEfficiency}%${colors.reset}`);
        console.log(`      • Cost Effectiveness: ${scores.resource_efficiency.cost_effectiveness}%`);
        console.log(`      • Agentic Resource Use: ${scores.resource_efficiency.agentic_resource_use}%`);
        
        console.log(`   🔓 Open Science (5% weight): ${colors.bright}${openScience}%${colors.reset}`);
        console.log(`      • Data/Protocol Sharing: ${scores.open_science.data_protocol_sharing}%`);
        console.log(`      • Collaborative Potential: ${scores.open_science.collaborative_potential}%`);

        // Calculate final ANT score
        const antScore = calculateANTScore(scores);
        
        console.log(`\n${colors.bright}🎯 FINAL ANT SCORE: ${antScore >= 80 ? colors.green : colors.red}${antScore}%${colors.reset}`);

        // Check graduation criteria
        const staking = this.state.proposal_stakings.get(proposalId);
        const meetsScoringThreshold = antScore >= this.state.validation_threshold;
        const meetsStakingThreshold = (staking?.total_staked || 0) >= 10000;

        console.log(`\n${colors.cyan}📋 VALIDATION CRITERIA CHECK:${colors.reset}`);
        console.log(`   ANT Score: ${antScore}% ${meetsScoringThreshold ? colors.green + '✅' : colors.red + '❌'} (≥${this.state.validation_threshold}% required)${colors.reset}`);
        console.log(`   Community Stake: ${(staking?.total_staked || 0).toLocaleString()} CURE ${meetsStakingThreshold ? colors.green + '✅' : colors.red + '❌'} (≥10,000 required)${colors.reset}`);

        const graduationEligible = meetsScoringThreshold && meetsStakingThreshold;

        if (graduationEligible) {
            // Update staking record
            if (staking) {
                staking.ant_score = antScore;
                staking.graduation_eligible = true;
            }

            console.log(`\n${colors.green}${colors.bright}🎉 VALIDATION PASSED! PROPOSAL GRADUATES TO LANE 3!${colors.reset}`);
            
            // Trigger Phase 2 transition for CURE tokens
            if (this.state.cure_phase === 1) {
                this.transitionToPhase2();
            }

            // Mark for Sub-DAO creation
            this.state.graduated_proposals.add(proposalId);
            
        } else {
            console.log(`\n${colors.red}❌ VALIDATION REQUIREMENTS NOT MET${colors.reset}`);
            console.log(`${colors.yellow}📝 Proposal needs improvement or more community support${colors.reset}`);
        }

        return { antScore, graduationEligible };
    }

    transitionToPhase2() {
        this.state.cure_phase = 2;
        console.log(`\n${colors.magenta}${colors.bright}🚀 CURE TOKEN PHASE TRANSITION!${colors.reset}`);
        console.log(`   ${colors.green}✅ Phase 2 Activated: Dynamic Bonding Curve Pricing${colors.reset}`);
        console.log(`   ${colors.green}✅ Selling Now Enabled${colors.reset}`);
        console.log(`   ${colors.cyan}📈 Price Updates Real-time Based on Supply/Demand${colors.reset}`);
    }

    // ===== LANE 3: SUB-DAO TOKENS (Activation & Campaigns) =====
    
    async createSubDAO(daoName, focusArea, graduatedProposalIds) {
        const daoId = this.state.subdaos.length + 1;

        console.log(`\n${createHeader("SUB-DAO CREATION (LANE 3)")}`);
        console.log(`${colors.bright}Creating decentralized research governance entity${colors.reset}`);

        const subDAO = {
            dao_id: daoId,
            dao_name: daoName,
            focus_area: focusArea,
            graduated_proposals: graduatedProposalIds,
            bonding_curve_active: false,
            token_supply: 0,
            current_price: 0.01,
            token_symbol: this.generateDAOTokenSymbol(daoName)
        };

        this.state.subdaos.push(subDAO);

        console.log(`\n${colors.blue}🏛️  SUB-DAO DETAILS:${colors.reset}`);
        console.log(`   DAO ID: #${daoId}`);
        console.log(`   Name: ${colors.bright}${daoName}${colors.reset}`);
        console.log(`   Focus Area: ${focusArea}`);
        console.log(`   Token Symbol: ${colors.yellow}${subDAO.token_symbol}${colors.reset}`);
        console.log(`   Graduated Proposals: ${graduatedProposalIds.join(', ')}`);
        console.log(`   Status: ${colors.cyan}Ready for token launch${colors.reset}`);

        return subDAO;
    }

    async launchSubDAOToken(daoId, initialPrice = 0.01) {
        const subDAO = this.state.subdaos.find(dao => dao.dao_id === daoId);
        if (!subDAO) {
            throw new Error(`Sub-DAO #${daoId} not found`);
        }

        subDAO.bonding_curve_active = true;
        subDAO.current_price = initialPrice;

        console.log(`\n${colors.magenta}${colors.bright}🚀 SUB-DAO TOKEN LAUNCH!${colors.reset}`);
        console.log(`\n${colors.cyan}📈 BONDING CURVE ACTIVATION:${colors.reset}`);
        console.log(`   Token: ${colors.yellow}${colors.bright}${subDAO.token_symbol}${colors.reset}`);
        console.log(`   DAO: ${subDAO.dao_name}`);
        console.log(`   Focus: ${subDAO.focus_area}`);
        console.log(`   Initial Price: $${initialPrice}`);
        console.log(`   Pricing Model: Dynamic Bonding Curve`);

        console.log(`\n${colors.green}✅ LIVE FEATURES:${colors.reset}`);
        console.log(`   💰 Community Crowdfunding: Active`);
        console.log(`   🗳️  Decentralized Governance: Active`);
        console.log(`   📊 Milestone Tracking: Active`);
        console.log(`   🔬 Research Funding: Ready`);
        console.log(`   📈 Price Discovery: Real-time`);

        return {
            success: true,
            token_symbol: subDAO.token_symbol,
            initial_price: initialPrice
        };
    }

    // ===== SYSTEM STATUS & INTEGRATION =====
    
    displaySystemStatus() {
        console.log(`\n${createHeader("TRI-LANE TOKEN SYSTEM - COMPLETE STATUS")}`);
        
        // Lane 1 Status
        console.log(`\n${colors.blue}🧾 LANE 1: LAB CREDITS (Provenance & IP Custody)${colors.reset}`);
        console.log(`   Total Credits Issued: ${colors.bright}${this.state.total_lab_credits}${colors.reset}`);
        console.log(`   Nature: ${colors.red}Non-transferable, immutable audit trail${colors.reset}`);
        console.log(`   Purpose: Inventor recognition + proof of custody`);
        console.log(`   Integration: ✅ Connected to Lane 2 validation`);

        // Lane 2 Status  
        console.log(`\n${colors.green}💎 LANE 2: CURE TOKENS (Validation & Community Gating)${colors.reset}`);
        console.log(`   Current Phase: ${colors.bright}${this.state.cure_phase === 1 ? 'Phase 1 (Fixed Price: $0.10)' : 'Phase 2 (Dynamic Bonding Curve)'}${colors.reset}`);
        console.log(`   Total Supply: ${colors.bright}${this.state.cure_total_supply.toLocaleString()}${colors.reset} CURE`);
        console.log(`   Holders: ${this.state.cure_holders.size}`);
        console.log(`   Community Staked: ${colors.bright}${this.state.community_staked.toLocaleString()}${colors.reset} CURE`);
        console.log(`   KYC Required: ${colors.yellow}Yes${colors.reset}`);
        console.log(`   Selling Allowed: ${this.state.cure_phase === 2 ? colors.green + 'Yes (Phase 2)' : colors.red + 'No (Phase 1)'}`);
        console.log(`   Integration: ✅ Connected to ANT scoring + Lane 3 graduation`);

        // Lane 3 Status
        console.log(`\n${colors.magenta}🏛️  LANE 3: SUB-DAO TOKENS (Campaigns & Governance)${colors.reset}`);
        console.log(`   Active Sub-DAOs: ${colors.bright}${this.state.subdaos.length}${colors.reset}`);
        console.log(`   Graduated Proposals: ${colors.bright}${this.state.graduated_proposals.size}${colors.reset}`);
        
        if (this.state.subdaos.length > 0) {
            this.state.subdaos.forEach(dao => {
                console.log(`\n   ${colors.cyan}• ${dao.dao_name}${colors.reset}`);
                console.log(`     Focus: ${dao.focus_area}`);
                console.log(`     Token: ${colors.yellow}${dao.token_symbol}${colors.reset}`);
                console.log(`     Bonding Curve: ${dao.bonding_curve_active ? colors.green + 'Active ✅' : colors.yellow + 'Preparing 🔄'}`);
                console.log(`     Current Price: $${dao.current_price}`);
            });
        } else {
            console.log(`   ${colors.gray}No Sub-DAOs created yet${colors.reset}`);
        }

        // System Integration Status
        console.log(`\n${colors.bright}🔗 SYSTEM INTEGRATION STATUS:${colors.reset}`);
        console.log(`   ANT Scoring: ${colors.green}Connected ✅${colors.reset}`);
        console.log(`   Validation Threshold: ${this.state.validation_threshold}% ANT score`);
        console.log(`   Phase Transitions: ${this.state.cure_phase === 2 ? colors.green + 'Activated ✅' : colors.yellow + 'Pending validation 🔄'}`);
        console.log(`   Token Flow: Lab Credits → CURE → Sub-DAO tokens`);
        console.log(`   Cross-tier Communication: ${colors.green}Seamless ✅${colors.reset}`);

        // Key Metrics
        console.log(`\n${colors.cyan}📊 KEY METRICS:${colors.reset}`);
        console.log(`   IP Assets Protected: ${this.state.total_lab_credits}`);
        console.log(`   Community Engaged: ${this.state.cure_holders.size} CURE holders`);
        console.log(`   Research Validated: ${this.state.graduated_proposals.size} proposals`);
        console.log(`   Governance Active: ${this.state.subdaos.filter(dao => dao.bonding_curve_active).length} Sub-DAOs`);
    }

    // Helper methods
    getDynamicPrice() {
        const basePrice = 0.15;
        const supplyMultiplier = this.state.cure_total_supply / 100000;
        return basePrice * (1 + supplyMultiplier * 0.1);
    }

    generateDAOTokenSymbol(daoName) {
        const words = daoName.split(' ').filter(word => word.length > 2);
        const symbol = words.map(word => word.substring(0, 2).toUpperCase()).join('');
        return symbol.length > 6 ? symbol.substring(0, 6) : symbol;
    }
}

// ===== COMPLETE WORKFLOW DEMONSTRATION =====

async function runCompleteTriLaneDemo() {
    console.clear();
    console.log(`${createHeader("ANT TRI-LANE TOKENOMICS - COMPLETE INTEGRATION DEMO")}`);
    console.log(`${colors.bright}🧬 Seamless Token Flow: Lab Credits → CURE → Sub-DAO tokens${colors.reset}`);
    console.log(`${colors.cyan}Built for Aptos Ctrl+MOVE Hackathon - Revolutionary Research Funding${colors.reset}`);

    const system = new TriLaneTokenSystem();

    // ===== STEP 1: IP SUBMISSION (LANE 1) =====
    console.log(`\n${createHeader("STEP 1: INVENTOR IP SUBMISSION (LANE 1)")}`);
    console.log(`${colors.bright}Researcher submits breakthrough IP for custody and validation${colors.reset}`);
    
    await sleep(1000);
    
    const labCredit = await system.issueLabCredit(
        "Dr. Sarah Chen (0x123...inventor)",
        "CRISPR-Cas9 Gene Therapy for Parkinson's Disease",
        "Revolutionary approach targeting alpha-synuclein aggregation using CRISPR base editing. Preliminary studies in transgenic mice show 60% reduction in protein clumps and restored motor function.",
        "QmParkinsonCRISPR2024_breakthrough_data"
    );

    await sleep(2000);

    // ===== STEP 2: COMMUNITY VALIDATION (LANE 2) =====
    console.log(`\n${createHeader("STEP 2: COMMUNITY VALIDATION & STAKING (LANE 2)")}`);
    console.log(`${colors.bright}Community acquires CURE tokens and stakes on promising research${colors.reset}`);

    await sleep(1000);

    // Community members buy CURE tokens
    await system.buyCURETokens("Dr. Michael Zhang (0x456...community1)", 15000, true);
    await sleep(800);
    await system.buyCURETokens("Prof. Lisa Johnson (0x789...community2)", 8000, true);
    await sleep(800);
    await system.buyCURETokens("Research Institute (0xabc...institution)", 25000, true);
    await sleep(800);
    await system.buyCURETokens("Biotech Investor (0xdef...investor)", 12000, true);

    await sleep(1500);

    // Community stakes on the research proposal
    console.log(`\n${colors.yellow}${colors.bright}🎯 COMMUNITY STAKING ON RESEARCH PROPOSAL${colors.reset}`);
    await system.stakeCUREOnProposal("Dr. Michael Zhang (0x456...community1)", 1, 5000);
    await sleep(500);
    await system.stakeCUREOnProposal("Prof. Lisa Johnson (0x789...community2)", 1, 3000);
    await sleep(500);
    await system.stakeCUREOnProposal("Research Institute (0xabc...institution)", 1, 8000);
    await sleep(500);
    await system.stakeCUREOnProposal("Biotech Investor (0xdef...investor)", 1, 4000);

    await sleep(2000);

    // ===== STEP 3: ANT AI SCORING EVALUATION =====
    console.log(`\n${createHeader("STEP 3: ANT AI SCORING EVALUATION")}`);
    console.log(`${colors.bright}Advanced AI agent evaluates research across 5 dimensions${colors.reset}`);

    await sleep(1500);

    // High-quality research scores that should pass validation
    const researchScores = {
        scientific_merit: { 
            novelty: 94, 
            biological_plausibility: 89, 
            prior_evidence: 87 
        },
        feasibility: { 
            technical_viability: 88, 
            data_quality: 92, 
            clarity_of_protocol: 90 
        },
        community_alignment: { 
            mission_fit: 96, 
            dao_engagement: 88 
        },
        resource_efficiency: { 
            cost_effectiveness: 85, 
            agentic_resource_use: 87 
        },
        open_science: { 
            data_protocol_sharing: 92, 
            collaborative_potential: 89 
        }
    };

    const { antScore, graduationEligible } = await system.processANTScoring(1, researchScores);

    await sleep(2500);

    // ===== STEP 4: SUB-DAO CREATION & TOKEN LAUNCH (LANE 3) =====
    if (graduationEligible) {
        console.log(`\n${createHeader("STEP 4: SUB-DAO CREATION & TOKEN LAUNCH (LANE 3)")}`);
        console.log(`${colors.bright}Validated research graduates to decentralized governance and crowdfunding${colors.reset}`);

        await sleep(1000);

        const subDAO = await system.createSubDAO(
            "Parkinson's Research Collective",
            "Parkinson's Disease & Neurodegeneration",
            [1]
        );

        await sleep(1500);

        await system.launchSubDAOToken(subDAO.dao_id, 0.008);

        await sleep(2000);
    }

    // ===== FINAL SYSTEM STATUS =====
    console.log(`\n${createHeader("FINAL SYSTEM STATUS")}`);
    system.displaySystemStatus();

    // ===== COMPLETION SUMMARY =====
    console.log(`\n${createHeader("TRI-LANE INTEGRATION DEMONSTRATION COMPLETE!")}`);
    
    console.log(`\n${colors.green}${colors.bright}🎉 SUCCESSFULLY DEMONSTRATED:${colors.reset}`);
    console.log(`   ${colors.blue}Lane 1:${colors.reset} ✅ Lab Credit issued (non-transferable IP custody)`);
    console.log(`   ${colors.green}Lane 2:${colors.reset} ✅ CURE token validation & community staking`);
    console.log(`   ${colors.magenta}Lane 3:${colors.reset} ✅ Sub-DAO token launched with bonding curve`);
    
    console.log(`\n${colors.cyan}${colors.bright}🔗 SEAMLESS INTEGRATION ACHIEVED:${colors.reset}`);
    console.log(`   • ${colors.yellow}Token Flow:${colors.reset} Lab Credits → CURE → Sub-DAO tokens`);
    console.log(`   • ${colors.yellow}Validation:${colors.reset} ANT AI scoring triggers phase transitions`);
    console.log(`   • ${colors.yellow}Governance:${colors.reset} Community staking enables research funding`);
    console.log(`   • ${colors.yellow}Economics:${colors.reset} Bonding curves ensure fair price discovery`);
    
    console.log(`\n${colors.bright}🚀 PRODUCTION READY FEATURES:${colors.reset}`);
    console.log(`   💡 IP Provenance Protection`);
    console.log(`   🤝 Community-Driven Validation`);
    console.log(`   🧠 AI-Powered Quality Assessment`);
    console.log(`   🏛️  Decentralized Research Governance`);
    console.log(`   💰 Dynamic Funding Mechanisms`);
    console.log(`   📈 Transparent Price Discovery`);
    
    console.log(`\n${colors.magenta}${colors.bright}🎯 READY FOR APTOS CTRL+MOVE HACKATHON SUBMISSION!${colors.reset}`);
    console.log(`${colors.cyan}Revolutionary tri-lane tokenomics creating the future of research funding! 🧬⚡${colors.reset}\n`);
}

// Run the complete demo
runCompleteTriLaneDemo().catch(console.error);





>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
