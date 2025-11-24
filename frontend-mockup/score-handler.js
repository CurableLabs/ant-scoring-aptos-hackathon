// ============================================
// SCORE PROPOSALS - Load & Display Active Proposals
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for wallet connection
    const checkAndLoadProposals = async () => {
        if (!web3State.isConnected || !web3State.address) {
            console.log('Waiting for wallet connection...');
            setTimeout(checkAndLoadProposals, 500);
            return;
        }
        
        console.log('✅ Wallet ready! Loading proposals to score...');
        await loadActiveProposals();
    };
    
    setTimeout(checkAndLoadProposals, 500);
});

// Load all active proposals from blockchain
async function loadActiveProposals() {
    try {
        const { address, contracts, isScorer, isAdmin } = web3State;
        
        // Check if user is authorized to score
        if (!isScorer && !isAdmin) {
            console.log('❌ User is not an authorized scorer');
            showNotAuthorizedMessage();
            return;
        }
        
        console.log('📋 Loading active proposals...');
        
        const proposalCounter = await contracts.antScoring.proposalCounter();
        const totalProposals = proposalCounter.toNumber();
        
        console.log(`📊 Total proposals in system: ${totalProposals}`);
        
        const activeProposals = [];
        
        // Load all proposals
        for (let i = 1; i <= totalProposals; i++) {
            try {
                const proposal = await contracts.antScoring.getProposalInfo(i);
                
                // Only show proposals that are not fulfilled yet
                if (!proposal[6]) { // isFulfilled
                    // Get full proposal data including submitter
                    const fullProposal = await contracts.antScoring.proposals(i);
                    
                    activeProposals.push({
                        id: i,
                        submitter: fullProposal[1], // submitter address
                        title: proposal[1], // title
                        description: proposal[2], // description
                        ipfsHash: proposal[3], // ipfsHash
                        currentScore: proposal[4], // finalScore
                        isPassing: proposal[5], // isPassing
                        scorerCount: proposal[7] // scorerCount
                    });
                }
            } catch (error) {
                console.error(`Error loading proposal ${i}:`, error);
            }
        }
        
        console.log(`✅ Found ${activeProposals.length} active proposals`);
        
        // Display proposals
        displayProposals(activeProposals);
        
    } catch (error) {
        console.error('❌ Error loading active proposals:', error);
        alert('Error loading proposals: ' + error.message);
    }
}

// Display proposals in the UI
function displayProposals(proposals) {
    // Store proposals globally for modal access
    currentProposals = proposals;
    
    const proposalsGrid = document.querySelector('.proposals-to-score');
    if (!proposalsGrid) {
        console.error('Proposals grid not found');
        return;
    }
    
    // Clear existing content
    proposalsGrid.innerHTML = '';
    
    if (proposals.length === 0) {
        proposalsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>🎉 All proposals have been scored!</p>
                <p style="color: #a0aec0; font-size: 14px;">Check back later for new submissions.</p>
            </div>
        `;
        return;
    }
    
    // Create proposal cards
    proposals.forEach(proposal => {
        const card = createProposalCard(proposal);
        proposalsGrid.appendChild(card);
    });
}

// Create a proposal card
function createProposalCard(proposal) {
    const card = document.createElement('div');
    card.className = 'score-card';
    
    // Determine status based on current score
    let statusClass = 'pending';
    let statusText = '⏳ Pending';
    if (proposal.currentScore >= 80) {
        statusClass = 'passing';
        statusText = '🎯 Passing';
    } else if (proposal.scorerCount > 0) {
        statusClass = 'in-progress';
        statusText = '📊 In Progress';
    }
    
    // Format submitter address for display
    const shortAddress = `${proposal.submitter.slice(0, 6)}...${proposal.submitter.slice(-4)}`;
    
    card.innerHTML = `
        <div class="proposal-header">
            <span class="proposal-id">#${proposal.id}</span>
            <span class="proposal-status ${statusClass}">${statusText}</span>
        </div>
        
        <h3 class="proposal-title">${proposal.title}</h3>
        
        <div class="researcher-info">
            <span class="researcher-label">👤 Researcher:</span>
            <a href="${CONTRACTS.NETWORK.explorerUrl}/address/${proposal.submitter}" 
               target="_blank" 
               class="researcher-address" 
               title="${proposal.submitter}">
                ${shortAddress}
            </a>
        </div>
        
        <div class="proposal-meta">
            <div class="meta-item">
                <strong>Current Score:</strong> ${proposal.currentScore}/100
            </div>
            <div class="meta-item">
                <strong>Scorers:</strong> ${proposal.scorerCount}
            </div>
        </div>
        
        <div class="proposal-description">
            ${proposal.description.substring(0, 200)}${proposal.description.length > 200 ? '...' : ''}
        </div>
        
        <div class="proposal-actions-top">
            <button class="btn-secondary btn-small" onclick="viewFullProposal(${proposal.id})">
                📄 View Full Details
            </button>
            ${proposal.ipfsHash && proposal.ipfsHash !== '' ? `
                <a href="https://gateway.pinata.cloud/ipfs/${proposal.ipfsHash}" 
                   target="_blank" 
                   class="btn-secondary btn-small">
                    🔗 View on IPFS
                </a>
            ` : ''}
        </div>
        
        <div class="scoring-section">
            <h4>Your Score</h4>
            <div class="score-input-group">
                <input 
                    type="number" 
                    class="score-input" 
                    min="0" 
                    max="100" 
                    value="85" 
                    placeholder="0-100"
                />
                <span class="score-label">/100</span>
            </div>
            
            <button class="btn-primary score-btn" onclick="submitScore(${proposal.id})">
                📊 Submit Score
            </button>
        </div>
    `;
    
    return card;
}

// Submit score for a proposal
async function submitScore(proposalId) {
    try {
        // Check wallet connection
        if (!web3State.isConnected) {
            alert('⚠️ Please connect your wallet first!');
            await connectWallet();
            return;
        }
        
        // Check if authorized scorer
        if (!web3State.isScorer && !web3State.isAdmin) {
            alert('❌ You are not an authorized scorer!\n\nContact the system administrator to get authorized.');
            return;
        }
        
        // Find the score input for this proposal
        const scoreInputs = document.querySelectorAll('.score-input');
        let scoreValue = 85; // Default
        
        // Find the right input (a bit hacky, but works)
        scoreInputs.forEach(input => {
            const card = input.closest('.score-card');
            const idElement = card.querySelector('.proposal-id');
            if (idElement && idElement.textContent === `#${proposalId}`) {
                scoreValue = parseInt(input.value);
            }
        });
        
        // Validate score
        if (scoreValue < 0 || scoreValue > 100) {
            alert('❌ Score must be between 0 and 100!');
            return;
        }
        
        // Confirm submission
        const confirmed = window.confirm(
            `📊 Submit Score?\n\n` +
            `Proposal ID: #${proposalId}\n` +
            `Your Score: ${scoreValue}/100\n\n` +
            `This will create a blockchain transaction. Continue?`
        );
        
        if (!confirmed) return;
        
        // Submit score to blockchain
        const success = await scoreProposal(proposalId, scoreValue);
        
        if (success) {
            // Reload proposals after successful scoring
            setTimeout(() => {
                loadActiveProposals();
            }, 2000);
        }
        
    } catch (error) {
        console.error('Error submitting score:', error);
        alert('Error: ' + error.message);
    }
}

// Show not authorized message
function showNotAuthorizedMessage() {
    const proposalsGrid = document.querySelector('.proposals-to-score');
    if (proposalsGrid) {
        proposalsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>🔒 Not Authorized</p>
                <p style="color: #a0aec0; font-size: 14px;">You need to be an authorized scorer to access this page.</p>
                <p style="color: #a0aec0; font-size: 14px;">Contact the system administrator to get authorized.</p>
            </div>
        `;
    }
}

// Store proposals globally for access
let currentProposals = [];

// View full proposal details in modal
function viewFullProposal(proposalId) {
    const proposal = currentProposals.find(p => p.id === proposalId);
    
    if (!proposal) {
        alert('Proposal not found');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'proposal-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeProposalModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>Proposal #${proposal.id}: ${proposal.title}</h2>
                <button class="modal-close" onclick="closeProposalModal()">✕</button>
            </div>
            
            <div class="modal-body">
                <div class="modal-section">
                    <h3>👤 Researcher</h3>
                    <a href="${CONTRACTS.NETWORK.explorerUrl}/address/${proposal.submitter}" 
                       target="_blank" 
                       class="researcher-link">
                        ${proposal.submitter}
                    </a>
                </div>
                
                <div class="modal-section">
                    <h3>📋 Full Description</h3>
                    <div class="full-description">${proposal.description}</div>
                </div>
                
                ${proposal.ipfsHash && proposal.ipfsHash !== '' ? `
                    <div class="modal-section">
                        <h3>📄 Research Protocol Document</h3>
                        <div class="ipfs-link-box">
                            <p><strong>IPFS Hash:</strong> <code>${proposal.ipfsHash}</code></p>
                            <a href="https://gateway.pinata.cloud/ipfs/${proposal.ipfsHash}" 
                               target="_blank" 
                               class="btn-primary">
                                🔗 View Full Protocol on IPFS
                            </a>
                            <p class="help-text">The full research protocol is stored on IPFS (decentralized storage). Click above to view the complete document.</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-section">
                    <h3>📊 Current Status</h3>
                    <div class="status-grid">
                        <div class="status-item">
                            <strong>Current Score:</strong> ${proposal.currentScore}/100
                        </div>
                        <div class="status-item">
                            <strong>Number of Scorers:</strong> ${proposal.scorerCount}
                        </div>
                        <div class="status-item">
                            <strong>Status:</strong> ${proposal.isPassing ? '🎯 Passing' : '⏳ Pending'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeProposalModal()">Close</button>
                <button class="btn-primary" onclick="closeProposalModal(); scrollToProposal(${proposal.id})">
                    📊 Score This Proposal
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

// Close modal
function closeProposalModal() {
    const modal = document.querySelector('.proposal-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Scroll to proposal card
function scrollToProposal(proposalId) {
    const cards = document.querySelectorAll('.score-card');
    cards.forEach(card => {
        const idElement = card.querySelector('.proposal-id');
        if (idElement && idElement.textContent === `#${proposalId}`) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'highlight 1s ease';
        }
    });
}

// Export functions
window.submitScore = submitScore;
window.loadActiveProposals = loadActiveProposals;
window.viewFullProposal = viewFullProposal;
window.closeProposalModal = closeProposalModal;

