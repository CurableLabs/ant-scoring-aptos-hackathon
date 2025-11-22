# ⚡ Quick Start - Web3 Frontend Testing

**Get your team testing in 5 minutes!**

---

## 🎯 What This Is

A **fully functional Web3 frontend** connected to your deployed Sepolia contracts.

Team members can:
- Connect wallets (MetaMask/Rabby)
- Submit real proposals
- Score proposals
- Earn NFT badges

---

## 🚀 Setup (3 Steps)

### **1. Get a Wallet**
- Install **MetaMask**: https://metamask.io/download/
- Or **Rabby**: https://rabby.io/

### **2. Get Sepolia ETH**
- Alchemy Faucet: https://sepoliafaucet.com/
- Get **0.05-0.1 ETH** (free testnet funds)

### **3. Open the App**
- Navigate to `frontend-mockup/` folder
- Double-click `index.html`
- Click **"Connect Wallet"**
- Done! ✅

---

## 🎮 Testing Workflows

### **Submit a Proposal:**
1. Connect wallet
2. Click "Submit" → Fill form
3. Select 3 scorers (checkboxes)
4. Submit → Confirm in MetaMask
5. Get proposal ID!

### **Score a Proposal:**
*(Requires admin to authorize you as scorer first)*
1. Connect wallet
2. Click "Score"
3. Adjust slider (0-100)
4. Submit → Confirm in MetaMask
5. Score recorded on-chain!

### **Claim Badge:**
1. Submit proposal
2. Get 3 scores (avg ≥ 80)
3. Go to Profile
4. Click "Fulfill & Claim Badge"
5. NFT minted! 🎉

---

## 🔑 Admin Access

**Admin Address:** `0x03c7955A9168ffa6b314c5524279D717D1335074`

**To authorize a scorer:**
1. Go to Etherscan: https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f#writeContract
2. Connect wallet
3. Find `addAuthorizedScorer`
4. Enter their address
5. Write → Confirm

---

## ❓ Common Issues

| Problem | Solution |
|---------|----------|
| "Install MetaMask" | Install wallet extension |
| "Wrong network" | Click "Yes" to switch to Sepolia |
| "Insufficient funds" | Get Sepolia ETH from faucet |
| "Not authorized scorer" | Admin needs to authorize your address |
| Transaction pending | Wait 1-2 minutes, Sepolia can be slow |

---

## 📊 Deployed Contracts

| Contract | Address |
|----------|---------|
| ANTScoring | `0xd2Df767CA136447a32a72e03AE1Fd8652755859f` |
| TriLaneSystem | `0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE` |

**View on Etherscan:**
- https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f

---

## 📚 More Info

- **Full Setup Guide:** `WEB3-SETUP-GUIDE.md`
- **Architecture Details:** `README.md`

---

**Ready? Open `index.html` and click "Connect Wallet"!** 🚀

