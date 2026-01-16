# GitHub Repository Setup Guide

## Current Status
✅ Git repository initialized  
✅ All files staged  
⏳ Ready to commit and push

## Step 1: Configure Git (if not already done)

Run these commands to set your git identity (replace with your actual name and email):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Or for this repository only:

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Create Initial Commit

```bash
git commit -m "Initial commit: Brown Sugar Bakery Corporate Gifting Platform

- Next.js 14 application with TypeScript and Tailwind CSS
- Budget-based gift builder with tier system (Bronze, Silver, Gold, Platinum)
- CSV recipient upload and management
- Shopify GraphQL integration for draft orders
- Mobile-responsive design with best practices
- Product catalog with static JSON for local testing
- Complete order flow: tier selection → gift building → recipients → review → confirmation"
```

## Step 3: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `brown-sugar-bakery-gifting` (or your preferred name)
4. Description: "Corporate gifting platform for Brown Sugar Bakery"
5. Choose **Private** or **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create brown-sugar-bakery-gifting --private --description "Corporate gifting platform for Brown Sugar Bakery" --source=. --remote=origin --push
```

## Step 4: Add Remote and Push

After creating the repository on GitHub, run:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/brown-sugar-bakery-gifting.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/brown-sugar-bakery-gifting.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 5: Verify Push

Check that everything was pushed:

```bash
git remote -v
git log --oneline
```

Visit your repository on GitHub to confirm all files are there.

## Repository Details

### Repository Name
`brown-sugar-bakery-gifting`

### Description
Corporate gifting platform for Brown Sugar Bakery - Budget-based gift builder with CSV recipient management and Shopify integration.

### Key Files Included
- ✅ Next.js application (`app/`, `components/`)
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Product catalog (`lib/products.json`)
- ✅ CSV parsing utilities
- ✅ Shopify integration (`lib/shopify.ts`)
- ✅ Mobile-responsive components
- ✅ Documentation (`README.md`, `MOBILE_BEST_PRACTICES.md`)

### Files Excluded (via .gitignore)
- `node_modules/`
- `.next/`
- `.env*` files
- Build artifacts
- IDE files

## Next Steps After Push

1. **Set up environment variables** in GitHub Secrets (if deploying):
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_ADMIN_API_TOKEN`

2. **Configure deployment** (Vercel recommended):
   - Connect GitHub repository
   - Add environment variables
   - Deploy automatically on push

3. **Add collaborators** (if needed):
   - Settings → Collaborators → Add people

4. **Set up branch protection** (optional):
   - Settings → Branches → Add rule for `main` branch

## Quick Push Script

Save this as `push-to-github.sh` and run it:

```bash
#!/bin/bash

# Configure git (update with your details)
read -p "Enter your name: " GIT_NAME
read -p "Enter your email: " GIT_EMAIL
read -p "Enter your GitHub username: " GITHUB_USER

git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

# Commit changes
git commit -m "Initial commit: Brown Sugar Bakery Corporate Gifting Platform

- Next.js 14 application with TypeScript and Tailwind CSS
- Budget-based gift builder with tier system
- CSV recipient upload and management
- Shopify GraphQL integration
- Mobile-responsive design with best practices"

# Add remote and push
git remote add origin https://github.com/$GITHUB_USER/brown-sugar-bakery-gifting.git
git branch -M main
git push -u origin main

echo "✅ Code pushed to GitHub!"
```

Make it executable:
```bash
chmod +x push-to-github.sh
./push-to-github.sh
```
