# BOLT-QQQ Deployment Checklist

Use this checklist to ensure all steps are completed during deployment.

## 📋 Pre-Deployment

### Server Requirements
- [ ] Ubuntu 20.04 LTS or newer
- [ ] At least 2GB RAM (4GB+ recommended)
- [ ] At least 20GB storage
- [ ] Root or sudo access
- [ ] Domain name pointed to server IP

### Accounts & Keys
- [ ] GitHub access to repository
- [ ] Clerk account created (https://clerk.com)
- [ ] Stripe account setup (https://stripe.com)
- [ ] OpenAI API key (optional)
- [ ] Anthropic API key (optional)
- [ ] Google AI API key (optional)
- [ ] Sentry account for error tracking (optional)

---

## 🔧 Server Setup

### System Preparation
- [ ] SSH access configured
- [ ] System updated: `sudo apt update && sudo apt upgrade -y`
- [ ] Hostname configured
- [ ] Timezone set correctly

### Software Installation
- [ ] Node.js 18+ installed via NVM
- [ ] pnpm package manager installed
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] NGINX installed
- [ ] Certbot installed
- [ ] Git installed
- [ ] Firewall (UFW) configured

**Quick Install**: Run `./scripts/install.sh`

---

## 📦 Project Setup

### Code Repository
- [ ] Repository cloned: `git clone https://github.com/wasalstor-web/new-booty.git`
- [ ] Correct branch checked out
- [ ] Latest code pulled

### Environment Configuration

#### Frontend (.env.production)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] `CLERK_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` set
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` set
- [ ] `NEXT_PUBLIC_API_URL` set to production API
- [ ] `DATABASE_URL` set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] `NEXT_PUBLIC_SENTRY_DSN` set (optional)

#### Backend (.env)
- [ ] `DATABASE_URL` configured
- [ ] `NODE_ENV` set to "production"
- [ ] `JWT_SECRET` generated (min 32 chars)
- [ ] `OPENAI_API_KEY` set (if using)
- [ ] `ANTHROPIC_API_KEY` set (if using)
- [ ] `GOOGLE_AI_API_KEY` set (if using)
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] `FRONTEND_URL` set to production domain
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `REDIS_URL` configured (if external)

### Docker Configuration
- [ ] `docker-compose.yml` reviewed
- [ ] Environment variables updated in docker-compose
- [ ] Ports configured correctly
- [ ] Volume mounts configured

---

## 🚀 Deployment

### Build & Deploy
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Frontend built successfully
- [ ] Backend built successfully
- [ ] Docker images built
- [ ] Containers started
- [ ] All containers running

**Quick Deploy**: Run `./scripts/deploy.sh`

### Database
- [ ] PostgreSQL container running
- [ ] Database created
- [ ] Migrations applied
- [ ] Seed data loaded (if needed)
- [ ] Connection tested

### Redis (if using)
- [ ] Redis container running
- [ ] Connection tested from application

---

## 🌐 Web Server Configuration

### NGINX Setup
- [ ] Configuration file created in `/etc/nginx/sites-available/`
- [ ] Domain names updated in config
- [ ] Symbolic link created in `/etc/nginx/sites-enabled/`
- [ ] Configuration tested: `sudo nginx -t`
- [ ] NGINX reloaded: `sudo systemctl reload nginx`

### SSL/TLS Configuration
- [ ] Certbot installed
- [ ] SSL certificate obtained: `sudo certbot --nginx -d yourdomain.com`
- [ ] Certificate verified
- [ ] HTTPS redirect working
- [ ] Auto-renewal configured
- [ ] Auto-renewal tested: `sudo certbot renew --dry-run`

### DNS Configuration
- [ ] A record pointing to server IP
- [ ] www subdomain configured (if needed)
- [ ] DNS propagated (check with `nslookup yourdomain.com`)

---

## 🔒 Security

### Server Security
- [ ] UFW firewall enabled
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSH key authentication configured
- [ ] Password authentication disabled (optional but recommended)
- [ ] Root login disabled
- [ ] Fail2ban installed (optional)
- [ ] Automatic security updates enabled

### Application Security
- [ ] All secrets stored in environment variables
- [ ] No sensitive data in git repository
- [ ] `.env` files in `.gitignore`
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured in NGINX
- [ ] Database backups encrypted

---

## 🧪 Testing

### Functional Testing
- [ ] Homepage loads correctly
- [ ] Authentication works (sign in/sign up)
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Redis connections working (if using)
- [ ] Payment processing tested (Stripe)
- [ ] Email notifications working (if configured)
- [ ] AI integrations working (if configured)

### Performance Testing
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Database queries optimized
- [ ] Static assets caching working
- [ ] GZIP compression enabled

### Security Testing
- [ ] HTTPS working correctly
- [ ] HTTP to HTTPS redirect working
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] XSS protection enabled
- [ ] CSRF protection working
- [ ] No sensitive data exposed in responses

---

## 📊 Monitoring & Logging

### Logging
- [ ] Application logs accessible
- [ ] NGINX access logs configured
- [ ] NGINX error logs configured
- [ ] Docker logs accessible
- [ ] Log rotation configured

### Monitoring
- [ ] Container health checks configured
- [ ] Sentry error tracking active (if configured)
- [ ] Uptime monitoring setup (optional)
- [ ] Resource monitoring setup (optional)

### Backup
- [ ] Backup script tested: `./scripts/backup.sh`
- [ ] Backup location verified
- [ ] Cron job configured for automatic backups
- [ ] Backup restoration tested
- [ ] Remote backup storage configured (optional)

---

## 📱 Post-Deployment

### Verification
- [ ] All pages accessible
- [ ] All features working
- [ ] No console errors in browser
- [ ] Mobile responsive working
- [ ] Cross-browser testing done

### Documentation
- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Team notified of deployment
- [ ] Runbook updated

### Optimization
- [ ] CDN configured (optional)
- [ ] Database indexed properly
- [ ] Cache strategies implemented
- [ ] Image optimization enabled

---

## 🆘 Emergency Contacts & Resources

### Documentation
- Main README: `README.md`
- Deployment Guide: `DEPLOYMENT.md` (English) / `DEPLOYMENT_AR.md` (Arabic)
- Quick Start: `QUICKSTART.md`
- Scripts Guide: `scripts/README.md`

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Start all
docker-compose up -d

# Rebuild
docker-compose up -d --build

# Database backup
./scripts/backup.sh

# Update and redeploy
git pull origin main && ./scripts/deploy.sh
```

### Rollback Plan
1. Stop current containers: `docker-compose down`
2. Checkout previous version: `git checkout <previous-commit>`
3. Restore database backup: `docker-compose exec -T db psql -U postgres ai_platform < backup.sql`
4. Restart containers: `docker-compose up -d`

---

## ✅ Sign-Off

### Deployment Team
- [ ] Deployment completed by: ________________
- [ ] Date: ________________
- [ ] Time: ________________
- [ ] Version deployed: ________________

### Verification
- [ ] Technical lead verified
- [ ] QA tested
- [ ] Product owner approved

### Notes
_Add any deployment-specific notes or issues encountered:_

---

**Congratulations! Your BOLT-QQQ application is now live! 🎉**

Remember to:
- Monitor logs regularly
- Keep backups up to date
- Update dependencies regularly
- Review security practices periodically
- Document any changes or issues
