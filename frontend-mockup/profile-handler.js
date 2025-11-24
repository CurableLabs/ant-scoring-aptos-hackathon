// ============================================
// PROFILE PAGE - Data Loader & Handlers
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for wallet to be connected and have an address
    const checkAndLoadProfile = async () => {
        if (!web3State.isConnected || !web3State.address) {
            console.log('Waiting for wallet connection... isConnected:', web3State.isConnected, 'address:', web3State.address);
            setTimeout(checkAndLoadProfile, 500);
            return;
        }
        
        console.log('✅ Wallet ready! Loading profile data for:', web3State.address);
        
        // Load all researcher data
        await loadResearcherProfile();
    };
    
    // Start checking after a short delay
    setTimeout(checkAndLoadProfile, 500);
});

// Load complete researcher profile
async function loadResearcherProfile() {
    console.log('🚀 loadResearcherProfile() called');
    console.log('Web3State:', {
        isConnected: web3State.isConnected,
        address: web3State.address,
        hasContracts: !!web3State.contracts.antScoring
    });
    
    try {
        showLoadingState();
        
        // Update wallet address in header
        updateProfileHeader();
        
        console.log('📥 Loading all profile data...');
        
        // Load data in parallel
        await Promise.all([
            loadResearcherStats(),
            loadResearcherProposals(),
            loadUserBadges()
        ]);
        
        console.log('✅ All profile data loaded successfully');
        
        hideLoadingState();
        
    } catch (error) {
        console.error('❌ Error loading researcher profile:', error);
        alert('Error loading profile: ' + error.message);
        hideLoadingState();
    }
}

// Make it globally accessible
window.loadResearcherProfile = loadResearcherProfile;

// Update profile header with connected wallet
function updateProfileHeader() {
    const { address, isScorer, isAdmin } = web3State;
    
    // Update wallet address
    const profileInfo = document.querySelector('.profile-info h1');
    if (profileInfo) {
        profileInfo.textContent = address;
    }
    
    // Show/hide role badges based on actual roles
    const scorerBadge = document.querySelector('.scorer-badge');
    const adminBadge = document.querySelector('.admin-badge');
    
    if (scorerBadge) {
        scorerBadge.style.display = isScorer ? 'inline-flex' : 'none';
    }
    
    if (adminBadge) {
        adminBadge.style.display = isAdmin ? 'inline-flex' : 'none';
    }
}

// Load researcher statistics
async function loadResearcherStats() {
    try {
        const { address, contracts } = web3State;
        
        if (!address) {
            console.error('❌ Cannot load stats: address is undefined');
            return;
        }
        
        console.log('📊 Loading stats for:', address);
        
        // Count proposals by this researcher using userProposals mapping
        let myProposals = 0;
        let myFulfilledProposals = 0;
        let myPendingProposals = 0;
        
        let index = 0;
        while (true) {
            try {
                const proposalId = await contracts.antScoring.userProposals(address, index);
                const proposalIdNum = proposalId.toNumber();
                
                if (proposalIdNum === 0) break;
                
                myProposals++;
                
                // Get proposal details to check if fulfilled
                const proposal = await contracts.antScoring.getProposalInfo(proposalIdNum);
                if (proposal[6]) { // isFulfilled
                    myFulfilledProposals++;
                } else {
                    myPendingProposals++;
                }
                
                index++;
            } catch (error) {
                break;
            }
        }
        
        // Get badges count
        let badgesCount = 0;
        try {
            const badges = await getUserBadges(address);
            badgesCount = badges.length;
        } catch (error) {
            console.error('Error counting badges:', error);
        }
        
        // Update stats display
        updateStatsDisplay({
            totalSubmissions: myProposals,
            fulfilledProposals: myFulfilledProposals,
            pendingProposals: myPendingProposals,
            badgesEarned: badgesCount
        });
        
        console.log('Stats loaded:', { myProposals, myFulfilledProposals, myPendingProposals, badgesCount });
        
    } catch (error) {
        console.error('Error loading researcher stats:', error);
    }
}

// Update stats display in UI
function updateStatsDisplay(stats) {
    const profileStats = document.querySelector('.profile-stats');
    if (!profileStats) return;
    
    // Clear existing stats
    profileStats.innerHTML = '';
    
    // Add researcher stats
    profileStats.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${stats.totalSubmissions}</div>
            <div class="stat-label">Total Submissions</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.fulfilledProposals}</div>
            <div class="stat-label">Fulfilled</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.pendingProposals}</div>
            <div class="stat-label">Pending Review</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.badgesEarned}</div>
            <div class="stat-label">Badges Earned</div>
        </div>
    `;
}

// Load researcher's proposals
async function loadResearcherProposals() {
    try {
        const { address, contracts } = web3State;
        
        if (!address) {
            console.error('❌ Cannot load proposals: address is undefined');
            return;
        }
        
        console.log('📝 Loading proposals for address:', address);
        
        const myProposals = [];
        
        // Use userProposals mapping to get this user's proposal IDs
        // Since we don't know the count, we'll try indexes until we get an error
        let index = 0;
        while (true) {
            try {
                const proposalId = await contracts.antScoring.userProposals(address, index);
                const proposalIdNum = proposalId.toNumber();
                
                if (proposalIdNum === 0) break; // No more proposals
                
                console.log(`Found user proposal at index ${index}: ID ${proposalIdNum}`);
                
                // Get proposal details
                const proposal = await contracts.antScoring.getProposalInfo(proposalIdNum);
                
                myProposals.push({
                    id: proposalIdNum,
                    title: proposal[1], // title
                    description: proposal[2], // description
                    ipfsHash: proposal[3], // ipfsHash
                    submitter: address, // We know it's this user
                    score: proposal[4], // finalScore
                    isPassing: proposal[5], // isPassing
                    isFulfilled: proposal[6] // isFulfilled
                });
                
                index++;
            } catch (error) {
                // No more proposals at this index
                console.log(`No more proposals after index ${index}`);
                break;
            }
        }
        
        console.log('✅ My proposals found:', myProposals.length, myProposals);
        
        // Update proposals display
        updateProposalsDisplay(myProposals);
        
    } catch (error) {
        console.error('❌ Error loading researcher proposals:', error);
        alert('Error loading proposals: ' + error.message);
    }
}

// Update proposals display in UI
function updateProposalsDisplay(proposals) {
    const proposalsList = document.querySelector('.proposals-list');
    if (!proposalsList) return;
    
    // Clear existing content
    proposalsList.innerHTML = '';
    
    if (proposals.length === 0) {
        proposalsList.innerHTML = `
            <div class="empty-state">
                <p>📭 No proposals submitted yet</p>
                <p style="color: #a0aec0; font-size: 14px;">Submit your first research proposal to get started!</p>
                <a href="submit.html" class="btn-primary" style="margin-top: 20px;">Submit Proposal</a>
            </div>
        `;
        return;
    }
    
    // Add proposal cards
    proposals.forEach(proposal => {
        const card = createProposalCard(proposal);
        proposalsList.appendChild(card);
    });
}

// Create proposal card HTML
function createProposalCard(proposal) {
    const card = document.createElement('div');
    card.className = 'my-proposal-card';
    
    // Determine status
    let statusClass = 'pending';
    let statusText = '⏳ Pending Review';
    let actionButton = '';
    
    if (proposal.isFulfilled) {
        statusClass = 'fulfilled';
        statusText = '✅ Fulfilled';
    } else if (proposal.isPassing) {
        statusClass = 'passing';
        statusText = '🎯 Passed - Ready to Fulfill';
        actionButton = `
            <button class="btn-primary fulfill-btn" data-proposal-id="${proposal.id}">
                🎉 Fulfill Proposal
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="proposal-header">
            <span class="proposal-id">Proposal #${proposal.id}</span>
            <span class="proposal-status ${statusClass}">${statusText}</span>
        </div>
        <h3>${proposal.title}</h3>
        <p class="proposal-description">${proposal.description.substring(0, 150)}${proposal.description.length > 150 ? '...' : ''}</p>
        <div class="proposal-score-bar">
            <div class="score-label">Score: ${proposal.score}/100</div>
            <div class="score-progress">
                <div class="score-fill" style="width: ${proposal.score}%"></div>
            </div>
        </div>
        ${actionButton}
        <div class="proposal-meta">
            <small>IPFS: ${proposal.ipfsHash || 'None'}</small>
        </div>
    `;
    
    // Add fulfill button handler
    const fulfillBtn = card.querySelector('.fulfill-btn');
    if (fulfillBtn) {
        fulfillBtn.addEventListener('click', async () => {
            await handleFulfillProposal(proposal.id);
        });
    }
    
    return card;
}

// Handle fulfill proposal
async function handleFulfillProposal(proposalId) {
    const confirmed = window.confirm(
        `🎉 Fulfill Proposal #${proposalId}?\n\n` +
        `This will:\n` +
        `• Mark the proposal as fulfilled\n` +
        `• Mint a LAB Badge NFT to your wallet\n` +
        `• Award reputation points\n\n` +
        `Continue?`
    );
    
    if (!confirmed) return;
    
    try {
        await fulfillProposal(proposalId);
        
        // Reload profile data after fulfillment
        setTimeout(() => {
            loadResearcherProfile();
        }, 2000);
        
    } catch (error) {
        console.error('Error fulfilling proposal:', error);
    }
}

// Show loading state
function showLoadingState() {
    const statsCards = document.querySelectorAll('.stat-card .stat-number');
    statsCards.forEach(card => {
        card.textContent = '...';
    });
}

// Hide loading state
function hideLoadingState() {
    // Loading complete
    console.log('Profile data loaded');
}

// Load user's badges from blockchain
async function loadUserBadges() {
    try {
        if (!web3State.isConnected || !web3State.address) {
            console.log('❌ Cannot load badges: wallet not connected or address undefined');
            return;
        }
        
        console.log('🎖️ Loading badges for:', web3State.address);
        
        const badges = await getUserBadges(web3State.address);
        
        if (badges.length === 0) {
            console.log('No badges found for this address');
            // Could update UI to show "No badges yet" message
            return;
        }
        
        console.log('Loaded badges:', badges);
        
        // Update badges display
        updateBadgesDisplay(badges);
        
    } catch (error) {
        console.error('Error loading badges:', error);
    }
}

// Update the badges grid with real data
function updateBadgesDisplay(badges) {
    const badgesGrid = document.querySelector('.badges-grid');
    if (!badgesGrid) return;
    
    // Clear existing mock badges
    badgesGrid.innerHTML = '';
    
    // Add real badges
    badges.forEach(badge => {
        const badgeCard = createBadgeCard(badge);
        badgesGrid.appendChild(badgeCard);
    });
}

// Create badge card HTML element
function createBadgeCard(badge) {
    const card = document.createElement('div');
    card.className = `badge-card badge-${badge.name.toLowerCase()}`;
    
    card.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <h3>${badge.name} Badge</h3>
        <div class="badge-id">#${badge.tokenId}</div>
        <div class="badge-points">${badge.points} Points</div>
        <div class="badge-meta">
            <div>Soulbound NFT</div>
            <div>Non-transferable</div>
        </div>
        <a href="${CONTRACTS.NETWORK.explorerUrl}/token/${web3State.contracts.labBadge.target}?a=${badge.tokenId}" 
           target="_blank" 
           class="btn-secondary btn-small">
            View on Etherscan
        </a>
    `;
    
    return card;
}

// Helper: Format address for display
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

