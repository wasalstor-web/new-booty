#!/bin/bash

# BOLT-QQQ Backup Script
# This script creates backups of database and important files

set -e  # Exit on error

# Configuration
BACKUP_DIR="${HOME}/backups/bolt-qqq"
PROJECT_DIR="${HOME}/projects/new-booty"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "========================================="
echo "BOLT-QQQ Backup Script"
echo "Timestamp: $TIMESTAMP"
echo "========================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Database
print_info "Backing up database..."
if docker-compose ps | grep -q "ai-platform-db"; then
    docker-compose exec -T db pg_dump -U postgres ai_platform > "$BACKUP_DIR/database_$TIMESTAMP.sql"
    gzip "$BACKUP_DIR/database_$TIMESTAMP.sql"
    print_status "Database backed up to: database_$TIMESTAMP.sql.gz"
else
    print_error "Database container not running, skipping database backup"
fi

# Backup Environment Files
print_info "Backing up environment files..."
mkdir -p "$BACKUP_DIR/env_$TIMESTAMP"
if [ -f "$PROJECT_DIR/frontend/.env.production" ]; then
    cp "$PROJECT_DIR/frontend/.env.production" "$BACKUP_DIR/env_$TIMESTAMP/"
fi
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    cp "$PROJECT_DIR/backend/.env" "$BACKUP_DIR/env_$TIMESTAMP/"
fi
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    cp "$PROJECT_DIR/docker-compose.yml" "$BACKUP_DIR/env_$TIMESTAMP/"
fi
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    cp "$PROJECT_DIR/nginx.conf" "$BACKUP_DIR/env_$TIMESTAMP/"
fi
print_status "Environment files backed up"

# Backup User Uploads (if any)
if [ -d "$PROJECT_DIR/uploads" ]; then
    print_info "Backing up user uploads..."
    tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR" uploads
    print_status "Uploads backed up"
fi

# Create full project backup (excluding node_modules and .next)
print_info "Creating full project backup..."
cd "$PROJECT_DIR/.."
tar -czf "$BACKUP_DIR/project_$TIMESTAMP.tar.gz" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    new-booty
print_status "Project files backed up"

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
print_status "Total backup size: $BACKUP_SIZE"

# Cleanup old backups
print_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type d -empty -delete
print_status "Old backups cleaned up"

# List recent backups
echo ""
print_info "Recent backups:"
ls -lh "$BACKUP_DIR" | tail -10

echo ""
echo "========================================="
echo "Backup Complete!"
echo "========================================="
echo ""
print_status "Backup location: $BACKUP_DIR"
print_info "To restore database backup:"
echo "  gunzip $BACKUP_DIR/database_$TIMESTAMP.sql.gz"
echo "  docker-compose exec -T db psql -U postgres ai_platform < $BACKUP_DIR/database_$TIMESTAMP.sql"
echo ""
print_info "Consider copying backups to remote location:"
echo "  scp -r $BACKUP_DIR user@backup-server:/backups/"
echo ""
