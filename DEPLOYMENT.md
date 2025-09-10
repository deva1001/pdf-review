# 🚀 Production Deployment Guide

This guide will help you deploy the PDF Review Dashboard to production using Vercel.

## 📋 Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas Account** - Free tier available at [mongodb.com/atlas](https://www.mongodb.com/atlas)
4. **AI API Keys** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey) or [Groq Console](https://console.groq.com/)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with read/write permissions
5. Get your connection string
6. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)

**Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard?retryWrites=true&w=majority
```

## 🤖 Step 2: Get AI API Keys

### Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

### Groq API Key (Optional):
1. Go to [Groq Console](https://console.groq.com/)
2. Create a new API key
3. Copy the key

## 📦 Step 3: Deploy API to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy API:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - **Root Directory**: `apps/api`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   BLOB_READ_WRITE_TOKEN=vercel_blob_token_here
   NODE_ENV=production
   ```

4. **Get Vercel Blob Token:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Go to Storage → Blob
   - Create a new Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN`

4. **Deploy** - Click "Deploy"

## 🌐 Step 4: Deploy Web App to Vercel

1. **Create Another Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import the same GitHub repository
   - **Root Directory**: `apps/web`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

2. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app/api
   ```

3. **Deploy** - Click "Deploy"

## 🔗 Step 5: Update API URL

After both deployments are complete:

1. Copy your API URL from Vercel (e.g., `https://pdf-dashboard-api.vercel.app`)
2. Update the web app's environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app/api
   ```
3. Redeploy the web app

## ✅ Step 6: Test Production

1. **API Health Check:**
   - Visit: `https://your-api-domain.vercel.app/api/health`
   - Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

2. **Web App:**
   - Visit: `https://your-web-domain.vercel.app`
   - Test PDF upload and data extraction
   - Test invoice management

## 🔧 Production Features

### ✅ **Automatic Database Detection:**
- If MongoDB is connected → Uses database
- If no MongoDB → Falls back to in-memory storage
- Seamless transition between modes

### ✅ **Environment-Based Configuration:**
- Development: In-memory storage
- Production: MongoDB Atlas
- No code changes needed

### ✅ **Error Handling:**
- Graceful fallbacks
- Proper error messages
- Production logging

## 📊 Expected URLs

After deployment, you should have:

- **Web App**: `https://pdf-dashboard-web.vercel.app`
- **API**: `https://pdf-dashboard-api.vercel.app`
- **API Health**: `https://pdf-dashboard-api.vercel.app/api/health`

## 🛠️ Troubleshooting

### Common Issues:

1. **API Not Connecting:**
   - Check environment variables
   - Verify MongoDB connection string
   - Check Vercel function logs

2. **Web App Not Loading:**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify API is deployed and running
   - Check browser console for errors

3. **Database Connection Issues:**
   - Verify MongoDB Atlas cluster is running
   - Check IP whitelist settings
   - Verify database user permissions

### Debug Commands:

```bash
# Check API health
curl https://your-api-domain.vercel.app/api/health

# Test API endpoints
curl -X POST https://your-api-domain.vercel.app/api/upload \
  -F "file=@test.pdf"

curl -X GET https://your-api-domain.vercel.app/api/invoices
```

## 📈 Monitoring

### Vercel Analytics:
- Monitor API performance
- Track web app usage
- View error logs

### MongoDB Atlas:
- Monitor database performance
- Track query metrics
- Set up alerts

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit API keys to Git
   - Use Vercel's environment variable system
   - Rotate keys regularly

2. **MongoDB Security:**
   - Use strong passwords
   - Whitelist specific IPs
   - Enable authentication

3. **API Security:**
   - Add rate limiting
   - Implement CORS properly
   - Add request validation

## 🚀 Next Steps

1. **Set up monitoring** with Vercel Analytics
2. **Add authentication** for user management
3. **Implement file storage** with Vercel Blob
4. **Add real AI integration** with your API keys
5. **Set up CI/CD** for automatic deployments

## 📞 Support

If you encounter issues:

1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check MongoDB Atlas connection

Your PDF Review Dashboard is now production-ready! 🎉
