#!/bin/bash

# NutriPlay Deployment Script
# This script helps you deploy your NutriPlay app to various platforms

echo "🥕 NutriPlay Deployment Helper"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NutriPlay nutrition trivia app"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "Choose your deployment platform:"
echo "1. Vercel (Recommended - Easiest)"
echo "2. Netlify"
echo "3. Railway"
echo "4. Render"
echo "5. Just build for production"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo ""
        echo "Steps:"
        echo "1. Push your code to GitHub:"
        echo "   git remote add origin https://github.com/yourusername/nutriplay.git"
        echo "   git push -u origin main"
        echo ""
        echo "2. Go to https://vercel.com"
        echo "3. Sign in with GitHub"
        echo "4. Click 'New Project'"
        echo "5. Import your repository"
        echo "6. Click 'Deploy'"
        echo ""
        echo "✅ Your app will be live at: https://your-project.vercel.app"
        ;;
    2)
        echo ""
        echo "🌐 Deploying to Netlify..."
        echo ""
        echo "Steps:"
        echo "1. Build your project:"
        echo "   npm run build"
        echo ""
        echo "2. Go to https://netlify.com"
        echo "3. Drag and drop the 'out' folder"
        echo "   OR connect your GitHub repository"
        echo ""
        echo "✅ Your app will be live at: https://your-project.netlify.app"
        ;;
    3)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""
        echo "Steps:"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://railway.app"
        echo "3. Sign in with GitHub"
        echo "4. Click 'New Project'"
        echo "5. Select 'Deploy from GitHub repo'"
        echo "6. Choose your repository"
        echo ""
        echo "✅ Railway will auto-deploy your app"
        ;;
    4)
        echo ""
        echo "⚡ Deploying to Render..."
        echo ""
        echo "Steps:"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://render.com"
        echo "3. Sign in with GitHub"
        echo "4. Click 'New +'"
        echo "5. Select 'Web Service'"
        echo "6. Connect your repository"
        echo "7. Set Build Command: npm install && npm run build"
        echo "8. Set Start Command: npm start"
        echo ""
        echo "✅ Render will auto-deploy your app"
        ;;
    5)
        echo ""
        echo "🔨 Building for production..."
        npm run build
        echo ""
        echo "✅ Build complete! Files are in the 'out' directory"
        echo "You can now deploy the 'out' folder to any static hosting service"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Happy deploying! Your NutriPlay app will be live soon!"
echo ""
echo "📚 For more help, check the README.md file"
