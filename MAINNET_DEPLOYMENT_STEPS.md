# 🚀 MolecularDAO Protocol - Mainnet Deployment

## 📋 Pre-Deployment Checklist

### ✅ Ready for Deployment:
- **Aptos CLI**: v7.8.1 installed
- **Move Contracts**: 3 production-ready contracts in sources/
- **Demo**: Fully functional at http://localhost:7000
- **Configuration**: Move.toml configured for mainnet

---

## 💰 **Step 1: Funding Requirements**

### **📊 Estimated Costs:**
- **Contract Deployment**: ~0.05-0.1 APT per contract
- **Initialization**: ~0.01 APT per contract
- **Testing**: ~0.05 APT for operations
- **🎯 Total Needed**: ~0.5-1.0 APT

### **💵 Current APT Price**: ~$6-12 USD
### **💳 Total Cost**: ~$3-12 USD

---

## 🔧 **Step 2: Account Setup**

### **Create Mainnet Account:**
```bash
aptos init --profile mainnet --network mainnet
```

### **Get Your Address:**
```bash
aptos config show-profiles
```

### **Fund Your Account:**
1. **Buy APT tokens** from major exchanges (Binance, Coinbase, KuCoin)
2. **Transfer 1+ APT** to your deployment address
3. **Verify balance** with `aptos account list --profile mainnet`

---

## 📦 **Step 3: Contract Compilation**

### **Compile for Mainnet:**
```bash
aptos move compile --profile mainnet --named-addresses ant_scoring=YOUR_MAINNET_ADDRESS
```

### **Expected Output:**
```
Compiling, may take a little while to download git dependencies...
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING ant_scoring
{
  "Result": [
    "a7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::clean_ant_scoring",
    "a7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::clean_deploy_ready", 
    "a7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::clean_minimal_tri_lane"
  ]
}
```

---

## 🚀 **Step 4: Contract Deployment**

### **Deploy to Mainnet:**
```bash
aptos move publish --profile mainnet --named-addresses ant_scoring=YOUR_MAINNET_ADDRESS
```

### **Expected Deployment Process:**
1. **Gas Estimation**: CLI shows estimated gas costs
2. **Confirmation**: Press 'y' to confirm deployment
3. **Transaction Processing**: Wait for blockchain confirmation
4. **Success Message**: Contract addresses displayed

---

## ⚙️ **Step 5: Contract Initialization** 

### **Initialize ANT Scoring System:**
```bash
aptos move run --profile mainnet --function-id "YOUR_ADDRESS::clean_ant_scoring::initialize"
```

### **Initialize Tri-Lane System:**
```bash  
aptos move run --profile mainnet --function-id "YOUR_ADDRESS::clean_minimal_tri_lane::initialize"
```

### **Initialize Deploy Ready:**
```bash
aptos move run --profile mainnet --function-id "YOUR_ADDRESS::clean_deploy_ready::initialize"
```

---

## 🧪 **Step 6: Verification**

### **Check Deployed Modules:**
```bash
aptos account list --query modules --profile mainnet
```

### **Check Resources:**
```bash
aptos account list --query resources --profile mainnet
```

### **Test Contract Function:**
```bash
# Test lab credit issuance
aptos move run --profile mainnet --function-id "YOUR_ADDRESS::clean_deploy_ready::issue_lab_credit" --args string:"Test Molecule"
```

---

## 🌐 **Step 7: Frontend Integration**

### **Update Demo Configuration:**
```javascript
// Update in americas-next-top-curable-blockchain.html
const MAINNET_CONFIG = {
    moduleAddress: "YOUR_DEPLOYED_ADDRESS", 
    nodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1",
    network: "mainnet",
    enabled: true // Switch from simulation to blockchain
};
```

### **Enable Blockchain Mode:**
```javascript
// Update blockchain toggle
blockchainMode.enabled = true;
blockchainMode.connected = true;
```

---

## 🎯 **Step 8: Final Testing**

### **End-to-End Test:**
1. **Lane 1**: Submit molecule → Real blockchain ANT score
2. **Lane 2**: CURE token acquisition → Real token transfers  
3. **Lane 3**: SubDAO creation → Real on-chain DAO deployment

### **Verify on Explorer:**
- **Mainnet Explorer**: https://explorer.aptoslabs.com/
- **Search Your Address**: Check transactions and modules
- **Verify Contract State**: Confirm initialization success

---

## 🏆 **Step 9: Hackathon Submission Update**

### **Update Submission Materials:**
1. **Live Mainnet Demo**: Update demo URL with mainnet integration
2. **Contract Addresses**: Add deployed addresses to presentation
3. **Explorer Links**: Include Aptos explorer transaction links
4. **Mainnet Proof**: Screenshots of successful deployment

---

## 📊 **Deployment Timeline:**
- **Setup + Funding**: 15-30 minutes
- **Compilation**: 2-3 minutes  
- **Deployment**: 5-10 minutes
- **Initialization**: 3-5 minutes
- **Testing**: 10-15 minutes
- **🎯 Total Time**: 35-60 minutes

---

## 🔥 **Post-Deployment Benefits:**

### **🏆 Hackathon Advantages:**
- **Real Blockchain Integration**: Not just simulation
- **Mainnet Credibility**: Production deployment shows seriousness
- **Technical Excellence**: Live Move contracts on mainnet
- **Judge Appeal**: Fully functional DeFi protocol

### **💰 Prize Impact:**
- **Main Track**: Significantly higher scoring potential
- **Best Tech**: Move contracts + mainnet deployment  
- **Partner Bounties**: Real Circle/Kana Labs integration
- **University**: Technical sophistication bonus

---

## ⚠️ **Important Notes:**

### **💸 Cost Management:**
- **Start Small**: Test with minimum funding first
- **Monitor Costs**: Track gas usage during testing
- **Reserve Buffer**: Keep extra APT for operations

### **🛡️ Security:**
- **Private Keys**: Keep secure, never share
- **Test First**: Verify all functions before heavy usage
- **Backup**: Save private keys securely

---

**🎯 Ready to deploy your MolecularDAO Protocol to mainnet? Let's start with account setup and funding!**
