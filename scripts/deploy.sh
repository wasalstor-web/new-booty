#!/bin/bash

# BOLT-QQQ Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "========================================="
echo "BOLT-QQQ Deployment Script"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[→]${NC} $1"
}

# Check if .env files exist
check_env_files() {
    print_step "Checking environment files..."
    
    if [ ! -f "frontend/.env.production" ]; then
        print_error "frontend/.env.production not found!"
        echo "Please create it from frontend/.env.example"
        exit 1
    fi
    
    if [ ! -f "backend/.env" ]; then
        print_error "backend/.env not found!"
        echo "Please create it from backend/.env.example"
        exit 1
    fi
    
    print_status "Environment files found"
}

# Pull latest changes
pull_changes() {
    print_step "Pulling latest changes from Git..."
    git pull origin main
    print_status "Code updated"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Frontend
    cd frontend
    npm install --production
    cd ..
    
    # Backend
    cd backend
    npm install --production
    cd ..
    
    print_status "Dependencies installed"
}

# Build applications
build_apps() {
    print_step "Building applications..."
    
    # Backend - Generate Prisma client and build
    cd backend
    if [ -d "prisma" ]; then
        npx prisma generate
        print_status "Prisma client generated"
    fi
    npm run build
    cd ..
    
    # Frontend
    cd frontend
    npm run build
    cd ..
    
    print_status "Applications built"
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    cd backend
    if [ -d "prisma" ]; then
        npx prisma migrate deploy
        print_status "Database migrations applied"
    else
        print_info "No Prisma directory found, skipping migrations"
    fi
    cd ..
}

# Deploy with Docker Compose
deploy_docker() {
    print_step "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose build --no-cache
    docker-compose up -d
    
    print_status "Containers deployed"
    
    # Show status
    echo ""
    print_info "Container status:"
    docker-compose ps
}

# Check container health
check_health() {
    print_step "Checking container health..."
    
    sleep 5  # Wait for containers to start
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "Containers are running"
    else
        print_error "Some containers failed to start"
        docker-compose logs --tail=50
        exit 1
    fi
}

# Show logs
show_logs() {
    echo ""
    print_info "Recent logs:"
    docker-compose logs --tail=20
    echo ""
    print_info "To view live logs, run: docker-compose logs -f"
}

# Main deployment flow
main() {
    echo "Starting deployment process..."
    echo ""
    
    # Check environment files
    check_env_files
    
    # Ask for confirmation
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
    
    # Execute deployment steps
    pull_changes
    install_dependencies
    setup_database
    build_apps
    deploy_docker
    check_health
    show_logs
    
    echo ""
    echo "========================================="
    echo "Deployment Complete!"
    echo "========================================="
    echo ""
    print_status "Application is now running"
    print_info "Frontend: http://localhost:3001"
    print_info "Backend: http://localhost:3000"
    echo ""
    print_info "Don't forget to:"
    echo "  - Setup NGINX reverse proxy"
    echo "  - Configure SSL with Let's Encrypt"
    echo "  - Setup monitoring and backups"
    echo ""
}

# Run main function
main
