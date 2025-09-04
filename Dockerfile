# Dockerfile

# 1. Official Node.js 20 Alpine image for the base
FROM node:20-alpine AS deps
# Use libc6-compat for compatibility with some native dependencies
RUN apk add --no-cache libc6-compat
# Set the working directory
WORKDIR /app
# Copy the package.json and lock file
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Install dependencies based on the lock file
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. Builder stage
FROM node:20-alpine AS builder
# Set the working directory
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code
COPY . .
# Build the Next.js application
RUN npm run build

# 3. Runner stage
FROM node:20-alpine AS runner
# Set the working directory
WORKDIR /app
# Create a non-root user for security
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/.next/standalone ./
# Copy the public directory
COPY --from=builder /app/public ./public
# Copy the static assets
COPY --from=builder /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs
# Expose the port the app runs on
EXPOSE 3000
# Set the entrypoint to start the server
ENTRYPOINT ["node", "server.js"]
