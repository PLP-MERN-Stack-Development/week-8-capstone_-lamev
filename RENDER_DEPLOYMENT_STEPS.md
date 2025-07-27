# 🚀 Complete Render Deployment Guide for StockMaster Pro

## Why the Frontend Link Isn't Working

The frontend link `https://stockmaster-frontend.onrender.com` isn't working because:
1. **The application hasn't been deployed to Render yet**
2. **You need to manually deploy it first**

## Step-by-Step Deployment Process

### Step 1: Set Up MongoDB Atlas (Required)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier)

2. **Configure Database**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `stockdb`

3. **Network Access**
   - Go to Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for Render deployment)

### Step 2: Deploy to Render

#### Option A: Automatic Deployment (Recommended)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/login with your GitHub account

2. **Create Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `week-8-capstone_-lamev`
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   - Add these environment variables:
     - `MONGO_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string (e.g., `mysecretkey123456`)

4. **Deploy**
   - Click "Apply" to start deployment
   - Wait for both services to build and deploy

#### Option B: Manual Deployment

**Backend Service:**
1. Click "New +" → "Web Service"
2. Connect to your GitHub repository
3. Name: `stockmaster-backend`
4. Build Command: `cd backend && npm install`
5. Start Command: `cd backend && node server.js`
6. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string

**Frontend Service:**
1. Click "New +" → "Static Site"
2. Connect to your GitHub repository
3. Name: `stockmaster-frontend`
4. Build Command: `cd frontend && npm install && npm run build`
5. Publish Directory: `frontend/build`
6. Environment Variables:
   - `REACT_APP_API_URL`: Your backend service URL

### Step 3: Verify Deployment

1. **Check Backend**
   - Visit your backend URL: `https://your-backend-name.onrender.com`
   - You should see: JSON response with API information

2. **Check Frontend**
   - Visit your frontend URL: `https://your-frontend-name.onrender.com`
   - You should see the StockMaster Pro login page

## Troubleshooting Common Issues

### Issue 1: Build Fails
**Symptoms:** Build fails in Render dashboard
**Solutions:**
- Check build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### Issue 2: Frontend Can't Connect to Backend
**Symptoms:** Frontend loads but shows connection errors
**Solutions:**
- Verify `REACT_APP_API_URL` environment variable is set correctly
- Check CORS settings in backend
- Ensure backend is running and accessible

### Issue 3: Database Connection Issues
**Symptoms:** Backend fails to start or shows database errors
**Solutions:**
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes Render's IPs
- Ensure database user has proper permissions

### Issue 4: Authentication Issues
**Symptoms:** Login/register doesn't work
**Solutions:**
- Verify `JWT_SECRET` is set correctly
- Check if tokens are being stored properly
- Clear browser cache and try again

## Environment Variables Checklist

**Backend Environment Variables:**
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockdb
JWT_SECRET=your_secure_secret_key
```

**Frontend Environment Variables:**
```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

## Testing Your Deployment

1. **Test Backend API:**
   ```bash
   curl https://your-backend-name.onrender.com/health
   ```

2. **Test Frontend:**
   - Open your frontend URL in browser
   - Try to register a new account
   - Add some sample products

3. **Test Full Flow:**
   - Register → Login → Add Products → View Dashboard

## Expected URLs After Deployment

Once deployed successfully, your URLs will be:
- **Backend**: `https://your-backend-name.onrender.com`
- **Frontend**: `https://your-frontend-name.onrender.com`

## Support

If you still have issues:
1. Check Render deployment logs
2. Verify all environment variables are set
3. Test locally first to ensure code works
4. Check MongoDB Atlas connection
5. Review the error messages in browser console

## Quick Fix Commands

If you need to update the deployment:
```bash
# Make changes to your code
git add .
git commit -m "Fix deployment issues"
git push origin main
# Render will automatically redeploy
```

---

**Remember:** The frontend link will only work AFTER you complete the deployment process on Render. The current link `https://stockmaster-frontend.onrender.com` is just a placeholder and won't work until you deploy your actual application. 