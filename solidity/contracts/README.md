# Contracts Directory

## 📁 Your Production Contracts (Testing & Deployment)

This directory contains **YOUR working contracts** that are:
- ✅ **Bug-free** and production-ready
- ✅ **Tested** with comprehensive test suites
- ✅ **Used by Foundry** for compilation and testing

### Your Contracts:
- `ANTScoring.sol` - ✅ Proposal scoring system (13 tests passing, overflow bugs fixed)
- `BondingCurve.sol` - ✅ Bancor bonding curve for token trading
- `CleanDeploy.sol` - ✅ Tri-lane token system

### Team Members' Contracts:
- `BondingCurve2.sol` - 🔵 Team member's bonding curve implementation
- `CleanDeployReady.sol` - 🔵 Team member's advanced tri-lane implementation
- `CUREIntegration2.sol` - 🔵 Team member's CURE integration

---

## ⚙️ Foundry Configuration

The `foundry.toml` is configured to use this directory:
```toml
src = "contracts"
```

All tests import from this directory:
```solidity
import {ANTScoring} from "../contracts/ANTScoring.sol";
```

---

## 🚀 Usage

**Compile contracts:**
```bash
forge build
```

**Run tests:**
```bash
forge test
```

**Run specific test:**
```bash
forge test --match-contract ANTScoringTest
```
