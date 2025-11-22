# 🚀 Web3-Integrated Frontend - Setup Guide

**Real Blockchain Integration for Testing**

---

## ✅ What's Different Now?

This is **NO LONGER a mockup!** Your team can now:

- ✅ **Connect real wallets** (MetaMask, Rabby)
- ✅ **Submit actual proposals** to Sepolia blockchain
- ✅ **Score proposals** with real transactions
- ✅ **Claim badges** (real NFTs!)
- ✅ **View on-chain data** in real-time
- ✅ **See transaction confirmations** on Etherscan

---

## 📋 Prerequisites

### **1. Wallet Extension**
Team members need **MetaMask** or **Rabby** installed:
- MetaMask: https://metamask.io/download/
- Rabby: https://rabby.io/

### **2. Sepolia ETH**
Everyone needs some **Sepolia testnet ETH** for gas fees:
- Alchemy Faucet: https://sepoliafaucet.com/
- Google Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Infura Faucet: https://www.infura.io/faucet/sepolia

**How much?** 0.05-0.1 ETH should be enough for testing.

### **3. Sepolia Network Added**
The app will auto-prompt to add Sepolia if not configured!

---

## 🎯 How to Use

### **Step 1: Open the App**

1. Navigate to `frontend-mockup/` folder
2. Double-click `index.html` (or use a local server)
3. App opens in browser

### **Step 2: Connect Wallet**

1. Click **"Connect Wallet"** button in top-right
2. MetaMask/Rabby popup appears
3. Select account and approve
4. If on wrong network, app will prompt to switch to Sepolia
5. Once connected, your address appears: `0x03c7...5074`

### **Step 3: Check Your Role**

The app automatically detects your role:

| Your Address | Role | What You Can Do |
|--------------|------|-----------------|
| `0x03c7955A9168ffa6b314c5524279D717D1335074` | **Admin** | Everything + manage scorers |
| Authorized scorer address | **Scorer** | Score proposals + submit |
| Any other address | **Researcher** | Submit proposals only |

**Want to be a scorer?** Ask the admin to run:
```javascript
// Admin only
await antScoring.addAuthorizedScorer("0xYourAddress");
```

---

## 📝 Test Workflows

### **Workflow 1: Submit a Proposal (Researcher)**

1. **Connect wallet** → Your role is detected
2. **Click "Submit"** in navigation
3. **Fill the form:**
   - Protocol description (required)
   - IPFS hash (optional)
   - Select **exactly 3 scorers** (required)
4. **Click "Submit Proposal"**
5. **MetaMask pops up** → Review gas fee → Confirm
6. **Wait for confirmation** (~10-15 seconds)
7. **Success!** You get a proposal ID: `#1237`
8. **View on Etherscan** (link in alert)

**Gas Cost:** ~0.001-0.003 ETH

---

### **Workflow 2: Score a Proposal (Scorer)**

1. **Connect wallet** (must be authorized scorer)
2. **Click "Score"** in navigation
3. **See pending proposals** (mock data, but scoring is real!)
4. **Adjust score slider** (0-100)
5. **Add comments** (optional)
6. **Click "Submit Score"**
7. **MetaMask pops up** → Confirm
8. **Wait for confirmation**
9. **Success!** Score is now on-chain

**Gas Cost:** ~0.0005-0.001 ETH

**Note:** Proposal must exist on-chain. For now, manually enter a real proposal ID you submitted.

---

### **Workflow 3: Claim Badge (Researcher)**

1. **Submit a proposal** (see Workflow 1)
2. **Wait for 3 scorers to score it** with avg ≥ 80
3. **Go to Profile page**
4. **Find your passed proposal** (you'll see mock data in UI)
5. **Click "Fulfill & Claim Badge"** button
6. **MetaMask pops up** → Confirm
7. **NFT Badge minted!** 🎉
8. **Badge appears in your profile**

**Gas Cost:** ~0.002-0.005 ETH

**Note:** You can only fulfill your own proposals that have passed the threshold.

---

## 🔧 Admin Functions

### **Add an Authorized Scorer**

If you're the admin (`0x03c7955A9168ffa6b314c5524279D717D1335074`):

**Option 1: Through Etherscan**
1. Go to: https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f#writeContract
2. Connect wallet
3. Find `addAuthorizedScorer`
4. Enter scorer address
5. Click "Write"

**Option 2: Via Browser Console**
```javascript
// Open browser console (F12)
await web3State.contracts.antScoring.addAuthorizedScorer("0xScorerAddress");
```

---

## 🐛 Troubleshooting

### **"Please install MetaMask"**
- **Solution:** Install MetaMask or Rabby extension
- Download: https://metamask.io/download/

### **"Wrong Network" alert**
- **Solution:** Click "Yes" to auto-switch to Sepolia
- Or manually switch in MetaMask

### **"Insufficient funds for gas"**
- **Solution:** Get Sepolia ETH from faucets
- You need ~0.05 ETH for testing

### **"Not an authorized scorer"**
- **Solution:** You're not added as a scorer yet
- Ask admin to authorize your address

### **"Proposal not passed the threshold"**
- **Solution:** Proposal needs avg score ≥ 80
- Need at least 3 scores
- Each scorer must score ≥ 80

### **Transaction stuck/pending**
- **Solution:** Wait 1-2 minutes
- Sepolia can be slow sometimes
- Check Etherscan for status

### **"Nonce too high" error**
- **Solution:** Reset MetaMask account
- Settings → Advanced → Reset Account

---

## 📊 What's Real vs Mock?

### **✅ Real (On-Chain)**
- Wallet connection
- Network switching
- All transactions (submit, score, fulfill)
- Role detection (scorer, admin)
- Badge NFTs
- Transaction confirmations
- Etherscan links

### **⚠️ Mock (Static Data)**
- Proposal list on home page (static cards)
- Proposals to score on score page (placeholder data)
- Proposal details in cards
- Statistics numbers
- Scoring history

**Why?** To keep the demo simple. In production, you'd:
- Query events from contracts to get real proposal list
- Fetch data using `getProposalInfo(id)`
- Build dynamic UI from blockchain data

---

## 🔍 Verifying on Etherscan

After any transaction, you can verify on Etherscan:

**View a Proposal:**
```
1. Go to ANTScoring contract on Etherscan
2. Click "Read Contract"
3. Find "getProposalInfo"
4. Enter proposal ID
5. Click "Query"
6. See all proposal data!
```

**View Your Badges:**
```
1. Go to LabBadge contract on Etherscan
2. Click "Read Contract"
3. Find "getContributorBadges"
4. Enter your address
5. Click "Query"
6. See all your badge token IDs!
```

---

## 📱 Contract Addresses (Sepolia)

All contracts are deployed and verified:

| Contract | Address |
|----------|---------|
| **ANTScoring** | `0xd2Df767CA136447a32a72e03AE1Fd8652755859f` |
| **TriLaneSystem** | `0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE` |
| **LabBadge** | (Deployed by TriLaneSystem, address in code) |
| **CUREToken** | `0xDC2d8F77d22495A2298A02Ec5c8185aCE53F59E8` |

**Etherscan Links:**
- ANTScoring: https://sepolia.etherscan.io/address/0xd2Df767CA136447a32a72e03AE1Fd8652755859f
- TriLaneSystem: https://sepolia.etherscan.io/address/0xC55c8D45ABf3D151ea6e2E96308cE6b32f21E5EE

---

## 🎓 Technical Details

### **Tech Stack:**
- **Ethers.js v5** (Web3 library)
- **Pure HTML/CSS/JS** (no framework needed for demo)
- **Sepolia Testnet** (Ethereum test network)

### **Key Files:**
```
frontend-mockup/
├── index.html           # Home page
├── submit.html          # Submit proposal
├── score.html           # Score proposals
├── profile.html         # User profile
├── contracts.js         # Contract addresses & ABIs ⭐
├── web3.js              # Wallet & blockchain logic ⭐
├── submit-handler.js    # Form → blockchain
├── score-handler.js     # Scoring → blockchain
├── profile-handler.js   # Load badges from chain
└── script.js            # UI logic (role switching)
```

### **How It Works:**

**1. Wallet Connection:**
```javascript
window.ethereum.request({ method: 'eth_requestAccounts' })
→ Creates ethers.BrowserProvider
→ Gets signer
→ Checks network (Sepolia?)
→ Initializes contracts
```

**2. Role Detection:**
```javascript
await contracts.antScoring.isAuthorizedScorer(address)
await contracts.antScoring.owner()
→ Compares with user address
→ Shows/hides UI elements
```

**3. Transactions:**
```javascript
const tx = await contract.submitProposal(...)
→ MetaMask popup
→ User confirms
→ tx.wait() for confirmation
→ Receipt with tx hash
```

---

## 🚀 Next Steps for Production

This demo is functional but simplified. For production:

### **Frontend Improvements:**
1. **React/Next.js** instead of vanilla HTML
2. **Dynamic data loading** (query blockchain for proposals)
3. **Event listening** (live updates when proposals are scored)
4. **IPFS integration** (upload/view full protocols)
5. **Better error handling**
6. **Loading states**
7. **Responsive design**
8. **Pagination for proposal lists**

### **Smart Contract Queries:**
```javascript
// Get all proposals (by querying events)
const filter = contract.filters.ProposalSubmitted();
const events = await contract.queryFilter(filter);

// Get proposal details
const info = await contract.getProposalInfo(id);

// Build dynamic UI from this data
```

### **Backend (Optional):**
- Index blockchain events → Database
- REST API for faster queries
- Caching layer
- Notifications

---

## 💡 Tips for Your Team

### **For Testers:**
1. **Get Sepolia ETH first** (from faucets)
2. **Connect wallet** before clicking around
3. **Check your role** (scorer or researcher?)
4. **Use browser console** (F12) to see logs
5. **Keep Etherscan open** to verify transactions

### **For Designers:**
- This is functional but basic styling
- Feel free to improve the design
- Colors, spacing, animations are all customizable

### **For Developers:**
- Check browser console for errors
- Use `web3State` global to inspect connection
- Use `CONTRACTS` global to see addresses/ABIs
- Test with real MetaMask transactions

---

## 📞 Support

### **Issues?**
- Check browser console (F12) for errors
- Verify wallet is on Sepolia network
- Ensure you have enough ETH for gas
- Try a different browser if MetaMask acts weird

### **Questions?**
- Read the original `README.md` for architecture overview
- Check Etherscan to verify contract state
- Use browser console to debug: `console.log(web3State)`

---

## 🎉 You're Ready!

**Your team can now:**
- ✅ Connect wallets
- ✅ Submit real proposals
- ✅ Score proposals on-chain
- ✅ Earn real NFT badges
- ✅ Test the entire workflow

**Go to `index.html` and click "Connect Wallet" to start!** 🚀

---

**Happy Testing!** 🧪

