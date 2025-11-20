#!/bin/bash

# AI Coding App Setup Verification Script
echo "🔍 Verifying AI Coding App Setup..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 (Missing)${NC}"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ $1/${NC}"
        return 0
    else
        echo -e "${RED}❌ $1/ (Missing)${NC}"
        return 1
    fi
}

# Check root files
echo "📁 Root Configuration Files:"
check_file "package.json"
check_file ".env"
check_file ".env.example"
check_file "docker-compose.yml"
check_file "README.md"
check_file "DEVELOPER_GUIDE.md"
check_file "shared/config.yaml"
echo

# Check backend structure
echo "🔧 Backend Structure:"
check_dir "backend/src"
check_file "backend/package.json"
check_file "backend/tsconfig.json"
check_file "backend/src/main.ts"
check_file "backend/src/app.module.ts"
check_dir "backend/src/modules"
check_dir "backend/src/database"
check_dir "backend/src/config"
echo

# Check frontend structure  
echo "🎨 Frontend Structure:"
check_dir "frontend/src"
check_file "frontend/package.json"
check_file "frontend/vite.config.ts"
check_file "frontend/tsconfig.json"
check_dir "frontend/src/components"
check_dir "frontend/src/pages"
check_dir "frontend/src/stores"
echo

# Check shared configuration
echo "⚙️  Configuration Files:"
check_file "shared/config.yaml"
echo

# Test environment file
echo "🔑 Environment Configuration:"
if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
        echo -e "${GREEN}✅ OpenAI API key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  OpenAI API key not configured${NC}"
    fi
    
    if grep -q "CLAUDE_API_KEY=sk-" .env 2>/dev/null; then
        echo -e "${GREEN}✅ Claude API key configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Claude API key not configured${NC}"
    fi
else
    echo -e "${RED}❌ .env file missing${NC}"
fi
echo

# Check Docker services
echo "🐳 Docker Services:"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker installed${NC}"
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ Docker Compose configuration found${NC}"
    fi
else
    echo -e "${RED}❌ Docker not installed${NC}"
fi
echo

# Check Node.js and npm
echo "📦 Development Tools:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not installed${NC}"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not installed${NC}"
fi
echo

# Check Python (for AI libraries)
echo "🐍 Python Environment:"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python installed: $PYTHON_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Python not installed (optional for AI features)${NC}"
fi
echo

# Check GPU support
echo "🎮 GPU Support:"
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}✅ NVIDIA GPU detected${NC}"
    nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
else
    echo -e "${YELLOW}⚠️  NVIDIA GPU not detected${NC}"
fi
echo

# Summary
echo "📋 Setup Summary:"
total_checks=0
passed_checks=0

for file in package.json .env docker-compose.yml README.md DEVELOPER_GUIDE.md shared/config.yaml; do
    ((total_checks++))
    if [ -f "$file" ]; then
        ((passed_checks++))
    fi
done

for dir in backend/src frontend/src; do
    ((total_checks++))
    if [ -d "$dir" ]; then
        ((passed_checks++))
    fi
done

echo -e "${GREEN}Passed: $passed_checks/$total_checks checks${NC}"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 Setup verification passed! Ready to start development.${NC}"
    echo
    echo "Next steps:"
    echo "1. Edit .env with your API keys"
    echo "2. Start services: npm run setup"
    echo "3. Install dependencies: npm run dev:install"
    echo "4. Start development: npm run dev"
else
    echo -e "${RED}⚠️  Some checks failed. Please review the issues above.${NC}"
fi
echo

echo "📖 For detailed setup instructions, see DEVELOPER_GUIDE.md"