# ❓ Questions for Curable Labs Stakeholders

## 🎯 Critical Business Decisions Needed

---

## Question 1: Scorer Authorization Model

**Context:** 
The smart contracts currently use a centralized authorization system where only the admin (Curable Labs) can authorize scientists to become scorers.

**The Question:**
**Does Curable Labs already have a network of partner scientists/scorers, or should we build an open application system?**

### Option A: Pre-Selected Scientists (Current Implementation) ✅
**How it works:**
- Curable Labs manually authorizes trusted scientists
- Admin adds their wallet addresses via Etherscan
- Scientists are notified off-chain (email, Discord, etc.)
- Immediate access once authorized

**Pros:**
- ✅ High quality control
- ✅ No spam/unqualified applicants
- ✅ Fast onboarding
- ✅ Simple (already built!)
- ✅ Industry standard for peer review

**Cons:**
- ⚠️ Centralized control
- ⚠️ Manual process

### Option B: Open Application System (Not Built Yet) ❌
**Would need:**
- Application submission page
- Credential verification workflow
- Voting/approval mechanism
- Admin dashboard for reviews
- Additional smart contract functions

**Pros:**
- ✅ More decentralized
- ✅ Scales better
- ✅ Community-driven

**Cons:**
- ⚠️ Complex to build
- ⚠️ Quality control harder
- ⚠️ Not ready for demo!

---

## Question 2: Scorer Discovery & Onboarding

**How will scientists learn about the platform and become scorers?**

Possible answers:
- [ ] Invitation-only to partner institutions
- [ ] Public announcement/recruitment
- [ ] Existing research networks
- [ ] Academic partnerships
- [ ] Other: _________________

---

## Question 3: Authorization Control

**Who should have the power to authorize new scorers?**

Options:
- [ ] Only Curable Labs admin (current implementation)
- [ ] Existing scorers can vote
- [ ] Community governance (DAO-style)
- [ ] Hybrid approach
- [ ] Other: _________________

---

## Question 4: Scorer Requirements

**What qualifications should scorers have?**

Consider:
- PhD in relevant field?
- Published research?
- Institution affiliation?
- Peer recommendations?
- Minimum reputation score?

---

## Question 5: Scorer Assignment Model - Who Scores Each Proposal?

**Context:**
Currently, the smart contract allows **ANY authorized scorer** to score **ANY proposal** (open pool). However, for better transparency and domain expertise matching, researchers could select specific scorers based on their field and qualifications.

**The Question:**
**Should researchers select specific scorers for their proposals, or should any authorized scorer be able to score any proposal?**

### Option A: Open Scoring Pool (Current Implementation) ✅

**How it works:**
- Admin authorizes qualified scorers (global pool)
- Researcher submits proposal (no scorer selection)
- **ANY authorized scorer** can score it
- First-come, first-served
- No field/expertise matching required

**Pros:**
- ✅ Faster processing - no bottlenecks
- ✅ Simpler contract logic (already built!)
- ✅ More decentralized
- ✅ Works well with large scorer pools
- ✅ Scorers can self-select based on interest

**Cons:**
- ❌ No researcher control over who reviews their work
- ❌ Scorers might not have relevant domain expertise
- ❌ Less transparency about reviewer qualifications
- ❌ Potential for mismatched evaluations (e.g., cancer researcher scoring CRISPR proposal)

### Option B: Researcher-Selected Scorers (Requires Contract Changes) ❌

**How it works:**
- Admin authorizes qualified scorers (with public profiles showing expertise)
- Researcher sees list of available scorers (name, field, credentials)
- Researcher selects 3-5 scorers based on domain expertise
- **ONLY selected scorers** can score that specific proposal
- Better field matching and transparency

**Pros:**
- ✅ Researcher control and transparency
- ✅ Domain-specific expertise guaranteed
- ✅ Better for niche/specialized research
- ✅ Matches traditional peer review (journal assigns reviewers)
- ✅ Researchers can avoid conflicts of interest

**Cons:**
- ❌ Bottleneck if selected scorers are busy/inactive
- ❌ More complex contract logic (need to store per-proposal scorer lists)
- ❌ Requires smart contract redeployment
- ❌ Potential gaming (selecting "friendly" scorers)
- ❌ Requires public scorer profiles/credentials

### Technical Changes Required for Option B:

**Smart Contract:**
```solidity
// Would need to modify:
function submitProposal(
    string memory title, 
    string memory description, 
    string memory ipfsHash,
    address[] memory selectedScorers  // NEW PARAMETER
) external

// Store selected scorers per proposal
mapping(uint256 => address[]) public proposalScorers;

// Update scoreProposal to check if msg.sender is in allowed list
function scoreProposal(uint256 proposalId, ...) external {
    require(isProposalScorer(proposalId, msg.sender), "Not selected for this proposal");
    // ... rest of logic
}
```

**Frontend:**
- Scorer directory/profile page
- Scorer selection UI on submit form
- Display scorer credentials/specialties
- Show selected scorers per proposal

**Off-chain:**
- Maintain scorer profiles (credentials, expertise, publications)
- Scorer availability system
- Notification system for selected scorers

---

## Question 6: Hybrid Approach?

**Could we combine both models?**

### Option C: Tiered Scoring System
- **Tier 1:** Researcher-selected domain experts (3 scorers, weighted 70%)
- **Tier 2:** Community scorers from open pool (weighted 30%)
- Best of both worlds: expertise + decentralization

### Option D: Researcher Choice
- Researcher chooses at submission time:
  - **Fast Track:** Open pool (any scorer)
  - **Expert Review:** Select specific scorers (slower but more rigorous)

---

## 🎯 Impact Analysis

**Business Impact:**
- Quality of peer review
- Researcher trust and satisfaction
- Scorer engagement and workload
- Platform reputation

**Technical Impact:**
- Contract complexity
- Gas costs (storing scorer lists per proposal)
- Frontend complexity
- Deployment timeline

**User Experience:**
- Researcher control vs. speed
- Scorer discovery and matching
- Transparency and credibility

---

## 📝 Notes from Discussion

**Date:** _________________

**Decision:** _________________

**Action Items:**
- [ ] _________________
- [ ] _________________
- [ ] _________________

---

## 🎯 Recommendation for Hackathon Demo

### For Scorer Authorization (Q1-4):
**Use Option A (Current Implementation)**

**Talking Points:**
> "Curable Labs maintains a curated network of qualified scientists. This ensures only credentialed experts participate in peer review, maintaining the platform's credibility and scientific rigor. Authorization is simple: verify credentials off-chain, then authorize their wallet address on-chain with a single transaction."

**This aligns with:**
- Traditional academic peer review models
- Quality control standards
- Professional credibility
- Regulatory compliance needs

### For Scorer Assignment (Q5):
**Use Option A (Open Scoring Pool) for Demo**

**Rationale:**
- ✅ Already implemented and working
- ✅ Faster for hackathon demo
- ✅ No contract redeployment needed

**However, strongly recommend discussing Option B (Researcher-Selected Scorers) for production:**
- Better transparency and researcher control
- Domain expertise matching
- Aligns with traditional peer review
- Can be added post-hackathon if desired

---

## 🚀 Future Enhancements (Post-Hackathon)

If they want more decentralization later, we can add:
- Application submission system
- Credential verification
- Community voting
- Reputation system
- Tiered scorer levels



