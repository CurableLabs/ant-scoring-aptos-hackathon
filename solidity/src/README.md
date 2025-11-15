# Source Directory (Archive/Reference)

## ⚠️ This folder contains REFERENCE copies and older versions

**DO NOT USE THESE FOR TESTING OR DEPLOYMENT**

### Status:
- ❌ These contracts may contain bugs (e.g., arithmetic overflow issues)
- ❌ Not used by Foundry tests
- ❌ Not actively maintained
- ℹ️ Kept for reference or backup purposes

---

## ✅ For Active Development, Use:

**`../contracts/`** - Contains your working, tested, bug-free contracts

---

## 📝 Contracts in This Folder:

### Your Original/Reference Versions:
- `ANTScoring.sol` - ⚠️ Contains overflow bugs (fixed version in contracts/)
- `BondingCurve.sol` - ⚠️ Reference copy (working version in contracts/)
- `CleanDeploy.sol` - ⚠️ Reference copy (working version in contracts/)
- `Counter.sol` - Foundry template example

### Others (Copied from contracts/):
- `CleanDeployReady.sol` - Team member's work (also in contracts/)

**Note:** These are older copies. Always use `contracts/` for current work!

---

## 🔄 If You Want to Update:

Copy the fixed versions from `contracts/` to here:

```bash
cp contracts/ANTScoring.sol src/ANTScoring.sol
```

**But remember**: `contracts/` is the source of truth!

