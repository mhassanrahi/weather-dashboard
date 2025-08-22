#!/bin/bash

echo "🔍 Weather Dashboard Setup Verification"
echo "======================================="

# Check Node.js version
echo "📦 Node.js version:"
node --version

# Check npm version
echo "📦 npm version:"
npm --version

# Check if MongoDB is running
echo "🗃️  MongoDB status:"
if command -v mongosh &> /dev/null; then
    mongosh --eval "db.runCommand('ping')" 2>/dev/null && echo "✅ MongoDB is running" || echo "❌ MongoDB is not running"
else
    echo "⚠️  mongosh not found - install MongoDB or use cloud connection"
fi

# Check backend dependencies
echo "🔧 Backend setup:"
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies missing - run 'cd backend && npm install'"
fi

# Check frontend dependencies
echo "🎨 Frontend setup:"
if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing - run 'cd frontend && npm install'"
fi

# Check environment files
echo "⚙️  Environment configuration:"
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "⚠️  Backend .env missing - copy from backend/.env.example"
fi

if [ -f "frontend/.env.local" ]; then
    echo "✅ Frontend .env.local file exists"
else
    echo "⚠️  Frontend .env.local missing - copy from frontend/.env.local.example"
fi

echo ""
echo "🚀 To start the application:"
echo "1. Backend:  cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Open:     http://localhost:3000"
echo ""
echo "🧪 To run tests:"
echo "Backend:  cd backend && npm test"
echo "Frontend: cd frontend && npm test"
echo ""
echo "✨ Happy coding!"
