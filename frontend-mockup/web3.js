// ============================================
// WEB3 INTEGRATION - Real Blockchain Interaction
// ============================================

// Global State
window.web3State = {
    provider: null,
    signer: null,
    address: null,
    contracts: {},
    isConnected: false,
    isScorer: false,
    isAdmin: false,
    chainId: null
};

// ============================================
// WALLET CONNECTION
// ============================================

async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            alert('⚠️ MetaMask not detected!\n\nPlease install MetaMask or Rabby wallet extension to connect.');
            window.open('https://metamask.io/download/', '_blank');
            return false;
        }

        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });

        // Create ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        // Check if on Sepolia
        if (network.chainId !== CONTRACTS.NETWORK.chainId) {
            const switchNetwork = confirm(
                `⚠️ Wrong Network!\n\n` +
                `You're on: ${network.name}\n` +
                `Need: Sepolia Testnet\n\n` +
                `Switch to Sepolia now?`
            );
            
            if (switchNetwork) {
                await switchToSepolia();
                return connectWallet(); // Retry after switch
            }
            return false;
        }

        // Update global state
        web3State.provider = provider;
        web3State.signer = signer;
        web3State.address = address;
        web3State.chainId = network.chainId;
        web3State.isConnected = true;

        // Initialize contracts
        await initializeContracts();

        // Check roles
        await checkUserRoles();

        // Update UI
        updateWalletUI();
        
        // If on profile page, load profile data
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage === 'profile.html' && typeof loadResearcherProfile === 'function') {
            console.log('🔄 Triggering profile data load after wallet connection...');
            setTimeout(() => {
                loadResearcherProfile();
            }, 500);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        console.log('✅ Wallet connected:', address);
        return true;

    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert(`❌ Connection failed:\n${error.message}`);
        return false;
    }
}

async function disconnectWallet() {
    web3State.provider = null;
    web3State.signer = null;
    web3State.address = null;
    web3State.contracts = {};
    web3State.isConnected = false;
    web3State.isScorer = false;
    web3State.isAdmin = false;
    
    updateWalletUI();
    applyRoleVisibility('none');
}

// ============================================
// NETWORK SWITCHING
// ============================================

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONTRACTS.NETWORK.chainIdHex }],
        });
    } catch (switchError) {
        // Chain not added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CONTRACTS.NETWORK.chainIdHex,
                        chainName: 'Sepolia Testnet',
                        nativeCurrency: {
                            name: 'Sepolia ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: [CONTRACTS.NETWORK.rpcUrl],
                        blockExplorerUrls: [CONTRACTS.NETWORK.explorerUrl]
                    }]
                });
            } catch (addError) {
                throw addError;
            }
        } else {
            throw switchError;
        }
    }
}

// ============================================
// CONTRACT INITIALIZATION
// ============================================

async function initializeContracts() {
    const { signer } = web3State;
    
    // Initialize ANTScoring contract
    web3State.contracts.antScoring = new ethers.Contract(
        CONTRACTS.ADDRESSES.ANTScoring,
        CONTRACTS.ABIS.ANTScoring,
        signer
    );

    // Initialize TriLaneSystem contract
    web3State.contracts.triLaneSystem = new ethers.Contract(
        CONTRACTS.ADDRESSES.TriLaneSystem,
        CONTRACTS.ABIS.TriLaneSystem,
        signer
    );

    // Get LabBadge address from TriLaneSystem
    const labBadgeAddress = await web3State.contracts.triLaneSystem.labBadge();
    
    // Initialize LabBadge contract
    web3State.contracts.labBadge = new ethers.Contract(
        labBadgeAddress,
        CONTRACTS.ABIS.LabBadge,
        signer
    );

    console.log('✅ Contracts initialized');
}

// ============================================
// ROLE CHECKING
// ============================================

async function checkUserRoles() {
    const { address, contracts } = web3State;

    try {
        // Check if scorer
        web3State.isScorer = await contracts.antScoring.isAuthorizedScorer(address);

        // Check if admin (owner of ANTScoring)
        const owner = await contracts.antScoring.owner();
        web3State.isAdmin = address.toLowerCase() === owner.toLowerCase();

        console.log('User roles:', {
            isScorer: web3State.isScorer,
            isAdmin: web3State.isAdmin
        });

        // Apply role-based UI
        let role = 'researcher'; // Default
        if (web3State.isAdmin) role = 'admin';
        else if (web3State.isScorer) role = 'scorer';
        
        // Store role in web3State
        web3State.currentRole = role;
        
        // Disable role simulator when real wallet is connected
        disableRoleSimulator();
        
        // Show detected role
        updateRoleDisplay(role);
        
        applyRoleVisibility(role);

    } catch (error) {
        console.error('Error checking roles:', error);
    }
}

// ============================================
// UI UPDATES
// ============================================

function disableRoleSimulator() {
    // Update connection status - handled by updateRoleDisplay
}

function updateRoleDisplay(role) {
    const roleElement = document.getElementById('wallet-role');
    const banner = document.querySelector('.curable-banner');
    
    if (roleElement) {
        const roleNames = {
            'researcher': '✅ CONNECTED AS: RESEARCHER',
            'scorer': '✅ CONNECTED AS: AUTHORIZED SCORER',
            'admin': '✅ CONNECTED AS: ADMIN (CONTRACT OWNER)'
        };
        
        roleElement.textContent = roleNames[role] || '✅ WALLET CONNECTED';
        roleElement.classList.add('connected');
    }
    
    // Change banner to green when connected
    if (banner) {
        banner.classList.add('connected');
    }
}

function updateConnectionStatus(isConnected, role = null) {
    const roleElement = document.getElementById('wallet-role');
    const banner = document.querySelector('.curable-banner');
    
    if (roleElement) {
        if (isConnected && role) {
            updateRoleDisplay(role);
        } else if (!isConnected) {
            roleElement.textContent = '❌ NOT CONNECTED';
            roleElement.classList.remove('connected');
            
            // Change banner to purple when disconnected
            if (banner) {
                banner.classList.remove('connected');
            }
        }
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connect-btn');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.querySelector('.wallet-address');

    if (web3State.isConnected && web3State.address) {
        // Hide connect button, show wallet info
        if (connectBtn) connectBtn.style.display = 'none';
        if (walletInfo) {
            walletInfo.style.display = 'flex';
            if (walletAddress) {
                const short = `${web3State.address.slice(0, 6)}...${web3State.address.slice(-4)}`;
                walletAddress.textContent = short;
            }
        }
    } else {
        // Show connect button, hide wallet info
        if (connectBtn) connectBtn.style.display = 'block';
        if (walletInfo) walletInfo.style.display = 'none';
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        disconnectWallet();
    } else {
        // Account changed, reconnect
        window.location.reload();
    }
}

function handleChainChanged(chainId) {
    // Reload page on chain change
    window.location.reload();
}

// ============================================
// CONTRACT INTERACTIONS
// ============================================

// Submit Proposal
async function submitProposal(title, description, ipfsHash) {
    try {
        if (!web3State.isConnected) {
            alert('Please connect your wallet first!');
            return null;
        }

        showLoading('Submitting proposal to blockchain...');

        // Contract signature: submitProposal(string title, string description, string ipfsHash)
        const tx = await web3State.contracts.antScoring.submitProposal(
            title,
            description,
            ipfsHash || ''
        );

        showLoading('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        // Extract proposal ID from event
        const event = receipt.logs.find(log => {
            try {
                const parsed = web3State.contracts.antScoring.interface.parseLog(log);
                return parsed && parsed.name === 'ProposalSubmitted';
            } catch {
                return false;
            }
        });

        let proposalId = null;
        if (event) {
            const parsed = web3State.contracts.antScoring.interface.parseLog(event);
            proposalId = parsed.args.proposalId.toString();
        }

        hideLoading();
        alert(
            `✅ Proposal Submitted Successfully!\n\n` +
            `Proposal ID: #${proposalId || 'Check Etherscan'}\n` +
            `Transaction: ${receipt.hash}\n\n` +
            `View on Etherscan:\n${CONTRACTS.NETWORK.explorerUrl}/tx/${receipt.hash}`
        );

        return proposalId;

    } catch (error) {
        hideLoading();
        console.error('Error submitting proposal:', error);
        
        let errorMsg = error.message;
        if (error.reason) errorMsg = error.reason;
        else if (error.data?.message) errorMsg = error.data.message;
        
        alert(`❌ Transaction Failed:\n\n${errorMsg}`);
        return null;
    }
}

// Score Proposal
async function scoreProposal(proposalId, score) {
    try {
        if (!web3State.isConnected) {
            alert('Please connect your wallet first!');
            return false;
        }

        if (!web3State.isScorer && !web3State.isAdmin) {
            alert('❌ You are not an authorized scorer!');
            return false;
        }

        showLoading(`Submitting score for proposal #${proposalId}...`);

        // Convert single score to all 5 categories (evenly distributed)
        // Contract expects: ScientificMerit, Feasibility, CommunityAlignment, ResourceEfficiency, OpenScience
        const scientificMerit = {
            novelty: score,
            biologicalPlausibility: score,
            priorEvidence: score
        };
        
        const feasibility = {
            technicalViability: score,
            dataQuality: score,
            clarityOfProtocol: score
        };
        
        const communityAlignment = {
            missionFit: score,
            daoEngagement: score
        };
        
        const resourceEfficiency = {
            costEffectiveness: score,
            agenticResourceUse: score
        };
        
        const openScience = {
            dataProtocolSharing: score,
            collaborativePotential: score
        };

        const tx = await web3State.contracts.antScoring.scoreProposal(
            proposalId,
            scientificMerit,
            feasibility,
            communityAlignment,
            resourceEfficiency,
            openScience
        );

        showLoading('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        hideLoading();
        alert(
            `✅ Score Submitted Successfully!\n\n` +
            `Proposal ID: #${proposalId}\n` +
            `Your Score: ${score}/100\n` +
            `Transaction: ${receipt.hash}\n\n` +
            `View on Etherscan:\n${CONTRACTS.NETWORK.explorerUrl}/tx/${receipt.hash}`
        );

        return true;

    } catch (error) {
        hideLoading();
        console.error('Error scoring proposal:', error);
        
        let errorMsg = error.message;
        if (error.reason) errorMsg = error.reason;
        else if (error.data?.message) errorMsg = error.data.message;
        
        alert(`❌ Transaction Failed:\n\n${errorMsg}`);
        return false;
    }
}

// Fulfill Proposal (Claim Badge)
async function fulfillProposal(proposalId) {
    try {
        if (!web3State.isConnected) {
            alert('Please connect your wallet first!');
            return false;
        }

        showLoading(`Fulfilling proposal #${proposalId} and claiming badge...`);

        const tx = await web3State.contracts.antScoring.fulfillProposal(proposalId);

        showLoading('⏳ Minting your LAB Badge NFT...');
        const receipt = await tx.wait();

        hideLoading();
        alert(
            `🎉 Proposal Fulfilled!\n\n` +
            `Congratulations! You've earned a research badge!\n\n` +
            `Proposal ID: #${proposalId}\n` +
            `Transaction: ${receipt.hash}\n\n` +
            `Your soulbound NFT badge has been minted!\n\n` +
            `View on Etherscan:\n${CONTRACTS.NETWORK.explorerUrl}/tx/${receipt.hash}`
        );

        // Reload page to show new badge
        setTimeout(() => window.location.reload(), 2000);

        return true;

    } catch (error) {
        hideLoading();
        console.error('Error fulfilling proposal:', error);
        
        let errorMsg = error.message;
        if (error.reason) errorMsg = error.reason;
        else if (error.data?.message) errorMsg = error.data.message;
        
        alert(`❌ Transaction Failed:\n\n${errorMsg}`);
        return false;
    }
}

// Get Proposal Info
async function getProposalInfo(proposalId) {
    try {
        const info = await web3State.contracts.antScoring.getProposalInfo(proposalId);
        return {
            id: info.id.toString(),
            creator: info.creator,
            protocol: info.protocol,
            ipfs: info.ipfs,
            totalScore: info.totalScore.toString(),
            numScores: info.numScores.toString(),
            fulfilled: info.fulfilled,
            averageScore: info.numScores > 0 ? 
                Math.floor(Number(info.totalScore) / Number(info.numScores)) : 0
        };
    } catch (error) {
        console.error('Error getting proposal info:', error);
        return null;
    }
}

// Get User Badges
async function getUserBadges(address) {
    try {
        const badges = await web3State.contracts.labBadge.getContributorBadges(address);
        const badgeDetails = [];

        for (const tokenId of badges) {
            const level = await web3State.contracts.labBadge.getBadgeLevel(tokenId);
            badgeDetails.push({
                tokenId: tokenId.toString(),
                level: Number(level),
                ...BADGE_INFO[Number(level)]
            });
        }

        return badgeDetails;
    } catch (error) {
        console.error('Error getting badges:', error);
        return [];
    }
}

// ============================================
// LOADING OVERLAY
// ============================================

function showLoading(message) {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            padding: 20px;
        `;
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div>${message}</div>`;
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize connection status as NOT CONNECTED
    updateConnectionStatus(false);
    
    // Add connect button handler
    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
    }

    // Auto-reconnect if wallet was previously connected
    // Small delay to ensure page is fully loaded
    setTimeout(async () => {
        if (window.ethereum && window.ethereum.selectedAddress) {
            console.log('🔄 Auto-reconnecting wallet...');
            await connectWallet();
        } else {
            // No wallet connected, show default "none" state
            applyRoleVisibility('none');
            updateConnectionStatus(false);
        }
    }, 100);
});

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.submitProposal = submitProposal;
window.scoreProposal = scoreProposal;
window.fulfillProposal = fulfillProposal;
window.getProposalInfo = getProposalInfo;
window.getUserBadges = getUserBadges;

