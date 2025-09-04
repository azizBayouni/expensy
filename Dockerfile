# Dockerfile

# 1. Builder Stage: Build the Next.js application
FROM node:20-alpine AS builder
# Set working directory
WORKDIR /app
# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci
# Copy source code
COPY . .
# Generate the production build
RUN npm run build

# 2. Runner Stage: Create the final, minimal image
FROM node:20-alpine AS runner
WORKDIR /app

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the standalone Next.js server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy the public directory
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy the static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the port and set the command to start the server
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
