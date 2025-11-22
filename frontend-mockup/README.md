# ANT Scoring System - Frontend Mockup

**Interactive HTML/CSS Demo for Architecture Visualization**

---

## 🎯 Purpose

This mockup demonstrates:
1. **Frontend architecture** for the ANT Scoring System
2. **Role-based UI** - how the interface adapts based on user permissions
3. **User flows** for researchers, scorers, and admins
4. **Page structure** and navigation patterns

**Use this to:**
- ✅ Test user flows with your team
- ✅ Show Ilyssa's frontend developers the expected structure
- ✅ Validate UX before building the real Web3 frontend
- ✅ Get stakeholder feedback on design

---

## 📁 Files Included

```
frontend-mockup/
├── index.html          # Home page - Proposal browsing
├── submit.html         # Submit proposal form
├── score.html          # Scoring interface (scorer only)
├── profile.html        # User profile with badges
├── styles.css          # All styling
├── script.js           # Role switching logic
└── README.md           # This file
```

---

## 🚀 How to Use

### **Step 1: Open in Browser**

1. Navigate to the `frontend-mockup/` folder
2. Double-click `index.html` to open in your browser
3. Or open with: `file:///path/to/frontend-mockup/index.html`

### **Step 2: Switch Roles**

Use the **ROLE SIMULATOR** at the top of every page:

| Button | What It Simulates |
|--------|------------------|
| **Not Connected** | User hasn't connected wallet |
| **Researcher** | Connected wallet, can submit proposals |
| **Authorized Scorer** | Can score proposals + researcher features |
| **Admin** | Full system access + all features |

### **Step 3: Explore Pages**

**Navigate through:**
- 🏠 **Home** - Browse proposals, see different CTAs by role
- 📝 **Submit** - Proposal submission form (requires connection)
- ⭐ **Score** - Scoring interface (requires scorer role)
- 👤 **Profile** - Badges, proposals, history

---

## 🎭 Role-Based Features Matrix

### **Home Page (`index.html`)**

| Role | Features Visible |
|------|------------------|
| Not Connected | View proposals, "Connect Wallet" CTA |
| Researcher | View proposals, "Submit Proposal" CTA |
| Scorer | View proposals, "Score Proposals" CTA, pending count |
| Admin | View proposals, admin panel link |

### **Submit Page (`submit.html`)**

| Role | Features Visible |
|------|------------------|
| Not Connected | "Connect wallet" message only |
| Researcher | Full submission form |
| Scorer | Full submission form |
| Admin | Full submission form + admin tools |

### **Score Page (`score.html`)**

| Role | Features Visible |
|------|------------------|
| Not Connected | "Not authorized" message |
| Researcher | "Not authorized" message |
| Scorer | Full scoring interface |
| Admin | Full scoring interface + scorer management |

### **Profile Page (`profile.html`)**

| Role | Features Visible |
|------|------------------|
| Not Connected | "Connect wallet" message |
| Researcher | Profile, badges, my proposals |
| Scorer | Profile, badges, my proposals, **scoring history** |
| Admin | Profile, badges, my proposals, **admin dashboard** |

---

## 🔧 Technical Notes for Ilyssa's Team

### **1. This is NOT Production Code**

- ✅ Use for UX/UI reference
- ✅ Use for architecture planning
- ❌ Don't copy-paste the code directly
- ❌ This doesn't include Web3 integration

### **2. Real Implementation Needs:**

**Frontend Framework:**
```
React/Next.js + TypeScript
```

**Web3 Libraries:**
```javascript
import { ethers } from 'ethers';
import { useAccount, useContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
```

**Contract Interaction:**
```javascript
// Instead of alert(), real code does:
const tx = await antScoringContract.submitProposal(
  protocol,
  ipfsHash,
  scorers
);
await tx.wait(); // Wait for confirmation
```

**Role Detection:**
```javascript
// Real code checks blockchain:
const isScorer = await antScoring.isAuthorizedScorer(address);
const owner = await antScoring.owner();
const isAdmin = address === owner;
```

### **3. Key Patterns to Follow:**

**✅ Same Pages, Different Features**
- Don't create separate pages for each role
- Use conditional rendering based on wallet state

**✅ Progressive Enhancement**
- Show read-only content to everyone
- Show action buttons only to authorized users

**✅ Clear Permission Feedback**
- Show "Connect Wallet" for disconnected users
- Show "Not Authorized" for insufficient permissions
- Explain how to get authorized

---

## 📱 Pages Breakdown

### **1. Home Page** (`index.html`)

**Purpose:** Landing page, proposal browsing

**Key Elements:**
- Hero section with dynamic CTA
- System statistics (total proposals, scorers, badges)
- Recent proposals grid
- Role-specific action buttons

**Dynamic Content:**
- CTA changes based on role
- "Score This" buttons only for scorers
- Navigation adapts to permissions

---

### **2. Submit Page** (`submit.html`)

**Purpose:** Submit new research proposals

**Form Fields:**
- Protocol description (textarea)
- IPFS hash (optional)
- Budget request (CURE tokens)
- Scorer selection (3 required)
- Research category
- Timeline estimate

**Validation:**
- Must select exactly 3 scorers
- Shows gas estimate before submission
- Admin sees additional tools

---

### **3. Score Page** (`score.html`)

**Purpose:** Review and score proposals (scorer/admin only)

**Features:**
- Pending proposals list
- Deadline indicators
- Current scores from other reviewers
- Interactive score slider (0-100)
- Optional comments
- Scorer statistics

**UX Notes:**
- Shows which scorers have already submitted
- Displays average score so far
- Highlights urgent deadlines

---

### **4. Profile Page** (`profile.html`)

**Purpose:** User dashboard

**Sections for All:**
- Wallet address
- Role badges
- Statistics
- Research badges (NFTs)
- My proposals with status

**Scorer-Only Section:**
- Scoring history
- Agreement rate
- Average scores

**Admin-Only Section:**
- System statistics
- Quick actions (manage scorers, badges, settings)

---

## 🎨 Design System

### **Colors**

```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Background: #f5f7fa
Card Background: #ffffff
Text Primary: #2d3748
Text Secondary: #718096
Success: #27ae60
Warning: #f39c12
Error: #e53e3e
```

### **Typography**

```css
Headings: System fonts (-apple-system, Segoe UI, Roboto...)
Font Weights: 400 (normal), 600 (semibold), 700 (bold), 800 (extrabold)
```

### **Status Colors**

| Status | Background | Text |
|--------|-----------|------|
| Active | #fef5e7 | #f39c12 |
| Passed | #d5f4e6 | #27ae60 |
| Fulfilled | #eff6ff | #3b82f6 |
| Failed | #fef2f2 | #dc2626 |

---

## ✨ Interactive Features

### **1. Role Switching**
- Top bar lets you simulate different user types
- UI instantly updates to show/hide features
- Persists across page navigation

### **2. Score Sliders**
- Drag slider or type number (0-100)
- Both inputs stay in sync
- Real-time validation

### **3. Form Validation**
- Scorer selection enforces "exactly 3"
- Number inputs have min/max bounds
- Required fields marked with *

### **4. Mock Transactions**
- Buttons trigger alert() to show what would happen
- Explains MetaMask interaction
- Shows success messages

---

## 🔄 User Flows

### **Flow 1: Researcher Submits Proposal**

1. **Connect Wallet** → Shows researcher features
2. **Click "Submit Proposal"** → Opens form
3. **Fill form, select 3 scorers** → Input validation
4. **Click "Submit"** → MetaMask popup (simulated)
5. **Transaction confirms** → Redirect to profile
6. **View "My Proposals"** → See status "Active"

### **Flow 2: Scorer Reviews Proposal**

1. **Connect Wallet** → Shows scorer features
2. **Click "Score"** → Opens scoring interface
3. **See 3 pending proposals** → Choose one
4. **Read protocol details** → Click IPFS link
5. **Adjust score slider** → Add comments
6. **Submit score** → MetaMask popup (simulated)
7. **Transaction confirms** → Proposal updated

### **Flow 3: Researcher Claims Badge**

1. **Go to Profile** → See "My Proposals"
2. **Proposal shows "Passed"** → 92/100 score
3. **Click "Fulfill & Claim Badge"** → MetaMask popup
4. **Badge minted** → Shows in "Your Badges"
5. **NFT visible on-chain** → Can be verified

---

## 📊 Metrics to Track (Real App)

When building the real frontend, track:

**User Engagement:**
- Wallet connection rate
- Proposals submitted per user
- Time to complete forms
- Scorer response time

**Performance:**
- Page load times
- Transaction success rate
- Error rates by function
- Gas cost per action

**System Health:**
- Active scorers
- Proposals per week
- Average scores
- Badge distribution

---

## 🎯 Next Steps for Frontend Development

### **Phase 1: Setup (1-2 days)**
- [ ] Initialize Next.js + TypeScript project
- [ ] Install Web3 libraries (wagmi, ethers, rainbowkit)
- [ ] Set up Tailwind CSS or similar
- [ ] Configure wallet connection

### **Phase 2: Smart Contract Integration (2-3 days)**
- [ ] Create contract ABI files
- [ ] Set up contract instances
- [ ] Implement read functions (view proposals, scores)
- [ ] Implement write functions (submit, score, fulfill)

### **Phase 3: Build Pages (3-4 days)**
- [ ] Home page with proposal list
- [ ] Submit form with validation
- [ ] Scoring interface for reviewers
- [ ] Profile page with badges

### **Phase 4: Role Management (1-2 days)**
- [ ] Detect wallet connection
- [ ] Check on-chain roles
- [ ] Implement permission guards
- [ ] Handle unauthorized states

### **Phase 5: Testing & Polish (2-3 days)**
- [ ] Test all user flows
- [ ] Handle error states
- [ ] Add loading indicators
- [ ] Optimize gas costs

**Total Estimate: 9-14 days for MVP**

---

## 📞 For Ilyssa's Frontend Team

### **Questions to Consider:**

1. **Framework:** React/Next.js, or something else?
2. **Styling:** Tailwind, styled-components, or custom CSS?
3. **Wallet Integration:** RainbowKit, ConnectKit, or custom?
4. **State Management:** Context API, Redux, Zustand?
5. **Deployment:** Vercel, Netlify, or self-hosted?

### **Resources Needed:**

- ✅ Contract addresses (deployed on Sepolia)
- ✅ ABI files (in `solidity/out/` folder)
- ✅ RPC URL (Alchemy, Infura, or public)
- ✅ IPFS integration (for protocol documents)

### **Technical Specs:**

| Item | Details |
|------|---------|
| Network | Ethereum Sepolia (testnet) |
| Chain ID | 11155111 |
| Contracts | ANTScoring, TriLaneSystem, LabBadge, etc. |
| Token | CURE (ERC20) |
| Badges | LAB (ERC721 - Soulbound) |

---

## 🐛 Known Limitations (This Mockup)

**This is a static demo, NOT production code:**

1. ❌ No real wallet connection
2. ❌ No blockchain interaction
3. ❌ No real data fetching
4. ❌ No form validation (beyond client-side)
5. ❌ No IPFS integration
6. ❌ No responsive mobile optimization
7. ❌ Role persistence (resets on refresh)

**The real app will need all of these!**

---

## 💡 Tips for Team Testing

### **For Product Team:**
1. Try each role
2. Go through full user flows
3. Note any confusing UI elements
4. Check if CTAs are clear

### **For Designers:**
1. Review color scheme
2. Check spacing and hierarchy
3. Validate iconography
4. Test readability

### **For Developers:**
1. Review component structure
2. Identify reusable patterns
3. Note state management needs
4. Plan API integration points

---

## 📧 Questions?

**This mockup was created to:**
- ✅ Visualize the architecture
- ✅ Enable team testing
- ✅ Guide frontend development

**Not included (but needed for production):**
- Real Web3 integration
- Backend API (if needed)
- IPFS file uploads
- Mobile responsive design
- Accessibility features
- Production optimizations

---

**Ready to build?** 🚀

Pass this mockup to Ilyssa's frontend team and let them know:
1. This shows the **structure and flow**
2. They should use **modern Web3 stack** (wagmi, rainbowkit, etc.)
3. Contract addresses and ABIs are ready in `/solidity/deployment/`
4. You're available for questions about smart contract functionality

**Happy coding!** 🎨

