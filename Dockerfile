<<<<<<< HEAD
# Dockerfile for a Next.js application

# 1. Builder stage
FROM node:20-slim AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
=======
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
>>>>>>> 848f5a87efbb7be198bdc78f0c589e015a791cdb
COPY . .

# Build the Next.js application
RUN npm run build

<<<<<<< HEAD
# 2. Runner stage
FROM node:20-slim AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built assets from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app will run on
EXPOSE 3000

# Set the command to start the app
CMD ["node", "server.js"]
=======
# Stage 2: Runner
FROM node:18-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

EXPOSE 3000

# Set the correct start command
CMD ["npm", "start"]
>>>>>>> 848f5a87efbb7be198bdc78f0c589e015a791cdb
