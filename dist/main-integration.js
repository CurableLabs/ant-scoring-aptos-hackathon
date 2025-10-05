#!/usr/bin/env ts-node
"use strict";
/**
 * Main Integration File - Connects ANT Scoring System Components
 * This file demonstrates how to wire together all the parts for the hackathon project
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANTSystemOrchestrator = void 0;
const antScoringUtils_1 = require("./antScoringUtils");
const api_gateway_1 = require("./api-gateway");
const event_processor_1 = __importDefault(require("./event-processor"));
// Configuration for different environments
const CONFIG = {
    development: {
        moduleAddress: "0x1", // Using account 0x1 for initial testing
        nodeUrl: "https://fullnode.devnet.aptoslabs.com/v1",
        network: "devnet",
        apiPort: 3001
    },
    production: {
        moduleAddress: "0xPROD_ADDRESS", // Replace with mainnet address
        nodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1",
        network: "mainnet",
        apiPort: 3000
    }
};
/**
 * Main Integration Class - Orchestrates the entire ANT system
 */
class ANTSystemOrchestrator {
    constructor(environment = 'development') {
        this.config = CONFIG[environment];
        // Initialize core components
        const adminAccount = (0, antScoringUtils_1.createTestAccount)();
        this.antHelper = new antScoringUtils_1.ANTScoringHelper(this.config, adminAccount);
        this.eventProcessor = new event_processor_1.default(this.antHelper);
        this.apiGateway = new api_gateway_1.APIGateway(this.antHelper, this.config.apiPort);
        this.setupIntegrations();
    }
    /**
     * Wire up all the integrations between components
     */
    setupIntegrations() {
        console.log('🔗 Setting up ANT system integrations...');
        // Connect Event Processor to API Gateway for real-time updates
        this.eventProcessor.on('notification', (notification) => {
            // Forward notifications to WebSocket clients via API Gateway
            this.apiGateway.broadcastToClients(notification);
        });
        // Connect Event Processor analytics to API Gateway
        this.eventProcessor.on('analyticsUpdate', (data) => {
            console.log('📊 Analytics update:', data.eventType);
            // Store or forward analytics data as needed
        });
        // Handle auto-fulfillment requests
        this.eventProcessor.on('autoFulfillmentRequired', async (data) => {
            console.log(`🤖 Auto-fulfillment required for proposal ${data.proposalId}`);
            try {
                // In production, implement automatic fulfillment logic here
                await this.handleAutoFulfillment(data);
            }
            catch (error) {
                console.error('Auto-fulfillment failed:', error);
            }
        });
        console.log('✅ ANT system integrations configured');
    }
    /**
     * Start the entire ANT system
     */
    async start() {
        console.log('🚀 Starting ANT Scoring System...');
        try {
            // Start event processing
            await this.eventProcessor.start();
            console.log('✅ Event processor started');
            // Start API gateway
            await this.apiGateway.start();
            console.log('✅ API gateway started');
            console.log('\n🎉 ANT System fully operational!');
            console.log(`📡 API available at: http://localhost:${this.config.apiPort}/api`);
            console.log(`🔌 WebSocket available at: ws://localhost:${this.config.apiPort}`);
            console.log(`⛓️  Connected to: ${this.config.nodeUrl}`);
            console.log(`📋 Module address: ${this.config.moduleAddress}`);
        }
        catch (error) {
            console.error('❌ Failed to start ANT system:', error);
            throw error;
        }
    }
    /**
     * Stop the entire ANT system
     */
    async stop() {
        console.log('⏹️  Stopping ANT Scoring System...');
        this.eventProcessor.stop();
        this.apiGateway.stop();
        console.log('✅ ANT System stopped');
    }
    /**
     * Get system status and health information
     */
    getSystemStatus() {
        return {
            timestamp: new Date().toISOString(),
            environment: this.config.network,
            components: {
                eventProcessor: {
                    ...this.eventProcessor.getStats(),
                    status: 'operational'
                },
                apiGateway: {
                    status: 'operational',
                    port: this.config.apiPort
                },
                blockchain: {
                    network: this.config.network,
                    nodeUrl: this.config.nodeUrl,
                    moduleAddress: this.config.moduleAddress
                }
            }
        };
    }
    /**
     * Handle automatic fulfillment of qualifying proposals
     */
    async handleAutoFulfillment(data) {
        try {
            console.log(`💰 Processing auto-fulfillment for proposal ${data.proposalId}`);
            // Verify proposal still qualifies
            const proposal = await this.antHelper.getProposal(data.proposalId);
            if (proposal.scores.is_passing && !proposal.scores.is_fulfilled) {
                // Execute fulfillment
                const txHash = await this.antHelper.fulfillProposal(data.proposalId);
                console.log(`✅ Auto-fulfilled proposal ${data.proposalId}, tx: ${txHash}`);
                // Send notification
                this.eventProcessor.emit('notification', {
                    type: 'auto_fulfillment_completed',
                    data: {
                        proposalId: data.proposalId,
                        txHash,
                        timestamp: Date.now()
                    }
                });
            }
        }
        catch (error) {
            console.error(`Failed to auto-fulfill proposal ${data.proposalId}:`, error);
        }
    }
    /**
     * Initialize demo data for hackathon presentation
     */
    async initializeDemoData() {
        console.log('🎭 Initializing demo data...');
        try {
            // Create sample proposals
            const sampleProposals = [
                {
                    title: "CRISPR-Cas9 Gene Therapy for Alzheimer's Disease",
                    description: "Novel approach using CRISPR-Cas9 to edit APOE4 variants in brain cells. Our preliminary studies in transgenic mice show a 40% reduction in amyloid plaques and improved cognitive function in behavioral tests.",
                    ipfs: "QmAlzheimer12345"
                },
                {
                    title: "AI-Powered Drug Discovery for Rare Cancers",
                    description: "Machine learning platform combining genomics data with chemical libraries to identify novel therapeutic targets for pediatric sarcomas. Our algorithm has identified 12 potential drug candidates.",
                    ipfs: "QmCancerAI67890"
                }
            ];
            for (const proposal of sampleProposals) {
                try {
                    const result = await this.antHelper.submitProposal(proposal.title, proposal.description, proposal.ipfs);
                    console.log(`✅ Created demo proposal: ${proposal.title} (ID: ${result.proposalId})`);
                }
                catch (error) {
                    console.warn(`Failed to create demo proposal: ${proposal.title}`);
                }
            }
            console.log('🎭 Demo data initialized');
        }
        catch (error) {
            console.error('Failed to initialize demo data:', error);
        }
    }
}
exports.ANTSystemOrchestrator = ANTSystemOrchestrator;
/**
 * Main execution function
 */
async function main() {
    const environment = process.argv[2] || 'development';
    console.log(`🏁 Starting ANT Scoring System in ${environment} mode...`);
    const orchestrator = new ANTSystemOrchestrator(environment);
    try {
        // Start the system
        await orchestrator.start();
        // Initialize demo data if requested
        if (process.argv.includes('--demo')) {
            await orchestrator.initializeDemoData();
        }
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Received shutdown signal...');
            await orchestrator.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Received termination signal...');
            await orchestrator.stop();
            process.exit(0);
        });
        // Keep the process running
        console.log('\n📡 ANT System is running. Press Ctrl+C to stop.');
    }
    catch (error) {
        console.error('❌ Failed to start ANT system:', error);
        process.exit(1);
    }
}
// Export for use in other modules
exports.default = ANTSystemOrchestrator;
// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
