// ============================================
// ADMIN DASHBOARD - Handler Functions
// ============================================

// Initialize admin page on load
document.addEventListener('DOMContentLoaded', async () => {
    // Load contract addresses into the page
    loadContractAddresses();
    
    // Small delay to ensure web3 is initialized
    setTimeout(async () => {
        // Load system stats if connected
        if (web3State.isConnected && web3State.isAdmin) {
            console.log('Loading system stats...');
            await loadSystemStats();
        } else if (web3State.isConnected) {
            // Still load contract owner even if not admin
            await loadContractOwner();
        }
    }, 500);
});

// ============================================
// SYSTEM STATS
// ============================================

async function loadSystemStats() {
    try {
        const { contracts } = web3State;
        
        // Get proposal counter (total proposals)
        const proposalCounter = await contracts.antScoring.proposalCounter();
        document.getElementById('total-proposals').textContent = proposalCounter.toString();
        
        // Get active proposal count
        const activeCount = await contracts.antScoring.activeProposalCount();
        document.getElementById('active-proposals').textContent = activeCount.toString();
        
        // Get passing threshold
        const threshold = await contracts.antScoring.passingThreshold();
        document.getElementById('passing-threshold').textContent = threshold.toString();
        
        // Count authorized scorers (we'll need to check each address manually)
        // For demo, we'll just show "N/A" since there's no direct getter
        document.getElementById('total-scorers').textContent = 'N/A';
        
        console.log('✅ System stats loaded');
        
    } catch (error) {
        console.error('Error loading system stats:', error);
    }
}

// ============================================
// SCORER MANAGEMENT
// ============================================

async function addScorer() {
    const addressInput = document.getElementById('new-scorer-address');
    const address = addressInput.value.trim();
    
    if (!address || !address.startsWith('0x')) {
        alert('❌ Please enter a valid Ethereum address');
        return;
    }
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    try {
        showLoading('Adding authorized scorer...');
        
        const tx = await web3State.contracts.antScoring.addAuthorizedScorer(address);
        console.log('Transaction sent:', tx.hash);
        
        showLoading('Waiting for confirmation...');
        const receipt = await tx.wait();
        
        hideLoading();
        alert(`✅ Scorer Added Successfully!\n\nAddress: ${address}\nTx: ${receipt.transactionHash}`);
        
        // Clear input
        addressInput.value = '';
        
        // Reload stats
        await loadSystemStats();
        
    } catch (error) {
        hideLoading();
        console.error('Error adding scorer:', error);
        
        let errorMsg = 'Failed to add scorer';
        if (error.reason) errorMsg += `\n\n${error.reason}`;
        else if (error.message) errorMsg += `\n\n${error.message}`;
        
        alert(`❌ ${errorMsg}`);
    }
}

async function removeScorer() {
    const addressInput = document.getElementById('remove-scorer-address');
    const address = addressInput.value.trim();
    
    if (!address || !address.startsWith('0x')) {
        alert('❌ Please enter a valid Ethereum address');
        return;
    }
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    const confirm = window.confirm(
        `⚠️ Remove Scorer\n\nAre you sure you want to remove:\n${address}\n\nThey will no longer be able to score proposals.`
    );
    
    if (!confirm) return;
    
    try {
        showLoading('Removing authorized scorer...');
        
        const tx = await web3State.contracts.antScoring.removeAuthorizedScorer(address);
        console.log('Transaction sent:', tx.hash);
        
        showLoading('Waiting for confirmation...');
        const receipt = await tx.wait();
        
        hideLoading();
        alert(`✅ Scorer Removed Successfully!\n\nAddress: ${address}\nTx: ${receipt.transactionHash}`);
        
        // Clear input
        addressInput.value = '';
        
        // Reload stats
        await loadSystemStats();
        
    } catch (error) {
        hideLoading();
        console.error('Error removing scorer:', error);
        
        let errorMsg = 'Failed to remove scorer';
        if (error.reason) errorMsg += `\n\n${error.reason}`;
        else if (error.message) errorMsg += `\n\n${error.message}`;
        
        alert(`❌ ${errorMsg}`);
    }
}

async function checkScorerStatus() {
    const addressInput = document.getElementById('check-scorer-address');
    const address = addressInput.value.trim();
    const resultDiv = document.getElementById('scorer-status-result');
    
    if (!address || !address.startsWith('0x')) {
        alert('❌ Please enter a valid Ethereum address');
        return;
    }
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    try {
        const isScorer = await web3State.contracts.antScoring.isAuthorizedScorer(address);
        
        if (isScorer) {
            resultDiv.innerHTML = `
                <div class="status-success">
                    ✅ <strong>Authorized Scorer</strong><br>
                    <small>${address}</small>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="status-error">
                    ❌ <strong>Not Authorized</strong><br>
                    <small>${address}</small>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error checking scorer status:', error);
        resultDiv.innerHTML = `<div class="status-error">Error: ${error.message}</div>`;
    }
}

// ============================================
// BADGE ISSUER MANAGEMENT
// ============================================

async function authorizeBadgeIssuer() {
    const addressInput = document.getElementById('new-issuer-address');
    const address = addressInput.value.trim();
    
    if (!address || !address.startsWith('0x')) {
        alert('❌ Please enter a valid contract address');
        return;
    }
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    try {
        showLoading('Authorizing badge issuer...');
        
        const tx = await web3State.contracts.triLaneSystem.authorizeBadgeIssuer(address);
        console.log('Transaction sent:', tx.hash);
        
        showLoading('Waiting for confirmation...');
        const receipt = await tx.wait();
        
        hideLoading();
        alert(`✅ Badge Issuer Authorized!\n\nContract: ${address}\nTx: ${receipt.transactionHash}`);
        
        // Clear input
        addressInput.value = '';
        
    } catch (error) {
        hideLoading();
        console.error('Error authorizing issuer:', error);
        
        let errorMsg = 'Failed to authorize badge issuer';
        if (error.reason) errorMsg += `\n\n${error.reason}`;
        else if (error.message) errorMsg += `\n\n${error.message}`;
        
        alert(`❌ ${errorMsg}`);
    }
}

async function revokeBadgeIssuer() {
    const addressInput = document.getElementById('revoke-issuer-address');
    const address = addressInput.value.trim();
    
    if (!address || !address.startsWith('0x')) {
        alert('❌ Please enter a valid contract address');
        return;
    }
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    const confirm = window.confirm(
        `⚠️ Revoke Badge Issuer\n\nAre you sure you want to revoke:\n${address}\n\nThis contract will no longer be able to issue badges.`
    );
    
    if (!confirm) return;
    
    try {
        showLoading('Revoking badge issuer...');
        
        const tx = await web3State.contracts.triLaneSystem.revokeBadgeIssuer(address);
        console.log('Transaction sent:', tx.hash);
        
        showLoading('Waiting for confirmation...');
        const receipt = await tx.wait();
        
        hideLoading();
        alert(`✅ Badge Issuer Revoked!\n\nContract: ${address}\nTx: ${receipt.transactionHash}`);
        
        // Clear input
        addressInput.value = '';
        
    } catch (error) {
        hideLoading();
        console.error('Error revoking issuer:', error);
        
        let errorMsg = 'Failed to revoke badge issuer';
        if (error.reason) errorMsg += `\n\n${error.reason}`;
        else if (error.message) errorMsg += `\n\n${error.message}`;
        
        alert(`❌ ${errorMsg}`);
    }
}

// ============================================
// ALL PROPOSALS VIEW
// ============================================

async function loadAllProposals() {
    const listDiv = document.getElementById('all-proposals-list');
    
    if (!web3State.isConnected) {
        alert('❌ Please connect your wallet first');
        return;
    }
    
    try {
        listDiv.innerHTML = '<p class="loading-text">⏳ Loading all proposals...</p>';
        
        const proposalCounter = await web3State.contracts.antScoring.proposalCounter();
        const totalProposals = proposalCounter.toNumber();
        
        if (totalProposals === 0) {
            listDiv.innerHTML = '<p class="empty-state">No proposals submitted yet.</p>';
            return;
        }
        
        let proposalsHTML = '';
        
        // Load all proposals
        for (let i = 1; i <= totalProposals; i++) {
            try {
                const proposal = await web3State.contracts.antScoring.getProposalInfo(i);
                
                const statusClass = proposal.scores.isFulfilled ? 'fulfilled' : 
                                  proposal.scores.isPassing ? 'passing' : 'pending';
                
                const statusText = proposal.scores.isFulfilled ? '✅ Fulfilled' :
                                 proposal.scores.isPassing ? '🎯 Passed' : '⏳ Pending';
                
                proposalsHTML += `
                    <div class="proposal-card ${statusClass}">
                        <div class="proposal-header">
                            <span class="proposal-id">ID: ${i}</span>
                            <span class="proposal-status">${statusText}</span>
                        </div>
                        <h3>${proposal.title}</h3>
                        <p class="proposal-submitter">Submitted by: ${proposal.submitter.slice(0, 6)}...${proposal.submitter.slice(-4)}</p>
                        <div class="proposal-score">
                            <strong>Score:</strong> ${proposal.scores.finalScore}/100
                            <span class="threshold-info">(Threshold: ${await web3State.contracts.antScoring.passingThreshold()})</span>
                        </div>
                        <div class="proposal-meta">
                            <small>IPFS: ${proposal.ipfsHash}</small>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error loading proposal ${i}:`, error);
            }
        }
        
        listDiv.innerHTML = proposalsHTML || '<p class="empty-state">No proposals found.</p>';
        
    } catch (error) {
        console.error('Error loading proposals:', error);
        listDiv.innerHTML = `<p class="error-text">❌ Error loading proposals: ${error.message}</p>`;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function loadContractAddresses() {
    // Replace template strings with actual addresses
    document.getElementById('ant-scoring-address').textContent = CONTRACTS.ADDRESSES.ANTScoring;
    document.getElementById('ant-scoring-address').href = `https://sepolia.etherscan.io/address/${CONTRACTS.ADDRESSES.ANTScoring}`;
    
    document.getElementById('trilane-address').textContent = CONTRACTS.ADDRESSES.TriLaneSystem;
    document.getElementById('trilane-address').href = `https://sepolia.etherscan.io/address/${CONTRACTS.ADDRESSES.TriLaneSystem}`;
    
    document.getElementById('cure-token-address').textContent = CONTRACTS.ADDRESSES.CUREToken;
    document.getElementById('cure-token-address').href = `https://sepolia.etherscan.io/address/${CONTRACTS.ADDRESSES.CUREToken}`;
    
    document.getElementById('bonding-curve-address').textContent = CONTRACTS.ADDRESSES.BondingCurve2;
    document.getElementById('bonding-curve-address').href = `https://sepolia.etherscan.io/address/${CONTRACTS.ADDRESSES.BondingCurve2}`;
    
    document.getElementById('cure-integration-address').textContent = CONTRACTS.ADDRESSES.CUREIntegration;
    document.getElementById('cure-integration-address').href = `https://sepolia.etherscan.io/address/${CONTRACTS.ADDRESSES.CUREIntegration}`;
}

// Load contract owner address on page load
async function loadContractOwner() {
    try {
        if (web3State.contracts.antScoring) {
            const owner = await web3State.contracts.antScoring.owner();
            document.getElementById('contract-owner').textContent = owner;
        }
    } catch (error) {
        console.error('Error loading contract owner:', error);
        document.getElementById('contract-owner').textContent = 'Error loading';
    }
}

// Call this when wallet connects
if (web3State.isConnected) {
    loadContractOwner();
}

// Export functions for global access
window.addScorer = addScorer;
window.removeScorer = removeScorer;
window.checkScorerStatus = checkScorerStatus;
window.authorizeBadgeIssuer = authorizeBadgeIssuer;
window.revokeBadgeIssuer = revokeBadgeIssuer;
window.loadAllProposals = loadAllProposals;
window.loadSystemStats = loadSystemStats;

