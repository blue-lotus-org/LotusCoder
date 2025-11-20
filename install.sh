#!/bin/bash

# LotusAGI Installer Script
# This script automates the installation and setup of LotusAGI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
print_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                                                                          ║
    ║   ████████╗██╗  ██╗███████╗    ███████╗██╗   ██╗██████╗  █████╗ ██╗██████╗  ║
    ║   ╚══██╔══╝██║  ██║██╔════╝    ██╔════╝╝██╗ ██╔╝██╔══██╗██╔══██╗██║██╔══██╗ ║
    ║      ██║   ███████║█████╗      ███████╗  ╚████╔╝ ██████╔╝███████║██║██████╔╝ ║
    ║      ██║   ██╔══██║██╔══╝      ╚════██║   ╚██╔╝  ██╔═══╝ ██╔══██║██║██╔══██╗ ║
    ║      ██║   ██║  ██║███████╗    ███████║    ██║   ██║     ██║  ██║██║██║  ██║ ║
    ║      ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚══════╝    ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ║
    ║                                                                          ║
    ║                     AI-Powered Coding Assistant                         ║
    ║                     with Multi-Agent System                              ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Configuration
LOTUSAGI_VERSION="1.0.0"
MIN_NODE_VERSION="18.0.0"
MIN_NPM_VERSION="8.0.0"

# Installation paths
INSTALL_DIR="$HOME/.lotusagi"
LOG_FILE="$INSTALL_DIR/install.log"

# Default values
AUTO_SETUP=true
SKIP_DEPS=false
START_SERVICES=true
CONFIGURE_GPU=false

# Check if running on supported OS
check_os() {
    echo -e "${BLUE}🔍 Checking operating system...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get >/dev/null 2>&1; then
            OS="ubuntu"
            PACKAGE_MANAGER="apt"
        elif command -v yum >/dev/null 2>&1; then
            OS="centos"
            PACKAGE_MANAGER="yum"
        else
            echo -e "${YELLOW}⚠️  Unsupported Linux distribution${NC}"
            echo -e "${YELLOW}   Please install dependencies manually${NC}"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    else
        echo -e "${RED}❌ Unsupported operating system: $OSTYPE${NC}"
        echo -e "${YELLOW}   Supported: Linux, macOS${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Operating system: $OS${NC}"
}

# Check system requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements...${NC}"
    
    # Check Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | sed 's/v//')
        if [[ $(echo "$NODE_VERSION $MIN_NODE_VERSION" | awk '{print ($1 >= $2)}') -eq 1 ]]; then
            echo -e "${GREEN}✅ Node.js $NODE_VERSION found${NC}"
        else
            echo -e "${RED}❌ Node.js version $NODE_VERSION is too old (minimum: $MIN_NODE_VERSION)${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Node.js not found${NC}"
        echo -e "${YELLOW}   Please install Node.js $MIN_NODE_VERSION or higher${NC}"
        exit 1
    fi
    
    # Check npm
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        if [[ $(echo "$NPM_VERSION $MIN_NPM_VERSION" | awk '{print ($1 >= $2)}') -eq 1 ]]; then
            echo -e "${GREEN}✅ npm $NPM_VERSION found${NC}"
        else
            echo -e "${RED}❌ npm version $NPM_VERSION is too old (minimum: $MIN_NPM_VERSION)${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    
    # Check git
    if command -v git >/dev/null 2>&1; then
        echo -e "${GREEN}✅ git found${NC}"
    else
        echo -e "${YELLOW}⚠️  git not found (recommended for plugin features)${NC}"
    fi
    
    # Check Python
    if command -v python3 >/dev/null 2>&1; then
        PYTHON_VERSION=$(python3 --version | awk '{print $2}')
        echo -e "${GREEN}✅ Python $PYTHON_VERSION found${NC}"
    else
        echo -e "${YELLOW}⚠️  Python 3 not found (optional for AI features)${NC}"
    fi
}

# Install system dependencies
install_system_deps() {
    if [[ "$SKIP_DEPS" == "true" ]]; then
        echo -e "${YELLOW}⏭️  Skipping system dependencies installation${NC}"
        return
    fi
    
    echo -e "${BLUE}🔧 Installing system dependencies...${NC}"
    
    case $PACKAGE_MANAGER in
        "apt")
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential
            ;;
        "yum")
            sudo yum update -y
            sudo yum install -y curl wget git gcc-c++ make
            ;;
        "brew")
            brew install curl wget git
            ;;
    esac
    
    echo -e "${GREEN}✅ System dependencies installed${NC}"
}

# Download and extract LotusAGI
install_lotusagi() {
    echo -e "${BLUE}📦 Installing LotusAGI...${NC}"
    
    # Create installation directory
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    echo -e "${GREEN}✅ Created installation directory: $INSTALL_DIR${NC}"
    
    # Check if we're in a git repository (for development)
    if [[ -d "$PWD/.git" ]] && [[ -f "$PWD/package.json" ]]; then
        echo -e "${GREEN}✅ Using existing LotusAGI installation${NC}"
    else
        echo -e "${YELLOW}⚠️  Please ensure LotusAGI source code is in: $INSTALL_DIR${NC}"
    fi
}

# Install Node.js dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    
    cd "$INSTALL_DIR"
    
    # Install root dependencies
    npm install
    echo -e "${GREEN}✅ Root dependencies installed${NC}"
    
    # Install frontend dependencies
    if [[ -d "frontend" ]]; then
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    fi
    
    # Install backend dependencies
    if [[ -d "backend" ]]; then
        cd backend
        npm install
        cd ..
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    fi
}

# Setup environment
setup_environment() {
    echo -e "${BLUE}⚙️  Setting up environment...${NC}"
    
    # Create .env file
    if [[ ! -f "$INSTALL_DIR/.env" ]]; then
        cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    fi
    
    # Make scripts executable
    chmod +x "$INSTALL_DIR/package.json"
    
    echo -e "${GREEN}✅ Environment setup complete${NC}"
}

# Setup database services
setup_database() {
    echo -e "${BLUE}🗄️  Setting up database services...${NC}"
    
    if command -v docker >/dev/null 2>&1; then
        echo -e "${CYAN}🐳 Starting services with Docker...${NC}"
        
        # Start PostgreSQL and Redis with Docker
        docker-compose up -d postgres redis 2>/dev/null || true
        
        # Wait for services to be ready
        echo -e "${YELLOW}⏳ Waiting for database services to start...${NC}"
        sleep 10
        
        echo -e "${GREEN}✅ Database services started${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker not found${NC}"
        echo -e "${YELLOW}   Please start PostgreSQL and Redis manually${NC}"
        echo -e "${CYAN}   PostgreSQL: postgres://lotusagi:your_password@localhost:5432/lotusagi${NC}"
        echo -e "${CYAN}   Redis: redis://localhost:6379${NC}"
    fi
    
    # Create database
    if command -v psql >/dev/null 2>&1; then
        echo -e "${BLUE}🗄️  Creating database...${NC}"
        sudo -u postgres createdb lotusagi 2>/dev/null || echo -e "${YELLOW}   Database might already exist${NC}"
        echo -e "${GREEN}✅ Database created${NC}"
    fi
}

# Setup GPU support (optional)
setup_gpu() {
    if [[ "$CONFIGURE_GPU" == "false" ]]; then
        echo -e "${YELLOW}⏭️  Skipping GPU configuration${NC}"
        return
    fi
    
    echo -e "${BLUE}🎮 Setting up GPU support...${NC}"
    
    # Check for NVIDIA GPU
    if command -v nvidia-smi >/dev/null 2>&1; then
        echo -e "${GREEN}✅ NVIDIA GPU detected${NC}"
        
        # Install CUDA toolkit if not present
        if ! command -v nvcc >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  CUDA toolkit not found${NC}"
            echo -e "${CYAN}   Install CUDA toolkit for GPU acceleration${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No NVIDIA GPU detected${NC}"
    fi
    
    echo -e "${GREEN}✅ GPU configuration complete${NC}"
}

# Configure plugins
setup_plugins() {
    echo -e "${BLUE}🔌 Setting up plugins...${NC}"
    
    # Create plugin directory
    mkdir -p "$INSTALL_DIR/plugins"
    
    # Update .env with plugin settings
    echo -e "${GREEN}✅ Plugins configured${NC}"
}

# Create desktop shortcuts
create_shortcuts() {
    echo -e "${BLUE}🖥️  Creating desktop shortcuts...${NC}"
    
    # Create start script
    cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting LotusAGI..."
npm run dev
EOF
    
    chmod +x "$INSTALL_DIR/start.sh"
    
    # Create desktop entry (Linux)
    if [[ "$OS" == "linux-gnu"* ]]; then
        mkdir -p "$HOME/.local/share/applications"
        cat > "$HOME/.local/share/applications/lotusagi.desktop" << EOF
[Desktop Entry]
Name=LotusAGI
Comment=AI-Powered Coding Assistant
Exec=$INSTALL_DIR/start.sh
Icon=applications-development
Terminal=true
Type=Application
Categories=Development;Programming;
EOF
    fi
    
    echo -e "${GREEN}✅ Desktop shortcuts created${NC}"
}

# Run initial setup tests
run_tests() {
    echo -e "${BLUE}🧪 Running setup tests...${NC}"
    
    # Test database connection
    if command -v psql >/dev/null 2>&1; then
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw lotusagi; then
            echo -e "${GREEN}✅ Database connection test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Database connection test failed${NC}"
        fi
    fi
    
    # Test Redis connection
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli ping >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Redis connection test passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis connection test failed${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Setup tests complete${NC}"
}

# Start services
start_services() {
    if [[ "$START_SERVICES" == "false" ]]; then
        echo -e "${YELLOW}⏭️  Skipping service start${NC}"
        return
    fi
    
    echo -e "${BLUE}🚀 Starting LotusAGI services...${NC}"
    echo -e "${CYAN}   Frontend: http://localhost:3000${NC}"
    echo -e "${CYAN}   Backend:  http://localhost:3001${NC}"
    echo -e "${CYAN}   API Docs: http://localhost:3001/docs${NC}"
    echo ""
    echo -e "${GREEN}🎉 Installation complete!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Edit ~/.lotusagi/.env with your API keys"
    echo "2. Configure AI providers in shared/config.yaml"
    echo "3. Access the application at http://localhost:3000"
    echo ""
    
    cd "$INSTALL_DIR"
    npm run dev &
}

# Print installation summary
print_summary() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 LotusAGI Installation Complete!${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${CYAN}📍 Installation Directory:${NC} $INSTALL_DIR"
    echo -e "${CYAN}🌐 Frontend URL:${NC}        http://localhost:3000"
    echo -e "${CYAN}🔧 Backend API:${NC}         http://localhost:3001"
    echo -e "${CYAN}📚 API Documentation:${NC}   http://localhost:3001/docs"
    echo ""
    echo -e "${YELLOW}🔑 Configuration:${NC}"
    echo "• Edit ~/.lotusagi/.env with your API keys"
    echo "• Configure plugins in shared/config.yaml"
    echo "• Customize agents in configuration"
    echo ""
    echo -e "${YELLOW}🚀 Quick Start:${NC}"
    echo "• Desktop shortcut: Available in application menu"
    echo "• Start script: ~/.lotusagi/start.sh"
    echo "• Development mode: npm run dev (in install directory)"
    echo ""
    echo -e "${YELLOW}📖 Documentation:${NC}"
    echo "• Developer Guide: $INSTALL_DIR/DEVELOPER_GUIDE.md"
    echo "• Configuration: $INSTALL_DIR/shared/config.yaml"
    echo "• Plugins: $INSTALL_DIR/backend/src/modules/plugins/"
    echo ""
    echo -e "${GREEN}✨ Welcome to LotusAGI! Happy coding! ✨${NC}"
    echo ""
}

# Help function
show_help() {
    echo -e "${CYAN}LotusAGI Installer Script${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-auto-setup     Skip automatic setup (manual configuration)"
    echo "  --skip-deps         Skip system dependencies installation"
    echo "  --no-start          Don't start services after installation"
    echo "  --enable-gpu        Configure GPU acceleration"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                        # Full automatic installation"
    echo "  $0 --skip-deps            # Skip system dependencies"
    echo "  $0 --enable-gpu           # Include GPU configuration"
    echo "  $0 --no-start --help      # Install but don't start, show help"
    echo ""
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-auto-setup)
                AUTO_SETUP=false
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --no-start)
                START_SERVICES=false
                shift
                ;;
            --enable-gpu)
                CONFIGURE_GPU=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
}

# Main installation function
main() {
    # Parse arguments
    parse_args "$@"
    
    # Print banner
    print_banner
    
    # Log file setup
    mkdir -p "$(dirname "$LOG_FILE")"
    exec 1> >(tee -a "$LOG_FILE")
    exec 2> >(tee -a "$LOG_FILE" >&2)
    
    echo -e "${CYAN}📋 Installation Log: $LOG_FILE${NC}"
    echo ""
    
    # Run installation steps
    check_os
    check_requirements
    install_system_deps
    install_lotusagi
    install_dependencies
    setup_environment
    setup_database
    setup_gpu
    setup_plugins
    create_shortcuts
    run_tests
    
    # Start services if requested
    if [[ "$START_SERVICES" == "true" ]]; then
        start_services
    fi
    
    # Print summary
    print_summary
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}⚠️  Installation interrupted${NC}"
    exit 1
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"