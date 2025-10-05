# 🚀 Render Deployment Guide - Curable Catalysts

This guide walks you through deploying the Curable Catalysts demo to Render.com.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available at https://render.com)
- Your repository pushed to GitHub

## 🎯 Quick Deploy (Recommended)

### Option 1: Deploy via Render Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Web Service on Render**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this repository

3. **Configure the service**
   - **Name**: `curable-catalysts-demo` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Wait for the deployment to complete (usually 2-5 minutes)

5. **Access your app**
   - Your app will be available at: `https://your-service-name.onrender.com`
   - The main demo will load automatically at the root URL

### Option 2: Deploy via render.yaml (Infrastructure as Code)

This repository includes a `render.yaml` file for automated deployment.

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create New Blueprint Instance**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select this repository
   - Render will automatically detect the `render.yaml` file

3. **Review and Deploy**
   - Review the configuration
   - Click "Apply"
   - Your service will be deployed automatically

## 🔧 Configuration Details

### Environment Variables (Optional)

You can configure these in the Render dashboard under "Environment":

- `NODE_ENV`: Set to `production` (automatically set by render.yaml)
- `PORT`: Automatically set by Render (don't override)

### File Structure

The deployment includes:
```
├── start-server.js          # Main server (configured for Render)
├── americas-next-top-curable-blockchain.html  # Main demo page
├── package.json             # Dependencies
├── render.yaml              # Render configuration
└── public/                  # Static assets
```

## 🎨 Available Demos

Once deployed, you can access:

- **Main Demo**: `https://your-app.onrender.com/`
- **Blockchain Demo**: `https://your-app.onrender.com/americas-next-top-curable-blockchain.html`
- **Working Backup**: `https://your-app.onrender.com/WORKING_BACKUP_DO_NOT_DELETE.html`
- **Complete Demo**: `https://your-app.onrender.com/COMPLETE_HACKATHON_BACKUP_2024-10-05.html`

## 🔍 Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. Monitor real-time server activity

### Health Checks
- Render automatically performs health checks
- The server responds with the main HTML page
- Check status in the "Events" tab

## 🐛 Troubleshooting

### Build Fails
- **Issue**: npm install fails
- **Solution**: Check that package.json dependencies are correct
  ```bash
  npm install  # Test locally first
  ```

### Server Won't Start
- **Issue**: Port binding error
- **Solution**: Ensure you're not hardcoding the PORT. The server uses `process.env.PORT`

### 404 Errors
- **Issue**: Files not found
- **Solution**:
  - Check file paths are relative to project root
  - Ensure files are not in .gitignore
  - Verify files are committed to GitHub

### Private Keys Exposed
- **Issue**: Aptos keys showing in logs
- **Solution**:
  - Ensure `.aptos-key` and `.aptos-key.pub` are in .gitignore
  - Never commit private keys
  - Regenerate keys if exposed

## 🔄 Updating Your Deployment

1. **Make changes locally**
   ```bash
   # Edit your files
   git add .
   git commit -m "Your update message"
   git push origin main
   ```

2. **Automatic Redeploy**
   - Render automatically detects changes
   - Rebuilds and redeploys automatically
   - Check the "Events" tab for progress

## 💰 Pricing

### Free Tier Includes:
- 750 hours/month of running time
- Automatic SSL certificates
- Custom domains
- Automatic deploys from Git
- Sleep after 15 minutes of inactivity

**Note**: Free tier services spin down after inactivity. First request may take 30-60 seconds as the service spins up.

### Upgrade Options:
- **Starter**: $7/month - Always on, no sleep
- **Standard**: $25/month - More resources, better performance

## 🔐 Security Best Practices

1. **Never commit sensitive files**
   - Private keys (`.aptos-key`, `.aptos-key.pub`)
   - Environment variables with secrets
   - Database credentials

2. **Use Environment Variables**
   - Store secrets in Render's Environment Variables
   - Access via `process.env.VARIABLE_NAME`

3. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm update
   ```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Render Community](https://community.render.com)

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] render.yaml configured
- [ ] .gitignore includes sensitive files
- [ ] package.json has correct start script
- [ ] Server uses PORT from environment
- [ ] Server binds to 0.0.0.0 (not 127.0.0.1)
- [ ] All static files are committed
- [ ] Local testing passed (`npm start`)
- [ ] Render service created
- [ ] Deployment successful
- [ ] Live URL works

## 🎉 Success!

Your Curable Catalysts demo is now live on Render! Share your deployment URL with the hackathon judges and community.

---

**Need Help?** Create an issue on GitHub or check the Render documentation.
