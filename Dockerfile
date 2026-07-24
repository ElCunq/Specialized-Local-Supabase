# syntax=docker/dockerfile:1

# Step 1: Install dependencies with BuildKit npm cache
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Step 2: Build Next.js application with Next build cache
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

RUN --mount=type=cache,target=/app/.next/cache npm run build

# Step 3: Production runner image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "run", "start"]
