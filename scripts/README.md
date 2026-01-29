# Deployment Scripts

This directory contains utility scripts for deploying and managing the BOLT-QQQ project.

## Available Scripts

### 1. install.sh
**Purpose**: Automates the installation of all prerequisites on a fresh Ubuntu/Debian server.

**What it does**:
- Updates system packages
- Installs Node.js via NVM
- Installs pnpm package manager
- Installs Docker and Docker Compose
- Installs NGINX web server
- Installs Certbot for SSL certificates
- Configures UFW firewall

**Usage**:
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

**Requirements**: Ubuntu 20.04 LTS or newer

---

### 2. deploy.sh
**Purpose**: Automates the deployment process for the application.

**What it does**:
- Pulls latest code from Git
- Installs dependencies
- Runs database migrations
- Builds frontend and backend
- Deploys with Docker Compose
- Checks container health
- Shows logs

**Usage**:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Pre-requisites**:
- Environment files must be configured
- Docker and Docker Compose installed
- Repository cloned

---

### 3. backup.sh
**Purpose**: Creates backups of database and critical files.

**What it does**:
- Backs up PostgreSQL database
- Backs up environment files
- Backs up user uploads
- Creates full project backup
- Cleans up old backups (>7 days)

**Usage**:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

**Backup Location**: `~/backups/bolt-qqq/`

**Automated Backups**:
Add to crontab for daily backups:
```bash
crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /path/to/new-booty/scripts/backup.sh >> /var/log/bolt-qqq-backup.log 2>&1
```

**Restore Database**:
```bash
# Uncompress backup
gunzip ~/backups/bolt-qqq/database_TIMESTAMP.sql.gz

# Restore to database
docker-compose exec -T db psql -U postgres ai_platform < ~/backups/bolt-qqq/database_TIMESTAMP.sql
```

---

## Quick Start Workflow

### First-Time Setup

1. **Prepare Server**:
```bash
# SSH into your server
ssh user@your-server-ip

# Run installation script
cd ~
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
chmod +x scripts/install.sh
./scripts/install.sh

# Log out and back in for Docker group changes
exit
ssh user@your-server-ip
```

2. **Configure Environment**:
```bash
cd ~/new-booty

# Copy and edit environment files
cp frontend/.env.example frontend/.env.production
cp backend/.env.example backend/.env

# Edit with your credentials
nano frontend/.env.production
nano backend/.env
```

3. **Deploy Application**:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

4. **Setup NGINX**:
```bash
# Copy NGINX config
sudo cp nginx.conf /etc/nginx/sites-available/bolt-qqq
sudo ln -s /etc/nginx/sites-available/bolt-qqq /etc/nginx/sites-enabled/

# Update domain names in the config
sudo nano /etc/nginx/sites-available/bolt-qqq

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

5. **Setup SSL**:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Regular Updates

```bash
cd ~/new-booty
git pull origin main
./scripts/deploy.sh
```

### Scheduled Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/user/new-booty/scripts/backup.sh >> /var/log/bolt-qqq-backup.log 2>&1

# Add weekly remote backup copy at 3 AM on Sundays
0 3 * * 0 scp -r /home/user/backups/bolt-qqq user@backup-server:/backups/
```

---

## Advanced Usage

### Custom Backup Directory

Edit `backup.sh` and change:
```bash
BACKUP_DIR="/custom/path/to/backups"
```

### Custom Retention Period

Edit `backup.sh` and change:
```bash
RETENTION_DAYS=30  # Keep backups for 30 days
```

### Skip Database Backup

Comment out the database backup section in `backup.sh`.

### Manual Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart frontend

# Rebuild and restart
docker-compose up -d --build

# Remove volumes (⚠️ This deletes data!)
docker-compose down -v
```

---

## Monitoring

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100
```

### Check Resource Usage
```bash
docker stats
```

### Check Disk Space
```bash
df -h
du -sh ~/new-booty/*
```

---

## Troubleshooting

### Script Permissions
If you get "Permission denied":
```bash
chmod +x scripts/*.sh
```

### Docker Permission Issues
If Docker commands fail:
```bash
sudo usermod -aG docker $USER
newgrp docker
# Or log out and back in
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use
```bash
# Find process using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Check database container
docker-compose ps db

# Check database logs
docker-compose logs db

# Connect to database
docker-compose exec db psql -U postgres ai_platform

# Test connection from app
docker-compose exec backend npm run db:test
```

---

## Security Notes

1. **Never commit environment files** - They contain sensitive credentials
2. **Secure backup files** - Store in encrypted, access-controlled locations
3. **Rotate secrets regularly** - Update API keys and passwords periodically
4. **Monitor access logs** - Check NGINX and application logs for suspicious activity
5. **Keep system updated** - Run `sudo apt update && sudo apt upgrade` regularly
6. **Use strong passwords** - For database, SSH, and all services
7. **Enable firewall** - UFW is configured by install.sh
8. **Setup fail2ban** - Additional protection against brute force attacks

---

## Support

For issues or questions:
- Check the main [README.md](../README.md)
- See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed guides
- Create an issue on GitHub
- Contact the development team

---

**Last Updated**: January 2026
