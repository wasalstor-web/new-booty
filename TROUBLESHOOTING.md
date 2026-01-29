# Troubleshooting Guide

Common issues and solutions for BOLT-QQQ deployment and operation.

---

## 🐳 Docker & Container Issues

### Containers Won't Start

**Symptom**: `docker-compose up -d` fails or containers exit immediately

**Solutions**:

1. **Check logs**:
```bash
docker-compose logs
docker-compose logs <service-name>
```

2. **Check port conflicts**:
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :3001
sudo netstat -tulpn | grep LISTEN

# Kill conflicting process
sudo kill -9 <PID>
```

3. **Check Docker daemon**:
```bash
sudo systemctl status docker
sudo systemctl restart docker
```

4. **Rebuild containers**:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Container Keeps Restarting

**Symptom**: Container starts but immediately restarts

**Solutions**:

1. **Check container logs**:
```bash
docker-compose logs -f <service-name>
```

2. **Check environment variables**:
```bash
docker-compose exec <service-name> env
```

3. **Check health**:
```bash
docker inspect <container-name> | grep -A 10 Health
```

4. **Check resources**:
```bash
docker stats
```

### Out of Disk Space

**Symptom**: "No space left on device" error

**Solutions**:

1. **Check disk usage**:
```bash
df -h
docker system df
```

2. **Clean up Docker**:
```bash
# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Clean everything
docker system prune -a -f --volumes
```

3. **Check logs size**:
```bash
du -sh /var/lib/docker/containers/*/*-json.log
```

4. **Configure log rotation** in docker-compose.yml:
```yaml
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🗄️ Database Issues

### Can't Connect to Database

**Symptom**: "Connection refused" or "Connection timeout"

**Solutions**:

1. **Check database container**:
```bash
docker-compose ps db
docker-compose logs db
```

2. **Check connection string**:
```bash
# Verify DATABASE_URL format
# postgresql://username:password@host:port/database
cat backend/.env | grep DATABASE_URL
```

3. **Test connection**:
```bash
# From host
docker-compose exec db psql -U postgres -d ai_platform

# From backend container
docker-compose exec backend npm run db:test
```

4. **Restart database**:
```bash
docker-compose restart db
```

### Database Migrations Failed

**Symptom**: Migration errors or schema mismatches

**Solutions**:

1. **Check migration status**:
```bash
cd backend
npx prisma migrate status
```

2. **Reset database** (⚠️ destroys data):
```bash
npx prisma migrate reset
```

3. **Deploy migrations**:
```bash
npx prisma migrate deploy
```

4. **Generate Prisma client**:
```bash
npx prisma generate
```

### Database Performance Issues

**Symptom**: Slow queries, timeouts

**Solutions**:

1. **Check active connections**:
```sql
SELECT * FROM pg_stat_activity;
```

2. **Check slow queries**:
```sql
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

3. **Add indexes**:
```sql
-- Example
CREATE INDEX idx_users_email ON users(email);
```

4. **Vacuum database**:
```bash
docker-compose exec db vacuumdb -U postgres -d ai_platform -z -v
```

---

## 🌐 NGINX Issues

### 502 Bad Gateway

**Symptom**: NGINX shows "502 Bad Gateway"

**Solutions**:

1. **Check backend is running**:
```bash
docker-compose ps backend
curl http://localhost:3000/api/health
```

2. **Check NGINX logs**:
```bash
sudo tail -f /var/log/nginx/error.log
```

3. **Check NGINX config**:
```bash
sudo nginx -t
```

4. **Restart NGINX**:
```bash
sudo systemctl restart nginx
```

### 404 Not Found

**Symptom**: NGINX shows "404 Not Found"

**Solutions**:

1. **Check NGINX config**:
```bash
sudo nginx -t
cat /etc/nginx/sites-enabled/bolt-qqq
```

2. **Check location blocks**:
Ensure location blocks match your routes

3. **Check frontend is running**:
```bash
docker-compose ps frontend
curl http://localhost:3001
```

### SSL Certificate Issues

**Symptom**: "Your connection is not private" or certificate errors

**Solutions**:

1. **Check certificate**:
```bash
sudo certbot certificates
```

2. **Renew certificate**:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

3. **Test renewal**:
```bash
sudo certbot renew --dry-run
```

4. **Check certificate paths in NGINX config**:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## 🔐 Authentication Issues

### Clerk Authentication Not Working

**Symptom**: Can't sign in, authentication redirects fail

**Solutions**:

1. **Check environment variables**:
```bash
# Frontend
docker-compose exec frontend env | grep CLERK
```

2. **Verify keys in Clerk dashboard**:
- https://dashboard.clerk.com

3. **Check redirect URLs**:
Ensure URLs in Clerk match your domain

4. **Clear cookies and cache**:
Browser cookies might be stale

### JWT Token Errors

**Symptom**: "Invalid token" or "Token expired"

**Solutions**:

1. **Check JWT_SECRET**:
```bash
cat backend/.env | grep JWT_SECRET
```

2. **Verify token expiration**:
Check your JWT configuration

3. **Clear application cache**:
```bash
docker-compose restart backend
```

---

## 💳 Stripe/Payment Issues

### Webhook Not Receiving Events

**Symptom**: Stripe webhooks failing

**Solutions**:

1. **Check webhook endpoint**:
```bash
curl -X POST https://yourdomain.com/api/webhooks/stripe
```

2. **Verify webhook secret**:
```bash
cat backend/.env | grep STRIPE_WEBHOOK_SECRET
```

3. **Check Stripe dashboard**:
- https://dashboard.stripe.com/webhooks
- Verify endpoint URL
- Check webhook logs

4. **Test webhook locally**:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 📦 Build Issues

### Frontend Build Fails

**Symptom**: `npm run build` fails in frontend

**Solutions**:

1. **Check Node version**:
```bash
node --version  # Should be 18+
```

2. **Clear cache and reinstall**:
```bash
cd frontend
rm -rf node_modules .next
npm install
npm run build
```

3. **Check environment variables**:
Build-time variables must be set

4. **Check for TypeScript errors**:
```bash
npm run check-types
```

### Backend Build Fails

**Symptom**: `npm run build` fails in backend

**Solutions**:

1. **Regenerate Prisma client**:
```bash
cd backend
npx prisma generate
```

2. **Clear and reinstall**:
```bash
rm -rf node_modules .next
npm install
npm run build
```

3. **Check Prisma schema**:
```bash
npx prisma validate
```

---

## 🚀 Performance Issues

### Slow Page Load Times

**Solutions**:

1. **Enable caching in NGINX**:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

2. **Enable GZIP compression**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml;
```

3. **Check database queries**:
Look for N+1 queries and missing indexes

4. **Use Redis for caching**:
Already configured in docker-compose.yml

### High Memory Usage

**Solutions**:

1. **Check container memory**:
```bash
docker stats
```

2. **Limit container memory** in docker-compose.yml:
```yaml
services:
  frontend:
    mem_limit: 512m
```

3. **Check for memory leaks**:
```bash
docker-compose exec backend node --expose-gc --inspect index.js
```

---

## 🔍 Debugging Tips

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since "2024-01-01T00:00:00"
```

### Access Container Shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec db psql -U postgres ai_platform
```

### Check Environment Variables

```bash
# View all env vars in container
docker-compose exec backend env

# Check specific variable
docker-compose exec backend env | grep DATABASE_URL
```

### Network Debugging

```bash
# Check connectivity from container
docker-compose exec backend ping db
docker-compose exec backend curl http://frontend:3000

# Check open ports
docker-compose exec backend netstat -tulpn
```

### Database Debugging

```bash
# Connect to database
docker-compose exec db psql -U postgres ai_platform

# Check tables
\dt

# Check connections
SELECT * FROM pg_stat_activity;

# Check table size
SELECT pg_size_pretty(pg_total_relation_size('users'));
```

---

## 🆘 Emergency Procedures

### Complete System Reset

⚠️ **WARNING: This will delete all data!**

```bash
# Stop everything
docker-compose down -v

# Remove all containers and images
docker system prune -a -f --volumes

# Remove project files (optional)
cd ..
rm -rf new-booty

# Start fresh
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
./scripts/deploy.sh
```

### Rollback to Previous Version

```bash
# Stop containers
docker-compose down

# Restore database from backup
gunzip ~/backups/bolt-qqq/database_TIMESTAMP.sql.gz
docker-compose exec -T db psql -U postgres ai_platform < ~/backups/bolt-qqq/database_TIMESTAMP.sql

# Checkout previous version
git log --oneline -10
git checkout <commit-hash>

# Redeploy
./scripts/deploy.sh
```

---

## 📞 Getting Help

If issues persist:

1. **Check documentation**:
   - [README.md](./README.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)
   - [QUICKSTART.md](./QUICKSTART.md)

2. **Check logs thoroughly**:
   - Application logs
   - NGINX logs
   - System logs

3. **Search for similar issues**:
   - GitHub Issues
   - Stack Overflow
   - Docker documentation

4. **Create an issue**:
   - Include error messages
   - Include relevant logs
   - Describe steps to reproduce

5. **Contact support**:
   - Development team
   - System administrator

---

## 📝 Useful Commands Reference

### Docker Commands
```bash
docker-compose up -d          # Start containers
docker-compose down           # Stop containers
docker-compose restart        # Restart containers
docker-compose logs -f        # View logs
docker-compose ps             # List containers
docker-compose build          # Build images
docker stats                  # Resource usage
```

### NGINX Commands
```bash
sudo nginx -t                 # Test config
sudo systemctl start nginx    # Start NGINX
sudo systemctl stop nginx     # Stop NGINX
sudo systemctl restart nginx  # Restart NGINX
sudo systemctl reload nginx   # Reload config
sudo systemctl status nginx   # Check status
```

### System Commands
```bash
df -h                         # Disk usage
free -h                       # Memory usage
top                          # Process monitor
htop                         # Better process monitor
netstat -tulpn               # Network connections
journalctl -u nginx -f       # System logs
```

---

**Last Updated**: January 2026
