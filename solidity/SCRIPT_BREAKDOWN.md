# Deployment Script Breakdown

## Overview
This script automates the deployment of all 5 contracts to Sepolia testnet in the correct order.

---

## Script Structure (Line by Line)

### 1. **Shebang & Header** (Lines 1-10)
```bash
#!/bin/bash
source .env
```
- `#!/bin/bash` - Tells the system this is a bash script
- `source .env` - Loads your environment variables (SEPOLIA_RPC_URL, PRIVATE_KEY)

---

### 2. **Safety Check** (Lines 12-16)
```bash
if [ -z "$SEPOLIA_RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "ERROR: Variables not set"
    exit 1
fi
```
**What it does:** Checks if your RPC URL and private key are loaded. If not, stops the script.

---

### 3. **Deploy CUREToken** (Lines 18-25)
```bash
CURE_TOKEN_ADDRESS="0xDC2d8F77d22495A2298A02Ec5c8185aCE53F59E8"
```
**What it does:** Uses the already-deployed CUREToken address (no need to redeploy).

---

### 4. **Deploy TriLaneSystem** (Lines 27-42)
```bash
TRILANE_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY \
    contracts/CleanDeploy.sol:TriLaneSystem --broadcast 2>&1)

TRILANE_ADDRESS=$(echo "$TRILANE_DEPLOY" | grep "Deployed to:" | awk '{print $3}')
```

**Step-by-step:**
1. **`forge create`** - Deploys the contract
2. **`--rpc-url $SEPOLIA_RPC_URL`** - Tells Foundry which network to deploy to
3. **`--private-key $PRIVATE_KEY`** - Your wallet key for signing the transaction
4. **`contracts/CleanDeploy.sol:TriLaneSystem`** - The file and contract name
5. **`--broadcast`** - Actually sends the transaction (not just a dry run)
6. **`2>&1`** - Captures both output and errors
7. **`$(...)`** - Saves the entire output to a variable
8. **`grep "Deployed to:"`** - Finds the line with the address
9. **`awk '{print $3}'`** - Extracts just the address (3rd word on that line)

**Why:** We need the TriLaneSystem address to deploy ANTScoring next.

---

### 5. **Error Handling** (Lines 35-40)
```bash
if [ -z "$TRILANE_ADDRESS" ]; then
    echo "❌ ERROR: Failed to deploy"
    exit 1
fi
```

**What it does:** 
- Checks if we successfully captured the address
- If deployment failed (address is empty), script stops
- Prevents trying to deploy dependent contracts without required addresses

---

### 6. **Deploy ANTScoring** (Lines 44-58)
```bash
ANTSCORING_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY \
    contracts/ANTScoring.sol:ANTScoring \
    --constructor-args $TRILANE_ADDRESS \
    --broadcast 2>&1)
```

**New part:** `--constructor-args $TRILANE_ADDRESS`
- ANTScoring's constructor needs the TriLaneSystem address
- This passes it as a parameter during deployment

---

### 7. **Deploy BondingCurve** (Lines 60-74)
```bash
BONDING_DEPLOY=$(forge create ... contracts/BondingCurve.sol:BondingCurve --broadcast 2>&1)
```
**What it does:** Deploys BondingCurve (no constructor parameters needed).

---

### 8. **Deploy CUREIntegration** (Lines 76-90)
```bash
INTEGRATION_DEPLOY=$(forge create ... contracts/CUREIntegration.sol:CUREIntegration --broadcast 2>&1)
```
**What it does:** Deploys the final contract that integrates everything.

---

### 9. **Summary Report** (Lines 92-120)
```bash
echo "CUREToken:       $CURE_TOKEN_ADDRESS"
echo "TriLaneSystem:   $TRILANE_ADDRESS"
...
cat > contracts/DEPLOYMENT_ADDRESSES.txt <<EOF
...
EOF
```

**What it does:**
1. Prints all deployed addresses to your terminal
2. Generates Etherscan links for each contract
3. Saves everything to `DEPLOYMENT_ADDRESSES.txt` for future reference

---

## How to Run

**In Git Bash (in the solidity directory):**

```bash
bash deploy-all-sepolia.sh
```

---

## What You'll See

The script will output:
```
===================================
Starting Full Contract Deployment
===================================
✓ Environment variables loaded

===================================
1. CUREToken
===================================
✓ Using existing CUREToken: 0xDC2d...

===================================
2. Deploying TriLaneSystem...
===================================
[deployment output]
✓ TriLaneSystem deployed: 0x1234...

[continues for each contract]

===================================
✅ ALL CONTRACTS DEPLOYED!
===================================

📝 DEPLOYMENT ADDRESSES:
CUREToken:       0xDC2d...
TriLaneSystem:   0x1234...
ANTScoring:      0x5678...
BondingCurve:    0xabcd...
CUREIntegration: 0xef01...

🔗 ETHERSCAN LINKS:
[clickable links for each contract]

🎉 Deployment Complete!
```

---

## Key Advantages

1. **Automated** - No manual copying of addresses between steps
2. **Safe** - Stops immediately if any deployment fails
3. **Clear** - Shows progress for each contract
4. **Documented** - Saves all addresses to a file
5. **Fast** - Deploys all contracts in ~2-3 minutes

---

## If Something Goes Wrong

The script will:
- Stop at the failed contract
- Show the error message
- Save the output to `contracts/feedback.txt`
- **NOT** deploy the remaining contracts (prevents wasting gas)

You can then:
1. Check `contracts/feedback.txt` for the error
2. Fix the issue (more gas, fix contract bug, etc.)
3. Re-run the script

