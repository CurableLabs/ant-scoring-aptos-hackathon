# 🚀 DEPLOY NOW - Petra Wallet Ready!

## ✅ Ready Status:
- **Petra Wallet**: `0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc`
- **Balance**: APT available ✅
- **Contracts**: Compiled successfully ✅
- **Status**: READY TO DEPLOY! 🎯

---

## 🔑 **Step 1: Export Petra Private Key (30 seconds)**

### **In Your Petra Wallet:**
1. Click **Petra Extension** (browser)
2. Click **Settings** (⚙️ gear icon)
3. Go to **Account Management** 
4. Click **Export Private Key**
5. **Copy the private key** (starts with `0x...`)

---

## ⚙️ **Step 2: Import to CLI (30 seconds)**

### **Run This Command:**
```bash
aptos init --profile petra --network mainnet --private-key [PASTE_YOUR_PRIVATE_KEY_HERE]
```

### **Expected Output:**
```
Aptos CLI is now set up for account 0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc as profile petra!
```

---

## 🚀 **Step 3: Deploy MolecularDAO Protocol (2-5 minutes)**

### **Deploy Command:**
```bash
aptos move publish --profile petra --named-addresses ant_scoring=0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc
```

### **What Happens:**
1. **Gas Estimation**: Shows deployment cost
2. **Confirmation**: Press `y` to confirm
3. **Deployment**: Contracts deploy to mainnet
4. **Success**: Module addresses displayed

---

## ⚙️ **Step 4: Initialize Systems (1-2 minutes)**

### **Initialize Commands:**
```bash
# ANT Scoring System
aptos move run --profile petra --function-id "0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc::clean_ant_scoring::initialize"

# Tri-Lane System  
aptos move run --profile petra --function-id "0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc::clean_minimal_tri_lane::initialize"

# Deploy Ready
aptos move run --profile petra --function-id "0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc::clean_deploy_ready::initialize"
```

---

## 🧪 **Step 5: Verify Success (1 minute)**

### **Check Deployment:**
```bash
aptos account list --query modules --profile petra
```

### **Check Initialization:**
```bash
aptos account list --query resources --profile petra
```

---

## 🌐 **Step 6: Connect Frontend to Mainnet**

### **Update Demo Configuration:**
```javascript
// Update in americas-next-top-curable-blockchain.html
const MAINNET_CONFIG = {
    moduleAddress: "0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc",
    nodeUrl: "https://fullnode.mainnet.aptoslabs.com/v1",
    network: "mainnet"
};

// Enable blockchain mode
blockchainMode.enabled = true;
```

---

## 🏆 **Total Deployment Time: 5-10 minutes**

### **Timeline:**
- **Private Key Export**: 30 seconds
- **CLI Configuration**: 30 seconds  
- **Contract Deployment**: 2-5 minutes
- **System Initialization**: 1-2 minutes
- **Verification**: 1 minute
- **🎯 Total**: 5-10 minutes to live mainnet!

---

## 🎊 **After Deployment Success:**

### **You'll Have:**
- **Live MolecularDAO Protocol** on Aptos mainnet
- **Real CURE governance tokens** with USDC backing
- **Functional SubDAO creation** for disease research
- **Professional Kana Labs trading** with real price discovery
- **First biotech+DeFi protocol** on Aptos! 🥇

### **Hackathon Impact:**
- **Mainnet Credibility**: Real production deployment
- **Technical Excellence**: Live Move contracts  
- **Judge Appeal**: Not simulation - actual DeFi protocol
- **Multiple Prizes**: Main + technical + partner bounties

---

## 🎯 **Ready to Deploy?**

**All you need to do:**
1. **Export private key** from Petra wallet (30 seconds)
2. **Paste into CLI command** (30 seconds)
3. **Run deployment** (5 minutes)
4. **🎉 MolecularDAO Protocol LIVE on mainnet!**

**Your winning hackathon project will be the first of its kind on Aptos mainnet! 🏆**
