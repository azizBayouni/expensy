# Stage 1: Builder - Install dependencies and build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
# Using --force to handle potential dependency conflicts in the prototype environment
RUN npm install --force

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Runner - Create the final, optimized image
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Copy built app from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Change ownership of the app directory
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the NEXT_TELEMETRY_DISABLED environment variable
ENV NEXT_TELEMETRY_DISABLED 1

# Command to start the app
CMD ["npm", "start", "-p", "3000"]
