# 🦋 Petra Wallet Deployment Guide

## 🎯 Your Petra Wallet Details
- **Address**: `0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc`
- **Status**: Contracts compiled successfully for this address
- **Ready**: Can deploy immediately once configured

---

## 🔧 **Option 1: Import Petra Private Key (Recommended)**

### **Step 1: Export Private Key from Petra**
1. Open **Petra Wallet** browser extension
2. Click **Settings** (gear icon)
3. Go to **Account Management**
4. Click **Export Private Key**  
5. **Copy the private key** (starts with 0x...)

### **Step 2: Configure CLI with Your Petra Key**
```bash
# Import your Petra private key
aptos init --profile petra-mainnet --network mainnet --private-key 0xYOUR_PETRA_PRIVATE_KEY
```

### **Step 3: Verify Configuration**
```bash
aptos config show-profiles
aptos account list --profile petra-mainnet
```

---

## 🔧 **Option 2: Use CLI Account + Fund It**

### **Step 1: Check Your Petra Balance**
1. Open Petra wallet
2. Check your **APT balance**
3. If you have 1+ APT, proceed to transfer

### **Step 2: Transfer APT to CLI Account**
**From Petra Wallet:**
- **Send to**: `0x68525d6513fad9151c7b1db32b017f40b32e6af4606b1b673ec982c7ae985083`
- **Amount**: 1.0 APT  
- **Network**: Aptos Mainnet

---

## 🚀 **Deployment Commands (After Setup)**

### **Using Petra Address (Option 1):**
```bash
# Deploy with your Petra address
aptos move publish --profile petra-mainnet --named-addresses ant_scoring=0xccd9878f7d4750241b2977d80da9476a9399199fe1621d40947040b0fd7df3dc
```

### **Using CLI Account (Option 2):**
```bash
# Deploy with CLI account  
aptos move publish --profile mainnet --named-addresses ant_scoring=0x68525d6513fad9151c7b1db32b017f40b32e6af4606b1b673ec982c7ae985083
```

---

## ✅ **Recommended: Option 1 (Petra Import)**

### **Why This is Better:**
- **Familiar Wallet**: You already know this address
- **Existing Balance**: May already have APT
- **Wallet Integration**: Future frontend can connect directly
- **Consistency**: Same address for development and deployment

### **Security Notes:**
- **Private Key Safety**: Only import on your secure computer
- **Temporary**: CLI only needs key for deployment
- **Backup**: Ensure you have private key backup

---

## 🎯 **Next Steps:**

1. **Choose Option**: Import Petra key (recommended) or fund CLI account
2. **Verify Funding**: Ensure 1+ APT balance
3. **Deploy**: Run deployment commands  
4. **Initialize**: Set up contract state
5. **Update Frontend**: Connect demo to mainnet

**🦋 Which option do you prefer? Option 1 (import Petra key) or Option 2 (fund CLI account)?**
