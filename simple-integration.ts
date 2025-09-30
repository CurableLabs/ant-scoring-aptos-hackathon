#!/usr/bin/env ts-node

/**
 * Simplified ANT Integration System - Working Demo
 * This version focuses on getting the system running quickly without complex blockchain interactions
 */

import express from 'express';
import cors from 'cors';
import { WebSocket, WebSocketServer } from 'ws';
import * as path from 'path';

// Simple types for our demo
interface Proposal {
    id: number;
    title: string;
    description: string;
    submitter: string;
    score: number;
    scorerCount: number;
    isPassing: boolean;
    isFulfilled: boolean;
    timestamp: number;
}

interface ScoreInput {
    scientific_merit: { novelty: number; biological_plausibility: number; prior_evidence: number };
    feasibility: { technical_viability: number; data_quality: number; clarity_of_protocol: number };
    community_alignment: { mission_fit: number; dao_engagement: number };
    resource_efficiency: { cost_effectiveness: number; agentic_resource_use: number };
    open_science: { data_protocol_sharing: number; collaborative_potential: number };
}

class SimpleANTSystem {
    private app: express.Application;
    private server: any;
    private wss: WebSocketServer | undefined;
    private proposals: Map<number, Proposal> = new Map();
    private nextId: number = 1;
    private port: number = 3001;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.loadDemoData();
    }

    private setupMiddleware(): void {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Serve static files
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    private setupRoutes(): void {
        const router = express.Router();

        // Proposal Routes
        router.get('/proposals', this.getAllProposals.bind(this));
        router.get('/proposals/:id', this.getProposal.bind(this));
        router.post('/proposals', this.createProposal.bind(this));
        router.post('/proposals/:id/score', this.scoreProposal.bind(this));
        router.post('/proposals/:id/fulfill', this.fulfillProposal.bind(this));

        // Analytics Routes
        router.get('/analytics/dashboard', this.getDashboardData.bind(this));

        // System Routes
        router.get('/health', this.healthCheck.bind(this));
        router.get('/config', this.getSystemConfig.bind(this));

        this.app.use('/api', router);
    }

    private setupWebSocket(): void {
        this.wss = new WebSocketServer({ noServer: true });
        
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('🔌 New WebSocket connection established');
            
            // Send initial data
            this.sendToClient(ws, {
                type: 'connection',
                data: { status: 'connected', timestamp: Date.now() }
            });

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    console.error('Invalid WebSocket message:', error);
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }

    // API Endpoints
    private getAllProposals(req: express.Request, res: express.Response): void {
        try {
            const proposals = Array.from(this.proposals.values());
            
            const result = {
                total: proposals.length,
                active: proposals.filter(p => !p.isFulfilled).length,
                passing: proposals.filter(p => p.isPassing).length,
                proposals: proposals
            };

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private getProposal(req: express.Request, res: express.Response): void {
        try {
            const id = parseInt(req.params.id);
            const proposal = this.proposals.get(id);
            
            if (!proposal) {
                res.status(404).json({ error: 'Proposal not found' });
                return;
            }

            res.json(proposal);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private createProposal(req: express.Request, res: express.Response): void {
        try {
            const { title, description, submitter } = req.body;

            if (!title || !description || !submitter) {
                res.status(400).json({ error: 'Title, description, and submitter are required' });
                return;
            }

            const proposal: Proposal = {
                id: this.nextId++,
                title,
                description,
                submitter,
                score: 0,
                scorerCount: 0,
                isPassing: false,
                isFulfilled: false,
                timestamp: Date.now()
            };

            this.proposals.set(proposal.id, proposal);

            // Broadcast to WebSocket clients
            this.broadcastToClients({
                type: 'proposal_created',
                data: { proposalId: proposal.id, title }
            });

            res.status(201).json({
                success: true,
                proposalId: proposal.id,
                proposal
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private scoreProposal(req: express.Request, res: express.Response): void {
        try {
            const proposalId = parseInt(req.params.id);
            const { scores } = req.body;

            const proposal = this.proposals.get(proposalId);
            if (!proposal) {
                res.status(404).json({ error: 'Proposal not found' });
                return;
            }

            if (!this.isValidScoreInput(scores)) {
                res.status(400).json({ error: 'Invalid score format' });
                return;
            }

            // Calculate final score
            const finalScore = this.calculateFinalScore(scores);

            // Update proposal
            const currentTotal = proposal.score * proposal.scorerCount;
            const newScorerCount = proposal.scorerCount + 1;
            const newAverage = Math.round((currentTotal + finalScore) / newScorerCount);

            proposal.score = newAverage;
            proposal.scorerCount = newScorerCount;
            proposal.isPassing = newAverage >= 80;

            // Broadcast score update
            this.broadcastToClients({
                type: 'proposal_scored',
                data: {
                    proposalId,
                    newScore: proposal.score,
                    isPassing: proposal.isPassing,
                    scorerCount: proposal.scorerCount
                }
            });

            res.json({
                success: true,
                finalScore: proposal.score,
                isPassing: proposal.isPassing
            });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private fulfillProposal(req: express.Request, res: express.Response): void {
        try {
            const proposalId = parseInt(req.params.id);
            const proposal = this.proposals.get(proposalId);

            if (!proposal) {
                res.status(404).json({ error: 'Proposal not found' });
                return;
            }

            if (!proposal.isPassing) {
                res.status(400).json({ error: 'Proposal is not passing the 80% threshold' });
                return;
            }

            if (proposal.isFulfilled) {
                res.status(400).json({ error: 'Proposal is already fulfilled' });
                return;
            }

            proposal.isFulfilled = true;

            // Broadcast fulfillment
            this.broadcastToClients({
                type: 'proposal_fulfilled',
                data: { proposalId, finalScore: proposal.score }
            });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private getDashboardData(req: express.Request, res: express.Response): void {
        try {
            const proposals = Array.from(this.proposals.values());
            const passingCount = proposals.filter(p => p.isPassing).length;
            const activeCount = proposals.filter(p => !p.isFulfilled).length;

            const dashboardData = {
                metrics: {
                    totalProposals: proposals.length,
                    activeProposals: activeCount,
                    passingProposals: passingCount,
                    successRate: proposals.length > 0 ? Math.round((passingCount / proposals.length) * 100) : 0
                },
                recentActivity: proposals.slice(-5).reverse(),
                systemStatus: 'operational'
            };

            res.json(dashboardData);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    private healthCheck(req: express.Request, res: express.Response): void {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            proposals: this.proposals.size
        });
    }

    private getSystemConfig(req: express.Request, res: express.Response): void {
        res.json({
            passingThreshold: 80,
            maxScore: 100,
            scoringWeights: {
                scientific_merit: 40,
                feasibility: 25,
                community_alignment: 20,
                resource_efficiency: 10,
                open_science: 5
            }
        });
    }

    // WebSocket Handlers
    private handleWebSocketMessage(ws: WebSocket, message: any): void {
        switch (message.type) {
            case 'ping':
                this.sendToClient(ws, { type: 'pong', data: { timestamp: Date.now() } });
                break;
            default:
                console.warn('Unknown WebSocket message type:', message.type);
        }
    }

    private sendToClient(ws: WebSocket, data: any): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    public broadcastToClients(data: any): void {
        if (this.wss) {
            this.wss.clients.forEach(client => {
                this.sendToClient(client, data);
            });
        }
    }

    // Helper Methods
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

    private isValidScoreInput(scores: any): scores is ScoreInput {
        return scores && 
               scores.scientific_merit && 
               scores.feasibility && 
               scores.community_alignment && 
               scores.resource_efficiency && 
               scores.open_science;
    }

    private loadDemoData(): void {
        // Create sample proposals for demo
        const demoProposals = [
            {
                title: "CRISPR-Cas9 Gene Therapy for Alzheimer's Disease",
                description: "Novel approach using CRISPR-Cas9 to edit APOE4 variants in brain cells. Our preliminary studies in transgenic mice show a 40% reduction in amyloid plaques and improved cognitive function in behavioral tests.",
                submitter: "Dr. Alice Chen"
            },
            {
                title: "AI-Powered Drug Discovery for Rare Cancers",
                description: "Machine learning platform combining genomics data with chemical libraries to identify novel therapeutic targets for pediatric sarcomas. Our algorithm has successfully identified 12 potential drug candidates.",
                submitter: "Dr. Bob Rodriguez"
            },
            {
                title: "Microbiome Engineering for Diabetes Prevention",
                description: "Engineered probiotic consortium designed to regulate glucose metabolism through targeted microbiome modification. Initial results in diabetic mouse models show 30% improvement in glucose tolerance.",
                submitter: "Dr. Carol Kim"
            }
        ];

        demoProposals.forEach(demo => {
            const proposal: Proposal = {
                id: this.nextId++,
                title: demo.title,
                description: demo.description,
                submitter: demo.submitter,
                score: 0,
                scorerCount: 0,
                isPassing: false,
                isFulfilled: false,
                timestamp: Date.now() - Math.random() * 86400000 // Random time in last 24h
            };

            this.proposals.set(proposal.id, proposal);
        });

        console.log(`📋 Loaded ${demoProposals.length} demo proposals`);
    }

    // Server Management
    public start(): Promise<void> {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`🚀 ANT System running on port ${this.port}`);
                console.log(`📊 API: http://localhost:${this.port}/api`);
                console.log(`🔌 WebSocket: ws://localhost:${this.port}`);
                console.log(`📋 Proposals loaded: ${this.proposals.size}`);
                resolve();
            });

            // Handle WebSocket upgrade
            this.server.on('upgrade', (request: any, socket: any, head: any) => {
                if (this.wss) {
                    this.wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                        this.wss!.emit('connection', ws, request);
                    });
                }
            });
        });
    }

    public stop(): void {
        if (this.server) {
            this.server.close();
            if (this.wss) {
                this.wss.close();
            }
        }
    }
}

// Main execution
async function main() {
    console.log('🎯 Starting Simple ANT Integration System...');

    const system = new SimpleANTSystem();

    try {
        await system.start();

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down...');
            system.stop();
            process.exit(0);
        });

        console.log('\n✅ System ready! Try these:');
        console.log('   🌐 Web Interface: http://localhost:3001');
        console.log('   📊 API Health: http://localhost:3001/api/health');
        console.log('   📋 Proposals: http://localhost:3001/api/proposals');
        console.log('   📈 Dashboard: http://localhost:3001/api/analytics/dashboard');
        console.log('\n🎮 Ready for live demo!');

    } catch (error) {
        console.error('❌ Failed to start system:', error);
        process.exit(1);
    }
}

// Export for use in other modules
export default SimpleANTSystem;

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
