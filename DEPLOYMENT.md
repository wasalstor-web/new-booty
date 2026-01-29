# BOLT-QQQ Deployment Guide

## Objective
Deploy a multi-environment application based on **React**, **Supabase**, and **Node.js** with an effective web server setup using **NGINX** to ensure a stable production environment.

---

## 1. Prerequisites

To run your project smoothly on the server, ensure you have:

### Operating System
- **Ubuntu** (preferably recent versions like 20.04 LTS or 22.04 LTS for long-term support)
- System should be regularly updated for security

### Node.js
- **Install via NVM (Node Version Manager)** to ensure easy updates and compatibility
- **Why Node.js?** It's the core runtime for JavaScript and TypeScript applications
- Recommended version: Node.js 18.x or higher

### pnpm
- Lightweight and efficient package manager
- **Why pnpm?** Faster and more efficient in handling shared dependencies compared to npm
- Supports workspaces for monorepo projects

### Git
- For version control and obtaining the project from GitHub
- Essential for tracking changes and updates

### NGINX
- Acts as a Reverse Proxy to ensure request distribution and performance optimization
- Provides SSL/TLS for secure connections
- Improves performance through caching and load balancing

### PostgreSQL Database
- For storing application data
- Supabase can be used as a managed cloud alternative

### Docker and Docker Compose
- For container management and running the application in isolation
- Ensures consistent environment across different servers

---

## 2. Download Source Code

### Server Access

#### 2.1 Connect to Server via SSH
```bash
ssh username@your-server-ip
```

#### 2.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2.3 Clone Repository
```bash
# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone repository from GitHub
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
```

---

## 3. Install Prerequisites

### 3.1 Install NVM and Node.js

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM in current session
source ~/.bashrc

# Install Node.js (version 18)
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version
npm --version
```

### 3.2 Install pnpm

```bash
# Install pnpm via npm
npm install -g pnpm

# Verify installation
pnpm --version
```

### 3.3 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Log out and back in to activate changes
# Or use:
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3.4 Install NGINX

```bash
sudo apt install nginx -y

# Start NGINX and enable on boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 4. Database Setup

### 4.1 Using Local PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE ai_platform;
CREATE USER ai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_platform TO ai_user;
\q
```

### 4.2 Using Supabase (Recommended)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Get the Database URL
4. Use the URL in your `.env` file

---

## 5. Configure Environment Variables

### 5.1 Frontend Environment Variables

Create `.env.production` file in `frontend` directory:

```bash
cd ~/projects/new-booty/frontend
nano .env.production
```

Add the following content:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database Configuration (Supabase or PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Sentry (optional for error tracking)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 5.2 Backend Environment Variables

Create `.env` file in `backend` directory:

```bash
cd ~/projects/new-booty/backend
nano .env
```

Add the following content:

```env
# Database
DATABASE_URL=postgresql://ai_user:your_secure_password@localhost:5432/ai_platform

# Node Environment
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret

# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend URL
FRONTEND_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Redis (if using)
REDIS_URL=redis://localhost:6379
```

---

## 6. Build the Project

### 6.1 Install Dependencies

```bash
# Frontend
cd ~/projects/new-booty/frontend
npm install

# Backend
cd ~/projects/new-booty/backend
npm install
```

### 6.2 Setup Database

```bash
# Backend - Prisma Migrations
cd ~/projects/new-booty/backend
npx prisma generate
npx prisma migrate deploy
```

### 6.3 Build Applications

```bash
# Build Frontend
cd ~/projects/new-booty/frontend
npm run build

# Build Backend
cd ~/projects/new-booty/backend
npm run build
```

---

## 7. Run Project Using Docker Compose

### 7.1 Update docker-compose.yml

Ensure `docker-compose.yml` has correct settings:

```bash
cd ~/projects/new-booty
nano docker-compose.yml
```

### 7.2 Build and Run Containers

```bash
# Build containers
docker-compose build

# Run containers in background
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## 8. Configure NGINX as Reverse Proxy

### 8.1 Create NGINX Configuration File

```bash
sudo nano /etc/nginx/sites-available/bolt-qqq
```

Add the following configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.2 Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/bolt-qqq /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx
```

---

## 9. Setup SSL with Let's Encrypt

### 9.1 Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 9.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9.3 Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job for automatic renewal
sudo crontab -e
```

Add the following line:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 10. Monitoring and Maintenance

### 10.1 Monitor Logs

```bash
# Docker Compose logs
docker-compose logs -f

# NGINX logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### 10.2 Restart Services

```bash
# Restart containers
docker-compose restart

# Restart NGINX
sudo systemctl restart nginx
```

### 10.3 Updates

```bash
cd ~/projects/new-booty

# Pull updates
git pull origin main

# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 11. Backup

### 11.1 Database Backup

```bash
# PostgreSQL
docker-compose exec db pg_dump -U postgres ai_platform > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T db psql -U postgres ai_platform < backup_20240101.sql
```

### 11.2 Files Backup

```bash
# Create archive
tar -czf bolt-qqq-backup-$(date +%Y%m%d).tar.gz ~/projects/new-booty

# Copy to secure location
scp bolt-qqq-backup-$(date +%Y%m%d).tar.gz user@backup-server:/backups/
```

---

## 12. Troubleshooting

### Common Issues and Solutions

#### 12.1 Containers Won't Start

```bash
# Check logs
docker-compose logs

# Check used ports
sudo netstat -tulpn | grep LISTEN

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

#### 12.2 NGINX Not Working

```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# Restart
sudo systemctl restart nginx
```

#### 12.3 Database Issues

```bash
# Connect to database
docker-compose exec db psql -U postgres ai_platform

# Check tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;
```

---

## 13. Security

### 13.1 Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 13.2 Security Updates

```bash
# Automatic updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 13.3 SSH Hardening

```bash
# Edit SSH settings
sudo nano /etc/ssh/sshd_config
```

Recommendations:
- Disable root login: `PermitRootLogin no`
- Use SSH keys instead of passwords
- Change default port

---

## 14. Performance Optimization

### 14.1 Setup Redis for Caching

Redis is already included in `docker-compose.yml`. To use it:

```javascript
// In your application
import Redis from 'ioredis';

const redis = new Redis({
  host: 'redis',
  port: 6379
});
```

### 14.2 Optimize NGINX

```nginx
# Add to configuration file
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 15. Conclusion

Your BOLT-QQQ project is now successfully deployed on the server! For help:

- **Documentation**: Check README files in directories
- **Issues**: Create an issue on GitHub
- **Support**: Contact the development team

### Next Steps

1. **Monitoring**: Setup monitoring tools (Prometheus, Grafana)
2. **Analytics**: Integrate Google Analytics or Plausible
3. **Performance**: Use CDN for static content acceleration
4. **Backup**: Setup regular automatic backups
5. **Scaling**: Plan for infrastructure scaling when needed

---

**Note**: Make sure to change all default values (passwords, secret keys, and domain names) with your own secure values.
