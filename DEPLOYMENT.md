<<<<<<< HEAD
# 🚀 Deployment Guide

Multiple ways to deploy "America's Next Top CurAble" for different use cases.

## 📱 GitHub Pages (Recommended for Demos)

### Quick Deploy:
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Save

3. **Access your live demo:**
   ```
   https://[your-username].github.io/americas-next-top-curable/
   ```

### Custom Demo URLs:
- Main demo: `/americas-next-top-curable-blockchain.html`
- Simple version: `/working-demo.html`  
- Blockchain full: `/blockchain-integration.html`
- No wallet: `/no-wallet-blockchain.html`

## ⚡ Vercel (Advanced Deployment)

### One-Click Deploy:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-username]/americas-next-top-curable)

### Manual Deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts - defaults work great!
```

### Features:
- ✅ Custom domains
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ Analytics
- ✅ Preview deployments

## 🌐 Netlify (Alternative)

### Drag & Drop:
1. Zip your repository
2. Go to [netlify.com](https://netlify.com)
3. Drag zip file to deploy area
4. Instant live demo!

### Git Integration:
1. Connect your GitHub repository
2. Build settings: (leave empty for static)
3. Auto-deploy on push

## 🖥️ Local Development

### Quick Start:
```bash
# Clone repository
git clone https://github.com/[your-username]/americas-next-top-curable.git
cd americas-next-top-curable

# Start server
npm start
# OR
node start-server.js

# Open browser
http://localhost:7000
```

### Available Scripts:
```bash
npm run demo        # Main demo
npm run simple      # Simple version
npm run blockchain  # Full blockchain
npm run test        # Test functionality
```

## ⛓️ Blockchain Deployment (Advanced)

### Prerequisites:
- Aptos CLI installed
- Wallet with test APT tokens
- Move compiler

### Deploy Smart Contracts:
```bash
# Initialize Aptos account
aptos init

# Compile contracts
aptos move compile

# Deploy to devnet
aptos move publish

# Get contract address
aptos account list --query resources
```

### Update Frontend:
Replace contract address in HTML files:
```javascript
const MODULE_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

## 🎯 Production Considerations

### Performance:
- ✅ All demos are single HTML files
- ✅ No build process required
- ✅ Minimal dependencies
- ✅ Fast loading times

### Security:
- ✅ No server-side processing
- ✅ Client-side only
- ✅ No sensitive data storage
- ✅ HTTPS recommended

### Monitoring:
- Add Google Analytics
- Monitor Core Web Vitals
- Track user interactions
- Error monitoring (Sentry)

### Custom Domains:
Most platforms support custom domains:
- `yourdemo.com`
- `demo.yourcompany.com`
- `molecules.yourproject.io`

## 🔧 Configuration Options

### Environment Variables:
Create `.env` file for customization:
```env
# Demo Configuration
DEMO_TITLE="Your Custom Title"
CONTRACT_ADDRESS="0xYourContractAddress"
NETWORK="devnet"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Features
ENABLE_BLOCKCHAIN="true"
ENABLE_WALLET="false"
```

### HTML Customization:
Easy to modify in HTML files:
- Colors and branding
- Molecule examples
- Scoring weights
- Text and messaging

## 🐛 Troubleshooting

### Common Issues:

**GitHub Pages not working:**
- Check repository is public
- Verify branch name (main vs master)
- Wait 5-10 minutes for propagation

**Local server issues:**
```bash
# Kill any process on port 7000
lsof -ti:7000 | xargs kill -9

# Try different port
PORT=8000 npm start
```

**Blockchain connection fails:**
- Verify contract address
- Check network (devnet/testnet/mainnet)
- Confirm wallet connection
- Check console for errors

## 📊 Analytics Setup

### Google Analytics:
Add to HTML head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-XXXXXXXXX');
</script>
```

### Custom Events:
Track user interactions:
```javascript
// Track molecule selection
gtag('event', 'molecule_selected', {
  'molecule_name': moleculeName,
  'event_category': 'engagement'
});

// Track scoring completion
gtag('event', 'scoring_complete', {
  'ant_score': finalScore,
  'event_category': 'completion'
});
```

## 🎉 Launch Checklist

### Pre-Launch:
- [ ] Test all demo flows
- [ ] Verify mobile responsiveness  
- [ ] Check browser compatibility
- [ ] Validate blockchain connections
- [ ] Test error scenarios
- [ ] Verify analytics tracking

### Launch:
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Share demo links
- [ ] Monitor initial usage
- [ ] Gather feedback

### Post-Launch:
- [ ] Monitor performance
- [ ] Track user behavior
- [ ] Collect feedback
- [ ] Plan improvements
- [ ] Scale if needed

## 🔗 Useful Links

- **GitHub Pages Docs:** https://pages.github.com/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Aptos Docs:** https://aptos.dev/
- **Move Language:** https://move-language.github.io/move/

---

**Ready to launch your molecular competition to the world!** 🚀🧬


=======
# 🚀 Deployment Guide

Multiple ways to deploy "America's Next Top CurAble" for different use cases.

## 📱 GitHub Pages (Recommended for Demos)

### Quick Deploy:
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Save

3. **Access your live demo:**
   ```
   https://[your-username].github.io/americas-next-top-curable/
   ```

### Custom Demo URLs:
- Main demo: `/americas-next-top-curable-blockchain.html`
- Simple version: `/working-demo.html`  
- Blockchain full: `/blockchain-integration.html`
- No wallet: `/no-wallet-blockchain.html`

## ⚡ Vercel (Advanced Deployment)

### One-Click Deploy:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/[your-username]/americas-next-top-curable)

### Manual Deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts - defaults work great!
```

### Features:
- ✅ Custom domains
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ Analytics
- ✅ Preview deployments

## 🌐 Netlify (Alternative)

### Drag & Drop:
1. Zip your repository
2. Go to [netlify.com](https://netlify.com)
3. Drag zip file to deploy area
4. Instant live demo!

### Git Integration:
1. Connect your GitHub repository
2. Build settings: (leave empty for static)
3. Auto-deploy on push

## 🖥️ Local Development

### Quick Start:
```bash
# Clone repository
git clone https://github.com/[your-username]/americas-next-top-curable.git
cd americas-next-top-curable

# Start server
npm start
# OR
node start-server.js

# Open browser
http://localhost:7000
```

### Available Scripts:
```bash
npm run demo        # Main demo
npm run simple      # Simple version
npm run blockchain  # Full blockchain
npm run test        # Test functionality
```

## ⛓️ Blockchain Deployment (Advanced)

### Prerequisites:
- Aptos CLI installed
- Wallet with test APT tokens
- Move compiler

### Deploy Smart Contracts:
```bash
# Initialize Aptos account
aptos init

# Compile contracts
aptos move compile

# Deploy to devnet
aptos move publish

# Get contract address
aptos account list --query resources
```

### Update Frontend:
Replace contract address in HTML files:
```javascript
const MODULE_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

## 🎯 Production Considerations

### Performance:
- ✅ All demos are single HTML files
- ✅ No build process required
- ✅ Minimal dependencies
- ✅ Fast loading times

### Security:
- ✅ No server-side processing
- ✅ Client-side only
- ✅ No sensitive data storage
- ✅ HTTPS recommended

### Monitoring:
- Add Google Analytics
- Monitor Core Web Vitals
- Track user interactions
- Error monitoring (Sentry)

### Custom Domains:
Most platforms support custom domains:
- `yourdemo.com`
- `demo.yourcompany.com`
- `molecules.yourproject.io`

## 🔧 Configuration Options

### Environment Variables:
Create `.env` file for customization:
```env
# Demo Configuration
DEMO_TITLE="Your Custom Title"
CONTRACT_ADDRESS="0xYourContractAddress"
NETWORK="devnet"

# Analytics
GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Features
ENABLE_BLOCKCHAIN="true"
ENABLE_WALLET="false"
```

### HTML Customization:
Easy to modify in HTML files:
- Colors and branding
- Molecule examples
- Scoring weights
- Text and messaging

## 🐛 Troubleshooting

### Common Issues:

**GitHub Pages not working:**
- Check repository is public
- Verify branch name (main vs master)
- Wait 5-10 minutes for propagation

**Local server issues:**
```bash
# Kill any process on port 7000
lsof -ti:7000 | xargs kill -9

# Try different port
PORT=8000 npm start
```

**Blockchain connection fails:**
- Verify contract address
- Check network (devnet/testnet/mainnet)
- Confirm wallet connection
- Check console for errors

## 📊 Analytics Setup

### Google Analytics:
Add to HTML head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-XXXXXXXXX');
</script>
```

### Custom Events:
Track user interactions:
```javascript
// Track molecule selection
gtag('event', 'molecule_selected', {
  'molecule_name': moleculeName,
  'event_category': 'engagement'
});

// Track scoring completion
gtag('event', 'scoring_complete', {
  'ant_score': finalScore,
  'event_category': 'completion'
});
```

## 🎉 Launch Checklist

### Pre-Launch:
- [ ] Test all demo flows
- [ ] Verify mobile responsiveness  
- [ ] Check browser compatibility
- [ ] Validate blockchain connections
- [ ] Test error scenarios
- [ ] Verify analytics tracking

### Launch:
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Set up monitoring
- [ ] Share demo links
- [ ] Monitor initial usage
- [ ] Gather feedback

### Post-Launch:
- [ ] Monitor performance
- [ ] Track user behavior
- [ ] Collect feedback
- [ ] Plan improvements
- [ ] Scale if needed

## 🔗 Useful Links

- **GitHub Pages Docs:** https://pages.github.com/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Aptos Docs:** https://aptos.dev/
- **Move Language:** https://move-language.github.io/move/

---

**Ready to launch your molecular competition to the world!** 🚀🧬

>>>>>>> 261fc5d2fa7adefdf36e416d55fd7bef34e62b5a
