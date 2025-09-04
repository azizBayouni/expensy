# Dockerfile

# 1. Builder Stage: Build the Next.js application
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application for production
RUN npm run build

# 2. Runner Stage: Create the final, optimized image
FROM node:20-slim AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Copy the standalone Next.js output from the builder stage
COPY --from=builder /app/.next/standalone ./

# Copy the public directory
COPY --from=builder /app/public ./public

# Copy the static assets from the build
COPY --from=builder /app/.next/static ./.next/static

# The Next.js standalone output includes a minimal server.js, so we run that.
# The default port is 3000, which can be mapped in docker-compose.
CMD ["node", "server.js"]
