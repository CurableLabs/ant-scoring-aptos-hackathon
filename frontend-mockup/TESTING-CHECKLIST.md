# ✅ Testing Checklist

**Use this to track your team's testing progress**

---

## 👥 Team Setup

### **Admin** (`0x03c7955A9168ffa6b314c5524279D717D1335074`)
- [ ] Has Sepolia ETH (0.1+ ETH)
- [ ] Can connect wallet
- [ ] Sees "Admin" badge in profile
- [ ] Can access admin functions

### **Scorer 1** (Address: __________________)
- [ ] Has Sepolia ETH (0.05+ ETH)
- [ ] Authorized by admin (`addAuthorizedScorer`)
- [ ] Can connect wallet
- [ ] Sees "Scorer" badge in profile
- [ ] Can access scoring page

### **Scorer 2** (Address: __________________)
- [ ] Has Sepolia ETH (0.05+ ETH)
- [ ] Authorized by admin
- [ ] Can connect wallet
- [ ] Sees "Scorer" badge
- [ ] Can access scoring page

### **Scorer 3** (Address: __________________)
- [ ] Has Sepolia ETH (0.05+ ETH)
- [ ] Authorized by admin
- [ ] Can connect wallet
- [ ] Sees "Scorer" badge
- [ ] Can access scoring page

### **Researcher** (Address: __________________)
- [ ] Has Sepolia ETH (0.05+ ETH)
- [ ] Can connect wallet
- [ ] Sees "Researcher" badge
- [ ] Can access submit page

---

## 🧪 Functional Testing

### **Test 1: Wallet Connection**
- [ ] MetaMask/Rabby installed
- [ ] Click "Connect Wallet"
- [ ] Approve connection
- [ ] Wallet address appears in nav
- [ ] App switches to Sepolia (if needed)
- [ ] No console errors

**Expected:** Connection successful, address visible

---

### **Test 2: Role Detection**
- [ ] Admin sees all pages (Home, Submit, Score, Profile, Admin)
- [ ] Scorer sees Home, Submit, Score, Profile
- [ ] Researcher sees Home, Submit, Profile
- [ ] Non-scorer cannot access Score page
- [ ] Appropriate badges show in nav

**Expected:** UI adapts based on user role

---

### **Test 3: Submit Proposal (Researcher)**
- [ ] Navigate to Submit page
- [ ] Fill protocol description
- [ ] (Optional) Add IPFS hash
- [ ] Select exactly 3 scorers
- [ ] Click "Submit Proposal"
- [ ] MetaMask popup appears
- [ ] Confirm transaction
- [ ] Wait for confirmation (~10-30 sec)
- [ ] Success alert shows proposal ID
- [ ] Transaction visible on Etherscan
- [ ] Gas fee reasonable (~0.001-0.003 ETH)

**Proposal ID:** #________

**Expected:** Proposal submitted successfully

---

### **Test 4: Score Proposal (Scorer 1)**
- [ ] Navigate to Score page
- [ ] (Manually note proposal ID from Test 3)
- [ ] Enter proposal ID in form (or use placeholder)
- [ ] Adjust score slider to 85
- [ ] (Optional) Add comments
- [ ] Click "Submit Score"
- [ ] MetaMask popup appears
- [ ] Confirm transaction
- [ ] Wait for confirmation
- [ ] Success alert appears
- [ ] Transaction visible on Etherscan
- [ ] Gas fee reasonable (~0.0005-0.001 ETH)

**Expected:** Score recorded on-chain

---

### **Test 5: Score Proposal (Scorer 2)**
- [ ] Same proposal ID: #________
- [ ] Navigate to Score page
- [ ] Set score to 88
- [ ] Submit and confirm
- [ ] Transaction successful

**Expected:** 2nd score recorded

---

### **Test 6: Score Proposal (Scorer 3)**
- [ ] Same proposal ID: #________
- [ ] Navigate to Score page
- [ ] Set score to 82
- [ ] Submit and confirm
- [ ] Transaction successful

**Expected:** 3rd score recorded, proposal now scorable to fulfill

**Average Score:** (85 + 88 + 82) / 3 = 85 ✅ (Above 80 threshold)

---

### **Test 7: Verify Proposal on Etherscan**
- [ ] Go to ANTScoring on Etherscan (Read Contract)
- [ ] Call `getProposalInfo` with proposal ID
- [ ] Verify:
  - [ ] Creator address matches researcher
  - [ ] Protocol description correct
  - [ ] Total score = 255 (85+88+82)
  - [ ] Num scores = 3
  - [ ] Fulfilled = false

**Expected:** All data matches

---

### **Test 8: Fulfill Proposal (Researcher)**
- [ ] Connect as researcher (proposal creator)
- [ ] Navigate to Profile page
- [ ] Find proposal #________ in "My Proposals"
- [ ] Status shows "Passed - Ready to Fulfill"
- [ ] Click "Fulfill & Claim Badge"
- [ ] MetaMask popup appears
- [ ] Confirm transaction
- [ ] Wait for confirmation (~15-30 sec)
- [ ] Success alert shows badge minted
- [ ] Badge appears in profile
- [ ] Transaction visible on Etherscan
- [ ] Gas fee reasonable (~0.002-0.005 ETH)

**Badge ID:** #________

**Expected:** NFT badge minted, proposal fulfilled

---

### **Test 9: Verify Badge on Etherscan**
- [ ] Go to LabBadge contract on Etherscan
- [ ] Call `getContributorBadges` with researcher address
- [ ] Badge token ID appears in array
- [ ] Call `getBadgeLevel` with token ID
- [ ] Level matches expected tier (0=Bronze, 1=Silver, 2=Gold, etc.)

**Expected:** Badge data visible on-chain

---

### **Test 10: Error Handling**
- [ ] Try scoring without authorization → Error message
- [ ] Try submitting with <3 scorers → Validation error
- [ ] Try submitting with >3 scorers → Validation error
- [ ] Try fulfilling proposal with score <80 → Transaction fails
- [ ] Try fulfilling someone else's proposal → Transaction fails
- [ ] Try scoring twice on same proposal → Transaction fails
- [ ] Try connecting on wrong network → Prompt to switch

**Expected:** All errors handled gracefully

---

### **Test 11: Admin Functions**
- [ ] Admin can authorize new scorer via Etherscan
- [ ] Newly authorized address can access Score page
- [ ] Admin can submit proposals
- [ ] Admin can score proposals
- [ ] Admin sees admin-only sections

**Expected:** All admin functions work

---

### **Test 12: UI/UX**
- [ ] Navigation is intuitive
- [ ] Wallet address displays correctly
- [ ] Role badges visible
- [ ] Forms are user-friendly
- [ ] Loading states during transactions
- [ ] Error messages are clear
- [ ] Success messages are informative
- [ ] Etherscan links work
- [ ] Design is professional
- [ ] No broken layouts

**Expected:** Good user experience

---

## 🐛 Bug Tracking

| # | Bug Description | Severity | Reported By | Status |
|---|-----------------|----------|-------------|--------|
| 1 |                 |          |             |        |
| 2 |                 |          |             |        |
| 3 |                 |          |             |        |

**Severity:**
- **Critical:** Blocks testing
- **High:** Major functionality broken
- **Medium:** Feature works but has issues
- **Low:** Minor UI/UX issue

---

## 📊 Test Results Summary

**Date:** __________

**Participants:**
- Admin: __________
- Scorer 1: __________
- Scorer 2: __________
- Scorer 3: __________
- Researcher: __________

**Tests Passed:** __ / 12

**Tests Failed:** __ / 12

**Bugs Found:** __

**Gas Costs (Total):**
- Submit Proposal: __ ETH
- Score (3x): __ ETH
- Fulfill: __ ETH
- **Total:** __ ETH

**Performance:**
- Average tx confirmation time: __ seconds
- Any stuck transactions? Yes / No
- Network issues? Yes / No

**Overall Rating:** ⭐⭐⭐⭐⭐

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## ✅ Sign-Off

**Testing Completed By:**

- Admin: __________________ Date: __________
- Scorer 1: ________________ Date: __________
- Scorer 2: ________________ Date: __________
- Scorer 3: ________________ Date: __________
- Researcher: ______________ Date: __________

**Ready for Production?** Yes / No

**Next Steps:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

**All tests passed? Share this checklist with the team!** ✅

