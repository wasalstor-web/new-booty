# BOLT-QQQ Project

A modern, full-stack SaaS application built with **React**, **Next.js**, **Node.js**, and **PostgreSQL**, featuring AI capabilities, authentication, payments, and multi-tenancy support.

## 🌟 Features

- **Frontend**: Next.js 14 with React 18, TypeScript, and Tailwind CSS
- **Backend**: Next.js API routes with Express capabilities
- **Database**: PostgreSQL with Prisma ORM / Drizzle ORM
- **Authentication**: Clerk for user management and authentication
- **Payments**: Stripe integration for subscriptions and payments
- **AI Integration**: OpenAI, Anthropic, and Google AI support
- **Caching**: Redis for performance optimization
- **Deployment**: Docker & Docker Compose ready
- **Reverse Proxy**: NGINX configuration included
- **SSL/TLS**: Let's Encrypt setup guide

## 📁 Project Structure

```
.
├── frontend/           # Next.js frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── lib/           # Utility libraries
│   └── components.json # Shadcn UI configuration
├── backend/           # Next.js backend API
│   ├── app/           # API routes
│   ├── lib/           # Shared libraries
│   ├── prisma/        # Database schema
│   └── Dockerfile     # Backend container config
├── docker-compose.yml # Container orchestration
├── nginx.conf         # NGINX reverse proxy config
├── DEPLOYMENT.md      # English deployment guide
└── DEPLOYMENT_AR.md   # Arabic deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (install via [NVM](https://github.com/nvm-sh/nvm))
- pnpm (recommended) or npm
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/wasalstor-web/new-booty.git
   cd new-booty
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Copy example env files
   cp frontend/.env.example frontend/.env.local
   cp backend/.env.example backend/.env
   ```

4. **Setup database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run development servers**
   ```bash
   # Frontend (terminal 1)
   cd frontend
   npm run dev
   
   # Backend (terminal 2)
   cd backend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api

### Docker Development

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📚 Documentation

- **[Deployment Guide (English)](./DEPLOYMENT.md)** - Complete production deployment instructions
- **[دليل النشر (العربية)](./DEPLOYMENT_AR.md)** - دليل شامل لنشر المشروع على الخادم
- **[Frontend README](./frontend/README.md)** - Frontend-specific documentation

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.x
- **UI Library**: React 18.x
- **Styling**: Tailwind CSS, Shadcn UI
- **Authentication**: Clerk
- **State Management**: React Query, React Hook Form
- **Icons**: Lucide React, Radix UI Icons
- **Testing**: Vitest, Playwright

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma / Drizzle ORM
- **Authentication**: JWT, Clerk
- **Payment**: Stripe
- **AI Services**: OpenAI, Anthropic, Google AI
- **Caching**: Redis, ioredis
- **Rate Limiting**: rate-limiter-flexible
- **Image Processing**: Sharp
- **Email**: Nodemailer

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: NGINX
- **SSL/TLS**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions
- **Error Tracking**: Sentry
- **Monitoring**: Pino logging

## 🔧 Environment Variables

### Frontend (.env.production)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# API
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Node
NODE_ENV=production

# JWT
JWT_SECRET=your_secure_secret

# AI APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# URLs
FRONTEND_URL=https://yourdomain.com
```

## 📦 Deployment

### Production Deployment

For detailed production deployment instructions, see:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - English version
- **[DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md)** - النسخة العربية

Quick deployment steps:

1. **Server Setup** - Install Node.js, Docker, NGINX
2. **Clone Repository** - Get the latest code
3. **Configure Environment** - Set up environment variables
4. **Build & Deploy** - Use Docker Compose
5. **Setup NGINX** - Configure reverse proxy
6. **SSL Certificate** - Setup Let's Encrypt
7. **Monitor** - Check logs and performance

```bash
# One-command deployment (after setup)
docker-compose up -d --build
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test              # Unit tests
npm run test:e2e         # E2E tests with Playwright

# Backend tests (if configured)
cd backend
npm run test
```

## 📝 Scripts

### Frontend Scripts
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run test            # Run Vitest tests
npm run test:e2e        # Run Playwright E2E tests
```

### Backend Scripts
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
```

## 🔒 Security

- All secrets stored in environment variables
- HTTPS enforced via NGINX
- Security headers configured
- Rate limiting implemented
- Input validation with Zod
- SQL injection protection via ORM
- CSRF protection
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🌐 Links

- **Frontend Documentation**: [frontend/README.md](./frontend/README.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **دليل النشر بالعربي**: [DEPLOYMENT_AR.md](./DEPLOYMENT_AR.md)

---

**Built with ❤️ by the Wasalstor Web Team**
