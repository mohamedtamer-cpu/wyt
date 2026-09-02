# ═══════════════════════════════════════
# WYT — Dockerfile
# Multi-stage build for production
# ═══════════════════════════════════════

# ── Stage 1: Install dependencies ──
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production image ──
FROM node:20-alpine AS runner
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S wytgroup && \
    adduser  -u 1001 -S wytuser -G wytgroup

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY --chown=wytuser:wytgroup . .

# Remove files that shouldn't be in container
RUN rm -f .env.example SETUP.md DEPLOY.md

# Switch to non-root user
USER wytuser

# Expose app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

# Start the server
CMD ["node", "server.js"]