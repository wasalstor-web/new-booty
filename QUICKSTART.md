# Quick Start Guide

This guide will help you get the BOLT-QQQ project up and running quickly.

## 🚀 For Development

### 1. Clone the Repository
```bash
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
```

### 2. Setup Environment Variables
```bash
# Copy example files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit the files and add your credentials
nano frontend/.env.local
nano backend/.env
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Setup Database (Backend)
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development Servers
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

---

## 🐳 For Development with Docker

### 1. Clone and Setup
```bash
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty
```

### 2. Configure Environment
```bash
# Update docker-compose.yml with your credentials
nano docker-compose.yml
```

### 3. Start Everything
```bash
docker-compose up -d
```

### 4. Access the Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 5. View Logs
```bash
docker-compose logs -f
```

### 6. Stop Everything
```bash
docker-compose down
```

---

## 🚀 For Production Deployment

### Option 1: Automated Setup (Ubuntu/Debian)

```bash
# Clone repository
git clone https://github.com/wasalstor-web/new-booty.git
cd new-booty

# Run installation script
chmod +x scripts/install.sh
./scripts/install.sh

# Configure environment variables
cp frontend/.env.example frontend/.env.production
cp backend/.env.example backend/.env
# Edit these files with your production credentials

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Option 2: Manual Setup

Follow the detailed instructions in:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - English
- [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md) - العربية

---

## 📝 Environment Variables Checklist

### Frontend (.env.local or .env.production)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL
- [ ] `DATABASE_URL` - Database connection string
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key

### Backend (.env)
- [ ] `DATABASE_URL` - Database connection string
- [ ] `JWT_SECRET` - JWT secret for authentication
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `FRONTEND_URL` - Frontend application URL

---

## 🔧 Common Commands

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Docker
```bash
# Build containers
docker-compose build

# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Rebuild and restart
docker-compose up -d --build
```

### Database (Prisma)
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Seed database
npm run db:seed
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs db

# Connect to database
docker-compose exec db psql -U postgres ai_platform
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Configure Authentication**: Setup Clerk at https://dashboard.clerk.com
2. **Configure Payments**: Setup Stripe at https://dashboard.stripe.com
3. **Setup AI APIs**: Get API keys for OpenAI, Anthropic, Google AI
4. **Configure Domain**: Point your domain to the server
5. **Setup SSL**: Use Let's Encrypt for HTTPS
6. **Configure Monitoring**: Setup error tracking with Sentry
7. **Setup Backups**: Configure regular database backups

---

## 📖 Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide (English)
- [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md) - دليل النشر (العربية)
- [Frontend README](./frontend/README.md) - Frontend documentation

---

## 🤝 Getting Help

- Check the documentation
- Create an issue on GitHub
- Contact the development team

---

**Happy Coding! 🎉**
