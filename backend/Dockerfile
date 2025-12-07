FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Set dummy environment variables for build time only
ARG DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_platform"
ARG OPENAI_API_KEY="dummy"
ARG ANTHROPIC_API_KEY="dummy"
ARG GOOGLE_AI_API_KEY="dummy"
ARG STRIPE_SECRET_KEY="dummy"
ARG STRIPE_WEBHOOK_SECRET="dummy"
ARG JWT_SECRET="dummy"
ARG FRONTEND_URL="https://onlainee.space"
ARG NEXTAUTH_URL="https://onlainee.space"

ENV DATABASE_URL=$DATABASE_URL
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
ENV GOOGLE_AI_API_KEY=$GOOGLE_AI_API_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
ENV JWT_SECRET=$JWT_SECRET
ENV FRONTEND_URL=$FRONTEND_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
