# ANT (Algorithmic Network Triage) Scoring System for Aptos

**🏆 Built for Aptos Ctrl+MOVE Hackathon - "What's Next in DeFi" Track: New Financial Products**

A revolutionary **Move-based** smart contract system implementing CurableDAO's ANT scoring methodology for evaluating scientific research proposals. This creates a novel **evaluation framework** that enables algorithmic, transparent, and decentralized assessment of research quality, with high-quality proposals (80%+ scores) qualifying for advanced consideration.

**🎯 Hackathon Track**: New Financial Products - Creating a decentralized research evaluation protocol

## 🎯 Overview

The ANT scoring system evaluates proposals using a weighted multi-dimensional framework:

- **Scientific Merit (40%)**: Novelty, Biological Plausibility, Prior Evidence
- **Feasibility (25%)**: Technical Viability, Data Quality, Clarity of Protocol
- **Community Alignment (20%)**: Mission Fit, DAO Engagement
- **Resource Efficiency (10%)**: Cost-Effectiveness, Agentic Resource Use
- **Open Science Compatibility (5%)**: Data/Protocol Sharing, Collaborative Potential

## 📋 Features

### Core Functionality
- ✅ **Proposal Submission**: Submit research proposals with IPFS metadata storage
- ✅ **Multi-Scorer Evaluation**: Multiple authorized scorers can evaluate proposals
- ✅ **Weighted Scoring**: Automatic calculation using ANT methodology weights
- ✅ **80% Threshold**: Automatic qualification when proposals reach 80% score
- ✅ **Proposal Fulfillment**: Execute qualifying proposals on-chain
- ✅ **Score Averaging**: Multiple scorer inputs are averaged for fairness

### Security & Access Control
- 🔐 **Authorization System**: Only authorized addresses can score proposals
- 🔐 **Owner Controls**: Admin functions for managing scorers and weights
- 🔐 **Input Validation**: All scores validated within 0-100 range
- 🔐 **Duplicate Prevention**: Scorers cannot score the same proposal twice

### Data Management
- 📊 **Comprehensive Tracking**: Full audit trail of all scores and scorers
- 📊 **Multiple Views**: Active proposals, passing proposals, detailed scores
- 📊 **Event Logging**: Detailed events for all major contract interactions
- 📊 **IPFS Integration**: Off-chain storage for detailed proposal data

## 🚀 Quick Start

### 🎮 **Instant Demo (No Setup Required!)**

```bash
# 1. Install dependencies (one time)
npm install

# 2. Run the demo immediately!
npm run demo
```

**That's it!** The demo runs in pure JavaScript with no blockchain setup needed.

### 🌐 **Full Blockchain Demo (Advanced)**

For the complete blockchain integration:

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Initialize Aptos account
aptos init --network devnet

# Deploy and run blockchain demo
npm run compile
npm run deploy:devnet  
npm run demo:blockchain
```

### 3. Basic Usage (TypeScript)

```typescript
import { ANTScoringHelper, createExampleScores, ANTConfig } from './antScoringUtils';
import { AptosAccount, AptosClient } from 'aptos';

// Configure for your network
const config: ANTConfig = {
    moduleAddress: "0x123...", // Your deployed module address
    nodeUrl: "https://fullnode.devnet.aptoslabs.com/v1",
    network: "devnet"
};

// Create or load account
const account = new AptosAccount(); // or load from private key
const antHelper = new ANTScoringHelper(config, account);

// Submit a proposal
const { proposalId, txHash } = await antHelper.submitProposal(
    "Novel CRISPR Therapy for Alzheimer's",
    "Investigating targeted gene editing approaches for treating neurodegeneration...",
    "QmYourIPFSHash"
);

console.log(`Proposal ${proposalId} submitted! Tx: ${txHash}`);

// Score the proposal (as authorized scorer)
const scores = createExampleScores();
const scoreTxHash = await antHelper.scoreProposal(proposalId, scores);

// Check final score
const proposal = await antHelper.getProposal(proposalId);
console.log(`Final Score: ${proposal.scores.final_score}%`);
console.log(`Passes 80% threshold: ${proposal.scores.is_passing}`);

// Fulfill if it passes
if (proposal.scores.is_passing) {
    const fulfillTxHash = await antHelper.fulfillProposal(proposalId);
    console.log(`Proposal fulfilled! Tx: ${fulfillTxHash}`);
}
```

### 4. Direct Move Function Calls

```move
// Submit a proposal
public entry fun submit_proposal(
    account: &signer,
    title: string::String,
    description: string::String,
    ipfs_hash: string::String,
)

// Score the proposal (as authorized scorer)
public entry fun score_proposal(
    account: &signer,
    proposal_id: u64,
    scientific_merit: ScientificMeritScores,  // {novelty: 85, biological_plausibility: 90, prior_evidence: 80}
    feasibility: FeasibilityScores,           // {technical_viability: 85, data_quality: 90, clarity_of_protocol: 95}
    community_alignment: CommunityAlignmentScores, // {mission_fit: 90, dao_engagement: 85}
    resource_efficiency: ResourceEfficiencyScores, // {cost_effectiveness: 80, agentic_resource_use: 85}
    open_science: OpenScienceScores           // {data_protocol_sharing: 95, collaborative_potential: 90}
)

// Fulfill passing proposal (80%+ score)
public entry fun fulfill_proposal(account: &signer, proposal_id: u64)
```

## 📊 Scoring Methodology

### Scoring Categories & Weights

| Category | Weight | Sub-Criteria |
|----------|--------|--------------|
| **Scientific Merit** | 40% | Novelty (33%), Biological Plausibility (33%), Prior Evidence (33%) |
| **Feasibility** | 25% | Technical Viability (33%), Data Quality (33%), Clarity of Protocol (33%) |
| **Community Alignment** | 20% | Mission Fit (50%), DAO Engagement (50%) |
| **Resource Efficiency** | 10% | Cost-Effectiveness (50%), Agentic Resource Use (50%) |
| **Open Science** | 5% | Data/Protocol Sharing (50%), Collaborative Potential (50%) |

### Score Calculation

```
Final Score = (
    ScientificMeritAvg × 0.40 +
    FeasibilityAvg × 0.25 +
    CommunityAlignmentAvg × 0.20 +
    ResourceEfficiencyAvg × 0.10 +
    OpenScienceAvg × 0.05
)
```

### Passing Threshold

- **Minimum Score**: 80%
- **Automatic Fulfillment**: Proposals ≥80% become eligible for fulfillment
- **Multi-Scorer Averaging**: Multiple scorer inputs are averaged for final calculation

## 🔧 Move Module Architecture

### Core Module
- `sources/ant_scoring.move` - Main Move module implementation
- `Move.toml` - Package configuration and dependencies

### Supporting Files
- `deploy.ts` - TypeScript deployment script for Aptos
- `antScoringUtils.ts` - TypeScript SDK utilities and helpers
- `package.json` - Node.js dependencies for Aptos integration

### Key Move Data Structures

```move
struct Proposal has store {
    id: u64,
    submitter: address,
    title: String,
    description: String,
    ipfs_hash: String,
    scores: ProposalScore,
    scorers: vector<address>,
    is_active: bool,
    submission_time: u64,
}

struct ProposalScore has store, copy, drop {
    scientific_merit: ScientificMeritScores,
    feasibility: FeasibilityScores,
    community_alignment: CommunityAlignmentScores,
    resource_efficiency: ResourceEfficiencyScores,
    open_science: OpenScienceScores,
    final_score: u8,
    is_passing: bool,
    is_fulfilled: bool,
    timestamp: u64,
    scorer_count: u64,
}

struct ANTScoringState has key {
    owner: address,
    curable_dao: address,
    proposal_counter: u64,
    proposals: Table<u64, Proposal>,
    authorized_scorers: SmartTable<address, bool>,
    active_proposals: vector<u64>,
    passing_proposals: vector<u64>,
    scored_proposals: Table<address, vector<u64>>,
}
```

## 🛠️ Development Setup

### Prerequisites
- Node.js ≥ 16
- Aptos CLI
- TypeScript
- Git

### Installation

```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Clone repository and install dependencies
git clone <your-repo>
cd ant-scoring-aptos
npm install

# Initialize Aptos configuration
aptos init --network devnet
```

### Compilation and Testing

```bash
# Compile Move modules
npm run compile
# or directly: aptos move compile

# Run Move unit tests
npm run test
# or directly: aptos move test

# Run TypeScript integration tests
npm run test-examples
```

### Local Development

```bash
# Start local Aptos node (if available)
aptos node run-local-testnet

# Deploy to local testnet
npm run deploy

# Deploy to devnet for testing
npm run deploy:devnet
```

### Move Testing

Create comprehensive tests in the Move module:

```move
#[test_only]
module ant_scoring::ant_scoring_tests {
    use ant_scoring::ant_scoring;
    
    #[test(admin = @0x123)]
    public fun test_proposal_submission(admin: signer) {
        // Test proposal submission
    }
    
    #[test(admin = @0x123, scorer = @0x456)]
    public fun test_scoring_functionality(admin: signer, scorer: signer) {
        // Test scoring with 80% threshold
    }
    
    #[test(admin = @0x123)]
    public fun test_multi_scorer_averaging(admin: signer) {
        // Test multiple scorer averaging
    }
}
```

## 📈 Usage Examples

### Example 1: High-Quality Proposal (Expected Pass)

```typescript
const highQualityScores = {
    scientificMerit: { novelty: 90, biologicalPlausibility: 95, priorEvidence: 85 },
    feasibility: { technicalViability: 90, dataQuality: 95, clarityOfProtocol: 90 },
    communityAlignment: { missionFit: 95, daoEngagement: 85 },
    resourceEfficiency: { costEffectiveness: 85, agenticResourceUse: 90 },
    openScience: { dataProtocolSharing: 95, collaborativePotential: 90 }
};

// Expected final score: ~91% (PASS)
```

### Example 2: Borderline Proposal (Target 80%)

```typescript
const borderlineScores = {
    scientificMerit: { novelty: 80, biologicalPlausibility: 85, priorEvidence: 80 },
    feasibility: { technicalViability: 85, dataQuality: 80, clarityOfProtocol: 85 },
    communityAlignment: { missionFit: 85, daoEngagement: 80 },
    resourceEfficiency: { costEffectiveness: 75, agenticResourceUse: 80 },
    openScience: { dataProtocolSharing: 80, collaborativePotential: 85 }
};

// Expected final score: ~81.25% (PASS)
```

### Example 3: Below Threshold Proposal

```typescript
const belowThresholdScores = {
    scientificMerit: { novelty: 70, biologicalPlausibility: 75, priorEvidence: 65 },
    feasibility: { technicalViability: 70, dataQuality: 75, clarityOfProtocol: 80 },
    communityAlignment: { missionFit: 75, daoEngagement: 70 },
    resourceEfficiency: { costEffectiveness: 65, agenticResourceUse: 70 },
    openScience: { dataProtocolSharing: 75, collaborativePotential: 80 }
};

// Expected final score: ~72% (FAIL)
```

## 🔒 Security Considerations

- **Access Control**: Only authorized scorers can submit scores
- **Input Validation**: All scores must be within 0-100 range
- **Double-Scoring Prevention**: Scorers cannot score the same proposal twice
- **Score Immutability**: Scores cannot be modified after submission
- **Admin Functions**: Owner can manage scorers and system parameters

## 🏆 Aptos Ctrl+MOVE Hackathon Integration

### 🎯 Track: New Financial Products
This project creates a **novel DeFi primitive** that bridges traditional research funding with decentralized finance:

**Innovation**: 
- **Algorithmic Research Evaluation**: First-of-its-kind automated scoring system for scientific proposals
- **Transparent Funding**: Multi-dimensional evaluation with public scoring and 80% threshold
- **Decentralized Science (DeSci)**: Leveraging blockchain for fair, efficient research funding
- **Capital Efficiency**: Automated fulfillment reduces operational overhead

**DeFi Applications**:
- **Research Funding Pools**: Automated allocation based on algorithmic scoring
- **Yield Generation**: Stake tokens to earn rewards from funded research outcomes
- **Governance Tokens**: ANT token holders vote on scoring parameters and authorized evaluators
- **Liquidity Mining**: Incentivize quality proposals and accurate scoring

### 🔗 Move Language Advantages
- **Resource-Oriented**: Proposals and scores are resources that cannot be duplicated or lost
- **Safety First**: Move's linear types prevent double-spending and ensure data integrity
- **Gas Efficiency**: Optimized execution on Aptos for cost-effective research funding
- **Formal Verification**: Mathematical proofs of correctness for scoring algorithms

## 🌐 Integration with CurableDAO

This Move module integrates seamlessly with CurableDAO's ecosystem:

1. **Governance**: DAO can vote to authorize/revoke scorers using Move governance modules
2. **Treasury**: Fulfilled proposals trigger automatic funding from Aptos-based treasury
3. **Community**: Public scoring promotes transparency with on-chain verification
4. **IPFS**: Detailed proposals stored off-chain for efficiency while maintaining integrity

## 📝 License

MIT License - Open source for the benefit of scientific research and collaboration.

## 🤝 Contributing

1. Fork the repository
2. Create feature branches
3. Add comprehensive tests
4. Submit pull requests with detailed descriptions

## 📞 Support

For technical support or questions:
- Create GitHub issues for bugs/features
- Join CurableDAO Discord for community discussion
- Contact the development team for integration support

---

**🏆 Built for Aptos Ctrl+MOVE Hackathon | 🧬 Powered by CurableDAO**

*Advancing scientific research through decentralized evaluation and funding on the Aptos blockchain*

**Links:**
- [Aptos Ctrl+MOVE Hackathon](https://dorahacks.io/hackathon/aptos-ctrl-move)  
- [CurableDAO](https://curabledao.org)
- [Aptos Network](https://aptoslabs.com)
- [Move Language](https://move-language.github.io/move/)

**Track**: New Financial Products - Creating the future of decentralized research funding
