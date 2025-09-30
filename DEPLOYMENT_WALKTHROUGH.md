<<<<<<< HEAD
# 🚀 Move Contract Deployment Walkthrough

## Complete Step-by-Step Guide

### Step 1: Account Setup ✅ (COMPLETED)
```bash
# Account created and funded
Account: 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915
Network: Devnet  
Balance: 1 APT (100,000,000 Octas)
Status: Ready for deployment
```

### Step 2: Contract Compilation (NEXT)
```bash
# Option A: Simple deployment (recommended)
aptos move compile --package-dir . --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Option B: If git issues persist, use local framework
aptos move compile --package-dir . --skip-fetch-latest-git-deps
```

### Step 3: Contract Deployment
```bash
# Deploy to devnet
aptos move publish --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Verify deployment
aptos account list --query modules
```

### Step 4: Initialize Contracts
```bash
# Initialize the tri-lane system
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::initialize

# Verify initialization
aptos account list --query resources
```

### Step 5: Test Contract Functions
```bash
# Issue a Lab Credit
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::issue_lab_credit \
  --args string:"CRISPR Parkinson's Therapy"

# Acquire CURE tokens  
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::acquire_cure_tokens \
  --args u64:10000

# Create Sub-DAO
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::create_subdao \
  --args u64:1000000
```

## Production Deployment Checklist

### Prerequisites ✅
- [x] Aptos CLI installed (v7.8.1)
- [x] Account created and funded  
- [x] Move contracts written
- [x] Configuration files ready

### Deployment Steps
- [ ] Compile contracts successfully
- [ ] Deploy to devnet
- [ ] Initialize system
- [ ] Test all functions
- [ ] Verify on Aptos Explorer

### Post-Deployment
- [ ] Update web interface with contract address
- [ ] Test frontend integration
- [ ] Document API endpoints
- [ ] Prepare for mainnet

## Troubleshooting Common Issues

### "Git not found" Error
**Solution:** Use `--skip-fetch-latest-git-deps` flag

### "Unable to resolve packages" Error  
**Solution:** Use simplified Move.toml without external dependencies

### "Faucet error" Issues
**Solutions:**
- Switch from testnet to devnet
- Try again in a few minutes
- Use alternative faucet: https://aptoslabs.com/testnet-faucet

### "Module already exists" Error
**Solution:** Use `--upgrade-policy compatible` flag

## Next: Web Interface Creation

Once deployment is complete, we'll create the web interface with:
- Real-time contract interaction
- Token purchase/staking UI
- Bonding curve visualization
- Sub-DAO management dashboard






=======
# 🚀 Move Contract Deployment Walkthrough

## Complete Step-by-Step Guide

### Step 1: Account Setup ✅ (COMPLETED)
```bash
# Account created and funded
Account: 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915
Network: Devnet  
Balance: 1 APT (100,000,000 Octas)
Status: Ready for deployment
```

### Step 2: Contract Compilation (NEXT)
```bash
# Option A: Simple deployment (recommended)
aptos move compile --package-dir . --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Option B: If git issues persist, use local framework
aptos move compile --package-dir . --skip-fetch-latest-git-deps
```

### Step 3: Contract Deployment
```bash
# Deploy to devnet
aptos move publish --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Verify deployment
aptos account list --query modules
```

### Step 4: Initialize Contracts
```bash
# Initialize the tri-lane system
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::initialize

# Verify initialization
aptos account list --query resources
```

### Step 5: Test Contract Functions
```bash
# Issue a Lab Credit
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::issue_lab_credit \
  --args string:"CRISPR Parkinson's Therapy"

# Acquire CURE tokens  
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::acquire_cure_tokens \
  --args u64:10000

# Create Sub-DAO
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::deploy_ready::create_subdao \
  --args u64:1000000
```

## Production Deployment Checklist

### Prerequisites ✅
- [x] Aptos CLI installed (v7.8.1)
- [x] Account created and funded  
- [x] Move contracts written
- [x] Configuration files ready

### Deployment Steps
- [ ] Compile contracts successfully
- [ ] Deploy to devnet
- [ ] Initialize system
- [ ] Test all functions
- [ ] Verify on Aptos Explorer

### Post-Deployment
- [ ] Update web interface with contract address
- [ ] Test frontend integration
- [ ] Document API endpoints
- [ ] Prepare for mainnet

## Troubleshooting Common Issues

### "Git not found" Error
**Solution:** Use `--skip-fetch-latest-git-deps` flag

### "Unable to resolve packages" Error  
**Solution:** Use simplified Move.toml without external dependencies

### "Faucet error" Issues
**Solutions:**
- Switch from testnet to devnet
- Try again in a few minutes
- Use alternative faucet: https://aptoslabs.com/testnet-faucet

### "Module already exists" Error
**Solution:** Use `--upgrade-policy compatible` flag

## Next: Web Interface Creation

Once deployment is complete, we'll create the web interface with:
- Real-time contract interaction
- Token purchase/staking UI
- Bonding curve visualization
- Sub-DAO management dashboard





>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
