import React, { useState, useEffect, useCallback } from 'react';
import { ANTScoringHelper, ScoreInput, Proposal } from './antScoringUtils';

/**
 * React Frontend Integration for ANT Scoring System
 * Shows how to connect the frontend to the backend API
 */

// Types
interface ProposalFormData {
    title: string;
    description: string;
    ipfsHash?: string;
}

interface ScoringFormData {
    proposalId: number;
    scores: ScoreInput;
}

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

// API Service
class ANTApiService {
    private baseUrl: string;
    private ws: WebSocket | null = null;
    private wsCallbacks: Map<string, Function[]> = new Map();

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    // REST API calls
    async getProposals(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/proposals`);
        return response.json();
    }

    async getProposal(id: number): Promise<any> {
        const response = await fetch(`${this.baseUrl}/proposals/${id}`);
        return response.json();
    }

    async submitProposal(data: ProposalFormData): Promise<any> {
        const response = await fetch(`${this.baseUrl}/proposals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async scoreProposal(proposalId: number, scores: ScoreInput): Promise<any> {
        const response = await fetch(`${this.baseUrl}/proposals/${proposalId}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scores })
        });
        return response.json();
    }

    async getDashboard(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/analytics/dashboard`);
        return response.json();
    }

    // WebSocket connection
    connectWebSocket(url: string): void {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
            console.log('🔌 Connected to ANT WebSocket');
            this.triggerCallbacks('connected', null);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.triggerCallbacks(data.type, data.data);
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 Disconnected from ANT WebSocket');
            this.triggerCallbacks('disconnected', null);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.triggerCallbacks('error', error);
        };
    }

    onWebSocketEvent(eventType: string, callback: Function): void {
        if (!this.wsCallbacks.has(eventType)) {
            this.wsCallbacks.set(eventType, []);
        }
        this.wsCallbacks.get(eventType)!.push(callback);
    }

    private triggerCallbacks(eventType: string, data: any): void {
        const callbacks = this.wsCallbacks.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
}

// React Hooks
function useANTApi() {
    const [apiService] = useState(() => new ANTApiService(API_BASE_URL));

    useEffect(() => {
        apiService.connectWebSocket(WS_URL);
        return () => {
            if (apiService.ws) {
                apiService.ws.close();
            }
        };
    }, [apiService]);

    return apiService;
}

function useProposals() {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiService = useANTApi();

    const fetchProposals = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiService.getProposals();
            setProposals(data.proposals || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiService]);

    useEffect(() => {
        fetchProposals();
        
        // Listen for real-time updates
        apiService.onWebSocketEvent('proposal_created', fetchProposals);
        apiService.onWebSocketEvent('proposal_scored', fetchProposals);
        apiService.onWebSocketEvent('proposal_fulfilled', fetchProposals);
    }, [apiService, fetchProposals]);

    return { proposals, loading, error, refetch: fetchProposals };
}

// React Components

export const ANTDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const apiService = useANTApi();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await apiService.getDashboard();
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [apiService]);

    if (loading) {
        return <div className="loading">Loading ANT Dashboard...</div>;
    }

    const metrics = dashboardData?.metrics || {};

    return (
        <div className="ant-dashboard">
            <h2>🎯 ANT Scoring Dashboard</h2>
            
            <div className="metrics-grid">
                <div className="metric-card">
                    <h3>Total Proposals</h3>
                    <div className="metric-value">{metrics.totalProposals || 0}</div>
                </div>
                
                <div className="metric-card">
                    <h3>Active Proposals</h3>
                    <div className="metric-value">{metrics.activeProposals || 0}</div>
                </div>
                
                <div className="metric-card">
                    <h3>Passing Threshold</h3>
                    <div className="metric-value">{metrics.passingProposals || 0}</div>
                </div>
                
                <div className="metric-card">
                    <h3>Success Rate</h3>
                    <div className="metric-value">{metrics.successRate || 0}%</div>
                </div>
            </div>
        </div>
    );
};

export const ProposalList: React.FC = () => {
    const { proposals, loading, error } = useProposals();

    if (loading) return <div>Loading proposals...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="proposal-list">
            <h2>📋 Research Proposals</h2>
            
            {proposals.length === 0 ? (
                <p>No proposals found.</p>
            ) : (
                <div className="proposals-grid">
                    {proposals.map(proposal => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ProposalCard: React.FC<{ proposal: any }> = ({ proposal }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fulfilled': return '#28a745';
            case 'passing': return '#17a2b8';
            case 'scored': return '#ffc107';
            case 'active': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'fulfilled': return '💰';
            case 'passing': return '✅';
            case 'scored': return '🔬';
            case 'active': return '📋';
            default: return '❓';
        }
    };

    return (
        <div className="proposal-card">
            <div className="proposal-header">
                <h3>{proposal.title}</h3>
                <div 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(proposal.status) }}
                >
                    {getStatusIcon(proposal.status)} {proposal.status}
                </div>
            </div>
            
            <p className="proposal-description">
                {proposal.description.substring(0, 150)}...
            </p>
            
            <div className="proposal-metrics">
                <div className="metric">
                    <span className="label">Score:</span>
                    <span className="value">{proposal.scores.final_score}%</span>
                </div>
                
                <div className="metric">
                    <span className="label">Scorers:</span>
                    <span className="value">{proposal.scores.scorer_count}</span>
                </div>
                
                {proposal.scores.is_passing && (
                    <div className="metric">
                        <span className="label">Funding:</span>
                        <span className="value">{proposal.funding_amount?.toLocaleString()} APT</span>
                    </div>
                )}
            </div>
            
            <div className="proposal-actions">
                <button className="btn-primary">View Details</button>
                {!proposal.scores.is_fulfilled && proposal.scores.final_score === 0 && (
                    <button className="btn-secondary">Score Proposal</button>
                )}
            </div>
        </div>
    );
};

export const ProposalSubmissionForm: React.FC = () => {
    const [formData, setFormData] = useState<ProposalFormData>({
        title: '',
        description: '',
        ipfsHash: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const apiService = useANTApi();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await apiService.submitProposal(formData);
            setSuccess(true);
            setFormData({ title: '', description: '', ipfsHash: '' });
        } catch (error) {
            alert('Failed to submit proposal: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="success-message">
                <h3>🎉 Proposal Submitted Successfully!</h3>
                <p>Your research proposal has been submitted and is now active for scoring.</p>
                <button onClick={() => setSuccess(false)} className="btn-primary">
                    Submit Another Proposal
                </button>
            </div>
        );
    }

    return (
        <div className="proposal-form">
            <h2>📝 Submit Research Proposal</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Research Title *</label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter your research title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Research Description *</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your research proposal, methodology, and expected outcomes"
                        rows={6}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ipfsHash">IPFS Hash (Optional)</label>
                    <input
                        id="ipfsHash"
                        type="text"
                        value={formData.ipfsHash}
                        onChange={(e) => setFormData({ ...formData, ipfsHash: e.target.value })}
                        placeholder="IPFS hash for detailed research documents"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary"
                >
                    {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
            </form>
        </div>
    );
};

export const ScoringInterface: React.FC<{ proposalId: number }> = ({ proposalId }) => {
    const [scores, setScores] = useState<ScoreInput>({
        scientific_merit: { novelty: 0, biological_plausibility: 0, prior_evidence: 0 },
        feasibility: { technical_viability: 0, data_quality: 0, clarity_of_protocol: 0 },
        community_alignment: { mission_fit: 0, dao_engagement: 0 },
        resource_efficiency: { cost_effectiveness: 0, agentic_resource_use: 0 },
        open_science: { data_protocol_sharing: 0, collaborative_potential: 0 }
    });
    const [submitting, setSubmitting] = useState(false);
    const apiService = useANTApi();

    const handleScoreChange = (category: string, field: string, value: number) => {
        setScores(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setSubmitting(true);
        try {
            await apiService.scoreProposal(proposalId, scores);
            alert('Score submitted successfully!');
        } catch (error) {
            alert('Failed to submit score: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="scoring-interface">
            <h2>🔬 Score Proposal #{proposalId}</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="scoring-category">
                    <h3>Scientific Merit (40% weight)</h3>
                    <div className="score-inputs">
                        <ScoreInput
                            label="Novelty"
                            value={scores.scientific_merit.novelty}
                            onChange={(value) => handleScoreChange('scientific_merit', 'novelty', value)}
                        />
                        <ScoreInput
                            label="Biological Plausibility"
                            value={scores.scientific_merit.biological_plausibility}
                            onChange={(value) => handleScoreChange('scientific_merit', 'biological_plausibility', value)}
                        />
                        <ScoreInput
                            label="Prior Evidence"
                            value={scores.scientific_merit.prior_evidence}
                            onChange={(value) => handleScoreChange('scientific_merit', 'prior_evidence', value)}
                        />
                    </div>
                </div>

                <div className="scoring-category">
                    <h3>Feasibility (25% weight)</h3>
                    <div className="score-inputs">
                        <ScoreInput
                            label="Technical Viability"
                            value={scores.feasibility.technical_viability}
                            onChange={(value) => handleScoreChange('feasibility', 'technical_viability', value)}
                        />
                        <ScoreInput
                            label="Data Quality"
                            value={scores.feasibility.data_quality}
                            onChange={(value) => handleScoreChange('feasibility', 'data_quality', value)}
                        />
                        <ScoreInput
                            label="Protocol Clarity"
                            value={scores.feasibility.clarity_of_protocol}
                            onChange={(value) => handleScoreChange('feasibility', 'clarity_of_protocol', value)}
                        />
                    </div>
                </div>

                {/* Add other categories similarly... */}
                
                <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-primary"
                >
                    {submitting ? 'Submitting Score...' : 'Submit Score'}
                </button>
            </form>
        </div>
    );
};

const ScoreInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
}> = ({ label, value, onChange }) => (
    <div className="score-input">
        <label>{label}</label>
        <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
        />
        <span className="score-value">{value}</span>
    </div>
);

// Main App Component
export const ANTApp: React.FC = () => {
    return (
        <div className="ant-app">
            <header>
                <h1>🧬 ANT Scoring System</h1>
                <p>Algorithmic Network Triage for Decentralized Research Funding</p>
            </header>
            
            <main>
                <ANTDashboard />
                <ProposalList />
                <ProposalSubmissionForm />
            </main>
        </div>
    );
};

export default ANTApp;



