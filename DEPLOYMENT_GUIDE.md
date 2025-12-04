# 🚀 Deployment Guide for Anime & Media API v7

## 🟦 Render.com Deployment

### Step 1: Prepare Repository
```bash
# Fork this repository to your GitHub account
# Clone your fork locally
git clone https://github.com/YOUR_USERNAME/anime-media-api-v7.git
cd anime-media-api-v7
```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Select your forked repository
5. Use these settings:
   - **Name**: `anime-media-api-v7`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Click "Advanced Settings" and add:
   - **Health Check Path**: `/api/health`
7. Click "Create Web Service"

### Step 3: Access Your API
- Your API will be available at: `https://your-app-name.onrender.com`
- Dashboard at: `https://your-app-name.onrender.com`
- API status at: `https://your-app-name.onrender.com/api/status`

---

## 🟨 Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Deploy
```bash
# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Follow the prompts:
# - Set up and deploy? [Y/n] → y
# - Which scope? → Your account
# - Link to existing project? → n
# - Project name? → anime-media-api-v7
# - In which directory is your code located? → ./
# - Override settings? → n
```

### Step 3: Production Deploy
```bash
# Deploy to production
vercel --prod
```

Your API will be available at: `https://your-project-name.vercel.app`

---

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)
```bash
# Clone repository
git clone https://github.com/ntandomods/anime-media-api-v7.git
cd anime-media-api-v7

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Docker Build
```bash
# Build image
docker build -t anime-media-api-v7 .

# Run container
docker run -d -p 3000:3000 --name api-v7 anime-media-api-v7

# View logs
docker logs -f api-v7

# Stop container
docker stop api-v7
docker rm api-v7
```

---

## 🟢 Railway Deployment

### Step 1: Prepare Repository
```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/anime-media-api-v7.git
cd anime-media-api-v7
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your forked repository
5. Railway will automatically detect Node.js settings
6. Click "Deploy Now"

### Step 3: Configure
- Set environment variable `NODE_ENV=production`
- Your API will be available at the provided Railway URL

---

## 🔵 Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# Download from https://devcenter.heroku.com/articles/heroku-cli
# or use npm
npm install -g heroku
```

### Step 2: Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-api-name

# Set buildpack
heroku buildpacks:set heroku/nodejs

# Set environment
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

---

## 🟠 DigitalOcean App Platform

### Step 1: Prepare Repository
```bash
# Fork repository to GitHub
# Ensure you have the app.json file included
```

### Step 2: Deploy
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" → "GitHub"
3. Select your forked repository
4. Use these settings:
   - **Component Type**: Web Service
   - **Source Directory**: `./`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000
5. Click "Next" → "Create Resources"
6. Deploy!

---

## ⚙️ Environment Variables

### Production Environment Variables
Create `.env` file with:

```env
NODE_ENV=production
PORT=3000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
CACHE_TTL=600
CORS_ORIGIN=*
```

### Optional API Keys (for enhanced features)
```env
OPENAI_API_KEY=your_openai_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

---

## 🔍 Health Checks & Monitoring

All deployment platforms should use these health endpoints:

- **Health Check**: `/api/health`
- **Status**: `/api/status`
- **Expected Response**: `{"status": "healthy"}`

### Example Health Check Configuration
```yaml
# For platforms that support health checks
health_check_path: /api/health
health_check_interval: 30s
health_check_timeout: 10s
health_check_retries: 3
```

---

## 📊 Performance Optimization

### Production Tips
1. **Use CDN**: Enable CDN for static files
2. **Enable Compression**: Already built-in with gzip
3. **Rate Limiting**: Configured (100 requests/minute)
4. **Caching**: Built-in Redis-like caching (10min TTL)
5. **Monitor**: Use `/api/status` endpoint for monitoring

### Scaling
- **Free Tier**: Suitable for 1000-5000 requests/day
- **Paid Tier**: Recommended for >5000 requests/day
- **Load Balancing**: Use multiple instances for high traffic

---

## 🛡️ Security Considerations

### Production Security
1. **HTTPS**: Always enabled on deployed platforms
2. **Rate Limiting**: Prevents abuse
3. **CORS**: Configured for your domain
4. **Input Validation**: Built-in validation for all endpoints
5. **Error Handling**: Safe error responses

### Recommended Headers
```javascript
// Security headers automatically applied by Helmet.js
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Binding Error
```bash
Error: listen EADDRINUSE :::3000
```
**Solution**: The platform automatically sets PORT, use `process.env.PORT`

#### 2. Module Not Found
```bash
Error: Cannot find module 'express'
```
**Solution**: Ensure `npm install` runs during build

#### 3. Health Check Failing
**Solution**: Verify `/api/health` returns correct response

#### 4. CORS Issues
**Solution**: Set `CORS_ORIGIN` to your specific domain

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Check logs on deployment platform
heroku logs --tail  # Heroku
vercel logs        # Vercel
```

---

## 📈 Monitoring & Analytics

### Built-in Metrics
- **Uptime**: Available at `/api/status`
- **Request Count**: Tracked in dashboard
- **Memory Usage**: Available at `/api/status`
- **API Response Time**: Built-in latency tracking

### External Monitoring
- **Uptime Robot**: Monitor `/api/health`
- **Pingdom**: Custom monitoring setup
- **Grafana**: Advanced metrics dashboard

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Deploy to Render
        run: # Your deploy command
```

---

## 📞 Support

If you encounter issues during deployment:

1. **Check Logs**: Always check platform logs first
2. **Verify Environment**: Ensure all environment variables are set
3. **Health Check**: Test `/api/health` endpoint
4. **Documentation**: Refer to platform-specific docs
5. **Community**: Ask for help in Discord/GitHub Issues

---

🎉 **Congratulations! Your Anime & Media API v7 is now deployed and ready to use!**

Made with ❤️ by Ntando Mods ✔️