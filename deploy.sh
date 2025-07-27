#!/bin/bash

echo "🚀 StockMaster Pro Deployment Script"
echo "====================================="

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Git repository has uncommitted changes"
    echo "Please commit your changes before deploying:"
    echo "git add ."
    echo "git commit -m 'Your commit message'"
    exit 1
fi

echo "✅ Git repository is clean"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Go to https://render.com"
    echo "2. Sign up/login with your GitHub account"
    echo "3. Click 'New +' → 'Blueprint'"
    echo "4. Connect to your repository: week-8-capstone_-lamev"
    echo "5. Set up MongoDB Atlas (see RENDER_DEPLOYMENT_STEPS.md)"
    echo "6. Configure environment variables:"
    echo "   - MONGO_URI: Your MongoDB Atlas connection string"
    echo "   - JWT_SECRET: A secure random string"
    echo "7. Click 'Apply' to deploy"
    echo ""
    echo "📚 For detailed instructions, see RENDER_DEPLOYMENT_STEPS.md"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi 