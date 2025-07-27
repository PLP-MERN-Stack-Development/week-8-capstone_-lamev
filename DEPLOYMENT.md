# 🚀 Render Deployment Guide for StockMaster Pro

## Prerequisites
- GitHub account with your repository
- Render account (free tier available)
- MongoDB Atlas account (free tier available)

## Step 1: Set up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `stockdb`

## Step 2: Deploy to Render

### Option A: Automatic Deployment (Recommended)

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

### Option B: Manual Deployment

#### Backend Service
1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect to your GitHub repository
   - Name: `stockmaster-backend`

2. **Configure Build Settings**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
   - Environment: `Node`

3. **Add Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string

#### Frontend Service
1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect to your GitHub repository
   - Name: `stockmaster-frontend`

2. **Configure Build Settings**
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

3. **Add Environment Variables**
   - `REACT_APP_API_URL`: Your backend service URL (e.g., `https://stockmaster-backend.onrender.com`)

## Step 3: Verify Deployment

1. **Check Backend**
   - Visit your backend URL: `https://your-backend-name.onrender.com`
   - You should see: "Stock Management API is running"

2. **Check Frontend**
   - Visit your frontend URL: `https://your-frontend-name.onrender.com`
   - You should see the StockMaster Pro login page

3. **Test the Application**
   - Register a new account
   - Add some sample products
   - Test all features

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes Render's IPs
   - Ensure database user has proper permissions

3. **Frontend Can't Connect to Backend**
   - Verify `REACT_APP_API_URL` environment variable
   - Check CORS settings in backend
   - Ensure backend is running and accessible

4. **Authentication Issues**
   - Verify `JWT_SECRET` is set correctly
   - Check if tokens are being stored properly
   - Clear browser cache and try again

### Environment Variables Checklist

**Backend (.env)**
```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockdb
JWT_SECRET=your_secure_secret_key
```

**Frontend (Render Environment Variables)**
```env
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify all environment variables are set
3. Test locally first to ensure code works
4. Check MongoDB Atlas connection
5. Review the README.md for additional information

## Success!

Once deployed, your StockMaster Pro application will be available at:
- **Frontend**: https://your-frontend-name.onrender.com
- **Backend API**: https://your-backend-name.onrender.com

🎉 Congratulations! Your inventory management system is now live and ready for use! 