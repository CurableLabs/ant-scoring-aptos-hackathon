# 🎯 ANT Scoring System - Demo Guide

**Built for Aptos Ctrl+MOVE Hackathon | Track: New Financial Products**

Welcome to the ANT (Algorithmic Network Triage) Scoring System demonstration! This guide shows you how to experience our revolutionary evaluation framework for decentralized research assessment.

## 🚀 Quick Start

### 🎮 **BEST FOR JUDGING: Instant Demo**
```bash
npm install
npm run demo
```
**Perfect for hackathon judging!** Works immediately, no blockchain setup needed.

### ⚡ **Quick Overview**
```bash
npm run demo:quick
```

### 🌐 **Advanced: Full Blockchain Demo** 
```bash
npm install
npm run compile
npm run deploy:devnet
npm run demo:blockchain
```
*Only if you want to see actual Aptos blockchain integration*

## 🎮 Demo Modes Available

### 1. 📱 Interactive CLI Demo (`npm run demo:cli`)

A **zero-setup** demo that runs entirely in your terminal. Perfect for:
- Quick demonstrations
- Understanding the scoring algorithm 
- Testing different scenarios
- No blockchain required!

**Features:**
- **Full Automated Demo**: Watch 3 proposals get evaluated by multiple scorers
- **Interactive Scoring**: Score a proposal yourself step-by-step
- **Algorithm Explorer**: Test how different scores affect outcomes
- **Benchmark Analysis**: See what it takes to reach 80% threshold

### 2. 🌐 Full Blockchain Demo (`npm run demo`)

A **complete end-to-end** demo that simulates real blockchain interactions:
- Deploys to Aptos devnet
- Submits actual proposals
- Multiple scorers evaluate proposals
- Shows real on-chain fulfillment
- Demonstrates all Move contract features

### 3. ⚡ Quick Demo (`npm run demo:quick`)

Simple info display about the system - great for quick explanations.

## 📊 What You'll See

### Scoring Process
```
📋 Research Proposal Submitted
     ↓
🔬 Multiple Expert Evaluators Score Across 5 Dimensions:
   • Scientific Merit (40%): Novelty, Bio Plausibility, Evidence
   • Feasibility (25%): Tech Viability, Data Quality, Protocol
   • Community Alignment (20%): Mission Fit, DAO Engagement  
   • Resource Efficiency (10%): Cost Effectiveness, Agentic Use
   • Open Science (5%): Data Sharing, Collaboration Potential
     ↓
📈 Scores Averaged & Weighted Final Score Calculated
     ↓
✅ 80%+ = Automatic Funding | ❌ <80% = Needs Improvement
```

### Sample Results
```
🧬 CRISPR Alzheimer's Therapy
   Scorers: 88%, 91%, 89% → Average: 89%
   Result: ✅ PASSES → 💰 10,900 APT Funding

🤖 AI Drug Discovery  
   Scorers: 79%, 82%, 81% → Average: 81%
   Result: ✅ PASSES → 💰 10,100 APT Funding

🦠 Microbiome Engineering
   Scorers: 71%, 73%, 70% → Average: 71% 
   Result: ❌ FAILS → 📝 Needs 9% Improvement
```

## 🎯 Hackathon Features Demonstrated

### ✅ Novel DeFi Primitive
- **First-of-its-kind** algorithmic research evaluation system
- Bridges traditional research evaluation with blockchain
- Creates new financial product category: **Automated Research Capital**

### ✅ Multi-Dimensional Evaluation
- **5-category ANT scoring** with scientific rigor
- **Weighted algorithm** prioritizing scientific merit (40%)
- **Transparent, reproducible** evaluation process

### ✅ Decentralized Consensus
- **Multiple independent scorers** prevent bias
- **Automatic averaging** ensures fair evaluation
- **Blockchain transparency** for all decisions

### ✅ Automated Execution
- **80% excellence threshold** for objective quality assessment
- **Smart contract evaluation** removes human bias
- **Immediate qualification** for high-quality proposals

### ✅ Move Language Benefits
- **Resource-oriented programming** prevents double-spending
- **Linear types** ensure data integrity
- **Formal verification** capabilities for critical algorithms
- **Gas efficiency** on Aptos blockchain

## 🛠️ Technical Demo Details

### CLI Demo Architecture
- **Pure TypeScript**: No blockchain dependencies
- **Interactive CLI**: Real-time user input and feedback
- **Algorithm Testing**: Explore scoring edge cases
- **Data-Driven**: Uses realistic research proposal data

### Full Demo Architecture
- **Aptos Integration**: Real Move contract deployment
- **Multi-Account Simulation**: Separate researchers, scorers, admin
- **Event Logging**: All actions recorded on-chain
- **State Management**: Persistent proposal and scoring data

### Sample Data Included
- **5 Research Proposals**: From CRISPR to Quantum Computing
- **5 Expert Scorers**: Diverse specialties and backgrounds  
- **Multiple Scenarios**: High-quality, borderline, failing proposals
- **Realistic Funding**: APT amounts based on score tiers

## 🎪 Demo Flow Options

### For Judges/Evaluators (5 minutes)
```bash
npm run demo:cli
# Choose option 1: Full Automated Demo
# Watch complete workflow with 3 proposals
```

### For Technical Audience (10 minutes)
```bash
npm run demo:cli
# Try all 4 modes:
# 1. Full Demo → 2. Interactive → 3. Algorithm Explorer → 4. Benchmark
```

### For Live Presentations (15 minutes)
```bash
# Terminal 1: Run CLI demo
npm run demo:cli

# Terminal 2: Show code
cat sources/ant_scoring.move
cat demo.ts

# Terminal 3: Deploy to testnet (if setup)
npm run deploy:devnet
npm run demo
```

## 🏆 Hackathon Judging Criteria Coverage

| Criteria | Demo Coverage |
|----------|---------------|
| **Technical Prowess** | ✅ Move language mastery, Aptos SDK integration |
| **Innovation** | ✅ Novel DeFi primitive, algorithmic research funding |
| **Problem Solving** | ✅ Addresses research funding inefficiencies |
| **Market Potential** | ✅ $100B+ research funding market addressable |
| **Presentation** | ✅ Multiple demo modes, clear workflow visualization |

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
npm install
```

**"aptos command not found" (for full demo):**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

**TypeScript compilation errors:**
```bash
npm run build
```

### Demo Data
All demo data is in `demo-data.json` - feel free to modify proposals and scoring scenarios to test different outcomes!

## 🎉 What's Next?

After running the demo:

1. **Deploy to Production**: Use `npm run deploy:mainnet` 
2. **Integrate with Frontend**: Use the TypeScript SDK utilities
3. **Customize Scoring**: Modify weights and categories in the Move contract
4. **Scale Up**: Add more scorer types and proposal categories

---

**🏆 Built for Aptos Ctrl+MOVE Hackathon**
*Creating the future of decentralized research funding with Move and Aptos!*

### Links
- [Aptos Ctrl+MOVE Hackathon](https://dorahacks.io/hackathon/aptos-ctrl-move)
- [CurableDAO](https://curabledao.org) 
- [Move Language](https://move-language.github.io/move/)

**Questions?** Open an issue or contact the team!
