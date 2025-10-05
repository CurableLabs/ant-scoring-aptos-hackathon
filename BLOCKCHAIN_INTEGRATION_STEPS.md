# 🚀 Blockchain Integration Steps

## Prerequisites ✅ 
- Move contracts already written in `sources/`
- Account ready: `0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915`
- Aptos CLI configured

## Step 1: Deploy Contracts (5 minutes)
```bash
# Compile contracts
aptos move compile --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Deploy to devnet
aptos move publish --named-addresses ant_scoring=0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915

# Initialize system
aptos move run --function-id 0xa7b69f0024e6a6a82b5baec9b6b5fc89b12ab4e19066fcf6b9db52ceb76b6915::clean_minimal_tri_lane::initialize
```

## Step 2: Add Aptos SDK to Demo (10 minutes)
```html
<!-- Add to americas-next-top-curable-blockchain.html -->
<script src="https://unpkg.com/aptos@latest/dist/index.global.js"></script>
<script>
const aptosClient = new window.Aptos.AptosApi({
    fullnodeUrl: "https://fullnode.devnet.aptoslabs.com",
});
</script>
```

## Step 3: Implement Blockchain Toggle (15 minutes)
- Update the existing blockchain toggle to actually connect
- Add wallet connection functions
- Implement hybrid simulation/blockchain mode

## Step 4: Test Integration (5 minutes)
1. Connect Petra wallet
2. Run through all 3 lanes
3. Verify transactions on Aptos explorer
4. Confirm state persistence

## Total Time: ~35 minutes to full blockchain integration!

## Minimal Changes Needed:
1. Add Aptos SDK script tag
2. Add wallet connection functions  
3. Replace 5-6 key simulation functions with blockchain calls
4. Add error handling with simulation fallbacks

## Key Advantage:
- Your existing UI/UX stays exactly the same
- Same smooth user experience 
- Blockchain adds persistence and real token economics
- Fallback to simulation ensures demo always works
