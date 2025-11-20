#!/bin/bash

echo "🚀 AI Coding App - Development Server Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Create environment file if it doesn't exist
if [ ! -f ../.env ]; then
    echo "📝 Creating .env file from template..."
    cp ../.env.example ../.env
    echo "⚠️  Please edit .env file with your API keys and database credentials"
fi

# Check if PostgreSQL is running
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client detected"
else
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL 13+"
fi

# Check if Redis is running
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis client detected"
else
    echo "⚠️  Redis client not found. Redis is optional but recommended for queue management"
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up PostgreSQL database: createdb ai_coding_app"
echo "3. (Optional) Start Redis: redis-server"
echo "4. Run development server: npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api/docs"
echo ""
echo "🤖 Make sure to set your OpenAI API key in the .env file!"
echo ""
echo "Happy coding! 🎯"