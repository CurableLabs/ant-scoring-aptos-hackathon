# 🔧 Setup & Testing Guide

Quick guide to configure and test your deployed contracts.

---

## ⚠️ REQUIRED: Post-Deployment Setup

### **Step 1: Authorize ANTScoring**

ANTScoring needs permission to issue badges.

**On Etherscan:**
1. Go to: https://sepolia.etherscan.io/address/0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE
2. Contract → Write Contract → Connect Wallet
3. Find `authorizeBadgeIssuer`
4. Enter: `0xd2Df767CA136447a32a72e03AE1Fd8652755859f`
5. Write → Confirm

**Or use command:**
```bash
cast send 0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE \
  "authorizeBadgeIssuer(address)" \
  0xd2Df767CA136447a32a72e03AE1Fd8652755859f \
  --rpc-url https://0xrpc.io/sep --private-key $PRIVATE_KEY
```

### **Step 2: Authorize Scorers**

Add addresses that can score proposals.

**On Etherscan:**
1. Go to: https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f
2. Contract → Write Contract → Connect Wallet
3. Find `authorizeScorer`
4. Enter your address
5. Write → Confirm

---

## 🧪 Testing on Etherscan

### **Test 1: Check Token Balance**

1. Go to CUREToken: https://sepolia.etherscan.io/address/0xDC2d8F77d22495A2298A02Ec5c8185aCE53F59E8
2. Contract → Read Contract → `balanceOf`
3. Enter: `0x03c7955A9168ffa6b314c5524279D717D1335074`
4. Query

### **Test 2: Submit Proposal**

1. Go to ANTScoring: https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f
2. Contract → Write Contract → Connect Wallet
3. Find `submitProposal`
4. Fill in:
   - title: "Test Proposal"
   - description: "Testing"
   - protocolDetails: "Test protocol"
   - scorers: `["0x03c7955A9168ffa6b314c5524279D717D1335074"]`
5. Write → Confirm

### **Test 3: Score Proposal**

1. Same contract → Write Contract
2. Find `scoreProposal`
3. Enter:
   - proposalId: `0`
   - noveltyScores: `(80,75,70)`
   - technicalScores: `(85,80,75)`
   - feasibilityScores: `(90,85)`
   - costScores: `(70,65)`
   - collaborativeScores: `(80,75)`
4. Write → Confirm

### **Test 4: Fulfill Proposal (Issue Badge)**

1. Same contract → Write Contract
2. Find `fulfillProposal`
3. Enter: `0`
4. Write → Confirm
5. Badge issued! 🎉

---

## ✅ Quick Commands

**Check if authorized:**
```bash
cast call 0xd2Df767CA136447a32a72e03AE1Fd8652755859f \
  "isAuthorizedScorer(address)(bool)" YOUR_ADDRESS \
  --rpc-url https://0xrpc.io/sep
```

**Check proposal count:**
```bash
cast call 0xd2Df767CA136447a32a72e03AE1Fd8652755859f \
  "totalProposals()(uint256)" \
  --rpc-url https://0xrpc.io/sep
```

---

**That's it! Contracts are ready to use.** 🚀

