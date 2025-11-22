// ============================================
// PROFILE PAGE - Data Loader & Handlers
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for wallet connection
    if (!web3State.isConnected) {
        console.log('Waiting for wallet connection...');
        return;
    }
    
    // Load user badges
    await loadUserBadges();
    
    // Add fulfill button handlers
    addFulfillHandlers();
});

// Load user's badges from blockchain
async function loadUserBadges() {
    try {
        if (!web3State.isConnected || !web3State.address) {
            console.log('Wallet not connected yet');
            return;
        }
        
        console.log('Loading badges for:', web3State.address);
        
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

// Add event listeners to fulfill buttons
function addFulfillHandlers() {
    const fulfillButtons = document.querySelectorAll('button');
    
    fulfillButtons.forEach(button => {
        if (button.textContent.includes('Fulfill')) {
            button.addEventListener('click', async () => {
                // Check wallet connection
                if (!web3State.isConnected) {
                    alert('⚠️ Please connect your wallet first!');
                    await connectWallet();
                    return;
                }
                
                // Get proposal ID from the button's card
                const proposalCard = button.closest('.my-proposal-card');
                const proposalTitle = proposalCard.querySelector('h3').textContent;
                const proposalIdMatch = proposalTitle.match(/#(\d+)/);
                
                if (!proposalIdMatch) {
                    alert('❌ Could not determine proposal ID');
                    return;
                }
                
                const proposalId = proposalIdMatch[1];
                
                // Confirm fulfillment
                const confirmed = window.confirm(
                    `🎉 Fulfill Proposal #${proposalId}?\n\n` +
                    `This will:\n` +
                    `• Mark the proposal as fulfilled\n` +
                    `• Mint a LAB Badge NFT to your wallet\n` +
                    `• Award reputation points\n\n` +
                    `Continue?`
                );
                
                if (!confirmed) return;
                
                // Fulfill proposal on blockchain
                await fulfillProposal(proposalId);
            });
        }
    });
}

// Helper: Format address for display
function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

