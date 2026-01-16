#!/bin/bash

echo "🚀 GitHub Push Script for Brown Sugar Bakery Gifting"
echo ""

# Check if git config is set
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git user configuration needed"
    read -p "Enter your name: " GIT_NAME
    read -p "Enter your email: " GIT_EMAIL
    git config user.name "$GIT_NAME"
    git config user.email "$GIT_EMAIL"
    echo "✅ Git configured"
fi

# Show current status
echo ""
echo "📊 Current Git Status:"
git status --short

# Commit if there are changes
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 Creating commit..."
    git commit -m "Initial commit: Brown Sugar Bakery Corporate Gifting Platform

- Next.js 14 application with TypeScript and Tailwind CSS
- Budget-based gift builder with tier system (Bronze, Silver, Gold, Platinum)
- CSV recipient upload and management
- Shopify GraphQL integration for draft orders
- Mobile-responsive design with best practices
- Product catalog with static JSON for local testing
- Complete order flow: tier selection → gift building → recipients → review → confirmation"
    echo "✅ Committed"
else
    echo "✅ No changes to commit"
fi

# Check if remote exists
if [ -z "$(git remote -v)" ]; then
    echo ""
    echo "🔗 Adding GitHub remote..."
    read -p "Enter your GitHub username: " GITHUB_USER
    read -p "Enter repository name [brown-sugar-bakery-gifting]: " REPO_NAME
    REPO_NAME=${REPO_NAME:-brown-sugar-bakery-gifting}
    
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
    echo "✅ Remote added: https://github.com/$GITHUB_USER/$REPO_NAME.git"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repository at: $(git remote get-url origin | sed 's/\.git$//')"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. Repository exists on GitHub"
    echo "   2. You have push access"
    echo "   3. You're authenticated (use 'gh auth login' or SSH keys)"
fi
