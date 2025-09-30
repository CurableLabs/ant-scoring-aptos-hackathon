import { ANTScoringHelper } from './antScoringUtils';
import { EventEmitter } from 'events';

/**
 * Event Processing System - Listens to blockchain events and processes them
 * Handles real-time updates, notifications, and data aggregation
 */
export class EventProcessor extends EventEmitter {
    private antHelper: ANTScoringHelper;
    private isProcessing: boolean = false;
    private eventQueue: any[] = [];
    private lastProcessedBlock: number = 0;
    private processingInterval: NodeJS.Timeout | null = null;

    constructor(antHelper: ANTScoringHelper) {
        super();
        this.antHelper = antHelper;
        this.setupEventHandlers();
    }

    /**
     * Start processing blockchain events
     */
    public async start(): Promise<void> {
        if (this.isProcessing) {
            console.warn('Event processor is already running');
            return;
        }

        console.log('🎧 Starting ANT event processor...');
        this.isProcessing = true;

        // Start polling for events (in production, use WebSocket subscriptions)
        this.processingInterval = setInterval(async () => {
            try {
                await this.pollForEvents();
            } catch (error) {
                console.error('Error processing events:', error);
                this.emit('error', error);
            }
        }, 5000); // Poll every 5 seconds

        this.emit('started');
    }

    /**
     * Stop processing events
     */
    public stop(): void {
        if (!this.isProcessing) {
            return;
        }

        console.log('⏹️  Stopping ANT event processor...');
        this.isProcessing = false;

        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }

        this.emit('stopped');
    }

    /**
     * Setup event handlers for different event types
     */
    private setupEventHandlers(): void {
        this.on('ProposalSubmitted', this.handleProposalSubmitted.bind(this));
        this.on('ProposalScored', this.handleProposalScored.bind(this));
        this.on('ProposalFulfilled', this.handleProposalFulfilled.bind(this));
        this.on('ScorerAuthorized', this.handleScorerAuthorized.bind(this));
        this.on('ScorerRevoked', this.handleScorerRevoked.bind(this));
    }

    /**
     * Poll blockchain for new events
     */
    private async pollForEvents(): Promise<void> {
        try {
            // In a real implementation, you would query the Aptos blockchain
            // for events emitted by your smart contract
            
            // For now, simulate event detection
            // TODO: Replace with actual Aptos event querying
            
            const mockEvents = await this.fetchEventsFromBlockchain();
            
            for (const event of mockEvents) {
                await this.processEvent(event);
            }
        } catch (error) {
            console.error('Failed to poll for events:', error);
        }
    }

    /**
     * Mock function to simulate fetching events from blockchain
     * In production, replace with actual Aptos event queries
     */
    private async fetchEventsFromBlockchain(): Promise<any[]> {
        // TODO: Implement actual blockchain event fetching
        // Example:
        // const events = await this.antHelper.client.getEventsByEventHandle(
        //     accountAddress, 
        //     eventHandleStruct, 
        //     fieldName, 
        //     { start: this.lastProcessedBlock }
        // );
        
        return []; // Return empty for now
    }

    /**
     * Process a single event
     */
    private async processEvent(event: any): Promise<void> {
        const { type, data } = event;

        try {
            // Add to queue for batch processing
            this.eventQueue.push(event);

            // Emit specific event type
            this.emit(type, data);

            // Emit general event for subscribers
            this.emit('event', { type, data, timestamp: Date.now() });

        } catch (error) {
            console.error(`Error processing event ${type}:`, error);
            this.emit('eventError', { event, error });
        }
    }

    /**
     * Handle proposal submission events
     */
    private async handleProposalSubmitted(data: any): Promise<void> {
        console.log(`📝 New proposal submitted: ${data.title} (ID: ${data.proposal_id})`);

        try {
            // Get full proposal details
            const proposal = await this.antHelper.getProposal(data.proposal_id);

            // Trigger notifications
            await this.sendNotification('proposal_submitted', {
                proposalId: data.proposal_id,
                title: data.title,
                submitter: data.submitter,
                proposal
            });

            // Update analytics
            await this.updateAnalytics('proposal_submitted', proposal);

            // Notify authorized scorers
            await this.notifyScorers('new_proposal', proposal);

        } catch (error) {
            console.error('Error handling proposal submission:', error);
        }
    }

    /**
     * Handle proposal scoring events
     */
    private async handleProposalScored(data: any): Promise<void> {
        console.log(`🔬 Proposal scored: ID ${data.proposal_id}, Score: ${data.final_score}%, Passing: ${data.is_passing}`);

        try {
            // Get updated proposal
            const proposal = await this.antHelper.getProposal(data.proposal_id);

            // Check if this score pushed it over the threshold
            const justPassed = data.is_passing && proposal.scores.scorer_count === 1;

            if (justPassed) {
                console.log(`🎉 Proposal ${data.proposal_id} just reached passing threshold!`);
                
                // Trigger automatic fulfillment if conditions met
                await this.checkAutoFulfillment(proposal);
            }

            // Send real-time update
            await this.sendNotification('proposal_scored', {
                proposalId: data.proposal_id,
                finalScore: data.final_score,
                isPassing: data.is_passing,
                scorer: data.scorer,
                proposal
            });

            // Update analytics
            await this.updateAnalytics('proposal_scored', proposal);

        } catch (error) {
            console.error('Error handling proposal scoring:', error);
        }
    }

    /**
     * Handle proposal fulfillment events
     */
    private async handleProposalFulfilled(data: any): Promise<void> {
        console.log(`💰 Proposal fulfilled: ID ${data.proposal_id}, Score: ${data.final_score}%`);

        try {
            const proposal = await this.antHelper.getProposal(data.proposal_id);
            const fundingAmount = this.calculateFundingAmount(data.final_score);

            // Send fulfillment notification
            await this.sendNotification('proposal_fulfilled', {
                proposalId: data.proposal_id,
                finalScore: data.final_score,
                fundingAmount,
                fulfiller: data.fulfiller,
                proposal
            });

            // Update analytics
            await this.updateAnalytics('proposal_fulfilled', proposal);

            // Start milestone tracking
            await this.initiateMilestoneTracking(proposal);

        } catch (error) {
            console.error('Error handling proposal fulfillment:', error);
        }
    }

    /**
     * Handle scorer authorization events
     */
    private async handleScorerAuthorized(data: any): Promise<void> {
        console.log(`👨‍🔬 New scorer authorized: ${data.scorer}`);

        await this.sendNotification('scorer_authorized', {
            scorer: data.scorer,
            timestamp: Date.now()
        });
    }

    /**
     * Handle scorer revocation events
     */
    private async handleScorerRevoked(data: any): Promise<void> {
        console.log(`❌ Scorer revoked: ${data.scorer}`);

        await this.sendNotification('scorer_revoked', {
            scorer: data.scorer,
            timestamp: Date.now()
        });
    }

    /**
     * Check if a proposal should be automatically fulfilled
     */
    private async checkAutoFulfillment(proposal: any): Promise<void> {
        // Auto-fulfill if:
        // 1. Score >= 80%
        // 2. Has minimum number of scorers (e.g., 3)
        // 3. Not already fulfilled
        
        const minScorers = 3;
        
        if (proposal.scores.is_passing && 
            proposal.scores.scorer_count >= minScorers && 
            !proposal.scores.is_fulfilled) {
            
            console.log(`🤖 Auto-fulfilling proposal ${proposal.id}`);
            
            try {
                // In a real system, this would trigger an automated fulfillment
                // For now, just emit an event for manual processing
                this.emit('autoFulfillmentRequired', {
                    proposalId: proposal.id,
                    score: proposal.scores.final_score,
                    reason: 'Passed threshold with sufficient scorers'
                });
            } catch (error) {
                console.error('Auto-fulfillment failed:', error);
            }
        }
    }

    /**
     * Send notifications to connected clients/systems
     */
    private async sendNotification(type: string, data: any): Promise<void> {
        const notification = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            timestamp: Date.now()
        };

        // Emit to API Gateway WebSocket clients
        this.emit('notification', notification);

        // TODO: Add other notification channels:
        // - Email notifications
        // - Slack/Discord webhooks  
        // - Push notifications
        // - Database logging
    }

    /**
     * Update analytics data
     */
    private async updateAnalytics(eventType: string, proposal: any): Promise<void> {
        try {
            // TODO: Implement analytics data aggregation
            // Examples:
            // - Score distribution tracking
            // - Category performance analysis
            // - Scorer accuracy metrics
            // - Time-based trends
            
            const analyticsData = {
                eventType,
                proposalId: proposal.id,
                timestamp: Date.now(),
                scores: proposal.scores,
                metadata: {
                    category: this.extractCategory(proposal),
                    institution: this.extractInstitution(proposal),
                    fundingRequested: this.extractFunding(proposal)
                }
            };

            this.emit('analyticsUpdate', analyticsData);
            
        } catch (error) {
            console.error('Failed to update analytics:', error);
        }
    }

    /**
     * Notify authorized scorers about new proposals
     */
    private async notifyScorers(type: string, proposal: any): Promise<void> {
        try {
            // TODO: Get list of authorized scorers and send notifications
            
            this.emit('scorerNotification', {
                type,
                proposal,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Failed to notify scorers:', error);
        }
    }

    /**
     * Initialize milestone tracking for funded proposals
     */
    private async initiateMilestoneTracking(proposal: any): Promise<void> {
        try {
            // TODO: Set up milestone tracking system
            // - Create milestone schedule
            // - Set up periodic check-ins
            // - Monitor progress indicators
            
            this.emit('milestoneTrackingStarted', {
                proposalId: proposal.id,
                expectedDuration: this.extractDuration(proposal),
                milestones: this.generateMilestones(proposal)
            });
            
        } catch (error) {
            console.error('Failed to initiate milestone tracking:', error);
        }
    }

    /**
     * Utility methods
     */

    private calculateFundingAmount(score: number): number {
        const baseFunding = 10000; // APT
        if (score >= 95) return baseFunding * 2.0;
        if (score >= 90) return baseFunding * 1.5;
        if (score >= 85) return baseFunding * 1.2;
        return baseFunding;
    }

    private extractCategory(proposal: any): string {
        // TODO: Extract category from proposal description/title
        return 'general';
    }

    private extractInstitution(proposal: any): string {
        // TODO: Extract institution from proposal data
        return 'unknown';
    }

    private extractFunding(proposal: any): number {
        // TODO: Extract requested funding amount
        return 0;
    }

    private extractDuration(proposal: any): number {
        // TODO: Extract project duration
        return 12; // months
    }

    private generateMilestones(proposal: any): any[] {
        // TODO: Generate appropriate milestones based on proposal
        return [
            { month: 3, description: 'Initial results', type: 'progress_report' },
            { month: 6, description: 'Mid-term evaluation', type: 'evaluation' },
            { month: 9, description: 'Preliminary findings', type: 'results' },
            { month: 12, description: 'Final report', type: 'completion' }
        ];
    }

    /**
     * Get processing statistics
     */
    public getStats(): any {
        return {
            isProcessing: this.isProcessing,
            eventQueueSize: this.eventQueue.length,
            lastProcessedBlock: this.lastProcessedBlock,
            uptime: this.isProcessing ? Date.now() : 0
        };
    }

    /**
     * Get recent events
     */
    public getRecentEvents(limit: number = 10): any[] {
        return this.eventQueue.slice(-limit);
    }
}

export default EventProcessor;



