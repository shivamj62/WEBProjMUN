#!/bin/bash

# Frontend build script for Render deployment
echo "🚀 Starting frontend build for Render deployment..."

# Navigate to frontend directory
cd frontend

# Clear any existing cache
echo "🧹 Clearing cache..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Set environment variables for build
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Build the application
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Frontend build completed successfully!"
