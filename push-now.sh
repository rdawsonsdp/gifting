#!/bin/bash

echo "🚀 Pushing to GitHub..."
echo ""

# Check if remote already exists
if git remote -v | grep -q origin; then
    echo "✅ Remote already configured"
    git remote -v
else
    echo "📝 Please provide your GitHub details:"
    read -p "Enter your GitHub username: " GITHUB_USER
    read -p "Enter repository name [brown-sugar-bakery-gifting]: " REPO_NAME
    REPO_NAME=${REPO_NAME:-brown-sugar-bakery-gifting}
    
    echo ""
    echo "🔗 Adding remote: https://github.com/$GITHUB_USER/$REPO_NAME.git"
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
fi

echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository URL: $(git remote get-url origin | sed 's/\.git$//')"
else
    echo ""
    echo "❌ Push failed. Possible reasons:"
    echo "   1. Repository doesn't exist on GitHub yet"
    echo "   2. Authentication issue (use 'gh auth login' or SSH keys)"
    echo "   3. No push access to the repository"
    echo ""
    echo "💡 To create the repository on GitHub:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Repository name: $REPO_NAME"
    echo "   3. Description: Corporate gifting platform for Brown Sugar Bakery"
    echo "   4. Choose Private or Public"
    echo "   5. DO NOT initialize with README (we already have one)"
    echo "   6. Click 'Create repository'"
    echo "   7. Run this script again"
fi
