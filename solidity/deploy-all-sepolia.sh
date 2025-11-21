#!/bin/bash

# ====================================
# Automated Sepolia Deployment Script
# ====================================

# Redirect all output to both terminal and feedback.txt
exec > >(tee contracts/feedback.txt) 2>&1

echo "==================================="
echo "Starting Full Contract Deployment"
echo "==================================="

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$SEPOLIA_RPC_URL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "ERROR: SEPOLIA_RPC_URL or PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "✓ Environment variables loaded"
echo ""

# ====================================
# 1. CURE TOKEN (Already deployed, using existing address)
# ====================================
echo "==================================="
echo "1. CUREToken"
echo "==================================="
CURE_TOKEN_ADDRESS="0xDC2d8F77d22495A2298A02Ec5c8185aCE53F59E8"
echo "✓ Using existing CUREToken: $CURE_TOKEN_ADDRESS"
echo ""

# ====================================
# 2. TRI-LANE SYSTEM
# ====================================
echo "==================================="
echo "2. Deploying TriLaneSystem..."
echo "==================================="
TRILANE_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY contracts/CleanDeploy.sol:TriLaneSystem --broadcast 2>&1)
echo "$TRILANE_DEPLOY"

# Extract the deployed address using grep
TRILANE_ADDRESS=$(echo "$TRILANE_DEPLOY" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$TRILANE_ADDRESS" ]; then
    echo "❌ ERROR: Failed to deploy TriLaneSystem"
    echo "$TRILANE_DEPLOY" > contracts/feedback.txt
    exit 1
fi

echo "✓ TriLaneSystem deployed: $TRILANE_ADDRESS"
echo ""

# ====================================
# 3. ANT SCORING (requires TriLaneSystem address)
# ====================================
echo "==================================="
echo "3. Deploying ANTScoring..."
echo "==================================="
ANTSCORING_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY contracts/ANTScoring.sol:ANTScoring --constructor-args $TRILANE_ADDRESS --broadcast 2>&1)
echo "$ANTSCORING_DEPLOY"

ANTSCORING_ADDRESS=$(echo "$ANTSCORING_DEPLOY" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$ANTSCORING_ADDRESS" ]; then
    echo "❌ ERROR: Failed to deploy ANTScoring"
    echo "$ANTSCORING_DEPLOY" >> contracts/feedback.txt
    exit 1
fi

echo "✓ ANTScoring deployed: $ANTSCORING_ADDRESS"
echo ""

# ====================================
# 4. BONDING CURVE
# ====================================
echo "==================================="
echo "4. Deploying BondingCurve..."
echo "==================================="
BONDING_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY contracts/BondingCurve.sol:BondingCurve --broadcast 2>&1)
echo "$BONDING_DEPLOY"

BONDING_ADDRESS=$(echo "$BONDING_DEPLOY" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$BONDING_ADDRESS" ]; then
    echo "❌ ERROR: Failed to deploy BondingCurve"
    echo "$BONDING_DEPLOY" >> contracts/feedback.txt
    exit 1
fi

echo "✓ BondingCurve deployed: $BONDING_ADDRESS"
echo ""

# ====================================
# 5. CURE INTEGRATION
# ====================================
echo "==================================="
echo "5. Deploying CUREIntegration..."
echo "==================================="
INTEGRATION_DEPLOY=$(forge create --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY contracts/CUREIntegration.sol:CUREIntegration --broadcast 2>&1)
echo "$INTEGRATION_DEPLOY"

INTEGRATION_ADDRESS=$(echo "$INTEGRATION_DEPLOY" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$INTEGRATION_ADDRESS" ]; then
    echo "❌ ERROR: Failed to deploy CUREIntegration"
    echo "$INTEGRATION_DEPLOY" >> contracts/feedback.txt
    exit 1
fi

echo "✓ CUREIntegration deployed: $INTEGRATION_ADDRESS"
echo ""

# ====================================
# DEPLOYMENT SUMMARY
# ====================================
echo "==================================="
echo "✅ ALL CONTRACTS DEPLOYED!"
echo "==================================="
echo ""
echo "📝 DEPLOYMENT ADDRESSES:"
echo "------------------------"
echo "CUREToken:       $CURE_TOKEN_ADDRESS"
echo "TriLaneSystem:   $TRILANE_ADDRESS"
echo "ANTScoring:      $ANTSCORING_ADDRESS"
echo "BondingCurve:    $BONDING_ADDRESS"
echo "CUREIntegration: $INTEGRATION_ADDRESS"
echo ""
echo "🔗 ETHERSCAN LINKS:"
echo "------------------------"
echo "CUREToken:       https://sepolia.etherscan.io/address/$CURE_TOKEN_ADDRESS"
echo "TriLaneSystem:   https://sepolia.etherscan.io/address/$TRILANE_ADDRESS"
echo "ANTScoring:      https://sepolia.etherscan.io/address/$ANTSCORING_ADDRESS"
echo "BondingCurve:    https://sepolia.etherscan.io/address/$BONDING_ADDRESS"
echo "CUREIntegration: https://sepolia.etherscan.io/address/$INTEGRATION_ADDRESS"
echo ""

# Save summary to file
cat > contracts/DEPLOYMENT_ADDRESSES.txt <<EOF
=================================
SEPOLIA DEPLOYMENT - $(date)
=================================

DEPLOYED ADDRESSES:
-------------------
CUREToken:       $CURE_TOKEN_ADDRESS
TriLaneSystem:   $TRILANE_ADDRESS
ANTScoring:      $ANTSCORING_ADDRESS
BondingCurve:    $BONDING_ADDRESS
CUREIntegration: $INTEGRATION_ADDRESS

ETHERSCAN LINKS:
----------------
CUREToken:       https://sepolia.etherscan.io/address/$CURE_TOKEN_ADDRESS
TriLaneSystem:   https://sepolia.etherscan.io/address/$TRILANE_ADDRESS
ANTScoring:      https://sepolia.etherscan.io/address/$ANTSCORING_ADDRESS
BondingCurve:    https://sepolia.etherscan.io/address/$BONDING_ADDRESS
CUREIntegration: https://sepolia.etherscan.io/address/$INTEGRATION_ADDRESS
EOF

echo "📄 Full details saved to: contracts/DEPLOYMENT_ADDRESSES.txt"
echo ""
echo "🎉 Deployment Complete!"

