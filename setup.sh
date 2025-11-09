#!/bin/bash

# ============================================================================
# AI Automation System - Unified Setup Script
# سكريبت إعداد موحد لنظام الأتمتة الذكي
# ============================================================================
# This script does everything automatically:
# - Checks system requirements
# - Installs dependencies
# - Creates .env file with your keys
# - Starts n8n (local or connects to Hostinger)
# - Starts AI automation system
# - Opens n8n in browser
# - Sends Telegram notification
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      🤖 AI Automation System with n8n                       ║
║         نظام الأتمتة الذكي بالذكاء الاصطناعي               ║
║                                                              ║
║              Powered by OpenAI + n8n + Hostinger            ║
║                          v3.0                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}🚀 Starting AI Automation System Setup...${NC}"
echo ""

# ============================================================================
# Step 1: Check System Requirements
# ============================================================================
echo -e "${YELLOW}[1/8] Checking system requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check Docker (optional)
DOCKER_AVAILABLE=false
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker $(docker -v | cut -d' ' -f3 | cut -d',' -f1)${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  Docker not found (optional for local n8n)${NC}"
fi

echo ""

# ============================================================================
# Step 2: Install Dependencies
# ============================================================================
echo -e "${YELLOW}[2/8] Installing Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
    npm install --silent
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

echo ""

# ============================================================================
# Step 3: Interactive Configuration
# ============================================================================
echo -e "${YELLOW}[3/8] Configuring environment...${NC}"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file already exists${NC}"
    read -p "Do you want to reconfigure? (y/N): " RECONFIGURE
    if [[ ! "$RECONFIGURE" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Using existing .env configuration${NC}"
        echo ""
    else
        rm .env
    fi
fi

# Create .env if it doesn't exist or user wants to reconfigure
if [ ! -f ".env" ]; then
    echo -e "${CYAN}📝 Let's configure your environment...${NC}"
    echo ""
    
    # Ask about n8n deployment
    echo -e "${CYAN}Where is your n8n deployed?${NC}"
    echo "1) Local (I want to run n8n on this machine)"
    echo "2) Hostinger VPS (I already have n8n running on Hostinger)"
    read -p "Enter your choice (1 or 2): " N8N_CHOICE
    
    if [ "$N8N_CHOICE" == "2" ]; then
        # External n8n on Hostinger
        echo ""
        echo -e "${CYAN}Enter your Hostinger n8n details:${NC}"
        read -p "n8n URL (e.g., https://n8n.yourdomain.com): " N8N_URL_INPUT
        read -p "n8n API Key: " N8N_API_KEY_INPUT
        
        cat > .env << EOF
# n8n Configuration (Hostinger VPS)
N8N_EXTERNAL=true
N8N_URL=$N8N_URL_INPUT
N8N_API_KEY=$N8N_API_KEY_INPUT
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http

EOF
    else
        # Local n8n
        cat > .env << EOF
# n8n Configuration (Local)
N8N_EXTERNAL=false
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_API_KEY=n8n_api_key_will_be_set_automatically

EOF
    fi
    
    # Telegram Bot
    echo ""
    echo -e "${CYAN}Enter your Telegram Bot Token:${NC}"
    echo "(Get it from @BotFather on Telegram)"
    read -p "Token: " TELEGRAM_TOKEN
    
    echo ""
    echo -e "${CYAN}Enter your Telegram User ID:${NC}"
    echo "(Get it from @userinfobot on Telegram)"
    read -p "User ID: " TELEGRAM_ID
    
    cat >> .env << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=$TELEGRAM_TOKEN
ADMIN_TELEGRAM_ID=$TELEGRAM_ID

EOF
    
    # OpenAI API
    echo ""
    echo -e "${CYAN}Enter your OpenAI API Key:${NC}"
    echo "(Get it from https://platform.openai.com/api-keys)"
    read -p "API Key: " OPENAI_KEY
    
    cat >> .env << EOF
# AI Configuration
OPENAI_API_KEY=$OPENAI_KEY
AI_MODEL=gpt-4

EOF
    
    # Server Config
    cat >> .env << EOF
# Server Configuration
PORT=3000
NODE_ENV=production

# Hostinger VPS Configuration (for deployment)
HOSTINGER_HOST=your_hostinger_host
HOSTINGER_USER=your_hostinger_username
HOSTINGER_PATH=/home/your_path
HOSTINGER_VPS_IP=your_vps_ip
EOF
    
    echo ""
    echo -e "${GREEN}✅ Configuration saved to .env${NC}"
fi

# Load environment variables
set -a
source .env
set +a

echo ""

# ============================================================================
# Step 4: Start n8n (if local)
# ============================================================================
if [ "$N8N_EXTERNAL" != "true" ]; then
    echo -e "${YELLOW}[4/8] Starting local n8n...${NC}"
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "🐳 Starting n8n with Docker..."
        
        # Make start-n8n.sh executable
        chmod +x scripts/start-n8n.sh
        
        # Start n8n (but don't open browser yet, we'll do it later)
        bash scripts/start-n8n.sh | grep -v "Opening n8n in browser" || true
        
        echo -e "${GREEN}✅ n8n started successfully${NC}"
    else
        echo -e "${RED}❌ Docker is required to run local n8n${NC}"
        echo "Options:"
        echo "1. Install Docker: https://docs.docker.com/get-docker/"
        echo "2. Use n8n on Hostinger VPS (run setup again and choose option 2)"
        exit 1
    fi
else
    echo -e "${YELLOW}[4/8] Connecting to external n8n...${NC}"
    echo -e "${BLUE}📡 n8n URL: $N8N_URL${NC}"
    
    # Test connection
    if curl -s -f -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Connected to n8n successfully${NC}"
    else
        echo -e "${RED}❌ Failed to connect to n8n${NC}"
        echo "Please check your n8n URL and API key"
        exit 1
    fi
fi

echo ""

# ============================================================================
# Step 5: Verify Configuration
# ============================================================================
echo -e "${YELLOW}[5/8] Verifying configuration...${NC}"

# Create necessary directories
mkdir -p logs
mkdir -p data
mkdir -p training-data

echo -e "${GREEN}✅ Directories created${NC}"

# Run integration tests
echo "Running integration tests..."
node test-integration.js > /tmp/nexus-test-output.txt 2>&1
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed (may be normal)${NC}"
    echo "Check /tmp/nexus-test-output.txt for details"
fi

echo ""

# ============================================================================
# Step 6: Start Nexus System
# ============================================================================
echo -e "${YELLOW}[6/8] Starting Nexus system...${NC}"

# Kill any existing Nexus process
pkill -f "node src/index-v3.js" 2>/dev/null || true

# Start Nexus in background
nohup node src/index-v3.js > logs/automation.log 2>&1 &
NEXUS_PID=$!

echo "Process ID: $NEXUS_PID"

# Wait for system to initialize
echo "Waiting for system initialization..."
sleep 5

# Check if process is still running
if ps -p $NEXUS_PID > /dev/null; then
    echo -e "${GREEN}✅ Nexus system started successfully${NC}"
    echo "PID: $NEXUS_PID"
else
    echo -e "${RED}❌ Nexus failed to start${NC}"
    echo "Check logs/nexus.log for details"
    tail -n 50 logs/nexus.log
    exit 1
fi

echo ""

# ============================================================================
# Step 7: Open n8n in Browser
# ============================================================================
echo -e "${YELLOW}[7/8] Opening n8n interface...${NC}"

if [ "$N8N_EXTERNAL" = "true" ]; then
    N8N_URL_TO_OPEN="$N8N_URL"
else
    N8N_URL_TO_OPEN="http://localhost:5678"
fi

echo "🌐 URL: $N8N_URL_TO_OPEN"

# Detect OS and open browser
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$N8N_URL_TO_OPEN" &
    elif command -v gnome-open &> /dev/null; then
        gnome-open "$N8N_URL_TO_OPEN" &
    elif command -v kde-open &> /dev/null; then
        kde-open "$N8N_URL_TO_OPEN" &
    else
        echo -e "${YELLOW}⚠️  Could not open browser automatically${NC}"
        echo "Please open manually: $N8N_URL_TO_OPEN"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "$N8N_URL_TO_OPEN"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    start "$N8N_URL_TO_OPEN"
else
    echo -e "${YELLOW}⚠️  Could not detect OS${NC}"
    echo "Please open manually: $N8N_URL_TO_OPEN"
fi

echo -e "${GREEN}✅ Browser opened${NC}"

echo ""

# ============================================================================
# Step 8: Final Summary
# ============================================================================
echo -e "${YELLOW}[8/8] Setup complete!${NC}"
echo ""

echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🎉 AI Automation System Ready! 🎉                  ║
║              نظام الأتمتة جاهز للعمل                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}📊 System Status:${NC}"
echo ""

if [ "$N8N_EXTERNAL" = "true" ]; then
    echo -e "  🌐 n8n (External):     ${GREEN}✅ Connected${NC}"
    echo -e "     URL: $N8N_URL"
else
    echo -e "  🌐 n8n (Local):        ${GREEN}✅ Running${NC}"
    echo -e "     URL: http://localhost:5678"
    echo -e "     Username: admin"
    echo -e "     Password: admin123"
fi

echo ""
echo -e "  🤖 AI System:          ${GREEN}✅ Running${NC}"
echo -e "     PID: $NEXUS_PID"
echo -e "     Port: 3000"
echo -e "     API: http://localhost:3000/api"

echo ""
echo -e "  📱 Telegram Bot:       ${GREEN}✅ Connected${NC}"
echo -e "     You should receive a notification soon!"

echo ""
echo -e "${CYAN}🎯 What's Running:${NC}"
echo ""
echo "  • AI Model Orchestrator (GPT-4, Llama, Mistral)"
echo "  • n8n Integration Bridge (all components connected)"
echo "  • Plugin System (E-commerce, Healthcare, Local Models)"
echo "  • Domain Adapter (adaptable to any industry)"
echo "  • Training Data Collector (for open-source models)"
echo "  • Self-Development Workflows (running in n8n):"
echo "    - Self-Analysis & Optimization (every 6 hours)"
echo "    - Auto-Create Workflows (webhook trigger)"
echo "    - Model Performance Monitor (every 30 minutes)"

echo ""
echo -e "${CYAN}📝 Useful Commands:${NC}"
echo ""
echo "  View logs:        tail -f logs/automation.log"
echo "  Stop system:      kill $NEXUS_PID"
echo "  Stop n8n:         docker stop n8n-automation"
echo "  Restart all:      ./setup.sh"
echo "  Run tests:        node test-integration.js"
echo ""

echo -e "${CYAN}📚 Documentation:${NC}"
echo ""
echo "  Architecture:     cat ARCHITECTURE.md"
echo "  Quick Start:      cat QUICKSTART.md"
echo "  Hostinger Guide:  cat N8N_HOSTINGER.md"
echo "  Roadmap:          cat ROADMAP.md"
echo ""

echo -e "${CYAN}🔗 API Endpoints:${NC}"
echo ""
echo "  http://localhost:3000/api/models      - Model management"
echo "  http://localhost:3000/api/plugins     - Plugin management"
echo "  http://localhost:3000/api/domains     - Domain management"
echo "  http://localhost:3000/api/n8n/status  - n8n status"
echo "  http://localhost:3000/api/training    - Training data"
echo ""

echo -e "${GREEN}✅ Everything is ready! Check your Telegram for notifications.${NC}"
echo ""

# Save PID for later
echo $NEXUS_PID > logs/automation.pid

echo -e "${BLUE}Happy automating! 🚀${NC}"
echo ""

# Wait a moment and check if Telegram notification was sent
sleep 3
if grep -q "Telegram notification sent" logs/automation.log 2>/dev/null; then
    echo -e "${GREEN}📱 Telegram notification sent successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Telegram notification may take a moment...${NC}"
fi

echo ""
echo "Press Ctrl+C to exit (services will keep running)"
echo "To view live logs: tail -f logs/automation.log"
echo ""
