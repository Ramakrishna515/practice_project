#!/bin/bash

echo "🚀 Starting Complete HRMS Application..."
echo ""

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB is already running"
else
    echo "🔄 Starting MongoDB..."
    brew services start mongodb-community@8.0
    sleep 3
    echo "✅ MongoDB started"
fi

echo ""
echo "🔧 Starting Backend Server..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start backend in background
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on http://localhost:5001"

cd ..
echo ""
echo "🎨 Starting Frontend..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "✅ Frontend starting on http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 HRMS Application is Starting!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Backend:  http://localhost:5001"
echo "📍 Frontend: http://localhost:3000"
echo "📍 MongoDB:  mongodb://localhost:27017/myapp"
echo ""
echo "📝 See COMPLETE_SETUP_GUIDE.md for testing instructions"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm start
