"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTScoringHelper = void 0;
exports.createExampleScores = createExampleScores;
exports.createPassingScores = createPassingScores;
exports.createTestAccount = createTestAccount;
exports.loadDeploymentInfo = loadDeploymentInfo;
/**
 * ANTScoringHelper - Utility class for interacting with the ANT Scoring Module on Aptos
 */
class ANTScoringHelper {
    constructor(config, account) {
        this.client = new AptosClient(config.nodeUrl);
        this.config = config;
        this.account = account;
    }
    /**
     * Set the signing account
     */
    setAccount(account) {
        this.account = account;
    }
    /**
     * Submit a new proposal to the ANT system
     */
    async submitProposal(title, description, ipfsHash = "") {
        if (!this.account) {
            throw new Error("No account set for signing transactions");
        }
        try {
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural(`${this.config.moduleAddress}::ant_scoring`, "submit_proposal", [], [
                TxnBuilderTypes.TransactionArgument.new_string(title),
                TxnBuilderTypes.TransactionArgument.new_string(description),
                TxnBuilderTypes.TransactionArgument.new_string(ipfsHash)
            ]));
            const txnRequest = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            // Get proposal ID from events
            const proposalId = await this.getLatestProposalId();
            return { proposalId, txHash: txnResult.hash };
        }
        catch (error) {
            throw new Error(`Failed to submit proposal: ${error}`);
        }
    }
    /**
     * Score a proposal using the ANT methodology
     */
    async scoreProposal(proposalId, scores) {
        if (!this.account) {
            throw new Error("No account set for signing transactions");
        }
        try {
            // Validate scores (0-100 range)
            this.validateScores(scores);
            // Create struct arguments for Move
            const scientificMerit = this.createScientificMeritStruct(scores.scientific_merit);
            const feasibility = this.createFeasibilityStruct(scores.feasibility);
            const communityAlignment = this.createCommunityAlignmentStruct(scores.community_alignment);
            const resourceEfficiency = this.createResourceEfficiencyStruct(scores.resource_efficiency);
            const openScience = this.createOpenScienceStruct(scores.open_science);
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural(`${this.config.moduleAddress}::ant_scoring`, "score_proposal", [], [
                TxnBuilderTypes.TransactionArgument.new_u64(proposalId),
                scientificMerit,
                feasibility,
                communityAlignment,
                resourceEfficiency,
                openScience
            ]));
            const txnRequest = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        }
        catch (error) {
            throw new Error(`Failed to score proposal: ${error}`);
        }
    }
    /**
     * Fulfill a proposal that meets the 80% threshold
     */
    async fulfillProposal(proposalId) {
        if (!this.account) {
            throw new Error("No account set for signing transactions");
        }
        try {
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural(`${this.config.moduleAddress}::ant_scoring`, "fulfill_proposal", [], [TxnBuilderTypes.TransactionArgument.new_u64(proposalId)]));
            const txnRequest = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        }
        catch (error) {
            throw new Error(`Failed to fulfill proposal: ${error}`);
        }
    }
    /**
     * Authorize a scorer (owner only)
     */
    async authorizeScorer(scorerAddress) {
        if (!this.account) {
            throw new Error("No account set for signing transactions");
        }
        try {
            const payload = new TxnBuilderTypes.TransactionPayloadEntryFunction(TxnBuilderTypes.EntryFunction.natural(`${this.config.moduleAddress}::ant_scoring`, "authorize_scorer", [], [TxnBuilderTypes.TransactionArgument.new_address(TxnBuilderTypes.AccountAddress.fromHex(scorerAddress))]));
            const txnRequest = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, txnRequest);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        }
        catch (error) {
            throw new Error(`Failed to authorize scorer: ${error}`);
        }
    }
    /**
     * Get proposal details
     */
    async getProposal(proposalId) {
        try {
            const result = await this.client.view({
                function: `${this.config.moduleAddress}::ant_scoring::get_proposal`,
                arguments: [proposalId.toString()],
                type_arguments: []
            });
            return this.parseProposal(result[0]);
        }
        catch (error) {
            throw new Error(`Failed to get proposal: ${error}`);
        }
    }
    /**
     * Get all active proposals
     */
    async getActiveProposals() {
        try {
            const result = await this.client.view({
                function: `${this.config.moduleAddress}::ant_scoring::get_active_proposals`,
                arguments: [],
                type_arguments: []
            });
            return result[0].map(id => parseInt(id));
        }
        catch (error) {
            throw new Error(`Failed to get active proposals: ${error}`);
        }
    }
    /**
     * Get all passing proposals (80%+ score)
     */
    async getPassingProposals() {
        try {
            const result = await this.client.view({
                function: `${this.config.moduleAddress}::ant_scoring::get_passing_proposals`,
                arguments: [],
                type_arguments: []
            });
            return result[0].map(id => parseInt(id));
        }
        catch (error) {
            throw new Error(`Failed to get passing proposals: ${error}`);
        }
    }
    /**
     * Check if an address is an authorized scorer
     */
    async isAuthorizedScorer(scorerAddress) {
        try {
            const result = await this.client.view({
                function: `${this.config.moduleAddress}::ant_scoring::is_authorized_scorer`,
                arguments: [scorerAddress],
                type_arguments: []
            });
            return result[0];
        }
        catch (error) {
            throw new Error(`Failed to check scorer authorization: ${error}`);
        }
    }
    /**
     * Get total proposal count
     */
    async getProposalCount() {
        try {
            const result = await this.client.view({
                function: `${this.config.moduleAddress}::ant_scoring::get_proposal_count`,
                arguments: [],
                type_arguments: []
            });
            return parseInt(result[0]);
        }
        catch (error) {
            throw new Error(`Failed to get proposal count: ${error}`);
        }
    }
    /**
     * Calculate a theoretical final score without submitting
     */
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
    /**
     * Helper methods
     */
    async getLatestProposalId() {
        return await this.getProposalCount();
    }
    validateScores(scores) {
        const allScores = [
            ...Object.values(scores.scientific_merit),
            ...Object.values(scores.feasibility),
            ...Object.values(scores.community_alignment),
            ...Object.values(scores.resource_efficiency),
            ...Object.values(scores.open_science)
        ];
        for (const score of allScores) {
            if (score < 0 || score > 100 || !Number.isInteger(score)) {
                throw new Error(`All scores must be integers between 0 and 100. Invalid score: ${score}`);
            }
        }
    }
    createScientificMeritStruct(scores) {
        return TxnBuilderTypes.TransactionArgument.new_move_struct(TxnBuilderTypes.StructTag.fromString(`${this.config.moduleAddress}::ant_scoring::ScientificMeritScores`), [
            TxnBuilderTypes.TransactionArgument.new_u8(scores.novelty),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.biological_plausibility),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.prior_evidence)
        ]);
    }
    createFeasibilityStruct(scores) {
        return TxnBuilderTypes.TransactionArgument.new_move_struct(TxnBuilderTypes.StructTag.fromString(`${this.config.moduleAddress}::ant_scoring::FeasibilityScores`), [
            TxnBuilderTypes.TransactionArgument.new_u8(scores.technical_viability),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.data_quality),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.clarity_of_protocol)
        ]);
    }
    createCommunityAlignmentStruct(scores) {
        return TxnBuilderTypes.TransactionArgument.new_move_struct(TxnBuilderTypes.StructTag.fromString(`${this.config.moduleAddress}::ant_scoring::CommunityAlignmentScores`), [
            TxnBuilderTypes.TransactionArgument.new_u8(scores.mission_fit),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.dao_engagement)
        ]);
    }
    createResourceEfficiencyStruct(scores) {
        return TxnBuilderTypes.TransactionArgument.new_move_struct(TxnBuilderTypes.StructTag.fromString(`${this.config.moduleAddress}::ant_scoring::ResourceEfficiencyScores`), [
            TxnBuilderTypes.TransactionArgument.new_u8(scores.cost_effectiveness),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.agentic_resource_use)
        ]);
    }
    createOpenScienceStruct(scores) {
        return TxnBuilderTypes.TransactionArgument.new_move_struct(TxnBuilderTypes.StructTag.fromString(`${this.config.moduleAddress}::ant_scoring::OpenScienceScores`), [
            TxnBuilderTypes.TransactionArgument.new_u8(scores.data_protocol_sharing),
            TxnBuilderTypes.TransactionArgument.new_u8(scores.collaborative_potential)
        ]);
    }
    parseProposal(rawData) {
        // Parse the raw Move struct data into TypeScript interface
        // This would need to be adapted based on the actual response format
        return {
            id: parseInt(rawData.id),
            submitter: rawData.submitter,
            title: rawData.title,
            description: rawData.description,
            ipfs_hash: rawData.ipfs_hash,
            scores: this.parseProposalScore(rawData.scores),
            scorers: rawData.scorers || [],
            is_active: rawData.is_active,
            submission_time: parseInt(rawData.submission_time)
        };
    }
    parseProposalScore(rawScore) {
        return {
            scientific_merit: {
                novelty: rawScore.scientific_merit.novelty,
                biological_plausibility: rawScore.scientific_merit.biological_plausibility,
                prior_evidence: rawScore.scientific_merit.prior_evidence
            },
            feasibility: {
                technical_viability: rawScore.feasibility.technical_viability,
                data_quality: rawScore.feasibility.data_quality,
                clarity_of_protocol: rawScore.feasibility.clarity_of_protocol
            },
            community_alignment: {
                mission_fit: rawScore.community_alignment.mission_fit,
                dao_engagement: rawScore.community_alignment.dao_engagement
            },
            resource_efficiency: {
                cost_effectiveness: rawScore.resource_efficiency.cost_effectiveness,
                agentic_resource_use: rawScore.resource_efficiency.agentic_resource_use
            },
            open_science: {
                data_protocol_sharing: rawScore.open_science.data_protocol_sharing,
                collaborative_potential: rawScore.open_science.collaborative_potential
            },
            final_score: rawScore.final_score,
            is_passing: rawScore.is_passing,
            is_fulfilled: rawScore.is_fulfilled,
            timestamp: parseInt(rawScore.timestamp),
            scorer_count: parseInt(rawScore.scorer_count)
        };
    }
}
exports.ANTScoringHelper = ANTScoringHelper;
/**
 * Helper function to create example scores for testing
 */
function createExampleScores() {
    return {
        scientific_merit: {
            novelty: 85,
            biological_plausibility: 90,
            prior_evidence: 80
        },
        feasibility: {
            technical_viability: 85,
            data_quality: 90,
            clarity_of_protocol: 95
        },
        community_alignment: {
            mission_fit: 90,
            dao_engagement: 85
        },
        resource_efficiency: {
            cost_effectiveness: 80,
            agentic_resource_use: 85
        },
        open_science: {
            data_protocol_sharing: 95,
            collaborative_potential: 90
        }
    };
}
/**
 * Helper function to create minimum passing scores (80%+ target)
 */
function createPassingScores() {
    return {
        scientific_merit: {
            novelty: 80,
            biological_plausibility: 85,
            prior_evidence: 80
        },
        feasibility: {
            technical_viability: 85,
            data_quality: 80,
            clarity_of_protocol: 85
        },
        community_alignment: {
            mission_fit: 85,
            dao_engagement: 80
        },
        resource_efficiency: {
            cost_effectiveness: 75,
            agentic_resource_use: 80
        },
        open_science: {
            data_protocol_sharing: 80,
            collaborative_potential: 85
        }
    };
}
/**
 * Create a new Aptos account for testing
 */
function createTestAccount() {
    return new AptosAccount();
}
/**
 * Load deployment info from file
 */
function loadDeploymentInfo(filePath = "./deployment-info.json") {
    try {
        const fs = require('fs');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        throw new Error(`Failed to load deployment info: ${error}`);
    }
}
