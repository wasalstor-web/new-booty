#!/bin/bash

# BOLT-QQQ Server Setup Script
# This script automates the installation of prerequisites for the BOLT-QQQ project

set -e  # Exit on error

echo "========================================="
echo "BOLT-QQQ Server Setup Script"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Update system
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System updated"

# Install basic dependencies
print_info "Installing basic dependencies..."
sudo apt install -y curl wget git build-essential
print_status "Basic dependencies installed"

# Install NVM and Node.js
print_info "Installing NVM and Node.js..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
    nvm alias default 18
    print_status "Node.js installed"
else
    print_info "NVM already installed, skipping..."
fi

# Install pnpm
print_info "Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    print_status "pnpm installed"
else
    print_info "pnpm already installed, skipping..."
fi

# Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed"
else
    print_info "Docker already installed, skipping..."
fi

# Install Docker Compose
print_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_info "Docker Compose already installed, skipping..."
fi

# Install NGINX
print_info "Installing NGINX..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_status "NGINX installed and started"
else
    print_info "NGINX already installed, skipping..."
fi

# Install Certbot for SSL
print_info "Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_status "Certbot installed"
else
    print_info "Certbot already installed, skipping..."
fi

# Setup firewall
print_info "Configuring firewall (UFW)..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    print_status "Firewall configured"
else
    print_info "UFW not available, skipping..."
fi

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"
print_status "pnpm version: $(pnpm --version)"
print_status "Docker version: $(docker --version)"
print_status "Docker Compose version: $(docker-compose --version)"
print_status "NGINX version: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
print_info "IMPORTANT: You need to log out and log back in for Docker group changes to take effect."
print_info "Or run: newgrp docker"
echo ""
print_info "Next steps:"
echo "  1. Clone the repository: git clone https://github.com/wasalstor-web/new-booty.git"
echo "  2. Configure environment variables"
echo "  3. Run: docker-compose up -d"
echo "  4. Setup NGINX configuration"
echo "  5. Setup SSL with: sudo certbot --nginx -d yourdomain.com"
echo ""
print_info "For detailed instructions, see DEPLOYMENT.md or DEPLOYMENT_AR.md"
echo ""
