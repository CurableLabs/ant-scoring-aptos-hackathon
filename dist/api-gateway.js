"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIGateway = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const event_processor_1 = __importDefault(require("./event-processor"));
/**
 * API Gateway - Bridge between ANT Smart Contract and Frontend
 * Provides REST endpoints and real-time WebSocket connections
 */
class APIGateway {
    constructor(antHelper, port = 3001) {
        this.app = (0, express_1.default)();
        this.antHelper = antHelper;
        this.port = port;
        this.eventProcessor = new event_processor_1.default(antHelper);
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    setupRoutes() {
        const router = express_1.default.Router();
        // Proposal Routes
        router.get('/proposals', this.getAllProposals.bind(this));
        router.get('/proposals/:id', this.getProposal.bind(this));
        router.post('/proposals', this.createProposal.bind(this));
        router.post('/proposals/:id/score', this.scoreProposal.bind(this));
        router.post('/proposals/:id/fulfill', this.fulfillProposal.bind(this));
        // Analytics Routes
        router.get('/analytics/dashboard', this.getDashboardData.bind(this));
        router.get('/analytics/proposals/stats', this.getProposalStats.bind(this));
        router.get('/analytics/scorers/performance', this.getScorerPerformance.bind(this));
        // Scorer Routes
        router.get('/scorers/authorized', this.getAuthorizedScorers.bind(this));
        router.post('/scorers/authorize', this.authorizeScorer.bind(this));
        // System Routes
        router.get('/health', this.healthCheck.bind(this));
        router.get('/config', this.getSystemConfig.bind(this));
        this.app.use('/api', router);
    }
    setupWebSocket() {
        this.wss = new ws_1.WebSocketServer({ noServer: true });
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket connection established');
            // Send initial data
            this.sendToClient(ws, {
                type: 'connection',
                data: { status: 'connected', timestamp: Date.now() }
            });
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(ws, data);
                }
                catch (error) {
                    console.error('Invalid WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }
    // REST API Endpoints
    async getAllProposals(req, res) {
        try {
            const activeIds = await this.antHelper.getActiveProposals();
            const proposals = await Promise.all(activeIds.map(id => this.antHelper.getProposal(id)));
            const result = {
                total: proposals.length,
                active: proposals.filter(p => p.is_active).length,
                passing: proposals.filter(p => p.scores.is_passing).length,
                proposals: proposals
            };
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getProposal(req, res) {
        try {
            const id = parseInt(req.params.id);
            const proposal = await this.antHelper.getProposal(id);
            // Add enriched data
            const enrichedProposal = {
                ...proposal,
                funding_amount: this.calculateFundingAmount(proposal.scores.final_score),
                scoring_breakdown: this.getDetailedScoring(proposal),
                status: this.getProposalStatus(proposal)
            };
            res.json(enrichedProposal);
        }
        catch (error) {
            res.status(404).json({ error: 'Proposal not found' });
        }
    }
    async createProposal(req, res) {
        try {
            const { title, description, ipfs_hash, account_private_key } = req.body;
            if (!title || !description) {
                res.status(400).json({ error: 'Title and description are required' });
                return;
            }
            // Create account from private key or generate new one
            // TODO: Implement secure account management
            const result = await this.antHelper.submitProposal(title, description, ipfs_hash || '');
            // Broadcast to WebSocket clients
            this.broadcastToClients({
                type: 'proposal_created',
                data: { proposalId: result.proposalId, title }
            });
            res.status(201).json({
                success: true,
                proposalId: result.proposalId,
                txHash: result.txHash
            });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async scoreProposal(req, res) {
        try {
            const proposalId = parseInt(req.params.id);
            const { scores, scorer_private_key } = req.body;
            if (!this.isValidScoreInput(scores)) {
                res.status(400).json({ error: 'Invalid score format' });
                return;
            }
            // TODO: Implement secure scorer authentication
            const txHash = await this.antHelper.scoreProposal(proposalId, scores);
            // Get updated proposal data
            const updatedProposal = await this.antHelper.getProposal(proposalId);
            // Broadcast score update
            this.broadcastToClients({
                type: 'proposal_scored',
                data: {
                    proposalId,
                    newScore: updatedProposal.scores.final_score,
                    isPassing: updatedProposal.scores.is_passing
                }
            });
            res.json({
                success: true,
                txHash,
                finalScore: updatedProposal.scores.final_score,
                isPassing: updatedProposal.scores.is_passing
            });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async fulfillProposal(req, res) {
        try {
            const proposalId = parseInt(req.params.id);
            const txHash = await this.antHelper.fulfillProposal(proposalId);
            // Broadcast fulfillment
            this.broadcastToClients({
                type: 'proposal_fulfilled',
                data: { proposalId }
            });
            res.json({ success: true, txHash });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getDashboardData(req, res) {
        try {
            const activeIds = await this.antHelper.getActiveProposals();
            const passingIds = await this.antHelper.getPassingProposals();
            const totalCount = await this.antHelper.getProposalCount();
            const dashboardData = {
                metrics: {
                    totalProposals: totalCount,
                    activeProposals: activeIds.length,
                    passingProposals: passingIds.length,
                    successRate: totalCount > 0 ? Math.round((passingIds.length / totalCount) * 100) : 0
                },
                recentActivity: await this.getRecentActivity(),
                scoringTrends: await this.getScoringTrends(),
                topCategories: await this.getTopCategories()
            };
            res.json(dashboardData);
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getProposalStats(req, res) {
        try {
            // TODO: Implement detailed proposal statistics
            res.json({
                scoreDistribution: {},
                categoryBreakdown: {},
                timeBasedTrends: {}
            });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getScorerPerformance(req, res) {
        try {
            // TODO: Implement scorer performance analytics
            res.json({
                scorerRankings: [],
                averageScores: {},
                consistency: {}
            });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getAuthorizedScorers(req, res) {
        try {
            // TODO: Implement authorized scorer listing
            res.json({
                scorers: [],
                count: 0
            });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async authorizeScorer(req, res) {
        try {
            const { scorerAddress } = req.body;
            const txHash = await this.antHelper.authorizeScorer(scorerAddress);
            res.json({ success: true, txHash });
        }
        catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    healthCheck(req, res) {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        });
    }
    getSystemConfig(req, res) {
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
    handleWebSocketMessage(ws, message) {
        switch (message.type) {
            case 'subscribe':
                // Handle subscriptions to specific proposal updates
                break;
            case 'ping':
                this.sendToClient(ws, { type: 'pong', data: { timestamp: Date.now() } });
                break;
            default:
                console.warn('Unknown WebSocket message type:', message.type);
        }
    }
    sendToClient(ws, data) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }
    broadcastToClients(data) {
        if (this.wss) {
            this.wss.clients.forEach(client => {
                this.sendToClient(client, data);
            });
        }
    }
    // Helper Methods
    calculateFundingAmount(score) {
        const baseFunding = 10000; // APT
        if (score >= 95)
            return baseFunding * 2.0;
        if (score >= 90)
            return baseFunding * 1.5;
        if (score >= 85)
            return baseFunding * 1.2;
        return baseFunding;
    }
    getDetailedScoring(proposal) {
        const scores = proposal.scores;
        return {
            categories: {
                scientific_merit: {
                    weight: 40,
                    average: Math.round((scores.scientific_merit.novelty + scores.scientific_merit.biological_plausibility + scores.scientific_merit.prior_evidence) / 3),
                    components: scores.scientific_merit
                },
                feasibility: {
                    weight: 25,
                    average: Math.round((scores.feasibility.technical_viability + scores.feasibility.data_quality + scores.feasibility.clarity_of_protocol) / 3),
                    components: scores.feasibility
                },
                community_alignment: {
                    weight: 20,
                    average: Math.round((scores.community_alignment.mission_fit + scores.community_alignment.dao_engagement) / 2),
                    components: scores.community_alignment
                },
                resource_efficiency: {
                    weight: 10,
                    average: Math.round((scores.resource_efficiency.cost_effectiveness + scores.resource_efficiency.agentic_resource_use) / 2),
                    components: scores.resource_efficiency
                },
                open_science: {
                    weight: 5,
                    average: Math.round((scores.open_science.data_protocol_sharing + scores.open_science.collaborative_potential) / 2),
                    components: scores.open_science
                }
            }
        };
    }
    getProposalStatus(proposal) {
        if (proposal.scores.is_fulfilled)
            return 'fulfilled';
        if (proposal.scores.is_passing)
            return 'passing';
        if (proposal.scores.scorer_count > 0)
            return 'scored';
        if (proposal.is_active)
            return 'active';
        return 'inactive';
    }
    isValidScoreInput(scores) {
        // TODO: Implement proper score validation
        return scores &&
            scores.scientific_merit &&
            scores.feasibility &&
            scores.community_alignment &&
            scores.resource_efficiency &&
            scores.open_science;
    }
    async getRecentActivity() {
        // TODO: Implement recent activity tracking
        return [];
    }
    async getScoringTrends() {
        // TODO: Implement scoring trend analysis
        return {};
    }
    async getTopCategories() {
        // TODO: Implement category analysis
        return [];
    }
    // Server Management
    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`🚀 ANT API Gateway running on port ${this.port}`);
                console.log(`📊 WebSocket server ready for real-time updates`);
                resolve();
            });
            // Handle WebSocket upgrade
            this.server.on('upgrade', (request, socket, head) => {
                this.wss.handleUpgrade(request, socket, head, (ws) => {
                    this.wss.emit('connection', ws, request);
                });
            });
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            this.wss.close();
        }
    }
}
exports.APIGateway = APIGateway;
// Export for use in main application
exports.default = APIGateway;
