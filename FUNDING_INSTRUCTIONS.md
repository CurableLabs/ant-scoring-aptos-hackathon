# 💰 Mainnet Account Funding Instructions

## 🎯 Your Mainnet Account Details
- **Address**: `0x68525d6513fad9151c7b1db32b017f40b32e6af4606b1b673ec982c7ae985083`
- **Network**: Aptos Mainnet
- **Status**: Created, awaiting funding

---

## 💵 **Step 1: Buy APT Tokens**

### **Recommended Exchanges:**
1. **Binance**: Largest APT trading volume
2. **Coinbase**: US-friendly, easy KYC
3. **KuCoin**: Global access
4. **Gate.io**: Alternative option
5. **OKX**: High liquidity

### **Purchase Amount:**
- **Minimum**: 0.5 APT (~$3-6)
- **Recommended**: 1.0 APT (~$6-12)
- **Safe Buffer**: 2.0 APT (~$12-24)

---

## 📤 **Step 2: Transfer to Your Mainnet Account**

### **Transfer Details:**
- **Recipient Address**: `0x68525d6513fad9151c7b1db32b017f40b32e6af4606b1b673ec982c7ae985083`
- **Network**: Aptos Mainnet (NOT devnet!)
- **Amount**: 1.0+ APT tokens

### **⚠️ CRITICAL: Verify Network**
- **✅ Correct**: Aptos Mainnet
- **❌ Wrong**: Aptos Devnet, Ethereum, BSC, etc.

---

## 🔍 **Step 3: Verify Funding**

### **Check Balance:**
```bash
aptos account list --profile mainnet
```

### **Expected Result:**
```json
{
  "Result": [
    {
      "coin": {
        "value": "100000000"  // 1 APT = 100,000,000 Octas
      },
      "coin_type": "0x1::aptos_coin::AptosCoin"
    }
  ]
}
```

---

## 🚨 **Troubleshooting**

### **If Transfer Doesn't Appear:**
1. **Wait**: Transfers can take 1-5 minutes
2. **Check Network**: Ensure you sent to Aptos Mainnet
3. **Verify Address**: Double-check the recipient address
4. **Contact Exchange**: If transfer is stuck

### **If Balance Shows Zero:**
- **Network Mismatch**: Sent to wrong network  
- **Address Error**: Sent to wrong address
- **Time Delay**: Wait up to 10 minutes

---

## ⏭️ **Next: Contract Deployment**

Once funded, we'll proceed with:
1. **Compile Contracts**: `aptos move compile --profile mainnet`
2. **Deploy Contracts**: `aptos move publish --profile mainnet`  
3. **Initialize System**: Run initialization functions
4. **Update Frontend**: Connect demo to mainnet contracts

---

## 💡 **Cost Breakdown**

| **Operation** | **Estimated Cost** | **Purpose** |
|---------------|-------------------|-------------|
| **3 Contract Deployment** | ~0.15 APT | Deploy Move modules |
| **3 Contract Initialize** | ~0.03 APT | Initialize state |
| **Testing & Operations** | ~0.07 APT | Verify functionality |
| **Buffer** | ~0.25 APT | Safety margin |
| **🎯 Total** | **~0.5 APT** | **Complete deployment** |

---

## 🏆 **After Funding Success:**

### **Ready for:**
- ✅ Contract compilation and deployment
- ✅ System initialization  
- ✅ Frontend integration with mainnet
- ✅ Full production MolecularDAO Protocol!

**💫 Your MolecularDAO Protocol will be the first multi-token governance system for molecular research on Aptos mainnet!**
