# Dockerfile

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* tsconfig.json next.config.ts ./
RUN npm install

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chown -R nextjs:nextjs /app
USER nextjs
RUN npm run build

# ---- Runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=nextjs:nextjs /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Healthcheck to ensure the app is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
