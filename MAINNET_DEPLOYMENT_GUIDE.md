# 🚀 ANT Scoring System - Mainnet Deployment Guide

This guide provides step-by-step instructions for deploying the ANT (Algorithmic Network Triage) Scoring System to Aptos mainnet without changing any core functionality.

## ✅ **Issues Fixed**

### 1. **Git Merge Conflicts Resolved**
- ❌ **Old**: Multiple merge conflicts in Move files preventing compilation
- ✅ **Fixed**: Created clean production-ready Move modules:
  - `sources/clean_deploy_ready.move` - Main deployment contract
  - `sources/clean_minimal_tri_lane.move` - Tri-lane tokenomics
  - `sources/clean_ant_scoring.move` - Core ANT scoring logic

### 2. **CSS Compatibility Fixed**
- ❌ **Old**: Missing standard `background-clip` property warnings
- ✅ **Fixed**: Added cross-browser compatibility for all gradient text effects

### 3. **Move Code Improvements**
- ✅ **Added**: Proper error codes and constants
- ✅ **Added**: Input validation and safety checks
- ✅ **Added**: Real timestamp usage instead of hardcoded values
- ✅ **Added**: Comprehensive view functions
- ✅ **Improved**: Code organization and documentation

## 🔧 **Pre-Deployment Requirements**

### 1. **Environment Setup**
```bash
# Install Aptos CLI (if not already installed)
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Verify installation
aptos --version
```

### 2. **Account Setup**
```bash
# Option A: Create new mainnet account
aptos init --network mainnet

# Option B: Use existing account with private key
export APTOS_PRIVATE_KEY="your_private_key_hex_here"
```

### 3. **Fund Account**
- **Required**: At least 0.1 APT for deployment costs
- **Recommended**: 1+ APT for testing and operations
- Purchase APT from major exchanges (Binance, Coinbase, etc.)
- Transfer to your deployment address

## 📦 **Deployment Process**

### Step 1: Prepare Clean Modules
```bash
# Verify clean modules exist
ls -la sources/clean_*.move

# Should show:
# clean_ant_scoring.move      - Core ANT scoring system
# clean_deploy_ready.move     - Main deployment contract  
# clean_minimal_tri_lane.move - Tri-lane tokenomics
```

### Step 2: Configure for Mainnet
```bash
# Copy mainnet configuration
cp Move-mainnet.toml Move.toml

# Update package address (will be your address)
aptos init --network mainnet
# Note the address - update Move.toml if needed
```

### Step 3: Compile Modules
```bash
# Compile all clean modules
aptos move compile --named-addresses ant_scoring=YOUR_ADDRESS_HERE

# Should output: "Compiling, may take a little while to download dependencies..."
# Success: "package size X bytes"
```

### Step 4: Deploy to Mainnet
```bash
# Deploy modules (MAINNET - IRREVERSIBLE!)
aptos move publish --named-addresses ant_scoring=YOUR_ADDRESS_HERE

# Confirm deployment
aptos move view --function-id "YOUR_ADDRESS::clean_ant_scoring::get_system_info"
```

### Step 5: Initialize Contracts
```bash
# Initialize ANT Scoring System
aptos move run \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::initialize" \
  --profile mainnet

# Initialize Tri-Lane System  
aptos move run \
  --function-id "YOUR_ADDRESS::clean_minimal_tri_lane::initialize" \
  --profile mainnet
```

### Step 6: Verify Deployment
```bash
# Check contract state
aptos move view \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::get_system_info"

# Check account resources
aptos account list --query resources --profile mainnet
```

## 🛡️ **Security & Best Practices**

### 1. **Private Key Security**
```bash
# ✅ DO: Use environment variables
export APTOS_PRIVATE_KEY="your_key"

# ❌ DON'T: Hardcode keys in files
# ❌ DON'T: Commit keys to git
# ❌ DON'T: Share keys in chat/email
```

### 2. **Deployment Testing**
```bash
# Test on devnet first
aptos init --network devnet
aptos move publish --profile devnet

# Only deploy to mainnet after thorough testing
```

### 3. **Module Verification**
```bash
# Verify module bytecode matches source
aptos move verify --named-addresses ant_scoring=YOUR_ADDRESS

# Check explorer
open "https://explorer.aptoslabs.com/account/YOUR_ADDRESS?network=mainnet"
```

## 📊 **Post-Deployment Setup**

### 1. **Frontend Configuration**
Update your frontend files with the new mainnet addresses:

```javascript
// In HTML/JS files, update:
const MAINNET_CONFIG = {
    moduleAddress: "YOUR_DEPLOYED_ADDRESS",
    nodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1",
    network: "mainnet"
};
```

### 2. **Add Authorized Scorers**
```bash
# Add authorized scorers (admin only)
aptos move run \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::add_authorized_scorer" \
  --args address:SCORER_ADDRESS_1 \
  --profile mainnet

aptos move run \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::add_authorized_scorer" \
  --args address:SCORER_ADDRESS_2 \
  --profile mainnet
```

### 3. **Test Core Functions**
```bash
# Test proposal submission
aptos move run \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::submit_proposal" \
  --args string:"Test Proposal" string:"Test Description" string:"QmTestIPFS" \
  --profile mainnet

# Verify proposal exists
aptos move view \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::get_proposal_info" \
  --args address:YOUR_ADDRESS
```

## 📈 **Monitoring & Maintenance**

### 1. **Transaction Monitoring**
- Monitor all contract interactions via Aptos Explorer
- Set up alerts for unusual activity
- Track gas costs and optimize if needed

### 2. **Regular Health Checks**
```bash
# Weekly system status check
aptos move view \
  --function-id "YOUR_ADDRESS::clean_ant_scoring::get_system_info"

# Check active proposals
aptos account list --query resources --profile mainnet
```

### 3. **Backup & Recovery**
- **Private Keys**: Secure backup in multiple locations
- **Contract State**: Regular snapshots via explorer
- **Transaction History**: Monitor and log all interactions

## 🚨 **Troubleshooting**

### Common Issues & Solutions

**1. Compilation Errors**
```bash
# Error: "Package doesn't exist"
# Solution: Check Move.toml addresses match your deployment address

# Error: "Dependency not found" 
# Solution: Ensure AptosFramework dependency is correct version
```

**2. Deployment Failures**
```bash
# Error: "Insufficient funds"
# Solution: Add more APT to deployment account

# Error: "Module already exists"
# Solution: You can only deploy once - use upgrade if needed
```

**3. Initialization Problems**
```bash
# Error: "Resource already exists"
# Solution: Contract already initialized - check state

# Error: "Not authorized"
# Solution: Only contract owner can initialize
```

## 📋 **Deployment Checklist**

### Pre-Deployment
- [ ] Account funded with sufficient APT (0.1+ APT)
- [ ] Clean Move modules compiled successfully
- [ ] Tested on devnet thoroughly
- [ ] Private keys backed up securely
- [ ] Team notified of deployment window

### Deployment
- [ ] Modules deployed to mainnet
- [ ] Contract initialization completed
- [ ] Basic functionality tested
- [ ] Authorized scorers added
- [ ] View functions working correctly

### Post-Deployment
- [ ] Frontend updated with mainnet addresses
- [ ] Explorer verification completed
- [ ] Monitoring systems configured
- [ ] Documentation updated
- [ ] Team and users notified

## 🔗 **Useful Links**

- **Aptos Explorer**: https://explorer.aptoslabs.com/
- **Aptos Docs**: https://aptos.dev/
- **Move Language**: https://move-language.github.io/
- **CLI Reference**: https://aptos.dev/tools/aptos-cli-tool/

## 🎯 **Expected Results**

After successful deployment, you'll have:

✅ **Fully Functional ANT Scoring System** on Aptos mainnet  
✅ **Three Clean Move Modules** deployed and initialized  
✅ **No Changes to Core Functionality** - all features preserved  
✅ **Production-Ready Smart Contracts** with proper error handling  
✅ **Web Interface** that works with mainnet contracts  

## 📞 **Support**

If you encounter issues during deployment:

1. Check this guide for common solutions
2. Verify all prerequisites are met
3. Test on devnet first
4. Join the Aptos Discord for technical support
5. Create GitHub issues for code-related problems

---

**🏆 Ready for Mainnet Launch!** 

Your ANT Scoring System is now production-ready with all core functionality intact and deployment-blocking issues resolved.
