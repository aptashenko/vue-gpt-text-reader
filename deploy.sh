#!/bin/bash

echo "🚀 Language Reader MVP Deployment Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Please create it with your production environment variables."
    echo "Required variables:"
    echo "  VITE_SUPABASE_URL"
    echo "  VITE_SUPABASE_ANON_KEY"
    echo "  VITE_SUPABASE_SERVICE_ROLE_KEY"
    echo "  VITE_OPENAI_API_KEY"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test the deployed application"
echo "3. Set up custom domain (optional)"
echo ""
echo "For more information, see DEPLOYMENT.md" 