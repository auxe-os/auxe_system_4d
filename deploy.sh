#!/bin/bash

# Quick deploy script for portfolio website
echo "🚀 Starting deployment..."

# Check if there are changes to commit
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    git push
    echo "✅ Changes pushed to repository"
else
    echo "ℹ️  No changes to commit"
fi

# Deploy to production
echo "🌐 Deploying to production..."
vercel --prod

echo "🎉 Deployment complete!"