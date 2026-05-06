# Multi-stage build for optimal image size and performance

# Stage 1: Dependencies and Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy config files
COPY tsconfig*.json ./

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma client
RUN npm run db:generate

# Build TypeScript
RUN npm run build

# Stage 2: Runtime - Minimal production image
FROM node:20-slim

WORKDIR /app

# Install only required system dependencies
# dumb-init: handle signals properly for Node.js
# libssl1.1: required by Prisma for database connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init=1.2.5-2 \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy package files
COPY package*.json ./

# Install production dependencies only with npm ci
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema for runtime
COPY prisma ./prisma

# Create non-root user for security
RUN useradd -m -u 1000 node && chown -R node:node /app
USER node

# Expose application port
EXPOSE 4000

# Health check - verify server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
