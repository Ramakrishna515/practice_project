#!/bin/bash
# Manual Docker Start Script
# This script shows you what docker-compose does behind the scenes

set -e

echo "🐳 Starting Docker containers manually..."
echo ""

# Step 1: Create network
echo "📡 Step 1: Creating network..."
docker network create myapp-network 2>/dev/null || echo "Network already exists"
echo "✅ Network created: myapp-network"
echo ""

# Step 2: Start MongoDB
echo "🗄️  Step 2: Starting MongoDB..."
docker run -d \
  --name mongodb \
  --network myapp-network \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=myapp \
  -v mongo-data:/data/db \
  mongo:7 2>/dev/null || echo "MongoDB already running"
echo "✅ MongoDB running on port 27017"
echo ""

# Step 3: Build backend
echo "🔧 Step 3: Building backend image..."
cd backend
docker build -t my-backend:v1 . -q
cd ..
echo "✅ Backend image built: my-backend:v1"
echo ""

# Step 4: Start backend
echo "🔧 Step 4: Starting backend..."
docker run -d \
  --name backend \
  --network myapp-network \
  -p 5001:5001 \
  -e NODE_ENV=development \
  -e PORT=5001 \
  -e MONGODB_URI=mongodb://mongodb:27017/myapp \
  -v "$(pwd)/backend:/app" \
  -v /app/node_modules \
  my-backend:v1 2>/dev/null || echo "Backend already running"
echo "✅ Backend running on port 5001"
echo ""

# Step 5: Build frontend
echo "⚛️  Step 5: Building frontend image..."
cd frontend
docker build -t my-frontend:v1 . -q
cd ..
echo "✅ Frontend image built: my-frontend:v1"
echo ""

# Step 6: Start frontend
echo "⚛️  Step 6: Starting frontend..."
docker run -d \
  --name frontend \
  --network myapp-network \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:5001 \
  -v "$(pwd)/frontend:/app" \
  -v /app/node_modules \
  my-frontend:v1 2>/dev/null || echo "Frontend already running"
echo "✅ Frontend running on port 3000"
echo ""

# Summary
echo "🎉 All containers started!"
echo ""
echo "📊 Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Access your app:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo "   MongoDB:  mongodb://localhost:27017"
echo ""
echo "📝 View logs:"
echo "   docker logs backend"
echo "   docker logs frontend"
echo "   docker logs mongodb"
echo ""
echo "🛑 Stop all:"
echo "   ./docker-manual-stop.sh"
