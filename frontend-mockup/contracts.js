// ============================================
// DEPLOYED CONTRACT ADDRESSES & ABIs
// Sepolia Testnet
// ============================================

const CONTRACTS = {
    // Network Configuration
    NETWORK: {
        name: 'Sepolia Testnet',
        chainId: 11155111,
        chainIdHex: '0xaa36a7',
        rpcUrl: 'https://0xrpc.io/sep',
        explorerUrl: 'https://sepolia.etherscan.io'
    },
    
    // Deployed Contract Addresses
    ADDRESSES: {
        CUREToken: '0xDC2d8F77d22495A2298A02Ec5c8185aCE53F59E8',
        TriLaneSystem: '0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE',
        ANTScoring: '0xd2Df767CA136447a32a72e03AE1Fd8652755859f',
        BondingCurve2: '0xC011916CB5472FddAe71D73216Be6DbbE8fc6383',
        CUREIntegration: '0x6E661dB5b604623A4cC736EF555E80A132669e97'
    },
    
    // Contract ABIs (Essential Functions Only)
    ABIS: {
        ANTScoring: [
            // Submit Proposal
            {
                "type": "function",
                "name": "submitProposal",
                "inputs": [
                    {"name": "protocolDesc", "type": "string"},
                    {"name": "ipfsHash", "type": "string"},
                    {"name": "scorers", "type": "address[]"}
                ],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable"
            },
            // Score Proposal
            {
                "type": "function",
                "name": "scoreProposal",
                "inputs": [
                    {"name": "proposalId", "type": "uint256"},
                    {"name": "scoreValue", "type": "uint256"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            // Fulfill Proposal
            {
                "type": "function",
                "name": "fulfillProposal",
                "inputs": [
                    {"name": "proposalId", "type": "uint256"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            // Get Proposal Info
            {
                "type": "function",
                "name": "getProposalInfo",
                "inputs": [
                    {"name": "proposalId", "type": "uint256"}
                ],
                "outputs": [
                    {"name": "id", "type": "uint256"},
                    {"name": "creator", "type": "address"},
                    {"name": "protocol", "type": "string"},
                    {"name": "ipfs", "type": "string"},
                    {"name": "totalScore", "type": "uint256"},
                    {"name": "numScores", "type": "uint256"},
                    {"name": "fulfilled", "type": "bool"}
                ],
                "stateMutability": "view"
            },
            // Check if Authorized Scorer
            {
                "type": "function",
                "name": "isAuthorizedScorer",
                "inputs": [
                    {"name": "scorer", "type": "address"}
                ],
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "view"
            },
            // Get Active Proposal Count
            {
                "type": "function",
                "name": "activeProposalCount",
                "inputs": [],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view"
            },
            // Get Proposal Counter
            {
                "type": "function",
                "name": "proposalCounter",
                "inputs": [],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view"
            },
            // Owner
            {
                "type": "function",
                "name": "owner",
                "inputs": [],
                "outputs": [{"name": "", "type": "address"}],
                "stateMutability": "view"
            },
            // Add Authorized Scorer
            {
                "type": "function",
                "name": "addAuthorizedScorer",
                "inputs": [
                    {"name": "scorer", "type": "address"}
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            // Events
            {
                "type": "event",
                "name": "ProposalSubmitted",
                "inputs": [
                    {"name": "proposalId", "type": "uint256", "indexed": true},
                    {"name": "creator", "type": "address", "indexed": true}
                ]
            },
            {
                "type": "event",
                "name": "ProposalScored",
                "inputs": [
                    {"name": "proposalId", "type": "uint256", "indexed": true},
                    {"name": "scorer", "type": "address", "indexed": true},
                    {"name": "score", "type": "uint256", "indexed": false}
                ]
            },
            {
                "type": "event",
                "name": "ProposalFulfilled",
                "inputs": [
                    {"name": "proposalId", "type": "uint256", "indexed": true},
                    {"name": "creator", "type": "address", "indexed": true}
                ]
            }
        ],
        
        TriLaneSystem: [
            // Owner
            {
                "type": "function",
                "name": "admin",
                "inputs": [],
                "outputs": [{"name": "", "type": "address"}],
                "stateMutability": "view"
            },
            // Get LabBadge Address
            {
                "type": "function",
                "name": "labBadge",
                "inputs": [],
                "outputs": [{"name": "", "type": "address"}],
                "stateMutability": "view"
            },
            // Issue Badge
            {
                "type": "function",
                "name": "issueBadge",
                "inputs": [
                    {"name": "recipient", "type": "address"},
                    {"name": "credentials", "type": "bytes"},
                    {"name": "level", "type": "uint8"}
                ],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable"
            }
        ],
        
        LabBadge: [
            // Balance Of
            {
                "type": "function",
                "name": "balanceOf",
                "inputs": [
                    {"name": "owner", "type": "address"}
                ],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view"
            },
            // Token of Owner By Index
            {
                "type": "function",
                "name": "tokenOfOwnerByIndex",
                "inputs": [
                    {"name": "owner", "type": "address"},
                    {"name": "index", "type": "uint256"}
                ],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view"
            },
            // Get Badge Level
            {
                "type": "function",
                "name": "getBadgeLevel",
                "inputs": [
                    {"name": "tokenId", "type": "uint256"}
                ],
                "outputs": [{"name": "", "type": "uint8"}],
                "stateMutability": "view"
            },
            // Get Contributor Badges
            {
                "type": "function",
                "name": "getContributorBadges",
                "inputs": [
                    {"name": "contributor", "type": "address"}
                ],
                "outputs": [{"name": "", "type": "uint256[]"}],
                "stateMutability": "view"
            },
            // Get Badge Tier Points
            {
                "type": "function",
                "name": "getTierPoints",
                "inputs": [
                    {"name": "level", "type": "uint8"}
                ],
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view"
            }
        ]
    }
};

// Badge Level Enum (matches contract)
const BADGE_LEVELS = {
    BRONZE: 0,
    SILVER: 1,
    GOLD: 2,
    PLATINUM: 3,
    DIAMOND: 4
};

// Badge Display Info
const BADGE_INFO = {
    0: { name: 'Bronze', icon: '🥉', points: 10, color: '#cd7f32' },
    1: { name: 'Silver', icon: '🥈', points: 30, color: '#c0c0c0' },
    2: { name: 'Gold', icon: '🥇', points: 50, color: '#ffd700' },
    3: { name: 'Platinum', icon: '🏆', points: 75, color: '#e5e4e2' },
    4: { name: 'Diamond', icon: '💎', points: 100, color: '#b9f2ff' }
};

// Export for use in other scripts
window.CONTRACTS = CONTRACTS;
window.BADGE_LEVELS = BADGE_LEVELS;
window.BADGE_INFO = BADGE_INFO;

